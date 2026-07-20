# Action 599 - Dormant Read-Only Git Repository Observation Runner Plan

Action 599 plans a dormant server-only runner boundary for future read-only Git repository observation. This is documentation, architecture, and approval-gate work only. It does not implement a runner, execute Git, inspect a repository through production behavior, create or observe a process, evaluate compatibility, wire runtime/API/UI/cron/worker paths, read credentials or environment values, access the network, persist data, run migrations, deploy, commit, push, merge, or modify approved production contracts.

## Approved Baseline

The baseline through Action 598 is:

1. first-live resolver and composition contracts reviewed as dormant and server-only;
2. immediate pre-spawn revalidation reviewed as dormant and non-authoritative;
3. fixed read-only direct-spawn boundary reviewed for the exact Git-version path only;
4. spawn-to-raw-completion neutralization and Git-version interpretation orchestrator reviewed as dormant;
5. pure read-only Git simple observation contracts reviewed;
6. pure byte-oriented porcelain-status completion and interpretation contracts reviewed;
7. pure aggregate read-only Git repository observation contract reviewed and approved.

Neutralization, interpretation, direct spawn, aggregate observation, compatibility, and runtime activation are still separate boundaries. No live repository-observation runner exists today.

## Runner Trust Problem

The future runner must bridge from separately approved live process output to pure repository-observation evidence without converting structural compatibility into authority. It must preserve:

- exact original-object provenance from each production-valid direct-spawn result;
- one-shot consumption per command;
- fixed sequencing;
- text versus byte routing;
- strict pure interpreter validation;
- aggregate-only finalization;
- non-authoritative result semantics.

It must never accept caller-provided Git facts, stdout, stderr, byte arrays, argv, executable paths, working directories, parser options, compatibility rules, clocks, process handles, dependency injection, retries, or fallback settings.

## Exact Command Sequence

The only planned sequence is:

| Stage | Exact argv | Output route | Pure consumer |
| --- | --- | --- | --- |
| 1 | `["rev-parse", "--show-toplevel"]` | text completion | repository-root interpretation |
| 2 | `["rev-parse", "--show-object-format"]` | text completion | object-format interpretation |
| 3 | `["rev-parse", "--verify", "HEAD"]` | text completion | HEAD-object interpretation |
| 4 | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | text completion | branch-state interpretation |
| 5 | `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]` | byte completion | porcelain-status byte contract and interpretation |
| 6 | `["rev-parse", "--verify", "HEAD"]` | text completion | HEAD-object interpretation |

The executable must be the separately approved `/usr/bin/git` identity. Stage 6 exists only to compare HEAD before and after status observation. Matching HEAD remains evidence only and does not eliminate TOCTOU.

## Architecture Options

| Option | Shape | Verdict |
| --- | --- | --- |
| A | One narrow dormant server-only six-stage runner with fixed commands, fixed routing, and pure aggregate finalization. | Preferred. Smallest closed production surface and easiest to review. |
| B | Per-stage runner plus pure coordinator. | Rejected for now. It adds partial live states and more export surface before a compatibility policy exists. |
| C | Extend the Git-version orchestrator into repository observation. | Rejected. Git-version interpretation and repository observation have different command, output, and aggregate semantics. |
| D | Caller-configurable graph of Git stages. | Rejected. It turns caller configuration into authority and invites command widening. |
| E | Runtime runner activation now. | Rejected. Compatibility, repository-read authorization, and deployment approval remain absent. |

Architecture decision: choose Option A for a future implementation, but do not implement it in Action 599.

## Executable and Capability Input

The future runner may accept only a closed source-controlled capability package that has already passed the separately reviewed resolver, composition, revalidation, process-authority, and compatibility gates for `/usr/bin/git`. It must not accept raw executable paths, PATH lookups, alternate Git binaries, shell interpreters, command names, argv fragments, user-selected repositories, environment-derived roots, or dependency injection.

Each command must be represented by an exact capability tuple binding:

- execution session;
- sequence identity;
- stage identity and ordinal;
- tool `git`;
- executable identity `/usr/bin/git`;
- exact argv;
- approved working-directory evidence;
- policy fingerprints;
- expiry/freshness posture;
- one-shot process authority for that stage only.

## Working-Directory Model

The future runner must use only an approved repository worktree capability or source-controlled repository target selected by a separate authorization gate. It must not use `process.cwd()`, `$PWD`, HOME, PATH, environment variables, caller strings, symlink expansion, recursive search, or external configuration as a trust source.

The working-directory evidence must be fingerprint-linked across all six stages. The pure aggregate may compare the interpreted repository root evidence to the worktree linkage, but no plaintext repository path needs to be returned beyond what a separately reviewed privacy model permits.

## Process Execution Model

If later implemented, the runner must start six separate one-shot direct-spawn attempts in sequence through approved server-only process boundaries. The model must enforce:

- absolute executable only;
- exact argv only;
- shell disabled;
- no stdin;
- bounded stdout and stderr;
- no inherited credential or environment channel beyond separately reviewed minimal process requirements;
- no detached process;
- no process-group control unless separately reviewed;
- no retry, fallback, or cache;
- stop-on-terminal-failure semantics.

The runner must not create an observer, timeout, termination, credential, network, or runtime authority by itself.

## Text and Byte Routing

Stages 1, 2, 3, 4, and 6 are text-oriented and may route only through approved raw-completion neutralization and the simple read-only Git interpretation contracts.

Stage 5 is byte-oriented. Its NUL-delimited output must route through the approved byte-oriented porcelain-status completion contract before porcelain-status interpretation. The runner must not UTF-8 decode, split, normalize, log, stringify, or inspect porcelain-status bytes directly.

## Stage Failure Policy

The future runner must return a closed terminal result on the first stage failure unless the stage has an explicitly reviewed nonzero observational meaning.

The planned special case is branch state: `["symbolic-ref", "--quiet", "--short", "HEAD"]` may represent detached HEAD according to the approved pure branch-state contract. Detached HEAD remains an observational aggregate outcome and not a compatibility or runtime decision.

All other failures, malformed output, overflow, signal, spawn exception, spawn error, parser rejection, contradictory evidence, linkage rejection, stale capability, clone/reconstruction, duplicate consumption, unsupported state, and unknown reason must fail closed without retry.

## Session and Sequence Model

The future runner must use one execution session and one repository-observation sequence:

`ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1`

Every stage result must bind the same session, sequence, worktree linkage, tool, platform, policy combination, executable identity, and stage ordinal. Individual source spawn fingerprints may differ by stage because each command is its own one-shot process attempt.

## HEAD and TOCTOU Posture

The runner plan uses HEAD-before and HEAD-after to detect one class of repository mutation during observation. It does not eliminate TOCTOU. A repository may change after stage 6, the index or working tree may change without HEAD changing, and filesystem/executable state may change between resolver, revalidation, spawn, and aggregation.

Every future result must preserve `toctouEliminated:false`.

## Runner Result Model

The future runner should return a closed immutable union:

- `runner_input_rejected`;
- `runner_stage_rejected`;
- `runner_interpretation_rejected`;
- `runner_aggregate_rejected`;
- `runner_observation_accepted_non_authoritative`.

Every result must include identity, version, server-only/dormant posture, sequence ID, session ID or null, failed stage or null, deterministic reasons, stage result fingerprints where available, aggregate result fingerprint or null, compatibility decision null, authority none, runtime activated false, deployment authority false, and `toctouEliminated:false`.

Accepted output means only that a fixed sequence of stage evidence was produced and aggregated. It does not mean the repository is compatible, safe, current, staging-ready, deployable, or execution-ready.

## Authority Model

The runner plan grants no:

- repository-read authority today;
- process creation authority today;
- process observation/control/termination authority;
- credential authority;
- compatibility authority;
- runtime/API/UI/runner activation authority;
- network or Supabase authority;
- Avanza/trading/order/position/settlement authority;
- persistence, migration, deployment, commit, push, or merge authority.

The future runner may consume separately granted one-shot process authority, but it must not mint broader authority.

## Compatibility Dependency

The Git compatibility baseline remains unresolved for repository observation. Prior actions resolved several output parsers and aggregate evidence, but they did not implement a compatibility policy module or evaluator and did not decide that observed repository evidence is sufficient for staging/runtime activation.

Recommended next Action: Action 600 - Complete Read-Only Git Compatibility Baseline Decision.

## Runtime Unreachability

Action 599 adds no production module. A future runner must remain dormant and test-only reachable until separate approvals cover static review, remediation, final re-review, compatibility policy, repository-read authorization, process authority, runtime activation, and deployment.

No API route, UI component, cron job, worker, server action, observer, credential boundary, neutralizer, direct-spawn boundary, resolver, compatibility evaluator, or deployment path may import or invoke the future runner before those gates.

## Logging and Privacy

The future runner must not log raw stdout, raw stderr, porcelain-status bytes, plaintext path lists, raw repository paths, raw branch names where a fingerprint is sufficient, process errors, stack traces, environment values, credentials, or private provenance markers.

Reasons must be closed deterministic codes.

## Retry, Fallback, and Caching Prohibition

The future runner must not retry failed commands, fallback to alternate commands, fallback to alternate executables, rerun status after parse failure, reconstruct consumed sources, cache reusable stage authority, reuse stale aggregate evidence, or treat compatibility decisions as cached process authority.

## Future Gates

Required future gates:

1. compatibility-baseline decision;
2. dormant runner implementation;
3. focused runner tests;
4. server-only import review;
5. capability and original-object provenance review;
6. one-shot stage consumption review;
7. text/byte routing review;
8. branch/detached and failure-policy review;
9. aggregate linkage review;
10. authority and compatibility separation review;
11. runtime-reachability review;
12. prohibited-operation review;
13. independent static security review;
14. remediation and final re-review;
15. repository-read authorization planning;
16. controlled runtime activation approval;
17. deployment approval.

## Explicit Non-Authorizations

Action 599 does not authorize Git execution, live repository inspection, process creation, process observation, process termination, CLI-version collection, repository-observation collection, compatibility evaluation, runtime/API/UI/runner activation, credentials, environment access, network, Avanza, trading, orders, positions, settlement retrieval, persistence, migrations, deployment, commit, push, merge, retries, fallback, or broad Git command support.

## Decision

Decision: `post_trade_dormant_read_only_git_repository_observation_runner_plan_ready`

Result status: `post_trade_dormant_read_only_git_repository_observation_runner_action_599_planning_gate_completed`

Recommended next Action: Action 600 - Complete Read-Only Git Compatibility Baseline Decision.

No deploy is recommended for Action 599. No commit, push, merge, or deploy occurred.
