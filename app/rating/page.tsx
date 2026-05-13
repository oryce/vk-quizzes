import { desc, sql } from "drizzle-orm"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/db"
import { quizParticipant, user } from "@/db/schema"

type RatingRow = {
  userId: string
  firstName: string
  lastName: string
  totalScore: number
  quizCount: number
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

function getPlace(rows: RatingRow[], index: number): number {
  if (index === 0) {
    return 1
  }

  const current = rows[index]
  const previous = rows[index - 1]

  return current.totalScore === previous.totalScore
    ? getPlace(rows, index - 1)
    : index + 1
}

async function getRatingRows(): Promise<RatingRow[]> {
  const totalScore = sql<number>`coalesce(sum(${quizParticipant.score}), 0)`

  const rows = await db
    .select({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      totalScore,
      quizCount: sql<number>`count(${quizParticipant.id})`,
    })
    .from(quizParticipant)
    .innerJoin(user, sql`${quizParticipant.userId} = ${user.id}`)
    .groupBy(user.id, user.firstName, user.lastName)
    .orderBy(desc(totalScore))

  return rows.map((row) => ({
    ...row,
    totalScore: Number(row.totalScore),
    quizCount: Number(row.quizCount),
  }))
}

export default async function RatingPage() {
  const rows = await getRatingRows()
  const leaders = rows.slice(0, 3)

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-5xl px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Рейтинг</h1>
        <p className="text-sm text-muted-foreground">
          Общая таблица участников по сумме очков во всех квизах.
        </p>
      </div>

      {leaders.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {leaders.map((row, index) => (
            <Card key={row.userId}>
              <CardContent className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>
                    {getInitials(row.firstName, row.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {getPlace(rows, index)} место
                  </Badge>
                  <p className="mt-2 truncate font-medium">
                    {row.firstName} {row.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.totalScore} очков
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Участники</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 pr-4 font-medium">Место</th>
                    <th className="py-3 pr-4 font-medium">Участник</th>
                    <th className="py-3 pr-4 text-right font-medium">Квизов</th>
                    <th className="py-3 text-right font-medium">Очки</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.userId} className="border-b last:border-0">
                      <td className="py-3 pr-4">{getPlace(rows, index)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex min-w-52 items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {getInitials(row.firstName, row.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {row.firstName} {row.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right">{row.quizCount}</td>
                      <td className="py-3 text-right font-medium">
                        {row.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Пока нет результатов.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
