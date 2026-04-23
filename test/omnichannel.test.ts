import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/lib/firebase-admin', () => ({
  adminDb: {
    collection: () => ({
      add: async () => ({ id: 'mock' }),
      where: () => ({ where: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [] }) }) }) }),
    }),
  },
}));

const originalFetch = globalThis.fetch;

describe('omnichannel gateway', () => {
  beforeEach(() => { vi.resetModules(); });

  it('refuses whatsapp send when credentials are missing', async () => {
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    const { sendMessage } = await import('@/src/lib/integrations/omnichannel');
    const res = await sendMessage('whatsapp', { text: 'hi' }, '123');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/credentials/);
  });

  it('refuses telegram send when token is missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const { sendMessage } = await import('@/src/lib/integrations/omnichannel');
    const res = await sendMessage('telegram', { text: 'hi' }, '123');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/token/i);
  });

  it('refuses email when key is missing', async () => {
    delete process.env.SENDGRID_API_KEY;
    const { sendMessage } = await import('@/src/lib/integrations/omnichannel');
    const res = await sendMessage('email', { text: 'hi', subject: 's' }, 'a@b.c');
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/SendGrid/);
  });

  it('returns inbound message structure with null userId when unknown', async () => {
    const { receiveMessage } = await import('@/src/lib/integrations/omnichannel');
    const msg = await receiveMessage('telegram', { text: 'hello' }, 'chat_42');
    expect(msg.channel).toBe('telegram');
    expect(msg.senderId).toBe('chat_42');
    expect(msg.text).toBe('hello');
    expect(msg.userId).toBeNull();
  });
});

describe('whatsapp send with credentials', () => {
  it('posts to graph.facebook.com', async () => {
    process.env.WHATSAPP_ACCESS_TOKEN = 'tok';
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'phone';
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ messages: [{ id: 'wamid.TEST' }] }),
    }));
    globalThis.fetch = fetchMock as any;
    const { sendMessage } = await import('@/src/lib/integrations/omnichannel');
    const res = await sendMessage('whatsapp', { text: 'hi' }, '+201000');
    expect(res.ok).toBe(true);
    expect(res.providerMessageId).toBe('wamid.TEST');
    expect(fetchMock).toHaveBeenCalled();
    globalThis.fetch = originalFetch;
  });
});
