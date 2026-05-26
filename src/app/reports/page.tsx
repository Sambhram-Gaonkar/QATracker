import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportsClient } from "@/components/reports/ReportsClient";

export default function ReportsPage() {
  return (
    <DashboardShell title="Reports">
      <ReportsClient />
    </DashboardShell>
  );
}
