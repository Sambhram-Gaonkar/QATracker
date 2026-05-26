"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { ExportButtons } from "@/components/exports/ExportButtons";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import { formatDate } from "@/lib/utils";
import type { Bug, Project, TestCase } from "@/types/app";

export function ReportsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { organization } = await getSignedInWorkspace(supabase);
        const [projectResult, testCaseResult, bugResult] = await Promise.all([
          supabase.from("projects").select("*").eq("organization_id", organization.id),
          supabase.from("test_cases").select("*").eq("organization_id", organization.id).order("created_at", { ascending: false }),
          supabase.from("bugs").select("*").eq("organization_id", organization.id).order("created_at", { ascending: false }),
        ]);
        if (projectResult.error) throw projectResult.error;
        if (testCaseResult.error) throw testCaseResult.error;
        if (bugResult.error) throw bugResult.error;
        setProjects(projectResult.data ?? []);
        setTestCases(testCaseResult.data ?? []);
        setBugs(bugResult.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading reports..." />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;

  const failed = testCases.filter((item) => item.status === "Fail").slice(0, 5);
  const recentBugs = bugs.slice(0, 5);

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black">Cross-project QA report</h2>
            <p className="mt-2 text-sm text-slate-600">{projects.length} projects, {testCases.length} test cases, {bugs.length} bugs.</p>
          </div>
          <ExportButtons testCases={testCases} bugs={bugs} />
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <StatusChart data={["Not Run", "Pass", "Fail", "Blocked"].map((name) => ({ name, value: testCases.filter((item) => item.status === name).length }))} />
        <SeverityChart data={["Low", "Medium", "High", "Critical"].map((name) => ({ name, value: bugs.filter((item) => item.severity === name).length }))} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-black">Recent Bugs</h3>
          <div className="grid gap-3">
            {recentBugs.map((bug) => (
              <div key={bug.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <div><p className="font-bold">{bug.bug_title}</p><p className="text-xs text-slate-500">{bug.bug_id} · {formatDate(bug.created_at)}</p></div>
                <Badge>{bug.severity}</Badge>
              </div>
            ))}
            {recentBugs.length === 0 ? <p className="text-sm text-slate-500">No bugs found.</p> : null}
          </div>
        </Card>
        <Card>
          <h3 className="mb-4 text-lg font-black">Recent Failed Test Cases</h3>
          <div className="grid gap-3">
            {failed.map((testCase) => (
              <div key={testCase.id} className="rounded-lg border border-slate-100 p-3">
                <p className="font-bold">{testCase.title}</p>
                <p className="text-xs text-slate-500">{testCase.test_case_id} · {testCase.module}</p>
              </div>
            ))}
            {failed.length === 0 ? <p className="text-sm text-slate-500">No failed test cases found.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
