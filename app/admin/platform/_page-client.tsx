"use client";
import { useEffect, useState } from "react";
import { PageShell, Card, Skeleton, ErrorBlock } from "@/components/ui/page-shell";
import { apiJson } from "@/src/lib/api-client";
import { AppShell } from "@/components/layout/AppShell";

interface AuditEntry {
  id: string;
  ts?: number;
  userId?: string;
  actorType?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  success?: boolean;
}
interface Data {
  stats: { workspaces: number; users: number; launchRuns: number };
  workspaces: { id: string; name: string; tier: string }[];
  recentAudit: AuditEntry[];
}

export default function PlatformAdminPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await apiJson<Data>("/api/admin/platform");
      setData(r);
      setErr("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <PageShell title="لوحة المنصة" subtitle="إحصائيات ومساحات العمل عبر المنصة">
        {loading ? <Skeleton className="h-64" />
          : err ? <ErrorBlock error={err} retry={load} />
          : data && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card><div className="text-xs text-gray-500">مساحات العمل</div><div className="text-2xl font-bold">{data.stats.workspaces}</div></Card>
              <Card><div className="text-xs text-gray-500">المستخدمون</div><div className="text-2xl font-bold">{data.stats.users}</div></Card>
              <Card><div className="text-xs text-gray-500">جلسات إطلاق</div><div className="text-2xl font-bold">{data.stats.launchRuns}</div></Card>
            </div>
            <Card>
              <h2 className="font-semibold mb-2">مساحات العمل</h2>
              <ul className="divide-y text-sm" role="list">
                {data.workspaces.map((w) => (
                  <li key={w.id} className="py-2 flex justify-between">
                    <span>{w.name}</span>
                    <span className="text-xs uppercase text-gray-500">{w.tier}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="font-semibold mb-2">أحدث سجل التدقيق</h2>
              <ul className="divide-y text-xs font-mono" role="list">
                {data.recentAudit.map((a) => (
                  <li key={a.id} className="py-1.5 flex gap-2">
                    <span className={`px-1.5 py-0.5 rounded ${a.success ? "bg-green-100 text-emerald-700" : "bg-red-100 text-rose-700"}`}>
                      {a.action}
                    </span>
                    <span className="flex-1 truncate">{a.resource}</span>
                    <span className="text-gray-400">{a.actorType}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </PageShell>
    </AppShell>
  );
}
