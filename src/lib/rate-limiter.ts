// express-rate-limit is not applicable in Next.js edge/api routes directly;
// using a lightweight in-memory implementation instead.

const WINDOW_SIZE_MS = 60000; // 1 minute
const MAX_REQUESTS = 10;

const requestCounts = new Map<string, { count: number; startTime: number }>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userData = requestCounts.get(userId) ?? { count: 0, startTime: now };

  if (now - userData.startTime > WINDOW_SIZE_MS) {
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count += 1;
  }

  requestCounts.set(userId, userData);
  return userData.count <= MAX_REQUESTS;
}
