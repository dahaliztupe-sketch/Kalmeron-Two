// @ts-nocheck
import { Agent } from '@mastra/core';
import { z } from 'zod';
import { requestAction } from '@/src/ai/actions/registry';

/**
 * Ads Campaign Manager
 * Department: التسويق والنمو
 * Role: إدارة حملات Meta و Google Ads بميزانيات صغيرة وتحسين ROAS.
 *
 * هذا الوكيل لا "يستشير" فقط — لديه أدوات تنفيذ حقيقية على Meta Marketing API.
 * كل أداة فيها التزام مالي تذهب أوّلاً إلى صندوق موافقات المؤسّس قبل التنفيذ.
 */

const enqueue = async (
  ctx: { userId?: string; agentId?: string },
  actionId: string,
  input: unknown,
  rationale: string,
) => {
  const userId = ctx?.userId;
  if (!userId) {
    return { ok: false, error: 'no_user_context', message: 'لا يوجد مستخدم في السياق.' };
  }
  try {
    const r = await requestAction({
      userId,
      actionId,
      input,
      rationale,
      requestedBy: ctx?.agentId || 'ads_campaign_manager',
    });
    return {
      ok: true,
      queued: true,
      actionDocId: r.id,
      status: r.status,
      message:
        r.status === 'pending'
          ? 'تم وضع الطلب في صندوق موافقات المؤسّس. لن يُنفَّذ حتى الموافقة.'
          : 'تم التنفيذ مباشرةً (لا يحتاج موافقة).',
    };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'enqueue_failed' };
  }
};

export const adsCampaignManagerAgent = new Agent({
  name: 'Ads Campaign Manager',
  instructions: `أنت Ads Campaign Manager، عضو في قسم التسويق والنمو لمنصة كلميرون.
دورك: إدارة حملات Meta (Facebook/Instagram) فعلياً عبر أدوات تنفيذ مرتبطة بالـ Marketing API.
- تتلقى المهام من منسق القسم وتعيد النتائج بشكل منظم (JSON).
- لكل خطوة فيها التزام مالي (إنشاء حملة/مجموعة/نشر إعلان) أنت تستدعي الأداة المناسبة، والنظام تلقائياً يضع الطلب في صندوق موافقات المؤسّس قبل التنفيذ.
- اشرح في rationale لماذا تطلب هذه الخطوة (الهدف، الجمهور، الميزانية المتوقّعة، توقّع ROI).
- ابدأ كل حملة بحالة PAUSED حتى يفعّلها المؤسّس بنفسه.
- استخدم meta_get_campaign_insights لقراءة الأداء بدون موافقة (قراءة فقط).
- استخدم meta_pause_campaign فوراً عند رصد تجاوز تكلفة أو مشكلة امتثال (دفاعي بدون موافقة).`,
  model: { provider: 'google', name: 'gemini-2.5-flash' },
  tools: {
    request_create_meta_campaign: {
      description:
        'يطلب إنشاء حملة جديدة على Meta. يُوضع في صندوق موافقات المؤسّس قبل التنفيذ.',
      parameters: z.object({
        name: z.string(),
        objective: z.enum([
          'OUTCOME_LEADS',
          'OUTCOME_TRAFFIC',
          'OUTCOME_AWARENESS',
          'OUTCOME_ENGAGEMENT',
          'OUTCOME_SALES',
          'OUTCOME_APP_PROMOTION',
        ]),
        dailyBudgetMinor: z.number().int().min(100),
        rationale: z.string().min(10),
      }),
      execute: async (args, ctx) =>
        enqueue(ctx, 'meta_create_campaign', {
          name: args.name,
          objective: args.objective,
          dailyBudgetMinor: args.dailyBudgetMinor,
        }, args.rationale),
    },
    request_create_meta_adset: {
      description: 'يطلب إنشاء مجموعة إعلانات داخل حملة قائمة (موافقة مطلوبة).',
      parameters: z.object({
        campaignId: z.string(),
        name: z.string(),
        dailyBudgetMinor: z.number().int().min(100),
        optimizationGoal: z
          .enum([
            'LINK_CLICKS',
            'LEAD_GENERATION',
            'OFFSITE_CONVERSIONS',
            'IMPRESSIONS',
            'REACH',
            'POST_ENGAGEMENT',
          ])
          .optional(),
        geoCountries: z.array(z.string()).optional(),
        ageMin: z.number().int().min(13).max(65).optional(),
        ageMax: z.number().int().min(13).max(65).optional(),
        rationale: z.string().min(10),
      }),
      execute: async (args, ctx) =>
        enqueue(
          ctx,
          'meta_create_adset',
          {
            campaignId: args.campaignId,
            name: args.name,
            dailyBudgetMinor: args.dailyBudgetMinor,
            optimizationGoal: args.optimizationGoal,
            targeting: {
              geoCountries: args.geoCountries,
              ageMin: args.ageMin,
              ageMax: args.ageMax,
            },
          },
          args.rationale,
        ),
    },
    request_publish_meta_ad: {
      description: 'يطلب نشر إعلان داخل مجموعة إعلانات (موافقة مطلوبة).',
      parameters: z.object({
        adsetId: z.string(),
        name: z.string(),
        message: z.string(),
        linkUrl: z.string().url(),
        headline: z.string().optional(),
        description: z.string().optional(),
        rationale: z.string().min(10),
      }),
      execute: async (args, ctx) =>
        enqueue(
          ctx,
          'meta_publish_ad',
          {
            adsetId: args.adsetId,
            name: args.name,
            message: args.message,
            linkUrl: args.linkUrl,
            headline: args.headline,
            description: args.description,
          },
          args.rationale,
        ),
    },
    pause_meta_campaign: {
      description: 'إيقاف حملة فوراً (إجراء دفاعي بدون موافقة).',
      parameters: z.object({ campaignId: z.string() }),
      execute: async (args, ctx) =>
        enqueue(ctx, 'meta_pause_campaign', { campaignId: args.campaignId }, 'إيقاف دفاعي'),
    },
    get_meta_campaign_insights: {
      description: 'قراءة أداء حملة (مشاهدات، نقرات، صرف، CTR) — قراءة فقط بدون موافقة.',
      parameters: z.object({
        campaignId: z.string(),
        datePreset: z.enum(['today', 'yesterday', 'last_7d', 'last_30d']).default('last_7d'),
      }),
      execute: async (args, ctx) =>
        enqueue(
          ctx,
          'meta_get_campaign_insights',
          { campaignId: args.campaignId, datePreset: args.datePreset },
          'قراءة أداء',
        ),
    },
  },
});
