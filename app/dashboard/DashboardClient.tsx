'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardClient() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <main className="p-6">Loading…</main>;
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aurora EA — Dashboard</h1>

        <div className="space-x-2">
          {!session && (
            <>
              <button onClick={() => signIn('google')} className="px-3 py-2 rounded bg-blue-600 text-white">
                Connect Gmail
              </button>
              <button onClick={() => signIn('azure-ad')} className="px-3 py-2 rounded bg-slate-700 text-white">
                Connect Outlook
              </button>
            </>
          )}
          {session && (
            <button onClick={() => signOut()} className="px-3 py-2 rounded bg-neutral-200">
              Sign out
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Today’s Tasks</div>
          <div className="text-4xl font-bold mt-2">8</div>
          <div className="text-xs text-neutral-500 mt-1">3 urgent</div>
        </div>

        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Unread Emails</div>
          <div className="text-4xl font-bold mt-2">24</div>
          <div className="text-xs text-neutral-500 mt-1">Gmail + Outlook</div>
        </div>

        <div className="rounded border p-4">
          <div className="text-sm text-neutral-500">Meetings</div>
          <div className="text-4xl font-bold mt-2">5</div>
          <div className="text-xs text-neutral-500 mt-1">Next 24 hours</div>
        </div>
      </section>

      <section className="rounded border p-4">
        <div className="font-medium mb-2">Quick Actions</div>
        <div className="flex gap-2">
          <Link className="px-3 py-2 rounded bg-indigo-600 text-white" href="#">
            Schedule client recap
          </Link>
          <Link className="px-3 py-2 rounded bg-neutral-200" href="#">
            Draft vendor update
          </Link>
        </div>
      </section>
    </main>
  );
}
