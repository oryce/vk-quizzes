import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"
import {
  Calendar03Icon,
  Quiz03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { joinQuizAction } from "@/app/quizzes/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/db"
import {
  quiz,
  quizParticipant,
  quizQuestion,
  user as userTable,
} from "@/db/schema"
import { auth } from "@/lib/auth"
import {
  formatQuizDateRange,
  getQuizStatus,
  type QuizStatus,
} from "@/lib/quizzes"

const statusLabels: Record<QuizStatus, string> = {
  live: "Идёт сейчас",
  upcoming: "Предстоящий",
  past: "Завершён",
}

type QuizPageProps = {
  params: Promise<{
    quizId: string
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const rows = await db
    .select({
      quiz,
      organizerFirstName: userTable.firstName,
      organizerLastName: userTable.lastName,
    })
    .from(quiz)
    .innerJoin(userTable, eq(quiz.organizerId, userTable.id))
    .where(eq(quiz.id, quizId))
    .limit(1)

  const row = rows[0]

  if (!row) {
    notFound()
  }

  const [participantRows, questionRows, currentParticipantRows] =
    await Promise.all([
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
      db
        .select()
        .from(quizQuestion)
        .where(eq(quizQuestion.quizId, quizId))
        .orderBy(asc(quizQuestion.position)),
      session
        ? db
            .select()
            .from(quizParticipant)
            .where(
              and(
                eq(quizParticipant.quizId, quizId),
                eq(quizParticipant.userId, session.user.id)
              )
            )
            .limit(1)
        : Promise.resolve([]),
    ])

  const item = row.quiz
  const status = getQuizStatus(item)
  const isOrganizer = session?.user.id === item.organizerId
  const isParticipant = currentParticipantRows.length > 0
  const isFull = participantRows.length >= item.maxParticipants
  const rankedParticipants = [...participantRows].sort(
    (a, b) => b.participant.score - a.participant.score
  )

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-5xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.coverImageUrl}
          alt=""
          className="aspect-[2/1] w-full object-cover"
        />
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_280px]">
          <section className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={status === "live" ? "default" : "outline"}>
                {statusLabels[status]}
              </Badge>
              <Badge variant="secondary">
                {questionRows.length} вопросов
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold">{item.title}</h1>
              <p className="leading-7 text-muted-foreground">
                {item.description}
              </p>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p className="flex gap-2">
                <HugeiconsIcon
                  className="mt-0.5 shrink-0"
                  icon={Calendar03Icon}
                  strokeWidth={2}
                />
                <span>{formatQuizDateRange(item)}</span>
              </p>
              <p className="flex gap-2">
                <HugeiconsIcon
                  className="mt-0.5 shrink-0"
                  icon={UserGroupIcon}
                  strokeWidth={2}
                />
                <span>
                  {participantRows.length}/{item.maxParticipants} участников
                </span>
              </p>
              <p className="flex gap-2">
                <HugeiconsIcon
                  className="mt-0.5 shrink-0"
                  icon={Quiz03Icon}
                  strokeWidth={2}
                />
                <span>
                  Организатор: {row.organizerFirstName} {row.organizerLastName}
                </span>
              </p>
            </div>
          </section>

          <aside className="space-y-3">
            {status === "past" ? (
              <Button asChild className="w-full">
                <a href="#rating">Открыть рейтинг</a>
              </Button>
            ) : isOrganizer ? (
              <Button asChild className="w-full">
                <Link href={`/quizzes/${item.id}/play`}>Проводить квиз</Link>
              </Button>
            ) : isParticipant ? (
              <Button asChild className="w-full">
                <Link href={`/quizzes/${item.id}/play`}>Перейти к квизу</Link>
              </Button>
            ) : session ? (
              <form action={joinQuizAction}>
                <input type="hidden" name="quizId" value={item.id} />
                <Button className="w-full" disabled={isFull}>
                  {isFull ? "Мест нет" : "Стать участником"}
                </Button>
              </form>
            ) : (
              <Button asChild className="w-full">
                <Link href="/sign-in">Войти для участия</Link>
              </Button>
            )}
          </aside>
        </div>
      </div>

      <section id="rating" className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            {rankedParticipants.length > 0 ? (
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
                    {rankedParticipants.map((participant, index) => (
                      <tr key={participant.participant.id} className="border-b">
                        <td className="py-3 pr-4">{index + 1}</td>
                        <td className="py-3 pr-4">
                          {participant.firstName} {participant.lastName}
                        </td>
                        <td className="py-3 text-right">
                          {participant.participant.score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Участников пока нет.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
