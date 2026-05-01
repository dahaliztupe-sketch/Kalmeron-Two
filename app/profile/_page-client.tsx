"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Briefcase, MapPin, Building2, Mail, LogOut,
  Trash2, Crown, ChevronLeft, Shield, Star,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}

function ProfilePageContent() {
  const { dbUser, signOut: logout, user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const confirmText =
      "هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن الرجوع عنه.";
    if (!window.confirm(confirmText)) return;
    setIsDeleting(true);
    try {
      const idToken = user ? await user.getIdToken() : null;
      if (!idToken) throw new Error("لم يتم العثور على جلسة تسجيل دخول.");
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast.success("تم حذف بياناتك بنجاح.");
        await logout();
        router.push("/");
      } else {
        throw new Error("فشل في حذف البيانات");
      }
    } catch {
      toast.error("حدث خطأ أثناء محاولة حذف الحساب.");
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = dbUser?.name
    ? dbUser.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)
    : "ك";

  const INFO_ROWS = [
    { icon: User, label: "الاسم الكامل", value: dbUser?.name },
    { icon: Mail, label: "البريد الإلكتروني", value: user?.email },
    { icon: Building2, label: "المجال الصناعي", value: dbUser?.industry },
    { icon: Briefcase, label: "مرحلة الشركة", value: dbUser?.startup_stage },
    { icon: MapPin, label: "المحافظة", value: dbUser?.governorate },
  ];

  return (
    <AppShell>
      <div dir="rtl" className="max-w-2xl mx-auto py-8 px-4 space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            لوحة التحكم
          </Link>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Avatar strip */}
          <div
            className="relative p-8 pb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(139,92,246,0.10) 50%, rgba(56,189,248,0.08) 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-xl text-white shadow-lg shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
                }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {dbUser?.name || "رائد أعمال"}
                </h1>
                <p className="text-sm text-neutral-400 mt-0.5 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300"
                    style={{
                      background: "rgba(245,158,11,0.12)",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                  >
                    <Crown className="w-3 h-3" />
                    Pro
                  </div>
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300"
                    style={{
                      background: "rgba(16,185,129,0.10)",
                      border: "1px solid rgba(16,185,129,0.18)",
                    }}
                  >
                    <Shield className="w-3 h-3" />
                    حساب محمي
                  </div>
                </div>
              </div>
              <Link
                href="/settings"
                className="shrink-0 text-xs text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 transition-all"
              >
                تعديل
              </Link>
            </div>
          </div>

          {/* Info rows */}
          <div className="p-6 space-y-1">
            {INFO_ROWS.map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 py-3 px-1",
                    i < INFO_ROWS.length - 1
                      ? "border-b border-white/[0.04]"
                      : ""
                  )}
                >
                  <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="text-xs text-neutral-500 w-32 shrink-0">
                    {row.label}
                  </span>
                  <span className="text-sm text-white font-medium truncate">
                    {row.value || (
                      <span className="text-neutral-600 font-normal">
                        غير محدد
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            {
              href: "/settings",
              label: "الإعدادات",
              icon: "⚙️",
              desc: "الخصوصية والإشعارات",
            },
            {
              href: "/settings/usage",
              label: "الاستخدام",
              icon: "📊",
              desc: "نسبة استهلاك الخطة",
            },
            {
              href: "/settings/api-keys",
              label: "مفاتيح API",
              icon: "🔑",
              desc: "الوصول البرمجي",
            },
            {
              href: "/opportunities",
              label: "الفرص",
              icon: "🚀",
              desc: "تمويل ومسابقات",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl p-4 flex gap-3 items-center hover:bg-white/[0.04] transition-colors"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-xl">{link.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">
                  {link.label}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">
                  {link.desc}
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Achievements strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">
              إنجازاتك
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: "🚀", label: "أول فكرة", unlocked: true },
              { emoji: "📝", label: "خطة عمل", unlocked: false },
              { emoji: "💡", label: "١٠ جلسات", unlocked: false },
            ].map((badge) => (
              <div
                key={badge.label}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-opacity",
                  badge.unlocked ? "opacity-100" : "opacity-30"
                )}
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <span className="text-[10px] text-neutral-400 text-center">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.12)",
          }}
        >
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-4">
            منطقة الخطر
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => logout()}
              variant="ghost"
              className="flex-1 h-11 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/[0.05] text-sm gap-2"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              variant="ghost"
              className="flex-1 h-11 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "جاري الحذف…" : "حذف الحساب"}
            </Button>
          </div>
        </motion.div>

      </div>
    </AppShell>
  );
}
