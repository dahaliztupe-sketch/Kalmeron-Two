"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

export default function BillingPortalPage() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user === null) {
      // Not authenticated — send to login rather than infinite spinner
      window.location.href = "/login?next=/billing/portal";
      return;
    }
    if (!user) return; // Still loading (undefined)

    const redirect = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/billing/portal", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await res.json();
        if (!res.ok || !json.url) {
          setError(json.message ?? "تعذّر الوصول إلى بوابة الفوترة. تأكد من وجود اشتراك مدفوع.");
          return;
        }
        window.location.href = json.url;
      } catch {
        setError("حدث خطأ في الاتصال. حاول مجدداً.");
      }
    };

    void redirect();
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B18]" dir="rtl">
        <div className="max-w-sm w-full mx-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">تعذّر الوصول</h2>
          <p className="text-neutral-400 text-sm mb-6">{error}</p>
          <a
            href="/account/billing"
            className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors"
          >
            العودة للفوترة
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080B18]" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
        <p className="text-neutral-400 text-sm">جارٍ تحويلك لبوابة إدارة الاشتراك...</p>
      </div>
    </div>
  );
}
