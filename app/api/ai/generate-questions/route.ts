import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string
}

function getGeminiModel() {
  const apiKey = "AIzaSyD7watLiaNdCUuzIX_UOIVdDCnCLip9eIo"
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

export async function POST(req: Request) {
  try {
    const { topic, difficulty = 'Medium', count = 5 } = await req.json()
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const model = getGeminiModel()
    const prompt = `
Generate ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level.
Each question should have:
- A clear and concise question
- 4 distinct options (A, B, C, D)
- One correct answer (provide the index 0-3)
- A brief explanation of the answer
- The difficulty level (${difficulty})
- The topic (${topic})

Format the response as a valid JSON array with this structure:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]

Make sure the questions are educational, accurate, and cover different aspects of the topic.`

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.9,
      },
    })

    // Extract the text from the response
    const responseText = result.response.text()
    let questions: QuizQuestion[] = []

    try {
      // Try to parse the response as JSON
      questions = JSON.parse(responseText)
      
      // Validate the response structure
      if (!Array.isArray(questions)) {
        throw new Error('Invalid response format: expected an array of questions')
      }

      // Add unique IDs to each question
      questions = questions.map(q => ({
        ...q,
        id: crypto.randomUUID(),
        difficulty: q.difficulty || difficulty,
        topic: q.topic || topic
      }))

      return NextResponse.json({ questions })
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', responseText)
      throw new Error('Failed to parse quiz questions from the AI response')
    }
  } catch (error: unknown) {
    console.error('Error generating quiz questions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz questions'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
