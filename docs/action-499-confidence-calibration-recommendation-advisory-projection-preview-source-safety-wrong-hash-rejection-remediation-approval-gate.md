# Action 499: Source-Safety Wrong-Hash Rejection Remediation Approval Gate

Action 498 executed exactly one local rehearsal attempt for the runtime-complete 31-file candidate. The rehearsal passed safe temp path selection, exact reconstruction, runtime dependency closure, source integrity, source safety, semantic preview-flag verification, dependency materialization and extraneous package exclusion. It then failed when the bounded source-safety checker test matrix did not block a deliberately wrong-hash negative fixture.

The Action 498 result is `full_candidate_rehearsal_failed`, external evidence is `rehearsal_evidence_verified`, and overall readiness is `blocked`. The exact failing case is `source_safety_test_matrix_wrong_hash_case_not_blocked`.

## Root Cause

The blocker is `source_safety_checker_failed_to_reject_approved_artifact_hash_mismatch`.

The real reconstructed candidate still passed the frozen Action 492 bindings:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Candidate file count: `31`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Added runtime path: `lib/pure-confidence-calibration.ts`
- Added runtime path hash: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`
- Canonical preview flag: `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

No candidate source defect was proven. The failure came from a negative test fixture using an otherwise approved path with deliberately incorrect content/hash evidence. An approved path alone must not authorize altered contents.

## Hash Binding

For any approved candidate artifact with a frozen expected SHA-256, Action 500 remediation must enforce this order:

1. exact path match
2. exact candidate membership
3. expected hash exists
4. compute bounded actual SHA-256
5. compare actual versus expected
6. reject immediately on mismatch
7. only after hash match evaluate provenance, classification and bounded schema

Hash mismatch must produce `source_safety_aborted_artifact_mismatch`. The checker must not continue into advisory or schema acceptance after a mismatch. Schema, provenance, classification, and filename approval cannot override `hash_mismatch`.

Hash result vocabulary is frozen to `hash_match`, `hash_mismatch`, `expected_hash_missing`, `hash_not_required_by_frozen_policy`, and `hash_verification_failed`.

## Null-Hash Exception

The only approved null-hash treatment is the historical Action 492 exception:

- Path: `docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json`
- Classification: `static_inventory`
- Provenance: `historical_30_file_overlay_action_473`
- Source classification: `historical_30_file_overlay`
- Policy: `action_492_retained_one_historical_30_file_overlay_static_inventory_null_hash_exception`

This exception is not generalized. Any other null-hash artifact, wrong-path use, invented exception, or missing required expected hash must block.

## Preserved Policies

Action 497 source-safety precedence remains intact:

- filename-sensitive words remain advisory when content and bounded hash are correct;
- ordinary whitespace is not secret evidence;
- Git whitespace checking remains source-integrity scope;
- `.env*`, `.npmrc`, private keys, PEM stores and credential exports remain fail closed;
- unknown sensitive-looking files remain fail closed;
- raw source contents and raw secret values are never recorded.

## Corrected Matrix Boundary

The next remediation must make these negative cases block:

- approved path with wrong hash;
- approved path with missing required expected hash;
- correct schema but wrong hash;
- correct provenance but wrong hash;
- correct classification but wrong hash;
- swapped contents between approved paths;
- one-byte mutation;
- wrong line endings where byte hash differs;
- newly invented null-hash exception;
- null-hash exception used by another path;
- unknown sensitive file;
- prohibited credential or environment file.

The original Action 498 wrong-hash case passes only when it is rejected with `source_safety_aborted_artifact_mismatch` and `hash_mismatch`.

## Action 500 Boundary

Action 500 is approved to perform exactly one future rehearsal retry after the wrong-hash rejection remediation. It must follow:

1. safe temp path
2. exact candidate reconstruction, runtime closure, source inventory, direct candidate hash verification, source integrity and strict hash-bound source safety
3. semantic preview-flag verification
4. dependency materialization
5. serial candidate commands, including the corrected source-safety matrix
6. mutation checks and cleanup
7. external evidence verification

No second attempt is authorized by this gate.

## Decision

Approval decision: `approved`

Unresolved conditions: none

Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

Next action: `action_500_runtime_complete_candidate_build_rehearsal_retry_after_wrong_hash_rejection_remediation`

This action is static and approval-gate-only. It ran no rehearsal, deployment, activation, network operation, dependency install, provider call, Supabase access, persistence, replay, confidence application, feedback loop, or downstream behavior change.
