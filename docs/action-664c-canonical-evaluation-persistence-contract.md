# Action 664C — Canonical Evaluation Persistence and Lineage Contract

Status: executable inactive-readiness package. No schema, writer, database,
provider, replay, backfill, or live consumer is activated.

## Persistence envelope

`canonical_evaluation_persistence_v1` wraps exactly one Action 664B `mapped`
projection. A `conflicting` or `unmappable` projection cannot enter the
envelope.

The envelope contains:

- canonical identity, producer decision ID, decision timestamp, namespace,
  decision kind, and one exclusive sample type;
- numeric probability confidence and a separate categorical label;
- complete engine, scoring, ranking, setup-taxonomy, confidence, evaluator,
  provider-contract, Git, and build versions;
- candidate, scan-run, batch, snapshot, recommendation, and outcome lineage;
- regime and sector captured at decision time;
- provider, source timestamp, freshness, candle interval, coverage counts, and
  reason codes;
- evaluator-input identity, evaluated trade plan, primary outcome selection,
  all diagnostic horizons, replay metadata, reproducibility, and
  quality-metric eligibility;
- deterministic idempotency identity;
- `inactive_readiness_only: true`.

The envelope does not generate a missing decision, candidate, evaluator, or
replay identity. All required identities must already be explicit.

## Lineage contract

| Sample type | Required lineage | Forbidden or optional lineage |
| --- | --- | --- |
| `visible` | candidate → scan run → batch; snapshot and recommendation for snapshot-backed sources | outcome may be absent before evaluation |
| `research_only` | candidate → scan run → batch; snapshot and recommendation for snapshot-backed sources | outcome may be absent |
| `shadow` | candidate → scan run → batch | snapshot/outcome optional until explicitly materialized |
| `historical_synthetic` | candidate and replay metadata | scan run, batch, and snapshot optional |
| `rejected_candidate` | candidate → scan run → batch | published snapshot/recommendation lineage is conflicting |
| `no_trade` | scan run → batch | candidate, snapshot, recommendation, and outcome lineage are conflicting |

For snapshot-backed decisions, `lineage.recommendation_id` must equal the
producer decision ID. Missing required nodes are `unmappable`; contradictory
nodes are `conflicting`.

## Inactive storage payload

The pure builder creates
`canonical_evaluation_storage_payload_v1`. It proposes flat query/index fields
plus lossless JSON envelopes:

- identity, decision kind, sample type, and timestamp;
- candidate/scan-run/batch/snapshot/recommendation keys and fingerprints;
- confidence and all versions;
- regime, sector, provider source time, freshness, and candle interval;
- expected/observed coverage, primary horizon, outcome IDs, and evaluator
  input identity;
- `lineage_json`, `versions_json`, `decision_context_json`,
  `provider_context_json`, `evaluation_json`, `replay_metadata_json`, and
  `envelope_json`.

Every payload has:

```text
write_enabled: false
inactive_readiness_only: true
idempotency_key: canonical_evaluation:v1:<canonical identity>
```

There is no persistence client, table call, SQL, or side effect in the module.

## Round-trip contract

The deterministic proof path is:

```text
Action 664B mapped projection
  → canonical persistence envelope
  → proposed write-disabled storage payload
  → inactive source-shaped readback view
  → matching Action 664B adapter
  → canonical comparison
```

All six sample-type fixtures complete this round-trip without canonical drift.
The comparison covers identity, sample type, confidence, versions, lineage,
context, outcome rows, coverage, and primary-horizon selection.

Storage fields that contradict `envelope_json` fail before adapter readback.

## Legacy readiness policy

The fixture-only analyzer returns:

- `ready`: canonical persistence envelope can be built;
- `conflicting`: explicit source facts contradict each other;
- `unmappable`: canonical identity/contract/lineage cannot be constructed;
- `incomplete_but_preservable`: explicit `raw_audit_only` policy, stable source
  record identity/time, and raw payload permit evidence retention, but the row
  cannot enter recommendation-quality metrics.

It never mutates or backfills a legacy record.

The frozen local report is
`docs/action-664c-fixture-readiness-report.json`:

| Status | Count |
| --- | ---: |
| Ready | 7 |
| Conflicting | 2 |
| Unmappable | 4 |
| Incomplete but preservable | 1 |
| Total | 14 |

Production rows read: `0`. Production rows written: `0`.

## Additive schema proposal for Action 664D

The structured proposal is exported as
`canonicalEvaluationSchemaProposal`. It proposes, but does not create:

- a nullable `canonical_evaluation_decisions` relation;
- nullable identity, lineage, confidence, context, provider, coverage,
  evaluator, outcome, version, replay, and envelope fields;
- six-value sample-type and confidence range constraints;
- non-negative coverage constraints;
- lineage constraints for no-trade and rejected candidates;
- partial unique indexes for canonical identity and evaluator input identity;
- time/sample and lineage indexes plus GIN indexes for JSON envelopes;
- idempotent identical retry and semantic-conflict rejection;
- inactive dual-write by default;
- rollback by disabling the future gated writer and ignoring/dropping only the
  additive relation, without touching legacy rows.

No SQL file exists under `supabase/migrations` for Action 664C.

## Remaining blockers before schema implementation

- final table-versus-envelope storage decision;
- database constraint syntax and transaction boundaries;
- authoritative candidate ID creation before ranking;
- authoritative decision ID creation for no-trade and rejection;
- exact foreign-key policy for existing optional/legacy relations;
- retention policy for raw-audit-only legacy payloads;
- evaluator input hash algorithm and collision policy;
- horizon child-row versus JSON storage decision;
- deployment rollback and dual-write kill-switch ownership;
- production migration approval and independent readback audit.

## Proposed Action 664D

Implement the additive schema and a disabled dual-write adapter:

1. create one reviewed additive migration with nullable fields/relation,
   constraints, partial indexes, and rollback notes;
2. implement a writer interface that accepts only a ready 664C storage payload;
3. keep the writer behind a default-off server flag and explicit kill switch;
4. add transaction/idempotency tests with an isolated local test database;
5. prove legacy readers and writers remain unchanged when the flag is off;
6. add dry-run write/readback diagnostics without production activation;
7. require separate approval before enabling dual-write or running any
   production migration/backfill.

Action 664D must not change scoring, ranking, thresholds, publication, or
learning.

## Live boundary

No generator, scanner, ranking, route, persistence module, migration,
statistics consumer, or learning consumer imports the 664C contract. Imports
are limited to 664C fixtures and deterministic tests.
