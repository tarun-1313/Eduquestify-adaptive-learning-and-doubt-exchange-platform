import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import twilio from "twilio"

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { to, message } = await req.json()
    if (!to || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_FROM_NUMBER
    if (!sid || !token || !from) {
      return NextResponse.json({ error: "Missing Twilio env vars" }, { status: 500 })
    }

    const client = twilio(sid, token)
    await client.messages.create({ to, from, body: message })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
