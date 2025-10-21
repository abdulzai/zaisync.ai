// app/dashboard/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';

type Task = {
  id: string;
  title: string;
  owner: string;
  status: 'Open' | 'In Progress' | 'Blocked' | 'Done';
  due: string;
};

const SAMPLE_TASKS: Task[] = [
  { id: 'T-101', title: 'Prep Q4 board deck', owner: 'You', status: 'In Progress', due: '2025-10-25' },
  { id: 'T-102', title: 'Vendor MSA – Acme Corp', owner: 'Legal', status: 'Open', due: '2025-10-22' },
  { id: 'T-103', title: 'Schedule exec offsite', owner: 'Ops', status: 'Blocked', due: '2025-11-03' },
  { id: 'T-104', title: 'Renew GSuite seats', owner: 'IT', status: 'Done', due: '2025-10-15' },
  { id: 'T-105', title: 'Finalize hiring plan', owner: 'People', status: 'Open', due: '2025-11-01' },
];

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [q, setQ] = useState('');

  const stats = useMemo(() => {
    const total = SAMPLE_TASKS.length;
    const open = SAMPLE_TASKS.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Blocked').length;
    const blocked = SAMPLE_TASKS.filter(t => t.status === 'Blocked').length;
    const done = SAMPLE_TASKS.filter(t => t.status === 'Done').length;
    return { total, open, blocked, done };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return SAMPLE_TASKS;
    return SAMPLE_TASKS.filter(t =>
      [t.id, t.title, t.owner, t.status, t.due].some(v => v.toLowerCase().includes(term)),
    );
  }, [q]);

  return (
    <main className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Aurora EA — Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise-secure, human-in-the-loop executive assistant.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setConnected((c) => !c)}
            className={connected ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            title={connected ? 'Disconnect Gmail/Outlook' : 'Connect Gmail/Outlook'}
          >
            {connected ? 'Connected' : 'Connect'}
          </Button>
          <Button variant="secondary">New Task</Button>
        </div>
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">All tracked items</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-2xl">{stats.open}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">Open / In Progress / Blocked</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-2xl">{stats.blocked}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">Needs attention</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Done</CardDescription>
            <CardTitle className="text-2xl">{stats.done}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">Completed items</CardContent>
        </Card>
      </section>

      {/* Connections & Quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Connections</CardTitle>
            <CardDescription>Outlook / Gmail status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <div className="font-medium">Email & Calendar</div>
                <div className="text-xs text-gray-500">
                  {connected ? 'Live sync enabled' : 'Not connected'}
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {connected ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => setConnected(true)} disabled={connected}>
                Connect
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setConnected(false)} disabled={!connected}>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>One-click helpers</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <ActionButton label="Draft follow-up" hint="Generate an email draft" />
            <ActionButton label="Summarize thread" hint="Create a crisp summary" />
            <ActionButton label="Schedule meeting" hint="Find slots & propose" />
            <ActionButton label="Create task" hint="Add to action list" />
          </CardContent>
        </Card>
      </section>

      {/* Search + Table */}
      <section className="mt-6">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Lightweight sample data — replace with your API later.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3 mt-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tasks (id, title, owner, status)…"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button variant="secondary" onClick={() => setQ('')}>Clear</Button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Owner</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b last:border-none">
                      <td className="py-2 pr-4 font-medium">{t.id}</td>
                      <td className="py-2 pr-4">{t.title}</td>
                      <td className="py-2 pr-4">{t.owner}</td>
                      <td className="py-2 pr-4">
                        <span className={badgeClass(t.status)}>{t.status}</span>
                      </td>
                      <td className="py-2 pr-4">{t.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">No results.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Visual change sentinel */}
      <div className="p-6 bg-blue-50 rounded-xl mt-6">
        <p className="text-sm text-blue-900">
          UI test: if you’re seeing this blue box, the new dashboard is deployed ✅
        </p>
      </div>
    </main>
  );
}

function ActionButton({ label, hint }: { label: string; hint: string }) {
  return (
    <button
      className="w-full rounded-lg border p-3 text-left hover:shadow-sm transition"
      onClick={() => alert(`${label} (placeholder)`)}
    >
      <div className="font-medium">{label}</div>
      <div className="text-xs text-gray-500">{hint}</div>
    </button>
  );
}

function badgeClass(status: Task['status']) {
  switch (status) {
    case 'Open':
      return 'inline-flex items-center rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-800';
    case 'In Progress':
      return 'inline-flex items-center rounded px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800';
    case 'Blocked':
      return 'inline-flex items-center rounded px-2 py-0.5 text-xs bg-amber-100 text-amber-800';
    case 'Done':
      return 'inline-flex items-center rounded px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800';
  }
}
