/**
 * Typed client for the `pdf-worker` Python microservice.
 *
 * Extracts text and chunks from Arabic + English PDFs (with optional OCR
 * fallback). See `services/pdf-worker/` for the source.
 */
import type { paths } from "./pdf-worker.types";
import { serviceFetch, ServiceError } from "./_fetcher";

const SERVICE = "pdf-worker";
const ENV = "PDF_WORKER_URL";

type Response<P extends keyof paths, M extends keyof paths[P]> =
  paths[P][M] extends {
    responses: { 200: { content: { "application/json": infer R } } };
  }
    ? R
    : never;

export const pdfWorker = {
  health: () =>
    serviceFetch<Response<"/health", "get">>(SERVICE, ENV, "/health", {
      method: "GET",
    }),

  /**
   * Extract clean text + RAG-ready chunks from a PDF.
   *
   * This endpoint expects multipart/form-data with a single `file` field.
   */
  extract: async (
    file: Blob | File,
    filename = "document.pdf",
  ): Promise<Response<"/extract", "post">> => {
    const form = new FormData();
    form.append("file", file, filename);
    return serviceFetch<Response<"/extract", "post">>(
      SERVICE,
      ENV,
      "/extract",
      { body: form },
    );
  },
};

export { ServiceError };
