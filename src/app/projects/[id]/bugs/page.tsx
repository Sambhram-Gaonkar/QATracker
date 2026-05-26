import { DashboardShell } from "@/components/layout/DashboardShell";
import { BugsClient } from "@/components/bugs/BugsClient";

export default async function BugsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardShell title="Bug Reports">
      <BugsClient projectId={id} />
    </DashboardShell>
  );
}
