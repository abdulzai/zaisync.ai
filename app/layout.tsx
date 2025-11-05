import "./globals.css";
import { headers } from 'next/headers';
import { Providers } from './providers';

export const dynamic = 'force-dynamic';

function resolveOrigin(): string | undefined {
  const env =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL;
  if (env && /^https?:\/\//.test(env)) return env.replace(/\/+$/, '');
  try {
    const h = headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'https';
    if (host) return `${proto}://${host}`;
  } catch {}
  return undefined;
}

const origin = resolveOrigin();

export const metadata = {
  metadataBase: origin ? new URL(origin) : undefined,
  title: 'Aurora EA',
  description: 'Enterprise-secure, human-in-the-loop executive assistant.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
