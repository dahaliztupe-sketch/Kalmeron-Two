#!/usr/bin/env node
// Wrapper to keep Next.js 16 dev server alive in Replit environment.
// Two fixes applied:
// 1. Clear process.execArgv so Next.js doesn't pass invalid --e= to child NODE_OPTIONS
// 2. Keep parent event loop alive so child IPC channel stays open

// Must clear execArgv BEFORE any next.js code runs, because getParsedNodeOptions()
// reads process.execArgv to build NODE_OPTIONS for the child process
process.execArgv = [];

// Set TURBOPACK env var
process.env.TURBOPACK = '1';

// Keep the parent event loop alive so the child IPC channel stays open
// (Next.js 16 parent exits after runDevServer() resolves, killing the child)
const keepAlive = setInterval(() => {}, 1 << 30);

process.on('SIGINT', () => { clearInterval(keepAlive); process.exit(0); });
process.on('SIGTERM', () => { clearInterval(keepAlive); process.exit(0); });

// Set up argv as if called from CLI
process.argv = [process.argv[0], 'next', 'dev', '--turbopack', '-p', '5000', '-H', '0.0.0.0'];

// Load and run next bin (which handles dev command routing)
import('./node_modules/next/dist/bin/next');
