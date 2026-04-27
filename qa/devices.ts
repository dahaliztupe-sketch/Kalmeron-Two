import type { Device } from './types';

export const DEVICES = {
  desktop_wide: { width: 1440, height: 900, ua: 'Chrome/Desktop', label: 'ديسكتوب واسع' },
  desktop_std: { width: 1280, height: 800, ua: 'Chrome/Desktop', label: 'ديسكتوب عادي' },
  ipad: { width: 768, height: 1024, ua: 'Safari/iPad', label: 'آيباد' },
  android: { width: 390, height: 844, ua: 'Chrome/Android', label: 'هاتف أندرويد' },
  iphone: { width: 375, height: 812, ua: 'Safari/iPhone', label: 'آيفون' },
} as const satisfies Record<string, Device>;

export type DeviceKey = keyof typeof DEVICES;
