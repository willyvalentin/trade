# Action 370: Corrected Immutable Preview Candidate Preparation

## Preparation Status

- preparation_vocabulary: prepared | prepared_with_conditions | blocked
- committed_document_decision: prepared_pending_external_binding
- selected_baseline_sha: 51aced66782ec9a37cd358238f02b6f5c0ae97bd
- failed_candidate_sha: 8cfe239dc122d85770bfc86586f00716695915d1
- corrected_candidate_created_by_this_action: true
- deployment_performed: false
- push_performed: false
- action_362_approval_preserved: true
- preview_attempt_consumed: false

## Purpose

Prepare one corrected, immutable, local runtime-ping-only preview candidate using only the Action 366 correction scope and Action 369's proven APFS dependency clone capability.

## Scope

One isolated local repository, one corrected commit, one deterministic deployment-input manifest, one external revision binding, complete pre-freeze and post-freeze validation, and no deployment or push.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`. Recovery base `512a0c5`, the failed candidate, production, and main remain untouched.

## Upstream Dependencies

Action 309, Actions 318-320, Action 338, Action 344, Action 350, and Actions 358-369 are direct inputs.

## Failed Candidate Preservation

Candidate `8cfe239dc122d85770bfc86586f00716695915d1` remains clean, unamended, unpushed, undeployed, permanently non-deployable, and separate from this candidate's history.

## Action 366 Approved Correction Scope

Only these corrections are applied:

1. Remove one trailing EOF blank line from each Action 358, 359, and 360 document.
2. Narrow Action 365 ownership matching from `35[0-7]` to `35[1-7]`, preserving approved Action 350 ownership while excluding Actions 351-357.
3. Let Action 363 accept the exact historical blocker through an `unrelated_excluded` manifest record with source hash, null candidate hash, and proof the file is absent.
4. Add only corresponding Action 363/365 documentation and focused regression assertions.
5. Add Actions 366-370 static artifacts and minimal Actions 318-320 guard recognition.

No generic missing-file waiver, broad exclusion, ignored failure, runtime change, or safety weakening is permitted.

## Action 369 Capability Result

Action 369 returned `capable`. APFS `clonefile(2)` produced physical-local dependencies, zero shared source/destination inodes, zero external symlinks, equal deterministic digests, no installation, enforced registry prevention, and a complete passing Next/Turbopack build.

## Selected Baseline

The candidate parent is exactly `51aced66782ec9a37cd358238f02b6f5c0ae97bd`, the reviewed Action 365 baseline. The failed candidate is evidence only and is not the parent.

## Baseline SHA

`51aced66782ec9a37cd358238f02b6f5c0ae97bd`.

## Isolation Mechanism

The context `/private/tmp/ture-action-370-corrected-preview-candidate` is a newly initialized local repository. It fetched only the selected local baseline into a newly created local preparation branch. No existing branch or worktree ref was rewritten.

## clonefile(2) Dependency Strategy

Every regular dependency file is created through native `clonefile(2)` with no ordinary-copy fallback. Directories are physical under candidate `node_modules`; internal symlinks are reproduced without traversal. Hardlinks and external root bridges are forbidden.

## Original-Worktree Protection

The mutable original worktree is source/evidence only. Its status inventory and critical hashes are captured before and after. Candidate validation denies writes to it. Unrelated concurrent work is excluded and never copied broadly.

## Exact Correction Allowlist

- `docs/action-358-runtime-ping-only-route-implementation-readiness-review.md`
- `docs/action-359-runtime-ping-only-route-implementation-approval-gate.md`
- `docs/action-360-runtime-ping-only-route-implementation.md`
- `docs/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.md`
- `scripts/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness-verify.mjs`
- `tests/e2e/action-363-runtime-ping-preview-deployment-preflight-blocker-review-and-revision-freeze-readiness.spec.ts`
- `docs/action-365-option-b-immutable-preview-revision-preparation.md`
- `scripts/action-365-option-b-immutable-preview-revision-preparation-verify.mjs`
- `tests/e2e/action-365-option-b-immutable-preview-revision-preparation.spec.ts`

Actions 366-370 documents, evidence, verifiers, tests, the Action 370 manifest, and minimal package-guard updates are preparation artifacts, not correction-scope expansion.

## Exact File Allowlist

The manifest's `preview_input_paths` is the canonical exact changed-file allowlist. It comprises the reviewed Action 365 35-path package, the approved corrections, Actions 366-370 static artifacts, and no other source.

## Exact File Denylist

Denied from changed input: post-trade artifacts, migrations, schema paths, proxy, middleware, Netlify configuration, environment files, provider/Supabase behavior, package/lock changes, additional application routes, generated outputs, and `node_modules`.

## Ownership Classifications

Use exactly `approved_preview_input`, `approved_baseline_dependency`, `unrelated_excluded`, and `unresolved_blocker`. Every frozen tree file is included and classified. Every relevant concurrent exclusion has source identity. No included file may be unresolved.

## Dependency Provenance

Trusted source: the lock-matched original workspace installation recorded by Actions 367 and 369, Node `v26.3.1`, npm `11.16.0`, Darwin arm64.

## Dependency Digest

Expected deterministic source and candidate digest: `44b4cad2882f45c4b0114848410f5b28105495812885239e34452da0d666ec91` across 26,100 entries and 447,449,795 logical bytes.

## Package and Lockfile Hashes

- `package.json`: `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58`
- `package-lock.json`: `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657`

Both remain unchanged before materialization, before freeze, and after validation.

## Registry-Prevention Method

The validation sandbox denies every non-loopback outbound connection and writes to the original worktree, failed candidate, and candidate package/lock files. Loopback is allowed only for Turbopack worker IPC. npm offline mode and Playwright browser-download suppression are mandatory.

## No-Install Guarantee

Installation command and lifecycle-install counts remain zero. Existing local package binaries may execute; package repair, fetch, rebuild, or browser download blocks preparation.

## Ordinary-Copy Fallback Prohibition

Dependency materialization stops on any `clonefile(2)` failure. No ordinary-copy, hardlink, external-symlink, or package-manager fallback exists.

## Route-Integrity Requirements

`app/api/runtime-health/ping/route.ts` remains SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`, with one exported `GET`, zero imports, exact body/headers, and no second introduced runtime route.

## Manifest Design

`docs/action-370-preview-deployment-input-manifest.json` uses canonical pretty JSON with two-space indentation, lexically sorted path inventories, and one terminal newline. It records every tree file, every changed input, relevant exclusions, inventories, dependency evidence, and pre-freeze results. The manifest cannot embed its own content hash or future commit SHA; external binding evidence supplies both after freeze.

## Pre-Freeze Validation

Required before commit: diff hygiene, typegen, TypeScript, complete build, lint, portable upstream/static gates, focused route and correction tests, route/inventory checks, dependency integrity, Git exclusion, and offline/fallback evidence. Context-bound historical decisions are represented without rewriting their historical status.

## Immutable Freeze Procedure

After all pre-freeze gates pass, stage only manifest-classified files and create one commit directly above the selected baseline. The message identifies preview preparation, non-production, runtime-ping-only, and not approved for main push. The commit is never amended.

## Revision Binding Evidence

After freeze, external deterministic evidence binds immutable candidate SHA, manifest SHA-256, route SHA-256, baseline SHA, clean-tree status, post-freeze results, Action 362 status, preview-attempt status, and no-push/no-deploy state. This avoids self-referential mutation.

## Post-Freeze Validation

Repeat the complete build/type/lint/static/focused stack against the exact frozen revision with cloned ignored dependencies. Verify commit diff, tree cleanliness, manifest/file hashes, dependency before/after integrity, route and runtime inventory, empty migration/schema/config/environment changes, registry prevention, original-worktree preservation, and failed-candidate preservation.

## Generated-Output Policy

`node_modules`, `.next`, test results, caches, logs, and temporary evidence are ignored local infrastructure. None may enter the immutable revision or deployment manifest.

## Rollback/Abandonment Strategy

Any pre-freeze failure leaves an uncommitted non-deployable context. Any post-freeze failure marks the immutable revision blocked without amendment. A separate cleanup may later discard it. Production rollback is unnecessary because no deployment occurs.

## Deployment Prohibition

No Netlify invocation, preview, production deployment, endpoint contact, alias, or promotion occurs. Action 362's attempt remains unused.

## Push/Main Prohibition

No push, merge, main update, or branch promotion occurs. The candidate remains local and not approved for main push.

## Final Preparation Decision

The committed document intentionally records `prepared_pending_external_binding`. The final verifier may return `prepared` only when external binding proves a clean immutable SHA and passing post-freeze validation. Otherwise it returns `blocked`; no commit is amended to change this text.
