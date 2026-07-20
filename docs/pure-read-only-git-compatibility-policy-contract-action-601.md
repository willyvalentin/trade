# Action 601 - Pure Read-Only Git Compatibility Policy Contract

Action 601 implements the smallest pure, fixture-only, deterministic compatibility policy contract for the exact approved read-only Git repository-observation capability set. It does not execute Git, observe a process, inspect a repository, implement a runner, grant repository-read/process/CLI authority, activate runtime/API/UI paths, read credentials or environment values, access the network, touch Avanza/trading behavior, persist data, run migrations, deploy, commit, push, or merge.

## Files

- Core: `lib/post-trade-pure-read-only-git-compatibility-policy-contract-core.ts`
- Tests: `tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts`

## Contract Identities

- contract kind: `pure_read_only_git_compatibility_policy_contract`
- contract ID: `ture.execution.pure-read-only-git-compatibility-policy-contract.fixture.v1`
- contract version: `1`
- boundary ID: `ture.execution.read-only-git-compatibility-policy.fixture-boundary.v1`
- policy ID: `ture.execution.read-only-git-observation-compatibility-policy.v1`
- capability-set ID: `ture.execution.read-only-git-repository-observation-capability-set.v1`
- semantic baseline ID: `ture.execution.git-semantic-baseline.2-39-0.major-2.v1`
- implementation-family policy ID: `ture.execution.git-implementation-families.upstream-and-apple.v1`

All identities are immutable and fingerprint-bound in the result.

## Policy Constants

The immutable source-controlled policy encodes:

- minimum version `2.39.0`;
- supported major family `2`;
- stable releases only;
- prerelease/development builds rejected;
- future majors rejected as above reviewed range;
- unknown vendors rejected;
- Apple build comparison mode `evidence_only`;
- no caller policy override.

## Implementation Families

Closed implementation-family model:

- `upstream_git`;
- `apple_git`;
- `unsupported_vendor_git`;
- `unknown`.

Only accepted generic parser evidence can classify as `upstream_git`. Only accepted Apple parser evidence can classify as `apple_git`. Unknown vendor suffixes and caller-selected family aliases fail closed.

Action 603 removed the unreachable `implementation_unsupported` status and `implementation_family_rejected` reason from the uncommitted v1 result/reason union. Future vendor-family expansion requires a new reviewed contract or policy version rather than widening this v1 input union.

## Input Schema

The public builder accepts one value:

`buildPureReadOnlyGitCompatibilityPolicy(input: unknown)`

The only accepted inputs are complete accepted parser result objects from:

- `ture.execution.pure-git-version-interpretation-contract.fixture.v1`;
- `ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1`.

The contract rejects raw version strings, caller semantic-version components, caller family, caller vendor, caller Apple build, caller policy, caller capability set, dependency injection, clock injection, and compatibility-result inputs.

Action 603 tightened nested array schema closure. Parser-result accepted-reason arrays and parser-evidence `argv` arrays must use `Array.prototype`, contain exactly their required indices plus `length`, contain no holes, contain no symbol properties, contain no accessors, contain no extra own string-key properties, contain no inherited enumerable properties, and contain no shadow properties such as `constructor`, `map`, or `filter`.

## Parser-Evidence Revalidation

The builder exact-checks parser result and evidence schemas, accepted parser status, parser identities, parser policy identities, source raw-completion linkage, source spawn fingerprint, executable `/usr/bin/git`, platform `macos`, fixed argv `["--version"]`, session, policy linkage, result fingerprints, evidence fingerprints, and security posture.

Fingerprint correctness is necessary but insufficient. Recomputed semantic/security forgeries still fail closed through explicit field checks.

## Generic Policy

Accepted generic upstream evidence must:

- come from the generic parser contract;
- contain no vendor suffix;
- be strict three-component stable output;
- meet `2.39.0`;
- remain in major family `2`.

`2.39.0`, `2.39.1`, `2.40.0`, and `2.99.99` satisfy the v1 policy. `2.38.9` and major `1` are below baseline. Major `3` is above reviewed range.

## Apple Policy

Accepted Apple evidence must:

- come from the Apple parser contract;
- carry exact Apple Git vendor evidence;
- include valid Apple build evidence;
- compare only upstream-equivalent semantic version to `2.39.0`;
- remain in upstream-equivalent major family `2`.

Apple build is retained as fingerprint-bound audit evidence. It is not a minimum, allowlist, or primary compatibility comparator.

## Result Union

Closed statuses:

- `input_rejected`;
- `version_below_baseline`;
- `version_above_reviewed_range`;
- `compatible_for_read_only_observation`.

The positive status is deliberately narrow. It is not named `compatible`.

## Reason Precedence

Deterministic precedence:

1. input schema closure;
2. contract identity;
3. parser result revalidation;
4. fingerprints;
5. source/executable/platform/policy linkage;
6. security/authority posture;
7. implementation-family classification;
8. stable-release posture;
9. reviewed major range;
10. minimum semantic version;
11. positive narrow compatibility result.

No free-form reasons are emitted.

## Capability Scope

Positive compatibility is scoped only to:

1. `rev-parse --show-toplevel`;
2. `rev-parse --show-object-format`;
3. `rev-parse --verify HEAD`;
4. `symbolic-ref --quiet --short HEAD`;
5. `status --porcelain=v1 -z --untracked-files=all --no-renames --ignore-submodules=none`.

It does not claim support for writes, arbitrary Git commands, network operations, credentials, or repository mutation.

## Fingerprint Model

The result fingerprint binds contract/policy identities, capability-set identity, implementation family, source parser identities and fingerprints, executable/platform/session/policy linkage, semantic version components, stable-release posture, Apple build evidence, baseline components, reviewed major, range/minimum decisions, status/reason, capability scope, and every false authority/runtime/live/TOCTOU field.

Fingerprints grant no provenance or authority.

## Authority and Semantic Limits

Every result retains:

- `authority:"none"`;
- `repositoryReadAuthorityGranted:false`;
- `mutationAuthorityGranted:false`;
- `processAuthorityGranted:false`;
- `observerAuthorityGranted:false`;
- `cliExecutionAuthorityGranted:false`;
- `compatibilityAuthorityGranted:false`;
- `runtimeAuthorityGranted:false`;
- `stagingAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`;
- `credentialAuthorityGranted:false`;
- `networkAuthorityGranted:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `authorizationConsumed:false`;
- `runtimeActivated:false`;
- `laterActivationEligibility:false`;
- `toctouEliminated:false`.

Even `compatible_for_read_only_observation` is a pure policy result only. It does not authorize repository inspection, process creation, runner activation, staging, deployment, or production readiness.

## Test Coverage

The focused suite covers generic baseline acceptance/rejection, Apple baseline acceptance/rejection, Apple build evidence-only posture, unsupported implementation inputs, rejected parser outputs, malformed release shapes through parser rejection, stale fingerprints, source linkage mutations, recomputed security forgeries, result consistency, complete explicit authority posture, nested array attack rejection, fingerprint binding, determinism, deep freeze, schema attacks, and runtime reachability. Action 603 expanded this suite from 34 to 133 tests.

## Export Surface and Runtime Unreachability

The core exports immutable identity/policy constants, closed types, and the pure builder. It imports no `server-only`, filesystem, `child_process`, process environment, network, credential, timer, observer, or runtime primitive. No API route, UI component, runner, cron, worker, resolver, revalidation adapter, direct-spawn adapter, neutralizer, or composition module imports it in Action 601.

## Blockers Before Runner Work

Before a repository-observation runner can be implemented or activated:

1. Action 602 static/security review;
2. Action 603 remediation;
3. independent final re-review;
4. repository-read authorization planning;
5. process authority planning;
6. dormant runner implementation review;
7. staging-only activation review;
8. deployment approval.

## Decision

Decision: `post_trade_pure_read_only_git_compatibility_policy_contract_ready_for_static_security_review`

Result status: `post_trade_pure_read_only_git_compatibility_policy_action_601_implemented_fixture_only`

Recommended next Action: Action 602 - Static Security and Contract Review of Pure Read-Only Git Compatibility Policy Contract.

No deploy is recommended for Action 601.
