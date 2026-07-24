# Action 369: Copy-on-Write Dependency Clone Capability Verification

## Capability Status

- capability_vocabulary: capable | capable_with_conditions | blocked
- capability_decision: capable
- selected_strategy: C_verified_copy_on_write_filesystem_clone
- corrected_candidate_created: false
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- deployment_performed: false

## Purpose

Verify whether a native copy-on-write clone can place the trusted dependency tree physically inside a disposable project root while preserving source isolation, offline validation, Git/deployment exclusion, and complete Next/Turbopack build capability.

## Scope

This was a local capability experiment only. It materialized dependencies in one disposable non-candidate context, captured bounded evidence, and ran validation. It did not apply Action 366 source corrections, create or freeze a candidate, change runtime source, install packages, contact external services, change Git history, push, or deploy.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`; recovery base `512a0c5` remains the historical safety boundary. Production and main remain blocked.

## Upstream Dependencies

Action 369 builds on Action 309, Actions 318-320, Action 338, Action 344, Action 350, and Actions 358-368.

## Action 365 Failed-Candidate Preservation

The failed candidate at `/private/tmp/ture-action-365-preview-revision-51aced6` remains clean at `8cfe239dc122d85770bfc86586f00716695915d1`, unamended, unpushed, undeployed, and permanently non-deployable.

## Action 366 Correction Status

No Action 366 source correction was applied. Its narrow correction scope remains reserved for a separately approved corrected-candidate preparation Action.

## Action 367 Blocked Result

Action 367 remains accurately `blocked`: its external read-only `node_modules` symlink resolved tools, but Turbopack rejected dependencies outside the project filesystem root.

## Action 368 Selected Strategy

Action 368 selected `C_verified_copy_on_write_filesystem_clone` with conditions. This Action tests only that strategy and permits no ordinary-copy, hardlink, external-symlink, or installation fallback.

## Action 362 Approval Status

Action 362 approval remains preserved. It does not authorize deployment in this Action.

## Preview-Attempt Status

`preview_attempt_consumed: false`.

## Explicit Non-Goals

No corrected candidate, source correction, revision freeze, commit, branch operation, push, Netlify invocation, endpoint call, provider/Supabase access, persistence, replay, package/lock/config/environment-file change, or scanner/ranking/learning/execution change occurred.

## Disposable Capability-Context Definition

`/private/tmp/ture-action-369-cow-capability` is a disposable, uncommitted, non-deployable, non-candidate context separate from the original worktree and failed candidate. It was based on committed source `15f9923c24ed1f3cf82d34656eeacbfd98a0d347` plus reviewed static gate artifacts only. Unrelated post-trade work was excluded.

## Trusted Dependency-Source Definition

The source is `/Users/willysimonsson/Dev/trade/node_modules`, paired with exact package hash `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58` and lock hash `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657` on Node `v26.3.1`, npm `11.16.0`, Darwin arm64.

## Selected COW Mechanism

A temporary native helper traversed the tree physically and called macOS `clonefile(2)` for every regular file. It created directories and reproduced internal symlinks without following them. There is no ordinary-copy fallback: any failed `clonefile` call stops materialization.

## Filesystem and Volume Information

Source and destination are on APFS device `/dev/disk3s5`, mounted through `/System/Volumes/Data`. Same-volume support was confirmed before materialization. The force-clone probe and all 23,839 regular-file clone calls succeeded.

## Physical-Locality Definition

Destination `realpath` and representative module/binary resolutions must remain under `/private/tmp/ture-action-369-cow-capability/node_modules`. The root is a physical directory, not a symlink; no resolution may escape to the trusted source or a global installation.

## Source/Destination Path Relationship

Source and destination are distinct absolute directories on the same APFS volume. Destination is nested in the disposable project root. They use different directory and regular-file inodes.

## Source-Integrity Strategy

The validation sandbox denied writes to the original repository and failed candidate. Source inventory, content digest, package/lock hashes, representative inode, file size, mode, mtime, and ctime were checked before and after materialization, a mutation probe, and validation.

## Destination-Integrity Strategy

The destination was inventoried immediately after clone, after mutation restoration, and after validation. Its complete deterministic digest, counts, content identities, types, permissions, executable bits, symlinks, and inodes were compared with source.

## Inode-Isolation Strategy

Every corresponding regular file's device/inode pair was compared. `unsafe_shared_inode_count: 0`. A representative source inode `140598313` and restored destination inode `156007963` further demonstrate separate file identity.

## Hardlink Detection

Full-tree device/inode comparison found no source/destination shared regular-file inode. Representative link counts were one. No hardlink mutation channel exists.

## Symlink Detection

Both inventories contain 26 symlinks. Symlink targets were recorded without traversal and compared by relative path.

## External-Symlink Detection

All symlink targets were resolved lexically against their containing directories. Source external count: zero. Destination external count: zero. Destination root symlink: no.

## COW Behavior Evidence

APFS clone support is not inferred from a generic copy command. Each regular file was created by a successful `clonefile(2)` call, which has no ordinary-copy fallback. A destination write then diverged independently while the source content and metadata remained exact.

## Destination-Write Isolation Test

The disposable destination copy of `node_modules/next/package.json` was modified temporarily. Its hash changed to `db37154155aac2005e85c68ec99d25638728850c0740e7d7d8f8d2f6f9ebb1d2`; the source remained `1ec03f46fd6a51b9adbc80b023f6e75223f0a7125b1394023d55841ca5ddf625` with unchanged inode, size, mode, mtime, and ctime. The destination file was discarded and recreated with `clonefile(2)`, restoring full inventory equality.

## Permission Preservation

Source and destination have identical permission summaries: 23,735 entries at `0644` and 2,365 at `0755`. Permission differences: zero.

## Executable-Bit Preservation

Both trees contain 104 executable regular files. Executable-bit differences: zero.

## Native-Binary Compatibility

Five Darwin arm64 `.node` binaries were preserved, including Next SWC, Sharp, Tailwind oxide, resolver binding, and Lightning CSS. The complete build loaded the native toolchain successfully.

## Package and Lockfile Hashes

Original and disposable `package.json` remained `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58`; `package-lock.json` remained `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657` before and after.

## Dependency Inventory Method

The deterministic inventory recursively sorts relative paths and records entry type, mode, logical size, regular-file SHA-256, or symlink target. Device/inode/link count are recorded separately for isolation analysis and excluded from the content-equivalence digest.

## Deterministic Source Digest

Source entry count: 26,100. Regular files: 23,839. Directories: 2,235. Symlinks: 26. Logical bytes: 447,449,795. Digest: `44b4cad2882f45c4b0114848410f5b28105495812885239e34452da0d666ec91` before and after.

## Deterministic Destination Digest

Destination counts and logical bytes are identical. Digest after clone, mutation restoration, and validation: `44b4cad2882f45c4b0114848410f5b28105495812885239e34452da0d666ec91`.

## Missing-File Detection

Missing files: zero.

## Extra-File Detection

Extra files: zero.

## File-Type Difference Detection

File-type differences: zero. Content differences: zero.

## Git-Ignore Evidence

The disposable context's `.gitignore` classifies `/node_modules`, `/.next/`, and `/test-results` as ignored.

## Git-Untracked Evidence

Dependency files returned zero entries from the context's tracked-file query. The context has no commit and is not a candidate.

## Deployment-Input Exclusion Evidence

The preserved Action 365 deployment manifest contains no `node_modules` preview path or included file. The Action 369 context is explicitly not deployment input, and no dependency path was added to any allowlist.

## Network and Registry Prevention

macOS `sandbox-exec` profile SHA-256 `6e96c8dbe68640a5ef85f88c666733bb045fd114050b4045c697877afc900d8a` denied every non-loopback outbound connection and writes to the trusted source, failed candidate, and context package/lock files. Loopback was permitted only for Turbopack worker IPC. npm offline mode was enabled.

- registry_access_prevented: true
- registry_access_not_observed: true
- registry_access_cannot_be_ruled_out: false

## Automatic Fallback Prevention

All required modules and binaries were resolved under destination before validation. The clone helper has no copy fallback. npm offline mode, outbound denial, fixed local binary paths, and post-validation inventories would expose installation, repair, or download drift. None occurred.

## Installation-Command Prohibition

Installation command count: zero. No package manager installation or repair command ran.

## Lifecycle-Script Prohibition

No install lifecycle script ran. Existing repository `build` and `lint` scripts executed only already-materialized local binaries.

## Module and Binary Locality

Next, TypeScript, ESLint, Playwright, React, Supabase JS, and Zod resolved below destination `node_modules`. Next, `tsc`, ESLint, and Playwright binaries also resolved there. No trusted-source, global, system-global, or external-symlink resolution occurred.

## Generated-Output Policy

`.next`, test results, temporary homes/caches, and panic logs from sandbox-policy tuning are generated capability evidence only. They are ignored or outside the project, excluded from deploy input, and do not alter dependency or source digests.

## Full-Validation Capability

- Next typegen: passed
- TypeScript no-emit: passed
- complete Next/Turbopack build: passed
- lint: passed with one pre-existing warning in the reviewed source snapshot
- Action 309 and golden/static safety verifier: passed
- Actions 318-320 guards: passed
- Action 369 focused Playwright: passed
- runtime-ping static and representative safety tests: passed

The first sandbox policy iterations intentionally over-blocked Turbopack loopback worker IPC. The final policy permits loopback only and denies non-loopback outbound access. The build also required two non-secret, non-routable Supabase public placeholders in process memory because no environment file was copied; no external connection was possible or attempted.

Historical verifiers whose decisions intentionally describe prior blocked/preparation states remain evidence inputs. Context-sensitive historical guards are validated in the original worktree rather than reinterpreted as candidate gates.

The complete Actions 338, 344, 350, 358-369, and 318-320 verifier chain was also executed inside the disposable context. Actions 309, 338, 344, 350, 366, 368, 369, and the golden verifier passed there. Actions 358-365 and 318-320 require historical Git graph, branch, or immutable-candidate identity that the deliberately uncommitted archive does not contain; Action 367 additionally verifies its earlier absolute symlink-bridge context. Those results are classified as context-binding failures, not dependency, COW, network, or build failures. Their portable/current counterparts passed from the original protected worktree.

## After-Validation Integrity

Source and destination inventories remain identical. Package/lock and route hashes remain exact. No external symlink, shared inode, dependency drift, install fallback, source mutation, candidate mutation, or unrelated-worktree mutation was observed.

## Cleanup and Abandonment Strategy

The context is retained temporarily as bounded capability evidence and remains non-deployable. A separately authorized cleanup may discard it, generated outputs, temporary clone helper, inventory helper, sandbox profile, and runtime temporary directories. It must never be promoted or reused as a candidate.

## Capability Vocabulary

Use exactly:

- `capable`
- `capable_with_conditions`
- `blocked`

## Deterministic Capability Conditions

`capable` requires native clone support, physical locality, no external bridge or unsafe inode sharing, destination-write isolation, equal inventories/digests, immutable package/lock files, Git/deploy exclusion, local resolution, enforced registry prevention, zero install commands, complete build and validation execution, unchanged source/candidate, no corrected candidate, and no deployment.

`capable_with_conditions` is limited to non-critical evidence-storage issues. `blocked` applies to clone fallback, external symlinks, hardlink/source mutation, unprevented registry access, installation, Turbopack dependency rejection, infrastructure build failure, or unprovable provenance/integrity.

## Capability Decision

Decision: `capable`.

The native APFS `clonefile(2)` strategy satisfies the Action 368 conditions. The result approves only the dependency capability for a later separately gated preparation Action; it does not create or approve a candidate or deployment.

## Passed Conditions

COW support, physical locality, source/destination integrity, inode isolation, symlink safety, destination-write isolation, permissions, executable bits, native binaries, package/lock integrity, Git/deploy exclusion, offline enforcement, local resolution, complete build, source/candidate preservation, and no-install/no-deploy boundaries passed.

## Failed Conditions

No deterministic capability condition failed. Early sandbox-policy attempts failed before build completion because loopback IPC was over-blocked; this was corrected without changing source or dependencies and is not the final capability result.

## Unresolved Conditions

No dependency-capability blocker remains. Action 366 source corrections, immutable candidate preparation, complete post-freeze validation, and any preview attempt remain future separately authorized work.

## Next Permitted Action

Create a separate corrected immutable preview candidate preparation approval/execution Action using only the Action 366 correction scope and the proven `clonefile(2)` strategy. It must re-capture integrity evidence, exclude dependencies from the revision/deploy manifest, run complete pre-freeze and post-freeze validation, preserve the failed candidate, and stop without deployment.
