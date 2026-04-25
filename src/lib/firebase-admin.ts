// @ts-nocheck
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

const serviceAccount = parseServiceAccount();

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
