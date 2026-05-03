"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Monitor, Plus, RefreshCw, Cpu, Clock, Trash2, Loader2, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface VMRecord {
  id?: string;
  agentId: string;
  departmentId: string;
  provider?: string;
  providerSandboxId?: string;
  status: string;
  lastError?: string;
  createdAt?: string;
}

const DEPT_OPTIONS = [
  { value: "general", label: "عام" },
  { value: "marketing", label: "التسويق" },
  { value: "product", label: "المنتج" },
  { value: "finance", label: "المالية" },
  { value: "legal", label: "القانوني" },
  { value: "hr", label: "الموارد البشرية" },
  { value: "operations", label: "العمليات" },
];

const STATUS_STYLE: Record<string, string> = {
  running: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  idle: "text-neutral-400 bg-neutral-500/10 border-neutral-500/30",
  error: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  running: "يعمل",
  idle: "خامل",
  error: "خطأ",
};

export default function VirtualOfficePage() {
  const [vms, setVms] = useState<VMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [departmentId, setDepartmentId] = useState("general");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/virtual-office");
      const j = await r.json();
      setVms(j.vms || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function provision() {
    if (!agentId.trim()) return;
    setProvisioning(true);
    try {
      await fetch("/api/virtual-office", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "provision", agentId: agentId.trim(), departmentId }) });
      setAgentId("");
      toast.success("تم إنشاء الجهاز الافتراضي");
      await load();
    } catch {
      toast.error("تعذّر إنشاء الجهاز");
    } finally {
      setProvisioning(false);
    }
  }

  async function deprovision(vm: VMRecord) {
    try {
      await fetch("/api/virtual-office", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deprovision", agentId: vm.agentId }) });
      toast.success("تم إيقاف الجهاز");
      await load();
    } catch {
      toast.error("تعذّر إيقاف الجهاز");
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/[0.06] px-3 py-1 text-[11px] text-cyan-200 mb-3"><Monitor className="w-3.5 h-3.5" /> المكتب الرقمي · الأجهزة الافتراضية</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">المكتب الرقمي</h1>
          <p className="text-sm text-neutral-400 max-w-xl">أجهزة افتراضية آمنة ومعزولة لكل مساعد ذكي — كل وكيل يعمل في بيئة منفصلة لضمان الأمان والأداء.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-[rgb(var(--brand-cyan))]" /> إنشاء جهاز جديد</h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[160px]"><label className="block text-xs text-neutral-500 mb-1.5">معرف المساعد</label><input value={agentId} onChange={(e) => setAgentId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && provision()} placeholder="مثال: cfo-agent-01" className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[rgb(var(--brand-cyan))] transition-colors" /></div>
              <div className="flex-1 min-w-[140px]"><label className="block text-xs text-neutral-500 mb-1.5">القسم</label><select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[rgb(var(--brand-cyan))] transition-colors">{DEPT_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
              <button onClick={provision} disabled={!agentId.trim() || provisioning} className="h-[42px] px-5 rounded-xl bg-[rgb(var(--brand-cyan))] text-black text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2 shrink-0">{provisioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} إنشاء</button>
              <button onClick={load} className="h-[42px] px-3 rounded-xl border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white transition-colors shrink-0"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>
        </motion.div>

        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-neutral-500" /></div> : vms.length === 0 ? <div className="text-center py-16 text-neutral-500"><Monitor className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">لا توجد أجهزة بعد. أنشئ أول جهاز أعلاه.</p></div> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vms.map((vm, i) => {
              const status = vm.status || "idle";
              const styleClass = STATUS_STYLE[status] || STATUS_STYLE.idle;
              return (
                <motion.div key={vm.id || `${vm.agentId}-${i}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5 group hover:border-neutral-600/70 transition-colors">
                  <div className="flex items-start justify-between mb-4"><div className="w-10 h-10 rounded-xl bg-[rgb(var(--brand-cyan))]/10 border border-[rgb(var(--brand-cyan))]/20 flex items-center justify-center"><Cpu className="w-5 h-5 text-[rgb(var(--brand-cyan))]" /></div><span className={cn("text-xs px-2 py-1 rounded-full border font-medium", styleClass)}>{STATUS_LABEL[status] || status}</span></div>
                  <h3 className="text-sm font-bold text-white mb-1 font-mono">{vm.agentId}</h3>
                  <p className="text-xs text-neutral-500 mb-1">{DEPT_OPTIONS.find((d) => d.value === vm.departmentId)?.label || vm.departmentId}{vm.provider && <span className="ml-1">· {vm.provider}</span>}</p>
                  {vm.providerSandboxId && <p className="text-xs font-mono text-neutral-600 truncate mb-1">{vm.providerSandboxId}</p>}
                  {vm.lastError && <p className="text-xs text-rose-400 mt-1 truncate">{vm.lastError}</p>}
                  <div className="flex items-center justify-between mt-3"><div className="flex items-center gap-1.5 text-xs text-neutral-600">{status === "running" && <span className="flex items-center gap-1 text-emerald-500"><Wifi className="w-3 h-3" /><span>متصل</span></span>}{vm.createdAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(vm.createdAt).toLocaleDateString("ar-EG")}</span>}</div><button onClick={() => deprovision(vm)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-all"><Trash2 className="w-4 h-4" /></button></div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
