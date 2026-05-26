import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardShell title="Project Detail">
      <ProjectDetailClient projectId={id} />
    </DashboardShell>
  );
}
