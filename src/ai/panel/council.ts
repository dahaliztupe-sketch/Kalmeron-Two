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
import { routePanelHybrid } from './router-cache';
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
  /**
   * نمط الاستجابة:
   *   - `'deep'`  (افتراضي) — يشغّل الـ Router + المجلس الكامل (تداول 4-5 خبراء).
   *   - `'fast'` — يتخطّى الـ Router ويستدعي PRO استدعاءً واحداً بدون تشكيل
   *     كامل للروستر، بزمن استجابة أقصر بكثير وتكلفة أقل، مناسب للأسئلة
   *     السريعة أو المتابعات. يستخدم نفس المخرج الموحّد (5 أقسام) لضمان توافق
   *     واجهات العرض.
   */
  mode?: 'fast' | 'deep';
}

const FAST_MODE_ROSTER =
  '- مهندس السياق\n- المحلل الناقد\n- مدقق الجودة\n- المراجع الأخلاقي';

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
  const mode = input.mode ?? 'deep';

  // Fast mode: skip the router (saves ~ 600-1200ms + 1 LITE call) and run the
  // PRO model directly with the four permanent experts only. Same JSON
  // schema → renderer-compatible.
  let routeDomain: string;
  let routeRationale: string;
  let routeExperts: string[];
  let roster: string;
  if (mode === 'fast') {
    routeDomain = 'mixed';
    routeRationale = 'النمط السريع — تخطّي التوجيه الداخلي.';
    routeExperts = ['context-engineer', 'critical-analyst', 'quality-auditor', 'ethics-reviewer'];
    roster = FAST_MODE_ROSTER;
  } else {
    const route = await routePanelHybrid(input.agentName, input.userMessage, input.uiContext);
    routeDomain = route.domain;
    routeRationale = route.rationale;
    routeExperts = route.experts;
    roster = buildPanelRoster(route.experts);
  }
  const system = COUNCIL_SYSTEM_INTRO(input.agentRoleAr, roster, input.draft);

  const prompt = `سياق الواجهة: ${JSON.stringify(input.uiContext || {})}
رسالة المستخدم: ${input.userMessage}

تصنيف المجلس الداخلي:
- المجال: ${routeDomain}
- مبرر التصنيف: ${routeRationale}
- الخبراء المتخصصون المُفعّلون: ${routeExperts.join('، ')}
- النمط: ${mode === 'fast' ? 'سريع (4 دائمين فقط، استدعاء مختصر)' : 'عميق (مجلس كامل)'}

ابدأ التداول وأخرج JSON مطابقاً للـ Schema المطلوب فقط.`;

  const { result } = await safeGenerateObject(
    {
      model: MODELS.PRO,
      system,
      prompt,
      schema: CouncilOutputSchema,
      // Fail fast on capacity errors so the gateway's PRO→FLASH→LITE cascade
      // can take over without burning seconds on the AI-SDK's internal
      // retry/back-off (which compounds 429s during quota exhaustion).
      maxRetries: 0,
    },
    {
      agent: `${input.agentName}:council:${mode}`,
      userId: input.userId,
      softCostBudgetUsd:
        input.softCostBudgetUsd ?? (mode === 'fast' ? 0.02 : 0.05),
    },
  );

  const output = result.object as CouncilOutput;
  const meta: CouncilMeta = {
    domain: routeDomain as PanelDomain,
    experts: routeExperts,
    routeRationale: routeRationale,
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

  const optionsTable =
    out.options && out.options.length >= 2
      ? `\n\n#### 🔍 جدول مقارنة سريع\n\n| الخيار | أهم ميزة | أهم مخاطرة |\n|---|---|---|\n` +
        out.options
          .map(
            (opt) =>
              `| ${opt.title} | ${opt.pros?.[0] || '—'} | ${opt.cons?.[0] || '—'} |`,
          )
          .join('\n')
      : '';

  const stepsBlock = out.implementationSteps
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');

  const quickActions =
    out.implementationSteps && out.implementationSteps.length > 0
      ? `\n\n### ⚡ إجراءات سريعة\n\`\`\`kalmeron-actions\n${JSON.stringify(
          {
            type: 'quick_actions',
            actions: out.implementationSteps.slice(0, 3).map((step, i) => ({
              id: `step_${i + 1}`,
              label: step.length > 80 ? step.slice(0, 77) + '…' : step,
              kind: 'next_step',
            })),
          },
          null,
          2,
        )}\n\`\`\``
      : '';

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
    `### 2) الخيارات الاستراتيجية\n${optionsBlock}${optionsTable}\n\n` +
    `### 3) التوصية النهائية\n> 💡 ${out.recommendation}\n\n` +
    `### 4) مستوى الثقة\n**${out.confidence}%**\n\n` +
    `### 5) خطوات التنفيذ\n${stepsBlock}` +
    quickActions +
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
