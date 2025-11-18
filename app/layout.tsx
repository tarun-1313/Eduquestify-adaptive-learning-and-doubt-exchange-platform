import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getToken as getTokenFromCookie, getUserFromToken } from '@/lib/jwt-utils';
import { cookies } from 'next/headers';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('eduq_token')?.value;
  let user = null;

  if (token) {
    try {
      user = getUserFromToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      // Token is invalid or expired, user will be treated as not logged in
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}