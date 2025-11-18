import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { recentSessions } = await req.json()
    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      prompt: [
        "Analyze student performance based on these session summaries.",
        "Return JSON with keys: strongAreas[], weakAreas[], recommendations[], summary.",
        `Data: ${JSON.stringify(recentSessions || [])}`,
      ].join("\n"),
    })
    return NextResponse.json({ analysis: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
