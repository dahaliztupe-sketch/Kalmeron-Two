FROM python:3.12-slim

WORKDIR /app

# fastembed downloads ONNX model on first call; pre-warm by including model cache dir
RUN mkdir -p /app/.cache/fastembed
ENV FASTEMBED_CACHE_DIR=/app/.cache/fastembed

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8099
EXPOSE 8099

# Single worker — embeddings model is heavy (~220MB RAM) and lazy-loaded
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8099} --workers 1"]
