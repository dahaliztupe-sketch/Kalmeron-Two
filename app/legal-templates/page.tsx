"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Sparkles,
  Clock,
  ArrowLeft,
  Download,
  Copy,
  Check,
  ScrollText,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATES } from "@/src/lib/seo/templates";
import { generateNDA } from "@/src/lib/legal-templates";

const LEGAL_TEMPLATES = TEMPLATES.filter((t) => t.category === "legal");

const FORMAT_BADGE: Record<string, string> = {
  docx: "DOCX",
  xlsx: "XLSX",
  pdf: "PDF",
  pptx: "PPTX",
  notion: "Notion",
  figma: "Figma",
};

const DIFFICULTY_AR: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسّط",
  advanced: "متقدّم",
};

export default function LegalTemplatesPage() {
  const [disclosing, setDisclosing] = useState("");
  const [receiving, setReceiving] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("سنة واحدة");
  const [output, setOutput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const text = generateNDA(
      disclosing || "الطرف الأول",
      receiving || "الطرف الثاني",
      purpose || "تطوير مشروع مشترك",
      duration || "سنة واحدة",
    );
    setOutput(text);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "NDA-كلميرون.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-10 text-center overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(79,70,229,0.18),transparent)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-xs text-cyan-300 mb-6">
            <Shield className="w-3.5 h-3.5" />
            مكتبة قانونية متوافقة مع قانون 151 المصري
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            مكتبة النماذج القانونية
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            عقود واتفاقيّات جاهزة بمعايير المحامين، مع مولِّد فوري للـ NDA وقوالب
            قابلة للتنزيل لكلّ احتياجاتك التأسيسيّة والتشغيلية.
          </p>
        </div>
      </section>

      {/* Live NDA generator */}
      <section className="px-6 pb-16" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">مولِّد NDA فوري</h2>
            <span className="text-xs text-neutral-500">— استبدل البيانات واضغط توليد</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disclosing" className="text-neutral-300">الطرف الأول (المُفصِح)</Label>
                <Input
                  id="disclosing"
                  value={disclosing}
                  onChange={(e) => setDisclosing(e.target.value)}
                  placeholder="مثلاً: شركة كلميرون ش.م.م"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiving" className="text-neutral-300">الطرف الثاني (المُتَلَقّي)</Label>
                <Input
                  id="receiving"
                  value={receiving}
                  onChange={(e) => setReceiving(e.target.value)}
                  placeholder="مثلاً: م. أحمد خالد"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-neutral-300">الغرض من التبادل</Label>
                <Input
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="مثلاً: مناقشة استثمار في الجولة الأوّليّة"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-neutral-300">المدّة</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="مثلاً: سنتان"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
              <Button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl"
              >
                <Sparkles className="w-4 h-4 ml-2" />
                توليد النموذج الآن
              </Button>
              <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                ⚠️ هذا النموذج للاسترشاد فقط ولا يُغني عن استشارة محامٍ مختصّ قبل التوقيع.
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <ScrollText className="w-4 h-4" />
                  <span className="font-bold text-sm">معاينة المستند</span>
                </div>
                {output && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                      aria-label="نسخ"
                      type="button"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                      aria-label="تنزيل"
                      type="button"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              {output ? (
                <pre className="whitespace-pre-wrap text-sm text-neutral-200 leading-relaxed font-sans max-h-[420px] overflow-y-auto">
                  {output}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 text-neutral-500">
                  <FileText className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">املأ الحقول واضغط "توليد النموذج" لرؤية المعاينة هنا.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Library grid */}
      <section className="px-6 pb-20" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">جميع القوالب القانونيّة</h2>
              <p className="text-neutral-400 text-sm">
                {LEGAL_TEMPLATES.length} قالب احترافي قابل للتعديل والتنزيل.
              </p>
            </div>
            <Link
              href="/templates"
              className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
            >
              المكتبة الكاملة (كل الفئات)
              <ArrowLeft className="w-4 h-4 icon-flip" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEGAL_TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="group rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm leading-snug group-hover:text-cyan-200 transition-colors">
                      {t.titleAr}
                    </h3>
                  </div>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed mb-4 line-clamp-3">
                  {t.metaDescriptionAr}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {DIFFICULTY_AR[t.difficulty] || t.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t.estimatedTimeMinutes} د
                  </span>
                  <span className="ms-auto inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300 text-[10px] font-bold uppercase">
                    {FORMAT_BADGE[t.format] || t.format}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Award({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
