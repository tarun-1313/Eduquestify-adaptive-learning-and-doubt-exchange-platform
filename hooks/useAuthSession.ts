'use client';

import { useAuth } from '@clerk/clerk-react';

export function useAuthSession() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    session: isAuthenticated ? { user } : null,
    status: isLoading ? 'loading' : isAuthenticated ? 'authenticated' : 'unauthenticated',
    isLoading,
    isAuthenticated,
    user: user,
  };
}
