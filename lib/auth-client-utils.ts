'use client';

import Cookies from 'js-cookie';

const TOKEN_NAME = 'eduq_token';

/**
 * Sets the authentication cookie in the browser
 * @param token JWT token to store in cookie
 */
export async function setAuthCookie(token: string) {
  Cookies.set(TOKEN_NAME, token, {
    expires: 30, // 30 days
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

/**
 * Clears the authentication cookie from the browser
 */
export function clearAuthCookie() {
  Cookies.remove(TOKEN_NAME, { path: '/' });
}

/**
 * Gets the authentication token from cookies
 * @returns The token string or null if not found
 */
export function getAuthCookie(): string | null {
  return Cookies.get(TOKEN_NAME) || null;
}