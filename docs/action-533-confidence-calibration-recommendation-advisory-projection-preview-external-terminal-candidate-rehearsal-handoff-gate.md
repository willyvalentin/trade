# Action 533 - External Terminal Candidate Rehearsal Handoff Approval Gate

Action 533 is a static handoff gate. It creates and verifies the Action 534 operator-run candidate rehearsal script, but it does not execute that script, reconstruct the candidate, run `npm run build`, run Webpack, rehearse, deploy, activate preview behavior, call providers, access Supabase, persist replay data, apply confidence, create feedback, or change downstream behavior.

## Action 532 Approval

Action 532 accepted the Action 529 external Terminal precheck evidence:

- evidence acceptance: `external_terminal_runner_evidence_accepted`
- rehearsal environment: `external_terminal_candidate_rehearsal_environment_ready`
- approval: `approved`
- unresolved conditions: none
- execution boundary: `operator_unrestricted_local_terminal`
- runtime preview: `runtime_preview_waiting_for_operator_inputs`

## Candidate Binding

Action 534 must bind the unchanged Action 518 candidate:

- clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- change-candidate hash: `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- full-candidate inventory hash: `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- file count: 32
- route: `app/api/recommendations/evaluate-outcomes/route.ts`
- route hash: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`
- route export surface: `POST`

## Operator Command

The future operator command is exactly:

```bash
node scripts/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal.mjs
```

The command must be run once from `/Users/willysimonsson/Dev/trade` in macOS Terminal.app. It must not be run from VS Code integrated Terminal, Codex, or with CLI arguments.

## Public Input Policy

Action 534 prompts interactively for exactly:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The prompts reuse Action 531's raw-mode hidden input implementation. Values are accepted only from TTY stdin, are not echoed, are not accepted as CLI arguments, are not read from `.env`, are not written to shell profiles, are not hashed, and are discarded before exit.

## Rehearsal Boundary

Action 534 uses a single trusted temp subtree:

`<canonical-system-temp>/ture/action-534-confidence-calibration-projection-preview-external-terminal-candidate-rehearsal/`

It applies the Action 521/522/529/530 path-safety semantics: trusted temp root, `/var` and `/private/var` equivalence, path-relative containment, traversal and prefix rejection, parent and target symlink rejection, forbidden-root separation, target absent-or-empty precondition, revalidation after creation, and bounded cleanup.

## Command Sequence

The operator-run script serializes the rehearsal:

1. Candidate integrity confirmation
2. Strict source-safety/hash matrix
3. Semantic preview-flag matrix
4. `npx next typegen`
5. `npx tsc --noEmit`
6. `npm run build` exactly once
7. Optional Webpack diagnostic only after authoritative build failure
8. Remaining runtime/lint/no-effect checks only after authoritative build success

Webpack diagnostic is diagnostic-only and cannot establish readiness.

## Result And Cleanup

Action 534 writes exactly:

`docs/action-534-confidence-calibration-recommendation-advisory-projection-preview-external-terminal-candidate-rehearsal-result.json`

The result must be bounded and sanitized. It must not retain public values, environment dumps, JWT-like values, Supabase URLs, credentials, HOME paths, usernames, absolute machine paths, raw temp paths, port values, socket paths, complete logs, source contents, recommendation data, or confidence data.

Cleanup removes only the Action 534 temp subtree and preserves the active worktree, source `node_modules`, `.netlify`, package files, configs, and preview-disabled state.

## Approval

Action 533 approves exactly one future Action 534 operator execution. It does not authorize deployment or preview activation.

The next action is:

`action_534_external_terminal_candidate_rehearsal_operator_execution`
