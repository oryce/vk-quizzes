import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"

import { submitQuizAnswerAction } from "@/app/quizzes/actions"
import { QuizRoomLive } from "@/components/quizzes/room/quiz-room-live"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { db } from "@/db"
import {
  quiz,
  quizAnswer,
  quizParticipant,
  quizQuestion,
  quizResponse,
  user as userTable,
} from "@/db/schema"
import { auth } from "@/lib/auth"
import { getQuizPhase } from "@/lib/quiz-runtime"

type QuizPlayPageProps = {
  params: Promise<{
    quizId: string
  }>
}

export default async function QuizPlayPage({ params }: QuizPlayPageProps) {
  const { quizId } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  const [quizItem] = await db.select().from(quiz).where(eq(quiz.id, quizId)).limit(1)

  if (!quizItem) {
    redirect("/quizzes")
  }

  const isOrganizer = quizItem.organizerId === session.user.id
  const [participant] = isOrganizer
    ? [null]
    : await db
        .select()
        .from(quizParticipant)
        .where(
          and(
            eq(quizParticipant.quizId, quizId),
            eq(quizParticipant.userId, session.user.id)
          )
        )
        .limit(1)

  if (!isOrganizer && !participant) {
    redirect(`/quizzes/${quizId}`)
  }

  const [questions, participants] = await Promise.all([
    db
      .select()
      .from(quizQuestion)
      .where(eq(quizQuestion.quizId, quizId))
      .orderBy(asc(quizQuestion.position)),
    db
      .select({
        participant: quizParticipant,
        firstName: userTable.firstName,
        lastName: userTable.lastName,
      })
      .from(quizParticipant)
      .innerJoin(userTable, eq(quizParticipant.userId, userTable.id))
      .where(eq(quizParticipant.quizId, quizId))
      .orderBy(asc(quizParticipant.joinedAt)),
  ])
  const phase = getQuizPhase(quizItem, questions)
  const activePhase =
    phase.type === "question" || phase.type === "reveal" ? phase : null
  const activeQuestion = activePhase?.question ?? null
  const answers = activeQuestion
    ? await db
        .select()
        .from(quizAnswer)
        .where(eq(quizAnswer.questionId, activeQuestion.id))
        .orderBy(asc(quizAnswer.position))
    : []
  const responses = activeQuestion
    ? await db
        .select()
        .from(quizResponse)
        .where(eq(quizResponse.questionId, activeQuestion.id))
    : []
  const currentResponse =
    participant && activeQuestion
      ? responses.find((response) => response.participantId === participant.id)
      : null
  const selectedByCurrentUser = new Set(
    currentResponse ? parseSelectedAnswers(currentResponse.selectedAnswerIds) : []
  )
  const countsByAnswer = getAnswerCounts(responses)
  const rankedParticipants = [...participants].sort(
    (a, b) => b.participant.score - a.participant.score
  )

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-5xl px-4 py-8">
      <QuizRoomLive quizId={quizId} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{quizItem.title}</h1>
          <p className="text-sm text-muted-foreground">
            {isOrganizer ? "Режим организатора" : "Режим участника"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/quizzes/${quizId}`}>К странице квиза</Link>
        </Button>
      </div>

      {phase.type === "waiting" ? (
        <Card>
          <CardHeader>
            <CardTitle>Квиз ещё не начался</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            До начала осталось {phase.secondsLeft} сек.
          </CardContent>
        </Card>
      ) : null}

      {activePhase ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                Вопрос {activePhase.questionIndex + 1} из{" "}
                {activePhase.totalQuestions}
              </Badge>
              <Badge
                variant={activePhase.type === "question" ? "default" : "outline"}
              >
                {activePhase.type === "question"
                  ? `${activePhase.secondsLeft} сек. на ответ`
                  : `Правильный ответ: ${activePhase.secondsLeft} сек.`}
              </Badge>
            </div>
            <CardTitle className="text-xl">{activePhase.question.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {activePhase.question.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activePhase.question.imageUrl}
                alt=""
                className="max-h-80 rounded-xl object-cover"
              />
            ) : null}

            {isOrganizer ? (
              <div className="grid gap-3">
                {answers.map((answer) => (
                  <div key={answer.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span>{answer.text}</span>
                      <Badge variant="outline">
                        {countsByAnswer.get(answer.id) ?? 0}
                      </Badge>
                    </div>
                    {phase.type === "reveal" && answer.isCorrect ? (
                      <p className="mt-2 text-sm text-primary">
                        Правильный ответ
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : currentResponse ? (
              <div className="grid gap-3">
                {answers.map((answer) => (
                  <div key={answer.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span>{answer.text}</span>
                      {selectedByCurrentUser.has(answer.id) ? (
                        <Badge variant="secondary">Ваш выбор</Badge>
                      ) : null}
                    </div>
                    {phase.type === "reveal" && answer.isCorrect ? (
                      <p className="mt-2 text-sm text-primary">
                        Правильный ответ
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : phase.type === "question" ? (
              <form action={submitQuizAnswerAction} className="grid gap-3">
                <input type="hidden" name="quizId" value={quizId} />
                <input
                  type="hidden"
                  name="questionId"
                  value={activePhase.question.id}
                />
                {answers.map((answer) => (
                  <label
                    key={answer.id}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <Checkbox name="answerId" value={answer.id} />
                    <span>{answer.text}</span>
                  </label>
                ))}
                <Button>Ответить</Button>
              </form>
            ) : (
              <div className="grid gap-3">
                {answers.map((answer) => (
                  <div key={answer.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-4">
                      <span>{answer.text}</span>
                      {answer.isCorrect ? (
                        <Badge variant="default">Правильный ответ</Badge>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {phase.type === "ended" ? (
        <Card>
          <CardHeader>
            <CardTitle>Квиз закончился</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingTable participants={rankedParticipants} />
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Текущий рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingTable participants={rankedParticipants} />
          </CardContent>
        </Card>
      )}
    </main>
  )
}

function RatingTable({
  participants,
}: {
  participants: {
    participant: typeof quizParticipant.$inferSelect
    firstName: string
    lastName: string
  }[]
}) {
  if (participants.length === 0) {
    return <p className="text-sm text-muted-foreground">Участников пока нет.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr className="border-b">
            <th className="py-3 pr-4 font-medium">Место</th>
            <th className="py-3 pr-4 font-medium">Участник</th>
            <th className="py-3 text-right font-medium">Очки</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant, index) => (
            <tr key={participant.participant.id} className="border-b">
              <td className="py-3 pr-4">{index + 1}</td>
              <td className="py-3 pr-4">
                {participant.firstName} {participant.lastName}
              </td>
              <td className="py-3 text-right">{participant.participant.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getAnswerCounts(responses: (typeof quizResponse.$inferSelect)[]) {
  const counts = new Map<string, number>()

  for (const response of responses) {
    for (const answerId of parseSelectedAnswers(response.selectedAnswerIds)) {
      counts.set(answerId, (counts.get(answerId) ?? 0) + 1)
    }
  }

  return counts
}

function parseSelectedAnswers(value: string) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : []
  } catch {
    return []
  }
}
