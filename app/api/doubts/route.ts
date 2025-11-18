import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

// GET /api/doubts - Get all doubts or filter by subject
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    
    const db = getDb()
    
    // First, check if the doubts table exists
    const [tables] = await db.query(
      "SHOW TABLES LIKE 'doubts'"
    ) as any[];
    
    if (tables.length === 0) {
      // If the doubts table doesn't exist, return an empty array
      return NextResponse.json({ doubts: [] });
    }
    
    let query = `
      SELECT d.*, u.name as user_name, u.email as user_email,
             (SELECT COUNT(*) FROM doubt_messages dm WHERE dm.doubt_id = d.id) as message_count,
             (SELECT MAX(created_at) FROM doubt_messages dm WHERE dm.doubt_id = d.id) as last_activity
      FROM doubts d
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (subject) {
      query += ` AND d.subject = ?`
      params.push(subject)
    }
    
    query += `
      ORDER BY d.created_at DESC
      LIMIT 50
    `
    
    const [doubts] = await db.query(query, params)
    
    return NextResponse.json({ doubts })
  } catch (error) {
    console.error('Error fetching doubts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doubts' },
      { status: 500 }
    )
  }
}

// POST /api/doubts - Create a new doubt
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('eduq_token')?.value
    let decoded = null;
    
    if (token) {
      try {
        decoded = await verifyToken(token)
      } catch (error) {
        console.error('Token verification error:', error);
        // Continue with guest user
      }
    }
    
    const { title, description, subject, category } = await request.json()
    
    if (!title || !description || !subject) {
      return NextResponse.json(
        { error: 'Title, description, and subject are required' },
        { status: 400 }
      )
    }
    
    // Use default category if not provided
    const doubtCategory = category || 'general'
    
    const db = getDb()
    
    // First, check if the doubts table exists
    const [tables] = await db.query(
      "SHOW TABLES LIKE 'doubts'"
    ) as any[];
    
    if (tables.length === 0) {
      return NextResponse.json(
        { error: 'Doubt system is not properly initialized' },
        { status: 500 }
      );
    }
    
    // Get user ID from session
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [decoded?.email]
    ) as any[];
    
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const userId = users[0].id;
    
    // Insert the new doubt using the correct column names
    const [result] = await db.query(
      `INSERT INTO doubts (user_id, title, body, subject) 
       VALUES (?, ?, ?, ?)`,
      [userId, title, description, subject]
    )
    
    const insertResult = result as any;
    const doubtId = insertResult.insertId;
    
    // Fetch the newly created doubt
    const [newDoubts] = await db.query(
      `SELECT d.*, u.name as user_name, u.email as user_email
       FROM doubts d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [doubtId]
    )
    
    const rows = newDoubts as any[]
    return NextResponse.json({ doubt: rows[0] })
  } catch (error) {
    console.error('Error creating doubt:', error)
    return NextResponse.json(
      { error: 'Failed to create doubt' },
      { status: 500 }
    )
  }
}