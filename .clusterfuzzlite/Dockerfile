# Build environment for ClusterFuzzLite — runs the JavaScript fuzz targets
# under jazzer.js in the OSS-Fuzz base image.
#
# The ClusterFuzzLite docs recommend the rolling `:v1` tag for these
# Google-maintained base images; pinning to a digest is impractical because
# Google rotates them frequently for security patches.
# Reference: https://google.github.io/clusterfuzzlite/build-integration/javascript-lang/
# trivy:ignore:AVD-DS-0002 — see USER directive below: we cannot drop root for
#                            the fuzzer build, but we explicitly mark the
#                            container as ephemeral CI-only (never deployed).
# checkov:skip=CKV_DOCKER_3 — OSS-Fuzz base image requires root for libfuzzer
#                            instrumentation; this container runs ONLY in CI
#                            ephemeral runners, never deployed.
# hadolint ignore=DL3002
FROM gcr.io/oss-fuzz-base/base-builder-javascript:v1

COPY . $SRC/kalmeron-two
WORKDIR $SRC/kalmeron-two

COPY .clusterfuzzlite/build.sh $SRC/build.sh

# OSS-Fuzz / ClusterFuzzLite **requires** root inside the build container for
# libfuzzer instrumentation, sanitizer hooks, and writing into $OUT. The
# upstream base image (`gcr.io/oss-fuzz-base/base-builder-javascript`) is
# itself published as root and the build orchestrator drops privileges
# externally. We declare the user explicitly so the intent is auditable
# instead of inherited silently — this satisfies the spirit of
# AVD-DS-0002 / CKV_DOCKER_3 / DL3002 while staying compatible with the
# ClusterFuzzLite contract.
USER root

# This image runs only inside the OSS-Fuzz / ClusterFuzzLite ephemeral CI
# runner — there is no long-running service to probe and no externally
# exposed port. An explicit NONE silences CKV_DOCKER_2 / Hadolint DL3057
# without claiming a fake healthcheck. (CodeQL/Scorecard "No HEALTHCHECK".)
HEALTHCHECK NONE
