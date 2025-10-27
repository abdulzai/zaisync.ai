// app/dashboard/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const [connected, setConnected] = useState(false);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Aurora EA — Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/api/oauth/google">
            <Button variant="secondary">Connect Gmail</Button>
          </Link>
          <Link href="/api/oauth/ms">
            <Button variant="secondary">Connect Outlook</Button>
          </Link>
          <Button onClick={() => setConnected((s) => !s)}>
            {connected ? 'Disconnect' : 'Fake Connect'}
          </Button>
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
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-700">
              <span className="size-2 rounded-full bg-green-500"></span> Online
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inbox / Actions */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Priority Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 hover:bg-gray-50">
              <p className="font-medium">PO amendment from AEP</p>
              <p className="text-sm text-gray-500">Requested signature & updated terms.</p>
            </div>
            <div className="rounded-lg border p-3 hover:bg-gray-50">
              <p className="font-medium">DESRI CIP-003-9 check-in</p>
              <p className="text-sm text-gray-500">Notes attached from last call.</p>
            </div>
            <div className="rounded-lg border p-3 hover:bg-gray-50">
              <p className="font-medium">SOC dashboard weekly export</p>
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
            Pro tip: connect Gmail/Outlook for live data.
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
