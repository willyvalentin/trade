# Action 519: Remediated 32-File Candidate Build Rehearsal Approval Gate

Action 519 is a static approval gate only. It authorizes one future local build rehearsal procedure for the Action 518 remediated 32-file confidence calibration recommendation advisory projection preview candidate.

It does not reconstruct the candidate, run typegen, run TypeScript, build, lint, test the candidate, deploy, activate preview behavior, call providers, read or write Supabase, persist outcomes, replay anything, apply confidence, create feedback, or change scanner, ranking, publication, execution, Add Trade, or risk/sizing behavior.

## Binding

Action 518 is the new authoritative candidate for the future rehearsal.

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- File count: `32`
- Change candidate hash: `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- Full candidate inventory hash: `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- Added route: `app/api/recommendations/evaluate-outcomes/route.ts`
- Added route hash: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`
- Route export surface: `POST`
- Invalid helper export: removed
- Runtime dependency closure: complete
- Missing runtime dependency paths: `0`

The historical Action 492 candidate is superseded for build readiness:

- Historical file count: `31`
- Historical change candidate hash: `c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c`
- Historical full candidate inventory hash: `d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f`
- Historical status: `historical_candidate_build_defective_and_incomplete`
- Historical executable status: `false`

## Rehearsal Boundary For Action 520

Action 520 may reconstruct only the exact Action 518 candidate from the clean base plus the exact 32-file overlay. It must not copy the broad dirty worktree.

Future temporary subtree:

`<canonical-system-temp>/ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal/`

The Action 486 temporary path policy remains binding: canonicalized root and target, relative path containment, macOS `/var` and `/private/var` equivalence handling, no string-prefix-only containment, no traversal, no symlink target or parent, no repo/home/config/app-data/source `node_modules`/`.netlify` target, absent-or-empty target before reconstruction, exact Action 520 subtree only, and bounded cleanup.

The integrity strategy is `baseline_plus_overlay_manifest_integrity`.

The source-safety policy remains the Action 497/Action 499 exact path membership, hash, provenance, classification, schema, fail-closed policy. All 32 paths and hashes must verify. Wrong hashes block. Schema or provenance cannot override a hash mismatch. Environment files, credentials, source `node_modules`, `.netlify`, unapproved deletions, unexpected files, unapproved modifications, and conflict markers remain disallowed.

## Preview Flag Policy

The canonical preview flag is `CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED`.

Action 520 must verify `preview_flag_disabled_verified` before and after rehearsal. The helper result must resolve to absent or disabled. Alternate activation is disallowed. Raw env values must not be recorded, and the environment must be restored.

## Dependency Policy

The approved dependency materialization method is `temporary_verified_node_modules_copy`.

Action 520 may copy a verified existing local dependency tree into the candidate-local rehearsal directory. The candidate-local Next version is bound to `16.2.6`.

The rehearsal must not install packages, call the network, update dependencies, rewrite lockfiles, add `.npmrc`, use package caches, or mutate source `node_modules`. Dependencies are excluded from candidate inventory, five known extraneous packages remain excluded, and required executable modes must be preserved.

## Candidate Internal Command Inventory

Action 520 must run the following candidate-internal command inventory serially:

1. Candidate integrity confirmation
2. Strict source-safety/hash test matrix
3. Semantic preview-flag helper matrix
4. `npx next typegen`
5. `npx tsc --noEmit`
6. `npm run build`
7. `npm run lint`
8. Action 309 safety guard if present
9. Action 461 preview-consumer runtime suite if present
10. Action 462 independent runtime suite if present
11. Recommendation-details runtime regression suite if present
12. Runtime-facing projection call-site scan, exactly `1`
13. No-route scan
14. No-persistence scan
15. No-replay scan
16. No-provider/Supabase preview integration scan
17. No-feedback scan
18. No-confidence-application scan
19. No ranking/scanner/publication/execution/Add Trade/risk/sizing effect scan
20. Preview flag disabled confirmation

## Build And Webpack Boundary

The authoritative build command is `npm run build`.

If `npm run build` passes, no Webpack diagnostic is needed.

If `npm run build` fails with the same Turbopack resource failure, the rehearsal result is failed. A Webpack diagnostic may run only because this gate pre-approves one bounded diagnostic for Action 520.

- Webpack diagnostic invocation model: `direct_local_node_cli_invocation`
- Webpack semantic arguments: `build --webpack`
- Authoritative build attempt limit: `1`
- Webpack diagnostic attempt limit: `0` or `1`
- Maximum build process invocations: `2`
- Same-action retry: disallowed
- Webpack success cannot establish readiness
- Package scripts must not be modified
- Global Next CLI and network-backed `npx` package resolution are disallowed for diagnostics

## Result Vocabulary

- Rehearsal: `full_candidate_rehearsal_passed`, `full_candidate_rehearsal_failed`, `full_candidate_rehearsal_aborted`
- External evidence: `rehearsal_evidence_verified`, `rehearsal_evidence_failed`, `rehearsal_evidence_aborted`
- Readiness: `ready_for_preview_deployment_final_approval`, `ready_with_conditions`, `blocked`
- Approval: `approved`, `approved_with_conditions`, `blocked`

## Approval

Approval decision: `approved`

Unresolved conditions: none

Runtime preview state remains `runtime_preview_waiting_for_operator_inputs`.

Next action: `action_520_remediated_32_file_candidate_build_rehearsal`

Do not deploy, activate, or rehearse from Action 519. This gate approves only the future bounded Action 520 local rehearsal procedure.
