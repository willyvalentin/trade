# Action 366: Corrected Immutable Preview Candidate Preparation Approval Gate

## Gate Status

- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved_with_conditions
- failed_candidate_sha: 8cfe239dc122d85770bfc86586f00716695915d1
- failed_candidate_deployable: false
- failed_candidate_preserved: true
- new_candidate_created: false
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- dependency_strategy: A_trusted_local_read_only_reuse
- dependency_install_performed: false
- package_registry_contacted: false
- deployment_performed: false
- main_push_allowed: false

`approved_with_conditions` permits one later corrected-candidate preparation attempt after a final local capability check proves the selected dependency bridge is read-only, resolves every required tool from the candidate, prevents automatic install fallback, and changes no tracked file. Action 366 performs no repository operation or correction.

## Purpose

Freeze the exact correction and offline dependency boundary for one later replacement candidate while preserving the failed Action 365 revision unchanged and non-deployable.

## Scope

This action records failure classifications, a narrow correction allowlist, dependency options and evidence, replacement policy, and complete validation requirements. It adds only a static document, read-only verifier, focused test, and minimal package-guard classifications.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`; recovery base is `512a0c5`. No production, preview, provider, Supabase, or external application endpoint is touched.

## Upstream Dependencies

- Action 309
- Actions 318-320
- Action 338
- Action 344
- Action 350
- Actions 358-365

## Action 365 Result

Action 365 produced immutable candidate `8cfe239dc122d85770bfc86586f00716695915d1` from baseline `51aced66782ec9a37cd358238f02b6f5c0ae97bd`, with route SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb` and manifest SHA-256 `74b38f5a2d19cd55fec34a974abd86b60ec4eb0ad8bdf7057dd7d901c1803cb7`.

Its preparation decision is `blocked` because post-freeze validation failed. It is evidence, not a deploy input.

## Failed Candidate Identity

- revision: `8cfe239dc122d85770bfc86586f00716695915d1`
- parent: `51aced66782ec9a37cd358238f02b6f5c0ae97bd`
- manifest: `docs/action-365-preview-deployment-input-manifest.json`
- manifest SHA-256: `74b38f5a2d19cd55fec34a974abd86b60ec4eb0ad8bdf7057dd7d901c1803cb7`
- status: clean, local, immutable, unpushed, undeployed, non-deployable

## Failed Candidate Preservation Requirements

The failed revision must never be amended, rebased, rewritten, merged into, deleted, pushed, deployed, or reused as the parent of an implicit fixup. Its clone remains preserved for audit. A corrected candidate must be a new immutable revision prepared separately from the approved baseline and must explicitly classify the old revision as non-deployable.

## Action 362 Approval Status

Action 362 approval remains preserved. No later preview attempt has started.

## Preview-Attempt Status

`preview_attempt_consumed: false`. Failed preparation, static gating, dependency capability checks, and replacement preparation do not consume it.

## Known Validation Failures

1. Commit-level diff check found trailing blank lines in three Action documents.
2. Action 365's exclusion matcher classified approved Action 350 paths as excluded.
3. Action 363 required an excluded historical post-trade blocker file to exist.
4. The isolated clone lacked a deterministic local dependency-resolution mechanism.
5. Action 361 generated build/type evidence was unavailable because dependencies could not resolve.
6. Next entered an automatic dependency-install fallback, making package-registry contact uncertain even though no installation or tracked change occurred.

## Root-Cause Classifications

| Failure | Classification |
| --- | --- |
| Trailing blank lines | `source_formatting_defect` |
| Action 350 exclusion matcher | `verifier_contract_defect` |
| Action 363 historical blocker existence assumption | `historical_evidence_assumption_defect` |
| Unavailable isolated dependencies | `dependency_environment_defect` |
| Missing Action 361 build/type evidence | `generated_evidence_unavailable` |
| Possible package-registry fallback | `external_access_uncertainty` |

## Exact Permitted Correction Scope

Only the following future corrections are approved:

1. Remove the exact trailing blank lines at EOF from:
   - `docs/action-358-runtime-ping-only-route-implementation-readiness-review.md`
   - `docs/action-359-runtime-ping-only-route-implementation-approval-gate.md`
   - `docs/action-360-runtime-ping-only-route-implementation.md`
2. Narrow the Action 365 verifier's excluded Action matcher so Action 350 remains approved while Actions 351-357 remain excluded.
3. Narrow Action 363 verifier logic so documented historical blocker evidence may be satisfied by the frozen manifest's `unrelated_excluded` record without requiring that excluded file to exist.
4. Update only the focused Action 363 and Action 365 documentation/tests needed to prove those contracts.
5. Add Action 366 planning/verifier/test artifacts.
6. Update Actions 318-320 minimally to recognize Action 366 and classify concurrent unrelated artifacts without authorizing them.

## Exact Prohibited Correction Scope

No runtime route/body/header/method change, new runtime file, application behavior change, broad verifier rewrite, missing-file suppression, generic exclusion, weakened check, ignored failure, unrelated post-trade inclusion, proxy/middleware/Netlify/environment/migration/schema change, dependency-file commit, provider/Supabase access, persistence, replay, or scanner/ranking change is approved.

## Corrected Allowlist Requirements

The later candidate uses the Action 365 35-path allowlist, replacing Action 365 artifacts with corrected bytes only where listed above and adding Action 366 document/verifier/test plus a new candidate manifest. Every path remains explicitly classified. No directory-level or mutable-worktree copy is permitted.

## Corrected Ownership Classification Requirements

Use exactly `approved_preview_input`, `approved_baseline_dependency`, `unrelated_excluded`, and `unresolved_blocker`. Corrected files are `approved_preview_input`; the old candidate is `unrelated_excluded` from deploy input and retained as audit evidence. No included file may be `unresolved_blocker`.

## Historical-Evidence Verifier Requirements

Action 363 may accept the absent historical blocker file only when all are true: the document records its exact original path/line/error; the new manifest contains that exact path as `unrelated_excluded`; the entry has a source SHA-256 and `included: false`; and the prepared diff contains no copy of it. This is not a general missing-file waiver.

## Dependency-Resolution Options

### Option A: Trusted Existing Local Installation, Read-Only Reuse

Expose the existing lockfile-matched local dependency installation to the isolated context through a read-only, non-Git, pre-freeze bridge. Verify candidate-local resolution before invoking Next or npm. Record provenance and prevent writes or install fallback.

### Option B: Controlled Exact-Lockfile Installation Before Freeze

Prepare dependencies from the exact lockfile under a separately controlled network policy before freeze. This may be valid later but requires explicit registry/network approval absent from Action 366.

### Option C: Copy node_modules

Rejected unless provenance, exact lockfile correspondence, platform compatibility, immutability, and Git/deploy exclusion can all be proven. Broad copying is not approved by this gate.

### Option D: Automatic Next/npm Fetch

Rejected. Automatic fetching during post-freeze validation creates external-access uncertainty and may mutate tracked dependency metadata.

### Option E: Skip Validation

Rejected. Build, typecheck, golden, lint, verifiers, and Playwright remain mandatory.

## Selected Dependency Strategy

Select Option A with one final local capability condition. The trusted installation currently resolves `next`, `typescript`, `eslint`, and `@playwright/test`; however, the later action must prove candidate-local resolution through a genuinely read-only bridge before freeze.

If that proof fails or requires registry access, the corrected preparation is `blocked`. It may not fall back to Options B-D without a separate approval gate.

## Package-Registry Prohibition

No npm, Next, Playwright, or package-manager automatic install/fetch is allowed. Before any command capable of fallback, resolve and load all required packages from the approved local dependency source. A missing package stops preparation before validation.

## Offline/Reused Dependency Evidence Requirements

Record Node `v26.3.1`, npm `11.16.0`, package manager identity, dependency-source path policy, read-only enforcement, resolution paths for Next/TypeScript/ESLint/Playwright, network disabled status, registry-contact status, and proof no install fallback began.

## Dependency Integrity Requirements

The reused installation must correspond to package-lock SHA-256 `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657` and package.json SHA-256 `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58`. Record Node/platform compatibility and relevant package versions. Dependency storage must stay outside the revision and deploy input.

## Lockfile Integrity Requirements

Hash `package-lock.json` and `package.json` before dependency bridging, before freeze, and after validation. All hashes must remain exact. Any tracked dependency metadata drift blocks the candidate.

## Generated Artifact Policy

Generated `.next` and tool outputs may exist only as ignored validation artifacts. They must not enter the revision or manifest file tree. Any tracked generated drift blocks preparation. Action 361 evidence must be regenerated after freeze from the same candidate using the approved offline dependency source.

## Pre-Freeze Validation Requirements

Before creating a corrected revision: verify the exact correction diff, route hash, candidate-local package resolution, dependency read-only behavior, lockfile/package hashes, zero registry access, full file classification, commit-level diff cleanliness, and all feasible verifiers/tests. Automatic fallback must be impossible before Next runs.

## Post-Freeze Validation Requirements

Against the new immutable revision, run commit-level diff check, Next typegen, TypeScript, complete build, lint, Action 309, golden verifier, Actions 338/344/350/358-366, Actions 318-320, focused route tests, Playwright, route hash, runtime inventory, migration/schema/config/environment inventory, clean frozen status, and dependency evidence verification. No failure may become a warning.

## Candidate Replacement Policy

The corrected candidate must have a new immutable SHA and new manifest; retain the same route SHA and contract; identify `8cfe239dc122d85770bfc86586f00716695915d1` as non-deployable; contain no unresolved blockers; remain local, unpushed, and undeployed; and preserve the Action 362 attempt. It does not amend, replace, or delete the old revision as Git history.

## New Manifest Requirements

The new manifest must record baseline, new immutable binding, old failed candidate and manifest hashes, exact corrected file hashes, full ownership inventory, dependency strategy/evidence, package and lockfile hashes, generated-artifact exclusion, validation set, runtime/config inventories, preview state, and all no-effect flags.

## Failed-Candidate Retention Policy

The Action 365 clone remains clean at `8cfe239dc122d85770bfc86586f00716695915d1`. It is retained indefinitely until a separately approved archival/cleanup action. It must never be selected for deployment.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

`approved` requires frozen correction scope, preserved failed candidate, deterministic offline dependencies, proven read-only candidate resolution, no fallback path, and complete validation capability. `approved_with_conditions` applies when source scope is safe but the read-only candidate-local dependency capability needs one final proof. `blocked` applies if amendment, runtime change, weakening, unrelated inclusion, registry access, skipped validation, or unprovable dependency provenance is required.

## Approval Decision

Decision: `approved_with_conditions`.

The correction scope is exact and non-runtime. Dependency strategy A is selected, but its read-only candidate-local capability must be proven in the later preparation action before any corrected revision is frozen.

## Passed Conditions

- Failed candidate identity, cleanliness, hash, and non-deployable status are frozen.
- Action 362 approval and unconsumed attempt are preserved.
- All six failures have exact root-cause classifications.
- Source corrections are bounded and leave route behavior unchanged.
- Automatic fetch and validation skipping are rejected.
- Dependency provenance, integrity, lockfile, generated-evidence, and replacement contracts are explicit.
- No repository operation, installation, registry contact, external request, or deployment occurred in Action 366.

## Failed Conditions

Failed conditions: none for static correction-scope approval.

## Unresolved Conditions

- Candidate-local read-only dependency resolution has not yet been proven.
- Automatic-install fallback prevention has not yet been demonstrated in a replacement context.
- New candidate and manifest do not exist.
- Full post-freeze validation remains pending.
- Production, main push, and deployment remain blocked.

## Next Permitted Action

Create a separately approved Corrected Immutable Preview Candidate Preparation Action. It may perform only the frozen source corrections and a pre-proven read-only Option A dependency bridge, create one new immutable candidate and manifest, run complete post-freeze validation, preserve the failed candidate, and stop without push or deployment.
