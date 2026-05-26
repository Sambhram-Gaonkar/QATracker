"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, CheckCircle2, FolderKanban, ListChecks, ShieldAlert, XCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import type { Bug as BugRow, Project, TestCase } from "@/types/app";

export function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugs, setBugs] = useState<BugRow[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { organization } = await getSignedInWorkspace(supabase);
        const [projectResult, testCaseResult, bugResult] = await Promise.all([
          supabase.from("projects").select("*").eq("organization_id", organization.id),
          supabase.from("test_cases").select("*").eq("organization_id", organization.id),
          supabase.from("bugs").select("*").eq("organization_id", organization.id),
        ]);
        if (projectResult.error) throw projectResult.error;
        if (testCaseResult.error) throw testCaseResult.error;
        if (bugResult.error) throw bugResult.error;
        setProjects(projectResult.data ?? []);
        setTestCases(testCaseResult.data ?? []);
        setBugs(bugResult.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(
    () => ({
      totalProjects: projects.length,
      totalTestCases: testCases.length,
      passed: testCases.filter((item) => item.status === "Pass").length,
      failed: testCases.filter((item) => item.status === "Fail").length,
      blocked: testCases.filter((item) => item.status === "Blocked").length,
      totalBugs: bugs.length,
      openBugs: bugs.filter((item) => item.status === "Open").length,
      criticalBugs: bugs.filter((item) => item.severity === "Critical").length,
      highBugs: bugs.filter((item) => item.severity === "High").length,
    }),
    [projects, testCases, bugs],
  );

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderKanban} />
        <StatCard label="Total Test Cases" value={stats.totalTestCases} icon={ListChecks} />
        <StatCard label="Passed Test Cases" value={stats.passed} icon={CheckCircle2} />
        <StatCard label="Failed Test Cases" value={stats.failed} icon={XCircle} />
        <StatCard label="Blocked Test Cases" value={stats.blocked} icon={AlertTriangle} />
        <StatCard label="Total Bugs" value={stats.totalBugs} icon={Bug} />
        <StatCard label="Open Bugs" value={stats.openBugs} icon={Bug} />
        <StatCard label="Critical Bugs" value={stats.criticalBugs} icon={ShieldAlert} />
        <StatCard label="High Severity Bugs" value={stats.highBugs} icon={ShieldAlert} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <StatusChart
          data={["Not Run", "Pass", "Fail", "Blocked"].map((status) => ({
            name: status,
            value: testCases.filter((item) => item.status === status).length,
          }))}
        />
        <SeverityChart
          data={["Low", "Medium", "High", "Critical"].map((severity) => ({
            name: severity,
            value: bugs.filter((item) => item.severity === severity).length,
          }))}
        />
      </div>
    </div>
  );
}
