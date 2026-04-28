// @ts-nocheck
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  type Auth,
  type User,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { quickFirebase } from '@tthbfo2/firebase-cost-trimmer';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firestoreDatabaseId =
  process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || undefined;

/**
 * Lazy initialization for the Firebase **client** SDK.
 *
 * Why lazy?
 * --------
 * Next.js's `collectPageData` evaluates every route module at build time.
 * If `initializeApp(firebaseConfig)` runs at module-load and any of the
 * `NEXT_PUBLIC_FIREBASE_*` env vars is missing (CI, mock-mode, fresh
 * deploy), Firebase throws `auth/invalid-api-key` and the build dies with
 * "Failed to collect page data for /api/chat". Deferring the init to
 * the first property access on `db` / `auth` (via a Proxy) means the
 * build phase never touches Firebase and only real runtime callers pay
 * the init cost.
 *
 * The exported `db` and `auth` are Proxies that look like the SDK
 * objects but resolve the underlying Firebase client lazily on first
 * property access. Method calls like `db.collection(...)` or
 * `auth.signInWithPopup(...)` continue to work unchanged because the
 * Proxy's `get` trap binds methods to the real SDK target.
 */

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _optimizer: ReturnType<typeof quickFirebase> | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (getApps().length) {
    _app = getApp();
  } else {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
}

function getOptimizer() {
  if (!_optimizer) _optimizer = quickFirebase(getFirebaseApp());
  return _optimizer;
}

function buildAuth(application: FirebaseApp): Auth {
  // Auth with explicit persistence chain — see history below.
  // Default `getAuth()` uses indexedDBLocalPersistence only, which can fail
  // in private mode, in-app browsers (Telegram/WhatsApp/Facebook), or when
  // storage is blocked — causing users to be logged out on every page load.
  // We explicitly try indexedDB → localStorage → sessionStorage → memory so
  // auth always persists when *any* storage is available, and never crashes
  // when none is.
  if (typeof window === 'undefined') {
    return getAuth(application);
  }
  try {
    return initializeAuth(application, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
        inMemoryPersistence,
      ],
      // Required so signInWithPopup / signInWithRedirect / getRedirectResult
      // work without throwing auth/argument-error.
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    // initializeAuth throws if already initialized (HMR, double-import) — fall back.
    return getAuth(application);
  }
}

function lazy<T extends object>(getter: () => T): T {
  return new Proxy({} as T, {
    get(_t, prop, receiver) {
      const target = getter();
      const value = Reflect.get(target as object, prop, receiver);
      // Bind methods so `this` is the real SDK object, not the Proxy.
      return typeof value === 'function'
        ? (value as () => unknown).bind(target)
        : value;
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

const app = lazy<FirebaseApp>(() => getFirebaseApp());

const db = lazy<Firestore>(() => {
  if (_db) return _db;
  const application = getFirebaseApp();
  // Touch optimizer once to register the app (matches previous eager behavior).
  getOptimizer();
  _db = firestoreDatabaseId
    ? getFirestore(application, firestoreDatabaseId)
    : getFirestore(application);
  return _db;
});

const auth = lazy<Auth>(() => {
  if (_auth) return _auth;
  _auth = buildAuth(getFirebaseApp());
  return _auth;
});

export function registerUserForCaching(user: User) {
  getOptimizer().registerUser({
    uid: user.uid,
    email: user.email || '',
  });
}

export { app, db, auth, googleProvider };
export const optimizer = lazy<ReturnType<typeof quickFirebase>>(() => getOptimizer());
