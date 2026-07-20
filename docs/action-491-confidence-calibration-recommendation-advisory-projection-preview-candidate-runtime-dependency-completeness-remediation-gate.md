# Action 491: Candidate Runtime Dependency Completeness Remediation Gate

Action 491 is a static audit and approval gate. It performs no candidate reconstruction, rehearsal, deployment, preview activation, package install, dependency update, Netlify operation, network call, provider call, Supabase access, persistence, replay, confidence application, feedback creation, downstream behavior change, scanner/ranking/publication/execution/Add Trade/risk change, package rewrite, lockfile rewrite, or environment mutation.

## Action 490 Result

Action 490 split command inventory into Class A candidate-internal commands and Class B external rehearsal-control checks.

Action 490 correctly classified later Action 481-490 docs, records, verifiers, and focused tests as external control artifacts. It also found a true candidate-internal blocker:

`lib/pure-confidence-calibration.ts`

Action 490 approval decision: `blocked`

Action 490 root cause:

`rehearsal_control_tests_incorrectly_required_inside_frozen_deployment_candidate`

## Blocker Classification

Action 491 freezes the blocker classification as:

`frozen_candidate_missing_runtime_dependency`

First missing runtime/build path:

`lib/pure-confidence-calibration.ts`

The file is required by candidate build behavior through the advisory projection chain. It is not a later Action control artifact. Its absence blocks candidate-internal TypeScript, build, and runtime-preview verification. No rehearsal or deployment occurred in Action 490.

## Old Candidate Status

Old candidate bindings remain historical identifiers only:

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Old 30-file change candidate hash: `7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6`
- Old full-candidate inventory hash: `cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0`
- Old candidate file count: `30`

Old candidate status:

`historical_candidate_runtime_incomplete`

The old hashes remain valid identifiers for that old inventory. They must not be used for future deployment. Action 479 deployment approval is no longer executable against the old candidate. Action 480 and later aborts remain valid historical evidence.

## Authoritative Source Classification

`lib/pure-confidence-calibration.ts` classification:

`present_only_in_current_dirty_worktree`

Bounded SHA-256:

`bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`

Clean-base presence: no

Approved 30-file overlay presence: no

First known provenance: Action 420 pure confidence calibration implementation

Latest verified provenance: Action 423 pure confidence calibration contract remediation

Hash-freeze provenance: Action 426 static confidence calibration hash freeze

Imported by:

- `lib/confidence-calibration-advisory-adapter.ts`

This is an exact source-version approval for a future candidate reconstruction. It does not approve copying the broad dirty working tree, copying all of `lib/`, or including unrelated post-trade work.

## Import-Closure Method

The dependency closure starts from:

- `components/recommendations/RecommendationCardContainer.tsx`
- `components/recommendations/RecommendationDetailsModal.tsx`
- `components/recommendations/ConfidenceCalibrationProjectionPreview.tsx`
- `lib/confidence-calibration-recommendation-advisory-projection-preview.ts`
- `lib/confidence-calibration-recommendation-advisory-projection.ts`
- `lib/confidence-calibration-advisory-adapter.ts`
- `lib/pure-confidence-calibration.ts`
- `lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts`

The closure includes runtime value imports, Next build resolution, TypeScript compile resolution, preview consumer runtime imports, advisory projection execution, disabled-state rendering, feature-flag evaluation, and type-only imports required for compilation.

Type-only imports are classified as `build_required` when they are erased from runtime JavaScript but still required for `npx tsc --noEmit` and `npm run build`.

## Runtime Dependency Inventory

Bounded counts:

- Runtime/build-required paths total: `20`
- Present in frozen candidate: `19`
- Missing from frozen candidate: `1`
- Build-only/type-only paths total: `8`
- Supplied by clean base: `11`
- Supplied by approved 30-file overlay: `8`
- Unresolved source-version paths: `0`

Missing runtime/build paths:

- `lib/pure-confidence-calibration.ts`

The missing file is build-required through a type-only import from `lib/confidence-calibration-advisory-adapter.ts`.

## Runtime Versus Control Artifacts

Runtime/build-required source is not external evidence. Later Action 481-491 docs, records, verifiers, and focused contract tests remain external control artifacts and must not be copied into a deployment candidate.

Do not include files solely because they are tests, documentation, approval records, verifiers, release artifacts, historical evidence, unused helpers, or unrelated post-trade runtime files.

## Candidate Expansion Policy

Candidate expansion is required:

`true`

Approved future inclusion is exactly:

- `lib/pure-confidence-calibration.ts`

The next Action must:

1. reconstruct clean base `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`;
2. apply the original 30-file overlay;
3. add only `lib/pure-confidence-calibration.ts` at SHA-256 `bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70`;
4. verify complete import closure;
5. compute a new changed-file count;
6. compute a new change-candidate hash;
7. compute a new full-candidate inventory hash;
8. verify unrelated dirty files were excluded;
9. produce a new candidate-completeness record;
10. deploy nothing.

New candidate hash required: `true`

New candidate inventory required: `true`

## Forbidden Expansion

Do not include:

- unrelated post-trade runtime or preflight files;
- Action 481-491 docs, records, verifiers, or focused contract tests;
- `.env*`;
- `.netlify/`;
- credentials;
- `node_modules`;
- build output;
- logs;
- editor or OS files;
- package caches;
- unrelated execution-agent work;
- unclassified dirty files.

Directory-wide inclusion is not approved. Copying all of `lib/` is not approved.

## Approval Decision

Dependency completeness decision:

`runtime_dependency_completeness_ready`

Overall candidate status:

`candidate_reconstruction_required`

Approval decision:

`approved`

Unresolved conditions: none

The approval is only for a future candidate reconstruction and hash freeze. It does not authorize reconstruction in Action 491, rehearsal, deployment, activation, environment changes, provider/Supabase calls, persistence, replay, confidence application, feedback, or scanner/ranking changes.

## Runtime Preview State

Preview flag: `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`

Preview flag state: `absent_or_disabled`

Runtime preview state: `runtime_preview_waiting_for_operator_inputs`

Next Action:

`action_492_runtime_complete_candidate_reconstruction_and_hash_freeze`
