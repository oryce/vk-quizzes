import Link from "next/link"
import { headers } from "next/headers"
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Clock03Icon,
  DashboardSquare03Icon,
  PlayCircleIcon,
  Quiz03Icon,
  RankingIcon,
  Rocket01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { getQuizListItems, getQuizStatus } from "@/lib/quizzes"

const features = [
  {
    title: "Создание без таблиц",
    description:
      "Организатор задаёт время старта, вопросы, варианты и правильные ответы. Длительность квиза считается автоматически.",
    icon: Quiz03Icon,
  },
  {
    title: "Проведение в комнате",
    description:
      "Участники отвечают только во время показа вопроса, а организатор видит распределение ответов в реальном времени.",
    icon: PlayCircleIcon,
  },
  {
    title: "Рейтинг сразу готов",
    description:
      "Баллы начисляются после ответов, таблица лидеров обновляется и доступна как внутри квиза, так и на общей странице.",
    icon: RankingIcon,
  },
]

const flow = [
  "Создайте квиз и добавьте вопросы",
  "Пригласите участников на страницу квиза",
  "Откройте проведение и следите за ответами",
  "Получите итоговый рейтинг",
]

export default async function Page() {
  const [session, quizzes] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    getQuizListItems(),
  ])
  const liveCount = quizzes.filter((quiz) => getQuizStatus(quiz) === "live").length
  const upcomingCount = quizzes.filter(
    (quiz) => getQuizStatus(quiz) === "upcoming"
  ).length
  const participantCount = quizzes.reduce(
    (total, quiz) => total + quiz.participantCount,
    0
  )
  const nextQuiz = quizzes.find((quiz) => getQuizStatus(quiz) !== "past")

  return (
    <main className="min-h-[calc(100svh-4rem)]">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_420px] lg:items-center lg:py-16">
        <div className="space-y-7">
          <Badge variant="outline" className="h-7 px-3">
            <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} />
            Платформа для живых квизов
          </Badge>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
              VK Quizzes
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Создавайте интерактивные квизы, проводите их в реальном времени и
              получайте рейтинг участников без ручного подсчёта баллов.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={session ? "/quizzes/new" : "/sign-up"}>
                {session ? "Создать квиз" : "Начать"}
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/quizzes">Смотреть квизы</Link>
            </Button>
          </div>

          <dl className="grid max-w-2xl grid-cols-3 gap-4 border-y py-5 text-sm">
            <div>
              <dt className="text-muted-foreground">Идут сейчас</dt>
              <dd className="mt-1 text-2xl font-semibold">{liveCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Предстоящие</dt>
              <dd className="mt-1 text-2xl font-semibold">{upcomingCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Участия</dt>
              <dd className="mt-1 text-2xl font-semibold">{participantCount}</dd>
            </div>
          </dl>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Пульт проведения</CardTitle>
              <Badge variant={liveCount > 0 ? "default" : "secondary"}>
                {liveCount > 0 ? "Live" : "Готов"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={DashboardSquare03Icon} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-medium">
                    {nextQuiz?.title ?? "Новый квиз готов к запуску"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Вопросы, ответы и рейтинг в одной комнате
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ["Вопрос", nextQuiz ? "Синхронный показ" : "Добавьте первый"],
                ["Ответы", "Видны организатору"],
                ["Баллы", "Считаются автоматически"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            <Button asChild className="w-full" variant="outline">
              <Link href={nextQuiz ? `/quizzes/${nextQuiz.id}` : "/quizzes/new"}>
                {nextQuiz ? "Открыть ближайший квиз" : "Создать первый квиз"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="space-y-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <HugeiconsIcon icon={feature.icon} strokeWidth={2} />
                </div>
                <div className="space-y-2">
                  <h2 className="font-semibold">{feature.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Badge variant="secondary">
            <HugeiconsIcon icon={Clock03Icon} strokeWidth={2} />
            Сценарий
          </Badge>
          <h2 className="text-3xl font-semibold">От идеи до победителя</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Приложение закрывает весь путь: создание, участие, проведение и
            итоговый рейтинг.
          </p>
        </div>

        <div className="grid gap-3">
          {flow.map((item, index) => (
            <div key={item} className="flex gap-4 rounded-xl border p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {index + 1}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <HugeiconsIcon
                  className="text-primary"
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                />
                <p className="font-medium">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Готовы провести квиз?</h2>
            <p className="text-sm text-muted-foreground">
              Создайте комнату, добавьте вопросы и откройте страницу проведения.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/quizzes/new">Создать квиз</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/rating">
                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
                Рейтинг
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
