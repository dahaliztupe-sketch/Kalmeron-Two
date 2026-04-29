import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isEmailEnabled, sendEmail } from '@/src/lib/notifications/email';

describe('Email notifications', () => {
  describe('isEmailEnabled()', () => {
    it('returns false when RESEND_API_KEY is not set', () => {
      delete process.env.RESEND_API_KEY;
      expect(isEmailEnabled()).toBe(false);
    });

    it('returns true when RESEND_API_KEY is set', () => {
      process.env.RESEND_API_KEY = 'test_key';
      expect(isEmailEnabled()).toBe(true);
      delete process.env.RESEND_API_KEY;
    });
  });

  describe('sendEmail()', () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
    });

    afterEach(() => {
      delete process.env.RESEND_API_KEY;
      vi.restoreAllMocks();
    });

    it('returns no-provider when API key is missing', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Hello',
      });
      expect(result.delivered).toBe(false);
      expect(result.reason).toBe('no-provider');
    });

    it('returns invalid-input for malformed email addresses', async () => {
      const result = await sendEmail({
        to: 'not-an-email',
        subject: 'Test',
        text: 'Hello',
      });
      expect(result.delivered).toBe(false);
      expect(result.reason).toBe('invalid-input');
    });

    it('returns invalid-input for empty recipient', async () => {
      const result = await sendEmail({
        to: '',
        subject: 'Test',
        text: 'Hello',
      });
      expect(result.delivered).toBe(false);
      expect(result.reason).toBe('invalid-input');
    });

    it('sends via Resend when API key is set', async () => {
      process.env.RESEND_API_KEY = 'test_key_123';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email_abc123' }),
      }));

      const result = await sendEmail({
        to: 'user@kalmeron.app',
        subject: 'اختبار',
        text: 'محتوى الرسالة',
      });

      expect(result.delivered).toBe(true);
      expect(result.providerId).toBe('email_abc123');
    });

    it('handles Resend API errors gracefully', async () => {
      process.env.RESEND_API_KEY = 'test_key_123';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        text: async () => 'rate limit exceeded',
      }));

      const result = await sendEmail({
        to: 'user@kalmeron.app',
        subject: 'Test',
        text: 'Body',
      });

      expect(result.delivered).toBe(false);
      expect(result.reason).toBe('provider-error');
      expect(result.errorMessage).toContain('rate limit');
    });
  });
});
