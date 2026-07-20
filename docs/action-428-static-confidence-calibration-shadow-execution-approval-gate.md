# Action 428 - Static Confidence Calibration Shadow Execution Approval Gate

## Purpose
Create a deterministic approval gate for one future Action 429 that may implement and execute the exact Action 426 frozen 45-scenario Confidence Calibration static shadow package.

This action approves a future boundary only. It does not create a runner, create an execution manifest, invoke `calibrateConfidence`, run a shadow package, persist evidence, mutate recommendations, advance runtime preview, call providers, or query Supabase.

## Scope
Action 428 is static, local-only, approval-gate-only, implementation-free, execution-free, source-immutable, runtime-free, persistence-free, replay-free, provider-free, Supabase-free, feedback-free, and recommendation-mutation-free.

Allowed changes are this document, the Action 428 local verifier, the Action 428 focused test, and minimal Actions 318-320 guard classification updates.

## Authoritative Dependencies
- Action 309 post-recovery safe development protocol.
- Actions 402-417 Pure Pattern Discovery chain.
- Action 418 Confidence Calibration contract.
- Action 419 implementation approval gate.
- Action 420 pure implementation.
- Action 421 independent audit.
- Action 422 remediation approval gate.
- Action 423 contract remediation.
- Action 424 independent post-remediation verification.
- Action 425 static fixture and hash-freeze approval gate.
- Action 426 static Confidence Calibration hash freeze.
- Action 427 independent static Confidence Calibration hash-freeze verification.

## Action 427 Readiness Decision
Action 427 readiness decision: `ready_with_conditions`.

Action 427 passed 47 conditions, failed 0 conditions, and left 1 unresolved condition:

- `issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory`

Action 428 resolves that condition for future execution by requiring Action 429 to retain complete issue metadata in its new manifest and temporary evidence. Action 428 does not modify Action 426 retroactively.

## Explicit Non-Goals
Do not modify:
- `lib/pure-confidence-calibration.ts`
- `lib/pure-pattern-discovery.ts`
- `lib/snapshot-to-learning-dataset-mapper.ts`
- static fixtures
- Action 416 shadow package artifacts
- Action 426 inventory
- Action 426 hash-freeze script

At Action 428 approval time, do not create:
- `docs/action-429-static-confidence-calibration-shadow-input-manifest.json`
- `scripts/action-429-static-confidence-calibration-shadow-run.mjs`
- tracked Action 429 evidence
- runtime routes
- API routes
- replay routes
- persistence paths

Do not execute:
- `calibrateConfidence`
- calibration shadow
- replay
- provider calls
- Supabase reads or writes
- feedback loops
- recommendation mutation
- scanner or ranking changes

## Protected-Source Inventory
Future Action 429 must abort before execution unless these exact protected SHA-256 hashes match:

| Path | SHA-256 |
| --- | --- |
| `lib/pure-confidence-calibration.ts` | `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70` |
| `lib/pure-pattern-discovery.ts` | `48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c` |
| `lib/snapshot-to-learning-dataset-mapper.ts` | `7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d` |
| `lib/learning-dataset-static-fixtures.ts` | `706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b` |
| `lib/intelligence-context-static-fixtures.ts` | `46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406` |
| `lib/pattern-insight-static-fixtures.ts` | `db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57` |
| `docs/action-416-expanded-static-pattern-discovery-shadow-input-manifest.json` | `dbafd56a7c0f8c2eb79f22039cb9b1225e42f246e78ca278cd4344f72d39d652` |
| `scripts/action-416-expanded-static-pattern-discovery-shadow-run.mjs` | `b77f018e888d736dbf696ac0acc0b5c16a826b2bab26f09db42ecc28f956d7ea` |
| `scripts/action-426-static-confidence-calibration-hash-freeze.mjs` | `f8cf5af48f640a2158f17f92b6321340d17f334577534fc8b675969e9ff223fa` |
| `docs/action-426-static-confidence-calibration-hash-inventory.json` | `e19e320a662ab0d18500fb1b630563fdf1f3361a592afe00ff4af0ec6e9d69fe` |

## Action 426 Inventory Binding
Future Action 429 must bind exactly this Action 426 full inventory hash:

`875f385a05f58d982baa182350a662db5518e13f8c18557e4697317deb724cc5`

A mismatch returns `shadow_aborted` before execution.

## Exact Scenario Inventory
Future Action 429 must execute exactly these 45 scenarios in this order:

`cc425_01`, `cc425_02`, `cc425_03`, `cc425_04`, `cc425_05`, `cc425_06`, `cc425_07`, `cc425_08`, `cc425_09`, `cc425_10`, `cc425_11`, `cc425_12`, `cc425_13`, `cc425_14`, `cc425_15`, `cc425_16`, `cc425_17`, `cc425_18`, `cc425_19`, `cc425_20`, `cc425_21`, `cc425_22`, `cc425_23`, `cc425_24`, `cc425_25`, `cc425_26`, `cc425_27`, `cc425_28`, `cc425_29`, `cc425_30`, `cc425_31`, `cc425_32`, `cc425_33`, `cc425_34`, `cc425_35`, `cc425_36`, `cc425_37`, `cc425_38`, `cc425_39`, `cc425_40`, `cc425_41`, `cc425_42`, `cc425_43`, `cc425_44`, `cc425_45`.

## Exact Scenario-Order Policy
No additions, removals, renames, reordering, substitution, automatic discovery, configurable case count, arbitrary JSON generation, CLI scenario definitions, input paths, stdin, or manifest rewriting are allowed.

## Configuration Binding
Future Action 429 must bind `confidence_calibration_config_v1`, the exact direction delta table, warning attenuation table, confidence basis-point scale, confidence bounds, positive combined cap `400`, negative combined cap `-600`, and `round_half_away_from_zero`.

## Base-Confidence Binding
Future Action 429 must bind the exact base-confidence inventory:

`-1`, `0`, `100`, `10000`, `10001`, `50`, `50.00`, `5000`, `5000.1`, `9800`, `9900`, `Infinity`, `NaN`.

## Insight-Envelope Binding
Future Action 429 may reconstruct approved inputs only from bounded Action 426 insight-envelope metadata. It must not retain or ingest full Pattern Insights, full Pattern Discovery result objects, recommendation objects, contexts, outcomes, production payloads, credentials, environment values, timestamps, machine paths, or secrets.

## Expected-Status Inventory
The exact status distribution is:

- `calibrated`: 14
- `calibrated_with_warnings`: 11
- `no_adjustment`: 5
- `blocked_invalid_input`: 9
- `blocked_overlapping_evidence`: 1
- `blocked_unsupported_insight`: 1
- `blocked_invalid_lineage`: 1
- `blocked_future_leakage`: 1
- `blocked_invalid_configuration`: 1
- `insufficient_eligible_evidence`: 1

The total must equal 45 and must not be derived from execution.

## Expected-Delta Inventory
Future Action 429 must compare every frozen individual delta, pre-cap aggregate delta, post-cap aggregate delta, and signed-zero normalization from Action 426. It must bind strong supportive `+200`, moderate supportive `+100`, weak supportive `+50`, neutral `0`, mixed `0`, weak adverse `-100`, moderate adverse `-200`, and strong adverse `-300`.

## Expected-Confidence Inventory
Future Action 429 must compare every frozen unclamped confidence and final proposed confidence. This includes upper-bound exact `10000`, upper clamp from `10100` to `10000`, lower-bound exact `0`, and lower clamp from `-50` to `0`.

## Warning Inventory
The exact warning distribution is:

- `duplicate_mapper_row_identity`: 4
- `metric_value_unavailable`: 3
- `duplicate_insight_deduped`: 1
- `overlapping_insight_excluded`: 3
- `confidence_clamped_to_bounds`: 2

Warning arrays must be canonical, sorted where Action 426 sorted them, unique where Action 426 deduped them, and stable in Action 426 order where ordering was meaningful.

## Complete Issue-Metadata Inventory
Future Action 429 must retain and compare complete issue metadata for every issue record:

```json
{
  "code": "stable_issue_code",
  "path": "/rfc6901/path",
  "severity": "error",
  "messageKey": "confidence_calibration.stable_issue_code"
}
```

The exact issue distribution is:

- `warning_status_contradiction`: 2
- `overlapping_evidence_conflict`: 2
- `ineligible_pattern_discovery_status`: 1
- `invalid_lineage`: 1
- `future_leakage`: 1
- `invalid_insight_structure`: 1
- `invalid_configuration_shape`: 1
- `invalid_base_confidence`: 6
- `insufficient_eligible_evidence`: 1

Rules:
- `code`, `path`, `severity`, and `messageKey` are required.
- `severity` for issue records is `error`.
- `messageKey` is `confidence_calibration.<code>`, matching the pure implementation output.
- `path` must be an RFC 6901 path beginning with `/`.
- Ordering and deduplication must be deterministic.
- Raw rejected values, dynamic text, production payloads, environment values, and secrets are forbidden.

This is the Action 428 closure for `issue_severity_and_messageKey_not_retained_in_action_426_bounded_inventory`.

## Overlap Inventory
Future Action 429 must bind and compare exact duplicate and overlap outcomes:

- `cc425_23` deduplicates one exact duplicate insight and emits `duplicate_insight_deduped`.
- `cc425_24`, `cc425_25`, and `cc425_26` each exclude one overlapping insight and emit `overlapping_insight_excluded`.
- `cc425_27` returns `blocked_overlapping_evidence` with two `overlapping_evidence_conflict` issue records.

## Cap Inventory
Future Action 429 must bind positive aggregate cap behavior at `+400` and negative aggregate cap behavior at `-600`, including beyond-cap cases where pre-cap and post-cap deltas differ.

## Clamp Inventory
Future Action 429 must bind `clamping_state` exactly, including unclamped bounds and both `confidence_clamped_to_bounds` warning cases.

## Zero-Adjustment Inventory
Future Action 429 must bind `cc425_04`, `cc425_05`, `cc425_20`, `cc425_32`, and `cc425_33` as `no_adjustment` with zero post-cap aggregate delta.

## Calibration-ID Contract
Every advisory result must retain `confidence_calibration_v1:` plus exactly 24 lowercase hexadecimal characters.

## Identity-Hash Contract
Every advisory result must retain a 64-character lowercase SHA-256 identity hash. The calibration ID suffix must match the first 24 characters of that identity hash.

## Result-Hash Contract
Every scenario must retain a 64-character lowercase canonical result SHA-256 hash.

## Scenario-Hash Contract
Every scenario must retain the Action 426 scenario summary hash. Future Action 429 must recalculate and compare it from metadata-only scenario summaries.

## Future Execution-Manifest Contract
Only this future manifest path is approved:

`docs/action-429-static-confidence-calibration-shadow-input-manifest.json`

It must contain:
- schema version
- Action 426 inventory hash
- protected source hashes
- scenario count 45
- exact ordered scenario IDs
- exact source classifications
- exact base-confidence values
- exact bounded insight metadata
- exact configuration
- expected status
- individual deltas
- pre-cap aggregate delta
- post-cap aggregate delta
- unclamped confidence
- final confidence
- clamp state
- expected warnings
- complete expected issues with `code`, `path`, `severity`, and `messageKey`
- included and excluded insight IDs
- overlap result
- calibration ID
- identity hash
- result hash
- scenario summary hash
- exact aggregate distributions
- `static_only: true`
- `non_production: true`
- `non_authoritative: true`
- `non_learning: true`
- `no_persistence: true`
- `no_replay: true`
- `no_runtime: true`
- `no_external_access: true`
- `no_feedback: true`
- `recommendation_mutated: false`

It must not include full Pattern Insights, full Pattern Discovery results, recommendations, contexts, outcomes, production payloads, secrets, environment values, timestamps, or machine paths.

## Future Runner Contract
Only this future runner path is approved:

`scripts/action-429-static-confidence-calibration-shadow-run.mjs`

The runner may only:
1. verify protected hashes
2. load the exact manifest
3. verify exactly 45 scenarios
4. construct each approved input
5. call `calibrateConfidence`
6. compare each output to frozen expectations
7. compare full issue and warning metadata
8. verify IDs and semantic hashes
9. verify aggregate distributions
10. canonically serialize bounded metadata
11. calculate per-scenario and package hashes
12. execute the complete package exactly twice
13. compare both runs
14. write temporary metadata-only evidence
15. verify evidence
16. delete evidence
17. verify cleanup
18. exit

The runner must not allow automatic discovery, arbitrary JSON, CLI scenario definitions, input paths, stdin, manifest rewriting, expectation rewriting, retries, third execution, input repair, result suppression, persistence, runtime callbacks, external communication, recommendation mutation, or feedback.

## Metadata-Only Evidence Contract
Temporary evidence may contain only metadata necessary to verify the shadow:

- scenario ID
- status
- individual deltas
- aggregate deltas
- proposed confidence
- clamp state
- warning codes
- complete issue metadata
- included and excluded insight IDs
- overlap summary
- calibration ID
- identity hash
- result hash
- scenario summary hash
- manifest hash
- inventory hash
- protected-hash results
- scenario count
- status distribution
- warning distribution
- issue distribution
- run 1 package hash
- run 2 package hash
- repeat-run identical
- cleanup result
- `persistence_result: none`
- `replay_result: none`
- `runtime_result: none`
- `external_access_result: none`
- `feedback_result: none`
- `recommendation_mutated: false`
- `authoritative_data_created: false`
- final shadow decision

## Full-Output Prohibition
Future Action 429 must not retain full insight objects, full Pattern Discovery result objects, recommendations, contexts, outcomes, credentials, environment values, timestamps, random IDs, permanent paths, production payloads, or secrets.

## Temporary-Filesystem Policy
Use only:

`<system-temp>/ture/action-429-static-confidence-calibration-shadow/`

The path must be outside the repository, outside immutable candidate directories, outside app data, outside HOME/config, Action 429 dedicated, not a symlink, not a dangling symlink, not reached through a parent-chain symlink, not path traversed, not unsafe, and empty before use.

Unsafe path returns `shadow_aborted`.

## Cleanup Policy
Future Action 429 must delete temporary metadata-only evidence, verify cleanup, leave no tracked evidence, leave no repo evidence, and fail if cleanup fails.

## Repeat-Run Determinism
Future Action 429 must run exactly twice, compare both runs, and require identical scenario order, statuses, deltas, confidence values, clamp states, warnings, complete issues, included/excluded inventories, overlap outcomes, calibration IDs, identity hashes, result hashes, scenario hashes, aggregate distributions, and package hash. No third repair run is allowed.

## Source-Integrity Policy
Action 429 must verify protected hashes before execution and after execution. Any source mutation returns `shadow_aborted` before execution or `shadow_failed` after execution.

## No-Persistence Requirement
No database writes, file persistence outside temporary metadata-only evidence, fetch-run rows, candles, synthetic outcomes, calibration results, recommendations, or learning rows are allowed.

## No-Replay Requirement
No replay runner, replay dry run, historical replay, synthetic outcome replay, or replay with signal package may execute.

## No-Runtime Requirement
No API routes, page routes, middleware, proxy changes, runtime callbacks, runtime imports, browser execution, deployment artifacts, or production/non-production runtime inputs may be used.

## No-External-Access Requirement
No provider calls, news calls, Twelve Data calls, Supabase reads or writes, network calls, authentication, site-linking, production calls, or environment inspection may occur.

## No-Feedback Requirement
No feedback rows, learning signals, ranking feedback, confidence feedback, shadow diagnostics feedback, or model-change feedback may be created.

## No-Recommendation-Mutation Requirement
Recommendations, scanner universe, ranking, thresholds, live cards, Add Trade, broker, execution, risk, and Learning Acceleration must remain unchanged.

## Stop Conditions
Stop before execution with `shadow_aborted` if:
- calibration hash differs
- Pattern Discovery or mapper hash differs
- fixture hash differs
- Action 426 inventory hash differs
- scenario count is not 45
- scenario IDs or order differ
- configuration differs
- required status, hash, warning, or complete issue expectation is missing
- source class is unapproved
- runtime/provider/Supabase/replay import appears
- manifest is invalid
- temp path is unsafe

Fail after execution with `shadow_failed` if:
- status, delta, confidence, warning, complete issue, overlap, or identity differs
- any semantic hash differs
- aggregate distribution differs
- nondeterminism occurs
- cleanup fails
- source mutation occurs
- recommendation mutation occurs
- persistence occurs
- external access occurs
- authoritative data appears

No same-Action remediation is allowed after failure.

## Shadow Decision Vocabulary
Future Action 429 may use exactly:

- `shadow_passed`
- `shadow_passed_with_conditions`
- `shadow_failed`
- `shadow_aborted`

## Approval Vocabulary
Action 428 uses exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions
Action 428 approval requires:
- Action 427 reproduction is sound.
- Exact 45 scenarios are frozen.
- Complete issue metadata is required for Action 429.
- Semantic expectations are frozen.
- Manifest and runner boundaries are narrow.
- Exactly two runs are required.
- Evidence remains metadata-only.
- Cleanup is deterministic.
- Runtime, persistence, replay, external access, recommendation mutation, and feedback are forbidden.
- Before Action 429, the manifest and runner do not exist; after Action 429, only the exact approved Action 429 package files may exist.

## Approval Decision
Approval decision: `approved`.

Reason: the remaining Action 427 condition is closed by requiring complete issue metadata in the future Action 429 manifest and temporary evidence while preserving Action 426 unchanged.

## Passed Conditions
- Action 426 inventory hash is bound.
- Protected hashes are bound.
- Scenario inventory and order are bound.
- Status, warning, and issue distributions are bound.
- Delta, cap, clamp, overlap, zero-adjustment, ID, and hash verification requirements are bound.
- Future manifest path is singular and exact.
- Future runner path is singular and exact.
- Complete issue metadata policy is explicit.
- Temporary evidence is metadata-only.
- Exactly two runs are required.
- Cleanup is mandatory.
- Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

## Failed Conditions
No failed conditions are approved or carried.

## Unresolved Conditions
No unresolved conditions remain for the Action 428 approval gate.

## Next Permitted Action
Action 429: static Confidence Calibration shadow execution, limited to the approved manifest and runner contract above.

Action 429 remains optional and must be separately implemented and verified. Action 428 does not authorize deployment, production access, runtime preview advancement, persistence, replay, provider calls, Supabase access, feedback, or recommendation mutation.
