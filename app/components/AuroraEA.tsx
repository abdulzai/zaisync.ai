'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AuroraEA() {
  const { data: session } = useSession();

  // Gmail connection status + unread count from our API
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let ignore = false;
    async function checkGmail() {
      try {
        const r = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const j = await r.json();
        if (!ignore) {
          setGmailConnected(Boolean(j.connected));
          setUnread(typeof j.unread === 'number' ? j.unread : 0);
        }
      } catch {
        if (!ignore) {
          setGmailConnected(false);
          setUnread(0);
        }
      }
    }
    checkGmail();
    const id = setInterval(checkGmail, 30_000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Today’s Tasks</div>
          <div className="text-4xl font-bold mt-2">8</div>
          <div className="text-xs text-gray-400 mt-1">3 urgent</div>
        </div>

        {/* Unread Emails + connect pill */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Unread Emails</div>

            {/* Top-right small Connect / Reconnect button */}
            {gmailConnected ? (
              <a
                href="/api/auth/signin/google"
                className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
              >
                Reconnect Gmail
              </a>
            ) : (
              <a
                href="/api/auth/signin/google"
                className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
              >
                Connect Gmail
              </a>
            )}
          </div>

          <div className="text-4xl font-bold mt-2">{unread}</div>
          <div className="text-xs text-gray-400 mt-1">
            {gmailConnected ? 'Gmail connected' : 'Not connected'}
          </div>
        </div>

        {/* Meetings */}
        <div className="rounded-lg border p-4">
          <div className="text-sm text-gray-500">Meetings</div>
          <div className="text-4xl font-bold mt-2">5</div>
          <div className="text-xs text-gray-400 mt-1">Next 24 hours</div>
        </div>
      </div>

      {/* Quick Actions row (keeps your two existing buttons) */}
      <div className="flex gap-3">
        <a
          href="/api/ai/recap" // or keep your existing target for the blue button
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Schedule client recap
        </a>

        <a
          href="/api/approve"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Draft vendor update
        </a>

        {/* Optional Outlook placeholder; hide until Entra ID is ready */}
        {/* <a
          href="/api/auth/signin/azure-ad"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Connect Outlook
        </a> */}
      </div>
    </div>
  );
}
