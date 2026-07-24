# Execution Record Audit Writer Live Adapter Implementation Plan

## 1. Purpose

Action 818 documents the plan for a future live execution-record audit writer service-role adapter implementation.

This is not implementation. It is not write-path approval, not audit append approval, not route/auth proof, not production runtime authorization, and not approval to create a live Supabase client.

No runtime behavior is added by this action.

## 2. Minimal Future Code Scope

A later explicitly approved live adapter implementation may touch only the smallest set of files needed for the live adapter boundary:

- likely `lib/server/execution-record-audit-writer-service-role-adapter.ts`;
- focused tests for live adapter behavior, still preferring mock/fixture coverage before any live call;
- documentation/proof artifacts for the approved implementation action.

The later implementation action must not touch:

- route files;
- UI files;
- browser/client components;
- hooks;
- broker or Avanza modules;
- automatic-mode modules;
- generated type files;
- migration files;
- `.env.local`.

The writer skeleton must remain write-blocked unless a separate explicit writer integration approval is recorded. A live adapter implementation must not by itself create a route, route call, production write path, browser/client call path, or audit append trigger.

## 3. Future Live Adapter Behavior

The future live adapter may, only after explicit approval:

- create a typed server-only Supabase service-role client through an existing safe server helper or an isolated server-only factory;
- use generated `Database` types from `lib/supabase-database.types.ts`;
- accept only typed `ExecutionRecordAuditEventInsert` payloads;
- insert only into `public.execution_record_audit_events`;
- return a structured mapped result without secret values;
- map success, duplicate/idempotency conflict, permission/security failure, service-unavailable, insert error, and unknown-error outcomes;
- fail closed when service-role env readiness is missing, ambiguous, or unsafe.

The future live adapter must never:

- mutate `public.execution_records` or any trade/stats/PnL table;
- update, delete, upsert, or select unless separately approved;
- run remote SQL;
- run migrations;
- generate types;
- call routes;
- call broker/order APIs;
- call Avanza/browser behavior;
- enable automatic mode;
- print, return, log, or commit service-role values.

## 4. Required Approval Before Implementation

A separate explicit approval is required before any live client creation or insert logic is implemented.

Required approval fields:

- approved target table: `public.execution_record_audit_events`;
- approved operation: insert-only;
- approved env alias or alias policy;
- approving operator;
- approval timestamp;
- target environment;
- rollback/backout posture;
- live test posture;
- confirmation that service-role values must not be printed or committed;
- confirmation that route/write-path integration remains out of scope unless separately approved.

Without that approval, the status remains blocked and no live adapter implementation should be attempted.

## 5. Required Tests For Future Implementation

Required before or during the future implementation action:

- existing mock tests remain passing;
- existing mock integration harness and preview fixture tests remain passing;
- static no-route/no-UI/no-client-exposure checks pass;
- service-role exposure checks pass;
- inserted table is limited to `public.execution_record_audit_events`;
- source contains no update/delete/upsert/select behavior unless separately approved;
- duplicate/idempotency mapping is tested;
- permission/security mapping is tested;
- service-unavailable mapping is tested;
- unknown-error mapping is tested;
- no downstream mutation is tested;
- no broker/Avanza/automatic references are present;
- no runtime client import path is introduced;
- no secrets are logged, returned, serialized, or committed;
- writer skeleton remains blocked unless separately approved.

## 6. Future Live Smoke Test Policy

No live remote insert test is approved by this plan.

If a later action separately approves a live smoke test, it must:

- use one explicit throwaway audit row;
- link to a controlled execution record approved for the test;
- define idempotency behavior before the insert;
- define cleanup/backout posture before the insert;
- avoid production routes;
- avoid UI/browser call paths;
- avoid downstream mutation;
- record proof without secrets.

The live smoke test must not be included in the implementation action by default.

## 7. Route/Write-Path Separation

The live adapter is not a route.

The live adapter is not the production write path.

The live adapter must not introduce:

- browser/client call paths;
- route handlers;
- route calls;
- UI wiring;
- production runtime import;
- audit append trigger wiring;
- execution-record mutation;
- trade/stat/PnL mutation;
- broker/Avanza/automatic behavior.

Route/auth proof remains a separate future action. Writer integration remains a separate future action. Production write-path approval remains a separate future action.

## 8. Remaining Blockers After This Plan

- Explicit implementation approval is still required.
- Live adapter implementation is still absent.
- Live adapter tests for implementation are still absent.
- Writer integration approval is still absent.
- Writer skeleton remains write-blocked.
- Route/auth proof is still absent.
- Route/write path is still absent.
- Production insert route/write path approval is still absent.
- Downstream mutation authorization remains absent.

## 9. Result Status

Status: `audit_writer_live_adapter_implementation_plan_created_requires_approval`.

No live Supabase client was created. No Supabase call was made. No service-role env value was read or printed. No live writer, route, route call, runtime write path, audit append implementation, migration, type generation, generated type edit, broker/Avanza behavior, or automatic mode was added.

## 10. Recommended Next Action

Recommended next action: Action 819 - Request Live Audit Writer Adapter Implementation Approval.

That action should collect the required approval fields before any code implementation begins.

## 11. Safety Boundaries

- This plan is not a live adapter.
- This plan is not writer implementation.
- This plan is not write-path approval.
- This plan is not audit append approval.
- This plan is not route/auth proof.
- This plan is not permission to create a live Supabase client.
- This plan is not permission to perform a live insert.
- This plan is not permission to run migrations.
- This plan is not permission to run type generation.
- Downstream behavior remains unauthorized.
- Broker/Avanza/automatic behavior remains unauthorized.

## 12. Validation

Required validation for this action:

- Runtime denial harness import check.
- Runtime writer/adapter/mock/fixture import search.
- `NEXT_PUBLIC_*SERVICE*` exposure search.
- Service-role leakage search.
- Broad env/client/write scan.
- `git diff --check`.
- `find docs -type f -size 0`.
- `./node_modules/.bin/tsc --noEmit`.
- `npm run lint`.

## Action 819 - Live Adapter Implementation Approval Request Follow-Up

- Added `docs/execution-record-audit-writer-live-adapter-implementation-approval-request.md`.
- The approval request records the exact future implementation scope, required approval fields, and exact approval statement template.
- Approval is currently absent, so implementation remains blocked.
- Status: `live_audit_writer_adapter_implementation_approval_requested_blocked`.
- Recommended next action: Action 820 - Provide Live Audit Writer Adapter Implementation Approval.

## Action 820 - Live Adapter Implementation Follow-Up

- Action 820 approval was provided and the server-only live adapter boundary was implemented.
- Added `docs/execution-record-audit-writer-live-service-role-adapter-implementation.md`.
- Implementation remained within the planned scope: `lib/server/execution-record-audit-writer-service-role-adapter.ts`, insert-only to `public.execution_record_audit_events`, no route, no UI, no production write path, and writer skeleton still blocked.
- Status: `live_audit_writer_service_role_adapter_implemented_writer_still_blocked`.
- Recommended next action: Action 821 - Add Live Audit Writer Adapter Boundary Regression Tests.

## Action 821 - Boundary Regression Tests Follow-Up

- Added live adapter boundary regression tests for the implementation scope defined by this plan.
- Tests prove the live adapter remains server-only, audit-table insert-only, route-free, UI-free, write-path-free, and disconnected from the writer skeleton.
- Error mapping remains covered through injected clients only; no remote Supabase call or live smoke insert was run.
- Status: `live_audit_writer_adapter_boundary_regression_tests_added_writer_still_blocked`.
- Recommended next action: Action 822 - Create Audit Writer Integration Approval Request.

## Action 822 - Integration Approval Request Follow-Up

- Added `docs/execution-record-audit-writer-integration-approval-request.md`.
- The request narrows a future integration action to `lib/server/execution-record-audit-writer.ts` and the existing live adapter function.
- Approval is absent, so integration remains blocked.
- Status: `audit_writer_integration_approval_requested_blocked`.
- Recommended next action: Action 823 - Provide Audit Writer Integration Approval.
