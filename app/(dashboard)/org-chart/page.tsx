'use client';

import { AppShell } from '@/components/layout/AppShell';
import { OrgChart } from '@/components/dashboard/OrgChart';

export default function OrgChartPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* Header */}
        <div className="mb-8 text-right">
          <div className="flex items-center gap-3 justify-end mb-2">
            <h1 className="text-2xl font-bold text-white">الهيكل التنظيمي</h1>
            <span className="text-3xl">🏢</span>
          </div>
          <p className="text-white/50 text-sm">
            فريق كلميرون التنفيذي الذكي — مبني على هيكل الشركات العالمية الكبرى
          </p>
          <div className="mt-3 flex items-center gap-2 justify-end">
            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              C-Suite AI Agents
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Enterprise Architecture
            </span>
          </div>
        </div>

        {/* Org Chart Component */}
        <OrgChart />
      </div>
    </AppShell>
  );
}
