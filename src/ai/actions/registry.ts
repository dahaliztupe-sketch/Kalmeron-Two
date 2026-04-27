// @ts-nocheck
/**
 * Typed registry of side-effecting agent actions ("tools that do things").
 *
 * Every action declares:
 *   - id, label, description
 *   - input schema (zod)
 *   - whether it requires explicit user approval before execution
 *   - an `execute(input, ctx)` handler
 *
 * Agents request actions via `requestAction(...)` which writes a row to
 * Firestore `agent_actions` with status='pending'. The /inbox page lists
 * pending rows; on approval the registered handler runs.
 *
 * External integrations (email, WhatsApp) are NO-OP'd here when the
 * required env vars are missing — execution still succeeds and the row
 * is marked 'executed_noop' so the audit trail is preserved.
 */
import { z } from 'zod';
import { adminDb } from '@/src/lib/firebase-admin';
import {
  createCampaign as metaCreateCampaign,
  createAdSet as metaCreateAdSet,
  publishAd as metaPublishAd,
  pauseCampaign as metaPauseCampaign,
  getCampaignInsights as metaGetInsights,
  metaConfigured,
} from '@/src/lib/integrations/meta-ads';
import {
  createGoogleCampaign,
  pauseGoogleCampaign,
  googleAdsConfigured,
} from '@/src/lib/integrations/google-ads';
import {
  createTikTokCampaign,
  tiktokConfigured,
} from '@/src/lib/integrations/tiktok-ads';
import { sendForSignature, esignConfigured } from '@/src/lib/integrations/esign';

export type ActionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'executed'
  | 'executed_noop'
  | 'failed';

export interface ActionContext {
  userId: string;
  workspaceId?: string;
}

export interface ActionDefinition<TInput = unknown> {
  id: string;
  label: string;
  description: string;
  requiresApproval: boolean;
  schema: z.ZodSchema<TInput>;
  execute: (input: TInput, ctx: ActionContext) => Promise<{ ok: true; result?: unknown; noop?: boolean } | { ok: false; error: string }>;
}

const REGISTRY = new Map<string, ActionDefinition>();

export function registerAction<T>(def: ActionDefinition<T>) {
  REGISTRY.set(def.id, def as ActionDefinition);
}

export function getAction(id: string) {
  return REGISTRY.get(id);
}

export function listActions() {
  return Array.from(REGISTRY.values()).map((a) => ({
    id: a.id,
    label: a.label,
    description: a.description,
    requiresApproval: a.requiresApproval,
  }));
}

// ---------- Built-in actions ----------

registerAction({
  id: 'send_email',
  label: 'إرسال بريد إلكتروني',
  description: 'يرسل بريداً إلكترونياً نيابة عن المستخدم (يتطلب RESEND_API_KEY).',
  requiresApproval: true,
  schema: z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(8000),
  }),
  async execute(input) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return { ok: true, noop: true, result: { reason: 'no_resend_key', preview: input } };
    }
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Kalmeron <noreply@kalmeron.app>',
          to: input.to,
          subject: input.subject,
          text: input.body,
        }),
      });
      if (!r.ok) return { ok: false, error: `resend_${r.status}` };
      return { ok: true, result: await r.json() };
    } catch (e: unknown) {
      return { ok: false, error: e?.message || 'send_failed' };
    }
  },
});

registerAction({
  id: 'create_invoice_draft',
  label: 'إنشاء مسودة فاتورة',
  description: 'يحفظ مسودة فاتورة في Firestore لمراجعتها لاحقاً.',
  requiresApproval: true,
  schema: z.object({
    customerName: z.string().min(1).max(200),
    amount: z.number().positive(),
    currency: z.string().default('EGP'),
    notes: z.string().max(1000).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('invoices').add({
      ...input,
      userId: ctx.userId,
      status: 'draft',
      createdAt: new Date(),
    });
    return { ok: true, result: { invoiceId: ref.id } };
  },
});

registerAction({
  id: 'schedule_meeting',
  label: 'جدولة اجتماع',
  description: 'يحفظ اجتماعاً في تقويم المستخدم داخل التطبيق.',
  requiresApproval: true,
  schema: z.object({
    title: z.string().min(1).max(200),
    startsAt: z.string(), // ISO
    durationMinutes: z.number().int().min(5).max(480).default(30),
    attendees: z.array(z.string().email()).default([]),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('meetings').add({
      ...input,
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { meetingId: ref.id } };
  },
});

registerAction({
  id: 'send_whatsapp',
  label: 'إرسال رسالة واتساب',
  description: 'يرسل رسالة عبر WhatsApp Business API (يتطلب WHATSAPP_TOKEN).',
  requiresApproval: true,
  schema: z.object({
    to: z.string().min(8).max(20),
    text: z.string().min(1).max(4000),
  }),
  async execute(input) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) {
      return { ok: true, noop: true, result: { reason: 'no_whatsapp_creds', preview: input } };
    }
    try {
      const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: input.to,
          type: 'text',
          text: { body: input.text },
        }),
      });
      if (!r.ok) return { ok: false, error: `whatsapp_${r.status}` };
      return { ok: true, result: await r.json() };
    } catch (e: unknown) {
      return { ok: false, error: e?.message || 'whatsapp_failed' };
    }
  },
});

// ---------- Meta (Facebook/Instagram) Ads actions ----------

registerAction({
  id: 'meta_create_campaign',
  label: 'إنشاء حملة إعلانية على Meta',
  description: 'ينشئ حملة جديدة على Facebook/Instagram (تبدأ متوقّفة حتى تنشيطها).',
  requiresApproval: true,
  schema: z.object({
    name: z.string().min(2).max(200),
    objective: z.enum([
      'OUTCOME_LEADS',
      'OUTCOME_TRAFFIC',
      'OUTCOME_AWARENESS',
      'OUTCOME_ENGAGEMENT',
      'OUTCOME_SALES',
      'OUTCOME_APP_PROMOTION',
    ]),
    dailyBudgetMinor: z.number().int().min(100), // e.g. 100 piastres = 1 EGP
    specialAdCategories: z.array(z.string()).optional(),
  }),
  async execute(input) {
    const r = await metaCreateCampaign({
      name: input.name,
      objective: input.objective,
      dailyBudgetMinor: input.dailyBudgetMinor,
      status: 'PAUSED',
      specialAdCategories: input.specialAdCategories,
    });
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

registerAction({
  id: 'meta_create_adset',
  label: 'إنشاء مجموعة إعلانات على Meta',
  description: 'ينشئ مجموعة إعلانات (استهداف + ميزانية يومية) داخل حملة قائمة.',
  requiresApproval: true,
  schema: z.object({
    campaignId: z.string().min(2),
    name: z.string().min(2).max(200),
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
    targeting: z
      .object({
        geoCountries: z.array(z.string()).optional(),
        geoCities: z.array(z.string()).optional(),
        ageMin: z.number().int().min(13).max(65).optional(),
        ageMax: z.number().int().min(13).max(65).optional(),
        genders: z.array(z.number().int()).optional(),
        interests: z
          .array(z.object({ id: z.string(), name: z.string() }))
          .optional(),
      })
      .optional(),
  }),
  async execute(input) {
    const r = await metaCreateAdSet(input);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

registerAction({
  id: 'meta_publish_ad',
  label: 'نشر إعلان على Meta',
  description: 'ينشئ creative + إعلان داخل مجموعة إعلانات (يبدأ متوقّفاً للسلامة).',
  requiresApproval: true,
  schema: z.object({
    adsetId: z.string().min(2),
    name: z.string().min(2).max(200),
    message: z.string().min(2).max(2000),
    linkUrl: z.string().url(),
    headline: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    imageHash: z.string().optional(),
  }),
  async execute(input) {
    const r = await metaPublishAd(input);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

registerAction({
  id: 'meta_pause_campaign',
  label: 'إيقاف حملة Meta',
  description: 'إيقاف حملة فوراً (إجراء دفاعي — لا يحتاج موافقة).',
  requiresApproval: false,
  schema: z.object({ campaignId: z.string().min(2) }),
  async execute(input) {
    const r = await metaPauseCampaign(input.campaignId);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

registerAction({
  id: 'meta_get_campaign_insights',
  label: 'قراءة أداء حملة Meta',
  description: 'يجلب بيانات الأداء (مشاهدات، نقرات، صرف، CTR) لحملة (قراءة فقط).',
  requiresApproval: false,
  schema: z.object({
    campaignId: z.string().min(2),
    datePreset: z.enum(['today', 'yesterday', 'last_7d', 'last_30d']).default('last_7d'),
  }),
  async execute(input) {
    const r = await metaGetInsights(input.campaignId, input.datePreset);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

export function metaIntegrationStatus() {
  return {
    configured: metaConfigured(),
    pageConfigured: Boolean(process.env.META_PAGE_ID),
    requiredEnv: ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID', 'META_PAGE_ID'],
  };
}

export function integrationsStatus() {
  return {
    meta: metaIntegrationStatus(),
    google_ads: {
      configured: googleAdsConfigured(),
      requiredEnv: [
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CUSTOMER_ID',
        'GOOGLE_ADS_OAUTH_TOKEN',
      ],
    },
    tiktok: {
      configured: tiktokConfigured(),
      requiredEnv: ['TIKTOK_ACCESS_TOKEN', 'TIKTOK_ADVERTISER_ID'],
    },
    docusign: {
      configured: esignConfigured(),
      requiredEnv: ['DOCUSIGN_ACCESS_TOKEN', 'DOCUSIGN_ACCOUNT_ID', 'DOCUSIGN_BASE_URI'],
    },
    email: { configured: Boolean(process.env.RESEND_API_KEY), requiredEnv: ['RESEND_API_KEY'] },
    whatsapp: {
      configured: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
      requiredEnv: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID'],
    },
  };
}

// ---------- Google Ads actions ----------

registerAction({
  id: 'google_ads_create_campaign',
  label: 'إنشاء حملة على Google Ads',
  description: 'ينشئ حملة Google Ads جديدة (تبدأ متوقّفة).',
  requiresApproval: true,
  schema: z.object({
    name: z.string().min(2).max(200),
    channelType: z.enum(['SEARCH', 'DISPLAY', 'VIDEO', 'PERFORMANCE_MAX']),
    dailyBudgetMinor: z.number().int().min(100),
  }),
  async execute(input) {
    const r = await createGoogleCampaign({ ...input, status: 'PAUSED' });
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

registerAction({
  id: 'google_ads_pause_campaign',
  label: 'إيقاف حملة Google Ads',
  description: 'إيقاف حملة Google Ads فوراً (دفاعي).',
  requiresApproval: false,
  schema: z.object({ campaignResourceName: z.string().min(2) }),
  async execute(input) {
    const r = await pauseGoogleCampaign(input.campaignResourceName);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

// ---------- TikTok Ads actions ----------

registerAction({
  id: 'tiktok_create_campaign',
  label: 'إنشاء حملة على TikTok Ads',
  description: 'ينشئ حملة TikTok جديدة (تبدأ متوقّفة).',
  requiresApproval: true,
  schema: z.object({
    name: z.string().min(2).max(200),
    objective: z.enum([
      'TRAFFIC',
      'CONVERSIONS',
      'APP_INSTALL',
      'LEAD_GENERATION',
      'REACH',
      'VIDEO_VIEWS',
    ]),
    budgetMode: z.enum(['BUDGET_MODE_DAY', 'BUDGET_MODE_TOTAL']).default('BUDGET_MODE_DAY'),
    budgetAmountMinor: z.number().int().min(2000),
  }),
  async execute(input) {
    const r = await createTikTokCampaign(input);
    if (!r.ok) return { ok: false, error: r.error };
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

// ---------- Sales / CRM actions ----------

registerAction({
  id: 'crm_add_lead',
  label: 'إضافة عميل محتمل إلى CRM',
  description: 'يحفظ عميلاً محتملاً جديداً مع المعلومات الأساسية وحالته.',
  requiresApproval: false,
  schema: z.object({
    name: z.string().min(2).max(200),
    company: z.string().max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(30).optional(),
    source: z.string().max(100).optional(),
    estimatedValue: z.number().nonnegative().optional(),
    notes: z.string().max(2000).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('crm_leads').add({
      ...input,
      status: 'new',
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { leadId: ref.id } };
  },
});

registerAction({
  id: 'crm_update_lead_status',
  label: 'تحديث حالة عميل محتمل',
  description: 'يغيّر مرحلة عميل في خط الأنابيب (new → contacted → qualified → won/lost).',
  requiresApproval: false,
  schema: z.object({
    leadId: z.string().min(2),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
    note: z.string().max(1000).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = adminDb.collection('crm_leads').doc(input.leadId);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== ctx.userId) return { ok: false, error: 'lead_not_found' };
    await ref.update({ status: input.status, lastNote: input.note || null, updatedAt: new Date() });
    return { ok: true, result: { leadId: input.leadId, status: input.status } };
  },
});

registerAction({
  id: 'sales_send_outreach_email',
  label: 'إرسال إيميل تسويقي/مبيعات',
  description: 'إرسال إيميل مخصّص لعميل محتمل (يُسجَّل تلقائياً مع العميل).',
  requiresApproval: true,
  schema: z.object({
    leadId: z.string().optional(),
    to: z.string().email(),
    subject: z.string().min(2).max(200),
    body: z.string().min(10).max(8000),
  }),
  async execute(input, ctx) {
    const key = process.env.RESEND_API_KEY;
    let sendResult: unknown = null;
    let noop = false;
    if (!key) {
      noop = true;
      sendResult = { reason: 'no_resend_key', preview: input };
    } else {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Kalmeron <noreply@kalmeron.app>',
            to: input.to,
            subject: input.subject,
            text: input.body,
          }),
        });
        if (!r.ok) return { ok: false, error: `resend_${r.status}` };
        sendResult = await r.json();
      } catch (e: unknown) {
        return { ok: false, error: (e as Error)?.message || 'send_failed' };
      }
    }
    // Log activity on the lead (best-effort)
    if (input.leadId && adminDb?.collection) {
      await adminDb
        .collection('crm_leads')
        .doc(input.leadId)
        .collection('activities')
        .add({ kind: 'email', to: input.to, subject: input.subject, sentAt: new Date(), userId: ctx.userId })
        .catch(() => {});
    }
    return { ok: true, noop, result: sendResult };
  },
});

// ---------- HR actions ----------

registerAction({
  id: 'hr_post_job',
  label: 'نشر إعلان وظيفة',
  description: 'يحفظ إعلان الوظيفة في لوحة الوظائف الخاصة بشركتك (وقابل للنشر خارجياً لاحقاً).',
  requiresApproval: false,
  schema: z.object({
    title: z.string().min(2).max(200),
    department: z.string().max(100).optional(),
    location: z.string().max(200).optional(),
    employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).default('full_time'),
    description: z.string().min(20).max(8000),
    requirements: z.array(z.string()).max(20).optional(),
    salaryRange: z.string().max(100).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('job_postings').add({
      ...input,
      status: 'open',
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { jobId: ref.id } };
  },
});

registerAction({
  id: 'hr_screen_cv',
  label: 'فرز سيرة ذاتية',
  description: 'يحفظ نتيجة فرز سيرة ذاتية لمتقدّم على وظيفة (ملاحظات ودرجة من 0-100).',
  requiresApproval: false,
  schema: z.object({
    jobId: z.string().min(2),
    candidateName: z.string().min(2).max(200),
    candidateEmail: z.string().email().optional(),
    score: z.number().min(0).max(100),
    summary: z.string().min(10).max(4000),
    decision: z.enum(['shortlist', 'reject', 'further_review']).default('further_review'),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('cv_evaluations').add({
      ...input,
      userId: ctx.userId,
      evaluatedAt: new Date(),
    });
    return { ok: true, result: { evaluationId: ref.id, decision: input.decision } };
  },
});

registerAction({
  id: 'hr_send_offer',
  label: 'إرسال عرض عمل',
  description: 'يرسل خطاب عرض عمل لمرشّح عبر البريد الإلكتروني (التزام تعاقدي).',
  requiresApproval: true,
  schema: z.object({
    jobId: z.string().optional(),
    candidateEmail: z.string().email(),
    candidateName: z.string().min(2).max(200),
    title: z.string().min(2).max(200),
    salaryMonthly: z.number().positive(),
    currency: z.string().default('EGP'),
    startDateIso: z.string(),
    notes: z.string().max(2000).optional(),
  }),
  async execute(input, ctx) {
    // Persist the offer record
    if (adminDb?.collection) {
      await adminDb.collection('job_offers').add({
        ...input,
        status: 'sent',
        userId: ctx.userId,
        createdAt: new Date(),
      });
    }
    const key = process.env.RESEND_API_KEY;
    const subject = `عرض عمل: ${input.title}`;
    const body = `مرحباً ${input.candidateName},\n\nيسرّنا تقديم عرض عمل لشغل وظيفة "${input.title}" بدءاً من ${input.startDateIso}.\nالراتب الشهري: ${input.salaryMonthly} ${input.currency}.\n${input.notes || ''}\n\nمع التحية.`;
    if (!key) {
      return {
        ok: true,
        noop: true,
        result: { reason: 'no_resend_key', preview: { to: input.candidateEmail, subject, body } },
      };
    }
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Kalmeron <noreply@kalmeron.app>',
          to: input.candidateEmail,
          subject,
          text: body,
        }),
      });
      if (!r.ok) return { ok: false, error: `resend_${r.status}` };
      return { ok: true, result: await r.json() };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error)?.message || 'send_failed' };
    }
  },
});

// ---------- Operations actions ----------

registerAction({
  id: 'ops_create_task',
  label: 'إنشاء مهمة تشغيلية',
  description: 'ينشئ مهمة في لوحة العمليات (مثل Trello card داخلي).',
  requiresApproval: false,
  schema: z.object({
    title: z.string().min(2).max(200),
    description: z.string().max(4000).optional(),
    assignee: z.string().max(100).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    dueDateIso: z.string().optional(),
    labels: z.array(z.string()).max(10).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('ops_tasks').add({
      ...input,
      status: 'todo',
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { taskId: ref.id } };
  },
});

registerAction({
  id: 'ops_update_inventory',
  label: 'تحديث المخزون',
  description: 'يضيف أو يخفض كمية صنف من المخزون.',
  requiresApproval: false,
  schema: z.object({
    sku: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    deltaQty: z.number().int(),
    reason: z.string().max(500).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = adminDb.collection('inventory').doc(`${ctx.userId}_${input.sku}`);
    const snap = await ref.get();
    const current = snap.exists ? Number(snap.data()?.qty || 0) : 0;
    const newQty = current + input.deltaQty;
    await ref.set(
      { sku: input.sku, name: input.name, qty: newQty, userId: ctx.userId, updatedAt: new Date() },
      { merge: true },
    );
    await adminDb.collection('inventory_movements').add({
      sku: input.sku,
      deltaQty: input.deltaQty,
      reason: input.reason || null,
      userId: ctx.userId,
      at: new Date(),
    });
    return { ok: true, result: { sku: input.sku, qty: newQty } };
  },
});

registerAction({
  id: 'ops_create_purchase_order',
  label: 'إصدار أمر شراء لمورّد',
  description: 'ينشئ أمر شراء جديد بقيمة محدّدة لمورّد (التزام مالي).',
  requiresApproval: true,
  schema: z.object({
    vendor: z.string().min(2).max(200),
    items: z.array(
      z.object({ sku: z.string(), name: z.string(), qty: z.number().int().positive(), unitPrice: z.number().nonnegative() }),
    ).min(1),
    currency: z.string().default('EGP'),
    expectedDeliveryIso: z.string().optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const total = input.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const ref = await adminDb.collection('purchase_orders').add({
      ...input,
      total,
      status: 'issued',
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { purchaseOrderId: ref.id, total } };
  },
});

// ---------- Finance / CFO actions ----------

registerAction({
  id: 'cfo_log_bank_transaction',
  label: 'تسجيل حركة بنكية',
  description: 'يسجّل حركة في الدفتر اليومي (إيراد/مصروف) لحساب التدفق النقدي.',
  requiresApproval: false,
  schema: z.object({
    date: z.string(),
    direction: z.enum(['inflow', 'outflow']),
    amount: z.number().positive(),
    currency: z.string().default('EGP'),
    category: z.string().max(100),
    counterparty: z.string().max(200).optional(),
    description: z.string().max(1000).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('bank_transactions').add({
      ...input,
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { transactionId: ref.id } };
  },
});

registerAction({
  id: 'cfo_generate_pl_report',
  label: 'توليد تقرير أرباح/خسائر',
  description: 'يحسب الأرباح والخسائر من حركات بنكية مسجَّلة لفترة محدّدة.',
  requiresApproval: false,
  schema: z.object({
    fromIso: z.string(),
    toIso: z.string(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const snap = await adminDb
      .collection('bank_transactions')
      .where('userId', '==', ctx.userId)
      .get()
      .catch(() => null);
    if (!snap) return { ok: false, error: 'firestore_query_failed' };
    let inflow = 0;
    let outflow = 0;
    const fromMs = new Date(input.fromIso).getTime();
    const toMs = new Date(input.toIso).getTime();
    snap.forEach((d: unknown) => {
      const r = d.data();
      const tMs = new Date(r.date).getTime();
      if (Number.isNaN(tMs) || tMs < fromMs || tMs > toMs) return;
      if (r.direction === 'inflow') inflow += Number(r.amount || 0);
      else outflow += Number(r.amount || 0);
    });
    const net = inflow - outflow;
    const ref = await adminDb.collection('financial_reports').add({
      kind: 'pl',
      from: input.fromIso,
      to: input.toIso,
      inflow,
      outflow,
      net,
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { reportId: ref.id, inflow, outflow, net } };
  },
});

registerAction({
  id: 'cfo_set_budget_alert',
  label: 'ضبط تنبيه ميزانية',
  description: 'يضبط حداً للإنفاق على فئة معيّنة، يُنبَّه المؤسّس عند تجاوزه.',
  requiresApproval: false,
  schema: z.object({
    category: z.string().min(1).max(100),
    monthlyLimit: z.number().positive(),
    currency: z.string().default('EGP'),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = adminDb.collection('budget_alerts').doc(`${ctx.userId}_${input.category}`);
    await ref.set({ ...input, userId: ctx.userId, updatedAt: new Date() }, { merge: true });
    return { ok: true, result: { category: input.category, monthlyLimit: input.monthlyLimit } };
  },
});

// ---------- Legal actions ----------

registerAction({
  id: 'legal_create_contract_draft',
  label: 'إنشاء مسودّة عقد',
  description: 'يحفظ مسودّة عقد كمستند قابل للمراجعة (لا يُلزم أي طرف).',
  requiresApproval: false,
  schema: z.object({
    kind: z.string().min(2).max(100),
    parties: z.array(z.string().min(2)).min(2),
    body: z.string().min(50),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('contracts').add({
      ...input,
      status: 'draft',
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { contractId: ref.id } };
  },
});

registerAction({
  id: 'legal_send_for_signature',
  label: 'إرسال عقد للتوقيع الإلكتروني',
  description: 'يرسل عقداً جاهزاً عبر DocuSign للتوقيع (التزام قانوني).',
  requiresApproval: true,
  schema: z.object({
    contractId: z.string().optional(),
    documentName: z.string().min(2).max(200),
    documentBase64: z.string().min(20),
    recipientEmail: z.string().email(),
    recipientName: z.string().min(2).max(200),
    emailSubject: z.string().max(200).optional(),
  }),
  async execute(input, ctx) {
    const r = await sendForSignature(input);
    if (!r.ok) return { ok: false, error: r.error };
    if (input.contractId && adminDb?.collection) {
      await adminDb
        .collection('contracts')
        .doc(input.contractId)
        .update({
          status: 'sent_for_signature',
          envelopeId: (r.result as { envelopeId?: string })?.envelopeId || null,
          sentAt: new Date(),
        })
        .catch(() => {});
    }
    return { ok: true, noop: !!r.noop, result: r.result };
  },
});

registerAction({
  id: 'legal_log_compliance_check',
  label: 'تسجيل فحص امتثال',
  description: 'يسجّل نتيجة فحص امتثال (GDPR، حماية بيانات، تراخيص...) في السجلّ القانوني.',
  requiresApproval: false,
  schema: z.object({
    domain: z.string().min(2).max(100),
    status: z.enum(['compliant', 'partial', 'non_compliant']),
    findings: z.string().min(10).max(4000),
    nextReviewIso: z.string().optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('compliance_log').add({
      ...input,
      userId: ctx.userId,
      checkedAt: new Date(),
    });
    return { ok: true, result: { logId: ref.id } };
  },
});

// ---------- Customer Support actions ----------

registerAction({
  id: 'support_create_ticket',
  label: 'فتح تذكرة دعم',
  description: 'ينشئ تذكرة دعم لعميل وأولويتها.',
  requiresApproval: false,
  schema: z.object({
    customerEmail: z.string().email(),
    customerName: z.string().max(200).optional(),
    subject: z.string().min(2).max(200),
    body: z.string().min(2).max(8000),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    channel: z.enum(['email', 'whatsapp', 'web', 'phone']).default('email'),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('support_tickets').add({
      ...input,
      status: 'open',
      userId: ctx.userId,
      createdAt: new Date(),
    });
    return { ok: true, result: { ticketId: ref.id } };
  },
});

registerAction({
  id: 'support_send_reply',
  label: 'إرسال ردّ على تذكرة',
  description: 'يرسل رسالة ردّ للعميل (إيميل/واتساب) ويحدّث التذكرة.',
  requiresApproval: true,
  schema: z.object({
    ticketId: z.string().min(2),
    channel: z.enum(['email', 'whatsapp']),
    to: z.string().min(2).max(200),
    subject: z.string().max(200).optional(),
    body: z.string().min(2).max(8000),
    closeAfter: z.boolean().default(false),
  }),
  async execute(input, ctx) {
    let sendResult: unknown = null;
    let noop = false;
    if (input.channel === 'email') {
      const key = process.env.RESEND_API_KEY;
      if (!key) {
        noop = true;
        sendResult = { reason: 'no_resend_key', preview: input };
      } else {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Kalmeron <noreply@kalmeron.app>',
            to: input.to,
            subject: input.subject || `Re: تذكرة #${input.ticketId}`,
            text: input.body,
          }),
        });
        if (!r.ok) return { ok: false, error: `resend_${r.status}` };
        sendResult = await r.json();
      }
    } else {
      const token = process.env.WHATSAPP_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_ID;
      if (!token || !phoneId) {
        noop = true;
        sendResult = { reason: 'no_whatsapp_creds', preview: input };
      } else {
        const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: input.to,
            type: 'text',
            text: { body: input.body },
          }),
        });
        if (!r.ok) return { ok: false, error: `whatsapp_${r.status}` };
        sendResult = await r.json();
      }
    }
    if (adminDb?.collection) {
      await adminDb
        .collection('support_tickets')
        .doc(input.ticketId)
        .update({
          status: input.closeAfter ? 'resolved' : 'awaiting_customer',
          lastReplyAt: new Date(),
        })
        .catch(() => {});
    }
    return { ok: true, noop, result: sendResult };
  },
});

// ---------- Investor relations actions ----------

registerAction({
  id: 'investor_add_data_room_file',
  label: 'إضافة ملف لغرفة بيانات المستثمرين',
  description: 'يحفظ مرجعاً لملف داخل غرفة البيانات (مالي، قانوني، تقني...).',
  requiresApproval: false,
  schema: z.object({
    title: z.string().min(2).max(200),
    category: z.enum(['financial', 'legal', 'product', 'team', 'metrics', 'other']),
    fileUrl: z.string().url().optional(),
    description: z.string().max(2000).optional(),
  }),
  async execute(input, ctx) {
    if (!adminDb?.collection) return { ok: false, error: 'firestore_unavailable' };
    const ref = await adminDb.collection('data_room').add({
      ...input,
      userId: ctx.userId,
      addedAt: new Date(),
    });
    return { ok: true, result: { fileId: ref.id } };
  },
});

registerAction({
  id: 'investor_send_pitch_email',
  label: 'إرسال بيتش لمستثمر',
  description: 'يرسل إيميل بيتش لمستثمر مع رابط للمستندات.',
  requiresApproval: true,
  schema: z.object({
    investorName: z.string().min(2).max(200),
    investorEmail: z.string().email(),
    subject: z.string().min(2).max(200),
    body: z.string().min(20).max(8000),
    dataRoomLink: z.string().url().optional(),
  }),
  async execute(input, ctx) {
    const key = process.env.RESEND_API_KEY;
    const fullBody = `${input.body}${input.dataRoomLink ? `\n\nغرفة البيانات: ${input.dataRoomLink}` : ''}`;
    if (adminDb?.collection) {
      await adminDb.collection('investor_outreach').add({
        ...input,
        sentAt: new Date(),
        userId: ctx.userId,
      });
    }
    if (!key) {
      return { ok: true, noop: true, result: { reason: 'no_resend_key', preview: input } };
    }
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Kalmeron <noreply@kalmeron.app>',
          to: input.investorEmail,
          subject: input.subject,
          text: fullBody,
        }),
      });
      if (!r.ok) return { ok: false, error: `resend_${r.status}` };
      return { ok: true, result: await r.json() };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error)?.message || 'send_failed' };
    }
  },
});

// ---------- Action requests (inbox) ----------

const ACTIONS_COLLECTION = 'agent_actions';

export async function requestAction(opts: {
  userId: string;
  actionId: string;
  input: unknown;
  rationale?: string;
  requestedBy?: string;
  workspaceId?: string;
}): Promise<{ id: string; status: ActionStatus }> {
  const def = REGISTRY.get(opts.actionId);
  if (!def) throw new Error(`unknown_action_${opts.actionId}`);
  const parsed = def.schema.safeParse(opts.input);
  if (!parsed.success) throw new Error(`invalid_input: ${parsed.error.message}`);

  if (!adminDb?.collection) throw new Error('firestore_unavailable');

  // Auto-execute if action does not require approval.
  if (!def.requiresApproval) {
    const r = await def.execute(parsed.data, { userId: opts.userId, workspaceId: opts.workspaceId });
    const status: ActionStatus = r.ok ? (r.noop ? 'executed_noop' : 'executed') : 'failed';
    const ref = await adminDb.collection(ACTIONS_COLLECTION).add({
      userId: opts.userId,
      workspaceId: opts.workspaceId || null,
      actionId: opts.actionId,
      label: def.label,
      input: parsed.data,
      rationale: opts.rationale || null,
      requestedBy: opts.requestedBy || 'agent',
      status,
      result: r.ok ? r.result || null : null,
      error: r.ok ? null : r.error,
      createdAt: new Date(),
      executedAt: new Date(),
    });
    return { id: ref.id, status };
  }

  const ref = await adminDb.collection(ACTIONS_COLLECTION).add({
    userId: opts.userId,
    workspaceId: opts.workspaceId || null,
    actionId: opts.actionId,
    label: def.label,
    input: parsed.data,
    rationale: opts.rationale || null,
    requestedBy: opts.requestedBy || 'agent',
    status: 'pending' as ActionStatus,
    createdAt: new Date(),
  });
  return { id: ref.id, status: 'pending' };
}

export async function decideAction(opts: {
  userId: string;
  actionDocId: string;
  decision: 'approve' | 'reject';
  editedInput?: unknown;
}): Promise<{ status: ActionStatus; result?: unknown; error?: string }> {
  if (!adminDb?.collection) throw new Error('firestore_unavailable');
  const ref = adminDb.collection(ACTIONS_COLLECTION).doc(opts.actionDocId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('action_not_found');
  const data: unknown = snap.data();
  if (data.userId !== opts.userId) throw new Error('forbidden');
  if (data.status !== 'pending') throw new Error(`already_${data.status}`);

  if (opts.decision === 'reject') {
    await ref.update({ status: 'rejected', decidedAt: new Date() });
    return { status: 'rejected' };
  }

  const def = REGISTRY.get(data.actionId);
  if (!def) {
    await ref.update({ status: 'failed', error: 'unknown_action', decidedAt: new Date() });
    return { status: 'failed', error: 'unknown_action' };
  }
  const inputCandidate = opts.editedInput ?? data.input;
  const parsed = def.schema.safeParse(inputCandidate);
  if (!parsed.success) {
    await ref.update({ status: 'failed', error: 'invalid_input', decidedAt: new Date() });
    return { status: 'failed', error: 'invalid_input' };
  }
  const r = await def.execute(parsed.data, { userId: data.userId, workspaceId: data.workspaceId });
  const status: ActionStatus = r.ok ? (r.noop ? 'executed_noop' : 'executed') : 'failed';
  await ref.update({
    status,
    input: parsed.data,
    result: r.ok ? r.result || null : null,
    error: r.ok ? null : r.error,
    decidedAt: new Date(),
    executedAt: new Date(),
  });
  return { status, result: r.ok ? r.result : undefined, error: r.ok ? undefined : r.error };
}

export async function listInbox(userId: string, status?: ActionStatus): Promise<unknown[]> {
  if (!adminDb?.collection) return [];
  let q = adminDb.collection(ACTIONS_COLLECTION).where('userId', '==', userId);
  if (status) q = q.where('status', '==', status);
  const snap = await q.limit(200).get().catch(() => null);
  if (!snap || snap.empty) return [];
  const rows: unknown[] = [];
  snap.forEach((d: unknown) => rows.push({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));
  return rows;
}
