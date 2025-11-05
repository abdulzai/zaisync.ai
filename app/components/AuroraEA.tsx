'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

type UnreadResponse = { connected: boolean; unread: number };

export default function AuroraEA() {
  const { data: session } = useSession();
  const [unread, setUnread] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/gmail/unread', { cache: 'no-store' });
        const data: UnreadResponse = await res.json();
        if (!ignore) {
          setUnread(data?.unread ?? 0);
          setConnected(Boolean(data?.connected));
        }
      } catch {
        if (!ignore) {
          setUnread(0);
          setConnected(false);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 60_000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [session?.user?.email]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div>Today’s Tasks</div>
          <div className="text-4xl font-bold">8</div>
          <div className="text-sm text-muted-foreground">3 urgent</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div>Unread Emails</div>
          <div className="text-4xl font-bold">{loading ? '—' : unread}</div>
          <div className="text-sm text-muted-foreground">
            {connected ? 'Gmail connected' : 'Connect Gmail'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div>Meetings</div>
          <div className="text-4xl font-bold">5</div>
          <div className="text-sm text-muted-foreground">Next 24 hours</div>
        </CardContent>
      </Card>

      <div className="md:col-span-3 flex gap-3">
        <Button>Schedule client recap</Button>
        <Button variant="secondary">Draft vendor update</Button>
      </div>
    </div>
  );
}
