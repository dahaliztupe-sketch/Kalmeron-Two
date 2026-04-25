# Embeddings Worker (Python · FastAPI)

Local multilingual embeddings via [`fastembed`](https://github.com/qdrant/fastembed)
(ONNX runtime — no torch, no GPU). Default model:
**`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`**
(~220 MB, 384-dim, ~50 languages including Arabic).

## Why a separate service?

- Every Gemini embedding call costs money. The RAG pipeline embeds
  queries 3–5 times (CRAG, HyDE, Self-RAG, Disco-RAG, User-RAG all share
  retrieval). Local embeddings cut that bill to zero.
- The default Gemini multilingual embedding is good but not specialized
  for the Egyptian dialect. `multilingual-e5-small` is competitive on
  Arabic-script text and predictable.
- Startup is instant (lazy load); first call takes 5–15 s as the model
  is fetched/loaded. After that, sub-50 ms per text.

## Endpoints

```
GET  /health           → { model_loaded, model_dim, cache_size, ... }
POST /embed            → { vector, dim, elapsed_ms }
POST /embed/batch      → { vectors[], dim, count, elapsed_ms }   # up to 64
POST /similarity       → { cosine in [-1, 1] }
```

## Caching

In-memory LRU keyed by `(model, text)`. Default capacity 1 000 entries
(override via `EMBEDDINGS_CACHE_SIZE`). The same query going through
multiple RAG strategies is embedded **once**.

## Run

```bash
cd services/embeddings-worker
uvicorn main:app --host 0.0.0.0 --port 8099
# or
npm run embeddings-worker:dev
```

## Configuration

| Env var | Default | Notes |
|---|---|---|
| `EMBEDDINGS_MODEL` | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Any fastembed-supported model (run `TextEmbedding.list_supported_models()` to see options) |
| `EMBEDDINGS_CACHE_SIZE` | `1000` | LRU capacity |
| `EMBEDDINGS_MAX_BATCH` | `64` | Reject batches above this |
| `EMBEDDINGS_MAX_TEXT_LEN` | `4000` | Per-text char cap |

## Switching back to Gemini

If this service is unreachable, the TS client returns
`{ ok: false, reason: 'unreachable' }` and existing callers should fall
through to whatever embedding path they were using before. Nothing in
the rest of the codebase has to know this service exists.
