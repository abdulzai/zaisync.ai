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

  useEffect(() => {
    let ignore = false;
    async function load() {
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
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
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
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button>Schedule client recap</Button>
        <Button variant="outline">Draft vendor update</Button>
      </div>
    </div>
  );
}
