import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decode, JwtPayload } from 'jsonwebtoken'

interface UserPayload extends JwtPayload {
  role?: 'Teacher' | 'Student';
  // Add other user properties as needed
}

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('eduq_token')?.value
  
  // Verify and decode token
  let isAuthenticated = false;
  let user: UserPayload | null = null;
  
  if (token) {
    try {
      const decoded = decode(token);
      if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
        user = decoded as UserPayload;
        isAuthenticated = Date.now() < (user.exp as number) * 1000;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated) {
    // Allow access to public study materials if not authenticated
    if (request.nextUrl.pathname.startsWith('/study') && 
        !request.nextUrl.pathname.startsWith('/study/quiz') &&
        !request.nextUrl.pathname.startsWith('/study/start')) {
      return NextResponse.next()
    }
    
    // If trying to access auth pages, allow it
    if (isAuthPage) {
      return NextResponse.next()
    }
    
    // For other protected routes, redirect to login
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access auth pages
  if (isAuthenticated && user) {
    // Allow direct access to login and register pages without redirection
    if (isAuthPage) {
      return NextResponse.next();
    }
    
    // If trying to access study page, allow it regardless of role
    if (request.nextUrl.pathname.startsWith('/study')) {
      return NextResponse.next();
    }
    
    // If user is a student trying to access teacher routes
    if (request.nextUrl.pathname.startsWith('/teacher') && 
        user?.role !== 'Teacher') {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // If user is a teacher trying to access student routes
    if (request.nextUrl.pathname.startsWith('/student') && 
        user?.role !== 'Student') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
  } else if (isAuthPage) {
    // If user is not authenticated but trying to access auth pages, allow it
    return NextResponse.next();
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/student/:path*',
    '/teacher/:path*',
    '/study/:path*',
    '/login',
    '/register',
    '/notes/:path*',
    '/doubts/:path*',
    '/leaderboard/:path*',
    '/question-bank/:path*'
  ],
}
