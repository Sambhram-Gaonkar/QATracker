import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/app";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{project.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{project.description || "No description."}</p>
        </div>
        <Badge>{project.status}</Badge>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500">Created {formatDate(project.created_at)}</p>
      <div className="mt-5">
        <LinkButton href={`/projects/${project.id}`} variant="secondary">
          Open Project
          <ArrowRight className="ml-2 h-4 w-4" />
        </LinkButton>
      </div>
    </Card>
  );
}
