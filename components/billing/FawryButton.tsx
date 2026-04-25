"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanId, BillingCycle } from "@/src/lib/billing/plans";

interface Props {
  planId: PlanId;
  cycle: BillingCycle;
  authToken: string;
  onSuccess?: (referenceNumber: string, instructionsAr: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

/**
 * Egyptian-first payment CTA. Asks the user for their mobile number, then
 * creates a Fawry PAYATFAWRY reference. Renders the reference + Arabic
 * instructions on success.
 */
export function FawryButton({ planId, cycle, authToken, onSuccess, onError, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [showForm, setShowForm] = useState(false);

  const submit = async () => {
    if (!/^01\d{9}$/.test(mobile)) {
      onError?.("رقم الموبايل لازم يبدأ بـ 01 ويكون 11 رقم.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/billing/fawry/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan: planId, cycle, paymentMethod: "PAYATFAWRY", customerMobile: mobile }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        onError?.(json.message ?? "تعذّر إنشاء طلب الدفع. حاول لاحقاً.");
        return;
      }
      onSuccess?.(json.referenceNumber as string, json.instructionsAr as string);
    } catch {
      onError?.("لا يوجد اتّصال. تحقّق من الإنترنت وحاول مرّة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        disabled={disabled || loading}
        variant="outline"
        className="w-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-100"
      >
        ادفع عبر فوري / فودافون كاش
      </Button>
    );
  }

  return (
    <div className="space-y-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
      <label className="text-xs text-text-secondary block text-right">رقم الموبايل المصري:</label>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={mobile}
        onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 11))}
        placeholder="01012345678"
        className="w-full px-3 py-2 rounded-md bg-background border border-border text-right text-sm"
        dir="ltr"
      />
      <div className="flex gap-2">
        <Button onClick={submit} disabled={loading || !mobile} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "متابعة"}
        </Button>
        <Button onClick={() => setShowForm(false)} variant="ghost" disabled={loading}>
          إلغاء
        </Button>
      </div>
      <p className="text-[11px] text-text-tertiary">سيُنشأ كود فوري لتدفع به في أقرب فرع أو من تطبيق الموبايل.</p>
    </div>
  );
}
