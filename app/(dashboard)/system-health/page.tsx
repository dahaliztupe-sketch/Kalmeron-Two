"use client";
import { useEffect, useState } from "react";
import { PageShell, Card, Skeleton, ErrorBlock } from "@/components/ui/page-shell";

interface Health {
  status: "healthy" | "degraded";
  timestamp: string;
  version: string;
  checks: Record<string, string>;
  meta: Record<string, any>;
}

function dot(status: string) {
  const color =
    status === "connected" || status === "configured" || status === "protected"
      ? "bg-green-500"
      : status === "disabled" || status === "unconfigured"
      ? "bg-amber-500"
      : status === "unprotected"
      ? "bg-orange-500"
      : "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} aria-hidden />;
}

const GROUPS: Record<string, { label: string; keys: string[] }> = {
  infrastructure: { label: "البنية التحتية", keys: ["firestore", "knowledgeGraph", "firebaseAdmin", "cron"] },
  features: { label: "الميزات الأساسية", keys: ["learningLoop", "virtualMeeting", "launchpad", "expertFactory", "virtualOffice"] },
  omnichannel: { label: "القنوات", keys: ["whatsapp", "telegram", "email"] },
};

export default function StatusPage() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/health", { cache: "no-store" });
      const j = await r.json();
      setData(j);
    } catch (e: any) {
      setError(e?.message || "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);

  return (
    <PageShell
      title="حالة النظام"
      subtitle="مراقبة مباشرة لجميع الأنظمة الفرعية (كل 15 ثانية)"
      actions={
        <button
          onClick={load}
          className="px-3 py-1 text-sm rounded border"
          aria-label="تحديث"
        >
          تحديث
        </button>
      }
    >
      {loading && !data ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorBlock error={error} retry={load} />
      ) : data ? (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${data.status === "healthy" ? "bg-green-500" : "bg-amber-500"}`}
                aria-hidden
              />
              <div>
                <div className="font-semibold">
                  {data.status === "healthy" ? "النظام يعمل بكامل طاقته" : "النظام يعمل بشكل متدهور"}
                </div>
                <div className="text-xs text-gray-500">
                  إصدار {data.version} · {new Date(data.timestamp).toLocaleString("ar")}
                </div>
              </div>
            </div>
          </Card>

          {Object.entries(GROUPS).map(([key, group]) => (
            <Card key={key}>
              <div className="font-semibold mb-3">{group.label}</div>
              <ul className="space-y-2" role="list">
                {group.keys.map((k) => (
                  <li key={k} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {dot(data.checks[k] || "unreachable")}
                      <span>{k}</span>
                    </span>
                    <span className="text-xs text-gray-500">{data.checks[k] || "—"}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          {data.meta?.recentLaunchRuns?.length > 0 && (
            <Card>
              <div className="font-semibold mb-3">آخر عمليات الإطلاق</div>
              <ul className="space-y-1 text-sm" role="list">
                {data.meta.recentLaunchRuns.map((r: any) => (
                  <li key={r.id} className="flex justify-between">
                    <span className="font-mono text-xs">{r.id}</span>
                    <span className="text-xs text-gray-500">{r.status}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <LiveEventsFeed />
        </div>
      ) : null}
    </PageShell>
  );
}

function LiveEventsFeed() {
  const [events, setEvents] = useState<any[]>([]);
  const [err, setErr] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/admin/events", { cache: "no-store" });
      if (r.status === 403) { setErr("forbidden"); return; }
      const j = await r.json();
      setEvents(j.entries || []);
    } catch {}
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 10_000);
    return () => clearInterval(t);
  }, []);
  if (err === "forbidden") return null;
  return (
    <Card>
      <div className="font-semibold mb-3">أحدث تشغيلات الوكلاء (كل 10 ثوانٍ)</div>
      {events.length === 0 ? (
        <div className="text-xs text-gray-500">لا توجد أحداث بعد</div>
      ) : (
        <ul className="divide-y text-xs" role="list">
          {events.slice(0, 20).map((e: any) => (
            <li key={e.id} className="py-1.5 flex justify-between gap-2">
              <span className="font-mono truncate flex-1">{e.resource}</span>
              <span className="text-gray-500">{e.workspaceId?.slice(0, 8) || "—"}</span>
              <span className={e.success ? "text-green-600" : "text-red-600"}>
                {e.success ? "✓" : "✗"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
