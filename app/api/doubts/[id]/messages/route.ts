import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyJWT as verifyToken } from '@/lib/jwt-utils'
import { cookies } from 'next/headers'
import { sendDoubtReplyNotification } from '@/lib/notifications'

// GET /api/doubts/[id]/messages - Get all messages for a doubt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: doubtId } = await params
    
    if (!doubtId) {
      return NextResponse.json(
        { error: 'Doubt ID is required' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    
    const query = `
      SELECT dm.*, u.name as sender_name, u.email as sender_email
      FROM doubt_messages dm
      JOIN users u ON dm.user_id = u.id
      WHERE dm.doubt_id = ?
      ORDER BY dm.created_at ASC
    `
    
    const [messages] = await db.query(query, [doubtId])
    
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/doubts/[id]/messages - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies()
    const token = (await cookieStore).get('eduq_token')?.value
    
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
    
    const { id: doubtId } = await params
    const { content } = await request.json()
    
    if (!doubtId) {
      return NextResponse.json(
        { error: 'Doubt ID is required' },
        { status: 400 }
      )
    }
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
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
    
    // Check if doubt exists
    const [doubts] = await db.query(
      'SELECT id FROM doubts WHERE id = ?',
      [doubtId]
    )
    
    if (!Array.isArray(doubts) || doubts.length === 0) {
      return NextResponse.json(
        { error: 'Doubt not found' },
        { status: 404 }
      )
    }
    
    // Insert the new message
    const [result] = await db.query(
      'INSERT INTO doubt_messages (doubt_id, user_id, content) VALUES (?, ?, ?)',
      [doubtId, userId, content.trim()]
    )
    
    const messageId = (result as any).insertId
    
    // Fetch the newly created message
    const [newMessages] = await db.query(
      `SELECT dm.*, u.name as sender_name, u.email as sender_email
       FROM doubt_messages dm
       JOIN users u ON dm.user_id = u.id
       WHERE dm.id = ?`,
      [messageId]
    )
    
    // Send notification to doubt creator
    await sendDoubtReplyNotification(parseInt(doubtId), userId)
    
    return NextResponse.json({ message: (newMessages as any[])[0] })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}