// @ts-nocheck
/**
 * Meta Marketing API client (Facebook/Instagram Ads).
 * Graph API v20. Falls back to a safe simulation when credentials are missing,
 * so the agent flow + audit trail still work end-to-end during development.
 *
 * Required environment variables for live execution:
 *   META_ACCESS_TOKEN     — long-lived user/system-user token with ads_management
 *   META_AD_ACCOUNT_ID    — numeric ad account id (without the "act_" prefix)
 *   META_PAGE_ID          — Facebook Page id used as the advertiser identity
 *
 * Optional:
 *   META_GRAPH_VERSION    — default 'v20.0'
 */

const GRAPH = () => `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || 'v20.0'}`;

export type MetaResult<T = unknown> =
  | { ok: true; result?: T; noop?: boolean }
  | { ok: false; error: string };

export function metaConfigured(): boolean {
  return Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
}

function previewId(prefix: string): string {
  return `${prefix}_sim_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

async function post(path: string, body: Record<string, unknown>): Promise<MetaResult> {
  const token = process.env.META_ACCESS_TOKEN!;
  const url = `${GRAPH()}/${path}`;
  try {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (v === undefined || v === null) continue;
      params.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    }
    params.append('access_token', token);
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = json?.error?.message || `meta_http_${r.status}`;
      return { ok: false, error: msg };
    }
    return { ok: true, result: json };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'meta_request_failed' };
  }
}

async function get(path: string, query: Record<string, string> = {}): Promise<MetaResult> {
  const token = process.env.META_ACCESS_TOKEN!;
  const params = new URLSearchParams({ ...query, access_token: token });
  try {
    const r = await fetch(`${GRAPH()}/${path}?${params.toString()}`);
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = json?.error?.message || `meta_http_${r.status}`;
      return { ok: false, error: msg };
    }
    return { ok: true, result: json };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'meta_request_failed' };
  }
}

// ---------- High-level operations ----------

export interface CreateCampaignInput {
  name: string;
  objective:
    | 'OUTCOME_LEADS'
    | 'OUTCOME_TRAFFIC'
    | 'OUTCOME_AWARENESS'
    | 'OUTCOME_ENGAGEMENT'
    | 'OUTCOME_SALES'
    | 'OUTCOME_APP_PROMOTION';
  dailyBudgetMinor: number; // smallest currency unit (e.g. piastres for EGP)
  status?: 'ACTIVE' | 'PAUSED';
  specialAdCategories?: string[];
}

export async function createCampaign(input: CreateCampaignInput): Promise<MetaResult> {
  if (!metaConfigured()) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        id: previewId('camp'),
        ...input,
        status: input.status || 'PAUSED',
        message: 'وضع المحاكاة: لم يُربط حساب Meta بعد. الحملة لم تُنشأ فعلياً.',
      },
    };
  }
  const acct = `act_${process.env.META_AD_ACCOUNT_ID}`;
  return post(`${acct}/campaigns`, {
    name: input.name,
    objective: input.objective,
    status: input.status || 'PAUSED',
    daily_budget: input.dailyBudgetMinor,
    special_ad_categories: input.specialAdCategories || [],
  });
}

export interface CreateAdSetInput {
  campaignId: string;
  name: string;
  dailyBudgetMinor: number;
  startTimeIso?: string;
  endTimeIso?: string;
  optimizationGoal?:
    | 'LINK_CLICKS'
    | 'LEAD_GENERATION'
    | 'OFFSITE_CONVERSIONS'
    | 'IMPRESSIONS'
    | 'REACH'
    | 'POST_ENGAGEMENT';
  billingEvent?: 'IMPRESSIONS' | 'LINK_CLICKS';
  targeting?: {
    geoCountries?: string[]; // ['EG', 'SA', 'AE']
    geoCities?: string[];
    ageMin?: number;
    ageMax?: number;
    genders?: number[]; // 1=male, 2=female
    interests?: { id: string; name: string }[];
  };
}

export async function createAdSet(input: CreateAdSetInput): Promise<MetaResult> {
  if (!metaConfigured()) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        id: previewId('adset'),
        ...input,
        message: 'وضع المحاكاة: مجموعة الإعلانات لم تُنشأ فعلياً.',
      },
    };
  }
  const acct = `act_${process.env.META_AD_ACCOUNT_ID}`;
  const targeting: Record<string, unknown> = {};
  const t = input.targeting || {};
  if (t.geoCountries || t.geoCities) {
    targeting.geo_locations = {
      countries: t.geoCountries || ['EG'],
      ...(t.geoCities ? { cities: t.geoCities } : {}),
    };
  } else {
    targeting.geo_locations = { countries: ['EG'] };
  }
  if (t.ageMin) targeting.age_min = t.ageMin;
  if (t.ageMax) targeting.age_max = t.ageMax;
  if (t.genders) targeting.genders = t.genders;
  if (t.interests) targeting.interests = t.interests;

  return post(`${acct}/adsets`, {
    name: input.name,
    campaign_id: input.campaignId,
    daily_budget: input.dailyBudgetMinor,
    billing_event: input.billingEvent || 'IMPRESSIONS',
    optimization_goal: input.optimizationGoal || 'LINK_CLICKS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    status: 'PAUSED',
    targeting,
    start_time: input.startTimeIso,
    end_time: input.endTimeIso,
  });
}

export interface PublishAdInput {
  adsetId: string;
  name: string;
  message: string;
  linkUrl: string;
  headline?: string;
  description?: string;
  imageHash?: string; // pre-uploaded creative image hash, optional
}

export async function publishAd(input: PublishAdInput): Promise<MetaResult> {
  const pageId = process.env.META_PAGE_ID;
  if (!metaConfigured() || !pageId) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        id: previewId('ad'),
        ...input,
        message: !pageId
          ? 'وضع المحاكاة: META_PAGE_ID غير مضبوط — لا يمكن نشر إعلان فعلي.'
          : 'وضع المحاكاة: الإعلان لم يُنشر فعلياً.',
      },
    };
  }
  const acct = `act_${process.env.META_AD_ACCOUNT_ID}`;
  // Step 1: Create ad creative
  const creativeRes = await post(`${acct}/adcreatives`, {
    name: `${input.name} — creative`,
    object_story_spec: {
      page_id: pageId,
      link_data: {
        message: input.message,
        link: input.linkUrl,
        name: input.headline,
        description: input.description,
        ...(input.imageHash ? { image_hash: input.imageHash } : {}),
      },
    },
  });
  if (!creativeRes.ok) return creativeRes;
  const creativeId = (creativeRes.result as { id?: string })?.id;
  if (!creativeId) return { ok: false, error: 'creative_id_missing' };

  // Step 2: Create ad referencing the creative + adset (status PAUSED — founder must enable later)
  return post(`${acct}/ads`, {
    name: input.name,
    adset_id: input.adsetId,
    creative: { creative_id: creativeId },
    status: 'PAUSED',
  });
}

export async function pauseCampaign(campaignId: string): Promise<MetaResult> {
  if (!metaConfigured()) {
    return {
      ok: true,
      noop: true,
      result: { simulated: true, id: campaignId, status: 'PAUSED' },
    };
  }
  return post(`${campaignId}`, { status: 'PAUSED' });
}

export async function getCampaignInsights(
  campaignId: string,
  datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'last_7d',
): Promise<MetaResult> {
  if (!metaConfigured()) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        campaignId,
        date_preset: datePreset,
        data: [
          {
            impressions: '12500',
            clicks: '340',
            spend: '125.50',
            ctr: '2.72',
            cpc: '0.37',
            reach: '8700',
          },
        ],
        message: 'وضع المحاكاة: بيانات تجريبية فقط.',
      },
    };
  }
  return get(`${campaignId}/insights`, {
    date_preset: datePreset,
    fields: 'impressions,clicks,spend,ctr,cpc,reach,actions',
  });
}
