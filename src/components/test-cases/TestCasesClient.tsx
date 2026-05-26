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
import { ExportButtons } from "@/components/exports/ExportButtons";
import { TestCaseForm, type TestCaseFormValues } from "@/components/test-cases/TestCaseForm";
import { TestCaseTable } from "@/components/test-cases/TestCaseTable";
import { PRIORITIES, TEST_CASE_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import { checkPlanLimit, generateTestCaseId } from "@/lib/planLimits";
import type { Bug, Priority, Project, TestCase, TestCaseStatus } from "@/types/app";

export function TestCasesClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestCase | null>(null);
  const [deleting, setDeleting] = useState<TestCase | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TestCaseStatus | "All">("All");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [moduleFilter, setModuleFilter] = useState("All");

  async function load() {
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const [projectResult, testCaseResult, bugResult] = await Promise.all([
      supabase.from("projects").select("*").eq("organization_id", organization.id).eq("id", projectId).single(),
      supabase.from("test_cases").select("*").eq("organization_id", organization.id).eq("project_id", projectId).order("created_at", { ascending: false }),
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
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load test cases.")).finally(() => setLoading(false));
  }, [projectId]);

  const modules = useMemo(() => ["All", ...Array.from(new Set(testCases.map((item) => item.module)))], [testCases]);
  const filtered = useMemo(
    () =>
      testCases.filter((item) => {
        const text = `${item.title} ${item.module} ${item.test_case_id}`.toLowerCase();
        return text.includes(search.toLowerCase()) && (status === "All" || item.status === status) && (priority === "All" || item.priority === priority) && (moduleFilter === "All" || item.module === moduleFilter);
      }),
    [testCases, search, status, priority, moduleFilter],
  );

  async function save(values: TestCaseFormValues) {
    const supabase = createClient();
    const { user, organization } = await getSignedInWorkspace(supabase);
    if (!editing) {
      const limit = checkPlanLimit(organization.plan, "testCases", testCases.length);
      if (!limit.allowed) return setMessage(limit.message ?? "");
    }
    const payload = { ...values, project_id: projectId, organization_id: organization.id, created_by: user.id };
    const result = editing
      ? await supabase.from("test_cases").update(values).eq("organization_id", organization.id).eq("id", editing.id)
      : await supabase.from("test_cases").insert(payload);
    if (result.error) return setMessage(result.error.message);
    setOpen(false); setEditing(null); setMessage("Test case saved.");
    await load();
  }

  async function deleteItem() {
    if (!deleting) return;
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const { error: deleteError } = await supabase.from("test_cases").delete().eq("organization_id", organization.id).eq("id", deleting.id);
    if (deleteError) return setMessage(deleteError.message);
    setDeleting(null); await load();
  }

  async function updateStatus(testCase: TestCase, nextStatus: TestCaseStatus) {
    const supabase = createClient();
    const { organization } = await getSignedInWorkspace(supabase);
    const { error: updateError } = await supabase.from("test_cases").update({ status: nextStatus }).eq("organization_id", organization.id).eq("id", testCase.id);
    if (updateError) return setMessage(updateError.message);
    setTestCases((items) => items.map((item) => (item.id === testCase.id ? { ...item, status: nextStatus } : item)));
  }

  if (loading) return <LoadingSpinner label="Loading test cases..." />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;

  return (
    <div className="grid gap-5">
      {message ? <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">{message}</p> : null}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 md:grid-cols-4">
          <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Status" options={["All", ...TEST_CASE_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value as TestCaseStatus | "All")} />
          <Select label="Module" options={modules} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} />
          <Select label="Priority" options={["All", ...PRIORITIES]} value={priority} onChange={(e) => setPriority(e.target.value as Priority | "All")} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Test Case</Button>
      </div>
      {testCases.length === 0 ? <EmptyState title="No test cases yet" description="Add your first test case for this project." action={<Button onClick={() => setOpen(true)}>Add Test Case</Button>} /> : <TestCaseTable testCases={filtered} onEdit={(item) => { setEditing(item); setOpen(true); }} onDelete={setDeleting} onStatusChange={updateStatus} />}
      {project ? <ExportButtons project={project} testCases={testCases} bugs={bugs} /> : null}
      <Modal title={editing ? "Edit Test Case" : "Add Test Case"} open={open} onClose={() => setOpen(false)}>
        <TestCaseForm testCase={editing} suggestedId={generateTestCaseId(testCases.length)} onSubmit={save} />
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete test case?" description="This permanently deletes the selected test case." onCancel={() => setDeleting(null)} onConfirm={deleteItem} />
    </div>
  );
}
