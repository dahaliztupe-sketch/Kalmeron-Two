// @ts-nocheck
import { z } from 'zod';
import { defineNotConfigured } from './_stub';
const EMAIL_HINT = 'SENDGRID_API_KEY أو RESEND_API_KEY';
const WA_HINT = 'TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM';
const TG_HINT = 'TELEGRAM_BOT_TOKEN';
export const communicationTools = {
  send_email: defineNotConfigured('send_email',
    'إرسال بريد إلكتروني.',
    z.object({ to: z.string().email(), subject: z.string(), body: z.string(), html: z.boolean().default(false) }),
    EMAIL_HINT),
  read_emails: defineNotConfigured('read_emails',
    'قراءة آخر الرسائل من صندوق الوارد.',
    z.object({ limit: z.number().default(20), unreadOnly: z.boolean().default(true) }),
    'IMAP_HOST/USER/PASSWORD أو Gmail OAuth'),
  send_whatsapp: defineNotConfigured('send_whatsapp',
    'إرسال رسالة WhatsApp.',
    z.object({ to: z.string(), body: z.string() }),
    WA_HINT),
  send_telegram: defineNotConfigured('send_telegram',
    'إرسال رسالة Telegram.',
    z.object({ chatId: z.string(), text: z.string() }),
    TG_HINT),
};
