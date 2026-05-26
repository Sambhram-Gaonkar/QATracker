"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { checkPlanLimit, generateBugId, generateTestCaseId } from "@/lib/planLimits";
import { parseQaImportFile } from "@/lib/importQaFile";
import { createClient } from "@/lib/supabase/client";
import { getSignedInWorkspace } from "@/lib/clientWorkspace";
import type { Bug, Project, TestCase } from "@/types/app";

export function ImportReportButton({
  project,
  existingTestCases,
  existingBugs,
  mode = "all",
  onImported,
}: {
  project: Project;
  existingTestCases: TestCase[];
  existingBugs: Bug[];
  mode?: "all" | "test_cases" | "bugs";
  onImported: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);

  async function importFile(file: File) {
    setMessage("");
    setImporting(true);

    try {
      const supabase = createClient();
      const { user, organization } = await getSignedInWorkspace(supabase);
      const parsed = await parseQaImportFile(file);
      const testCasesToImport = mode === "bugs" ? [] : parsed.testCases;
      const bugsToImport = mode === "test_cases" ? [] : parsed.bugs;

      const testLimit = checkPlanLimit(
        organization.plan,
        "testCases",
        existingTestCases.length + Math.max(0, testCasesToImport.length - 1),
      );
      if (testCasesToImport.length && !testLimit.allowed) {
        setMessage(testLimit.message ?? "Test case import exceeds plan limit.");
        return;
      }

      const bugLimit = checkPlanLimit(
        organization.plan,
        "bugs",
        existingBugs.length + Math.max(0, bugsToImport.length - 1),
      );
      if (bugsToImport.length && !bugLimit.allowed) {
        setMessage(bugLimit.message ?? "Bug import exceeds plan limit.");
        return;
      }

      const testPayload = testCasesToImport.map((testCase, index) => ({
        project_id: project.id,
        organization_id: organization.id,
        module: testCase.module,
        test_case_id: testCase.test_case_id || generateTestCaseId(existingTestCases.length + index),
        title: testCase.title,
        preconditions: testCase.preconditions,
        test_steps: testCase.test_steps,
        expected_result: testCase.expected_result,
        actual_result: testCase.actual_result,
        priority: testCase.priority,
        status: testCase.status,
        created_by: user.id,
      }));

      const bugPayload = bugsToImport.map((bug, index) => ({
        project_id: project.id,
        organization_id: organization.id,
        bug_id: bug.bug_id || generateBugId(existingBugs.length + index),
        bug_title: bug.bug_title,
        module_feature: bug.module_feature,
        test_steps: bug.test_steps,
        expected_result: bug.expected_result,
        actual_result: bug.actual_result,
        severity: bug.severity,
        priority: bug.priority,
        status: bug.status,
        proof_url: bug.proof_url || null,
        proof_file_path: null,
        created_by: user.id,
      }));

      if (testPayload.length) {
        const { error } = await supabase.from("test_cases").insert(testPayload);
        if (error) throw new Error(error.message);
      }

      if (bugPayload.length) {
        const { error } = await supabase.from("bugs").insert(bugPayload);
        if (error) throw new Error(error.message);
      }

      await onImported();
      const summary = parsed.sheetSummaries
        .filter((sheet) => sheet.count > 0)
        .map((sheet) => `${sheet.sheet}: ${sheet.count}`)
        .join(", ");
      setMessage(
        `Imported ${testPayload.length} test cases and ${bugPayload.length} bugs.${summary ? ` Sheets: ${summary}` : ""}`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import this file.");
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void importFile(file);
        }}
      />
      <Button type="button" variant="secondary" disabled={importing} onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        {importing ? "Importing..." : "Import Excel/CSV"}
      </Button>
      {message ? <p className="max-w-3xl text-sm font-semibold text-slate-600">{message}</p> : null}
    </div>
  );
}
