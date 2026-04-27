// @ts-nocheck
/**
 * TikTok Marketing API light client.
 * Required env: TIKTOK_ACCESS_TOKEN, TIKTOK_ADVERTISER_ID
 */

export type TikTokResult<T = unknown> =
  | { ok: true; result?: T; noop?: boolean }
  | { ok: false; error: string };

const BASE = 'https://business-api.tiktok.com/open_api/v1.3';

export function tiktokConfigured(): boolean {
  return Boolean(process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_ADVERTISER_ID);
}

const sim = (p: string) => `${p}_sim_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

export interface TikTokCampaignInput {
  name: string;
  objective:
    | 'TRAFFIC'
    | 'CONVERSIONS'
    | 'APP_INSTALL'
    | 'LEAD_GENERATION'
    | 'REACH'
    | 'VIDEO_VIEWS';
  budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL';
  budgetAmountMinor: number; // smallest currency unit
}

export async function createTikTokCampaign(input: TikTokCampaignInput): Promise<TikTokResult> {
  if (!tiktokConfigured()) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        campaign_id: sim('tt_camp'),
        ...input,
        operation_status: 'DISABLE',
        message: 'وضع المحاكاة: لم يُربط حساب TikTok Ads بعد.',
      },
    };
  }
  try {
    const r = await fetch(`${BASE}/campaign/create/`, {
      method: 'POST',
      headers: {
        'Access-Token': process.env.TIKTOK_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        advertiser_id: process.env.TIKTOK_ADVERTISER_ID,
        campaign_name: input.name,
        objective_type: input.objective,
        budget_mode: input.budgetMode,
        budget: input.budgetAmountMinor / 100, // TikTok uses major units
        operation_status: 'DISABLE', // start paused for safety
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.code !== 0 && j.code !== undefined) return { ok: false, error: j.message || `tt_${j.code}` };
    if (!r.ok) return { ok: false, error: j?.message || `tt_http_${r.status}` };
    return { ok: true, result: j };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'tt_request_failed' };
  }
}
