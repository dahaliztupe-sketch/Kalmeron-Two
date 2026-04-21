#!/bin/bash
# dev-start.sh - Workflow entry point for Next.js 16 in Replit
#
# Next.js 16 changed architecture: `next dev` forks a worker then the CLI exits.
# Replit workflow needs the main process to stay alive.
# This script stays alive as long as the server is serving on port 5000.

set -e

PORT=5000
HOSTNAME=0.0.0.0

echo "Starting Next.js 16 dev server..."

cleanup() {
  echo "Shutting down..."
  kill %1 2>/dev/null || true
  exit 0
}
trap cleanup SIGTERM SIGINT

# Start next dev as a background job
node node_modules/.bin/next dev -p "$PORT" -H "$HOSTNAME" &
NEXT_JOB=$!

echo "Next.js CLI started (PID: $NEXT_JOB), waiting for port $PORT..."

# Wait up to 60 seconds for the server to bind to the port
WAITED=0
while ! bash -c "echo >/dev/tcp/127.0.0.1/$PORT" 2>/dev/null; do
  sleep 0.3
  WAITED=$((WAITED + 1))
  if [ $WAITED -gt 200 ]; then
    echo "ERROR: Server did not start within 60 seconds"
    exit 1
  fi
done

echo "Server is up on port $PORT"

# Keep this script alive while the server is running.
# If server dies, restart it.
while true; do
  if ! bash -c "echo >/dev/tcp/127.0.0.1/$PORT" 2>/dev/null; then
    echo "Server port $PORT closed. Restarting Next.js..."
    node node_modules/.bin/next dev -p "$PORT" -H "$HOSTNAME" &
    NEXT_JOB=$!
    # Wait for restart
    WAITED=0
    while ! bash -c "echo >/dev/tcp/127.0.0.1/$PORT" 2>/dev/null; do
      sleep 0.3
      WAITED=$((WAITED + 1))
      if [ $WAITED -gt 200 ]; then
        echo "ERROR: Server did not restart within 60 seconds"
        exit 1
      fi
    done
    echo "Server restarted on port $PORT"
  fi
  sleep 2
done
