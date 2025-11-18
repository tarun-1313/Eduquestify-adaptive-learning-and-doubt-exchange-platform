import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { postId, body } = await req.json()
    if (!postId || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const db = getDb()
    await db.query("INSERT INTO answers (post_id, user_id, body, created_at) VALUES (?, ?, ?, NOW())", [
      postId,
      user.id,
      body,
    ])
    // award XP for participation
    await db.query("UPDATE user_stats SET xp = xp + 3 WHERE user_id = ?", [user.id])

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
