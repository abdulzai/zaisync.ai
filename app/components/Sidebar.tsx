"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  // Future sections – placeholders for now
  { href: "/labs", label: "Labs (coming soon)", disabled: true },
  { href: "/settings", label: "Settings (coming soon)", disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 border-r border-white/10 bg-white/5/10 bg-gradient-to-b from-zinc-950/90 via-zinc-950/80 to-black/90 backdrop-blur-sm">
      <div className="flex flex-col h-full w-full px-4 py-6 gap-6">
        {/* Logo / product name */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-zinc-400">
              Aurora EA
            </span>
            <span className="text-sm text-zinc-500">
              Gmail + meetings copilot
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const baseClasses =
              "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors";
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className={`${baseClasses} text-zinc-500 cursor-not-allowed`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-wide">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? `${baseClasses} bg-white/10 text-white`
                    : `${baseClasses} text-zinc-400 hover:bg-white/5 hover:text-white`
                }
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Early access status */}
        <div className="mt-auto rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent px-3 py-3 text-xs text-zinc-300">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-emerald-300">
              Early access
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-[2px] text-[10px] uppercase tracking-wide text-emerald-200">
              v0.1
            </span>
          </div>
          <p>Limited to trusted testers. Expect sharp edges.</p>
        </div>
      </div>
    </aside>
  );
}
