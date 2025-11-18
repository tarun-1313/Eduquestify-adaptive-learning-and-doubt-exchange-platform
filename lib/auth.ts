import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = Buffer.from('cb96c4b6e27155ea28c9c2c91c1ba2e1ffe1b5779f80634e217933dbeaa4f879e5568bdff53593a664b2754a918283b1f41fdfccfcc59edba1b046b833450eea24e76d6a2ec12c1313399d78db97f598a5e76cd49afaea9371bd16756fe6e60f9b835bb4a5ae4ee597b3c51a4654519ce22a80f8db1c886d6085353e820bcbccb3f1e366fea7ec676f1481984089c57b9bd5a58c2c7287d440c062b52eb256c2d2de440dc46f3adb', 'hex');

export type UserPayload = {
  id: number;
  email: string;
  name?: string;
  role?: string;
};

const TOKEN_NAME = 'eduq_token';

// Create JWT token
export async function createToken(payload: UserPayload): Promise<string> {
  // Remove exp property if exists to avoid conflict with expiresIn option
  const { exp, iat, nbf, ...rest } = payload as any;
  return jwt.sign(rest, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30d'
  });
}

// Alias for createToken to match the expected import name
export const signToken = createToken;

// Verify JWT token
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

// Set authentication cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

// Clear authentication cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

// Get user from request cookies
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  return await verifyToken(token);
}

// Get user from request (for API routes)
export async function getUserFromRequest() {
  const user = await getCurrentUser();
  return { 
    user, 
    token: user ? await createToken(user) : null 
  };
}