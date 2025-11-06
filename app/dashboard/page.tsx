import AuroraEA from '../components/AuroraEA';
export const dynamic = 'force-dynamic';
export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Aurora EA — Dashboard</h1>
      <AuroraEA />
    </main>
  );
}
