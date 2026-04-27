// @ts-nocheck
/**
 * Smart Tools — قدرات مشتركة تجعل أي وكيل "ذكياً" مثل Claude.
 *
 * يحصل كل منسّق قسم على هذه الأدوات بالإضافة لأدوات قسمه المتخصصة:
 *   - web_search       : بحث الويب الحي مع توثيق المصادر (Gemini grounding)
 *   - calculate        : حساب رياضي دقيق (يتجنّب أخطاء LLM في الأرقام)
 *   - current_time     : الوقت الآن بتوقيت القاهرة
 *   - read_pdf         : قراءة PDF عبر pdf-worker الداخلي
 *   - analyze_image    : تحليل صورة عبر Gemini multimodal (logos, ad creatives)
 *   - record_thought   : تسجيل سلسلة استنتاج قبل التنفيذ (Chain-of-Thought)
 *   - self_critique    : مراجعة الخطة قبل تقديمها للمؤسّس
 *   - suggest_followups: اقتراح خطوات تالية استباقية
 *   - ask_founder      : طلب توضيح من المؤسّس عند عدم اليقين
 */
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { webSearch } from '@/src/lib/integrations/web-search';
import { adminDb } from '@/src/lib/firebase-admin';

const PDF_WORKER_URL = process.env.PDF_WORKER_URL || 'http://localhost:8000';

export function smartTools() {
  return {
    web_search: {
      description:
        'يبحث في الويب عن معلومات حديثة (أسعار، أخبار، منافسين، تنظيمات) ويرجع المصادر. استخدمها قبل أي ادّعاء حقائقي.',
      parameters: z.object({
        query: z.string().min(2).max(500).describe('سؤال البحث بالعربية أو الإنجليزية'),
        maxResults: z.number().int().min(1).max(10).default(5),
      }),
      execute: async ({ query, maxResults }: { query: string; maxResults: number }) => {
        const r = await webSearch(query, { maxResults });
        return {
          ok: r.ok,
          source: r.source,
          summary: r.answer || null,
          citations: r.citations,
          tip:
            r.source === 'duckduckgo'
              ? 'بحث محدود — اذكر للمؤسّس أن الإجابة قد تكون غير دقيقة وتحتاج تحقّقاً.'
              : null,
        };
      },
    },

    calculate: {
      description:
        'حساب رياضي دقيق (جمع، طرح، ضرب، قسمة، نسب مئوية، أُسس). استخدمها لأي حساب مالي أو إحصائي بدلاً من التقدير.',
      parameters: z.object({
        expression: z
          .string()
          .min(1)
          .max(500)
          .describe('تعبير JavaScript آمن، مثلاً: (12000*1.14) - (3000*0.10)'),
      }),
      execute: ({ expression }: { expression: string }) => {
        // Whitelist-only safe eval
        if (!/^[0-9+\-*/().,\s%eE_]+$/.test(expression)) {
          return { ok: false, error: 'expression_contains_disallowed_characters' };
        }
        try {
          // eslint-disable-next-line no-new-func
          const v = Function('"use strict";return (' + expression.replace(/,/g, '') + ')')();
          if (typeof v !== 'number' || !Number.isFinite(v)) {
            return { ok: false, error: 'non_finite_result' };
          }
          return { ok: true, expression, result: v };
        } catch (e: unknown) {
          return { ok: false, error: (e as Error)?.message || 'eval_failed' };
        }
      },
    },

    current_time: {
      description: 'يرجع الوقت الحالي بتوقيت القاهرة (Africa/Cairo). استخدمها قبل أي ادّعاء عن "اليوم" أو "الأسبوع".',
      parameters: z.object({}),
      execute: () => {
        const d = new Date();
        const cairo = new Intl.DateTimeFormat('ar-EG', {
          timeZone: 'Africa/Cairo',
          dateStyle: 'full',
          timeStyle: 'medium',
        }).format(d);
        return {
          isoUtc: d.toISOString(),
          cairoLocal: cairo,
          unixMs: d.getTime(),
        };
      },
    },

    read_pdf: {
      description: 'يستخرج النص من ملف PDF (عبر رابط URL). استخدمها لقراءة عقود، فواتير، تقارير، CVs.',
      parameters: z.object({
        url: z.string().url().describe('رابط مباشر لملف PDF'),
        maxChars: z.number().int().min(500).max(50000).default(10000),
      }),
      execute: async ({ url, maxChars }: { url: string; maxChars: number }) => {
        try {
          const r = await fetch(`${PDF_WORKER_URL}/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          if (!r.ok) return { ok: false, error: `pdf_worker_${r.status}` };
          const j = await r.json();
          const text = String(j.text || '').slice(0, maxChars);
          return { ok: true, text, truncated: (j.text || '').length > maxChars };
        } catch (e: unknown) {
          return { ok: false, error: (e as Error)?.message || 'pdf_read_failed' };
        }
      },
    },

    analyze_image: {
      description:
        'يحلّل صورة (إعلان، شعار، شاشة، صورة منتج) ويصفها. مفيد لمراجعة creative قبل النشر، أو لقراءة لقطة شاشة.',
      parameters: z.object({
        imageUrl: z.string().url(),
        question: z.string().min(2).max(500).describe('ما الذي تريد معرفته عن الصورة؟'),
      }),
      execute: async ({ imageUrl, question }: { imageUrl: string; question: string }) => {
        const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!key) return { ok: false, error: 'no_gemini_key' };
        try {
          const imgRes = await fetch(imageUrl);
          const buf = Buffer.from(await imgRes.arrayBuffer());
          const mime = imgRes.headers.get('content-type') || 'image/jpeg';
          const ai = new GoogleGenAI({ apiKey: key });
          const r = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              { role: 'user', parts: [
                { inlineData: { mimeType: mime, data: buf.toString('base64') } },
                { text: question },
              ]},
            ],
          });
          const text =
            (r as { text?: string }).text ||
            (r as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0]?.content?.parts
              ?.map((p) => p.text || '')
              .join('\n') ||
            '';
          return { ok: true, analysis: text };
        } catch (e: unknown) {
          return { ok: false, error: (e as Error)?.message || 'vision_failed' };
        }
      },
    },

    record_thought: {
      description:
        'تسجّل خطوة استدلال داخلية قبل التنفيذ (Chain-of-Thought). استخدمها قبل أي إجراء يتطلّب موافقة المؤسّس.',
      parameters: z.object({
        step: z.string().min(5).max(2000),
        confidence: z.number().min(0).max(1).default(0.7),
      }),
      execute: async ({ step, confidence }, ctx) => {
        if (adminDb?.collection && ctx?.userId) {
          await adminDb
            .collection('agent_thoughts')
            .add({
              userId: ctx.userId,
              agentId: ctx.agentId || 'unknown',
              step,
              confidence,
              at: new Date(),
            })
            .catch(() => {});
        }
        return { ok: true, recorded: step, confidence };
      },
    },

    self_critique: {
      description:
        'مراجعة ذاتية لخطّتك قبل تقديمها للمؤسّس. اذكر مخاطر، افتراضات غير مؤكّدة، وبدائل. لا تتخطّى هذه الخطوة قبل طلب موافقة على إجراء مكلف.',
      parameters: z.object({
        plan: z.string().min(20).max(4000),
        risks: z.array(z.string()).max(10),
        assumptions: z.array(z.string()).max(10),
        alternatives: z.array(z.string()).max(5).optional(),
      }),
      execute: async (input, ctx) => {
        if (adminDb?.collection && ctx?.userId) {
          await adminDb
            .collection('agent_critiques')
            .add({ userId: ctx.userId, agentId: ctx.agentId || 'unknown', ...input, at: new Date() })
            .catch(() => {});
        }
        return { ok: true, critique: input };
      },
    },

    suggest_followups: {
      description:
        'يقترح خطوات تالية استباقية للمؤسّس بعد إنجاز مهمة. أعطِ بين 2-4 اقتراحات محدّدة وقابلة للتنفيذ.',
      parameters: z.object({
        items: z
          .array(
            z.object({
              title: z.string().min(3).max(120),
              why: z.string().min(5).max(300),
              suggestedActionId: z.string().optional(),
            }),
          )
          .min(1)
          .max(5),
      }),
      execute: async ({ items }, ctx) => {
        if (adminDb?.collection && ctx?.userId) {
          await adminDb
            .collection('agent_followups')
            .add({ userId: ctx.userId, agentId: ctx.agentId || 'unknown', items, at: new Date() })
            .catch(() => {});
        }
        return { ok: true, followups: items };
      },
    },

    ask_founder: {
      description:
        'استخدمها فقط عند عدم اليقين الجوهري — تسأل المؤسّس سؤالاً مباشراً قبل المتابعة. لا تستخدمها للتفاصيل التافهة.',
      parameters: z.object({
        question: z.string().min(5).max(500),
        options: z.array(z.string().min(1).max(120)).max(5).optional(),
        urgency: z.enum(['low', 'medium', 'high']).default('medium'),
      }),
      execute: async (input, ctx) => {
        if (!adminDb?.collection || !ctx?.userId) return { ok: false, error: 'no_context' };
        const ref = await adminDb.collection('agent_questions').add({
          userId: ctx.userId,
          agentId: ctx.agentId || 'unknown',
          ...input,
          status: 'open',
          askedAt: new Date(),
        });
        return { ok: true, questionId: ref.id, status: 'awaiting_founder' };
      },
    },
  };
}

/**
 * Smart instructions appended to every smart agent's system prompt.
 * These guide the agent to use the smart tools in a Claude-like way.
 */
export const SMART_AGENT_GUIDELINES = `
🧠 منهج العمل الذكي (إلزامي):
1. **فكّر قبل أن تنفّذ**: لأي إجراء غير بديهي، استدعِ \`record_thought\` لتسجيل خطوة استنتاجك.
2. **ابحث قبل أن تدّعي**: إذا احتجت معلومة عن السوق، أسعار، تنظيمات، منافسين، أو أخبار — استدعِ \`web_search\` ولا تخمّن.
3. **احسب لا تقدّر**: لأي حساب مالي/رياضي استدعِ \`calculate\` لتجنّب الأخطاء الرقمية.
4. **اعرف الوقت الفعلي**: قبل أي قرار حسّاس للوقت استدعِ \`current_time\`.
5. **اقرأ المستندات**: إذا أرسل المؤسّس ملف PDF أو صورة، استخدم \`read_pdf\` أو \`analyze_image\`.
6. **انقد نفسك**: قبل تقديم خطة مكلفة (إجراء يحتاج موافقة)، استدعِ \`self_critique\` واذكر المخاطر والافتراضات والبدائل.
7. **اقترح الخطوة التالية**: بعد كل إنجاز، استدعِ \`suggest_followups\` بـ 2-4 اقتراحات محدّدة.
8. **اسأل عند الشك**: لو أمر جوهري غير واضح استخدم \`ask_founder\` — لا تخمّن في القرارات الكبيرة.

📐 معايير الجودة:
- اذكر **مستوى ثقتك** (مرتفعة/متوسطة/منخفضة) في كل توصية.
- **اذكر المصادر** عند الاستناد لمعلومة من \`web_search\`.
- **بالعربية الفصحى البسيطة** أو العامية المصرية حسب أسلوب المؤسّس.
- **مختصر ومباشر** — لا تثرثر، لا تكرّر.
- إذا الإجراء يكلّف فلوس أو يلزم الشركة قانونياً، **افترض دائماً أنه يحتاج موافقة**.
`;
