/**
 * Typed client for the Python Egypt Calc sidecar (`services/egypt-calc`).
 *
 * Same contract as `python-worker-client.ts`:
 *   - Never throws — returns a discriminated `{ ok: false, reason: ... }`.
 *   - Zod-validates every response.
 *   - Reads `EGYPT_CALC_URL` (defaults to `http://localhost:8008`).
 */

import { z } from 'zod';

export const IncomeTaxResultSchema = z.object({
  annual_gross: z.number(),
  taxable_after_exemption: z.number(),
  annual_tax: z.number(),
  monthly_tax: z.number(),
  effective_rate: z.number(),
  marginal_rate: z.number(),
  breakdown: z.array(z.object({
    from: z.number(),
    to: z.number().nullable(),
    rate: z.number(),
    taxable_in_bracket: z.number(),
    tax_in_bracket: z.number(),
  })),
  as_of: z.string(),
});

export const SocialInsuranceResultSchema = z.object({
  monthly_wage: z.number(),
  insurable_wage: z.number(),
  employee_contribution: z.number(),
  employer_contribution: z.number(),
  total_contribution: z.number(),
  employer_total_cost: z.number(),
  net_after_employee_si: z.number(),
  notes: z.string(),
  as_of: z.string(),
});

export const TotalCostResultSchema = z.object({
  monthly_gross: z.number(),
  annual_gross: z.number(),
  income_tax: IncomeTaxResultSchema,
  social_insurance: SocialInsuranceResultSchema,
  monthly_net: z.number(),
  annual_net: z.number(),
  total_employer_monthly: z.number(),
  total_employer_annual: z.number(),
  as_of: z.string(),
});

export type IncomeTaxResult = z.infer<typeof IncomeTaxResultSchema>;
export type SocialInsuranceResult = z.infer<typeof SocialInsuranceResultSchema>;
export type TotalCostResult = z.infer<typeof TotalCostResultSchema>;

type Ok<T> = { ok: true; data: T };
type Err = {
  ok: false;
  reason: 'unreachable' | 'http_error' | 'invalid_response' | 'timeout';
  status?: number;
  message?: string;
};
export type CalcResult<T> = Ok<T> | Err;

const DEFAULT_TIMEOUT_MS = 5_000;

function baseUrl(override?: string): string {
  return ((override ?? process.env.EGYPT_CALC_URL ?? 'http://localhost:8008').trim()).replace(/\/+$/, '');
}

async function call<T>(
  endpoint: string,
  body: Record<string, unknown>,
  schema: z.ZodType<T>,
  opts: { workerUrl?: string; timeoutMs?: number } = {},
): Promise<CalcResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, reason: 'http_error', status: res.status, message: text.slice(0, 500) };
    }
    const json = (await res.json()) as unknown;
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return { ok: false, reason: 'invalid_response', message: parsed.error.message };
    }
    return { ok: true, data: parsed.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if ((err as { name?: string })?.name === 'AbortError') {
      return { ok: false, reason: 'timeout', message };
    }
    return { ok: false, reason: 'unreachable', message };
  } finally {
    clearTimeout(timer);
  }
}

export function calcIncomeTax(annualGross: number, opts?: { workerUrl?: string; timeoutMs?: number }) {
  return call('/income-tax', { annual_gross: annualGross }, IncomeTaxResultSchema, opts);
}

export function calcSocialInsurance(monthlyWage: number, opts?: { workerUrl?: string; timeoutMs?: number }) {
  return call('/social-insurance', { monthly_wage: monthlyWage }, SocialInsuranceResultSchema, opts);
}

export function calcTotalCost(
  monthlyGross: number,
  months: 12 | 13 | 14 = 12,
  opts?: { workerUrl?: string; timeoutMs?: number },
) {
  return call('/total-cost', { monthly_gross: monthlyGross, months }, TotalCostResultSchema, opts);
}

export async function isEgyptCalcHealthy(opts: { workerUrl?: string; timeoutMs?: number } = {}): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 2_000);
  try {
    const res = await fetch(`${baseUrl(opts.workerUrl)}/health`, { signal: ctrl.signal });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean };
    return body?.ok === true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}
