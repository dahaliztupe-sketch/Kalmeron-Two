/**
 * Unified API error hierarchy + Problem+JSON formatter (RFC 9457).
 *
 * Throw one of the typed `HTTPError` subclasses anywhere inside a route
 * handler wrapped by `guardedRoute`, and the guard will turn it into a
 * canonical JSON response with the correct status code, machine-readable
 * `code`, Arabic `message`, and the `X-Request-ID` header preserved.
 *
 * Example:
 *   if (!user) throw new NotFoundError('user_not_found', 'المستخدم غير موجود');
 *
 * The hierarchy mirrors the public REST API documented in
 * `docs/api/openapi.yaml`. Any new error code added here MUST be reflected
 * in that spec to keep the public contract spec-first.
 */
import { NextResponse } from 'next/server';

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  instance?: string;
  errors?: unknown;
}

export class HTTPError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly detail?: string;
  public readonly errors?: unknown;
  public readonly type: string;

  constructor(
    status: number,
    code: string,
    message: string,
    options: { detail?: string; errors?: unknown; type?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'HTTPError';
    this.status = status;
    this.code = code;
    this.detail = options.detail;
    this.errors = options.errors;
    this.type = options.type ?? `https://kalmeron.com/errors/${code}`;
    if (options.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }

  toProblem(instance?: string): ProblemDetails {
    return {
      type: this.type,
      title: this.message,
      status: this.status,
      code: this.code,
      detail: this.detail,
      instance,
      errors: this.errors,
    };
  }

  toResponse(requestId?: string, instance?: string): NextResponse {
    const headers: Record<string, string> = { 'Content-Type': 'application/problem+json' };
    if (requestId) headers['X-Request-ID'] = requestId;
    return NextResponse.json(
      { error: this.code, message: this.message, ...this.toProblem(instance) },
      { status: this.status, headers },
    );
  }
}

export class BadRequestError extends HTTPError {
  constructor(code = 'invalid_request', message = 'الطلب غير صالح', detail?: string, errors?: unknown) {
    super(400, code, message, { detail, errors });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(code = 'unauthorized', message = 'غير مصرح', detail?: string) {
    super(401, code, message, { detail });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HTTPError {
  constructor(code = 'forbidden', message = 'ممنوع', detail?: string) {
    super(403, code, message, { detail });
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HTTPError {
  constructor(code = 'not_found', message = 'غير موجود', detail?: string) {
    super(404, code, message, { detail });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HTTPError {
  constructor(code = 'conflict', message = 'تعارض في الحالة', detail?: string) {
    super(409, code, message, { detail });
    this.name = 'ConflictError';
  }
}

export class RateLimitedError extends HTTPError {
  constructor(code = 'rate_limited', message = 'تم تجاوز حد الطلبات', detail?: string) {
    super(429, code, message, { detail });
    this.name = 'RateLimitedError';
  }
}

export class InternalError extends HTTPError {
  constructor(code = 'internal_error', message = 'خطأ غير متوقع', detail?: string) {
    super(500, code, message, { detail });
    this.name = 'InternalError';
  }
}

export class ServiceUnavailableError extends HTTPError {
  constructor(code = 'service_unavailable', message = 'الخدمة غير متاحة مؤقتاً', detail?: string) {
    super(503, code, message, { detail });
    this.name = 'ServiceUnavailableError';
  }
}

/** Type-guard used by route-guard to detect typed errors. */
export function isHTTPError(err: unknown): err is HTTPError {
  return err instanceof HTTPError;
}
