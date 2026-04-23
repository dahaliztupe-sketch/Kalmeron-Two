"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Copy, Share2, Gift, Users, TrendingUp, CheckCircle2 } from "lucide-react";
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
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const share = async () => {
    if (!stats) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "انضم إلى كلميرون",
          text: "احصل على 500 رصيد إضافي عند التسجيل بكود الإحالة الخاص بي:",
          url: stats.shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy(stats.shareUrl, "الرابط");
    }
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto p-6 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-white mb-2">برنامج الإحالات</h1>
          <p className="text-zinc-400">
            ادعُ أصدقاءك واحصل على مكافآت. الجميع يستفيد.
          </p>
        </header>

        {/* Reward summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-5">
            <Gift className="w-6 h-6 text-emerald-400 mb-3" />
            <div className="text-zinc-400 text-xs mb-1">المدعوّ يحصل على</div>
            <div className="text-xl font-bold text-white">+500 رصيد فوري</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 p-5">
            <CheckCircle2 className="w-6 h-6 text-cyan-400 mb-3" />
            <div className="text-zinc-400 text-xs mb-1">أنت تحصل على</div>
            <div className="text-xl font-bold text-white">+5,000 رصيد</div>
            <div className="text-xs text-zinc-500 mt-1">عند ترقية صديقك للخطة المدفوعة</div>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <TrendingUp className="w-6 h-6 text-amber-400 mb-3" />
            <div className="text-zinc-400 text-xs mb-1">لا حد لعدد الإحالات</div>
            <div className="text-xl font-bold text-white">∞</div>
          </div>
        </div>

        {/* Code box */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">كود الإحالة الخاص بك</h2>
          {loading ? (
            <div className="h-12 rounded-lg bg-white/5 animate-pulse" />
          ) : stats ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  readOnly
                  value={stats.code}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-2xl font-mono tracking-widest text-center"
                />
                <button
                  onClick={() => copy(stats.code, "الكود")}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white"
                  aria-label="نسخ الكود"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  readOnly
                  value={stats.shareUrl}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-zinc-300 text-sm"
                />
                <button
                  onClick={() => copy(stats.shareUrl, "الرابط")}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white"
                  aria-label="نسخ الرابط"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={share}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90 transition inline-flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  مشاركة
                </button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500">سجّل الدخول لعرض كود الإحالة الخاص بك.</p>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                <Users className="w-4 h-4" />
                إجمالي التسجيلات
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalSignups}</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                <CheckCircle2 className="w-4 h-4" />
                ترقّوا للمدفوع
              </div>
              <div className="text-3xl font-bold text-emerald-300">{stats.totalConversions}</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
                <Gift className="w-4 h-4" />
                إجمالي المكافآت
              </div>
              <div className="text-3xl font-bold text-cyan-300">
                {stats.totalRewardsEarned.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
