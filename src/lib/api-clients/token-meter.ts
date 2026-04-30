/**
 * Typed client for the `token-meter` Rust microservice.
 *
 * Counts BPE tokens for prompts/responses on a hot path. See
 * `services/token-meter/` for the source. This is the only Rust service in
 * the polyglot fleet — chosen because token counting is performance-critical
 * for every LLM call and `tiktoken-rs` outperforms JS equivalents 10-50x.
 *
 * Token-meter does not expose an OpenAPI spec (Axum doesn't auto-generate
 * one), so the request/response shapes are hand-typed below to match the
 * Rust structs in `src/main.rs`.
 */
import { serviceFetch, ServiceError } from "./_fetcher";

const SERVICE = "token-meter";
const ENV = "TOKEN_METER_URL";

export interface TokenMeterHealth {
  status: "ok";
  service: "token-meter";
  uptime_seconds: number;
}

export interface CountRequest {
  text: string;
  /** Pick the encoding by model name (e.g. "gpt-4o" → o200k_base). */
  model?: string;
  /** Explicit encoding override: "cl100k_base" | "o200k_base" | "p50k_base" | "r50k_base". */
  encoding?: "cl100k_base" | "o200k_base" | "p50k_base" | "r50k_base";
}

export interface CountResponse {
  tokens: number;
  bytes: number;
  encoding: string;
  /** Server-side encode time in microseconds (excludes network). */
  elapsed_micros: number;
}

export const tokenMeter = {
  health: () =>
    serviceFetch<TokenMeterHealth>(SERVICE, ENV, "/health", { method: "GET" }),

  count: (input: CountRequest) =>
    serviceFetch<CountResponse>(SERVICE, ENV, "/count", { body: input }),
};

export { ServiceError };
