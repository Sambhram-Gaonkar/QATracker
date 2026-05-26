import { DashboardShell } from "@/components/layout/DashboardShell";
import { NewProjectClient } from "@/components/projects/NewProjectClient";

export default function NewProjectPage() {
  return (
    <DashboardShell title="New Project">
      <NewProjectClient />
    </DashboardShell>
  );
}
