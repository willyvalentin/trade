# Action 554 - First-Live Next-Boundary Planning Gate

## Purpose

Action 554 compares the safest next boundary after the approved dormant fixed read-only direct-spawn adapter. It does not implement the next boundary and does not activate any runtime path.

## Current Approved Chain

```text
server-only live resolver
  -> dormant live composition
  -> closed pre-lstat eligibility bridge
  -> single bigint lstat
  -> private production-valid revalidation evidence
  -> boundary-specific one-shot spawn consumption
  -> fixed /usr/bin/git ["--version"]
  -> bounded stdout/stderr
  -> exactly-once terminal settlement
  -> fixed SIGKILL ownership for internal fatal conditions
  -> immutable, non-authoritative spawn lifecycle evidence
```

## Approved Guarantees

The approved checkpoint preserves server-only closure, original-object provenance, one-shot consumption, exact executable and argv, fixed environment, no `PATH` or inherited `process.env`, `shell:false`, `detached:false`, bounded stdio, one spawn attempt, no retry, no fallback, exactly-once settlement, stream-error handling, overflow termination ownership, listener cleanup, internal fatal settlement without indefinite `close` waiting, no false child-death claim, immutable non-authoritative evidence, honest TOCTOU posture, and no runtime reachability.

## Absent Capabilities

The chain still lacks runtime activation, a general process observer, reusable process-handle exposure, CLI-version parsing, Git-version evidence, Supabase CLI execution, credentials, network, API/UI/runner wiring, authorization consumption, Avanza behavior, trading/order/position/settlement behavior, persistence, and deployment.

## Remaining TOCTOU Limitations

The current direct-spawn evidence records a bounded lifecycle result, but it does not eliminate filesystem or process-observation TOCTOU. Future boundaries must not convert revalidation or spawn evidence into reusable execution permission. Any future observer must be scoped to exactly one child produced by the reviewed direct-spawn boundary and must not become a generic process manager.

## Next-Boundary Comparison

| Option | Assessment | Decision |
| --- | --- | --- |
| A. Dormant scoped process observer consuming one original spawn lifecycle object | Directly addresses the next trust problem after process creation: who owns observation, terminal lifecycle, late events, and bounded child linkage. Can remain dormant, server-only, one-shot, non-authoritative, and separately reviewed. | Recommended. |
| B. Dormant bounded completion collector inside the existing direct-spawn wrapper | Would increase lifecycle coupling inside an already approved boundary and make later observation ownership harder to isolate. | Not selected. |
| C. Pure raw completion-evidence contract only | Useful as a supporting artifact, but the current spawn wrapper already returns raw bounded lifecycle evidence. It does not answer handle ownership, late events, or observation scope. | Not selected as the next action. |
| D. CLI-version parser for raw bounded output | Introduces semantic interpretation too early. Parsing must wait until raw completion and observation ownership are fully reviewed. | Rejected for now. |
| E. Closed server-only observer-plus-version-collector orchestration | Combines observation and interpretation, increasing review surface and authority confusion risk. | Rejected for now. |
| F. Runtime activation of the current chain | Would activate process behavior without the required observer, timeout, interpretation, and runner gates. | Rejected. |

## Observer Trust Problem

The recommended next planning action must define:

- Who owns the child handle.
- Whether the spawn adapter may transfer a handle-like object.
- How original-object provenance is preserved.
- Whether observer consumption is one-shot.
- How close, exit, error, and output events are represented.
- How late events after terminal settlement are handled.
- How fixed kill ownership remains separated.
- How observer authority remains bounded to one child.
- How no generic process manager is created.
- How no child handle escapes to callers.
- How no retry or respawn occurs.
- How result interpretation remains separate.

## Raw Completion Evidence Model

Future raw completion evidence needs:

- Process-created status.
- Spawn error status.
- Exit code.
- Signal.
- Close observed.
- stdout raw bounded bytes or decoded text.
- stderr raw bounded bytes or decoded text.
- Output overflow status.
- Stream-error status.
- Termination requested.
- Termination request result.
- Process death confirmed or unconfirmed.
- Observation timestamps.
- Exact session, tool, path, policy, provenance, and fingerprint linkage.
- `toctouEliminated:false`.
- `authority:none`.

Already present: fixed tool/path/argv/env linkage, bounded stdout/stderr capture, spawn/exit/close/error lifecycle fields, overflow status, stream-error status, termination request status, immutable result freezing, fingerprinting, and non-authoritative posture.

Still absent: a separately scoped process observer authority model, observer-owned timestamps, explicit observer handle-transfer constraints, a reviewed raw completion evidence consumer boundary, and any CLI-version evidence.

## CLI-Version Interpretation Separation

Future Git-version parsing must consume immutable raw completion evidence only. It must never own process creation, credentials, network, observer authority, or runtime activation. It must not infer authority from output. It must fail closed on malformed, ambiguous, oversized, binary, non-zero, signal-terminated, stream-error, overflow, or incomplete results. It requires a separate approval and review gate.

## Recommended Next Action

Action 555 - Plan Dormant Scoped Process Observer Boundary

This is the smallest next action that addresses the open post-spawn trust problem without implementing a live observer, parsing CLI output, adding a runtime caller, or widening process authority.

## Mandatory Implementation Constraints

The future observer plan and any later implementation must preserve:

- Server-only first import where live handles exist.
- Boundary-specific original-object provenance.
- One-shot consumption.
- No generic observer.
- No process creation.
- No retry.
- No respawn.
- No caller child handle.
- No caller event injection.
- No credentials or network.
- No runtime wiring.
- Immutable non-authoritative evidence.
- Exact lifecycle semantics.
- Independent security review.
- Remediation and final re-review gates.
- Separate approval before CLI parsing.
- Separate approval before runtime activation.

## Mandatory Review Gates

The recommended next boundary requires:

1. Planning gate.
2. Dormant implementation gate.
3. Static/security review gate.
4. Remediation gate if findings exist.
5. Independent final re-review gate.
6. Separate raw completion or parser gate before CLI-version interpretation.
7. Separate runtime activation gate before any executable can be invoked from application code.

## Explicit Non-Authorizations

Action 554 does not authorize observer implementation, CLI-version interpretation, real executable execution, real Git version collection, live resolver invocation, composition invocation, revalidation invocation, spawn invocation, runtime/API/UI/runner/cron activation, credentials, network, browser, Avanza, trading, order, position, settlement, persistence, deployment, commit, push, merge, or production readiness.

## Commit And Deploy

No deploy is recommended for Action 554. A source-control checkpoint commit may be considered only after the complete diff has been manually inspected.

## Decision

Decision: `post_trade_first_live_direct_spawn_post_review_checkpoint_complete_next_boundary_plan_ready`

Result status: `post_trade_first_live_direct_spawn_action_554_planning_gate_completed`
