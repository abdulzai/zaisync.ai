"use client";

import React, { useEffect, useState } from "react";

// RELATIVE imports so we don’t rely on @ alias
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

type Meeting = {
  id: string;
  title: string;
  start?: string;
  end?: string;
};

export default function AuroraEA() {
  // Gmail / meetings basic stats
  const [unread, setUnread] = useState<number>(0);
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);

  const [meetingsCount, setMeetingsCount] = useState<number>(0);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState<boolean>(false);
  const [showMeetingsList, setShowMeetingsList] = useState<boolean>(false);

  // Recap & vendor update state
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [recapModalOpen, setRecapModalOpen] = useState<boolean>(false);
  const [lastRecap, setLastRecap] = useState<string | null>(null);
  const [lastBullets, setLastBullets] = useState<string[]>([]);
  const [copyLabel, setCopyLabel] = useState<string>("Copy");

  const [loadingVendor, setLoadingVendor] = useState(false);
  const [vendorDraft, setVendorDraft] = useState<string | null>(null);
  const [vendorModalOpen, setVendorModalOpen] = useState<boolean>(false);
  const [copyVendorLabel, setCopyVendorLabel] = useState("Copy");

  // ---------------------------------------------------------------------------
  // Load unread + meetings on mount
  // ---------------------------------------------------------------------------
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

    const loadMeetings = async () => {
      try {
        setLoadingMeetings(true);
        const res = await fetch("/api/gmail/meetings");
        if (!res.ok) return;

        const data = await res.json();
        if (!data.connected) {
          setMeetingsCount(0);
          setMeetings([]);
          return;
        }

        const list: Meeting[] = data.meetings || [];
        setMeetings(list);
        setMeetingsCount(data.count ?? list.length ?? 0);
      } catch (err) {
        console.error("Error loading meetings:", err);
        setMeetingsCount(0);
        setMeetings([]);
      } finally {
        setLoadingMeetings(false);
      }
    };

    loadUnread();
    loadMeetings();
  }, []);

  // ---------------------------------------------------------------------------
  // Recap pipeline helpers
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Vendor update pipeline
  // ---------------------------------------------------------------------------
  const handleVendorUpdate = async () => {
    try {
      setLoadingVendor(true);
      setCopyVendorLabel("Copy");

      let bullets = lastBullets;

      if (!bullets || bullets.length === 0) {
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
      const text = json.vendorUpdate || "";
      setVendorDraft(text);
      setVendorModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating the vendor update.");
    } finally {
      setLoadingVendor(false);
    }
  };

  const handleCopyVendor = async () => {
    if (!vendorDraft) return;
    try {
      await navigator.clipboard.writeText(vendorDraft);
      setCopyVendorLabel("Copied!");
      setTimeout(() => setCopyVendorLabel("Copy"), 1500);
    } catch (err) {
      console.error("Clipboard error:", err);
      alert("Could not copy vendor update.");
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full px-4 py-8 space-y-8 max-w-6xl mx-auto">
      {/* Top stats row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gmail / unread */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                Unread Emails
              </div>
              <div className="text-3xl font-bold mt-1">{unread}</div>
              <div className="text-xs text-neutral-500 mt-1">
                {gmailConnected ? "Gmail connected" : "Connect Gmail"}
              </div>
            </div>

            {!gmailConnected && (
              <Button
                onClick={() => {
                  window.location.href = "/api/auth/signin/google";
                }}
              >
                Connect Gmail
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Meetings (from Google Calendar) */}
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                Meetings
              </div>
              <div className="text-3xl font-bold mt-1">
                {loadingMeetings ? "…" : meetingsCount}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Next 24 hours (Google Calendar)
              </div>
            </div>

            {meetingsCount > 0 && (
              <Button
                onClick={() => setShowMeetingsList((prev) => !prev)}
              >
                {showMeetingsList ? "Hide details" : "View details"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optional meetings list */}
      {showMeetingsList && meetingsCount > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-semibold mb-1">
              Upcoming meetings (next 24 hours)
            </div>
            <ul className="space-y-1 text-sm">
              {meetings.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between border-b border-neutral-200 last:border-b-0 py-1"
                >
                  <span className="truncate pr-4">{m.title}</span>
                  <span className="text-xs text-neutral-500">
                    {formatTime(m.start)}{" "}
                    {m.end ? `– ${formatTime(m.end)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleScheduleRecap} disabled={loadingRecap}>
          {loadingRecap ? "Generating recap…" : "Schedule client recap"}
        </Button>

        <Button onClick={handleVendorUpdate} disabled={loadingVendor}>
          {loadingVendor ? "Drafting vendor update…" : "Draft vendor update"}
        </Button>
      </div>

      {/* Last recap / vendor update section */}
      <div className="mt-6 border rounded-lg p-4 bg-neutral-50 space-y-4">
        <div className="text-sm font-semibold mb-1">
          Last recap / vendor update
        </div>

        <div className="text-sm whitespace-pre-line">
          {lastRecap
            ? lastRecap
            : "No recap generated yet. Click “Schedule client recap” to create one from your recent Gmail threads."}
        </div>

        {vendorDraft && (
          <div className="border-t border-neutral-200 pt-3 text-sm whitespace-pre-line">
            <div className="font-semibold mb-1">Vendor update draft</div>
            {vendorDraft}
          </div>
        )}

        {lastBullets.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold text-neutral-500 mb-1">
              Source bullets (from Gmail)
            </div>
            <ul className="list-disc pl-4 text-xs text-neutral-500 space-y-1">
              {lastBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recap modal */}
      {recapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black max-w-2xl w-full mx-4 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Client recap</div>
              <button
                className="text-sm text-neutral-500 hover:text-neutral-800"
                onClick={() => setRecapModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="border rounded-md p-3 h-80 overflow-y-auto text-sm whitespace-pre-line">
              {lastRecap}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleCopyRecap}>{copyLabel}</Button>
              <Button onClick={handleRegenerateRecap} disabled={loadingRecap}>
                {loadingRecap ? "Generating…" : "Regenerate"}
              </Button>
              <Button onClick={() => setRecapModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white text-black max-w-2xl w-full mx-4 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Vendor update</div>
              <button
                className="text-sm text-neutral-500 hover:text-neutral-800"
                onClick={() => setVendorModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="border rounded-md p-3 h-80 overflow-y-auto text-sm whitespace-pre-line">
              {vendorDraft}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleCopyVendor}>{copyVendorLabel}</Button>
              <Button
                onClick={handleVendorUpdate}
                disabled={loadingVendor}
              >
                {loadingVendor ? "Generating…" : "Regenerate"}
              </Button>
              <Button onClick={() => setVendorModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
