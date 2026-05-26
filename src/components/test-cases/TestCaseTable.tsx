"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TEST_CASE_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { TestCase, TestCaseStatus } from "@/types/app";

export function TestCaseTable({
  testCases,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  testCases: TestCase[];
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCase: TestCase) => void;
  onStatusChange: (testCase: TestCase, status: TestCaseStatus) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Test Case ID</th>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created Date</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {testCases.map((testCase) => (
            <tr key={testCase.id}>
              <td className="px-4 py-3 font-bold">{testCase.test_case_id}</td>
              <td className="px-4 py-3">{testCase.module}</td>
              <td className="max-w-md px-4 py-3">{testCase.title}</td>
              <td className="px-4 py-3"><Badge>{testCase.priority}</Badge></td>
              <td className="px-4 py-3">
                <Select
                  aria-label="Update status"
                  options={TEST_CASE_STATUSES}
                  value={testCase.status}
                  onChange={(e) => onStatusChange(testCase, e.target.value as TestCaseStatus)}
                />
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(testCase.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onEdit(testCase)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="danger" onClick={() => onDelete(testCase)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
