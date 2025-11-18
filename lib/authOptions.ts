// JWT-based auth configuration (not using NextAuth)
import { getCurrentUser } from './auth';

// Mock auth options for compatibility with existing code
export const authOptions = {
  // This is a placeholder - we're using JWT instead of NextAuth
  // The actual authentication is handled by getCurrentUser() in auth.ts
};

// Export functions that match NextAuth's API for compatibility
export async function getServerSession() {
  return await getCurrentUser();
}