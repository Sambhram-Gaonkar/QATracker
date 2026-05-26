"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import type { Organization } from "@/types/app";

export function SettingsClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { user, organization: org } = await getSignedInWorkspace(supabase);
      setEmail(user.email ?? "");
      setOrganization(org);
      setName(org.name);
      setLoading(false);
    }
    load().catch((err) => { setMessage(err instanceof Error ? err.message : "Unable to load settings."); setLoading(false); });
  }, []);

  async function updateName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organization) return;
    const supabase = createClient();
    const { error } = await supabase.from("organizations").update({ name }).eq("id", organization.id);
    setMessage(error ? error.message : "Workspace updated.");
  }

  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  if (loading) return <LoadingSpinner label="Loading settings..." />;

  return (
    <Card className="max-w-2xl">
      {message ? <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">{message}</p> : null}
      <div className="grid gap-4">
        <div><p className="text-sm font-bold text-slate-500">User email</p><p className="mt-1 font-semibold">{email}</p></div>
        <div><p className="text-sm font-bold text-slate-500">Current plan</p><div className="mt-1"><Badge>{organization?.plan ?? "free"}</Badge></div></div>
        <form className="grid gap-4" onSubmit={updateName}>
          <Input label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button>Update Workspace</Button>
        </form>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </div>
    </Card>
  );
}
