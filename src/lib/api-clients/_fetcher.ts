/**
 * Tiny shared fetch helper for typed microservice clients.
 *
 * Why hand-rolled instead of openapi-fetch?
 *   - We already standardise on native fetch + AbortSignal across the codebase.
 *   - Keeping zero extra runtime deps for a 30-line helper.
 *
 * Each service-specific client file imports this and supplies its own typed
 * paths/operations from the auto-generated `<service>.types.ts`.
 */

export class ServiceError extends Error {
  constructor(
    public readonly service: string,
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `${service} returned HTTP ${status}`);
    this.name = "ServiceError";
  }
}

export interface ServiceFetchOptions {
  /** Override the base URL (defaults to the per-service env var). */
  baseUrl?: string;
  /** Request timeout in milliseconds. Default 30s. */
  timeoutMs?: number;
  /** Extra headers (Content-Type is set automatically for JSON bodies). */
  headers?: Record<string, string>;
  /** Body — if a plain object, it's JSON-stringified; otherwise passed through. */
  body?: unknown;
  /** HTTP method. Default GET (or POST when body is provided). */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}

export async function serviceFetch<TResponse>(
  service: string,
  baseUrlEnv: string,
  path: string,
  opts: ServiceFetchOptions = {},
): Promise<TResponse> {
  const baseUrl =
    opts.baseUrl ?? process.env[baseUrlEnv] ?? `http://localhost`;
  const url = baseUrl.replace(/\/$/, "") + path;

  const isJsonBody =
    opts.body !== undefined &&
    typeof opts.body === "object" &&
    !(opts.body instanceof FormData) &&
    !(opts.body instanceof ArrayBuffer);

  const init: RequestInit = {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers ?? {}),
    },
    body: isJsonBody
      ? JSON.stringify(opts.body)
      : (opts.body as BodyInit | undefined),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
  };

  const res = await fetch(url, init);
  const text = await res.text();
  let parsed: unknown = text;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // leave as text
    }
  }
  if (!res.ok) {
    throw new ServiceError(service, res.status, parsed);
  }
  return parsed as TResponse;
}
