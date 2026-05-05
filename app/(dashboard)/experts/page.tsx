"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star, Plus, Loader2, MessageSquare, X, Send,
  Sparkles, Brain, Search, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Expert {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  tools?: string[];
  rating?: number;
}

const PLACEHOLDER_EXPERTS = [
  { desc: "خبير تسويق رقمي متخصص في المتاجر الإلكترونية المصرية مع خبرة في إعلانات Meta وTikTok" },
  { desc: "محامي عقود متخصص في قانون الشركات والعقود التجارية في مصر" },
  { desc: "مستشار مالي متخصص في تقييم الشركات الناشئة وإعداد نماذج التدفق النقدي" },
];

export default function ExpertsPage() {
  const { user } = useAuth();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState<Expert | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const r = await fetch("/api/experts", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const j = await r.json();
      setExperts(j.experts || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    async function run() { await load(); }
    void run();
  }, [load]);

  async function create() {
    if (!description.trim() || !user) return;
    setCreating(true);
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description, creatorId: user.uid }),
      });
      if (!r.ok) throw new Error("فشل الإنشاء");
      setDescription("");
      toast.success("تم إنشاء الخبير!");
      await load();
    } catch {
      toast.error("تعذّر إنشاء الخبير. حاول مجدداً.");
    } finally {
      setCreating(false);
    }
  }

  async function ask() {
    if (!active || !question.trim() || !user) return;
    setAsking(true);
    setAnswer("");
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/experts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "invoke", expertId: active.id, message: question }),
      });
      const j = await r.json();
      setAnswer(j.output || j.error || "لا يوجد رد.");
    } catch {
      setAnswer("تعذّر الحصول على رد. حاول مجدداً.");
    } finally {
      setAsking(false);
    }
  }

  const filtered = experts.filter((e) =>
    !searchQ || (e.name + (e.domain || "") + (e.description || "")).toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.06] px-3 py-1 text-[11px] text-violet-200 mb-3">
            <Star className="w-3.5 h-3.5" />
            سوق الخبراء · AI-Powered
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">سوق الخبراء</h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            أنشئ خبراء ذكاء اصطناعي متخصصين من وصف بالعربية — يتعلّمون نطاقهم ويُجيبون على أسئلتك الدقيقة.
          </p>
        </motion.div>

        {/* Create Expert */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-neutral-300 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-400" />
              إنشاء خبير جديد
            </h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="صف خبيرك بالتفصيل — مثال: خبير تسويق رقمي متخصص في المتاجر الإلكترونية المصرية مع خبرة في إعلانات Meta وTikTok والتحليل الإحصائي..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors min-h-[80px] resize-none placeholder:text-neutral-600 mb-3"
              maxLength={2000}
            />
            {/* Quick placeholders */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PLACEHOLDER_EXPERTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(p.desc)}
                  className="text-xs text-neutral-500 hover:text-neutral-300 border border-neutral-700/50 hover:border-neutral-600 rounded-lg px-2.5 py-1 transition-colors line-clamp-1 max-w-[200px] text-right"
                >
                  {p.desc.slice(0, 40)}...
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={create}
                disabled={creating || !description.trim()}
                className="h-9 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {creating ? "جارٍ الإنشاء..." : "إنشاء الخبير"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        {experts.length > 0 && (
          <div className="relative mb-5">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="ابحث عن خبير..."
              className="w-full bg-neutral-900/60 border border-neutral-700/50 rounded-xl pr-9 pl-4 py-2.5 text-white text-sm outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        )}

        {/* Experts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{experts.length === 0 ? "لا يوجد خبراء بعد. أنشئ أول خبير أعلاه." : "لا نتائج مطابقة."}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {filtered.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 hover:border-violet-500/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-violet-400" />
                  </div>
                  {e.rating != null && (
                    <span className="text-xs text-amber-400 flex items-center gap-0.5">
                      ★ {e.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{e.name || "خبير جديد"}</h3>
                {e.domain && <p className="text-xs text-violet-400 mb-2">{e.domain}</p>}
                {e.description && (
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{e.description}</p>
                )}
                {(e.tools || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(e.tools || []).slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-full text-neutral-400">{t}</span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setActive(e); setAnswer(""); setQuestion(""); }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-400/40 rounded-xl py-2 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  استشر الخبير
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Chat Modal */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50"
              onClick={() => setActive(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.97 }}
                className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                  <div>
                    <h2 className="font-bold text-white text-sm">{active.name || "خبير"}</h2>
                    {active.domain && <p className="text-xs text-violet-400 mt-0.5">{active.domain}</p>}
                  </div>
                  <button onClick={() => setActive(null)} className="text-neutral-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Answer */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {answer ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-violet-300 prose-strong:text-white" dir="auto">
                      <ReactMarkdown>{answer}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm text-center py-8">
                      {asking ? "جارٍ التفكير..." : "اكتب سؤالك أدناه للبدء"}
                    </p>
                  )}
                  {asking && (
                    <div className="flex justify-center pt-4">
                      <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="px-5 py-4 border-t border-neutral-800 flex gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                    placeholder="اكتب سؤالك للخبير..."
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-violet-500 transition-colors"
                  />
                  <button
                    onClick={ask}
                    disabled={asking || !question.trim()}
                    className="h-10 w-10 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center shrink-0 transition-all"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
