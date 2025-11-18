'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function AuroraEA() {
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);
  const [hasMail, setHasMail] = useState<boolean | null>(null);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [unreadRes, summaryRes] = await Promise.all([
          fetch('/api/gmail/unread', { cache: 'no-store' }),
          fetch('/api/gmail/summary', { cache: 'no-store' }),
        ]);

        const unreadJson = await unreadRes.json();
        const summaryJson = await summaryRes.json();

        if (ignore) return;

        // Unread card
        setConnected(Boolean(unreadJson?.connected));
        setUnread(
          typeof unreadJson?.unread === 'number' ? unreadJson.unread : 0
        );

        // Latest email summary
        setHasMail(Boolean(summaryJson?.hasMail));
        setSummary(
          typeof summaryJson?.snippet === 'string' ? summaryJson.snippet : ''
        );
      } catch (e) {
        if (ignore) return;
        setConnected(false);
        setUnread(0);
        setHasMail(false);
        setSummary('');
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const unreadDisplay = unread ?? 0;

  return (
    <div className="space-y-6 p-6">
      {/* Gmail / Unread Emails */}
      <Card className="mb-4">
        <CardContent className="p-6 flex items-start justify-between gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Unread Emails</div>
            <div className="text-3xl font-bold mt-2">{unreadDisplay}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {connected ? 'Gmail connected' : 'Connect Gmail'}
            </div>
          </div>

          {!connected && (
            <Link href="/api/auth/signin/google">
              <Button className="mt-2">Connect Gmail</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Latest email summary (only when there is mail) */}
      {connected && hasMail && summary && (
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              Latest email (Gmail)
            </div>
            <p className="text-sm whitespace-pre-line">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Meetings / Outlook placeholder */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Meetings</div>
            <div className="text-3xl font-bold mt-2">0</div>
            <div className="text-xs text-muted-foreground mt-1">
              Next 24 hours
            </div>
          </div>
          <Button>Connect Outlook</Button>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="flex gap-3 pt-2">
        <Button>Schedule client recap</Button>
        <Button>Draft vendor update</Button>
      </div>
    </div>
  );
}
