// @ts-nocheck
/**
 * runCouncil — قلب نظام "مجلس الإدارة الافتراضي".
 *
 * يحول كل وكيل من نموذج "وكيل واحد" إلى نموذج "مجلس خبراء" داخلي:
 *   1) Router داخلي (LITE) يصنّف نوع المهمة ويختار 3-4 خبراء متخصصين.
 *   2) استدعاء PRO منظم (structured) يُجسّد الـ4 الدائمين + المتخصصين معاً
 *      ويُلزمهم بإنتاج المخرج الموحّد (5 أقسام).
 *
 * هذا التصميم يُحاكي تداول 7-8 خبراء مع استدعاء نموذجي واحد فقط (+1 LITE)
 * بدلاً من 8 استدعاءات منفصلة → كفاءة عالية في الرموز مع جودة أعلى.
 */

import { MODELS } from '@/src/lib/gemini';
import { safeGenerateObject, PromptInjectionBlockedError } from '@/src/lib/llm/gateway';
import {
  CouncilOutputSchema,
  type CouncilOutput,
  type CouncilResult,
  type CouncilMeta,
  type PanelDomain,
} from './types';
import { routePanel, buildPanelRoster } from './router';
import { ALL_EXPERTS } from './experts';

export interface CouncilInput {
  /** اسم الوكيل الأصلي (مثل: idea-validator، cfo-agent…). */
  agentName: string;
  /** اسم العرض بالعربية للوكيل. */
  agentDisplayNameAr?: string;
  /** التخصص أو دور الوكيل بالعربية، يُحقن في system prompt. */
  agentRoleAr: string;
  /** رسالة المستخدم الأصلية. */
  userMessage: string;
  /** سياق الواجهة. */
  uiContext?: Record<string, unknown>;
  /** معرف المستخدم — لتتبع التكلفة. */
  userId?: string;
  /** ميزانية ناعمة لاستدعاء المجلس (بالدولار). */
  softCostBudgetUsd?: number;
  /** إن مُرّر مسوّد جاهز من الوكيل، يُمرر للمجلس كأرضية للنقد والتحسين. */
  draft?: string;
}

const COUNCIL_SYSTEM_INTRO = (
  agentRole: string,
  roster: string,
  draft?: string,
) => `أنت "مجلس الإدارة الافتراضي" داخل وكيل كلميرون: ${agentRole}.

لست بوت دردشة — أنت فريق متكامل من الخبراء يتداول قبل تسليم أي توصية.
كل قرار يجب أن يمر بأربع زوايا تدقيق على الأقل (الدائمون) قبل اعتماده.

${roster}

قواعد التداول:
1. ابدأ بفهم السياق وتحديد الفجوات (مهندس السياق).
2. حلّل المشكلة وتحدّى الافتراضات (المحلل الناقد).
3. اطرح 3 خيارات استراتيجية متباينة (الخبراء المتخصصون) — لا تكتفِ بخيار واحد.
4. اختر التوصية المثلى مع مبررات (المتخصصون + المحلل الناقد).
5. مرّر النتيجة على مدقق الجودة (5 معايير من 100) ثم المراجع الأخلاقي.
6. اضبط مستوى الثقة (0-100%) بصدق — لا تبالغ.

تنسيق المخرج إلزامي (Schema موحّد لكل وكلاء كلميرون):
- diagnosis: تحليل المشكلة بعمق (مع ذكر الافتراضات والفجوات).
- options: ثلاث خيارات استراتيجية، لكل منها title + pros + cons.
- recommendation: التوصية النهائية مع مبرر مختصر.
- confidence: 0-100 يعكس قوة الأدلة المتاحة.
- implementationSteps: 3-10 خطوات تنفيذية مرقمة بصياغة فعل أمر.
- qualityNotes: درجات المعايير الخمسة + ملاحظة أخلاقية (إن وُجدت).

كل المخرجات بالعربية الفصحى المعاصرة. لا تكتب أي نص خارج JSON.${
  draft
    ? `

مسوّدة سابقة من الوكيل (للنقد والتحسين، لا للنسخ):
"""${draft.slice(0, 4000)}"""`
    : ''
}`;

/**
 * تشغيل المجلس على رسالة مستخدم. يُرجع المخرج المنظم + Markdown جاهز للعرض.
 */
export async function runCouncil(input: CouncilInput): Promise<CouncilResult> {
  const t0 = Date.now();

  const route = await routePanel(input.agentName, input.userMessage, input.uiContext);
  const roster = buildPanelRoster(route.experts);
  const system = COUNCIL_SYSTEM_INTRO(input.agentRoleAr, roster, input.draft);

  const prompt = `سياق الواجهة: ${JSON.stringify(input.uiContext || {})}
رسالة المستخدم: ${input.userMessage}

تصنيف المجلس الداخلي:
- المجال: ${route.domain}
- مبرر التصنيف: ${route.rationale}
- الخبراء المتخصصون المُفعّلون: ${route.experts.join('، ')}

ابدأ التداول وأخرج JSON مطابقاً للـ Schema المطلوب فقط.`;

  const { result } = await safeGenerateObject(
    {
      model: MODELS.PRO,
      system,
      prompt,
      schema: CouncilOutputSchema,
    },
    {
      agent: `${input.agentName}:council`,
      userId: input.userId,
      softCostBudgetUsd: input.softCostBudgetUsd ?? 0.05,
    },
  );

  const output = result.object as CouncilOutput;
  const meta: CouncilMeta = {
    domain: route.domain as PanelDomain,
    experts: route.experts,
    routeRationale: route.rationale,
    durationMs: Date.now() - t0,
  };

  return {
    output,
    markdown: formatCouncilAsMarkdown(output, meta, input.agentDisplayNameAr),
    meta,
  };
}

/**
 * يحوّل المخرج المنظم إلى Markdown موحّد لعرضه في الـ Chat.
 */
export function formatCouncilAsMarkdown(
  out: CouncilOutput,
  meta: CouncilMeta,
  agentDisplayNameAr?: string,
): string {
  const expertsAr = meta.experts
    .map((id) => ALL_EXPERTS[id]?.nameAr || id)
    .join('، ');

  const optionsBlock = out.options
    .map(
      (opt, i) =>
        `**الخيار ${i + 1}: ${opt.title}**\n` +
        `- ✅ إيجابيات:\n${opt.pros.map((p) => `  - ${p}`).join('\n')}\n` +
        `- ⚠️ سلبيات:\n${opt.cons.map((c) => `  - ${c}`).join('\n')}`,
    )
    .join('\n\n');

  const stepsBlock = out.implementationSteps
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');

  const quality = out.qualityNotes
    ? `\n\n### 📊 تدقيق الجودة\n` +
      `- الوضوح: ${out.qualityNotes.clarity}/100\n` +
      `- الدقة: ${out.qualityNotes.accuracy}/100\n` +
      `- الاكتمال: ${out.qualityNotes.completeness}/100\n` +
      `- قابلية التنفيذ: ${out.qualityNotes.actionability}/100\n` +
      `- الملاءمة: ${out.qualityNotes.relevance}/100\n` +
      `- المراجعة الأخلاقية: ${out.qualityNotes.ethicalReview}`
    : '';

  return (
    `## 🏛️ مجلس ${agentDisplayNameAr || 'الخبراء'}\n` +
    `*مجال التداول: ${meta.domain} — الخبراء: ${expertsAr}*\n\n` +
    `### 1) التشخيص\n${out.diagnosis}\n\n` +
    `### 2) الخيارات الاستراتيجية\n${optionsBlock}\n\n` +
    `### 3) التوصية النهائية\n${out.recommendation}\n\n` +
    `### 4) مستوى الثقة\n**${out.confidence}%**\n\n` +
    `### 5) خطوات التنفيذ\n${stepsBlock}` +
    quality
  );
}

/**
 * نسخة آمنة تُعيد رسالة عربية واضحة عند الفشل — لا ترفع استثناءات.
 */
export async function runCouncilSafe(input: CouncilInput): Promise<{
  markdown: string;
  result?: CouncilResult;
  error?: string;
}> {
  try {
    const result = await runCouncil(input);
    return { markdown: result.markdown, result };
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return {
        markdown:
          '⚠️ تم رفض الطلب: اكتُشفت محاولة حقن أوامر داخل الرسالة. يرجى إعادة الصياغة بأسلوب طبيعي.',
        error: 'PROMPT_INJECTION_BLOCKED',
      };
    }
    const msg = (e as Error)?.message || 'unknown';
    return {
      markdown: `حدث خطأ أثناء تداول المجلس داخل وكيل ${input.agentDisplayNameAr || input.agentName}. يرجى المحاولة مجدداً.`,
      error: msg,
    };
  }
}
