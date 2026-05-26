"use client";

import type { User } from "@supabase/supabase-js";
import type { Bug, Organization, Project, TestCase } from "@/types/app";

type TableName = "organizations" | "organization_members" | "projects" | "test_cases" | "bugs" | "user_profiles";
type DemoRow = Organization | DemoMember | Project | TestCase | Bug | DemoProfile;
type Filter = { column: string; value: unknown };

type DemoMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "tester" | "viewer";
  created_at: string | null;
};

type DemoProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type DemoStore = {
  organizations: Organization[];
  organization_members: DemoMember[];
  projects: Project[];
  test_cases: TestCase[];
  bugs: Bug[];
  user_profiles: DemoProfile[];
};

const STORE_KEY = "qatrackr-demo-store";
const DEMO_USER_ID = "local-demo-user";
const DEMO_ORG_ID = "local-demo-organization";
const DEMO_EMAIL = "demo@qatrackr.local";

const demoUser = {
  id: DEMO_USER_ID,
  email: DEMO_EMAIL,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

function now() {
  return new Date().toISOString();
}

function createDefaultStore(): DemoStore {
  const timestamp = now();
  return {
    organizations: [
      {
        id: DEMO_ORG_ID,
        name: "My Workspace",
        owner_id: DEMO_USER_ID,
        plan: "pro",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
    organization_members: [
      {
        id: "local-demo-member",
        organization_id: DEMO_ORG_ID,
        user_id: DEMO_USER_ID,
        role: "owner",
        created_at: timestamp,
      },
    ],
    projects: [],
    test_cases: [],
    bugs: [],
    user_profiles: [
      {
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        full_name: "Local Demo User",
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
  };
}

function getStore(): DemoStore {
  const existing = window.localStorage.getItem(STORE_KEY);
  if (!existing) {
    const store = createDefaultStore();
    saveStore(store);
    return store;
  }
  return JSON.parse(existing) as DemoStore;
}

function saveStore(store: DemoStore) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function getTable(store: DemoStore, table: TableName): DemoRow[] {
  return store[table] as DemoRow[];
}

function setTable(store: DemoStore, table: TableName, rows: DemoRow[]) {
  (store[table] as DemoRow[]) = rows;
}

function withTimestamps<T extends Record<string, unknown>>(payload: T) {
  const timestamp = now();
  return {
    id: typeof payload.id === "string" ? payload.id : crypto.randomUUID(),
    created_at: timestamp,
    updated_at: timestamp,
    ...payload,
  };
}

function applyFilters(rows: DemoRow[], filters: Filter[]) {
  return rows.filter((row) =>
    filters.every((filter) => (row as Record<string, unknown>)[filter.column] === filter.value),
  );
}

function addOrganizationJoin(row: DemoRow, store: DemoStore) {
  if (!("organization_id" in row)) return row;
  return {
    ...row,
    organizations: store.organizations.find((organization) => organization.id === row.organization_id) ?? null,
  };
}

class DemoQueryBuilder {
  private filters: Filter[] = [];
  private selected = "*";
  private countMode = false;
  private headMode = false;
  private singleMode = false;
  private maybeSingleMode = false;
  private limitCount: number | null = null;
  private orderColumn: string | null = null;
  private orderAscending = true;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private payload: Record<string, unknown> | Record<string, unknown>[] | null = null;

  constructor(private readonly table: TableName) {}

  select(columns = "*", options?: { count?: "exact"; head?: boolean }) {
    this.selected = columns;
    this.countMode = options?.count === "exact";
    this.headMode = options?.head === true;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleMode = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleMode = true;
    return this;
  }

  insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  then<TResult1 = DemoResult, TResult2 = never>(
    onfulfilled?: ((value: DemoResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<DemoResult> {
    const store = getStore();
    const rows = getTable(store, this.table);

    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
      const inserted = payloads.map((payload) => withTimestamps(payload));
      setTable(store, this.table, [...rows, ...(inserted as DemoRow[])]);
      saveStore(store);
      return this.formatResult(inserted as DemoRow[], store);
    }

    if (this.operation === "update") {
      const matched = applyFilters(rows, this.filters);
      const updatedRows = rows.map((row) =>
        matched.includes(row)
          ? ({
              ...row,
              ...(this.payload as Record<string, unknown>),
              updated_at: now(),
            } as DemoRow)
          : row,
      );
      setTable(store, this.table, updatedRows);
      saveStore(store);
      return { data: null, error: null, count: matched.length };
    }

    if (this.operation === "delete") {
      const matched = applyFilters(rows, this.filters);
      setTable(
        store,
        this.table,
        rows.filter((row) => !matched.includes(row)),
      );
      saveStore(store);
      return { data: null, error: null, count: matched.length };
    }

    let result = applyFilters(rows, this.filters);
    if (this.orderColumn) {
      result = [...result].sort((left, right) => {
        const leftValue = String((left as Record<string, unknown>)[this.orderColumn ?? ""] ?? "");
        const rightValue = String((right as Record<string, unknown>)[this.orderColumn ?? ""] ?? "");
        return this.orderAscending ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue);
      });
    }
    if (this.limitCount !== null) result = result.slice(0, this.limitCount);
    return this.formatResult(result, store);
  }

  private formatResult(rows: DemoRow[], store: DemoStore): DemoResult {
    const shaped = this.selected.includes("organizations")
      ? rows.map((row) => addOrganizationJoin(row, store))
      : rows;

    if (this.headMode) return { data: null, error: null, count: shaped.length };
    if (this.singleMode) return { data: shaped[0] ?? null, error: shaped[0] ? null : { message: "No rows found." }, count: shaped.length };
    if (this.maybeSingleMode) return { data: shaped[0] ?? null, error: null, count: shaped.length };
    return { data: shaped, error: null, count: this.countMode ? shaped.length : null };
  }
}

type DemoResult = {
  data: unknown;
  error: null | { message: string };
  count?: number | null;
};

export function createLocalDemoClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: demoUser }, error: null };
      },
      async signUp() {
        getStore();
        return { data: { user: demoUser }, error: null };
      },
      async signInWithPassword() {
        getStore();
        return { data: { user: demoUser }, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
    from(table: TableName) {
      return new DemoQueryBuilder(table);
    },
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string) {
            return { data: { path }, error: null };
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `local-demo://${bucket}/${path}` } };
          },
        };
      },
    },
  };
}

export function isLocalDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
