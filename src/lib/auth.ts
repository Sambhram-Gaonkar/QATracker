import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
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
