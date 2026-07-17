# Action 497 - Source-Safety Checker False-Positive Remediation Approval Gate

Action 497 is a static approval gate. It does not run a rehearsal, build, deploy, activate the preview, call Netlify, install dependencies, modify the candidate, modify the helper, mutate environment values, call providers or Supabase, persist data, run replay, apply confidence, create feedback, or change downstream behavior.

## Action 496 Abort

Action 496 executed exactly one local rehearsal attempt.

- Candidate result: `full_candidate_rehearsal_aborted`
- External evidence result: `rehearsal_evidence_verified`
- Overall readiness: `blocked`
- Attempt count: `1`
- Path safety: `path_safety_passed`
- Source reconstruction: `source_reconstruction_passed`
- Runtime dependency closure: `runtime_dependency_closure_passed`
- Dependency materialization: `not_started_aborted_before_dependency_copy`
- Candidate commands started: `false`
- Cleanup: `cleanup_passed`
- Deployment: `false`
- Activation: `false`

The exact blocker for Action 497 is:

`source_safety_checker_applied_non_authoritative_filename_or_whitespace_indicators_as_hard_failure`

The Action 496 checker reported filename-sensitive source files and a whitespace/text-format scan as hard safety failures. No actual credential, token, password, private key, environment file, Netlify credential store, or raw secret value was proven present.

## Candidate Bindings

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Candidate file count: `31`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Added runtime file: `lib/pure-confidence-calibration.ts`
- Added runtime file SHA-256: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`
- Canonical preview flag: `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

Preview remains inactive.

## False-Positive Indicator Inventory

The bounded Action 496 findings are classified as advisory indicators, not independent blockers:

- `lib/avanza-login-credential-resolution-bridge-fixtures.ts`
- `lib/avanza-login-credential-resolution-bridge.ts`
- `lib/avanza-login-local-dev-credential-executor-fixtures.ts`
- `lib/avanza-login-local-dev-credential-executor.ts`
- `lib/avanza-macos-keychain-credential-provider-fixtures.ts`
- `lib/avanza-macos-keychain-credential-provider.ts`
- `lib/avanza-secure-credential-provider-fixtures.ts`
- `lib/avanza-secure-credential-provider.ts`
- `lib/trade-auth.ts`
- `source_inventory_text_format_scan`

The nine source-file findings are clean-base source members with filename-only `sensitive_filename_word` indicators. The text-format finding is a `whitespace_or_format_pattern` concern and must be routed to source integrity or lint, not secret classification.

## Classification Precedence

Future Action 498 must use this precedence:

1. Exact prohibited path or type: reject.
2. Exact approved candidate artifact: continue only if path, membership, hash, provenance, classification, and bounded schema match.
3. Bounded content/schema contradiction: reject without recording raw values.
4. Advisory indicator: do not independently block.
5. unknown sensitive file outside the exact approved inventory: fail closed.

## Prohibited Versus Advisory Policy

Always reject exact `.env`, `.env.*`, candidate `.npmrc`, private-key formats, PEM/key stores, known credential-store files, Netlify credential/auth stores, token/password export files, and sensitive-looking files outside the approved inventory.

Do not independently reject words such as `secret`, `credential`, `token`, `auth`, or `environment`, the canonical preview environment key name, documentation describing prohibited values, tests that verify rejection behavior, policy records stating no credential values were recorded, parser literals, comments, assertion text, indentation, blank lines, or ordinary formatting.

## Approved-Artifact Policy

Approved artifacts remain individually bound by exact path, candidate membership, classification, provenance, expected hash, and bounded schema. This does not approve all docs, all JSON, all Markdown, all tests, wildcard sensitive filenames, or similarly named future files.

## Whitespace Policy

Whitespace checks belong to source integrity or lint. Merge-conflict markers and `git diff --check` failures remain legitimate source-integrity blockers. Ordinary whitespace, indentation, blank lines, newline style, and text formatting must not become secret evidence.

## Secret-Value Boundary

Future source-safety checks must never print raw suspected values, store raw suspected values, hash credential values for evidence, enumerate the complete environment, inspect external credential stores, inspect HOME, or inspect global Netlify configuration. Record only bounded booleans, classifications, and repository-relative paths.

## Action 498 Boundary

Action 498 may execute exactly one local rehearsal attempt. It must preserve the 31-file candidate, hashes, runtime closure, temp-path policy, source inventory policy, Git integrity strategy, dependency-copy strategy, extraneous-package exclusion, semantic preview-flag strategy, command split, one-attempt policy, deployment prohibition, and activation prohibition.

Execution order:

1. Phase 0: Action 486 temp-path policy.
2. Phase 1: Action 492 reconstruction, runtime closure, source inventory, source integrity, remediated source safety.
3. Phase 1B: Action 495 semantic preview-flag verification.
4. Phase 2: Action 482 bounded dependency materialization.
5. Phase 3: serial candidate-internal commands.
6. Phase 4: mutation checks and cleanup.
7. Phase 5: external evidence verification.

## Decision

- Approval decision: `approved`
- Unresolved conditions: none
- Rehearsal authorized in Action 497: `false`
- Deployment authorized: `false`
- Activation authorized: `false`
- Runtime preview state: `runtime_preview_waiting_for_operator_inputs`
- Next action: `action_498_runtime_complete_candidate_build_rehearsal_retry_after_source_safety_checker_remediation`
