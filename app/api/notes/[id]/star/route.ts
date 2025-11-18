import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

const db = getDb();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Properly handle dynamic route parameters
    const { id } = await params;
    const noteId = parseInt(id);
    
    if (isNaN(noteId)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Check if the note exists
    const [note] = await db.query(
      'SELECT * FROM notes WHERE id = ?',
      [noteId]
    ) as any[];

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Check if the note is already starred
    const [existingStar] = await db.query(
      'SELECT * FROM user_starred_notes WHERE user_id = ? AND note_id = ?',
      [userId, noteId]
    ) as any[];

    try {
      if (existingStar) {
        // Remove from starred
        await db.query(
          'DELETE FROM user_starred_notes WHERE user_id = ? AND note_id = ?',
          [userId, noteId]
        );
      } else {
        // Add to starred with ON DUPLICATE KEY UPDATE to handle race conditions
        await db.query(
          `INSERT INTO user_starred_notes (user_id, note_id) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), note_id = VALUES(note_id)`,
          [userId, noteId]
        );
      }
    } catch (error) {
      // Type guard to check if error has a code property
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        // It's a duplicate entry error, we can safely ignore it
        // as it means the record already exists
      } else {
        // Re-throw any other errors
        throw error;
      }
    }

    // Return the current state (whether it's now starred or not)
    const [currentState] = await db.query(
      'SELECT 1 as isStarred FROM user_starred_notes WHERE user_id = ? AND note_id = ?',
      [userId, noteId]
    ) as any[];

    return NextResponse.json({
      success: true,
      isStarred: !!currentState
    });
  } catch (error) {
    console.error('Error toggling star status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to update star status', details: errorMessage },
      { status: 500 }
    );
  }
}
