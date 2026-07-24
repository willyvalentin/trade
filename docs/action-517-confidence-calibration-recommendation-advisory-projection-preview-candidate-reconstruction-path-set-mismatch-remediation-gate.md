# Action 517 - Candidate Path-Set Mismatch Remediation Approval Gate

Action 516 correctly aborted with `candidate_reconstruction_aborted` rather than producing false hashes. The blocker is `historical_candidate_path_set_missing_required_remediated_route`.

## Historical Candidate

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- Historical change-candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Historical full-candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Historical changed-file count: 31
- Historical candidate status: `historical_candidate_build_defective_and_incomplete`
- Historical path set contains the remediated route: false

The clean base contains `app/api/recommendations/evaluate-outcomes/route.ts`, so the historical candidate inherited the older clean-base route version. The remediated route is absent from the Action 492 delta and must be added to the future candidate path set.

## Required Route Addition

- Missing required path: `app/api/recommendations/evaluate-outcomes/route.ts`
- Route SHA-256: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`
- Classification: `required_build_source_path_addition`
- Provenance: Actions 514, 515, 516
- Route export surface: `POST`
- `buildOutcomeEligibility` implementation present: true
- `buildOutcomeEligibility` exported: false
- Helper extraction: false
- Route behavior changed: false
- Provider behavior changed: false
- Supabase behavior changed: false

This is an addition to the candidate delta, not a replacement inside the old 31-file overlay.

## Proposed Path-Set Transition

- Historical paths retained: 31
- Added paths: 1
- Added path: `app/api/recommendations/evaluate-outcomes/route.ts`
- Removed paths: 0
- Expected candidate file count: 32
- New candidate hashes required: true

Action 517 does not compute the new hashes. Action 518 must compute a new deterministic change-candidate hash and full-candidate inventory hash, and both must differ from the Action 492 historical hashes.

## Runtime Closure

With the route included conceptually:

- Runtime/build-required paths missing: 0
- Runtime/build closure complete: true
- Route imports resolvable: true
- Pure confidence calibration imports resolvable: true
- Preview/advisory chain imports resolvable: true
- Type-only build imports resolvable: true
- Control-only files excluded: true

## Forbidden Additions

Future reconstruction must reject Action 493-517 control artifacts, unrelated post-trade runtime/preflight files, sibling API routes, directory-wide `app/api` inclusion, `.env*`, `.netlify/`, credentials, `node_modules`, build output, logs, package caches, helper extraction, and unrelated scanner/ranking/execution/risk files.

## Approval

- Path-set readiness: `candidate_path_set_remediation_ready`
- Approval decision: `approved`
- Unresolved conditions: none
- Candidate reconstruction performed: false
- Candidate hash computation performed: false
- Build/rehearsal/deployment/activation: false

Runtime preview remains `runtime_preview_waiting_for_operator_inputs`.

Next action: `action_518_remediated_32_file_candidate_reconstruction_and_hash_freeze`.
