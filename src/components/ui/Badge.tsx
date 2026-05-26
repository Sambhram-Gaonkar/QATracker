import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  High: "bg-red-50 text-red-700 ring-red-200",
  Critical: "bg-red-900 text-white ring-red-900",
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Fixed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-slate-100 text-slate-700 ring-slate-200",
  Rejected: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  Pass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Fail: "bg-red-50 text-red-700 ring-red-200",
  Blocked: "bg-orange-50 text-orange-700 ring-orange-200",
  "Not Run": "bg-slate-100 text-slate-700 ring-slate-200",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Archived: "bg-slate-100 text-slate-700 ring-slate-200",
  free: "bg-slate-100 text-slate-700 ring-slate-200",
  pro: "bg-violet-50 text-violet-700 ring-violet-200",
  team: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export function Badge({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1",
        colorMap[children] ?? "bg-slate-100 text-slate-700 ring-slate-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
