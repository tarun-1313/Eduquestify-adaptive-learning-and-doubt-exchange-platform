import { NextResponse } from 'next/server'
import { 
  getUserFlashcardSessionsMySQL, 
  getAllUserFlashcardMasteryMySQL,
  getUserFlashcardStatsMySQL
} from '@/lib/flashcard-db-mysql'
import { getUserFromToken } from '@/lib/jwt-utils'

export async function GET(request) {
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

    const userId = parseInt(user.id)

    // Fetch all dashboard data in parallel
    const [sessions, mastery, stats] = await Promise.all([
      getUserFlashcardSessionsMySQL(userId),
      getAllUserFlashcardMasteryMySQL(userId),
      getUserFlashcardStatsMySQL(userId)
    ])

    return NextResponse.json({
      sessions,
      mastery,
      stats,
      success: true
    })

  } catch (error) {
    console.error('Error fetching flashcard dashboard data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error.message 
      },
      { status: 500 }
    )
  }
}