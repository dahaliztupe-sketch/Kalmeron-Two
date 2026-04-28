// @ts-nocheck
/**
 * judge — Reflexion / LLM-as-judge layer (Phase B6).
 *
 * After the council produces a draft Markdown answer, we ask a cheap LITE
 * call to score it on five axes (0–100) + flag concrete issues. If the
 * minimum axis falls below the configured threshold, we fire one refine
 * pass with the critique appended to the prompt.
 *
 * Disabled by default — flip the env flag `KALMERON_REFLEXION=on` to
 * activate. We keep it opt-in because the extra LITE call adds ~600ms p50
 * and a small token-cost premium. In automated regression we just want to
 * verify the *delta*: with reflexion on, judge-score on a sample of 5
 * prompts should improve on at least 3 of them.
 */

import { z } from 'zod';
import { MODELS } from '@/src/lib/gemini';
import { safeGenerateObject } from '@/src/lib/llm/gateway';

export const JudgeScoreSchema = z.object({
  clarity: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  actionability: z.number().min(0).max(100),
  arabicQuality: z.number().min(0).max(100),
  issues: z.array(z.string()).max(8).default([]),
  shouldRefine: z.boolean().default(false),
});

export type JudgeScore = z.infer<typeof JudgeScoreSchema>;

const JUDGE_SYSTEM = `أنت مدقق جودة صارم لمخرجات وكلاء كلميرون.
قيّم النص أدناه على خمسة محاور (0-100) بناءً على معايير صارمة:
- clarity: وضوح اللغة والبنية.
- accuracy: دقة الأرقام/الادعاءات في السياق المصري.
- completeness: تغطية الجوانب المهمة دون قفزات منطقية.
- actionability: وجود خطوات قابلة للتنفيذ مرقمة.
- arabicQuality: سلامة العربية الفصحى المعاصرة (لا أخطاء نحوية، لا ركاكة).

سجّل في issues أهم العيوب الملموسة كنقاط قصيرة (≤ 12 كلمة).
ضع shouldRefine=true إذا كان أي محور < 70 أو إذا رصدت خطأ جوهرياً.
أعد JSON فقط دون أي تعليقات خارجية.`;

export async function judgeDraft(args: {
  agentName: string;
  userMessage: string;
  draftMarkdown: string;
  userId?: string;
}): Promise<JudgeScore | null> {
  try {
    const prompt = `سؤال المستخدم: ${args.userMessage}\n\nمسوّدة الوكيل (${args.agentName}):\n"""\n${args.draftMarkdown.slice(0, 6000)}\n"""\n\nقم بالتقييم الآن.`;
    const { result } = await safeGenerateObject(
      {
        model: MODELS.LITE,
        system: JUDGE_SYSTEM,
        prompt,
        schema: JudgeScoreSchema,
        maxRetries: 0,
      },
      {
        agent: `${args.agentName}:judge`,
        userId: args.userId,
        softCostBudgetUsd: 0.005,
      },
    );
    return result.object as JudgeScore;
  } catch {
    return null;
  }
}

/**
 * Average score across the 5 numeric axes — useful for A/B reporting.
 */
export function judgeOverall(s: JudgeScore | null | undefined): number {
  if (!s) return 0;
  return Math.round(
    (s.clarity + s.accuracy + s.completeness + s.actionability + s.arabicQuality) / 5,
  );
}

/**
 * Build a critique block to append to the council prompt for a refine pass.
 */
export function buildRefinementInstruction(score: JudgeScore): string {
  const issuesBlock = score.issues.length
    ? `\nالعيوب المرصودة:\n${score.issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`
    : '';
  return `
ملاحظة مدقق الجودة (نتائج التقييم على المسوّدة السابقة):
- الوضوح: ${score.clarity} | الدقة: ${score.accuracy} | الاكتمال: ${score.completeness} | قابلية التنفيذ: ${score.actionability} | جودة العربية: ${score.arabicQuality}${issuesBlock}

أعد توليد إجابة محسّنة تعالج هذه العيوب صراحةً، مع الالتزام بنفس الـ Schema.`;
}

export const REFLEXION_ENABLED = (() => {
  const v = (process.env.KALMERON_REFLEXION || '').toLowerCase();
  return v === 'on' || v === '1' || v === 'true';
})();
