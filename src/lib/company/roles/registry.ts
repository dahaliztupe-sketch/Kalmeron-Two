import { MARKETING_ROLE } from "./marketing";
import { SALES_ROLE } from "./sales";
import { PRODUCT_ROLE } from "./product";
import { LEGAL_ROLE } from "./legal";
import { OPS_ROLE } from "./ops";
import { FINANCE_ROLE } from "./finance";
import { ENGINEERING_ROLE } from "./engineering";
import { DATA_ROLE } from "./data";
import { SUPPORT_ROLE } from "./support";
import { STRATEGY_ROLE } from "./strategy";

/** Roles available to the company-in-a-box flow. Add one role per release. */
export const ROLES = { marketing: MARKETING_ROLE, sales: SALES_ROLE, product: PRODUCT_ROLE, legal: LEGAL_ROLE, ops: OPS_ROLE, finance: FINANCE_ROLE, engineering: ENGINEERING_ROLE, data: DATA_ROLE, support: SUPPORT_ROLE, strategy: STRATEGY_ROLE } as const;
export type RoleId = keyof typeof ROLES;
export function isRoleId(x: unknown): x is RoleId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(ROLES, x);
}
