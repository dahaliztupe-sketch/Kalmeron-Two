import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ObservabilityDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">مركز المراقبة المتقدمة</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>الوكلاء النشطون</CardTitle></CardHeader>
          <CardContent>12</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>الاستدعاءات (24س)</CardTitle></CardHeader>
          <CardContent>4,500</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>متوسط زمن الاستجابة</CardTitle></CardHeader>
          <CardContent>1.2s</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>التكلفة اليومية</CardTitle></CardHeader>
          <CardContent>$42.50</CardContent>
        </Card>
      </div>
    </div>
  );
}
