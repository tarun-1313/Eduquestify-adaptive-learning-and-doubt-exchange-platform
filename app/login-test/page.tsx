'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginTest() {
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('test123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        // Check session after login
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        setResult({
          loginResponse: loginData,
          session: sessionData,
          sessionStatus: sessionRes.status
        });
        
        // Redirect based on role
        if (sessionData.user) {
          const dashboardPath = sessionData.user.role === 'Teacher' || sessionData.user.role === 'teacher' 
            ? '/teacher' 
            : '/student';
          
          setTimeout(() => {
            router.push(dashboardPath);
          }, 2000);
        }
      } else {
        setResult({ error: loginData } as any);
      }
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Test</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Test Login & Redirect'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-semibold">Expected Behavior:</h3>
        <ol className="list-decimal list-inside space-y-1 mt-2 text-sm">
          <li>Login should succeed</li>
          <li>Session should return authenticated user</li>
          <li>Should redirect to appropriate dashboard based on role</li>
          <li>Student role → /student, Teacher role → /teacher</li>
        </ol>
      </div>
    </div>
  );
}