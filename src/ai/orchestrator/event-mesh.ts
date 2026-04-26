// @ts-nocheck
/**
 * Event Mesh — طبقة أحداث (in-process EventEmitter + Firestore log).
 * يستخدمها أي وكيل لنشر/الاشتراك في أحداث المشروع.
 */
import { EventEmitter } from 'events';
import { adminDb } from '@/src/lib/firebase-admin';

const bus: EventEmitter = (globalThis as unknown).__kalmeronEventMesh
  || ((globalThis as unknown).__kalmeronEventMesh = new EventEmitter());
bus.setMaxListeners(0);

export interface MeshEvent {
  topic: string;
  userId: string;
  source: string;
  payload: unknown;
  timestamp?: Date;
}

export async function publishEvent(e: MeshEvent) {
  const enriched = { ...e, timestamp: e.timestamp || new Date() };
  bus.emit(e.topic, enriched);
  bus.emit('*', enriched);
  try {
    await adminDb.collection('event_log').add(enriched);
  } catch { /* don't break callers if firestore unavailable */ }
  return enriched;
}

export function subscribe(topic: string, listener: (e: MeshEvent) => void) {
  bus.on(topic, listener);
  return () => bus.off(topic, listener);
}

export function subscribeAll(listener: (e: MeshEvent) => void) {
  bus.on('*', listener);
  return () => bus.off('*', listener);
}

export const eventMeshBus = bus;
