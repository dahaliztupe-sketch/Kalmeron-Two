"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Loader2 } from "lucide-react";

interface Entry {
  id: string;
  workspaceId?: string | null;
  userId: string;
  action: string;
  target?: string | null;
  details?: Record<string, any>;
  timestamp?: number | null;
}

export default function AuditPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const r = await fetch("/api/admin/audit", { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (r.ok) setItems(j.items || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto" dir="rtl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-brand-blue" />
            سجل التدقيق (Audit Log)
          </h1>
          <p className="text-neutral-400 mt-2">
            كل إجراء حساس: من نفّذه، متى، وعلى ماذا. غير قابل للحذف.
          </p>
        </header>

        {!user ? (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardContent className="p-6 text-text-secondary">سجّل دخولك للعرض.</CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardContent className="p-6 text-text-secondary text-center">
              لا توجد سجلات بعد.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">آخر 200 إجراء</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-white/5 text-text-secondary">
                    <tr>
                      <th className="px-4 py-2">الوقت</th>
                      <th className="px-4 py-2">الإجراء</th>
                      <th className="px-4 py-2">المستخدم</th>
                      <th className="px-4 py-2">الهدف</th>
                      <th className="px-4 py-2">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((it) => (
                      <tr key={it.id} className="text-neutral-300">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {it.timestamp ? new Date(it.timestamp).toLocaleString("ar-EG") : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className="border-brand-blue/40 text-brand-blue">
                            {it.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 font-mono text-xs">{it.userId.slice(0, 12)}...</td>
                        <td className="px-4 py-2 font-mono text-xs">{it.target || "—"}</td>
                        <td className="px-4 py-2 text-xs text-neutral-400 max-w-md truncate">
                          {it.details && Object.keys(it.details).length > 0 ? JSON.stringify(it.details) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
