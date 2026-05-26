"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bug, CheckCircle2, ListChecks, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { ProjectForm, type ProjectFormValues } from "@/components/projects/ProjectForm";
import { ExportButtons } from "@/components/exports/ExportButtons";
import { ImportReportButton } from "@/components/imports/ImportReportButton";
import { StatCard } from "@/components/dashboard/StatCard";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import type { Bug as BugRow, Project, TestCase } from "@/types/app";

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugs, setBugs] = useState<BugRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function load() {
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const [projectResult, testCaseResult, bugResult] = await Promise.all([
      supabase.from("projects").select("*").eq("organization_id", organization.id).eq("id", projectId).single(),
      supabase.from("test_cases").select("*").eq("organization_id", organization.id).eq("project_id", projectId),
      supabase.from("bugs").select("*").eq("organization_id", organization.id).eq("project_id", projectId),
    ]);
    if (projectResult.error) throw projectResult.error;
    if (testCaseResult.error) throw testCaseResult.error;
    if (bugResult.error) throw bugResult.error;
    setProject(projectResult.data);
    setTestCases(testCaseResult.data ?? []);
    setBugs(bugResult.data ?? []);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load project."))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function updateProject(values: ProjectFormValues) {
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const { error: updateError } = await supabase
      .from("projects")
      .update(values)
      .eq("organization_id", organization.id)
      .eq("id", projectId);
    if (updateError) return setError(updateError.message);
    setEditOpen(false);
    await load();
  }

  async function deleteProject() {
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("organization_id", organization.id)
      .eq("id", projectId);
    if (deleteError) return setError(deleteError.message);
    router.push("/projects");
  }

  if (loading) return <LoadingSpinner label="Loading project..." />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;
  if (!project) return null;

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3"><h2 className="text-3xl font-black">{project.name}</h2><Badge>{project.status}</Badge></div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">{project.description || "No description provided."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit Project</Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Test Cases" value={testCases.length} icon={ListChecks} />
        <StatCard label="Passed" value={testCases.filter((item) => item.status === "Pass").length} icon={CheckCircle2} />
        <StatCard label="Failed" value={testCases.filter((item) => item.status === "Fail").length} icon={XCircle} />
        <StatCard label="Total Bugs" value={bugs.length} icon={Bug} />
        <StatCard label="Open Bugs" value={bugs.filter((item) => item.status === "Open").length} icon={Bug} />
      </div>
      <Card>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`/projects/${project.id}/test-cases`}>Manage Test Cases</LinkButton>
          <LinkButton href={`/projects/${project.id}/bugs`} variant="secondary">Manage Bugs</LinkButton>
        </div>
        <div className="mt-5"><ExportButtons project={project} testCases={testCases} bugs={bugs} /></div>
        <div className="mt-4">
          <ImportReportButton
            project={project}
            existingTestCases={testCases}
            existingBugs={bugs}
            onImported={load}
          />
        </div>
      </Card>
      <Modal title="Edit Project" open={editOpen} onClose={() => setEditOpen(false)}>
        <ProjectForm project={project} onSubmit={updateProject} />
      </Modal>
      <ConfirmDialog open={deleteOpen} title="Delete project?" description="This deletes the project, test cases, and bug reports. This cannot be undone." onCancel={() => setDeleteOpen(false)} onConfirm={deleteProject} />
    </div>
  );
}
