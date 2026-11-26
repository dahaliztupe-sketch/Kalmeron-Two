/**
 * Orchestrator: pure state logic for running the role agents in roadmap order
 * over one Company Brief. No network here; the dashboard does the calls.
 * Approval is a local review mark. It triggers nothing and is not saved.
 */
export const ROLE_ORDER = ["marketing", "sales", "finance", "product", "legal", "ops"] as const;

export const ROLE_LABELS_AR: Record<string, string> = {
  marketing: "التسويق",
  sales: "المبيعات",
  finance: "المالية",
  product: "المنتج والتطوير",
  legal: "القانون والإدارة (مصر)",
  ops: "العمليات والموارد البشرية",
};

export type RoleStatus = "idle" | "running" | "done" | "failed" | "approved";
export interface RoleState {
  status: RoleStatus;
  output?: unknown;
  warnings: string[];
  error?: string;
}
export type CompanyState = Record<string, RoleState>;

/** Registered roles in roadmap order; roles missing from ROLE_ORDER go last. */
export function orderedRoles(registered: string[]): string[] {
  const known = ROLE_ORDER.filter((r) => registered.includes(r));
  const extra = registered.filter((r) => !(ROLE_ORDER as readonly string[]).includes(r)).sort();
  return [...known, ...extra];
}

export function initState(roles: string[]): CompanyState {
  return Object.fromEntries(roles.map((r) => [r, { status: "idle" as RoleStatus, warnings: [] }]));
}

export type Action =
  | { type: "start"; role: string }
  | { type: "done"; role: string; output: unknown; warnings: string[] }
  | { type: "fail"; role: string; error: string }
  | { type: "approve"; role: string }
  | { type: "unapprove"; role: string };

export function reduce(s: CompanyState, a: Action): CompanyState {
  const cur = s[a.role];
  if (!cur) return s;
  switch (a.type) {
    case "start":
      return { ...s, [a.role]: { status: "running", warnings: [] } };
    case "done":
      return { ...s, [a.role]: { status: "done", output: a.output, warnings: a.warnings } };
    case "fail":
      return { ...s, [a.role]: { status: "failed", warnings: [], error: a.error } };
    case "approve":
      return cur.status === "done" ? { ...s, [a.role]: { ...cur, status: "approved" } } : s;
    case "unapprove":
      return cur.status === "approved" ? { ...s, [a.role]: { ...cur, status: "done" } } : s;
  }
}

/** Next role that still needs a run: idle or failed, in order. */
export function nextPending(s: CompanyState, order: string[]): string | null {
  return order.find((r) => s[r]?.status === "idle" || s[r]?.status === "failed") ?? null;
}

export function summary(s: CompanyState, order: string[]) {
  const c = { idle: 0, running: 0, done: 0, failed: 0, approved: 0 } as Record<RoleStatus, number>;
  for (const r of order) if (s[r]) c[s[r].status]++;
  return c;
}
