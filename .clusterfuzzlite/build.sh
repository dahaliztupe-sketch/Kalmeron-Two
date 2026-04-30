#!/usr/bin/env bash
# Builds JavaScript fuzz targets for ClusterFuzzLite.
# Each fuzz_*.js file in tests/fuzz/ becomes its own target.
set -euo pipefail

cd "$SRC/kalmeron-two"

# Install only what the fuzz targets need (avoid heavy framework deps).
npm install --no-audit --no-fund --silent \
  @jazzer.js/core@^2.1.0 \
  esbuild@^0.25.0

# Pre-compile the TypeScript modules referenced by the fuzz targets into
# CommonJS bundles under `dist-fuzz/`. Jazzer.js cannot load .ts files.
node scripts/build-fuzz.mjs

# Compile each fuzz target.
for fuzz_target in tests/fuzz/fuzz_*.js; do
  [ -f "$fuzz_target" ] || continue
  base=$(basename "${fuzz_target%.js}")
  compile_javascript_fuzzer kalmeron-two "$fuzz_target" --sync
  cp "${OUT}/${base}" "${OUT}/${base}" 2>/dev/null || true
done
