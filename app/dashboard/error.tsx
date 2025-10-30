'use client';

export default function Error({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  const message =
    (error as any)?.stack ||
    (error as any)?.message ||
    JSON.stringify(error, null, 2);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard Error</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{message}</pre>
      <button onClick={() => reset()} style={{ marginTop: 16 }}>
        Try again
      </button>
    </main>
  );
}
