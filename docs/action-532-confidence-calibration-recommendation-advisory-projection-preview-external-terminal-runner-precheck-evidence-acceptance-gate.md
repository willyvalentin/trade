# Action 532 - External Terminal Runner Precheck Evidence Acceptance Gate

Action 532 accepts the remediated Action 529 external Terminal runner precheck evidence. It is static and evidence-only: it does not execute Action 529, reconstruct the candidate, run a build, rehearse, deploy, activate preview, call a provider, access Supabase, persist replay data, apply confidence calibration, or write feedback.

## Historical Attempts

Action 529 first produced blocked evidence in an unrestricted macOS Terminal. The blocked attempt proved useful runner capabilities, but it also exposed three blockers:

- trusted temp canonicalization misclassified equivalent system temp paths;
- public input collection could allow terminal echo of operator-supplied public build signals;
- local Unix-domain-socket IPC failed during the IPC probe.

Actions 530 and 531 remediated those issues. The second operator attempt is now bound through:

`docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json`

The accepted result has schema `action_529_external_terminal_runner_precheck_result_v1`, source action `528`, execution boundary `operator_unrestricted_local_terminal`, operator attempt `2`, prior attempt `external_terminal_runner_precheck_blocked`, and current result `external_terminal_runner_precheck_passed`.

## Public Signal Safety

The result contains exactly two public build-signal entries:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Both are recorded only as present with valid shape and `value_recorded=false`. The acceptance gate rejects raw values, hashes, prefixes, suffixes, host details, token segments, query-bearing URLs, server-only secrets, and additional build-signal entries.

Server-only Supabase secrets are not required for the future candidate rehearsal.

## Hidden Input And Restoration

The accepted evidence requires `input_echo_suppressed=true` and terminal restoration value `raw_mode_restored_on_completion_error_and_interruption`.

This binds Action 531's remediation: the public values are prompted in raw mode, never printed, never accepted from CLI arguments, never written to env files or shell profiles, and never retained in result JSON or hashes.

## Runner Capability Evidence

The second Action 529 result is accepted only when every runner capability is unambiguous:

- child process spawn: passed
- loopback binding: passed
- ephemeral port binding: passed
- local IPC capability: passed
- local IPC test result: passed
- temp output capability: passed
- file descriptor capacity: sufficient
- process resource capacity: sufficient
- cleanup result: passed

## IPC Evidence

The IPC mechanism is `unix_domain_socket`. The accepted diagnostic requires:

- failure phase: none
- error classification: none
- cleanup result: passed
- raw socket path recorded: false
- required by authoritative build: false
- requirement classification: `local_ipc_not_proven_required_for_authoritative_turbopack_build`

The passing IPC probe is positive environment evidence. It does not claim that IPC is required by the authoritative Turbopack build.

## Result Safety Scan

Action 532 statically scans the Action 529 result for raw values and local machine details. The expected key names are allowed, but JWT-like token bodies, raw URL values, Supabase hostnames, bearer material, credential assignments, query-bearing URLs, HOME paths, usernames, absolute machine paths, socket paths, and concrete port values are rejected.

The accepted status is `result_content_safety_passed`.

## Action 529 Result Verifier

Action 532 runs only the static Action 529 result verifier:

`node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs`

That verifier reads the existing result and performs no operator prompt, capability check, external networking, build, reconstruction, rehearsal, deployment, or activation.

## Candidate Preservation

Action 532 binds the unchanged Action 518 candidate:

- clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- change-candidate hash: `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- full-candidate inventory hash: `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- candidate file count: 32
- remediated route: `app/api/recommendations/evaluate-outcomes/route.ts`
- route hash: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`
- route export surface: `POST`

No candidate, package, lockfile, or configuration change is required.

## Acceptance Decision

The evidence result is `external_terminal_runner_evidence_accepted`.

The rehearsal environment readiness is `external_terminal_candidate_rehearsal_environment_ready`.

The approval decision is `approved`, with no unresolved conditions.

This approves exactly one future operator-run rehearsal package in the same external Terminal boundary. It does not authorize an ad hoc terminal build command.

## Runtime Preview State

Runtime preview remains:

`runtime_preview_waiting_for_operator_inputs`

## Next Action

The recommended next action is:

`action_533_external_terminal_candidate_rehearsal_handoff_gate`

Action 533 should remain static and create a controlled Action 534 operator-run rehearsal script. Action 532 does not run that rehearsal.
