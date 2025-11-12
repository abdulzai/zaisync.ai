'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function AuroraEA() {
  const { data: session } = useSession();

  const [gmailConnected, setGmailConnected] = useState(false);
  const [unread, setUnread] = useState<number>(0);

  const [msConnected, setMsConnected] = useState(false);
  const [meetings, setMeetings] = useState<number>(0);

  useEffect(() => {
    // Gmail unread
    (async () => {
      try {
        const r = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const j = await r.json();
        setGmailConnected(Boolean(j?.connected));
        setUnread(typeof j?.unread === 'number' ? j.unread : 0);
      } catch {
        setGmailConnected(false);
        setUnread(0);
      }
    })();

    // Outlook meetings
    (async () => {
      try {
        const r = await fetch('/api/outlook/meetings', { cache: 'no-store' });
        const j = await r.json();
        setMsConnected(Boolean(j?.connected));
        setMeetings(typeof j?.meetings === 'number' ? j.meetings : 0);
      } catch {
        setMsConnected(false);
        setMeetings(0);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Gmail card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Unread Emails</div>
              <div className="text-3xl font-bold mt-2">{unread}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {gmailConnected ? 'Gmail connected' : 'Connect Gmail'}
              </div>
            </div>
            {!gmailConnected && (
              <Link href="/api/auth/signin/google">
                <Button className="mt-2">Connect Gmail</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outlook card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Meetings</div>
              <div className="text-3xl font-bold mt-2">{meetings}</div>
              <div className="text-xs text-muted-foreground mt-1">Next 24 hours</div>
            </div>
            {!msConnected && (
              <Link href="/api/auth/signin/azure-ad">
                <Button className="mt-2">Connect Outlook</Button>
              </Link>
            )}
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
