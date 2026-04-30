#!/usr/bin/env bash
# Dev launcher for token-meter.
#
# Builds (if needed) and runs the service. Uses the debug profile for fast
# rebuilds in development; production deployments should use:
#
#   cargo build --profile release-prod
#   ./target/release-prod/token-meter
#
# Honors $TOKEN_METER_PORT (default 9000).
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -x target/debug/token-meter || src/main.rs -nt target/debug/token-meter ]]; then
  echo "→ building token-meter (debug)…"
  cargo build
fi

exec ./target/debug/token-meter
