import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// GET /api/notes/subjects - Get note counts by subject
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // Get note counts by subject for the current user
    const [subjects] = await db.query(
      `SELECT subject, COUNT(*) as count 
       FROM notes 
       WHERE user_id = ?
       GROUP BY subject 
       ORDER BY count DESC`,
      [session.user.id]
    );

    return NextResponse.json({ data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
