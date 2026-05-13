import Link from "next/link"

import { QuizCard } from "@/components/quizzes/quiz-card"
import { Button } from "@/components/ui/button"
import { getQuizListItems, getQuizStatus, type QuizListItem } from "@/lib/quizzes"

function QuizShelf({
  title,
  items,
}: {
  title: string
  items: QuizListItem[]
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <QuizCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed px-6 py-10 text-sm text-muted-foreground">
          Квизов пока нет.
        </div>
      )}
    </section>
  )
}

export default async function QuizzesPage() {
  const items = await getQuizListItems()
  const live = items.filter((item) => getQuizStatus(item) === "live")
  const upcoming = items.filter((item) => getQuizStatus(item) === "upcoming")
  const past = items.filter((item) => getQuizStatus(item) === "past")

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Квизы</h1>
          <p className="text-sm text-muted-foreground">
            Витрины текущих, предстоящих и завершённых квизов.
          </p>
        </div>
        <Button asChild>
          <Link href="/quizzes/new">Создать квиз</Link>
        </Button>
      </div>

      <div className="mt-8 space-y-10">
        <QuizShelf title="Идут сейчас" items={live} />
        <QuizShelf title="Предстоящие" items={upcoming} />
        <QuizShelf title="Прошедшие" items={past} />
      </div>
    </main>
  )
}
