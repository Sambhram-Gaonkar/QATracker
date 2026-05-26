"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProjectForm, type ProjectFormValues } from "@/components/projects/ProjectForm";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import { checkPlanLimit } from "@/lib/planLimits";

export function NewProjectClient() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(values: ProjectFormValues) {
    const supabase = createClient();
    const { user, organization } = await getSignedInWorkspace(supabase);
    const { count, error: countError } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id);
    if (countError) throw countError;
    const limit = checkPlanLimit(organization.plan, "projects", count ?? 0);
    if (!limit.allowed) return setMessage(limit.message ?? "");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        organization_id: organization.id,
        name: values.name,
        description: values.description,
        status: values.status,
        created_by: user.id,
      })
      .select("*")
      .single();
    if (error) return setMessage(error.message);
    router.push(`/projects/${data.id}`);
  }

  return (
    <Card className="max-w-2xl">
      {message ? <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">{message}</p> : null}
      <ProjectForm onSubmit={submit} submitLabel="Create Project" />
    </Card>
  );
}
