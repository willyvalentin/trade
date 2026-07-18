# Action 549 - Direct-Spawn Architecture

## Architecture Option Comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| A. Dormant server-only direct-spawn adapter consuming approved original revalidation evidence | Smallest next boundary. It can preserve provenance and one-shot semantics while staying unreachable from runtime. | Recommended. |
| B. Closed server-only revalidation-plus-spawn orchestrator | Best TOCTOU interval, but broader and more coupled than the immediate next action. | Defer to a later design if needed. |
| C. Direct-spawn adapter accepting neutral serialized revalidation metadata | Loses original-object provenance and increases replay risk. | Reject. |
| D. General process runner abstraction | Too broad; risks command, environment, retry, and runtime authority expansion. | Reject. |
| E. Combine spawn, observer, and CLI-version parsing | Collapses trust boundaries and would make spawn success, observation, and interpretation too easy to confuse. | Reject. |

## Boundary Placement

The future direct-spawn adapter should sit after the approved immediate revalidation wrapper and before any observer, timeout, termination, CLI-version parser, authorization-consumption, runner, API, or UI boundary.

```text
approved original revalidation object
  -> boundary-specific one-shot consume operation
  -> fixed source-controlled spawn policy
  -> one dormant server-only spawn attempt boundary
  -> immutable lifecycle evidence
  -> later separately reviewed observer/result interpretation
```

The adapter must not accept a neutral evidence object as spawn authority. It must consume the original revalidation object before attempting process creation and must make success, failure, and exception paths terminal for that input.

## Fixed Policy Shape

Initial fixed policy should include only:

- operation: `collect_git_version`;
- tool identity: `git`;
- argv: `["--version"]`;
- executable path: consumed from original approved revalidation evidence;
- cwd: none;
- env: reviewed fixed environment map;
- stdin: closed;
- stdout/stderr: bounded sanitized capture;
- shell: false;
- detached: false;
- retry: none;
- fallback: none;
- expected child policy: no children expected;
- credential requirement: none;
- network configuration: none.

`collect_supabase_cli_version` remains reviewed structurally but should not be the first live spawn target.

## Authority Separation

The future adapter may produce spawn lifecycle evidence, but must not produce:

- observer authority;
- credential authority;
- CLI-version compatibility;
- authorization-consumption proof;
- runner readiness;
- API/UI activation;
- deployment readiness.

Spawn initiation can at most prove that the OS accepted a process-start request. It cannot prove the command completed, produced valid version text, stayed contained, avoided child processes, or satisfied staging-preflight readiness.

## TOCTOU Trust Limit

Immediate metadata comparison reduces stale resolver evidence but does not prove permanent executable identity. The future spawn boundary must document:

- lstat revalidation is point-in-time;
- spawn-by-path still has a pathname race;
- `deviceId`, `inode`, `sizeBytes`, `mode`, and `modifiedTimeMs` are useful continuity evidence, not immutable identity;
- `toctouEliminated: false` remains mandatory;
- a stronger OS-specific execution primitive requires a separate design and review.

## Failure Semantics

Fail closed and terminal states:

- missing or invalid original revalidation object;
- missing private provenance;
- already consumed object;
- unsupported tool;
- tool/path/platform/session/purpose/policy/fingerprint mismatch;
- expired or stale evidence;
- unsafe authority claim;
- shell/PATH/env/cwd/stdio/caller option request;
- spawn API failure;
- timeout or output overflow;
- nonzero exit;
- signal termination;
- observer handoff unavailable.

No failure path may retry, search another executable, change argv, add environment, widen cwd, attach credentials, or consume a second authorization.

## Review Gates Before Activation

Action 550 may implement only dormant focused-test reachability. Activation still requires an independent static/security review, final re-review after any remediation, then separate observer, CLI interpretation, authorization-consumption, runner, runtime, and deployment gates.

No Action 549 text describes the system as spawn-ready, staging-ready, execution-ready, credential-ready, Avanza-ready, deployment-ready, or production-ready.
