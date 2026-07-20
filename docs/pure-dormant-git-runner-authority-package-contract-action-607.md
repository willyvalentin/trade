# Action 607 - Pure Dormant Git Runner Authority Package Contract

## Scope

Action 607 implements the smallest pure, fixture-only, deterministic authority-package issuance contract for a future dormant read-only Git repository-observation runner.

The implementation is in `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts`. It creates or rejects one immutable sequence-scoped authority package from explicit fixture evidence and explicit timestamps only.

No server-only wrapper, consumption contract, persistence adapter, runner, runtime caller, Git execution, process creation, process observation, repository inspection, credential access, environment access, network access, Avanza/trading behavior, migration, deployment, commit, push, or merge was added.

## Identities

- Contract kind: `pure_dormant_git_runner_authority_package_contract`
- Contract id: `ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1`
- Contract version: `1`
- Boundary id: `ture.execution.dormant-git-runner-authority-package.fixture-boundary.v1`
- Authority policy id: `ture.execution.dormant-git-runner.repository-read-process-authority.policy.v1`
- Capability-set id: `ture.execution.read-only-git-repository-observation-capability-set.v1`
- Expiry policy id: `ture.execution.dormant-git-runner-authority-expiry-policy.v1`
- Fixed-duration id: `ture.execution.dormant-git-runner-authority-fixed-duration.30s.v1`
- Freshness policy id: `ture.execution.dormant-git-runner-authority-freshness-policy.v1`
- Time representation id: `ture.execution.utc-iso8601-ms-time-representation.v1`

All identities are source-controlled, immutable, and fingerprint-bound. Caller-defined identities are rejected.

The remediated v1 contract also emits `authorityPolicyFingerprint`, a deterministic SHA-256 fingerprint over a complete frozen canonical authority-policy model. The model explicitly binds contract and policy identities, executable and sequence policy, retry/fallback/cache posture, expiry/freshness requirements, process posture, allowed and denied authorities, every stage definition, retention policy references, initial package state, replay/storage limitations, and runtime semantic limits. That fingerprint is included in every stage grant, the issued package, and the final result.

## Source-Controlled Policy

The internal policy fixes:

- executable: `/usr/bin/git`;
- platform: `macos`;
- maximum process attempts: `6`;
- one process at a time: `true`;
- retry count: `0`;
- fallback allowed: `false`;
- cache substitution allowed: `false`;
- authority lifetime: `30000` ms;
- expiry extension allowed: `false`;
- grace period: `0`;
- refresh allowed: `false`;
- automatic reissue allowed: `false`;
- runtime activation: `false`;
- mutation, network, credential, arbitrary filesystem, and write-command authority: `false`;
- TOCTOU eliminated: `false`.

No caller policy object, duration, command list, output limit, cwd, executable, runtime state, dependency injection, clock provider, or consumed state is accepted.

## Input Schema

The input is an exact closed fixture object containing:

- contract and boundary identity;
- source-controlled authority policy identity;
- capability-set identity;
- sequence identity;
- package id;
- `issuedAt`;
- `expiresAt`;
- session;
- platform;
- source policy identity/version;
- executable resolution evidence;
- executable revalidation evidence;
- compatibility policy result;
- approved worktree evidence.

Unknown top-level fields, symbols, accessors, exotic prototypes, arrays, class instances, malformed timestamps, malformed fingerprints, caller stage arrays, caller command/cwd/duration/limit/state/authority, dependency injection, and clock providers reject before package construction.

Action 609 tightened this from enumerable-key checking to descriptor-based exact schema closure. Action 611 further closed prototype-chain array attacks. Validated objects must have exactly the approved own string keys, data-property descriptors, no symbols, no accessors, no non-enumerable extras, no exotic prototypes, and no inherited enumerable fields. Validated arrays must have exactly `length` plus canonical indexes, no holes, no symbols, no extra enumerable or non-enumerable properties, no shadowed methods, no inherited enumerable prototype-chain properties, and exact expected element values.

## Timestamp and Expiry

Timestamps must use exact UTC millisecond ISO-8601 form:

`YYYY-MM-DDTHH:mm:ss.sssZ`

The contract requires:

`expiresAt - issuedAt = 30000 ms`

It rejects `29999` ms, `30001` ms, timezone offset variants, missing milliseconds, invalid calendar dates, expiry before issuance, and noncanonical equivalent timestamps.

Because the boundary is pure, accepted fixture timestamps do not prove live time provenance and do not prove the package is currently unexpired.

## Prerequisite Revalidation

The contract validates:

- executable resolution evidence has exact trusted-resolver fixture identity, accepted `/usr/bin/git`, exact resolver policy fingerprint, no blocking/ambiguity, and no live authority;
- executable revalidation evidence has exact immediate-pre-spawn revalidation identity, production-marked direct-spawn-compatible provenance `server_only_private_original_object`, observation source `server_only_lstat`, exact composition adapter linkage, accepted `/usr/bin/git`, exact point-in-time-only posture, no spawn/filesystem/observer/credential/network/runner authority, no process, no shell, and exact fingerprint;
- compatibility result is final-approved read-only Git compatibility, status `compatible_for_read_only_observation`, exact capability set, exact `/usr/bin/git`, no general Git or write-command compatibility, and complete no-authority posture;
- approved worktree evidence is exact pure aggregate worktree linkage, with no repository-read authority, no runtime activation, and no TOCTOU claim.

Fingerprint correctness is necessary but insufficient. Semantic authority and linkage fields are checked separately.

Actions 609 and 611 expanded prerequisite validation so accepted-looking resolution, production-marked revalidation, compatibility, and worktree evidence with recomputed fingerprints still rejects if any trust, lifecycle, authority, runtime, live-claim, retry/fallback, policy, identity, source-linkage, provenance, or TOCTOU field contradicts the approved posture.

## Shared Linkage

The package requires exact equality across applicable evidence for:

- session;
- platform;
- executable `/usr/bin/git`;
- source policy identity/version;
- resolver evidence fingerprint;
- approved worktree fingerprint;
- observation-sequence identity;
- capability-set identity.

Mismatches fail closed with deterministic reasons.

## Stage Grants

The issued package contains six immutable initial stage grants:

| Index | Stage identity | Argv | Output |
| --- | --- | --- | --- |
| 0 | `git_repository_root_v1` | `["rev-parse", "--show-toplevel"]` | text |
| 1 | `git_object_format_v1` | `["rev-parse", "--show-object-format"]` | text |
| 2 | `git_head_before_v1` | `["rev-parse", "--verify", "HEAD"]` | text |
| 3 | `git_branch_state_v1` | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | text |
| 4 | `git_porcelain_status_v1` | `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]` | bytes |
| 5 | `git_head_after_v1` | `["rev-parse", "--verify", "HEAD"]` | text |

Each grant has one process-creation grant, one exact read-only Git CLI grant, one approved-worktree repository-read grant, one output-retention grant, one evidence-construction grant, `consumed:false`, `retryCount:0`, and `fallbackAttempted:false`.

No grant authorizes another stage, reordered stage, repeated stage, pathspec, alternate executable, alternate cwd, shell, environment inheritance, retry, fallback, network, credential, write command, runtime caller, observer, or deployment.

## Initial Package State

The issued package state is exact:

- `packageState:"issued"`;
- `currentStageIndex:0`;
- `consumedStageCount:0`;
- `remainingStageCount:6`;
- every stage grant `consumed:false`;
- `terminal:false`;
- `activeConsumer:false`;
- `retryCount:0`;
- `fallbackAttempted:false`;
- `replayDetected:false`;
- `revoked:false`;
- `expired:false`.

The pure issuance contract does not mutate consumed state. Partially consumed and terminal states belong to a later consumption contract.

## Output Retention

Text stage limits come from the approved simple observation completion policy:

- repository root: `1024` stdout bytes;
- object format: `8` stdout bytes;
- HEAD stages: `65` stdout bytes;
- branch state: `256` stdout bytes;
- stderr: `0` bytes.

The byte porcelain-status stage uses:

- stdout: `65536` bytes;
- stderr: `0` bytes;
- combined: `65536` bytes.

No caller-supplied limits are accepted.

## Result Union

The closed issuance result union is:

- `input_rejected`;
- `prerequisite_rejected`;
- `compatibility_rejected`;
- `worktree_rejected`;
- `expiry_policy_rejected`;
- `authority_package_issued`.

`authority_package_issued` means only that a fixture-only initial package satisfying the issuance contract was constructed. It does not mean authority was consumed, a process may currently run, runtime is activated, replay is prevented, repository state is safe, or TOCTOU is eliminated.

## Reasons and Precedence

Reasons are closed and deterministic:

- `input_contract_rejected`;
- `input_identity_rejected`;
- `input_fingerprint_rejected`;
- `package_id_rejected`;
- `timestamp_grammar_rejected`;
- `expiry_delta_rejected`;
- `executable_resolution_rejected`;
- `executable_revalidation_rejected`;
- `executable_linkage_rejected`;
- `compatibility_result_rejected`;
- `compatibility_linkage_rejected`;
- `worktree_evidence_rejected`;
- `worktree_linkage_rejected`;
- `capability_set_rejected`;
- `session_linkage_rejected`;
- `platform_linkage_rejected`;
- `policy_linkage_rejected`;
- `sequence_identity_rejected`;
- `authority_conflict_rejected`;
- `authority_package_issued`.

Precedence follows input schema, identity, package id/timestamps, expiry delta, executable resolution, executable revalidation, compatibility, worktree, shared linkage, capability set, authority posture, stage construction, package consistency, fingerprints, then positive issuance.

## Fingerprints

SHA-256 fingerprints bind contract, policy, capability, expiry, freshness, package id, timestamps, prerequisite evidence fingerprints, executable/platform/session/source-policy/worktree/sequence linkage, the complete source-controlled authority policy fingerprint, six exact grants, argv/order/output modes/limits, initial package state, retry/fallback/replay/revocation posture, sub-capabilities, prohibited authority fields, package fingerprint, status, reason, and final result.

The Action 611 policy model explicitly covers identity/version, executable, stage count/order, max attempts, one-process-at-a-time, retry/fallback/cache/rerun, expiry duration, extension/refresh/grace/reissue, pre-consumption/per-stage/aggregate checks, process shell/PATH/environment/stdin/detached posture, every stage argv/output/retention field, allowed sub-capabilities, denied authorities, runtime/TOCTOU limits, initial state, and replay/storage/concurrency limitations.

Fingerprints do not prevent replay and do not grant authority by themselves.

## Replay Limitation

This pure contract creates initial package evidence only. It does not persist a consumption record and cannot prevent replay through storage. A later server-only atomic consumption contract must enforce unique package identity, stage index, active-consumer state, terminal-state lock, and one-shot consumption.

## Authority and Runtime Limits

The package carries narrow dormant authority evidence for future separately reviewed consumption only:

- scoped process-creation grant per fixed stage;
- exact read-only Git CLI grant per fixed stage;
- approved-worktree repository-read grant per fixed stage;
- bounded output-retention grants;
- stage and aggregate evidence-construction grants;
- non-authoritative result exposure grant.

It grants no runtime caller activation, mutation authority, arbitrary filesystem authority, write-command authority, credential authority, network authority, staging authority, deployment authority, Avanza/trading authority, persistence authority, migration authority, or production readiness.

## Test Coverage

The focused suite is `tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts`.

It covers identity/policy purity, runtime unreachability, upstream and Apple happy paths, fixed stage grants, timestamp and expiry rejection, input identity rejection, descriptor-based object schema attacks, exact nested-array and prototype-chain attacks, recomputed semantic forgeries for resolver, production-marked revalidation, compatibility, and worktree evidence, policy-fingerprint propagation and category sensitivity, resolver evidence rejection, revalidation rejection, compatibility rejection, worktree rejection, shared linkage, deterministic fingerprints, rejected-result nullability, and initial no-consumption/no-runtime state.

## Export Surface

The pure core exports only identities, policy, fingerprint domains, closed types, and the package builder. It exports no server-only wrapper, runner, consumer, storage adapter, reset hook, provenance minter, dependency injection hook, clock provider, runtime adapter, or process function.

## Blockers Before Later Work

Before any authority can be consumed:

- Action 608 must independently review this contract;
- a later action must plan and implement atomic one-shot consumption;
- a later action must separately review the consumption contract;
- the dormant runner must be implemented and reviewed separately;
- runtime/API/UI activation must be separately approved;
- deployment must be separately approved.

No Git command was executed through production behavior. No process was created or observed. No repository was inspected. No authority was consumed live. No replay-protection storage was implemented. No runner was implemented. No runtime/API/UI path was activated. No credentials, environment, network, Avanza, trading, persistence, migrations, or deployment behavior was added.
