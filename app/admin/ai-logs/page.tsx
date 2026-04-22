"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AiLogsDashboard() {
  // Mock data representing logs fetched from BigQuery or Firestore
  const logs = [
    { id: '1', task: 'بناء خطة استراتيجية', model: 'gemini-2.5-pro', tokens: 4250, cost: '$0.008' },
    { id: '2', task: 'تحليل أفكار (مزاد الوكلاء)', model: 'gemini-2.5-flash', tokens: 1800, cost: '$0.001' },
    { id: '3', task: 'نصائح حماية من الأخطاء', model: 'gemini-2.5-flash', tokens: 900, cost: '$0.0004' },
    { id: '4', task: 'صياغة العرض التقديمي للمستثمرين', model: 'gemini-2.5-pro', tokens: 6100, cost: '$0.012' },
  ];

  return (
    <AppShell>
    <div className="p-8 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-white">سجلات الذكاء الاصطناعي (AI Costs & Logs)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 text-white"><CardHeader><CardTitle>الاستهلاك الكلي (توكنز)</CardTitle></CardHeader><CardContent className="text-2xl font-mono text-[rgb(var(--gold))]">13,050</CardContent></Card>
        <Card className="bg-neutral-900 border-neutral-800 text-white"><CardHeader><CardTitle>التكلفة التقديرية</CardTitle></CardHeader><CardContent className="text-2xl font-mono text-red-400">$0.0214</CardContent></Card>
      </div>
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader><CardTitle className="text-white">تفاصيل العمليات المستهلكة</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                <TableHead className="text-right text-neutral-400">المهمة</TableHead>
                <TableHead className="text-right text-neutral-400">النموذج النهائي</TableHead>
                <TableHead className="text-right text-neutral-400">التوكنز</TableHead>
                <TableHead className="text-right text-neutral-400">التكلفة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id} className="border-neutral-800 hover:bg-neutral-800/50">
                  <TableCell className="text-neutral-300 font-medium">{log.task}</TableCell>
                  <TableCell className="text-neutral-300">
                    <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-800/50 text-xs">
                      {log.model}
                    </span>
                  </TableCell>
                  <TableCell className="text-neutral-300 font-mono">{log.tokens}</TableCell>
                  <TableCell className="text-neutral-300 font-mono">{log.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </AppShell>
  );
}
