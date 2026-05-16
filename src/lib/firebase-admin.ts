import { initializeApp, cert, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

/**
 * Parse Firebase Admin credentials from environment variables.
 *
 * Supports two formats:
 *  1. FIREBASE_SERVICE_ACCOUNT_KEY — a single JSON blob with the full service account.
 *  2. Separate vars: FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_CLIENT_EMAIL +
 *     FIREBASE_ADMIN_PRIVATE_KEY — the format produced by Replit secrets when
 *     individual fields are stored instead of the whole JSON blob.
 *
 * Returns null if neither format is available, causing initializeApp() to
 * fall back to Application Default Credentials (ADC).
 */
function parseServiceAccount() {
  // Format 1: single JSON blob
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.project_id) {
        return parsed;
      }
    } catch {
      // fall through to format 2
    }
  }

  // Format 2: separate env vars (Replit secrets style)
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return {
      type: 'service_account',
      project_id: projectId,
      client_email: clientEmail,
      // Replit stores newlines as literal \n sequences — unescape them so the
      // RSA private key is in the correct PEM format.
      private_key: privateKey.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

/**
 * Lazy initialization of Firebase Admin.
 *
 * Why lazy?
 * --------
 * Next.js runs `collectPageData` at build time which evaluates every API
 * route module. If `firebase-admin` initializes at module-load and the
 * service-account credentials are missing (CI, mock-mode, or a fresh
 * deploy without secrets) it throws `auth/invalid-api-key` and breaks
 * the entire build. By deferring the initialization to the first actual
 * call site (request handler), the build phase never touches Firebase
 * and only real runtime requests pay the init cost.
 *
 * The exported `adminDb` / `adminAuth` are Proxies that look like the
 * SDK objects but only resolve the underlying Firebase client on the
 * first property access. This is fully type-compatible with previous
 * direct usage (`adminAuth.verifyIdToken(...)` etc.) so no caller needs
 * to change.
 */
let _app: App | null = null;
function app(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }
  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) {
    // Fallback for development / managed runtimes that provide ADC.
    _app = initializeApp();
  } else {
    _app = initializeApp({ credential: cert(serviceAccount) });
  }
  return _app;
}

let _db: Firestore | null = null;
let _auth: Auth | null = null;

function lazy<T extends object>(getter: () => T): T {
  return new Proxy({} as T, {
    get(_t, prop, receiver) {
      const target = getter();
      const value = Reflect.get(target as object, prop, receiver);
      // Bind methods so `this` is the real SDK object, not the Proxy.
      return typeof value === 'function' ? (value as () => unknown).bind(target) : value;
    },
    has(_t, prop) {
      return Reflect.has(getter() as object, prop);
    },
    ownKeys() {
      return Reflect.ownKeys(getter() as object);
    },
    getOwnPropertyDescriptor(_t, prop) {
      return Reflect.getOwnPropertyDescriptor(getter() as object, prop);
    },
  }) as T;
}

export const adminDb = lazy<Firestore>(() => {
  if (!_db) _db = getFirestore(app());
  return _db;
});

export const adminAuth = lazy<Auth>(() => {
  if (!_auth) _auth = getAuth(app());
  return _auth;
});

/**
 * Direct accessor — use only if you need the raw `App` instance (rare).
 * Calling this triggers Firebase initialization immediately.
 */
export function adminApp(): App {
  return app();
}
