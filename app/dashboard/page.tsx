import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic"; // avoid static caching during tests

export default function Page() {
  return <DashboardClient />;
}
