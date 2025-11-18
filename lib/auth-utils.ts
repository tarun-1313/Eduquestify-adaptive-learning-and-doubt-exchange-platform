import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Unified JWT secret to match lib/auth.ts
export const JWT_SECRET = Buffer.from('cb96c4b6e27155ea28c9c2c91c1ba2e1ffe1b5779f80634e217933dbeaa4f879e5568bdff53593a664b2754a918283b1f41fdfccfcc59edba1b046b833450eea24e76d6a2ec12c1313399d78db97f598a5e76cd49afaea9371bd16756fe6e60f9b835bb4a5ae4ee597b3c51a4654519ce22a80f8db1c886d6085353e820bcbccb3f1e366fea7ec676f1481984089c57b9bd5a58c2c7287d440c062b52eb256c2d2de440dc46f3adb', 'hex');
const TOKEN_NAME = 'eduq_token';

interface UserPayload {
  id: number;
  email: string;
  name?: string;
  role?: string;
}

export async function createToken(user: UserPayload): Promise<string> {
  // Remove conflicting JWT fields if present
  const { exp, iat, nbf, ...rest } = user as any;
  return jwt.sign(rest, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '30d'
  });
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  await cookieStore.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  await cookieStore.set(TOKEN_NAME, '', {
    expires: new Date(0),
    path: '/',
  });
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}
