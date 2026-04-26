// @ts-nocheck
// src/mobile-app/src/lib/offline-storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OfflineStorage = {
  async savePendingMessage(message: unknown): Promise<void> {
    const pending = await this.getPendingMessages();
    pending.push({ ...message, timestamp: Date.now() });
    await AsyncStorage.setItem('pending_messages', JSON.stringify(pending));
  },
  
  async getPendingMessages(): Promise<unknown[]> {
    const stored = await AsyncStorage.getItem('pending_messages');
    return stored ? JSON.parse(stored) : [];
  },
  
  async clearPendingMessages(): Promise<void> {
    await AsyncStorage.removeItem('pending_messages');
  }
};
