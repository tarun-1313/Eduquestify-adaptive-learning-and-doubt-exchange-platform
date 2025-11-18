import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { getDb } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Case-insensitive email comparison
    const [users] = await db.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    ) as any;

    const user = users[0];
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, user.password_hash);
    if (!isValid) {
      console.log(`Login failed: Incorrect password for user ${user.email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    // Create response with user data (excluding password)
    const { password_hash, ...userData } = user;
    
    // Set the token in an HTTP-only cookie using the proper method
    const cookieStore = await cookies();
    cookieStore.set('eduq_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log(`Login successful for user ${user.email}`);
    console.log('Cookie set response:', cookieStore.get('eduq_token'));
    
    // Create response with user data
    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" }, 
      { status: 500 }
    );
  }
}