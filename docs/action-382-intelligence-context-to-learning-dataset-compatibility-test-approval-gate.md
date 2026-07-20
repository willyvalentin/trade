# Action 382: Intelligence Context-to-Learning Dataset Compatibility Test Approval Gate

## Gate Status

- approval_gate_status: intelligence_context_to_learning_dataset_compatibility_test_gate_ready
- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved
- approved_scope: future_static_fixture_compatibility_tests_only
- pure_composition_assertion_helper_approved: false
- snapshot_to_learning_dataset_mapper_approved: false
- runtime_integration_approved: false
- production_lib_module_approved: false
- deploy_readiness: false
- main_push_allowed: false
- runtime_preview_status: runtime_preview_waiting_for_operator_inputs

## Purpose

This deterministic gate decides whether a future repository-local test package may assert compatibility between the existing Action 380 Learning Dataset fixtures and Action 381 Intelligence Context fixtures. It does not implement those compatibility tests, compose fixtures, generate rows, transform data, implement a mapper, or perform runtime work.

Compatibility means that shared types align, existing values are representable, and linkage, temporal, provenance, missing-data, determinism, and anti-leakage contracts can be asserted without modifying fixture data.

## Scope

Action 382 is documentation, verifier, and approval-gate test work only. It evaluates a future tests-only surface. It does not approve production code or a reusable composition layer.

## Authoritative Dependencies

- `lib/learning-dataset-static-fixtures.ts` from Action 380
- `lib/intelligence-context-static-fixtures.ts` from Action 381
- shared `LearningDatasetContext`
- shared `LearningDatasetContextValue`
- shared `LearningDatasetProvenance`
- Action 335 Learning Outcome Dataset Design
- Action 336 Intelligence Context Schema
- Action 352 Snapshot-to-Learning Dataset Mapper Plan

## Upstream Action Dependencies

- Action 309: Post-Recovery Safe Development Protocol
- Action 335: Learning Outcome Dataset Design
- Action 336: Intelligence Context Schema
- Action 340: Snapshot Field Inventory
- Action 342: Intelligence Context Static Fixture Spec
- Action 346: Existing Schema Compatibility Matrix
- Action 347: Learning Dataset Static Fixture Implementation Plan
- Action 348: Intelligence Context Static Fixture Implementation Plan
- Action 352: Snapshot-to-Learning Dataset Mapper Plan
- Action 353: Learning Dataset Static Fixture Implementation Approval Gate
- Action 354: Intelligence Context Static Fixture Implementation Approval Gate
- Action 380: Learning Dataset Static Fixture Implementation
- Action 381: Intelligence Context Static Fixture Implementation

## Current Fixture Implementation Summary

Action 357 supplies static Pattern Insight fixtures. Action 380 supplies deterministic Learning Dataset rows and exports the authoritative context/value/provenance types. Action 381 supplies deterministic Intelligence Context fixtures by importing those Action 380 types directly. No executable Snapshot-to-Learning Dataset mapper, compatibility helper, row builder, transformation service, or runtime integration exists.

## Four Concepts

### A. Static Fixture Compatibility Tests

Future tests may import Action 380 and Action 381 exports directly, read defensive clones, compare existing values, assert linkage and time rules, inspect malformed cases, and verify that serialization is unchanged. Action 382 approves only A.

### B. Pure Composition Assertion Helper

A helper that returns combined or transformed fixture data would establish mapping behavior and reusable precedence decisions. Even if pure and test-only, B remains independently blocked and is not approved.

### C. Snapshot-to-Learning Dataset Mapper

A mapper would join recommendation, context, and outcome inputs; choose defaults; calculate completeness; and generate Learning Dataset rows. C remains independently blocked and is not approved.

### D. Runtime Integration

Runtime collection, recommendation enrichment, persistence, provider access, scanner/ranking integration, and production readback are D. D remains blocked and is not approved.

## Explicit Non-Goals

- no compatibility tests implemented in Action 382
- no production or test composition helper
- no mapper, adapter, normalizer, row builder, generator, or transformation utility
- no fixture mutation or fixture implementation change
- no live collection, provider/news/macro access, Supabase, persistence, replay, Pattern Discovery, statistics, ranking, confidence, recommendation, scanner, Add Trade, broker, execution, or risk change
- no runtime route, page, proxy, middleware, Netlify change, schema, migration, deployment, or preview work

## Proposed Future Compatibility-Test Boundary

A separately approved Action 383 may add only:

- `tests/e2e/action-383-intelligence-context-to-learning-dataset-compatibility.spec.ts`
- optionally one static test-only fixture reference manifest under `tests/fixtures/`
- focused documentation
- one deterministic local verifier

Future tests must import existing Action 380 and Action 381 exports directly. No production `lib/` module is approved. No context adapter, row mapper, row builder, composition service, normalization module, fixture generator, or shared transformation utility is approved.

## Allowed Future Surfaces

- one focused Playwright specification
- an optional literal reference manifest containing only existing deterministic IDs and expected relationships
- one focused document
- one read-only verifier

## Forbidden Future Surfaces

- `lib/` compatibility or composition modules
- `app/` routes or pages
- provider, news, macro/calendar, Supabase, persistence, replay, scanner, ranking, confidence, or recommendation modules
- proxy, middleware, Netlify configuration, migrations, or schemas
- fixture implementation changes made merely to simplify compatibility tests

## Authoritative Shared Type Relationship

Action 381 imports `LearningDatasetContext`, `LearningDatasetContextValue`, and `LearningDatasetProvenance` from Action 380. Therefore compatibility checks do not need a new shared schema or an alternative context contract. Future tests should verify this import relationship and should reject any proposal that duplicates those types.

## Identity And Fixture Relationship

- Intelligence Context `fixture_id` remains independent from Learning Dataset `dataset_row_id`.
- Context snapshot IDs and Learning Dataset context IDs remain deterministic.
- A future reference manifest may document which existing fixture IDs are expected to be compared; it must not construct joined rows.
- duplicate context identities are detected and never repaired
- fixture counts, IDs, order, timestamps, and provenance remain unchanged before and after tests

## Recommendation Linkage Compatibility

Future tests may assert that an existing context fixture's recommendation ID and recommendation snapshot ID equal an existing Learning Dataset fixture's expected linkage when a relationship is explicitly documented. Mismatched recommendation linkage must be rejected. Tests may not synthesize a new recommendation identity, rewrite either fixture, or infer a linkage by ticker alone.

## Context Field Compatibility

The existing context contract represents market regime, index direction, sector/industry support, relative strength, news/catalyst data, calendar events, and available-at-snapshot-time status. Future tests may assert representability for bullish, bearish, mixed, trend, chop, aligned/diverging indexes, sector/industry/peer labels, relative strength, news, earnings, guidance, FDA, SEC, CPI, FOMC, jobs, and options-expiration scenarios.

## Provenance Compatibility

The shared provenance type represents complete, partial, and unavailable source states, stable provider/source timestamps, source-confidence values, audit status, missing flags, and completeness bounds. Action 381's fixed low-quality, stale, and conflicting labels may be asserted alongside this shared shape without rewriting provenance.

## Capture-Time And Effective-Time Compatibility

- context capture time is at or before the recommendation/snapshot boundary
- effective time is at or before recommendation time for included context
- outcome timestamps remain outside snapshot-time context
- invalid capture or effective ordering is detected and not repaired

## Freshness Compatibility

Fresh, stale, unknown, and unavailable freshness states are fixed Action 381 fixture metadata. Future tests may assert consistency with fixed ages and provenance timestamps. They must not calculate freshness or introduce a new freshness threshold.

## Missing-Data Compatibility

Missing optional domains remain explicit and can produce limited eligibility. Tests may assert existing `missing_context_reasons`; they must not fill gaps or choose defaults.

## Null Compatibility

`explicit_null` means the field was represented and intentionally null. It is not equivalent to absent, unknown, or unavailable.

## Unknown Compatibility

`unknown` means the categorical value is unknown and retains the literal `unknown` marker. Tests must not normalize it to null or unavailable.

## Unavailable Compatibility

`unavailable` means the source or value could not be obtained and carries null value semantics plus explicit provenance or missing reasons.

## Stale Compatibility

Stale context remains representable with a fixed stale state and fixed source age. It may limit eligibility but must not be silently refreshed or treated as unknown.

## Conflicting Compatibility

Conflicting context remains distinct from weak or unknown context. Conflict metadata and at least two fixed source identifiers are required; tests must not choose a winner.

## Partial Compatibility

Partial context and provenance remain explicitly partial. Tests must reject partial content marked complete and must not calculate a replacement completeness value.

## Future-Exclusion Compatibility

Future company news, macro facts, market regime, or relative-strength facts may appear only in Action 381's exclusion metadata with `included_in_snapshot_context: false`. Future tests may assert the exclusion; they may not move excluded facts into Action 380 snapshot-time context.

## Anti-Leakage Compatibility

- future news remains excluded
- future macro facts remain excluded
- outcome fields are absent from context
- retrospective market or relative-strength facts cannot become recommendation-time context
- compatibility checks cannot use outcome values to rewrite context or expected labels

## Stable Ordering And Serialization Requirements

Future tests must capture Action 380 and Action 381 fixture serialization before assertions and compare it afterward. Repeated reads must preserve fixture counts, lexical ordering, deterministic IDs, fixed timestamps, source identifiers, provenance, and byte-equivalent serialization.

## Fixture Immutability Requirements

Tests should prefer defensive clone accessors. They must verify before and after serialization for both fixture packages, including fixture counts, fixture IDs, fixture timestamps, and fixture provenance. They must not mutate imported arrays, nested objects, IDs, timestamps, linkage, labels, or provenance. A test failure must report incompatibility rather than repair fixtures.

## No-Transformation Requirement

Tests may compare existing values but may not transform Context Snapshot data into Learning Dataset context data.

## No-Normalization Requirement

Tests may assert existing null, unknown, unavailable, stale, conflicting, and partial semantics but may not normalize them into another representation.

## No-Repair Requirement

Malformed or incompatible fixtures must remain rejected. Tests may not repair identity, time, provenance, freshness, conflict, or completeness defects.

## No-Generation Requirement

Tests may not generate IDs, timestamps, context objects, Learning Dataset rows, expected labels, completeness values, or provenance.

## No-Mapper Requirement

Compatibility does not mean transforming a Context Snapshot, joining recommendation/context/outcome inputs, generating a Learning Dataset Row, deciding defaults, choosing precedence, calculating completeness, resolving conflicts, or persisting output. The Snapshot-to-Learning Dataset mapper remains blocked.

## Adapter-First Constraints

- import Action 380 and Action 381 exports directly
- preserve shared type and identity contracts
- compare existing values rather than adapt them
- document gaps instead of building an adapter
- preserve History, Statistics, replay, and Pattern Insight boundaries

## No-Parallel-System Constraints

- no alternative context schema
- no second provenance model
- no parallel recommendation or outcome identity
- no detached compatibility data model
- no fixture-generated persistence architecture
- no reusable transformation layer disguised as test utility

## Minimum Compatibility Scenarios

### Identity And Linkage

- matching recommendation and snapshot linkage can be asserted
- fixture IDs stay independent from row IDs
- deterministic context IDs are preserved
- mismatched recommendation linkage is rejected
- duplicate context identity is detected

### Temporal

- capture at or before recommendation boundary
- effective time compatible with recommendation time
- outcome timestamps excluded from context
- future company and macro events excluded
- invalid ordering detected

### Context Values

- bullish, bearish, mixed, trend, and chop
- aligned and diverging SPY/QQQ/IWM
- sector, industry, peer, and relative-strength labels
- positive, negative, neutral, absent, and unavailable news
- earnings, guidance, FDA, SEC, CPI, FOMC, jobs, and options expiration
- missing optional, explicit null, unknown, unavailable, stale, conflicting, and partial states

### Provenance And Determinism

- complete, partial, low-quality, unavailable, and conflicting provenance
- stable source identifiers and bounded completeness
- stable order and serialization across repeated reads
- no fixture mutation, ID generation, or timestamp generation

## Incompatibility Scenarios

Future tests must detect without normalizing or repairing:

- missing required context identity
- invalid recommendation linkage
- future capture timestamp
- future effective timestamp improperly included
- outcome leakage
- unsupported category
- malformed provenance
- invalid freshness state
- stale/fresh contradiction
- conflict state without conflict metadata
- partial context marked complete
- non-finite numeric metric
- invalid completeness bounds
- duplicate identities
- random ID attempt
- wall-clock attempt

## Deterministic Gate Conditions

| Gate condition | Status |
| --- | --- |
| Action 380 and 381 share authoritative context types | passed |
| compatibility can be tested without production code | passed |
| no mapper is required | passed |
| no transformation or composition helper is required | passed |
| no new schema is required | passed |
| no fixture mutation is required | passed |
| temporal compatibility is testable | passed |
| anti-leakage compatibility is testable | passed |
| provenance compatibility is testable | passed |
| missing-data semantics are testable | passed |
| malformed cases are available and isolated | passed |
| runtime, persistence, and external services are unnecessary | passed |
| future test surface is narrow and auditable | passed |

## Passed Conditions

- passed_conditions_count: 13
- all_required_gate_conditions_passed: true

## Failed Conditions

- failed_conditions_count: 0
- failed_conditions: none

## Acceptance Criteria

- future work remains tests-only and deterministic
- existing fixtures and shared types are imported directly
- identity, temporal, context-value, provenance, missing-data, anti-leakage, malformed-case, order, serialization, and immutability contracts are asserted
- no fixture is transformed, normalized, repaired, generated, or mutated
- no production, runtime, persistence, schema, external-service, mapper, or adapter work is introduced

## Rejection Criteria

Return `blocked` if testing requires a production module, mapper logic, transformation, normalization, fixture mutation, schema change, runtime access, persistence, external service, or alternative context contract. Return `approved_with_conditions` only if tests remain safe but one non-critical fixture-reference relationship must be documented manually.

## Approval Decision

- approval_decision: approved
- decision_reason: all_required_static_tests_only_conditions_passed
- pure_composition_assertion_helper_approved: false
- snapshot_to_learning_dataset_mapper_approved: false
- runtime_integration_approved: false

Only A, static fixture compatibility tests, is approved for a separately requested Action 383. B, C, and D remain blocked.

## Blocked Work After Approval

- compatibility helper or composition helper
- context adapter, normalizer, row builder, mapper, or generator
- Learning Dataset row generation
- fixture changes or mutation
- live collection and external services
- Supabase, persistence, schema, migrations, replay, Pattern Discovery, runtime integration
- scanner, ranking, confidence, recommendation, Add Trade, broker, execution, or risk changes
- deployment, runtime preview, and main push

## Next Permitted Action

- next_permitted_action: Action 383: Intelligence Context-to-Learning Dataset Static Compatibility Tests
- next_action_scope: tests_only_no_helper_no_mapper_no_runtime

The runtime-preview chain remains paused at `runtime_preview_waiting_for_operator_inputs`; the immutable preview candidate and preserved attempt remain unchanged.
