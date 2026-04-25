import { describe, it, expect } from 'vitest';
import {
  HTTPError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitedError,
  InternalError,
  ServiceUnavailableError,
  isHTTPError,
} from '@/src/lib/security/api-error';

describe('api-error hierarchy', () => {
  const cases: Array<[new () => HTTPError, number, string]> = [
    [BadRequestError, 400, 'invalid_request'],
    [UnauthorizedError, 401, 'unauthorized'],
    [ForbiddenError, 403, 'forbidden'],
    [NotFoundError, 404, 'not_found'],
    [ConflictError, 409, 'conflict'],
    [RateLimitedError, 429, 'rate_limited'],
    [InternalError, 500, 'internal_error'],
    [ServiceUnavailableError, 503, 'service_unavailable'],
  ];

  it.each(cases)('%s → status %d / code %s', (Cls, status, code) => {
    const err = new Cls();
    expect(err).toBeInstanceOf(HTTPError);
    expect(err.status).toBe(status);
    expect(err.code).toBe(code);
    expect(isHTTPError(err)).toBe(true);
  });

  it('toProblem includes RFC 9457 fields', () => {
    const err = new BadRequestError('bad_field', 'حقل غير صالح', 'name is required');
    const p = err.toProblem('/api/foo');
    expect(p.status).toBe(400);
    expect(p.code).toBe('bad_field');
    expect(p.title).toBe('حقل غير صالح');
    expect(p.detail).toBe('name is required');
    expect(p.instance).toBe('/api/foo');
    expect(p.type).toMatch(/kalmeron/);
  });

  it('toResponse sets Content-Type to problem+json and propagates X-Request-ID', async () => {
    const err = new ForbiddenError();
    const res = err.toResponse('req-123', '/api/secret');
    expect(res.status).toBe(403);
    expect(res.headers.get('Content-Type')).toBe('application/problem+json');
    expect(res.headers.get('X-Request-ID')).toBe('req-123');
    const body = await res.json();
    expect(body.error).toBe('forbidden');
    expect(body.code).toBe('forbidden');
  });

  it('isHTTPError is false for plain errors', () => {
    expect(isHTTPError(new Error('x'))).toBe(false);
    expect(isHTTPError(null)).toBe(false);
    expect(isHTTPError('boom')).toBe(false);
  });
});
