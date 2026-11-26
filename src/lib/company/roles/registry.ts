import { MARKETING_ROLE } from "./marketing";
import { SALES_ROLE } from "./sales";

/** Roles available to the company-in-a-box flow. Add one role per release. */
export const ROLES = { marketing: MARKETING_ROLE, sales: SALES_ROLE } as const;
export type RoleId = keyof typeof ROLES;
export function isRoleId(x: unknown): x is RoleId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(ROLES, x);
}
