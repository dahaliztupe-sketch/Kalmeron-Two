/**
 * Typed client for the `egypt-calc` Python microservice.
 *
 * Computes Egyptian income tax, social insurance, and total employment cost
 * brackets for HR features. See `services/egypt-calc/` for the source.
 */
import type { paths } from "./egypt-calc.types";
import { serviceFetch } from "./_fetcher";

const SERVICE = "egypt-calc";
const ENV = "EGYPT_CALC_URL";

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

export const egyptCalc = {
  health: () =>
    serviceFetch<Response<"/health", "get">>(SERVICE, ENV, "/health", {
      method: "GET",
    }),

  incomeTax: (input: Body<"/income-tax", "post">) =>
    serviceFetch<Response<"/income-tax", "post">>(
      SERVICE,
      ENV,
      "/income-tax",
      { body: input },
    ),

  socialInsurance: (input: Body<"/social-insurance", "post">) =>
    serviceFetch<Response<"/social-insurance", "post">>(
      SERVICE,
      ENV,
      "/social-insurance",
      { body: input },
    ),

  totalCost: (input: Body<"/total-cost", "post">) =>
    serviceFetch<Response<"/total-cost", "post">>(
      SERVICE,
      ENV,
      "/total-cost",
      { body: input },
    ),
};
