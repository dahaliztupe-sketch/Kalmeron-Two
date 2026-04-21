"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Rocket, Sparkles, MapPin, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingForm() {
  const { user, refreshDBUser } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const dir = language === "ar" ? "rtl" : "ltr";
  
  const [name, setName] = useState(user?.displayName || "");
  const [stage, setStage] = useState("");
  const [industry, setIndustry] = useState("");
  const [gov, setGov] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !stage || !industry || !gov) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        startup_stage: stage,
        industry,
        governorate: gov,
        profile_completed: true
      });
      await refreshDBUser();
      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 relative overflow-hidden" dir={dir}>
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgb(var(--gold))]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgb(var(--azure))]/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl z-10"
      >
        <Card className="glass border-neutral-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-10 pb-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-[rgb(var(--gold))]/10 rounded-2xl flex items-center justify-center mb-2">
                <Rocket className="w-8 h-8 text-[rgb(var(--gold))]" />
            </div>
            <CardTitle className="text-4xl font-black text-white tracking-tight">
              {language === 'ar' ? 'أهلاً بك في كلميرون تو' : 'Welcome to Kalmeron Two'}
            </CardTitle>
            <CardDescription className="text-xl text-neutral-400">
              {language === 'ar' 
                ? 'لنقم بتخصيص تجربتك. أخبرنا عن مشروعك لنبدأ الرحلة سوياً.'
                : 'Let\'s personalize your experience. Tell us about your startup to begin.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-neutral-300 font-bold ml-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[rgb(var(--gold))]" />
                    {language === 'ar' ? 'الاسم الذي تود أن نناديك به' : 'Full Name'}
                </Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={language === 'ar' ? 'اكتب اسمك هنا...' : 'Enter your name...'}
                  className="h-14 bg-neutral-900/50 border-neutral-800 rounded-2xl text-lg focus:ring-[rgb(var(--gold))]"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Label className="text-neutral-300 font-bold ml-1 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[rgb(var(--azure))]" />
                        {language === 'ar' ? 'مرحلة المشروع' : 'Startup Stage'}
                    </Label>
                    <Select onValueChange={(val: any) => setStage(val)} required>
                        <SelectTrigger className="h-14 bg-neutral-900/50 border-neutral-800 rounded-2xl text-lg" dir={dir}>
                        <SelectValue placeholder={language === 'ar' ? 'اختر المرحلة' : 'Select stage'} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-2xl" dir={dir}>
                        <SelectItem value="idea">{language === 'ar' ? 'فكرة أولية' : 'Initial Idea'}</SelectItem>
                        <SelectItem value="validation">{language === 'ar' ? 'اختبار المنتج' : 'Market Validation'}</SelectItem>
                        <SelectItem value="launch">{language === 'ar' ? 'إطلاق رسمي' : 'Live Product'}</SelectItem>
                        <SelectItem value="growth">{language === 'ar' ? 'توسع ونمو' : 'Scale & Growth'}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label className="text-neutral-300 font-bold ml-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {language === 'ar' ? 'المحافظة' : 'Governorate'}
                    </Label>
                    <Input 
                        value={gov} 
                        onChange={(e) => setGov(e.target.value)} 
                        placeholder={language === 'ar' ? 'مثال: القاهرة' : 'e.g. Cairo'}
                        className="h-14 bg-neutral-900/50 border-neutral-800 rounded-2xl text-lg"
                        required 
                    />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-neutral-300 font-bold ml-1">
                    {language === 'ar' ? 'مجال العمل (Fintech, Tech...)' : 'Industry'}
                </Label>
                <Input 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)} 
                  placeholder={language === 'ar' ? 'ما هو تخصصك؟' : 'e.g. HealthTech'}
                  className="h-14 bg-neutral-900/50 border-neutral-800 rounded-2xl text-lg"
                  required 
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-16 text-xl rounded-2xl bg-[rgb(var(--gold))] text-black hover:bg-[#d9a31a] font-black shadow-xl mt-4 transition-transform hover:scale-[1.02]"
              >
                {loading ? (
                    <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> جاري التحضير...</>
                ) : (
                    language === 'ar' ? 'ابدأ بناء مستقبلك الآن' : 'Start Building Your Future'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
