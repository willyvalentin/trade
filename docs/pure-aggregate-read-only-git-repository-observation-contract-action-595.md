# Action 595 - Pure Aggregate Read-Only Git Repository Observation Contract

## Scope

Action 595 implements a pure, fixture-only aggregate contract for combining reviewed read-only Git repository observation evidence. It does not execute Git, inspect a repository live, create or observe a process, implement a runner, evaluate compatibility, activate API/UI/runtime paths, read credentials or environment values, access the network, persist data, run migrations, or deploy.

## Contract Identities

- contract kind: `pure_aggregate_read_only_git_repository_observation_contract`;
- contract ID: `ture.execution.pure-aggregate-read-only-git-repository-observation-contract.fixture.v1`;
- contract version: `1`;
- boundary ID: `ture.execution.aggregate-read-only-git-repository-observation.fixture-boundary.v1`;
- aggregate policy ID: `ture.execution.aggregate-read-only-git-repository-observation.policy.v1`;
- sequence identity: `ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1`.

All identities and policy fields are source-controlled, frozen, and fingerprint-bound.

## Aggregate Input

The aggregate exposes one pure builder:

`buildPureAggregateReadOnlyGitRepositoryObservation(input)`

The input is a closed object with fixed stage slots:

1. `repositoryRootEvidence`;
2. `objectFormatEvidence`;
3. `headBeforeEvidence`;
4. `branchStateEvidence`;
5. `porcelainStatusEvidence`;
6. `headAfterEvidence`;
7. `approvedWorktreeEvidence`.

The approved worktree linkage is fingerprint-only and is built with:

`buildApprovedAggregateGitWorktreeLinkage(input)`

The aggregate accepts no raw Git output, raw paths, raw object IDs outside stage evidence, raw branch names outside stage evidence, caller clean/dirty booleans, caller object format, caller stage arrays, caller policy overrides, caller compatibility rules, dependency injection, clock injection, or authority fields.

## Per-Stage Revalidation

Every stage is revalidated before classification:

- exact result and evidence schemas;
- contract kind, version, ID, and boundary;
- accepted status and accepted reason;
- evidence and result fingerprint recomputation;
- source completion/spawn fingerprints where present;
- capability, purpose, tool, executable, argv, platform, session, working-directory fingerprint, and sequence identity;
- lifecycle/security posture;
- `observedLiveProcess:false`;
- `runtimeActivated:false`;
- `authorizationConsumed:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `repositoryReadAuthorityGranted:false`;
- `compatibilityAuthorityGranted:false`;
- `toctouEliminated:false`;
- `authority:"none"`.

Rejected stage evidence, copied stale fingerprints, recomputed attacker fingerprints with contradictory fields, unknown fields, inherited fields, symbols, accessors, functions, arrays where objects are required, classes, exotic prototypes, malformed fingerprints, and malformed stage values fail closed.

## Shared Linkage

The aggregate requires exact equality across all stages for:

- session;
- platform;
- executable;
- working-directory fingerprint;
- observation-sequence identity.

The four text-oriented simple observations share `pure_read_only_git_observation_completion_policy_v1`. The byte-oriented porcelain status stage keeps its reviewed `pure_byte_oriented_porcelain_status_completion_policy_v1`; the aggregate validates that stage-specific policy exactly instead of treating the two source policy IDs as interchangeable.

Every stage belongs to the same aggregate sequence and worktree. Individual source spawn fingerprints may differ because each command has its own approved one-shot spawn lineage.

## Root / Worktree Comparison

Repository-root evidence is compared only through fingerprints:

- accepted `repositoryRootPathFingerprint`;
- approved worktree `repositoryRootPathFingerprint`;
- shared working-directory fingerprint.

The aggregate does not expose plaintext repository paths, call `realpath`, resolve symlinks, inspect case sensitivity, access cwd, or touch the filesystem. A mismatch returns `repository_root_mismatch`.

## Object-Format / HEAD Linkage

Supported object formats are `sha1` and `sha256`.

Both HEAD observations must:

- link to the same accepted object-format evidence fingerprint;
- carry the same object format;
- use object-ID lengths consistent with that format;
- pass strict accepted HEAD evidence revalidation.

Cross-linked or malformed HEAD evidence returns `object_format_head_linkage_rejected` or the corresponding stage rejection.

## HEAD Stability

HEAD-before and HEAD-after are compared exactly by object ID. If they differ, the aggregate returns:

`head_changed_during_observation`

No clean-stable outcome survives a changed HEAD. Matching HEAD sets `headStable:true` but still leaves `toctouEliminated:false`.

## Branch / Detached Policy

Attached branch evidence is retained only by branch state and branch-name fingerprint. No allowed-branch policy is invented and `eligibilityPolicyResolved:false` remains.

Detached HEAD is valid observation evidence and returns:

`detached_head`

It is not treated as malformed input and grants no later activation eligibility.

## Clean / Dirty Policy

Accepted porcelain-status evidence maps to aggregate cleanliness:

- `accepted_clean` with zero counts can reach `repository_clean_stable_observation` after all earlier checks pass;
- any staged, unstaged, untracked, unmerged, ignored, or submodule count above zero returns `repository_dirty`;
- rejected or malformed status evidence returns `status_evidence_rejected`.

No dirty category is ignored by aggregate policy.

## Result Union

The closed result union is:

- `input_rejected`;
- `repository_root_mismatch`;
- `unsupported_object_format`;
- `head_changed_during_observation`;
- `detached_head`;
- `repository_dirty`;
- `repository_clean_stable_observation`.

No result is named ready, eligible, approved, compatible, authorized, staging-ready, or deployment-ready.

## Reasons And Precedence

Reasons are a closed enum covering schema/identity, stage rejection, shared linkage, security posture, and observation outcomes.

Precedence:

1. aggregate schema closure;
2. aggregate identity/policy;
3. root evidence;
4. object-format evidence;
5. HEAD-before evidence;
6. branch evidence;
7. porcelain-status evidence;
8. HEAD-after evidence;
9. worktree evidence;
10. shared linkage;
11. authority/security posture;
12. root comparison;
13. object-format support;
14. object-format/HEAD linkage;
15. HEAD stability;
16. branch/detached;
17. status clean/dirty;
18. final clean-stable construction.

Earlier trust failures supersede repository-state outcomes.

## Fingerprint Model

The aggregate uses deterministic SHA-256 over:

- aggregate identity and policy;
- every stage evidence fingerprint;
- approved worktree fingerprint;
- sequence identity;
- shared session/platform/executable/worktree linkage;
- root match state;
- object format;
- HEAD before/after fingerprints and stability state;
- branch state and branch-name fingerprint;
- status clean/dirty counts and status evidence fingerprint;
- status/reason;
- eligibility fields;
- all authority/runtime/live/TOCTOU fields;
- final evidence and result.

Changing any trust-critical stage fingerprint changes the aggregate fingerprint. Fingerprints grant no provenance or authority by themselves.

## TOCTOU Posture

Every result states `toctouEliminated:false`.

Matching HEAD before/after does not prove worktree stability. Files may change without HEAD changing, status may change after observation, branch state may change, and root/worktree evidence may become stale. The aggregate must never authorize later execution.

## Authority And Semantic Limits

All results preserve:

- `authority:"none"`;
- `laterActivationEligibility:false`;
- `eligibilityPolicyResolved:false`;
- `compatibilityDecision:null`;
- all repository-read, process, observer, CLI-execution, compatibility, runtime, staging, deployment, credential, network, mutation, and authorization-consumption authority flags false.

Even `repository_clean_stable_observation` means only that pure fixture evidence is internally consistent at the observation boundary. It does not authorize compatibility evaluation, repository inspection, a runner, runtime activation, staging, deployment, or production execution.

## Export Surface

Exports are limited to:

- identity, policy, and fingerprint-domain constants;
- aggregate/worktree input, evidence, result, status, and reason types;
- `buildApprovedAggregateGitWorktreeLinkage`;
- `buildPureAggregateReadOnlyGitRepositoryObservation`;
- identity and policy fingerprint helpers.

No server-only wrapper, runner, live capture adapter, provenance registration, reset, or runtime caller was added.

## Test Coverage

The focused Action 595 suite covers identity/policy immutability, static purity, clean stable sha1/sha256 outcomes, root mismatch, malformed root/worktree evidence, HEAD changed, object-format/HEAD linkage, zero object IDs, detached HEAD, branch linkage, dirty staged/unstaged/untracked/unmerged/mixed status, rejected stages, shared linkage, security forgeries, schema attacks, fingerprint determinism, mutation isolation, and path privacy.

## Remaining Blockers

Before any live capture, runner, compatibility evaluation, runtime activation, or deployment:

1. Action 596 static security and contract review;
2. remediation and final re-review if findings exist;
3. separate live-capture planning;
4. separate runner planning;
5. separate compatibility-baseline review;
6. separate runtime activation approval;
7. separate deployment approval.

## Explicit Non-Authorizations

No Git command was executed through production behavior. No repository was inspected live. No process was created or observed. No repository-read authority was granted. No runner was implemented. No runtime/API/UI path was activated. No TOCTOU guarantee was created. No credentials, environment, network, Avanza, trading, persistence, migration, deployment, commit, push, merge, or deploy behavior was added.

## Decision

Decision:
`post_trade_pure_aggregate_read_only_git_repository_observation_contract_ready_for_static_security_review`

Result status:
`post_trade_pure_aggregate_read_only_git_repository_observation_action_595_implemented_fixture_only`

Recommended next Action:
Action 596 - Static Security and Contract Review of Pure Aggregate Read-Only Git Repository Observation Contract.
