import { BillingClient } from "@/components/billing/BillingClient";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function BillingPage() {
  return (
    <DashboardShell title="Billing">
      <BillingClient />
    </DashboardShell>
  );
}
