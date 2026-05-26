import { FREE_LIMITS, LIMIT_MESSAGE } from "@/lib/constants";
import type { Plan } from "@/types/app";

type LimitResource = "projects" | "testCases" | "bugs";

export function checkPlanLimit(plan: Plan, resource: LimitResource, currentCount: number) {
  if (plan !== "free") return { allowed: true, message: null };
  const limit = FREE_LIMITS[resource];
  if (currentCount >= limit) return { allowed: false, message: LIMIT_MESSAGE };
  return { allowed: true, message: null };
}

export function generateTestCaseId(existingCount: number) {
  return `TC-${String(existingCount + 1).padStart(3, "0")}`;
}

export function generateBugId(existingCount: number) {
  return `BUG-${String(existingCount + 1).padStart(3, "0")}`;
}
