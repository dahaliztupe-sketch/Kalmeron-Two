"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, PlayCircle, ShieldAlert, Users, Calendar } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'awaiting_human';

interface Task {
  taskId: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  createdBy: string;
  dueDate: string;
}

const INITIAL_TASKS: Task[] = [
  { taskId: '1', name: 'إعداد نموذج التسعير الممتاز', description: 'يجب تحليل أسعار المنافسين في السوق وتحديد نموذج تسعير ليتوافق مع القدرة الشرائية المحلية.', status: 'pending', priority: 'high', assignee: 'المدير المالي', createdBy: 'النظام', dueDate: '2026-04-25' },
  { taskId: '2', name: 'صياغة اتفاقية الاستخدام', description: 'تشفير ومراجعة اتفاقية الاستخدام وشروط الخصوصية لتكون متوافقة مع القواعد التنظيمية وحماية البيانات.', status: 'in_progress', priority: 'critical', assignee: 'المرشد القانوني', createdBy: 'المستخدم', dueDate: '2026-04-22' },
  { taskId: '3', name: 'تحليل شخصيات العملاء', description: 'تم إنشاء 5 شخصيات افتراضية تعكس الفئة المستهدفة في مصر لمنتجات التقنية المالية.', status: 'completed', priority: 'medium', assignee: 'خبير التسويق', createdBy: 'النظام', dueDate: '2026-04-18' },
  { taskId: '4', name: 'الموافقة على ميزانية التسويق', description: 'يُقترح تخصيص ميزانية استثنائية للحملة القادمة. يتطلب ذلك تدخل المشرف البشري للموافقة.', status: 'awaiting_human', priority: 'high', assignee: 'المستخدم (أنت)', createdBy: 'المرشد العام', dueDate: '2026-04-21' },
];

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode; borderColor: string }[] = [
  { id: 'pending', title: 'قيد الانتظار', icon: <Clock className="w-4 h-4 text-slate-500" />, borderColor: 'border-slate-200 dark:border-slate-800' },
  { id: 'in_progress', title: 'قيد التنفيذ', icon: <PlayCircle className="w-4 h-4 text-blue-500" />, borderColor: 'border-blue-200 dark:border-blue-900' },
  { id: 'awaiting_human', title: 'بانتظار موافقة', icon: <ShieldAlert className="w-4 h-4 text-orange-500" />, borderColor: 'border-orange-200 dark:border-orange-900' },
  { id: 'completed', title: 'مكتملة', icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, borderColor: 'border-green-200 dark:border-green-900' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setTasks(INITIAL_TASKS);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, statusId: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, statusId);
      setDraggedTaskId(null);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center h-[80vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-muted/20" dir="rtl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة المهام وتنسيق الوكلاء</h1>
          <p className="text-muted-foreground">تابع سير العمل وتدخل في القرارات الإستراتيجية.</p>
        </div>
        <Button variant="outline" className="hidden md:flex">
          <Calendar className="mr-2 h-4 w-4" /> تصفية
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div 
            key={col.id} 
            className="flex-1 min-w-[300px] flex flex-col bg-muted/40 rounded-2xl p-4 border border-border"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="font-semibold text-lg">{col.title}</h3>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {tasks.filter(t => t.status === col.id).length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 flex-1 min-h-[150px]">
              {tasks.filter(t => t.status === col.id).map(task => (
                <Sheet key={task.taskId}>
                  <SheetTrigger asChild>
                    <Card 
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.taskId)}
                      className={`cursor-pointer hover:shadow-md hover:border-primary/50 transition-all border-r-4 ${col.borderColor}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'critical' ? 'حرج' : task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{task.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-[11px] text-muted-foreground">
                            <Users className="w-3 h-3 ml-1" /> {task.assignee}
                          </div>
                          <div className="text-[10px] text-muted-foreground border px-2 py-0.5 rounded-full bg-background/50">
                            {task.dueDate}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SheetTrigger>
                  
                  <SheetContent side="left" className="w-[400px] sm:w-[500px] overflow-y-auto" dir="rtl">
                    <SheetHeader className="mb-6 mt-4">
                      <SheetTitle className="text-2xl leading-normal">{task.name}</SheetTitle>
                      <SheetDescription className="text-base leading-relaxed mt-4">
                        {task.description}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-xl">
                          <span className="text-xs text-muted-foreground block mb-1">الوكيل المسؤول</span>
                          <span className="font-medium text-sm">{task.assignee}</span>
                        </div>
                        <div className="bg-muted p-3 rounded-xl">
                          <span className="text-xs text-muted-foreground block mb-1">الاستحقاق</span>
                          <span className="font-medium text-sm">{task.dueDate}</span>
                        </div>
                      </div>
                      <div className="border-t pt-6 space-y-3">
                        <h4 className="font-medium mb-3">الإجراءات المتاحة</h4>
                        {task.status === 'awaiting_human' && (
                          <div className="flex gap-3">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => updateTaskStatus(task.taskId, 'in_progress')}>
                              موافقة ومتابعة
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={() => updateTaskStatus(task.taskId, 'pending')}>
                              رفض الطلب
                            </Button>
                          </div>
                        )}
                        {task.status === 'pending' && (
                          <Button className="w-full" onClick={() => updateTaskStatus(task.taskId, 'in_progress')}>
                            البدء الآن
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button className="w-full" onClick={() => updateTaskStatus(task.taskId, 'completed')}>
                            تحديد كمكتمل
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-border/60 rounded-xl text-muted-foreground text-sm">
                  اسحب المهام إلى هنا
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
