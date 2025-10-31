"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

type GmailState = { connected: boolean; unread: number };

export default function DashboardClient() {
  const { status } = useSession();
  const [gmail, setGmail] = useState<GmailState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setGmail(null);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const r = await fetch("/api/gmail/unread", { cache: "no-store" });
        const j = (await r.json()) as GmailState;
        setGmail(j);
      } catch {
        setGmail(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  return (
    <main className="p-6 space-y-6">
      {/* cards row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks (placeholder) */}
        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-gray-500">Today’s Tasks</h2>
          <p className="text-4xl font-semibold mt-2">8</p>
          <p className="text-xs text-gray-400 mt-1">3 urgent</p>
        </div>

        {/* Unread Emails */}
        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-gray-500">Unread Emails</h2>

          {loading ? (
            <p className="text-sm mt-2">Checking Gmail…</p>
          ) : gmail?.connected ? (
            <>
              <p className="text-4xl font-semibold mt-2">{gmail.unread}</p>
              <p className="text-xs text-gray-400 mt-1">Gmail</p>
            </>
          ) : (
            <>
              <p className="text-sm mt-2">Not connected</p>
              <button
                className="mt-3 rounded-lg px-3 py-2 bg-blue-600 text-white"
                onClick={() => signIn("google")}
              >
                Connect Gmail
              </button>
            </>
          )}
        </div>

        {/* Meetings (placeholder) */}
        <div className="rounded-xl border p-6">
          <h2 className="text-sm text-gray-500">Meetings</h2>
          <p className="text-4xl font-semibold mt-2">5</p>
          <p className="text-xs text-gray-400 mt-1">Next 24 hours</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border p-6">
        <h3 className="text-sm text-gray-500 mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          <button className="rounded-lg px-3 py-2 bg-indigo-600 text-white">
            Schedule client recap
          </button>
          <button className="rounded-lg px-3 py-2 border">Draft vendor update</button>
        </div>
      </section>
    </main>
  );
}
