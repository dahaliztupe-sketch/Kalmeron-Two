'use client';

import { useEffect, useState } from 'react';

interface AgentCard {
  id: string;
  displayNameAr: string;
  description: string;
  preferredModel?: string;
}

interface Executive {
  role: string;
  agentId: string;
  nameAr: string;
  titleAr: string;
  department: string;
  directReports: string[];
  mandate: string;
  kpis: string[];
  escalatesTo: string | null;
  agent: {
    displayNameAr: string;
    description: string;
    preferredModel: string;
    capabilities: string[];
  } | null;
}

interface Department {
  id: string;
  nameAr: string;
  head: string;
  agentCount: number;
  agents: AgentCard[];
  capabilities: string[];
}

interface OrgChartData {
  executives: Executive[];
  departments: Department[];
  stats: {
    totalExecutives: number;
    totalDepartments: number;
    totalAgents: number;
    csuiteDirect: number;
  };
}

const ROLE_COLORS: Record<string, string> = {
  CEO: 'from-violet-600 to-purple-700',
  CFO: 'from-emerald-600 to-teal-700',
  COO: 'from-blue-600 to-cyan-700',
  CMO: 'from-orange-500 to-red-600',
  CTO: 'from-indigo-600 to-blue-700',
  CLO: 'from-slate-600 to-gray-700',
  CHRO: 'from-pink-600 to-rose-700',
  CSO: 'from-amber-600 to-yellow-700',
};

const ROLE_ICONS: Record<string, string> = {
  CEO: '👑',
  CFO: '💰',
  COO: '⚙️',
  CMO: '📣',
  CTO: '🖥️',
  CLO: '⚖️',
  CHRO: '👥',
  CSO: '🎯',
};

const MODEL_BADGE: Record<string, string> = {
  PRO: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  FLASH: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  LITE: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

function ExecutiveCard({
  exec,
  isSelected,
  onClick,
}: {
  exec: Executive;
  isSelected: boolean;
  onClick: () => void;
}) {
  const gradient = ROLE_COLORS[exec.role] || 'from-slate-600 to-gray-700';
  const icon = ROLE_ICONS[exec.role] || '🤖';
  const modelBadge = exec.agent?.preferredModel
    ? MODEL_BADGE[exec.agent.preferredModel] || MODEL_BADGE.LITE
    : MODEL_BADGE.LITE;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-right rounded-xl border transition-all duration-200 p-4 cursor-pointer group ${
        isSelected
          ? 'border-white/40 bg-white/10 shadow-xl scale-[1.02]'
          : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
      }`}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-10`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {exec.agent?.preferredModel && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${modelBadge}`}>
                {exec.agent.preferredModel}
              </span>
            )}
            <span className="text-xs text-white/40 font-mono">{exec.role}</span>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="font-bold text-white text-sm">{exec.nameAr}</h3>
        <p className="text-white/50 text-xs mt-0.5">{exec.titleAr}</p>
        <p className="text-white/40 text-xs mt-2 line-clamp-2">{exec.mandate}</p>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-white/30">{exec.directReports.length} تقرير مباشر</span>
        </div>
      </div>
    </button>
  );
}

function DepartmentPanel({ dept }: { dept: Department }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-right hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
            {dept.agentCount} وكيل
          </span>
          {expanded ? (
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        <h4 className="font-semibold text-white text-sm">{dept.nameAr}</h4>
      </button>
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-2">
          {dept.agents.map(agent => (
            <div key={agent.id} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
              <div className="text-right">
                <p className="text-white/80 text-xs font-medium">{agent.displayNameAr}</p>
                <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{agent.description}</p>
              </div>
            </div>
          ))}
          <div className="mt-3 flex flex-wrap gap-1 justify-end">
            {dept.capabilities.map(cap => (
              <span key={cap} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                {cap.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrgChart() {
  const [data, setData] = useState<OrgChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExec, setSelectedExec] = useState<Executive | null>(null);

  useEffect(() => {
    fetch('/api/org-chart')
      .then(r => r.json())
      .then(d => {
        setData(d);
        const ceo = d.executives.find((e: Executive) => e.role === 'CEO');
        if (ceo) setSelectedExec(ceo);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-white/40 text-sm">جارٍ تحميل الهيكل التنظيمي...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/40 text-sm">تعذّر تحميل البيانات</div>
      </div>
    );
  }

  const ceo = data.executives.find(e => e.role === 'CEO');
  const csuite = data.executives.filter(e => e.escalatesTo === 'CEO');

  return (
    <div className="space-y-8" dir="rtl">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'مديرون تنفيذيون', value: data.stats.totalExecutives, icon: '👤' },
          { label: 'أقسام', value: data.stats.totalDepartments, icon: '🏢' },
          { label: 'وكلاء ذكاء اصطناعي', value: data.stats.totalAgents, icon: '🤖' },
          { label: 'تقارير مباشرة للـ CEO', value: data.stats.csuiteDirect, icon: '📊' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CEO at top */}
      {ceo && (
        <div>
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
            القيادة العليا
          </h3>
          <div className="max-w-sm mx-auto">
            <ExecutiveCard
              exec={ceo}
              isSelected={selectedExec?.role === ceo.role}
              onClick={() => setSelectedExec(selectedExec?.role === ceo.role ? null : ceo)}
            />
          </div>
          {/* Connector line */}
          <div className="flex justify-center mt-2">
            <div className="w-px h-6 bg-white/10" />
          </div>
        </div>
      )}

      {/* C-Suite Layer */}
      <div>
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
          الفريق التنفيذي C-Suite
        </h3>
        {/* Horizontal connector */}
        <div className="hidden lg:flex justify-center mb-2">
          <div className="h-px bg-white/10 w-5/6" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {csuite.map(exec => (
            <ExecutiveCard
              key={exec.role}
              exec={exec}
              isSelected={selectedExec?.role === exec.role}
              onClick={() => setSelectedExec(selectedExec?.role === exec.role ? null : exec)}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel for selected executive */}
      {selectedExec && (
        <div className="border border-white/20 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={() => setSelectedExec(null)}
              className="text-white/40 hover:text-white/70 transition-colors text-xs"
            >
              ✕ إغلاق
            </button>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <h3 className="text-lg font-bold text-white">{selectedExec.nameAr}</h3>
                <span className="text-2xl">{ROLE_ICONS[selectedExec.role] || '🤖'}</span>
              </div>
              <p className="text-white/50 text-sm">{selectedExec.titleAr}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">المهمة</h4>
              <p className="text-white/70 text-sm">{selectedExec.mandate}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">مؤشرات الأداء (KPIs)</h4>
              <ul className="space-y-1">
                {selectedExec.kpis.map(kpi => (
                  <li key={kpi} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />
                    {kpi}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {selectedExec.directReports.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                التقارير المباشرة ({selectedExec.directReports.length})
              </h4>
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedExec.directReports.map(report => (
                  <span
                    key={report}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60 border border-white/10"
                  >
                    {report}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Departments Layer */}
      <div>
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">
          الأقسام والوكلاء المتخصصون
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.departments.map(dept => (
            <DepartmentPanel key={dept.id} dept={dept} />
          ))}
        </div>
      </div>
    </div>
  );
}
