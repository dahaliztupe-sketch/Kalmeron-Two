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

# Ensure cargo is on PATH when installed via rustup in the user's home.
if ! command -v cargo >/dev/null 2>&1 && [[ -f "$HOME/.cargo/env" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.cargo/env"
fi

# Workaround for "cannot allocate memory in static TLS block" raised when
# rustc/cargo from rustup is loaded on Nix glibc. Enlarging the optional
# static TLS budget gives librustc_driver room to initialise.
export GLIBC_TUNABLES="${GLIBC_TUNABLES:-glibc.rtld.optional_static_tls=2000000}"

cd "$(dirname "$0")"

if [[ ! -x target/debug/token-meter || src/main.rs -nt target/debug/token-meter ]]; then
  echo "→ building token-meter (debug)…"
  cargo build
fi

exec ./target/debug/token-meter
