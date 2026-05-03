"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, CheckCircle2, Copy, Check, Smartphone, Store, CreditCard } from "lucide-react";
import type { PlanId, BillingCycle } from "@/src/lib/billing/plans";
import { PLANS } from "@/src/lib/billing/plans";

type PayMethod = "PAYATFAWRY" | "VALU" | "MEEZA_DIGITAL";

const METHODS: { id: PayMethod; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "PAYATFAWRY", label: "فرع فوري", desc: "ادفع في أقرب فرع فوري أو من تطبيق الموبايل", icon: Store },
  { id: "MEEZA_DIGITAL", label: "بطاقة ميزة", desc: "ادفع أونلاين ببطاقتك البنكية المصرية", icon: CreditCard },
  { id: "VALU", label: "ValU / تقسيط", desc: "قسّم المبلغ على 6 أو 12 شهراً بدون فوائد", icon: Smartphone },
];

interface Props {
  open: boolean;
  onClose: () => void;
  planId: PlanId;
  cycle: BillingCycle;
  authToken: string | null;
}

export function FawryDialog({ open, onClose, planId, cycle, authToken }: Props) {
  const plan = PLANS[planId];
  const amount = cycle === "annual" ? plan?.priceAnnualMonthlyEgp * 12 : plan?.priceMonthlyEgp;

  const [step, setStep] = useState<"method" | "mobile" | "success">("method");
  const [method, setMethod] = useState<PayMethod>("PAYATFAWRY");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ referenceNumber: string; instructionsAr: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    setStep("method");
    setMobile("");
    setError("");
    setResult(null);
    setCopied(false);
    onClose();
  }

  async function submit() {
    if (!/^01\d{9}$/.test(mobile)) {
      setError("رقم الموبايل لازم يبدأ بـ 01 ويكون 11 رقم (مثال: 01012345678)");
      return;
    }
    if (!authToken) { setError("يجب تسجيل الدخول أولاً"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/fawry/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ plan: planId, cycle, paymentMethod: method, customerMobile: mobile }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message ?? "تعذّر إنشاء طلب الدفع. حاول مجدداً.");
        return;
      }
      setResult({ referenceNumber: json.referenceNumber, instructionsAr: json.instructionsAr });
      setStep("success");
    } catch {
      setError("لا يوجد اتصال. تحقق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  function copyRef() {
    if (!result?.referenceNumber) return;
    navigator.clipboard.writeText(result.referenceNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
            style={{ background: "linear-gradient(160deg, #0D1025 0%, #080B18 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="font-bold text-white text-lg">الدفع عبر فوري</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {plan?.nameAr} · {amount?.toLocaleString("ar-EG")} ج.م / {cycle === "annual" ? "سنة" : "شهر"}
                </p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Step: method */}
              {step === "method" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-sm text-neutral-400 mb-4">اختر طريقة الدفع المناسبة لك:</p>
                  <div className="space-y-2 mb-6">
                    {METHODS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-right ${
                            method === m.id
                              ? "border-amber-500/50 bg-amber-500/10"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${method === m.id ? "bg-amber-500/20" : "bg-white/[0.04]"}`}>
                            <Icon className={`w-4 h-4 ${method === m.id ? "text-amber-300" : "text-neutral-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${method === m.id ? "text-amber-200" : "text-neutral-300"}`}>{m.label}</p>
                            <p className="text-xs text-neutral-500 leading-relaxed">{m.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${method === m.id ? "border-amber-400 bg-amber-400" : "border-neutral-600"}`} />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setStep("mobile")}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
                  >
                    متابعة
                  </button>
                </motion.div>
              )}

              {/* Step: mobile */}
              {step === "mobile" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button onClick={() => setStep("method")} className="text-xs text-neutral-500 hover:text-white mb-4 flex items-center gap-1 transition-colors">
                    ← رجوع
                  </button>
                  <div className="mb-5">
                    <label className="block text-sm text-neutral-300 font-semibold mb-2">رقم الموبايل المصري</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={mobile}
                      onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 11)); setError(""); }}
                      placeholder="01012345678"
                      dir="ltr"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-neutral-600 outline-none focus:border-amber-500/50 text-sm text-left transition-colors"
                    />
                    {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
                  </div>

                  <div className="mb-5 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      سيُرسَل كود مرجعي على هذا الرقم — يمكنك استخدامه للدفع في أي فرع فوري أو من تطبيق My Fawry.
                    </p>
                  </div>

                  <button
                    onClick={submit}
                    disabled={loading || mobile.length !== 11}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? "جارٍ إنشاء الطلب..." : "إنشاء كود الدفع"}
                  </button>
                </motion.div>
              )}

              {/* Step: success */}
              {step === "success" && result && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-white text-lg mb-1">تم إنشاء طلب الدفع!</h4>
                  <p className="text-sm text-neutral-400 mb-5">احفظ الكود التالي وادفع في أي فرع فوري</p>

                  <div className="mb-5 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-[11px] text-neutral-500 mb-2">الكود المرجعي</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-2xl font-black text-white tracking-widest">{result.referenceNumber}</span>
                      <button onClick={copyRef} className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                      </button>
                    </div>
                  </div>

                  {result.instructionsAr && (
                    <div className="mb-5 p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-right">
                      <p className="text-xs text-amber-200/80 leading-relaxed whitespace-pre-line">{result.instructionsAr}</p>
                    </div>
                  )}

                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-300 text-sm font-semibold hover:bg-white/[0.06] transition-colors"
                  >
                    إغلاق
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
