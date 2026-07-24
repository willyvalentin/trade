# Action 380: Learning Dataset Static Fixture Implementation

## Status

- implementation_status: learning_dataset_static_fixtures_implemented
- implementation_scope: deterministic_local_static_contract_fixtures_only
- mapper_implementation_status: blocked
- runtime_preview_status: runtime_preview_waiting_for_operator_inputs
- deployment_allowed: false
- main_push_allowed: false

## Purpose And Boundary

Action 380 provides synthetic Learning Dataset rows for local contract validation, future mapper tests, future Pattern Discovery tests, and missing-data and anti-leakage checks. It implements only `lib/learning-dataset-static-fixtures.ts`, this document, a focused verifier and test, plus minimal Actions 318-320 guard classification.

This is the static implementation boundary approved by Action 353. That approval does not extend to a mapper or runtime integration.

The fixtures are literals. They are not generated from Recommendation Snapshots, Context Snapshots, outcomes, replay, runtime data, provider data, news data, or Supabase data.

## Authoritative Contracts

The row shape encodes the field groups from Action 335, the Intelligence Context envelope concepts from Action 336, and the identity/linkage rules from Action 352. Trade direction and outcome status directly reuse the existing exported types in `lib/replay-with-signal-package-result-model.ts`. There is one `Action335LearningDatasetRow` contract in the fixture module; no fixture-only shadow row interface or mapper model was added.

## Fixture Families

Valid rows cover:

- complete valid learning row and valid recommendation/context/outcome linkage
- complete row with rich Intelligence Context
- missing optional context and partial market context
- absent news context and absent event context
- incomplete outcome and no-outcome-yet
- unknown categorical value
- unavailable source, partial provenance, and low provenance completeness
- explicit null, unavailable, and unknown semantics
- deterministic duplicate retrieval through defensive accessors

Malformed payloads are isolated as raw records and never enter the valid row array. They cover missing identity, conflicting linkage, invalid recommendation/context relationships, invalid temporal order, late context, snapshot/outcome leakage, outcome-before-recommendation, unsupported categorical values, malformed provenance, non-finite numbers, invalid completeness bounds, duplicate row identity, wall-clock timestamp attempts, and random identity attempts.

## Determinism And Identity

All fixture IDs, timestamps, linkage values, and array order are fixed in source. IDs are lexically ordered. Serialization uses the literal property and row order. Accessors return defensive clones and deterministic lookup results. There is no `Date.now`, current-time `new Date`, random generation, UUID generation, environment read, filesystem read, or network access.

## Temporal Separation And Anti-Leakage

Recommendation and snapshot timestamps are fixed at recommendation time. Context is captured at or before recommendation creation. Evaluated outcomes occur after recommendation creation, or are explicitly null for the no-outcome-yet state. Outcome fields live only in `outcome_fields` or `derived_learning_fields`; they never rewrite snapshot-time inputs. The pure validator rejects linkage mismatches, prohibited temporal ordering, and snapshot-field outcome keys.

## Missing Data And Provenance

Context values carry explicit `present`, `explicit_null`, `unavailable`, or `unknown` states. Absent news and absent events are distinct from unavailable sources. Provenance carries complete, partial, and unavailable states plus bounded completeness and source-confidence values. Gaps remain explicit in `missing_context_reasons`; no accessor or validator repairs, enriches, calculates, or infers missing values.

## Guarantees

- no mapper: snapshots are not mapped or merged into rows
- no inference: missing values, labels, outcomes, and metrics are not inferred
- no aggregation: fixture accessors do not summarize, rank, or aggregate rows
- no runtime: no app route, page, proxy, middleware, Netlify, migration, schema, provider, news, Supabase, persistence, replay, scanner, ranking, confidence, recommendation, Add Trade, broker, execution, or risk behavior changed

## Intended Future Consumers

The fixtures may support a separately approved local mapper test, Pattern Discovery contract test, confidence-calibration research test, or static data-quality test. They are not a persistence format and do not authorize any runtime consumer.

## Blocked Work

Mapper implementation, Pattern Discovery, statistical inference, runtime generation, persistence, provider/news access, Supabase access, replay, migrations, schema changes, scanner/ranking/confidence mutation, deployment, and main push remain blocked.

The runtime-preview chain remains paused at `runtime_preview_waiting_for_operator_inputs`; Action 380 does not modify the immutable candidate or consume the preserved preview attempt.
