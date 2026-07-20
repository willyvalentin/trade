# Action 535 - Action 534 Historical Candidate Inventory Hash-Exception Remediation

Action 535 is static and remediation-only. It does not execute Action 534, reconstruct the candidate, run `npm run build`, run Webpack, rehearse, deploy, activate preview, call providers, access Supabase, persist replay data, apply confidence, create feedback, or change downstream behavior.

## Action 534 Abort

The operator executed Action 534 once in the approved unrestricted macOS Terminal boundary. The result was:

- candidate rehearsal: `external_terminal_candidate_rehearsal_aborted`
- authoritative build attempts: 0
- Webpack attempts: 0
- build performed: false
- cleanup: passed
- deployment: false
- activation: false
- runtime preview: `runtime_preview_waiting_for_operator_inputs`

The exact blocker was:

`candidate_hash_mismatch:docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json`

## Root Cause

Action 534 treated the Action 465 inventory entry as a normal SHA-256-bound file. In the frozen Action 518 candidate inventory, that exact entry intentionally has `sha256: null` as a historical, path-specific null-hash exception.

The selected blocker classification is:

`action_534_historical_null_hash_exception_not_applied`

## Exact Exception Semantics

Only this path may use the exception:

`docs/action-465-confidence-calibration-recommendation-advisory-projection-preview-candidate-inventory.json`

The exception requires:

- exact repository-relative path
- `sha256: null`
- classification `static_inventory`
- provenance `historical_30_file_overlay_action_473`
- source classification `historical_30_file_overlay`
- content schema `action_465_candidate_inventory_v1`
- no symlink substitution
- no duplicate path
- no alternate path spelling

The exception does not mean skip validation. It accepts only the frozen Action 465 inventory artifact with the expected metadata and schema.

## Strict Normal Hash Policy

All other candidate files remain strict:

- exact SHA-256 is mandatory
- wrong hash blocks
- missing hash blocks
- null hash blocks
- schema cannot override a normal hash mismatch
- provenance cannot override a normal hash mismatch
- classification cannot override a normal hash mismatch

## Candidate Preservation

Action 535 does not change the candidate:

- clean base remains `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- change-candidate hash remains `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- full-candidate inventory hash remains `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- candidate file count remains 32
- route hash remains `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`

## Retry Authorization

The first Action 534 attempt remains historical and consumed. Action 535 grants operator retry authorization for at most one retry with the same command:

```bash
node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs
```

The retry must still run in macOS Terminal.app from `/Users/willysimonsson/Dev/trade`, with hidden public-value input and no CLI arguments.

## Result

Remediation result:

`action_534_historical_hash_exception_remediation_completed`

Next action:

`action_534_external_terminal_candidate_rehearsal_operator_retry_after_historical_hash_exception_remediation`
