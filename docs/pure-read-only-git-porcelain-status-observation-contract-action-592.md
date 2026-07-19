# Action 592 - Pure Read-Only Git Porcelain Status Observation Contract

## Summary

Action 592 implemented a pure, fixture-only interpretation contract for byte-oriented output from the exact future read-only Git command:

```json
["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]
```

The contract is implemented in `lib/post-trade-pure-read-only-git-porcelain-status-interpretation-contract-core.ts`. It accepts only an accepted Action 586 byte-completion result, rebuilds that source result from its approved input fields, validates linkage and security posture, parses NUL-framed porcelain v1 records from `stdoutBytesHex`, and returns a closed immutable clean, dirty, or rejected interpretation result.

Primary source reviewed: Git status documentation at https://git-scm.com/docs/git-status. Action 592 uses the reviewed Action 585 conclusions for porcelain v1 `-z`, `--untracked-files=all`, `--no-renames`, and `--ignore-submodules=none`.

## Contract Identity

- contract kind: `pure_read_only_git_porcelain_status_interpretation_contract`
- contract id: `ture.execution.pure-read-only-git-porcelain-status-interpretation-contract.fixture.v1`
- contract version: `1`
- boundary id: `ture.execution.read-only-git-porcelain-status-interpretation.fixture-boundary.v1`
- grammar id: `ture.execution.git-porcelain-v1-z.no-renames.path-bytes.v1`
- normalization id: `ture.execution.git-porcelain-v1-z.no-normalization.v1`
- source completion contract id: `ture.execution.pure-read-only-git-porcelain-status-completion-contract.fixture.v1`
- capability identity: `git_porcelain_status_v1`
- capability purpose: `git_porcelain_status`
- policy id: `pure_read_only_git_porcelain_status_interpretation_policy_v1`

All identities, policies, and accepted status tables are deeply frozen and fingerprint-bound.

## Input Boundary

The only production entry point is:

`buildPureReadOnlyGitPorcelainStatusInterpretation(input: unknown)`

It accepts no caller-supplied path strings, decoded stdout text, status summaries, compatibility options, parser options, process handles, clocks, filesystem objects, credentials, environment values, network clients, runtime handles, or dependency injection.

The input must validate as an accepted Action 586 byte-oriented porcelain-status completion result. The interpreter rejects rejected completion results, malformed objects, stale result fingerprints, altered evidence, wrong source linkage, wrong command identity, wrong capability, wrong platform, wrong executable, wrong argv, non-empty stderr, overflow/truncation/stream errors, non-zero or contradictory lifecycle states, retry/fallback, authority claims, runtime claims, live-observation claims, and TOCTOU-elimination claims.

## Grammar

Accepted output is byte-oriented, not text-oriented.

- empty stdout means `accepted_clean`;
- non-empty stdout must end with NUL;
- records are split only on NUL bytes;
- each ordinary record must be `XY SP PATH NUL`;
- path bytes must be non-empty;
- path bytes are never decoded to JavaScript strings;
- one path is accepted per record;
- rename/copy `R` or `C` records are rejected because the approved command includes `--no-renames`;
- ignored `!!` records are rejected because the approved command does not include `--ignored`;
- unmerged pairs are accepted only as unmerged counts;
- porcelain-v1 submodule-specific state is not claimed.

Accepted ordinary status pairs are limited to reviewed tracked-file combinations with `M`, `T`, `A`, `D`, and space. Accepted untracked and unmerged pairs are `??`, `DD`, `AU`, `UD`, `UA`, `DU`, `AA`, and `UU`.

## Limits

Action 592 preserves the Action 585 and Action 586 limits:

- raw stdout: 65536 bytes;
- record count: 2048;
- path bytes per record: 4096;
- cumulative path bytes: 65536;
- stderr: 0 bytes;
- truncation: rejected;
- retry/fallback: rejected.

Because the accepted byte-completion contract already caps raw stdout at 65536 bytes, cumulative path-byte overflow is fail-closed and normally unreachable through a valid accepted source.

## Result Model

The result union is closed:

1. `accepted_clean`;
2. `accepted_dirty`;
3. `rejected`.

Accepted evidence includes:

- exact source completion result and evidence fingerprints;
- source spawn fingerprints and observation fingerprint;
- session, purpose, policy, tool, platform, executable, argv, worktree fingerprint, and observation sequence linkage;
- raw byte count and raw output fingerprint;
- clean/dirty status;
- counts for staged, unstaged, untracked, unmerged, ignored, unsupported, and submodule-specific claims;
- status-code breakdown;
- ordered record fingerprint;
- per-record summaries containing only status bytes, path byte count, path-byte fingerprint, record fingerprint, and boolean classifications.

Accepted evidence never exposes plaintext paths, raw path bytes, path hex, decoded path strings, stdout text, stderr text, or compatibility decisions.

Rejected results contain no accepted evidence, no record list, no partial path summary, no decoded output, and no raw process detail.

## Security Posture

The module is pure and imports only `node:crypto` plus the pure Action 586 byte-completion contract.

It does not import `server-only`, `fs`, `child_process`, network clients, Supabase clients, credential primitives, timers, signals, process handles, browser tooling, Avanza tooling, API routes, UI components, runners, neutralizers, direct-spawn adapters, resolver adapters, composition adapters, revalidation adapters, or compatibility evaluators.

All accepted evidence pins:

- `observedLiveProcess:false`;
- `authoritativeLive:false`;
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
- `authorizationConsumed:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `shellUsed:false`;
- `pathLookupUsed:false`;
- `inheritedEnvironmentUsed:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- `authority:"none"`.

## Semantic Limits

An accepted dirty result means only that a validated byte-completion fixture matched the strict porcelain-v1 `-z` grammar and contained at least one accepted record. It does not mean the repository is currently dirty, Git is available, the executable remains unchanged, the worktree is safe, compatibility is granted, runtime activation is permitted, deployment is allowed, or TOCTOU was eliminated.

An accepted clean result means only that a validated byte-completion fixture had empty stdout. It is not a live repository-status assertion.

## Test Coverage

The focused suite `tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts` covers:

- frozen identity and policy;
- static purity and no caller wiring;
- clean empty stdout;
- ordinary staged, unstaged, added, deleted, and type-change records;
- untracked and unmerged records;
- deterministic record ordering;
- path-byte privacy and fingerprinting;
- rename/copy and ignored-record rejection;
- malformed NUL framing and malformed records;
- record count and path-byte limits;
- upstream completion rejection mapping;
- wrong identity, linkage, capability, platform, tool, executable, argv, authority, runtime, live, and TOCTOU rejection;
- stale fingerprint and altered-evidence rejection;
- deterministic fingerprints;
- deep freeze and mutation isolation.

## Remaining Blockers

Before any live porcelain-status compatibility or repository decision exists, the following remain separate future work:

1. static/security review of this pure interpretation contract;
2. remediation if review findings require it;
3. independent final re-review;
4. compatibility-policy planning and implementation;
5. dormant orchestration;
6. runtime activation approval;
7. deployment approval.

## Non-Authorizations

No porcelain-status Git command was executed. No production Git executable was run by application code. No repository status was inspected. No process was created, observed, controlled, or terminated by production behavior. No live Git version or status was collected. No compatibility decision, runner, API, UI, credential, environment, network, Avanza, trading, persistence, migration, commit, push, merge, or deployment behavior was added or activated.

## Decision

Decision:

`post_trade_pure_read_only_git_porcelain_status_observation_contract_ready_for_static_security_review`

Result status:

`post_trade_pure_read_only_git_porcelain_status_observation_action_592_implemented_fixture_only`

Recommended next Action:

Action 593 - Static Security and Contract Review of Pure Read-Only Git Porcelain Status Observation Contract.
