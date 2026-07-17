# Action 521: Action 520 Path-Safety Checker Remediation Approval Gate

Action 521 is static and approval-only. It does not reconstruct the candidate, run a build, run a rehearsal, deploy, activate preview behavior, call providers, access Supabase, persist data, replay anything, apply confidence, create feedback, or change downstream behavior.

## Action 520 Abort

Action 520 consumed the single approved local rehearsal attempt and aborted before candidate source materialization.

- Candidate result: `full_candidate_rehearsal_aborted`
- Rehearsal attempt count: `1`
- Build process invocations: `0`
- Candidate source materialized: `false`
- Dependency materialization started: `false`
- Pre-build commands started: `false`
- Authoritative build started: `false`
- Webpack diagnostic started: `false`
- External evidence: `rehearsal_evidence_verified`
- Overall readiness: `blocked`
- Cleanup: passed
- Deployment: `false`
- Activation: `false`
- Runtime preview: `runtime_preview_waiting_for_operator_inputs`

The blocker classification is:

`action_520_path_safety_checker_failed_to_apply_canonical_macos_temp_alias_equivalence`

Action 520 did not prove a candidate source defect, candidate hash defect, runtime dependency defect, dependency materialization defect, build defect, or route defect.

## Candidate Binding Preserved

- Clean base: `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`
- File count: `32`
- Change candidate hash: `bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de`
- Full candidate inventory hash: `80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0`
- Remediated route: `app/api/recommendations/evaluate-outcomes/route.ts`
- Route SHA-256: `26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265`
- Route export surface: `POST`

No candidate or hash change is required.

## Exact Divergence

The trusted runtime temp root was intended to be used, and the Action-specific child was intended to be inside it. One path representation resolved through `/var`, while the canonical representation resolved through `/private/var`. Both sides were not normalized consistently before containment, so the runner rejected the intended system-temp child before source construction.

Future Action 522 must use one shared canonical path-safety implementation. It must not duplicate the algorithm in an Action-specific runner when a reusable helper or exact shared implementation can be used.

## Canonicalization Policy

Canonicalize every compared root before containment:

- trusted runtime temp root
- candidate parent
- created candidate target
- active repository root
- HOME
- config roots
- application-data roots
- source `node_modules`
- `.netlify`
- other forbidden roots

The operating system transformation `/var/...` to `/private/var/...` is accepted only when both paths originate from the trusted runtime temp-root source and resolve to the same canonical hierarchy. It must not allow arbitrary user-created symlink aliases.

## Containment Policy

Containment must be path-aware and equivalent to `path.relative(canonicalTrustedRoot, canonicalCandidate)`.

Accept only when:

- the candidate is not equal to the trusted root
- the relative path is non-empty
- the relative path is not `..`
- the relative path does not begin with `../`
- the relative path is not absolute
- the candidate is inside the exact Action 522 subtree
- no textual-prefix sibling is accepted

Do not use `startsWith`, unresolved-prefix matching, comparison of canonical and noncanonical strings, or normalization that discards path-boundary semantics.

## Symlink And Forbidden-Root Policy

Reject target symlinks, dangling target symlinks, user-created parent-chain symlinks below the trusted temp root, symlink escapes outside the canonical temp root, traversal, repository paths, HOME/config paths, application-data paths, source `node_modules`, `.netlify`, build-output roots, credential stores, the wrong Action subtree, and non-empty targets.

The trusted OS temp alias itself is not treated as a user-created unsafe symlink when canonicalized through the runtime temp API.

## Action 522 Boundary

Future Action 522 must use exactly:

`<canonical-system-temp>/ture/action-522-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal/`

It must use Action number `522`, allow no caller override, no CLI argument path, no environment override, no stdin path, no reuse of the Action 520 subtree, and require the target to be absent or empty before use.

## Creation Sequence

1. Derive trusted runtime temp root
2. Canonicalize trusted root
3. Derive fixed Action 522 target
4. Validate parent containment
5. Validate forbidden-root separation
6. Validate parent-chain symlinks
7. Require target absent or empty
8. Create target
9. Canonicalize created target
10. Rerun containment
11. Rerun forbidden-root checks
12. Materialize source only after all prior steps pass

Any failure returns `full_candidate_rehearsal_aborted`.

## Cleanup Sequence

1. Canonicalize cleanup target
2. Require exact Action 522 identity
3. Require containment inside canonical trusted temp root
4. Require forbidden-root separation
5. Reject symlink target
6. Remove only the exact Action 522 subtree
7. Verify target absent or empty

Never remove the trusted system temp root, shared `ture` root unless separately empty and bounded, repository, HOME, source `node_modules`, parent directories, or historical Action 520 subtree.

## Preserved Rehearsal Policies

Action 522 must retain the Action 518 hashes, candidate file count, route hash/export state, runtime/build closure, source-integrity policy, source-safety and strict hash policies, semantic preview-flag verification, dependency materialization policy, candidate-internal command inventory, authoritative `npm run build` policy, optional one-shot Webpack diagnostic, attempt accounting, and no deployment/no activation policy.

## Approval

- Path-safety readiness: `path_safety_remediation_ready`
- Approval decision: `approved`
- Unresolved conditions: none
- Rehearsal authorized by Action 521: `false`
- Deployment authorized: `false`
- Activation authorized: `false`
- Runtime preview: `runtime_preview_waiting_for_operator_inputs`
- Next action: `action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation`

Action 522 must not deploy.
