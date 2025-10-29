// app/layout.tsx
import './globals.css';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic'; // don't prerender this layout

function resolveOrigin(): string | undefined {
  // Prefer envs (production) — NEVER put placeholders here.
  const env =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL;

  if (env && /^https?:\/\//.test(env)) return env.replace(/\/+$/, '');

  // Runtime fallback (preview/dev on Vercel)
  try {
    const h = headers(); // throws at build time; that's OK
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'https';
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() is unavailable at build time
  }
  return undefined;
}

const origin = resolveOrigin();

export const metadata = {
  // Safe: only construct URL if we actually have one
  metadataBase: origin ? new URL(origin) : undefined,
  title: 'Aurora EA',
  description: 'Enterprise-secure, human-in-the-loop executive assistant.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
