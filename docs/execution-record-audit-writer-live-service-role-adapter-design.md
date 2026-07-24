# Execution Record Audit Writer Live Service-Role Adapter Design

## 1. Purpose

Action 812 documents the future live service-role adapter design for the execution-record audit writer.

This design describes how and when a future server-only adapter may create a typed Supabase service-role client for audit table insertion. It is not service-role use, not a live adapter implementation, not a live writer, not write-path approval, not route/auth proof, and not audit append approval.

No runtime behavior is added by this action.

## 2. Current Proof Chain

Current verified prerequisites:

- Remote `public.execution_records` exists.
- Remote `public.execution_record_audit_events` exists.
- Audit migrations are applied and status-verified.
- Audit table schema and RLS are verified.
- Anon denial is verified.
- Authenticated denial is verified.
- Supabase generated types are verified at `lib/supabase-database.types.ts`.
- Server-only/service-role boundary is documented.
- Server-only audit writer contract exists and has passing tests.
- Audit writer validation helper exists and has passing tests.
- Audit writer dry-run builder exists and has passing tests.
- Dry-run preview adapter exists and has passing tests.
- Fixture-only dev preview adapter exists and has passing tests.
- UI boundary has selected a safe fixture path.
- Writer skeleton exists and remains write-blocked.
- Service-role env presence is documented without printing values.
- Service-role adapter skeleton exists and remains blocked.
- Service-role adapter readiness tests exist and pass.
- Service-role adapter dry-run contract exists and passes tests.
- Service-role adapter dry-run implementation exists and passes tests.
- Service-role adapter dry-run fixtures exist and pass tests.

Current blocker:

- No live audit writer implementation exists.
- No live service-role adapter implementation exists.
- No route/auth proof exists for a production route.
- No production write-path approval exists.

## 3. Live Adapter Boundary

Future module:

- `lib/server/execution-record-audit-writer-service-role-adapter.ts`

Future function names may include:

- `createExecutionRecordAuditServiceRoleClientAdapter(...)`
- `insertExecutionRecordAuditEventWithServiceRole(...)`

The live adapter may create a Supabase client only inside a server-only module that starts with `import "server-only";`.

The adapter should use the generated `Database` type from `@/lib/supabase-database.types` so the client and insert payload remain typed against `public.execution_record_audit_events`.

The adapter may use `lib/supabase-server.ts` only after a future implementation action proves:

- the import is server-only;
- service-role values are not printed;
- client creation is isolated to the adapter module;
- no client module, UI module, browser code, hook, or component imports the adapter;
- the writer remains blocked until explicitly integrated.

No client/UI import of the live adapter is allowed.

## 4. Env Handling

Accepted service-role aliases remain:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE`
- `SUPABASE_SERVICE_ROLE_SECRET`

Future live adapter behavior must:

- fail closed if no accepted alias is available;
- fail closed if more than one accepted alias is available;
- fail closed if a public-prefixed service-role exposure is detected;
- never print service-role values;
- never return service-role values in errors, diagnostics, logs, payloads, or proof artifacts;
- never commit service-role values;
- never fall back to the anon key for service-role behavior;
- never expose service-role config to client/runtime UI code.

The adapter must distinguish alias names from values. Alias names may appear in diagnostics; secret values must not.

## 5. Query/Write Constraints

The future adapter may create a client only in a separately approved implementation action.

Allowed future live adapter authority, once explicitly approved:

- a minimal insert operation for `public.execution_record_audit_events`;
- typed insert payload only;
- server-only execution only;
- return structured result metadata without secret values.

Not allowed without separate approval:

- `select`;
- `update`;
- `delete`;
- `upsert`;
- remote SQL;
- migration commands;
- type generation;
- execution-record mutation;
- trade mutation;
- stats/PnL update;
- rollback/correction behavior;
- broker/order behavior;
- Avanza/browser behavior;
- automatic mode.

The live adapter must not call routes. It should be a server-only helper used by a separately proven writer or route boundary.

## 6. Error/Result Mapping

Future live adapter results should map expected outcomes without throwing:

- `success`: insert succeeded and returned inserted audit row metadata.
- `validation_failed`: input failed local validation before insert.
- `conflict_idempotent_duplicate`: duplicate/idempotent conflict detected by database or preflight logic.
- `service_role_missing`: accepted service-role alias was unavailable.
- `permission_security_failure`: RLS/security or permission failure.
- `supabase_insert_error`: Supabase insert failed for a non-idempotency reason.
- `unknown_error`: unexpected failure without secret leakage.

Expected failures should return structured results. Throwing should be reserved for programmer errors that cannot be represented safely, and even then must not include secret values.

## 7. Required Tests Before Live Adapter Implementation

Required tests before any live adapter implementation:

- client creation is isolated to a server-only module;
- adapter starts with `import "server-only";`;
- no service-role value is exposed in source, logs, results, docs, or proof artifacts;
- no client/runtime UI imports the adapter;
- no route calls are made by the adapter;
- insert targets only `public.execution_record_audit_events`;
- no `select`, `update`, `delete`, or `upsert` calls exist;
- fixture/mock Supabase client tests pass before any real remote call;
- idempotency duplicate behavior is tested;
- permission/security failure mapping is tested;
- no downstream mutation tests pass;
- no broker/Avanza/automatic references exist;
- writer skeleton remains blocked until explicit writer integration.

A live write smoke test must be separately approved later if ever used. This design does not approve a live write smoke test.

## 8. Live Implementation Gating

Required phases:

1. Design: this document.
2. Adapter mock implementation: no remote calls, mock client only.
3. Writer mock/dry-run integration: writer remains blocked for live writes.
4. Fixture/mock insert tests: local deterministic tests only.
5. Separately approved live insert test: only after explicit operator approval.
6. Route/auth proof: production route boundary remains separate.
7. Production write-path proof: explicit production write authorization remains separate.

Skipping phases is not allowed.

## 9. Recommended Next Action

Action 813 - Create Audit Writer Service-Role Adapter Mock Implementation.

## 10. Result Status

Status: `audit_writer_live_service_role_adapter_design_documented_writer_blocked`.

The live writer remains blocked. Service-role client creation remains blocked. Runtime audit append remains unauthorized.

## 11. Safety Boundaries

- This design is not a live adapter.
- This design is not service-role use.
- This design is not writer implementation.
- This design is not write-path approval.
- This design is not audit append approval.
- This design is not route/auth proof.
- This design is not permission to run migrations.
- This design is not permission to run type generation.
- This design is not permission to run remote SQL.
- Downstream behavior remains unauthorized.
- Broker/Avanza/automatic behavior remains unauthorized.

## Action 813 - Service-Role Adapter Mock Implementation Follow-Up

- Created `lib/server/execution-record-audit-writer-service-role-adapter-mock.ts`.
- Created `tests/e2e/execution-record-audit-writer-service-role-adapter-mock.spec.ts`.
- Created `docs/execution-record-audit-writer-service-role-adapter-mock-implementation.md`.
- The mock adapter models success, duplicate/idempotency conflict, permission/security failure, service-unavailable, and unknown-error outcomes with an injected mock callable only.
- Every mock result preserves `realSupabaseCalled: false`, `serviceRoleUsed: false`, `writePerformed: false`, and `remoteMutated: false`.
- The mock adapter does not create a real Supabase client, call Supabase, read env values, print service-role values, call routes, or mutate remote data.
- The writer skeleton remains write-blocked and disconnected from the mock adapter.
- No live Supabase client, Supabase call, service-role use, live writer, route, route call, runtime write path, audit append, migration, type generation, generated type edit, broker/Avanza behavior, or automatic mode was added.
- Status: `audit_writer_service_role_adapter_mock_created_writer_blocked`.
- Recommended next action: Action 814 - Add Audit Writer Service-Role Adapter Mock Mapping Tests.

## Action 814 - Service-Role Adapter Mock Mapping Tests Follow-Up

- Added deeper mock mapping tests before any live adapter implementation.
- Mapping tests prove injected success, duplicate/idempotency, permission/security, service-unavailable, and unknown-error outcomes preserve the adapter safety fields.
- Suspicious insert payload handling and input immutability are covered without live Supabase calls.
- The live adapter design remains design-only and the writer skeleton remains write-blocked.
- No live Supabase client, Supabase call, service-role use, live writer, route, route call, runtime write path, audit append, migration, type generation, generated type edit, broker/Avanza behavior, or automatic mode was added.
- Status: `audit_writer_service_role_adapter_mock_mapping_tests_added_writer_blocked`.
- Recommended next action: Action 815 - Create Audit Writer Mock Integration Harness.

## Action 815 - Audit Writer Mock Integration Harness Follow-Up

- Added a server-only mock integration harness before live adapter implementation.
- The harness validates/builds dry-run output and invokes mock adapter behavior only behind `allowMockAdapter: true`.
- The harness is still mock-only and does not authorize the live service-role adapter, live writer, routes, or write path.
- No live Supabase client, Supabase call, service-role use, live writer, route, route call, runtime write path, audit append, migration, type generation, generated type edit, broker/Avanza behavior, or automatic mode was added.

## Action 817 - Live Implementation Readiness Gate Follow-Up

- Added `docs/execution-record-audit-writer-live-implementation-readiness-gate.md`.
- The gate aggregates the live adapter design, service-role adapter dry-run, mock adapter, mock mapping, mock integration harness, and preview fixture proof chain.
- The gate decision is `live_audit_writer_implementation_requires_approval`.
- The live adapter remains unimplemented; service-role client creation and live insert behavior still require a separate approved action.
- Recommended next action: Action 818 - Create Live Audit Writer Adapter Implementation Plan.

## Action 818 - Live Adapter Implementation Plan Follow-Up

- Added `docs/execution-record-audit-writer-live-adapter-implementation-plan.md`.
- The plan narrows a future implementation to the server-only adapter boundary, insert-only behavior for `public.execution_record_audit_events`, approval requirements, and required tests.
- The live adapter remains unimplemented; service-role client creation and live insert behavior still require explicit approval.
- Status: `audit_writer_live_adapter_implementation_plan_created_requires_approval`.
- Recommended next action: Action 819 - Request Live Audit Writer Adapter Implementation Approval.

## Action 819 - Live Adapter Implementation Approval Request Follow-Up

- Added `docs/execution-record-audit-writer-live-adapter-implementation-approval-request.md`.
- The approval request asks for explicit approval before implementing the server-only insert-only adapter.
- Approval is currently absent, so the live adapter remains unimplemented and service-role client creation remains blocked.
- Status: `live_audit_writer_adapter_implementation_approval_requested_blocked`.
- Recommended next action: Action 820 - Provide Live Audit Writer Adapter Implementation Approval.

## Action 820 - Live Adapter Implementation Follow-Up

- Implemented the live adapter in `lib/server/execution-record-audit-writer-service-role-adapter.ts`.
- Added `docs/execution-record-audit-writer-live-service-role-adapter-implementation.md`.
- The adapter uses the existing server-only helper boundary and performs insert-only behavior for `public.execution_record_audit_events`.
- The adapter does not add route/write-path wiring and the writer skeleton remains blocked.
- Status: `live_audit_writer_service_role_adapter_implemented_writer_still_blocked`.
- Recommended next action: Action 821 - Add Live Audit Writer Adapter Boundary Regression Tests.
- Status: `audit_writer_mock_integration_harness_created_live_writer_blocked`.
- Recommended next action: Action 816 - Add Audit Writer Mock Integration Preview Fixtures.

## Action 816 - Mock Integration Preview Fixtures Follow-Up

- Added server-only preview fixtures for mock integration outcomes before live adapter implementation.
- Fixtures are static, deterministic, mock-only, no-client, no-env-read, no-route, no-query, and no-write.
- The live adapter design remains design-only and the writer skeleton remains write-blocked.
- No live Supabase client, Supabase call, service-role use, live writer, route, route call, runtime write path, audit append, migration, type generation, generated type edit, broker/Avanza behavior, or automatic mode was added.
- Status: `audit_writer_mock_integration_preview_fixtures_added_live_writer_blocked`.
- Recommended next action: Action 817 - Create Audit Writer Live Implementation Readiness Gate.

## Action 821 - Boundary Regression Tests Follow-Up

- Added boundary regression tests for the live adapter design constraints after the Action 820 implementation.
- Tests verify server-only import placement, approved helper imports, audit-table insert-only targeting, no update/delete/upsert/select behavior, no route/UI/runtime imports, writer skeleton disconnection, no service-role exposure, and no downstream execution authority.
- Error mapping coverage remains mock-injected and does not call remote Supabase.
- Status: `live_audit_writer_adapter_boundary_regression_tests_added_writer_still_blocked`.
- Recommended next action: Action 822 - Create Audit Writer Integration Approval Request.

## Action 822 - Integration Approval Request Follow-Up

- Created `docs/execution-record-audit-writer-integration-approval-request.md`.
- The request asks for explicit approval before a future action may connect the live adapter to the server-only writer skeleton.
- Approval is absent, so writer integration remains blocked and the design does not authorize route/write-path behavior.
- Status: `audit_writer_integration_approval_requested_blocked`.
- Recommended next action: Action 823 - Provide Audit Writer Integration Approval.
