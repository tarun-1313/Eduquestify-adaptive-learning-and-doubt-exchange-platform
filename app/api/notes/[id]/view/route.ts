import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

// POST /api/notes/[id]/view - Increment view count
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  try {
    const db = await getDb();
    
    // First get the current view count
    interface NoteRow extends RowDataPacket {
      views_count: number;
    }
    
    const [rows] = await db.query<NoteRow[]>(
      'SELECT views_count FROM notes WHERE id = ?',
      [id]
    );
    
    const currentViews = rows?.[0]?.views_count || 0;
    
    // Increment the view count
    await db.query(
      'UPDATE notes SET views_count = ? WHERE id = ?',
      [currentViews + 1, id]
    );

    return NextResponse.json({ 
      success: true,
      views: currentViews + 1 
    });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json(
      { error: 'Failed to update view count' },
      { status: 500 }
    );
  }
}
