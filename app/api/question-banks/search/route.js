import { getDb } from "@/lib/db"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const year = searchParams.get('year')
    const subject = searchParams.get('subject')
    const topic = searchParams.get('topic')

    if (!department || !year || !subject || !topic) {
      return Response.json(
        { error: "Missing required search parameters" },
        { status: 400 }
      )
    }

    const db = getDb()
    const [results] = await db.query(
      `SELECT * FROM question_bank 
       WHERE department = ? 
       AND year = ? 
       AND subject = ? 
       AND topic = ?`,
      [department, year, subject, topic]
    )

    return Response.json(results[0] || null)
  } catch (error) {
    console.error("Error searching question banks:", error)
    return Response.json(
      { error: "Failed to search question banks" },
      { status: 500 }
    )
  }
}
