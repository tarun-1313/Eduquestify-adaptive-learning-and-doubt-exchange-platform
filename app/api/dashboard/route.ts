import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

interface Note extends RowDataPacket {
  id: number;
  title: string;
  description?: string;
  subject_name?: string;
  updated_at: string;
  created_at: string;
  user_name?: string;
  is_starred?: boolean;
}

interface Document extends RowDataPacket {
  id: number;
  title: string;
  filename: string;
  mimeType: string;
  size: number;
  created_at: string;
  subject_name?: string;
}

export async function GET(request: Request) {
  try {
    const { user } = await getUserFromRequest();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const userId = user.id;

    // Fetch recent notes (last 5)
    const [recentNotesResult] = await db.query<Note[]>(
      `SELECT n.*, s.name as subject_name, u.name as user_name
       FROM notes n
       JOIN subjects s ON n.subject_id = s.id
       JOIN users u ON n.user_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.updated_at DESC
       LIMIT 5`,
      [userId]
    );

    // Fetch starred notes
    const [starredNotesResult] = await db.query<Note[]>(
      `SELECT n.*, s.name as subject_name, u.name as user_name
       FROM notes n
       JOIN subjects s ON n.subject_id = s.id
       JOIN users u ON n.user_id = u.id
       JOIN user_starred_notes usn ON n.id = usn.note_id
       WHERE usn.user_id = ?
       ORDER BY usn.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Fetch recently uploaded documents (last 5)
    const [documentsResult] = await db.query<Document[]>(
      `SELECT n.id, n.title, n.original_filename as filename, n.file_mime_type as mimeType, 
              n.file_size_bytes as size, n.created_at, s.name as subject_name
       FROM notes n
       JOIN subjects s ON n.subject_id = s.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Format document sizes
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const recentNotes = Array.isArray(recentNotesResult) ? recentNotesResult : [];
    const starredNotes = Array.isArray(starredNotesResult) ? starredNotesResult : [];
    const recentDocuments = Array.isArray(documentsResult) ? documentsResult : [];

    const formattedDocuments = recentDocuments.map((doc) => ({
      ...doc,
      formattedSize: formatFileSize(doc.size),
      fileType: doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'
    }));

    return NextResponse.json({
      recentNotes,
      starredNotes,
      recentDocuments: formattedDocuments
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
