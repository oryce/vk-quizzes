import type { quiz, quizQuestion } from "@/db/schema"

export const REVEAL_SECONDS = 5

export type QuizPhase =
  | {
      type: "waiting"
      secondsLeft: number
    }
  | {
      type: "question"
      question: typeof quizQuestion.$inferSelect
      questionIndex: number
      totalQuestions: number
      secondsLeft: number
    }
  | {
      type: "reveal"
      question: typeof quizQuestion.$inferSelect
      questionIndex: number
      totalQuestions: number
      secondsLeft: number
    }
  | {
      type: "ended"
    }

export function getQuizPhase(
  item: Pick<typeof quiz.$inferSelect, "startsAt" | "endsAt">,
  questions: (typeof quizQuestion.$inferSelect)[],
  now = new Date()
): QuizPhase {
  if (now < item.startsAt) {
    return {
      type: "waiting",
      secondsLeft: secondsBetween(now, item.startsAt),
    }
  }

  if (now >= item.endsAt || questions.length === 0) {
    return { type: "ended" }
  }

  let cursor = item.startsAt.getTime()
  const nowMs = now.getTime()

  for (const [index, question] of questions.entries()) {
    const answerEnd = cursor + question.timeLimitSeconds * 1000
    const revealEnd = answerEnd + REVEAL_SECONDS * 1000

    if (nowMs < answerEnd) {
      return {
        type: "question",
        question,
        questionIndex: index,
        totalQuestions: questions.length,
        secondsLeft: Math.max(0, Math.ceil((answerEnd - nowMs) / 1000)),
      }
    }

    if (nowMs < revealEnd) {
      return {
        type: "reveal",
        question,
        questionIndex: index,
        totalQuestions: questions.length,
        secondsLeft: Math.max(0, Math.ceil((revealEnd - nowMs) / 1000)),
      }
    }

    cursor = revealEnd
  }

  return { type: "ended" }
}

function secondsBetween(from: Date, to: Date) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 1000))
}
