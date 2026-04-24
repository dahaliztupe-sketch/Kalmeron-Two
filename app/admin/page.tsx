"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, AlertTriangle, DollarSign, ShieldCheck, Loader2, Trash2, Bot } from "lucide-react";
import Link from "next/link";
import { DriftWidget } from "@/components/admin/DriftWidget";
import { CostByModelWidget } from "@/components/admin/CostByModelWidget";
import { TtfvWidget } from "@/components/admin/TtfvWidget";

interface Snapshot {
  agents: Record<string, { invocations: number; failures: number; avgLatencyMs: number; successRate: number; totalCostUsd: number }>;
  dailyCostUsd: number;
  dailyLimit: number;
  alertsRecent: Array<{ severity: string; source: string; message: string; timestamp: string }>;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  industry: string | null;
  createdAt: string | null;
}

export default function AdminCommandCenter() {
  const { user } = useAuth();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [snapErr, setSnapErr] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersErr, setUsersErr] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Live snapshot polling
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/mission-control', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (alive) { setSnap(j); setSnapErr(null); }
      } catch (e: any) { if (alive) setSnapErr(e.message); }
    };
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Users (admin only)
  useEffect(() => {
    if (!user) return;
    let cancel = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Failed');
        if (!cancel) { setUsers(j.users || []); setUsersErr(null); }
      } catch (e: any) {
        if (!cancel) setUsersErr(e.message);
      } finally {
        if (!cancel) setLoadingUsers(false);
      }
    })();
    return () => { cancel = true; };
  }, [user]);

  const handleDelete = async (uid: string) => {
    if (!user) return;
    if (!confirm('حذف هذا المستخدم نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || 'فشل الحذف');
      }
      setUsers(u => u.filter(x => x.id !== uid));
      toast.success('تم حذف المستخدم.');
    } catch (e: any) {
      toast.error(e.message || 'فشل الحذف');
    }
  };

  const agentEntries = useMemo(() => snap ? Object.entries(snap.agents) : [], [snap]);
  const totalInvocations = useMemo(() => agentEntries.reduce((s, [, m]) => s + m.invocations, 0), [agentEntries]);
  const costPct = snap ? Math.min(100, (snap.dailyCostUsd / Math.max(1, snap.dailyLimit)) * 100) : 0;

  return (
    <AppShell>
      <div dir="rtl" className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="font-display text-4xl font-extrabold text-white mb-2">مركز القيادة والسيطرة</h1>
          <p className="text-text-secondary">إدارة الأسطول والتكاليف والامتثال في الوقت الفعلي.</p>
        </header>

        {snapErr && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            تعذر جلب البيانات الحية: {snapErr}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="w-5 h-5 text-brand-blue" />}
            label="استدعاءات اليوم"
            value={String(totalInvocations)}
          />
          <StatCard
            icon={<Bot className="w-5 h-5 text-brand-cyan" />}
            label="مساعدين نشطون"
            value={String(agentEntries.length)}
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
            label="تكلفة اليوم"
            value={snap ? `$${snap.dailyCostUsd.toFixed(2)}` : '—'}
            sub={snap ? `من $${snap.dailyLimit}` : undefined}
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
            label="تنبيهات"
            value={snap ? String(snap.alertsRecent.length) : '—'}
          />
        </div>

        {/* Cost Bar */}
        {snap && (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-white text-base">المراقبة المالية</CardTitle>
              <span className={`text-sm font-bold ${costPct > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {costPct.toFixed(0)}%
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full transition-all ${costPct > 80 ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-cyan to-brand-blue'}`}
                  style={{ width: `${costPct}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-2">
                تنبيه عند 80%، إيقاف تلقائي عند تجاوز السقف اليومي.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Drift + Cost-by-Model + TTFV widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DriftWidget windowDays={7} />
          <CostByModelWidget />
          <TtfvWidget />
        </div>

        {/* Fleet Control */}
        <Card className="bg-dark-surface/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-cyan" /> التحكم في الأسطول
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {agentEntries.length === 0 ? (
              <p className="text-text-secondary text-sm">لا توجد بيانات تشغيل بعد. ابدأ محادثة لتفعيل المساعدين.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06]">
                    <TableHead className="text-text-secondary">المساعد</TableHead>
                    <TableHead className="text-text-secondary">الاستدعاءات</TableHead>
                    <TableHead className="text-text-secondary">زمن المعالجة</TableHead>
                    <TableHead className="text-text-secondary">نسبة النجاح</TableHead>
                    <TableHead className="text-text-secondary">التكلفة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentEntries.map(([id, m]) => (
                    <TableRow key={id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="font-mono text-xs text-white">{id}</TableCell>
                      <TableCell className="text-text-secondary">{m.invocations}</TableCell>
                      <TableCell className="text-text-secondary">{m.avgLatencyMs}ms</TableCell>
                      <TableCell className={m.successRate < 95 ? 'text-amber-400' : 'text-emerald-400'}>{m.successRate}%</TableCell>
                      <TableCell className="text-text-secondary">${m.totalCostUsd.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Audit & Alerts */}
        <Card className="bg-dark-surface/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue" /> التدقيق والحوكمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snap?.alertsRecent.length === 0 ? (
              <p className="text-text-secondary text-sm">لا توجد تنبيهات نشطة. كل الأنظمة سليمة.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {snap?.alertsRecent.map((a, i) => (
                  <li key={i} className={`p-3 rounded-lg text-sm border ${
                    a.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                    a.severity === 'high'     ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                                                'bg-white/[0.03] border-white/[0.06] text-text-secondary'
                  }`}>
                    <div className="flex justify-between text-xs">
                      <span className="font-mono">{a.source}</span>
                      <span className="opacity-60">{new Date(a.timestamp).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <div className="mt-1">{a.message}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Users (Right to be Forgotten) */}
        <Card className="bg-dark-surface/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base">المستخدمون (حق النسيان)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...
              </div>
            ) : usersErr ? (
              <p className="text-rose-300 text-sm">
                {usersErr.includes('Forbidden')
                  ? 'هذه اللوحة متاحة للمشرفين فقط. أضف بريدك إلى ADMIN_EMAILS.'
                  : `تعذر جلب المستخدمين: ${usersErr}`}
              </p>
            ) : users.length === 0 ? (
              <p className="text-text-secondary text-sm">لا يوجد مستخدمون مسجلون بعد.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06]">
                    <TableHead className="text-text-secondary">الاسم</TableHead>
                    <TableHead className="text-text-secondary">البريد</TableHead>
                    <TableHead className="text-text-secondary">القطاع</TableHead>
                    <TableHead className="text-text-secondary">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id} className="border-white/[0.04]">
                      <TableCell className="text-white">{u.name || '—'}</TableCell>
                      <TableCell className="text-text-secondary">{u.email || '—'}</TableCell>
                      <TableCell className="text-text-secondary">{u.industry || '—'}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-text-secondary">
          <Link href="/admin/mission-control" className="hover:text-white">مركز القيادة المباشر</Link>
          <span className="mx-2">•</span>
          <Link href="/admin/costs" className="hover:text-white">تفاصيل التكاليف</Link>
          <span className="mx-2">•</span>
          <Link href="/admin/ai-logs" className="hover:text-white">سجلات الذكاء الاصطناعي</Link>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-text-secondary uppercase tracking-wider">{label}</span></div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
      {sub && <div className="text-xs text-text-secondary mt-1">{sub}</div>}
    </div>
  );
}
