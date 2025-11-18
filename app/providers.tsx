'use client';

import { ThemeProvider } from '@/components/theme-provider';
import GooeyNavbar from '@/components/GooeyNavbar';
import Footer from '@/components/footer';
import { AuthProvider } from '@/hooks/auth-context';
import SplashCursor from '@/components/SplashCursor';
import { Analytics } from '@vercel/analytics/next';
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // sanity check – runs in browser
  if (typeof AuthProvider !== 'function') {
    console.error('AuthProvider is not a function! Got:', AuthProvider);
  }
  const pathname = usePathname();
  const isTeacherRoute = pathname?.startsWith('/teacher');
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex flex-col min-h-screen">
          <SplashCursor />
          {!isTeacherRoute && <GooeyNavbar />}
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Analytics />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
