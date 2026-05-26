import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectsClient } from "@/components/projects/ProjectsClient";

export default function ProjectsPage() {
  return (
    <DashboardShell title="Projects">
      <ProjectsClient />
    </DashboardShell>
  );
}
