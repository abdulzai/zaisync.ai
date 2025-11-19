'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function AuroraEA() {
  const { data: session } = useSession();
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);
  const [lastRecap, setLastRecap] = useState<string | null>(null);
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load unread count + connection status
  useEffect(() => {
    let ignore = false;

    async function loadUnread() {
      try {
        const res = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const json = await res.json();

        if (!ignore) {
          setConnected(Boolean(json?.connected));
          setUnread(
            typeof json?.unread === 'number'
              ? json.unread
              : 0
          );
        }
      } catch (err) {
        if (!ignore) {
          setConnected(false);
          setUnread(0);
        }
      }
    }

    loadUnread();
    return () => {
      ignore = true;
    };
  }, []);

  // Phase 2: pull recent Gmail messages, turn into bullets, call AI recap
  async function handleScheduleRecap() {
    setLoadingRecap(true);

    try {
      // 1) Get recent messages from our new API
      const msgRes = await fetch('/api/gmail/messages', { cache: 'no-store' });
      const msgJson = await msgRes.json();

      if (!msgRes.ok || !msgJson.connected) {
        throw new Error(msgJson.error ?? 'Unable to read Gmail messages.');
      }

      const messages: any[] = msgJson.messages ?? [];

      if (!messages.length) {
        window.alert('No recent Gmail messages found to build a recap.');
        return;
      }

      // 2) Turn messages into recap bullets for the AI
      const bullets = messages.slice(0, 5).map((m) => {
        const from =
          (m.from ?? '')
            .split('<')[0]
            .replace(/"/g, '')
            .trim() || 'Client';

        const subject = m.subject || 'No subject';
        return `${from} – ${subject}`;
      });

      // 3) Call the recap API with those bullets
      const recapRes = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets }),
      });

      const recapJson = await recapRes.json();

      if (!recapRes.ok) {
        throw new Error(recapJson.error ?? 'Failed to generate recap.');
      }

      setLastRecap(recapJson.text);
    } catch (err) {
      console.error('RECAP ERROR', err);
      window.alert('Error generating recap. Please try again.');
    } finally {
      setLoadingRecap(false);
    }
  }

  async function handleCopyRecap() {
    if (!lastRecap) return;
    try {
      await navigator.clipboard.writeText(lastRecap);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('COPY ERROR', err);
      window.alert('Could not copy recap to clipboard.');
    }
  }

  return (
    <div className="space-y-8">
      {/* Top cards: Gmail + Outlook */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Unread Emails</div>
              <div className="text-3xl font-bold mt-2">{unread ?? 0}</div>
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

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Meetings</div>
              <div className="text-3xl font-bold mt-2">0</div>
              <div className="text-xs text-muted-foreground mt-1">
                Next 24 hours
              </div>
            </div>

            <Link href="/api/auth/signin/azure-ad">
              <Button className="mt-2">Connect Outlook</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleScheduleRecap}
          disabled={loadingRecap || !connected}
        >
          {loadingRecap ? 'Generating recap…' : 'Schedule client recap'}
        </Button>
        <Button variant="outline">
          Draft vendor update
        </Button>
      </div>

      {/* Recap section */}
      <Card className="mt-4">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Last recap
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRecap}
              disabled={!lastRecap}
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </Button>
          </div>

          <div className="border-t border-border pt-3">
            {lastRecap ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {lastRecap}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recap generated yet. Click &quot;Schedule client recap&quot; to
                create one from your recent Gmail threads.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
