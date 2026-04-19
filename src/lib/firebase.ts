import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { quickFirebase } from '@tthbfo2/firebase-cost-trimmer';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kalmeron-two",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
const googleProvider = new GoogleAuthProvider();

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

app = getFirebaseApp();
const optimizer = quickFirebase(app);
db = getFirestore(app);
// ملاحظة: Pipeline operations متاحة عبر REST API أو Client SDKs الجديدة بفضل Firestore Enterprise
auth = getAuth(app);

export function registerUserForCaching(user: User) {
  optimizer.registerUser({
    uid: user.uid,
    email: user.email || '',
  });
}

export { app, db, auth, googleProvider, optimizer };
