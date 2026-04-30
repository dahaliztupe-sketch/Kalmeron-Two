"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// بيانات وهمية للعرض المشابه لنتائج المحاكاة
const interestData = [
  { name: 'مهتم جداً', value: 45, color: '#10B981' }, // emerald-500
  { name: 'مهتم', value: 30, color: '#3B82F6' },     // blue-500
  { name: 'محايد', value: 15, color: '#F59E0B' },    // amber-500
  { name: 'غير مهتم', value: 10, color: '#EF4444' }, // red-500
];

const objectionsData = [
  { name: 'السعر مرتفع', count: 12 },
  { name: 'عدم الثقة بالجودة', count: 8 },
  { name: 'صعوبة الاستخدام', count: 5 },
  { name: 'بدائل متوفرة', count: 3 }
];

export default function MarketLabResults() {
  return (
    <div className="p-8 space-y-8 relative overflow-hidden" dir="rtl">
      {/* Background flare */}
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[rgb(var(--tech-blue))] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl font-black text-white">نتائج محاكاة السوق <span dir="ltr" className="brand-gradient-text">(Market Lab)</span></h1>
        <p className="text-lg text-neutral-400 mt-2">تحليل ردود الشخصيات الافتراضية حول فكرة المنتج</p>
      </div>

      <div className="bento-grid">
        <Card className="glass-panel text-white flex flex-col justify-center items-center py-6 bento-wide">
          <CardHeader className="text-center pb-2"><CardTitle className="text-xl text-neutral-400">درجة ملاءمة السوق (Market Fit)</CardTitle></CardHeader>
          <CardContent className="text-7xl font-black text-[#D4AF37]">
            78<span className="text-2xl text-neutral-500">/100</span>
          </CardContent>
          <p className="text-md text-green-400 mt-2 font-medium">فرصة واعدة مع بعض التعديلات المطلوبة</p>
        </Card>

        <Card className="glass-panel text-white bento-wide">
          <CardHeader>
            <CardTitle className="text-2xl">مستوى الاهتمام</CardTitle>
            <CardDescription className="text-neutral-400 text-lg">كيف تفاعلت الشخصيات مع الفكرة</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={interestData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {interestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center flex-wrap gap-4 mt-2 text-sm">
              {interestData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                  <span className="text-neutral-300">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel text-white">
        <CardHeader>
          <CardTitle className="text-2xl">أبرز الاعتراضات والمخاوف</CardTitle>
          <CardDescription className="text-neutral-400 text-lg">النقاط التي أثارت قلق الشخصيات الافتراضية</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={objectionsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#888" tick={{ fill: '#888' }} />
              <YAxis dataKey="name" type="category" width={120} stroke="#ccc" tick={{ fill: '#ccc' }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="count" name="تكرار الاعتراض" fill="#0A66C2" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
