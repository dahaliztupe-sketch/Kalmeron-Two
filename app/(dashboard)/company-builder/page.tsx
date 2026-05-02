'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_TYPE_LIST, getPreset } from '@/src/lib/company-builder/presets';
import type { Company, CompanyType, CompanyStage } from '@/src/lib/company-builder/types';
import { cn } from '@/src/lib/utils';
import { AppShell } from '@/components/layout/AppShell';

// ─── بطاقة شركة موجودة ────────────────────────────────────────────────────────
function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/company-builder/${company.id}`}
      className="group block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition-all hover:border-indigo-500/40"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{company.logo}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{company.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{company.typeNameAr}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{company.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500">{company.departments.length} قسم</span>
        <span className="text-xs text-gray-500">{company.employees.length} موظف</span>
        <span className="text-xs text-gray-500">{company.tasksCompleted} مهمة مكتملة</span>
        <span
          className="mr-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: company.brandColor + '22', color: company.brandColor }}
        >
          {company.stage}
        </span>
      </div>
    </Link>
  );
}

// ─── واجهة إنشاء شركة جديدة ───────────────────────────────────────────────────
function CreateCompanyModal({ onClose, onCreated, token }: {
  onClose: () => void;
  onCreated: (company: Company) => void;
  token: string;
}) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<CompanyType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<CompanyStage>('early');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const preset = selectedType ? getPreset(selectedType) : null;

  async function handleCreate() {
    if (!name.trim() || !description.trim() || !selectedType) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), type: selectedType, stage, usePreset: selectedType }),
      });
      const data = await res.json() as { company?: Company; error?: unknown };
      if (!res.ok) throw new Error(JSON.stringify(data.error));
      if (data.company) onCreated(data.company);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في الإنشاء');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-bold text-lg text-white">إنشاء شركة جديدة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-6">
          {step === 'type' ? (
            <>
              <p className="text-sm text-gray-400 mb-4">اختر نوع شركتك:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPANY_TYPE_LIST.map(ct => (
                  <button
                    key={ct.type}
                    onClick={() => setSelectedType(ct.type)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all',
                      selectedType === ct.type
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10',
                    )}
                  >
                    <span className="text-2xl">{ct.icon}</span>
                    <span className="text-xs font-medium">{ct.nameAr}</span>
                    <span className="text-[10px] text-gray-500">{ct.description}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setStep('details')}
                  disabled={!selectedType}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  التالي ←
                </button>
              </div>
            </>
          ) : (
            <>
              {preset && (
                <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{preset.nameAr}</p>
                    <p className="text-xs text-gray-400">{preset.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {preset.departments.length} أقسام × {preset.employees.length} موظف AI جاهز للعمل
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">اسم الشركة *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: شركة الأفق للتقنية"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">وصف الشركة *</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="صف نشاط شركتك، منتجاتها، وسوقها المستهدف…"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">مرحلة النمو</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as CompanyStage)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {[
                      { v: 'idea', l: 'فكرة' }, { v: 'mvp', l: 'منتج أولي (MVP)' },
                      { v: 'early', l: 'مرحلة مبكرة' }, { v: 'growth', l: 'نمو' },
                      { v: 'scale', l: 'توسع' }, { v: 'mature', l: 'نضج' },
                    ].map(o => (
                      <option key={o.v} value={o.v} className="bg-[#0d0d1a]">{o.l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

              <div className="flex justify-between mt-5">
                <button
                  onClick={() => setStep('type')}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  ← رجوع
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !name.trim() || !description.trim()}
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <><span className="animate-spin">⚙️</span> يُنشئ…</>
                  ) : (
                    '🚀 إنشاء الشركة'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function CompanyBuilderPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then(t => {
      setToken(t);
      fetch('/api/company', { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then((d: { companies?: Company[] }) => {
          setCompanies(d.companies ?? []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [user]);

  return (
    <AppShell>
    <div className="text-white px-4 py-8 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.06] px-3 py-1 text-[11px] text-indigo-300 mb-3">
            🏢 محاكي الشركات
          </div>
          <h1 className="text-3xl font-bold text-white">ابنِ شركتك الافتراضية</h1>
          <p className="text-neutral-400 text-sm mt-1">
            موظفون AI جاهزون للعمل — مطعم، مصنع، عيادة، متجر… أي نوع
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors shadow-lg"
        >
          <span className="text-lg leading-none">+</span>
          شركة جديدة
        </button>
      </div>

      {/* Companies grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-600">
          <span className="animate-spin text-2xl mr-3">⚙️</span> جاري التحميل…
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🏢</span>
          <h2 className="text-lg font-semibold text-gray-300">لا توجد شركات بعد</h2>
          <p className="text-gray-500 text-sm mt-2 max-w-sm">
            أنشئ شركتك الأولى واختر من 19 نوعاً مختلفاً — AI agents جاهزون كموظفين فوراً
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            🚀 ابدأ الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(co => <CompanyCard key={co.id} company={co} />)}
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl border border-dashed border-white/20 hover:border-indigo-500/60 p-6 flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-indigo-400 transition-all min-h-[140px]"
          >
            <span className="text-3xl">+</span>
            <span className="text-sm">شركة جديدة</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showCreate && token && (
        <CreateCompanyModal
          onClose={() => setShowCreate(false)}
          onCreated={co => { setCompanies(prev => [co, ...prev]); setShowCreate(false); }}
          token={token}
        />
      )}
    </div>
    </AppShell>
  );
}
