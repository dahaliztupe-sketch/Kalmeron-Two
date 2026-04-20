// @ts-nocheck
import { rateLimit } from 'express-rate-limit'; // Not directly applicable in Next.js edge/api route exactly like this.
// Alternative approach using a simple in-memory store for now or using upstash/redis if available.
// Implementing a simple sliding window in-memory rate limiter for server-side.

const WINDOW_SIZE_MS = 60000; // 1 minute
const MAX_REQUESTS = 10;

const requestCounts = new Map<string, { count: number; startTime: number }>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userData = requestCounts.get(userId) || { count: 0, startTime: now };

  if (now - userData.startTime > WINDOW_SIZE_MS) {
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count += 1;
  }

  requestCounts.set(userId, userData);
  return userData.count <= MAX_REQUESTS;
}
