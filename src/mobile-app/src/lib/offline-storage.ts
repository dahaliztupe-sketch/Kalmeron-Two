import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_KEY = 'pending_messages';

export interface PendingMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  [key: string]: unknown;
}

export const OfflineStorage = {
  async savePendingMessage(message: Omit<PendingMessage, 'timestamp'>): Promise<void> {
    const pending = await this.getPendingMessages();
    pending.push({ ...message, timestamp: Date.now() });
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  },

  async getPendingMessages(): Promise<PendingMessage[]> {
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as PendingMessage[];
    } catch {
      return [];
    }
  },

  async clearPendingMessages(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_KEY);
  },
};
