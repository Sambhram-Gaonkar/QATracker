import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export async function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const user = await requireAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar title={title} email={user.email} />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
