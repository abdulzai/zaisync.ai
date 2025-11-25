"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuroraEA() {
  // Gmail / meetings basic stats
  const [unread, setUnread] = useState<number>(0);
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);
  const [meetings] = useState<number>(0); // placeholder until Outlook is wired

  // Recap state
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [recapModalOpen, setRecapModalOpen] = useState<boolean>(false);
  const [lastRecap, setLastRecap] = useState<string | null>(null);
  const [lastBullets, setLastBullets] = useState<string[]>([]);
  const [copyLabel, setCopyLabel] = useState<string>("Copy");

  // Load unread count + connection status on mount
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await fetch("/api/gmail/unread");
        if (!res.ok) return;

        const data = await res.json();
        setGmailConnected(!!data.connected);
        setUnread(typeof data.unread === "number" ? data.unread : 0);
      } catch (err) {
        console.error("Error loading Gmail unread info:", err);
        setGmailConnected(false);
        setUnread(0);
      }
    };

    loadUnread();
  }, []);

  // --- Recap pipeline helpers ---------------------------------------------

  // Call AI API to generate recap text from bullets
  const generateRecapFromBullets = async (bullets: string[]) => {
    if (!bullets || bullets.length === 0) return;

    setLoadingRecap(true);

    try {
      const res = await fetch("/api/ai/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets }),
      });

      if (!res.ok) {
        console.error("AI recap error:", await res.text());
        alert("Error generating recap. Please try again.");
        return;
      }

      const data = await res.json();
      setLastRecap(data.text || "");
      setRecapModalOpen(true);
    } catch (err) {
      console.error("AI recap error:", err);
      alert("Error generating recap. Please try again.");
    } finally {
      setLoadingRecap(false);
    }
  };

  // Step 1: Fetch recent Gmail messages -> bullets
  const handleScheduleRecap = async () => {
    setLoadingRecap(true);
    setCopyLabel("Copy");

    try {
      const res = await fetch("/api/gmail/messages");
      if (!res.ok) {
        console.error("Error from /api/gmail/messages:", await res.text());
        alert("Error fetching Gmail messages. Please try again.");
        return;
      }

      const data = await res.json();

      if (!data.connected) {
        alert("Please connect Gmail first, then try again.");
        return;
      }

      if (!data.bullets || data.bullets.length === 0) {
        alert(
          "No recent Gmail messages found to build a recap. Try sending yourself a test email and then click again."
        );
        return;
      }

      setLastBullets(data.bullets);
      await generateRecapFromBullets(data.bullets);
    } catch (err) {
      console.error("Error fetching Gmail messages:", err);
      alert("Error fetching Gmail messages. Please try again.");
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleCopyRecap = async () => {
    if (!lastRecap) return;
    try {
      await navigator.clipboard.writeText(lastRecap);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 1500);
    } catch (err) {
      console.error("Clipboard error:", err);
      alert("Could not copy to clipboard.");
    }
  };

  const handleRegenerateRecap = async () => {
    if (!lastBullets || lastBullets.length === 0) {
      alert("No previous Gmail messages to regenerate from.");
      return;
    }
    await generateRecapFromBullets(lastBullets);
  };

  // --- UI ------------------------------------------------------------------

  return (
    <div className="w-full px-4 py-8 space-y-8">
      {/* Top stats row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gmail / unread */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Unread Emails</div>
              <div className="text-3xl font-bold mt-2">{unread}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {gmailConnected ? "Gmail connected" : "Connect Gmail"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meetings placeholder */}
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
              onClick={() =>
                alert("Outlook integration will be wired up in the next phase.")
              }
            >
              Connect Outlook
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleScheduleRecap} disabled={loadingRecap}>
          {loadingRecap ? "Generating recap…" : "Schedule client recap"}
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            alert("Vendor update drafting will use the same pipeline next.")
          }
        >
          Draft vendor update
        </Button>
      </div>

      {/* Last recap section */}
      <div className="mt-6 border rounded-lg p-4 bg-muted/40">
        <div className="text-sm font-semibold mb-2">Last recap</div>
        <div className="text-sm whitespace-pre-line">
          {lastRecap
            ? lastRecap
            : "No recap generated yet. Click “Schedule client recap” to create one from your recent Gmail threads."}
        </div>

        {lastBullets.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Source bullets (from Gmail)
            </div>
            <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
              {lastBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Simple modal for recap preview */}
      {recapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black dark:bg-neutral-900 dark:text-neutral-50 max-w-2xl w-full mx-4 rounded-xl shadow-lg p-6">
            <div className="text-lg font-semibold mb-4">Client recap</div>

            <div className="border rounded-md p-3 h-80 overflow-y-auto text-sm whitespace-pre-line">
              {lastRecap}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCopyRecap}>
                {copyLabel}
              </Button>
              <Button onClick={handleRegenerateRecap} disabled={loadingRecap}>
                {loadingRecap ? "Generating…" : "Regenerate"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setRecapModalOpen(false)}
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
