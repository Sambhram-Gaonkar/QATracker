"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function Topbar({ title, email }: { title: string; email?: string | null }) {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/90 px-5 py-4 backdrop-blur">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">{title}</h1>
        <p className="text-sm text-slate-500">Workspace dashboard</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden max-w-52 truncate text-sm font-medium text-slate-600 sm:block">{email}</span>
        <Button variant="secondary" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
