import { DashboardShell } from "@/components/layout/DashboardShell";
import { TestCasesClient } from "@/components/test-cases/TestCasesClient";

export default async function TestCasesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardShell title="Test Cases">
      <TestCasesClient projectId={id} />
    </DashboardShell>
  );
}
