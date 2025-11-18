import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { targetType, targetId, value, authorId } = (await req.json()) as {
      targetType: "post" | "answer"
      targetId: number
      value: 1 | -1
      authorId: number
    }

    const db = getDb()
    if (targetType === "post") {
      await db.query(
        "INSERT INTO post_votes (post_id, user_id, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
        [targetId, user.id, value],
      )
    } else {
      await db.query(
        "INSERT INTO answer_votes (answer_id, user_id, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
        [targetId, user.id, value],
      )
    }

    if (value === 1 && authorId) {
      // reward coins for upvote
      await db.query("UPDATE user_stats SET coins = coins + 1 WHERE user_id = ?", [authorId])
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
