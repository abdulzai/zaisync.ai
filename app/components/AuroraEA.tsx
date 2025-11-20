'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

type GmailUnreadResponse = {
  connected: boolean;
  unread: number;
};

type GmailMessagesResponse = {
  connected: boolean;
  bullets: string[];
  error?: string;
};

type RecapResponse = {
  text?: string;
  error?: string;
};

export default function AuroraEA() {
  const { data: session } = useSession();

  const [gmailConnected, setGmailConnected] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);

  const [loadingRecap, setLoadingRecap] = useState(false);
  const [lastRecap, setLastRecap] = useState<string | null>(null);

  // --- Load Gmail unread + connection status on mount ---
  useEffect(() => {
    let ignore = false;

    async function loadStatus() {
      try {
        const res = await fetch('/api/gmail/unread', { cache: 'no-store' });
        if (!res.ok) return;

        const json: GmailUnreadResponse = await res.json();
        if (ignore) return;

        setGmailConnected(Boolean(json.connected));
        setUnread(typeof json.unread === 'number' ? json.unread : 0);
      } catch {
        if (!ignore) {
          setGmailConnected(false);
          setUnread(0);
        }
      }
    }

    loadStatus();

    // Restore last recap from localStorage (nice to have)
    try {
      const stored = window.localStorage.getItem('aurora-last-recap');
      if (stored) setLastRecap(stored);
    } catch {
      // ignore
    }

    return () => {
      ignore = true;
    };
  }, []);

  // --- Handlers ---

  const handleConnectGmail = () => {
    // Simple redirect to NextAuth Google sign-in
    window.location.href = '/api/auth/signin/google';
  };

  const handleScheduleRecap = async () => {
    setLoadingRecap(true);
    try {
      // 1) Get recent Gmail messages as bullets
      const msgRes = await fetch('/api/gmail/messages', { cache: 'no-store' });
      if (!msgRes.ok) {
        const txt = await msgRes.text();
        alert(`Error fetching Gmail messages: ${txt || msgRes.status}`);
        return;
      }

      const msgJson: GmailMessagesResponse = await msgRes.json();

      if (!msgJson.connected) {
        alert('Connect Gmail first, then try again.');
        return;
      }

      if (!msgJson.bullets || msgJson.bullets.length === 0) {
        alert(
          'No recent Gmail messages found to build a recap. Try sending yourself a test email and then click again.'
        );
        return;
      }

      // 2) Send bullets to AI recap endpoint
      const recapRes = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets: msgJson.bullets }),
      });

      const recapJson: RecapResponse = await recapRes.json();

      if (!recapRes.ok || !recapJson.text) {
        alert(recapJson.error || 'Error generating recap. Please try again.');
        return;
      }

      setLastRecap(recapJson.text);

      // Persist so it survives refresh
      try {
        window.localStorage.setItem('aurora-last-recap', recapJson.text);
      } catch {
        // ignore
      }
    } catch (err: any) {
      alert(
        `Error generating recap. ${
          typeof err?.message === 'string' ? err.message : ''
        }`
      );
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleCopyRecap = async () => {
    if (!lastRecap) return;
    try {
      await navigator.clipboard.writeText(lastRecap);
      alert('Recap copied to clipboard.');
    } catch {
      alert('Unable to copy to clipboard. You can still select + copy manually.');
    }
  };

  // --- Render ---

  return (
    <div className="space-y-8">
      {/* Gmail card */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Unread Emails</div>
            <div className="text-3xl font-bold mt-2">{unread ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {gmailConnected ? 'Gmail connected' : 'Connect Gmail'}
            </div>
          </div>

          {!gmailConnected && (
            <Button className="mt-2" onClick={handleConnectGmail}>
              Connect Gmail
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Outlook card (placeholder for next phase) */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Meetings</div>
            <div className="text-3xl font-bold mt-2">0</div>
            <div className="text-xs text-muted-foreground mt-1">
              Next 24 hours
            </div>
          </div>

          <Button
            onClick={() =>
              alert('Outlook integration will be wired up in the next phase.')
            }
          >
            Connect Outlook
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleScheduleRecap} disabled={loadingRecap}>
          {loadingRecap ? 'Generating recap…' : 'Schedule client recap'}
        </Button>

        <Button
          onClick={() =>
            alert('Vendor update drafting will use the same pipeline next.')
          }
        >
          Draft vendor update
        </Button>
      </div>

      {/* Last recap display */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Last recap
          </div>

          {lastRecap ? (
            <>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {lastRecap}
              </pre>
              <Button onClick={handleCopyRecap}>Copy recap</Button>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No recap generated yet. Click &ldquo;Schedule client recap&rdquo; to
              create one from your recent Gmail threads.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
