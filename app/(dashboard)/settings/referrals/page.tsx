"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Share2, Gift, Users, TrendingUp, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Stats {
  code: string;
  totalSignups: number;
  totalConversions: number;
  totalRewardsEarned: number;
  shareUrl: string;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const token = await user.getIdToken().catch(() => null);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/referrals", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const share = async () => {
    if (!stats) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "انضم إلى Kalmeron AI",
          text: "سجّل بكود الإحالة الخاص بي واحصل على رصيد مجاني.",
          url: stats.shareUrl,
        });
      } catch {
      }
    } else {
      await copy(stats.shareUrl, "الرابط");
    }
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/settings" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-2">
              <ArrowLeft className="w-3 h-3" />
              العودة للإعدادات
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-400" />
              برنامج الإحالات
            </h1>
            <p className="text-white/45 mt-2">ادعُ فريقك وأصدقاءك، وازدد رصيداً عندما يتحولون إلى مستخدمين نشطين.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
            <Gift className="w-6 h-6 text-emerald-400 mb-3" />
            <div className="text-white/45 text-xs">المدعو يحصل على</div>
            <div className="text-white text-xl font-bold mt-1">+500 رصيد فوري</div>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5">
            <CheckCircle2 className="w-6 h-6 text-cyan-400 mb-3" />
            <div className="text-white/45 text-xs">أنت تحصل على</div>
            <div className="text-white text-xl font-bold mt-1">+5,000 رصيد</div>
            <div className="text-white/35 text-xs mt-1">عند ترقية الصديق للخطة المدفوعة</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <TrendingUp className="w-6 h-6 text-amber-400 mb-3" />
            <div className="text-white/45 text-xs">عدد غير محدود</div>
            <div className="text-white text-xl font-bold mt-1">∞ إحالات</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h2 className="text-white font-semibold">كود الإحالة</h2>
          {loading ? (
            <div className="h-12 rounded-xl bg-white/[0.05] animate-pulse" />
          ) : stats ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <input readOnly value={stats.code} className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white text-xl font-mono tracking-[0.35em] text-center" />
                <button onClick={() => void copy(stats.code, "الكود")} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white hover:bg-white/[0.08] inline-flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  نسخ
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input readOnly value={stats.shareUrl} className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white/70 text-sm" dir="ltr" />
                <button onClick={() => void copy(stats.shareUrl, "الرابط")} className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white hover:bg-white/[0.08] inline-flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  نسخ الرابط
                </button>
                <button onClick={() => void share()} className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-white font-medium inline-flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
              </div>
            </>
          ) : (
            <p className="text-white/45">سجّل الدخول لعرض كود الإحالة الخاص بك.</p>
          )}
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-white/45 text-xs flex items-center gap-2 mb-2"><Users className="w-4 h-4" /> التسجيلات</div>
              <div className="text-3xl font-bold text-white">{stats.totalSignups}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-white/45 text-xs flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4" /> التحويلات</div>
              <div className="text-3xl font-bold text-emerald-300">{stats.totalConversions}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-white/45 text-xs flex items-center gap-2 mb-2"><Gift className="w-4 h-4" /> المكافآت</div>
              <div className="text-3xl font-bold text-cyan-300">{stats.totalRewardsEarned.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
