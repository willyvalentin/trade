# Action 664E — Default-Off Canonical Capture Orchestrator

Status: implemented and verified locally. The orchestrator is not imported by
any live consumer and has no default database client.

## Source boundary

The only accepted source is a completed recommendation snapshot/outcome
bundle:

```text
completed snapshot/outcome bundle
  → Action 664B recommendation-outcome projection
  → Action 664C persistence envelope
  → Action 664D storage payload
  → default-off writer
  → full database readback
  → existing Action 664B readback adapter
  → canonical parity
```

Visible and research-only bundles are supported. Scanner candidates, raw
snapshots without completed outcomes, batches, no-trade decisions, historical
replays, and other source types are outside this orchestrator.

## Explicit evidence contract

Preparation requires explicit:

- stable producer decision ID and decision timestamp;
- `visible` or `research_only` sample type;
- numeric confidence field and separate label field, including explicit null;
- complete versions metadata;
- candidate, scan-run, batch, snapshot, and recommendation lineage;
- provider source timestamp and candle interval;
- evaluator-input identity;
- evaluated trade plan.

Snapshot, outcomes, batch, scan run, and metadata must agree. The orchestrator
does not infer or generate a missing identity, sample type, confidence,
version, or lineage value.

The primary outcome must be selected from complete coverage by the existing
`60m > 30m > 15m` policy. Incomplete provider coverage is
`incomplete_not_quality_eligible`. Duplicate horizons remain diagnostic
evidence and produce `conflicting`; they are never deduplicated implicitly.

## Two-stage execution

The pure preparation stage returns either:

- `would_insert` plus an integrity-bound capture plan;
- `conflicting`;
- `unmappable`;
- `incomplete_not_quality_eligible`.

The executor revalidates the complete 664D storage payload and the prepared
semantic SHA-256 before database construction. A changed envelope or storage
projection is rejected before any read or write.

Execution requires all of:

```text
TURE_CANONICAL_EVALUATION_WRITER_ENABLED=true
TURE_CANONICAL_EVALUATION_WRITER_KILL_SWITCH=false
mode="capture"
database.scope="disposable_local_postgres"
```

Diagnostic mode is the default even when both flags are explicitly open.

## Zero-activity proof

When the feature flag is absent/false:

```text
status: disabled
client constructions: 0
identity reads: 0
full readbacks: 0
insert attempts: 0
```

When the kill switch is absent/engaged:

```text
status: kill_switch_engaged
client constructions: 0
identity reads: 0
full readbacks: 0
insert attempts: 0
```

The database factory is not invoked in either state.

## Readback parity

After `inserted` or `idempotent_no_effect`, the complete stored row is rebuilt
as an Action 664C storage payload, revalidated by the Action 664D validator,
and projected through `projectCanonicalStoragePayloadThrough664B`.

Parity requires equality for:

- canonical identity;
- sample type;
- numeric and categorical confidence;
- candidate/batch/scan-run/snapshot/recommendation/outcome lineage;
- all version metadata;
- primary outcome and horizon;
- quality eligibility;
- diagnostic horizon count.

JSON objects are recursively canonicalized before equality comparison because
PostgreSQL `jsonb` deliberately normalizes object-key order.

## Idempotency and conflict

- An exact retry reads the existing semantic digest, retains one row, returns
  `idempotent_no_effect`, and still performs full adapter parity.
- The same canonical identity with different valid semantics returns
  `semantic_conflict`, performs no insert, and never overwrites the row.
- A unique-insert race remains governed by the Action 664D readback contract.

## Fixture and PostgreSQL evidence

The fixture report is
`docs/action-664e-capture-readback-matrix.json`.

Pure/in-memory orchestrator matrix: 16 passed, 0 failed.

A disposable PostgreSQL 16 acceptance test:

1. replayed all 34 migrations directly from canonical local `origin/main`;
2. applied only local migration `20260726001000`;
3. captured a visible completed bundle;
4. verified full parity through the existing 664B adapter;
5. retried and retained one visible row;
6. rejected a semantic collision without insert;
7. captured a research-only completed bundle with full parity;
8. finished with exactly two canonical rows;
9. removed the container.

No production, staging, linked Supabase, or external database was contacted.

## Live boundary

No existing production route, generator, scanner, snapshot writer, outcome
writer/runner, statistics consumer, or learning consumer imports or calls the
orchestrator.

The implementation has:

- no provider or scanner call;
- no default Supabase client;
- no generated database-type change;
- no production or staging fallback;
- no dual-write, backfill, route, cron, or collector integration.

## Remaining blockers

- authoritative stable producer IDs in a real source producer;
- approved ownership for one future call-site;
- generated database types after separately approved schema application;
- an ephemeral staging database gate, if staging evidence is later approved;
- operational kill-switch ownership and monitoring;
- migration review and deployment rollback rehearsal;
- a bounded shadow-capture observation period before metrics consumption.

## Proposed Action 664F

Create a canonical evaluation read model and quality-metrics eligibility
diagnostic over fixture/local rows only:

1. read canonical rows through a server-only, read-only repository;
2. emit one recommendation-level record per canonical identity;
3. expose diagnostic horizons separately without multiplying metric samples;
4. calculate coverage, parity, reproducibility, and reason-code summaries;
5. prove that incomplete, conflicting, rejected, and no-trade rows cannot enter
   ordinary quality metrics accidentally;
6. retain default-off/no-live-consumer isolation;
7. require a separate action before any production migration or capture
   activation.
