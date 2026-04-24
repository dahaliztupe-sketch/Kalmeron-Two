# Arabic PDF Worker (Python · FastAPI)

Sidecar HTTP service that extracts and chunks PDFs with Arabic-aware
normalization. Replaces the in-process `pdf-parse` path used by the RAG
pipeline.

## Why a separate service?

- `pdf-parse` (Node) does not handle Arabic ligatures or alef variants.
- `pypdf` + custom normalization (`arabic.py`) gives much cleaner output.
- Isolation: a crash in PDF parsing cannot bring down the Next.js app or eat
  serverless function memory limits on Vercel.
- Independent scaling: the worker can be deployed to Cloud Run / Railway and
  scaled separately.

## Endpoints

### `GET /health`
Liveness probe. Returns `{ "ok": true, "service": "pdf-worker", "version": "1.0.0" }`.

### `POST /extract` (multipart: `file`)

Optional query params:

| Name                  | Default | Notes                                          |
|-----------------------|---------|------------------------------------------------|
| `target_chars`        | 1200    | Soft target chunk size                         |
| `max_chars`           | 1800    | Hard ceiling — no chunk exceeds this           |
| `overlap`             | 150     | Sliding-window overlap when sentences are huge |
| `aggressive_normalize`| true    | Collapse alef/ya variants and strip diacritics |

Returns:

```json
{
  "text": "...full normalized text...",
  "pageCount": 12,
  "language": "ar",
  "charCount": 18234,
  "chunkCount": 17,
  "chunks": [
    { "text": "...", "charCount": 1180, "pageHint": null }
  ]
}
```

## Run locally

```bash
cd services/pdf-worker
uvicorn main:app --host 0.0.0.0 --port 8000
```

The Next.js app reaches it at `PDF_WORKER_URL` (defaults to
`http://localhost:8000` — see `.env.example`). On Replit the workflow
"PDF Worker" launches it for you.

## Limits

- Max upload size: 20 MB (override with `PDF_WORKER_MAX_BYTES`).
- Encrypted PDFs: the worker tries an empty password; otherwise returns 422.
- Image-only PDFs (scans): not supported yet — `pypdf` returns empty text.
  OCR is the natural follow-up (Tesseract + Arabic language pack).
