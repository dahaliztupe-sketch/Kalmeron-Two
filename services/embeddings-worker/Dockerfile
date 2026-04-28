FROM python:3.12-slim

RUN groupadd --system --gid 1001 app \
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

# Single worker — embeddings model is heavy (~220MB RAM) and lazy-loaded
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8099} --workers 1"]
