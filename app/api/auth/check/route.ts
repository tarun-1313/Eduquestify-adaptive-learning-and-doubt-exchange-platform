import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const { user, token } = await getUserFromRequest();
    
    if (!user || !token) {
      return NextResponse.json(
        { user: null, isAuthenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('Authentication check failed:', error);
    return NextResponse.json(
      { user: null, isAuthenticated: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
