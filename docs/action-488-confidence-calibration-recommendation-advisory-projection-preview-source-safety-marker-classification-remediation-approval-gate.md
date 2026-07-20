# Action 488: Source Safety Marker Classification Remediation Approval Gate

Action 488 is a static approval gate for the Action 487 source-safety marker abort. It does not run a rehearsal, copy dependencies, deploy, activate preview behavior, call providers, write persistence, replay, inspect credential stores, or modify runtime behavior.

Approval decision: `approved`

Next action: `action_489_full_candidate_build_rehearsal_retry_after_source_safety_remediation`

Runtime-preview state: `runtime_preview_waiting_for_operator_inputs`

## Action 487 Abort

Action 487 executed exactly one local full-candidate rehearsal attempt.

- Rehearsal decision: `full_candidate_rehearsal_aborted`
- Path safety: `passed`
- macOS canonical temp alias handling: `passed`
- Source candidate reconstruction: `passed`
- Source inventory: `passed`
- Missing source files: `0`
- Unexpected source files: `0`
- Source-only Git integrity: `not_started`
- Dependency materialization: `not_started`
- Serial commands started: `0`
- Cleanup: `completed`
- Deployment: `false`
- Activation: `false`

## Root Cause

Root-cause classification:

`source_safety_marker_filename_false_positive_for_bounded_inventory_artifact`

The flagged file was part of the approved bounded Action artifact inventory. The source inventory matched, there were zero unexpected source files, no actual credential value was detected, and the candidate itself was not shown defective. The abort happened before dependency materialization and before any serial build/test command.

## Filename False-Positive Distinction

Filename indicators such as `secret`, `credential`, `token`, `environment`, and `auth` are advisory only.

They are not sufficient by themselves to reject an approved bounded artifact when:

- the exact repository-relative path is approved;
- the exact Action provenance is known;
- the exact classification is approved;
- the expected content hash is frozen, or an approved bounded schema is present;
- no credential value is present;
- the file is not an environment/config secret file;
- the file is not copied from HOME/config or a credential store.

Exact prohibited path/type indicators remain authoritative.

## Prohibited File Policy

Action 489 must always reject:

- `.env`
- `.env.*`
- `.npmrc` copied into the candidate
- credential files
- private-key files
- PEM/key stores
- Netlify auth/config credential stores
- secret-bearing deployment files
- files containing tokens or passwords by approved bounded detection

These files remain fail-closed even if their path appears near approved artifacts.

## Exact Approved-Artifact Policy

Only exact approved artifact paths from the frozen candidate inventory may pass the filename-safety phase.

Every allowed artifact must retain:

- exact repository-relative path;
- exact Action provenance;
- exact classification;
- expected content hash where frozen;
- approved bounded schema where applicable.

No wildcard approval such as `**/*secret*`, directory-wide docs approval, arbitrary JSON approval, HOME/config approval, `.netlify/` approval, `.env*` approval, `.npmrc` approval, credential-store approval, or newly discovered similarly named file approval is permitted.

## Schema And Content Boundary

For approved bounded JSON/Markdown artifacts, Action 489 may verify only safe structural facts required to prove the artifact is not a credential store.

Permitted checks include:

- valid JSON where expected;
- expected top-level schema fields;
- `credential_value_recorded: false`;
- no known secret-value field;
- no environment variable value payload;
- no token/password/private-key field;
- no suspicious high-entropy credential field when a bounded detector is approved.

Action 489 must not print full contents, store detected secret values, hash or reproduce credentials, scan external credential stores, or inspect Netlify global auth files.

If a possible secret value is detected, the rehearsal must return `full_candidate_rehearsal_aborted` with no raw value recorded.

## Unknown-File Behavior

Unknown sensitive-looking files remain fail-closed.

Reject:

- unknown credential JSON;
- unknown sensitive filename;
- approved-looking filename with mismatched hash;
- approved schema containing a secret-value field;
- newly added sensitive-looking artifact not in the inventory;
- any sensitive-looking file outside the approved inventory.

## Candidate Policy Preservation

Action 488 does not alter:

- clean base `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`;
- approved 30-file change candidate `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`;
- full-candidate inventory `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`;
- `baseline_plus_overlay_manifest_integrity`;
- Action 486 temp-path procedure;
- Action 482 dependency procedure;
- `temporary_verified_node_modules_copy`.

The remediation changes only the source-safety classification logic used during the next rehearsal.

## Action 489 Order

Action 489 must retain:

1. Phase 0: safe canonical temp-path validation.
2. Phase 1: clean-base reconstruction, exact overlay, direct hash checks, bounded source inventory, remediated source-safety classification, source-only Git integrity.
3. Phase 2: temporary verified `node_modules` copy and exclusion of five known extraneous packages.
4. Phase 3: serial build/test suite.
5. Phase 4: post-command integrity and cleanup.

No dependency copying or command execution may occur before source-safety checks pass.

## Result Vocabulary

Action 489 source-safety result vocabulary:

- `source_safety_passed`
- `source_safety_aborted_secret_detected`
- `source_safety_aborted_unknown_sensitive_file`
- `source_safety_aborted_artifact_mismatch`
- `source_safety_failed`

Raw secret values must never be recorded.

## Test Matrix

Future tests must accept exact bounded artifacts only:

- documentation describing secrets;
- credential-policy approval record;
- environment-prohibition documentation;
- test file named around token rejection;
- bounded JSON with `credential_value_recorded: false`.

Future tests must reject:

- `.env`;
- `.env.local`;
- `.npmrc`;
- unknown credential JSON;
- private-key extensions;
- PEM content classification;
- token file;
- unknown sensitive filename;
- approved path with wrong hash;
- approved schema with secret-value field;
- newly added sensitive-looking artifact not in inventory.

Future tests must also prove filename-only false positives no longer abort, content-based secret detection still aborts, no raw value appears in records, and unknown files remain fail-closed.

## Safety Outcome

Rehearsal performed: `false`

Deployment authorized: `false`

Activation authorized: `false`

Preview flag enabled: `false`

Network/install/update: `false`

Persistence/replay/provider/Supabase/confidence/feedback/downstream effects: `false`
