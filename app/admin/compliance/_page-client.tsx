"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ComplianceDashboard() {
  return (
    <AppShell>
    <div className="p-8 space-y-8 relative overflow-hidden" dir="rtl">
      {/* Background flare */}
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[rgb(var(--tech-blue))] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
         <h1 className="text-4xl font-black text-white">لوحة تحكم الامتثال <span dir="ltr" className="brand-gradient-text">(Compliance)</span></h1>
         <p className="text-lg text-neutral-400 mt-2">مراقبة التوافق القانوني واللائحة العامة لحماية البيانات</p>
      </div>

      <div className="bento-grid">
        <Card className="glass-panel text-white bento-wide flex flex-col justify-center">
             <CardHeader><CardTitle className="text-xl text-neutral-400">الامتثال لقانون 151</CardTitle></CardHeader>
             <CardContent className="text-5xl font-black text-emerald-500">85%</CardContent>
        </Card>
        <Card className="glass-panel text-white bento-wide flex flex-col justify-center">
             <CardHeader><CardTitle className="text-xl text-neutral-400">حالة GDPR</CardTitle></CardHeader>
             <CardContent className="text-5xl font-black text-[#D4AF37]">ممتثل</CardContent>
        </Card>
      </div>

      <Card className="glass-panel text-white mt-8">
        <CardHeader><CardTitle className="text-2xl">طلبات &quot;الحق في النسيان&quot;</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow className="border-neutral-800">
                        <TableHead className="text-right">معرف المستخدم</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="border-neutral-800">
                        <TableCell>user_123</TableCell>
                        <TableCell>معلق</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
    </AppShell>
  );
}
