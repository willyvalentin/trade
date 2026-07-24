# Trusted Live Resolver Adapter Boundary

## Purpose

Action 527 adds a deterministic, fixture-only trusted live resolver adapter boundary for future macOS executable and repository-root resolution. It does not implement live resolution. It models the contracts a future reviewed resolver must satisfy before any process driver or runner can use resolved executable or repository evidence.

## Architecture

The boundary has four layers:

- Pure contract layer: exact identities, policies, capabilities, requests, fixture observations, evidence, results, compatibility, and fingerprints.
- Pure validation/classification layer: strict validators, structural path validation, candidate-set classification, executable/repository selection, authority/completeness derivation, and evidence generation.
- Injected fixture adapter: evaluates only caller-supplied fixture candidates.
- Server-only boundary: guarded by `server-only`, fixture-only, no ambient live resolver or singleton.

No layer reads PATH, reads environment values, inspects the filesystem, resolves symlinks, checks ownership live, checks architecture live, checks Rosetta live, runs Git, runs Supabase, spawns processes, persists evidence, consumes authorization, or enables runner behavior.

## Exact Identity

`ture.execution.trusted-live-resolver-adapter.fixture.v1`

- platform: `macos`
- implementation mode: `fixture_only`
- source model: `injected_fixture`
- policy version: `1`

A future live resolver must use a different exact identity and a separate reviewed Action.

## Exact Policies

- `first_live_read_only_executable_resolution_v1`
- `first_live_read_only_repository_root_resolution_v1`

The executable policy disables PATH search, filesystem inspection, environment PATH, shell lookup, current-working-directory lookup, relative paths, home expansion, glob/wildcard matching, symlink target selection, retries, live capability issuance, process start, and runner enablement.

The repository policy disables filesystem inspection, current-working-directory discovery, parent traversal, Git command discovery, environment roots, relative paths, home expansion, glob/wildcard matching, retries, live repository capability issuance, Git operation enablement, process start, and runner enablement.

## Capability Model

Three fixture capability types are modeled:

- resolver-session capability;
- executable-candidate capability;
- repository-candidate capability.

Each capability is immutable, session-bound, expiry-bound, fingerprinted, fixture-only, and backed by module-private runtime provenance. Structurally cloned plain objects are rejected. Capability types are not interchangeable.

## Fixture Path Semantics

Paths are structural fixture strings only. They are not live-verified paths.

Structural path validation requires an absolute macOS-style path and rejects relative paths, empty paths, NUL/control characters, newlines, carriage returns, unexpanded `~`, environment interpolation, glob metacharacters, duplicate slashes, dot segments, parent traversal, URLs, command substitution, shell separators, unsupported non-ASCII/Unicode separator or control forms, and overlong paths.

The implementation does not call `path.resolve`, `realpath`, filesystem canonicalization, home expansion, or symlink resolution.

## Approved-Root Scope

Executable root classes:

- `system_usr_bin`
- `homebrew_opt`
- `homebrew_bin`
- `approved_application_support_tooling`

Repository root class:

- `reviewed_workspace_root`

Root compatibility is derived from exact policy, root class, expected root fingerprint, structural path segment-boundary checks, and fixture scope evidence. Prefix collisions such as `root-evil` are rejected. Caller-supplied `approved: true` or `trustedRoot: true` is rejected.

## Executable Identity

Executable fixture identity models:

- exact candidate ID;
- exact boundary session;
- structural path;
- basename;
- approved-root class and fingerprint;
- expected tool identity: `git` or `supabase_cli`;
- filesystem object type;
- executable permission state;
- ownership state;
- provenance state;
- symlink state;
- architecture state;
- Rosetta state;
- evidence freshness.

It does not model file descriptors, stat objects, raw UID/GID, process-start permission, shell output, or live executable handles.

## Repository Identity

Repository fixture identity models:

- exact candidate ID;
- exact boundary session;
- structural root path;
- reviewed workspace root class;
- approved-root fingerprint;
- directory object type;
- exact reviewed repository marker state;
- ownership state;
- provenance state;
- symlink state;
- evidence freshness.

Repository identity is not inferred from `.git` strings, path suffixes, directory names, current working directory, or Git output.

## Evidence Models

Executable evidence stays sanitized and fixture-qualified:

- `fixtureOnly: true`
- `observedLive: false`
- `authoritativeLive: false`
- `provesExecutableExistsLive: false`
- `provesExecutableTrustedLive: false`
- `issuesLiveExecutableCapability: false`
- `enablesProcessStart: false`
- `enablesPreflightRunner: false`

Repository evidence stays sanitized and fixture-qualified:

- `fixtureOnly: true`
- `observedLive: false`
- `authoritativeLive: false`
- `provesRepositoryExistsLive: false`
- `provesRepositoryTrustedLive: false`
- `issuesLiveRepositoryCapability: false`
- `enablesGitOperation: false`
- `enablesProcessStart: false`
- `enablesPreflightRunner: false`

## Cardinality

The first policies require exactly one candidate. Zero candidates block. Multiple candidates block. Incomplete or ambiguous candidate sets are ambiguous. The adapter does not select the first candidate, sort candidates as fallback, or deduplicate candidates into approval.

## Authority and Completeness

Authority is always `fixture_structural_only`. Completeness is derived by validators and classifiers. Complete fixture evidence remains nonauthoritative. Caller-provided authority, trusted, resolved, or completeness fields are rejected.

## Freshness and Session Consistency

All time is injected. Capabilities, requests, fixture observations, evidence, and results are session-bound and expiry-checked. No ambient clock is read. No durable anti-replay claim is made; replay resistance is structural, expiry-bound, and session-bound only.

## Fingerprints

Deterministic SHA-256 fingerprints use domain-separated canonicalization for identity, executable policy, repository policy, resolver-session capability, executable candidate capability, repository candidate capability, executable request, repository request, executable fixture, repository fixture, executable evidence, repository evidence, executable compatibility, repository compatibility, executable result, and repository result.

## Compatibility

Compatibility is structural only:

- trusted resolver design: compatible but not live-resolver enabling;
- process executor: compatible but no executable authority issued;
- live-driver design: compatible but direct spawn disabled;
- process observer: session model compatible and no process capability created;
- CLI-version collector: compatible but no version command enabled;
- credential boundary: no credential access;
- authorization: no authorization issue or consumption;
- runner: not runner-enabling.

## Prohibited Behavior

| Property | Action 527 fixture resolver |
| --- | --- |
| Validates fixture executable candidates | Yes |
| Validates fixture repository candidates | Yes |
| Reads PATH | No |
| Reads filesystem | No |
| Resolves symlinks | No |
| Checks live ownership | No |
| Checks live architecture | No |
| Runs Git | No |
| Issues live executable capability | No |
| Issues live repository capability | No |
| Enables process start | No |
| Enables runner | No |

## Future Live Plan

The inert plan records that a future live resolver requires separate review of filesystem API selection, PATH policy if ever allowed, absolute executable paths, symlink handling, ownership semantics, macOS permissions, architecture inspection, Rosetta inspection, repository-marker verification, Git-free repository identity where possible, raw path containment, TOCTOU mitigation, live capability issuance, server-only runtime integration, staging validation, and a final live gate.

No live filesystem library or live resolver mechanism is selected in Action 527.
