# Build environment for ClusterFuzzLite — runs the JavaScript fuzz targets
# under jazzer.js in the OSS-Fuzz base image.
#
# The ClusterFuzzLite docs recommend the rolling `:v1` tag for these
# Google-maintained base images; pinning to a digest is impractical because
# Google rotates them frequently for security patches.
# Reference: https://google.github.io/clusterfuzzlite/build-integration/javascript-lang/
# trivy:ignore:DS002 — base image is the official ClusterFuzzLite builder
# checkov:skip=CKV_DOCKER_3 — OSS-Fuzz base image requires root for libfuzzer
#                            instrumentation; this container runs ONLY in CI
#                            ephemeral runners, never deployed.
FROM gcr.io/oss-fuzz-base/base-builder-javascript:v1

COPY . $SRC/kalmeron-two
WORKDIR $SRC/kalmeron-two

COPY .clusterfuzzlite/build.sh $SRC/build.sh

# This image runs only inside the OSS-Fuzz / ClusterFuzzLite ephemeral CI
# runner — there is no long-running service to probe and no externally
# exposed port. An explicit NONE silences CKV_DOCKER_2 / Hadolint DL3057
# without claiming a fake healthcheck. (CodeQL/Scorecard "No HEALTHCHECK".)
HEALTHCHECK NONE
