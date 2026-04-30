/**
 * Typed client for the `llm-judge` Python microservice.
 *
 * Scores LLM outputs against rubrics for evaluation pipelines.
 * See `services/llm-judge/` for the source.
 */
import type { paths } from "./llm-judge.types";
import { serviceFetch } from "./_fetcher";

const SERVICE = "llm-judge";
const ENV = "LLM_JUDGE_URL";

type Body<P extends keyof paths, M extends keyof paths[P]> =
  paths[P][M] extends {
    requestBody?: { content: { "application/json": infer B } };
  }
    ? B
    : never;

type Response<P extends keyof paths, M extends keyof paths[P]> =
  paths[P][M] extends {
    responses: { 200: { content: { "application/json": infer R } } };
  }
    ? R
    : never;

export const llmJudge = {
  health: () =>
    serviceFetch<Response<"/health", "get">>(SERVICE, ENV, "/health", {
      method: "GET",
    }),

  rubrics: () =>
    serviceFetch<Response<"/rubrics", "get">>(SERVICE, ENV, "/rubrics", {
      method: "GET",
    }),

  judge: (input: Body<"/judge", "post">) =>
    serviceFetch<Response<"/judge", "post">>(SERVICE, ENV, "/judge", {
      body: input,
    }),

  judgeBatch: (input: Body<"/judge/batch", "post">) =>
    serviceFetch<Response<"/judge/batch", "post">>(
      SERVICE,
      ENV,
      "/judge/batch",
      { body: input },
    ),
};
