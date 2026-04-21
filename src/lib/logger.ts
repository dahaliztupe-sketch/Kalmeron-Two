import pino from 'pino';
import { randomUUID } from 'crypto';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  base: {
    service: 'kalmeron-two',
    env: process.env.NODE_ENV,
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
});

export function createRequestLogger(requestId?: string) {
  return logger.child({ requestId: requestId || randomUUID() });
}

export function getRequestId(): string {
  return randomUUID();
}
