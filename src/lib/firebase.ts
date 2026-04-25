// @ts-nocheck
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  Auth,
  User,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
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

const firestoreDatabaseId = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || undefined;

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

app = getFirebaseApp();
const optimizer = quickFirebase(app);
db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

// ─── Auth with explicit persistence chain ───────────────────────────────
// Default `getAuth()` relies on indexedDBLocalPersistence only, which can fail in
// private mode, in-app browsers (Telegram/WhatsApp/Facebook), or when storage is
// blocked — causing users to be logged out on every page load. We explicitly try
// indexedDB → localStorage → sessionStorage → memory so auth always persists
// when *any* storage is available, and never crashes when none is.
if (typeof window !== 'undefined') {
  try {
    auth = initializeAuth(app, {
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
    auth = getAuth(app);
  }
} else {
  // SSR: no browser storage, just use memory.
  auth = getAuth(app);
}

export function registerUserForCaching(user: User) {
  optimizer.registerUser({
    uid: user.uid,
    email: user.email || '',
  });
}

export { app, db, auth, googleProvider, optimizer };
