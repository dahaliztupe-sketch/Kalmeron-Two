"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare, ArrowLeft, CheckCircle2, Zap, Shield,
  Bot, Copy, Check, RefreshCw, ExternalLink, Clock,
  Loader2, AlertCircle, PhoneIncoming, Phone, Save,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface Conversation {
  id: string;
  phoneNumber: string;
  userMessage: string;
  aiReply: string | null;
  error?: string;
  createdAt: string;
  timestamp: number;
}

interface Registration {
  phone: string;
  normalizedPhone: string;
  registeredAt: number;
  verified?: boolean;
}

const FEATURES = [
  { icon: Bot, title: "وكيل ذكي 24/7", desc: "يتلقى أسئلتك عبر WhatsApp ويجيب فوراً بالذكاء الاصطناعي" },
  { icon: Zap, title: "ردود في ثوانٍ", desc: "يعالج رسالتك ويُرسل الرد مباشرة دون تدخل بشري" },
  { icon: Shield, title: "مُخصَّص لحسابك", desc: "كل محادثاتك مربوطة بحسابك ولا يراها أحد غيرك" },
  { icon: Clock, title: "سجل خاص بك", desc: "كل محادثة WhatsApp تُحفظ هنا في لوحة التحكم الخاصة بك" },
];

const SETUP_STEPS = [
  {
    n: "1",
    title: "أنشئ حساب Twilio",
    desc: "سجّل على twilio.com واشترك في Twilio WhatsApp Sandbox أو اطلب رقم WhatsApp Business",
    link: "https://twilio.com",
    linkLabel: "فتح Twilio",
  },
  {
    n: "2",
    title: "أضف TWILIO_AUTH_TOKEN إلى المتغيرات",
    desc: "أضف TWILIO_AUTH_TOKEN إلى متغيرات البيئة في إعدادات المشروع",
    code: "TWILIO_AUTH_TOKEN=your_auth_token_here",
  },
  {
    n: "3",
    title: "اضبط Webhook URL في Twilio",
    desc: 'في Twilio Console ← Messaging ← Send a WhatsApp message ← Sandbox Settings — أدخل Webhook URL أدناه في حقل "When a message comes in"',
    isWebhook: true,
  },
  {
    n: "4",
    title: "سجّل رقمك أدناه",
    desc: "أدخل رقم WhatsApp الخاص بك ليتم ربط محادثاتك بحسابك",
    isRegister: true,
  },
];

export default function WhatsAppAgentPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>(() =>
    typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : ""
  );
  const [activeSetupStep, setActiveSetupStep] = useState<number | null>(null);
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);

  const loadRegistration = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/whatsapp/register-phone", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.registration) {
        setRegistration(data.registration as Registration);
        setPhoneInput(data.registration.phone);
      }
    } catch {}
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/whatsapp/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.conversations) {
        setConversations(
          [...data.conversations].sort((a: Conversation, b: Conversation) => b.timestamp - a.timestamp)
        );
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    async function run() {
      await loadRegistration();
      await loadConversations();
    }
    void run();
    const iv = setInterval(() => void loadConversations(), 15000);
    return () => clearInterval(iv);
  }, [loadRegistration, loadConversations]);

  const handleSavePhone = async () => {
    if (!user || !phoneInput.trim() || savingPhone) return;
    setSavingPhone(true);
    setPhoneError("");
    setPendingOtp(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/whatsapp/register-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phoneInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setPendingOtp(data.otpCode as string);
      setRegistration({ phone: phoneInput.trim(), normalizedPhone: phoneInput.trim(), registeredAt: Date.now(), verified: false });
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2500);
    } catch (e) {
      setPhoneError(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSavingPhone(false);
    }
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString("ar-EG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="text-green-400" size={24} />
                وكيل WhatsApp الذكي
              </h1>
              <p className="text-slate-400 text-sm mt-1">اربط Twilio WhatsApp بحسابك — كل رسالة تُجيب عليها AI فوراً وتُحفظ هنا</p>
            </div>
          </motion.div>

          {registration && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`border rounded-xl p-3 text-sm space-y-2 ${
                registration.verified
                  ? "bg-green-900/20 border-green-500/30 text-green-300"
                  : "bg-amber-900/20 border-amber-500/30 text-amber-300"
              }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                {registration.verified
                  ? <span>رقمك المُفعَّل: <span className="font-mono font-bold">{registration.phone}</span></span>
                  : <span>بانتظار التحقق: <span className="font-mono font-bold">{registration.phone}</span> — أرسل رمز التحقق عبر WhatsApp</span>
                }
              </div>
              {pendingOtp && !registration.verified && (
                <div className="bg-neutral-900/60 border border-amber-500/20 rounded-lg p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-amber-400 mb-0.5">رمز التحقق (أرسله عبر WhatsApp):</div>
                    <span className="font-mono text-2xl font-bold tracking-[0.3em] text-white">{pendingOtp}</span>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(pendingOtp); setCopiedField("otp"); setTimeout(() => setCopiedField(""), 2000); }}
                    className="text-amber-400 hover:text-white transition-colors shrink-0">
                    {copiedField === "otp" ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
                className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 flex gap-3">
                <Icon size={18} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white mb-0.5">{title}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              خطوات الإعداد والربط
            </h2>

            {SETUP_STEPS.map((step, i) => (
              <div key={step.n}>
                <button onClick={() => setActiveSetupStep(activeSetupStep === i ? null : i)}
                  className="w-full flex items-start gap-4 text-right group">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm flex items-center justify-center shrink-0">
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white group-hover:text-green-300 transition-colors">{step.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{step.desc}</div>
                  </div>
                </button>

                <AnimatePresence>
                  {activeSetupStep === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 mr-12 space-y-2">
                      {step.link && (
                        <a href={step.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 border border-green-500/30 rounded-xl px-4 py-2 transition-colors">
                          <ExternalLink size={13} />
                          {step.linkLabel}
                        </a>
                      )}
                      {step.code && (
                        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
                          <code className="text-xs text-green-300 font-mono">{step.code}</code>
                          <button onClick={() => copyText(step.code!, `step-${i}`)}
                            className="text-slate-400 hover:text-white transition-colors ml-3">
                            {copiedField === `step-${i}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      )}
                      {step.isWebhook && webhookUrl && (
                        <div className="bg-slate-900/80 border border-green-500/20 rounded-xl p-3 space-y-2">
                          <div className="text-xs text-slate-400 mb-1">Webhook URL الخاص بك:</div>
                          <div className="flex items-center justify-between gap-3">
                            <code className="text-xs text-green-300 font-mono break-all">{webhookUrl}</code>
                            <button onClick={() => copyText(webhookUrl, "webhook")}
                              className="text-slate-400 hover:text-white transition-colors shrink-0">
                              {copiedField === "webhook" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </div>
                      )}
                      {step.isRegister && user && (
                        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 space-y-3">
                          <div className="text-xs text-slate-400">أدخل رقم WhatsApp (مع الكود الدولي):</div>
                          <div className="flex gap-2">
                            <input
                              value={phoneInput}
                              onChange={e => setPhoneInput(e.target.value)}
                              placeholder="+20 10 1234 5678"
                              className="flex-1 bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-green-500/50"
                            />
                            <button onClick={handleSavePhone} disabled={!phoneInput.trim() || savingPhone}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                              {savingPhone ? <Loader2 size={13} className="animate-spin" /> : phoneSaved ? <Check size={13} /> : <Save size={13} />}
                              {phoneSaved ? "تم!" : "حفظ"}
                            </button>
                          </div>
                          {phoneError && <p className="text-xs text-rose-400">{phoneError}</p>}
                          {pendingOtp && (
                            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 space-y-1">
                              <p className="text-xs text-amber-400 font-medium">أرسل هذا الرمز عبر WhatsApp من رقمك للتحقق من الملكية:</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-xl font-bold tracking-[0.3em] text-white">{pendingOtp}</span>
                                <button onClick={() => { navigator.clipboard.writeText(pendingOtp); setCopiedField("otp-inline"); setTimeout(() => setCopiedField(""), 2000); }}
                                  className="text-amber-400 hover:text-white transition-colors">
                                  {copiedField === "otp-inline" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                </button>
                              </div>
                              <p className="text-[11px] text-slate-500">صالح 15 دقيقة — بعد الإرسال يُفعَّل الوكيل تلقائياً</p>
                            </div>
                          )}
                          {registration?.verified && (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle2 size={11} /> مُفعَّل: {registration.phone}
                            </p>
                          )}
                        </div>
                      )}
                      {step.isRegister && !user && (
                        <div className="text-xs text-slate-500 bg-slate-900/60 rounded-xl p-3">
                          سجّل الدخول أولاً لربط رقم WhatsApp بحسابك
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {i < SETUP_STEPS.length - 1 && <div className="border-t border-slate-700/30 mt-4" />}
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <PhoneIncoming size={16} className="text-green-400" />
                محادثاتي عبر WhatsApp
                {conversations.length > 0 && (
                  <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">
                    {conversations.length}
                  </span>
                )}
              </h2>
              <button onClick={loadConversations} disabled={loading}
                className="text-slate-400 hover:text-white transition-colors">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>

            {!user ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">سجّل الدخول لعرض محادثاتك</p>
              </div>
            ) : !registration ? (
              <div className="text-center py-8 text-slate-500">
                <Phone size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">سجّل رقم WhatsApp أولاً (الخطوة 4) لربط المحادثات بحسابك</p>
              </div>
            ) : !registration.verified ? (
              <div className="text-center py-8 text-amber-600/60">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm text-amber-500">الرقم في انتظار التحقق</p>
                <p className="text-xs text-slate-500 mt-1">أرسل رمز التحقق من <span className="text-amber-400 font-mono">{registration.phone}</span> عبر WhatsApp وستُفعَّل المحادثات</p>
              </div>
            ) : loading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-slate-500" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد محادثات بعد</p>
                <p className="text-xs mt-1">أرسل رسالة WhatsApp من رقمك المسجَّل <span className="text-green-400">{registration.phone}</span> وستظهر هنا</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <motion.button key={conv.id} onClick={() => setSelectedConv(selectedConv?.id === conv.id ? null : conv)}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full text-right bg-slate-900/60 hover:bg-slate-900/90 border border-slate-700/40 hover:border-green-500/30 rounded-xl p-4 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-green-400">{conv.phoneNumber}</span>
                          {conv.error && <AlertCircle size={12} className="text-rose-400" />}
                        </div>
                        <p className="text-sm text-white truncate">{conv.userMessage}</p>
                        {conv.aiReply && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">↩ {conv.aiReply}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 shrink-0">{formatTime(conv.timestamp)}</span>
                    </div>

                    <AnimatePresence>
                      {selectedConv?.id === conv.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-slate-700/40 space-y-3 text-right">
                          <div className="bg-slate-800/60 rounded-xl p-3">
                            <div className="text-xs text-slate-500 mb-1">رسالتي</div>
                            <p className="text-sm text-white">{conv.userMessage}</p>
                          </div>
                          {conv.aiReply && (
                            <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-3">
                              <div className="text-xs text-green-400 mb-1">رد الوكيل الذكي</div>
                              <div className="text-sm text-slate-300 prose prose-invert prose-sm max-w-none" dir="auto">
                                <ReactMarkdown>{conv.aiReply}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                          {conv.error && (
                            <div className="bg-rose-900/20 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
                              خطأ: {conv.error}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/chat", label: "المساعد الذكي", icon: "🤖" },
              { href: "/inbox", label: "الموافقات", icon: "📥" },
              { href: "/notifications", label: "الإشعارات", icon: "🔔" },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{label}</div>
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}
