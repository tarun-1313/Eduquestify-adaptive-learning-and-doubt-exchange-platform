import { getDb } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(_req, { params }) {
  const db = await getDb()
  const [rows] = await db.query("SELECT * FROM doubts WHERE id=?", [params.id])
  if (!rows[0]) return Response.json({ ok: false, error: "Not found" }, { status: 404 })
  return Response.json({ ok: true, doubt: rows[0] })
}

export async function PUT(req, { params }) {
  const user = await getUserFromRequest(req)
  if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  const { status } = await req.json()
  const db = await getDb()
  const [rows] = await db.query("SELECT user_id FROM doubts WHERE id=?", [params.id])
  if (!rows[0]) return Response.json({ ok: false, error: "Not found" }, { status: 404 })
  // Teachers can update any; owners can update theirs
  if (rows[0].user_id !== user.id && user.role !== "teacher")
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 })
  await db.query("UPDATE doubts SET status=? WHERE id=?", [status || "open", params.id])
  return Response.json({ ok: true })
}
