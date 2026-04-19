"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';

const financialProjections = [
  { month: 'يناير', revenue: 15000, expenses: 12000, cashflow: 3000 },
  { month: 'فبراير', revenue: 18000, expenses: 13000, cashflow: 5000 },
  { month: 'مارس', revenue: 22000, expenses: 14000, cashflow: 8000 },
  { month: 'أبريل', revenue: 20000, expenses: 14500, cashflow: 5500 },
  { month: 'مايو', revenue: 26000, expenses: 15000, cashflow: 11000 },
  { month: 'يونيو', revenue: 32000, expenses: 16000, cashflow: 16000 }
];

export default function CFODashboard() {
  return (
    <div className="p-8 space-y-8 relative overflow-hidden" dir="rtl">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[rgb(var(--gold))] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl font-black text-white">المدير المالي الذكي <span dir="ltr" className="brand-gradient-text">(CFO)</span></h1>
        <p className="text-lg text-neutral-400 mt-2">لوحة تحكم النماذج المالية والسيولة</p>
      </div>

      <div className="bento-grid">
        <Card className="glass-panel text-white bento-wide flex flex-col justify-center">
          <CardHeader className="pb-2"><CardTitle className="text-xl text-neutral-400">إجمالي الإيرادات المتوقعة</CardTitle></CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-green-500">133,000 ج.م</div>
            <p className="text-md text-green-400 mt-2">↑ 15% نمو عن النموذج الأساسي</p>
          </CardContent>
        </Card>
        <Card className="glass-panel text-white flex flex-col justify-center">
          <CardHeader className="pb-2"><CardTitle className="text-xl text-neutral-400">إجمالي المصروفات</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-400">84,500 ج.م</div>
            <p className="text-sm text-neutral-500 mt-2">ضمن الميزانية المحددة</p>
          </CardContent>
        </Card>
        <Card className="glass-panel text-white flex flex-col justify-center">
          <CardHeader className="pb-2"><CardTitle className="text-xl text-neutral-400">صافي التدفق النقدي</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#D4AF37]">48,500 ج.م</div>
            <p className="text-sm text-[#D4AF37] mt-2">مسار إيجابي للسيولة</p>
          </CardContent>
        </Card>
      </div>

      <div className="bento-grid">
        <Card className="glass-panel text-white bento-wide">
          <CardHeader>
            <CardTitle className="text-2xl">التنبؤ بالتدفق النقدي <span dir="ltr">(Cash Flow)</span></CardTitle>
            <CardDescription className="text-neutral-400 text-lg">السيولة المتاحة خلال الستة أشهر القادمة</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialProjections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }} />
                <Area type="monotone" dataKey="cashflow" name="التدفق النقدي" stroke="#D4AF37" fillOpacity={1} fill="url(#colorCashflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-panel text-white bento-wide">
          <CardHeader>
            <CardTitle>الإيرادات مقابل المصروفات</CardTitle>
            <CardDescription className="text-neutral-400">تحليل مقارن لهيكل التكاليف والنمو</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financialProjections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }} />
                <Bar dataKey="revenue" name="الإيرادات" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line type="monotone" dataKey="expenses" name="المصروفات" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
