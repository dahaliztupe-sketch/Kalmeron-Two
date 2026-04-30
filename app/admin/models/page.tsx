import type { Metadata } from 'next';
import {
  listAvailableProviders,
  type ProviderId,
} from '@/src/lib/llm/providers';
import { getCircuitSnapshot } from '@/src/lib/llm/circuit-breaker';
import { getLlmCacheStats } from '@/src/lib/llm/llm-response-cache';
import { getBudgetSnapshot } from '@/src/lib/llm/budget';
import { getCostByModel } from '@/src/lib/llm/gateway';
import ModelsClient from './_client';

export const metadata: Metadata = {
  title: 'مزودو الـ LLM',
  description: 'لوحة التحكم في مزودي النماذج اللغوية: التوفر، التكلفة، الأداء، الـ circuit breakers.',
};

// Server component — pulls fresh in-process state on every request. Wrapped
// in a client renderer to allow auto-refresh without a full reload.
export default async function ModelsAdminPage() {
  const enabled: ProviderId[] = listAvailableProviders();
  const circuits = getCircuitSnapshot();
  const cache = getLlmCacheStats();
  const budgets = getBudgetSnapshot();
  const costs = getCostByModel();

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold mb-1">مزودو الـ LLM</h1>
        <p className="text-sm text-muted-foreground">
          حالة المزودين النشطين وأداء النماذج وميزانياتها.
        </p>
      </header>
      <ModelsClient
        enabled={enabled}
        circuits={circuits}
        cache={cache}
        budgets={budgets}
        costs={costs}
      />
    </div>
  );
}
