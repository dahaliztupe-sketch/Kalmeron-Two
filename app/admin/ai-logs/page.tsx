/**
 * AI Logs Dashboard — reads real `cost_events` from Firestore via the
 * admin SDK. Falls back to a clear empty-state when no events exist yet.
 */
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { queryRecentCostEvents } from "@/src/lib/observability/cost-ledger";
import { Activity, DollarSign, Cpu, AlertTriangle } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 30;

function fmtUsd(n: number) {
  if (n === 0) return "$0.0000";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function modelBadgeColor(model: string) {
  if (model.includes("pro")) return "bg-violet-900/30 text-violet-300 border-violet-800/50";
  if (model.includes("flash")) return "bg-blue-900/30 text-blue-400 border-blue-800/50";
  return "bg-neutral-800/50 text-neutral-400 border-neutral-700/50";
}

export default async function AiLogsDashboard() {
  const logs = await queryRecentCostEvents(50).catch(() => []);

  const totalTokens = logs.reduce(
    (s, l) => s + l.promptTokens + l.completionTokens, 0,
  );
  const totalCost = logs.reduce((s, l) => s + l.costUsd, 0);
  const uniqueAgents = new Set(logs.map((l) => l.agent)).size;

  return (
    <AppShell>
      <div className="p-8 space-y-6" dir="rtl">
        <div className="flex items-center gap-3 mb-2">
          <Cpu className="w-7 h-7 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">سجلات الذكاء الاصطناعي</h1>
        </div>
        <p className="text-neutral-400 text-sm -mt-2">
          آخر 50 حدث استهلاك مُسجَّل في Firestore — يتحدّث كل 30 ثانية.
        </p>

        {logs.length === 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200 text-sm">
            لا توجد سجلات بعد. ستظهر هنا تلقائياً عند بدء استدعاء النماذج من خلال
            <code className="bg-black/30 px-1 rounded mx-1">recordCost()</code>.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-neutral-900 border-neutral-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-neutral-400 font-normal">
                <Cpu className="w-4 h-4 text-indigo-400" /> إجمالي التوكنز
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-mono text-indigo-300">
              {totalTokens.toLocaleString("ar-EG")}
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-neutral-400 font-normal">
                <DollarSign className="w-4 h-4 text-rose-400" /> التكلفة التقديرية
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-mono text-rose-400">
              {fmtUsd(totalCost)}
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-neutral-400 font-normal">
                <Activity className="w-4 h-4 text-emerald-400" /> عدد المساعدين النشطين
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-mono text-emerald-400">
              {uniqueAgents}
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              تفاصيل أحداث الاستهلاك
              <span className="text-xs text-neutral-500 font-normal mr-2">
                ({logs.length} حدث)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                    <TableHead className="text-right text-neutral-400">الوقت</TableHead>
                    <TableHead className="text-right text-neutral-400">المساعد</TableHead>
                    <TableHead className="text-right text-neutral-400">النموذج</TableHead>
                    <TableHead className="text-right text-neutral-400">توكنز الإدخال</TableHead>
                    <TableHead className="text-right text-neutral-400">توكنز الإخراج</TableHead>
                    <TableHead className="text-right text-neutral-400">التكلفة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-neutral-500 py-12">
                        لا توجد أحداث مسجّلة بعد
                      </TableCell>
                    </TableRow>
                  )}
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-neutral-800 hover:bg-neutral-800/50">
                      <TableCell className="text-neutral-500 text-xs whitespace-nowrap">
                        {fmtDate(log.occurredAt)}
                      </TableCell>
                      <TableCell className="text-neutral-200 font-medium text-sm">
                        {log.agent}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full border text-xs ${modelBadgeColor(log.model)}`}>
                          {log.model}
                        </span>
                      </TableCell>
                      <TableCell className="text-neutral-300 font-mono text-sm">
                        {log.promptTokens.toLocaleString("ar-EG")}
                      </TableCell>
                      <TableCell className="text-neutral-300 font-mono text-sm">
                        {log.completionTokens.toLocaleString("ar-EG")}
                      </TableCell>
                      <TableCell className="text-rose-400 font-mono text-sm">
                        {fmtUsd(log.costUsd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
