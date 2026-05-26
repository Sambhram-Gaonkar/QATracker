"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Organization } from "@/types/app";

export async function ensureClientOrganization(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<Organization> {
  const { data: member } = await supabase
    .from("organization_members")
    .select("organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const row = member as { organizations?: unknown } | null;
  const existing = Array.isArray(row?.organizations) ? row?.organizations[0] : row?.organizations;
  if (existing) return existing as Organization;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: "My Workspace", owner_id: user.id, plan: "free" })
    .select("*")
    .single();

  if (orgError) throw orgError;

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: organization.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) throw memberError;
  return organization as Organization;
}

export async function getSignedInWorkspace(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw error ?? new Error("You must be logged in.");
  const organization = await ensureClientOrganization(supabase, user);
  return { user, organization };
}
