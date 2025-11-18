import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { ResultSetHeader } from 'mysql2';

// GET /api/notes - Get all notes
export async function GET(request: Request) {
  try {
    const { user } = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const [notes] = await db.query(
      `SELECT n.*, u.name as user_name, u.email as user_email, u.image as user_image 
       FROM notes n 
       JOIN users u ON n.user_id = u.id 
       WHERE n.user_id = ? 
       ORDER BY n.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
  try {
    const { user } = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Handle file upload (you'll need to implement this)
    const filePath = await handleFileUpload(file);

    const noteData = {
      user_id: user.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      subject: formData.get('subject') as string,
      file_path: filePath,
      original_filename: file.name,
      file_mime_type: file.type,
      file_size_bytes: file.size,
    };

    const db = await getDb();
    const [result] = await db.query<ResultSetHeader>(
  `INSERT INTO notes 
   (user_id, title, description, subject, file_path, original_filename, file_mime_type, file_size_bytes)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noteData.user_id,
        noteData.title,
        noteData.description,
        noteData.subject,
        noteData.file_path,
        noteData.original_filename,
        noteData.file_mime_type,
        noteData.file_size_bytes
      ]
    ) as unknown as [ResultSetHeader];

    // Update subject counts
    await updateSubjectCounts();

    return NextResponse.json({ 
      success: true, 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

async function handleFileUpload(file: File): Promise<string> {
  // Implement your file upload logic here
  // This is a placeholder - you'll need to save the file to your storage solution
  // and return the path where it's stored
  return `/uploads/${Date.now()}-${file.name}`;
}

async function updateSubjectCounts() {
  const db = await getDb();
  // This is a simplified version - you might want to update a dedicated subjects table
  await db.query(
    `INSERT INTO subject_counts (subject, count)
     SELECT subject, COUNT(*) as count FROM notes GROUP BY subject
     ON DUPLICATE KEY UPDATE count = VALUES(count)`
  );
}
