FROM python:3.12-slim@sha256:46cb7cc2877e60fbd5e21a9ae6115c30ace7a077b9f8772da879e4590c18c2e3

RUN apt-get update && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app --home-dir /app --shell /sbin/nologin app

WORKDIR /app

# fastembed downloads ONNX model on first call; pre-warm by including model cache dir
RUN mkdir -p /app/.cache/fastembed && chown -R app:app /app
ENV FASTEMBED_CACHE_DIR=/app/.cache/fastembed

COPY --chown=app:app requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .

ENV PORT=8099
EXPOSE 8099

USER app

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT:-8099}/health" || exit 1

# Single worker — embeddings model is heavy (~220MB RAM) and lazy-loaded
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8099} --workers 1"]
