# Data Warehouse (dbt + DuckDB)

Local-first analytics warehouse for Kalmeron. Same SQL dialect and dbt
models that will eventually run on BigQuery — but here it runs in-process
on a single `.duckdb` file with no infra cost.

## Why

- Firestore is fine for transactional reads but **terrible** for analytics
  ("what did each agent cost yesterday?", "what's our TTFV by cohort?").
- dbt gives us versioned, tested SQL transformations: every column is
  declared in `_sources.yml`, every uniqueness/not-null assumption is
  testable with `dbt test`.
- DuckDB lets us run the entire pipeline locally on the seed CSVs in
  under 2 seconds — perfect for CI and fast iteration.
- Switching to BigQuery later is a `profiles.yml` swap; the models are
  unchanged.

## Project layout

```
services/data-warehouse/
├── dbt_project.yml                  # project config
├── profiles.yml                     # connection profile (dev = duckdb)
├── seeds/                           # raw_*.csv (replaceable from prod)
│   ├── raw_agents.csv
│   ├── raw_events.csv
│   ├── raw_costs.csv
│   ├── raw_router_decisions.csv
│   └── raw_users.csv
├── models/
│   ├── _sources.yml                 # source definitions + tests
│   ├── staging/stg_*.sql            # raw → typed
│   └── marts/                       # business-grade fact + dim tables
│       ├── dim_agents.sql
│       ├── fct_cost_daily.sql
│       ├── fct_router_accuracy.sql
│       └── fct_ttfv_funnel.sql
├── sync_from_firestore.py           # optional: dump prod → seeds
└── README.md
```

## Quick start

```bash
# Build the warehouse from bundled seeds
npm run dw:build

# What's in the warehouse?
npm run dw:query "select * from main_marts.fct_cost_daily limit 10"

# Run the test suite (uniqueness, not-null, source freshness)
npm run dw:test
```

After `dw:build`, the file `services/data-warehouse/dev.duckdb` exists
and contains:

| Schema | Object | Rows | Purpose |
|---|---|---|---|
| `main_raw` | `raw_*` | seeds | exact copy of the CSVs |
| `main_staging` | `stg_*` views | seeds | typed, cleaned |
| `main_marts` | `dim_agents` | 16 | per-agent rollups |
| `main_marts` | `fct_cost_daily` | by date×agent×model | Cost Dashboard |
| `main_marts` | `fct_router_accuracy` | per agent | Eval Dashboard |
| `main_marts` | `fct_ttfv_funnel` | per user | activation analysis |

## Wiring real Firestore data

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa.json
export FIRESTORE_PROJECT_ID=kalmeron-prod
pip install google-cloud-firestore        # one-time
cd services/data-warehouse
python sync_from_firestore.py             # dry-run → seeds/*.preview.csv
python sync_from_firestore.py --write     # overwrite seeds/
npm run dw:build
```

## Promoting to BigQuery

When the seed CSVs outgrow DuckDB (~10 GB or so):

1. Replace the `prod` block in `profiles.yml` with the BigQuery template
   already commented in.
2. Add `dbt-bigquery` to the dev requirements.
3. `dbt build --target prod`. The models are unchanged.

## Adding a model

1. Drop a `.sql` file under `models/staging/` or `models/marts/`.
2. If it depends on a source, add it to `models/_sources.yml`.
3. `dbt build --select <new_model>+`.
4. (Optional) Add tests in `models/<area>/_<model>.yml`.

## Querying from the Next.js app

For ad-hoc reads from the dashboard, either:

- Hit the DuckDB file directly via the `duckdb` Node bindings, or
- (Recommended for prod) export marts to a SQL endpoint (Postgres/BQ) and
  let the Next.js app query through there. dbt is the source of truth for
  the *shape* of the data; the serving layer is a separate concern.
