import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET() {
  try {
    const db = getDb()
    const [rows] = await db.query(
      "SELECT p.id, p.title, p.body, p.user_id, u.name, p.created_at, IFNULL(v.votes,0) as votes " +
        "FROM posts p JOIN users u ON u.id = p.user_id " +
        "LEFT JOIN (SELECT post_id, SUM(value) as votes FROM post_votes GROUP BY post_id) v ON v.post_id = p.id " +
        "ORDER BY p.created_at DESC LIMIT 100",
    )
    return NextResponse.json({ posts: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { title, body } = await req.json()
    if (!title || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    const db = getDb()
    await db.query("INSERT INTO posts (title, body, user_id, created_at) VALUES (?, ?, ?, NOW())", [
      title,
      body,
      user.id,
    ])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
