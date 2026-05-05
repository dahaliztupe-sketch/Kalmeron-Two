"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox as InboxIcon, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  actionId: string;
  label: string;
  input: Record<string, unknown>;
  rationale?: string | null;
  requestedBy?: string;
  status: string;
  result?: unknown;
  error?: string | null;
  createdAt?: number | null;
  decidedAt?: number | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار الموافقة",
  approved: "تمت الموافقة",
  rejected: "مرفوض",
  executed: "تم التنفيذ",
  executed_noop: "تم التسجيل (بدون اتصال خارجي)",
  failed: "فشل",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  executed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  executed_noop: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  failed: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function InboxPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    let mounted = true;
    async function refresh() {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const url = filter === "all" ? "/api/actions/inbox" : `/api/actions/inbox?status=${filter}`;
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        const j = await r.json();
        if (mounted && r.ok) setItems(j.items || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void refresh();
    return () => { mounted = false; };
  }, [user, filter]);

  const decide = async (it: Item, decision: "approve" | "reject") => {
    if (!user) return;
    setBusyId(it.id);
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/actions/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ actionDocId: it.id, decision }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "فشلت العملية");
      toast.success(decision === "approve" ? "تمت الموافقة والتنفيذ." : "تم الرفض.");
      await refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشلت العملية");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto" dir="rtl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><InboxIcon className="w-8 h-8 text-brand-cyan" /> صندوق موافقات المساعدين</h1>
            <p className="text-neutral-400 mt-2">طلبات الإجراءات من مساعدين كلميرون — راجِع، عدّل، ووافق قبل أي تأثير خارجي.</p>
          </div>
        </header>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "executed", "rejected", "all"] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "secondary"} onClick={() => setFilter(s)}>
              {s === "pending" && "قيد الانتظار"}{s === "executed" && "منفّذة"}{s === "rejected" && "مرفوضة"}{s === "all" && "الكل"}
            </Button>
          ))}
        </div>

        {!user ? <Card className="bg-dark-surface/60 border-white/10"><CardContent className="p-6 text-text-secondary">سجّل دخولك لعرض الصندوق.</CardContent></Card> : loading ? (
          <div className="flex items-center gap-2 text-text-secondary"><Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...</div>
        ) : items.length === 0 ? (
          <Card className="bg-dark-surface/60 border-white/10"><CardContent className="p-6 text-text-secondary text-center">لا توجد طلبات حالياً ضمن هذا التصنيف.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <Card key={it.id} className="bg-dark-surface/60 border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-white text-base">{it.label}</CardTitle>
                    <Badge variant="outline" className={STATUS_COLOR[it.status] || ""}>{STATUS_LABEL[it.status] || it.status}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary flex items-center gap-1.5"><Clock className="w-3 h-3" />{it.createdAt ? new Date(it.createdAt).toLocaleString("ar-EG") : "—"}<span className="mx-1">·</span><span>طلبه: {it.requestedBy === "user" ? "أنت" : "مساعد"}</span></p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {it.rationale && <p className="text-sm text-neutral-300 italic">«{it.rationale}»</p>}
                  <pre className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs text-neutral-300 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(it.input, null, 2)}</pre>
                  {it.error && <p className="text-xs text-rose-400">خطأ: {it.error}</p>}
                  {it.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => decide(it, "approve")} disabled={busyId === it.id} className="bg-emerald-600 hover:bg-emerald-700">{busyId === it.id ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <CheckCircle2 className="w-4 h-4 ml-1" />}موافقة وتنفيذ</Button>
                      <Button size="sm" variant="secondary" onClick={() => decide(it, "reject")} disabled={busyId === it.id}><XCircle className="w-4 h-4 ml-1" /> رفض</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
