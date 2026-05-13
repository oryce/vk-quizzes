export type QuizWsEvent =
  | {
      type: "answer"
      quizId: string
      questionId: string
      at: number
    }
  | {
      type: "join"
      quizId: string
      at: number
    }
  | {
      type: "presence"
      quizId: string
      at: number
    }

declare global {
  var __quizWsBroadcast:
    | ((quizId: string, payload: QuizWsEvent) => void)
    | undefined
}

export function broadcastQuizEvent(quizId: string, payload: QuizWsEvent) {
  globalThis.__quizWsBroadcast?.(quizId, payload)
}
