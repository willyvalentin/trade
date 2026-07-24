# Action 391 - Pure Snapshot-to-Learning Dataset Mapper Contract Remediation

## Purpose and scope

Action 391 implements exactly the seven pure validation and output-integrity remediations approved by Action 390. It changes no public mapper API, row schema, fixture, consumer, runtime, persistence, scanner, ranking, confidence, replay, or Pattern Discovery behavior.

Action 389 found the seven gaps. Action 390 returned `approval_decision: approved`, `passed_conditions_count: 17`, `failed_conditions_count: 0`, and `unresolved_conditions_count: 0`.

## Exact files changed

- `lib/snapshot-to-learning-dataset-mapper.ts`
- `docs/action-391-pure-mapper-contract-remediation.md`
- `scripts/action-391-pure-mapper-contract-remediation-verify.mjs`
- `tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts`
- narrowly required compatibility assertions in Actions 388-390
- minimal Actions 318-320 guard classifications

No Action 380, Action 381, or Pattern Insight fixture module changed.

## Seven remediations

### Category validation

The mapper now validates all closed Action 380/381 context categories and missing-state wrappers. Market directions, regimes, volatility, relative-strength labels, catalyst/event types, availability values, and event risk use the exact Action 390 vocabulary. Sector and industry remain non-empty identifier fields rather than closed enums.

Unsupported categories do not become `unknown`. They return `blocked_invalid_provenance`, `invalid_provenance`, and the exact RFC 6901 value path. Explicit `unknown`, `unavailable`, and `explicit_null` retain their authoritative wrapper semantics.

### Freshness validation

Only `fresh`, `stale`, `unknown`, and `unavailable` are accepted. The mapper validates the declared Action 381 consistency contract:

- fresh has a finite non-negative age below 60
- stale has a finite age at or above 60
- unknown and unavailable have null age
- invalid state or age blocks as `blocked_invalid_provenance`

No current clock, inferred age, fallback, normalization, or hidden threshold was introduced.

### Contradiction validation

The provenance stage blocks stale with `fresh: true`, fresh with `stale: true`, stale with complete provenance, fresh with unavailable provenance, and fresh with stale source markers. Existing conflict-metadata and partial/complete consistency checks remain intact. No contradictory value is selected or repaired.

### Finite numeric validation

Numeric context values, freshness age, provenance source confidence, and provenance completeness must be finite numbers. Numeric strings, `NaN`, positive Infinity, negative Infinity, and invalid bounded values block at their exact paths. Values are not coerced, clamped, nulled, dropped, or replaced.

### Trading-window validation

Only `morning`, `midday`, `power_hour`, and `unknown` pass. Unsupported values return `blocked_invalid_input` with `invalid_input` at `/recommendationSnapshot/window`. No timestamp-to-window inference or session calculation exists.

### Horizon linkage

When an outcome exists, its horizon is compared with `recommendationSnapshot.payload_json.outcome_horizon`. Supported equivalent values pass. A conflict or unsupported populated payload horizon returns `blocked_invalid_linkage`, no row, and deterministic `invalid_linkage` issues for the populated horizon paths.

Null outcome behavior is unchanged: a supported payload horizon remains required for the pending row, and no horizon is inferred from timestamps or duration.

### Anti-leakage monotonicity

A present context must explicitly carry `anti_leakage_status: passed`. Failed, unknown, unsupported, or missing markers return `blocked_future_leakage` with `future_leakage` at `/contextSnapshot/anti_leakage_status`; the result has no row and `consumable: false`.

Only validated passed evidence reaches construction. Construction cannot upgrade leakage state. Explicit null context retains the existing no-context mapping because there are no included context facts; a present context cannot omit or weaken its marker. Future exclusions remain accepted only when `included_in_snapshot_context: false` and their temporal contract passes.

## Validation-stage placement

The Action 387 order remains:

1. input shape
2. required identities
3. identity linkage, including horizon agreement
4. alias conflicts
5. timestamp parsing and temporal ordering
6. future leakage, including anti-leakage marker integrity
7. provenance, including categories, freshness, contradictions, context numerics, and snapshot window domain validation
8. outcome validity
9. optional-data completeness
10. deterministic row construction

Multi-fault regressions confirm linkage before aliases, aliases before context validation, temporal before provenance, leakage before provenance/outcome, and provenance before outcome.

## Result and issue-contract preservation

No result status or issue code was added or removed. Both success statuses and all eight blocked statuses remain. Issues retain exactly `{ code, path, severity, messageKey }`, RFC 6901 paths, fixed message keys, error/warning severity, deterministic sorting and deduplication, and no sensitive or dynamic values.

The remediations reuse `invalid_linkage`, `future_leakage`, `invalid_provenance`, and `invalid_input` with their existing blocked statuses.

## Regression coverage

Focused tests cover all seven findings, all authoritative Action 381 contexts, all four freshness states, consistent fresh/stale contexts, finite and non-finite metrics, all four windows, equivalent/conflicting horizons, pending horizon behavior, passed/failed/unknown/missing anti-leakage markers, valid excluded future facts, no-row leakage blocking, multi-fault precedence, issue integrity, deep immutability, repeated-call determinism, and stable serialization.

The complete Action 388 regression suite remains required and green. Historical Actions 387-390 remain recognized as the approval, original implementation, independent gap audit, and remediation approval gate.

## Input immutability and output determinism

Deep-frozen valid and invalid inputs remain byte-identical. Repeated and interleaved calls produce identical results, rows, IDs, issues, issue order, and serialization. No mutable global state, clock, randomness, or cache was added. Existing deterministic row identity composition is unchanged.

## Safety guarantees

- Fixture changes: none
- Mapper consumers: none
- Runtime integration: none
- Provider/news access: none
- Supabase access: none
- Persistence: none
- Replay: none
- Schema/migration changes: none
- Scanner/ranking/confidence changes: none
- Pattern Discovery: none
- Runtime-preview changes: none

Mapper SHA-256 after approved remediation: `e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b`.

Learning fixture SHA-256 remains `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`. Context fixture SHA-256 remains `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Next independent verification Action

The next permitted Action is a separate Action 392 independent remediation verification and shadow-use readiness audit. It must independently rerun malformed coverage and may not add a mapper consumer, runtime integration, or persistence.
