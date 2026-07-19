# Action 594 - Pure Aggregate Read-Only Git Repository Observation Architecture

## Architecture Summary

Action 594 selects a pure aggregate builder as the next architectural step for read-only Git repository observation evidence.

The selected architecture does not run Git. It combines only accepted fixture evidence from existing pure contracts and returns one immutable, non-authoritative aggregate observation result.

## Approved Evidence Producers

| Stage | Evidence Producer | Exact tuple | Current authority |
| --- | --- | --- | --- |
| root | repository-root interpretation | `git rev-parse --show-toplevel` | `none` |
| object format | object-format interpretation | `git rev-parse --show-object-format` | `none` |
| HEAD before | HEAD object-ID interpretation | `git rev-parse --verify HEAD` | `none` |
| branch | branch/detached interpretation | `git symbolic-ref --quiet --short HEAD` | `none` |
| status | porcelain-status interpretation | `git status --porcelain=v1 -z --untracked-files=all --no-renames --ignore-submodules=none` | `none` |
| HEAD after | HEAD object-ID interpretation | `git rev-parse --verify HEAD` | `none` |

The aggregate consumes the resulting pure evidence. It does not consume raw process output, byte-completion evidence directly, process handles, live subprocess state, caller-supplied repository facts, or parser options.

## Trust Boundary Diagram

```text
approved worktree evidence
        |
        v
pure root evidence --------------+
pure object-format evidence -----+--> future pure aggregate builder
pure HEAD-before evidence -------+        |
pure branch/detached evidence ---+        v
pure porcelain-status evidence --+   immutable aggregate observation
pure HEAD-after evidence --------+        |
                                         v
                              later policy/runner work, not present
```

This architecture creates no transition to live execution authority, compatibility authority, runner authority, deployment authority, repository-read authority, credentials, network, API, UI, Avanza, trading, or persistence.

## Source Eligibility

Only accepted results from approved pure contracts are eligible. Rejected evidence remains rejected even if a later stage would appear consistent.

Every stage must share:

- session;
- platform `macos`;
- purpose `first_live_read_only_staging_preflight`;
- tool `git`;
- executable `/usr/bin/git`;
- policy identity/version;
- working-directory fingerprint;
- observation-sequence identity;
- source spawn lineage where applicable;
- no-authority/no-runtime posture.

## Ordering

The aggregate enforces fixed stage slots:

1. root;
2. object format;
3. HEAD before;
4. branch/detached;
5. porcelain status;
6. HEAD after.

The order is security-relevant because HEAD-after is the only structural check that the commit ID did not change across branch and status observation. Timestamps may be retained as evidence but cannot replace the fixed slots plus shared sequence identity.

## Linkage Rules

Root/worktree:

- compare accepted root evidence against approved worktree evidence by one reviewed exact comparison;
- reject mismatch deterministically;
- do not perform filesystem canonicalization or symlink resolution.

Object-format/HEAD:

- both HEAD observations must link to the same accepted object-format evidence;
- both object IDs must match the expected length for `sha1` or `sha256`;
- object-format mismatch is a linkage failure, not a clean/dirty outcome.

Branch/status:

- branch and status evidence must share session, sequence, platform, executable, policy, and worktree linkage;
- detached HEAD is valid observation but not later activation eligibility;
- dirty status is valid observation but not later activation eligibility.

## Result Union

The planned union is:

- `input_rejected`;
- `stage_linkage_rejected`;
- `observation_sequence_mismatch`;
- `repository_root_mismatch`;
- `unsupported_object_format`;
- `head_changed_during_observation`;
- `detached_head`;
- `repository_dirty`;
- `repository_clean_stable_observation`.

The final clean state is intentionally not named `ready`. It grants no compatibility, runtime, staging, deployment, or execution authority.

## Fingerprint Graph

The aggregate fingerprint must bind:

```text
aggregate identity
  + aggregate policy
  + root evidence fingerprint
  + object-format evidence fingerprint
  + HEAD-before evidence fingerprint
  + branch evidence fingerprint
  + status evidence fingerprint
  + HEAD-after evidence fingerprint
  + worktree evidence fingerprint
  + sequence identity
  + shared session/platform/policy/executable
  + root match
  + object format
  + HEAD-before/after/stable
  + branch state/name fingerprint
  + status counts and ordered status fingerprint
  + result status/reason
  + eligibility false posture
  + authority/runtime/live/TOCTOU false posture
```

Every stage fingerprint change must change the aggregate fingerprint. Fingerprints remain evidence only.

## TOCTOU Posture

The aggregate does not eliminate TOCTOU. Matching HEAD before and after narrows one mutation window but does not prove that the working tree, index, branch, repository root, or executable state remains unchanged after observation.

The aggregate result must always include `toctouEliminated:false`. Future live runner work must separately handle freshness, immediate revalidation, expiry, and one-shot activation.

## Architecture Options

| Option | Description | Verdict |
| --- | --- | --- |
| A | One pure aggregate builder accepts all six stage evidence objects. | Selected. Smallest closed boundary, simple to review, no runtime coupling. |
| B | Multiple pairwise linkage contracts followed by aggregate. | Rejected for now. It adds partial states and more review surface. |
| C | Aggregate inside a future server-only runner. | Rejected. It couples evidence semantics to runtime too early. |
| D | Generic evidence graph evaluator. | Rejected. It is too broad and could become generic authority plumbing. |

## Implementation Options

| Option | Description | Verdict |
| --- | --- | --- |
| 1 | Implement the pure aggregate contract next. | Recommended. The prerequisite evidence contracts are now reviewed. |
| 2 | Resume Git compatibility baseline derivation first. | Rejected until aggregate evidence exists. |
| 3 | Plan byte-preserving live capture. | Premature. |
| 4 | Plan the dormant read-only Git runner. | Premature without aggregate semantics. |
| 5 | Activate runtime. | Prohibited. |

Recommended next Action: Action 595 - Implement Pure Aggregate Read-Only Git Repository Observation Contract.

## Review And Activation Gates

The next implementation must remain pure and fixture-only. After Action 595, separate gates are still required for static/security review, remediation, final re-review, live capture planning, runner planning, compatibility-baseline review, runtime activation approval, and deployment approval.

No Action 594 document should be read as repository-inspection readiness, Git compatibility readiness, runtime readiness, staging readiness, deployment readiness, or production readiness.
