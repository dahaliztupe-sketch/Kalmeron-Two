/**
 * Fawry Pay (Egypt) — TS client.
 *
 * Why: Stripe alone covers ~30% of Egyptian payment intent. Fawry covers the
 * other ~70% (Fawry kiosks, Vodafone/Etisalat/Orange wallets, Meeza cards,
 * bank transfer reference numbers). Without Fawry, we cannot serve the local
 * SMB market at scale.
 *
 * This module is a thin, typed, no-throw wrapper around the Fawry "PayAtFawry"
 * REST API. It returns a discriminated union { ok: true; ... } | { ok: false; reason }
 * so callers can render Arabic fallback UI without try/catch noise.
 *
 * SECURITY:
 * - Signature is `sha256(merchantCode + merchantRefNum + customerProfileId + paymentMethod + amount + cardNumber|"" + cardExpiryYear|"" + cardExpiryMonth|"" + cvv|"" + secureKey)`.
 * - Webhook signature must be re-verified server-side before granting credits.
 * - Never log secureKey, never expose merchantCode to the client.
 *
 * Env:
 *   FAWRY_BASE_URL          — https://atfawry.fawrystaging.com (sandbox) | https://www.atfawry.com (prod)
 *   FAWRY_MERCHANT_CODE     — assigned by Fawry on merchant onboarding
 *   FAWRY_SECURITY_KEY      — secret, server-only
 *   FAWRY_PUBLIC_BASE_URL   — public URL (e.g. https://kalmeron.com) for return/cancel URLs
 */
import { createHash } from 'node:crypto';
import { z } from 'zod';

export const FAWRY_PAYMENT_METHODS = ['PAYATFAWRY', 'CARD', 'MWALLET', 'VALU'] as const;
export type FawryPaymentMethod = (typeof FAWRY_PAYMENT_METHODS)[number];

const ChargeRequestItem = z.object({
  itemId: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});
type ChargeRequestItem = z.infer<typeof ChargeRequestItem>;

export interface ChargeInput {
  merchantRefNum: string;
  customerProfileId: string;
  customerEmail: string;
  customerMobile: string;
  customerName?: string;
  paymentMethod: FawryPaymentMethod;
  amount: number; // EGP, two decimal precision
  description: string;
  itemId: string;
  /** Optional card data (CARD method only). For MWALLET / PAYATFAWRY leave undefined. */
  card?: {
    number: string;
    expiryYear: string;
    expiryMonth: string;
    cvv: string;
  };
}

export type ChargeResult =
  | {
      ok: true;
      referenceNumber: string;
      merchantRefNumber: string;
      orderAmount: number;
      paymentMethod: FawryPaymentMethod;
      expirationTime: number;
      statusCode: number;
      statusDescription: string;
    }
  | { ok: false; reason: string; statusCode?: number };

const FawryChargeResponse = z.object({
  type: z.string().optional(),
  referenceNumber: z.union([z.string(), z.number()]).optional(),
  merchantRefNumber: z.string().optional(),
  orderAmount: z.number().optional(),
  paymentAmount: z.number().optional(),
  paymentMethod: z.string().optional(),
  expirationTime: z.number().optional(),
  statusCode: z.number(),
  statusDescription: z.string(),
});

function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf-8').digest('hex');
}

/** Fawry "Pay" endpoint signature. */
export function buildPaySignature(args: {
  merchantCode: string;
  merchantRefNum: string;
  customerProfileId: string;
  paymentMethod: FawryPaymentMethod;
  amount: number;
  cardNumber?: string;
  cardExpiryYear?: string;
  cardExpiryMonth?: string;
  cvv?: string;
  secureKey: string;
}): string {
  const a = args.amount.toFixed(2); // Fawry expects exactly 2 decimals in signature
  const raw =
    args.merchantCode +
    args.merchantRefNum +
    args.customerProfileId +
    args.paymentMethod +
    a +
    (args.cardNumber ?? '') +
    (args.cardExpiryYear ?? '') +
    (args.cardExpiryMonth ?? '') +
    (args.cvv ?? '') +
    args.secureKey;
  return sha256(raw);
}

/** Webhook callback signature — used by Fawry when a PAYATFAWRY reference is paid. */
export function buildCallbackSignature(args: {
  fawryRefNumber: string;
  merchantRefNum: string;
  paymentAmount: number;
  orderAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentRefrenceNumber?: string;
  secureKey: string;
}): string {
  const raw =
    args.fawryRefNumber +
    args.merchantRefNum +
    args.paymentAmount.toFixed(2) +
    args.orderAmount.toFixed(2) +
    args.orderStatus +
    args.paymentMethod +
    (args.paymentRefrenceNumber ?? '') +
    args.secureKey;
  return sha256(raw);
}

export function getFawryConfig() {
  return {
    baseUrl: process.env.FAWRY_BASE_URL ?? 'https://atfawry.fawrystaging.com',
    merchantCode: process.env.FAWRY_MERCHANT_CODE,
    secureKey: process.env.FAWRY_SECURITY_KEY,
    publicBaseUrl: process.env.FAWRY_PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  };
}

export function isFawryConfigured(): boolean {
  const c = getFawryConfig();
  return Boolean(c.merchantCode && c.secureKey);
}

/**
 * Create a Fawry charge (single-shot, not a subscription).
 * For PAYATFAWRY method, returns a `referenceNumber` that the user pays at any
 * Fawry kiosk within `expirationTime` seconds; the webhook then confirms.
 */
export async function createCharge(input: ChargeInput): Promise<ChargeResult> {
  const cfg = getFawryConfig();
  if (!cfg.merchantCode || !cfg.secureKey) {
    return { ok: false, reason: 'fawry-not-configured' };
  }

  const items = [{ itemId: input.itemId, description: input.description, price: input.amount, quantity: 1 }];
  for (const it of items) {
    const parsed = ChargeRequestItem.safeParse(it);
    if (!parsed.success) return { ok: false, reason: 'invalid-item' };
  }

  const signature = buildPaySignature({
    merchantCode: cfg.merchantCode,
    merchantRefNum: input.merchantRefNum,
    customerProfileId: input.customerProfileId,
    paymentMethod: input.paymentMethod,
    amount: input.amount,
    cardNumber: input.card?.number,
    cardExpiryYear: input.card?.expiryYear,
    cardExpiryMonth: input.card?.expiryMonth,
    cvv: input.card?.cvv,
    secureKey: cfg.secureKey,
  });

  const body = {
    merchantCode: cfg.merchantCode,
    merchantRefNum: input.merchantRefNum,
    customerProfileId: input.customerProfileId,
    customerEmail: input.customerEmail,
    customerMobile: input.customerMobile,
    customerName: input.customerName,
    paymentMethod: input.paymentMethod,
    amount: input.amount,
    description: input.description,
    chargeItems: items,
    currencyCode: 'EGP',
    language: 'ar-eg',
    signature,
    ...(input.card
      ? {
          cardNumber: input.card.number,
          cardExpiryYear: input.card.expiryYear,
          cardExpiryMonth: input.card.expiryMonth,
          cvv: input.card.cvv,
        }
      : {}),
  };

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(`${cfg.baseUrl}/ECommerceWeb/Fawry/payments/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    const json = (await res.json().catch(() => null)) as unknown;
    const parsed = FawryChargeResponse.safeParse(json);
    if (!parsed.success) return { ok: false, reason: 'invalid-response' };
    const r = parsed.data;
    if (r.statusCode !== 200 || !r.referenceNumber) {
      return { ok: false, reason: r.statusDescription || 'fawry-error', statusCode: r.statusCode };
    }
    return {
      ok: true,
      referenceNumber: String(r.referenceNumber),
      merchantRefNumber: r.merchantRefNumber ?? input.merchantRefNum,
      orderAmount: r.orderAmount ?? input.amount,
      paymentMethod: input.paymentMethod,
      expirationTime: r.expirationTime ?? 0,
      statusCode: r.statusCode,
      statusDescription: r.statusDescription,
    };
  } catch (e) {
    clearTimeout(timeout);
    const msg = e instanceof Error ? e.message : 'unknown-error';
    return { ok: false, reason: msg.includes('aborted') ? 'timeout' : 'network-error' };
  }
}
