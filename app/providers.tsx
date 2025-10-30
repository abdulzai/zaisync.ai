'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onError = (e: ErrorEvent) => console.log('[window.error]', e.error ?? e.message);
    const onRej = (e: PromiseRejectionEvent) => console.log('[unhandledrejection]', e.reason);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
