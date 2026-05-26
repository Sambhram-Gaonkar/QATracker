"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { Project, ProjectStatus } from "@/types/app";

export type ProjectFormValues = {
  name: string;
  description: string;
  status: ProjectStatus;
};

export function ProjectForm({
  project,
  onSubmit,
  submitLabel = "Save Project",
}: {
  project?: Project | null;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<ProjectFormValues>({
    name: project?.name ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "Active",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim()) return setError("Project name is required.");
    setError("");
    setSaving(true);
    await onSubmit(values);
    setSaving(false);
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Input label="Project name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
      <Textarea
        label="Description"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
      />
      <Select
        label="Status"
        options={PROJECT_STATUSES}
        value={values.status}
        onChange={(e) => setValues({ ...values, status: e.target.value as ProjectStatus })}
      />
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <Button disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
    </form>
  );
}
