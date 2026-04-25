"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLocale } from "@/src/lib/i18n/use-app-locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, CheckCircle2, ChevronRight } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { motion } from "motion/react";

export default function IdeaValidationPage() {
  const { user, dbUser } = useAuth();
  const { locale: language } = useAppLocale();
  const dir = language === "ar" ? "rtl" : "ltr";
  
  const [ideaDesc, setIdeaDesc] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!ideaDesc.trim() || !user || !dbUser) return;
    setIsValidating(true);

    try {
      const res = await fetch('/api/ideas/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaDesc,
          industry: dbUser.industry,
          startup_stage: dbUser.startup_stage,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      const resultText: string = data.result || "";
      setValidationResult(resultText);

      // Save to Firestore following the rules exactly
      const ideasRef = collection(db, "users", user.uid, "ideas");
      await addDoc(ideasRef, {
        userId: user.uid,
        title: ideaDesc.slice(0, 50) + "...",
        description: ideaDesc,
        swot_analysis: resultText,
        created_at: serverTimestamp()
      });

      toast.success('تم تحليل فكرتك بنجاح! اطلع على التقرير أدناه.');
    } catch (error) {
      console.error(error);
      toast.error("عذراً، واجهنا صعوبة في معالجة البيانات حالياً. عُد للوحة التحكم وحاول مجدداً.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 p-4 text-white" dir={dir}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black tracking-tight mb-3 flex items-center gap-3 text-[rgb(var(--brand-cyan))]">
            <Lightbulb className="h-10 w-10 text-[rgb(var(--brand-cyan))]" />
            تحليل الفكرة: ابدأ على أرض صلبة
          </h1>
          <p className="text-neutral-400 text-xl leading-relaxed max-w-3xl font-medium">
              صف رؤيتك بدقة؛ فكلما كانت المعطيات واضحة، استطاع كالميرون استشراف مستقبل الفكرة وملائمتها للسوق المصري بوضوح أكبر.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass border-neutral-700/50 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-[#16161D]/80 border-b border-neutral-800 p-8">
                <CardTitle className="text-2xl text-white">رؤية رائد الأعمال</CardTitle>
                <CardDescription className="text-neutral-400 text-lg mt-2">
                اشرح فكرتك في بضعة أسطر. نحن نضمن لك سرية البيانات باستخدام تشفير متقدم.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col p-8">
                <div className="space-y-3">
                <Label className="text-neutral-300 text-md font-semibold">ما هو المنتج أو الخدمة التي ستقدمها؟</Label>
                <Textarea 
                    value={ideaDesc}
                    onChange={(e) => setIdeaDesc(e.target.value)}
                    placeholder="مثال: تطبيق يسهل توصيل الفواكه والمخضروات الطازجة من المزارعين للمطاعم مباشرة..."
                    className="min-h-[160px] resize-none text-lg p-5 rounded-2xl bg-neutral-900/50 text-white border-neutral-700 focus-visible:ring-[rgb(var(--brand-cyan))]"
                />
                </div>
                <Button 
                onClick={handleValidate} 
                disabled={!ideaDesc.trim() || isValidating}
                className="w-full h-14 text-lg rounded-xl bg-[rgb(var(--brand-cyan))] text-black hover:bg-[#d9a31a] font-bold shadow-lg transition-transform md:w-1/3 self-end"
                >
                {isValidating ? (
                    <><Loader2 className="h-6 w-6 mr-3 animate-spin" /> جاري البحث والتحليل...</>
                ) : (
                    <><CheckCircle2 className="h-6 w-6 mr-3" /> بدء التحليل الاستراتيجي</>
                )}
                </Button>
            </CardContent>
            </Card>
        </motion.div>

        {validationResult && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="glass border-[rgba(244,180,26,0.3)] shadow-[0_0_30px_rgba(244,180,26,0.1)] rounded-3xl overflow-hidden mt-8">
                <CardHeader className="bg-[rgb(var(--brand-cyan))]/10 border-b border-[rgba(244,180,26,0.2)] p-8">
                <CardTitle className="flex items-center gap-3 text-2xl text-[rgb(var(--brand-cyan))]">
                    <ChevronRight className="h-6 w-6 icon-flip" />
                    التحليل الاستراتيجي وخارطة الطريق
                </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                <div className="markdown-body text-lg leading-relaxed prose prose-invert prose-neutral max-w-none prose-headings:text-[rgb(var(--brand-cyan))] prose-a:text-blue-400" dir="auto">
                    <ReactMarkdown>{validationResult}</ReactMarkdown>
                </div>
                </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
