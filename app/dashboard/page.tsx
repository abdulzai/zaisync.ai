'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [connected, setConnected] = useState(false);

  // Consider "connected" if a session exists
  useEffect(() => {
    setConnected(status === 'authenticated');
  }, [status]);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aurora EA — Dashboard</h1>
        <div className="flex gap-2">
          {status !== 'authenticated' ? (
            <>
              <Button variant="secondary" onClick={() => signIn('google')}>
                Connect Gmail
              </Button>
              <Button variant="secondary" onClick={() => signIn('azure-ad')}>
                Connect Outlook
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => signOut()}>
              Disconnect
            </Button>
          )}
          <Button onClick={() => setConnected((s) => !s)}>Fake Connect</Button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Today’s Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-gray-500 mt-1">3 urgent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unread Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-gray-500 mt-1">Gmail + Outlook</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-gray-500 mt-1">Next 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1
                            bg-green-50 text-green-700">
              <span className="size-2 rounded-full bg-green-500"></span>
              {connected ? 'Online' : 'Offline'}
            </div>
            {session?.user?.email && (
              <p className="text-xs text-gray-500 mt-2">
                Signed in as {session.user.email}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Inbox / Actions (examples without client names) */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Priority Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 hover:bg-gray-50">
              <p className="font-medium">Contract amendment</p>
              <p className="text-sm text-gray-500">Signature and updated terms requested.</p>
            </div>
            <div className="rounded-lg border p-3 hover:bg-gray-50">
              <p className="font-medium">Security review follow-up</p>
              <p className="text-sm text-gray-500">Notes attached from last call.</p>
            </div>
            <div className="rounded-lg border p-3 hover:bg-gray-50">
              <p className="font-medium">Weekly report export</p>
              <p className="text-sm text-gray-500">Ready for review.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full">Schedule client recap</Button>
            <Button className="w-full" variant="secondary">
              Draft vendor update
            </Button>
            <Button className="w-full" variant="ghost">
              Open settings
            </Button>
          </CardContent>
          <CardFooter className="text-xs text-gray-500">
            Tip: connect Gmail/Outlook for live data.
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
