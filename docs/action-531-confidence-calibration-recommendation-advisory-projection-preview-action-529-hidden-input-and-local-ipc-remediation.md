# Action 531: Action 529 Hidden Input And Local IPC Remediation

Action 531 is a static script-audit and remediation gate. It does not execute Action 529, reconstruct the candidate, run Webpack, run `npm run build`, rehearse, deploy, activate preview behavior, install packages, call network targets, access Supabase, call providers, persist data, replay anything, apply confidence, create feedback, or change downstream behavior.

## Historical Action 529 Result

The operator retried Action 529 from macOS Terminal after Action 530. The generated result at `docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json` is retained as historical blocked evidence.

Bounded result:

- Execution boundary: `operator_unrestricted_local_terminal`
- Public build signals: present with `valid_shape`
- Child process: `passed`
- Loopback: `passed`
- Ephemeral port: `passed`
- Local IPC: `failed`
- Temp/output: `passed`
- File descriptor capacity: `sufficient`
- Process resource capacity: `sufficient`
- Cleanup: `passed`
- External network used: `false`
- Supabase accessed: `false`
- Provider called: `false`
- Candidate reconstructed: `false`
- Build/rehearsal/deployment/activation: `false`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

The result JSON did not retain raw public values or value hashes.

## Visible Input Defect

Input blocker:

`action_529_interactive_public_value_input_echoed`

The prior implementation used `readline/promises` and attempted to suppress echo by overriding `stdout.write`. That did not disable terminal line-discipline echo, so pasted or typed public input could still appear visibly in the operator Terminal after the prompt label.

The affected value is a public client-side build input, not a server-only secret, but it should still not be unnecessarily echoed, passed on the command line, written to files, hashed, or retained in evidence.

## Hidden Input Remediation

The Action 529 script now uses a bounded raw-mode reader:

- requires TTY stdin and stdout for real operator execution;
- prints only the prompt label;
- calls `stdin.setRawMode(true)` before reading;
- consumes `data` events directly;
- supports pasted input;
- completes on Enter;
- handles backspace without echoing characters;
- rejects empty input;
- keeps values in process memory only;
- never writes input values to stdout or stderr;
- never includes input values in errors;
- restores terminal raw mode immediately after completion or failure.

No package dependency was added.

## Terminal Restoration

Terminal restoration is guarded for:

- normal completion;
- empty-input rejection;
- bounded shape rejection;
- capability-check failure;
- `SIGINT`;
- `SIGTERM`;
- uncaught exception;
- unhandled rejection.

The restoration handle records only the previous raw-mode state, not terminal contents or input values.

## IPC Audit

IPC blocker:

`action_529_unix_domain_socket_path_length_or_shape_defect`

The prior IPC probe used a Unix domain socket path beneath the long Action 529 temp subtree and only tested `listen`. It did not perform a client-connect check, did not capture a bounded error class, and did not distinguish path length/shape from genuine IPC unavailability.

Bounded classification:

- IPC mechanism: `unix_domain_socket`
- Failure phase: `listen`
- Error classification: `path_too_long`
- Cleanup result: historical cleanup passed, but without detailed IPC error evidence
- Raw socket path retained: `false`

The script now uses a shorter bounded socket filename under the canonical trusted temp hierarchy, removes stale sockets after safe-path validation, performs listen plus client-connect, closes server/client, unlinks the socket, applies a bounded timeout, and records bounded error classifications only.

## Turbopack IPC Requirement

Requirement classification:

`local_ipc_not_proven_required_for_authoritative_turbopack_build`

The retained Action 522 and Action 523 evidence identifies the authoritative Turbopack blocker as a worker process or port-binding resource issue. It does not prove that a Unix domain socket probe must pass for the authoritative build. Successful loopback and ephemeral-port evidence remains separate and preserved.

If the remediated Unix socket probe still cannot pass on a future operator retry, Action 529 may record `platform_not_required` for `local_ipc_capability` while preserving the actual bounded IPC diagnostic separately.

## Preserved Evidence

Action 531 preserves the successful Action 529 evidence:

- public signal presence and safe shape;
- child process spawn;
- loopback;
- ephemeral port;
- temp/output;
- file descriptor and process-resource capacity;
- cleanup;
- no external network;
- no Supabase/provider access.

## Result Schema And Verifier

The Action 529 result schema is additively updated for the next operator retry:

- `operator_attempt_number: 2`
- `prior_attempt_result: external_terminal_runner_precheck_blocked`
- `input_echo_suppressed: true`
- terminal restoration classification
- bounded local IPC diagnostic

The Action 529 result verifier was updated to accept those fields while continuing to reject raw values, value hashes, environment persistence, external network use, Supabase/provider access, build, reconstruction, rehearsal, deployment and activation.

## Retry Policy

Operator retry authorized: `true`

Operator retry limit: `1`

Exact next manual command:

```bash
node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs
```

Action 531 does not execute the retry.

## Authorization

Build performed: `false`

Candidate reconstructed: `false`

Rehearsal performed: `false`

Deployment performed: `false`

Preview activated: `false`

Remediation result:

`action_529_hidden_input_and_ipc_remediation_completed_with_nonblocking_ipc_condition`

Runtime preview state:

`runtime_preview_waiting_for_operator_inputs`

Next action:

`action_529_external_terminal_runner_precheck_operator_retry_after_hidden_input_and_ipc_remediation`
