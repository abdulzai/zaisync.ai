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
  const [recapLoading, setRecapLoading] = useState(false);

  // Load Gmail unread + summary
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

        setConnected(Boolean(unreadJson?.connected));
        setUnread(
          typeof unreadJson?.unread === 'number' ? unreadJson.unread : 0
        );

        setHasMail(Boolean(summaryJson?.hasMail));
        setSummary(
          typeof summaryJson?.snippet === 'string' ? summaryJson.snippet : ''
        );
      } catch {
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

  // === AI Recap handler ===
    async function handleScheduleRecap() {
    const input = prompt(
      'Paste client call / meeting bullet points (separate with ";" )'
    );
    if (!input) return;

    const bullets = input
      .split(';')
      .map((b) => b.trim())
      .filter(Boolean);

    if (bullets.length === 0) return;

    try {
      setRecapLoading(true);
      const res = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(`Error from server: ${json?.error || 'Unknown error'}`);
        return;
      }

      const text = json?.text || 'No recap generated.';
      alert(text);
    } catch {
      alert('Network error calling /api/ai/recap.');
    } finally {
      setRecapLoading(false);
    }
  }

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
        <Button onClick={handleScheduleRecap} disabled={recapLoading}>
          {recapLoading ? 'Generating recap…' : 'Schedule client recap'}
        </Button>
        <Button>Draft vendor update</Button>
      </div>
    </div>
  );
}
