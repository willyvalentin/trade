# Action 388: Pure Snapshot-to-Learning Dataset Mapper Implementation

## Purpose And Scope

Action 388 implements one pure deterministic mapper from an existing recommendation snapshot, nullable Intelligence Context snapshot, and nullable evaluated outcome to the existing Learning Dataset row contract. It contains no runtime adapter or consumer.

## Authoritative Contracts

The mapper imports `RecommendationSnapshot`, `Action336IntelligenceContextStaticFixture`, `RecommendationOutcome`, and `Action335LearningDatasetRow`. It reuses `LearningDatasetContext`, `LearningDatasetContextValue`, `LearningDatasetProvenance`, and the existing schema marker. No duplicate recommendation, context, outcome, row, side, setup, or status schema was added.

## Action 387 Approval

- approval_decision: approved
- passed_conditions_count: 17
- failed_conditions_count: 0
- unresolved_conditions_count: 0
- action_387_boundary_respected: true

The implementation follows the exact Action 387 result, issue, validation, alias, identity, purity, and file boundaries.

## Module Boundary

The only production module is `lib/snapshot-to-learning-dataset-mapper.ts`. It contains the mapper types and colocated pure validation/read helpers. No adapter, repository, service, route, job, consumer, or second validator module exists.

## Public Mapper API

`mapSnapshotToLearningDataset(input)` is the single authoritative entry point. Input is `SnapshotToLearningDatasetMapperInput`; output is `SnapshotToLearningDatasetMapperResult`.

## Input Contract

`recommendationSnapshot` is required. `contextSnapshot` and `outcome` are explicitly nullable. The function accepts no services, environment, clock, RNG, filesystem, provider, news, Supabase, cache, or persistence handle.

## Result Contract

Success statuses are `mapped` and `mapped_with_missing_optional_data`, each with a row and `consumable: true`. Blocked statuses are `blocked_missing_required_identity`, `blocked_invalid_linkage`, `blocked_conflicting_aliases`, `blocked_temporal_violation`, `blocked_future_leakage`, `blocked_invalid_provenance`, `blocked_invalid_outcome`, and `blocked_invalid_input`, each with `row: null` and `consumable: false`. Expected malformed data does not throw.

## Issue Contract

Issues contain only fixed `code`, RFC 6901 `path`, `error|warning` severity, and fixed `mapper.issue.*` message key. Each phase deduplicates `(code,path)` and sorts by path then code. Issues include no raw values, payload dumps, secrets, or dynamic text.

## Validation Order

Validation runs in the frozen order: input shape; required identity; linkage; aliases; timestamps/temporal order; future leakage; provenance; outcome; optional completeness/required mapping fields; row construction. The first error phase determines status and later phases do not run.

## Alias Precedence

- Timestamp: `recommended_at`, `app_timestamp`, `created_at`; capture uses `app_timestamp`, then `created_at`. Context uses its explicit capture/effective fields. Outcome uses `evaluated_at`, then `updated_at`, then `created_at` only when needed.
- Side: snapshot side, then approved payload side/direction paths. Only buy/long and sell/short equivalence is allowed.
- Setup: payload setup family/type, then snapshot type/label. Only Action 326 literals are accepted; unsupported/missing maps to explicit `unknown` warning.
- Confidence: confidence, score, then approved payload numeric fields. `[0,1]` is preserved and `(1,100]` divides by 100. Conflicts, invalid ranges, and non-finite values block. Confidence labels are never derived from numeric confidence.

## Row Identity

The mapper NFC-normalizes and percent-encodes, in order, the Learning Dataset schema marker, snapshot fingerprint, horizon/pending marker, and outcome ID/pending marker. Their `|` composition is the learning key and follows `learning_row:v1:` in the row ID. Identity uses no clock, random value, mutable metric, setup, confidence, or context value.

## Linkage Behavior

Recommendation/snapshot identity is mandatory. Present context must match snapshot and recommendation references. Present outcome must match snapshot ID/fingerprint, recommendation ID, ticker, side, and supported horizon. Mismatch blocks without repair.

## Missing-Data Behavior

Null context creates an explicit deterministic unavailable context/provenance representation and warning. Null outcome creates the existing pending/no-outcome representation and warning, using the snapshot's existing `outcome_horizon` metadata for the required output window; no horizon default is invented. Missing news/events and explicit null/unknown/unavailable/stale/partial/conflicting context values remain distinct. No peer-group field is introduced.

## Context Behavior

Present context is defensively copied after identity, timestamp, leakage, provenance, freshness/conflict, and bounds checks. Excluded future facts remain exclusion metadata on the input envelope and are never copied into live context values. Null context remains limited and consumable.

## Outcome Behavior

Present outcomes are validated and adapted to the narrower Learning Dataset outcome vocabulary. Existing R fields are copied; no candles are read and no outcome is calculated. Null or pending outcomes remain pending. Incomplete outcomes remain incomplete.

## Provenance And Completeness

Complete provenance requires provider and source timestamp. Confidence and completeness must be finite and within `[0,1]`; conflict metadata must remain coherent. The output copies supplied provenance completeness or uses the explicit unavailable value `0` for null context. It does not score or infer completeness.

## Temporal Rules And Anti-Leakage

Snapshot capture cannot precede recommendation time. Context capture/effective time cannot follow recommendation time. Outcome cannot precede recommendation time. Included future news/macro/context facts and outcome fields in snapshot context return `blocked_future_leakage`. Properly excluded future facts remain allowed only when marked excluded.

## Input Immutability

The mapper only reads inputs and clones copied context/provenance structures. It retains no mutable input reference. Tests freeze and serialize wrappers, nested payloads, provenance, arrays, and timestamps before and after calls.

## Output Determinism

Repeated structurally identical calls return deeply equal results, stable issues, stable IDs, and byte-identical JSON. There is no global mutable state or cache, and fixture ordering cannot affect a single mapping result.

## Error Behavior

Expected malformed-data conditions return discriminated blocked results. Validation does not repair, clamp, substitute, fetch, infer, or log. Unexpected language/runtime programmer failures remain exceptional.

## Peer-Group Handling

Peer-group remains `unsupported_optional`. No peer field or sector/industry inference is present. Any future shared peer-group extension requires a separate gate.

## No-Runtime No-Persistence No-External-Access Guarantees

The mapper imports no Next/runtime route, scanner, UI, automation, provider/news client, Supabase client, persistence/local-storage/filesystem module, replay runner, Pattern Discovery, ranking, or confidence integration. It does not read environment, call fetch, log, write, persist, or execute replay.

## Blocked Downstream Work

Runtime consumption, persistence, API integration, provider/news enrichment, Supabase, replay, Pattern Discovery, aggregation, calibration, scanner/ranking/recommendation changes, schemas, migrations, deployment, and runtime-preview advancement remain blocked.

## Runtime Preview

runtime_preview_status: runtime_preview_waiting_for_operator_inputs

The route, immutable candidate, preserved attempt, and deployment artifacts remain unchanged.

## Intended Next Review Action

The next permitted action is a static mapper implementation result review and fixture-coverage audit. It must not integrate or persist mapper output.
