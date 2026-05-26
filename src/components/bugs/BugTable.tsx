"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { Bug } from "@/types/app";

export function BugTable({
  bugs,
  onEdit,
  onDelete,
}: {
  bugs: Bug[];
  onEdit: (bug: Bug) => void;
  onDelete: (bug: Bug) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Bug ID</th>
            <th className="px-4 py-3">Module/Feature</th>
            <th className="px-4 py-3">Bug Title</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Proof</th>
            <th className="px-4 py-3">Created Date</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bugs.map((bug) => (
            <tr key={bug.id}>
              <td className="px-4 py-3 font-bold">{bug.bug_id}</td>
              <td className="px-4 py-3">{bug.module_feature}</td>
              <td className="max-w-md px-4 py-3">{bug.bug_title}</td>
              <td className="px-4 py-3"><Badge>{bug.severity}</Badge></td>
              <td className="px-4 py-3"><Badge>{bug.priority}</Badge></td>
              <td className="px-4 py-3"><Badge>{bug.status}</Badge></td>
              <td className="px-4 py-3">
                {bug.proof_url ? (
                  <a className="inline-flex items-center gap-1 font-bold text-slate-950" href={bug.proof_url} target="_blank">
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(bug.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onEdit(bug)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="danger" onClick={() => onDelete(bug)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
