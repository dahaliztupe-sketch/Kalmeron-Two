"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const dailyPerformanceData = [
  { date: 'الأحد', averageScore: 82 },
  { date: 'الإثنين', averageScore: 84 },
  { date: 'الثلاثاء', averageScore: 85 },
  { date: 'الأربعاء', averageScore: 84 },
  { date: 'الخميس', averageScore: 87 },
  { date: 'الجمعة', averageScore: 89 },
  { date: 'السبت', averageScore: 88 }
];

const agentsScoresData = [
  { name: 'محلل الأفكار', score: 92 },
  { name: 'باني الخطط', score: 88 },
  { name: 'المدير المالي', score: 90 },
  { name: 'المرشد القانوني', score: 85 },
  { name: 'مولد الشخصيات', score: 95 },
  { name: 'محاكي المقابلات', score: 82 }
];

export default function AgentsHealthDashboard() {
  return (
    <AppShell>
    <div className="p-8 space-y-8 relative overflow-hidden" dir="rtl">
      {/* Background flare */}
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[rgb(var(--tech-blue))] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl font-black text-white">لوحة تحكم صحة المساعدين <span dir="ltr" className="brand-gradient-text">(Meta-AI)</span></h1>
        <p className="text-lg text-neutral-400 mt-2">مراقبة الانجراف الذكي وتقييمات المساعدين</p>
      </div>
      
      <div className="bento-grid">
        <Card className="glass-panel text-white flex flex-col justify-center">
          <CardHeader><CardTitle className="text-xl text-neutral-400">المساعدين النشطون</CardTitle></CardHeader>
          <CardContent className="text-5xl font-black text-[#D4AF37]">8</CardContent>
        </Card>
        <Card className="glass-panel text-white flex flex-col justify-center">
          <CardHeader><CardTitle className="text-xl text-neutral-400">متوسط التقييم العام</CardTitle></CardHeader>
          <CardContent className="text-4xl font-bold text-green-500">88/100</CardContent>
        </Card>
        <Card className="glass-panel text-white flex flex-col justify-center">
          <CardHeader><CardTitle className="text-xl text-neutral-400">التنبيهات النشطة</CardTitle></CardHeader>
          <CardContent className="text-4xl font-bold text-red-500">2</CardContent>
        </Card>
      </div>

      <div className="bento-grid">
        <Card className="glass-panel text-white bento-wide">
          <CardHeader>
            <CardTitle className="text-2xl">الأداء العام (آخر 7 أيام)</CardTitle>
            <CardDescription className="text-neutral-400 text-lg">متوسط التقييم العام لجميع المساعدين يومياً</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis domain={[60, 100]} stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <Line type="monotone" dataKey="averageScore" name="متوسط التقييم" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel text-white bento-wide">
          <CardHeader>
            <CardTitle className="text-2xl">أداء المساعدين الفردي</CardTitle>
            <CardDescription className="text-neutral-400 text-lg">تقييم كل مساعد بناءً على آخر 100 مهمة</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentsScoresData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#888" tick={{ fill: '#888' }} />
                <YAxis dataKey="name" type="category" width={100} stroke="#ccc" tick={{ fill: '#ccc' }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <Bar dataKey="score" name="التقييم" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppShell>
  );
}
