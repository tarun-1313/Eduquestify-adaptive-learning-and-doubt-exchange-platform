import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { topics } = await req.json()
    const { text } = await generateText({
      model: "gemini-2.0-flash",
      prompt: [
        "Create concise flashcards to address hidden knowledge gaps.",
        "Return in Q: ... | A: ... lines, 1-2 lines each.",
        `Topics: ${JSON.stringify(topics || [])}`,
      ].join("\n"),
    })
    return NextResponse.json({ flashcards: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
