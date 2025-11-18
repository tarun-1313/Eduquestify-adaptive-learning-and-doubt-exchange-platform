import { getDb } from "@/lib/db"

export async function POST(request) {
  try {
    const db = getDb()
    const { title, description, subject, topic, department, year, numQuestions } = await request.json()
    
    // For now, using a default user ID - in a real app, get this from the session
    const createdBy = 1; // TODO: Replace with actual user ID from auth

    if (!title || !subject || !topic || !department || !year) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const [result] = await db.query(
      `INSERT INTO question_bank 
       (title, description, subject, topic, department, year, num_questions, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, description || null, subject, topic, department, year, numQuestions || 0, createdBy]
    )

    return Response.json({
      id: result.insertId,
      message: "Question bank created successfully"
    })
  } catch (error) {
    console.error("Error creating question bank:", error)
    return Response.json(
      { error: "Failed to create question bank" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const db = getDb()
    const [rows] = await db.query(`
      SELECT 
        qb.*,
        u.name as created_by_name
      FROM question_bank qb
      LEFT JOIN users u ON qb.created_by = u.id
      ORDER BY qb.created_at DESC
    `)
    return Response.json(rows)
  } catch (error) {
    console.error("Error fetching question banks:", error)
    return Response.json(
      { error: "Failed to fetch question banks" },
      { status: 500 }
    )
  }
}
