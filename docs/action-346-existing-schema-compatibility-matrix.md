# Action 346: Existing Schema Compatibility Matrix

## Matrix Status

- existing_schema_compatibility_status: matrix_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is schema compatibility planning only, not schema implementation, migration, runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Existing schema/type surfaces must be respected. Planned intelligence fields should map to existing architecture where possible.

Adapters/mappers are preferred before migrations. Migrations should only be proposed after concrete gap proof. The goal is to avoid parallel architecture and duplicated learning records.

## Compatibility Classification Model

| classification | meaning | allowed next step | blocked behavior |
| --- | --- | --- | --- |
| existing_compatible | Planned field already has a clear existing schema/type/documentation surface. | Reference existing field and write adapter notes. | Do not create a duplicate field/table. |
| adapter_needed | Existing data can support the planned field after deterministic mapping. | Draft adapter/mapping plan and tests. | Do not persist mapped copies as new source-of-truth records. |
| extension_candidate | Existing surface likely needs additive metadata but can remain compatible. | Gather exact proof and propose additive extension later. | Do not alter schema from this matrix. |
| migration_candidate | Existing schema likely cannot represent the planned field safely. | Produce migration proposal only after proof, impact review, and rollback plan. | Do not create migration here. |
| duplicate_risk | Planned field overlaps existing records or IDs. | Stop and reconcile ownership/source-of-truth. | Do not introduce parallel architecture. |
| needs_audit | Existing surface is unclear or not yet proven. | Inspect files/types/docs locally and document proof. | Do not assume the field is missing. |
| blocked | Planned field should not proceed under current safety state. | Keep blocked until approval/readiness gates exist. | Do not implement, persist, or route. |

## Source Surfaces For Compatibility Review

- Supabase migrations
- recommendation tables/docs
- recommendation snapshot types
- outcome/replay types
- historical candle tables
- fetch-run/audit tables
- History/Statistics helpers
- static replay model
- scan run metadata
- provider data helpers
- tests that encode existing field expectations

## Compatibility Matrix

| planned domain | planned field/group | likely existing surface | compatibility classification | duplicate risk | required proof | recommended additive next step |
| --- | --- | --- | --- | --- | --- | --- |
| recommendation identity | recommendation_id, snapshot_fingerprint, batch_fingerprint, scan_run_id | recommendation tables/docs, recommendation snapshot types, scan run metadata | existing_compatible | duplicate snapshot ids | exact field/type reference | adapter notes only |
| trade plan | ticker, side, entry, stop, target, risk geometry | recommendation snapshot types, recommendation tables/docs | existing_compatible | duplicate recommendation rows | snapshot payload proof | map existing plan fields |
| setup taxonomy | setup_family, setup_type, entry_type | recommendation snapshot types, tests that encode existing field expectations | adapter_needed | duplicate setup taxonomy fields | source field inventory proof | deterministic setup adapter plan |
| confidence | confidence_bucket, score, tier | recommendation tables/docs, recommendation snapshot types | adapter_needed | duplicate confidence fields | score/tier field proof | confidence bucket adapter |
| quality gates | sanitizer, freshness, risk geometry, publish rejection | scan run metadata, tests that encode existing field expectations | needs_audit | duplicate gate fields | diagnostic/source proof | audit gate ownership |
| market regime context | market_regime_label, index trend/chop | History/Statistics helpers, static replay model | extension_candidate | parallel context records | existing helper/file proof | context envelope adapter proposal |
| sector/industry context | sector, industry, peer/ETF support | recommendation snapshot types, provider data helpers | extension_candidate | duplicate sector mapping | metadata surface proof | sector adapter plan |
| relative strength context | relative_strength_profile, benchmark spread | History/Statistics helpers, provider data helpers | adapter_needed | duplicate derived metrics | calculation/source proof | derived context mapper plan |
| news/catalyst context | catalyst_type, freshness, availability | provider data helpers, recommendation snapshot metadata | migration_candidate | duplicate news persistence | missing field proof and anti-leakage proof | proposal only after news source audit |
| calendar/event context | macro day, earnings day, options expiration | History/Statistics helpers, tests that encode existing field expectations | needs_audit | duplicated event source | source availability proof | calendar context audit |
| data provenance | provider, source, timestamp, freshness, gaps | provider data helpers, scan run metadata, fetch-run/audit tables | adapter_needed | duplicate provider audit rows | provenance field proof | provenance adapter plan |
| historical candles | provider, ticker, interval, timestamp, OHLCV | historical candle tables, Supabase migrations | existing_compatible | duplicate candle persistence tables | migration/table reference | use existing candle storage |
| fetch-run audit | run id, request plan, status, no-write flags | fetch-run/audit tables | existing_compatible | duplicate provider audit rows | audit table/doc proof | reuse fetch-run audit concepts |
| replay/outcome result | target/stop/no-entry/R metrics | outcome/replay types, static replay model | existing_compatible | duplicate outcome records | outcome type proof | outcome adapter only |
| learning outcome dataset | joined snapshot/outcome/context row | learning dataset docs, outcome/replay types | adapter_needed | duplicate learning dataset rows not linked to snapshots | join-key proof | mapper plan before persistence |
| pattern insight | evidence strength, overfitting risk, recommended action | pattern insight static type spec, History/Statistics helpers | migration_candidate | duplicate pattern insight persistence without dataset linkage | dataset linkage proof | static fixture spec first |
| History/Statistics reporting | summaries, cohorts, confidence buckets | History/Statistics helpers | adapter_needed | parallel reports | helper references | report adapter plan |
| provider capacity experiment | request metrics, payload size, failure mode | provider data helpers, fetch-run/audit tables, Action 339 cost/capacity plan | adapter_needed | duplicate audit/capacity records | audit pattern proof | no-write experiment plan only |

## Migration Candidate Rules

- no migration should be created from this action
- migration candidates require exact existing schema proof
- migration candidates require backward compatibility analysis
- migration candidates require History/Statistics impact review
- migration candidates require production migration safety plan
- migration candidates require rollback/readback strategy

## Adapter-First Rules

- prefer mapping existing fields into learning dataset rows
- prefer context envelope adapters over parallel tables
- prefer outcome adapters over duplicate outcome records
- prefer provider audit adapters over new audit concepts
- preserve existing static replay result model compatibility
- preserve History/Statistics compatibility

## Duplicate-Risk Warnings

- duplicate recommendation rows
- duplicate snapshot ids
- duplicate outcome records
- duplicate confidence fields
- duplicate setup taxonomy fields
- duplicate provider audit rows
- duplicate candle persistence tables
- duplicate learning dataset rows not linked to snapshots
- duplicate pattern insight persistence without dataset linkage

## Gap Proof Requirements

- exact file/schema reference
- missing field proof
- inability to adapt existing field
- downstream consumer impact
- migration need
- test coverage plan
- rollback/readback plan

## Blocked Implementation Work

- no schema changes yet
- no migrations yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This matrix does not authorize schema changes, migrations, Supabase remote reads, Supabase reads, Supabase writes, runtime route changes, provider calls, news API calls, replay execution, scanner mutations, ranking mutations, confidence threshold changes, deploys, main pushes, recommendation mutation, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 347: Learning Dataset Static Fixture Implementation Plan
- Action 348: Intelligence Context Static Fixture Implementation Plan
- Action 349: Pattern Insight Static Fixture Spec
- Action 350: Runtime Ping-Only Route Approval Gate
- Action 351: First Tiny Provider Capacity Experiment Approval Gate
- Action 352: Snapshot-to-Learning Dataset Mapper Plan
