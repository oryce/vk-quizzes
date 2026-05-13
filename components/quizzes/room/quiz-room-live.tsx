"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export function QuizRoomLive({ quizId }: { quizId: string }) {
  const router = useRouter()

  React.useEffect(() => {
    let closed = false
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      socket = new WebSocket(`${protocol}//${window.location.host}/api/quiz-ws`)

      socket.addEventListener("open", () => {
        socket?.send(JSON.stringify({ type: "subscribe", quizId }))
      })

      socket.addEventListener("message", () => {
        router.refresh()
      })

      socket.addEventListener("close", () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, 1000)
        }
      })
    }

    connect()

    const refreshTimer = setInterval(() => {
      router.refresh()
    }, 2000)

    return () => {
      closed = true
      clearInterval(refreshTimer)

      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }

      socket?.close()
    }
  }, [quizId, router])

  return null
}
