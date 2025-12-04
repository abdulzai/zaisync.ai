"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import FeedbackModal from "./FeedbackModal";

const DEMO_BULLETS = [
  "Client recap: Intersect Power – follow-up on SOC onboarding timeline and QA on incident runbooks.",
  "Vendor: MSSP – finalize monitoring scope for BESS sites before year-end.",
  "Internal: Radian OT team – align on 2026 roadmap and hiring priorities.",
  "Client: DESRI – update on CIP med support transition and open RFIs.",
  "Finance: Budget checkpoint for AI tooling spend and MSS renewals.",
];

export default function AuroraEA() {
 // Gmail / meetings basic stats
const [unread, setUnread] = useState<number>(0);
const [gmailConnected, setGmailConnected] = useState<boolean>(false);
const [meetings, setMeetings] = useState<number>(0);
const [loadingMeetings, setLoadingMeetings] = useState<boolean>(false);

// Early-access tester toggle
const [useDemoData, setUseDemoData] = useState<boolean>(false);

// Recap / vendor state
const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
const [recapModalOpen, setRecapModalOpen] = useState<boolean>(false);
const [lastRecap, setLastRecap] = useState<string | null>(null);
const [lastBullets, setLastBullets] = useState<string[]>([]);
const [copyLabel, setCopyLabel] = useState<string>("Copy");

const [loadingVendor, setLoadingVendor] = useState<boolean>(false);
const [vendorDraft, setVendorDraft] = useState<string | null>(null);
const [vendorModalOpen, setVendorModalOpen] = useState<boolean>(false);

// Calendar preview modal
const [calendarModalOpen, setCalendarModalOpen] = useState<boolean>(false);
const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Load unread count + meetings + connection status
useEffect(() => {
  const loadData = async () => {
    // Demo mode: fake data, no network calls
    if (useDemoData) {
      setGmailConnected(true);
      setUnread(18749);
      setMeetings(3);
      return;
    }

    // Real Gmail unread
    try {
      const res = await fetch("/api/gmail/unread");
      if (res.ok) {
        const data = await res.json();
        setGmailConnected(!!data.connected);
        setUnread(typeof data.unread === "number" ? data.unread : 0);
      } else {
        setGmailConnected(false);
        setUnread(0);
      }
    } catch (err) {
      console.error("Error loading Gmail unread info:", err);
      setGmailConnected(false);
      setUnread(0);
    }

    // Real meetings (Google Calendar)
    try {
      setLoadingMeetings(true);
      const res = await fetch("/api/google/calendar");
      if (res.ok) {
        const data = await res.json();
        const count = Array.isArray(data.meetings) ? data.meetings.length : 0;
        setMeetings(count);
      } else {
        setMeetings(0);
      }
    } catch (err) {
      console.error("Error loading meetings:", err);
      setMeetings(0);
    } finally {
      setLoadingMeetings(false);
    }
  };

  loadData();
}, [useDemoData]);

  // --- Shared recap pipeline helper ----------------------------------------

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

  // --- Handlers ------------------------------------------------------------

  // Step 1: Fetch recent Gmail messages -> bullets (or demo data)
  const handleScheduleRecap = async () => {
    setLoadingRecap(true);
    setCopyLabel("Copy");

    try {
      let bullets: string[] = [];

      if (useDemoMode) {
        bullets = DEMO_BULLETS;
      } else {
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

        bullets = data.bullets;
      }

      setLastBullets(bullets);
      await generateRecapFromBullets(bullets);
    } catch (err) {
      console.error("Error fetching Gmail messages:", err);
      alert("Error fetching Gmail messages. Please try again.");
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleVendorUpdate = async () => {
    try {
      setLoadingVendor(true);
      setVendorCopyLabel("Copy");

      let bullets = lastBullets;

      if (!bullets || bullets.length === 0) {
        if (useDemoMode) {
          bullets = DEMO_BULLETS;
        } else {
          const emailsRes = await fetch("/api/gmail/messages");
          const emailsData = await emailsRes.json();

          if (!emailsData.connected || !emailsData.bullets?.length) {
            alert(
              "No recent Gmail messages found to build a vendor update. Try sending yourself a test email and then click again."
            );
            return;
          }

          bullets = emailsData.bullets;
          setLastBullets(emailsData.bullets);
        }
      }

      const res = await fetch("/api/ai/vendor-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("Vendor update error:", errJson);
        alert("Could not generate vendor update. Please try again.");
        return;
      }

      const json = await res.json();
      setVendorDraft(json.vendorUpdate || "");
      setVendorModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating the vendor update.");
    } finally {
      setLoadingVendor(false);
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

  const handleCopyVendor = async () => {
    if (!vendorDraft) return;
    try {
      await navigator.clipboard.writeText(vendorDraft);
      setVendorCopyLabel("Copied!");
      setTimeout(() => setVendorCopyLabel("Copy"), 1500);
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
    <>
      <div className="space-y-6 md:space-y-8">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Daily control room
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Turn noisy Gmail + calendar chaos into clean briefs you can paste
              straight into Slack, Teams, or email.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Early access · v0.1
            </span>
            <Button variant="outline" onClick={() => setFeedbackOpen(true)}>
              Give feedback
            </Button>
          </div>
        </div>

        {/* Top stats row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Gmail / unread */}
          <Card className="border-white/10 bg-white/5/10 bg-gradient-to-br from-white/5 via-white/0 to-emerald-500/5 backdrop-blur-sm rounded-2xl shadow-lg">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-zinc-400">
                  Unread Emails
                </div>
                <div className="text-4xl font-semibold mt-2 tracking-tight">
                  {unread}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {gmailConnected ? "Gmail connected" : "Connect Gmail"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {gmailConnected ? null : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = "/api/auth/signin/google";
                    }}
                  >
                    Connect Gmail
                  </Button>
                )}
                <label className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <input
                    type="checkbox"
                    className="h-3 w-3 rounded border-zinc-500/50 bg-black/40"
                    checked={demoMode}
                    onChange={(e) => setDemoMode(e.target.checked)}
                  />
                  <span>Use demo data (for testers)</span>
                </label>
              </div>
            </CardContent>
          </Card>

         {/* Meetings module */}
<Card className="border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg">
  <CardContent className="p-6 flex items-center justify-between">
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-zinc-400 flex items-center gap-2">
        <span>Meetings</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          coming soon
        </span>
      </div>

      <div className="text-4xl font-semibold mt-1 tracking-tight">
        {meetings}
      </div>

      <div className="text-xs text-zinc-500">
        Next 24 hours (Google Calendar)
      </div>
    </div>

    <Button
  className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-2"
  onClick={() => setCalendarModalOpen(true)}
>
  Preview calendar view
</Button>
  </CardContent>
</Card>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleScheduleRecap} disabled={loadingRecap}>
            {loadingRecap ? "Generating recap…" : "Schedule client recap"}
          </Button>

          <Button onClick={handleVendorUpdate} disabled={loadingVendor}>
            {loadingVendor ? "Drafting vendor update…" : "Draft vendor update"}
          </Button>
        </div>

        {/* Last recap / vendor section */}
        <div className="mt-2 rounded-2xl border border-white/10 bg-white/5/10 backdrop-blur-sm px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Last recap / vendor update</div>
            {lastRecap || vendorDraft ? (
              <span className="text-[11px] text-zinc-500">
                Generated from recent Gmail threads
              </span>
            ) : null}
          </div>

          <div className="text-sm whitespace-pre-line space-y-4">
            <div>
              <div className="font-semibold text-xs uppercase text-zinc-400 mb-1">
                Client recap
              </div>
              {lastRecap
                ? lastRecap
                : 'No recap generated yet. Click "Schedule client recap" to create one from your recent Gmail threads.'}
            </div>

            {vendorDraft && (
              <div className="pt-3 border-t border-white/5">
                <div className="font-semibold text-xs uppercase text-zinc-400 mb-1">
                  Vendor update draft
                </div>
                {vendorDraft}
              </div>
            )}
          </div>

          {lastBullets.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-zinc-400 mb-1">
                Source bullets (from Gmail)
              </div>
              <ul className="list-disc pl-4 text-xs text-zinc-500 space-y-1">
                {lastBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recap modal */}
      {recapModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black dark:bg-neutral-900 dark:text-neutral-50 max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Client recap</div>
                <div className="text-xs text-zinc-500 mt-1">
                  Paste directly into email, Slack, or Teams.
                </div>
              </div>
              <button
                onClick={() => setRecapModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>
            
{/* Calendar Modal */}
{calendarModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-xl w-full mx-4 p-6 shadow-lg">
      <div className="text-lg font-semibold mb-4">Next 24 hours — Calendar</div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        Calendar integration is coming soon. In early access, this is just a
        preview of where your upcoming meetings timeline will live.
      </p>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center justify-between">
          <span className="text-zinc-400">09:00</span>
          <span>Stand-up / Daily check-in</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-zinc-400">13:00</span>
          <span>Client touchpoint (placeholder)</span>
        </li>
        <li className="flex items-center justify-between">
          <span className="text-zinc-400">16:30</span>
          <span>Wrap-up / planning (placeholder)</span>
        </li>
      </ul>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => setCalendarModalOpen(false)}>
          Close
        </Button>
      </div>
    </div>
  </div>
)}
            <div className="border rounded-xl p-3 h-80 overflow-y-auto text-sm whitespace-pre-line bg-black/5 dark:bg-black/40">
              {lastRecap}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCopyRecap}>
                {copyLabel}
              </Button>
              <Button onClick={handleRegenerateRecap} disabled={loadingRecap}>
                {loadingRecap ? "Generating…" : "Regenerate"}
              </Button>
              <Button variant="outline" onClick={() => setRecapModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black dark:bg-neutral-900 dark:text-neutral-50 max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Vendor update</div>
                <div className="text-xs text-zinc-500 mt-1">
                  Clear, 1–2 scrolls. Ready to paste into your vendor thread.
                </div>
              </div>
              <button
                onClick={() => setVendorModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="border rounded-xl p-3 h-80 overflow-y-auto text-sm whitespace-pre-line bg-black/5 dark:bg-black/40">
              {vendorDraft}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCopyVendor}>
                {vendorCopyLabel}
              </Button>
              <Button
                onClick={handleVendorUpdate}
                disabled={loadingVendor}
              >
                {loadingVendor ? "Generating…" : "Regenerate"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setVendorModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
