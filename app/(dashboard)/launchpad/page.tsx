"use client";
import { useState, useEffect } from "react";

const STAGES = [
  { id: "idea_validator", label: "تحقق الفكرة" },
  { id: "plan_builder", label: "خطة العمل" },
  { id: "cfo_agent", label: "النموذج المالي" },
  { id: "product_crew", label: "المنتج / MVP" },
  { id: "security_agent", label: "التدقيق الأمني" },
  { id: "marketing_crew", label: "التسويق" },
  { id: "investor_relations", label: "عرض المستثمرين" },
  { id: "orchestrator", label: "الحزمة النهائية" },
];

export default function LaunchpadPage() {
  const [idea, setIdea] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<any>(null);
  const [running, setRunning] = useState(false);

  async function launch() {
    if (!idea.trim()) return;
    setRunning(true);
    const r = await fetch("/api/launchpad", { method: "POST", body: JSON.stringify({ idea }) });
    const j = await r.json();
    setRunId(j.runId);
    setRun(j);
    setRunning(false);
  }

  useEffect(() => {
    if (!runId || run?.bundle) return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/launchpad?runId=${runId}`);
      const j = await r.json();
      if (j.run) setRun(j.run);
      if (j.run?.status === "completed") clearInterval(t);
    }, 2500);
    return () => clearInterval(t);
  }, [runId, run]);

  const lastPct = run?.lastProgress?.pct ?? (run?.bundle ? 100 : 0);
  const lastStage = run?.lastProgress?.stage;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">منصة الإطلاق</h1>
      <p className="text-sm text-gray-500 mb-6">حوّل فكرتك إلى حزمة إطلاق كاملة في 8 مراحل</p>

      <div className="border rounded-lg p-4 mb-6 bg-white dark:bg-gray-900">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="اكتب فكرة مشروعك هنا..."
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          disabled={running}
        />
        <button
          onClick={launch}
          disabled={running || !idea.trim()}
          className="mt-3 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {running ? "جارٍ الإطلاق..." : "إطلاق المشروع"}
        </button>
      </div>

      {runId && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">تقدم الإطلاق</div>
            <div className="text-xs text-gray-500">{runId}</div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded overflow-hidden mb-4">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${lastPct}%` }} />
          </div>
          <ul className="space-y-1">
            {STAGES.map((s) => {
              const done = STAGES.findIndex((x) => x.id === lastStage) >= STAGES.findIndex((x) => x.id === s.id);
              const active = s.id === lastStage;
              return (
                <li key={s.id} className={`text-sm flex items-center gap-2 ${done ? "text-green-700" : "text-gray-500"}`}>
                  <span>{active ? "⏳" : done ? "✅" : "⚪"}</span>
                  <span>{s.label}</span>
                </li>
              );
            })}
          </ul>
          {run?.bundle && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold">عرض الحزمة النهائية</summary>
              <pre className="text-xs mt-2 bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(run.bundle, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
