import { getDb } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET() {
  const db = await getDb()
  const [rows] = await db.query(
    "SELECT id, subject, question, difficulty, created_at FROM question_bank ORDER BY created_at DESC LIMIT 200",
  )
  return Response.json({ ok: true, items: rows })
}

export async function POST(req) {
  const user = await getUserFromRequest(req)
  if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  const { subject, question, options, answer, difficulty } = await req.json()
  if (!subject || !question || !answer) return Response.json({ ok: false, error: "Missing fields" }, { status: 400 })
  const db = await getDb()
  const [res] = await db.query(
    "INSERT INTO question_bank (created_by, subject, question, options, answer, difficulty) VALUES (?,?,?,?,?,?)",
    [user.id, subject, question, JSON.stringify(options || []), answer, difficulty || "medium"],
  )
  return Response.json({ ok: true, id: res.insertId })
}
