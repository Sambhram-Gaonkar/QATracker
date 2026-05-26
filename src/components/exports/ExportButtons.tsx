"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { exportBugsToExcel, exportProjectReportToExcel, exportTestCasesToExcel } from "@/lib/exportExcel";
import type { Bug, Project, TestCase } from "@/types/app";

export function ExportButtons({
  project,
  testCases,
  bugs,
}: {
  project?: Project;
  testCases: TestCase[];
  bugs: Bug[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" variant="secondary" onClick={() => exportTestCasesToExcel(testCases)}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Test Cases
      </Button>
      <Button type="button" variant="secondary" onClick={() => exportBugsToExcel(bugs)}>
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Bugs
      </Button>
      {project ? (
        <Button type="button" onClick={() => exportProjectReportToExcel(project, testCases, bugs)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Full Report
        </Button>
      ) : null}
    </div>
  );
}
