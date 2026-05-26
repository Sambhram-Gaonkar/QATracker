"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PRIORITIES, TEST_CASE_STATUSES } from "@/lib/constants";
import type { Priority, TestCase, TestCaseStatus } from "@/types/app";

export type TestCaseFormValues = {
  module: string;
  test_case_id: string;
  title: string;
  preconditions: string;
  test_steps: string;
  expected_result: string;
  actual_result: string;
  priority: Priority;
  status: TestCaseStatus;
};

export function TestCaseForm({
  testCase,
  suggestedId,
  onSubmit,
}: {
  testCase?: TestCase | null;
  suggestedId: string;
  onSubmit: (values: TestCaseFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<TestCaseFormValues>({
    module: testCase?.module ?? "",
    test_case_id: testCase?.test_case_id ?? suggestedId,
    title: testCase?.title ?? "",
    preconditions: testCase?.preconditions ?? "",
    test_steps: testCase?.test_steps ?? "",
    expected_result: testCase?.expected_result ?? "",
    actual_result: testCase?.actual_result ?? "",
    priority: testCase?.priority ?? "Medium",
    status: testCase?.status ?? "Not Run",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.module.trim() || !values.title.trim() || !values.test_steps.trim() || !values.expected_result.trim()) {
      return setError("Module, title, test steps, and expected result are required.");
    }
    setError("");
    setSaving(true);
    await onSubmit({ ...values, test_case_id: values.test_case_id.trim() || suggestedId });
    setSaving(false);
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Test Case ID" value={values.test_case_id} onChange={(e) => setValues({ ...values, test_case_id: e.target.value })} />
        <Input label="Module" value={values.module} onChange={(e) => setValues({ ...values, module: e.target.value })} />
      </div>
      <Input label="Title" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
      <Textarea label="Preconditions" value={values.preconditions} onChange={(e) => setValues({ ...values, preconditions: e.target.value })} />
      <Textarea label="Test steps" value={values.test_steps} onChange={(e) => setValues({ ...values, test_steps: e.target.value })} />
      <Textarea label="Expected result" value={values.expected_result} onChange={(e) => setValues({ ...values, expected_result: e.target.value })} />
      <Textarea label="Actual result" value={values.actual_result} onChange={(e) => setValues({ ...values, actual_result: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Priority" options={PRIORITIES} value={values.priority} onChange={(e) => setValues({ ...values, priority: e.target.value as Priority })} />
        <Select label="Status" options={TEST_CASE_STATUSES} value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as TestCaseStatus })} />
      </div>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <Button disabled={saving}>{saving ? "Saving..." : "Save Test Case"}</Button>
    </form>
  );
}
