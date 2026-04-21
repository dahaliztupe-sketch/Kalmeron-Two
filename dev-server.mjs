/**
 * dev-server.mjs
 * 
 * Wrapper for Next.js 16's new fork-and-exit architecture.
 * In Next.js 16, `next dev` spawns a worker then exits (code 0).
 * Replit's process group management then kills the orphaned worker.
 *
 * This wrapper:
 *  1. Spawns the Next.js worker (start-server.js) directly via fork() with IPC
 *  2. Sends the nextWorkerOptions message the worker expects
 *  3. Stays alive (keeps the IPC channel open) so the worker keeps running
 *  4. Re-forwards SIGTERM/SIGINT to the worker for graceful shutdown
 */

import { fork } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const DIR = __dirname;

const startServerPath = require.resolve('next/dist/server/lib/start-server');

process.env.NEXT_PRIVATE_WORKER = '1';
process.env.NEXT_PRIVATE_START_TIME = Date.now().toString();

const child = fork(startServerPath, [], {
  stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  env: {
    ...process.env,
    NEXT_PRIVATE_WORKER: '1',
    NEXT_PRIVATE_START_TIME: process.env.NEXT_PRIVATE_START_TIME,
  },
});

let ready = false;

child.on('message', (msg) => {
  if (msg && typeof msg === 'object') {
    if (msg.nextWorkerReady) {
      child.send({
        nextWorkerOptions: {
          port: PORT,
          hostname: HOSTNAME,
          dir: DIR,
          isDev: true,
          allowRetry: false,
          keepAliveTimeout: undefined,
          selfSignedCertificate: undefined,
          serverFastRefresh: true,
        },
      });
    } else if (msg.nextServerReady && !ready) {
      ready = true;
      process.stdout.write(`\n> Dev server ready on http://${HOSTNAME}:${PORT}\n`);
    }
  }
});

child.on('exit', (code, signal) => {
  process.exit(code ?? 0);
});

const shutdown = (signal) => {
  if (child.exitCode == null) {
    child.kill(signal);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
