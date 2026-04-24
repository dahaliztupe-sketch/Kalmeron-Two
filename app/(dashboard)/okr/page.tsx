"use client";
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { auth } from '@/src/lib/firebase';

interface KR { description: string; target: number; current: number; unit: string }
interface OKR {
  id: string; period: 'weekly' | 'monthly'; department: string;
  objective: string; keyResults: KR[]; status: string; agentId: string;
}

const DEPT_LABELS: Record<string, string> = {
  marketing: 'التسويق', sales: 'المبيعات', product: 'المنتج', finance: 'المالية',
  hr: 'الموارد البشرية', legal: 'القانوني', operations: 'العمليات', strategy: 'الاستراتيجية',
};

export default function OKRPage() {
  const [data, setData] = useState<{ weekly: OKR[]; all: OKR[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/okr', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    setGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch('/api/okr', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await load();
    } finally { setGenerating(false); }
  }

  const weekly = data?.weekly || [];
  const grouped = weekly.reduce((acc: Record<string, OKR[]>, o) => {
    (acc[o.department] ||= []).push(o); return acc;
  }, {});

  return (
    <AppShell>
      <div className="min-h-screen p-8 max-w-7xl mx-auto text-white" dir="rtl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">أهداف الأسبوع (OKRs)</h1>
            <p className="text-neutral-400">أهداف ونتائج رئيسية لكل قسم في فريقك الرقمي.</p>
          </div>
          <button onClick={generate} disabled={generating}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50">
            {generating ? 'جارٍ التوليد...' : 'توليد أهداف الأسبوع'}
          </button>
        </header>

        {loading && <p className="text-neutral-500">جارٍ التحميل...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && weekly.length === 0 && (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-white/[0.05] text-center">
            <p className="text-neutral-300 mb-4">لم يتم توليد أهداف لهذا الأسبوع بعد.</p>
            <button onClick={generate} disabled={generating}
              className="px-5 py-2 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan">
              ابدأ توليد الأهداف الآن
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([dept, okrs]) => (
            <div key={dept} className="p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
              <h2 className="text-xl font-bold mb-4">{DEPT_LABELS[dept] || dept}</h2>
              {okrs.map((o) => (
                <div key={o.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <p className="font-bold">{o.objective}</p>
                    <span className="text-xs text-neutral-500">{o.status}</span>
                  </div>
                  <div className="space-y-2">
                    {o.keyResults.map((k, i) => {
                      const pct = Math.min(100, ((k.current || 0) / (k.target || 1)) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-neutral-400 mb-1">
                            <span>{k.description}</span>
                            <span>{k.current}/{k.target} {k.unit}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                            <div
                              className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-brand-cyan'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
