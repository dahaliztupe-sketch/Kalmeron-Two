// @ts-nocheck
/**
 * Google Ads light client.
 * Real Google Ads API uses gRPC + OAuth refresh tokens; this module performs
 * REST-style POSTs against the Google Ads search endpoint when fully
 * configured, otherwise falls back to a safe simulation that mirrors the
 * shape of a real response so the agent flow + audit trail still work.
 *
 * Required env for live execution:
 *   GOOGLE_ADS_DEVELOPER_TOKEN
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID  (manager account, no dashes)
 *   GOOGLE_ADS_CUSTOMER_ID        (the ad account, no dashes)
 *   GOOGLE_ADS_OAUTH_TOKEN        (a valid access token)
 */

export type GoogleAdsResult<T = unknown> =
  | { ok: true; result?: T; noop?: boolean }
  | { ok: false; error: string };

export function googleAdsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
      process.env.GOOGLE_ADS_CUSTOMER_ID &&
      process.env.GOOGLE_ADS_OAUTH_TOKEN,
  );
}

const sim = (prefix: string) =>
  `${prefix}_sim_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

export interface GoogleCampaignInput {
  name: string;
  channelType: 'SEARCH' | 'DISPLAY' | 'VIDEO' | 'PERFORMANCE_MAX';
  dailyBudgetMinor: number; // smallest currency unit
  status?: 'ENABLED' | 'PAUSED';
}

export async function createGoogleCampaign(input: GoogleCampaignInput): Promise<GoogleAdsResult> {
  if (!googleAdsConfigured()) {
    return {
      ok: true,
      noop: true,
      result: {
        simulated: true,
        id: sim('gads_camp'),
        ...input,
        status: input.status || 'PAUSED',
        message: 'وضع المحاكاة: لم يُربط حساب Google Ads بعد.',
      },
    };
  }
  // NOTE: live path requires Google Ads API mutate endpoint with proper headers.
  // We provide the call site so production deployments only need to flip env vars.
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;
  const url = `https://googleads.googleapis.com/v17/customers/${customerId}/campaigns:mutate`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GOOGLE_ADS_OAUTH_TOKEN}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'login-customer-id': process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || customerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [
          {
            create: {
              name: input.name,
              status: input.status || 'PAUSED',
              advertisingChannelType: input.channelType,
              campaignBudget: {
                amountMicros: input.dailyBudgetMinor * 10_000, // minor → micros
                deliveryMethod: 'STANDARD',
              },
            },
          },
        ],
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j?.error?.message || `gads_http_${r.status}` };
    return { ok: true, result: j };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'gads_request_failed' };
  }
}

export async function pauseGoogleCampaign(campaignResourceName: string): Promise<GoogleAdsResult> {
  if (!googleAdsConfigured()) {
    return { ok: true, noop: true, result: { simulated: true, id: campaignResourceName, status: 'PAUSED' } };
  }
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;
  const url = `https://googleads.googleapis.com/v17/customers/${customerId}/campaigns:mutate`;
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GOOGLE_ADS_OAUTH_TOKEN}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'login-customer-id': process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || customerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{ update: { resourceName: campaignResourceName, status: 'PAUSED' }, updateMask: 'status' }],
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j?.error?.message || `gads_http_${r.status}` };
    return { ok: true, result: j };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'gads_request_failed' };
  }
}
