"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  DollarSign, Users, CreditCard, Percent, Building2, Smartphone,
  ChevronDown, ChevronUp, Info, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/src/lib/utils";
import { useTranslations } from "next-intl";

const fmt = (n: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}٪`;

type CalcTab = "income-tax" | "social" | "total-cost" | "vat" | "fawry" | "instapay";

const TAB_META: { id: CalcTab; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "income-tax", icon: DollarSign, color: "from-emerald-500 to-teal-500" },
  { id: "social", icon: Users, color: "from-blue-500 to-indigo-500" },
  { id: "total-cost", icon: Building2, color: "from-violet-500 to-purple-500" },
  { id: "vat", icon: Percent, color: "from-amber-500 to-orange-500" },
  { id: "fawry", icon: CreditCard, color: "from-rose-500 to-pink-500" },
  { id: "instapay", icon: Smartphone, color: "from-cyan-500 to-blue-500" },
];

interface IncomeTaxResult {
  annual_gross: number;
  taxable_after_exemption: number;
  annual_tax: number;
  monthly_tax: number;
  effective_rate: number;
  marginal_rate: number;
  breakdown: Array<{ from: number; to: number | null; rate: number; taxable_in_bracket: number; tax_in_bracket: number }>;
  as_of: string;
}

interface SocialResult {
  monthly_wage: number;
  insurable_wage: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
  employee_net: number;
  as_of: string;
}

interface TotalCostResult {
  monthly_gross: number;
  months: number;
  social_insurance: SocialResult;
  total_annual_cost: number;
  total_monthly_cost: number;
  as_of: string;
}

interface VATResult {
  amount: number;
  rate: number;
  inclusive: boolean;
  vat_amount: number;
  base_amount: number;
  total_with_vat: number;
  as_of: string;
}

interface FawryResult {
  transaction_amount: number;
  customer_fee: number;
  merchant_discount: number;
  merchant_net: number;
  as_of: string;
}

interface InstapayResult {
  transaction_amount: number;
  fee: number;
  net_received: number;
  as_of: string;
}

type CalcResult = IncomeTaxResult | SocialResult | TotalCostResult | VATResult | FawryResult | InstapayResult | null;

function NumInput({
  label, value, onChange, unit = "جنيه", hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  unit?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white">{label}</label>
      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          min={0}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-cyan/50 pr-16 text-right"
          placeholder="0"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 py-2.5 border-b border-white/5 last:border-0",
      highlight && "bg-brand-cyan/5 -mx-4 px-4 rounded-lg border-brand-cyan/20"
    )}>
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={cn("text-sm font-bold", highlight ? "text-brand-cyan text-base" : "text-white")}>{value}</span>
    </div>
  );
}

export default function EgyptCalcPage() {
  const { user } = useAuth();
  const t = useTranslations("EgyptCalc");
  const TABS = TAB_META.map(m => ({ ...m, label: t(`tabs.${m.id}`) }));
  const [tab, setTab] = useState<CalcTab>("income-tax");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CalcResult>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [annualGross, setAnnualGross] = useState("");
  const [monthlyWage, setMonthlyWage] = useState("");
  const [monthlyGross, setMonthlyGross] = useState("");
  const [months, setMonths] = useState("12");
  const [vatAmount, setVatAmount] = useState("");
  const [vatRate, setVatRate] = useState("0.14");
  const [vatInclusive, setVatInclusive] = useState(false);
  const [fawryAmount, setFawryAmount] = useState("");
  const [fawryMDR, setFawryMDR] = useState("0.015");
  const [instapayAmount, setInstapayAmount] = useState("");

  const callCalc = useCallback(async (endpoint: string, params: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    setResult(null);
    setShowBreakdown(false);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/egypt-calc", {
        method: "POST",
        headers,
        body: JSON.stringify({ endpoint, ...params }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في الحاسبة");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCalc = useCallback(() => {
    switch (tab) {
      case "income-tax":
        if (!annualGross) return setError("أدخل الراتب السنوي");
        callCalc("income-tax", { annual_gross: Number(annualGross) });
        break;
      case "social":
        if (!monthlyWage) return setError("أدخل الراتب الشهري");
        callCalc("social-insurance", { monthly_wage: Number(monthlyWage) });
        break;
      case "total-cost":
        if (!monthlyGross) return setError("أدخل الراتب الشهري");
        callCalc("total-cost", { monthly_gross: Number(monthlyGross), months: Number(months) });
        break;
      case "vat":
        if (!vatAmount) return setError("أدخل المبلغ");
        callCalc("vat", { amount: Number(vatAmount), rate: Number(vatRate), inclusive: vatInclusive });
        break;
      case "fawry":
        if (!fawryAmount) return setError("أدخل مبلغ المعاملة");
        callCalc("fawry-fee", { transaction_amount: Number(fawryAmount), merchant_discount_rate: Number(fawryMDR) });
        break;
      case "instapay":
        if (!instapayAmount) return setError("أدخل مبلغ المعاملة");
        callCalc("instapay-fee", { transaction_amount: Number(instapayAmount) });
        break;
    }
  }, [tab, annualGross, monthlyWage, monthlyGross, months, vatAmount, vatRate, vatInclusive, fawryAmount, fawryMDR, instapayAmount, callCalc]);

  const currentTab = TABS.find(t => t.id === tab)!;

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-300 font-semibold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            {t("eyebrow")}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-text-secondary">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setResult(null); setError(""); }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all",
                  active
                    ? `bg-gradient-to-r ${t.color} text-white border-transparent shadow-lg`
                    : "bg-white/5 border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 glass-panel rounded-2xl p-5 space-y-4">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r text-white text-xs font-bold",
              currentTab.color
            )}>
              <currentTab.icon className="w-3.5 h-3.5" />
              {currentTab.label}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {tab === "income-tax" && (
                  <>
                    <NumInput
                      label={t("form.annualGrossLabel")}
                      value={annualGross}
                      onChange={setAnnualGross}
                      hint={t("form.annualGrossHint")}
                    />
                    <div className="glass-panel rounded-xl p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {t("form.incomeTaxNote")}
                      </p>
                    </div>
                  </>
                )}

                {tab === "social" && (
                  <NumInput
                    label={t("form.monthlyWageLabel")}
                    value={monthlyWage}
                    onChange={setMonthlyWage}
                    hint={t("form.monthlyWageHint")}
                  />
                )}

                {tab === "total-cost" && (
                  <>
                    <NumInput
                      label={t("form.monthlyGrossLabel")}
                      value={monthlyGross}
                      onChange={setMonthlyGross}
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">{t("form.monthsLabel")}</label>
                      <div className="flex gap-2">
                        {["12", "13", "14"].map(m => (
                          <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                              months === m
                                ? "bg-violet-500 border-violet-400 text-white"
                                : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-text-secondary">{t("form.monthsHint")}</p>
                    </div>
                  </>
                )}

                {tab === "vat" && (
                  <>
                    <NumInput
                      label={t("form.amountLabel")}
                      value={vatAmount}
                      onChange={setVatAmount}
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">{t("form.vatRateLabel")}</label>
                      <div className="flex gap-2">
                        {[
                          { val: "0.14", label: t("form.vatStandard") },
                          { val: "0.05", label: t("form.vatReduced") },
                        ].map(r => (
                          <button
                            key={r.val}
                            onClick={() => setVatRate(r.val)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-sm font-bold border transition-all",
                              vatRate === r.val
                                ? "bg-amber-500 border-amber-400 text-white"
                                : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                            )}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text-secondary">{t("form.vatInclusive")}</span>
                      <button
                        onClick={() => setVatInclusive(v => !v)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          vatInclusive ? "bg-amber-500" : "bg-white/10"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                          vatInclusive ? "translate-x-[-22px] rtl:translate-x-[22px]" : "translate-x-[-2px] rtl:translate-x-[2px]"
                        )} />
                      </button>
                    </div>
                  </>
                )}

                {tab === "fawry" && (
                  <>
                    <NumInput
                      label={t("form.transactionAmountLabel")}
                      value={fawryAmount}
                      onChange={setFawryAmount}
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">{t("form.mdrLabel")}</label>
                      <div className="flex gap-2">
                        {[
                          { val: "0.015", label: t("form.mdrStandard") },
                          { val: "0.01", label: t("form.mdrReduced") },
                          { val: "0.02", label: t("form.mdrHigh") },
                        ].map(r => (
                          <button
                            key={r.val}
                            onClick={() => setFawryMDR(r.val)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                              fawryMDR === r.val
                                ? "bg-rose-500 border-rose-400 text-white"
                                : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                            )}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {tab === "instapay" && (
                  <NumInput
                    label={t("form.transactionAmountLabel")}
                    value={instapayAmount}
                    onChange={setInstapayAmount}
                    hint={t("form.instapayHint")}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              onClick={handleCalc}
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
                `bg-gradient-to-r ${currentTab.color}`,
                loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
              )}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? t("form.calculating") : t("form.calculateButton")}
            </button>
          </div>

          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center gap-4"
                >
                  <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center", currentTab.color)}>
                    <currentTab.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold mb-1">{t("emptyState.prompt")}</p>
                    <p className="text-text-secondary text-sm">{t("emptyState.note")}</p>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center gap-3"
                >
                  <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
                  <p className="text-text-secondary text-sm">{t("emptyState.calculating")}</p>
                </motion.div>
              )}

              {result && tab === "income-tax" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("results.incomeTaxTitle")}
                  </div>
                  {(() => {
                    const r = result as IncomeTaxResult;
                    return (
                      <>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                          <p className="text-xs text-emerald-300 mb-1">{t("results.annualTaxLabel")}</p>
                          <p className="text-3xl font-extrabold text-white">{fmt(r.annual_tax)}</p>
                          <p className="text-sm text-text-secondary">{t("results.egp")}</p>
                        </div>
                        <ResultRow label={t("results.annualGross")} value={`${fmt(r.annual_gross)} ج.م`} />
                        <ResultRow label={t("results.taxableIncome")} value={`${fmt(r.taxable_after_exemption)} ج.م`} />
                        <ResultRow label={t("results.monthlyTax")} value={`${fmt(r.monthly_tax)} ج.م`} highlight />
                        <ResultRow label={t("results.effectiveRate")} value={pct(r.effective_rate)} />
                        <ResultRow label={t("results.marginalRate")} value={pct(r.marginal_rate)} />
                        <ResultRow label={t("results.annualNet")} value={`${fmt(r.annual_gross - r.annual_tax)} ج.م`} />

                        {r.breakdown.length > 0 && (
                          <div>
                            <button
                              onClick={() => setShowBreakdown(v => !v)}
                              className="flex items-center gap-1.5 text-sm text-brand-cyan hover:text-white transition-colors"
                            >
                              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {t("results.breakdownToggle")}
                            </button>
                            <AnimatePresence>
                              {showBreakdown && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 overflow-hidden"
                                >
                                  <div className="bg-white/3 rounded-xl overflow-hidden border border-white/8">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-white/10">
                                          <th className="text-right py-2 px-3 text-text-secondary font-semibold">{t("results.bracketCol")}</th>
                                          <th className="text-center py-2 px-3 text-text-secondary font-semibold">{t("results.rateCol")}</th>
                                          <th className="text-left py-2 px-3 text-text-secondary font-semibold">{t("results.taxCol")}</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {r.breakdown.map((b, i) => (
                                          <tr key={i} className="border-b border-white/5">
                                            <td className="py-2 px-3 text-white">
                                              {fmt(b.from)} — {b.to != null ? fmt(b.to) : "∞"}
                                            </td>
                                            <td className="py-2 px-3 text-center text-amber-300">{pct(b.rate)}</td>
                                            <td className="py-2 px-3 text-emerald-300">{fmt(b.tax_in_bracket)} ج.م</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                        <p className="text-xs text-text-secondary/60 text-center">{t("results.updatedAs", { date: r.as_of })}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {result && tab === "social" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-blue-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("results.socialTitle")}
                  </div>
                  {(() => {
                    const r = result as SocialResult;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-blue-300 mb-1">{t("results.employeeContrib")}</p>
                            <p className="text-xl font-extrabold text-white">{fmt(r.employee_contribution)}</p>
                            <p className="text-xs text-text-secondary">{t("results.egpPerMonth")}</p>
                          </div>
                          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-violet-300 mb-1">{t("results.employerContrib")}</p>
                            <p className="text-xl font-extrabold text-white">{fmt(r.employer_contribution)}</p>
                            <p className="text-xs text-text-secondary">{t("results.egpPerMonth")}</p>
                          </div>
                        </div>
                        <ResultRow label={t("results.insurableWage")} value={`${fmt(r.insurable_wage)} ج.م`} />
                        <ResultRow label={t("results.employeeRate")} value={`${fmt(r.employee_contribution)} ج.م`} />
                        <ResultRow label={t("results.employerRate")} value={`${fmt(r.employer_contribution)} ج.م`} />
                        <ResultRow label={t("results.totalMonthlyContrib")} value={`${fmt(r.total_contribution)} ج.م`} highlight />
                        <ResultRow label={t("results.employeeNet")} value={`${fmt(r.employee_net)} ج.م`} />
                        <div className="glass-panel rounded-xl p-3 flex items-start gap-2">
                          <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                          <p className="text-xs text-text-secondary">{t("results.socialNote")}</p>
                        </div>
                        <p className="text-xs text-text-secondary/60 text-center">{t("results.updatedAs", { date: r.as_of })}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {result && tab === "total-cost" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-violet-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("results.totalCostTitle")}
                  </div>
                  {(() => {
                    const r = result as TotalCostResult;
                    return (
                      <>
                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
                          <p className="text-xs text-violet-300 mb-1">{t("results.totalAnnualCostLabel")}</p>
                          <p className="text-3xl font-extrabold text-white">{fmt(r.total_annual_cost)}</p>
                          <p className="text-sm text-text-secondary">{t("results.egp")}</p>
                        </div>
                        <ResultRow label={t("results.monthlyGross")} value={`${fmt(r.monthly_gross)} ج.م`} />
                        <ResultRow label={t("results.employerSocialMonthly")} value={`${fmt(r.social_insurance.employer_contribution)} ج.م`} />
                        <ResultRow label={t("results.totalMonthlyCost")} value={`${fmt(r.total_monthly_cost)} ج.م`} highlight />
                        <ResultRow label={t("results.months")} value={`${r.months}`} />
                        <ResultRow label={t("results.totalAnnualFull")} value={`${fmt(r.total_annual_cost)} ج.م`} />
                        <p className="text-xs text-text-secondary/60 text-center">{t("results.updatedAs", { date: r.as_of })}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {result && tab === "vat" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-amber-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("results.vatTitle")}
                  </div>
                  {(() => {
                    const r = result as VATResult;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-amber-300 mb-1">{t("results.vatAmount")}</p>
                            <p className="text-2xl font-extrabold text-white">{fmt(r.vat_amount)}</p>
                            <p className="text-xs text-text-secondary">{t("results.egp")}</p>
                          </div>
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-orange-300 mb-1">{t("results.totalWithVat")}</p>
                            <p className="text-2xl font-extrabold text-white">{fmt(r.total_with_vat)}</p>
                            <p className="text-xs text-text-secondary">{t("results.egp")}</p>
                          </div>
                        </div>
                        <ResultRow label={t("results.baseAmount")} value={`${fmt(r.base_amount)} ج.م`} />
                        <ResultRow label={t("results.vatValue")} value={`${fmt(r.vat_amount)} ج.م`} />
                        <ResultRow label={t("results.totalIncVat")} value={`${fmt(r.total_with_vat)} ج.م`} highlight />
                        <ResultRow label={t("results.appliedRate")} value={pct(r.rate)} />
                        <div className="glass-panel rounded-xl p-3 flex items-start gap-2">
                          <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                          <p className="text-xs text-text-secondary">{t("results.vatNote")}</p>
                        </div>
                        <p className="text-xs text-text-secondary/60 text-center">{t("results.updatedAs", { date: r.as_of })}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {result && tab === "fawry" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-rose-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("results.fawryTitle")}
                  </div>
                  {(() => {
                    const r = result as FawryResult;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-rose-300 mb-1">{t("results.customerFee")}</p>
                            <p className="text-2xl font-extrabold text-white">{fmt(r.customer_fee)}</p>
                            <p className="text-xs text-text-secondary">{t("results.egp")}</p>
                          </div>
                          <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3 text-center">
                            <p className="text-xs text-pink-300 mb-1">{t("results.merchantNet")}</p>
                            <p className="text-2xl font-extrabold text-white">{fmt(r.merchant_net)}</p>
                            <p className="text-xs text-text-secondary">{t("results.egp")}</p>
                          </div>
                        </div>
                        <ResultRow label={t("results.transactionAmount")} value={`${fmt(r.transaction_amount)} ج.م`} />
                        <ResultRow label={t("results.customerFeeFixed")} value={`${fmt(r.customer_fee)} ج.م`} />
                        <ResultRow label={t("results.merchantDiscount")} value={`${fmt(r.merchant_discount)} ج.م`} />
                        <ResultRow label={t("results.netToMerchant")} value={`${fmt(r.merchant_net)} ج.م`} highlight />
                        <p className="text-xs text-text-secondary/60 text-center">{t("results.updatedAs", { date: r.as_of })}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {result && tab === "instapay" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm text-cyan-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t("results.instapayTitle")}
                  </div>
                  {(() => {
                    const r = result as InstapayResult;
                    return (
                      <>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
                          <p className="text-xs text-cyan-300 mb-1">{t("results.feeLabel")}</p>
                          <p className="text-3xl font-extrabold text-white">{fmt(r.fee)}</p>
                          <p className="text-sm text-text-secondary">{t("results.egp")}</p>
                        </div>
                        <ResultRow label={t("results.transactionAmount")} value={`${fmt(r.transaction_amount)} ج.م`} />
                        <ResultRow label={t("results.feeLabel")} value={`${fmt(r.fee)} ج.م`} />
                        <ResultRow label={t("results.netReceived")} value={`${fmt(r.net_received)} ج.م`} highlight />
                        <div className="glass-panel rounded-xl p-3 flex items-start gap-2">
                          <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                          <p className="text-xs text-text-secondary">{t("results.instapayNote")}</p>
                        </div>
                        <p className="text-xs text-text-secondary/60 text-center">{t("results.updatedAs", { date: r.as_of })}</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-2xl p-5">
          <p className="text-xs text-text-secondary/60 text-center leading-relaxed">
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
