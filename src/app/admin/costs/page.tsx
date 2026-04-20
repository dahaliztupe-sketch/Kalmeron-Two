// @ts-nocheck
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CostsDashboard() {
  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">المراقبة المالية (AI Gateway)</h1>
      <p className="text-muted-foreground mb-8">تحليل استهلاك النماذج والوكلاء والتكلفة لكل مستخدم.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>الاستهلاك الإجمالي (الشهر الحالي)</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-primary">$124.50</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>أكثر الوكلاء استهلاكاً</CardTitle></CardHeader>
          <CardContent className="text-lg">idea-validator (45%)</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>عدد الطلبات</CardTitle></CardHeader>
          <CardContent className="text-lg">12,450 طلب</CardContent>
        </Card>
      </div>
      <div className="mt-8 bg-muted/40 rounded-xl border border-border flex items-center justify-center h-64 shadow-inner">
        <p className="text-muted-foreground">جاري جلب البيانات من Vercel Custom Reporting API...</p>
      </div>
    </div>
  );
}
