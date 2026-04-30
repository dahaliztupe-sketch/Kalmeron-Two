/**
 * Typed clients for the polyglot microservice fleet.
 *
 * All clients are derived from the OpenAPI specs in `docs/api/services/`.
 * To regenerate after changing a Python or Rust service:
 *
 *   npm run codegen:openapi   # pull live specs from running services
 *   npm run codegen:clients   # regenerate TypeScript types
 */
export { egyptCalc } from "./egypt-calc";
export { embeddingsWorker } from "./embeddings-worker";
export { llmJudge } from "./llm-judge";
export { pdfWorker } from "./pdf-worker";
export { tokenMeter } from "./token-meter";
export type {
  TokenMeterHealth,
  CountRequest as TokenCountRequest,
  CountResponse as TokenCountResponse,
} from "./token-meter";
export { ServiceError } from "./_fetcher";
