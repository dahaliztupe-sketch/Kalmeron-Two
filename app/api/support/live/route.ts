import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitAgent, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs'; // For WebSockets, Node.js runtime is often required on Vercel over pure edge

const TOKEN_TTL_SECONDS = 60 * 5; // 5 minutes
const TOKEN_SECRET =
  process.env.LIVE_SUPPORT_TOKEN_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET || // pragma: allowlist
  process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
  'kalmeron-default-live-support-pepper';

/**
 * Issue a short-lived, HMAC-signed token bound to the authenticated user.
 *
 * Format: `<userId>.<expiresAt>.<hmacBase64Url>`. Downstream services can
 * verify with the same secret without an extra Firestore round trip.
 */
function signEphemeralToken(userId: string): { token: string; expiresAt: number } {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
  return { token: `${payload}.${sig}`, expiresAt };
}

/**
 * GET /api/support/live — issues an ephemeral, HMAC-signed token that the
 * browser uses to open a WebSocket session with the regional Live Support
 * gateway.
 *
 * SECURITY:
 *   - Requires a Firebase ID token. Previously open to anyone, which let
 *     unauthenticated visitors mint tokens against the gateway.
 *   - Tokens are HMAC-signed and bound to the authenticated UID + a 5-minute
 *     expiry, so a leaked token cannot be replayed indefinitely.
 *   - Per-user rate limit (10/min) prevents one account from hoarding
 *     gateway capacity.
 */
export async function GET(req: NextRequest) {
  // Per-IP rate limit
  const ipRl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!ipRl.success) return rateLimitResponse();

  // Authenticate
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // Per-user rate limit
  const userRl = rateLimitAgent(userId, 'live_support_token', { limit: 10, windowMs: 60_000 });
  if (!userRl.allowed) return rateLimitResponse();

  try {
    const { token, expiresAt } = signEphemeralToken(userId);
    const gatewayUrl =
      process.env.LIVE_SUPPORT_GATEWAY_URL ||
      'wss://gateway.ai.vercel.com/v1/live/kalmeron/gemini-2.5-flash-live';

    return NextResponse.json({
      url: gatewayUrl,
      token,
      expiresAt,
      instructions:
        'استخدم هذا الرابط لفتح قناة صوت/فيديو مباشرة مع مساعد الدعم الفني. الرمز ينتهي خلال 5 دقائق.',
    });
  } catch (error) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: error, userId }, 'Live Support Session Error');
    return NextResponse.json(
      { error: 'Failed to establish Live Support Session' },
      { status: 500 },
    );
  }
}
