# Action 555 - Scoped Process Observer Planning Gate

## Purpose

Action 555 evaluates whether the first-live read-only staging preflight needs a separate dormant scoped process observer after the approved fixed direct-spawn boundary. This is a documentation, architecture, and approval-gate action only.

No observer was implemented. No direct-spawn adapter was modified. No executable was run. No Git version was collected. No child-process handle was exposed or transferred. No resolver, composition, revalidation, or spawn adapter was invoked. No CLI parsing, runtime/API/UI/runner/cron activation, credentials, network, Avanza, trading, order, position, settlement, persistence, commit, push, merge, or deployment behavior occurred.

## Current Approved Process Model

- Exact original production-valid immediate revalidation evidence is consumed one-shot.
- Exactly one fixed `/usr/bin/git ["--version"]` process attempt may occur inside the dormant direct-spawn boundary.
- Shell is disabled.
- Environment is fixed to source-controlled `LANG=C` and `LC_ALL=C`.
- stdin is disabled.
- stdout and stderr are bounded.
- Synchronous spawn exceptions are handled.
- Asynchronous child errors are handled.
- stdout and stderr stream errors are handled.
- stdout, stderr, and combined output overflow are handled.
- Internal fatal conditions settle independently of `close`.
- Fixed SIGKILL termination ownership exists for internal fatal conditions.
- Ordinary completion observes exit and close.
- Immutable non-authoritative lifecycle evidence is produced.
- No child handle is returned.
- No observer authority is granted.
- No CLI-version interpretation occurs.

Ordinary observation already implemented inside the direct-spawn boundary: child `spawn`, child `error`, child `exit`, child `close`, stdout `data`, stderr `data`, stdout `error`, stderr `error`, byte limits, UTF-8 validation at close, binary-output rejection markers, internal fatal settlement, fixed termination request on internal fatal conditions, listener cleanup, late error sinks, and immutable lifecycle evidence construction.

## Observer Necessity Analysis

| Option | Assessment | Verdict |
| --- | --- | --- |
| A. Keep completion observation within the existing fixed direct-spawn boundary | Matches the current short-lived `git --version` process. Avoids child-handle transfer, duplicate listeners, two settlement owners, and generic observer authority. | Preferred current model. |
| B. Split process creation from observation and transfer one private child handle to a dormant observer | Creates a new live authority boundary and handle-transfer problem. It may be valuable for longer-running future processes, but it duplicates current `git --version` responsibilities. | Not next. |
| C. Keep live observation in direct spawn but introduce a pure raw-completion evidence contract downstream | Adds a narrow, non-live schema between current spawn evidence and future CLI parsing. Reduces parser risk without handle transfer or new process authority. | Recommended next. |
| D. Introduce a separate observer only for future longer-running processes | Sensible future option, but not needed before raw completion evidence for the present one-shot command. | Defer. |
| E. Introduce a general observer abstraction | Too broad. It risks generic process-handle APIs, PID attachment, reusable observer authority, and runtime misuse. | Reject. |

Observer necessity verdict: a separate live observer is not presently needed for the fixed `git --version` path because the direct-spawn boundary already owns the relevant process lifecycle and bounded output observation. The safest next step is a pure raw process-completion evidence contract.

## Next Action Comparison

| Candidate | New live authority | Value | Risk | Decision |
| --- | --- | --- | --- | --- |
| Implement dormant scoped process observer | Yes, if it receives a child handle. | Could clarify future observation ownership. | Duplicates current listener/settlement work and raises handle-transfer risk. | Not selected. |
| Define pure raw process-completion evidence contract | No. | Clarifies parser input, terminal states, fingerprints, and fail-closed rules before interpretation. | Low; pure schema only. | Selected. |
| Implement pure raw process-completion evidence adapter from current spawn lifecycle results | No live process authority, but introduces production mapper behavior. | Useful after contract approval. | Premature before schema review. | Defer. |
| Extend current spawn adapter with additional neutral completion fields | Touches approved production runtime code. | Could fill gaps directly. | Larger blast radius and risks destabilizing approved settlement. | Reject now. |
| Implement Git-version parser | No process authority if pure, but semantic authority enters. | Moves toward preflight version evidence. | Too early without raw completion evidence contract. | Reject now. |
| Implement observer-plus-parser orchestration | Yes, mixed boundary. | High-level progress. | Collapses trust boundaries. | Reject. |
| Activate the live chain | Yes. | Runtime progress. | Missing observer/raw evidence/parser/review gates. | Reject. |

## Exact Recommended Next Action

Action 556 - Define Pure Raw Process Completion Evidence Contract

This action should be pure, fixture-testable, and authority-free. It should not implement a live observer, spawn a process, parse Git output, or wire runtime callers.

## Mandatory Constraints

- No runtime wiring.
- No real executable during tests.
- No credentials or network.
- No CLI interpretation.
- No general process manager.
- No generic child-handle API.
- Exact closed schemas.
- `authority:none`.
- Immutable evidence.
- One-shot linkage where live provenance exists.
- No process creation unless explicitly selected and reviewed in a later action.
- No retry or respawn.
- Independent security review.
- Remediation and final re-review.
- Separate approval before CLI parser implementation.
- Separate approval before runtime activation.

## Mandatory Review Gates

1. Architecture review.
2. Responsibility-overlap review.
3. Child-handle ownership review if a later live observer is proposed.
4. Export-surface review.
5. Original-object provenance review if live provenance enters.
6. One-shot/replay review.
7. Event-listener ownership review.
8. Kill-ownership review.
9. Lifecycle-state review.
10. Raw-evidence schema review.
11. Authority review.
12. Credential/network review.
13. Runtime-reachability review.
14. Prohibited-operation review.
15. Focused tests.
16. Independent static security review.
17. Remediation and final re-review.
18. Separate approval before CLI interpretation.
19. Separate approval before runtime activation.
20. Separate approval before deployment.

## Explicit Absent Authorities

Observer authority, CLI-version authority, credential authority, network authority, authorization-consumption authority, runner authority, API/UI authority, trading authority, Avanza authority, persistence authority, deployment authority, staging readiness, execution readiness, and production readiness remain absent.

## Commit And Deploy

No deploy is recommended for Action 555. A source-control checkpoint commit may be considered only after the complete diff has been manually inspected.

## Decision

Decision: `post_trade_scoped_process_observer_boundary_plan_ready`

Result status: `post_trade_scoped_process_observer_action_555_planning_gate_completed`
