import { decode } from "jsonwebtoken";

// Helper function to get cookie by name
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const getToken = (): string | null => {
  return getCookie('eduq_token');
};

export const getUserFromToken = (token: string | null): any => {
  if (!token) return null;
  
  try {
    const decoded = decode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  try {
    const decoded = decode(token) as any;
    if (!decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};
