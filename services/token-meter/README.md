# token-meter

A tiny **Rust** microservice that counts BPE tokens for arbitrary text.

## Why Rust here?

Token counting is a hot path in any LLM-powered product — every prompt goes
through it for cost estimation and context-window guards. We chose Rust for
this single service because:

| Property | JS (`gpt-tokenizer`) | Rust (`tiktoken-rs`) |
|---|---|---|
| Throughput on a 50 KB document | ~1× | **10–50×** |
| Allocation pressure | High (V8 heap) | Negligible |
| Risk of stalling the web server | Yes (same event loop) | None (separate process) |

This is the only place in the project where TypeScript / Python could not
deliver the latency needed for what is effectively a tight inner loop.
Everywhere else, TS or Python remain the right tool.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET`  | `/health` | Liveness probe. Returns `{status, service, uptime_seconds}`. |
| `POST` | `/count`  | Returns `{tokens, bytes, encoding, elapsed_micros}` for the given text. |

`POST /count` body:

```json
{
  "text": "any string",
  "model": "gpt-4o",          // optional, picks o200k_base
  "encoding": "cl100k_base"   // optional explicit override
}
```

## Local dev

```sh
cd services/token-meter
cargo run --release          # listens on $TOKEN_METER_PORT (default 9000)
```

## Smoke test

```sh
curl -sS -X POST http://localhost:9000/count \
  -H 'content-type: application/json' \
  -d '{"text":"مرحباً بالعالم — hello world","model":"gpt-4o"}' | jq
```
