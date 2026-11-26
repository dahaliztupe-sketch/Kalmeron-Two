import { MARKETING_ROLE } from "./marketing";

/** Roles available to the company-in-a-box flow. Add one role per release. */
export const ROLES = { marketing: MARKETING_ROLE } as const;
export type RoleId = keyof typeof ROLES;
export function isRoleId(x: unknown): x is RoleId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(ROLES, x);
}
