# Action 389 - Pure Mapper Independent Verification and Fixture Coverage Audit

## Purpose and scope

Action 389 independently audits the Action 388 `mapSnapshotToLearningDataset(input)` implementation against the frozen Action 387 contract. This package is local-only, static, test-oriented, and review-only. It does not modify the mapper, fixtures, runtime-preview chain, recommendations, or any production behavior.

Authoritative dependencies are Actions 309, 334, 335, 336, 340, 346, 352, 380, 381, 383, 385, 386, 387, and 388. Action 388 provides the single mapper module and reports no consumers, runtime integration, or persistence.

Explicit non-goals: no batch mapper, shadow consumer, replay runner, Pattern Discovery, confidence calibration, persistence, Supabase access, provider/news access, runtime route, scanner/ranking integration, schema, migration, fixture change, deployment artifact, or runtime-preview advancement.

## Source integrity and public API

- Mapper: `lib/snapshot-to-learning-dataset-mapper.ts`
- Baseline SHA-256: `05276aebf1e7c6328242949c22e489ba384c9c501574c5d170d789ba47fa00e2`
- Exact downstream compatibility SHA-256 values: Action 391 `e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b`; Action 394 `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- Entry point: `mapSnapshotToLearningDataset(input)`
- Authoritative exported mapper functions: 1
- Mapper consumers: none
- Action 389 mapper source changes: none
- Action 389 fixture source changes: none

The source review found no environment read, filesystem access, network call, provider/news/Supabase import, logging, persistence, runtime import, mutable global state, current-time access, randomness, UUID generation, or hidden cache. Downstream compatibility hashes do not change Action 389's historical `blocked` decision; they only keep the historical verifier fail-closed in later clean checkouts.

## Frozen contracts

Success vocabulary:

- `mapped`
- `mapped_with_missing_optional_data`

Blocked vocabulary:

- `blocked_missing_required_identity`
- `blocked_invalid_linkage`
- `blocked_conflicting_aliases`
- `blocked_temporal_violation`
- `blocked_future_leakage`
- `blocked_invalid_provenance`
- `blocked_invalid_outcome`
- `blocked_invalid_input`

Every status has a deterministic direct test. Success returns a row and `consumable: true`; blocked results return no row and `consumable: false`.

Every issue has exactly `{ code, path, severity, messageKey }`. Paths are RFC 6901 pointers, severity is `error` or `warning`, message keys are `mapper.issue.<code>`, issues are sorted and deduplicated, and no source values, full inputs, or dynamic timestamps are emitted.

## Validation-order review

Multi-fault inputs independently confirm the implemented order:

1. input shape
2. required identity
3. linkage
4. alias conflicts
5. timestamps and temporal ordering
6. future leakage
7. provenance
8. outcome
9. optional completeness
10. row construction

Repeated multi-fault calls return identical status, primary issue, issue ordering, and serialization. Validation-order result: passed.

## Alias-precedence review

| Domain | Precedence and accepted equivalence | Result |
| --- | --- | --- |
| Timestamp | `recommended_at`, `app_timestamp`, `created_at`; equivalent instants accepted | passed |
| Side | snapshot side before payload aliases; `long/buy`, `short/sell` | passed |
| Setup | payload family/type before snapshot type/label; Action 326 literals only | passed |
| Confidence | confidence, score, approved payload aliases; `[0,1]` and percentage units | passed |

Material conflicts block. Unsupported side and confidence values block. Confidence is neither clamped nor recalibrated. No time, price, PnL, candle, context, or outcome inference was found.

## Identity and linkage review

Recommendation, snapshot, context, and outcome identity linkage checks are deterministic. Snapshot fingerprint, outcome snapshot/recommendation/ticker references, and context recommendation references are checked without repair.

One contract gap remains: a populated outcome horizon can disagree with `payload_json.outcome_horizon` and still map. This is recorded as failed condition `mapper:horizon_conflict`.

## Deterministic row identity

The row ID transparently composes schema marker, snapshot fingerprint, outcome horizon or pending marker, and outcome ID or pending marker. Components use NFC normalization, percent encoding, and fixed ordering.

- Same identity inputs: same ID
- Changed fingerprint/horizon/outcome ID: changed ID
- Pending outcome: pending marker
- Changed confidence/setup/context/mutable outcome metric: unchanged ID
- NFC-equivalent values: same ID
- Reserved characters: stable percent encoding
- Clock/random component: absent

Identity result: passed, apart from the separate horizon-linkage acceptance gap above.

## Valid fixture coverage matrix

Action 380 rows are authoritative output fixtures, so explicit test-local recommendation wrappers represent their semantics. No production adapter or new authoritative fixture was created.

| Action 380 source fixture ID | Family | Expected / actual | Issues or missing state | Deterministic |
| --- | --- | --- | --- | --- |
| `learning_row:v1:001:complete` | complete valid | `mapped` / `mapped` | none | yes |
| `learning_row:v1:002:rich_context` | rich context | `mapped` / `mapped` | none | yes |
| `learning_row:v1:003:missing_optional` | missing context | `mapped_with_missing_optional_data` / same | `missing_optional_context` | yes |
| `learning_row:v1:004:partial_market` | partial context | `mapped_with_missing_optional_data` / same | `partial_provenance` | yes |
| `learning_row:v1:005:absent_news` | absent news | `mapped` / `mapped` | explicit absent | yes |
| `learning_row:v1:006:absent_event` | absent events | `mapped` / `mapped` | explicit absent | yes |
| `learning_row:v1:007:incomplete_outcome` | incomplete outcome | `mapped_with_missing_optional_data` / same | `missing_optional_outcome` | yes |
| `learning_row:v1:008:no_outcome_yet` | pending outcome | `mapped_with_missing_optional_data` / same | pending marker | yes |
| `learning_row:v1:009:unknown_categorical` | explicit unknown setup/context | `mapped_with_missing_optional_data` / same | `unknown_setup`, `partial_provenance` | yes |
| `learning_row:v1:010:unavailable_source` | unavailable | `mapped_with_missing_optional_data` / same | `unavailable_source` | yes |
| `learning_row:v1:011:partial_provenance` | partial provenance | `mapped_with_missing_optional_data` / same | `partial_provenance` | yes |
| `learning_row:v1:012:low_completeness` | low completeness | `mapped_with_missing_optional_data` / same | `partial_provenance` | yes |
| `learning_row:v1:013:explicit_null` | explicit null | `mapped_with_missing_optional_data` / same | explicit null preserved | yes |

All 15 Action 381 valid context fixtures are directly adapted and mapped:

| Fixture IDs | Expected / actual | Missing-data state |
| --- | --- | --- |
| `intelligence_context:v1:001:supportive_bull`, `002:bearish_risk`, `005:earnings`, `006:guidance`, `007:fda`, `008:sec`, `010:jobs`, `011:options_expiration`, `012:future_event_excluded`, `intelligence_context:v1:015:isolated_stock_strength` | `mapped` / `mapped` | complete or explicit excluded future facts |
| `intelligence_context:v1:003:mixed_conflict`, `004:partial_market`, `013:stale_source`, `intelligence_context:v1:014:missing_semantics` | `mapped_with_missing_optional_data` / same | `partial_provenance`; conflicting/stale/null/unknown values preserved in context |
| `intelligence_context:v1:009:news_unavailable` | `mapped_with_missing_optional_data` / same | `unavailable_source` |

Valid fixture coverage: 13/13 Action 380 semantic families and 15/15 Action 381 valid fixtures. Repeated results and serialized rows are identical.

## Malformed fixture coverage matrix

`repair performed` is false for every row. Output-only dataset invariants are inspected against construction because they are not independently supplied mapper inputs.

| Source malformed IDs | Contract expectation | Actual audit result |
| --- | --- | --- |
| `malformed:001`, `malformed_context:001` | missing identity blocked | blocked as required |
| `malformed:002`, `malformed:003`, `malformed_context:003` | linkage mismatch blocked | blocked as required |
| `malformed:004`, `malformed:005`, `malformed:007`, `malformed_context:004`, `malformed_context:005` | temporal violation blocked | blocked as required |
| `malformed:006`, `malformed_context:006`, `malformed_context:007`, `malformed_context:008` | future/outcome leakage blocked | blocked as required |
| `malformed:009`, `malformed:011`, `malformed_context:009`, `malformed_context:013`, `malformed_context:014`, `malformed_context:016` | provenance/completeness/conflict invalid | blocked as required |
| `malformed:010` | non-finite plan/outcome metric blocked | blocked as required |
| `malformed:013`, `malformed:014`, `malformed_context:017`, `malformed_context:018` | wall-clock/random attempt rejected or proven unused | blocked/proven absent as required |
| `malformed:012`, `malformed_context:002` | duplicate identity | deterministic construction audited; cross-row duplicate detection remains batch-deferred |
| `malformed_context:010` | unsupported context category blocked at `/contextSnapshot/context/market/market_regime` | **mapped; failed** |
| `malformed_context:011` | unsupported freshness state blocked at `/contextSnapshot/freshness/state` | **mapped; failed** |
| `malformed_context:012` | stale timestamp marked fresh blocked at `/contextSnapshot/freshness` | **mapped; failed** |
| `malformed_context:015` | non-finite context metric blocked at `/contextSnapshot/context/relative_strength/stock_vs_spy/value` | **mapped; failed** |
| `malformed:008` | unsupported trading window blocked at `/recommendationSnapshot/window` | **mapped; failed** |
| `mapper:horizon_conflict` | payload/outcome horizon mismatch blocked at `/outcome/horizon` | **mapped; failed** |
| `mapper:failed_anti_leakage_status` | failed context anti-leakage marker blocked | **mapped and output marked passed; failed** |

Malformed coverage inventories all 14 Action 380 malformed cases, all 18 Action 381 malformed cases, and mapper-specific malformed cases. Seven applicable contract violations currently pass. No repair was attempted in Action 389.

## Blocked-status coverage

| Status | Direct coverage |
| --- | --- |
| `blocked_missing_required_identity` | missing snapshot/recommendation identity |
| `blocked_invalid_linkage` | context and outcome mismatch |
| `blocked_conflicting_aliases` | timestamp, side, setup, confidence conflicts |
| `blocked_temporal_violation` | invalid timestamp and temporal ordering |
| `blocked_future_leakage` | future news/macro and outcome-in-context |
| `blocked_invalid_provenance` | malformed provenance/completeness/conflict metadata |
| `blocked_invalid_outcome` | unsupported status and non-finite metrics |
| `blocked_invalid_input` | malformed wrapper, side, confidence, required plan metadata |

## Issue-code coverage inventory

Direct coverage exists for all frozen codes:

`missing_required_identity`, `invalid_linkage`, `conflicting_aliases`, `invalid_timestamp`, `temporal_violation`, `future_leakage`, `invalid_provenance`, `invalid_outcome`, `invalid_input`, `missing_optional_context`, `missing_optional_outcome`, `unknown_setup`, `unavailable_source`, and `partial_provenance`.

Issue-shape, RFC 6901, severity, stable message key, ordering, deduplication, redaction, and no-dynamic-value checks passed.

## Immutability and determinism

Deep-frozen wrapper, snapshot, payload, nested arrays/objects, context, provenance, outcome, timestamps, aliases, and fixture-derived values remain byte-identical. Repeated and interleaved calls return identical results, rows, IDs, issues, issue order, and serialization. Fixture access order does not affect a mapping result. No global-state contamination was found.

## Unsupported and deferred gaps

- Peer group remains `unsupported_optional`; no peer-group field or inference is emitted.
- Provider-specific lineage remains deferred.
- Persistence shape and repository remain deferred.
- Cross-row duplicate detection belongs to a future batch boundary, not this stateless mapper.
- Pattern Discovery metrics and execution remain blocked.
- Confidence calibration remains blocked.
- No unsupported field should be invented. The failed anti-leakage marker currently being emitted as `passed` violates this rule and is a blocker.

## No-inference, repair, enrichment, runtime, and persistence review

No market intelligence, setup from candles/context, side from geometry/PnL, confidence recalibration, provider lineage, peer group, external enrichment, runtime state, provider/news access, Supabase read/write, persistence, replay, scanner mutation, ranking mutation, or recommendation mutation was found. Action 389 performed no repair. The seven gaps are findings for a separate remediation Action.

## Readiness decision

Vocabulary: `ready`, `ready_with_conditions`, `blocked`.

`readiness_decision: blocked`

`passed_conditions_count: 18`

`failed_conditions_count: 7`

`unresolved_conditions_count: 0`

Passed conditions include source integrity, one API, full status coverage, full issue-code coverage, valid fixture coverage, issue integrity, validation precedence, alias precedence, identity determinism, deep immutability, output determinism, no hidden state, no consumers, no runtime, no persistence, no inference, no external access, and explicit deferred boundaries.

Failed conditions:

1. unsupported context category accepted
2. invalid freshness state accepted
3. stale/fresh contradiction accepted
4. non-finite context metric accepted
5. unsupported trading window accepted
6. payload/outcome horizon disagreement accepted
7. failed anti-leakage marker accepted and rewritten as passed

Because contract drift, leakage-marker repair, and malformed-input pass-through exist, the mapper is not ready for a static shadow-use approval gate.

## Source-change attribution and safety

Action 389 adds only this document, its verifier, its focused tests, and minimal Actions 318-320 guard classifications. It does not modify the mapper, Action 380/381 fixtures, schema, migration, proxy, middleware, Netlify configuration, deployment artifacts, runtime routes, or runtime-preview files. Existing unrelated post-trade work remains separately classified and untouched.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Next permitted Action

The next permitted Action is a separate pure-mapper contract remediation approval gate covering only the seven findings above. Static shadow-use approval is blocked until remediation and an independent rerun of this audit succeed.
