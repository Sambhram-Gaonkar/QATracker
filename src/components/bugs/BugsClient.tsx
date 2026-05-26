"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { BugForm, type BugFormValues } from "@/components/bugs/BugForm";
import { BugTable } from "@/components/bugs/BugTable";
import { ExportButtons } from "@/components/exports/ExportButtons";
import { BUG_STATUSES, PRIORITIES, SEVERITIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import { checkPlanLimit, generateBugId } from "@/lib/planLimits";
import type { Bug, BugStatus, Priority, Project, Severity, TestCase } from "@/types/app";

export function BugsClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bug | null>(null);
  const [deleting, setDeleting] = useState<Bug | null>(null);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<Severity | "All">("All");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [status, setStatus] = useState<BugStatus | "All">("All");

  async function load() {
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const [projectResult, bugsResult, testCaseResult] = await Promise.all([
      supabase.from("projects").select("*").eq("organization_id", organization.id).eq("id", projectId).single(),
      supabase.from("bugs").select("*").eq("organization_id", organization.id).eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("test_cases").select("*").eq("organization_id", organization.id).eq("project_id", projectId),
    ]);
    if (projectResult.error) throw projectResult.error;
    if (bugsResult.error) throw bugsResult.error;
    if (testCaseResult.error) throw testCaseResult.error;
    setProject(projectResult.data);
    setBugs(bugsResult.data ?? []);
    setTestCases(testCaseResult.data ?? []);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load bugs.")).finally(() => setLoading(false));
  }, [projectId]);

  const filtered = useMemo(
    () => bugs.filter((bug) => `${bug.bug_title} ${bug.module_feature} ${bug.bug_id}`.toLowerCase().includes(search.toLowerCase()) && (severity === "All" || bug.severity === severity) && (priority === "All" || bug.priority === priority) && (status === "All" || bug.status === status)),
    [bugs, search, severity, priority, status],
  );

  async function uploadProof(file: File, organizationId: string) {
    const supabase = createClient();
    const path = `${organizationId}/${projectId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("bug-proofs").upload(path, file, { upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("bug-proofs").getPublicUrl(path);
    return { proof_url: data.publicUrl, proof_file_path: path };
  }

  async function save(values: BugFormValues) {
    const supabase = createClient();
    const { user, organization } = await getSignedInWorkspace(supabase);
    if (!editing) {
      const limit = checkPlanLimit(organization.plan, "bugs", bugs.length);
      if (!limit.allowed) return setMessage(limit.message ?? "");
    }
    let proof = editing ? { proof_url: editing.proof_url, proof_file_path: editing.proof_file_path } : { proof_url: null, proof_file_path: null };
    if (values.proof_file) proof = await uploadProof(values.proof_file, organization.id);
    const { proof_file: _proofFile, ...cleanValues } = values;
    const payload = { ...cleanValues, ...proof, project_id: projectId, organization_id: organization.id, created_by: user.id };
    const result = editing
      ? await supabase.from("bugs").update({ ...cleanValues, ...proof }).eq("organization_id", organization.id).eq("id", editing.id)
      : await supabase.from("bugs").insert(payload);
    if (result.error) return setMessage(result.error.message);
    setOpen(false); setEditing(null); setMessage("Bug saved.");
    await load();
  }

  async function deleteItem() {
    if (!deleting) return;
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const { error: deleteError } = await supabase.from("bugs").delete().eq("organization_id", organization.id).eq("id", deleting.id);
    if (deleteError) return setMessage(deleteError.message);
    setDeleting(null); await load();
  }

  if (loading) return <LoadingSpinner label="Loading bugs..." />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;

  return (
    <div className="grid gap-5">
      {message ? <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">{message}</p> : null}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 md:grid-cols-4">
          <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Severity" options={["All", ...SEVERITIES]} value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "All")} />
          <Select label="Priority" options={["All", ...PRIORITIES]} value={priority} onChange={(e) => setPriority(e.target.value as Priority | "All")} />
          <Select label="Status" options={["All", ...BUG_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value as BugStatus | "All")} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Bug</Button>
      </div>
      {bugs.length === 0 ? <EmptyState title="No bug reports yet" description="Log the first bug and attach screenshot proof when needed." action={<Button onClick={() => setOpen(true)}>Add Bug</Button>} /> : <BugTable bugs={filtered} onEdit={(bug) => { setEditing(bug); setOpen(true); }} onDelete={setDeleting} />}
      {project ? <ExportButtons project={project} testCases={testCases} bugs={bugs} /> : null}
      <Modal title={editing ? "Edit Bug" : "Add Bug"} open={open} onClose={() => setOpen(false)}>
        <BugForm bug={editing} suggestedId={generateBugId(bugs.length)} onSubmit={save} />
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete bug?" description="This permanently deletes the selected bug report." onCancel={() => setDeleting(null)} onConfirm={deleteItem} />
    </div>
  );
}
