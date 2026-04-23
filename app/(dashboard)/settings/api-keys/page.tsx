"use client";
import { useEffect, useState } from "react";
import { PageShell, Card, Skeleton, EmptyState, ErrorBlock } from "@/components/ui/page-shell";
import { apiJson } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SCOPES = [
  "agent:run",
  "launchpad:run",
  "meeting:convene",
  "expert:create",
  "skills:read",
  "skills:write",
];

interface Key {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: number | null;
  lastUsedAt: number | null;
  revoked: boolean;
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState("");
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["agent:run"]);
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    const wid = localStorage.getItem("active_workspace") || user?.uid || "";
    setWorkspaceId(wid);
  }, [user]);

  async function load() {
    if (!workspaceId) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiJson<{ keys: Key[] }>(`/api/account/api-keys?workspaceId=${encodeURIComponent(workspaceId)}`);
      setKeys(res.keys || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId) load();
  }, [workspaceId]);

  async function create() {
    if (!name.trim() || selectedScopes.length === 0) return;
    setCreating(true);
    try {
      const res = await apiJson<{ key: { raw: string; prefix: string } }>("/api/account/api-keys", {
        method: "POST",
        body: JSON.stringify({ workspaceId, name, scopes: selectedScopes }),
      });
      setNewKey(res.key.raw);
      setName("");
      load();
      toast.success("تم إنشاء المفتاح");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("هل أنت متأكد من إبطال هذا المفتاح؟")) return;
    try {
      await apiJson(`/api/account/api-keys/${id}`, { method: "DELETE" });
      toast.success("تم الإبطال");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <PageShell title="مفاتيح API" subtitle="إنشاء وإدارة مفاتيح الوصول البرمجية">
      {newKey && (
        <Card className="mb-4 border-green-400 bg-green-50 dark:bg-green-950/20">
          <div className="font-semibold mb-1">انسخ المفتاح الآن — لن يظهر مرة أخرى!</div>
          <code className="block p-2 bg-white dark:bg-gray-900 rounded font-mono text-xs break-all">{newKey}</code>
          <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-gray-600 hover:underline">إخفاء</button>
        </Card>
      )}
      <Card className="mb-4">
        <h2 className="font-semibold mb-3">مفتاح جديد</h2>
        <div className="grid gap-3">
          <label className="block">
            <span className="text-sm">الاسم</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سكريبت التشغيل التلقائي"
              className="w-full mt-1 px-3 py-2 border rounded"
            />
          </label>
          <div>
            <span className="text-sm">الصلاحيات</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {SCOPES.map((s) => (
                <label key={s} className="inline-flex items-center gap-1 text-xs border rounded px-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(s)}
                    onChange={(e) =>
                      setSelectedScopes((prev) =>
                        e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                      )
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={create}
            disabled={creating || !name.trim()}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 self-start"
          >
            {creating ? "جارٍ الإنشاء..." : "إنشاء مفتاح"}
          </button>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold mb-3">المفاتيح الحالية</h2>
        {loading ? (
          <Skeleton className="h-24" />
        ) : error ? (
          <ErrorBlock error={error} retry={load} />
        ) : keys.length === 0 ? (
          <EmptyState title="لا توجد مفاتيح بعد" icon="🔑" />
        ) : (
          <ul className="divide-y" role="list">
            {keys.map((k) => (
              <li key={k.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{k.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{k.prefix}…</div>
                  <div className="text-xs text-gray-400">
                    {k.revoked ? "مبطَل" : k.lastUsedAt ? `آخر استخدام: ${new Date(k.lastUsedAt).toLocaleDateString("ar")}` : "لم يُستخدم بعد"}
                  </div>
                </div>
                {!k.revoked && (
                  <button onClick={() => revoke(k.id)} className="text-xs text-red-600 hover:underline">
                    إبطال
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
