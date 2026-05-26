import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/app";

const demoUser = {
  id: "local-demo-user",
  email: "demo@qatrackr.local",
};

function isLocalDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export async function getCurrentUser() {
  if (isLocalDemoMode()) return demoUser;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCurrentOrganization() {
  if (isLocalDemoMode()) {
    return {
      id: "local-demo-organization",
      name: "My Workspace",
      owner_id: "local-demo-user",
      plan: "pro",
      created_at: null,
      updated_at: null,
    } satisfies Organization;
  }

  const supabase = await createClient();
  const user = await requireAuth();
  const { data } = await supabase
    .from("organization_members")
    .select("organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const row = data as { organizations?: unknown } | null;
  const organization = Array.isArray(row?.organizations)
    ? row?.organizations[0]
    : row?.organizations;

  return organization ?? null;
}
