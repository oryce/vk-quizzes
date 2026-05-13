import { createServer } from "node:http"
import next from "next"
import { WebSocketServer } from "ws"

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME ?? "0.0.0.0"
const port = Number(process.env.PORT ?? 3000)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const rooms = new Map()

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload))
  }
}

function broadcast(quizId, payload) {
  const sockets = rooms.get(quizId)

  if (!sockets) {
    return
  }

  for (const socket of sockets) {
    send(socket, payload)
  }
}

globalThis.__quizWsBroadcast = broadcast

await app.prepare()

const server = createServer((request, response) => {
  handle(request, response)
})

const wss = new WebSocketServer({ noServer: true })

wss.on("connection", (socket) => {
  let quizId = null

  socket.on("message", (rawMessage) => {
    let message

    try {
      message = JSON.parse(rawMessage.toString())
    } catch {
      send(socket, { type: "error", message: "Invalid JSON" })
      return
    }

    if (message.type !== "subscribe" || typeof message.quizId !== "string") {
      send(socket, { type: "error", message: "Invalid message" })
      return
    }

    if (quizId) {
      rooms.get(quizId)?.delete(socket)
    }

    quizId = message.quizId

    if (!rooms.has(quizId)) {
      rooms.set(quizId, new Set())
    }

    rooms.get(quizId)?.add(socket)
    send(socket, { type: "subscribed", quizId })
    broadcast(quizId, { type: "presence", quizId, at: Date.now() })
  })

  socket.on("close", () => {
    if (!quizId) {
      return
    }

    const sockets = rooms.get(quizId)
    sockets?.delete(socket)

    if (sockets?.size === 0) {
      rooms.delete(quizId)
    } else {
      broadcast(quizId, { type: "presence", quizId, at: Date.now() })
    }
  })
})

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url ?? "", `http://${request.headers.host}`)

  if (url.pathname !== "/api/quiz-ws") {
    socket.destroy()
    return
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request)
  })
})

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`)
  console.log(`> Quiz WebSocket ready at ws://${hostname}:${port}/api/quiz-ws`)
})
