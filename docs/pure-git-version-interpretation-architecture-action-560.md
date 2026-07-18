# Action 560 - Pure Git Version Interpretation Architecture

## Boundary Placement

The planned pure Git-version interpretation boundary sits after the approved pure raw process completion evidence contract and before any compatibility, runner, live neutralization, observer, or runtime boundary.

```text
approved raw completion evidence
  -> future pure Git-version parser
  -> immutable interpretation evidence
  -> future policy compatibility review
```

The parser must not accept dormant direct-spawn evidence directly. The bridge from live spawn output to the raw completion contract remains a separate future neutralization boundary.

## Reviewed Inputs

Action 560 reviewed:

- the pure raw completion evidence contract and tests;
- Action 556-559 docs and checkpoints;
- dormant fixed direct-spawn architecture and checkpoint docs;
- existing fixture-only CLI-version evidence contracts;
- credential/no-credential, no-network, lifecycle, provenance, fingerprint, authority, and Action 533 cross-boundary contracts.

The existing fixture CLI collector already documents a narrow fixture parser for `git version X.Y.Z`. Action 560 does not reuse that as implementation authority; it uses it only as evidence that the smallest reviewed Git output shape is the safest baseline.

## Trust Boundary

The future parser is a pure interpretation boundary. It may transform immutable raw completion evidence into immutable parser evidence, but it may not:

- create live provenance;
- observe a process;
- read executable contents;
- inspect the filesystem;
- run Git;
- infer executable trust;
- consume authorization;
- enable runner or deployment behavior.

## Input Contract

The parser must accept only the raw completion result whose evidence is accepted under:

- contract kind `pure_raw_process_completion_evidence_contract`;
- contract version `1`;
- boundary `ture.execution.raw-process-completion-evidence.fixture-boundary.v1`;
- source spawn contract `ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1`;
- purpose `first_live_read_only_staging_preflight`;
- platform `macos`;
- tool `git`;
- canonical executable `/usr/bin/git`;
- argv `["--version"]`;
- completion category `process_created_normal_zero_exit`.

All authority and live-action flags must remain false or `none`.

## Grammar

The planned grammar is intentionally smaller than generic semver:

```text
git version <major>.<minor>.<patch>
```

Accepted components are ASCII decimal integers with no leading zeros except the single digit `0`. The grammar rejects suffixes, prerelease strings, build metadata, localization, warnings, prompts, multi-line output, CRLF, ANSI, NUL, and control characters.

## Fingerprint Linkage

Future fingerprints must bind:

- parser contract identity and version;
- parser grammar identity and version;
- normalization policy identity and version;
- raw completion result fingerprint;
- raw completion evidence fingerprint;
- raw stdout fingerprint;
- session and purpose;
- tool, executable, argv, and source spawn fingerprint;
- accepted/rejected status and deterministic reason list;
- parsed components when accepted.

Fingerprints remain linkage only. They are not authority.

## Authority Lattice

Reachable authority for this planned parser remains:

`none`

The parser must not turn completion, compatibility, reviewed policy, matching fingerprint, or parsed version into:

- executable authority;
- process-start authority;
- observer authority;
- credential authority;
- network authority;
- runner authority;
- deployment authority;
- API/UI/runtime authority;
- Avanza/trading/persistence authority.

## Future Implementation Constraints

Action 561 must implement only a pure core:

- no `server-only`;
- no `node:fs` or `fs/promises`;
- no `node:child_process`;
- no process API;
- no `process.env`;
- no network imports;
- no credential, Keychain, browser, Supabase, Avanza, trading, persistence, API, UI, runner, cron, or deployment imports;
- no generic semver dependency unless separately approved;
- deterministic rejection reasons;
- deep freeze;
- complete fingerprints;
- no runtime reachability.

## Future Review Gates

Required gates:

1. Focused parser tests.
2. Pure-import review.
3. Input schema-closure review.
4. Completion-eligibility review.
5. Stdout/stderr policy review.
6. Grammar review.
7. Normalization review.
8. Control-character, ANSI, and NUL review.
9. Component-bounds review.
10. Deterministic-reason review.
11. Fingerprint review.
12. Provenance review.
13. Authority review.
14. Runtime-reachability review.
15. Independent static security review.
16. Remediation and final re-review.
17. Separate live-neutralization review.
18. Separate runtime activation approval.
19. Separate deployment approval.

## Next-Action Comparison

| Option | Verdict |
| --- | --- |
| Implement pure Git-version interpretation contract | Recommended. It resolves parser semantics before live neutralization exists. |
| Plan live spawn-to-raw-completion neutralization | Useful later, but it should consume a settled parser input contract. |
| Implement live neutralization | Too early; parser contract is not implemented or reviewed. |
| Combine live neutralization and interpretation | Rejected; it collapses live bridge and pure interpretation boundaries. |
| Runtime activation | Rejected; no parser, neutralization, observer, runner, or activation approval exists. |

## Safety Statement

No executable was run. No Git version was collected or interpreted. No process was spawned or observed. No filesystem, environment, network, credential, Keychain, browser, Avanza, trading, persistence, API/UI/runner, deployment, or production behavior was introduced.
