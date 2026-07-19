# Action 586 - Pure Byte-Oriented Porcelain Status Completion Contract

## Summary

Action 586 implemented a pure, fixture-only completion-input contract for the exact future read-only Git command:

```json
["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]
```

The contract is implemented in `lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core.ts`. It accepts explicit fixture completion metadata and lowercase even-length hex byte output only. It does not execute Git, decode stdout, parse porcelain records, classify status, inspect paths, decide clean or dirty state, grant compatibility authority, or activate runtime behavior.

Primary source reviewed: Git status documentation at https://git-scm.com/docs/git-status. The implementation uses the Action 585 conclusion that porcelain v1 `-z` output must be treated as raw bytes before a later parser contract interprets NUL-framed records.

## Contract Identity

- contract kind: `pure_byte_oriented_porcelain_status_completion_contract`
- contract id: `ture.execution.pure-read-only-git-porcelain-status-completion-contract.fixture.v1`
- contract version: `1`
- boundary id: `ture.execution.read-only-git-porcelain-status-completion.fixture-boundary.v1`
- byte representation id: `ture.execution.byte-representation.lowercase-even-hex.v1`
- capability identity: `git_porcelain_status_v1`
- capability purpose: `git_porcelain_status`
- policy id: `pure_byte_oriented_porcelain_status_completion_policy_v1`

All identities and policy constants are deeply frozen and fingerprint-bound.

## Exact Command Closure

Accepted command metadata is exactly:

- tool: `git`
- executable: `/usr/bin/git`
- argv: `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`

The builder rejects reordered, omitted, additional, pathspec, config, porcelain v2, non-NUL, rename-enabled, altered submodule, altered untracked, branch-header, Unicode-lookalike, and caller-defined argv.

## Byte Representation

The only accepted byte serialization is lowercase even-length hexadecimal:

- ASCII `0-9a-f` only;
- no `0x` prefix;
- no uppercase;
- no whitespace or separators;
- empty bytes represented as `""`;
- byte count equals `hex.length / 2`.

The contract does not decode bytes as UTF-8 and does not expose decoded stdout or stderr text.

## Limits

Action 585 approved:

- maximum stdout bytes: `65536`;
- maximum stderr bytes: `0`;
- maximum combined bytes: `65536`;
- no truncation;
- no count-only fallback.

Accepted completion requires empty stderr bytes and exact zero-exit lifecycle. Any stderr byte, overflow, stream error, truncation, retry, fallback, termination, signal, non-zero exit, or lifecycle contradiction rejects.

## Result Model

The result union is closed:

1. `accepted_fixture_byte_oriented_porcelain_status_completion`;
2. `blocked_fail_closed`.

Accepted evidence includes exact source linkage, lifecycle fields, stdout/stderr byte hex and counts, byte fingerprints, raw-output fingerprint, contract identity fingerprint, policy fingerprint, and final evidence fingerprint.

Rejected results retain no partially accepted stdout byte payload, expose no raw runtime error, and remain non-authoritative.

Action 590 addendum: rejected overflow/truncation results now include safe `rejectedInputEvidence` so the rejected result fingerprint binds exact rejected flags, validated counts, safe byte fingerprints, and source/capability linkage without retaining raw stdout/stderr hex payload.

## Security Posture

The module is pure and imports only `node:crypto`.

It does not import `server-only`, `fs`, `child_process`, network clients, Supabase clients, credential primitives, timers, signals, process handles, browser tooling, Avanza tooling, API routes, UI components, runners, neutralizers, parsers, direct-spawn adapters, resolver adapters, composition adapters, or revalidation adapters.

All accepted evidence pins:

- `observedLiveProcess:false`;
- `shellUsed:false`;
- `pathLookupUsed:false`;
- `inheritedEnvironmentUsed:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `authorizationConsumed:false`;
- `runtimeActivated:false`;
- `repositoryReadAuthorityGranted:false`;
- `processAuthorityGranted:false`;
- `observerAuthorityGranted:false`;
- `cliExecutionAuthorityGranted:false`;
- `compatibilityAuthorityGranted:false`;
- `toctouEliminated:false`;
- `authority:"none"`.

## Parser Separation

Action 586 intentionally does not implement:

- NUL record parsing;
- XY status-code interpretation;
- path extraction;
- path or record counting;
- clean/dirty classification;
- filename logging;
- invalid UTF-8 repair;
- porcelain aggregate logic;
- compatibility evaluation.

The output is only a byte-oriented completion envelope for a future separately reviewed parser.

## Test Coverage

The focused suite `tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts` covers:

- exact identity and frozen policy;
- exact argv closure;
- arbitrary byte retention as lowercase hex;
- empty stdout;
- deterministic fingerprints;
- input mutation isolation;
- stdout/stderr hex grammar;
- byte count and overflow rejection;
- zero-stderr policy;
- lifecycle closure;
- authority/runtime/live/TOCTOU rejection;
- forged accepted-result validation;
- schema closure against unknown fields, inherited fields, symbols, accessors, classes, arrays, and functions;
- static no-side-effect and no-runtime-reachability checks.

## Remaining Blockers

Before any live status compatibility or aggregate repository decision exists, the following remain separate future work:

1. static/security review of this byte-completion contract;
2. pure porcelain-status parser planning and implementation;
3. parser static/security review and remediation;
4. compatibility-policy planning;
5. dormant orchestration;
6. runtime activation approval;
7. deployment approval.

## Non-Authorizations

No porcelain-status Git command was executed, and no production Git executable was run by application code. Git was used only for repository metadata checks required by the Action precondition and final status reporting. No process was created, observed, controlled, or terminated by production behavior. No repository status was inspected. No live Git version or status was collected. No parser, compatibility decision, runner, API, UI, credential, environment, network, Avanza, trading, persistence, migration, commit, push, merge, or deployment behavior was added or activated.

## Decision

Decision:

`post_trade_pure_byte_oriented_porcelain_status_completion_contract_ready_for_static_security_review`

Result status:

`post_trade_pure_byte_oriented_porcelain_status_completion_action_586_implemented_fixture_only`

Recommended next Action:

Action 587 - Static Security and Contract Review of Pure Byte-Oriented Porcelain Status Completion Contract.
