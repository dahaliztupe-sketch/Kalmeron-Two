FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-core fonts-noto-cjk fonts-noto-color-emoji \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app --home-dir /app --shell /sbin/nologin app

WORKDIR /app

COPY --chown=app:app requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .

ENV PORT=8000
EXPOSE 8000

USER app

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
