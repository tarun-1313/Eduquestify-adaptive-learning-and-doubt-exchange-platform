import { getDb } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(_req, { params }) {
  const { id } = await params
  const db = await getDb()
  const [rows] = await db.query("SELECT * FROM notes WHERE id=?", [id])
  if (!rows[0]) return Response.json({ ok: false, error: "Not found" }, { status: 404 })
  return Response.json({ ok: true, note: rows[0] })
}

export async function PUT(req, { params }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  const { title, content, subject, tags, visibility } = await req.json()
  const db = await getDb()
  const [rows] = await db.query("SELECT user_id FROM notes WHERE id=?", [id])
  if (!rows[0]) return Response.json({ ok: false, error: "Not found" }, { status: 404 })
  if (rows[0].user_id !== user.id) return Response.json({ ok: false, error: "Forbidden" }, { status: 403 })
  await db.query("UPDATE notes SET title=?, content=?, subject=?, tags=?, visibility=?, updated_at=NOW() WHERE id=?", [
    title,
    content,
    subject || null,
    JSON.stringify(tags || []),
    visibility || "public",
    id,
  ])
  return Response.json({ ok: true })
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const user = await getUserFromRequest(req)
  if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  const db = await getDb()
  const [rows] = await db.query("SELECT user_id FROM notes WHERE id=?", [id])
  if (!rows[0]) return Response.json({ ok: false, error: "Not found" }, { status: 404 })
  if (rows[0].user_id !== user.id) return Response.json({ ok: false, error: "Forbidden" }, { status: 403 })
  await db.query("DELETE FROM notes WHERE id=?", [id])
  return Response.json({ ok: true })
}
