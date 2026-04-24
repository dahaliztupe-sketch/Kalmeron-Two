/**
 * SSRF guard for outbound HTTP — the receiving URL must pass this filter
 * before we open a socket. Used by `webhooks/dispatcher.ts` and any other
 * place that fetches a customer-supplied URL.
 *
 * Strategy:
 *   1. Scheme must be https (in dev we tolerate http for localhost only).
 *   2. Host must not resolve to a private / loopback / link-local range.
 *      We do a DNS lookup at validation time and again right before fetch
 *      (DNS rebinding defense).
 *   3. Hostname must not match a small denylist of internal-looking suffixes.
 *
 * This module deliberately has no external deps so it works in Edge runtime
 * for the validation step; the DNS resolution path needs Node runtime and
 * is only invoked from `assertSafeUrlNode`.
 */

const PRIVATE_V4_RANGES: Array<[string, number]> = [
  ['10.0.0.0', 8],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['100.64.0.0', 10],
  ['0.0.0.0', 8],
];

const FORBIDDEN_HOST_SUFFIXES = [
  '.internal',
  '.local',
  '.localhost',
  '.lan',
  '.intranet',
  '.corp',
];

function ipToInt(ip: string): number | null {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return null;
  // Use unsigned arithmetic.
  return ((parts[0]! * 256 + parts[1]!) * 256 + parts[2]!) * 256 + parts[3]!;
}

function inRange(ip: string, base: string, prefix: number): boolean {
  const a = ipToInt(ip);
  const b = ipToInt(base);
  if (a == null || b == null) return false;
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return ((a & mask) >>> 0) === ((b & mask) >>> 0);
}

export function isPrivateIPv4(ip: string): boolean {
  return PRIVATE_V4_RANGES.some(([base, p]) => inRange(ip, base, p));
}

export function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;   // fc00::/7 unique-local
  if (lower.startsWith('fe80')) return true;                            // link-local
  if (lower.startsWith('::ffff:')) {
    return isPrivateIPv4(lower.slice(7));
  }
  return false;
}

export interface UrlValidationResult {
  ok: boolean;
  reason?: string;
}

/** Synchronous validation — no DNS. Safe for Edge runtime. */
export function validateOutboundUrl(raw: string, opts: { allowHttp?: boolean } = {}): UrlValidationResult {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }

  const allowHttp = opts.allowHttp ?? process.env.NODE_ENV !== 'production';
  if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) {
    return { ok: false, reason: 'protocol_not_allowed' };
  }

  const host = url.hostname.toLowerCase();
  if (!host) return { ok: false, reason: 'empty_host' };

  if (host === 'localhost') return { ok: false, reason: 'localhost_forbidden' };

  if (FORBIDDEN_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return { ok: false, reason: 'internal_suffix_forbidden' };
  }

  // Direct IP literal in URL — block if private.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    if (isPrivateIPv4(host)) return { ok: false, reason: 'private_ipv4' };
  } else if (host.includes(':')) {
    if (isPrivateIPv6(host.replace(/^\[|\]$/g, ''))) {
      return { ok: false, reason: 'private_ipv6' };
    }
  }

  return { ok: true };
}

/**
 * Full validation including DNS resolution. Run on Node runtime right before
 * the actual fetch so the resolved IP cannot have flipped (DNS rebinding).
 *
 * Returns the resolved IP that callers SHOULD pin the request to (via the
 * `ip:` URL trick) when extra paranoia is required.
 */
export async function assertSafeUrlNode(raw: string, opts: { allowHttp?: boolean } = {}): Promise<{
  ok: boolean;
  reason?: string;
  resolvedIp?: string;
}> {
  const sync = validateOutboundUrl(raw, opts);
  if (!sync.ok) return sync;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(':')) {
      return { ok: true, resolvedIp: host };
    }
    const dns = await import('node:dns/promises');
    const records = await dns.lookup(host, { all: true });
    for (const r of records) {
      const isV6 = r.family === 6;
      if (isV6 ? isPrivateIPv6(r.address) : isPrivateIPv4(r.address)) {
        return { ok: false, reason: 'dns_resolves_to_private' };
      }
    }
    return { ok: true, resolvedIp: records[0]?.address };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'dns_lookup_failed' };
  }
}
