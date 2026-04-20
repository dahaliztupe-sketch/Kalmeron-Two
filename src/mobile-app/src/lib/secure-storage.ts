// @ts-nocheck
import * as SecureStore from 'expo-secure-store';

export const SecureStorage = {
  async saveDID(did: string): Promise<void> {
    await SecureStore.setItemAsync('kalmeron_did', did);
  },
  
  async getDID(): Promise<string | null> {
    return SecureStore.getItemAsync('kalmeron_did');
  }
};
