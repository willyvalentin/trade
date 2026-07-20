# Action 383: Intelligence Context-to-Learning Dataset Static Compatibility Tests

## Status

- implementation_status: static_context_learning_dataset_compatibility_tests_implemented
- implementation_scope: tests_only_direct_fixture_comparison
- action_382_approval_decision: approved
- production_compatibility_module_added: false
- mapper_implemented: false
- runtime_preview_status: runtime_preview_waiting_for_operator_inputs
- deployment_allowed: false
- main_push_allowed: false

## Purpose And Scope

Action 383 proves that Action 381 Intelligence Context fixtures are representable through the context and provenance contracts already used by Action 380 Learning Dataset fixtures. It performs repository-local tests only. It does not construct authoritative rows, compose fixture packages, transform context, normalize values, repair malformed cases, calculate completeness, resolve conflicts, or implement mapping behavior.

## Authoritative Dependencies

- `lib/learning-dataset-static-fixtures.ts` from Action 380
- `lib/intelligence-context-static-fixtures.ts` from Action 381
- `LearningDatasetContext`
- `LearningDatasetContextValue`
- `LearningDatasetProvenance`
- Action 352 mapper plan boundary
- Action 382 compatibility-test approval gate

## Tests-Only Boundary

The focused specification imports Actions 380 and 381 directly. No reference manifest was needed. No production `lib/` module, adapter, mapper, builder, normalizer, composition utility, row generator, or shared transformation helper was added.

## Shared Type Relationship

Action 381 context fixtures already carry `LearningDatasetContext` and `LearningDatasetProvenance` values imported from Action 380. The tests use compile-time assignments to those existing types and compare the existing values without creating combined context objects.

## Identity And Linkage Assertions

- Learning Dataset row IDs and Intelligence Context fixture IDs are deterministic, unique, and intentionally independent.
- Each Action 380 row preserves its recommendation, snapshot, context, and outcome linkage.
- Each Action 381 fixture preserves its recommendation and snapshot linkage inside its shared context envelope.
- String and nullable recommendation identifiers use the same representable contract.
- Invalid recommendation linkage and duplicate context identity remain isolated malformed cases.
- No test repairs or infers identity linkage, and ticker equality is never treated as linkage.

## Temporal Assertions

- context capture and effective times are at or before recommendation time
- included news timestamps are at or before recommendation time
- Action 380 outcome timestamps remain outside snapshot-time context
- future company and macro facts remain explicit exclusions
- excluded facts use `included_in_snapshot_context: false`
- malformed late capture, late effective time, future news, future macro, and outcome leakage cases remain invalid
- no timestamp is normalized or generated

## Context-Value Assertions

The suite checks existing family-tagged Action 381 values for bullish, bearish, mixed, trend, chop, elevated and low volatility, SPY/QQQ/IWM alignment and divergence, strong/weak sector, industry, and peer context, positive/negative/conflicting relative strength, positive/negative/neutral/absent/unavailable news, earnings, guidance, FDA, SEC, CPI, FOMC, jobs report, options expiration, and absent optional domains.

## Provenance And Missing-Data Assertions

Complete, partial, low-quality, unavailable, stale, and conflicting provenance examples remain representable through `LearningDatasetProvenance`. Tests verify stable source identifiers, finite and bounded completeness/source-confidence values, fixed freshness consistency, conflict metadata, and partial/complete consistency.

Explicit null, absent, unknown, unavailable, stale, conflicting, partial, and complete states remain distinguishable. The suite compares existing values only and does not infer one state from another.

## Future Exclusion And Anti-Leakage Assertions

Future news and macro facts remain outside snapshot context and appear only as explicit exclusions. Context serialization contains no outcome status, target-hit, stop-hit, or R-multiple fields. Retrospective facts are not promoted into recommendation-time context. Malformed leakage cases remain raw invalid payloads and are never repaired.

## Malformed-Case Assertions

The suite verifies all Action 381 incompatibility families: missing and duplicate context identity, invalid linkage, late capture/effective time, future news/macro leakage, outcome leakage, malformed provenance, unsupported category, invalid freshness, stale/fresh contradiction, conflict without metadata, partial-as-complete, non-finite metric, invalid bounds, random ID, and wall-clock attempts.

## Fixture Immutability

Before the serial compatibility suite, deterministic baselines capture Action 380 and Action 381 valid and malformed serialization, fixture counts, ordering, IDs, timestamps, and provenance. After all tests, the same accessors and serializers must return byte-identical or canonically identical values. Tests use defensive clones and do not mutate exported fixtures.

## Stable Ordering And Serialization

Repeated reads preserve lexical fixture ordering, counts, IDs, timestamps, provenance, and serialization. Source checks reject `Date.now`, current-time construction, `Math.random`, UUID generation, and environment access in the focused package.

## Guarantees

- no transformation: no context value or fixture object is transformed into another contract
- no normalization: null, unknown, unavailable, stale, conflicting, and partial values remain unchanged
- no generation: no IDs, timestamps, completeness values, context objects, or Learning Dataset rows are generated
- no mapper: no recommendation/context/outcome join or precedence behavior exists
- no production module: only documentation, a verifier, and a focused test were added
- no runtime: no route, provider/news/macro call, Supabase access, persistence, replay, scanner, ranking, confidence, recommendation, proxy, middleware, Netlify, schema, migration, or deployment behavior changed

## Blocked Work

Composition helpers, adapters, normalizers, builders, mappers, row generation, live context collection, external services, persistence, runtime integration, Pattern Discovery, statistical inference, confidence calibration, scanner/ranking/recommendation changes, fixture implementation changes, deployment, and main push remain blocked.

The runtime-preview chain remains paused at `runtime_preview_waiting_for_operator_inputs`; its route, immutable candidate, and preserved attempt are unchanged.

## Expected Next Approval Gate

Any move beyond direct static assertions requires a separate gate. The recommended next step is an approval gate for a static fixture-to-Pattern-Insight compatibility test plan, still without Pattern Discovery, transformation, or runtime behavior.

