/**
 * Cash Runway Alarm — Firestore CRUD for the user's runway snapshot.
 *
 * Path: runway_snapshots/{uid}
 *
 * One document per user. Holds the latest cash / income / burn / threshold,
 * plus dismissal state for the alarm banner.
 */
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/src/lib/firebase";
import type { RunwayInputs, RunwaySnapshot } from "./types";
import { DEFAULT_THRESHOLD_MONTHS } from "./calc";

const COLLECTION = "runway_snapshots";

export async function loadRunwaySnapshot(uid: string): Promise<RunwaySnapshot | null> {
  if (!isFirebaseConfigured() || !uid) return null;
  try {
    const ref = doc(db, COLLECTION, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<RunwaySnapshot>;
    return {
      uid,
      cashEgp: Number(data.cashEgp ?? 0),
      monthlyIncomeEgp: Number(data.monthlyIncomeEgp ?? 0),
      monthlyBurnEgp: Number(data.monthlyBurnEgp ?? 0),
      thresholdMonths: Number(data.thresholdMonths ?? DEFAULT_THRESHOLD_MONTHS),
      updatedAt: String(data.updatedAt ?? new Date().toISOString()),
      lastCheckedAt: data.lastCheckedAt ? String(data.lastCheckedAt) : undefined,
      dismissedUntil: data.dismissedUntil ? String(data.dismissedUntil) : undefined,
    };
  } catch (err) {
    // runway snapshot load failed — returning null
    return null;
  }
}

export async function saveRunwaySnapshot(
  uid: string,
  inputs: RunwayInputs,
): Promise<RunwaySnapshot | null> {
  if (!isFirebaseConfigured() || !uid) return null;
  const now = new Date().toISOString();
  const payload: RunwaySnapshot = {
    uid,
    cashEgp: Number(inputs.cashEgp) || 0,
    monthlyIncomeEgp: Number(inputs.monthlyIncomeEgp) || 0,
    monthlyBurnEgp: Number(inputs.monthlyBurnEgp) || 0,
    thresholdMonths: Number(inputs.thresholdMonths) || DEFAULT_THRESHOLD_MONTHS,
    updatedAt: now,
    lastCheckedAt: now,
  };
  try {
    const ref = doc(db, COLLECTION, uid);
    await setDoc(ref, payload, { merge: true });
    return payload;
  } catch (err) {
    // runway snapshot save failed
    return null;
  }
}

export async function dismissRunwayAlarm(uid: string, days: number = 7): Promise<void> {
  if (!isFirebaseConfigured() || !uid) return;
  const until = new Date(Date.now() + days * 86_400_000).toISOString();
  try {
    const ref = doc(db, COLLECTION, uid);
    await updateDoc(ref, { dismissedUntil: until });
  } catch (err) {
    // runway alarm dismiss failed
  }
}
