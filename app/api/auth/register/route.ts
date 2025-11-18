import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import bcrypt from "bcryptjs"
import { signToken, setAuthCookie } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, phone, name, password, role } = body as {
      email: string
      phone?: string
      name: string
      password: string
      role: "Student" | "Teacher"
    }

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const db = await getDb()
    const [existing] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email])
    const rows = existing as Array<{ id: number }>
    if (rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const [result] = await db.query(
      "INSERT INTO users (email, phone, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [email, phone || null, name, hash, role],
    )
    // @ts-ignore
    const userId = result.insertId as number

    await db.query("INSERT INTO user_stats (user_id, xp, coins, streak, last_active_at) VALUES (?, 0, 0, 0, NOW())", [
      userId,
    ])

    const token = signToken({ id: userId, role, email, name })
    await setAuthCookie(token)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}
