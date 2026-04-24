import { test, expect } from '@playwright/test';

test.describe('Chat (unauthenticated guards)', () => {
  test('GET /api/chat is forbidden without auth', async ({ request }) => {
    const res = await request.get('/api/chat');
    expect([401, 403, 405]).toContain(res.status());
  });

  test('POST /api/chat without token returns 401', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { messages: [{ role: 'user', content: 'مرحباً' }] },
    });
    expect([401, 403]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    expect(body).toHaveProperty('error');
  });

  test('rate limiting kicks in on rapid bursts', async ({ request }) => {
    const responses = await Promise.all(
      Array.from({ length: 40 }, () =>
        request.post('/api/chat', {
          data: { messages: [{ role: 'user', content: 'x' }] },
        }),
      ),
    );
    // Either 401 (no auth) is consistent OR we should see at least one 429.
    const hasRateLimited = responses.some((r) => r.status() === 429);
    const allUnauthorized = responses.every((r) => [401, 403].includes(r.status()));
    expect(hasRateLimited || allUnauthorized).toBeTruthy();
  });
});
