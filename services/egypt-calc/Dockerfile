FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8008
EXPOSE 8008

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8008} --workers 2"]
