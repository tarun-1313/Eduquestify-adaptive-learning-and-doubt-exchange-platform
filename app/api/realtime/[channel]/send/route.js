import { NextResponse } from "next/server"
import { bus } from "@/lib/realtime-bus"

export async function POST(req, { params }) {
  const { channel } = params
  const body = await req.json().catch(() => ({}))
  const { text, user = {}, meta = {} } = body || {}

  const trimmedText = text ? text.trim() : ""
  if (!trimmedText) {
    return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 })
  }

  const payload = {
    type: "message",
    channel,
    text: trimmedText,
    user: {
      id: user.id || "anon",
      name: user.name || "Guest",
      avatar: user.avatar || null,
      role: user.role || "student",
    },
    meta,
    ts: Date.now(),
  }

  bus.emit("message", payload)

  return NextResponse.json({ ok: true })
}
