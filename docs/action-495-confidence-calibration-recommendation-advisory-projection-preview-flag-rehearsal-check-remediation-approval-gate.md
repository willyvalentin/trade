# Action 495 - Preview Flag Rehearsal Check Remediation Approval Gate

Action 495 approves a static remediation to the Action 494 pre-command preview-flag check. It does not run a rehearsal, build, deploy, activate the preview, call Netlify, install dependencies, mutate environment values, call providers or Supabase, persist data, run replay, apply confidence, create feedback, or change downstream recommendation behavior.

## Action 494 Result

Action 494 reconstructed the exact Action 492 runtime-complete candidate, then aborted before dependency copy and candidate commands.

- Candidate result: `full_candidate_rehearsal_aborted`
- External evidence result: `rehearsal_evidence_verified`
- Overall readiness: `blocked`
- Attempt count: `1`
- Cleanup: `cleanup_passed`
- Deployment: `false`
- Activation: `false`

## Root Cause

Blocker classification:

`preview_flag_rehearsal_check_confused_parser_literal_with_resolved_flag_state`

The implementation source contains the literal `"true"` because the helper compares the resolved canonical flag value against that exact string. The source-code literal is required parser logic. It is not evidence that the flag is configured, enabled, or activated.

## Canonical Flag Contract

Canonical flag:

`CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

The existing helper contract is frozen:

- Exact resolved string `"true"` enables the preview outside production.
- Production runtime forces disabled.
- Absent, undefined, empty, `"false"`, `"0"`, `"1"`, `"TRUE"`, whitespace variants, and non-exact strings are disabled.
- The helper’s normalization behavior must not change.

## Approved Verification Strategy

Future Action 496 must use:

`resolved_preview_flag_helper_evaluation`

It must evaluate the existing helper’s resolved boolean result in a controlled local process, provide no enabling environment override, require `false`, inspect only the canonical key, and record only bounded classifications.

Raw environment values must not be recorded.

## Source Literal Policy

The following are not activation evidence:

- Parser comparison against `"true"`
- Documentation that explains how to enable the feature
- Records documenting expected enabled behavior
- Test fixtures or assertions containing `"true"`

Actual activation evidence must come from the resolved canonical environment key, helper evaluation, or an explicitly supported runtime configuration source.

## Alternate Activation Checks

Future Action 496 must verify that no supported bypass exists through alternate aliases, query parameters, URL fragments, localStorage, sessionStorage, cookies, persisted database preference, remote configuration, Netlify-injected alternate keys, or hardcoded forced-true branches.

Real user browser storage must not be inspected.

## Required Helper Matrix

Future bounded tests must include absent, undefined, empty string, `"false"`, `"0"`, `"1"`, non-exact strings, uppercase true, whitespace true, exact `"true"`, production exact `"true"`, parser literal present while key absent, documentation literal, test fixture literal, alternate alias absence, and storage/cookie/query bypass absence.

Each test must restore any process-environment mutation and must not affect deployment environment.

## Future Action 496 Boundary

Action 496 may execute exactly one new local candidate rehearsal attempt using unchanged Action 492 candidate hashes and file count. The semantic preview-flag gate must run after path/source/closure/integrity/safety checks and before dependency materialization or commands.

No candidate expansion, deployment, activation, dependency installation, package/lockfile change, environment mutation, provider call, Supabase access, replay, persistence, feedback, confidence application, scanner, ranking, publication, execution, Add Trade, or risk change is authorized.

## Decision

- Approval decision: `approved`
- Unresolved conditions: none
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- Next action: `action_496_runtime_complete_candidate_build_rehearsal_retry_after_preview_flag_check_remediation`
