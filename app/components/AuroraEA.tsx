'use client';

import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
const { data: session } = useSession();
const [connected, setConnected] = useState(false);

useEffect(() => {
  // Check if Gmail API returns a successful connection
  fetch("/api/gmail/unread")
    .then(res => res.json())
    .then(data => setConnected(data.connected))
    .catch(() => setConnected(false));
}, []);

export default function AuroraEA() {
  const [connected, setConnected] = useState(false);

  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Aurora EA</h1>
      <Card>
        <CardContent className="p-4">
          <p className="mb-4">
            Enterprise-secure, human-in-the-loop executive assistant.
          </p>
          <Button onClick={() => setConnected(!connected)}>
            {connected ? 'Disconnect' : 'Connect Gmail/Outlook'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
