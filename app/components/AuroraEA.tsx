'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function AuroraEA() {
  const { data: session } = useSession();

  // Gmail state
  const [connectedGmail, setConnectedGmail] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadUnread() {
      try {
        const res = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const json = await res.json();

        if (!ignore) {
          setConnectedGmail(Boolean(json?.connected));
          setUnread(typeof json?.unread === 'number' ? json.unread : 0);
        }
      } catch {
        if (!ignore) {
          setConnectedGmail(false);
          setUnread(0);
        }
      }
    }

    async function loadSummary() {
      try {
        const res = await fetch('/api/gmail/summary', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (!ignore) setSummary(json);
      } catch {
        // ignore errors for summary, card will just hide details
      }
    }

    loadUnread();
    loadSummary();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Gmail card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Unread Emails</div>
              <div className="text-3xl font-bold mt-2">{unread ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {connectedGmail ? 'Gmail connected' : 'Connect Gmail'}
              </div>

              {/* Latest email summary */}
              {summary?.connected && summary?.hasMail && (
                <div className="text-xs mt-3 max-w-md space-y-1">
                  <div>
                    <span className="font-semibold">From:</span>{' '}
                    <span>{summary.from}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Subject:</span>{' '}
                    <span>{summary.subject}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {summary.snippet}
                  </div>
                </div>
              )}
            </div>

            {/* Connect button if not connected */}
            {!connectedGmail && (
              <Link href="/api/auth/signin/google">
                <Button className="mt-2">Connect Gmail</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meetings/Outlook placeholder card stays simple for now */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Meetings</div>
              <div className="text-3xl font-bold mt-2">0</div>
              <div className="text-xs text-muted-foreground mt-1">
                Next 24 hours
              </div>
            </div>
            <Button className="mt-2">Connect Outlook</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button>Schedule client recap</Button>
        <Button>Draft vendor update</Button>
      </div>
    </div>
  );
}
