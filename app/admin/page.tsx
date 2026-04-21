"use client";
import { useState } from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [users, setUsers] = useState([
    { id: '1', name: 'أحمد علي', email: 'ahmed@example.com' },
    { id: '2', name: 'سارة خالد', email: 'sara@example.com' }
  ]);

  const handleDeleteUser = async (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success("تم حذف بيانات المستخدم نهائياً.");
  };

  return (
    <AppShell>
    <div className="p-8 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>عدد المستخدمين</CardTitle></CardHeader><CardContent>{users.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>الجلسات النشطة</CardTitle></CardHeader><CardContent>45</CardContent></Card>
        <Card><CardHeader><CardTitle>تكلفة اليوم</CardTitle></CardHeader><CardContent>$12.50</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>إدارة المستخدمين (حق النسيان)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      حذف نهائي
                    </Button>
                  </TableCell>
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
