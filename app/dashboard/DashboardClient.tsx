"use client";

import { useEffect, useState } from "react";

type UnreadResp = { connected: boolean; unread: number };

export default function DashboardClient() {
  const [unread, setUnread] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const r = await fetch("/api/gmail/unread", { cache: "no-store" });
        const data: UnreadResp = await r.json();
        if (!isMounted) return;
        setUnread(data.unread);
        setConnected(data.connected);
      } catch {
        if (isMounted) {
          setUnread(0);
          setConnected(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      <div className="rounded-lg border p-6">
        <div className="text-sm text-gray-500">Today’s Tasks</div>
        <div className="text-4xl font-bold mt-2">8</div>
        <div className="text-xs text-gray-400">3 urgent</div>
      </div>

      <div className="rounded-lg border p-6">
        <div className="text-sm text-gray-500">Unread Emails</div>
        <div className="text-4xl font-bold mt-2">
          {loading ? "—" : unread ?? 0}
        </div>
        <div className="text-xs text-gray-400">
          {connected === false ? "Connect Gmail" : "Gmail + Outlook"}
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <div className="text-sm text-gray-500">Meetings</div>
        <div className="text-4xl font-bold mt-2">5</div>
        <div className="text-xs text-gray-400">Next 24 hours</div>
      </div>
    </div>
  );
}
