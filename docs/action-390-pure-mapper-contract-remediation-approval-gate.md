# Action 390 - Pure Mapper Contract Remediation Approval Gate

## Purpose and scope

Action 390 freezes the exact remediation permitted for the seven contract gaps found by the independent Action 389 audit. It is a static, deterministic, local-only approval gate. It does not modify the mapper, fixtures, runtime, persistence, or any recommendation behavior.

Authoritative dependencies and upstream Actions: Action 309, Action 335, Action 336, Action 352, Action 380, Action 381, Action 383, Action 386, Action 387, Action 388, and Action 389.

Action 389 returned `readiness_decision: blocked`, with 13/13 Action 380 valid families and 15/15 Action 381 valid fixtures covered, all 10 result statuses and 14 issue codes covered, deterministic validation precedence, immutable inputs, deterministic outputs, and no mapper consumers. Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

Post-remediation clean checkouts may contain only the historical baseline mapper hash, the exact Action 391 remediation hash `e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b`, or the exact Action 394 literal-normalization hash `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`. Any other mapper source remains blocked.

## Exact seven findings and classifications

| Finding | Classification |
| --- | --- |
| Unsupported context categories are accepted | `missing_domain_validation` |
| Invalid freshness states are accepted | `missing_domain_validation` |
| Stale/fresh contradictions are accepted | `inconsistent_state_validation` |
| Non-finite context metrics are accepted | `missing_numeric_validation` |
| Unsupported trading windows are accepted | `missing_domain_validation` |
| Payload and outcome horizons may disagree | `missing_linkage_validation` |
| Failed anti-leakage input can be emitted as passed | `output_integrity_violation` |

These are targeted validation and output-integrity defects. They do not require a schema extension, fixture change, runtime dependency, inferred field, calculated intelligence, persistence, or mapper redesign.

## Remediation vocabulary

The permitted implementation vocabulary is: validate, compare, reject, preserve, and block. It does not include infer, calculate, coerce, clamp, repair, normalize-invalid-to-valid, enrich, fetch, persist, or silently drop.

## Exact permitted mapper surface

Action 391 may change only:

- `lib/snapshot-to-learning-dataset-mapper.ts`
- `docs/action-391-pure-mapper-contract-remediation.md`
- `scripts/action-391-pure-mapper-contract-remediation-verify.mjs`
- `tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts`
- focused compatibility updates to Actions 388-390 verifiers/tests where the changed mapper hash or newly rejected cases require them
- minimal Actions 318-320 guard classifications

The mapper change is limited to pure validation helpers, deterministic validation calls in the frozen sequence, and preventing invalid anti-leakage state from reaching row construction.

Forbidden surfaces: fixture modules, new production modules, adapters, consumers, batch mapping, shadow runners, replay, runtime routes, providers, news, Supabase, persistence, schema/migrations, proxy, middleware, Netlify configuration, scanner, recommendation generation, ranking, confidence behavior, Pattern Discovery, deployment artifacts, and runtime-preview files.

## Context-category remediation

Closed vocabularies already established by Actions 380 and 381 must be reused exactly:

- Missing-state wrapper: `present`, `explicit_null`, `unavailable`, `unknown`.
- Market completeness: `complete`, `partial`, `unavailable`.
- Index direction values when present: `up`, `down`, `neutral`.
- Market regime values when present: `bullish`, `bearish`, `mixed`.
- Volatility regime values when present: `low`, `elevated`.
- Sector relative-strength values when present: `strong`, `weak`, `conflicting`.
- Intraday relative-strength labels when present: `positive`, `negative`, `conflicting`.
- News availability: `present`, `absent`, `unavailable`.
- Existing catalyst types: `product_announcement`, `earnings`, `guidance`, `fda`, `sec`, `sec_filing`, `neutral_company_update`, `company_update`.
- Calendar availability: `present`, `absent`, `unavailable`.
- Existing event types: `macro_release`, `cpi`, `fomc`, `jobs_report`, `options_expiration`.
- Event risk values when present: `none`, `moderate`, `high`.

Sector and industry values are identifier fields rather than closed category enums. A `present` identifier must be a non-empty string; it must not be inferred or rewritten. Boolean and numeric context fields must retain their authoritative primitive type.

`unknown` and `unavailable` are represented by their explicit missing-state wrappers, not by converting an unsupported present value. `explicit_null` and `unavailable` require `value: null`; `unknown` requires the established unknown representation; `present` requires a non-null value of the field's expected type.

Unsupported closed-category values must return `blocked_invalid_provenance` with `invalid_provenance` at the exact context value path. Unsupported recommendation window values instead return `blocked_invalid_input` with `invalid_input` because the window is snapshot-owned. No category vocabulary may be extended during Action 391.

## Freshness-state remediation

The authoritative freshness states are `fresh`, `stale`, `unknown`, and `unavailable`.

Declared consistency rules reuse the Action 381 fixture validator:

- `fresh`: finite non-negative `age_minutes_at_recommendation` below the explicit 60-minute fixture boundary.
- `stale`: finite `age_minutes_at_recommendation` at or above 60 minutes.
- `unknown` or `unavailable`: age must be null.
- unsupported state: block.
- unavailable provenance/source cannot be represented as fresh.
- stale missing-data flags or a stale provenance label cannot be paired with fresh.
- stale freshness cannot be paired with complete source-quality claims.

The 60-minute boundary is an existing declared static-contract boundary, not a clock lookup. Action 391 must not call the current clock, calculate age from current time, introduce another threshold, or repair freshness. Failures return `blocked_invalid_provenance` and `invalid_provenance` at `/contextSnapshot/freshness/state`, `/contextSnapshot/freshness/age_minutes_at_recommendation`, or the exact contradictory metadata path.

## Stale/fresh consistency remediation

The following populated contradictions must block without selecting a winner:

- stale state paired with a populated `fresh: true` alias
- fresh state paired with a populated `stale: true` alias
- stale freshness paired with complete provenance/source-quality state
- fresh state paired with a `stale_source` missing-data flag or stale provenance label
- unavailable provenance/source paired with fresh
- conflict indicators without the required source IDs and details
- future-excluded facts represented as current or included

Only declared input consistency is validated. The mapper must not derive stale/fresh state from prices, recommendation time, current time, or an unstated threshold.

## Finite-metric remediation

Every numeric field already present in the Action 381 context envelope must use finite-number semantics:

- numeric `LearningDatasetContextValue.value`, including stock-vs-index and stock-vs-sector relative strength
- `freshness.age_minutes_at_recommendation`
- `data_provenance.source_confidence`
- `data_provenance.completeness_score`

`NaN`, positive Infinity, negative Infinity, numeric strings, wrong primitive types, and invalid bounded values must block. Source confidence and completeness remain bounded to `[0,1]`; age must be non-negative and obey the declared freshness-state rules. Relative-strength metrics need only be finite unless an existing authoritative bound is already declared.

No coercion, clamping, null replacement, or silent field removal is permitted. Context numeric failures return `blocked_invalid_provenance` with `invalid_provenance` and the exact RFC 6901 path.

## Trading-window remediation

The authoritative recommendation/learning windows are `morning`, `midday`, `power_hour`, and `unknown`.

- Existing supported literals pass unchanged.
- Explicit authoritative `unknown` passes unchanged.
- Unsupported or malformed populated values return `blocked_invalid_input` with `invalid_input` at `/recommendationSnapshot/window`.
- Missing window follows the authoritative snapshot contract; Action 391 must not infer it.
- No timestamp-to-window inference, market-session calculation, or taxonomy extension is permitted.

## Horizon-linkage remediation

The mapper must compare every populated authoritative horizon representation it currently receives:

- `recommendationSnapshot.payload_json.outcome_horizon`
- supplied `outcome.horizon`
- the row/output horizon selected for construction

The authoritative mapper output supports `15m`, `30m`, and `60m`. Equal canonical literals pass. A null outcome continues to require a supported payload horizon for pending output. With an outcome, a populated payload horizon and outcome horizon must agree. A disagreement returns `blocked_invalid_linkage`, no row, `consumable: false`, and `invalid_linkage` at `/outcome/horizon`.

No horizon may silently overwrite another. No horizon is inferred from timestamps, holding duration, evaluation age, or current time. The validated horizon is the only value permitted in output and deterministic row identity.

## Anti-leakage output-integrity remediation

Anti-leakage integrity is monotonic: it may remain equal or become more restrictive, never less restrictive.

- Only explicit `anti_leakage_status: passed` plus successful temporal, future-fact, and excluded-fact validation may produce output `passed`.
- Failed, unknown, unsupported, or missing anti-leakage evidence cannot produce `passed`.
- A failed marker returns `blocked_future_leakage` with `future_leakage` at `/contextSnapshot/anti_leakage_status`.
- The blocked result contains no row and has `consumable: false`.
- Row construction cannot overwrite or repair a failed/unknown/missing marker.
- Future exclusions remain valid only when `included_in_snapshot_context: false` and their existing temporal/exclusion contract passes.
- No output field may contradict the blocked result.

## Existing result-vocabulary compatibility

No new result status is approved. Both success statuses and all eight blocked statuses remain unchanged. The seven fixes map to existing statuses:

| Finding | Status | Issue code |
| --- | --- | --- |
| Context category | `blocked_invalid_provenance` | `invalid_provenance` |
| Freshness state/consistency | `blocked_invalid_provenance` | `invalid_provenance` |
| Context numeric metric | `blocked_invalid_provenance` | `invalid_provenance` |
| Trading window | `blocked_invalid_input` | `invalid_input` |
| Horizon mismatch | `blocked_invalid_linkage` | `invalid_linkage` |
| Anti-leakage failure | `blocked_future_leakage` | `future_leakage` |

## Issue-code policy

No new issue code is approved. Action 391 must retain the Action 387 shape `{ code, path, severity, messageKey }`, RFC 6901 paths, `error|warning`, fixed message keys, deterministic ordering and deduplication, no sensitive values, no full input dumps, and no dynamic messages.

## Validation-order policy

Action 391 must preserve the exact order:

1. input shape
2. required identity
3. linkage, including horizon mismatch
4. alias conflicts
5. timestamp and temporal ordering
6. future leakage, including anti-leakage marker integrity
7. provenance, including context categories, freshness, consistency, and context numerics
8. outcome
9. optional completeness
10. construction

Unsupported snapshot windows are input validation but must be checked during the existing input/provenance stage without overtaking earlier identity, linkage, alias, temporal, or leakage failures. Multi-fault primary status and deterministic issue order must remain compatible with Action 387.

## Backwards compatibility and deterministic behavior

Action 391 must preserve all previously passing valid fixtures and behavior: both success statuses, all eight blocked statuses, issue shape, timestamp/side/setup/confidence precedence, row identity, missing-state distinctions, explicit unknown/unavailable/null, pending and incomplete outcomes, immutable inputs, repeated/interleaved determinism, stable serialization, no global state, no consumers, and no external dependencies.

The mapper must remain a pure function. It must not mutate inputs, use current time or randomness, infer categories/windows/horizons/freshness, repair malformed values, enrich context, calculate intelligence, or change a valid row identity except where a previously accepted horizon conflict is now blocked.

## Fixture reuse and regression tests

Action 391 must reuse Actions 380 and 381 fixtures without modifying them. Test-local malformed wrappers are permitted. Regression coverage must include all seven findings, all previously passing Action 388/389 behavior, each existing status and issue shape, and multi-fault cases proving unchanged precedence.

Required seven regression outcomes:

1. unsupported context category blocks at its exact path
2. invalid freshness state blocks
3. stale/fresh contradiction blocks
4. non-finite context metric blocks
5. unsupported trading window blocks
6. payload/outcome horizon disagreement blocks linkage
7. failed anti-leakage marker blocks with no row and `consumable: false`

## Acceptance and rejection criteria

Accept Action 391 only if all seven cases reject deterministically, valid fixtures remain green, no status/issue expansion occurs, validation order remains stable, anti-leakage monotonicity holds, hashes/determinism are updated deliberately, inputs remain immutable, and no forbidden dependency or consumer appears.

Reject Action 391 if it normalizes invalid values, broadens a vocabulary, introduces inference or a clock, edits fixtures, adds a module/consumer, changes schemas, weakens earlier validation, emits a row for failed leakage, or touches runtime/persistence/scanner/ranking/confidence/Pattern Discovery.

## Approval vocabulary and deterministic gate conditions

Use exactly `approved`, `approved_with_conditions`, and `blocked`.

Approval requires exact rules for all seven findings, reusable authoritative vocabularies, no schema/status/issue expansion, deterministic paths/order, frozen anti-leakage monotonicity, pure mapper scope, unchanged fixtures, no runtime/persistence, and the narrow Action 391 surface above.

`approval_decision: approved`

`passed_conditions_count: 17`

`failed_conditions_count: 0`

`unresolved_conditions_count: 0`

All seven remediations have deterministic ownership, status, issue code, path policy, validation placement, and regression requirements. Existing contracts are sufficient; no condition remains for Action 391 to invent.

## Blocked downstream work

Mapper consumers, batch mapping, static shadow use, runtime integration, persistence, replay, Pattern Discovery, and confidence calibration remain blocked. This approval does not approve mapper use; it approves only the narrow pure remediation.

## Next permitted Action

The next permitted Action is Action 391 - Pure Snapshot-to-Learning Dataset Mapper Contract Remediation, limited exactly to the approved surface and seven regression cases above.
