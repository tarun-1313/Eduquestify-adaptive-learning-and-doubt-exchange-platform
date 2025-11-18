import { NextResponse } from 'next/server'
import { 
  recordFlashcardPerformanceMySQL,
  updateFlashcardMasteryMySQL 
} from '@/lib/flashcard-db-mysql'
import { getUserFromToken } from '@/lib/jwt-utils'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Record flashcard performance
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = getUserFromToken(token)
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Ensure user exists to satisfy FK constraints
    const db = getDb()
    const [byId] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [parseInt(user.id)])
    if (!Array.isArray(byId) || byId.length === 0) {
      if (user.email) {
        const [byEmail] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [user.email])
        if (!Array.isArray(byEmail) || byEmail.length === 0) {
          const pwd = await bcrypt.hash('temporary-password', 10)
          const role = user.role || 'Student'
          await db.execute(
            'INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [user.email, user.name || 'User', pwd, role]
          )
        }
      }
    }

    const body = await request.json()
    const { sessionId, flashcardId, isCorrect, responseTime } = body

    if (!sessionId || flashcardId === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Session ID, flashcard ID, and correctness are required' },
        { status: 400 }
      )
    }

    // Get flashcard details from the request body
    const { subject, topic, questionText, answerText, userAnswer } = body
    
    await recordFlashcardPerformanceMySQL({
      sessionId,
      userId: parseInt(user.id),
      subject: subject || 'General',
      topic: topic || 'General',
      questionText: questionText || 'Question',
      answerText: answerText || 'Answer',
      userAnswer,
      isCorrect,
      timeSpentSeconds: responseTime || 0
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Error recording flashcard performance:', error)
    return NextResponse.json(
      { 
        error: 'Failed to record flashcard performance',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Update mastery level
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = getUserFromToken(token)
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, topic, newScore } = body

    if (!subject || !topic || newScore === undefined) {
      return NextResponse.json(
        { error: 'Subject, topic, and newScore are required' },
        { status: 400 }
      )
    }

    await updateFlashcardMasteryMySQL({
      userId: parseInt(user.id),
      subject,
      topic,
      masteryLevel: newScore
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Error updating flashcard mastery:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update flashcard mastery',
        details: error.message 
      },
      { status: 500 }
    )
  }
}