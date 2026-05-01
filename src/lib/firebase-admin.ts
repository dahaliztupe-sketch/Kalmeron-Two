import { initializeApp, cert, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

/**
 * Parse the FIREBASE_SERVICE_ACCOUNT_KEY env var defensively.
 *
 * Previously a single `JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)`
 * crashed the entire process at module-load time if the variable was a
 * malformed JSON blob — which produced an opaque "Unexpected token …"
 * error with no hint at the actual root cause. We now log a structured
 * warning and fall back to ADC (Application Default Credentials).
 */
function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.project_id) {
      console.warn(
        '[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY parsed but missing required fields (project_id). Falling back to ADC.',
      );
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn(
      '[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Falling back to ADC. Detail:',
      e instanceof Error ? e.message : String(e),
    );
    return null;
  }
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
