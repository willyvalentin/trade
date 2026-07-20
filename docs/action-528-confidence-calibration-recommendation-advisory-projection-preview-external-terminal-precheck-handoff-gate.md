# Action 528: External Terminal Precheck Handoff Gate

Action 528 creates a static handoff package for an operator-run local-terminal precheck. It does not execute that precheck, reconstruct the candidate, run `npm run build`, invoke Next.js, run Webpack, rehearse, deploy, activate preview behavior, call external network targets, install packages, access Supabase, call providers, persist data, replay anything, apply confidence, create feedback, or change downstream behavior.

## Action 527 Result

Action 527 attempted the alternate-runner precheck from the Codex/VS Code execution process and remained blocked:

- `NEXT_PUBLIC_SUPABASE_URL`: absent from the Codex parent process
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: absent from the Codex parent process
- Child process: passed
- Temp/output operations: passed
- Loopback: failed
- Ephemeral port: failed
- Local IPC/socket: failed
- Public environment: `public_build_environment_blocked`
- Alternate runner: `alternate_runner_capability_blocked`
- Overall readiness: `candidate_rehearsal_environment_blocked`
- Approval: `blocked`
- Cleanup: `passed`

## Blocker

Frozen blocker classification:

`codex_hosted_runner_not_equivalent_to_approved_unrestricted_local_terminal_boundary`

Recorded facts:

- Operator environment input attempted: `true`
- Codex process detected input: `false`
- Codex loopback capability: `restricted`
- Codex ephemeral-port capability: `restricted`
- Codex IPC capability: `restricted`
- Candidate defect proven: `false`
- Candidate hash change required: `false`

## Candidate Binding

The Action 518 candidate remains authoritative and unchanged:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Change candidate hash: `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- Full candidate inventory hash: `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- Candidate file count: `32`
- Remediated route: `app/api/recommendations/evaluate-outcomes/route.ts`
- Route SHA-256: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`
- Route export surface: `POST`

## Operator Handoff

Operator boundary:

`operator_unrestricted_local_terminal`

Script path:

`scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs`

Sanitized result path:

`docs/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result.json`

Result verifier:

`scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck-result-verify.mjs`

Exact future operator command:

```bash
node scripts/action-529-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-runner-precheck.mjs
```

The operator must run this from `/Users/willysimonsson/Dev/trade` in macOS Terminal, not from Codex and not from VS Code's integrated terminal. The operator must not add command-line arguments and must not paste public values into chat.

## Input Policy

The Action 529 script prompts interactively for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

It rejects non-interactive stdin, CLI value arguments, empty values, and invalid bounded public URL shape. Values remain process-scoped and are not written to `.env` files, shell profiles, documentation, source files, evidence records, or command history.

## Capability Checks

The operator script checks:

- child-process spawn
- loopback bind
- OS-assigned ephemeral port
- local loopback connection
- local IPC/socket or platform-equivalent capability
- trusted temp directory creation
- file write/read
- nested output creation
- rename
- deletion
- cleanup
- process and file-descriptor capacity classification

No external interface or external network is used.

## Sanitized Result

The Action 529 result may include only bounded classifications. It must not include raw values, lengths, prefixes, suffixes, domains, token segments, hashes, or decoded data.

Action 528 does not create the Action 529 result. Action 530 must verify the generated result before any rehearsal can be authorized.

## Authorization

Action 529 script executed by Action 528: `false`

Action 529 result exists now: `false`

Precheck execution authorized by Action 528: `false`

Build authorized: `false`

Rehearsal authorized: `false`

Deployment authorized: `false`

Activation authorized: `false`

Approval decision:

`approved`

Runtime preview state:

`runtime_preview_waiting_for_operator_inputs`

Recommended next action:

`action_529_external_terminal_runner_precheck_operator_execution`
