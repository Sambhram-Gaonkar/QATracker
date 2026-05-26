export const TEST_CASE_STATUSES = ["Not Run", "Pass", "Fail", "Blocked"] as const;
export const BUG_STATUSES = ["Open", "In Progress", "Fixed", "Closed", "Rejected"] as const;
export const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;
export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const PROJECT_STATUSES = ["Active", "Archived"] as const;
export const PLANS = ["free", "pro", "team"] as const;

export const FREE_LIMITS = {
  projects: 1,
  testCases: 20,
  bugs: 10,
};

export const LIMIT_MESSAGE = "You have reached the Free plan limit. Upgrade to Pro to continue.";
