"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  requestPushPermission,
  getFCMToken,
  onForegroundMessage,
  registerFCMServiceWorker,
} from "@/src/lib/fcm";
import type { MessagePayload } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export interface ForegroundNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  timestamp: number;
}

export function usePushNotifications(userId?: string) {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<ForegroundNotification[]>([]);
  const unsubRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermissionState);
  }, []);

  useEffect(() => {
    if (permission !== "granted" || !userId) return;
    unsubRef.current = onForegroundMessage((payload: MessagePayload) => {
      const note: ForegroundNotification = {
        id: crypto.randomUUID(),
        title: payload.notification?.title ?? "كلميرون",
        body: payload.notification?.body ?? "",
        icon: payload.notification?.icon,
        url: payload.fcmOptions?.link ?? (payload.data?.url as string) ?? "/dashboard",
        timestamp: Date.now(),
      };
      setNotifications(prev => [note, ...prev.slice(0, 19)]);
    });
    return () => unsubRef.current?.();
  }, [permission, userId]);

  const enable = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await registerFCMServiceWorker();
      const p = await requestPushPermission();
      setPermission(p as PushPermissionState);
      if (p === "granted") {
        const t = await getFCMToken();
        setToken(t);
        if (t && userId) {
          await saveFCMTokenToFirestore(t, userId);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [loading, userId]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return { permission, token, loading, notifications, enable, dismiss, clearAll };
}

async function saveFCMTokenToFirestore(token: string, userId: string): Promise<void> {
  try {
    const tokenId = token.slice(-20);
    await setDoc(
      doc(db, "users", userId, "fcm_tokens", tokenId),
      {
        token,
        uid: userId,
        createdAt: new Date().toISOString(),
        platform: "web",
        active: true,
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[FCM] Failed to save token to Firestore", e);
  }
}
