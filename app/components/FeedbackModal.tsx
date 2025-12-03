"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [text, setText] = useState("");

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      alert("Feedback copied – paste it into Slack / WhatsApp / email.");
    } catch (err) {
      console.error("Clipboard error:", err);
      alert("Could not copy to clipboard.");
    }
  };

  const handleEmail = () => {
    const body = encodeURIComponent(text || "");
    window.location.href = `mailto:adib.abdulzai@gmail.com?subject=Aurora%20EA%20feedback&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-black dark:bg-neutral-900 dark:text-neutral-50 max-w-lg w-full mx-4 rounded-2xl shadow-2xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Send quick feedback</h2>
            <p className="text-xs text-zinc-500 mt-1">
              What feels rough? What’s missing? What broke?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-sm"
          >
            ✕
          </button>
        </div>

        <textarea
          className="w-full h-40 rounded-xl border border-white/10 bg-black/5 dark:bg-black/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-400"
          placeholder="Example: It double-counts promos; I want it to focus on client emails…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-between items-center text-[11px] text-zinc-500">
          <span>Nothing is sent automatically – you control where this goes.</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              Copy
            </Button>
            <Button onClick={handleEmail}>Email</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
