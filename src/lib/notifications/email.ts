/**
 * Thin email-sending layer. Designed to ship as a SCAFFOLD: when no provider
 * is configured (no `RESEND_API_KEY`), `sendEmail` becomes a no-op that logs
 * the payload and returns `{ delivered: false, reason: 'no-provider' }`.
 *
 * Provider preference: Resend (cleanest API, transactional Egyptian-friendly
 * reputation). Easy to swap for SendGrid by reimplementing `sendEmail`.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  /** Markdown or plain text. Conversion to HTML is handled by the provider
   * helper — we keep this layer free of HTML templates. */
  text: string;
  html?: string;
  /** Optional reply-to override. */
  replyTo?: string;
}

export interface SendResult {
  delivered: boolean;
  providerId?: string;
  reason?: "no-provider" | "provider-error" | "invalid-input";
  errorMessage?: string;
}

const FROM_DEFAULT =
  process.env.EMAIL_FROM ?? "Kalmeron <hello@kalmeron.app>";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(p: EmailPayload): Promise<SendResult> {
  if (!isValidEmail(p.to)) {
    return { delivered: false, reason: "invalid-input" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Scaffold mode — the rest of the system can develop against this without
    // a real provider. Cron jobs that depend on email will log a warning.
    // Email address is redacted to avoid PII in logs.
    const domain = p.to.split("@")[1] ?? "unknown";
    console.info(`[email] RESEND_API_KEY not set — skipping send to *@${domain}: ${p.subject}`);
    return { delivered: false, reason: "no-provider" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_DEFAULT,
        to: [p.to],
        subject: p.subject,
        text: p.text,
        html: p.html,
        reply_to: p.replyTo,
      }),
      // Don't let a slow provider hold the request thread forever.
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      const errorMessage = await res.text().catch(() => "unknown");
      return { delivered: false, reason: "provider-error", errorMessage };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { delivered: true, providerId: data.id };
  } catch (e) {
    return {
      delivered: false,
      reason: "provider-error",
      errorMessage: (e as Error)?.message ?? "unknown",
    };
  }
}
