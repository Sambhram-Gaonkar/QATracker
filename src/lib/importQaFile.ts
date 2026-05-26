"use client";

import * as XLSX from "xlsx";
import { BUG_STATUSES, PRIORITIES, SEVERITIES, TEST_CASE_STATUSES } from "@/lib/constants";
import type { BugStatus, Priority, Severity, TestCaseStatus } from "@/types/app";

export type ImportedTestCase = {
  module: string;
  test_case_id: string;
  title: string;
  preconditions: string;
  test_steps: string;
  expected_result: string;
  actual_result: string;
  priority: Priority;
  status: TestCaseStatus;
  source_sheet: string;
};

export type ImportedBug = {
  bug_id: string;
  bug_title: string;
  module_feature: string;
  test_steps: string;
  expected_result: string;
  actual_result: string;
  severity: Severity;
  priority: Priority;
  status: BugStatus;
  proof_url: string;
  source_sheet: string;
};

export type ImportResult = {
  testCases: ImportedTestCase[];
  bugs: ImportedBug[];
  sheetSummaries: { sheet: string; type: "test_cases" | "bugs" | "skipped"; count: number }[];
};

type HeaderMap = Record<string, number>;

const headerAliases: Record<string, string[]> = {
  module: ["module"],
  test_case_id: ["test case id", "testcase id", "tc id", "case id"],
  title: ["title", "test case", "test case title", "scenario"],
  preconditions: ["preconditions", "precondition"],
  test_steps: ["test steps", "steps", "step"],
  expected_result: ["expected result", "expected results", "expected"],
  actual_result: ["actual result", "actual results", "actual"],
  status: ["status", "result"],
  priority: ["priority"],
  bug_id: ["bug id", "bugid", "defect id", "issue id"],
  bug_title: ["bug title", "title", "summary", "bug"],
  module_feature: ["module/ feature", "module/feature", "module feature", "module", "feature"],
  severity: ["severity"],
  proof_url: ["proof", "proof url", "screenshot", "attachment"],
};

function cell(value: unknown) {
  return String(value ?? "").replace(/\u00a0/g, " ").trim();
}

function normalizeHeader(value: unknown) {
  return cell(value).toLowerCase().replace(/\s+/g, " ");
}

function findHeaderIndex(headers: string[], field: string) {
  const aliases = headerAliases[field] ?? [field];
  return headers.findIndex((header) => aliases.includes(header));
}

function buildHeaderMap(row: unknown[]): HeaderMap {
  const headers = row.map(normalizeHeader);
  return Object.keys(headerAliases).reduce<HeaderMap>((map, field) => {
    const index = findHeaderIndex(headers, field);
    if (index >= 0) map[field] = index;
    return map;
  }, {});
}

function isTestCaseHeader(map: HeaderMap) {
  return map.test_case_id !== undefined && map.title !== undefined && map.test_steps !== undefined;
}

function isBugHeader(map: HeaderMap) {
  return map.bug_id !== undefined && map.bug_title !== undefined && map.actual_result !== undefined;
}

function findHeaderRow(rows: unknown[][]) {
  for (let index = 0; index < Math.min(rows.length, 12); index += 1) {
    const map = buildHeaderMap(rows[index]);
    if (isBugHeader(map)) return { index, map, type: "bugs" as const };
    if (isTestCaseHeader(map)) return { index, map, type: "test_cases" as const };
  }
  return null;
}

function pick(row: unknown[], map: HeaderMap, field: string) {
  const index = map[field];
  return index === undefined ? "" : cell(row[index]);
}

function normalizePriority(value: string): Priority {
  const match = PRIORITIES.find((priority) => priority.toLowerCase() === value.toLowerCase());
  return match ?? "Medium";
}

function normalizeSeverity(value: string): Severity {
  const match = SEVERITIES.find((severity) => severity.toLowerCase() === value.toLowerCase());
  return match ?? "Medium";
}

function normalizeTestStatus(value: string): TestCaseStatus {
  const match = TEST_CASE_STATUSES.find((status) => status.toLowerCase() === value.toLowerCase());
  return match ?? "Not Run";
}

function normalizeBugStatus(value: string): BugStatus {
  const normalized = value.toLowerCase();
  if (["new", "reopen", "reopened"].includes(normalized)) return "Open";
  const match = BUG_STATUSES.find((status) => status.toLowerCase() === normalized);
  return match ?? "Open";
}

function hasUsefulCells(row: unknown[]) {
  return row.some((value) => cell(value));
}

function parseTestCases(rows: unknown[][], headerIndex: number, map: HeaderMap, sheet: string) {
  const imported: ImportedTestCase[] = [];
  let currentModule = "";

  rows.slice(headerIndex + 1).forEach((row) => {
    if (!hasUsefulCells(row)) return;
    const module = pick(row, map, "module");
    if (module) currentModule = module;

    const title = pick(row, map, "title");
    const testSteps = pick(row, map, "test_steps");
    const expectedResult = pick(row, map, "expected_result");
    const testCaseId = pick(row, map, "test_case_id");

    if (!title || !testSteps || !expectedResult) return;

    imported.push({
      module: currentModule || "General",
      test_case_id: testCaseId,
      title,
      preconditions: pick(row, map, "preconditions"),
      test_steps: testSteps,
      expected_result: expectedResult,
      actual_result: pick(row, map, "actual_result"),
      priority: normalizePriority(pick(row, map, "priority")),
      status: normalizeTestStatus(pick(row, map, "status")),
      source_sheet: sheet,
    });
  });

  return imported;
}

function parseBugs(rows: unknown[][], headerIndex: number, map: HeaderMap, sheet: string) {
  const imported: ImportedBug[] = [];

  rows.slice(headerIndex + 1).forEach((row) => {
    if (!hasUsefulCells(row)) return;
    const bugTitle = pick(row, map, "bug_title");
    const testSteps = pick(row, map, "test_steps");
    const expectedResult = pick(row, map, "expected_result");
    const actualResult = pick(row, map, "actual_result");

    if (!bugTitle || !testSteps || !expectedResult || !actualResult) return;

    imported.push({
      bug_id: pick(row, map, "bug_id"),
      bug_title: bugTitle,
      module_feature: pick(row, map, "module_feature") || "General",
      test_steps: testSteps,
      expected_result: expectedResult,
      actual_result: actualResult,
      severity: normalizeSeverity(pick(row, map, "severity")),
      priority: normalizePriority(pick(row, map, "priority")),
      status: normalizeBugStatus(pick(row, map, "status")),
      proof_url: pick(row, map, "proof_url"),
      source_sheet: sheet,
    });
  });

  return imported;
}

export async function parseQaImportFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const result: ImportResult = { testCases: [], bugs: [], sheetSummaries: [] };

  workbook.SheetNames.forEach((sheet) => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheet], { header: 1, defval: "" });
    const header = findHeaderRow(rows);
    if (!header) {
      result.sheetSummaries.push({ sheet, type: "skipped", count: 0 });
      return;
    }

    if (header.type === "bugs") {
      const bugs = parseBugs(rows, header.index, header.map, sheet);
      result.bugs.push(...bugs);
      result.sheetSummaries.push({ sheet, type: "bugs", count: bugs.length });
      return;
    }

    const testCases = parseTestCases(rows, header.index, header.map, sheet);
    result.testCases.push(...testCases);
    result.sheetSummaries.push({ sheet, type: "test_cases", count: testCases.length });
  });

  return result;
}
