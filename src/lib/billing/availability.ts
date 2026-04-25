/**
 * Client-side helper to query whether self-serve Stripe billing is available.
 * The /api/billing/status endpoint returns `{ stripeConfigured: boolean }` and
 * is cached for 60s. We use this everywhere the UI needs to gracefully degrade
 * (disable Subscribe buttons, swap CTA to "تواصل مع المبيعات", etc.).
 */
export async function fetchBillingAvailability(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch('/api/billing/status', { cache: 'no-store', signal });
    if (!res.ok) return false;
    const data = (await res.json()) as { stripeConfigured?: boolean };
    return Boolean(data.stripeConfigured);
  } catch {
    return false;
  }
}
