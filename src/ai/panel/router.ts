// @ts-nocheck
import { z } from 'zod';
import { MODELS } from '@/src/lib/gemini';
import { safeGenerateObject } from '@/src/lib/llm/gateway';
import {
  PanelRouteSchema,
  type PanelRoute,
  type PanelDomain,
} from './types';
import {
  PERMANENT_EXPERTS,
  SPECIALIZED_PANELS,
  MIXED_DEFAULT_EXPERT_IDS,
  ALL_EXPERTS,
} from './experts';

const ROUTER_SYSTEM = `أنت موجّه (Router) داخل "مجلس الإدارة الافتراضي" لكل وكيل في كلميرون.
مهمتك: تصنيف نوع المهمة، واختيار 3-4 خبراء متخصصين فقط — لا أكثر — حتى نحافظ على كفاءة استهلاك الرموز.

المجالات الممكنة:
- strategic: قرارات أعمال، استراتيجية، نمو، تمويل، نمذجة مالية، إدارة مخاطر.
- technical: معمارية، تطوير، أمان، DevOps، تجربة مستخدم.
- marketing: محتوى، إعلانات، علامة تجارية، مبيعات، تحليلات تسويقية.
- mixed: عند تداخل أكثر من مجال بشكل لا يمكن فصله.

اختر معرفات الخبراء (experts) من القائمة المتاحة فقط. أعطِ سبباً مختصراً (rationale) لاختيارك بالعربية.`;

function expertCatalog(): string {
  const lines: string[] = [];
  for (const [domain, panel] of Object.entries(SPECIALIZED_PANELS)) {
    lines.push(`\n### ${domain}`);
    for (const e of Object.values(panel)) {
      lines.push(`- ${e.id} — ${e.nameAr}: ${e.roleAr}`);
    }
  }
  return lines.join('\n');
}

/**
 * يصنّف الطلب ويحدد لوحة الخبراء المتخصصين المطلوبة.
 *  - يستخدم نموذج LITE لتقليل التكلفة.
 *  - يقصّ القائمة إلى 3-4 معرفات صالحة فقط.
 */
export async function routePanel(
  agentName: string,
  userMessage: string,
  uiContext?: unknown,
): Promise<PanelRoute> {
  const prompt = `الوكيل المُستهدف: ${agentName}
سياق الواجهة: ${JSON.stringify(uiContext || {})}
رسالة المستخدم: ${userMessage}

كتالوج الخبراء المتاحين:${expertCatalog()}

أرجع JSON بالحقول: domain, rationale, experts (3-4 معرفات).`;

  try {
    const { result } = await safeGenerateObject(
      {
        model: MODELS.LITE,
        system: ROUTER_SYSTEM,
        prompt,
        schema: PanelRouteSchema,
      },
      { agent: `${agentName}:panel-router`, softCostBudgetUsd: 0.005 },
    );

    const route = result.object;
    // تنقية: استبعد أي معرف ليس في القائمة المتاحة، وقص إلى 4.
    const cleanedExperts = route.experts
      .filter((id) => SPECIALIZED_PANELS[route.domain]?.[id] || ALL_EXPERTS[id])
      .slice(0, 4);

    if (cleanedExperts.length < 2) {
      return fallbackRoute();
    }

    return { ...route, experts: cleanedExperts };
  } catch (e) {
    return fallbackRoute();
  }
}

function fallbackRoute(): PanelRoute {
  return {
    domain: 'mixed',
    rationale: 'تعذّر التصنيف الذكي — تم تفعيل لوحة افتراضية متوازنة.',
    experts: [...MIXED_DEFAULT_EXPERT_IDS],
  };
}

/**
 * يبني وصف الخبراء (الدائمين + المختارين) ليُحقن في system prompt للمجلس.
 */
export function buildPanelRoster(experts: string[]): string {
  const permanentLines = Object.values(PERMANENT_EXPERTS).map(
    (e) => `- **${e.nameAr}** (${e.id}): ${e.systemAr}`,
  );
  const specializedLines = experts
    .map((id) => ALL_EXPERTS[id])
    .filter(Boolean)
    .map((e) => `- **${e!.nameAr}** (${e!.id}): ${e!.systemAr}`);

  return `الخبراء الدائمون (يعملون في خلفية كل قرار):
${permanentLines.join('\n')}

الخبراء المتخصصون لهذه المهمة:
${specializedLines.join('\n')}`;
}

export function isValidDomain(d: unknown): d is PanelDomain {
  return d === 'strategic' || d === 'technical' || d === 'marketing' || d === 'mixed';
}
