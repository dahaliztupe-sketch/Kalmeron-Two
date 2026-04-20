"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, Calendar, CreditCard, ArrowUpRight, History } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface WalletData {
  dailyBalance: number;
  dailyLimit: number;
  monthlyBalance: number;
  monthlyLimit: number;
  rolledOverCredits: number;
  monthlyResetAt: any;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  agentName?: string;
  timestamp: any;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const walletRef = doc(db, "user_credits", user.uid);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          setWallet(walletSnap.data() as WalletData);
        }

        const txRef = collection(db, "credit_transactions");
        const q = query(
          txRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const txSnap = await getDocs(q);
        setTransactions(txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      </AppShell>
    );
  }

  const dailyProgress = wallet ? (wallet.dailyBalance / wallet.dailyLimit) * 100 : 0;
  const monthlyProgress = wallet ? (wallet.monthlyBalance / wallet.monthlyLimit) * 100 : 0;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">إدارة الرصيد والاشتراك</h1>
            <p className="text-neutral-400">تابع استهلاكك وقم بترقية خطتك للحصول على المزيد من القوة الذكية.</p>
          </div>
          <Link href="/billing/purchase">
            <Button className="bg-[#D4AF37] hover:bg-[#C4A030] text-black font-bold h-12 rounded-xl flex items-center gap-2">
              <Zap className="h-5 w-5 fill-current" />
              شراء أرصدة إضافية
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Card */}
          <Card className="glass-panel border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap className="h-24 w-24 text-white" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#D4AF37]" />
                الرصيد اليومي
              </CardTitle>
              <CardDescription className="text-neutral-400">يتجدد كل 24 ساعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-bold text-white">{wallet?.dailyBalance || 0}</span>
                <span className="text-neutral-500 text-sm">من {wallet?.dailyLimit || 0} رصيد</span>
              </div>
              <Progress value={dailyProgress} className="h-2 bg-white/5" indicatorClassName="bg-[#D4AF37]" />
            </CardContent>
          </Card>

          {/* Monthly Card */}
          <Card className="glass-panel border-white/10 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-3 opacity-10">
              <Calendar className="h-24 w-24 text-white" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0A66C2]" />
                الرصيد الشهري
              </CardTitle>
              <CardDescription className="text-neutral-400">
                تاريخ التجديد القادم: {wallet?.monthlyResetAt?.toDate().toLocaleDateString('ar-EG')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-bold text-white">{wallet?.monthlyBalance || 0}</span>
                <span className="text-neutral-500 text-sm">من {wallet?.monthlyLimit || 0} رصيد</span>
              </div>
              <Progress value={monthlyProgress} className="h-2 bg-white/5" indicatorClassName="bg-[#0A66C2]" />
               {wallet?.rolledOverCredits && wallet.rolledOverCredits > 0 ? (
                <p className="text-xs text-[#00A3FF]">+{wallet.rolledOverCredits} رصيد مرحّل من الشهر السابق</p>
              ) : null}
            </CardContent>
          </Card>

          {/* Plan Info */}
          <Card className="glass-panel border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <CreditCard className="h-24 w-24 text-white" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-500" />
                الباقة الحالية
              </CardTitle>
              <CardDescription className="text-neutral-400">تحكم في خطة اشتراكك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-lg py-1 px-4">
                  {wallet?.monthlyLimit === 2000 ? "Pro" : wallet?.monthlyLimit === 6000 ? "Business" : wallet?.monthlyLimit === 25000 ? "Enterprise" : "Freemium"}
                </Badge>
              </div>
              <Link href="/billing/upgrade">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                  تغيير الباقة
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="h-5 w-5 text-neutral-400" />
              سجل العمليات الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-center text-neutral-500 py-8 italic">لا يوجد سجل عمليات حتى الآن</p>
              ) : (
                transactions.map((tx, idx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {tx.type === 'consume' ? `استهلاك وكيل: ${tx.agentName || 'عام'}` : 'شراء أرصدة'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {tx.timestamp?.toDate().toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-bold",
                        tx.type === 'consume' ? "text-red-400" : "text-green-400"
                      )}>
                        {tx.type === 'consume' ? '-' : '+'}{tx.amount}
                      </span>
                      <span className="text-xs text-neutral-500">رصيد</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
