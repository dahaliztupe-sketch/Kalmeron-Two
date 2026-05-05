"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Sparkles, ArrowLeft, Loader2, AlertTriangle,
  CheckCircle2, Upload, Shield, Scale, ChevronDown, ChevronUp,
  Copy, Check, FileUp, X, AlertCircle, XCircle, Info,
} from "lucide-react";

interface DangerClause { clause: string; risk: string; recommendation: string }
interface ParsedReview {
  summary: string;
  riskLevel: string;
  riskLabel: string;
  dangerClauses: DangerClause[];
  missingClauses: string[];
  positivePoints: string[];
  recommendation: string;
  disclaimer: string;
  rawText: string;
}

function parseContractResult(raw: string): ParsedReview {
  const extract = (heading: RegExp, nextHeadings: RegExp[]): string => {
    const start = raw.search(heading);
    if (start === -1) return '';
    const afterHead = raw.indexOf('\n', start);
    if (afterHead === -1) return '';
    let end = raw.length;
    for (const nh of nextHeadings) {
      const ni = raw.search(nh);
      if (ni > afterHead && ni < end) end = ni;
    }
    return raw.slice(afterHead, end).trim();
  };

  const summaryRaw = extract(/##\s*ملخص/, [/##\s*مستوى/, /##\s*البنود الخطرة/, /##\s*البنود الناقصة/, /##\s*النقاط/, /##\s*الخلاصة/, /##\s*تحذير/]);
  const riskRaw = extract(/##\s*مستوى المخاطر/, [/##\s*البنود الخطرة/, /##\s*البنود الناقصة/, /##\s*النقاط/, /##\s*الخلاصة/, /##\s*تحذير/]);
  const dangerRaw = extract(/##.*البنود الخطرة/, [/##\s*البنود الناقصة/, /##\s*النقاط/, /##\s*الخلاصة/, /##\s*تحذير/]);
  const missingRaw = extract(/##.*البنود الناقصة/, [/##\s*النقاط/, /##\s*الخلاصة/, /##\s*تحذير/]);
  const positiveRaw = extract(/##.*النقاط الإيجابية/, [/##\s*الخلاصة/, /##\s*تحذير/]);
  const recRaw = extract(/##.*الخلاصة.*التوصية/, [/##\s*تحذير/]);
  const disclaimerRaw = extract(/##.*تحذير/, [/$^/]);

  const riskLower = riskRaw.toLowerCase();
  const riskLevel = riskLower.includes('حرج') ? 'critical'
    : riskLower.includes('عالٍ') || riskLower.includes('عال') ? 'high'
    : riskLower.includes('متوسط') ? 'medium'
    : riskLower.includes('منخفض') ? 'low'
    : 'unknown';
  const riskLabel = riskLower.includes('حرج') ? 'حرج' : riskLower.includes('عالٍ') || riskLower.includes('عال') ? 'عالٍ' : riskLower.includes('متوسط') ? 'متوسط' : riskLower.includes('منخفض') ? 'منخفض' : 'غير محدد';

  const parseDangerClauses = (text: string): DangerClause[] => {
    const clauses: DangerClause[] = [];
    const blocks = text.split(/\n(?=\s*[-•*]|\s*\d+\.)/).filter(Boolean);
    for (const block of blocks) {
      const clauseMatch = block.match(/\*\*البند[:\s*]*\*\*(.+?)(?=\*\*الخطر|\*\*التوصية|$)/si);
      const riskMatch = block.match(/\*\*الخطر[:\s*]*\*\*(.+?)(?=\*\*التوصية|\*\*البند|$)/si);
      const recMatch = block.match(/\*\*التوصية[:\s*]*\*\*(.+?)(?=\*\*البند|\*\*الخطر|$)/si);
      if (clauseMatch || riskMatch) {
        clauses.push({
          clause: (clauseMatch?.[1] || '').trim().replace(/\*/g, ''),
          risk: (riskMatch?.[1] || '').trim().replace(/\*/g, ''),
          recommendation: (recMatch?.[1] || '').trim().replace(/\*/g, ''),
        });
      }
    }
    return clauses;
  };

  const parseList = (text: string): string[] =>
    text.split('\n').map(l => l.replace(/^[-•*\d.)\s]+/, '').trim()).filter(l => l.length > 5);

  return {
    summary: summaryRaw,
    riskLevel,
    riskLabel,
    dangerClauses: parseDangerClauses(dangerRaw),
    missingClauses: parseList(missingRaw),
    positivePoints: parseList(positiveRaw),
    recommendation: recRaw,
    disclaimer: disclaimerRaw,
    rawText: raw,
  };
}
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

const CONTRACT_TYPES = [
  "عقد شراكة / مؤسسين", "عقد توظيف", "عقد استشارة / Freelance",
  "عقد إيجار مكتب أو مستودع", "عقد بيع أو توريد",
  "عقد خدمات برمجية / SaaS", "اتفاقية NDA / سرية",
  "اتفاقية استثمار / Term Sheet", "عقد إيجار تجاري", "أخرى",
];

const PARTY_ROLES = [
  { value: "buyer", label: "مشترٍ" },
  { value: "seller", label: "بائع" },
  { value: "employer", label: "صاحب عمل" },
  { value: "employee", label: "موظف" },
  { value: "investor", label: "مستثمر" },
  { value: "founder", label: "مؤسس" },
  { value: "other", label: "طرف في العقد" },
];

const RISK_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  critical: { border: 'border-rose-500/40', bg: 'bg-rose-500/5', text: 'text-rose-300', badge: 'bg-rose-500/20 text-rose-300' },
  high:     { border: 'border-orange-500/40', bg: 'bg-orange-500/5', text: 'text-orange-300', badge: 'bg-orange-500/20 text-orange-300' },
  medium:   { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-300', badge: 'bg-amber-500/15 text-amber-300' },
  low:      { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-300', badge: 'bg-emerald-500/15 text-emerald-300' },
  unknown:  { border: 'border-white/10', bg: 'bg-white/[0.03]', text: 'text-white/60', badge: 'bg-white/10 text-white/50' },
};

export default function ContractReviewPage() {
  const { user } = useAuth();
  const t = useTranslations("ContractReview");
  const [contractText, setContractText] = useState("");
  const [contractType, setContractType] = useState("");
  const [partyRole, setPartyRole] = useState("");
  const [specificConcerns, setSpecificConcerns] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = contractText.trim().length >= 50 && !loading;

  const handleReview = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/contract-review", {
        method: "POST",
        headers,
        body: JSON.stringify({ contractText, contractType, partyRole, specificConcerns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في الخادم");
      setResult(data.result ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [contractText, contractType, partyRole, specificConcerns, user, canSubmit]);

  const handlePdfUpload = useCallback(async (file: File) => {
    if (!user) { setError("يجب تسجيل الدخول لرفع ملفات PDF"); return; }
    if (!file.type.includes("pdf")) { setError("يُقبل فقط ملفات PDF"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("حجم الملف يتجاوز الحد المسموح (10 MB)"); return; }
    setPdfUploading(true);
    setPdfFileName(file.name);
    setError("");
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json() as { text?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "فشل استخراج النص من الـ PDF");
      if (data.text && data.text.trim().length >= 50) {
        setContractText(data.text.slice(0, 15000));
      } else {
        throw new Error("لم يتمكن النظام من استخراج نص كافٍ من الـ PDF — تأكد من أن الملف نصي وليس صور ممسوحة ضوئياً");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في رفع الملف");
      setPdfFileName("");
    } finally {
      setPdfUploading(false);
    }
  }, [user]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
  }, [handlePdfUpload]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContractText(text);
    } catch {
      /* silent */
    }
  }, []);

  const copyResult = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* silent */ }
  }, [result]);

  const reset = () => { setContractText(""); setResult(""); setError(""); setContractType(""); setPartyRole(""); setSpecificConcerns(""); setPdfFileName(""); };

  const parsed = useMemo(() => result ? parseContractResult(result) : null, [result]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">{t("eyebrow")}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">{t("title")}</h1>
            <p className="text-white/50 max-w-xl text-sm">{t("subtitle")}</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("dashboard")}
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-200/80 text-xs leading-relaxed">
            {t("disclaimer")}
          </p>
        </div>

        {!result ? (
          <div className="space-y-4">
            {/* Contract Type + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <label className="block text-xs text-white/50 mb-2 font-medium">{t("contractTypeLabel")}</label>
                <select value={contractType} onChange={e => setContractType(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none">
                  <option value="" className="bg-[#0a0a1a]">{t("selectContractType")}</option>
                  {CONTRACT_TYPES.map(t => <option key={t} value={t} className="bg-[#0a0a1a]">{t}</option>)}
                </select>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <label className="block text-xs text-white/50 mb-2 font-medium">{t("partyRoleLabel")}</label>
                <select value={partyRole} onChange={e => setPartyRole(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none">
                  <option value="" className="bg-[#0a0a1a]">{t("selectRole")}</option>
                  {PARTY_ROLES.map(r => <option key={r.value} value={r.value} className="bg-[#0a0a1a]">{r.label}</option>)}
                </select>
              </div>
            </div>

            {/* PDF Upload */}
            <div
              className="rounded-2xl border-2 border-dashed border-amber-500/20 bg-amber-500/[0.03] p-5 cursor-pointer hover:border-amber-500/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePdfUpload(f); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  {pdfUploading ? <Loader2 className="w-5 h-5 text-amber-400 animate-spin" /> : <FileUp className="w-5 h-5 text-amber-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  {pdfFileName ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm text-emerald-400 truncate">{pdfFileName}</span>
                      <button onClick={e => { e.stopPropagation(); setPdfFileName(""); setContractText(""); }} className="text-white/30 hover:text-rose-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-white/80">ارفع ملف العقد PDF</p>
                      <p className="text-xs text-white/40 mt-0.5">اسحب وأفلت أو اضغط للاختيار — حد أقصى 10 MB</p>
                    </>
                  )}
                </div>
                {pdfUploading && <span className="text-xs text-amber-400">جاري استخراج النص...</span>}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-xs text-white/30">أو أدخل النص مباشرة</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Contract Text */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white">{t("contractTextLabel")}</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">{contractText.length.toLocaleString("ar-EG")} حرف</span>
                  <button onClick={handlePaste} className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors border border-amber-500/20 rounded-lg px-2.5 py-1">
                    <Upload className="w-3 h-3" /> {t("pasteFromClipboard")}
                  </button>
                </div>
              </div>
              <textarea
                value={contractText}
                onChange={e => setContractText(e.target.value)}
                placeholder={t("textPlaceholder")}
                rows={10}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/90 placeholder:text-white/20 p-4 text-sm resize-y focus:outline-none focus:border-amber-500/40 transition-colors font-mono leading-relaxed"
              />
              {contractText.length < 50 && contractText.length > 0 && (
                <p className="text-xs text-rose-400 mt-2">{t("tooShortError")}</p>
              )}
            </div>

            {/* Advanced Options */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <button onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between p-4 text-sm text-white/60 hover:text-white/80 transition-colors">
                <span>{t("advancedOptions")}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showAdvanced && (
                <div className="px-4 pb-4">
                  <label className="block text-xs text-white/50 mb-2">{t("specificConcernsLabel")}</label>
                  <textarea
                    value={specificConcerns}
                    onChange={e => setSpecificConcerns(e.target.value)}
                    placeholder={t("specificConcernsPlaceholder")}
                    rows={3}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/90 placeholder:text-white/20 p-3 text-sm resize-none focus:outline-none focus:border-amber-500/40 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Action */}
            <button onClick={handleReview} disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scale className="w-5 h-5" />}
              {loading ? t("reviewing") : t("reviewButton")}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        ) : parsed ? (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Header bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{t("analysisComplete")}</span>
                  {contractType && <span className="text-xs text-white/40 border border-white/10 rounded-full px-2.5 py-0.5">{contractType}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyResult}
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? t("copied") : t("copy")}
                  </button>
                  <button onClick={reset}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-lg px-3 py-1.5 transition-colors">
                    <FileText className="w-3 h-3" /> {t("newContract")}
                  </button>
                </div>
              </div>

              {/* Risk Level Badge */}
              {parsed.riskLevel !== 'unknown' && (
                <div className={`flex items-center gap-3 rounded-xl border p-4 ${RISK_COLORS[parsed.riskLevel].border} ${RISK_COLORS[parsed.riskLevel].bg}`}>
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${RISK_COLORS[parsed.riskLevel].text}`} />
                  <div>
                    <span className="text-xs text-white/40 block mb-0.5">مستوى المخاطر الكلي</span>
                    <span className={`text-sm font-bold ${RISK_COLORS[parsed.riskLevel].text}`}>{parsed.riskLabel}</span>
                  </div>
                </div>
              )}

              {/* Summary */}
              {parsed.summary && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-semibold text-white">ملخص العقد</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{parsed.summary}</p>
                </div>
              )}

              {/* Danger Clauses */}
              {parsed.dangerClauses.length > 0 && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-semibold text-white">البنود الخطرة</span>
                    <span className="text-xs text-rose-400 border border-rose-500/20 rounded-full px-2 py-0.5">{parsed.dangerClauses.length}</span>
                  </div>
                  <div className="space-y-3">
                    {parsed.dangerClauses.map((c, i) => (
                      <div key={i} className="rounded-xl border border-rose-500/15 bg-rose-500/[0.06] p-4 space-y-2">
                        {c.clause && (
                          <div>
                            <span className="text-xs text-rose-300/60 font-medium block mb-0.5">البند</span>
                            <p className="text-white/80 text-sm leading-relaxed font-mono text-xs bg-black/20 p-2 rounded-lg">{c.clause}</p>
                          </div>
                        )}
                        {c.risk && (
                          <div>
                            <span className="text-xs text-rose-300/60 font-medium block mb-0.5">الخطر</span>
                            <p className="text-rose-200/80 text-sm leading-relaxed">{c.risk}</p>
                          </div>
                        )}
                        {c.recommendation && (
                          <div>
                            <span className="text-xs text-emerald-300/60 font-medium block mb-0.5">التوصية</span>
                            <p className="text-emerald-200/80 text-sm leading-relaxed">{c.recommendation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Clauses */}
              {parsed.missingClauses.length > 0 && (
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold text-white">البنود الناقصة</span>
                    <span className="text-xs text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5">{parsed.missingClauses.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {parsed.missingClauses.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-orange-100/80">
                        <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Positive Points */}
              {parsed.positivePoints.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">النقاط الإيجابية</span>
                    <span className="text-xs text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">{parsed.positivePoints.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {parsed.positivePoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-emerald-100/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall Recommendation */}
              {parsed.recommendation && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">الخلاصة والتوصية</span>
                  </div>
                  <p className="text-amber-100/80 text-sm leading-relaxed">{parsed.recommendation}</p>
                </div>
              )}

              {/* Fallback raw if parser found nothing structured */}
              {!parsed.summary && !parsed.dangerClauses.length && !parsed.recommendation && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">{result}</div>
                </div>
              )}

              {/* Legal disclaimer footer */}
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-amber-200/80 text-xs">{t("footerDisclaimer")}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </AppShell>
  );
}
