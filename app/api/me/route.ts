import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const userResult = await getUserFromRequest()
    if (!userResult.user) return NextResponse.json({ user: null }, { status: 401 })

    const db = getDb()
    const [rows]: any = await db.query(
      "SELECT u.id, u.email, u.phone, u.name, u.role, COALESCE(s.xp, 0) as xp, COALESCE(s.coins, 0) as coins, COALESCE(s.streak, 0) as streak FROM users u LEFT JOIN user_stats s ON s.user_id = u.id WHERE u.id = ? LIMIT 1",
      [userResult.user.id],
    )

    if (rows.length === 0) return NextResponse.json({ user: null }, { status: 404 })

    return NextResponse.json({ user: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
