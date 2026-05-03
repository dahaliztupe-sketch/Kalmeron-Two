"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, DollarSign, ShieldCheck,
  Loader2, Trash2, Bot, Users, Search, RefreshCw,
  TrendingUp, CheckCircle2, XCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
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
  plan?: string | null;
  createdAt: string | null;
}

function StatCard({ icon, label, value, sub, trend }: { icon: React.ReactNode; label: string; value: string; sub?: string; trend?: "up" | "down" | "neutral" }) {
  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/[0.02] blur-xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs text-text-secondary uppercase tracking-wider">{label}</span></div>
        <div className="text-2xl font-extrabold text-white mb-0.5">{value}</div>
        {sub && <div className="text-xs text-text-secondary">{sub}</div>}
        {trend === "up" && <div className="absolute top-0 left-0 text-[10px] text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> صاعد</div>}
      </div>
    </div>
  );
}

export default function AdminCommandCenter() {
  const { user } = useAuth();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [snapErr, setSnapErr] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersErr, setUsersErr] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadSnap = async () => {
    try {
      const r = await fetch('/api/admin/mission-control', { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setSnap(j); setSnapErr(null);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setSnapErr(e instanceof Error ? e.message : String(e));
    }
  };

  // Live snapshot polling
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/mission-control', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (alive) { setSnap(j); setSnapErr(null); setLastRefresh(new Date()); }
      } catch (e: unknown) {
        if (alive) setSnapErr(e instanceof Error ? e.message : String(e));
      }
    };
    load();
    const id = setInterval(load, 10000);
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
      } catch (e: unknown) {
        if (!cancel) setUsersErr(e instanceof Error ? e.message : String(e));
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'فشل الحذف');
    }
  };

  const agentEntries = useMemo(() => snap ? Object.entries(snap.agents) : [], [snap]);
  const totalInvocations = useMemo(() => agentEntries.reduce((s, [, m]) => s + m.invocations, 0), [agentEntries]);
  const totalFailures = useMemo(() => agentEntries.reduce((s, [, m]) => s + m.failures, 0), [agentEntries]);
  const costPct = snap ? Math.min(100, (snap.dailyCostUsd / Math.max(1, snap.dailyLimit)) * 100) : 0;

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.industry || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Live Admin</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">مركز القيادة</h1>
            <p className="text-text-secondary text-sm">
              آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG')}
            </p>
          </div>
          <button
            onClick={loadSnap}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-300 text-sm hover:border-white/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </motion.header>

        {snapErr && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            تعذر جلب البيانات الحية: {snapErr}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="w-5 h-5 text-brand-blue" />}
            label="استدعاءات اليوم"
            value={String(totalInvocations)}
            trend="up"
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
            sub={snap ? `من $${snap.dailyLimit} (${costPct.toFixed(0)}%)` : undefined}
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-violet-400" />}
            label="المستخدمون"
            value={String(users.length)}
            sub={`${totalFailures} فشل`}
          />
        </div>

        {/* Cost Progress Bar */}
        {snap && (
          <Card className="bg-dark-surface/60 border-white/10">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> المراقبة المالية اليومية
              </CardTitle>
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${costPct > 80 ? 'text-rose-300 bg-rose-500/10 border-rose-500/30' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'}`}>
                {costPct.toFixed(0)}%
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${costPct}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${costPct > 80 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-brand-cyan to-brand-blue'}`}
                />
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>${snap.dailyCostUsd.toFixed(3)} مُستخدم</span>
                <span>الحد: ${snap.dailyLimit}</span>
              </div>
              <p className="text-xs text-text-secondary mt-2 opacity-60">
                تنبيه تلقائي عند 80%، إيقاف عند 100%.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analysis Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DriftWidget windowDays={7} />
          <CostByModelWidget />
          <TtfvWidget />
        </div>

        {/* Fleet Table */}
        <Card className="bg-dark-surface/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-cyan" /> أسطول المساعدين الذكيين
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {agentEntries.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-neutral-500">
                <Bot className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">لا توجد بيانات تشغيل بعد. ابدأ محادثة لتفعيل المساعدين.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06]">
                    <TableHead className="text-text-secondary">المساعد</TableHead>
                    <TableHead className="text-text-secondary text-center">الاستدعاءات</TableHead>
                    <TableHead className="text-text-secondary text-center">زمن الاستجابة</TableHead>
                    <TableHead className="text-text-secondary text-center">نسبة النجاح</TableHead>
                    <TableHead className="text-text-secondary text-center">التكلفة</TableHead>
                    <TableHead className="text-text-secondary text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentEntries.map(([id, m]) => (
                    <TableRow key={id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="font-mono text-xs text-white">{id}</TableCell>
                      <TableCell className="text-text-secondary text-center">{m.invocations.toLocaleString('ar')}</TableCell>
                      <TableCell className="text-text-secondary text-center">{m.avgLatencyMs}ms</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.successRate >= 95 ? 'text-emerald-400 bg-emerald-500/10' : m.successRate >= 80 ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                          {m.successRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-text-secondary text-center text-xs">${m.totalCostUsd.toFixed(4)}</TableCell>
                      <TableCell className="text-center">
                        {m.successRate >= 95
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                          : <XCircle className="w-4 h-4 text-rose-400 mx-auto" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="bg-dark-surface/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-blue" /> التدقيق والتنبيهات
              {snap && snap.alertsRecent.length > 0 && (
                <span className="mr-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {snap.alertsRecent.length} تنبيه
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!snap || snap.alertsRecent.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> لا توجد تنبيهات نشطة — كل الأنظمة سليمة.
              </div>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {snap.alertsRecent.map((a, i) => (
                  <li key={i} className={`p-3 rounded-lg text-sm border ${
                    a.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                    a.severity === 'high'     ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                                                'bg-white/[0.03] border-white/[0.06] text-text-secondary'
                  }`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono font-bold">{a.source}</span>
                      <span className="opacity-60">{new Date(a.timestamp).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <div>{a.message}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Users with search */}
        <Card className="bg-dark-surface/60 border-white/10">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" /> إدارة المستخدمين
              <span className="text-text-secondary text-xs font-normal">({filteredUsers.length} مستخدم)</span>
            </CardTitle>
            <div className="relative w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <Input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="بحث..."
                className="bg-black/30 border-white/10 text-white text-xs h-8 pr-8"
              />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...
              </div>
            ) : usersErr ? (
              <div className="flex items-center gap-2 py-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <p className="text-amber-300 text-sm">
                  {usersErr.includes('Forbidden')
                    ? 'هذه اللوحة متاحة للمشرفين فقط.'
                    : `تعذر جلب المستخدمين: ${usersErr}`}
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{userSearch ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون بعد."}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06]">
                    <TableHead className="text-text-secondary">الاسم</TableHead>
                    <TableHead className="text-text-secondary">البريد</TableHead>
                    <TableHead className="text-text-secondary">القطاع</TableHead>
                    <TableHead className="text-text-secondary">الخطة</TableHead>
                    <TableHead className="text-text-secondary">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-text-secondary">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell className="text-white font-semibold">{u.name || '—'}</TableCell>
                      <TableCell className="text-text-secondary text-xs">{u.email || '—'}</TableCell>
                      <TableCell className="text-text-secondary text-xs">{u.industry || '—'}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.plan === 'founder' ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' :
                          u.plan === 'pro' ? 'text-violet-300 bg-violet-500/10 border-violet-500/30' :
                          u.plan === 'starter' ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' :
                          'text-neutral-400 bg-neutral-500/10 border-neutral-500/30'
                        }`}>
                          {u.plan || 'free'}
                        </span>
                      </TableCell>
                      <TableCell className="text-text-secondary text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : '—'}
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}
                          className="h-7 text-xs">
                          <Trash2 className="w-3 h-3 ml-1" /> حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-text-secondary pb-4">
          <Link href="/admin/mission-control" className="hover:text-white transition-colors">مركز القيادة المباشر</Link>
          <span className="mx-2">·</span>
          <Link href="/admin/costs" className="hover:text-white transition-colors">تفاصيل التكاليف</Link>
          <span className="mx-2">·</span>
          <Link href="/admin/ai-logs" className="hover:text-white transition-colors">سجلات الذكاء الاصطناعي</Link>
          <span className="mx-2">·</span>
          <Link href="/admin/funnel" className="hover:text-white transition-colors">مسار التحويل</Link>
        </div>
      </div>
    </AppShell>
  );
}
