# Action 386: Static Intelligence Package Consolidation And Mapper Readiness Review

## Status And Purpose

- review_status: complete
- readiness_vocabulary: ready | ready_with_conditions | blocked
- readiness_decision: ready_with_conditions
- mapper_implementation_approved: false
- mapper_approval_gate_creation_permitted: true
- runtime_preview_status: runtime_preview_waiting_for_operator_inputs

This static review consolidates the intelligence contracts, fixtures, tests, and verifiers and decides only whether a separate Snapshot-to-Learning Dataset Mapper Implementation Approval Gate may be created. It does not implement or directly approve a mapper.

## Scope

The review is local, deterministic, read-only, and documentation/tests/verifier only. It inspects existing contracts and literal fixtures without collecting data, constructing learning rows, calculating outcomes, discovering patterns, or changing production behavior.

## Authoritative Product Dependency

The authoritative product vision remains `Ture Produktspecifikation.md`. The intelligence flow remains Recommendation Snapshot plus Context Snapshot plus Outcome to Learning Dataset Row, then future Pattern Discovery, Pattern Insight, Confidence Calibration, and improved recommendation decisions.

## Upstream Action Inventory

This review depends on:

- Action 331
- Action 332
- Action 334
- Action 335
- Action 336
- Action 337
- Action 340
- Action 342
- Action 343
- Action 346
- Action 347
- Action 348
- Action 349
- Action 352
- Action 353
- Action 354
- Action 355
- Action 356
- Action 357
- Action 380
- Action 381
- Action 382
- Action 383
- Action 384
- Action 385

Action 309 remains the controlling post-recovery safety protocol.

## Implementation Inventory

Implemented static surfaces are deterministic Learning Dataset fixtures, Intelligence Context fixtures, Pattern Insight fixtures, malformed/boundary fixtures, validators, context-to-learning compatibility tests, learning-to-pattern evidence compatibility tests, and deterministic serialization checks.

Not implemented are the Snapshot-to-Learning Dataset mapper, runtime context collection, persistence, provider/news access, replay, aggregation, Pattern Discovery, statistical inference, confidence calibration, ranking mutation, and recommendation mutation.

## Contract Inventory

- Recommendation Snapshot: `RecommendationSnapshot` in `lib/recommendation-snapshot.ts`.
- Evaluated Outcome: `RecommendationOutcome` and its status/horizon contracts in `lib/recommendation-outcome-tracker.ts`.
- Intelligence Context values and provenance: `LearningDatasetContext`, `LearningDatasetContextValue`, and `LearningDatasetProvenance` in `lib/learning-dataset-static-fixtures.ts`, owned conceptually by Action 336 and reused by Action 381.
- Learning Dataset Row: `Action335LearningDatasetRow` and its nested exported types in `lib/learning-dataset-static-fixtures.ts`.
- Pattern Insight: Action 343 types implemented by `Action343PatternInsightStaticFixture` and related types in `lib/pattern-insight-static-fixtures.ts`.
- Mapper plan and field mapping: Action 352 documentation only. No mapper contract or implementation has been duplicated.

## Fixture Inventory

- Action 357: 21 valid Pattern Insight fixtures and 17 malformed cases.
- Action 380: 13 valid Learning Dataset fixtures and 14 malformed cases.
- Action 381: deterministic Intelligence Context fixtures and 18 malformed cases.

The fixture accessors return defensive copies. IDs and timestamps are literal and stable. Fixtures are examples of contracts, not runtime records.

## Verifier Inventory

The review requires healthy verifiers for Actions 352, 357, 380, 381, 383, 385, and 386, plus Action 309, the golden static safety verifier, and Actions 318-320 package guards.

## Compatibility-Test Inventory

- Action 383 proves direct Intelligence Context-to-Learning Dataset type compatibility, linkage, temporal boundaries, missing-state semantics, provenance, malformed isolation, and immutability.
- Action 385 proves Learning Dataset evidence dimensions are conceptually compatible with Pattern Insight output dimensions without deriving, calculating, aggregating, or generating insights.

## Explicit Non-Goals

This action does not implement or approve mapper code, runtime integration, persistence, Supabase, providers/news, replay, aggregation, statistics, inference, Pattern Discovery, confidence calibration, ranking changes, recommendation changes, schema changes, or migrations.

## Intelligence-Layer Ownership Matrix

Every concept resolves to one authoritative owner. `reused` means another package imports or references the owner rather than redefining it.

| concept | authoritative source | classification | reuse or condition |
| --- | --- | --- | --- |
| recommendation identity | `RecommendationSnapshot` | authoritative | Learning identity reuses its IDs |
| recommendation timestamp | `RecommendationSnapshot.recommended_at/app_timestamp/created_at` | authoritative | exact mapper precedence is deferred to the next gate |
| snapshot identity | `RecommendationSnapshot.id/snapshot_fingerprint` | authoritative | Action 352 requires stable linkage |
| context identity | `Action336IntelligenceContextStaticFixture` envelope | authoritative | Learning row reuses `context_snapshot_id` linkage |
| context values | `LearningDatasetContext` | authoritative | Action 381 imports this type directly |
| provenance | `LearningDatasetProvenance` | authoritative | Action 381 imports this type directly |
| completeness | `Action335LearningDatasetRow` and `LearningDatasetProvenance` | authoritative | row and provenance completeness are distinct, named scopes |
| outcome identity | `RecommendationOutcome.id` | authoritative | Learning outcome reference reuses it |
| outcome status | `RecommendationOutcomeStatus` | authoritative | Learning outcome vocabulary adapts it without replacing it |
| outcome metrics | `RecommendationOutcome` | authoritative | mapper copies supported evaluated values only |
| Learning Dataset row identity | `LearningDatasetIdentity` | authoritative | deterministic key rules come from Actions 335/352 |
| Pattern Insight identity | `Action343PatternInsightStaticFixture.insight_id` | authoritative | synthetic fixture output identity only |
| source references | `LearningDatasetProvenance` for rows; `Action343SampleWindow.source_dataset_reference` for insights | authoritative | separate layer-specific scopes, not competing definitions |
| observation windows | `Action343SampleWindow` | authoritative | analytical output time, never snapshot knowledge |
| readiness states | Action 343 Pattern Insight contract | authoritative | immutable synthetic output literals |
| peer-group context | none in shared Learning Dataset/Pattern Insight contracts | unsupported_optional | never infer from sector or industry |
| mapper result/error vocabulary | future approval gate | deferred | must be frozen before implementation |

No concept has two competing authoritative definitions. Layer-specific provenance completeness and source references have distinct scopes and therefore do not form parallel schemas.

## Type Ownership Matrix

| type family | owner | review result |
| --- | --- | --- |
| recommendation snapshot | `lib/recommendation-snapshot.ts` | authoritative existing runtime input type |
| evaluated outcome | `lib/recommendation-outcome-tracker.ts` | authoritative existing runtime input type |
| shared context values/provenance | Action 380 exported types, conceptually specified by Action 336 | authoritative and reused |
| Intelligence Context fixture envelope | Action 381 | fixture-only envelope; no competing context value schema |
| Learning Dataset row | Action 380 implementation of Action 335 | authoritative mapper output target |
| Pattern Insight | Action 357 implementation of Action 343 | authoritative synthetic output contract |
| compatibility shapes | none | no compatibility-only production schema exists |
| mapper input/result types | none yet | deferred to a separate approval gate |

Action 381 directly imports `LearningDatasetContext`, `LearningDatasetContextValue`, and `LearningDatasetProvenance` from Action 380. Action 383 proves direct contract compatibility. Action 357 uses its Action 343 contract types. Action 385 inspects evidence compatibility without derivation. No fixture-only shadow schema, compatibility-only production schema, or premature mapper contract exists.

## Recommendation Snapshot Boundary

`RecommendationSnapshot` owns recommendation and snapshot identity, ticker, side, plan geometry, recommendation timestamps, window, visibility/source state, confidence/setup-adjacent values, and captured payload metadata. The mapper may read a validated snapshot but must not normalize by hidden precedence. The next approval gate must freeze which existing timestamp and setup/confidence aliases take precedence.

## Intelligence Context Boundary

The Action 381 envelope owns deterministic context fixture identity, recommendation linkage, effective time, freshness, conflicts, excluded future facts, and fixture expectations. Its `context` and `data_provenance` values reuse the Action 380 shared types. Runtime context collection remains absent and is not required for a pure mapper consuming an already prepared context snapshot.

## Outcome Boundary

`RecommendationOutcome` owns evaluated outcome identity, snapshot/recommendation linkage, horizon, evaluated time, status, trigger/terminal facts, and R/price metrics. The mapper consumes an already evaluated outcome; it must never call candle providers or calculate an outcome.

## Learning Dataset Row Boundary

`Action335LearningDatasetRow` is the output target. It owns deterministic row identity, input references, snapshot-time inputs, trade plan, setup/confidence, quality gates, shared context, provenance, outcome fields, derived learning labels, anti-leakage status, eligibility, missing reasons, fixture status, and completeness. Row construction remains unimplemented.

## Pattern Insight Boundary

Action 357 fixtures are synthetic output-contract examples owned by the Action 343 types. Their sample metrics, directions, evidence strengths, readiness notes, and source windows are literals. They are not discovered, inferred, calculated, statistically supported, or causally derived from Action 380 rows.

## Identity And Linkage Review

Recommendation, snapshot, context, and outcome identities are explicit and cross-checked by current validators. The Learning Dataset key is deterministic from stable source identities and outcome window/version. Random IDs, wall-clock IDs, missing linkage, conflicting linkage, duplicate row identity, and outcome/context mismatches are malformed. Result: ready.

## Temporal-Semantics Review

Recommendation time is the snapshot knowledge boundary. Context capture/effective time must be at or before recommendation time. Outcome evaluation must be at or after recommendation time. Pattern Insight observation windows are analytical output windows. Invalid ordering and wall-clock attempts are malformed. Result: ready.

## Snapshot-Time Versus Outcome-Time Review

Snapshot geometry, setup, confidence, quality gates, context, and snapshot provenance cannot consume outcome facts. Trigger, target/stop, realized/terminal R, MFE/MAE, and learning labels are outcome-time fields. Current validators reject outcome leakage into snapshot/context fields. Result: ready.

## Anti-Leakage Review

Action 381 explicitly represents excluded future news and macro facts, effective times, and `included_in_snapshot_context: false`. Actions 380/383 validate bounded context times and reject snapshot outcome leakage. Action 385 preserves observation-window separation. These rules are directly testable and require no runtime lookup. Result: ready.

## Missing-Data Semantics Review

`present`, `explicit_null`, `unknown`, and `unavailable` are distinct shared context states. Incomplete and not-yet-available outcomes remain distinct from completed outcomes. Missing optional context may yield a limited row; missing required identity/linkage remains blocking. No default may be inferred. Result: ready.

## Provenance Review

Shared provenance represents complete, partial, low-quality, conflicting, stale, and unavailable states with provider/source IDs, source timestamps, confidence, audit status, missing flags, and bounded completeness. The mapper copies supplied provenance and validates it; it cannot fetch or synthesize lineage. Result: ready.

## Completeness Review

Row completeness and provenance completeness are explicit, bounded values with distinct scopes. Context fixtures also carry expected completeness labels for static scenarios. The mapper must preserve supplied semantics and may only assign output completeness under rules frozen by the approval gate. No statistical quality calculation is permitted. Result: ready_with_conditions.

## Fixture Determinism Review

Actions 357, 380, and 381 use literal IDs/timestamps, stable lexical ordering, deterministic serialization, and no environment, random, clock, provider, or persistence access. Result: ready.

## Fixture Immutability Review

Accessors return defensive copies; compatibility tests capture baselines and verify IDs, ordering, timestamps, provenance, source references, and literal metrics remain unchanged. Result: ready.

## Malformed And Boundary Coverage Review

Coverage includes missing/duplicate identity, invalid linkage, invalid temporal ordering, future leakage, outcome leakage, malformed provenance, unsupported categories/readiness/evidence quality, non-finite values, invalid bounds/windows, contradictory effects, random IDs, and wall-clock attempts. Inputs are rejected without repair. Result: ready.

## Context-To-Learning Compatibility Result

Action 383 is green. Action 381 reuses the Action 380 context and provenance types directly, and no transformation schema is needed for compatibility.

## Learning-To-Pattern Evidence Compatibility Result

Action 385 is green. Learning rows expose sufficient setup, context, outcome, temporal, missing-state, and provenance dimensions for future Pattern Discovery research. This is representational compatibility only and does not authorize aggregation or discovery.

## No-Parallel-System Review

No duplicate recommendation, outcome, context-value, provenance, Learning Dataset, Pattern Insight, compatibility, or mapper schema has emerged. Fixture envelopes add test metadata around reused contracts without replacing those contracts. Result: ready.

## Adapter-First Review

The future mapper must consume `RecommendationSnapshot`, the shared context envelope/types, and `RecommendationOutcome`, then produce the existing Learning Dataset row contract. Alias normalization must be explicit in the gate and cannot create a second domain model. Result: ready_with_conditions.

## No-Runtime Review

The mapper needs only supplied input objects. Runtime context collection, routes, clocks, environment values, providers, news clients, and scanner access are unnecessary and prohibited. Result: ready.

## No-Persistence Review

The mapper returns a value or explicit error result only. Supabase, local storage, filesystem writes, migrations, schemas, and persistence callbacks are outside its boundary. Result: ready.

## Mapper Input Contract Readiness

Conceptual input is `{ recommendationSnapshot, contextSnapshot, outcome }`. Each has deterministic identity/linkage, version or contract identity, timestamp semantics, required/optional distinctions, missing-state behavior, provenance where applicable, validation boundaries, and malformed coverage. Exact alias precedence for recommendation timestamp, setup label, confidence value, and side must be frozen in the next gate. Result: ready_with_conditions.

## Mapper Output Contract Readiness

The Learning Dataset row has deterministic identity, source references, snapshot/outcome separation, context/provenance/completeness representation, explicit missing states, stable ordering/serialization expectations, validators, and malformed examples. Construction error vocabulary is not yet authoritative. Result: ready_with_conditions.

## Mapper Validation Requirements

The approval gate must require input immutability, deterministic repeated output, stable serialization, required identity/linkage validation, timestamp ordering, future-fact exclusion, finite numbers, bounded confidence/completeness, provenance validation, outcome validation, duplicate-key detection, and explicit handling of optional gaps. Malformed inputs must not be repaired.

## Mapper Error-Result Requirements

Illustrative states include `mapped`, `mapped_with_missing_optional_data`, `blocked_missing_required_identity`, `blocked_invalid_linkage`, `blocked_temporal_violation`, `blocked_future_leakage`, `blocked_invalid_provenance`, and `blocked_invalid_outcome`. These names are not production vocabulary. The next approval gate must freeze a discriminated result contract using existing validation concepts before implementation.

## Mapper Purity Requirements

The mapper must be synchronous or otherwise purely local, deterministic, side-effect-free, environment-independent, filesystem-independent, network-independent, provider-independent, Supabase-independent, persistence-independent, clock-independent, and random-independent. It must not fetch context, calculate market regime or outcomes, infer missing values, use hidden precedence, repair malformed inputs, persist rows, mutate inputs, or mutate recommendations/ranking/confidence.

## Unsupported Gaps

- Peer-group: `unsupported_optional`. It is absent from the shared Learning Dataset context and Pattern Insight contracts. Action 381 has fixture-only expected peer labels, but no shared value field. It must not block mapper implementation, must not be inferred from sector/industry, and requires a separate extension gate if made authoritative.
- Runtime context collector: `deferred`; not required by the pure mapper.
- Provider-specific field lineage beyond supplied provenance: `deferred`; mapper must not fetch it.
- Pattern metrics and calibration fields: `blocked` for mapper scope.
- Production persistence shape for Learning Dataset rows: `deferred`; not required for pure return values.

## Deferred Fields

The next gate must identify exact source aliases for recommendation timestamp, side, setup family, confidence value/bucket, and outcome metric mapping. It must also decide whether mapper version belongs in the row schema or is represented by the existing schema/enrichment version fields. No new field is invented here.

## Blocker Inventory

No architectural blocker prevents creation of a mapper implementation approval gate. Implementation remains blocked until that gate freezes result/error vocabulary and explicit alias precedence. Runtime collection, persistence, peer-group extension, Pattern Discovery, and calibration remain separately blocked work.

## Risk Inventory

- Hidden alias precedence could make mappings nondeterministic.
- Collapsing null/unknown/unavailable could erase evidence quality.
- Outcome facts could leak backward if temporal checks are bypassed.
- Fixture expectation labels could be mistaken for shared production fields.
- A mapper could accidentally import runtime/persistence helpers.

Each risk is bounded by a required next-gate condition and static source checks.

## Readiness Vocabulary

- `ready`: all contracts and mapper decisions are frozen; only implementation remains.
- `ready_with_conditions`: architecture is sound, but one bounded result-vocabulary or source-field-reference decision must be frozen in the next approval gate.
- `blocked`: competing ownership, incomplete required contracts, runtime/inference/persistence/schema dependency, unresolved leakage, or required unsupported fields prevent a pure mapper.

## Deterministic Readiness Conditions

The decision requires single authoritative ownership, sufficiently defined inputs/output, deterministic identity/linkage, complete temporal separation, testable anti-leakage, explicit missing/provenance semantics, green compatibility tests, no required schema/runtime/persistence change, pure mapper feasibility, explicit non-blocking gaps, and a narrow auditable future boundary.

## Readiness Decision

`readiness_decision: ready_with_conditions`

The architecture is sufficient for a separate mapper implementation approval gate. The gate must freeze a discriminated mapper result/error contract and explicit existing-field alias precedence. Those decisions do not require mapper implementation, schema changes, runtime access, inference, or persistence.

## Passed Conditions

- passed_conditions_count: 16
- single authoritative ownership
- deterministic identity and linkage
- temporal separation and anti-leakage
- explicit missing-data and provenance semantics
- deterministic immutable fixtures
- green context-to-learning compatibility
- green learning-to-pattern evidence compatibility
- no parallel schema
- pure local mapper feasible
- no runtime dependency
- no persistence dependency
- no schema change required
- unsupported peer-group gap is optional and explicit
- mapper boundary is narrow
- upstream static verifiers are healthy

## Failed Conditions

- failed_conditions_count: 0
- failed_conditions: none

## Unresolved Conditions

- unresolved_conditions_count: 2
- freeze mapper result/error vocabulary in the next approval gate
- freeze explicit precedence for existing recommendation/setup/confidence aliases in the next approval gate

## Next Permitted Action

Create a separate Snapshot-to-Learning Dataset Mapper Implementation Approval Gate. That gate may approve only a pure local mapper and focused tests; it must not approve runtime integration, persistence, providers, Supabase, replay, Pattern Discovery, confidence calibration, ranking changes, recommendation changes, schema changes, migrations, or deployment.

The runtime-preview chain remains paused at `runtime_preview_waiting_for_operator_inputs`.
