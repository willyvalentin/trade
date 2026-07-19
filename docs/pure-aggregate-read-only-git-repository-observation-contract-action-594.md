# Action 594 - Pure Aggregate Read-Only Git Repository Observation Contract Plan

## Scope

Action 594 is a documentation, architecture, aggregate-contract planning, and approval-gate action only. It does not implement the aggregate contract, a Git runner, repository-inspection command execution, compatibility evaluation, API/UI/runner wiring, persistence, deployment, or any runtime activation.

The approved baseline is the committed Action 592-593 porcelain-status observation checkpoint on branch `codex/action-534-live-resolver`, with the previously approved Action 581-584 simple-observation contracts.

## Approved Observation Chain

The current approved pure observation evidence contracts are:

1. Repository-root evidence from `git rev-parse --show-toplevel`.
2. Object-format evidence from `git rev-parse --show-object-format`.
3. HEAD-before evidence from `git rev-parse --verify HEAD`.
4. Branch or detached-state evidence from `git symbolic-ref --quiet --short HEAD`.
5. Porcelain-status evidence from `git status --porcelain=v1 -z --untracked-files=all --no-renames --ignore-submodules=none`.
6. HEAD-after evidence from `git rev-parse --verify HEAD`.

No aggregate contract exists. No runner exists. No live repository observation exists. No product behavior has run this sequence. No repository-read authority, compatibility policy, runtime caller, or deployment authority exists. Required posture remains `authority:"none"`, `observedLiveProcess:false`, and `toctouEliminated:false`.

## Aggregate Trust Problem

The future aggregate contract must prove only structural consistency across already accepted pure evidence. It must not treat individually accepted evidence as aggregate repository eligibility.

The aggregate must prove:

- every input is an exact accepted result from its approved pure contract;
- every input is fully schema-, fingerprint-, and linkage-validated;
- all inputs share exact session, platform, policy identity/version, executable, working-directory fingerprint, observation-sequence identity, and source spawn lineage where applicable;
- repository-root evidence matches approved worktree-path evidence through one reviewed comparison;
- object-format evidence matches both HEAD observations;
- HEAD-before and HEAD-after object IDs are identical;
- branch evidence belongs to the same HEAD/worktree sequence;
- status evidence belongs to the same sequence and worktree;
- the result distinguishes rejected evidence, root mismatch, unsupported object format, changed HEAD, detached HEAD, dirty repository, and clean stable observation;
- no authority is granted.

The aggregate must not claim that the repository remains unchanged after the final observation.

## Aggregate Input API

The future builder should be one pure entry point accepting a closed input object with full immutable evidence/result objects for:

- accepted repository-root evidence;
- accepted object-format evidence;
- accepted HEAD-before evidence;
- accepted branch/detached evidence;
- accepted porcelain-status evidence;
- accepted HEAD-after evidence;
- approved worktree-path evidence or exact fingerprint-linked structural representation;
- an aggregate timestamp only if the implementation decides an evidence timestamp is required.

The builder must accept no raw Git output, byte-completion evidence directly, caller branch name, caller HEAD ID, caller clean boolean, caller object format, caller repository path, caller policy override, caller sequence order, caller compatibility rule, caller authority decision, runtime state, parser options, dependency injection, or clock injection.

Selected input shape: full evidence objects with complete per-stage revalidation. Fingerprint-linked summaries alone would increase stale or reconstructed evidence risk, while a generic nested evidence graph would be too broad for the first aggregate boundary.

## Stage Revalidation

The aggregate must not trust evidence merely because a pure builder returned it. Each stage requires exact validation of:

- contract kind, version, ID, and boundary;
- grammar and normalization identity where applicable;
- accepted status and accepted reason;
- exact result and evidence schema;
- evidence and result fingerprint recomputation;
- source evidence and source spawn fingerprints;
- session, purpose, capability, platform, policy, executable, argv, working-directory fingerprint, and sequence identity;
- authority/security posture;
- `observedLiveProcess:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`.

Reject rejected stage evidence, copied stale fingerprints, attacker-recomputed fingerprints with contradictory semantics, unknown fields, accessors, symbols, inherited fields, class instances, exotic prototypes, functions, malformed numbers, malformed timestamps, and malformed fingerprints.

Use approved stage-specific validators and exact schema checks. Do not create one broad generic stage validator.

## Sequence Model

The planned sequence is fixed:

1. root;
2. object format;
3. HEAD before;
4. branch;
5. status;
6. HEAD after.

Selected representation: fixed stage-slot input fields plus one common observation-sequence identity across all stage evidence. Stage timestamps may be retained as evidence but must not be the only ordering proof. If retained, timestamps are evidence only and do not create freshness, atomicity, or authority.

## Root And Worktree Matching

The root parser does not prove filesystem canonicality. The aggregate may only compare the parsed repository root text/fingerprint to approved source-controlled or resolver-derived worktree evidence through one reviewed comparison.

The comparison must define handling for exact text, path fingerprint, Unicode normalization, case sensitivity, trailing slash, symlink posture, and resolver lineage. It must not resolve symlinks, read the filesystem, call Git, or use ambient cwd.

Deterministic mismatch outcomes should use `repository_root_mismatch` for a validated observation-state mismatch and `worktree_linkage_rejected` for invalid or inconsistent source linkage.

## Object-Format And HEAD Linkage

The aggregate must require accepted object-format evidence and both HEAD observations linked to that exact object-format result/evidence fingerprint. Accepted formats remain `sha1` and `sha256`.

Reject:

- HEAD evidence linked to different object-format evidence;
- sha1/sha256 mismatch;
- different session, worktree, policy, or sequence;
- stale copied fingerprints;
- accepted HEAD with incompatible object-ID length;
- unsupported transition format.

## HEAD Stability

HEAD-before and HEAD-after must have the same full nonzero object ID, same object format, same object-format evidence linkage, and same session/worktree/sequence/policy linkage.

If object IDs differ, the aggregate should return `head_changed_during_observation`. This is a closed unstable observational result, not a malformed-input rejection. Repository cleanliness must not survive that outcome as later eligibility.

Even matching HEAD does not eliminate TOCTOU.

## Branch And Detached Policy

Detached HEAD is valid observational evidence, but the initial aggregate posture should return `detached_head` with `laterActivationEligibility:false`. It should not be a generic rejection and must not grant authority.

For attached branches, no branch approval policy exists yet. The aggregate may retain branch state and branch-name fingerprint evidence but must not claim branch approval. `eligibilityPolicyResolved:false` remains required until a separate branch/compatibility policy exists.

Do not invent an allowed branch.

## Status Clean/Dirty Policy

Accepted status evidence maps as:

- `accepted_clean` -> `clean:true`, `dirty:false`;
- `accepted_dirty` -> `clean:false`, `dirty:true`;
- rejected status evidence -> aggregate input rejected.

Any staged, unstaged, untracked, unmerged, ignored, or submodule count above zero is dirty for aggregate purposes. Dirty aggregate status is `repository_dirty` with no later operation eligibility.

Do not selectively ignore untracked, ignored, or submodule state without a separately reviewed policy.

## Aggregate Union

The future result union should be closed:

- `input_rejected`;
- `stage_linkage_rejected`;
- `observation_sequence_mismatch`;
- `repository_root_mismatch`;
- `unsupported_object_format`;
- `head_changed_during_observation`;
- `detached_head`;
- `repository_dirty`;
- `repository_clean_stable_observation`.

Do not call the final state `repository_ready`. Security failures must remain separate from repository-state outcomes.

## Result Model

Every result should include:

- aggregate contract kind/version/boundary;
- aggregate policy identity/version;
- status and reason;
- aggregate evidence fingerprint;
- fixture timestamp if required;
- root, object-format, HEAD-before, branch, status, HEAD-after, worktree, and sequence fingerprints;
- root match result;
- object format and support result;
- HEAD-before, HEAD-after, and `headStable`;
- branch state and branch-name fingerprint;
- detached, clean, dirty, staged, unstaged, untracked, unmerged, ignored, and submodule counts;
- `laterActivationEligibility:false`;
- `eligibilityPolicyResolved:false`;
- no compatibility decision.

Security fields must include `observedLiveProcess:false`, `repositoryReadAuthorityGranted:false`, `mutationAuthorityGranted:false`, `processAuthorityGranted:false`, `cliExecutionAuthorityGranted:false`, `compatibilityAuthorityGranted:false`, `runtimeAuthorityGranted:false`, `stagingAuthorityGranted:false`, `deploymentAuthorityGranted:false`, `credentialsUsed:false`, `networkUsed:false`, `authorizationConsumed:false`, `runtimeActivated:false`, `toctouEliminated:false`, and `authority:"none"`.

Prefer fingerprints over plaintext paths in aggregate output.

## Reasons And Precedence

The reason enum should be closed and deterministic.

Input/linkage reasons:

- `input_contract_rejected`;
- `root_evidence_rejected`;
- `object_format_evidence_rejected`;
- `head_before_evidence_rejected`;
- `branch_evidence_rejected`;
- `status_evidence_rejected`;
- `head_after_evidence_rejected`;
- `source_linkage_rejected`;
- `sequence_identity_rejected`;
- `worktree_linkage_rejected`;
- `policy_linkage_rejected`;
- `stage_linkage_rejected`;
- `observation_sequence_mismatch`;
- `authority_rejected`;
- `runtime_claim_rejected`;
- `live_claim_rejected`;
- `toctou_claim_rejected`.

Observation reasons:

- `repository_root_mismatch`;
- `unsupported_object_format`;
- `head_changed_during_observation`;
- `detached_head`;
- `repository_dirty`;
- `repository_clean_stable_observation`.

Precedence:

1. aggregate input schema closure;
2. aggregate identity/policy identity;
3. root evidence validation;
4. object-format evidence validation;
5. HEAD-before evidence validation;
6. branch evidence validation;
7. status evidence validation;
8. HEAD-after evidence validation;
9. shared session/platform/policy/executable/worktree/sequence linkage;
10. authority/security posture;
11. repository-root comparison;
12. object-format support;
13. HEAD/object-format cross-linkage;
14. HEAD stability;
15. branch/detached classification;
16. status clean/dirty classification;
17. result-union consistency;
18. immutable aggregate construction.

Earlier trust failures must take precedence over repository-state outcomes.

## Fingerprinting

Use deterministic SHA-256 with fixed canonical ordering over:

- aggregate identities and policy identity;
- every stage evidence fingerprint;
- worktree path fingerprint;
- sequence identity;
- shared session/platform/policy/executable;
- root match;
- object format;
- HEAD-before and HEAD-after;
- `headStable`;
- branch state and branch fingerprint;
- status clean/dirty counts and status fingerprint;
- status and reason;
- eligibility fields;
- all authority/runtime/live/TOCTOU fields;
- final result.

Changing any stage fingerprint must change the aggregate fingerprint. Fingerprints grant no provenance or authority by themselves.

## TOCTOU Model

Matching HEAD before and after narrows one mutation window only. Status may change after observation, files may change without HEAD changing, branch state may change after observation, and root/worktree linkage may become stale.

The aggregate must always state `toctouEliminated:false`.

Later runner design should separately consider re-running the full sequence immediately before use, one-shot consumption of aggregate evidence, short expiry, and immediate HEAD/status revalidation. None of those mitigations are implemented by Action 594.

## Authority And Semantic Limits

The aggregate grants no Git execution, repository-read, filesystem, mutation, compatibility, runtime, staging, deployment, credential, network, API/UI/runner, Avanza/trading, persistence, or authorization-consumption authority.

Even `repository_clean_stable_observation` means only that fixture evidence was internally consistent, root matched, HEAD matched before and after, and status evidence was clean at observation time. It does not authorize a later operation.

## Architecture Decision

Recommended architecture: one pure aggregate builder accepting all six stage evidence objects plus approved worktree linkage. This is narrower than pairwise contracts, avoids premature runner coupling, and avoids a generic evidence graph evaluator.

Rejected alternatives:

- pairwise linkage contracts before aggregate: more surface and more partial states;
- aggregation inside a future runner: premature runtime coupling;
- generic evidence graph evaluator: too broad for this trust boundary.

## Implementation Decision

Recommended next action: Action 595 - Implement Pure Aggregate Read-Only Git Repository Observation Contract.

This is safer than resuming compatibility-baseline derivation because compatibility should consume one reviewed aggregate result, not six loosely coordinated stage outputs.

## Test Strategy

Future implementation tests should cover:

- matching root;
- sha1 HEAD stable;
- sha256 HEAD stable;
- attached branch;
- clean status;
- exact shared linkage;
- root mismatch;
- unsupported object format;
- HEAD changed;
- detached HEAD;
- dirty staged, unstaged, untracked, unmerged, ignored, and submodule outcomes according to policy;
- rejected stage evidence;
- wrong stage contract identity;
- stale or altered stage fingerprint;
- wrong session, platform, policy, executable, worktree fingerprint, or sequence identity;
- HEAD linked to different object-format evidence;
- status from different sequence;
- authority/live/runtime/TOCTOU claims;
- exact status/reason/nullability/counts;
- no plaintext path leakage;
- deep freeze;
- changed stage fingerprint changes aggregate fingerprint;
- same canonical input gives same result.

## Future Review Gates

Required review gates:

1. Aggregate input schema review.
2. Per-stage revalidation review.
3. Shared-linkage review.
4. Repository-root/worktree match review.
5. Object-format/HEAD linkage review.
6. HEAD-stability review.
7. Branch/detached policy review.
8. Status clean/dirty policy review.
9. Result-union review.
10. Reason-precedence review.
11. Fingerprint review.
12. TOCTOU review.
13. Determinism/immutability review.
14. Authority/no-runtime review.
15. Path-privacy review.
16. Export-surface review.
17. Runtime-reachability review.
18. Independent static security review.
19. Remediation and final re-review.
20. Separate live-capture planning.
21. Separate runner planning.
22. Separate compatibility-baseline review.
23. Separate runtime activation approval.
24. Separate deployment approval.

## Explicit Non-Authorizations

Action 594 does not authorize Git repository inspection, Git execution, process creation or observation, repository-read authority, aggregate implementation, compatibility decisions, runner implementation, runtime/API/UI activation, credentials, environment access, network access, Avanza/trading behavior, persistence, migrations, deployment, commit, push, merge, or production readiness.

## Commit And Deploy

No commit, push, merge, or deploy is authorized or recommended for Action 594.

## Decision

Decision:
`post_trade_pure_aggregate_read_only_git_repository_observation_contract_plan_ready`

Result status:
`post_trade_pure_aggregate_read_only_git_repository_observation_action_594_planning_gate_completed`

Recommended next Action:
Action 595 - Implement Pure Aggregate Read-Only Git Repository Observation Contract.
