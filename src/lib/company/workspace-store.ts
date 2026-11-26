/**
 * Saved company workspace: one per signed-in user, server-only (Firebase Admin).
 * Firestore rules deny all client access to this collection; the API checks the
 * caller's token and uses the uid as the document id, so there is no way to name
 * another user's workspace. Everything is re-validated on write AND on read.
 */
import { z } from "zod";
import { adminDb } from "@/src/lib/firebase-admin";
import { ValidatedPlanSchema, type ValidatedPlan } from "@/src/lib/plan/validated-plan";
import { IntakeSchema, type Intake } from "@/src/lib/company/intake";
import { ROLES, isRoleId } from "@/src/lib/company/roles/registry";
import type { CompanyState, RoleStatus } from "@/src/lib/company/orchestrator";

export const WORKSPACES_COLLECTION = "company_workspaces";
export const MAX_WORKSPACE_BYTES = 300_000;

const SAVED_STATUS = ["idle", "done", "failed", "approved"] as const;

const RoleSavedSchema = z.object({
  status: z.enum(SAVED_STATUS),
  output: z.unknown().optional(),
  warnings: z.array(z.string().max(400)).max(20).default([]),
  error: z.string().max(200).optional(),
  stale: z.boolean().optional(),
});

export const WorkspaceBodySchema = z.object({
  plan: ValidatedPlanSchema,
  intake: IntakeSchema,
  state: z.record(z.string(), RoleSavedSchema),
});

export interface Workspace {
  plan: ValidatedPlan;
  intake: Intake;
  state: CompanyState;
}

/**
 * Keeps only known roles. A role with output keeps it only if it passes that role's own
 * output schema; otherwise the role resets to idle. "running" is never stored.
 */
export function sanitizeWorkspace(body: unknown): Workspace | null {
  const parsed = WorkspaceBodySchema.safeParse(body);
  if (!parsed.success) return null;
  const entries = new Map<string, CompanyState[string]>();
  for (const [role, st] of Object.entries(parsed.data.state)) {
    if (!isRoleId(role)) continue;
    const hasOutput = st.status === "done" || st.status === "approved";
    if (hasOutput) {
      const out = ROLES[role].outputSchema.safeParse(st.output);
      if (!out.success) {
        entries.set(role, { status: "idle", warnings: [] });
        continue;
      }
      entries.set(role, { status: st.status as RoleStatus, output: out.data, warnings: st.warnings, ...(st.stale ? { stale: true } : {}) });
    } else {
      entries.set(role, { status: st.status === "failed" ? "failed" : "idle", warnings: [], ...(st.error ? { error: st.error } : {}) });
    }
  }
  const state = Object.fromEntries(entries) as CompanyState;
  const ws: Workspace = { plan: parsed.data.plan, intake: parsed.data.intake, state };
  if (JSON.stringify(ws).length > MAX_WORKSPACE_BYTES) return null;
  return ws;
}

export async function saveWorkspace(userId: string, ws: Workspace): Promise<void> {
  await adminDb.collection(WORKSPACES_COLLECTION).doc(userId).set({ userId, ...ws, updatedAt: Date.now() });
}

export async function loadWorkspace(userId: string): Promise<Workspace | null> {
  const snap = await adminDb.collection(WORKSPACES_COLLECTION).doc(userId).get();
  if (!snap.exists) return null;
  const d = snap.data();
  return sanitizeWorkspace({ plan: d?.plan, intake: d?.intake, state: d?.state });
}

export async function deleteWorkspace(userId: string): Promise<void> {
  await adminDb.collection(WORKSPACES_COLLECTION).doc(userId).delete();
}
