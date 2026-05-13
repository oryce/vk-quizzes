"use server"

import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, asc, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import {
  quiz,
  quizAnswer,
  quizParticipant,
  quizQuestion,
  quizResponse,
} from "@/db/schema"
import { auth } from "@/lib/auth"
import { getQuizPhase, REVEAL_SECONDS } from "@/lib/quiz-runtime"
import { broadcastQuizEvent } from "@/lib/quiz-ws"

export type CreateQuizFormValues = {
  title: string
  description: string
  startsAt: string
  maxParticipants: string
  questions: unknown
}

export type CreateQuizState = {
  error?: string
  values?: CreateQuizFormValues
} | null

const answerSchema = z.object({
  text: z.string().trim().min(1, "Заполните все варианты ответа."),
  isCorrect: z.boolean(),
})

const questionSchema = z
  .object({
    clientId: z.string().trim().min(1),
    text: z.string().trim().min(1, "Заполните текст каждого вопроса."),
    timeLimitSeconds: z.coerce.number().int().min(5).max(300),
    answers: z.array(answerSchema).min(2, "У вопроса должно быть минимум 2 ответа."),
  })
  .refine((question) => question.answers.some((answer) => answer.isCorrect), {
    message: "У каждого вопроса должен быть хотя бы один правильный ответ.",
  })

const createQuizSchema = z
  .object({
    title: z.string().trim().min(3, "Название должно быть длиннее 2 символов."),
    description: z.string().trim().min(1, "Добавьте описание квиза."),
    startsAt: z.string().trim().min(1, "Укажите начало квиза."),
    maxParticipants: z.coerce.number().int().min(1).max(10000),
    questions: z.array(questionSchema).min(1, "Добавьте хотя бы один вопрос."),
  })
  .refine((data) => new Date(data.startsAt) > new Date(), {
    message: "Начало квиза не может быть в прошлом.",
  })

export async function createQuizAction(
  _prevState: CreateQuizState,
  formData: FormData
): Promise<CreateQuizState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Чтобы создать квиз, войдите в аккаунт." }
  }

  const submittedValues = readCreateQuizFormValues(formData)
  const questionsRaw = submittedValues.questionsRaw
  let questions: unknown

  try {
    questions = JSON.parse(questionsRaw)
  } catch {
    return {
      error: "Не удалось прочитать список вопросов.",
      values: { ...submittedValues, questions: [] },
    }
  }
  const parsed = createQuizSchema.safeParse({
    title: submittedValues.title,
    description: submittedValues.description,
    startsAt: submittedValues.startsAt,
    maxParticipants: submittedValues.maxParticipants,
    questions,
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте поля формы.",
      values: { ...submittedValues, questions },
    }
  }

  let showcaseImageUrl: string
  let coverImageUrl: string
  const questionImageUrls = new Map<string, string>()

  try {
    showcaseImageUrl = await saveRequiredImageFile(
      readFormFile(formData, "showcaseImage"),
      "Добавьте изображение 200x200."
    )
    coverImageUrl = await saveRequiredImageFile(
      readFormFile(formData, "coverImage"),
      "Добавьте обложку 600x300."
    )

    for (const questionItem of parsed.data.questions) {
      const imageUrl = await saveOptionalImageFile(
        readFormFile(formData, `questionImage_${questionItem.clientId}`)
      )

      if (imageUrl) {
        questionImageUrls.set(questionItem.clientId, imageUrl)
      }
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Не удалось загрузить изображения.",
      values: { ...submittedValues, questions },
    }
  }

  const quizId = crypto.randomUUID()
  const startsAt = new Date(parsed.data.startsAt)
  const durationSeconds = parsed.data.questions.reduce(
    (total, questionItem) =>
      total + questionItem.timeLimitSeconds + REVEAL_SECONDS,
    0
  )
  const endsAt = new Date(startsAt.getTime() + durationSeconds * 1000)

  try {
    await db.transaction(async (tx) => {
      await tx.insert(quiz).values({
        id: quizId,
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt,
        endsAt,
        maxParticipants: parsed.data.maxParticipants,
        showcaseImageUrl,
        coverImageUrl,
        organizerId: session.user.id,
      })

      for (const [questionIndex, questionItem] of parsed.data.questions.entries()) {
        const questionId = crypto.randomUUID()

        await tx.insert(quizQuestion).values({
          id: questionId,
          quizId,
          text: questionItem.text,
          imageUrl: questionImageUrls.get(questionItem.clientId) ?? null,
          timeLimitSeconds: questionItem.timeLimitSeconds,
          position: questionIndex,
        })

        await tx.insert(quizAnswer).values(
          questionItem.answers.map((answer, answerIndex) => ({
            id: crypto.randomUUID(),
            questionId,
            text: answer.text,
            isCorrect: answer.isCorrect,
            position: answerIndex,
          }))
        )
      }
    })
  } catch {
    return {
      error: "Не удалось создать квиз. Попробуйте ещё раз.",
      values: { ...submittedValues, questions },
    }
  }

  revalidatePath("/quizzes")
  redirect(`/quizzes/${quizId}`)
}

function readCreateQuizFormValues(formData: FormData) {
  return {
    title: readFormString(formData, "title"),
    description: readFormString(formData, "description"),
    startsAt: readFormString(formData, "startsAt"),
    maxParticipants: readFormString(formData, "maxParticipants"),
    questionsRaw: readFormString(formData, "questions", "[]"),
  }
}

function readFormString(formData: FormData, name: string, fallback = "") {
  const exact = formData.get(name)

  if (typeof exact === "string") {
    return exact
  }

  for (const [key, value] of formData.entries()) {
    if (key.endsWith(`_${name}`) && typeof value === "string") {
      return value
    }
  }

  return fallback
}

function readFormFile(formData: FormData, name: string) {
  const exact = formData.get(name)

  if (exact instanceof File && exact.size > 0) {
    return exact
  }

  for (const [key, value] of formData.entries()) {
    if (key.endsWith(`_${name}`) && value instanceof File && value.size > 0) {
      return value
    }
  }

  return null
}

async function saveRequiredImageFile(file: File | null, emptyMessage: string) {
  if (!file) {
    throw new Error(emptyMessage)
  }

  return saveImageFile(file)
}

async function saveOptionalImageFile(file: File | null) {
  if (!file) {
    return null
  }

  return saveImageFile(file)
}

async function saveImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Загружать можно только изображения.")
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Размер изображения не должен превышать 5 МБ.")
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "quizzes")
  await mkdir(uploadDir, { recursive: true })

  const extension = getImageExtension(file)
  const fileName = `${crypto.randomUUID()}${extension}`
  const bytes = Buffer.from(await file.arrayBuffer())

  await writeFile(path.join(uploadDir, fileName), bytes)

  return `/uploads/quizzes/${fileName}`
}

function getImageExtension(file: File) {
  const extensionByType: Record<string, string> = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  }

  return extensionByType[file.type] ?? (path.extname(file.name) || ".img")
}

export async function joinQuizAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  const quizId = String(formData.get("quizId") ?? "")
  const quizRows = await db.select().from(quiz).where(eq(quiz.id, quizId)).limit(1)
  const item = quizRows[0]

  if (!item || item.organizerId === session.user.id || item.endsAt <= new Date()) {
    return
  }

  const participantRows = await db
    .select()
    .from(quizParticipant)
    .where(eq(quizParticipant.quizId, quizId))

  if (participantRows.length >= item.maxParticipants) {
    return
  }

  const alreadyJoined = participantRows.some(
    (participant) => participant.userId === session.user.id
  )

  if (!alreadyJoined) {
    await db.insert(quizParticipant).values({
      id: crypto.randomUUID(),
      quizId,
      userId: session.user.id,
    })

    broadcastQuizEvent(quizId, {
      type: "join",
      quizId,
      at: Date.now(),
    })
  }

  revalidatePath("/quizzes")
  revalidatePath(`/quizzes/${quizId}`)
}

export async function submitQuizAnswerAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  const quizId = readFormString(formData, "quizId")
  const questionId = readFormString(formData, "questionId")
  const selectedAnswerIds = readFormStringList(formData, "answerId")

  if (!quizId || !questionId || selectedAnswerIds.length === 0) {
    return
  }

  const [quizItem] = await db.select().from(quiz).where(eq(quiz.id, quizId)).limit(1)

  if (!quizItem || quizItem.organizerId === session.user.id) {
    return
  }

  const [participant] = await db
    .select()
    .from(quizParticipant)
    .where(
      and(
        eq(quizParticipant.quizId, quizId),
        eq(quizParticipant.userId, session.user.id)
      )
    )
    .limit(1)

  if (!participant) {
    return
  }

  const questions = await db
    .select()
    .from(quizQuestion)
    .where(eq(quizQuestion.quizId, quizId))
    .orderBy(asc(quizQuestion.position))
  const phase = getQuizPhase(quizItem, questions)

  if (phase.type !== "question" || phase.question.id !== questionId) {
    return
  }

  const [existingResponse] = await db
    .select()
    .from(quizResponse)
    .where(
      and(
        eq(quizResponse.questionId, questionId),
        eq(quizResponse.participantId, participant.id)
      )
    )
    .limit(1)

  if (existingResponse) {
    return
  }

  const answers = await db
    .select()
    .from(quizAnswer)
    .where(eq(quizAnswer.questionId, questionId))
    .orderBy(asc(quizAnswer.position))
  const validAnswerIds = new Set(answers.map((answer) => answer.id))
  const selected = [...new Set(selectedAnswerIds)].filter((answerId) =>
    validAnswerIds.has(answerId)
  )

  if (selected.length === 0) {
    return
  }

  const correct = answers
    .filter((answer) => answer.isCorrect)
    .map((answer) => answer.id)
    .sort()
  const selectedSorted = [...selected].sort()
  const isCorrect =
    correct.length === selectedSorted.length &&
    correct.every((answerId, index) => answerId === selectedSorted[index])
  const score = isCorrect ? 1 : 0

  await db.transaction(async (tx) => {
    await tx.insert(quizResponse).values({
      id: crypto.randomUUID(),
      quizId,
      questionId,
      participantId: participant.id,
      selectedAnswerIds: JSON.stringify(selectedSorted),
      isCorrect,
      score,
    })

    if (score > 0) {
      await tx
        .update(quizParticipant)
        .set({
          score: sql`${quizParticipant.score} + ${score}`,
        })
        .where(eq(quizParticipant.id, participant.id))
    }
  })

  broadcastQuizEvent(quizId, {
    type: "answer",
    quizId,
    questionId,
    at: Date.now(),
  })

  revalidatePath(`/quizzes/${quizId}`)
  revalidatePath(`/quizzes/${quizId}/play`)
}

function readFormStringList(formData: FormData, name: string) {
  const values = formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string")

  for (const [key, value] of formData.entries()) {
    if (key.endsWith(`_${name}`) && typeof value === "string") {
      values.push(value)
    }
  }

  return values
}
