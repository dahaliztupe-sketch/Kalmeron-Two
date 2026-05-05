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

/** تأكيد الاشتراك — يُرسَل مباشرة بعد webhook نجاح الدفع */
export async function sendSubscriptionConfirmation(
  email: string,
  plan: string,
  cycle: "monthly" | "annual",
  amountFormatted: string,
): Promise<SendResult> {
  const cycleAr = cycle === "annual" ? "سنوي" : "شهري";
  return sendEmail({
    to: email,
    subject: `🎉 تم تفعيل اشتراكك في كلميرون — ${plan}`,
    text: `مرحباً،\n\nتم تفعيل اشتراكك في باقة "${plan}" (${cycleAr}) بنجاح.\nالمبلغ المدفوع: ${amountFormatted}\n\nيمكنك الآن الاستفادة الكاملة من جميع مميزات الباقة.\n\nلإدارة اشتراكك أو تنزيل الفواتير، زُر: https://kalmeron.app/account/billing\n\nشكراً لثقتك في كلميرون!\nفريق كلميرون`,
    html: `<div dir="rtl" style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a2e">
      <h2 style="color:#7c3aed">🎉 تم تفعيل اشتراكك بنجاح!</h2>
      <p>مرحباً،</p>
      <p>تم تفعيل اشتراكك في باقة <strong>${plan}</strong> (${cycleAr}) بنجاح.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#f8f8f8;border-radius:8px">
        <tr><td style="padding:8px 16px;font-weight:bold">الباقة</td><td style="padding:8px 16px">${plan} — ${cycleAr}</td></tr>
        <tr><td style="padding:8px 16px;font-weight:bold">المبلغ المدفوع</td><td style="padding:8px 16px">${amountFormatted}</td></tr>
      </table>
      <p>يمكنك الآن الاستفادة الكاملة من جميع مميزات الباقة.</p>
      <a href="https://kalmeron.app/account/billing" style="display:inline-block;margin:12px 0;padding:10px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">إدارة الاشتراك</a>
      <p style="color:#888;font-size:12px">فريق كلميرون</p>
    </div>`,
  });
}

/** تحذير 80% كريدت — يُرسَل عند تجاوز نسبة الاستهلاك */
export async function sendCreditWarning(
  email: string,
  usedPct: number,
): Promise<SendResult> {
  const pctStr = Math.round(usedPct).toString();
  return sendEmail({
    to: email,
    subject: `⚠️ تنبيه: استخدمت ${pctStr}% من رصيدك في كلميرون`,
    text: `مرحباً،\n\nلقد استخدمت ${pctStr}% من رصيدك الشهري في كلميرون.\n\nلتجنب انقطاع الخدمة، يُنصح بترقية باقتك أو الانتظار حتى تاريخ التجديد.\n\nرقّي باقتك الآن: https://kalmeron.app/pricing\n\nفريق كلميرون`,
    html: `<div dir="rtl" style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a2e">
      <h2 style="color:#d97706">⚠️ تنبيه رصيد كلميرون</h2>
      <p>مرحباً،</p>
      <p>لقد استخدمت <strong style="color:#d97706">${pctStr}%</strong> من رصيدك الشهري.</p>
      <p>لتجنب انقطاع الخدمة، يُنصح بترقية باقتك أو الانتظار حتى تاريخ التجديد.</p>
      <a href="https://kalmeron.app/pricing" style="display:inline-block;margin:12px 0;padding:10px 24px;background:#d97706;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">رقّي باقتك الآن</a>
      <p style="color:#888;font-size:12px">فريق كلميرون</p>
    </div>`,
  });
}

/** تأكيد التجديد السنوي — يُرسَل من customer.subscription.updated */
export async function sendAnnualRenewalConfirmation(
  email: string,
  plan: string,
  renewalDate: string,
): Promise<SendResult> {
  return sendEmail({
    to: email,
    subject: `✅ تم تجديد اشتراكك السنوي في كلميرون — ${plan}`,
    text: `مرحباً،\n\nتم تجديد اشتراكك السنوي في باقة "${plan}" بنجاح.\nتاريخ التجديد القادم: ${renewalDate}\n\nلإدارة اشتراكك أو تنزيل الفواتير: https://kalmeron.app/account/billing\n\nشكراً لاستمرار ثقتك في كلميرون!\nفريق كلميرون`,
    html: `<div dir="rtl" style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a2e">
      <h2 style="color:#059669">✅ تم تجديد اشتراكك السنوي</h2>
      <p>مرحباً،</p>
      <p>تم تجديد اشتراكك السنوي في باقة <strong>${plan}</strong> بنجاح.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#f8f8f8;border-radius:8px">
        <tr><td style="padding:8px 16px;font-weight:bold">الباقة</td><td style="padding:8px 16px">${plan}</td></tr>
        <tr><td style="padding:8px 16px;font-weight:bold">تاريخ التجديد القادم</td><td style="padding:8px 16px">${renewalDate}</td></tr>
      </table>
      <a href="https://kalmeron.app/account/billing" style="display:inline-block;margin:12px 0;padding:10px 24px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">إدارة الاشتراك</a>
      <p style="color:#888;font-size:12px">فريق كلميرون</p>
    </div>`,
  });
}
