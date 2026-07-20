# Action 367: Read-Only Dependency Bridge Capability Verification

## Capability Status

- capability_vocabulary: capable | capable_with_conditions | blocked
- capability_decision: blocked
- corrected_candidate_created: false
- dependency_install_performed: false
- dependency_copy_performed: false
- registry_access_prevented: true
- registry_access_not_observed: true
- registry_access_cannot_be_ruled_out: false
- action_362_approval_preserved: true
- preview_attempt_consumed: false
- deployment_performed: false

The read-only bridge resolves tools and runs most validation, but Turbopack rejects the external `node_modules` symlink. Because the complete build cannot execute, strategy A is not capable for corrected-candidate preparation in this form.

## Purpose

Prove or reject whether a disposable isolated context can execute the full validation stack using the trusted local dependency installation without installation, registry access, dependency mutation, copying dependencies into deploy input, or weakening validation.

## Scope

Capability verification only. No corrected candidate, commit, push, deployment, route change, package edit, lockfile edit, or application endpoint access occurs.

## Recovery Context

Production remains protected by rollback deploy `6a501645908e4100088b7396`; recovery base is `512a0c5`. The failed candidate remains permanently non-deployable.

## Upstream Dependencies

- Action 309
- Actions 318-320
- Action 338
- Action 344
- Action 350
- Actions 358-366

## Action 365 Blocked Result

Action 365 candidate `8cfe239dc122d85770bfc86586f00716695915d1` remains clean, unamended, unpushed, undeployed, and non-deployable.

## Action 366 Conditional Approval

Action 366 returned `approved_with_conditions`, requiring proof that trusted local dependencies can be reused read-only with automatic registry fallback prevented and the full stack executable.

## Failed Candidate Preservation

Before and after capability execution, the failed candidate SHA remained exact and its status remained clean. It was never used as the capability context.

## Action 362 Approval Preservation

Action 362 approval remains preserved.

## Preview-Attempt Status

`preview_attempt_consumed: false`.

## Dependency Strategy Under Test

Strategy A: trusted existing local installation exposed through an ignored symbolic-link bridge under an OS-enforced read-only/network-denied sandbox.

## Trusted Dependency Source Definition

The source is the existing workspace `node_modules` associated with the exact current `package.json` and `package-lock.json`. It contains 23,839 files and 447,449,795 bytes; metadata SHA-256 before and after was `a9576999e30f6c5182cf26f68f38bb4803df27960dd09415e0975509bb88dd96`.

## Isolated Capability-Test Context

A disposable local clone under `/private/tmp` was based on committed source `15f9923c24ed1f3cf82d34656eeacbfd98a0d347`. It is not the failed candidate, original worktree, corrected candidate, deployment input, preview, or production environment. No commit was created.

## Original-Worktree Protection

The sandbox denied writes to the complete original repository path, including trusted dependencies. Original HEAD remained `15f9923c24ed1f3cf82d34656eeacbfd98a0d347` during capability execution. Concurrent non-Action work remains separately classified.

## Read-Only Bridge Design

The context used a Git-ignored `node_modules` symbolic link. macOS `sandbox-exec` policy SHA-256 `09bcb17b9717a3fd1808911537ceacd25a382141f84fb33ea711d9e71c572785` denied all network access, denied writes to the original repository/dependency source, denied candidate package/lockfile writes, and denied package-manager and Playwright cache writes.

A write canary was rejected with `Operation not permitted`; no canary file existed afterward.

## Node Version

Node executable `/opt/homebrew/bin/node`, version `v26.3.1`, platform `darwin`, architecture `arm64`.

## npm Version

npm executable `/opt/homebrew/bin/npm`, version `11.16.0`.

## Package Manager Identity

Package manager: npm, using repository scripts only. Installation command count: zero.

## package.json SHA-256

Source and context: `7ff6ae8890b52d4879ce88248c22f152fffab327e8a5ef3a92eccccad217ef58` before and after.

## Lockfile Path and SHA-256

`package-lock.json` source and context: `859f498ee4d7d64259ad07d6117e25e284a29bd7d7169126100564fe90943657` before and after. Dependency-root `.package-lock.json`: `bdf96ee3a6c06e13434a631db7e920464f84ea2d0685d87ea753ab7acf8bbaf2` before and after.

## Dependency-Root Path Policy

The absolute source path is recorded only in the bounded evidence artifact. The bridge target stays outside Git and deploy input; no dependency directory is copied.

## Dependency Provenance

The source installation matches the repository package and lock hashes. Key package versions are Next `16.2.6`, TypeScript `5.9.3`, ESLint `9.39.4`, and Playwright Test `1.60.0`.

## Module-Resolution Evidence

Sandboxed candidate-local resolution found `next`, `typescript`, `eslint`, and `@playwright/test` only under the intended trusted dependency root. No user-global or system-global package supplied these modules.

## Binary-Resolution Evidence

Next, `tsc`, ESLint, and Playwright binaries resolved through the context bridge to the corresponding trusted package binaries. Exact paths are in the evidence JSON.

## Read-Only Enforcement Evidence

OS sandbox enforcement denied writes to the dependency source. Before/after file count, bytes, metadata hash, dependency lock hash, and key package hashes were identical.

## Tracked-File Integrity Evidence

Package and lock files remained unchanged. Capability validation introduced no unexpected tracked drift. Five deliberate setup paths were present to run current static guards/tests; `.next`, `node_modules`, and `test-results` were ignored outputs.

## Lockfile Integrity Evidence

Source/context hashes matched before and after. No package-manager metadata write occurred.

## Package-Registry Isolation Strategy

The OS sandbox used `(deny network*)`; npm and Playwright cache paths were also write-denied. Thus registry access was prevented, not merely unobserved.

## Fallback-Prevention Strategy

All required modules and exact binaries were resolved before invoking tools. Network, package metadata writes, dependency-root writes, npm-cache writes, and Playwright-cache writes were denied. No automatic install fallback was observed.

## Network-Observation Limitations

The evidence establishes process-level sandbox denial for tested commands, not a machine-wide network monitor. Within that boundary: `registry_access_prevented: true`, `registry_access_not_observed: true`, `registry_access_cannot_be_ruled_out: false`.

## Validation Command Boundary

Only typegen, no-emit TypeScript, build, lint, golden/static verifiers, representative safety verifiers, and focused static Playwright tests ran. No provider, Supabase, preview, production, or application endpoint was requested.

## Validation Capability Results

- module and binary resolution: passed
- read-only write denial: passed
- Next typegen: passed
- TypeScript no-emit: passed
- complete build: failed dependency bridge capability
- build failure: Turbopack rejects a project `node_modules` symlink pointing outside the filesystem root
- lint: passed
- golden verifier: passed
- Actions 309, 318-320, 338, 344, 350, 358-360, 362-364: passed
- Action 361: failed because complete build manifest/generated route evidence was unavailable after build failure
- Action 360 Playwright: runner worked; seven static tests passed, two localhost tests were blocked by intentionally absent `.env.local`
- Action 366 Playwright: runner worked; ten static tests passed, one upstream Action 361 evidence test failed

These failures are dependency-bridge/generated-evidence limitations, not missing module resolution and not corrected-source validation.

## Generated-Artifact Policy

Generated `.next` and `test-results` remained ignored and outside any candidate. No generated artifact was committed or treated as deploy input.

## No-Install Guarantee

No installation command ran. No package, dependency root, package manifest, lockfile, or cache changed.

## No-Copy Guarantee

`node_modules` was linked, not copied. The bridge remained ignored and external to Git.

## No-Deploy-Input Inclusion Guarantee

The disposable context is not a candidate. Dependencies and generated outputs are excluded from any future manifest or deploy input.

## Cleanup/Abandonment Strategy

The blocked disposable context and external evidence remain available for inspection. No automatic deletion or cleanup occurs. A separately authorized cleanup may remove them later.

## Capability Vocabulary

Use exactly:

- `capable`
- `capable_with_conditions`
- `blocked`

## Deterministic Capability Conditions

`capable` requires full build and every required validation tool to execute through the enforced bridge. `capable_with_conditions` permits only non-critical evidence-storage gaps. `blocked` applies when the complete build cannot execute, even if other tools resolve and run.

## Capability Decision

Decision: `blocked`.

The bridge is read-only, offline, provenance-matched, and useful for most tools, but Turbopack's filesystem-root rule prevents the complete build. Strategy A in symbolic-link form cannot support corrected-candidate preparation.

## Passed Conditions

Dependency provenance, hashes, module/binary resolution, write denial, network denial, typegen, TypeScript, lint, golden verification, static Playwright execution, original protection, failed-candidate preservation, no install, and no deployment all passed.

## Failed Conditions

- complete production build executable through bridge: failed
- Action 361 generated build evidence: failed as a consequence
- full required validation stack executable: failed

## Unresolved Conditions

- no approved dependency strategy currently supports the complete isolated build
- Option C remains unapproved
- corrected candidate and manifest do not exist
- production, main push, and deployment remain blocked

## Next Permitted Action

Create a separate dependency-strategy approval gate evaluating a provenance-preserving local dependency materialization that Turbopack accepts, without registry access, deploy-input inclusion, or mutation of the trusted source. No corrected candidate may be created until that gate succeeds.
