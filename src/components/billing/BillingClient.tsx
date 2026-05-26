"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FREE_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import type { Organization } from "@/types/app";

const plans = [
  { name: "Free", price: "$0", features: ["1 project", "20 test cases", "10 bugs", "Excel export allowed", "Limited screenshot upload"] },
  { name: "Pro", price: "$19/mo", features: ["Unlimited projects", "Unlimited test cases", "Unlimited bugs", "Excel export", "Screenshot upload", "Dashboard analytics"] },
  { name: "Team", price: "$49/mo", features: ["Multiple team members", "Role management", "Shared workspace", "Priority support"] },
];

export function BillingClient() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [usage, setUsage] = useState({ projects: 0, testCases: 0, bugs: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { organization: org } = await getSignedInWorkspace(supabase);
      const [projects, testCases, bugs] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", org.id),
        supabase.from("test_cases").select("id", { count: "exact", head: true }).eq("organization_id", org.id),
        supabase.from("bugs").select("id", { count: "exact", head: true }).eq("organization_id", org.id),
      ]);
      setOrganization(org);
      setUsage({ projects: projects.count ?? 0, testCases: testCases.count ?? 0, bugs: bugs.count ?? 0 });
      setLoading(false);
    }
    load().catch((err) => { setMessage(err instanceof Error ? err.message : "Unable to load billing."); setLoading(false); });
  }, []);

  function startCheckout(planName: string) {
    // TODO: Replace this placeholder with a server action or route handler that creates a Stripe Checkout session.
    // TODO: Use STRIPE_PRICE_ID_PRO and STRIPE_PRICE_ID_TEAM from environment variables for real price IDs.
    setMessage(`Stripe Checkout for ${planName} is ready to wire when billing is enabled.`);
  }

  if (loading) return <LoadingSpinner label="Loading billing..." />;

  return (
    <div className="grid gap-5">
      {message ? <p className="rounded-lg bg-amber-50 p-3 text-sm font-bold text-amber-700">{message}</p> : null}
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-2xl font-black">Current plan</h2><p className="mt-2 text-sm text-slate-600">Usage limits for your workspace.</p></div>
          <Badge>{organization?.plan ?? "free"}</Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold">Projects: {usage.projects}/{FREE_LIMITS.projects}</p>
          <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold">Test cases: {usage.testCases}/{FREE_LIMITS.testCases}</p>
          <p className="rounded-lg bg-slate-50 p-3 text-sm font-bold">Bugs: {usage.bugs}/{FREE_LIMITS.bugs}</p>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name.toLowerCase() === organization?.plan ? "border-slate-950" : ""}>
            <h3 className="text-2xl font-black">{plan.name}</h3>
            <p className="mt-2 text-3xl font-black">{plan.price}</p>
            <ul className="mt-5 grid gap-2 text-sm text-slate-600">{plan.features.map((feature) => <li key={feature}>- {feature}</li>)}</ul>
            <Button className="mt-6 w-full" variant={plan.name === "Free" ? "secondary" : "primary"} onClick={() => startCheckout(plan.name)}>
              {plan.name === "Free" ? "Current/Start" : "Upgrade"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
