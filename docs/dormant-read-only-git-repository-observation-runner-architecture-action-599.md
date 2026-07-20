# Action 599 Architecture - Dormant Read-Only Git Repository Observation Runner

This architecture note describes the preferred future dormant server-only runner shape for read-only Git repository observation. It is not an implementation and creates no runtime path.

## Current Approved Chain

The current approved chain reaches pure aggregate evidence only:

```text
server-only live resolver
  -> dormant live composition
  -> immediate pre-spawn revalidation
  -> fixed dormant direct spawn
  -> original production-valid spawn result
  -> dormant neutralization
  -> pure completion evidence
  -> pure per-command interpretation
  -> pure aggregate repository observation
```

The pieces are not currently orchestrated for repository observation. No live runner executes the six Git commands, no compatibility decision exists, and no runtime caller exists.

## Trust Boundary Diagram

```text
Untrusted caller
  X no argv/path/stdout/cwd/options accepted

Source-controlled runner policy
  -> exact stage catalog
  -> exact /usr/bin/git identity
  -> exact text/byte routing

Reviewed one-shot capabilities
  -> resolver/composition/revalidation/process authority per stage
  -> original production-valid direct-spawn result

Neutralization boundary
  -> pure completion evidence

Pure interpretation boundaries
  -> root/object-format/head/branch/status evidence

Pure aggregate boundary
  -> non-authoritative repository observation

Runtime/API/UI/deployment
  X transition does not exist
```

No arrow grants compatibility, deployment, runtime, repository-write, credential, Avanza, trading, or broad execution authority.

## Preferred Data Flow

For a future implementation, the only accepted flow is:

1. receive a closed runner activation package from a separately approved gate;
2. validate sequence identity and six exact stage capabilities;
3. for each stage, consume the stage capability exactly once;
4. invoke the approved fixed direct-spawn boundary for the exact command;
5. neutralize the original direct-spawn result before any interpretation;
6. route stages 1, 2, 3, 4, and 6 through text completion contracts;
7. route stage 5 through byte-oriented porcelain-status completion;
8. invoke only the exact approved pure interpreter for each stage;
9. invoke the pure aggregate builder only after all required stage interpretations are accepted or observationally classified;
10. return a frozen runner result with no compatibility decision and no authority.

## Stage Catalog

| Ordinal | Stage ID | Exact argv | Completion type |
| --- | --- | --- | --- |
| 1 | `git_repository_root_v1` | `["rev-parse", "--show-toplevel"]` | text |
| 2 | `git_object_format_v1` | `["rev-parse", "--show-object-format"]` | text |
| 3 | `git_head_before_v1` | `["rev-parse", "--verify", "HEAD"]` | text |
| 4 | `git_branch_state_v1` | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | text |
| 5 | `git_porcelain_status_v1` | `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]` | bytes |
| 6 | `git_head_after_v1` | `["rev-parse", "--verify", "HEAD"]` | text |

Any added stage, removed stage, reordered stage, alternate argv, alternate executable, shell wrapper, or caller-configured option must reject.

## Architecture Comparison

| Option | Provenance integrity | Authority risk | Testability | Decision |
| --- | --- | --- | --- | --- |
| Narrow six-stage dormant runner | Strong: one source package and fixed stage order. | Lowest current surface. | Focused stage harnesses are straightforward. | Select for future implementation. |
| Per-stage runner plus coordinator | Medium: more partial states and exports. | Higher because partial live outputs may be reused. | More tests and gates. | Defer. |
| Extend Git-version orchestrator | Weak fit: version and repository evidence differ. | Coupling could blur parser eligibility. | Confusing regression surface. | Reject. |
| Caller-configurable graph | Poor: caller controls commands. | High. | Broad and brittle. | Reject. |
| Runtime runner now | Premature. | High without compatibility and activation gates. | Not acceptable. | Reject. |

## Production API Plan

The future runner should expose one server-only production entry point. The input must be a single closed capability package, not individual primitive values.

It must accept no raw completion object, neutralized evidence object, stdout, stderr, byte array, version string, repository path string, executable string, argv array, stage list, lifecycle category, session string, purpose string, platform string, policy string, timestamp, parser option, normalization option, dependency injection, process handle, clock, test mode, or compatibility rule from the caller.

## Working Directory and Repository Identity

The future working directory must be derived from a reviewed repository target capability. The runner should bind worktree identity by opaque fingerprint and stage linkage rather than exposing plaintext path data by default.

The runner must not use the ambient current directory, environment variables, shell expansion, Git config, PATH, recursive discovery, or caller-supplied repository roots as trust sources.

## Failure Precedence

Recommended precedence:

1. runner input/schema/provenance rejected;
2. sequence identity or policy rejected;
3. stage capability missing, duplicated, reordered, expired, cloned, or already consumed;
4. process capability rejection before spawn;
5. direct-spawn terminal failure;
6. neutralization rejection;
7. completion route mismatch;
8. pure interpreter rejection;
9. aggregate rejection;
10. accepted non-authoritative observation.

Unknown reasons remain blocking and must not map to accepted observation.

## Detached Branch Posture

Detached HEAD is an observational repository state. The future runner may continue to aggregate when the branch-state interpreter returns a reviewed detached state, provided HEAD-before, status, and HEAD-after evidence remain valid. Detached state must not be upgraded to compatibility success or deployment readiness.

## Linkage and Fingerprints

The future result fingerprint should bind:

- runner identity and version;
- sequence identity;
- session;
- worktree fingerprint;
- `/usr/bin/git` executable identity;
- exact stage catalog and ordinals;
- per-stage capability fingerprints;
- per-stage direct-spawn result/evidence fingerprints;
- per-stage neutralization/completion fingerprints;
- per-stage interpretation fingerprints;
- aggregate input and result fingerprints;
- HEAD stability state;
- branch/detached state;
- cleanliness state;
- all authority and runtime flags;
- closed reasons.

Fingerprints are evidence, not authority. A changed upstream fingerprint must either change the runner fingerprint or reject the result.

## Result Shape

The planned closed union:

| Status | Meaning |
| --- | --- |
| `runner_input_rejected` | No trusted sequence can be built. |
| `runner_stage_rejected` | A stage failed before valid interpretation. |
| `runner_interpretation_rejected` | A pure interpreter rejected stage output. |
| `runner_aggregate_rejected` | Stage evidence did not form a valid aggregate. |
| `runner_observation_accepted_non_authoritative` | The fixed observation sequence aggregated successfully without granting authority. |

All statuses keep `authority:"none"`, `compatibilityDecision:null`, `runtimeActivated:false`, `deploymentAuthorityGranted:false`, and `toctouEliminated:false`.

## Compatibility Dependency

The next safest work is not runner implementation. The repository-observation runner would be unusable without a closed compatibility baseline describing what observed aggregate facts can and cannot mean. Therefore Action 600 should complete the read-only Git compatibility baseline decision before any runner skeleton is implemented.

## Test Strategy

Future implementation tests must cover:

- exact sequence and argv;
- `/usr/bin/git` only;
- no caller path/argv/stdout/stderr/byte input;
- stage order rejection;
- missing/duplicate stage rejection;
- clone/reconstruction rejection;
- one-shot consumption per stage;
- no retry after every terminal failure;
- text stages never take byte route;
- status stage never takes text route;
- detached branch outcome;
- HEAD change aggregate rejection;
- dirty status aggregate outcomes;
- parser rejection and aggregate rejection precedence;
- deep freeze and mutation isolation;
- no raw output in logs/results beyond approved evidence;
- no app/API/UI/runner reachability;
- no credential/env/network/Avanza/trading/persistence/deployment behavior.

Tests must not execute real Git through product behavior until a separate controlled live-validation action approves it.

## Mandatory Future Implementation Constraints

- `import "server-only";` first effective import;
- one production entry point;
- no production test hooks;
- fixed source-controlled stage catalog;
- original direct-spawn source preserved until neutralization for each stage;
- neutralization before interpretation;
- aggregate only after exact stage validation;
- no direct stdout/status-byte inspection;
- no process observation or termination;
- no compatibility evaluation;
- no runtime caller;
- no retries, fallback, caching, or broad Git support;
- independent static/security review, remediation, final re-review, compatibility-policy planning, runtime activation approval, and deployment approval.

## Commit and Deploy

No deploy is recommended for Action 599. A source-control checkpoint commit may be considered only after the planning diff and validation are manually inspected.
