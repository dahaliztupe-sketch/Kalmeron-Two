"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateNDA } from '@/src/lib/legal-templates';

export default function LegalTemplatesPage() {
  const [template, setTemplate] = useState<string>('');
  
  const handleGenerate = () => {
    setTemplate(generateNDA('طرف أول', 'طرف ثاني', 'تطوير مشروع', 'سنة'));
  };

  return (
    <div className="p-8 space-y-8 relative overflow-hidden" dir="rtl">
      {/* Background flare */}
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[rgb(var(--tech-blue))] opacity-10 blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl font-black text-white">مكتبة النماذج القانونية</h1>
        <p className="text-lg text-neutral-400 mt-2">إنشاء عقود واتفاقيات معتمدة بأقل جهد</p>
      </div>

      <div className="bento-grid">
        <Card className="glass-panel text-white bento-wide">
          <CardHeader><CardTitle className="text-2xl">اتفاقية عدم إفصاح (NDA)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-neutral-400 mb-6">لحماية أفكارك ومعلوماتك السرية عند مشاركتها مع المستثمرين أو الشركاء.</p>
            <Button onClick={handleGenerate} className="bg-gradient-to-tr from-[#D4AF37] to-[#0A66C2] text-white border-none rounded-xl hover:opacity-90">
               توليد النموذج الآن
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {template && (
        <div className="p-6 glass-panel rounded-2xl text-neutral-200 whitespace-pre-wrap leading-relaxed border border-[#0A66C2]/30 mt-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-4 text-[#D4AF37] border-b border-white/10 pb-4">
             <span className="font-bold">معاينة المستند</span>
          </div>
          {template}
        </div>
      )}
    </div>
  );
}
