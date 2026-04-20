import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TasksPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">مدير المهام</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['قيد الانتظار', 'قيد التنفيذ', 'مكتملة', 'بانتظارك'].map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle>{status}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Kanban items */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
