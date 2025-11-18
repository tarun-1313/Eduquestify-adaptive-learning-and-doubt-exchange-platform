import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore - uuid types are installed but might not be detected

// Ensure uploads directory exists
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Create uploads directory if it doesn't exist
async function ensureUploadsDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Upload request received');
    
    const { user } = await getUserFromRequest();
    if (!user) {
      console.error('Unauthorized upload attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUploadsDir();
    
    console.log('Parsing form data...');
    const formData = await request.formData();
    
    // Log form data keys for debugging
    console.log('Form data keys:', Array.from(formData.keys()));
    
    const file = formData.get('file') as File | null;
    const subject = formData.get('subject') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    
    console.log('Received file:', file ? file.name : 'No file received');
    console.log('Subject:', subject);
    console.log('Title:', title);

    if (!file || !subject || !title) {
      return NextResponse.json(
        { error: 'File, subject, and title are required' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const relativePath = `/uploads/${fileName}`;

    // Convert file to buffer and save to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get subject ID from subjects table
    const db = await getDb();
    const [subjectRows] = await db.query(
      'SELECT id FROM subjects WHERE name = ?',
      [subject]
    );
    
    let subjectId;
    if (!Array.isArray(subjectRows) || subjectRows.length === 0) {
      // If subject doesn't exist, create it
      const [subjectResult] = await db.query(
        'INSERT INTO subjects (name, description) VALUES (?, ?)',
        [subject, `Notes for ${subject}`]
      );
      subjectId = (subjectResult as any).insertId;
    } else {
      subjectId = (subjectRows[0] as any).id;
    }

    // Save to database
    const [result] = await db.query(
      `INSERT INTO notes 
       (user_id, subject_id, title, description, file_path, original_filename, file_mime_type, file_size_bytes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        subjectId,
        title,
        description || null,
        relativePath,
        file.name,
        file.type || 'application/octet-stream',
        file.size
      ]
    );

    return NextResponse.json({
      success: true,
      filePath: relativePath,
      id: (result as any).insertId
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

// Increase the API body size limit to 10MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
