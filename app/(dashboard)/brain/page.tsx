"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { auth } from "@/src/lib/firebase";
import { Brain, RefreshCw, Plus, AlertTriangle, Network, Sparkles } from "lucide-react";

interface KGNode { id: string; type: string; properties: Record<string, unknown> }
interface KGEdge { from: string; to: string; type: string }
interface BrainState {
  enabled: boolean;
  nodes: KGNode[];
  edges: KGEdge[];
}

const TYPE_COLORS: Record<string, string> = {
  Insight: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Lead: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Customer: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Competitor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  Risk: "bg-red-500/15 text-red-300 border-red-500/30",
  Finding: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

function chip(type: string) {
  return TYPE_COLORS[type] || "bg-white/5 text-text-secondary border-white/10";
}

export default function BrainPage() {
  const [state, setState] = useState<BrainState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [type, setType] = useState("Insight");
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const res = await fetch("/api/team-os", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      setState(json.knowledgeGraph);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "تعذّر التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, []);

  async function addFinding() {
    if (!content.trim()) return;
    setAdding(true);
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      await fetch("/api/team-os", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action: "recordFinding",
          payload: { type, content, source: "brain-page" },
        }),
      });
      setContent("");
      await load();
    } finally {
      setAdding(false);
    }
  }

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto font-arabic">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">الدماغ المشترك</h1>
              <p className="text-sm text-text-secondary">كل ما يعرفه فريقك من المساعدين عن مشروعك</p>
            </div>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {/* Status */}
        {state && !state.enabled && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-100/90">
              <div className="font-bold mb-1">الدماغ غير متّصل</div>
              <div>تأكد من صحة قيم <code className="bg-black/30 px-1 rounded">NEO4J_URI</code> و <code className="bg-black/30 px-1 rounded">NEO4J_USERNAME</code> و <code className="bg-black/30 px-1 rounded">NEO4J_PASSWORD</code> في الأسرار. يعمل النظام بأمان حتى يتم إصلاح الاتصال.</div>
            </div>
          </div>
        )}

        {state?.enabled && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-100/90">
              الدماغ متّصل — {state.nodes.length} عقدة و {state.edges.length} علاقة
            </span>
          </div>
        )}

        {/* Add finding */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
            <Plus className="w-4 h-4 text-violet-300" />
            أضف ملاحظة جديدة
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white"
            >
              {["Insight","Lead","Customer","Competitor","Risk","Finding"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ماذا تعلّمت اليوم؟ (مثال: العميل س مهتم بخدمة الاشتراك السنوي)"
              className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white placeholder:text-text-secondary/60"
            />
            <button
              onClick={addFinding}
              disabled={adding || !content.trim() || !state?.enabled}
              className="px-4 py-2 rounded-xl bg-brand-cyan/90 hover:bg-brand-cyan text-black font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {adding ? "..." : "حفظ"}
            </button>
          </div>
        </div>

        {/* Stats by type */}
        {state && state.nodes.length > 0 && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(
              state.nodes.reduce<Record<string, number>>((acc, n) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
              }, {})
            ).map(([t, c]) => (
              <div key={t} className={`rounded-xl border p-3 ${chip(t)}`}>
                <div className="text-xs opacity-80">{t}</div>
                <div className="text-2xl font-bold">{c}</div>
              </div>
            ))}
          </div>
        )}

        {/* Nodes list */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
            <Network className="w-4 h-4 text-violet-300" />
            العقد ({state?.nodes.length || 0})
          </div>
          {loading ? (
            <div className="text-center py-8 text-text-secondary text-sm">جاري التحميل...</div>
          ) : !state?.nodes.length ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              لا توجد معرفة محفوظة بعد. أضف أول ملاحظة من الأعلى، أو دع المساعدين يعملون وسيُغذّون الدماغ تلقائياً.
            </div>
          ) : (
            <ul className="space-y-2 max-h-[600px] overflow-y-auto">
              {state.nodes.map((n) => (
                <li key={n.id} className="rounded-xl border border-white/5 bg-black/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${chip(n.type)}`}>{n.type}</span>
                    <span className="text-[10px] text-text-secondary/60 font-mono truncate">{n.id}</span>
                  </div>
                  <div className="text-sm text-white whitespace-pre-wrap">
                    {String(n.properties?.content || n.properties?.summary || n.properties?.name || "—")}
                  </div>
                  {Boolean(n.properties?.source || n.properties?.department) && (
                    <div className="mt-1 flex gap-2 text-[11px] text-text-secondary">
                      {n.properties?.department != null && <span>القسم: {String(n.properties.department)}</span>}
                      {n.properties?.source != null && <span>المصدر: {String(n.properties.source)}</span>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}
      </div>
    </AppShell>
  );
}
