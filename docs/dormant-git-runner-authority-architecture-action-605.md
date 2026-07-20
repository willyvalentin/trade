# Action 605 Architecture - Dormant Git Runner Authority Model

## Architecture Map

```text
approved resolver evidence
  -> approved executable revalidation evidence
  -> final-approved Git compatibility result
  -> approved worktree evidence
  -> future sequence-scoped authority package
  -> future stage-specific one-shot consumption
  -> future fixed six-stage dormant runner
  -> neutralized raw completion
  -> pure stage interpretation
  -> pure aggregate observation
  -> non-authoritative result exposure

runtime/API/UI/deployment
  X transition absent
```

No arrow grants broad Git compatibility, repository-write authority, credential authority, network authority, Avanza/trading authority, staging readiness, deployment readiness, or production readiness.

## Selected Architecture

Use one immutable sequence-scoped authority package containing independent sub-capabilities. This keeps session, worktree, executable, compatibility, sequence, policy, expiry, and stage grants in one fingerprinted envelope while preventing any single field from becoming broad authorization.

Rejected shapes:

- monolithic runner token, because it hides authority boundaries;
- loose per-stage grants, because independent artifacts increase replay and partial-live risk before storage semantics are designed;
- runtime flags/configuration, because configuration cannot replace provenance and one-shot consumption;
- direct runner implementation, because authority issuance and consumption are not approved.

## Trust-Boundary Diagram

```text
Untrusted caller
  X no executable/cwd/argv/stdout/stderr/bytes/session/policy/options accepted

Source-controlled authority policy
  -> identities, fixed sequence, exact stage catalog, output limits, expiry posture

Reviewed prerequisite evidence
  -> resolver fingerprint
  -> revalidation fingerprint
  -> compatibility result fingerprint
  -> worktree fingerprint

Future authority package
  -> process-create grant per stage
  -> exact CLI tuple grant per stage
  -> repository-read grant for approved worktree only
  -> bounded output-retention grants
  -> stage-evidence and aggregate grants
  -> result-exposure grant
  X runtime-caller activation grant remains false

Future atomic consumption store
  -> required for replay/concurrency control
  X not implemented in Action 605
```

## Authority Lattice

Planned authority levels are distinct and noninterchangeable:

1. `none`;
2. `compatibility_evidence_only`;
3. `authority_package_issuance_structural`;
4. `stage_process_create_authority`;
5. `exact_read_only_git_cli_authority`;
6. `approved_worktree_repository_read_authority`;
7. `bounded_output_retention_authority`;
8. `stage_evidence_construction_authority`;
9. `aggregate_observation_authority`;
10. `non_authoritative_result_exposure_authority`;
11. `runtime_caller_activation_authority`.

Only a future package may carry stages 3 through 10, and only after separate review. Stage 11 remains false and separately gated. Compatibility evidence cannot climb this lattice.

## Sequence and Stage Catalog

The sequence identity is:

`ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1`

The fixed sequence:

1. `git_repository_root_v1` -> `["rev-parse", "--show-toplevel"]`;
2. `git_object_format_v1` -> `["rev-parse", "--show-object-format"]`;
3. `git_head_before_v1` -> `["rev-parse", "--verify", "HEAD"]`;
4. `git_branch_state_v1` -> `["symbolic-ref", "--quiet", "--short", "HEAD"]`;
5. `git_porcelain_status_v1` -> `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`;
6. `git_head_after_v1` -> `["rev-parse", "--verify", "HEAD"]`.

Every stage must bind session, sequence, ordinal, executable `/usr/bin/git`, platform `macos`, approved cwd fingerprint, source policy, output route, output limit, and one-shot grant identity.

## Process and Repository-Read Separation

Process authority means permission to attempt one shell-free process creation with the exact stage tuple. Repository-read authority means permission for that exact process to read local approved-worktree state. Neither implies the other generally.

The future package must reject any attempt to use process authority for a non-Git executable, non-approved cwd, alternate argv, inherited environment, stdin, retry, fallback, detached process, process group, arbitrary signal, observer handoff, credential helper, network operation, or runtime caller.

Repository-read authority is bounded to the approved worktree and the six read-only command tuples. It grants no general filesystem reads and no plaintext path or file-content authority beyond approved evidence routing.

## Output-Retention Boundaries

Output retention must be separated by route:

- bounded text for root, object-format, HEAD-before, branch, and HEAD-after;
- bounded bytes for porcelain status;
- no UTF-8 decoding of porcelain bytes by the runner;
- no raw output logging;
- no persistence;
- no raw Node errors or stacks;
- fingerprint-only linkage where plaintext is not required by an approved pure evidence contract.

Retention ends after approved raw completion, pure interpretation, and aggregate evidence construction.

## Consumption and Replay

Consumption state must be represented explicitly:

```text
issued -> partially_consumed -> consumed
issued -> partially_consumed -> failed_consumed
issued -> expired
issued -> revoked
invalid input -> rejected
```

The process-attempt boundary consumes the current stage grant. Terminal failure consumes the sequence and invalidates unused later grants. Duplicate, reordered, parallel, cloned, replayed, expired, or revoked packages reject.

Future enforcement requires an atomic server-only consumption record. Fingerprints alone are insufficient for replay prevention.

## Expiry Decision

The safest policy is fixed short expiry plus immediate executable/worktree revalidation before consumption. The current baseline does not approve a numeric duration, so Action 605 intentionally does not invent one.

The next gate must decide the fixed expiry/freshness policy before authority-package implementation.

## Planned Result and Audit Model

Issuance results:

- `input_rejected`;
- `prerequisite_rejected`;
- `compatibility_rejected`;
- `worktree_rejected`;
- `authority_package_issued`.

Consumption results:

- `consumption_rejected`;
- `stage_authority_consumed`;
- `sequence_terminal_consumed`;
- `authority_expired`;
- `authority_revoked`;
- `replay_rejected`.

Audit events should include package fingerprint, sequence identity, stage identity, deterministic reason, timestamps, and prerequisite fingerprints only. They must not contain raw output, plaintext paths, credentials, environment values, process handles, raw errors, stack traces, Avanza/trading data, or deployment state.

## Runtime Unreachability

The future authority package and runner remain dormant until separately approved. They must not be imported by app routes, UI, cron, workers, package scripts, deployment config, generic production barrels, observer, credential, resolver, revalidation, direct-spawn, neutralization, composition, or runtime activation paths before the relevant gates complete.

## Mandatory Next Gate

Action 606 should decide the fixed expiry and freshness policy for dormant Git runner authority. Only after that should an implementation action define a pure authority-package issuance contract.
