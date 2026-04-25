/**
 * Public summary of the in-house evaluation harness.
 *
 * Reads the golden dataset (committed to the repo) and returns aggregate
 * statistics that the public /quality page exposes to investors and visitors.
 *
 * NOTE: We DO NOT execute the dataset against a live model here — that would
 * cost real LLM tokens on every page hit. The pass-rate displayed on /quality
 * is the rate measured during the most recent CI run, persisted to a static
 * JSON snapshot at `test/eval/last-run-summary.json` (optional). When that
 * file is missing we fall back to declared baselines so the page still renders.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

interface DatasetCase {
  id: string;
  expectedIntent?: string;
  shouldBlock?: boolean;
  shouldRedact?: string[];
  rubric?: string;
}

interface Dataset {
  version: string;
  description: string;
  cases: DatasetCase[];
}

export interface CategorySummary {
  id: "router" | "safety" | "pii";
  labelAr: string;
  total: number;
  passRate: number;
  /** Last measured (from CI snapshot) or declared baseline. */
  source: "measured" | "baseline";
}

export interface EvalSummary {
  version: string;
  totalCases: number;
  asOf: string;
  overallPassRate: number;
  source: "measured" | "baseline";
  categories: CategorySummary[];
}

const DATASET_PATH = path.join(
  process.cwd(),
  "test",
  "eval",
  "golden-dataset.json",
);

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "test",
  "eval",
  "last-run-summary.json",
);

// Declared baselines — what we hold ourselves to. The CI run replaces these
// with measured values when the snapshot file is present.
const BASELINE = {
  router: 0.94,
  safety: 1.0,
  pii: 0.96,
} as const;

function categoryOf(id: string): "router" | "safety" | "pii" | null {
  if (id.startsWith("router-")) return "router";
  if (id.startsWith("safety-")) return "safety";
  if (id.startsWith("pii-")) return "pii";
  return null;
}

interface SnapshotPayload {
  asOf?: string;
  categories?: Partial<Record<"router" | "safety" | "pii", number>>;
}

async function readJson<T>(p: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getEvalSummary(): Promise<EvalSummary> {
  const dataset = await readJson<Dataset>(DATASET_PATH);
  const snapshot = await readJson<SnapshotPayload>(SNAPSHOT_PATH);

  const counts: Record<"router" | "safety" | "pii", number> = {
    router: 0,
    safety: 0,
    pii: 0,
  };
  if (dataset) {
    for (const c of dataset.cases) {
      const cat = categoryOf(c.id);
      if (cat) counts[cat]++;
    }
  }

  const categories: CategorySummary[] = (
    [
      { id: "router", labelAr: "توجيه الرسائل (Router)" },
      { id: "safety", labelAr: "الأمان والحماية" },
      { id: "pii", labelAr: "حماية البيانات الشخصية" },
    ] as const
  ).map(({ id, labelAr }) => {
    const measured = snapshot?.categories?.[id];
    const passRate =
      typeof measured === "number" ? measured : BASELINE[id];
    return {
      id,
      labelAr,
      total: counts[id],
      passRate,
      source: typeof measured === "number" ? "measured" : "baseline",
    };
  });

  const totalCases = categories.reduce((acc, c) => acc + c.total, 0);
  const weightedPass =
    totalCases === 0
      ? 0
      : categories.reduce((acc, c) => acc + c.passRate * c.total, 0) /
        totalCases;

  return {
    version: dataset?.version ?? "unknown",
    totalCases,
    asOf: snapshot?.asOf ?? new Date().toISOString(),
    overallPassRate: weightedPass,
    source: snapshot ? "measured" : "baseline",
    categories,
  };
}
