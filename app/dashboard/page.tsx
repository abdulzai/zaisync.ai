'use client';
import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const [connected, setConnected] = useState(false);

  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Aurora EA — Dashboard</h1>

      <Card className="max-w-xl">
        <CardContent>
          <p className="mb-4">
            If you can see this, the <code>/dashboard</code> route is working.
          </p>

          <div className="space-x-2">
            <Button onClick={() => setConnected(v => !v)}>
              {connected ? 'Disconnect' : 'Connect Gmail/Outlook'}
            </Button>
            <span className="text-sm text-gray-500 align-middle">
              Status: {connected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
