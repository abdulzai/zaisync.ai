"use client";

import { Button } from "./ui/button";

export default function VendorModal({ text, loading, onCopy, onRegenerate, onClose }) {
  if (!text && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-black dark:bg-neutral-900 dark:text-neutral-50 max-w-2xl w-full mx-4 rounded-xl shadow-lg p-6">
        <div className="text-lg font-semibold mb-4">Vendor update</div>

        <div className="border rounded-md p-3 h-80 overflow-y-auto text-sm whitespace-pre-line">
          {loading ? "Generating vendor update…" : text}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {!loading && (
            <>
              <Button variant="outline" onClick={onCopy}>
                Copy
              </Button>
              <Button onClick={onRegenerate}>
                Regenerate
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
