# Execution Record Audit Writer Server-Only Lifecycle Transition Call Site Design

## 1. Purpose

This document designs a future real server-only lifecycle transition call site
that can later invoke the existing
`transitionExecutionLifecycleAndAppendAuditEvent(...)` boundary.

This is documentation-only. It does not implement a new boundary, does not wire
the lifecycle caller, and does not change runtime behavior.

## 2. Current Blocker

Action 857 confirmed the rollout cannot proceed safely yet:

- no eligible existing real server-only lifecycle transition call site exists;
- the only server-only lifecycle transition call is the lifecycle caller boundary
  itself;
- `lib/execution-orchestrator.ts` holds real transition behavior;
- `lib/execution-orchestrator.ts` is imported by `app/trade-app.tsx`;
- direct wiring into `lib/execution-orchestrator.ts` would therefore risk
  importing server-only audit writer code into an app/UI/browser path.

Status carried forward:
`audit_writer_lifecycle_caller_rollout_blocked_no_eligible_server_only_call_site`.

## 3. Design Goals

- Move or wrap lifecycle transition execution behind a true server-only boundary.
- Keep UI, app-shell, and browser paths from importing server-only modules.
- Allow future audit caller invocation only from that server-only boundary.
- Preserve current behavior until separately approved and implemented.
- Preserve the semi-auto model.
- Preserve no broker/Avanza behavior.
- Preserve no automatic mode.
- Preserve no trade/stats/PnL mutation from audit writer paths.
- Preserve insert-only audit append behavior through the approved writer
  boundary.

## 4. Candidate Architecture Options

### Option A - New Server-Only Lifecycle Transition Service

Create a future `lib/server/execution-lifecycle-transition-service.ts` module.
The module would start with `import "server-only";`, own lifecycle transition
execution for approved server-side callers, and be the only place allowed to
call `transitionExecutionLifecycleAndAppendAuditEvent(...)`.

The existing UI-facing orchestrator would remain client-safe and would not
import this service.

Pros:

- Strongest direct server-only boundary.
- Avoids adding route/fetch behavior in the first implementation step.
- Keeps the audit writer caller out of `app/trade-app.tsx`.
- Gives tests a single import target for server-only enforcement.

Cons:

- Requires a separately approved caller migration into the service.
- Existing UI-driven transition flows cannot call it directly without a future
  approved server boundary.
- Needs careful payload ownership and lifecycle state transfer design.

Risk level: medium-low if implemented as a new isolated server-only module.

Test requirements:

- server-only import assertion;
- no imports from `app/`, `components/`, or `hooks`;
- no import from `app/trade-app.tsx`;
- lifecycle transition behavior tests;
- mock-only audit caller invocation tests;
- no route/fetch tests;
- no downstream mutation tests.

Boundary preservation:

- Preserves the boundary if no UI/app-shell file imports the service.
- Requires static tests proving only server-side modules import it.

### Option B - New API Route Or Server Action Boundary

Create a future API route or server action that validates/authenticates an
approved lifecycle transition request, invokes a server-only lifecycle transition
service, and then allows that service to invoke the audit lifecycle caller.

Pros:

- Provides a clear server boundary if an existing UI action must initiate a
  lifecycle transition.
- Allows explicit auth, CSRF, dev/prod, and payload gates.
- Keeps the audit caller itself server-only.

Cons:

- Introduces route/server-action behavior and request handling.
- Requires separate approval because route invocation was not approved for
  Action 858.
- Has higher auth and abuse-surface risk than an internal server-only service.
- Requires careful proof that the route is not called automatically.

Risk level: medium-high until route/server-action auth gates and call sites are
approved and tested.

Test requirements:

- route/server-action auth gate tests;
- no automatic invocation tests;
- request validation tests;
- no browser-side audit writer import tests;
- server-only service import tests;
- mock-only audit caller invocation tests;
- no live insert tests unless separately approved.

Boundary preservation:

- Preserves the audit writer server-only boundary if the route/server action is
  the only UI-facing edge and never exposes service-role values or server-only
  modules to client bundles.
- Requires separate approval before implementation.

### Option C - Split The Existing Execution Orchestrator

Split `lib/execution-orchestrator.ts` into client-safe planning/orchestration
and a new server-only lifecycle transition module. The client-safe half would
retain UI-compatible planning logic. The server-only half would own transition
execution and future audit caller invocation.

Pros:

- Aligns code ownership with the current real transition holder.
- Can reduce ambiguity about which lifecycle logic is client-safe versus
  server-only.
- Provides a path to migrate existing transition behavior without duplicating
  domain rules.

Cons:

- Highest refactor risk.
- Easy to accidentally create a server-only import cycle through existing UI
  imports.
- Requires careful compatibility testing for current orchestrator behavior.
- More likely to touch runtime behavior than Option A.

Risk level: high until split boundaries and compatibility tests are designed.

Test requirements:

- before/after lifecycle transition parity tests;
- client-safe orchestrator import tests;
- server-only split import tests;
- no UI import of server-only split tests;
- mock-only audit caller invocation tests;
- no downstream mutation tests;
- no market/scanner/broker/automatic import tests.

Boundary preservation:

- Preserves boundaries only if the client-safe module never imports the
  server-only split and static tests enforce that separation.

## 5. Recommended Option

Recommended first step: Option A.

Option A creates the smallest new server-only design target without introducing
route/server-action behavior and without refactoring the existing
UI-imported orchestrator. It gives a future implementation a clean place to own
server-side lifecycle transitions and later call the existing lifecycle caller.

If an existing UI action must initiate lifecycle transition execution, Option B
requires a separate route/server-action approval before implementation. Option C
should be reserved for a later refactor because it has the largest blast radius.

## 6. Boundary Requirements

- The future server module must start with `import "server-only";`.
- The future server module must not be imported by `app/trade-app.tsx`.
- The future server module must not be imported by `app/`, `components/`,
  `hooks`, or browser/client modules.
- UI/app-shell/browser code must not import server-only audit writer modules.
- UI/app-shell/browser code must not call Supabase directly for audit writer
  persistence.
- No market-loop, scanner, or automation invocation is allowed.
- No broker/Avanza behavior is allowed.
- No automatic mode is allowed.
- No trade/stats/PnL mutation may be introduced from audit writer paths.
- The audit writer path remains insert-only to
  `public.execution_record_audit_events`.
- No update/delete/upsert/select may be added in the audit writer path.
- Service-role values must never be printed or exposed.
- `.env.local` must remain unchanged.

## 7. Future Implementation Plan

- Action 859 - Create Server-Only Lifecycle Transition Boundary Approval Request.
- Action 860 - Implement Server-Only Lifecycle Transition Boundary.
- Action 861 - Add Boundary Regression Coverage.
- Action 862 - Create Rollout Approval For Boundary-to-Caller Wiring.
- Action 863 - Wire Boundary To Lifecycle Caller.

Each implementation step must preserve the no-live-insert, no-remote-query,
no-migration, no-typegen, and no-generated-type-edit boundaries unless a later
action explicitly approves otherwise.

## 8. Test Strategy

Future implementation should include:

- import-boundary tests proving the module is server-only;
- UI/app-shell absence tests for `app/`, `components/`, and `hooks`;
- lifecycle transition behavior tests;
- no downstream mutation tests;
- audit caller invocation tests with mock writer behavior only;
- no live insert tests;
- no route/fetch tests unless separately approved;
- no market/scanner import tests;
- no broker/Avanza/automatic behavior scans;
- service-role exposure scans;
- deterministic idempotency tests if the audit caller is later wired.

## 9. Rollback And Backout Strategy

- Revert the future server-only boundary integration if implementation causes
  unexpected behavior.
- Disable the lifecycle caller approval gate if future wiring must be stopped.
- Keep persistence table and migrations intact.
- Do not clean smoke-test data without separate approval.
- Preserve proof documents and checkpoint/QA notes for auditability.

## 10. Result Status

`server_only_lifecycle_transition_call_site_design_created`.

## 11. Recommended Next Action

Action 859 - Create Server-Only Lifecycle Transition Boundary Approval Request.

## 12. Action 859 Approval Request Follow-Up

- Created
  `docs/execution-record-audit-writer-server-only-lifecycle-transition-boundary-approval-request.md`.
- The request asks for explicit approval before implementing a new server-only
  lifecycle transition boundary/service.
- Default decision: approval absent and implementation blocked.
- Status:
  `server_only_lifecycle_transition_boundary_approval_requested_blocked`.
- Recommended next action: Action 860 - Provide Server-Only Lifecycle Transition
  Boundary Approval.
- No runtime code, server-only boundary implementation, lifecycle caller wiring,
  live insert, select/query, remote SQL, data mutation, UI/browser/client
  invocation, app-shell import, market-loop/scanner/automation invocation,
  broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, migration,
  type generation, generated type edit, `.env.local` change, or service-role
  value printing was performed.

## 13. Action 860 Boundary Implementation Follow-Up

- Implemented
  `lib/server/execution-lifecycle-transition-service.ts`.
- Added
  `tests/e2e/execution-lifecycle-transition-service.spec.ts`.
- Created implementation proof:
  `docs/execution-record-audit-writer-server-only-lifecycle-transition-boundary-implementation.md`.
- The implementation wraps `transitionExecutionLifecycle(...)` from
  `lib/execution-state-machine.ts` and does not move or duplicate
  `lib/execution-orchestrator.ts` logic.
- The boundary does not import or call
  `transitionExecutionLifecycleAndAppendAuditEvent(...)`.
- Result status:
  `server_only_lifecycle_transition_boundary_implemented_audit_caller_wiring_blocked`.
- Recommended next action: Action 861 - Add Server-Only Lifecycle Transition
  Boundary Regression Coverage.

## 14. Action 861 Regression Coverage Follow-Up

- Updated boundary regression coverage for the server-only lifecycle transition
  service.
- Created
  `docs/execution-record-audit-writer-server-only-lifecycle-transition-boundary-regression-tests.md`.
- The design remains blocked before boundary-to-audit-caller wiring.
- Status:
  `server_only_lifecycle_transition_boundary_regression_tests_added`.
- Recommended next action: Action 862 - Create Boundary-To-Audit-Caller Wiring
  Approval Request.

## 15. Action 862 Boundary-To-Audit-Caller Approval Request Follow-Up

- Created
  `docs/execution-record-audit-writer-boundary-to-audit-caller-wiring-approval-request.md`.
- The design remains blocked before any boundary-to-audit-caller wiring.
- Status:
  `boundary_to_audit_caller_wiring_approval_requested_blocked`.
- No implementation, audit caller wiring, live insert, Supabase query, remote
  SQL, data mutation, UI/browser/client invocation, market-loop/scanner
  invocation, broker/Avanza behavior, automatic mode, migration, type
  generation, generated type edit, or `.env.local` change was performed.
- Recommended next action: Action 863 - Provide Boundary-To-Audit-Caller Wiring
  Approval.

## 16. Action 863 Boundary-To-Audit-Caller Wiring Follow-Up

- The server-only lifecycle transition boundary is now wired to the existing
  audit writer lifecycle caller.
- Real runtime call-site rollout remains limited to this server-only boundary
  wiring and does not add UI/browser/market/scanner invocation.
- Status:
  `boundary_to_audit_caller_wiring_implemented_server_only_rollout_limited`.
- Recommended next action: Action 864 - Add Boundary-To-Audit-Caller Wiring
  Regression Coverage.
