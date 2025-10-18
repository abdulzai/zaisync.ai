import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Aurora EA</h1>
      <p className="mb-4">Enterprise-secure, human-in-the-loop executive assistant.</p>
      <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl" style={{ background:'#3A8DFF', color:'#fff' }}>
        Open the App
      </Link>
    </main>
  );
}
