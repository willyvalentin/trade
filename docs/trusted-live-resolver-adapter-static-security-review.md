# Trusted Live Resolver Adapter Static Security Review

## Executive Summary

Action 528 reviewed the Action 527 trusted live resolver adapter boundary under hostile static-security assumptions. The boundary remains deterministic, fixture-only, server-only at the runtime adapter boundary, source controlled, capability scoped, session bound, expiry bound, clone resistant, noninterchangeable, ambiguity preserving, fail closed, and unable to issue live executable or repository authority.

The review found three correctable defects and closed them in source:

- High: approved-root scope relied on modeled fixture scope without independently checking structural path segment boundaries.
- Medium: supported `supabase_cli` executable requests were validated against the default `git` fixture identity.
- Medium: cyclic malformed request input could throw during request validation instead of returning a closed validation result.

No critical findings remain. The review decision is `approved`.

## Worktree State

Action 528 created a dedicated security-review regression suite and review artifacts. It modified only the trusted resolver adapter implementation and documentation needed to close confirmed review defects. No live resolver, filesystem/PATH inspection, process execution, Git/Supabase invocation, API/UI wiring, persistence, credential access, or authorization consumption was added.

## Files Reviewed

- `lib/post-trade-trusted-live-resolver-adapter-core.ts`
- `lib/post-trade-trusted-live-resolver-adapter.ts`
- `tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts`
- `docs/trusted-live-resolver-adapter-boundary.md`
- `docs/trusted-live-resolver-adapter-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- Related contracts for process driver, observer, CLI-version collector, credential boundary, authorization, and runner compatibility.

## Architecture Summary

The adapter has a pure fixture core and a server-only wrapper. The core models identities, policies, capabilities, requests, fixture observations, evidence, compatibility, and fixture results. The wrapper imports `server-only`, creates no singleton live resolver, and exposes only fixture boundary construction.

## Trust-Boundary Map

Trusted values are source-controlled identity constants, exact policies, deterministic fingerprints, and module-private WeakSet provenance. Untrusted values are all caller-supplied requests, fixture observations, candidate arrays, timestamps, and arbitrary nested values. Validation recomputes fingerprints, rejects unknown fields, rejects prohibited keys, checks runtime provenance, and derives authority/completeness rather than accepting caller claims.

## Export Inventory

Reviewed export count: 77 total exports.

| Export group | Count | Trust effect | Live ability | Review result |
| --- | ---: | --- | --- | --- |
| Runtime server boundary | 4 | Constructs fixture-only server boundary | None | Pass |
| Constants and identities | 7 | Exact resolver/policy/time/domain constants | None | Pass |
| Types | 43 | Compile-time contracts only | None | Pass |
| Builders/factories | 18 | Build frozen fixture contracts/capabilities/requests/evidence | None | Pass after corrections |
| Validators | 8 | Fail-closed structural validation | None | Pass after corrections |

## Dependency Review

Production adapter files import `node:crypto`, the process-driver boundary session constant, and `server-only` in the wrapper. Static review found no production imports or invocation paths for filesystem APIs, PATH inspection, cwd/environment reads, symlink resolution, ownership/permission/architecture/Rosetta inspection, shell/process spawning, Git, Supabase, SQL, network clients, timers, workers, or credential access. String literals naming `git`, `supabase_cli`, and capability properties are fixture/schema values, not invocations.

## Resolver Identity Review

Confirmed exact identity:

`ture.execution.trusted-live-resolver-adapter.fixture.v1`

Confirmed exact fields:

- `resolverKind: trusted_live_resolver_adapter`
- `platform: macos`
- `implementationMode: fixture_only`
- `sourceModel: injected_fixture`
- `policyVersion: 1`

The identity is deeply frozen and fingerprinted. No caller-selected live identity or platform mode exists.

## Policy Review

Confirmed policies:

- `first_live_read_only_executable_resolution_v1`
- `first_live_read_only_repository_root_resolution_v1`

Both policies are deeply frozen, fingerprinted, exact, and reject unknown policy IDs. They prohibit path search, environment/cwd discovery, filesystem inspection, shell lookup, Git discovery, retries, live capability issuance, process start, and runner enablement. No policy merge, inheritance, or caller override path exists.

## Capability-Provenance Review

Three separate module-private WeakSets back resolver-session, executable-candidate, and repository-candidate capability provenance. Capabilities are deep-frozen before registration. Plain-object forgery, clone/spread copies, JSON-style copies, cross-type substitution, cross-session substitution, expiry replay, and mutation after issuance fail validation.

## Path-Validation Review

Structural fixture path validation is pure string validation. It rejects relative paths, empty paths, NUL/control characters, newline/carriage return, URLs, home/env expansion, shell controls, command substitution, glob characters, duplicate slashes, `.`/`..` segments, overlong paths, and unsupported non-ASCII/Unicode separator or control forms. It does not call `path.resolve`, `path.normalize`, `realpath`, or the filesystem.

## Approved-Root Review

Action 528 corrected approved-root validation to require both modeled fixture scope and structural segment-boundary checks against the exact source-controlled root class/fingerprint pair. Prefix collisions such as `/usr/bin-evil/git` and `/Users/reviewed/workspace/trade-evil` now fail closed with `approved_root_mismatch`.

## Executable-Identity Review

Allowed tool identities remain exactly `git` and `supabase_cli`. The review corrected canonical request validation so `supabase_cli` binds to its own fixture identity rather than the default `git` identity. Executable validation requires exact candidate identity fingerprint, root class, basename, regular-file structure, executable permission evidence, expected ownership, approved provenance, non-symlink state, approved architecture, approved Rosetta state, same session, and fresh injected evidence.

## Repository-Identity Review

Repository trust is not equivalent to `.git` marker existence. Repository validation requires the exact reviewed repository identity fingerprint, exact reviewed workspace root class, exact directory structure, `modeled_exact_reviewed_repository`, expected ownership, approved provenance, non-symlink state, same session, and fresh injected evidence.

## Candidate-Cardinality Review

Exact-one semantics are preserved. Zero candidates block when complete, incomplete candidate sets remain ambiguous, and two or more candidates block. The adapter never sorts, deduplicates, or selects the first candidate from multiple candidates.

## Request Review

Requests require exact request kind/version/id, boundary session, resolver identity fingerprint, policy ID, operation, resolver-session capability, expected identity fingerprint, expected root class, injected timestamps, `attempt: 1`, and `retryPolicy: none`. Unknown fields, prohibited nested keys, caller authority, caller completeness, trusted/safe/resolved flags, PATH/cwd/search roots, commands, shells, and live proof fields fail closed.

## Recursive-Key Review

Recursive prohibited-key and sensitive-material scans traverse nested objects and arrays and use WeakSet cycle tracking. Action 528 corrected canonical request comparison so cyclic malformed request input returns validation errors instead of throwing.

## Fixture-Semantics Review

Fixture inputs and outputs remain:

- `fixtureOnly: true`
- `observedLive: false`
- `authoritativeLive: false`

Attempts to claim live observation, authority, live existence proof, live trust proof, live capability issuance, Git enablement, process-start enablement, or runner enablement are blocked and never propagated to result authority.

## Authority Review

Runtime authority is fixed to `fixture_structural_only`. Caller identity matches, policy matches, complete fixture evidence, and matching fingerprints do not elevate authority. No reachable factory returns live authority.

## Completeness Review

Completeness is derived from candidate set, path/root scope, object type, permissions, ownership, provenance, symlink state, architecture/Rosetta where applicable, repository marker where applicable, freshness, and contradictory evidence. Unknown evidence remains ambiguous or blocked; complete fixture evidence remains nonauthoritative.

## Freshness Review

All evaluation time is injected. The implementation does not use ambient clocks. Capabilities, requests, observations, and evidence include issuance/capture/expiry fields, and stale or malformed injected times fail closed.

## Session/Replay Review

Session binding is checked across resolver-session capabilities, requests, candidate capabilities, observations, evidence, compatibility, and results. Replay protection is structural only: session-bound, expiry-bound, and fingerprint-bound. No durable nonce consumption is claimed.

## Evidence-Sanitization Review

Evidence excludes raw UID/GID, mode bits, stat/lstat objects, file descriptors, shell output, environment, credentials, arbitrary filesystem metadata, and live handles. Structural paths are labeled as sanitized fixture structural paths and are not live capabilities.

## Fingerprint Review

Reviewed 16 domain-separated SHA-256 fingerprint domains. Fingerprints are lowercase 64-character hex strings and cover identity, policies, capabilities, requests, fixtures, evidence, compatibility, and results. Regression tests cover trust-critical mutations for session, path/root, ownership, provenance, symlink, architecture, Rosetta, repository marker, completeness, and reasons through the original and review suites.

## Canonicalization Review

Canonicalization sorts object keys and preserves array order. Action 528 added safe comparison/fingerprint helpers for validator paths so unsupported cyclic input fails closed rather than escaping through an exception. Builder fingerprint helpers remain deterministic for supported source-controlled builder inputs.

## Compatibility Review

Compatibility with trusted resolver design, process executor, live-driver design, process observer, CLI-version collector, credential boundary, authorization, and runner remains structural only. It does not enable live resolution, process start, Git operation, credential access, authorization consumption, preflight runner execution, or readiness.

## Server-Only Review

The runtime wrapper begins with `import "server-only";`. Static import review found no API route, Trade UI, client component, runner, or shared barrel importing the runtime adapter. The pure core is testable and side-effect free except for creating in-memory provenance entries when explicit fixture capability builders are called.

## Side-Effect Review

No production resolver module performs PATH inspection, environment reads, cwd reads, filesystem reads, symlink resolution, ownership/permission/architecture/Rosetta inspection, shell invocation, process spawning, Git, Supabase, SQL, credential access, network access, persistence, telemetry, timers, workers, authorization mutation, runner invocation, API invocation, or UI mutation.

## Immutability Review

Security-critical identity, policies, capabilities, requests, observations, evidence, results, arrays, and reason arrays are deep-frozen at construction. Registered capabilities are frozen before WeakSet registration.

## Test Review

The original Action 527 suite was reviewed and retained. Action 528 added `tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts` with 12 focused adversarial regression tests covering supported `supabase_cli`, approved-root prefix collisions, Unicode/shell/path rejection, runtime provenance, clone resistance, immutability, cyclic input, live-claim blocking, cardinality blocking, compatibility non-readiness, production dependency absence, and API/UI isolation.

## Validation Results

- Implementation-only filesystem/process static searches: passed; no live invocation paths found. The Supabase search returned fixture/schema literals (`supabase_cli`, fixture basename/path), not command invocation paths.
- Unsafe live-flag search: passed; no production `true` live proof/enablement flags found.
- `npx playwright test tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts --reporter=dot`: 12 passed.
- `npx playwright test tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts --reporter=dot`: 479 passed.
- `npx playwright test tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts --reporter=dot`: 491 passed.
- `npx playwright test tests/e2e/post-trade-*.spec.ts --reporter=dot`: 1512 passed.
- `./node_modules/.bin/tsc --noEmit`: passed.
- Scoped lint for Action 527/528 files: passed.
- `npm run lint`: failed on pre-existing generated `.netlify` artifacts and unrelated warnings; no scoped lint issue in Action 527/528 files.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed without printing values.
- `find docs -type f -size 0`: passed.

## Documentation Review

Action 528 updated the boundary documentation to avoid overstating root and Unicode behavior. Documentation now clearly distinguishes fixture structural compatibility from live resolver authority and states that no live path verification occurs.

## Findings Table

| ID | Severity | Area | Finding | Evidence | Correction | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TLRA-528-01 | High | Approved roots | Modeled root scope was not independently tied to structural path segment boundaries. | Prefix-collision review of executable and repository fixture validation. | Added exact root-class/fingerprint segment-boundary checks and regressions. | Closed |
| TLRA-528-02 | Medium | Request identity | `supabase_cli` requests were validated against the default `git` canonical request. | Validator derived default executable identity without using request tool. | Validator now derives expected canonical identity from supported requested tool. | Closed |
| TLRA-528-03 | Medium | Malformed input | Cyclic malformed request could throw during request validation. | New cyclic-input regression initially failed. | Added safe canonical comparison/fingerprint helpers and null guards. | Closed |
| TLRA-528-04 | Low | Documentation | Boundary docs did not explicitly state Unicode rejection and segment-boundary root checks. | Documentation comparison after hardening. | Updated boundary documentation. | Closed |

Zero critical findings remain. Zero high findings remain. Zero unresolved medium findings remain.

## Corrections Made

- Hardened structural path validation to reject unsupported non-ASCII/Unicode path forms.
- Added approved executable/repository root segment-boundary validation with exact root fingerprints.
- Fixed executable request validation for `supabase_cli`.
- Added fail-closed canonical comparison for cyclic malformed request input.
- Added Action 528 review regression suite.
- Updated boundary documentation.

## Residual Risks

- The adapter remains fixture-only and cannot prove live executable or repository existence.
- No live filesystem API, symlink policy, ownership semantics, architecture/Rosetta inspection, TOCTOU strategy, or live capability issuance has been selected.
- Replay resistance is structural/expiry/session based only; no durable nonce consumption exists.
- Future live resolver work must use a separate identity and separate review gate.

## Mandatory Security Assertions

All 50 mandatory security assertions passed after corrections. No false or uncertain assertions remain.

## Final Decision

`approved`

`post_trade_trusted_live_resolver_adapter_first_live_staging_preflight_static_security_review_approved`
