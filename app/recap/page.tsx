'use client';

import React, { useState } from 'react';

export default function RecapPage() {
  const [bullets, setBullets] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const lines = bullets
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await fetch('/api/ai/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets: lines }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to generate recap');
      } else {
        setResult(json.text || 'No recap generated.');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Schedule client recap</h1>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
        <label className="block text-sm font-medium">
          Key points from the meeting
        </label>
        <textarea
          className="w-full border rounded p-2 min-h-[160px]"
          placeholder="- Discussed Q4 timeline
- Customer asked about pricing
- Follow-up on security questionnaire"
          value={bullets}
          onChange={(e) => setBullets(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {loading ? 'Generating…' : 'Generate recap'}
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <section className="mt-4 border rounded p-4 bg-gray-50">
          <h2 className="font-semibold mb-2">AI recap</h2>
          <p className="whitespace-pre-line text-sm">{result}</p>
        </section>
      )}
    </main>
  );
}
