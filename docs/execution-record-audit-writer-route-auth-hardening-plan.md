# Execution Record Audit Writer Route Auth Hardening Plan

## 1. Purpose

Action 831 creates a documentation-only auth hardening plan for the execution-record audit writer route before any runtime invocation path, UI/browser invocation, live smoke insert, or production write path is considered.

This action is not route implementation, not a route behavior change, not UI wiring, not production write-path approval, and not live smoke insert approval.

## 2. Current Route Gate Inventory

The current route boundary is `app/api/execution/audit/writer/route.ts`.

Current gates and boundaries:

- execution dev-tools enablement through `isExecutionDevToolsEnabled()`;
- trade auth cookie validation through the existing `trade_auth` cookie and `TRADE_APP_PASSWORD`-derived token;
- JSON parse handling before request-shape validation;
- route contract metadata validation for route contract version, route path, and method;
- writer contract metadata validation for the expected audit writer contract version;
- request input shape validation before writer invocation;
- server-only writer call through `appendExecutionRecordAuditEvent(input)` only after gates pass;
- typed response envelope with route contract version, writer contract version, route path, method, status, validation errors, writer result, timestamps, and safety flags.

The route does not directly import the live service-role adapter and does not directly call Supabase table methods.

## 3. Desired Auth Hardening Model

The desired model is fail-closed and server-side only.

Auth cookie/session semantics:

- require an authenticated server-side session or signed auth cookie before writer invocation;
- compare tokens using the existing trade auth boundary or a later approved hardened equivalent;
- treat missing auth env/config, missing cookie, malformed cookie, expired session, and mismatched token as authentication failures;
- never echo auth token values, service-role values, or cookie contents into route responses or logs.

Dev-tools gate behavior:

- keep the route disabled unless the explicit execution dev-tools gate is enabled;
- require the dev/prod decision before auth parsing or writer invocation;
- in production, keep runtime invocation blocked until a separate production write-path approval exists.

Allowed caller model:

- current allowed caller remains the controlled server-only invocation harness in dev/manual/test context with fixture/test payloads and a mocked route handler;
- normal app runtime callers remain blocked;
- UI/browser callers remain blocked;
- scheduled, market-loop, broker, Avanza, and automatic callers remain blocked.

Request identity and audit metadata:

- future hardened requests should carry non-secret request identity metadata, such as caller category, request id, fixture/test provenance, and operator/reviewer context when approved;
- identity metadata must be additive evidence only and must not authorize downstream mutation.

Idempotency/request key expectations:

- future route expansion should require an idempotency/request key before any live invocation expansion;
- duplicate keys should resolve to typed idempotency/conflict behavior without downstream mutation;
- missing or malformed idempotency/request key should fail before writer invocation once that requirement is implemented.

Fail-closed behavior:

- unknown auth state, unknown environment mode, malformed metadata, missing contracts, and unexpected errors should block writer invocation or return typed failure without granting write-path authority.

## 4. Gate Order

Expected hardened gate order:

1. Method/path check.
2. Dev/prod gate.
3. Auth cookie/session gate.
4. Content-type and JSON parse gate.
5. Request shape validation.
6. Route contract metadata validation.
7. Writer contract metadata validation.
8. Writer invocation.
9. Typed response envelope.

Writer invocation must remain after dev/prod, auth, JSON, shape, and contract gates.

## 5. Failure Behavior

- Missing dev-tools gate: return blocked response; writer is not called.
- Missing or invalid auth: return auth-blocked response; writer is not called.
- Invalid method: return validation failure; writer is not called.
- Invalid content-type or malformed JSON: return validation failure; writer is not called.
- Invalid request shape: return validation failure; writer is not called.
- Invalid route contract metadata: return validation failure; writer is not called.
- Invalid writer contract metadata: return validation failure; writer is not called.
- Writer validation failure: return typed writer validation failure; no downstream mutation authority is granted.
- Writer adapter failure: return mapped typed failure, such as conflict, permission/security failure, service unavailable, or unknown error.
- Unknown route error: return fail-closed typed unknown error where possible and do not add downstream authority.

Failure responses must not include secret values, raw auth token values, service-role values, or unsafe payload echoes.

## 6. Required Tests Before Route Invocation Expansion

Before any route invocation expansion, add or confirm tests for:

- missing auth blocks writer invocation;
- invalid auth blocks writer invocation;
- missing dev gate blocks writer invocation;
- malformed JSON blocks writer invocation;
- invalid content-type blocks writer invocation once content-type hardening is implemented;
- invalid route metadata blocks writer invocation;
- invalid writer metadata blocks writer invocation;
- invalid payload blocks writer invocation;
- valid fixture request reaches writer only through the approved controlled harness;
- no UI/runtime caller exists;
- no production approval flag exists;
- no live smoke insert is executed;
- no service-role value is printed or exposed;
- no broker, Avanza, automatic-mode, trade, stats, or PnL mutation authority is introduced.

## 7. Route Invocation Policy

- Controlled harness invocation is allowed only in dev/manual/test context.
- The controlled harness must remain explicit-trigger only.
- The controlled harness must use fixture/test payloads only.
- The controlled harness must use mocked route handlers only unless a later action explicitly approves a different scope.
- Normal app runtime route calls remain blocked.
- UI/browser calls remain blocked.
- Production write path remains blocked.
- Live smoke insert remains separately approval-gated.

## 8. Remaining Blockers

- Auth hardening implementation if needed.
- Route auth hardening tests.
- Route invocation approval for any scope beyond the current controlled harness.
- UI/browser invocation approval if ever needed.
- Production write-path approval.
- Live smoke insert approval if ever needed.
- End-to-end app integration proof.
- Route/auth hardening proof.
- Downstream no-authority proof for any expanded caller path.

## 9. Result Status

Status: `audit_writer_route_auth_hardening_plan_created_write_path_blocked`.

The auth hardening plan exists, but route behavior is unchanged and all runtime/UI/production/live-smoke write paths remain blocked.

## 10. Recommended Next Action

Action 832 - Add Audit Writer Route Auth Hardening Tests.

## 11. Safety Boundaries

This auth hardening plan is not:

- route behavior change;
- route implementation change;
- UI wiring;
- browser/client invocation approval;
- normal app runtime route-call approval;
- production write-path approval;
- live smoke insert approval;
- service-role exposure approval;
- migration approval;
- type generation approval;
- generated type edit approval;
- audit append approval from runtime app code;
- broker/Avanza behavior approval;
- automatic-mode approval;
- trade/stats/PnL mutation approval.

Downstream behavior remains unauthorized. Broker, Avanza, and automatic behavior remain unauthorized.

## 12. Verification

Required validation for Action 831:

- runtime denial harness import check;
- runtime writer/adapter/mock/fixture/harness import search;
- route invocation search;
- UI import/search for route invocation;
- `NEXT_PUBLIC_*SERVICE*` exposure search;
- service-role leakage search;
- broad env/client/write scan;
- `git diff --check`;
- `find docs -type f -size 0`;
- `./node_modules/.bin/tsc --noEmit`;
- `npm run lint`.

## Action 832 - Route Auth Hardening Tests Follow-Up

- Created `tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts`.
- Created `docs/execution-record-audit-writer-route-auth-hardening-tests.md`.
- Tests verify missing dev-tools, missing/invalid auth, missing auth env, malformed JSON, invalid request shape, invalid route metadata, invalid writer metadata, invalid method metadata, writer failure mapping, typed response envelopes, and source/import boundaries.
- Status: `audit_writer_route_auth_hardening_tests_added_write_path_blocked`.
- No route behavior change, UI wiring, browser/client invocation path, normal app runtime route call, live smoke insert, production write path, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, migration, type generation, generated type edit, `.env.local` change, or service-role value printing was added.
- Recommended next action: Action 833 - Create Audit Writer Production Write Path Approval Request.

## Action 833 - Production Write Path Approval Request Follow-Up

- Created `docs/execution-record-audit-writer-production-write-path-approval-request.md`.
- The request is planning-approval documentation only and does not grant production write-path approval.
- Status: `audit_writer_production_write_path_approval_requested_blocked`.
- No route behavior change, UI wiring, browser/client invocation path, normal app runtime route call, live smoke insert, production write path, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, migration, type generation, generated type edit, `.env.local` change, or service-role value printing was added.
- Recommended next action: Action 834 - Provide Production Write Path Planning Approval.

## Action 834 - Production Write Path Planning Follow-Up

- Planning approval was provided by Willy Simonsson for documentation-only planning.
- Created `docs/execution-record-audit-writer-production-write-path-planning.md`.
- Status: `audit_writer_production_write_path_planning_document_created_implementation_blocked`.
- The route auth gates remain unchanged and must be preserved by any future implementation.
- No route behavior change, UI wiring, browser/client invocation path, normal app runtime route call, live smoke insert, production write-path implementation, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, update/delete/upsert/select, migration, type generation, generated type edit, `.env.local` change, or service-role value printing was added.
- Recommended next action: Action 835 - Create Audit Writer Production Write Path Implementation Approval Request.

## Action 835 - Production Write Path Implementation Approval Request Follow-Up

- Created `docs/execution-record-audit-writer-production-write-path-implementation-approval-request.md`.
- The request requires future implementation to preserve route/writer gates, validation, typed results, insert-only behavior, and no downstream mutation.
- Approval is absent, so implementation remains blocked.
- Status: `audit_writer_production_write_path_implementation_approval_requested_blocked`.
- No route behavior change, UI wiring, browser/client invocation path, normal app runtime route call, live smoke insert, production write-path behavior, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, update/delete/upsert/select, migration, type generation, generated type edit, `.env.local` change, or service-role value printing was added.
- Recommended next action: Action 836 - Provide Production Write Path Implementation Approval.
