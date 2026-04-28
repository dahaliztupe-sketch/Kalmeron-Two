// @ts-nocheck
/**
 * egypt-calc-tool — Deterministic tax/insurance calculator wired to the
 * Egypt-Calc Python sidecar (Phase C7).
 *
 * Why a side-service instead of LLM math?
 *   LLMs hallucinate tax brackets, rounding, and payroll caps. The Egypt-Calc
 *   service is a small typed library backed by unit tests against the
 *   official Egyptian tax tables — calling it returns *deterministic* numbers
 *   the CFO agent can then explain in narrative form.
 *
 * Environment:
 *   EGYPT_CALC_URL — defaults to http://localhost:8008 in dev. Production
 *   should set this to the internal service URL.
 */

const BASE = process.env.EGYPT_CALC_URL || 'http://localhost:8008';

async function postJSON<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`egypt-calc ${path} → ${res.status}: ${txt.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export interface IncomeTaxResult {
  annual_gross: number;
  taxable_after_exemption: number;
  annual_tax: number;
  monthly_tax: number;
  effective_rate: number;
  marginal_rate: number;
  breakdown: Array<{ from: number; to: number | null; rate: number; taxable_in_bracket: number; tax_in_bracket: number }>;
  as_of?: string;
}

export interface SocialInsuranceResult {
  monthly_wage: number;
  insurable_wage: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
  employer_total_cost: number;
  net_after_employee_si: number;
  notes?: string;
  as_of?: string;
}

export interface TotalCostResult {
  monthly_gross: number;
  annual_gross: number;
  income_tax: IncomeTaxResult;
  social_insurance: SocialInsuranceResult;
  monthly_net: number;
  annual_net: number;
  total_employer_monthly: number;
  total_employer_annual: number;
  as_of?: string;
}

export async function calcIncomeTax(annualGross: number): Promise<IncomeTaxResult> {
  return postJSON<IncomeTaxResult>('/income-tax', { annual_gross: annualGross });
}

export async function calcSocialInsurance(monthlyWage: number): Promise<SocialInsuranceResult> {
  return postJSON<SocialInsuranceResult>('/social-insurance', { monthly_wage: monthlyWage });
}

export async function calcTotalCost(monthlyGross: number, months: 12 | 13 | 14 = 12): Promise<TotalCostResult> {
  return postJSON<TotalCostResult>('/total-cost', { monthly_gross: monthlyGross, months });
}

/**
 * Light keyword + regex extractor — pulls a number from the user message and
 * picks the right Egypt-Calc endpoint. Returns `null` if the message is not
 * obviously a tax/insurance/total-cost question, so the supervisor can fall
 * back to a normal council deliberation.
 *
 * Examples it should catch:
 *   - "احسب ضريبة دخلي السنوي 240000"
 *   - "كام التأمينات على راتب شهري 8000؟"
 *   - "إجمالي تكلفة موظف بـ 12000 شهري لمدة 14 شهر"
 */
export interface ExtractedFinanceQuery {
  kind: 'income-tax' | 'social-insurance' | 'total-cost';
  amount: number;
  /** for total-cost: 12, 13 or 14 months. Defaults 12. */
  months?: 12 | 13 | 14;
}

export function extractFinanceQuery(message: string): ExtractedFinanceQuery | null {
  const m = message.toLowerCase();
  // Pull the biggest standalone number in the message (handles "240000" or
  // "240,000" or "240 ألف" → 240000).
  const amount = extractAmount(message);
  if (amount === null || amount <= 0) return null;

  const isInsurance = /(تأمين|التأمينات|اشتراك\s*التأمين|insurance)/i.test(m);
  const isTotalCost = /(إجمال[يى]?\s*(تكلفة|cost)|تكلفة\s*موظف|total\s*cost|cost\s*of\s*employ)/i.test(m);
  const isTax = /(ضريب|ضرايب|دخل|tax|brackets?|الشريحة|الشرايح)/i.test(m);

  if (isTotalCost) {
    const months = /14/.test(message) ? 14 : /13/.test(message) ? 13 : 12;
    return { kind: 'total-cost', amount, months: months as 12 | 13 | 14 };
  }
  if (isInsurance) return { kind: 'social-insurance', amount };
  if (isTax) {
    // Heuristic: if the number is < 50k, the user probably typed a monthly
    // figure → annualise. Egyptian tax brackets are annual.
    const annual = amount < 50000 ? amount * 12 : amount;
    return { kind: 'income-tax', amount: annual };
  }
  return null;
}

function extractAmount(text: string): number | null {
  // First strip Arabic-Indic digits to ASCII.
  const ascii = text.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  // "ألف" multiplier — "240 ألف" → 240000
  let alfMatch = ascii.match(/(\d{1,4}(?:[\.,]\d+)?)\s*(?:ألف|الف|k|K|thousand)/);
  if (alfMatch) {
    const n = Number(alfMatch[1].replace(/[,]/g, '.'));
    if (Number.isFinite(n)) return Math.round(n * 1000);
  }
  let mlnMatch = ascii.match(/(\d{1,4}(?:[\.,]\d+)?)\s*(?:مليون|m|M|million)/);
  if (mlnMatch) {
    const n = Number(mlnMatch[1].replace(/[,]/g, '.'));
    if (Number.isFinite(n)) return Math.round(n * 1_000_000);
  }
  // Plain numbers, optionally with comma/period thousand separators.
  const candidates = [...ascii.matchAll(/(\d[\d,\.]{2,})/g)]
    .map((m) => Number(m[1].replace(/[\.,]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}

/**
 * Build a deterministic Markdown card the CFO agent can hand to the council
 * as a `draft`. Council will then layer narrative + recommendations on top
 * without being able to fudge the numbers.
 */
export function formatFinanceResultMarkdown(
  q: ExtractedFinanceQuery,
  data: IncomeTaxResult | SocialInsuranceResult | TotalCostResult,
): string {
  const fmt = (n: number) => n.toLocaleString('en-EG', { maximumFractionDigits: 2 });
  const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

  if (q.kind === 'income-tax') {
    const r = data as IncomeTaxResult;
    const rows = (r.breakdown || [])
      .map(
        (b) =>
          `| ${fmt(b.from)} – ${b.to === null ? '∞' : fmt(b.to)} | ${pct(b.rate)} | ${fmt(b.tax_in_bracket)} EGP |`,
      )
      .join('\n');
    return `**حساب ضريبة الدخل (مصر)** — مصدر: Egypt-Calc

- الدخل السنوي: **${fmt(r.annual_gross)} EGP**
- الدخل الخاضع للضريبة بعد الإعفاء: **${fmt(r.taxable_after_exemption)} EGP**
- الضريبة السنوية: **${fmt(r.annual_tax)} EGP**
- الضريبة الشهرية: **${fmt(r.monthly_tax)} EGP**
- المعدل الفعلي: **${pct(r.effective_rate)}**
- المعدل الحدّي: **${pct(r.marginal_rate)}**

| الشريحة | النسبة | الضريبة |
|---|---|---|
${rows}`;
  }

  if (q.kind === 'social-insurance') {
    const r = data as SocialInsuranceResult;
    return `**حساب التأمينات الاجتماعية (مصر)** — مصدر: Egypt-Calc

- الأجر الشهري: **${fmt(r.monthly_wage)} EGP**
- الأجر التأميني: **${fmt(r.insurable_wage)} EGP**
- حصة الموظف: **${fmt(r.employee_contribution)} EGP**
- حصة صاحب العمل: **${fmt(r.employer_contribution)} EGP**
- إجمالي الاشتراك: **${fmt(r.total_contribution)} EGP / شهر**
- صافي ما يقبضه الموظف بعد التأمينات: **${fmt(r.net_after_employee_si)} EGP**
- إجمالي تكلفة صاحب العمل: **${fmt(r.employer_total_cost)} EGP / شهر**`;
  }

  const r = data as TotalCostResult;
  return `**إجمالي تكلفة الموظف على الشركة (مصر)** — مصدر: Egypt-Calc

- الراتب الشهري الإجمالي: **${fmt(r.monthly_gross)} EGP**
- إجمالي سنوي: **${fmt(r.annual_gross)} EGP**
- ضريبة الدخل الشهرية: **${fmt(r.income_tax.monthly_tax)} EGP**
- تأمينات الموظف / شهر: **${fmt(r.social_insurance.employee_contribution)} EGP**
- تأمينات صاحب العمل / شهر: **${fmt(r.social_insurance.employer_contribution)} EGP**
- صافي ما يقبضه الموظف: **${fmt(r.monthly_net)} EGP / شهر** (≈ ${fmt(r.annual_net)} EGP / سنة)
- التكلفة الكلية على الشركة: **${fmt(r.total_employer_monthly)} EGP / شهر** → **${fmt(r.total_employer_annual)} EGP / سنة**`;
}
