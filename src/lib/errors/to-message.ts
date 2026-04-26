/**
 * Narrow an `unknown` thrown value into a safe string message.
 *
 * Catch blocks in TypeScript receive `unknown`, so reading `.message` directly
 * is a type error. This helper centralizes the narrowing in one place so
 * route handlers can stay tidy and never surface raw `[object Object]` to
 * callers or logs.
 */
export function toErrorMessage(err: unknown, fallback = 'unknown'): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { message?: unknown };
    if (typeof maybe.message === 'string') return maybe.message;
    try {
      return JSON.stringify(err);
    } catch {
      return fallback;
    }
  }
  return String(err ?? fallback);
}

/** Same as toErrorMessage but also captures `.stack` when present. */
export function toErrorDetails(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) {
    return { message: err.message || 'unknown', stack: err.stack };
  }
  return { message: toErrorMessage(err) };
}
