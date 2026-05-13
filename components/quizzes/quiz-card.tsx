import Link from "next/link"
import { Calendar03Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatQuizDateRange,
  getQuizStatus,
  type QuizListItem,
  type QuizStatus,
} from "@/lib/quizzes"

const statusLabels: Record<QuizStatus, string> = {
  live: "Идёт сейчас",
  upcoming: "Предстоящий",
  past: "Завершён",
}

export function QuizCard({ item }: { item: QuizListItem }) {
  const status = getQuizStatus(item)

  return (
    <Card size="sm">
      <CardContent>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.showcaseImageUrl}
          alt=""
          className="aspect-square w-full rounded-xl object-cover"
        />
      </CardContent>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={status === "live" ? "default" : "outline"}>
            {statusLabels[status]}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
            {item.participantCount}/{item.maxParticipants}
          </span>
        </div>
        <CardTitle className="line-clamp-2">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="flex gap-2">
          <HugeiconsIcon
            className="mt-0.5 shrink-0"
            icon={Calendar03Icon}
            strokeWidth={2}
          />
          <span>{formatQuizDateRange(item)}</span>
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/quizzes/${item.id}`}>Подробнее</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
