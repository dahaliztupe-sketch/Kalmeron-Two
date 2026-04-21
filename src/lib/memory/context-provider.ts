// @ts-nocheck
  /**
   * Context Provider — يوفّر سياق التوأم الرقمي لجميع الوكلاء.
   */
  import { getTwin, type CompanyTwin } from './shared-memory';

  export async function getAgentContext(userId: string): Promise<{
    twin: CompanyTwin;
    contextSummary: string;
  }> {
    const twin = await getTwin(userId);
    const contextSummary = [
      twin.companyName ? `الشركة: ${twin.companyName}` : null,
      twin.industry ? `القطاع: ${twin.industry}` : null,
      twin.stage ? `المرحلة: ${twin.stage}` : null,
      twin.facts.length ? `حقائق: ${twin.facts.slice(-10).join(' | ')}` : null,
      twin.currentGoals.length ? `الأهداف الحالية: ${twin.currentGoals.join(', ')}` : null,
    ].filter(Boolean).join('\n');
    return { twin, contextSummary };
  }
  