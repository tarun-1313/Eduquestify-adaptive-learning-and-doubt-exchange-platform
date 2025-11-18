import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

// Define the handler function
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // Check if user already liked the note
    const [existingLikes] = await db.query<RowDataPacket[]>(
      'SELECT * FROM note_likes WHERE user_id = ? AND note_id = ?',
      [user.id, params.id]
    );

    if (existingLikes.length > 0) {
      // Unlike the note
      await db.query(
        'DELETE FROM note_likes WHERE user_id = ? AND note_id = ?',
        [user.id, params.id]
      );
      
      // Decrement likes count
      await db.query(
        'UPDATE notes SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?',
        [params.id]
      );
      
      return NextResponse.json({ liked: false });
    } else {
      // Like the note
      await db.query(
        'INSERT INTO note_likes (user_id, note_id) VALUES (?, ?)',
        [user.id, params.id]
      );
      
      // Increment likes count
      await db.query(
        'UPDATE notes SET likes_count = likes_count + 1 WHERE id = ?',
        [params.id]
      );
      
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
