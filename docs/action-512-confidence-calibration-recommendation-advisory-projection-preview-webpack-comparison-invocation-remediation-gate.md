# Action 512: Webpack Comparison Invocation Remediation Gate

Action 512 is a static approval gate for the Action 511 invocation failure. It performs no build, comparison, rehearsal, deployment, activation, install, provider call, Supabase access, persistence, replay, confidence application, feedback write, or downstream behavior change.

## Action 511 Result

- Diagnostic command: `next build --webpack`
- Diagnostic attempt count: `1`
- Authoritative build attempt count: `0`
- Exit code: `127`
- Process result: `next_command_spawned_invocation_failed_before_webpack_compilation`
- Sanitized diagnostic: `env: node: No such file or directory`
- Webpack compilation started: `false`
- Candidate source implicated: `false`
- Implicated paths: none
- Candidate defect status: `candidate_defect_not_proven`
- Candidate hash impact: `candidate_hash_change_not_required`
- Cleanup result: `cleanup_passed`

## Blocker Classification

- Blocker classification: `webpack_comparison_child_process_node_runtime_not_resolved`
- Invocation failure cause: `diagnostic_child_process_path_sanitized_too_aggressively`

The command process began and the launcher resolved, but the child process could not resolve `node`. Webpack compilation did not begin, so this does not prove a candidate source defect, a Next.js configuration defect, a dependency compile defect, a Webpack compile defect, or an `app/globals.css` defect.

## Candidate Bindings

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Candidate file count: `31`
- Added runtime path: `lib/pure-confidence-calibration.ts`
- Added runtime path hash: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`
- Preview flag state: `absent_or_disabled`

## Runtime Availability

- Current process Node runtime: `present`
- Current process Node version classification: `node_26_x`
- Local Next CLI: `present`
- Candidate-local Next CLI: `present`
- Candidate `node_modules` Next CLI: `present`
- Next version classification: `16.2.6`
- Source dependency tree Node runtime dependency: `not_applicable`

No absolute executable paths, raw PATH values, full environment listings, usernames, shell profile contents, or unrelated environment values are retained.

## Approved Invocation Model

- Approved invocation model: `ephemeral_allowlisted_runtime_path_propagation`
- Permitted alternative: `direct_local_node_cli_invocation`
- Runtime path policy: `process_scoped_ephemeral_allowlisted_runtime_path_only`
- Candidate-local CLI required: `true`

The future invocation must use the already installed local Node runtime and the candidate-local Next.js CLI from the materialized candidate dependency tree. It must preserve the exact semantic command `next build --webpack` with arguments `build --webpack`.

The future invocation must not use a global Next.js CLI, `npx`, another Node version, another Next.js version, a shell-profile-dependent alias, a checked-in wrapper, a package script change, or a persistent PATH update.

## Ephemeral Environment Policy

- PATH classification: `ephemeral_runtime_path_supplied`
- Canonical preview flag: `absent_or_disabled`
- NODE_ENV: `existing_build_contract`
- HOME-dependent package resolution: `not_required_or_safely_bounded`
- Network credential variables: `not_propagated_where_avoidable`
- Raw PATH recorded: `false`
- Full environment enumerated: `false`
- Environment persisted: `false`
- Environment restored: `true`

## Action 513 Prechecks

Before any retry, Action 513 must verify without starting the build:

- Node runtime resolves in the proposed child environment.
- Node version classification matches the parent runtime.
- Candidate-local Next CLI resolves.
- Next version classification matches `16.2.6`.
- Candidate-local CLI accepts the frozen Webpack option.
- No network is required.
- No candidate, package, lockfile, package-script, or configuration file changes are required.

The precheck may retain only bounded classifications and sanitized evidence. It must not retain raw paths, raw command output, credentials, full logs, full environment listings, or source excerpts.

## Attempt Boundary

- Diagnostic retry limit: `1`
- Authoritative build authorized: `false`
- Authoritative build attempt limit: `0`
- Full rehearsal authorized: `false`
- Same-action retry authorized: `false`
- Deployment authorized: `false`
- Activation authorized: `false`

The previous Action 511 attempt remains historical and consumed.

## Blocking Rules

Action 513 must remain blocked if it discovers that any of these are required:

- Installing Node or Next.js.
- Using a global Next.js CLI.
- Using another framework version.
- Modifying package scripts.
- Modifying candidate source, package files, lockfiles, Next config, or persistent environment configuration.
- Recording raw PATH or full environment values.
- Calling the network.

## Decision

- Invocation readiness: `webpack_invocation_remediation_ready_with_conditions`
- Approval decision: `approved_with_conditions`
- Unresolved condition: `action_513_must_confirm_child_runtime_resolution_without_starting_build_or_recording_raw_path`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- Next action: `action_513_webpack_invocation_runtime_precheck_completion_gate`

This gate does not deploy and does not activate the preview.
