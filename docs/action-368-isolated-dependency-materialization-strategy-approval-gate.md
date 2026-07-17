# Action 368: Isolated Dependency Materialization Strategy Approval Gate

## Gate Status

- approval_vocabulary: approved | approved_with_conditions | blocked
- approval_decision: approved_with_conditions
- selected_strategy: C_verified_copy_on_write_filesystem_clone
- dependency_materialization_performed: false
- corrected_candidate_created: false
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- production_blocked: true
- main_push_blocked: true

## Purpose

Select exactly one future dependency-materialization strategy that can put a complete trusted dependency tree physically inside a disposable isolated project root for a full Next/Turbopack build.

## Scope

This is a static approval gate. It records policy and evidence requirements only. It does not clone or copy dependencies, create a candidate, install packages, contact a registry, change Git state, invoke Netlify, or change runtime behavior.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`, with clean recovery base `512a0c5`. Production and main remain blocked.

## Upstream Dependencies

This gate builds directly on Action 309, Actions 318-320, Action 338, Action 344, Action 350, and Actions 358-367.

## Action 365 Failed Candidate Status

Candidate `8cfe239dc122d85770bfc86586f00716695915d1` at `/private/tmp/ture-action-365-preview-revision-51aced6` remains clean, unamended, unpushed, undeployed, permanently non-deployable, and preserved for audit.

## Action 366 Conditional Approval

Action 366 remains `approved_with_conditions`. Its approved source corrections are unchanged, but its dependency bridge assumption is superseded by the result of Action 367 and this gate.

## Action 367 Blocked Capability Result

Action 367 is accurately recorded as `blocked`. Module and binary resolution, read-only enforcement, network denial, typegen, TypeScript, lint, golden verification, and static Playwright worked. The complete build failed because Turbopack rejects a project `node_modules` symlink that resolves outside the filesystem root.

## Turbopack Filesystem-Root Restriction

Future dependencies must appear as physical files under `<isolated-project>/node_modules`. No external dependency bridge or filesystem-root escape is permitted. The complete Next/Turbopack build remains mandatory and Turbopack may not be disabled or changed.

## Action 362 Approval Status

Action 362 approval remains preserved. It authorizes at most one later preview-only attempt after all intervening gates pass; it does not authorize this Action to deploy.

## Preview-Attempt Status

`preview_attempt_consumed: false`.

## Explicit Non-Goals

No materialization, corrected candidate, install, package repair, registry request, route/config/package/lockfile change, commit, branch operation, push, deploy, provider access, Supabase access, replay, persistence, or scanner/ranking/learning/execution change occurs.

## Dependency-Materialization Requirements

The future mechanism must create a complete, disposable, physically local tree at `<isolated-project>/node_modules`; preserve source integrity; avoid symlink escapes and inode-sharing mutation; require no package-manager installation or network; preserve exact package/lock hashes and native compatibility; remain ignored, untracked, and absent from deploy input; and support the complete pre-freeze and post-freeze validation stack.

## Strategy Options Considered

| Option | Strategy | Decision | Reason |
| --- | --- | --- | --- |
| A | Physical read-only copy | rejected | Physical locality is sound, but blanket read-only permissions may prevent legitimate local tool caches or metadata writes and add avoidable validation uncertainty. |
| B | Physical writable copy with before/after integrity | rejected | Safe in principle, but duplicates roughly 447 MB and is less efficient than a verified isolated clone while offering no stronger source protection. |
| C | Copy-on-write filesystem clone under the isolated project root | selected with conditions | Provides physical locality and disposable destination writes without installation; clone isolation and Turbopack acceptance require one bounded capability proof. |
| D | Hardlinks to trusted dependencies | rejected | Shared inodes can propagate validation writes or metadata changes to the trusted source. |
| E | External symlink bridge | rejected | Action 367 proved that Turbopack rejects the external filesystem-root target. |
| F | Controlled exact-lock installation | rejected | Network policy, registry provenance, lifecycle behavior, exact reproduction, and auditability have not been separately proven. |
| G | Skip complete build or change/disable Turbopack | rejected | It weakens mandatory validation and changes the build contract. |

## Risk Comparison

Options A and B avoid filesystem-root escape but impose full-copy cost and either permission or drift-management risk. C has the lowest local cost while retaining physical locality, but only after source/destination inode isolation and filesystem support are proven. D has direct source-mutation risk. E is known incompatible. F adds supply-chain and lifecycle risk. G invalidates the gate.

## Selected Future Strategy

Select `C_verified_copy_on_write_filesystem_clone` only. A future, separately approved capability Action may test a native filesystem clone of the trusted `node_modules` into a disposable isolated project's own `node_modules`. The clone must behave as an isolated physical-local tree, not an external symlink, hardlink farm, or install result.

## Rejected Strategies

E and G are categorically rejected. D is rejected because shared inode writes can mutate source. F remains rejected absent separate offline provenance and lifecycle proof. A and B are safe fallback concepts only after a new approval gate; they are not approved fallbacks in the same Action.

## Trusted Dependency-Source Definition

The trusted source is the current workspace dependency root associated with the exact repository `package.json` and `package-lock.json`. Existing Action 367 evidence records 23,839 files, 447,449,795 bytes, and deterministic inventory digest `a9576999e30f6c5182cf26f68f38bb4803df27960dd09415e0975509bb88dd96`.

## Physical Project-Root Requirement

Destination files must resolve under the disposable isolated project root. `realpath` checks for the destination root and representative modules must stay inside that root. External symlink count must be zero.

## Git Exclusion Requirement

`node_modules` must remain ignored and untracked before, during, and after validation. No dependency file, cache, or generated dependency artifact may enter the immutable revision.

## Deployment-Input Exclusion Requirement

The deployment-input manifest must enumerate source independently and exclude `node_modules`, dependency caches, and generated validation outputs. Dependency presence in the local candidate directory is never evidence of deploy-input inclusion.

## Provenance Requirements

Pre-materialization evidence must record the classified source root, Node `v26.3.1`, npm `11.16.0`, `darwin`, `arm64`, package SHA-256 `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58`, lock SHA-256 `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657`, source inventory count/digest, representative resolution paths, native binary/addon inventory, source last-change evidence, and proof source is not mutated during materialization or validation.

## Integrity Requirements

Capture mechanism, start/completion timestamps, source/destination counts and deterministic digests, missing/extra counts, file-type differences, symlink inventory, external symlink count, measurable hardlink/inode-sharing evidence, permission differences, executable preservation, destination bytes, package/lock hashes before and after, tracked status, ignored status, and deploy-manifest exclusion. A deterministic inventory digest is acceptable; one monolithic content hash is not mandatory.

## Platform/Architecture Requirements

The capability and candidate validation must use the same `darwin`/`arm64` platform family and compatible Node/runtime toolchain as the trusted source. A platform mismatch or unusable native binary blocks the strategy.

## Package and Lockfile Compatibility Requirements

Source and candidate `package.json` and `package-lock.json` hashes must equal the approved hashes before materialization, after materialization, after validation, and after freeze. No dependency metadata repair is permitted.

## Read-Only Source Protection

The trusted source must be protected by OS-enforced write denial during clone creation and validation where practical. Its inventory digest, counts, bytes, package metadata, and representative files must be identical before and after. Any source drift blocks and abandons the context.

## Destination Mutability Policy

The disposable destination may be writable when tools require it, provided no write can propagate to source. Destination drift is measured and classified. Installation, repair, package mutation, or unexplained dependency drift blocks the candidate; classified transient caches remain ignored and excluded.

## Lifecycle-Script Policy

No install, prepare, preinstall, postinstall, package repair, browser download, or dependency lifecycle script may run. Normal execution of already materialized package binaries is allowed.

## Native-Binary Policy

Inventory native addons and package binaries before use. Every required binary must resolve under destination `node_modules`, preserve executable mode, match the trusted source, and execute on the recorded platform/architecture without download or rebuild.

## Symlink Policy

Internal package symlinks may be preserved only if their resolved targets stay within destination `node_modules` and match source inventory. External symlinks and a `node_modules` root symlink are forbidden.

## Hardlink Policy

No destination regular file may share a source inode. Measurable inode/link-count evidence must show no hardlink mutation channel. Any shared source/destination inode blocks the strategy.

## Copy Policy

Only the selected native copy-on-write clone mechanism may materialize dependencies. Silent fallback to ordinary copy, hardlink, symlink, or installation is forbidden. A fallback requires a new approval gate.

## Filesystem Metadata Policy

Preserve file type, executable bits, required permissions, package symlinks, and timestamps where the clone mechanism supports them. Classify expected metadata differences; unexplained or executable-affecting differences block validation.

## Generated-Artifact Policy

`.next`, test results, caches, traces, and other generated outputs remain ignored and excluded. Before freeze they are removed or explicitly classified; after freeze they may exist only as local validation evidence and must not change the source revision.

## Registry/Network Prohibition

The capability and candidate Actions must enforce no network and contact no package registry, provider, Supabase, Netlify, or application endpoint. A network attempt stops the Action.

## Fallback-Prevention Policy

Resolve representative modules and all required binaries from destination before validation. Missing modules, binary download prompts, package-manager fallback, repair, rebuild, or registry resolution stop immediately. No fallback strategy is authorized.

## Package-Manager Invocation Prohibition

No installation command or equivalent dependency mutation command may run. Repository scripts may execute existing local binaries only after exact resolution is proven.

## Candidate Preparation Ordering

1. Create a disposable isolated context.
2. Apply only Action 366-approved source corrections.
3. Verify package and lockfile hashes.
4. Materialize trusted dependencies physically inside the project root with the separately proven clone mechanism.
5. Prove dependency integrity and Git/deploy exclusion.
6. Run complete pre-freeze validation.
7. Remove or classify generated outputs.
8. Create a new immutable revision without `node_modules`.
9. Retain or recreate local ignored dependencies only as validation infrastructure.
10. Run complete post-freeze validation against the exact immutable source revision.
11. Confirm the source revision and trusted dependency source remain unchanged.
12. Stop without deployment.

Dependencies may remain physically present while the revision is created only when ignored, untracked, and proven absent from the revision and deployment manifest.

## Pre-Materialization Evidence

Record source classification, source path, inventory count/digest/bytes, package and lock hashes, runtime/tool versions, platform/architecture, representative module/binary paths, native inventory, source last-change evidence, candidate tracked status, ignore rules, and destination absence.

## Post-Materialization Evidence

Record every integrity field listed above plus physical-local `realpath` evidence, zero external symlinks, zero source/destination shared inodes, source before/after equality, destination mutability classification, and no install/network observations.

## Pre-Freeze Validation

Require typegen, no-emit TypeScript, complete Next/Turbopack build, lint, golden/static verifiers, relevant safety guards, and focused Playwright. Any skipped or weakened command blocks freeze.

## Post-Freeze Validation

Repeat the complete required stack against the exact immutable revision, regenerate only ignored evidence, verify route/source/manifest hashes, and prove the revision, package files, lockfile, dependency source, Git index, and deployment manifest remain unchanged.

## Cleanup/Abandonment Strategy

The isolated context and cloned dependencies are disposable. On any failure, mark the context non-deployable and preserve only bounded text/JSON evidence until separately approved cleanup. Never reuse a failed candidate or promote its materialized dependencies.

## Approval Vocabulary

Use exactly:

- `approved`
- `approved_with_conditions`
- `blocked`

## Deterministic Gate Conditions

`approved` requires a selected physical-local strategy plus proven clone isolation, provenance, source/destination integrity, no symlink/hardlink mutation risk, no install/network, exact package/lock hashes, Git/deploy exclusion, full Turbopack build capability, mandatory post-freeze validation, trivial cleanup, preserved failed candidate, and unconsumed preview attempt.

`approved_with_conditions` applies only when the strategy is safe on paper but one bounded local filesystem capability remains to be tested before candidate creation. `blocked` applies if installation/network is required, provenance or isolation fails, dependencies escape the root or enter Git/deploy input, source mutation is possible, build validation is weakened, or runtime/source changes are required.

## Approval Decision

Decision: `approved_with_conditions`.

Strategy C is selected, but no candidate may be created until a separate capability Action proves the native copy-on-write clone is supported, physically local, source-isolated, free of shared-inode mutation, inventory-equivalent, offline, ignored/untracked, excluded from deploy input, and accepted by the complete Next/Turbopack build.

## Passed Conditions

One strategy is selected; trusted provenance and expected hashes are known; external symlink, hardlink, install, and validation-skipping paths are rejected; source/destination integrity, Git/deploy exclusion, package-manager/network denial, full-build validation, ordering, abandonment, failed-candidate preservation, Action 362 preservation, and preview status are deterministic.

## Failed Conditions

None of the static policy conditions failed. This Action deliberately performs no capability execution.

## Unresolved Conditions

- native copy-on-write clone support and semantics on the target local filesystem
- proof that destination files share no mutable inode state with source
- source/destination inventory equality after clone
- destination physical locality and zero external symlinks
- complete Next/Turbopack build through that destination
- before/after source and destination drift evidence under full validation

## Next Permitted Action

Run a separate, bounded, local-only copy-on-write filesystem-clone capability verification. It may use a disposable non-candidate context and no network or installation, must produce the required integrity evidence, and must stop without creating a corrected candidate, revision, push, or deployment.
