# Action 507: Turbopack Comparison Invocation Completion Gate

Action 507 completed a local tooling inspection gate for the Turbopack comparison path. It did not run `npm run build`, did not run `next build --webpack`, did not run a rehearsal, and did not deploy or activate the runtime preview.

## Action 506 Result

- Approval decision: `approved_with_conditions`
- Comparison readiness: `turbopack_comparison_ready_with_conditions`
- Rehearsal readiness: `runner_remediated_rehearsal_ready_with_conditions`
- Authoritative build command: `npm run build`
- Comparison can establish deployment readiness: `false`
- Authoritative build required for readiness: `true`

## Local Tooling Inspection

- Installed Next tooling classification: `next_16_2_6_build_cli_supports_explicit_webpack_flag`
- Installed Next version classification: `next_16_2_6`
- Comparison invocation classification: `supported_non_turbopack_comparison_invocation`
- Comparison invocation supported: `true`
- Supported by installed tooling: `true`
- Comparison engine classification: `webpack_comparison_engine`

The bounded inspection used installed package metadata, the installed build CLI option parser, the installed bundler argument parser, existing package scripts, existing Next.js configuration, and lockfile metadata. It retained no full CLI help output and no raw command output.

## Exact Comparison Capability

- Executable classification: `installed_next_cli_from_same_candidate_dependency_tree`
- Argument list classification: `build_with_explicit_webpack_flag`
- Sanitized command form: `next build --webpack`
- Machine-specific executable path recorded: `false`
- Executed: `false`

The comparison invocation is supported by the installed Next.js CLI because the build command exposes an explicit `--webpack` option and the installed bundler parser treats `--webpack` as the non-Turbopack bundler selection. The project package script remains unchanged.

## Authoritative Build Policy

- Authoritative build command: `npm run build`
- Authoritative build classification: `authoritative_turbopack_build`
- Comparison purpose: `diagnostic_classification_only`
- Comparison establishes deployment readiness: `false`
- Authoritative build required for readiness: `true`

A comparison pass cannot substitute for an authoritative `npm run build` pass and cannot alter production build semantics.

## Invocation Restrictions

The comparison invocation requires no package-script, package-lock, configuration, dependency, candidate, network, install, or persistent environment mutation.

If a future run discovers that the comparison requires any of those changes, the comparison must be blocked rather than invented or patched into the candidate.

## Future Action 508 Sequence

1. Phase 0: safe Action-specific temp path.
2. Phase 1: exact 31-file reconstruction, runtime closure, source integrity/safety, and semantic flag verification.
3. Phase 2: dependency materialization.
4. Phase 3: run authoritative `npm run build` once.
5. Phase 4: only if the authoritative build fails with the same bounded Turbopack/process-resource classification, run `next build --webpack` once.
6. Phase 5: classify outcome.
7. Phase 6: cleanup and external evidence verification.

The comparison must not run first. If the authoritative build passes, the comparison is skipped.

## Attempt Accounting

- Authoritative attempt limit: `1`
- Comparison attempt limit: `1`
- Maximum build-process invocations: `2`
- Same-Action retry allowed: `false`
- Two authoritative builds allowed: `false`

## Outcome Mapping

- Authoritative build passes: `turbopack_passed_comparison_not_required`, comparison count `0`.
- Same resource failure and comparison passes: `turbopack_failed_comparison_passed`, likely Turbopack-specific runner interaction, deployment readiness `false`.
- Both fail: `turbopack_failed_comparison_failed`, compare sanitized error classes and phases.
- Authoritative failure is not reproduced: `turbopack_failure_not_reproduced`, requires nondeterminism assessment.
- Comparison invocation unavailable: `comparison_unavailable`.

## Candidate Preservation

Required unchanged:

- Candidate file count: `31`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- `app/globals.css`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- preview helper
- source `node_modules`
- active worktree

## Readiness And Approval

- Invocation readiness: `comparison_invocation_ready`
- Execution readiness: `comparison_execution_ready`
- Approval decision: `approved`
- Unresolved conditions: none
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- Next action: `action_508_turbopack_runner_environment_comparison_and_runtime_complete_candidate_rehearsal`

Action 507 remains static and local-tooling-inspection-only. No build, comparison, rehearsal, deployment, activation, provider call, Supabase access, persistence, replay, feedback, confidence application, or downstream behavior change occurred.
