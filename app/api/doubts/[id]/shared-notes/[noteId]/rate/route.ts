import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/jwt-utils'
import { cookies } from 'next/headers'

// POST /api/doubts/[id]/shared-notes/[noteId]/rate - Rate a shared note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('eduq_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const decoded = await verifyToken(token)
    if (!decoded?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id: doubtId, noteId } = await params
    const { rating } = await request.json()
    
    if (!doubtId || !noteId) {
      return NextResponse.json(
        { error: 'Doubt ID and Note ID are required' },
        { status: 400 }
      )
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    
    // Get user ID from session
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [decoded.email]
    )
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const userId = (users as any)[0].id
    
    // Check if the shared note exists and belongs to this doubt
    const [notes] = await db.query(
      'SELECT id FROM shared_notes WHERE id = ? AND doubt_id = ?',
      [noteId, doubtId]
    )
    
    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json(
        { error: 'Shared note not found' },
        { status: 404 }
      )
    }
    
    // Insert or update the rating (upsert)
    const [result] = await db.query(
      `INSERT INTO note_ratings (shared_note_id, user_id, rating) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = ?`,
      [noteId, userId, rating, rating]
    )
    
    // Get the updated average rating for this note
    const [ratingResult] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM note_ratings WHERE shared_note_id = ?',
      [noteId]
    )
    
    const avgRating = (ratingResult as any)[0]?.avg_rating || 0
    const ratingCount = (ratingResult as any)[0]?.rating_count || 0
    
    // Update the shared_notes table with the new average rating
    await db.query(
      'UPDATE shared_notes SET rating = ? WHERE id = ?',
      [avgRating, noteId]
    )
    
    return NextResponse.json({
      success: true,
      rating: rating,
      avgRating: parseFloat(avgRating.toFixed(2)),
      ratingCount: ratingCount
    })
  } catch (error) {
    console.error('Error rating note:', error)
    return NextResponse.json(
      { error: 'Failed to rate note' },
      { status: 500 }
    )
  }
}