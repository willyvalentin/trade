# Action 523 - Trusted Executable and Repository CWD Resolver Boundary, No Live Resolution

## Purpose

Action 523 implements a source-controlled resolver boundary for future trusted resolution of Git CLI identity, Supabase CLI identity, and the reviewed Ture repository-root CWD identity. This action remains fixture-only and no-live-resolution.

Implemented files:

- `lib/post-trade-first-live-read-only-preflight-trusted-resolver-core.ts`
- `lib/post-trade-first-live-read-only-preflight-trusted-resolver.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-trusted-resolver.spec.ts`

No PATH inspection, filesystem inspection, executable path resolution, live file metadata read, code-signature inspection, package-manager metadata inspection, repository inspection, process spawn, Git command, Supabase command, version command, environment value read, credential access, remote connection, SQL, deployment, evidence persistence, or authorization consumption occurred.

## Architecture

The implementation is split into:

1. Pure resolver core:
   - exact resolver registry
   - executable-resolution policies
   - repository-resolution policy
   - fixture candidate observations
   - fixture repository observations
   - candidate-set evaluation
   - fixture executable capability metadata
   - fixture repository-CWD capability metadata
   - TOCTOU revalidation contracts
   - sanitized public evidence
   - compatibility validators
   - deterministic fingerprints
   - inert future resolution plan

2. Server-only resolver boundary:
   - imports `server-only`
   - exposes no default live resolver
   - accepts only an injected fixture-adapter shape
   - performs no adapter call on import or construction
   - exposes no arbitrary path or filesystem object interface
   - keeps live resolution disabled

## Resolver Identity

Resolver identity:

`reviewed_macos_preflight_executable_and_cwd_resolver_v1`

It binds:

- macOS platform
- Git component identity
- Supabase component identity
- Ture repository-root identity
- exact architecture and Rosetta policy
- exact candidate policy
- exact ownership, permission, symlink, provenance, and stable identity policies
- exact expiry policy
- no PATH fallback
- no caller path
- no shell lookup
- no generic filesystem lookup
- no automatic fallback
- no live implementation

Generic, cross-platform, prefix/suffix, case-variant, caller-selected, and environment-selected resolver forms are rejected.

## Executable Registry And Policies

The executable policy registry includes exact entries for:

- `git_cli` with expected basename `git`
- `supabase_cli` with expected basename `supabase`

Each policy requires regular executable classification, executable permission, reviewed architecture policy, reviewed Rosetta policy, reviewed provenance policy, stable file identity, and a short capability lifetime.

Each policy rejects wrappers, script proxies, aliases, shell functions, unresolved symlinks, world-writable executables, world-writable parent directories, ambiguous ownership, unsupported or unknown architecture, unreviewed Rosetta, unknown provenance, multiple matches, fallback, and public paths.

## Candidate Observations

Executable candidate observations are fixture-only and may include opaque candidate id, component identity, basename classification, file-type classification, executable permission classification, symlink classification, symlink-depth classification, wrapper/script classifications, ownership classification, parent-permission classification, architecture classification, Rosetta classification, provenance classification, stable-file-identity classification, size/modification classifications, optional digest classification, source identity, timestamps, completeness, and authoritative fixture flags.

Public fixture evidence never contains absolute path, home directory, username, PATH, device id, inode, raw owner id, raw group id, raw signing output, raw digest, or file contents.

## Candidate-Set Evaluation

Candidate-set evaluation fails closed unless exactly one candidate is valid for the requested component.

It blocks zero candidates, multiple candidates, mixed component candidates, basename mismatch, alias/function/wrapper/script candidates, unsafe or ambiguous symlinks, symlink loops, excessive depth, changed symlink target, world-writable executable or parent, ambiguous ownership, unknown file type, unsupported/unknown/ambiguous architecture, unreviewed Rosetta, unsafe provenance, stale/future/incomplete/non-authoritative observations, caller-selected candidates, fallback candidates, and production-specific wrappers.

No first-candidate, shortest-path, system-path, package-manager-path, or newest-version preference exists.

## Architecture And Rosetta Policy

The resolver models:

- `arm64_native`
- `x86_64_native`
- `x86_64_under_rosetta`
- `universal_binary`
- `unsupported`
- `unknown`
- `ambiguous`

Rosetta states are modeled separately. Reviewed Rosetta can be structurally accepted only when explicitly classified; unknown or unreviewed Rosetta blocks.

Architecture is never inferred from basename or path.

## Ownership, Permission, Symlink, And Provenance Policies

Ownership and permission are classifications only; raw user/group ids are excluded.

Reviewed user-owned installations, such as a reviewed Homebrew classification, can be structurally represented only with explicit reviewed provenance, non-world-writable executable, non-world-writable containing directory, and stable ownership classification. User ownership is not automatically trusted.

Symlink policy permits only no symlink, reviewed single symlink, or reviewed bounded chain. Unresolved, unsafe relative, looping, excessive-depth, cross-volume, changed-target, or ambiguous chains block.

Provenance is classification-based and does not rely on path alone. Unknown, untrusted, or ambiguous provenance blocks.

## Stable File Identity

The resolver models private stable-file-identity metadata through sanitized fingerprints. Public evidence exposes only sanitized identity fingerprint, completeness, freshness, and revalidation requirement.

Raw filesystem identifiers are not exposed.

## Executable Capabilities

Fixture executable capability metadata binds:

- resolver identity
- component identity
- opaque executable id
- expected basename
- architecture and Rosetta classifications
- provenance, ownership, permission, and symlink classifications
- stable-file-identity fingerprint
- resolver evidence fingerprint
- boundary session
- driver identity
- operation scope
- issued/expires timestamps
- single-use state
- fixture-only / observed-live false
- revalidation requirement
- spawn disabled
- runner disabled

Cross-component, cross-operation, cross-session, cross-driver, expired, reused, changed identity, changed symlink, changed architecture, changed provenance, and changed permission cases are rejected.

## Repository Resolver

The repository policy binds the Ture repository identity:

`ture_trade_repository_root`

It requires reviewed project classification, repository marker, Git worktree classification, no nested unrelated repository, no bare repository, no symlink root, no production checkout, no caller path, no public absolute path, staging-only context, short capability lifetime, and revalidation.

No `/Users/...` path or local absolute path is hardcoded or exposed.

## Repository Observations And CWD Capabilities

Repository observations are fixture-only and include opaque repository id, repository identity, root classification, Git worktree classification, marker classifications, nested repository classification, symlink classification, production-reference classification, stable-directory identity classification, observation source, timestamps, completeness, and fixture flags.

Repository-CWD capabilities bind the resolver, repository identity, opaque repository id, root classification, stable-directory fingerprint, evidence fingerprint, boundary session, driver identity, operation scope, issued/expires timestamps, single-use state, fixture-only state, observed-live false, revalidation requirement, spawn disabled, and runner disabled.

## TOCTOU Revalidation

The revalidation contract models executable and repository revalidation as fixture observations only.

Executable revalidation requires same private executable identity, file type, symlink chain, ownership, permissions, architecture, Rosetta classification, provenance, size/modification state, boundary session, resolver, driver, and unexpired capability.

Repository revalidation requires same private directory identity, markers, Git worktree classification, symlink classification, project identity, no new production reference, same session, and unexpired capability.

Only `unchanged` can structurally pass. Changed, stale, incomplete, ambiguous, or failed revalidation blocks.

The contract does not claim metadata rechecks eliminate TOCTOU.

## Fixture Adapter Boundary

The server boundary accepts an injected fixture adapter shape only:

- collect executable candidate fixture observations
- collect repository fixture observation
- collect fixture revalidation observation
- dispose fixture transient metadata

The adapter shape rejects generic path lookup, stat, directory listing, file read, PATH read, environment read, shell command, process spawn, and credential methods.

No default live adapter exists. No adapter call occurs on import, construction, validation, compatibility, or inert planning.

## Sanitized Evidence

Sanitized resolver evidence records target identity, decision classification, candidate count classification, architecture, Rosetta, file type, ownership, permission, symlink, provenance, identity completeness, fixture-only true, observed-live false, authoritative-live false, issued/expires timestamps, and fingerprint.

It cannot enable spawn or runner and cannot prove a live executable or repository exists.

It excludes path, PATH, cwd path, home path, username, owner id, group id, device id, inode, raw signature output, package-manager output, raw digest, credentials, and environment.

## Structural Versus Live Semantics

The resolver distinguishes:

- structurally valid fixture observation
- structurally valid fixture capability
- live executable resolved
- live repository resolved
- TOCTOU revalidated live
- spawn authorized

Fixture evidence remains `fixtureOnly: true`, `observedLive: false`, `authoritativeLive: false`, incapable of enabling spawn, incapable of enabling runner, incapable of proving executable existence, and incapable of proving repository existence.

## Compatibility

Compatibility validators remain pure and exact against:

- Actions 521-522 live-driver design
- Actions 519-520 process-executor boundary
- Actions 517-518 CLI-version collector
- Actions 513-516 credential boundaries
- Actions 509-512 authorization and execution boundaries
- Actions 507-508 runner

Compatibility preserves resolver identity, component registry, executable identities, repository identity, architecture/Rosetta/ownership/permission/symlink/provenance policies, capability lifetime, stable identity policy, TOCTOU requirement, one process at a time, one session, no retry, staging only, no shell, zero deployment, zero SQL, zero mutation, and zero adapter calls.

## Fingerprints

The resolver adds deterministic SHA-256 fingerprint builders for registry, executable policy, repository policy, candidate observation, candidate set, executable capability, repository capability, revalidation, sanitized evidence, and compatibility.

Fingerprints use stable serialization, canonical key order, array-order binding, lowercase 64-character SHA-256, exact comparison, and no partial/prefix fallback. Cycles and unsupported sensitive values are rejected.

## Inert Plan

The inert future resolution plan:

1. validates resolver boundary
2. validates driver-design compatibility
3. validates process-executor compatibility
4. validates version-collector compatibility
5. validates authorization compatibility
6. requires separately reviewed live resolver adapters
7. collects exact executable candidates in a future action
8. requires exactly one valid Git candidate in a future action
9. requires exactly one valid Supabase candidate in a future action
10. collects exact repository-root observation in a future action
11. constructs private executable capabilities
12. constructs private repository-CWD capability
13. requires immediate TOCTOU revalidation before spawn
14. emits sanitized resolver evidence
15. stops without spawning a process

The plan contains no path, PATH, cwd, command, filesystem operation, environment value, credential, PID, raw metadata, SQL, deployment, or retry.

## Remaining Gaps

The following remain unresolved and require future gates:

- live resolver adapter implementation
- PATH-resolution implementation
- filesystem metadata implementation
- executable path resolution
- code-signing/provenance inspection
- package-manager metadata inspection
- repository verification implementation
- live TOCTOU revalidation
- exact observed Supabase CLI version
- scoped macOS process observer
- direct-spawn/termination driver
- live credential source adapter

## Safety Confirmation

No PATH inspection, `which`, `command -v`, filesystem inspection, executable path resolution, file stat, file read, directory listing, code-signature inspection, package-manager inspection, live Git repository inspection, child-process import, process spawn, Git command, Supabase command, version command, environment value read, credential access, Keychain inspection, remote connection, SQL, deployment, Git/database mutation, evidence persistence, authorization consumption, API/UI/runtime wiring, Avanza/browser automation, path printing, or secret printing occurred.

## Decision

`post_trade_trusted_executable_repository_cwd_resolver_first_live_staging_preflight_ready_for_static_security_review`

## Result

`post_trade_trusted_executable_repository_cwd_resolver_first_live_staging_preflight_added_no_live_resolution`

## Recommended Next Action

Action 524 - Perform Static and Security Review of Trusted Executable and Repository CWD Resolver Boundary.
