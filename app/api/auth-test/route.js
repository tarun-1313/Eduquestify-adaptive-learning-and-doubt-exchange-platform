import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Auth Test - Session:', {
      hasSession: !!session,
      user: session?.user,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      expires: session?.expires
    });

    if (!session) {
      return new Response(JSON.stringify({ 
        authenticated: false,
        message: 'Not authenticated',
        session: null
      }), { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

    return new Response(JSON.stringify({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      },
      expires: session.expires
    }), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true'
      }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return new Response(JSON.stringify({
      error: 'Authentication test failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
}
