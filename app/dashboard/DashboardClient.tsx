"use client";
import { useEffect, useState } from "react";

export default function DashboardClient() {
  const [unread, setUnread] = useState<number | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch("/api/gmail/unread", { cache: "no-store" });
        const j = await r.json();
        if (!ignore) {
          setUnread(j?.unread ?? 0);
          setConnected(Boolean(j?.connected));
        }
      } catch {
        if (!ignore) {
          setUnread(0);
          setConnected(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Render a minimal example you can style with your existing cards
  return (
    <div className="p-4">
      <div>Gmail: {connected ? "Connected" : "Not connected"}</div>
      <div>Unread emails: {unread ?? "…"}</div>
    </div>
  );
}
