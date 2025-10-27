// app/page.tsx
import Link from 'next/link';

export default function MarketingHome() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Aurora EA</h1>
      <p className="mb-6 text-gray-700">
        Enterprise-secure, human-in-the-loop executive assistant.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded-xl bg-[#3A80FF] px-4 py-2 text-white hover:bg-[#2f6be0]"
      >
        Open the App
      </Link>
    </main>
  );
}
