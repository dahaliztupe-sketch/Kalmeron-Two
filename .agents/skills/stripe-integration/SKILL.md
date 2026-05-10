---
name: stripe-integration
description: Stripe payment integration patterns for Next.js App Router. Use when implementing payment flows, subscription management, webhook handling, or billing features. Note: Kalmeron uses Fawry (Egypt) as primary payment processor — use this skill when adding Stripe as an alternative.
---

# Stripe Integration Patterns for Next.js

Official patterns from Stripe engineering.

## Setup
```bash
npm install stripe @stripe/stripe-js
```

```typescript
// src/lib/payments/stripe.ts — server-side client
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// src/lib/payments/stripe-client.ts — client-side
import { loadStripe } from '@stripe/stripe-js';
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

## Checkout Session Pattern
```typescript
// app/api/billing/stripe/checkout/route.ts
import { stripe } from '@/lib/payments/stripe';
import { getServerSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

## Webhook Handler (Critical)
```typescript
// app/api/billing/stripe/webhook/route.ts
import { stripe } from '@/lib/payments/stripe';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

## Subscription Plans (Kalmeron mapping)
```typescript
// Map Kalmeron plans to Stripe price IDs
const PLAN_PRICE_MAP = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
} as const;
```

## Customer Portal
```typescript
// app/api/billing/stripe/portal/route.ts
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
});
return NextResponse.redirect(portalSession.url);
```

## Kalmeron Context

Kalmeron's primary payment processor is **Fawry** (Egypt-specific).
Stripe is a secondary option for international users.

Existing Fawry integration: `app/api/billing/fawry/checkout/route.ts`
Fawry dialog component: `components/billing/FawryDialog.tsx`

When adding Stripe:
1. Add to Replit Secrets: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
2. Create new routes under `app/api/billing/stripe/`
3. Add Stripe option to `FawryDialog.tsx` or create `StripeDialog.tsx`
4. Update `registry.ts` — add `stripe-integration` to `cfo_agent`

## Security Notes
- Never log full Stripe events (contain PII)
- Always verify webhook signatures with `constructEvent()`
- Store `stripeCustomerId` in Firestore, never in client state
- Use `stripe.webhooks.constructEvent()` with raw body (not parsed JSON)
