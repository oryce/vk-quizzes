import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { desc, eq, sql } from "drizzle-orm"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { quiz, quizParticipant } from "@/db/schema"
import { auth } from "@/lib/auth"
import { getQuizStatus, type QuizStatus } from "@/lib/quizzes"

const roleLabels: Record<string, string> = {
  user: "Пользователь",
  organizer: "Организатор",
  admin: "Администратор",
}

const statusLabels: Record<QuizStatus, string> = {
  live: "Идёт сейчас",
  upcoming: "Предстоящий",
  past: "Завершён",
}

type ParticipatedQuizRow = {
  id: string
  title: string
  startsAt: Date
  endsAt: Date
  score: number
}

type OrganizedQuizRow = {
  id: string
  title: string
  startsAt: Date
  endsAt: Date
  participantCount: number
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

function countByStatus(
  items: Pick<typeof quiz.$inferSelect, "startsAt" | "endsAt">[]
) {
  const stats = {
    live: 0,
    upcoming: 0,
    past: 0,
  } satisfies Record<QuizStatus, number>

  for (const item of items) {
    stats[getQuizStatus(item)] += 1
  }

  return stats
}

function formatScore(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value)
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  )
}

function StatusSummary({ stats }: { stats: Record<QuizStatus, number> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(statusLabels) as QuizStatus[]).map((status) => (
        <Badge
          key={status}
          variant={status === "live" ? "default" : "secondary"}
        >
          {statusLabels[status]}: {stats[status]}
        </Badge>
      ))}
    </div>
  )
}

async function getProfileStats(userId: string) {
  const [participatedRows, organizedRows, organizedParticipantRows] =
    await Promise.all([
      db
        .select({
          id: quiz.id,
          title: quiz.title,
          startsAt: quiz.startsAt,
          endsAt: quiz.endsAt,
          score: quizParticipant.score,
        })
        .from(quizParticipant)
        .innerJoin(quiz, eq(quizParticipant.quizId, quiz.id))
        .where(eq(quizParticipant.userId, userId))
        .orderBy(desc(quiz.startsAt)),
      db
        .select({
          id: quiz.id,
          title: quiz.title,
          startsAt: quiz.startsAt,
          endsAt: quiz.endsAt,
        })
        .from(quiz)
        .where(eq(quiz.organizerId, userId))
        .orderBy(desc(quiz.startsAt)),
      db
        .select({
          quizId: quizParticipant.quizId,
          value: sql<number>`count(${quizParticipant.id})`,
        })
        .from(quizParticipant)
        .innerJoin(quiz, eq(quizParticipant.quizId, quiz.id))
        .where(eq(quiz.organizerId, userId))
        .groupBy(quizParticipant.quizId),
    ])

  const participantCountByQuiz = new Map(
    organizedParticipantRows.map((row) => [row.quizId, Number(row.value)])
  )
  const participated = participatedRows.map((row) => ({
    ...row,
    score: Number(row.score),
  }))
  const organized = organizedRows.map((row) => ({
    ...row,
    participantCount: participantCountByQuiz.get(row.id) ?? 0,
  }))

  return {
    participated,
    organized,
    participationStatuses: countByStatus(participated),
    organizedStatuses: countByStatus(organized),
    totalScore: participated.reduce((total, row) => total + row.score, 0),
    totalParticipants: organized.reduce(
      (total, row) => total + row.participantCount,
      0
    ),
  }
}

function RecentParticipationList({ items }: { items: ParticipatedQuizRow[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Пользователь пока не участвовал в квизах.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              {statusLabels[getQuizStatus(item)]}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium">
            {formatScore(item.score)} очков
          </span>
        </div>
      ))}
    </div>
  )
}

function RecentOrganizedList({ items }: { items: OrganizedQuizRow[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Пользователь пока не проводил квизы.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              {statusLabels[getQuizStatus(item)]}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium">
            {item.participantCount} участников
          </span>
        </div>
      ))}
    </div>
  )
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  const user = session.user
  const role = user.role ?? "user"
  const stats = await getProfileStats(user.id)

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-4xl flex-col px-4 py-8">
      <div className="flex items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold">Профиль</h1>
          <p className="text-sm text-muted-foreground">
            Данные текущего пользователя
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="flex size-32 items-center justify-center rounded-full bg-secondary text-4xl font-semibold text-secondary-foreground">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="size-full rounded-full object-cover"
              src={user.image}
              alt=""
            />
          ) : (
            <span>{getInitials(user.firstName, user.lastName)}</span>
          )}
        </div>

        <Card>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Имя</dt>
                <dd className="mt-1 font-medium">{user.firstName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Фамилия</dt>
                <dd className="mt-1 font-medium">{user.lastName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Электронная почта</dt>
                <dd className="mt-1 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Роль</dt>
                <dd className="mt-1 font-medium">{roleLabels[role] ?? role}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Участия в квизах</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Всего" value={stats.participated.length} />
              <StatTile label="Очки" value={formatScore(stats.totalScore)} />
              <StatTile
                label="Средний результат"
                value={
                  stats.participated.length > 0
                    ? formatScore(
                        Math.round(stats.totalScore / stats.participated.length)
                      )
                    : 0
                }
              />
            </dl>
            <StatusSummary stats={stats.participationStatuses} />
            <RecentParticipationList items={stats.participated} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Проведённые квизы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Всего" value={stats.organized.length} />
              <StatTile
                label="Участники"
                value={formatScore(stats.totalParticipants)}
              />
              <StatTile
                label="В среднем"
                value={
                  stats.organized.length > 0
                    ? formatScore(
                        Math.round(
                          stats.totalParticipants / stats.organized.length
                        )
                      )
                    : 0
                }
              />
            </dl>
            <StatusSummary stats={stats.organizedStatuses} />
            <RecentOrganizedList items={stats.organized} />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
