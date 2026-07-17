# Action 537 - Action 534 Runner Remediation Application Audit

Action 537 is a static runner-version and code-path audit. It does not execute Action 534, does not run a build, does not deploy, does not activate preview behavior, does not call providers, does not access Supabase, and does not persist replay, feedback, confidence, or recommendation changes.

## Observed Behavior

The operator-reported Action 534 execution after Action 536 still looked like the old runner path:

- operator attempt: `1`
- authoritative build attempts: `0`
- Action 518 verifier still ran candidate-internal
- Action 532 verifier still ran candidate-internal
- no external-control result section
- build was not started

That behavior is classified as:

`action_536_remediation_not_reflected_in_operator_executed_action_534_behavior`

The current local result file now shows a later un-fingerprinted Action 536-style result: operator attempt `3`, historical attempts `2`, authoritative build attempted once and failed, webpack diagnostic passed, and external controls ran after cleanup. Because that result has no runner fingerprint or contract version, Action 537 treats result freshness as `result_freshness_ambiguous` rather than accepting it as proof of the corrected runner.

## Runtime Audit

The active Action 534 runner path now has exactly one active runtime source for each behavior:

- `runSerialCommands` owns candidate-internal prebuild commands and the transition to `npm run build`.
- `runExternalControlCommands` owns Action 518, 532, 533, 535, and 536 verifier execution after cleanup.
- `deriveAttemptMetadata` owns attempt-number and prior-attempt metadata.
- `writeResult` owns result replacement using a temporary sibling file and atomic rename.

`commandInventory` remains as a result-schema reference only. It is not the active runtime command executor.

## Corrected Command Boundary

Candidate-internal prebuild execution is limited to:

- runner-owned candidate integrity confirmation
- runner-owned source-safety/hash matrix
- semantic preview flag matrix
- `npx next typegen`
- `npx tsc --noEmit`

The runner must not execute Action 518, Action 532, Action 533, Action 535, Action 536, or later control artifacts inside the temporary candidate. Those controls are external-only and run after candidate cleanup.

After the genuine prebuild checks pass, the active runtime path proceeds directly to:

`npm run build`

No external verifier is allowed between TypeScript validation and the authoritative build transition.

## Fingerprint And Atomic Result Policy

Future Action 534 results must include:

- `runner_contract_version: action_537_action_534_runner_contract_v1`
- `runner_script_sha256`
- `result_written_at_classification`
- `operator_rehearsal_attempt_number`
- `historical_operator_attempt_count`
- `prior_attempt_result`
- `prior_attempt_blocker`

The result verifier now requires the exact current runner script hash for future remediated completed results. Action 537 also changes result writing so the runner creates a fresh result object, validates JSON serialization, writes a temporary sibling file, and atomically renames it over the canonical result path. Prior command results must not survive by object merge or stale file reuse.

## Attempt Accounting

Action 537 freezes the next operator attempt as `4`:

- historical operator attempt 1: aborted on the Action 465 historical candidate inventory hash exception
- historical operator attempt 2: failed because external controls were executed inside the candidate
- later local operator event: un-fingerprinted attempt 3 result exists, but freshness is ambiguous without script hash binding

The next retry is authorized once, and only through:

```bash
node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs
```

That future result must carry the Action 537 runner contract and current script hash before it can be accepted as a corrected execution.

## Safety

Action 537 changed no candidate files, no candidate hash, no package or configuration files, no scanner behavior, no ranking behavior, no visible recommendation behavior, no Add Trade path, and no broker/execution/risk path. Runtime preview remains:

`runtime_preview_waiting_for_operator_inputs`
