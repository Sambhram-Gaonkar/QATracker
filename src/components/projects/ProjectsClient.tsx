"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Select } from "@/components/ui/Select";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { PROJECT_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import type { Project, ProjectStatus } from "@/types/app";

export function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "All">("All");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { organization } = await getSignedInWorkspace(supabase);
        const { data, error: queryError } = await supabase
          .from("projects")
          .select("*")
          .eq("organization_id", organization.id)
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        setProjects(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "All" || project.status === status;
        return matchesSearch && matchesStatus;
      }),
    [projects, search, status],
  );

  if (loading) return <LoadingSpinner label="Loading projects..." />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px]">
          <Input label="Search projects" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Filter status" options={["All", ...PROJECT_STATUSES]} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus | "All")} />
        </div>
        <LinkButton href="/projects/new">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </LinkButton>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first QA project to start adding test cases and bug reports."
          action={<LinkButton href="/projects/new">Create Project</LinkButton>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>
  );
}
