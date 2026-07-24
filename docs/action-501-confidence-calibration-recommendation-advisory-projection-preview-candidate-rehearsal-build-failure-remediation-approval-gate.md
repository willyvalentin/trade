# Action 501: Candidate Rehearsal Build-Failure Remediation Approval Gate

Action 500 executed exactly one local rehearsal attempt for the Action 492 runtime-complete 31-file candidate. The rehearsal reached `npm run build` and failed there.

## Action 500 Boundary

- Candidate result: `full_candidate_rehearsal_failed`
- External evidence: `rehearsal_evidence_verified`
- Overall readiness: `blocked`
- Attempt count: `1`
- Failing command: `npm run build`
- Prior `npx next typegen`: `passed`
- Prior `npx tsc --noEmit`: `passed`
- Cleanup: `cleanup_passed`
- Deployment: `false`
- Activation: `false`

The candidate bindings stayed exact:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Candidate file count: `31`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`

## Evidence Inspected

Action 501 inspected only bounded Action 500 evidence:

- command result object;
- exit code and signal classification;
- stdout/stderr byte counts;
- preceding command statuses;
- cleanup and external evidence status.

Action 501 did not inspect raw logs, raw source contents, raw environment values, credentials, machine-specific absolute paths, Recommendation data, projection output, provider payloads, or full build output.

## Classification

Top-level failure classification: `candidate_build_command_failed`

Primary build-failure classification: `build_failure_evidence_insufficient`

Build phase: `unknown_from_bounded_action_500_evidence`

Error class: `unknown_from_bounded_action_500_evidence`

Exit classification: `exit_code_1_no_signal`

Because `npx next typegen` and `npx tsc --noEmit` passed, the failure is build-only, but the retained Action 500 record does not include enough sanitized evidence to determine whether the build-only failure came from candidate source, Next.js build configuration, dependency materialization, build environment, route/static generation, bundler resolution, or the rehearsal runner.

No repository-relative candidate paths were implicated by the bounded evidence. No unrelated dirty-worktree path was referenced by the bounded evidence.

## Hash Impact

Candidate hash impact: `candidate_hash_impact_unresolved`

Action 501 cannot approve candidate source/configuration mutation because the bounded evidence does not identify an exact candidate defect. Action 492 hashes remain authoritative until a future action proves a source/configuration change is required and performs a new candidate hash freeze.

## Remediation Decision

Remediation class: `diagnostic_evidence_completion_required`

Bounded next remediation scope:

- capture sanitized Next.js build phase;
- capture sanitized error class;
- capture repository-relative error paths if present;
- capture bounded line/column references if present;
- keep raw logs, environment values, credentials and absolute paths redacted;
- do not modify candidate source during evidence completion.

Approval decision: `blocked`

Unresolved conditions:

- Action 500 evidence does not include the Next.js build phase or error class.
- Candidate versus runner relevance cannot be distinguished without sanitized build-failure evidence.

Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

Next action: `action_502_candidate_build_failure_diagnostic_evidence_completion_gate`

Action 501 performed no build rerun, rehearsal rerun, source modification, package or lockfile change, dependency install, environment mutation, deployment, activation, Netlify operation, provider call, Supabase access, persistence, replay, feedback, confidence application, or downstream behavior change.
