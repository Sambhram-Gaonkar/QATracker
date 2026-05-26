"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { BUG_STATUSES, PRIORITIES, SEVERITIES } from "@/lib/constants";
import type { Bug, BugStatus, Priority, Severity } from "@/types/app";

export type BugFormValues = {
  bug_id: string;
  bug_title: string;
  module_feature: string;
  test_steps: string;
  expected_result: string;
  actual_result: string;
  severity: Severity;
  priority: Priority;
  status: BugStatus;
  proof_file?: File | null;
};

export function BugForm({
  bug,
  suggestedId,
  onSubmit,
}: {
  bug?: Bug | null;
  suggestedId: string;
  onSubmit: (values: BugFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<BugFormValues>({
    bug_id: bug?.bug_id ?? suggestedId,
    bug_title: bug?.bug_title ?? "",
    module_feature: bug?.module_feature ?? "",
    test_steps: bug?.test_steps ?? "",
    expected_result: bug?.expected_result ?? "",
    actual_result: bug?.actual_result ?? "",
    severity: bug?.severity ?? "Medium",
    priority: bug?.priority ?? "Medium",
    status: bug?.status ?? "Open",
    proof_file: null,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !values.bug_title.trim() ||
      !values.module_feature.trim() ||
      !values.test_steps.trim() ||
      !values.expected_result.trim() ||
      !values.actual_result.trim()
    ) {
      return setError("Bug title, module, steps, expected result, and actual result are required.");
    }
    setError("");
    setSaving(true);
    await onSubmit({ ...values, bug_id: values.bug_id.trim() || suggestedId });
    setSaving(false);
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Bug ID" value={values.bug_id} onChange={(e) => setValues({ ...values, bug_id: e.target.value })} />
        <Input label="Module/Feature" value={values.module_feature} onChange={(e) => setValues({ ...values, module_feature: e.target.value })} />
      </div>
      <Input label="Bug title" value={values.bug_title} onChange={(e) => setValues({ ...values, bug_title: e.target.value })} />
      <Textarea label="Test steps" value={values.test_steps} onChange={(e) => setValues({ ...values, test_steps: e.target.value })} />
      <Textarea label="Expected result" value={values.expected_result} onChange={(e) => setValues({ ...values, expected_result: e.target.value })} />
      <Textarea label="Actual result" value={values.actual_result} onChange={(e) => setValues({ ...values, actual_result: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Severity" options={SEVERITIES} value={values.severity} onChange={(e) => setValues({ ...values, severity: e.target.value as Severity })} />
        <Select label="Priority" options={PRIORITIES} value={values.priority} onChange={(e) => setValues({ ...values, priority: e.target.value as Priority })} />
        <Select label="Status" options={BUG_STATUSES} value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as BugStatus })} />
      </div>
      <Input label="Proof screenshot" type="file" accept="image/*" onChange={(e) => setValues({ ...values, proof_file: e.target.files?.[0] ?? null })} />
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <Button disabled={saving}>{saving ? "Saving..." : "Save Bug"}</Button>
    </form>
  );
}
