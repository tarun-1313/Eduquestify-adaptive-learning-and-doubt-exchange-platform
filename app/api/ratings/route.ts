import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/ratings - Submit a rating for a note
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { noteId, rating } = await request.json()
    
    if (!noteId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid noteId and rating (1-5) are required' },
        { status: 400 }
      )
    }
    
    // Get user ID from session
    const db = await getDb()
    const [userRows] = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [currentUser.email]
    )
    const user = (userRows as any[])[0]
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if user has already rated this note
    const [existingRatingRows] = await db.execute(
      'SELECT id FROM ratings WHERE note_id = ? AND user_id = ? LIMIT 1',
      [noteId, user.id]
    )
    const existingRating = (existingRatingRows as any[])[0]
    
    if (existingRating) {
      // Update existing rating
      await db.execute(
        'UPDATE ratings SET rating = ? WHERE id = ?',
        [rating, existingRating.id]
      )
      
      return NextResponse.json({ 
        id: existingRating.id,
        noteId,
        userId: user.id,
        rating 
      })
    } else {
      // Create new rating
      const [result] = await db.execute(
        'INSERT INTO ratings (note_id, user_id, rating) VALUES (?, ?, ?)',
        [noteId, user.id, rating]
      )
      
      return NextResponse.json({ 
        id: (result as any).insertId,
        noteId,
        userId: user.id,
        rating 
      })
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
