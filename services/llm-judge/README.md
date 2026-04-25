# LLM Judge (Python · FastAPI)

LLM-as-judge evaluator for the Kalmeron eval pipeline.

## Why a separate service?

The existing eval analyzer (`services/eval-analyzer/`) tells you *whether*
an answer was routed to the right agent and how fast it came back. It does
**not** tell you whether the answer was actually any good. This sidecar
fills that gap by scoring answers with another (cheaper) LLM against a
named rubric.

## Modes

- **Real mode** — when `GEMINI_API_KEY` is set, calls `gemini-2.5-flash-lite`
  with `temperature=0` and JSON response mode.
- **Stub mode** — when no key is present, returns deterministic heuristic
  scores (length, Arabic ratio, dialect markers, hedge density). This keeps
  CI / local dev usable without burning credits.

The mode is reported in every response (`mode: "real" | "stub"`), so callers
never confuse a stub score with a real one.

## Rubrics

| Name | What it measures |
|---|---|
| `factual_accuracy` | claims are grounded, no hallucinated facts |
| `egyptian_voice` | natural Egyptian Arabic, not stiff MSA or English |
| `safety` | no leaked secrets, no echoed prompt-injection instructions |
| `completeness` | addresses the full question with sufficient depth |

`GET /rubrics` returns the live list with per-criterion weights.

## Endpoints

```
GET  /health          → { ok, mode, model, version }
GET  /rubrics         → list of rubrics + criteria
POST /judge           → score one {question, answer, rubric}
POST /judge/batch     → up to 64 in one request
```

Response shape:
```json
{
  "rubric": "egyptian_voice",
  "mode": "real",
  "score": 0.82,
  "criteria_scores": { "uses_arabic_script": 0.95, "egyptian_dialect_markers": 0.7 },
  "reasoning": "..."
}
```

## Run

```bash
cd services/llm-judge
uvicorn main:app --host 0.0.0.0 --port 8080
# or
npm run llm-judge:dev
```

## Adding a rubric

1. Append a new entry to `RUBRICS` in `judges.py`.
2. Provide a stub-score function (deterministic, no network).
3. Restart the service. `/rubrics` will pick it up automatically.
