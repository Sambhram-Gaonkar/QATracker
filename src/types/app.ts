import type {
  BUG_STATUSES,
  PLANS,
  PRIORITIES,
  PROJECT_STATUSES,
  SEVERITIES,
  TEST_CASE_STATUSES,
} from "@/lib/constants";

export type TestCaseStatus = (typeof TEST_CASE_STATUSES)[number];
export type BugStatus = (typeof BUG_STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type Plan = (typeof PLANS)[number];

export type Organization = {
  id: string;
  name: string;
  owner_id: string | null;
  plan: Plan;
  created_at: string | null;
  updated_at: string | null;
};

export type Project = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TestCase = {
  id: string;
  project_id: string;
  organization_id: string;
  module: string;
  test_case_id: string;
  title: string;
  preconditions: string | null;
  test_steps: string;
  expected_result: string;
  actual_result: string | null;
  priority: Priority;
  status: TestCaseStatus;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Bug = {
  id: string;
  project_id: string;
  organization_id: string;
  bug_id: string;
  bug_title: string;
  module_feature: string;
  test_steps: string;
  expected_result: string;
  actual_result: string;
  severity: Severity;
  priority: Priority;
  status: BugStatus;
  proof_url: string | null;
  proof_file_path: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};
