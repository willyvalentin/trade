# Action 579 - Read-Only Git Capability Architecture

## Architecture Recommendation

Recommended future architecture: Option A, one closed server-only runner executes all approved observations in a fixed sequence, with separate pure output interpreters for every Git output format.

This option keeps command authority in one small source-controlled boundary, keeps output parsing pure and independently testable, and avoids exposing a generic Git runner.

## Option Comparison

| Option | Description | Verdict |
| --- | --- | --- |
| A | One closed server-only runner executes all approved observations in fixed sequence, with separate pure output interpreters. | Preferred. Strongest API closure, ordering, one-shot, TOCTOU, and reviewability posture for the first boundary. |
| B | One server-only adapter per Git command. | Acceptable later if the runner becomes too large, but initial fragmentation could weaken sequence and freshness review. |
| C | Generic Git runner accepting capability IDs. | Rejected for initial scope; capability IDs can become a broad authority surface. |
| D | Generic Git runner accepting arbitrary argv. | Rejected; it directly violates argv closure. |
| E | Shell script. | Rejected; shell, environment, quoting, and filesystem authority are too broad. |
| F | Runtime/API-triggered repository inspection. | Rejected; premature runtime activation and authority expansion. |

## Trust Boundaries

The future boundary sequence should be:

```text
source-controlled capability contract
  -> approved executable and worktree provenance
  -> closed server-only runner
  -> raw process completion evidence for each exact Git tuple
  -> separate pure output interpreters
  -> immutable repository-observation evidence
  -> later compatibility policy, if separately approved
```

Transitions that do not yet exist:

- no implemented repository-inspection runner;
- no root output parser;
- no object-format output parser;
- no HEAD object parser;
- no branch-state parser;
- no porcelain status parser for this first-live contract;
- no compatibility evaluator;
- no runtime activation.

## Command Order

Recommended future order:

1. validate executable and worktree provenance;
2. run `git_repository_root_v1`;
3. run `git_object_format_v1`;
4. run `git_head_object_v1`;
5. run `git_branch_state_v1`;
6. run `git_cleanliness_status_v1`;
7. repeat `git_head_object_v1` or bind an explicit freshness policy if any later operation depends on a stable HEAD;
8. assemble immutable evidence;
9. return no-authority result.

The repeated HEAD check is not a new command type; it is a sequencing requirement for a future runner if the later eligibility decision relies on stable identity across status collection.

## Working Directory

The runner must accept only a provenance-linked worktree capability. It must not accept caller cwd, ambient cwd, relative paths, arbitrary absolute paths, path strings without provenance, PATH search roots, environment-selected roots, user config, or repository discovery.

The Git root output is not authority by itself. It is a check against the approved worktree capability.

## Environment And Config Architecture

The future runner must use a fixed minimal environment. No caller environment, inherited full environment, credentials, PATH lookup, shell, pager, prompt, or network access may enter.

The future output-contract phase must decide:

- exact fixed `LC_ALL` and `LANG`;
- exact pager suppression;
- exact `GIT_TERMINAL_PROMPT=0`;
- exact `GIT_OPTIONAL_LOCKS=0`;
- whether `HOME`, `XDG_CONFIG_HOME`, and Git config variables are absent or fixed;
- whether repository config is accepted for selected commands;
- whether include directives, attributes, excludes, and submodule config are rejected, bounded, or accepted as evidence.

## Output Interpreter Architecture

Each selected output format requires a pure contract:

- repository root output contract;
- object format output contract;
- HEAD object output contract;
- branch/detached output contract;
- porcelain v1 NUL status output contract.

The runner must not parse output inline except for routing raw completions to the correct pure contract. The pure contracts must remain deterministic, deeply frozen, no-authority, no-runtime, no-network, no-credential, no-filesystem, and no-process.

## Reason And Result Model

Future runner results should be a closed union:

- `input_rejected`;
- `worktree_provenance_rejected`;
- `executable_provenance_rejected`;
- `command_blocked`;
- `command_failed`;
- `output_rejected`;
- `output_ambiguous`;
- `observation_succeeded_non_authoritative`.

Reasons should be deterministic and closed:

- `unknown_capability`;
- `argv_rejected`;
- `working_directory_rejected`;
- `environment_rejected`;
- `config_posture_unresolved`;
- `stderr_rejected`;
- `exit_code_rejected`;
- `output_overflow`;
- `output_malformed`;
- `object_format_rejected`;
- `head_identity_rejected`;
- `branch_state_rejected`;
- `status_record_rejected`;
- `unmerged_state_rejected`;
- `operation_state_unresolved`;
- `toctou_not_eliminated`;
- `unexpected_internal_failure`.

Reasons must not include raw paths, filenames, stdout, stderr, Node errors, stacks, secrets, or environment values.

## Future Review Gates

Mandatory future gates:

1. Capability necessity review.
2. Exact argv review.
3. Working-directory provenance review.
4. Environment-isolation review.
5. Git-config influence review.
6. Hook/filter/pager/external-program review.
7. Network/credential review.
8. Mutation/locking review.
9. Output-format review.
10. Object-format review.
11. Path/filename safety review.
12. TOCTOU/freshness review.
13. Version-capability evidence review.
14. Policy artifact review.
15. Export-surface review.
16. Runtime-reachability review.
17. Independent static security review.
18. Remediation and final re-review.
19. Separate runner planning.
20. Separate runtime activation approval.
21. Separate deployment approval.

## Recommended Next Action

Action 580 - Plan Pure Read-Only Git Observation Output Contracts.

This is safer than immediately resuming numeric compatibility derivation because the selected command set now depends on multiple output grammars, object-format handling, status path handling, environment posture, and config posture.

## Explicit Non-Authorizations

This architecture does not authorize Git execution, repository inspection, compatibility evaluation, runtime activation, staging readiness, deployment readiness, process observation, process control, credentials, network, API/UI/runner wiring, Avanza/trading behavior, persistence, commit, push, merge, or deploy.
