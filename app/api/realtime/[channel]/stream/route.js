import { NextResponse } from "next/server"
import { bus } from "@/lib/realtime-bus"

export const dynamic = "force-dynamic"

export async function GET(req, { params }) {
  const { channel } = params
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch (e) {
          // ignore
        }
      }

      // Initial hello for quick connect validation
      send({ type: "hello", channel, ts: Date.now() })

      const onMessage = (payload) => {
        if (payload?.channel === channel) send(payload)
      }

      bus.on("message", onMessage)

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"))
        } catch (e) {}
      }, 25000)

      controller.closeWhen = () => {
        clearInterval(keepAlive)
        bus.off("message", onMessage)
      }
    },
    cancel() {},
  })

  const response = new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })

  // Ensure cleanup on client disconnect
  response.body
    ?.getReader?.()
    .closed?.then(() => {
      if (stream?.controller?.closeWhen) stream.controller.closeWhen()
    })
    .catch(() => {
      // Ensure cleanup on close: add reader cancel fallback
      // This helps avoid leaked listeners if the stream ends unexpectedly.
      if (stream?.controller?.closeWhen) stream.controller.closeWhen()
    })

  return response
}
