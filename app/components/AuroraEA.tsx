'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuroraEA() {
  const [approved, setApproved] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1C1E22] p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#3A8DFF] via-[#B499FF] to-[#4BE1A0] text-transparent bg-clip-text">
          Aurora EA Dashboard
        </h1>
        <div className="flex gap-3">
          <Button className="bg-[#3A8DFF] text-white">New Task</Button>
        </div>
      </div>

      {/* Morning Brief */}
      <Card className="rounded-2xl shadow-sm border border-[#E2E6EA]">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">☀️ Morning Brief</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>3 urgent messages summarized</li>
            <li>2 meetings require confirmation</li>
            <li>5 drafted replies ready for approval</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <Button className="bg-[#4BE1A0] text-white">Review Drafts</Button>
            <Button variant="outline" className="border-[#E2E6EA]">View All</Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval Queue */}
      <Card className="rounded-2xl shadow-sm border border-[#E2E6EA]">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">🗂️ Approval Queue</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 rounded-xl border border-[#E2E6EA] bg-white">
              <div>
                <p className="font-medium">Client follow-up email to Intersect Power</p>
                <p className="text-sm text-[#6A737C]">Draft confidence: 93% • Tier 1 • Approval required</p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#3A8DFF] text-white" onClick={() => setApproved(true)}>Approve</Button>
                <Button variant="outline" className="text-[#1C1E22]">Edit</Button>
              </div>
            </div>
            {approved && <p className="text-sm text-[#4BE1A0]">Approved & sent (mock).</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
