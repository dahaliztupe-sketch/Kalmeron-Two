/**
 * Typed client for the `embeddings-worker` Python microservice.
 *
 * Wraps a multilingual sentence-transformers model for Arabic+English RAG.
 * See `services/embeddings-worker/` for the source.
 */
import type { paths } from "./embeddings-worker.types";
import { serviceFetch } from "./_fetcher";

const SERVICE = "embeddings-worker";
const ENV = "EMBEDDINGS_WORKER_URL";

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

export const embeddingsWorker = {
  health: () =>
    serviceFetch<Response<"/health", "get">>(SERVICE, ENV, "/health", {
      method: "GET",
    }),

  embed: (input: Body<"/embed", "post">) =>
    serviceFetch<Response<"/embed", "post">>(SERVICE, ENV, "/embed", {
      body: input,
    }),

  embedBatch: (input: Body<"/embed/batch", "post">) =>
    serviceFetch<Response<"/embed/batch", "post">>(
      SERVICE,
      ENV,
      "/embed/batch",
      { body: input },
    ),

  similarity: (input: Body<"/similarity", "post">) =>
    serviceFetch<Response<"/similarity", "post">>(
      SERVICE,
      ENV,
      "/similarity",
      { body: input },
    ),

  preprocess: (input: Body<"/preprocess", "post">) =>
    serviceFetch<Response<"/preprocess", "post">>(
      SERVICE,
      ENV,
      "/preprocess",
      { body: input },
    ),
};
