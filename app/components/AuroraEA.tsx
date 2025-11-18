'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

type GmailStatus = {
  connected: boolean;
  unread?: number;
};

export default function AuroraEA() {
  const { data: session } = useSession();

  // Gmail card state
  const [gmailConnected, setGmailConnected] = useState(false);
  const [unread, setUnread] = useState<number | null>(null);

  // Recap modal state
  const [recapText, setRecapText] = useState<string | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapError, setRecapError] = useState<string | null>(null);

  // ---- GMAIL UNREAD STATUS ----
  useEffect(() => {
    let ignore = false;

    async function loadGmailStatus() {
      try {
        const res = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const json: GmailStatus = await res.json();

        if (!ignore) {
          setGmailConnected(Boolean(json.connected));
          setUnread(
            typeof json.unread === 'number'
              ? json.unread
              : 0
          );
        }
      } catch {
        if (!ignore) {
          setGmailConnected(false);
          setUnread(0);
        }
      }
    }

    loadGmailStatus();
    return () => {
      ignore = true;
    };
  }, []);

  // ---- AI CLIENT RECAP ----
  async function handleGenerateRecap() {
    setRecapError(null);
    setRecapLoading(true);

    try {
      // For now: fixed example bullets (later we can pull from Gmail / UI input)
      const bullets = [
        'Call with Intersect Power about SOC onboarding dates.',
        'Need to confirm PRC-028 scope and expectations.',
        'Send updated Statement of Work (SOW) by Friday.'
      ];

      const res = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bullets })
      });

      if (!res.ok) {
        let message = 'Error generating recap. Please try again.';
        try {
          const errJson = await res.json();
          if (errJson?.error) message = `Error from server: ${errJson.error}`;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const data = await res.json();
      const text: string = data.text || 'No recap generated.';

      setRecapText(text);
      setRecapOpen(true);
    } catch (err: any) {
      console.error(err);
      setRecapError(
        typeof err?.message === 'string'
          ? err.message
          : 'Error generating recap. Please try again.'
      );
      setRecapOpen(true);
    } finally {
      setRecapLoading(false);
    }
  }

  async function handleCopyRecap() {
    if (!recapText) return;
    try {
      await navigator.clipboard.writeText(recapText);
      // Optional: tiny feedback – we’ll keep it quiet for now
      // alert('Recap copied to clipboard');
    } catch (err) {
      console.error('Failed to copy recap:', err);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* GMAIL CARD */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Unread Emails
                </div>
                <div className="text-3xl font-bold mt-2">
                  {unread ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {gmailConnected ? 'Gmail connected' : 'Connect Gmail'}
                </div>
              </div>

              {!gmailConnected && (
                <Link href="/api/auth/signin/google">
                  <Button className="mt-2">
                    Connect Gmail
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MEETINGS PLACEHOLDER CARD */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  Meetings
                </div>
                <div className="text-3xl font-bold mt-2">0</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Next 24 hours
                </div>
              </div>

              <Button className="mt-2">
                Connect Outlook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateRecap}
            disabled={recapLoading}
          >
            {recapLoading ? 'Generating recap…' : 'Schedule client recap'}
          </Button>

          <Button>
            Draft vendor update
          </Button>
        </div>

        {/* LAST RECAP PREVIEW */}
        {recapText && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="text-xs font-semibold mb-1">
                Last recap
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {recapText}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RECAP MODAL */}
      {recapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white text-black max-w-xl w-full rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Client recap
            </h2>

            {recapError ? (
              <p className="text-sm text-red-600 mb-4">
                {recapError}
              </p>
            ) : (
              <pre className="whitespace-pre-wrap text-sm mb-4">
                {recapText}
              </pre>
            )}

            <div className="flex justify-end gap-2">
              {recapText && !recapError && (
                <Button
                  onClick={handleCopyRecap}
                  className="text-sm px-3 py-2"
                >
                  Copy
                </Button>
              )}

              <Button
                onClick={handleGenerateRecap}
                disabled={recapLoading}
                className="text-sm px-3 py-2"
              >
                {recapLoading ? 'Regenerating…' : 'Regenerate'}
              </Button>

              <Button
                onClick={() => setRecapOpen(false)}
                className="text-sm px-3 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
