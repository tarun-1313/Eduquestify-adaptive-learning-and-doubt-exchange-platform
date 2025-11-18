import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    console.log('Session check - Raw Cookie header:', cookieHeader);
    
    const tokenRow = cookieHeader?.split('; ').find(row => row.startsWith('eduq_token='));
    console.log('Session check - Token row found:', tokenRow);
    const token = tokenRow?.split('=')[1];
    
    console.log('Session check - Token found:', !!token);
    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    console.log('Session check - Token:', token.substring(0, 50) + '...');
    const user = await verifyToken(token);
    console.log('Session check - User from verifyToken:', user);
    if (!user) {
      // Clear invalid token
      const response = NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
      response.cookies.delete('eduq_token');
      return response;
    }

    // Return only the necessary user data
    const { id, email, name, role } = user;
    return NextResponse.json({
      authenticated: true,
      user: { id, email, name, role }
    });
    
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
