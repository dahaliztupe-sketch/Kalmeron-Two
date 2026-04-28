FROM python:3.12-slim

RUN groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app --home-dir /app --shell /sbin/nologin app

WORKDIR /app

COPY --chown=app:app requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .

ENV PORT=8080
EXPOSE 8080

USER app

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2"]
