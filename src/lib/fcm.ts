"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging, type MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

let _messaging: Messaging | null = null;

function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) return null;
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    if (!_messaging) _messaging = getMessaging(app);
    return _messaging;
  } catch {
    return null;
  }
}

export async function registerFCMServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (existing) return existing;
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  } catch (e) {
    console.warn("[FCM] SW registration failed", e);
    return null;
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

export async function getFCMToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY not set");
    return null;
  }
  const messaging = getFirebaseMessaging();
  if (!messaging) return null;

  try {
    const sw = await registerFCMServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: sw ?? undefined,
    });
    return token ?? null;
  } catch (e) {
    console.warn("[FCM] getToken failed", e);
    return null;
  }
}

export function onForegroundMessage(handler: (payload: MessagePayload) => void): () => void {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}
