import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Aurora EA",
  description: "Gmail + meetings copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-black text-white antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
