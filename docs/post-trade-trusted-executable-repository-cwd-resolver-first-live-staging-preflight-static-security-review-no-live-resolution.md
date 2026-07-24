# Post-Trade Trusted Executable and Repository CWD Resolver Static/Security Review - No Live Resolution

## Decision

Decision: `post_trade_trusted_executable_repository_cwd_resolver_first_live_staging_preflight_static_security_review_ready_for_scoped_macos_process_observer_implementation`

Result: `post_trade_trusted_executable_repository_cwd_resolver_first_live_staging_preflight_static_security_review_completed_no_live_resolution`

Recommended next action: Action 525 - Implement Scoped macOS Process Observer Boundary, Without Live Process Observation.

## Files Reviewed

- `lib/post-trade-first-live-read-only-preflight-trusted-resolver-core.ts`
- `lib/post-trade-first-live-read-only-preflight-trusted-resolver.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-trusted-resolver.spec.ts`
- `docs/post-trade-trusted-executable-repository-cwd-resolver-first-live-staging-preflight-no-live-resolution.md`
- Adjacent reviewed contracts from Actions 507-522 for runner, authorization, execution boundary, credential boundaries, CLI-version collection, process executor, and macOS live-driver design.

## Architecture Findings

The resolver boundary remains deterministic, source-controlled, macOS-specific, staging-only, fixture-only, no-live-resolution, and fail-closed. The pure core models exact resolver identity, Git and Supabase executable policies, the Ture repository-CWD policy, candidate observations, candidate-set evaluation, executable and repository capabilities, TOCTOU revalidation contracts, sanitized evidence, compatibility summaries, deterministic SHA-256 fingerprints, and an inert future resolution plan.

The exported boundary imports `server-only`, has no default live resolver, and accepts only a fixture adapter shape. Adapter methods are not called by import, construction, validation, compatibility checks, fingerprinting, or inert planning.

## Structural Versus Live Findings

The review found no claim that fixture validity proves a live executable exists, a live repository exists, a path was resolved, provenance was verified live, TOCTOU was eliminated, spawn is authorized, the process driver may run, the runner may run, evidence was persisted, or authorization was consumed.

Fixture evidence preserves `fixtureOnly: true`, `observedLive: false`, `authoritativeLive: false`, `canEnableSpawn: false`, `canEnableRunner: false`, `provesExecutableExists: false`, and `provesRepositoryExists: false`.

## Resolver Identity Findings

The resolver identity is exact: `reviewed_macos_preflight_executable_and_cwd_resolver_v1`. Prefix, suffix, case variant, alias, generic, cross-platform, environment-selected, caller-selected, and fallback resolver variants are rejected. The registry binds the approved staging project `pdvzyuhykomwfqyyztru` and rejects production project `ekdyopdrrkphlrsilyoo`.

## Executable Registry And Candidate Findings

Git and Supabase policies bind exact component identities and basenames, regular executable file type, executable permission requirement, no wrappers, no script proxies, no aliases, no shell functions, no unresolved symlink, no unsafe writability, no ambiguous ownership, exact architecture and Rosetta posture, reviewed provenance, stable identity, short lifetime, and no fallback.

Candidate validation rejects path fields, PATH fields, home paths, usernames, raw owner/group IDs, raw device/inode/digest fields, raw signing/package metadata, generic trusted/verified/live-authority booleans, observed-live claims, unknown fields, unsafe symlinks, wrappers, script proxies, aliases, shell functions, unsafe permissions, ambiguous ownership, unsupported/unknown/ambiguous architecture, unreviewed Rosetta, unknown/untrusted/ambiguous provenance, stale/future observations, incomplete observations, caller-selected candidates, fallback candidates, production wrappers, and public path exposure.

During review, candidate-set evaluation was hardened to emit explicit blocking reasons for duplicate candidate IDs, duplicate stable identities, mixed resolver IDs, and mixed fixture sources. It still requires exactly one valid candidate and contains no ranking or selection heuristic.

## Architecture, Rosetta, Ownership, Permission, Symlink, And Provenance Findings

Architecture classifications remain explicit: `arm64_native`, `x86_64_native`, `x86_64_under_rosetta`, `universal_binary`, `unsupported`, `unknown`, and `ambiguous`. Unknown, ambiguous, and unsupported classifications block. Rosetta must be reviewed when present; caller-enabled or automatic Rosetta fallback is not modeled as allowed.

Ownership and permission are classification-based only; no raw owner IDs or path-based trust are accepted. Homebrew/npm-looking installation is not trusted by path alone and still requires reviewed provenance plus safe permission classification. Symlink handling accepts only no symlink, reviewed single symlink, or reviewed bounded chain structurally; unresolved, unsafe relative, loop, excessive-depth, changed-target, ambiguous, and unreviewed symlink states block.

Provenance remains a reviewed classification, not a path, basename, ownership, package-manager-looking directory, or caller string. Code-signing and package-manager evidence remain unresolved live gaps and are not overstated.

## Capability And Repository Findings

Executable capabilities are private fixture metadata, single-component, single-operation, single-driver, single-session, short-lived, single-use, fixture-only, observed-live false, revalidation-required, and unable to enable spawn or runner. Review hardening added direct checks that recomputed fingerprints cannot launder unsafe resolver IDs, candidate IDs, basenames, operation scopes, architecture, Rosetta, provenance, ownership, permission, or symlink states.

Repository policy binds the exact Ture repository identity, exact project classification, required repository markers, worktree requirement, no nested unrelated repository, no bare repository, no symlink root, no production checkout/reference, no caller path, staging-only context, short lifetime, and revalidation requirement. Repository observations and CWD capabilities reject generic repositories, wrong markers, alternate projects, production references, stale/future/incomplete observations, public paths, cross-session/cross-driver/cross-operation usage, reuse, spawn/runner enablement, and path-bearing capabilities.

## TOCTOU Findings

The TOCTOU contract compares stable identity, file type or repository markers, symlink chain, ownership or project identity, permissions or worktree, architecture, Rosetta, provenance, size/modification state, session, resolver, driver, and capability freshness. Only `unchanged` is structurally accepted.

The design still does not perform live revalidation and does not claim complete TOCTOU elimination. Changed, stale, incomplete, ambiguous, failed, mixed-session, or generic unchanged claims block.

## Adapter, Evidence, Fingerprint, And Compatibility Findings

The fixture adapter interface is exact and exposes no generic path lookup, stat, directory listing, file read, PATH read, environment read, shell, spawn, credential, raw path, generic trusted, or generic live-authority method. No default live adapter exists.

Sanitized evidence contains only classifications, opaque identities, decision state, fixture/live booleans, timestamps, and fingerprints. It excludes paths, cwd, PATH, home paths, usernames, owner/group IDs, device/inode values, raw code-signing output, raw package metadata, raw digest, environment values, credentials, secrets, cookies, session material, BankID, and JWT-like values.

Fingerprints use deterministic stable serialization with sorted object keys, array-order binding, exact lowercase 64-character SHA-256 strings, exact equality, no prefix/partial matching, and cycle rejection. During review, adversarial tests were added for maliciously recomputed fingerprints on unsafe candidate, capability, repository, evidence, path, token, and JWT-like values.

Compatibility checks preserve resolver identity, component identities, repository identity, architecture/Rosetta/ownership/permission/symlink/provenance policy, capability lifetime, stable identity policy, TOCTOU requirement, one process, one session, no retry, staging only, no shell, zero deployment, zero SQL, zero mutation, and zero adapter calls.

## Dependency Boundary Findings

The resolver modules do not import child process APIs, filesystem inspection APIs, PATH resolvers, environment readers, shell libraries, Git libraries, Supabase clients, package-manager clients, code-signing wrappers, credential providers, SQL/database clients, API/UI code, Avanza/browser code, or runtime execution code. The core imports only `node:crypto` plus reviewed pure contract modules.

## Tests Added Or Strengthened

Action 524 strengthened the focused resolver suite with:

- duplicate candidate ID and duplicate stable-identity checks
- mixed resolver and mixed observation-source candidate-set checks
- malicious recomputed-fingerprint checks for wrong resolver, wrong source, unsafe provenance, unknown operation scope, wrong repository identity, path leakage, service-role/token language, and JWT-like values
- explicit checks that unsafe recomputed objects remain invalid even with self-consistent SHA-256 fingerprints

## Changes Made During Review

- Hardened candidate-set evaluation to report duplicate candidate IDs, duplicate stable identities, mixed resolver candidates, and mixed source candidates.
- Hardened executable candidate validation to require exact resolver identity, exact component identity, exact expected basename, and the fixture adapter observation source.
- Hardened executable capability validation to require exact resolver identity, candidate identity, expected basename, reviewed operation scope, supported architecture, reviewed Rosetta, safe provenance, safe ownership, safe permissions, and safe symlink state.
- Hardened repository CWD capability validation to require exact resolver identity, exact repository identity, exact reviewed root classification, and reviewed operation scope.
- Added this static/security review artifact and updated the continuation summary.

## Remaining Risks And Gaps

The following remain intentionally unresolved and must not be treated as closed by this static review:

- no live PATH resolver
- no live filesystem adapter
- no executable stat or digest evidence
- no code-signing evidence
- no package-manager evidence
- no live repository-root verification
- no live CWD capability
- no executable or repository TOCTOU revalidation
- no process observer implementation
- no direct-spawn implementation
- no credential handoff
- no exact observed Supabase CLI version
- durable authorization consumption remains separate
- complete TOCTOU elimination remains impossible

## Readiness

The boundary is ready for a separate scoped macOS process-observer implementation with fixtures only. It is not ready for live PATH resolution, live filesystem resolution, live executable/repository verification, direct spawn, credential handoff, or first live staging preflight execution.

No live PATH inspection, `which`, `command -v`, filesystem inspection, executable resolution, repository resolution, file stat, file read, directory listing, Git metadata inspection, code-signing inspection, package-manager inspection, process spawn, Git command, Supabase command, version command, environment value read, credential access, remote connection, SQL, deployment, evidence persistence, authorization consumption, API/UI/runtime wiring, Avanza/browser automation, settlement retrieval, order behavior, live trade mutation, or live position mutation occurred.
