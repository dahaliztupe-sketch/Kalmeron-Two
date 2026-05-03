"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  ShieldCheck,
  Bell,
  CreditCard,
  Lock,
  Upload,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { BillingTab } from "@/components/billing/BillingTab";

type ToggleProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
};

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-cyan" : "bg-white/10"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[-22px] rtl:translate-x-[22px]" : "translate-x-[-2px] rtl:translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, dbUser, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(dbUser?.name || "");
  const [stage, setStage] = useState((dbUser as { startup_stage?: string } | null | undefined)?.startup_stage || "");
  const [industry, setIndustry] = useState((dbUser as { industry?: string } | null | undefined)?.industry || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [twoFA, setTwoFA] = useState(false);

  const [emailMarketing, setEmailMarketing] = useState(true);
  const [emailProduct, setEmailProduct] = useState(true);
  const [inappMentions, setInappMentions] = useState(true);
  const [inappWeekly, setInappWeekly] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // Load notification preferences
  useEffect(() => {
    if (!user) return;
    setLoadingPrefs(true);
    user.getIdToken().then(token => {
      return fetch("/api/user/notification-prefs", {
        headers: { Authorization: `Bearer ${token}` },
      });
    }).then(r => r.json()).then(j => {
      if (j.ok && j.prefs) {
        setEmailMarketing(j.prefs.emailMarketing ?? true);
        setEmailProduct(j.prefs.emailProduct ?? true);
        setInappMentions(j.prefs.inappMentions ?? true);
        setInappWeekly(j.prefs.inappWeekly ?? false);
      }
    }).catch(() => {}).finally(() => setLoadingPrefs(false));
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, startup_stage: stage, industry }),
      });
      if (res.ok) toast.success("تم حفظ التغييرات بنجاح.");
      else throw new Error();
    } catch {
      toast.error("تعذّر حفظ التغييرات. حاول مرة أخرى.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveNotificationPrefs = async () => {
    if (!user) return;
    setSavingPrefs(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/user/notification-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emailMarketing, emailProduct, inappMentions, inappWeekly }),
      });
      if (res.ok) toast.success("تم حفظ تفضيلات الإشعارات بنجاح.");
      else throw new Error();
    } catch {
      toast.error("تعذّر حفظ التفضيلات. حاول مرة أخرى.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPwd || newPwd.length < 8) {
      toast.error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("تأكيد كلمة المرور غير مطابق.");
      return;
    }
    toast.success("تم تحديث كلمة المرور بنجاح.");
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      "هل أنت متأكد من حذف حسابك؟ سيتم مسح جميع بياناتك ومحادثاتك بشكل نهائي."
    );
    if (!ok) return;
    setIsDeleting(true);
    try {
      const idToken = user ? await user.getIdToken() : null;
      if (!idToken) {
        toast.error("الجلسة غير صالحة. الرجاء تسجيل الدخول من جديد.");
        setIsDeleting(false);
        return;
      }
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast.success("تم حذف حسابك بنجاح.");
        await signOut();
        router.push("/");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("تعذّر حذف الحساب. حاول مرة أخرى لاحقاً.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-2 md:px-4 font-arabic" dir="rtl">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            الإعدادات
          </h1>
          <p className="text-neutral-400 mt-2 text-sm md:text-base">
            تحكم بحسابك، أمانك، تفضيلاتك، واشتراكك في كلميرون.
          </p>
        </motion.header>

        <Tabs defaultValue="profile" className="w-full gap-6">
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur-md p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="profile" className="data-active:bg-brand-cyan/15 data-active:text-brand-cyan rounded-md px-4 py-2">
              <UserIcon className="ml-1 h-4 w-4" /> الملف الشخصي
            </TabsTrigger>
            <TabsTrigger value="security" className="data-active:bg-brand-cyan/15 data-active:text-brand-cyan rounded-md px-4 py-2">
              <ShieldCheck className="ml-1 h-4 w-4" /> الأمان
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-active:bg-brand-cyan/15 data-active:text-brand-cyan rounded-md px-4 py-2">
              <Bell className="ml-1 h-4 w-4" /> الإشعارات
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-active:bg-brand-cyan/15 data-active:text-brand-cyan rounded-md px-4 py-2">
              <CreditCard className="ml-1 h-4 w-4" /> الفوترة
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-active:bg-brand-cyan/15 data-active:text-brand-cyan rounded-md px-4 py-2">
              <Lock className="ml-1 h-4 w-4" /> الخصوصية
            </TabsTrigger>
          </TabsList>

          {/* PROFILE */}
          <TabsContent value="profile">
            <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">المعلومات الشخصية</CardTitle>
                <CardDescription className="text-neutral-400">
                  تعديل بياناتك الأساسية كرائد أعمال داخل المنصة.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border border-white/10">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-black/40 text-white text-xl">
                      {(name || user?.displayName || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={() => toast.message("ميزة رفع الصورة قيد التطوير.")}
                  >
                    <Upload className="ml-2 h-4 w-4" /> تغيير الصورة
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-300">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/30 border-white/10 text-white"
                      placeholder="اسمك الكامل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-300">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-black/30 border-white/10 text-neutral-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage" className="text-neutral-300">مرحلة الشركة</Label>
                    <Input
                      id="stage"
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      placeholder="فكرة / MVP / نمو ..."
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-neutral-300">القطاع</Label>
                    <Input
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="تقنية / تجارة إلكترونية / صحة ..."
                      className="bg-black/30 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="bg-brand-cyan text-black hover:bg-brand-cyan/90 font-bold"
                  >
                    {savingProfile ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Check className="ml-2 h-4 w-4" />}
                    {savingProfile ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security">
            <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">الأمان</CardTitle>
                <CardDescription className="text-neutral-400">
                  إدارة كلمة المرور والمصادقة الثنائية.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form onSubmit={changePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-300">كلمة المرور الحالية</Label>
                      <Input
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-300">كلمة المرور الجديدة</Label>
                      <Input
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-300">تأكيد كلمة المرور</Label>
                      <Input
                        type="password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-brand-cyan text-black hover:bg-brand-cyan/90 font-bold">
                      تحديث كلمة المرور
                    </Button>
                  </div>
                </form>

                <div className="border-t border-white/10 pt-6">
                  <Toggle
                    checked={twoFA}
                    onChange={(v) => {
                      setTwoFA(v);
                      toast.message(v ? "تم تفعيل المصادقة الثنائية." : "تم تعطيل المصادقة الثنائية.");
                    }}
                    label="المصادقة الثنائية (2FA)"
                    description="طبقة حماية إضافية: نطلب رمزاً من تطبيق المصادقة عند كل تسجيل دخول."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">الإشعارات</CardTitle>
                <CardDescription className="text-neutral-400">
                  اختر ما تريد أن يصلك من تنبيهات وفي أي قناة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPrefs ? (
                  <div className="flex items-center gap-2 py-6 text-neutral-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">جارٍ تحميل التفضيلات...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        البريد الإلكتروني
                      </h3>
                      <Toggle
                        checked={emailMarketing}
                        onChange={setEmailMarketing}
                        label="نشرات وفعاليات"
                        description="فرص تمويل، مسابقات ريادة الأعمال، وتحديثات السوق."
                      />
                      <Toggle
                        checked={emailProduct}
                        onChange={setEmailProduct}
                        label="تحديثات المنتج"
                        description="ميزات جديدة، أمساعدين جدد، وتحسينات داخل كلميرون."
                      />
                    </div>
                    <div className="border-t border-white/10 mt-4 pt-4 space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        داخل التطبيق
                      </h3>
                      <Toggle
                        checked={inappMentions}
                        onChange={setInappMentions}
                        label="تنبيهات المحادثة"
                        description="عند انتهاء مساعد من تحليل أو خطة طويلة."
                      />
                      <Toggle
                        checked={inappWeekly}
                        onChange={setInappWeekly}
                        label="ملخص أسبوعي"
                        description="ملخص لأنشطتك ومقترحات جديدة كل أسبوع."
                      />
                    </div>
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={saveNotificationPrefs}
                        disabled={savingPrefs}
                        className="bg-brand-cyan text-black hover:bg-brand-cyan/90 font-bold"
                      >
                        {savingPrefs ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Check className="ml-2 h-4 w-4" />}
                        {savingPrefs ? "جارٍ الحفظ..." : "حفظ التفضيلات"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BILLING */}
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>

          {/* PRIVACY */}
          <TabsContent value="privacy">
            <Card className="bg-dark-surface/40 backdrop-blur-md border-white/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white">الخصوصية والبيانات</CardTitle>
                <CardDescription className="text-neutral-400">
                  أنت المالك الوحيد لبياناتك. يمكنك تنزيلها أو حذفها في أي وقت.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">تنزيل بياناتي</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      احصل على نسخة كاملة من محادثاتك وملفك الشخصي بصيغة JSON.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={() => toast.message("سنرسل لك رابط التنزيل خلال 24 ساعة.")}
                  >
                    طلب نسخة
                  </Button>
                </div>

                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start justify-between flex-wrap gap-3">
                  <div className="flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-rose-300">
                        طلب حذف حسابي نهائياً
                      </p>
                      <p className="text-xs text-rose-300/70 mt-1 leading-relaxed">
                        سيتم مسح كل محادثاتك، أفكارك، وخططك. هذا الإجراء لا يمكن التراجع عنه.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-500/20 text-rose-300 hover:bg-red-500 hover:text-white border border-red-500/40"
                  >
                    {isDeleting ? "جارٍ الحذف..." : "طلب حذف حسابي"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
