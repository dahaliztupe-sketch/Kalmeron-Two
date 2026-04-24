"use client";
import { useEffect, useState } from "react";

const DEPARTMENTS = ["marketing", "product", "finance", "sales", "support", "hr", "legal", "monitoring"];

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<string[]>(["marketing", "product"]);
  const [running, setRunning] = useState(false);

  async function load() {
    const r = await fetch("/api/meetings");
    const j = await r.json();
    setMeetings(j.meetings || []);
    setOpportunities(j.opportunities || []);
  }
  useEffect(() => { load(); }, []);

  function toggle(d: string) {
    setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  }

  async function convene() {
    if (!topic.trim() || selected.length === 0) return;
    setRunning(true);
    await fetch("/api/meetings", {
      method: "POST",
      body: JSON.stringify({ topic, departmentIds: selected }),
    });
    setTopic("");
    await load();
    setRunning(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">الاجتماعات الافتراضية</h1>
      <p className="text-sm text-gray-500 mb-6">تنسيق جماعي بين مساعدين الأقسام</p>

      <div className="border rounded-lg p-4 mb-6 bg-white dark:bg-gray-900">
        <div className="font-semibold mb-2">عقد اجتماع جديد</div>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="موضوع الاجتماع"
          className="w-full border rounded px-3 py-2 mb-2"
        />
        <div className="flex flex-wrap gap-2 mb-3">
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              onClick={() => toggle(d)}
              className={`text-xs px-3 py-1 rounded-full border ${
                selected.includes(d) ? "bg-black text-white" : "bg-white text-gray-700"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={convene}
          disabled={running}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {running ? "جارٍ الاجتماع..." : "عقد الاجتماع"}
        </button>
      </div>

      {opportunities.length > 0 && (
        <div className="border rounded-lg p-4 mb-6 bg-amber-50 dark:bg-amber-900/20">
          <div className="font-semibold mb-2">فرص تعاون مكتشفة</div>
          <ul className="space-y-1 text-sm">
            {opportunities.map((o, i) => (
              <li key={i}>• {o.reason} ({(o.departments || []).join(", ")})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {meetings.map((m) => (
          <div key={m.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="font-semibold">{m.topic}</div>
            <div className="text-xs text-gray-500 mb-2">{(m.departmentIds || []).join(", ")}</div>
            <p className="text-sm mb-2">{m.synthesis}</p>
            {m.decisions?.length > 0 && (
              <ul className="text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
                {m.decisions.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {meetings.length === 0 && (
          <div className="p-8 text-center text-gray-500">لا توجد اجتماعات بعد.</div>
        )}
      </div>
    </div>
  );
}
