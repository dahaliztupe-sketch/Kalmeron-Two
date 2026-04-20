// @ts-nocheck
"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, CreditCard, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CREDIT_PACKS = [
  {
    id: "small",
    name: "الباقة الصغيرة",
    credits: 500,
    price: "$4.99",
    savings: null,
    popular: false,
  },
  {
    id: "medium",
    name: "الباقة المتوسطة",
    credits: 1200,
    price: "$9.99",
    savings: "خصم 17%",
    popular: true,
  },
  {
    id: "large",
    name: "الباقة الاحترافية",
    credits: 3000,
    price: "$19.99",
    savings: "خصم 33%",
    popular: false,
  }
];

export default function PurchasePage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setLoadingId(packId);
    try {
      // Simulate API call to Stripe
      toast.info("جاري تحويلك إلى بوابة الدفع الآمنة...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("حدثت مشكلة في المحاكاة (هذه واجهة تجريبية). في التطبيق الحقيقي، سيتم فتح Stripe Checkout.");
    } catch (err) {
      toast.error("فشل بدء عملية الشراء.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-12" dir="rtl">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">اشحن طاقتك الذكية</h1>
          <p className="text-neutral-400 text-lg">أرصدة إضافية تمنحك وصولاً أسرع لنتائج أعمق.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CREDIT_PACKS.map((pack) => (
            <motion.div
              key={pack.id}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <Card className={cn(
                "glass-panel border-white/10 h-full flex flex-col transition-all",
                pack.popular ? "border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)] scale-105 z-10" : ""
              )}>
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                    الأكثر طلباً
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <div className="bg-black/40 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Zap className={cn("h-6 w-6", pack.popular ? "text-[#D4AF37]" : "text-neutral-400")} />
                  </div>
                  <CardTitle className="text-2xl text-white">{pack.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold text-white mt-4">
                    {pack.price}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow space-y-6">
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-white">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{pack.credits} رصيد ذكي</span>
                     </div>
                     <div className="flex items-center gap-2 text-neutral-400">
                        <Check className="h-4 w-4 text-green-500 opacity-50" />
                        <span>أولوية في الاستخدام</span>
                     </div>
                     {pack.savings && (
                       <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10">
                         وفر {pack.savings}
                       </Badge>
                     )}
                  </div>
                </CardContent>

                <CardFooter className="pb-8">
                  <Button 
                    className={cn(
                      "w-full h-12 rounded-xl transition-all",
                      pack.popular 
                        ? "bg-[#D4AF37] hover:bg-[#C4A030] text-black font-bold" 
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    )}
                    disabled={loadingId === pack.id}
                    onClick={() => handlePurchase(pack.id)}
                  >
                    {loadingId === pack.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        شراء الآن
                        <CreditCard className="mr-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="glass-panel border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between bg-black/20">
            <div className="space-y-1">
                <h3 className="text-white font-bold text-lg">هل تحتاج إلى حلول مخصصة للشركات الكبيرة؟</h3>
                <p className="text-neutral-400">تحدث مع وكيل المبيعات لدينا للحصول على عرض مخصص يتناسب مع حجم أعمالك.</p>
            </div>
            <Button variant="ghost" className="text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-2 border-none">
                تواصل مع المبيعات
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            </Button>
        </div>
      </div>
    </AppShell>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
