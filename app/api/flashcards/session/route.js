import { NextResponse } from 'next/server'
import { 
  createFlashcardSessionMySQL, 
  updateFlashcardSessionMySQL
} from '@/lib/flashcard-db-mysql'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getUserFromToken } from '@/lib/jwt-utils'

// Create a new flashcard session
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

    // Ensure the user exists in DB to satisfy FK constraints
    const db = getDb()
    let currentUserId = user.id;

    const [existingUserById] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [parseInt(user.id)]);
    if (!Array.isArray(existingUserById) || existingUserById.length === 0) {
      if (user.email) {
        const [existingUserByEmail] = await db.execute('SELECT id FROM users WHERE users.email = ? LIMIT 1', [user.email]);
        if (Array.isArray(existingUserByEmail) && existingUserByEmail.length > 0) {
          currentUserId = existingUserByEmail[0].id;
        } else {
          const pwd = await bcrypt.hash('temporary-password', 10);
          const role = user.role || 'Student';
          const [result] = await db.execute(
            'INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [user.email, user.name || 'User', pwd, role]
          );
          currentUserId = result.insertId;
        }
      } else {
        return NextResponse.json(
          { error: 'User not found and email not provided to create new user' },
          { status: 400 }
        );
      }
    }

    const body = await request.json()
    const { subject, topic, totalFlashcards } = body

    if (!subject || !topic || !totalFlashcards) {
      return NextResponse.json(
        { error: 'Subject, topic, and totalFlashcards are required' },
        { status: 400 }
      )
    }

    const session = await createFlashcardSessionMySQL({
      userId: currentUserId,
      subject,
      topic,
      totalFlashcards,
      difficultyLevel: body.difficultyLevel,
    })
    
    const sessionId = session.id

    return NextResponse.json({
      sessionId,
      success: true
    })

  } catch (error) {
    console.error('Error creating flashcard session:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create flashcard session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Update session progress
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
    const { sessionId, completedFlashcards, correctAnswers, sessionDuration, status } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    await updateFlashcardSessionMySQL(sessionId, {
      completedFlashcards,
      correctAnswers,
      sessionDurationSeconds: sessionDuration,
      status
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Error updating flashcard session:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update flashcard session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}