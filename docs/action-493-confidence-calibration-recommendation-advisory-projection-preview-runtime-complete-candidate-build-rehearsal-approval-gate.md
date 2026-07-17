# Action 493: Runtime-Complete Candidate Build Rehearsal Approval Gate

Action 493 approves one bounded build-rehearsal procedure for the Action 492 runtime-complete confidence calibration recommendation advisory projection preview candidate. It does not reconstruct the candidate, run a build, run tests, deploy, activate the preview flag, install dependencies, call Netlify, call providers, use Supabase, persist anything, replay anything, apply confidence, create feedback, or change downstream recommendation behavior.

## Authoritative Candidate

Action 492 produced the authoritative runtime-complete candidate:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Changed-file count: `31`
- Added runtime path: `lib/pure-confidence-calibration.ts`
- Added runtime path hash: `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`
- Runtime dependency closure complete: `true`
- Runtime/build paths missing: `0`

The historical 30-file candidate remains a preserved historical identifier only:

- Historical change-candidate hash: `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`
- Historical full-candidate inventory hash: `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`
- Historical file count: `30`
- Historical status: `historical_candidate_runtime_incomplete`
- Historical deployment approval executable: `false`

## Action 494 Boundary

Action 494 may perform exactly one rehearsal attempt using:

`<canonical-system-temp>/ture/action-494-confidence-calibration-projection-preview-runtime-complete-candidate-rehearsal/`

The temporary path must retain the Action 486 safety policy: canonical runtime temp root, path-relative containment, macOS `/var` to `/private/var` equivalence, no textual-prefix-only containment, no traversal, no target or parent symlink, no repository/HOME/config/application-data/source-node_modules/`.netlify` location, absent or empty target, exact Action 494 subtree, and bounded cleanup.

## Source Reconstruction

Action 494 must reconstruct source only from:

1. the exact clean base;
2. the exact Action 492 31-file overlay;
3. no broad dirty-worktree copy.

It must verify exactly 31 changed paths, exact overlay hashes, zero missing overlay files, zero unexpected overlay files, zero runtime dependency paths missing, zero unrelated dirty files, zero newly included control-only files, and zero environment or credential files.

## Integrity And Source Safety

The frozen integrity strategy is `baseline_plus_overlay_manifest_integrity`.

Action 494 must directly hash-check every candidate file, verify the bounded clean-base-plus-overlay inventory, reject missing or unexpected source files, reject unapproved deletions or unapproved source modifications, reject merge-conflict markers, reject `.env*`, reject credential material, reject `.netlify/`, and keep `node_modules` out of the source inventory.

The source-safety policy retains the Action 488 ordered classifier. It must reject `.npmrc` inside the candidate, private keys, PEM/key stores, Netlify credential stores, token/password-bearing files, and unknown sensitive-looking files outside the approved inventory. Filename-only sensitive words are not authoritative, and no raw secret value may be stored or printed.

## Dependency Materialization

The dependency method is `temporary_verified_node_modules_copy`.

Action 494 must prove source integrity before dependency copy, use an existing verified local dependency installation, avoid `npm install`, avoid `npm ci`, avoid registry access, avoid dependency updates, avoid lockfile rewrites, avoid `.npmrc` and package-cache copies, leave source `node_modules` unchanged, exclude copied `node_modules` from the candidate inventory, exclude the five known extraneous packages, and preserve `extraneous_influence: no_influence_detected`.

## Internal Commands

Candidate-internal commands run serially:

1. candidate integrity confirmation
2. `npx next typegen`
3. `npx tsc --noEmit`
4. `npm run build`
5. `npm run lint`
6. Action 461 preview-consumer runtime-relevant suite
7. Action 462 independent preview-consumer runtime-relevant suite
8. exact runtime-facing projection call-site scan, expecting `1`
9. no-route scan
10. no-persistence scan
11. no-replay scan
12. no-provider/Supabase preview integration scan
13. no-feedback scan
14. no-confidence-application scan
15. no-ranking/scanner/publication/execution/Add Trade/risk/sizing-effect scan
16. preview flag disabled confirmation

Action 309 safety guard and a recommendation-details regression suite remain conditional: run them only if their paths are present in the Action 492 candidate. They are not required candidate expansions.

## External Controls

After candidate commands, integrity checks, bounded record creation, and cleanup, Action 494 may run external rehearsal-control checks such as Actions 481-494 verifiers and focused contract suites. These stay outside the candidate, do not count as a second rehearsal attempt, do not mutate or repopulate the candidate, and cannot change the candidate-internal rehearsal result.

## Result Semantics

Candidate rehearsal vocabulary:

- `full_candidate_rehearsal_passed`
- `full_candidate_rehearsal_failed`
- `full_candidate_rehearsal_aborted`

External evidence vocabulary:

- `rehearsal_evidence_verified`
- `rehearsal_evidence_verification_failed`
- `rehearsal_evidence_verification_aborted`

Overall readiness vocabulary:

- `ready_for_preview_deployment_final_approval`
- `ready_with_conditions`
- `blocked`

Action 494 must abort if the temp path fails, the candidate differs before commands, runtime closure is incomplete, source safety blocks, dependency materialization cannot be proven, or the preview flag is enabled. It must fail if an internal command begins and fails, protected source mutates, or cleanup fails after command execution begins. External verifier failure after an internal pass is `rehearsal_evidence_verification_failed`, not a runtime candidate build failure.

## Approval

Approval decision: `approved`.

Unresolved conditions: none.

Rehearsal attempt limit: `1`.

Deployment authorized: `false`.

Activation authorized: `false`.

Preview flag: `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`, absent or disabled.

Runtime preview state: `runtime_preview_waiting_for_operator_inputs`.

Next action: `action_494_runtime_complete_candidate_build_rehearsal`.
