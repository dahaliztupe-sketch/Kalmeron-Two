"use client";
import { useEffect, useState } from "react";

export default function ExpertsPage() {
  const [experts, setExperts] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/experts");
    const j = await r.json();
    setExperts(j.experts || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!description.trim()) return;
    setCreating(true);
    await fetch("/api/experts", {
      method: "POST",
      body: JSON.stringify({ description, creatorId: "user" }),
    });
    setDescription("");
    await load();
    setCreating(false);
  }

  async function ask() {
    if (!active || !question.trim()) return;
    setAsking(true);
    setAnswer("");
    const r = await fetch("/api/experts", {
      method: "POST",
      body: JSON.stringify({ action: "invoke", expertId: active.id, message: question }),
    });
    const j = await r.json();
    setAnswer(j.output || j.error || "");
    setAsking(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">سوق الخبراء</h1>
      <p className="text-sm text-gray-500 mb-6">أنشئ خبراء متخصصين من وصف باللغة الطبيعية</p>

      <div className="border rounded-lg p-4 mb-6 bg-white dark:bg-gray-900">
        <div className="font-semibold mb-2">إنشاء خبير جديد</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="مثال: خبير تسويق رقمي متخصص في المتاجر الإلكترونية المصرية..."
          className="w-full border rounded px-3 py-2 min-h-[80px]"
        />
        <button
          onClick={create}
          disabled={creating || !description.trim()}
          className="mt-2 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {creating ? "جارٍ الإنشاء..." : "إنشاء الخبير"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-gray-500">جارٍ التحميل...</div>
        ) : experts.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-gray-500">لا يوجد خبراء بعد.</div>
        ) : (
          experts.map((e) => (
            <div key={e.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
              <div className="font-semibold">{e.name}</div>
              <div className="text-xs text-gray-500 mb-2">{e.domain}</div>
              <p className="text-sm mb-2 line-clamp-3">{e.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {(e.tools || []).map((t: string) => (
                  <span key={t} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <button onClick={() => setActive(e)} className="text-sm text-blue-600">استشر الخبير ←</button>
            </div>
          ))
        )}
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setActive(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-lg">{active.name}</h2>
            <p className="text-xs text-gray-500 mb-3">{active.domain}</p>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="اكتب سؤالك..."
              className="w-full border rounded px-3 py-2 mb-2"
            />
            <button onClick={ask} disabled={asking} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
              {asking ? "جارٍ..." : "اسأل"}
            </button>
            {answer && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm whitespace-pre-wrap">{answer}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
