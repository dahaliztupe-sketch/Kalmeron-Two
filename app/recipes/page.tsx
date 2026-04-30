import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الوصفات الجاهزة",
  description: "وصفات عمل جاهزة وقابلة للتخصيص",
};

// @ts-nocheck
"use client";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ChefHat, Sparkles, ArrowLeft, ShieldCheck, Zap, Clock3 } from "lucide-react";
import Link from "next/link";

interface RecipeStep {
  id: string;
  title: string;
  actionId: string;
  actionLabel?: string;
  defaults?: Record<string, unknown>;
  requiredInputs?: string[];
  rationale: string;
  requiresApproval?: boolean;
}
interface Recipe {
  id: string;
  title: string;
  emoji: string;
  category: string;
  description: string;
  estimatedDurationMin: number;
  involves: string[];
  steps: RecipeStep[];
}
interface RunInstance {
  id: string;
  recipeId: string;
  title: string;
  status: string;
  totalSteps: number;
  pendingApprovals: number;
  completedSteps: number;
  createdAt?: number | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  launch: "إطلاق",
  fundraising: "تمويل",
  sales: "مبيعات",
  hiring: "توظيف",
  monthly_ops: "تشغيل شهري",
  crisis: "أزمة",
  marketing: "تسويق",
};

export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [runs, setRuns] = useState<RunInstance[]>([]);
  const [active, setActive] = useState<Recipe | null>(null);
  const [stepInputs, setStepInputs] = useState<Record<string, Record<string, string>>>({});
  const [rationale, setRationale] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  useEffect(() => {
    fetch("/api/recipes/list").then((r) => r.json()).then((j) => setRecipes(j.recipes || []));
  }, []);

  useEffect(() => {
    if (!user) return;
    user
      .getIdToken()
      .then((token) =>
        fetch("/api/recipes/instances", { headers: { Authorization: `Bearer ${token}` } }),
      )
      .then((r) => r.json())
      .then((j) => setRuns(j.runs || []))
      .catch(() => {});
  }, [user, result]);

  const grouped = useMemo(() => {
    const g: Record<string, Recipe[]> = {};
    for (const r of recipes) {
      (g[r.category] = g[r.category] || []).push(r);
    }
    return g;
  }, [recipes]);

  function setInput(stepId: string, field: string, value: string) {
    setStepInputs((s) => ({ ...s, [stepId]: { ...(s[stepId] || {}), [field]: value } }));
  }

  async function runIt() {
    if (!user || !active) return;
    setRunning(true);
    setResult(null);
    try {
      const token = await user.getIdToken();
      const steps = active.steps.map((st) => {
        const raw = stepInputs[st.id] || {};
        const input: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(raw)) {
          if (typeof v === "string" && v.trim().match(/^-?\d+(\.\d+)?$/)) input[k] = Number(v);
          else if (typeof v === "string" && v.trim().startsWith("[")) {
            try { input[k] = JSON.parse(v); } catch { input[k] = v; }
          }
          else input[k] = v;
        }
        return { stepId: st.id, input };
      });
      const r = await fetch("/api/recipes/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipeId: active.id, steps, rationale }),
      });
      const j = await r.json();
      setResult(j);
    } catch (e) {
      setResult({ ok: false, error: (e as Error).message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <AppShell>
      <div className="p-6 md:p-8 max-w-6xl mx-auto" dir="rtl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-brand-cyan" />
            وصفات الأعمال
          </h1>
          <Link href="/operations" className="text-sm text-brand-cyan hover:underline">
            ← غرفة العمليات
          </Link>
        </div>
        <p className="text-text-secondary text-sm mb-6">
          ضغطة واحدة لتشغيل سلسلة إجراءات متناسقة عبر عدّة أقسام. كل خطوة تكلّف فلوس أو تُلزم
          الشركة تذهب لصندوق موافقتك أوّلاً.
        </p>

        {!active && (
          <>
            {runs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Clock3 className="w-4 h-4" />
                  وصفات شغّالة الآن
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {runs.slice(0, 4).map((r) => (
                    <Card key={r.id} className="bg-dark-surface/50 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white font-medium">{r.title}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {r.status === "awaiting_approvals" ? "بانتظار موافقتك" : r.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-neutral-400 mt-2 flex gap-3">
                          <span>{r.completedSteps}/{r.totalSteps} خطوة منفّذة</span>
                          {r.pendingApprovals > 0 && (
                            <span className="text-amber-300">
                              {r.pendingApprovals} بانتظار موافقة
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-8">
                <h2 className="text-white font-semibold mb-3">{CATEGORY_LABELS[cat] || cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((r) => (
                    <Card
                      key={r.id}
                      className="bg-dark-surface/60 border-white/10 hover:border-brand-cyan/50 transition-colors cursor-pointer"
                      onClick={() => { setActive(r); setStepInputs({}); setResult(null); setRationale(""); }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{r.emoji}</span>
                          <p className="text-white font-medium">{r.title}</p>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed mb-3">
                          {r.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {r.involves.map((d) => (
                            <Badge
                              key={d}
                              variant="outline"
                              className="text-[10px] bg-white/5 border-white/10 text-neutral-300"
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />{r.steps.length} خطوات
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="w-3 h-3" />~{r.estimatedDurationMin} دقيقة
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {active && (
          <>
            <button
              onClick={() => setActive(null)}
              className="text-sm text-brand-cyan hover:underline mb-3 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> العودة لكل الوصفات
            </button>
            <Card className="bg-dark-surface/60 border-white/10 mb-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-2xl">{active.emoji}</span>
                  {active.title}
                </CardTitle>
                <p className="text-sm text-text-secondary">{active.description}</p>
              </CardHeader>
              <CardContent>
                <Label className="text-neutral-200 text-sm mb-2 block">
                  لماذا تشغّل هذه الوصفة الآن؟ (سيُسجَّل مع كل خطوة)
                </Label>
                <Textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="مثلاً: سنطلق المنتج الجديد الأسبوع القادم ونحتاج تنسيق التسويق + الدعم + المستثمرين."
                  className="bg-black/30 border-white/10 text-white text-sm min-h-[70px]"
                />
              </CardContent>
            </Card>

            {active.steps.map((s, idx) => (
              <Card key={s.id} className="bg-dark-surface/40 border-white/10 mb-3">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white font-medium">
                      {idx + 1}. {s.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        s.requiresApproval
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px]"
                      }
                    >
                      {s.requiresApproval ? (
                        <><ShieldCheck className="w-3 h-3 mr-1 inline" /> يتطلّب موافقتك</>
                      ) : (
                        <>تنفيذ مباشر</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">{s.rationale}</p>
                  {(s.requiredInputs || []).length > 0 && (
                    <div className="space-y-2">
                      {(s.requiredInputs || []).map((field) => (
                        <div key={field}>
                          <Label className="text-xs text-neutral-300">{field}</Label>
                          <Input
                            className="bg-black/30 border-white/10 text-white text-sm"
                            value={(stepInputs[s.id] || {})[field] || ""}
                            onChange={(e) => setInput(s.id, field, e.target.value)}
                            placeholder={`قيمة ${field}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center gap-3 mt-5 mb-2">
              <Button
                onClick={runIt}
                disabled={running || rationale.trim().length < 10}
                className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {running ? "جارٍ تشغيل الوصفة..." : "شغّل الوصفة الآن"}
              </Button>
              <span className="text-[11px] text-neutral-400">
                الموافقات ستظهر في صندوق موافقتك وغرفة العمليات.
              </span>
            </div>

            {result && (
              <Card className="bg-emerald-500/10 border-emerald-500/30 mt-4">
                <CardContent className="p-4">
                  <p className="text-emerald-200 font-medium mb-2">تم تشغيل الوصفة ✓</p>
                  <pre className="text-[11px] text-emerald-100/80 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
