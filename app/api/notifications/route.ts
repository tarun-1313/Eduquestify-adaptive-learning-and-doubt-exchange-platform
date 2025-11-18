import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const db = getDb()
    
    // Get user ID from session
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [user.email]
    )
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const userId = (users as any)[0].id
    
    // Fetch notifications
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `
    
    const [notifications] = await db.query(query, [userId])
    
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Mark notifications as seen
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { notificationIds } = await request.json()
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds array is required' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    
    // Get user ID from session
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [user.email]
    )
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const userId = (users as any)[0].id
    
    // Mark notifications as seen
    await db.query(
      'UPDATE notifications SET seen = TRUE WHERE user_id = ? AND id IN (?)',
      [userId, notificationIds]
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications as seen:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as seen' },
      { status: 500 }
    )
  }
}