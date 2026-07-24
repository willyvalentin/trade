# Action 444 Static Confidence Calibration Advisory Shadow Use

## Purpose

Action 444 executes the Action 443-approved, local-only advisory shadow package for the 48 Action 441-frozen Confidence Calibration Advisory scenarios. The package is synthetic, static, non-production, non-authoritative, non-learning, and metadata-only.

## Scope

This action adds only:

- `docs/action-444-static-confidence-calibration-advisory-shadow-input-manifest.json`
- `scripts/action-444-static-confidence-calibration-advisory-shadow-run.mjs`
- `docs/action-444-static-confidence-calibration-advisory-shadow-use.md`
- `scripts/action-444-static-confidence-calibration-advisory-shadow-use-verify.mjs`
- `tests/e2e/action-444-static-confidence-calibration-advisory-shadow-use.spec.ts`
- narrow compatibility updates for Actions 318-320 and Action 443

It does not add runtime routes, consumers, persistence, replay, provider access, Supabase access, feedback, confidence application, recommendation mutation, scanner changes, ranking changes, publication changes, schemas, migrations, or deployment configuration.

## Approval Binding

Action 443 approval decision: `approved`

Action 443 passed/failed/unresolved: `44 / 0 / 0`

Runtime preview remains paused at `runtime_preview_waiting_for_operator_inputs`.

## Protected Hashes

Advisory adapter SHA-256: `3c1b2ed0be3f37d5fe0514eee5a6a3b590811721f0e53b3802080fe764cd8e0b`

Action 441 package inventory SHA-256: `e6fb6b6e189feab0cf4bc1f2494522f7f2d9aa7ae0a455080156ad740f5facb8`

Action 441 scenario summary SHA-256: `78c349f52843451d99c405883c0d9571223616cf684928094aa0294424beec15`

All protected source hashes matched before and after execution.

## Scenario Inventory

Scenario count: `48`

Scenario IDs and order: `ca440_01` through `ca440_48`

No additions, omissions, reordering, substitution, dynamic discovery, or configurable scenario counts are allowed.

## Distributions

Expected and actual advisory status distribution:

- `advisory_ready`: 6
- `advisory_ready_with_warnings`: 2
- `advisory_no_adjustment`: 1
- `advisory_insufficient_evidence`: 1
- `blocked_invalid_input`: 6
- `blocked_invalid_lineage`: 12
- `blocked_future_leakage`: 6
- `blocked_calibration_result`: 10
- `blocked_unsupported_status`: 1
- `blocked_confidence_mismatch`: 3

Expected and actual hash-classification distribution:

- `complete`: 39
- `legacy`: 1
- `invalid_or_retained`: 8

Warning distribution:

- `none`: 45
- `metric_value_unavailable`: 3

Issue distribution:

- `none`: 9
- `blocked_calibration_result`: 14
- `blocked_confidence_mismatch`: 3
- `invalid_calibration_result`: 2
- `invalid_original_confidence`: 4
- `invalid_recommendation_identity`: 3
- `invalid_snapshot_lineage`: 3
- `blocked_invalid_lineage`: 1
- `blocked_future_leakage`: 5
- `blocked_feedback_reuse`: 4

## Result Checks

Complete/legacy/fallback result:

- valid complete hash accepted: true
- valid legacy hash accepted: true
- malformed hash blocked: true
- swapped hash blocked: true
- complete hash mismatch blocked: true
- legacy fallback bypass blocked: true
- retained hash tamper blocked: true

Confidence-binding result:

- exact match ready: true
- mismatch blocks: true
- invalid confidence blocks: true

Lineage/leakage/feedback result:

- recommendation lineage blocks: true
- pattern insight lineage blocks: true
- anti-leakage blocks: true
- anti-feedback blocks: true

No-adjustment result:

- scenario: `ca440_03`
- status: `advisory_no_adjustment`
- original confidence basis points: 5000
- proposed delta basis points: 0
- proposed calibrated confidence basis points: 5000
- application eligible: false
- non-authoritative: true
- applied: false

Advisory ID and semantic hash result:

- all ready scenarios have advisory IDs: true
- all scenarios have identity and result hashes: true

## Package Hashes

Manifest hash: `cb75253f5ac6c1040ffcfd34bfd0dde1d1f8ba46113c3d58cdb50a4ac7bf68c6`

Run 1 package hash: `e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c`

Run 2 package hash: `e66ca21b60c1f8b375e6197074f5afb0a6f1f8f59d03bf1fc1595e48be89623c`

Repeat-run identical: true

Exactly two executions are allowed. No retry or third repair run is allowed.

## Evidence Boundary

Temporary evidence is metadata-only. It may include scenario IDs, statuses, confidence values, flags, warning and issue records, bounded lineage hashes, hash classification, advisory IDs, identity hashes, result hashes, scenario hashes, package hashes, aggregate distributions, cleanup result, and safety flags.

It must not retain full Recommendations, full Confidence Calibration results, full Pattern Insights, full Pattern Discovery outputs, contexts, outcomes, provider payloads, Supabase payloads, secrets, environment values, timestamps, random IDs, machine paths, or permanent paths.

## Temporary Path And Cleanup

Temporary path policy: `<system-temp>/ture/action-444-static-confidence-calibration-advisory-shadow/`

The runner verifies the target is outside the repository, outside HOME/config, dedicated to Action 444, not a symlink, not under a symlink parent, not a path traversal, and empty before use.

Cleanup result:

- temporary evidence written: true
- temporary evidence verified: true
- temporary evidence deleted: true
- temp directory absent or empty: true
- no tracked evidence: true

## Safety

- provider call executed: false
- provider call attempted: false
- Supabase read executed: false
- Supabase write executed: false
- persistence executed: false
- replay executed: false
- runtime route created: false
- external access executed: false
- feedback executed: false
- consumer created: false
- confidence applied: false
- recommendation mutated: false
- scanner behavior changed: false
- live ranking changed: false
- publication changed: false
- authoritative data created: false

## Final Decision

Final shadow decision: `shadow_passed`

Unrelated-work classification: `action_444_static_confidence_calibration_advisory_shadow_execution_only`

Action 445 remains mandatory before any downstream consumer, confidence application, runtime integration, persistence, replay, or Recommendation Engine use.

Mandatory next action: `action_445_independent_static_confidence_calibration_advisory_shadow_verification`
