"use client";

import * as XLSX from "xlsx";
import type { Bug, Project, TestCase } from "@/types/app";

function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName);
}

export function exportTestCasesToExcel(testCases: TestCase[], fileName = "test-cases.xlsx") {
  const workbook = XLSX.utils.book_new();
  const rows = testCases.map((testCase) => ({
    Module: testCase.module,
    "Test Case ID": testCase.test_case_id,
    Title: testCase.title,
    Preconditions: testCase.preconditions ?? "",
    "Test Steps": testCase.test_steps,
    "Expected Result": testCase.expected_result,
    "Actual Result": testCase.actual_result ?? "",
    Priority: testCase.priority,
    Status: testCase.status,
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Test Cases");
  downloadWorkbook(workbook, fileName);
}

export function exportBugsToExcel(bugs: Bug[], fileName = "bug-reports.xlsx") {
  const workbook = XLSX.utils.book_new();
  const rows = bugs.map((bug) => ({
    "Bug ID": bug.bug_id,
    "Bug Title": bug.bug_title,
    "Module/Feature": bug.module_feature,
    "Test Steps": bug.test_steps,
    "Expected Result": bug.expected_result,
    "Actual Result": bug.actual_result,
    Severity: bug.severity,
    Priority: bug.priority,
    "Proof URL": bug.proof_url ?? "",
    Status: bug.status,
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Bug Reports");
  downloadWorkbook(workbook, fileName);
}

export function exportProjectReportToExcel(project: Project, testCases: TestCase[], bugs: Bug[]) {
  const workbook = XLSX.utils.book_new();
  const summary = [
    {
      "Project Name": project.name,
      "Total Test Cases": testCases.length,
      Passed: testCases.filter((item) => item.status === "Pass").length,
      Failed: testCases.filter((item) => item.status === "Fail").length,
      Blocked: testCases.filter((item) => item.status === "Blocked").length,
      "Not Run": testCases.filter((item) => item.status === "Not Run").length,
      "Total Bugs": bugs.length,
      "Open Bugs": bugs.filter((item) => item.status === "Open").length,
      "Critical Bugs": bugs.filter((item) => item.severity === "Critical").length,
      "High Bugs": bugs.filter((item) => item.severity === "High").length,
    },
  ];

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summary), "Summary");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      testCases.map((testCase) => ({
        Module: testCase.module,
        "Test Case ID": testCase.test_case_id,
        Title: testCase.title,
        Preconditions: testCase.preconditions ?? "",
        "Test Steps": testCase.test_steps,
        "Expected Result": testCase.expected_result,
        "Actual Result": testCase.actual_result ?? "",
        Priority: testCase.priority,
        Status: testCase.status,
      })),
    ),
    "Test Cases",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      bugs.map((bug) => ({
        "Bug ID": bug.bug_id,
        "Bug Title": bug.bug_title,
        "Module/Feature": bug.module_feature,
        "Test Steps": bug.test_steps,
        "Expected Result": bug.expected_result,
        "Actual Result": bug.actual_result,
        Severity: bug.severity,
        Priority: bug.priority,
        "Proof URL": bug.proof_url ?? "",
        Status: bug.status,
      })),
    ),
    "Bug Reports",
  );
  downloadWorkbook(workbook, `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qa-report.xlsx`);
}
