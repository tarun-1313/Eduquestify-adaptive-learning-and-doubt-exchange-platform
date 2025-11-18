'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth-context';

export default function AuthTest() {
  const { user, isAuthenticated, loading } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setSessionData({ status: res.status, data } as any);
      } catch (error) {
        setSessionData({ status: 500, data: { error: (error as Error).message } } as any);
      } finally {
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    console.log('AuthTest - useAuth state:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">useAuth Hook State:</h2>
          {loading ? (
            <p>Loading auth...</p>
          ) : (
            <div>
              <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Direct API Call Result:</h2>
          {loading ? (
            <p>Loading session...</p>
          ) : (
            <pre className="text-sm overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Test Actions:</h2>
        
        <div className="space-x-4">
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </a>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh Page
          </button>

          {isAuthenticated && (
            <a 
              href={user?.role === 'Teacher' || user?.role === 'teacher' ? '/teacher' : '/student'}
              className="inline-block px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Go to Dashboard ({user?.role === 'Teacher' || user?.role === 'teacher' ? 'Teacher' : 'Student'})
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-semibold">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Go to login page and log in</li>
          <li>Come back to this page</li>
          <li>Click "Refresh Page" to see updated session data</li>
          <li>Check browser console for debug logs</li>
        </ol>
      </div>
    </div>
  );
}