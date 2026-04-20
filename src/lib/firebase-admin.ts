// @ts-nocheck
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) 
  : null;

function getAdminApp() {
  if (getApps().length === 0) {
    if (!serviceAccount) {
      // Fallback for development if service account is missing but env permits
      return initializeApp();
    }
    return initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getApp();
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export { adminApp };
