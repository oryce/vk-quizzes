import { asc, count } from "drizzle-orm"

import { db } from "@/db"
import { quiz, quizParticipant } from "@/db/schema"

export type QuizStatus = "live" | "upcoming" | "past"

export type QuizListItem = typeof quiz.$inferSelect & {
  participantCount: number
}

export function getQuizStatus(
  item: Pick<typeof quiz.$inferSelect, "startsAt" | "endsAt">,
  now = new Date()
): QuizStatus {
  if (item.startsAt > now) {
    return "upcoming"
  }

  if (item.endsAt <= now) {
    return "past"
  }

  return "live"
}

export function formatQuizDateRange(
  item: Pick<typeof quiz.$inferSelect, "startsAt" | "endsAt">
) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  })

  return `${formatter.format(item.startsAt)} — ${formatter.format(item.endsAt)}`
}

export async function getQuizListItems(): Promise<QuizListItem[]> {
  const [quizRows, participantRows] = await Promise.all([
    db.select().from(quiz).orderBy(asc(quiz.startsAt)),
    db
      .select({
        quizId: quizParticipant.quizId,
        value: count(quizParticipant.id),
      })
      .from(quizParticipant)
      .groupBy(quizParticipant.quizId),
  ])

  const participantCountByQuiz = new Map(
    participantRows.map((row) => [row.quizId, Number(row.value)])
  )

  return quizRows.map((item) => ({
    ...item,
    participantCount: participantCountByQuiz.get(item.id) ?? 0,
  }))
}
