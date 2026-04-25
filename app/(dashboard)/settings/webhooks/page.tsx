"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageShell, Card, Skeleton, EmptyState, ErrorBlock } from "@/components/ui/page-shell";
import { apiJson } from "@/src/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EVENTS = ["launch.completed", "meeting.completed", "expert.created", "agent.run.completed"];

interface Sub {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: number | null;
}

export default function WebhooksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [storedWorkspace] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("active_workspace") || "";
  });
  const workspaceId = storedWorkspace || user?.uid || "";

  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const subsQueryKey = ["webhooks", workspaceId] as const;
  const {
    data: subs = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Sub[], Error>({
    queryKey: subsQueryKey,
    enabled: !!workspaceId,
    queryFn: async () => {
      const res = await apiJson<{ subscriptions: Sub[] }>(
        `/api/account/webhooks?workspaceId=${encodeURIComponent(workspaceId)}`
      );
      return res.subscriptions || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiJson<{ subscription: { secret: string } }>(
        "/api/account/webhooks",
        {
          method: "POST",
          body: JSON.stringify({ workspaceId, url, events: selected }),
        }
      );
    },
    onSuccess: (res) => {
      setNewSecret(res.subscription.secret);
      setUrl("");
      setSelected([]);
      toast.success("تم الاشتراك");
      queryClient.invalidateQueries({ queryKey: subsQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiJson(`/api/account/webhooks/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onCreate = () => {
    if (!url.trim() || selected.length === 0) return;
    createMutation.mutate();
  };

  const onRevoke = (id: string) => {
    if (!confirm("إيقاف هذا الاشتراك؟")) return;
    revokeMutation.mutate(id);
  };

  return (
    <PageShell title="الـ Webhooks" subtitle="تلقى أحداث النظام مباشرة على خادمك">
      {newSecret && (
        <Card className="mb-4 border-green-400 bg-green-50 dark:bg-green-950/20">
          <div className="font-semibold mb-1">السر الموقِّع (احفظه الآن):</div>
          <code className="block p-2 bg-white dark:bg-gray-900 rounded font-mono text-xs break-all">{newSecret}</code>
          <div className="text-xs mt-2 text-gray-600">
            استخدمه للتحقق من الترويسة <code className="bg-gray-200 dark:bg-gray-800 px-1">x-kalmeron-signature</code>
          </div>
          <button onClick={() => setNewSecret(null)} className="mt-2 text-xs">إخفاء</button>
        </Card>
      )}
      <Card className="mb-4">
        <h2 className="font-semibold mb-3">اشتراك جديد</h2>
        <div className="grid gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            className="w-full px-3 py-2 border rounded"
            dir="ltr"
          />
          <div className="flex flex-wrap gap-2">
            {EVENTS.map((e) => (
              <label key={e} className="inline-flex items-center gap-1 text-xs border rounded px-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(e)}
                  onChange={(ev) =>
                    setSelected((prev) => (ev.target.checked ? [...prev, e] : prev.filter((x) => x !== e)))
                  }
                />
                {e}
              </label>
            ))}
          </div>
          <button
            onClick={onCreate}
            disabled={createMutation.isPending || !url.trim() || selected.length === 0}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 self-start"
          >
            {createMutation.isPending ? "جارٍ الإنشاء..." : "إنشاء اشتراك"}
          </button>
        </div>
      </Card>
      <Card>
        <h2 className="font-semibold mb-3">الاشتراكات الحالية</h2>
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : error ? (
          <ErrorBlock error={error.message} retry={() => refetch()} />
        ) : subs.length === 0 ? (
          <EmptyState title="لا توجد اشتراكات" icon="📡" />
        ) : (
          <ul className="divide-y" role="list">
            {subs.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs truncate" dir="ltr">{s.url}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.events.join(" · ")}</div>
                  <div className="text-xs text-gray-400">{s.active ? "نشط" : "موقوف"}</div>
                </div>
                {s.active && (
                  <button
                    onClick={() => onRevoke(s.id)}
                    disabled={revokeMutation.isPending}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    إيقاف
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
