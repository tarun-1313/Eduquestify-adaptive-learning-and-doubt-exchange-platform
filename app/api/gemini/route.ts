import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions, generateFlashcards, analyzePerformance } from '@/lib/gemini'

// TODO: Paste your API key here.
// WARNING: This is INSECURE. Do not commit this file to Git or share it publicly.
const GEMINI_API_KEY = "AIzaSyD7watLiaNdCUuzIX_UOIVdDCnCLip9eIo"

export async function POST(request: NextRequest) {
  try {
    // Check if API key is set in the constant above
    if (!GEMINI_API_KEY ) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add your key to the `GEMINI_API_KEY` constant in this file.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { action, ...params } = body

    console.log('API Request:', { action, params })

    switch (action) {
      case 'generate-questions':
        if (!params.topic || !params.difficulty) {
          return NextResponse.json(
            { error: 'Missing required parameters: topic and difficulty' },
            { status: 400 }
          )
        }

        const questions = await generateQuestions(
          GEMINI_API_KEY,
          params.topic,
          params.difficulty,
          params.count || 5
        )
        console.log('Generated questions:', questions.length)
        return NextResponse.json({ questions })

      case 'generate-flashcards':
        if (!params.topic) {
          return NextResponse.json(
            { error: 'Missing required parameter: topic' },
            { status: 400 }
          )
        }

        const flashcards = await generateFlashcards(
          GEMINI_API_KEY,
          params.topic,
          params.notes,
          params.count || 10
        )
        console.log('Generated flashcards:', flashcards.length)
        return NextResponse.json({ flashcards })

      case 'analyze-performance':
        if (!params.scores) {
          return NextResponse.json(
            { error: 'Missing required parameter: scores' },
            { status: 400 }
          )
        }

        const suggestions = await analyzePerformance(
          GEMINI_API_KEY,
          params.scores
        )
        return NextResponse.json({ suggestions })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: generate-questions, generate-flashcards, analyze-performance' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Gemini API error:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to process request'
    if (error instanceof Error) {
      // Updated error message
      if (error.message.includes('API_KEY')) {
        errorMessage = 'Invalid API key. Please check the `GEMINI_API_KEY` constant.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error - please check your internet connection'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}