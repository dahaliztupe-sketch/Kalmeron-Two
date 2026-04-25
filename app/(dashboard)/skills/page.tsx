"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Skill {
  id: string;
  name: string;
  description: string;
  agentType: string;
  successRate: number;
  timesUsed: number;
  successes: number;
  failures: number;
  generation: number;
  source: string;
  enabled: boolean;
}

const WORKSPACE_ID = "default";

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const skillsKey = ["skills", WORKSPACE_ID] as const;

  const { data: skills = [], isLoading: loading } = useQuery<Skill[]>({
    queryKey: skillsKey,
    queryFn: async () => {
      const r = await fetch(`/api/skills?workspaceId=${WORKSPACE_ID}`);
      const j = await r.json();
      return j.skills || [];
    },
  });

  const consolidateMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/skills`, {
        method: "POST",
        body: JSON.stringify({ workspaceId: WORKSPACE_ID }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: skillsKey }),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">المهارات المكتسبة</h1>
          <p className="text-sm text-gray-500">شجرة تطور المساعدين عبر دورة التعلم الذاتي</p>
        </div>
        <button
          onClick={() => consolidateMutation.mutate()}
          disabled={consolidateMutation.isPending}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {consolidateMutation.isPending ? "جارٍ الدمج..." : "دمج المهارات المتشابهة"}
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">جارٍ التحميل...</div>
      ) : skills.length === 0 ? (
        <div className="p-8 text-center text-gray-500">لا توجد مهارات مكتسبة بعد.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-gray-500">
                    {s.agentType} · الجيل {s.generation} · {s.source}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${s.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {s.enabled ? "مفعّلة" : "موقوفة"}
                </span>
              </div>
              <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">{s.description}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
                  <div className="font-bold">{(s.successRate * 100).toFixed(0)}%</div>
                  <div className="text-gray-500">نجاح</div>
                </div>
                <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
                  <div className="font-bold">{s.timesUsed}</div>
                  <div className="text-gray-500">استخدامات</div>
                </div>
                <div className="rounded bg-gray-50 dark:bg-gray-800 p-2">
                  <div className="font-bold">{s.successes}/{s.failures}</div>
                  <div className="text-gray-500">ن/ف</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
