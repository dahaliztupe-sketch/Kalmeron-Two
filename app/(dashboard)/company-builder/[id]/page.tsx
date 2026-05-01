'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { DelegationTracker } from '@/src/components/delegation/DelegationTracker';
import type { Company, CompanyTask, CompanyDepartment, VirtualEmployee, TaskPriority } from '@/src/lib/company-builder/types';
import { cn } from '@/src/lib/utils';

// ─── تبويبات ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'employees' | 'tasks' | 'delegation';

// ─── بطاقة قسم ────────────────────────────────────────────────────────────────
function DeptCard({ dept, employees }: { dept: CompanyDepartment; employees: VirtualEmployee[] }) {
  const deptEmployees = employees.filter(e => e.departmentId === dept.id);
  return (
    <div
      className="rounded-xl border p-4 bg-white/5"
      style={{ borderColor: dept.color + '44' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{dept.icon}</span>
        <div>
          <h3 className="font-semibold text-sm text-white">{dept.nameAr}</h3>
          <p className="text-xs text-gray-500">{dept.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {deptEmployees.map(e => (
          <span key={e.id} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            {e.nameAr}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── بطاقة موظف ──────────────────────────────────────────────────────────────
function EmployeeCard({ emp }: { emp: VirtualEmployee }) {
  const statusColor = {
    active: 'text-green-400',
    busy: 'text-yellow-400',
    on_task: 'text-blue-400',
    offline: 'text-gray-600',
  }[emp.status];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/8 transition-all">
      <div className="flex items-start gap-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-900/60 flex items-center justify-center text-sm font-bold text-indigo-300">
          {emp.nameAr.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-white">{emp.nameAr}</p>
          <p className="text-xs text-gray-500">{emp.titleAr}</p>
          <div className={cn('text-xs mt-1', statusColor)}>● {emp.status}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {emp.skills.slice(0, 3).map(s => (
          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─── بطاقة مهمة ──────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-gray-500 bg-gray-800',
  medium: 'text-blue-400 bg-blue-900/30',
  high: 'text-orange-400 bg-orange-900/30',
  critical: 'text-red-400 bg-red-900/30',
};

function TaskCard({ task }: { task: CompanyTask }) {
  const statusIcon = {
    pending: '🕐',
    in_progress: '⚙️',
    awaiting_review: '👁️',
    completed: '✅',
    failed: '❌',
    cancelled: '🚫',
  }[task.status] ?? '•';

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span>{statusIcon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{task.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
          </div>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded-full flex-shrink-0', PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </span>
      </div>
      {task.output && (
        <div className="mt-3 p-2.5 rounded-lg bg-white/5 border border-white/5">
          <p className="text-xs text-gray-400 line-clamp-3">{task.output}</p>
        </div>
      )}
      {task.traceId && (
        <p className="text-[10px] text-gray-700 mt-2 font-mono">trace: {task.traceId}</p>
      )}
    </div>
  );
}

// ─── نموذج مهمة جديدة ────────────────────────────────────────────────────────
function NewTaskForm({
  company, token,
  onCreated,
}: {
  company: Company;
  token: string;
  onCreated: (task: CompanyTask, traceId?: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [autoExecute, setAutoExecute] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDept = (id: string) =>
    setSelectedDepts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  async function submit() {
    if (!title || !description || selectedDepts.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/company/${company.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, involvedDepartments: selectedDepts, priority, autoExecute }),
      });
      const data = await res.json() as { task?: CompanyTask; error?: unknown };
      if (!res.ok) throw new Error(String(data.error));
      if (data.task) {
        onCreated(data.task, data.task.traceId);
        setTitle('');
        setDescription('');
        setSelectedDepts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-5">
      <h3 className="font-semibold text-sm text-white mb-3">➕ مهمة جديدة</h3>
      <div className="flex flex-col gap-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="عنوان المهمة…"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="وصف تفصيلي للمهمة…"
          rows={2}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div>
          <p className="text-xs text-gray-500 mb-1.5">الأقسام المعنية:</p>
          <div className="flex flex-wrap gap-1.5">
            {company.departments.map(d => (
              <button
                key={d.id}
                onClick={() => toggleDept(d.id)}
                className={cn(
                  'text-xs px-2 py-1 rounded-lg border transition-all',
                  selectedDepts.includes(d.id)
                    ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10',
                )}
              >
                {d.icon} {d.nameAr}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            {['low', 'medium', 'high', 'critical'].map(p => (
              <option key={p} value={p} className="bg-[#0d0d1a]">{p}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoExecute}
              onChange={e => setAutoExecute(e.target.checked)}
              className="accent-indigo-500"
            />
            تنفيذ تلقائي بـ AI
          </label>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          onClick={submit}
          disabled={loading || !title || !description || selectedDepts.length === 0}
          className="self-end px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 transition-colors"
        >
          {loading ? '⚙️ يُوزّع على الأقسام…' : '🚀 تنفيذ المهمة'}
        </button>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [tasks, setTasks] = useState<CompanyTask[]>([]);
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [activeTraceId, setActiveTraceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (t: string) => {
    const [coRes, tkRes] = await Promise.all([
      fetch(`/api/company/${id}`, { headers: { Authorization: `Bearer ${t}` } }),
      fetch(`/api/company/${id}/tasks?limit=30`, { headers: { Authorization: `Bearer ${t}` } }),
    ]);
    if (coRes.ok) {
      const d = await coRes.json() as { company: Company };
      setCompany(d.company);
    }
    if (tkRes.ok) {
      const d = await tkRes.json() as { tasks: CompanyTask[] };
      setTasks(d.tasks);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then(t => { setToken(t); fetchData(t).catch(() => setLoading(false)); })
      .catch(() => setLoading(false));
  }, [user, fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#080812] text-gray-600">
      <span className="animate-spin text-2xl mr-3">⚙️</span> جاري التحميل…
    </div>
  );

  if (!company) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080812] text-gray-500">
      <span className="text-5xl mb-3">🏚️</span>
      <p>الشركة غير موجودة أو ليست لك</p>
      <Link href="/company-builder" className="mt-3 text-indigo-400 text-sm">← العودة للقائمة</Link>
    </div>
  );

  const TABS: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'overview', label: 'نظرة عامة', icon: '🏢' },
    { id: 'employees', label: `الموظفون (${company.employees.length})`, icon: '👥' },
    { id: 'tasks', label: `المهام (${tasks.length})`, icon: '📋' },
    { id: 'delegation', label: 'تتبع التفويض', icon: '📡' },
  ];

  return (
    <div className="min-h-screen bg-[#080812] text-white" dir="rtl">
      {/* Hero */}
      <div
        className="px-6 py-8 border-b border-white/10"
        style={{ background: `linear-gradient(135deg, ${company.brandColor}15 0%, transparent 60%)` }}
      >
        <Link href="/company-builder" className="text-xs text-gray-600 hover:text-gray-400 mb-3 block">
          ← العودة لقائمة الشركات
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{company.logo}</span>
          <div>
            <h1 className="text-xl font-bold">{company.name}</h1>
            <p className="text-sm text-gray-400">{company.typeNameAr} • {company.stage}</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">{company.description}</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          {[
            { label: 'أقسام', value: company.departments.length },
            { label: 'موظف AI', value: company.employees.length },
            { label: 'مهام مكتملة', value: company.tasksCompleted },
          ].map(m => (
            <div key={m.label} className="text-center">
              <p className="text-xl font-bold" style={{ color: company.brandColor }}>{m.value}</p>
              <p className="text-xs text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 border-b border-white/10 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2',
              tab === t.id
                ? 'text-white border-indigo-500 bg-white/5'
                : 'text-gray-500 border-transparent hover:text-gray-300',
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">الأقسام</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {company.departments.map(d => (
                  <DeptCard key={d.id} dept={d} employees={company.employees} />
                ))}
              </div>
            </div>
            {company.values.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">قيم الشركة</h2>
                <div className="flex flex-wrap gap-2">
                  {company.values.map(v => (
                    <span key={v} className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-gray-300">{v}</span>
                  ))}
                </div>
              </div>
            )}
            {company.currentOkrs && company.currentOkrs.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">OKRs الحالية</h2>
                <div className="flex flex-col gap-2">
                  {company.currentOkrs.map((okr, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-indigo-400 mt-0.5">◆</span>
                      {okr}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'employees' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {company.employees.map(e => <EmployeeCard key={e.id} emp={e} />)}
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            <NewTaskForm
              company={company}
              token={token}
              onCreated={(task, traceId) => {
                setTasks(prev => [task, ...prev]);
                if (traceId) { setActiveTraceId(traceId); setTab('delegation'); }
              }}
            />
            <div className="flex flex-col gap-3">
              {tasks.map(t => <TaskCard key={t.id} task={t} />)}
              {tasks.length === 0 && (
                <p className="text-center text-gray-600 py-10">لا توجد مهام بعد — أنشئ أولى مهامك أعلاه</p>
              )}
            </div>
          </div>
        )}

        {tab === 'delegation' && (
          <div className="space-y-4">
            {activeTraceId ? (
              <>
                <p className="text-sm text-gray-400">
                  تتبع سلسلة التفويض للمهمة الأخيرة في الوقت الفعلي:
                </p>
                <DelegationTracker
                  traceId={activeTraceId}
                  idToken={token}
                  maxHeight="500px"
                  className="w-full"
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                <span className="text-4xl mb-3">📡</span>
                <p className="text-sm">لم تبدأ أي عملية تفويض بعد</p>
                <p className="text-xs mt-1 text-gray-700">
                  أنشئ مهمة وفعّل &ldquo;تنفيذ تلقائي&rdquo; لرؤية التفويض هنا
                </p>
                <button
                  onClick={() => setTab('tasks')}
                  className="mt-4 px-4 py-2 text-sm rounded-lg bg-indigo-900/50 text-indigo-400 hover:bg-indigo-900/80 transition-colors"
                >
                  ← إنشاء مهمة
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
