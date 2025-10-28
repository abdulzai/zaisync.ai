// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

function getSafeBaseUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'; // fallback for local/dev

  try {
    return new URL(candidate);
  } catch {
    // If somehow still invalid, omit metadataBase entirely
    return undefined;
  }
}

export const metadata: Metadata = {
  title: 'Aurora EA',
  description: 'Enterprise-secure, human-in-the-loop executive assistant.',
  ...(getSafeBaseUrl() ? { metadataBase: getSafeBaseUrl()! } : {})
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
