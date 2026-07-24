# Action 365: Option B Immutable Preview Revision Preparation

## Preparation Status

- decision_vocabulary: prepared | prepared_with_conditions | blocked
- preparation_state_before_isolation: authorized_pending_execution
- selected_baseline_sha: 51aced66782ec9a37cd358238f02b6f5c0ae97bd
- selected_baseline_source: dev/safe-post-recovery-work
- recovery_clean_base: 512a0c5434f428f5c420cf4533b1eafaf036c00b
- isolation_mechanism: local_no_hardlink_clone
- isolated_context_path: /private/tmp/ture-action-365-preview-revision-51aced6
- isolated_context_purpose: non-production preparation only
- original_worktree_mutation_by_isolation: false
- deployment_allowed: false
- main_push_allowed: false

This record freezes the preparation boundary before any isolation operation. If its baseline, path, allowlist, denylist policy, ownership rules, abandonment process, or stop conditions cannot be honored exactly, preparation stops as `blocked`.

## Purpose

Prepare one clean, recoverable, immutable local revision containing only the reviewed runtime-ping package and required safety dependencies, then validate it and stop without deployment.

## Scope

Action 365 may create one separate local clone from the verified baseline, transfer only the allowlisted files, classify the entire resulting tree and excluded concurrent files, create one local immutable revision, validate it after freeze, and leave the original worktree intact.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`. Recovery clean base `512a0c5434f428f5c420cf4533b1eafaf036c00b` is an ancestor of selected baseline `51aced66782ec9a37cd358238f02b6f5c0ae97bd`.

## Upstream Dependencies

- Action 309 post-recovery safety protocol
- Actions 318-320 static package guards
- Action 338 runtime rollout checklist
- Actions 344, 350, and 358-364 runtime-ping chain
- golden/static replay safety verifier and its fixture/model dependencies

## Action 364 Decision and Conditions

Action 364 returned `approved_with_conditions` and selected Option B. Action 365 resolves the remaining conditions by freezing the baseline, isolation mechanism, changed-file allowlist, exclusion policy, manifest schema, recoverability boundary, and validation protocol before isolation.

## Selected Baseline Revision

Baseline: `51aced66782ec9a37cd358238f02b6f5c0ae97bd` from local branch `dev/safe-post-recovery-work`.

## Baseline-Selection Rationale

The baseline is the current committed HEAD, is locally reviewable, descends from the recovery base, contains the known application behavior and existing route inventory, and already includes required Actions 309, 318-320, 338, and golden/static dependencies. It excludes all current uncommitted and untracked concurrent work by construction.

No schema, migration, proxy, middleware, Netlify, environment, provider, or Supabase change is needed to add the reviewed ping package.

## Expected Baseline Application and Runtime Behavior

All application behavior and routes present in the baseline remain unchanged. The only introduced runtime route is `app/api/runtime-health/ping/route.ts`. The expected baseline route inventory is the exact sorted `app/**/route.ts` tree recorded from baseline Git data; the prepared inventory must equal that baseline inventory plus this one route.

## Isolation Mechanism

Use a local Git clone without hardlinks at `/private/tmp/ture-action-365-preview-revision-51aced6`, sourced from the local repository and checked out at the selected baseline branch. This is an equivalent clean checkout that copies committed Git data only and does not import the mutable worktree's modified or untracked files.

No network, remote fetch, push, or shared branch mutation is permitted. The clone is preparation-only and not a deployment source until a later gate separately approves its frozen revision.

## Original-Worktree Protection

The original worktree must retain its branch, HEAD, modified files, untracked files, and concurrent post-trade work exactly as found, apart from Action 365's own source artifacts added there for traceability. Isolation must not reset, clean, stash, revert, rebase, amend, force-update, remove, overwrite, or broadly copy from it.

Before and after isolation, record original branch `dev/safe-post-recovery-work`, HEAD `51aced66782ec9a37cd358238f02b6f5c0ae97bd`, and a path/hash inventory of existing changes. Any disappearance or content drift caused by preparation is a stop condition.

## Exact Repository-Operation Boundary

Permitted operations are limited to: one local no-hardlink clone at the frozen path; checkout of the frozen baseline in that clone; creation of one local preparation branch inside the clone if needed; file-by-file transfer of this allowlist; one local immutable commit; and read-only validation/evidence commands afterward.

No original-repository branch/ref/history operation, no cleanup, no integration, no push, and no deployment is permitted. The immutable commit message must identify preview preparation only, non-production, runtime-ping-only, and not approved for main push.

## Exact Changed-File Allowlist

Only these 35 changed or introduced paths may differ from baseline:

1. `app/api/runtime-health/ping/route.ts`
2. `docs/action-344-runtime-ping-only-route-implementation-plan.md`
3. `scripts/action-344-runtime-ping-only-route-implementation-plan-verify.mjs`
4. `tests/e2e/action-344-runtime-ping-only-route-implementation-plan.spec.ts`
5. `docs/action-350-runtime-ping-only-route-approval-gate.md`
6. `scripts/action-350-runtime-ping-only-route-approval-gate-verify.mjs`
7. `tests/e2e/action-350-runtime-ping-only-route-approval-gate.spec.ts`
8. `docs/action-358-runtime-ping-only-route-implementation-readiness-review.md`
9. `scripts/action-358-runtime-ping-only-route-implementation-readiness-review-verify.mjs`
10. `tests/e2e/action-358-runtime-ping-only-route-implementation-readiness-review.spec.ts`
11. `docs/action-359-runtime-ping-only-route-implementation-approval-gate.md`
12. `scripts/action-359-runtime-ping-only-route-implementation-approval-gate-verify.mjs`
13. `tests/e2e/action-359-runtime-ping-only-route-implementation-approval-gate.spec.ts`
14. `docs/action-360-runtime-ping-only-route-implementation.md`
15. `scripts/action-360-runtime-ping-only-route-implementation-verify.mjs`
16. `tests/e2e/action-360-runtime-ping-only-route-implementation.spec.ts`
17. `docs/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.md`
18. `scripts/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review-verify.mjs`
19. `tests/e2e/action-361-runtime-ping-only-local-implementation-verification-and-rollout-readiness-review.spec.ts`
20. `docs/action-362-runtime-ping-only-preview-deploy-approval-gate.md`
21. `scripts/action-362-runtime-ping-only-preview-deploy-approval-gate-verify.mjs`
22. `tests/e2e/action-362-runtime-ping-only-preview-deploy-approval-gate.spec.ts`
23. `docs/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.md`
24. `scripts/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness-verify.mjs`
25. `tests/e2e/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.spec.ts`
26. `docs/action-364-immutable-preview-revision-preparation-approval-gate.md`
27. `scripts/action-364-immutable-preview-revision-preparation-approval-gate-verify.mjs`
28. `tests/e2e/action-364-immutable-preview-revision-preparation-approval-gate.spec.ts`
29. `docs/action-365-option-b-immutable-preview-revision-preparation.md`
30. `scripts/action-365-option-b-immutable-preview-revision-preparation-verify.mjs`
31. `tests/e2e/action-365-option-b-immutable-preview-revision-preparation.spec.ts`
32. `docs/action-365-preview-deployment-input-manifest.json`
33. `scripts/action-318-static-replay-batch-commit-readiness-verify.mjs`
34. `scripts/action-319-static-replay-batch-post-commit-verify.mjs`
35. `scripts/action-320-static-replay-branch-package-verify.mjs`

Paths 15, 18, 21, 24, 27 and tests 10, 13, 16, 19, 22, 25, 28 may receive only the minimal dual-state checks needed to recognize both the reviewed pre-freeze route state and the clean immutable revision. Paths 33-35 may receive only exact Action 365 recognition and clean-isolated-context compatibility. No route behavior changes are allowed.

## Included Runtime-Ping Chain

Actions 344, 350, 358, 359, 360, 361, 362, 363, 364, and 365 are `approved_preview_input`. Actions 345-357 and Action 330 are not required by the runtime-ping verification chain and remain excluded from this narrow package.

## Included Safety Dependencies

Unchanged baseline files for Action 309, Actions 318-320 documentation/tests, Action 338, Actions 310-317 static replay models, scripts, fixtures, tests, lockfile, build configuration, and application source are `approved_baseline_dependency`. Only guard scripts 318-320 may differ as allowlisted preview inputs.

## Exact File Denylist

The following current mutable-worktree paths are explicitly `unrelated_excluded` and must not be transferred:

- `docs/action-330-confidence-calibration-static-metric-spec.md`
- all Action 345-357 documents, verifiers, and tests
- `lib/pattern-insight-static-fixtures.ts`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- `tests/e2e/post-trade-staging-insert-function-static.spec.ts`
- every `docs/post-trade-*` path
- every `lib/post-trade-*` path
- every `tests/e2e/post-trade-*` path

Also denied: `.env*`, generated caches/build outputs, secrets, full-directory copies from the mutable worktree, migrations, schema changes, proxy/middleware/Netlify changes, provider/Supabase changes, execution artifacts, and any path absent from both the baseline and exact allowlist.

## Ownership Classification Rules

Use exactly:

- `approved_preview_input`: allowlisted file introduced or changed for Actions 344, 350, 358-365 or guard compatibility.
- `approved_baseline_dependency`: unchanged file inherited from selected baseline and needed to preserve/build/test the app.
- `unrelated_excluded`: mutable-worktree file not transferred into the isolated context.
- `unresolved_blocker`: any file whose ownership, necessity, content, or inclusion status cannot be proven.

No included path may be `unresolved_blocker`.

## Unresolved-File Handling

Stop before transfer, freeze, or commit when an unexpected path appears, an allowlisted source is missing, a hash changes during transfer, or ownership is uncertain. Do not infer inclusion from directory proximity and do not use broad copy operations.

## Isolated-Context Location Policy

The path is fixed to `/private/tmp/ture-action-365-preview-revision-51aced6`. It must not already exist. If occupied, ambiguous, or not safely writable, stop rather than remove or reuse it. No sensitive values appear in the path.

## Immutable Revision Requirements

The isolated revision must have one unique local commit identifier, parent `51aced66782ec9a37cd358238f02b6f5c0ae97bd`, the exact classified file tree, exactly one introduced runtime route, no unresolved included files, and no tracked or untracked source drift after freeze. It must never be amended, merged, pushed, or deployed in Action 365.

## Deployment-Input Manifest Design

`docs/action-365-preview-deployment-input-manifest.json` uses canonical UTF-8 JSON with two-space indentation and a trailing newline. It records schema version, baseline/parent, isolation strategy, route hash, complete included baseline/preview inventory, excluded concurrent inventory, ownership and source/destination hashes, runtime/migration/schema/config/environment/provider inventories, validation command set, and safety states.

To avoid self-reference, the manifest records `immutable_revision_sha` as null with binding mode `external_head_and_manifest_hash`. The post-freeze verifier binds the resulting immutable HEAD to the SHA-256 of the committed manifest. The manifest's reproducible integrity hash is computed over its committed bytes and reported externally; the revision is never amended to insert its own SHA.

## Source-Hash Requirements

Every transferred file must have identical source and destination SHA-256. Every baseline dependency must match its baseline Git blob content. The route must remain `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`.

## Post-Freeze Validation Requirements

After the immutable commit and before any further source change: diff integrity, typegen, full typecheck, full build, lint, Action 309, golden/static safety, Actions 338/344/350/358-365, Actions 318-320, focused runtime-ping tests, route hash, route inventory, migration/schema/config/environment inventory, and clean isolated status must all pass.

Pre-freeze validation is not final evidence. Ignored build output may exist; any tracked or non-ignored untracked drift blocks preparation.

## Rollback and Abandonment Procedure

If any pre-freeze condition fails, stop and leave the isolated path for inspection; do not remove it automatically. If post-freeze validation fails, mark the candidate blocked and do not amend it. Original work remains untouched. A separately authorized cleanup may later remove an abandoned isolated clone. Production rollback is unnecessary because no deployment occurs.

## Explicit Non-Goals

No mutable-worktree cleanup, unrelated remediation/inclusion, route behavior change, schema/migration/config/environment/provider/Supabase change, push, deployment, production operation, main update, replay, persistence, or product behavior change is permitted.

## Stop Conditions

Stop as `blocked` for baseline mismatch, occupied isolation path, original-worktree drift caused by preparation, missing/changed allowlist source, broad-copy requirement, route hash mismatch, unexpected route/migration/schema/config/environment/provider file, post-trade inclusion, incomplete classification, unresolved blocker, commit containing a non-allowlisted change, validation failure, tracked drift, external access, or deployment requirement.

## Deployment Prohibition

No preview or production deployment, Netlify invocation, deploy hook, endpoint contact, alias, or promotion occurs.

## Production Prohibition

Production traffic, data, runtime validation, branch, and configuration remain untouched.

## Main-Push Prohibition

No push, merge, update, or promotion to main is allowed. The immutable revision is local, preparation-only, non-production, runtime-ping-only, and not approved for main push.
