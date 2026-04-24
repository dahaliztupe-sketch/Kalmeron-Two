// @ts-nocheck
/**
 * api-client — secure HTTP client for the Expo mobile app.
 *
 * Implements **Certificate Pinning** to prevent MITM attacks on the public API.
 * Closes TB7 🔴 in docs/THREAT_MODEL.md.
 *
 * Strategy: SubjectPublicKeyInfo (SPKI) pinning of the leaf certificate's
 * public key (NOT the certificate itself — pinning the cert breaks on every
 * renewal). We pin **two** SPKI hashes at all times: the current production
 * leaf and a backup (next-rotation key). This avoids hard-bricking the app
 * if the production key is compromised mid-rotation.
 *
 * Pin rotation procedure: see src/mobile-app/CERT_PINNING.md.
 *
 * Library: react-native-ssl-pinning (works with Expo bare/development builds;
 * NOT supported in Expo Go — release the app via EAS Build).
 */
import { fetch as pinnedFetch } from 'react-native-ssl-pinning';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.kalmeron.com';

/**
 * Pinned SPKI SHA-256 hashes. Generate via:
 *   openssl s_client -connect api.kalmeron.com:443 -showcerts </dev/null \
 *     | openssl x509 -pubkey -noout \
 *     | openssl pkey -pubin -outform der \
 *     | openssl dgst -sha256 -binary | base64
 *
 * Always include AT LEAST one backup pin (next-rotation key) so a compromised
 * primary pin can be rotated without bricking installed apps.
 */
const PINNED_SPKI_HASHES_BASE64 = (process.env.EXPO_PUBLIC_PINNED_SPKI_HASHES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (PINNED_SPKI_HASHES_BASE64.length < 2 && !__DEV__) {
  // Refuse to build a release without backup pin — protects against bricking.
  throw new Error(
    '[api-client] EXPO_PUBLIC_PINNED_SPKI_HASHES must contain ≥ 2 SPKI hashes ' +
      '(primary + backup). See src/mobile-app/CERT_PINNING.md.',
  );
}

interface ApiOptions extends RequestInit {
  /** When true, attaches the stored Firebase ID token. Defaults to true. */
  authenticated?: boolean;
  /** Per-call timeout (ms). Default 15s. */
  timeoutMs?: number;
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('firebase_id_token');
  } catch {
    return null;
  }
}

/**
 * Pinned fetch — drop-in replacement for global `fetch` that enforces TLS
 * certificate pinning against the app's hardcoded public-key hashes.
 */
export async function apiFetch(path: string, opts: ApiOptions = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Platform': Platform.OS,
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (opts.authenticated !== false) {
    const token = await getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = opts.timeoutMs ?? 15_000;

  // In dev mode, skip pinning so emulators can hit local IPs over plain TLS.
  if (__DEV__ && PINNED_SPKI_HASHES_BASE64.length === 0) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { ...opts, headers, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  }

  // Production / staging: enforce pinning.
  const response = await pinnedFetch(url, {
    method: opts.method || 'GET',
    timeoutInterval: timeoutMs,
    headers,
    body: typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body),
    sslPinning: {
      certs: PINNED_SPKI_HASHES_BASE64,
    },
    pkPinning: true,
    disableAllSecurity: false,
  });

  // react-native-ssl-pinning returns a normalized response; wrap it to look
  // like a standard Response object for consumer code.
  return new Response(response.bodyString || '', {
    status: response.status,
    headers: response.headers as any,
  });
}

/** Convenience helpers. */
export const api = {
  get:    (p: string, o?: ApiOptions) => apiFetch(p, { ...o, method: 'GET' }),
  post:   (p: string, body?: any, o?: ApiOptions) => apiFetch(p, { ...o, method: 'POST', body }),
  put:    (p: string, body?: any, o?: ApiOptions) => apiFetch(p, { ...o, method: 'PUT', body }),
  delete: (p: string, o?: ApiOptions) => apiFetch(p, { ...o, method: 'DELETE' }),
};
