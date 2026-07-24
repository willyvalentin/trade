# Action 506: Turbopack Runner Environment Comparison and Rehearsal Gate

Action 506 is a static approval gate for the next bounded runner-environment step. It does not run a build, comparison, rehearsal, deployment, activation, install, provider call, Supabase access, replay, persistence, feedback path, confidence application, or downstream behavior change.

## Action 505 Result

- Precheck readiness: `runner_environment_precheck_ready_with_conditions`
- Temp-boundary classification: `temp_boundary_restriction_not_detected`
- Approved execution root: `canonical_system_temp`
- Remediation strategy: `bounded_turbopack_runner_environment_adjustment`
- Source readability: `passed`
- Output writability: `passed`
- Dependency executable modes: `passed`
- Child process and bounded resource capability: `passed`

The generic local temp, output, dependency, executable, child-process, and bounded resource checks did not reproduce a broad filesystem or process restriction. The remaining uncertainty is specific to the Action 503 build path where Turbopack processed `app/globals.css` and returned the sanitized `operation_not_permitted` process-resource failure.

## Authoritative Build Policy

- Authoritative command: `npm run build`
- Authoritative class: `authoritative_turbopack_build`
- Authoritative build required for readiness: `true`
- Comparison can establish deployment readiness: `false`

The repository build command remains authoritative. Action 506 does not authorize changes to `package.json`, package scripts, `package-lock.json`, `next.config.ts`, candidate source, candidate hashes, or production behavior.

## Comparison Policy

- Comparison classification: `turbopack_runner_environment_comparison`
- Comparison command class: `comparison_non_turbopack_build`
- Comparison invocation exactness: `unresolved_local_tooling_precheck_required`
- Comparison readiness: `turbopack_comparison_ready_with_conditions`

A future comparison may be used only to classify whether the failure is Turbopack-specific. The exact supported invocation must be resolved from the installed local Next.js tooling during Action 507 prechecks. If that requires package-script changes, source changes, config changes, network access, install work, raw log retention, or environment exposure, the comparison is blocked.

## Frozen Comparison Outcomes

- `turbopack_failed_comparison_passed`: likely Turbopack-specific runner/environment interaction; not deployment-ready.
- `turbopack_failed_comparison_failed`: compare both sanitized failures for broader build-environment or candidate-defect signals.
- `turbopack_passed_comparison_not_required`: authoritative rehearsal may continue; no comparison should run.
- `turbopack_failure_not_reproduced`: requires nondeterminism assessment; does not automatically authorize deployment.
- `comparison_unavailable`: use a blocker-specific runner/build-strategy remediation gate.
- `comparison_inconclusive`: do not proceed to deployment readiness.
- `comparison_execution_failed`: diagnostic failure only.

## Attempt Accounting

- Comparison attempt limit: `1`
- Authoritative rehearsal attempt limit: `1`
- Maximum build-process invocations: `2`
- Same-Action retry allowed: `false`
- Two authoritative builds allowed: `false`

If the authoritative Turbopack build is used first and succeeds, no comparison should run. If the authoritative build fails with the already classified resource error, one comparison-only invocation may run under the frozen policy. A comparison pass cannot replace an authoritative `npm run build` pass.

## Future Action 507 Sequence

1. Phase 0: safe canonical Action-specific temp boundary.
2. Phase 1: exact 31-file reconstruction, runtime closure, source integrity, source safety, strict hash verification, and semantic preview-flag verification.
3. Phase 2: bounded dependency materialization and extraneous-package exclusion.
4. Phase 3: bounded Turbopack/environment comparison under the approved policy.
5. Phase 4: determine whether one authoritative rehearsal build may proceed.
6. Phase 5: execute exactly one authoritative candidate rehearsal attempt if permitted.
7. Phase 6: protected non-mutation checks and cleanup.
8. Phase 7: external evidence verification.

## Evidence Boundary

Future build-process evidence may retain only command classification, pass/fail, exit classification, build phase, primary error class, bounded sanitized summary, repository-relative implicated paths, and the Turbopack-specific comparison result.

It must not retain full logs, absolute paths, environment values, credentials, source contents, or complete stack traces.

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

- Comparison readiness: `turbopack_comparison_ready_with_conditions`
- Rehearsal readiness: `runner_remediated_rehearsal_ready_with_conditions`
- Approval decision: `approved_with_conditions`
- Unresolved condition: `exact_supported_non_turbopack_comparison_invocation_must_be_resolved_from_local_installed_tooling_during_action_507_prechecks`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- Next action: `action_507_turbopack_comparison_invocation_completion_gate`

Action 506 keeps the preview disabled/absent and does not authorize deployment or activation.
