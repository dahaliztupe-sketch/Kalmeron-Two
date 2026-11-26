/**
 * Orchestrator: pure state logic for running the role agents in roadmap order
 * over one Company Brief. No network here; the dashboard does the calls.
 * Approval is a local review mark. It triggers nothing and is not saved.
 */
export const ROLE_ORDER = ["marketing", "sales", "finance", "product", "legal", "ops"] as const;

/** Roles a signed-out visitor may try: one role, cheaper model, global daily cap (see /api/company/role). */
export const GUEST_ROLES: string[] = ["marketing"];

export const ROLE_LABELS_AR: Record<string, string> = {
  marketing: "التسويق",
  sales: "المبيعات",
  finance: "المالية",
  product: "المنتج والتطوير",
  legal: "القانون والإدارة (مصر)",
  ops: "العمليات والموارد البشرية",
};

/** Which earlier role outputs each role may read. Keeps prompts short and the flow explainable. */
export const DEPENDS_ON: Record<string, string[]> = {
  sales: ["marketing"],
  finance: ["marketing", "sales"],
  product: ["sales"],
  legal: ["product", "finance"],
  ops: ["product", "finance"],
};

/** All roles that read `role` directly or through another role. */
export function downstreamOf(role: string): string[] {
  const out = new Set<string>();
  const walk = (r: string) => {
    for (const [k, deps] of Object.entries(DEPENDS_ON)) {
      if (deps.includes(r) && !out.has(k)) {
        out.add(k);
        walk(k);
      }
    }
  };
  walk(role);
  return [...out];
}

export type RoleStatus = "idle" | "running" | "done" | "failed" | "approved";
export interface RoleState {
  status: RoleStatus;
  output?: unknown;
  warnings: string[];
  error?: string;
  /** An upstream role was regenerated after this draft was made. */
  stale?: boolean;
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
  | { type: "unapprove"; role: string }
  | { type: "load"; state: CompanyState };

export function reduce(s: CompanyState, a: Action): CompanyState {
  if (a.type === "load") return { ...s, ...Object.fromEntries(Object.entries(a.state).filter(([r]) => r in s)) };
  const cur = s[a.role];
  if (!cur) return s;
  switch (a.type) {
    case "start": {
      const next: CompanyState = { ...s, [a.role]: { status: "running", warnings: [] } };
      if (cur.output !== undefined) {
        for (const d of downstreamOf(a.role)) {
          const ds = next[d];
          if (ds && ds.output !== undefined && (ds.status === "done" || ds.status === "approved")) next[d] = { ...ds, status: "done", stale: true };
        }
      }
      return next;
    }
    case "done":
      return { ...s, [a.role]: { status: "done", output: a.output, warnings: a.warnings } };
    case "fail":
      return { ...s, [a.role]: { status: "failed", warnings: [], error: a.error } };
    case "approve":
      return cur.status === "done" && !cur.stale ? { ...s, [a.role]: { ...cur, status: "approved" } } : s;
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

/**
 * Stage gate: a role may run only when every earlier role in `order` is approved
 * (reviewed by the founder) and not stale. Returns the blocking role, or null.
 * Gates are a review habit, not a safety control: approval is a local mark.
 */
export function blockedBy(s: CompanyState, order: string[], role: string): string | null {
  const i = order.indexOf(role);
  for (const r of order.slice(0, Math.max(i, 0))) {
    const st = s[r];
    if (!st || st.status !== "approved" || st.stale) return r;
  }
  return null;
}

/** The one role the founder should work on next under the gates, or null when all are approved. */
export function currentStage(s: CompanyState, order: string[]): string | null {
  return order.find((r) => s[r]?.status !== "approved") ?? null;
}
