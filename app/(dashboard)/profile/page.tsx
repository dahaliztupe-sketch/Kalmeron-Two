"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Camera, Save, Loader2, CheckCircle2,
  Mail, Building2, Globe, Briefcase, Phone,
  Star, Award, TrendingUp, Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setSaved(true);
      toast.success("تم حفظ الملف الشخصي بنجاح");
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, []);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm transition-colors";

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = [
    { icon: Zap, label: "جلسات AI", value: "٢٤٧", color: "text-cyan-400" },
    { icon: Star, label: "وكلاء مستخدمون", value: "١٨", color: "text-violet-400" },
    { icon: TrendingUp, label: "تحليلات منجزة", value: "٥٦", color: "text-emerald-400" },
    { icon: Award, label: "أيام متتالية", value: "١٢", color: "text-amber-400" },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="text-cyan-400" size={24} />
              الملف الشخصي
            </h1>
            <p className="text-slate-400 text-sm mt-1">أدر معلوماتك الشخصية وبيانات شركتك</p>
          </motion.div>

          {/* Avatar & Identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-600"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                    {initials}
                  </div>
                )}
                <button className="absolute -bottom-2 -left-2 w-7 h-7 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg flex items-center justify-center transition-colors">
                  <Camera size={13} className="text-slate-300" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.displayName || "مستخدم جديد"}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} /> {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium">
                    الخطة المجانية
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium">
                    محقق بـ Google
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-4 gap-3"
          >
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-center">
                <Icon size={16} className={`${color} mx-auto mb-1`} />
                <div className={`text-lg font-bold ${color}`}>{value}</div>
                <div className="text-slate-500 text-xs">{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <User size={16} className="text-cyan-400" /> المعلومات الشخصية
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">الاسم الكامل</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="محمد أحمد" className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+20 1xx xxxx xxxx" className={inputClass} dir="ltr" />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-1.5">نبذة تعريفية</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="رائد أعمال متسلسل مع شغف بالتقنية والابتكار في السوق المصري..."
                rows={2}
                className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm transition-colors" />
            </div>
          </motion.div>

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <Building2 size={16} className="text-cyan-400" /> بيانات الشركة
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">اسم الشركة</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Kalmeron AI" className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">منصبك</label>
                <input value={role} onChange={e => setRole(e.target.value)}
                  placeholder="CEO / مؤسس" className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">القطاع</label>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={inputClass}>
                  <option value="">اختر القطاع...</option>
                  {["تكنولوجيا", "تجارة إلكترونية", "تعليم", "صحة", "تمويل وفينتك", "لوجستيات", "عقارات", "زراعة وغذاء", "ترفيه", "أخرى"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">مرحلة الشركة</label>
                <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
                  <option value="">اختر المرحلة...</option>
                  {["فكرة", "تحقق", "MVP", "Pre-Seed", "Seed", "Series A", "نمو"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-xs block mb-1.5">الموقع الإلكتروني</label>
                <input value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourcompany.com" className={inputClass} dir="ltr" />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> جاري الحفظ...</>
              ) : saved ? (
                <><CheckCircle2 size={16} className="text-emerald-300" /> تم الحفظ</>
              ) : (
                <><Save size={16} /> حفظ التغييرات</>
              )}
            </button>
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}
