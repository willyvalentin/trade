# Action 396 - Static Mapper Shadow-Use Approval Gate

## Purpose And Scope

Decide whether one future local, static, finite, disposable mapper shadow-use package may be implemented. This gate is policy-only: it does not invoke the mapper, create a runner, produce shadow evidence, add a consumer, or approve runtime use.

## Authoritative Dependencies And Upstream Inventory

This gate builds on Actions 309, 335, 352, 380, 381, 383, 385, 386, and 387-395. Action 395 independently returned:

- `readiness_decision: ready`
- `passed_conditions_count: 12`
- `failed_conditions_count: 0`
- `unresolved_conditions_count: 0`
- mapper consumers: 0
- runtime: none
- persistence: none

Protected source bindings:

- mapper: `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d`
- learning fixtures: `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b`
- context fixtures: `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406`
- pattern fixtures: `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57`

## Explicit Non-Goals

No shadow execution, production mapper consumer, mapper/fixture modification, authoritative Learning Dataset generation, persistence, Supabase, provider/news API, replay, route, job, runtime integration, scanner/recommendation hook, ranking/confidence mutation, Pattern Discovery, schema, migration, deployment, or runtime-preview advancement is allowed.

## Approval Vocabulary And Decision

Vocabulary is exactly `approved`, `approved_with_conditions`, and `blocked`.

- `approval_decision: approved`
- `passed_conditions_count: 15`
- `failed_conditions_count: 0`
- `unresolved_conditions_count: 0`

The decision approves only a separate Action 397 implementation within every boundary below. It does not produce `shadow_passed` and does not imply runtime or production readiness.

## Deterministic Gate Conditions

Approval requires Action 395 ready, exact protected hashes, fully allowlisted static inputs, a finite batch, pure local runner behavior, disposable non-authoritative output, visible success and blocked statuses, repeatable determinism, no persistence/replay/runtime/external access, no feedback, and a narrow auditable package. Any failed prerequisite changes this decision to `blocked`; no same-Action remediation is permitted.

## Proposed Action 397 Package Boundary

At most these files are approved:

- `scripts/action-397-static-mapper-shadow-run.mjs`
- `docs/action-397-static-mapper-shadow-use.md`
- `docs/action-397-static-mapper-shadow-input-manifest.json`
- `scripts/action-397-static-mapper-shadow-use-verify.mjs`
- `tests/e2e/action-397-static-mapper-shadow-use.spec.ts`
- minimal Actions 318-320 guard updates

No tracked shadow result/evidence file is approved. Result evidence must use the disposable output policy below. A production `lib/` consumer, adapter, API route, service, repository, batch service, replay runner, scheduled job, provider adapter, scanner hook, Learning Engine service, and Pattern Discovery consumer are forbidden.

## Allowed And Forbidden Input Sources

Allowed sources are existing Action 380 fixture-related static examples where appropriate, existing Action 381 context fixtures, explicit Action 397 test-local Recommendation Snapshot and Outcome wrappers, and manually allowlisted malformed static cases. Every case must exist in the manifest before execution.

Forbidden sources are live recommendations, production snapshots, database/Supabase rows, browser or localStorage data, API/provider/news responses, downloaded historical data, production-derived replay captures, arbitrary JSON, unreviewed user input, environment-derived input, scanner output, and persisted Learning Dataset rows.

## Static Input Allowlist And Finite Batch

The exact approved case IDs, in this exact order, are:

1. `valid_complete_mapping`
2. `valid_rich_context`
3. `valid_missing_optional_context`
4. `valid_pending_outcome`
5. `valid_incomplete_outcome`
6. `valid_stale_context`
7. `valid_partial_context`
8. `valid_conflicting_context`
9. `blocked_missing_identity`
10. `blocked_invalid_linkage`
11. `blocked_alias_conflict`
12. `blocked_temporal_violation`
13. `blocked_future_leakage`
14. `blocked_invalid_provenance`
15. `blocked_invalid_outcome`
16. `blocked_invalid_input`
17. `blocked_context_literal_padding`
18. `blocked_freshness_literal_padding`
19. `blocked_payload_horizon_literal_case`
20. `blocked_outcome_horizon_literal_padding`

Batch size is exactly 20. Directory discovery, glob discovery, automatic fixture enumeration, arbitrary case injection, and unbounded iteration are forbidden. Fixture-derived wrappers must be explicit, local, shallow/deep copied as needed, frozen before invocation, and must never mutate authoritative fixtures.

## Input Manifest Contract

The deterministic manifest must contain a manifest schema version, mapper SHA-256, all fixture hashes, and the ordered 20-case list. Each case requires: input case ID, source fixture IDs, wrapper classification, expected status, expected row-presence boolean, expected consumable boolean, expected issue codes, input ordering, input canonical hash, `static_only: true`, `non_production: true`, `no_replay: true`, and `no_persistence: true`.

The manifest must contain no sensitive values, environment values, machine paths, or dynamic timestamps. Its canonical hash must be verified before and after execution. Any undeclared case aborts the run.

## Source Integrity And Input Immutability

The runner must verify the bound mapper and fixture hashes before and after every run. Inputs, wrappers, nested payloads, contexts, provenance, and outcomes must be deep-frozen; before/after canonical serialization must match. No repair, inference, fallback, or write-back is allowed.

## Mapper Invocation And Runner Boundary

The future runner may only load the approved manifest, construct the 20 explicit test-local wrappers, call `mapSnapshotToLearningDataset`, serialize bounded results canonically, calculate deterministic hashes, write to the approved disposable path, repeat the same batch for comparison, and exit.

It must preserve blocked results and issues. It must not filter, retry, repair, infer, suppress issues, downgrade blocked results, capture dynamic time, mutate fixtures, persist rows, communicate externally, invoke runtime modules, or feed another system.

## Ordering And Result Capture

Input and result ordering must follow the manifest exactly. Each bounded result record contains only case ID, mapper status, row ID when present, row-present boolean, consumable boolean, ordered issue codes, issue paths, issue severities, and canonical result hash. Full rows are not approved for Action 397.

Blocked results are first-class evidence and may never be omitted. Issue arrays retain mapper ordering and must not be summarized away.

## Output Artifact Policy

Output classifications are exactly:

- local
- disposable
- synthetic/static-input-derived
- non-authoritative
- non-persisted
- non-production
- non-learning
- not eligible for Pattern Discovery
- not eligible for confidence calibration
- not eligible for ranking or recommendation feedback

Output must never be described as collected production learning data, historical backfill, replay result, validated live intelligence, persisted Learning Dataset, calibration evidence, or production outcome evidence.

Batch evidence contains mapper hash, input-manifest hash, result count, status counts, deterministic ordering, full batch hash, repeat-run comparison, fixture-integrity result, mapper-integrity result, `persistence_result: none`, `external_access_result: none`, and final shadow decision. No secrets, environment values, machine-sensitive paths, or dynamic timestamps are allowed.

## Filesystem And Cleanup Policy

Evidence must be written beneath a newly created system temporary directory identified in tracked output only as `<system-temp>/ture/action-397-static-mapper-shadow/`. It must not write tracked source, application data, runtime state, `.env`, `.netlify`, browser storage, Supabase, or any production input location. The runner must delete the temporary directory after verification; preservation requires a later separate approval. No output may become an implicit production input.

## Stable Serialization, Hashes, And Repeat Determinism

Canonical JSON uses fixed key insertion/order rules and no insignificant dynamic data. The same static batch must run at least twice in one controlled process. Statuses, row IDs, issue arrays, canonical result serialization, result hashes, batch hash, mapper hash, fixture hashes, and manifest hash must be identical. Any mismatch returns `shadow_failed`.

Required output hashes are per-input canonical hash, per-result canonical hash, input-manifest hash, and full-batch hash, using SHA-256.

## Shadow Decision Vocabulary

Future local execution vocabulary is exactly `shadow_passed`, `shadow_passed_with_conditions`, `shadow_failed`, and `shadow_aborted`. Action 396 emits none of these execution results. `shadow_passed` never implies runtime, deployment, production, calibration, or Recommendation Engine readiness.

## Hard No-Effect Requirements

- Persistence: none.
- Supabase reads/writes: none.
- Replay: none.
- Runtime/API/job integration: none.
- Provider/news access: none.
- Feedback to Pattern Discovery, confidence calibration, ranking, recommendations, scanner, or Learning Engine: none.
- Ranking/confidence mutation: none.
- Pattern Discovery invocation: none.

## Failure And Stop Conditions

The future runner must stop with `shadow_aborted` before mapping when mapper/fixture/manifest hashes differ, an input is not allowlisted, a mapper consumer unexpectedly exists, a runtime or external-access import appears, Supabase/provider/news/persistence code appears, output path is unsafe, the batch is not exactly finite, or source files changed.

It must stop with `shadow_failed` when fixture/input mutation occurs, blocked results are omitted, result contracts drift, repeated results differ, serialization/hashes differ, or any source changes during execution. No retry and no same-Action remediation are allowed.

## Acceptance And Rejection Criteria

Accept only the exact package, manifest, 20 cases, temp-only bounded evidence, two-run deterministic comparison, visible blocked results, source integrity, cleanup, and all no-effect requirements. Reject live/production/unreviewed inputs, automatic discovery, persistence, replay, production consumer, full-row evidence, tracked result evidence, external access, runtime use, or any feedback/mutation path.

## Blocked Downstream Work

Runtime shadow use, production snapshots, persisted rows, Pattern Discovery consumption, confidence calibration, ranking/recommendation feedback, replay, historical backfill, provider access, and deployment remain blocked regardless of a future static `shadow_passed` result.

## Next Permitted Action

The next permitted Action is Action 397: implement and execute only the approved local static shadow package. It must stop at bounded disposable evidence and must not advance `runtime_preview_waiting_for_operator_inputs`.
