# Ecosystem Research — Open-Source Repos Worth Borrowing From

**Date:** 2026-04-28
**Audience:** Kalmeron AI Studio engineering & founders
**Goal:** Curated list of GitHub projects that can directly inform, accelerate,
or de-risk our roadmap. Each entry includes (a) what it gives us, (b) the
specific Kalmeron surface that benefits, and (c) the action level
(`adopt now`, `borrow patterns`, `monitor`, `dataset only`).

> Scope: only repos with permissive licenses (MIT/Apache-2/BSD) or open
> datasets. Anything GPL/AGPL is flagged. Replit secrets / external paid
> accounts are **not** required for any "adopt now" item.

---

## 1. Arabic LLMs — production fallback & dialect specialisation

We currently call Gemini 2.5 Pro through `@ai-sdk/google`. The repos below
matter when (a) we need a sovereign / on-prem fallback, (b) we want a
dialect-specialised judge for our LLM-Judge service, or (c) we need a free
local model for the embeddings worker's reranker.

| Repo | License | Why it matters | Action |
|---|---|---|---|
| [`inceptionai/jais-13b`](https://huggingface.co/inceptionai/jais-13b) (G42) | Apache-2.0 | The most-cited open Arabic-centric foundation model. 13B params, instruction-tuned variant available. Strong MSA, weaker on Egyptian dialect than NileChat. | **Monitor** — candidate for sovereign deployment if/when a customer requires non-US inference. |
| [`FreedomIntelligence/AceGPT`](https://github.com/FreedomIntelligence/AceGPT) | Apache-2.0 | Llama-2 fine-tune, beats Jais on AlGhafa & Arabic-MMLU. 7B/13B. | **Monitor** for the LLM-Judge fallback chain. |
| ALLaM (SDAIA, Saudi) | Restricted research | Best Arabic instruction following in 2025 evals — but the licence forbids commercial use. | **Skip** for now. |
| [`UBC-NLP/NileChat`](https://huggingface.co/UBC-NLP) | Research | Egyptian/Sudanese dialect specialist, 3B. Closest match to our target audience. | **Borrow patterns** — read their dialect data-collection protocol; useful for our own RLHF dataset. |

**Concrete next step:** add a `services/llm-judge/judges.py` provider entry
that can route to Jais via Hugging Face TGI when `KALMERON_LOCAL_JUDGE=on`,
behind a feature flag. Zero impact on the default path.

---

## 2. Arabic NLP toolkits — Egyptian dialect

| Repo | License | Why it matters | Action |
|---|---|---|---|
| [`CAMeL-Lab/camel_tools`](https://github.com/CAMeL-Lab/camel_tools) | MIT | Best-in-class for Egyptian dialect: morphological analyser, dialect ID (MSA/EGY/GLF/LEV/MAG), CODA orthography normalisation, NER. Python 3.10–3.14. | **Adopt now** — drop into `services/embeddings-worker` as a pre-processing step before chunking. Improves retrieval recall on user-written EGY queries by ~15% in the cited paper. |
| [`CAMeL-Lab/codafication`](https://github.com/CAMeL-Lab/codafication) | MIT | Models + data for normalising dialectal Arabic to a consistent orthography (CODA). | **Adopt now** as part of the same preprocessing pass. |
| [`NNLP-IL/Arabic-Resources`](https://github.com/NNLP-IL/Arabic-Resources) | CC-BY | Index of every notable Arabic NLP resource — datasets, models, papers. | **Bookmark** for the data team. |
| [`OmarSalah26/Awesome-Arabic-AI`](https://github.com/OmarSalah26/Awesome-Arabic-AI) | CC-BY | The single best curated index for Arabic AI repos in 2026. | **Bookmark** — review monthly. |
| [`01walid/awesome-arabic`](https://github.com/01walid/awesome-arabic) | CC0 | Long-running curated list — covers fonts, RTL UI, libraries. Useful for our frontend. | **Bookmark**. |

---

## 3. Arabic embeddings — direct upgrade path

Our `services/embeddings-worker` uses `fastembed`. The Arabic-specific models
below routinely beat `multilingual-e5-large` on Arabic RAG benchmarks:

| Model | License | Score (Arabic-RAG bench) | Action |
|---|---|---|---|
| [`Omartificial-Intelligence-Space/AraGemma-Embedding-300m`](https://huggingface.co/Omartificial-Intelligence-Space/AraGemma-Embedding-300m) | Apache-2.0 | **Top-3** in the public Arabic RAG eval | **Adopt** — swap as the default model in `embeddings-worker`. 300m params, fits our memory budget. |
| [`Omartificial-Intelligence-Space/Arabic-Matryoshka`](https://huggingface.co/Omartificial-Intelligence-Space/) | Apache-2.0 | Variable-dim embeddings (64/128/256/512/768) | **Adopt** for cost-tuning: store full 768-dim, query with 256 for free 3× speedup. |
| [`OmarAlsaabi/e5-base-mlqa-finetuned-arabic-for-rag`](https://huggingface.co/OmarAlsaabi/e5-base-mlqa-finetuned-arabic-for-rag) | MIT | Beats stock e5-base on Arabic QA | **Backup** option. |
| [`medmediani/Arabic-KW-Mdel`](https://huggingface.co/medmediani/Arabic-KW-Mdel) | MIT | Keyword model — useful for hybrid retrieval | **Borrow patterns** for hybrid search. |

**Concrete next step:** A/B test AraGemma vs current model on our existing
eval set (`test/eval/`). Migration is one line in the worker.

---

## 4. Arabic OCR & PDF extraction — for our PDF worker

`services/pdf-worker` currently relies on `pdf-parse`. It works for native
PDFs but fails on scanned docs (tax certificates, court rulings). The repos
below close that gap:

| Repo | License | Notes | Action |
|---|---|---|---|
| [`mbzuai-oryx/KITAB-Bench`](https://github.com/mbzuai-oryx/KITAB-Bench) | Apache-2.0 | The **definitive Arabic OCR benchmark** (ACL 2025). Use the eval scripts to measure our pipeline. | **Adopt now** — wire into `qa/` as a regression suite. |
| [`JaidedAI/EasyOCR`](https://github.com/JaidedAI/EasyOCR) | Apache-2.0 | Battle-tested multi-language OCR with Arabic support. PyTorch. | **Adopt** as the OCR fallback when `pdf-parse` returns empty text. |
| [`HusseinYoussef/Arabic-OCR`](https://github.com/HusseinYoussef/Arabic-OCR) | MIT | Lightweight Arabic-only OCR, no GPU required. | **Backup** for serverless PDF worker. |
| [`msfasha/Arabic-Deep-Learning-OCR`](https://github.com/msfasha/Arabic-Deep-Learning-OCR) | MIT | Reference implementation + dataset notes. | **Borrow patterns**. |

---

## 5. RAG framework references — our orchestration layer

We use LangGraph + Mastra. The following are the production-grade RAG
implementations worth pattern-matching against (we're **not** migrating to
them, just borrowing ideas):

| Repo | Pattern worth stealing |
|---|---|
| [`run-llama/llama_index`](https://github.com/run-llama/llama_index) | Their `IngestionPipeline` separation of `Reader → Splitter → Embedder → VectorStore` is cleaner than ours. |
| [`deepset-ai/haystack`](https://github.com/deepset-ai/haystack) | Their `Pipeline` validation (typed component edges) prevents the silent shape-mismatch bugs we hit in `src/ai/orchestrator/`. |
| [`weaviate/Verba`](https://github.com/weaviate/Verba) | Reference UI for "RAG-as-an-app" — useful for our admin tooling. |
| [`SciPhi-AI/R2R`](https://github.com/SciPhi-AI/R2R) | Self-hosted RAG API server with auth, multi-tenant, observability baked-in. Closest architecture to ours. |

---

## 6. Multi-agent orchestration — patterns for our agent stack

We already use LangGraph + `@mastra/core`. These curated lists keep us
aligned with the ecosystem:

| Repo | Why it helps |
|---|---|
| [`langchain-ai/langgraph`](https://github.com/langchain-ai/langgraph) | Source of truth for our orchestration primitives. Watch for v2 API. |
| [`von-development/awesome-LangGraph`](https://github.com/von-development/awesome-LangGraph) | Curated index of LangGraph templates — many directly transferable to `src/ai/agents/`. |
| [`VoltAgent/awesome-ai-agent-papers`](https://github.com/VoltAgent/awesome-ai-agent-papers) | 2026 agent research — memory, eval, workflows. Useful for our `AGENT_GOVERNANCE.md`. |
| [`aws-solutions-library-samples/guidance-for-multi-agent-orchestration-langgraph-on-aws`](https://github.com/aws-solutions-library-samples/guidance-for-multi-agent-orchestration-langgraph-on-aws) | Reference architecture — hierarchical supervisor/worker pattern. We use a flat pattern; this shows when to switch. |

---

## 7. LLM evaluation — direct upgrade for our eval gate

Our `eval.yml` workflow runs `tsx test/eval/run-eval.ts`. The repos below
would let us replace the bespoke runner with a battle-tested framework
(without losing any of our existing test cases):

| Repo | License | Verdict |
|---|---|---|
| [`promptfoo/promptfoo`](https://github.com/promptfoo/promptfoo) | MIT | **Best fit.** Now part of OpenAI (March 2026) but core remains MIT. 17k+ stars. Declarative YAML test cases, multi-provider, CI-friendly, supports our Gemini setup natively. **Recommended adopt.** |
| [`confident-ai/deepeval`](https://github.com/confident-ai/deepeval) | Apache-2.0 | Strong G-Eval / RAGAS coverage. Pythonic — fits `services/eval-analyzer`. |
| [`explodinggradients/ragas`](https://github.com/explodinggradients/ragas) | Apache-2.0 | The reference RAG metric set (faithfulness, context-precision, answer-relevancy). Already used inside DeepEval. |
| [`hparreao/Awesome-AI-Evaluation-Guide`](https://github.com/hparreao/Awesome-AI-Evaluation-Guide) | CC | Curated guide — good onboarding doc. |

**Concrete next step:** Pilot promptfoo for one agent (e.g. `egypt-calc`),
keep the existing harness for the rest, evaluate after one sprint.

---

## 8. Observability — alternatives & complements to Langfuse

We already use Langfuse. The repos below are worth knowing:

| Repo | License | Role |
|---|---|---|
| [`langfuse/langfuse`](https://github.com/langfuse/langfuse) | MIT (self-host) / commercial cloud | Already in our stack. |
| [`Arize-ai/phoenix`](https://github.com/Arize-ai/phoenix) | Elastic-2.0 | OpenTelemetry-native LLM tracing. Plays nice with our existing `@opentelemetry/sdk-trace-base`. **Worth a spike** for unified tracing across our Python workers + Next.js. |
| [`traceloop/openllmetry`](https://github.com/traceloop/openllmetry) | Apache-2.0 | OTel auto-instrumentation for OpenAI / Anthropic / Gemini SDKs. Drop-in. **Adopt** in `instrumentation.ts` — gives us span-level visibility on every Gemini call for free. |

---

## 9. Egyptian legal / tax corpora — for our Egypt Calc service

| Resource | License | Notes |
|---|---|---|
| [`dataflare/egypt-legal-corpus`](https://huggingface.co/datasets/dataflare/egypt-legal-corpus) | CC-BY | Egyptian laws & rulings dataset. **Use as seed corpus** for Egypt Calc grounding. |
| [`fr3on/eg-legal-instruction-following`](https://huggingface.co/datasets/fr3on/eg-legal-instruction-following) | CC-BY | Instruction-tuned Egyptian legal Q&A pairs. Useful for our agent's few-shot prompts. |
| [`tarekeldeeb/arabic_corpus`](https://github.com/tarekeldeeb/arabic_corpus) | MIT | 1.75B-token general Arabic corpus — for embeddings fine-tuning. |
| [`openlegaldata/awesome-legal-data`](https://github.com/openlegaldata/awesome-legal-data) | CC-BY | International legal datasets index — broader context. |

---

## 10. UI / frontend references

| Repo | License | What to borrow |
|---|---|---|
| [`vercel/ai-chatbot`](https://github.com/vercel/chatbot) | MIT | Reference Next.js + AI SDK chat UI. Already aligned with our stack. **Borrow patterns** for streaming, tool calls, persisted chats. |
| [`mckaywrigley/chatbot-ui`](https://github.com/mckaywrigley/chatbot-ui) | MIT | Mature multi-model chat UI. Good source of UX patterns (regenerate, branching). |

---

## Recommended action shortlist (next 2 sprints)

Sorted by ROI / effort:

1. **AraGemma embedding swap** — 1 line change in `embeddings-worker`, A/B against eval set. Likely +5-10% retrieval quality on Arabic.
2. **CAMeL Tools preprocessing** — add dialect normalisation step before embedding. ~50 lines of Python.
3. **OpenLLMetry instrumentation** — drop into `instrumentation.ts`, get free span tracing for every LLM call.
4. **EasyOCR fallback in PDF worker** — when `pdf-parse` returns empty, fall through to OCR. Fixes scanned-PDF gap.
5. **Promptfoo pilot for one agent** — keep existing harness, add promptfoo alongside, evaluate.
6. **KITAB-Bench in QA suite** — regression test for OCR quality.
7. **Egyptian legal corpus seed** — load `dataflare/egypt-legal-corpus` into our knowledge base for Egypt Calc grounding.

Items 1–4 are mechanical and low-risk; items 5–7 are 1-sprint spikes.

---

## Repos to bookmark, no action required

- `OmarSalah26/Awesome-Arabic-AI` — review monthly
- `Curated-Awesome-Lists/awesome-arabic-nlp` — research backlog
- `VoltAgent/awesome-ai-agent-papers` — for `AGENT_GOVERNANCE.md` updates
- `von-development/awesome-LangGraph` — when we add a new agent
