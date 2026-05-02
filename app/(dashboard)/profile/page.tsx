"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import {
  User, Save, Loader2, CheckCircle2, Mail, Building2,
  Globe, Briefcase, Phone, Star, Award, TrendingUp, Zap,
  RefreshCw, AlertCircle, ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";

interface ProfileData {
  displayName: string;
  companyName: string;
  role: string;
  phone: string;
  website: string;
  bio: string;
  industry: string;
  stage: string;
  updatedAt?: unknown;
}

const DEFAULT_PROFILE: ProfileData = {
  displayName: "", companyName: "", role: "", phone: "",
  website: "", bio: "", industry: "", stage: "",
};

const INDUSTRIES = [
  "تكنولوجيا", "تجارة إلكترونية", "تعليم", "صحة", "تمويل وفينتك",
  "لوجستيات", "عقارات", "زراعة وغذاء", "ترفيه", "أخرى",
];

const STAGES = [
  "فكرة", "تحقق من السوق", "MVP", "Pre-Seed", "Seed", "Series A", "نمو وتوسع",
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors";

  const initials = ((user?.displayName || user?.email || "U"))
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const set = useCallback((key: keyof ProfileData, value: string) => {
    setProfile(p => ({ ...p, [key]: value }));
  }, []);

  // ── Load from Firestore ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !db) return;
    setLoading(true);
    getDoc(doc(db, "users", user.uid))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data() as Partial<ProfileData>;
          setProfile({
            displayName: d.displayName || user.displayName || "",
            companyName: d.companyName || "",
            role: d.role || "",
            phone: d.phone || "",
            website: d.website || "",
            bio: d.bio || "",
            industry: d.industry || "",
            stage: d.stage || "",
          });
        } else {
          setProfile(p => ({ ...p, displayName: user.displayName || "" }));
        }
      })
      .catch(() => setError("تعذّر تحميل الملف الشخصي"))
      .finally(() => setLoading(false));
  }, [user]);

  // ── Save to Firestore ──────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!user?.uid || !db || saving) return;
    setSaving(true);
    setError("");
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        email: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      toast.success("تم حفظ الملف الشخصي في Firestore");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("تعذّر حفظ التغييرات");
      toast.error("فشل حفظ الملف الشخصي");
    } finally {
      setSaving(false);
    }
  }, [user, profile, saving]);

  const stats = [
    { icon: Zap, label: "جلسات AI", value: "—", color: "text-cyan-400" },
    { icon: Star, label: "وكلاء مستخدمون", value: "—", color: "text-violet-400" },
    { icon: TrendingUp, label: "تحليلات منجزة", value: "—", color: "text-emerald-400" },
    { icon: Award, label: "أيام نشاط", value: "—", color: "text-amber-400" },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="text-cyan-400" size={24} />
                الملف الشخصي
              </h1>
              <p className="text-slate-400 text-sm mt-1">بيانات حسابك وشركتك — محفوظة تلقائياً في Firestore</p>
            </div>
            <Link href="/settings" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 hover:bg-slate-600/40 text-slate-300 rounded-lg text-sm transition-colors">
              <ExternalLink size={13} /> الإعدادات
            </Link>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
              <RefreshCw size={18} className="animate-spin" />
              <span>جاري تحميل بياناتك...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Avatar & Identity */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="avatar"
                        className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-600" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user?.displayName || profile.displayName || "مستخدم جديد"}</h2>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                      <Mail size={13} /> {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium">
                        المجاني
                      </span>
                      {user?.emailVerified && (
                        <span className="px-2.5 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium">
                          محقق
                        </span>
                      )}
                      {profile.industry && (
                        <span className="px-2.5 py-1 bg-slate-700/60 text-slate-300 border border-slate-600/40 rounded-lg text-xs">
                          {profile.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="grid grid-cols-4 gap-3">
                {stats.map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-center">
                    <Icon size={16} className={`${color} mx-auto mb-1`} />
                    <div className={`text-lg font-bold ${color}`}>{value}</div>
                    <div className="text-slate-500 text-xs">{label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Personal Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <User size={16} className="text-cyan-400" /> المعلومات الشخصية
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">الاسم الكامل</label>
                    <input value={profile.displayName} onChange={e => set("displayName", e.target.value)}
                      placeholder="محمد أحمد" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">رقم الهاتف</label>
                    <input value={profile.phone} onChange={e => set("phone", e.target.value)}
                      placeholder="+20 1xx xxxx xxxx" className={inputClass} dir="ltr" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">منصبك / دورك</label>
                    <input value={profile.role} onChange={e => set("role", e.target.value)}
                      placeholder="CEO / مؤسس" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">الموقع الإلكتروني</label>
                    <input value={profile.website} onChange={e => set("website", e.target.value)}
                      placeholder="https://yourcompany.com" className={inputClass} dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">نبذة تعريفية</label>
                  <textarea value={profile.bio} onChange={e => set("bio", e.target.value)}
                    placeholder="رائد أعمال متسلسل مع شغف بالتقنية والابتكار في السوق المصري..."
                    rows={3}
                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm transition-colors" />
                </div>
              </motion.div>

              {/* Company Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Building2 size={16} className="text-cyan-400" /> بيانات الشركة
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">اسم الشركة / المشروع</label>
                    <input value={profile.companyName} onChange={e => set("companyName", e.target.value)}
                      placeholder="شركتي الناشئة" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">القطاع</label>
                    <select value={profile.industry} onChange={e => set("industry", e.target.value)} className={inputClass}>
                      <option value="">اختر القطاع...</option>
                      {INDUSTRIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-400 text-xs block mb-1.5">مرحلة الشركة</label>
                    <div className="flex flex-wrap gap-2">
                      {STAGES.map(s => (
                        <button key={s} onClick={() => set("stage", s === profile.stage ? "" : s)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            profile.stage === s
                              ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/50"
                              : "bg-slate-700/40 text-slate-400 hover:text-slate-200 border border-slate-600/40"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Save Button */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> جاري الحفظ في Firestore...</>
                  ) : saved ? (
                    <><CheckCircle2 size={16} className="text-emerald-300" /> تم الحفظ بنجاح</>
                  ) : (
                    <><Save size={16} /> حفظ التغييرات</>
                  )}
                </button>
              </motion.div>
            </>
          )}

        </div>
      </div>
    </AppShell>
  );
}
