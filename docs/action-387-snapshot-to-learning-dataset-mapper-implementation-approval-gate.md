# Action 387: Snapshot-to-Learning Dataset Mapper Implementation Approval Gate

## Status And Purpose

- gate_status: complete
- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved
- passed_conditions_count: 17
- failed_conditions_count: 0
- unresolved_conditions_count: 0
- mapper_implemented: false
- runtime_preview_status: runtime_preview_waiting_for_operator_inputs

This final static gate resolves Action 386's two bounded conditions and approves only a future pure local Snapshot-to-Learning Dataset mapper. It does not implement the mapper or approve any downstream runtime work.

## Scope

The gate freezes contracts, precedence, validation, identity, issues, purity, and exact implementation surfaces. It is documentation/tests/verifier only and does not construct rows.

## Authoritative Dependencies

- `Ture Produktspecifikation.md`: product vision.
- `RecommendationSnapshot` in `lib/recommendation-snapshot.ts`: recommendation input.
- `RecommendationOutcome` in `lib/recommendation-outcome-tracker.ts`: evaluated outcome input.
- `Action336IntelligenceContextStaticFixture` in `lib/intelligence-context-static-fixtures.ts`: context envelope input.
- `Action335LearningDatasetRow` in `lib/learning-dataset-static-fixtures.ts`: output.
- Action 326: existing setup taxonomy.
- Actions 335, 336, and 352: dataset, context, and mapper design.

## Upstream Action Inventory

The gate builds on Action 309, Action 334, Action 335, Action 336, Action 340, Action 346, Action 347, Action 352, Action 353, Action 354, Action 357, Action 380, Action 381, Action 383, Action 385, and Action 386.

## Action 386 Result

Action 386 returned `ready_with_conditions`, with 16 passed conditions, zero failed conditions, and two unresolved conditions: discriminated mapper result/error vocabulary and explicit timestamp/side/setup/confidence alias precedence. This gate freezes both. No Action 386 condition remains unresolved.

## Explicit Non-Goals

This gate does not implement or approve runtime routes, scanner integration, recommendation/ranking/confidence mutation, persistence, Supabase, provider/news calls, replay, Pattern Discovery, aggregation, statistics, inference, schema/migration changes, malformed-input repair, missing-field fetching, hidden heuristics, or deployment.

## Approval Vocabulary

- `approved`: every mapper contract and boundary is frozen and a pure implementation is safe.
- `approved_with_conditions`: only a non-critical issue code or path convention remains for Action 388.
- `blocked`: precedence/result contracts remain unresolved, hidden heuristics/runtime/schema access is required, or leakage/missing-state preservation is unresolved.

## Deterministic Gate Conditions

Approval requires exact input/output/result/issue contracts, deterministic validation and identity, explicit aliases and conflict handling, preserved missing states, temporal and leakage rejection, input immutability, no runtime/persistence/external access, no schema change, non-blocking explicit gaps, and a narrow future surface.

## Exact Future Mapper Module Boundary

The future implementation may add only:

- `lib/snapshot-to-learning-dataset-mapper.ts`
- an optional colocated pure validator only if Action 388 proves it strictly necessary
- `docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md`
- `scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs`
- `tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts`
- minimal Actions 318-320 guard entries

No other surface is approved.

## Exact Input Contract

The conceptual type is frozen as:

```ts
type SnapshotToLearningDatasetMapperInput = Readonly<{
  recommendationSnapshot: Readonly<RecommendationSnapshot>;
  contextSnapshot: Readonly<Action336IntelligenceContextStaticFixture> | null;
  outcome: Readonly<RecommendationOutcome> | null;
}>;
```

`recommendationSnapshot` is required. `contextSnapshot` is nullable because explicit missing optional context is representable. `outcome` is nullable because `not_yet_available` is representable as a pending row. The mapper accepts no services, repositories, providers, clocks, RNGs, environment values, filesystem handles, caches, or persistence handles.

The input contracts provide identity and timestamps. Fixture/schema version markers are preserved where supplied; the mapper's output uses the existing Learning Dataset schema version. Unknown input object properties are ignored and never copied unless an existing output field explicitly owns them. Inputs are deeply read-only by contract and must remain byte/canonically identical after mapping.

## Exact Output Contract

Success returns the existing `Action335LearningDatasetRow` without extending or shadowing it. Blocked results return no row. The mapper does not persist or wrap the row in a runtime record.

## Mapper Result Vocabulary

The exact discriminated union is:

```ts
type SnapshotToLearningDatasetMapperResult =
  | Readonly<{
      status: "mapped" | "mapped_with_missing_optional_data";
      row: Action335LearningDatasetRow;
      issues: readonly SnapshotToLearningDatasetMapperIssue[];
      consumable: true;
    }>
  | Readonly<{
      status:
        | "blocked_missing_required_identity"
        | "blocked_invalid_linkage"
        | "blocked_conflicting_aliases"
        | "blocked_temporal_violation"
        | "blocked_future_leakage"
        | "blocked_invalid_provenance"
        | "blocked_invalid_outcome"
        | "blocked_invalid_input";
      row: null;
      issues: readonly SnapshotToLearningDatasetMapperIssue[];
      consumable: false;
    }>;
```

`mapped` has no optional-data warnings. `mapped_with_missing_optional_data` has at least one warning. Expected validation failures never throw. Unexpected programmer errors may throw.

## Mapper Error Vocabulary

Blocked status is selected by validation phase:

- required identity failures: `blocked_missing_required_identity`
- recommendation/context/outcome mismatch: `blocked_invalid_linkage`
- materially conflicting populated aliases: `blocked_conflicting_aliases`
- invalid/unparseable time or temporal order: `blocked_temporal_violation`
- included future or outcome facts in snapshot context: `blocked_future_leakage`
- malformed or out-of-bounds provenance: `blocked_invalid_provenance`
- malformed supplied outcome: `blocked_invalid_outcome`
- all other malformed required input: `blocked_invalid_input`

## Validation Issue Contract

```ts
type SnapshotToLearningDatasetMapperIssue = Readonly<{
  code:
    | "missing_required_identity"
    | "invalid_linkage"
    | "conflicting_aliases"
    | "invalid_timestamp"
    | "temporal_violation"
    | "future_leakage"
    | "invalid_provenance"
    | "invalid_outcome"
    | "invalid_input"
    | "missing_optional_context"
    | "missing_optional_outcome"
    | "unknown_setup"
    | "unavailable_source"
    | "partial_provenance";
  path: string;
  severity: "error" | "warning";
  messageKey: `mapper.issue.${SnapshotToLearningDatasetMapperIssue["code"]}`;
}>;
```

Paths use RFC 6901-style JSON Pointer syntax beginning with `/`, with escaped `~` and `/` and numeric array indices. Issues are ordered by validation phase, then path lexically, then code lexically. Duplicate `(code,path)` issues retain the first and are omitted thereafter. Issues contain no source values, raw input dumps, secrets, dynamic messages, ticker text, provider payloads, or stack traces.

## Validation Order

Validation is frozen in this order:

1. input shape
2. required identities
3. identity linkage
4. alias conflicts
5. timestamp parsing and temporal order
6. future-leakage constraints
7. provenance
8. outcome validity
9. optional-data completeness
10. deterministic row construction

All issues in a completed phase are collected and deterministically sorted. The first phase containing errors determines the blocked status; later phases do not run. Warning-only phases continue. The same input always produces the same primary status and issue ordering.

## Identity Requirements

Required recommendation fields are `id`, `snapshot_fingerprint`, `ticker`, and canonical side. Recommendation ID may be null for research-only snapshots. A supplied context must have `fixture_id`, `context.context_snapshot_id`, and matching recommendation snapshot/recommendation linkage. A supplied outcome must have `id`, horizon, and matching snapshot/recommendation linkage where non-null.

## Deterministic Row-ID Policy

The canonical identity components are:

1. Learning Dataset schema marker `learning_dataset_static_fixture_v1`
2. `recommendationSnapshot.snapshot_fingerprint`
3. outcome horizon, or `pending`
4. `outcome.id`, or `pending`

Each component is UTF-8 NFC-normalized and percent-encoded. Canonical serialization is the ordered components joined by `|`. `learning_row_key` is that canonical string. `dataset_row_id` is `learning_row:v1:` followed by the same canonical string. Same inputs yield the same IDs; any changed component yields changed IDs. There is no random UUID, clock value, mutable metric, confidence, setup, or context value in identity.

If two source packages present the same canonical key with conflicting linkage, mapping is blocked as invalid linkage. Repeated identical input is idempotent, not an error. Cross-invocation duplicate storage detection is outside the mapper and remains unapproved.

## Recommendation Linkage

The output preserves recommendation ID, snapshot fingerprint/ID, candidate/batch/scan IDs available in the snapshot payload, ticker, day, and window without generating replacements. Missing required snapshot identity blocks. Nullable recommendation ID remains null only where the source contract allows it.

## Context Linkage

A null context maps to explicit missing optional context with limited eligibility. A supplied context must link to the recommendation snapshot and recommendation ID. Conflicts block. Excluded future facts remain exclusion metadata and are never copied into live context values.

## Outcome Linkage

A null outcome maps to the existing pending/no-outcome state. A supplied outcome must link to the same snapshot fingerprint/ID and recommendation ID where populated. Its horizon and ID become identity components. Conflicts block. Outcome metrics are copied only from the supplied authoritative outcome.

## Timestamp Alias Precedence

All accepted values are parsed as ISO-compatible timestamps and emitted as UTC ISO 8601 with millisecond precision. No local-time interpretation, current-time fallback, or inferred timestamp is allowed.

| concept | preferred field | fallback order | conflict/missing behavior |
| --- | --- | --- | --- |
| recommendation timestamp | `recommendationSnapshot.recommended_at` | `app_timestamp`, then `created_at` | differing populated aliases block; all missing/invalid block |
| snapshot capture timestamp | `recommendationSnapshot.app_timestamp` | `created_at`, then selected recommendation timestamp | populated capture aliases may differ from recommendation time; only aliases for capture are compared |
| context capture timestamp | `contextSnapshot.context.captured_at` | none | missing/invalid supplied context blocks |
| context effective timestamp | `contextSnapshot.effective_at` | none | missing/invalid supplied context blocks |
| outcome timestamp | `outcome.evaluated_at` | `updated_at`, then `created_at` | fallback only when preferred is empty; invalid populated preferred blocks |

`entry_triggered_at`, `target_hit_at`, and `stop_hit_at` remain outcome evidence and do not replace `evaluated_at`. No opened/closed timestamp is invented. Timestamps are equivalent only when parsed epoch milliseconds match exactly. A materially different populated alias for the same concept returns `blocked_conflicting_aliases`.

## Side Alias Precedence

Read in this order:

1. `recommendationSnapshot.side`
2. `recommendationSnapshot.payload_json.side`
3. `payload_json.direction`
4. `payload_json.trade_direction`
5. `payload_json.recommendation_side`
6. `payload_json.trade_plan.side`
7. `payload_json.trade_plan.direction`
8. `payload_json.recommendation.side`
9. `payload_json.recommendation.direction`

Accepted equivalents are `long`/`buy` to `long` and `short`/`sell` to `short`, case-insensitive after trimming. All populated known aliases must normalize identically. Conflict returns `blocked_conflicting_aliases`; missing/unknown required side returns `blocked_invalid_input`. Side is never inferred from entry, stop, target, PnL, price movement, or outcome.

## Setup Alias Precedence

Read in this order:

1. `recommendationSnapshot.payload_json.setup_family`
2. `payload_json.setup_type`
3. `recommendationSnapshot.type`
4. `recommendationSnapshot.label`

The supported canonical taxonomy is the eight Action 326 literals: `momentum_continuation`, `vwap_reclaim`, `opening_drive`, `pullback_to_support`, `breakout_continuation`, `reversal_from_exhaustion`, `range_break`, and `news_or_catalyst_momentum`. Exact values are compared case-insensitively after trimming; no semantic synonym inference is allowed. Conflicting supported aliases block. Missing, explicit `unknown`, or unsupported setup maps to existing `unknown` with warning `unknown_setup`; it does not block. No candle/context heuristic may classify setup.

## Confidence Alias Precedence

Numeric confidence is read in this order:

1. `recommendationSnapshot.confidence`
2. `recommendationSnapshot.score`
3. `recommendationSnapshot.payload_json.numeric_confidence`
4. `payload_json.confidence`
5. `payload_json.score`

Finite numeric values or strictly numeric strings are accepted. Values in `[0,1]` are normalized units. Values in `(1,100]` are percentages and divide by 100, matching existing score conventions. Values outside `[0,100]`, non-finite values, and nonnumeric strings block as invalid input. Populated aliases are compared after normalization; differences greater than `1e-9` return `blocked_conflicting_aliases`. Numeric confidence is required because the existing output field is non-null; no zero/default is invented.

Confidence label is read from `payload_json.confidence_label`, then `rating`, then `label`. Only `low`, `medium`, `high`, and `unknown` are accepted case-insensitively. Missing/unsupported label maps to `unknown` without deriving a bucket from numeric confidence. No clamping, recalibration, or confidence inference is allowed.

## Conflict Behavior

Known populated aliases for one concept are all inspected. Equivalent canonical values are accepted. Material conflicts return `blocked_conflicting_aliases`, no row, error issues at each conflicting path, and no later validation. Unknown extra fields are ignored; they never resolve conflicts.

## Missing Required Field Behavior

Missing recommendation input, required recommendation/snapshot identity, ticker, side, valid numeric confidence, or parseable recommendation timestamp blocks. Missing required supplied context/outcome identity blocks when that object is non-null. No replacement is generated.

## Missing Optional Field Behavior

Null context, null outcome, absent news, absent events, missing optional provenance detail, and unknown setup are represented with existing missing/pending semantics and warning issues. They produce `mapped_with_missing_optional_data`, limited/pending eligibility as applicable, and a consumable row.

## Explicit Null Unknown Unavailable Behavior

`explicit_null`, `unknown`, `unavailable`, absent, stale, partial, and conflicting remain distinct. Null is never rewritten as unknown; unknown is never rewritten as unavailable; absent news is not a no-catalyst claim. Existing context states are copied without defaulting. No default may be inferred.

## Provenance Behavior

Supplied provenance is copied and validated for state, required provider/source fields for complete state, finite confidence, bounded `[0,1]` confidence/completeness, and source timestamp ordering. Partial/stale/unavailable provenance remains explicit and warns. Malformed provenance blocks. The mapper does not fetch, merge, score, or synthesize provenance.

## Completeness Behavior

Output completeness and eligibility follow explicit deterministic rules over required-field validity and existing missing-state flags. Full required data with no warnings maps to `mapped`; optional gaps map to `mapped_with_missing_optional_data`. No statistical evidence quality, hidden weighting, or provider lookup is allowed. Action 388 must encode these literal rules in tests, not introduce thresholds beyond existing bounds.

## Temporal Validation

Recommendation time is the snapshot boundary. Snapshot capture may be at or after recommendation time. Context capture and effective time must be at or before recommendation time. A supplied outcome evaluation must be at or after recommendation time. Excluded future facts must be after recommendation time and marked excluded. Invalid parse or ordering returns `blocked_temporal_violation`.

## Future-Leakage Rejection

Included future news, future macro facts, future regime/relative-strength facts, outcome fields inside recommendation-time context, or retrospective evidence marked as live context returns `blocked_future_leakage`. Explicit excluded-future facts are preserved only when `included_in_snapshot_context` is false.

## Input Immutability

The mapper must neither mutate nor retain mutable references to any input. Action 388 must capture canonical input serializations before mapping and prove they remain identical afterward. Output must own copied data.

The implementation must not read environment values or the filesystem, use network/provider/news/Supabase clients, call `Date.now()`, use current-time `new Date()`, call `Math.random()`, generate random UUIDs, log, or cache mutable global state.

## Output Determinism

Identical canonical inputs must return deeply equal results, identical issue order, identical row IDs, and identical serialization. Changed relevant identity inputs must change row identity.

## Stable Serialization

The mapper constructs row fields in the existing `Action335LearningDatasetRow` declaration order and issues in frozen order. JSON serialization of repeated results must be byte-identical. Object-key sorting is not used as a hidden normalization step.

## No-Repair Guarantee

Malformed required values, linkage, timestamps, provenance, or outcomes are returned as blocked results. The mapper does not repair, guess, clamp, substitute, or silently discard conflicting required values.

## No-Enrichment Guarantee

The mapper does not fetch or append market, sector, peer, news, macro, provider, candle, profile, or calendar data.

## No-Inference Guarantee

The mapper does not infer side, setup, confidence, market regime, outcomes, provenance, or missing context. Only explicitly frozen literal normalization is allowed.

## No-Runtime Guarantee

The mapper imports no route, Next runtime, environment, scanner, broker, UI, automation, or background-job module.

## No-Persistence Guarantee

The mapper imports no Supabase/local-storage/filesystem repository and performs no read, write, upsert, audit append, or persistence callback.

## Adapter-First Constraints

The implementation consumes existing authoritative types and emits the existing Learning Dataset row. It may contain small pure field readers inside the approved mapper module but no second input/output domain model.

## No-Parallel-System Constraints

No duplicate recommendation, outcome, context, provenance, setup taxonomy, confidence taxonomy, Learning Dataset row, validation framework, or identity system may be created. The mapper result and issue types are mapper-boundary contracts only.

## Peer-Group And Deferred Gaps

Peer-group remains `unsupported_optional`. The shared context and Pattern Insight contracts have no peer-group value field. The mapper must preserve its absence using existing missing-data semantics, never infer it from sector/industry, and never extend schema. Runtime context collection, persistence shape, provider-specific extra lineage, Pattern metrics, and calibration remain deferred or blocked outside mapper scope.

## Approved Implementation Surfaces

Only the exact Action 388 surfaces listed in the module boundary are approved. The optional pure validator must be colocated and requires a demonstrated complexity need; the preferred implementation is one mapper module.

## Forbidden Implementation Surfaces

Forbidden surfaces include `app/`, API routes, runtime adapters, Supabase repositories, persistence services, background jobs, replay runners, provider/news adapters, scanner/ranking/confidence integration, Pattern Discovery, schemas, migrations, proxy, middleware, `netlify.toml`, and runtime-preview/deployment artifacts.

## Acceptance Criteria

Action 388 must implement the exact contracts and order above, pass valid/optional-gap/blocked cases, prove deterministic identity/serialization and immutability, avoid throws for expected invalid data, import no external/runtime/persistence surface, and leave fixtures and production behavior unchanged.

## Rejection Criteria

Reject Action 388 if it changes vocabulary/precedence, adds heuristics, repairs malformed input, mutates inputs, uses clocks/random/environment/network/filesystem/providers/Supabase, persists, changes schema/runtime/scanner/ranking/confidence/recommendations, or expands approved files.

## Approval Decision

`approval_decision: approved`

The two Action 386 conditions are fully resolved. A pure local mapper can be implemented without runtime, persistence, external access, schema changes, hidden heuristics, or unresolved leakage behavior.

## Passed Conditions

- passed_conditions_count: 17
- exact input and output contracts frozen
- exact result and issue vocabulary frozen
- validation order frozen
- timestamp, side, setup, and confidence precedence frozen
- conflict behavior frozen
- deterministic identity frozen
- missing-state behavior frozen
- provenance/completeness behavior frozen
- temporal and anti-leakage behavior frozen
- immutability and serialization frozen
- no repair/enrichment/inference
- pure mapper feasible
- no schema/runtime/persistence requirement
- peer-group gap non-blocking
- future surface narrow and auditable
- upstream gates healthy

## Failed Conditions

- failed_conditions_count: 0
- failed_conditions: none

## Unresolved Conditions

- unresolved_conditions_count: 0
- unresolved_conditions: none

## Blocked Downstream Work

Runtime integration, persistence, provider/news access, Supabase, replay, Pattern Discovery, aggregation, inference, confidence calibration, scanner/ranking/recommendation changes, schema/migrations, deployment, and runtime-preview advancement remain blocked after mapper implementation.

## Next Permitted Action

Action 388 may implement only the approved pure Snapshot-to-Learning Dataset mapper and focused static verification surfaces. It may not perform or approve downstream integration.

The runtime-preview chain remains paused at `runtime_preview_waiting_for_operator_inputs`.
