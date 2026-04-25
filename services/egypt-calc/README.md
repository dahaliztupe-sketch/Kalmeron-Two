# Egypt Calc (Python · FastAPI)

Deterministic Egyptian tax & social-insurance calculator.

## Why a separate service?

- The CFO Agent needs **exact** numbers for take-home pay, employer cost,
  and tax liability. LLMs are bad at this — they hallucinate brackets.
- Tax law changes frequently (Law 91/2005 has had major amendments in
  2014, 2018, 2020, 2023, 2024…). A pure-functional sidecar with a clear
  `AS_OF` date is auditable; an LLM prompt is not.
- `hypothesis` property-based tests catch entire classes of bugs (negative
  income, off-by-one bracket boundaries, cap/floor violations) that unit
  tests miss.

## Endpoints

### `GET /health`
Returns `{ ok, service, version, asOf }`.

### `POST /income-tax`
```json
{ "annual_gross": 220000 }
```
Returns the full bracket-by-bracket breakdown plus annual & monthly tax,
effective rate, marginal rate.

### `POST /social-insurance`
```json
{ "monthly_wage": 15000 }
```
Returns employee & employer contributions, insurable wage (capped/floored),
total employer cost, net after employee SI.

### `POST /total-cost`
```json
{ "monthly_gross": 15000, "months": 13 }
```
End-to-end: gross → take-home + true employer cost. `months` accepts 12,
13, or 14 (for the common 13th/14th salary practice in Egypt).

## Run locally

```bash
cd services/egypt-calc
uvicorn main:app --host 0.0.0.0 --port 8008
# or
npm run egypt-calc:dev
```

## Tests

```bash
cd services/egypt-calc
python -m pytest tests/ -q
```

`hypothesis` runs 200 random examples per property. Failing examples are
auto-shrunk to the smallest reproducer.

## Updating brackets

When parliament amends the tax law:

1. Update `INCOME_TAX_BRACKETS` and `PERSONAL_EXEMPTION` in `taxes.py`.
2. Update the `AS_OF` constant.
3. Update the golden values in `tests/test_taxes.py` (the property tests
   keep working automatically; the golden tests fail intentionally so you
   notice the change).
4. Bump the `version` string in `main.py`.
