'use client';
import Link from 'next/link';

export default function MarketingHome() {
  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Aurora EA</h1>
      <p className="mb-6">
        Enterprise-secure, human-in-the-loop executive assistant.
      </p>
      <Link
        href="/dashboard"
        className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white"
      >
        Open the App
      </Link>
    </main>
  );
}
