import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = getDb()
    const [rows] = await db.query(
      "SELECT u.name, u.role, s.xp, s.coins, s.streak FROM user_stats s JOIN users u ON u.id = s.user_id ORDER BY s.xp DESC LIMIT 50",
    )
    return NextResponse.json({ leaderboard: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
