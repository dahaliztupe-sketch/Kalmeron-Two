"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import {
  User, Save, Loader2, CheckCircle2, Mail, Building2,
  Globe, Briefcase, Phone, Star, Award, TrendingUp, Zap,
  RefreshCw, AlertCircle, ExternalLink, Upload,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

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
  const [uploading, setUploading] = useState(false);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors";

  const initials = ((user?.displayName || user?.email || "U"))
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const set = useCallback((key: keyof ProfileData, value: string) => {
    setProfile(p => ({ ...p, [key]: value }));
  }, []);

  useEffect(() => {
    if (!user?.uid || !db) return;
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db!, "users", user!.uid));
        if (!mounted) return;
        if (snap.exists()) {
          const d = snap.data() as Partial<ProfileData>;
          setProfile({
            displayName: d.displayName || user!.displayName || "",
            companyName: d.companyName || "",
            role: d.role || "",
            phone: d.phone || "",
            website: d.website || "",
            bio: d.bio || "",
            industry: d.industry || "",
            stage: d.stage || "",
          });
        } else {
          setProfile(p => ({ ...p, displayName: user!.displayName || "" }));
        }
      } catch {
        if (mounted) setError("تعذّر تحميل الملف الشخصي");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadProfile();
    return () => { mounted = false; };
  }, [user]);

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

  async function uploadAvatar(file: File) {
    if (!user?.uid) return;
    if (!file.type.startsWith("image/")) {
      toast.error("اختر صورة صالحة فقط");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("uid", user.uid);
      const token = await user.getIdToken();
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "upload-failed");
      toast.success("تم تحديث الصورة الشخصية");
      window.location.reload();
    } catch {
      toast.error("تعذّر رفع الصورة الآن");
    } finally {
      setUploading(false);
    }
  }

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

          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
              <RefreshCw size={18} className="animate-spin" />
              <span>جاري تحميل بياناتك...</span>
            </div>
          )}

          {!loading && (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {user?.photoURL ? (
                      <Image src={user.photoURL} alt="avatar" width={80} height={80} className="rounded-2xl object-cover ring-2 ring-slate-600" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold">{user?.displayName || profile.displayName || "مستخدم جديد"}</h2>
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-neutral-300 cursor-pointer hover:bg-white/[0.07] transition-colors">
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {uploading ? "جارٍ الرفع..." : "تغيير الصورة"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
                      </label>
                    </div>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                      <Mail size={13} /> {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium">المجاني</span>
                      {user?.emailVerified && <span className="px-2.5 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium">محقق</span>}
                      {profile.industry && <span className="px-2.5 py-1 bg-slate-700/60 text-slate-300 border border-slate-600/40 rounded-lg text-xs">{profile.industry}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-4 gap-3">
                {stats.map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-center">
                    <Icon size={16} className={`${color} mx-auto mb-1`} />
                    <div className={`text-lg font-bold ${color}`}>{value}</div>
                    <div className="text-slate-500 text-xs">{label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <User size={16} className="text-cyan-400" /> المعلومات الشخصية
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">الاسم الكامل</label>
                    <input value={profile.displayName} onChange={e => set("displayName", e.target.value)} placeholder="محمد أحمد" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">رقم الهاتف</label>
                    <input value={profile.phone} onChange={e => set("phone", e.target.value)} placeholder="+20 1xx xxxx xxxx" className={inputClass} dir="ltr" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">منصبك / دورك</label>
                    <input value={profile.role} onChange={e => set("role", e.target.value)} placeholder="CEO / مؤسس" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">الموقع الإلكتروني</label>
                    <input value={profile.website} onChange={e => set("website", e.target.value)} placeholder="https://yourcompany.com" className={inputClass} dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">نبذة تعريفية</label>
                  <textarea value={profile.bio} onChange={e => set("bio", e.target.value)} placeholder="رائد أعمال متسلسل مع شغف بالتقنية والابتكار في السوق المصري..." rows={3} className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm transition-colors" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Building2 size={16} className="text-cyan-400" /> بيانات الشركة
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">اسم الشركة / المشروع</label>
                    <input value={profile.companyName} onChange={e => set("companyName", e.target.value)} placeholder="شركتي الناشئة" className={inputClass} />
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
                        <button key={s} onClick={() => set("stage", s === profile.stage ? "" : s)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${profile.stage === s ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/50" : "bg-slate-700/40 text-slate-400 hover:text-slate-200 border border-slate-600/40"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> جاري الحفظ في Firestore...</> : saved ? <><CheckCircle2 size={16} className="text-emerald-300" /> تم الحفظ بنجاح</> : <><Save size={16} /> حفظ التغييرات</>}
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
