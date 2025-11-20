'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function AuroraEA() {
  const { data: session } = useSession();

  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);
  const [meetings] = useState<number>(0); // placeholder for Outlook phase
  const [loadingRecap, setLoadingRecap] = useState(false);
  const [lastRecap, setLastRecap] = useState<string | null>(null);
  const [showRecapModal, setShowRecapModal] = useState(false);

  // Load unread count + connection status
  useEffect(() => {
    let ignore = false;

    async function loadUnread() {
      try {
        const res = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const json = await res.json();
        if (!ignore) {
          setConnected(Boolean(json?.connected));
          setUnread(typeof json?.unread === 'number' ? json.unread : 0);
        }
      } catch {
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

  async function handleScheduleRecap() {
    setLoadingRecap(true);
    try {
      // 1) Get recent Gmail messages as bullets
      const msgRes = await fetch('/api/gmail/messages', { cache: 'no-store' });
      const msgJson = await msgRes.json();

      const bullets: string[] = Array.isArray(msgJson?.bullets)
        ? msgJson.bullets
        : [];

      if (!msgJson.connected) {
        alert('Gmail is not connected. Please reconnect from the dashboard.');
        return;
      }

      if (!bullets.length) {
        alert(
          'No recent Gmail messages found to build a recap. Try sending yourself a test email and then click again.'
        );
        return;
      }

      // 2) Call AI recap endpoint with those bullets
      const recapRes = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets }),
      });

      const recapJson = await recapRes.json();

      if (!recapRes.ok || recapJson.error) {
        alert('Error generating recap. Please try again.');
        return;
      }

      const text: string = recapJson.text ?? '';
      setLastRecap(text);
      setShowRecapModal(true);
    } catch (err) {
      console.error('Schedule recap error:', err);
      alert('Unexpected error generating recap.');
    } finally {
      setLoadingRecap(false);
    }
  }

  async function handleCopy() {
    if (!lastRecap) return;
    try {
      await navigator.clipboard.writeText(lastRecap);
      alert('Recap copied to clipboard.');
    } catch {
      alert('Unable to copy. Please select and copy manually.');
    }
  }

  async function handleRegenerate() {
    // Just reuse the main handler – it will refetch messages & regenerate
    await handleScheduleRecap();
  }

  return (
    <div className="space-y-8">
      {/* Top cards */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Unread Emails</div>
            <div className="text-3xl font-bold mt-2">{unread ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {connected ? 'Gmail connected' : 'Connect Gmail'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Meetings</div>
            <div className="text-3xl font-bold mt-2">{meetings}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Next 24 hours
            </div>
          </div>

          <Button
            // Outlook hook will go here in a next phase
            onClick={() => alert('Outlook integration coming soon.')}
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

      {/* Inline last recap card */}
      {lastRecap && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="text-sm font-semibold text-muted-foreground">
              Last recap
            </div>
            <pre className="whitespace-pre-wrap text-sm font-sans">
              {lastRecap}
            </pre>
            <div className="flex gap-2">
              <Button onClick={handleCopy}>Copy</Button>
              <Button onClick={handleRegenerate} disabled={loadingRecap}>
                {loadingRecap ? 'Regenerating…' : 'Regenerate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple modal overlay using the same content, if you still have it in your layout.
          If you decide you only want the inline card, you can remove this block. */}
      {showRecapModal && lastRecap && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Client recap</h2>
            <div className="max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {lastRecap}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCopy}>Copy</Button>
              <Button onClick={handleRegenerate} disabled={loadingRecap}>
                {loadingRecap ? 'Regenerating…' : 'Regenerate'}
              </Button>
              <Button
                onClick={() => setShowRecapModal(false)}
                // no variant to avoid the earlier type error
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
