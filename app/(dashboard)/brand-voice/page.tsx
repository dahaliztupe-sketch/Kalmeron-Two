"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion } from "motion/react";
import {
  Mic, Save, Sparkles, Check, RefreshCw, AlertCircle,
  Volume2, MessageSquare, Pen, Star, Target,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { cn } from "@/src/lib/utils";

interface BrandVoiceData {
  name: string;
  tagline: string;
  tone: string[];
  audience: string;
  values: string;
  avoid: string;
  sampleMessage: string;
  updatedAt?: unknown;
}

const TONE_OPTIONS = [
  { id: "professional", label: "احترافي", desc: "رسمي وموثوق" },
  { id: "friendly", label: "ودود", desc: "قريب ومريح" },
  { id: "bold", label: "جريء", desc: "واثق ومؤثر" },
  { id: "educational", label: "تثقيفي", desc: "معلوماتي ومفيد" },
  { id: "inspirational", label: "ملهم", desc: "يحرك ويشجع" },
  { id: "playful", label: "مرح", desc: "خفيف ومبدع" },
  { id: "empathetic", label: "متعاطف", desc: "يفهم ويدعم" },
  { id: "concise", label: "موجز", desc: "مباشر ومركّز" },
];

const DEFAULT_DATA: BrandVoiceData = {
  name: "",
  tagline: "",
  tone: ["professional", "friendly"],
  audience: "",
  values: "",
  avoid: "",
  sampleMessage: "",
};

export default function BrandVoicePage() {
  const { user } = useAuth();
  const [data, setData] = useState<BrandVoiceData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "settings", "brand_voice"));
        if (snap.exists()) setData({ ...DEFAULT_DATA, ...snap.data() as BrandVoiceData });
      } catch {}
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, "users", user.uid, "settings", "brand_voice"), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError("تعذّر الحفظ. حاول مرة أخرى.");
    }
    setSaving(false);
  };

  const handleGeneratePreview = async () => {
    if (!data.name || !data.audience) {
      setError("أدخل اسم العلامة التجارية والجمهور المستهدف أولاً");
      return;
    }
    setGeneratingPreview(true);
    setPreview(null);
    try {
      const token = await user?.getIdToken().catch(() => null);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const r = await fetch("/api/brand-voice", {
        method: "POST",
        headers,
        body: JSON.stringify({ ...data, scenario: "منشور على وسائل التواصل الاجتماعي" }),
      });
      if (r.ok) {
        const json = await r.json() as { preview?: string; result?: string };
        setPreview(json.preview || json.result || "");
      }
    } catch {}
    setGeneratingPreview(false);
  };

  const toggleTone = (id: string) => {
    setData(prev => ({
      ...prev,
      tone: prev.tone.includes(id)
        ? prev.tone.filter(t => t !== id)
        : prev.tone.length < 4 ? [...prev.tone, id] : prev.tone,
    }));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-xs text-pink-400 font-semibold uppercase tracking-widest">إعدادات</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white mb-1">
            صوت <span className="brand-gradient-text">علامتك التجارية</span>
          </h1>
          <p className="text-neutral-400 text-sm">
            عرّف شخصية شركتك مرة واحدة — وسيطبّقها كل مساعد تلقائياً على كل مخرجاته
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-neutral-300">
            <strong className="text-white">كيف يعمل؟</strong> بعد الحفظ، سيستخدم كل مساعد ذكي هذه المعلومات تلقائياً عند كتابة المحتوى، العقود، والردود — بدون أن تكرر نفسك في كل محادثة.
          </p>
        </div>

        <div className="space-y-5">
          {/* Brand Name + Tagline */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> الهوية الأساسية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">اسم الشركة / العلامة التجارية *</label>
                <input
                  value={data.name}
                  onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                  placeholder="مثال: كلميرون، تك مصر، نوفا للخدمات..."
                  className={cn(
                    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl",
                    "px-4 py-3 text-sm text-white placeholder:text-neutral-500",
                    "focus:outline-none focus:border-indigo-500/50 transition-all"
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">شعار / tagline (اختياري)</label>
                <input
                  value={data.tagline}
                  onChange={e => setData(d => ({ ...d, tagline: e.target.value }))}
                  placeholder="مثال: حوّل فكرتك إلى شركة ناجحة"
                  className={cn(
                    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl",
                    "px-4 py-3 text-sm text-white placeholder:text-neutral-500",
                    "focus:outline-none focus:border-indigo-500/50 transition-all"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Tone */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-pink-400" /> نبرة العلامة التجارية
            </h2>
            <p className="text-xs text-neutral-500 mb-4">اختر من 2 إلى 4 نبرات تناسب شخصية شركتك</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TONE_OPTIONS.map(opt => {
                const active = data.tone.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleTone(opt.id)}
                    className={cn(
                      "rounded-xl p-3 text-right border transition-all duration-200",
                      active
                        ? "bg-pink-600/20 border-pink-500/50 text-white shadow-[0_0_12px_-4px_rgb(219_39_119/0.4)]"
                        : "bg-white/[0.03] border-white/[0.07] text-neutral-400 hover:border-white/[0.15] hover:text-white"
                    )}
                  >
                    <div className="text-xs font-bold mb-0.5">{opt.label}</div>
                    <div className="text-[10px] text-neutral-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience & Values */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" /> الجمهور والقيم
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">الجمهور المستهدف *</label>
                <input
                  value={data.audience}
                  onChange={e => setData(d => ({ ...d, audience: e.target.value }))}
                  placeholder="مثال: رواد أعمال مصريون 25-40 سنة، أصحاب مشاريع ناشئة في مرحلة التأسيس"
                  className={cn(
                    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl",
                    "px-4 py-3 text-sm text-white placeholder:text-neutral-500",
                    "focus:outline-none focus:border-indigo-500/50 transition-all"
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">قيم العلامة التجارية</label>
                <textarea
                  value={data.values}
                  onChange={e => setData(d => ({ ...d, values: e.target.value }))}
                  rows={3}
                  placeholder="مثال: الشفافية، الابتكار، دعم المجتمع المصري، الجودة قبل السرعة..."
                  className={cn(
                    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl",
                    "px-4 py-3 text-sm text-white placeholder:text-neutral-500",
                    "focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                  )}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-medium mb-1.5 block">تجنّب في الكتابة</label>
                <textarea
                  value={data.avoid}
                  onChange={e => setData(d => ({ ...d, avoid: e.target.value }))}
                  rows={2}
                  placeholder="مثال: الكلمات السلبية، المبالغة، المصطلحات التقنية المعقدة..."
                  className={cn(
                    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl",
                    "px-4 py-3 text-sm text-white placeholder:text-neutral-500",
                    "focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Preview Generator */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" /> اختبر الصوت
              </h2>
              <button
                onClick={handleGeneratePreview}
                disabled={generatingPreview}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all",
                  "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30",
                  "hover:bg-emerald-600/30 disabled:opacity-50"
                )}
              >
                {generatingPreview ? (
                  <><RefreshCw className="w-3 h-3 animate-spin" /> جاري التوليد...</>
                ) : (
                  <><Sparkles className="w-3 h-3" /> اولّد مثالاً</>
                )}
              </button>
            </div>
            {preview ? (
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-sm text-neutral-200 leading-relaxed">
                {preview}
              </div>
            ) : (
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 text-xs text-neutral-500 text-center">
                اضغط &quot;اولّد مثالاً&quot; لتجربة كيف سيكتب المساعد بصوت علامتك التجارية
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !data.name}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 rounded-2xl",
              "text-sm font-bold transition-all duration-200",
              saved
                ? "bg-emerald-600 text-white"
                : "btn-primary",
              "disabled:opacity-50"
            )}
          >
            {saving ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> تم الحفظ بنجاح!</>
            ) : (
              <><Save className="w-4 h-4" /> حفظ صوت العلامة التجارية</>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
