# Action 648: Deterministic Runtime Execution Identity

## Purpose

Action 647 exposed that the live execution orchestrator could silently use the
current clock or a random lifecycle suffix when callers omitted identity data.
That made a runtime trace harder to reproduce even though candidate selection
and authority decisions were already deterministic.

## Contract

`ExecutionRuntimeIdentityContext` is the narrow identity boundary for an
execution-critical operation. It supplies the canonical timestamp, execution
identity, lifecycle identity, execution-record identity, lifecycle-event IDs,
audit-event IDs, and broker-progress IDs.

`createExplicitExecutionRuntimeIdentityContext` is pure and is used by replay
and tests. `createExecutionRuntimeIdentityContextAtBoundary` is the only UI or
route boundary allowed to use the real clock and secure UUID generation. Core
helpers receive the resulting values explicitly.

## Fail-Closed Behavior

Lifecycle construction rejects missing lifecycle ID or timestamp. Handoff and
broker-result capture block when the required timestamp or record identity is
missing. No core execution helper reads a clock or creates random identity data.

## Unchanged Rules

Candidate priority, stop-loss precedence, target handling, authority semantics,
semi-automatic submission prohibition, broker-result validation, and duplicate
handling are unchanged. Changing an identity context can change trace IDs and
timestamps only; it cannot change the selected action or safety decision.

## Runtime Fallback Inventory

The execution-critical fallback sites addressed here were the orchestrator
timestamp fallback, lifecycle timestamp and random lifecycle-ID fallback,
Avanza handoff timestamp fallback, and broker-capture timestamp/record-ID
fallback. They are now either explicit inputs or fail closed.

The boundary factory intentionally retains real time and secure UUID generation
because it is the single boundary where an interactive runtime operation begins.
Execution preview timestamps in the client preview modal are UI/local-dev
boundary values. Mock broker panels, mock order helpers, and local bridge
telemetry retain their own non-production timestamps and IDs. Read-only Avanza
instrument/bridge checks retain elapsed-time telemetry. None are used by the
orchestrator, lifecycle, handoff, or broker-capture core covered by this action.

## Replay and Future Avanza Integration

Action 647 now uses the same context contract, so a replay with identical input
and identity context has identical lifecycle, audit, record, and fingerprint
output. A future Avanza runtime adapter must construct one boundary context per
operation and pass it through its execution, broker-progress, audit, and record
calls. It must not recreate identity data mid-operation.
