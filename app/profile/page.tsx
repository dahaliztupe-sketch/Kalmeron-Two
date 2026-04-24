"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Briefcase, MapPin, Building, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { dbUser, signOut: logout, user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const dir = "rtl";

  const handleDeleteAccount = async () => {
      const confirmText = "هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ هذا الإجراء سيقوم بمسح كل محادثاتك، أفكارك، وخطط العمل نهائياً ولا يمكن الرجوع عنه.";
      if (!window.confirm(confirmText)) return;

      setIsDeleting(true);
      try {
          const res = await fetch('/api/user/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.uid })
          });

          if (res.ok) {
              toast.success("تم حذف بياناتك بنجاح. نتمنى رؤيتك قريباً.");
              await logout();
              router.push('/');
          } else {
              throw new Error("فشل في حذف البيانات");
          }
      } catch (err) {
          toast.error("حدث خطأ أثناء محاولة حذف الحساب. حاول مرة أخرى.");
          console.error(err);
      } finally {
          setIsDeleting(false);
      }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-10 p-4 text-white" dir={dir}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3 text-white">
            <Settings className="h-10 w-10 text-neutral-500" />
            الإعدادات والملف الشخصي
          </h1>
          <p className="text-neutral-400 text-xl leading-relaxed">
            التحكم في بياناتك كرائد أعمال وتخصيص تفضيلاتك داخل كلميرون.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="glass border-neutral-700/50 shadow-2xl rounded-3xl overflow-hidden relative">
            <CardHeader className="bg-[#16161D]/80 border-b border-neutral-800 p-8">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                    <User className="h-6 w-6 text-[rgb(var(--brand-cyan))]" /> 
                    المعلومات الأساسية
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col p-8 bg-[#0A0A0F]/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 text-lg">
                        <LabelText icon={<User className="h-5 w-5" />} label="الاسم الكامل" />
                        <p className="font-bold text-white text-xl">{dbUser?.name || "رائد أعمال مجهول"}</p>
                    </div>
                    <div className="space-y-2 text-lg">
                        <LabelText icon={<Building className="h-5 w-5" />} label="المجال الصناعي" />
                        <p className="font-bold text-white text-xl">{dbUser?.industry || "غير محدد"}</p>
                    </div>
                    <div className="space-y-2 text-lg">
                        <LabelText icon={<Briefcase className="h-5 w-5" />} label="مرحلة الشركة" />
                        <p className="font-bold text-white text-xl">{dbUser?.startup_stage || "غير محدد"}</p>
                    </div>
                    <div className="space-y-2 text-lg">
                        <LabelText icon={<MapPin className="h-5 w-5" />} label="المحافظة" />
                        <p className="font-bold text-white text-xl">{dbUser?.governorate || "غير محدد"}</p>
                    </div>
                </div>
            </CardContent>
            </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col md:flex-row justify-end gap-4 mt-8">
            <Button 
                onClick={handleDeleteAccount} 
                className="h-14 px-8 text-lg rounded-2xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-all font-medium"
                disabled={isDeleting}
            >
                {isDeleting ? "جاري الحذف..." : "حذف حسابي (الحق في النسيان)"}
            </Button>
            <Button onClick={logout} variant="destructive" className="h-14 px-8 text-lg rounded-2xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition-all font-bold">
                تسجيل الخروج <LogOut className="mr-3 h-5 w-5" />
            </Button>
        </motion.div>

      </div>
    </AppShell>
  );
}

function LabelText({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center gap-2 text-neutral-400 font-medium">
            {icon} {label}
        </div>
    )
}
