import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyToken } from '@/lib/jwt-utils'
import { cookies } from 'next/headers'
import { sendNoteSharedNotification } from '@/lib/notifications'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// POST /api/doubts/[id]/shared-notes - Share a note in chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
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
    
    const { id: doubtId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    
    if (!file || !doubtId || !title) {
      return NextResponse.json(
        { error: 'File, doubt ID, and title are required' },
        { status: 400 }
      )
    }
    
    // Validate file type (PDF, images, text files)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, images, text, Word documents' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
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
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'shared-notes')
    await mkdir(uploadsDir, { recursive: true })
    
    // Generate unique filename
    const fileExtension = path.extname(file.name) || '.txt'
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadsDir, uniqueFilename)
    
    // Save file to filesystem
    const fileBuffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(fileBuffer))
    
    // Store relative path in database
    const relativePath = `/uploads/shared-notes/${uniqueFilename}`
    
    // Insert the shared note
    const [result] = await db.query(
      `INSERT INTO shared_notes (doubt_id, uploader_id, title, file_url, size) 
       VALUES (?, ?, ?, ?, ?)`,
      [doubtId, userId, title, relativePath, file.size]
    )
    
    const noteId = (result as any).insertId
    
    // Fetch the newly created note
    const [newNotes] = await db.query(
      `SELECT sn.*, u.name as uploader_name, u.email as uploader_email
       FROM shared_notes sn
       JOIN users u ON sn.uploader_id = u.id
       WHERE sn.id = ?`,
      [noteId]
    )
    
    // Send notification to doubt participants
    await sendNoteSharedNotification(parseInt(doubtId), userId, title)
    
    return NextResponse.json({ note: Array.isArray(newNotes) ? newNotes[0] : newNotes })
  } catch (error) {
    console.error('Error sharing note:', error)
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    )
  }
}

// GET /api/doubts/[id]/shared-notes - Get shared notes for a doubt
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
      SELECT sn.*, u.name as uploader_name, u.email as uploader_email,
             AVG(nr.rating) as avg_rating, COUNT(nr.id) as rating_count
      FROM shared_notes sn
      JOIN users u ON sn.uploader_id = u.id
      LEFT JOIN note_ratings nr ON sn.id = nr.shared_note_id
      WHERE sn.doubt_id = ?
      GROUP BY sn.id, u.name, u.email
      ORDER BY sn.created_at DESC
    `
    
    const [notes] = await db.query(query, [doubtId])
    
    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}