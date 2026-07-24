# Action 536 - Action 534 Command Boundary Remediation

Action 536 is a static Action 534 runner audit and command-boundary remediation. It does not execute Action 534, reconstruct the candidate, run a build, run a rehearsal, deploy, activate preview, call providers, access Supabase, persist data, replay, apply confidence, or create feedback.

## Latest Action 534 Result

The latest operator run of Action 534 ended as `external_terminal_candidate_rehearsal_failed` before the authoritative build. It reconstructed the exact candidate, completed runtime dependency closure, passed source integrity, passed source safety, verified the preview flag was disabled, materialized dependencies, passed `npx next typegen`, passed `npx tsc --noEmit`, performed zero authoritative build attempts, cleaned up successfully, and did not deploy or activate preview.

The failure was caused by two external evidence verifiers being executed as candidate-internal prebuild commands:

- `scripts/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-reconstruction-and-hash-freeze-verify.mjs`
- `scripts/action-532-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-evidence-acceptance-gate-verify.mjs`

Both files are absent from the frozen 32-file candidate inventory. Their correct classification is `external_control_required_after_cleanup`.

## Root Cause

The Action 534 runner mixed two command boundaries. Candidate-internal commands should run only inside the isolated candidate and should depend only on candidate-contained files or standard local tooling. Action 518 and Action 532 verifiers are repo-level control/evidence verifiers. They are not runtime/build-required candidate files, and their absence from the candidate should not block transition to `npm run build`.

The bounded blocker classification is:

`action_534_external_control_verifiers_misassigned_as_candidate_internal_prebuild_commands`

## Remediation

The Action 534 runner now separates:

- `candidate_internal_required`: runner-owned candidate checks, semantic preview flag matrix, `npx next typegen`, `npx tsc --noEmit`, and authoritative `npm run build`.
- `external_control_required_after_cleanup`: Action 518, Action 532, Action 533, Action 535, Action 536, and the Action 534 result verifier as external evidence controls.

External controls do not count as candidate commands and cannot establish readiness without a successful authoritative candidate build.

## Attempt Accounting

The historical operator attempt count is frozen as `2`:

- Attempt 1: historical Action 534 abort before build from the Action 465 null-hash exception.
- Attempt 2: latest Action 534 failed before build because external controls were misassigned as candidate-internal commands.

The next authorized operator attempt number is `3`.

The next attempt must record:

- `prior_attempt_result`: `external_terminal_candidate_rehearsal_failed`
- `prior_attempt_blocker`: `candidate_internal_external_control_boundary_defect`
- `historical_operator_attempt_count`: `2`

## Candidate Preservation

The candidate remains unchanged:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Change-candidate hash: `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- Full-candidate inventory hash: `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- Candidate file count: `32`
- Remediated route hash: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`

Candidate change required: `false`

Candidate hash change required: `false`

## Retry

One future operator retry is authorized after this command-boundary remediation:

```bash
node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs
```

No command arguments are authorized.

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.
