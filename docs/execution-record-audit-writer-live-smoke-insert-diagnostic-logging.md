# Execution Record Audit Writer Live Smoke Insert Diagnostic Logging

Action: 844
Date: 2026-06-26
Status: `audit_writer_live_smoke_insert_diagnostics_added_retry_blocked`

## 1. Purpose

Action 844 adds non-mutating diagnostic coverage for the failed audit writer live smoke insert from Action 842. The goal is to make any future separately approved retry capture the precise failure category, sanitized Supabase error details, and normalized insert summary without exposing secrets or running another live insert in this action.

## 2. Scope

Implemented:

- live writer insert shaping now maps the dry-run-only `event_status: "dry_run_ready"` to the migration-allowed live value `event_status: "attempted"` before calling the service-role adapter;
- dry-run metadata still records the original would-insert payload with `event_status: "dry_run_ready"`;
- service-role adapter error results now preserve sanitized diagnostics for code, status, message, details, hint, and constraint name;
- Postgres check/FK/not-null constraint failures are classified as `schema_constraint` diagnostics and return `schema_or_constraint_mismatch`;
- writer and production write-path results preserve adapter diagnostics when present;
- regression coverage proves migration event-status compatibility and redaction of secret-looking diagnostic strings.

Not performed:

- no live smoke insert retry;
- no Supabase query or remote SQL;
- no migrations;
- no type generation;
- no generated type edits;
- no `.env.local` changes;
- no service-role value printing;
- no UI/browser/client invocation;
- no market-loop/scanner/automation invocation;
- no broker/Avanza behavior;
- no automatic mode;
- no trade/stats/PnL mutation;
- no update/delete/upsert/select.

## 3. Diagnostic Fields

Future adapter failures can now surface:

- diagnostic category: `duplicate`, `permission_security`, `service_unavailable`, `schema_constraint`, `unknown`, or `unexpected_exception`;
- Supabase/Postgres error code when provided;
- HTTP/status value when provided;
- sanitized message/details/hint text;
- extracted constraint name when recognizable;
- safe insert summary: event status, event type, execution record id, source system, idempotency-key presence, and duplicate-prevention-key presence.

The diagnostic summary intentionally does not include service-role values, complete payload JSON, browser state, route request bodies, or broad database rows.

## 4. Event Status Compatibility

The audit table migration allows:

- `attempted`;
- `succeeded`;
- `failed`;
- `blocked`;
- `duplicate`;
- `unknown`.

The dry-run builder remains preview-only and still emits `dry_run_ready` for would-insert inspection. The live writer boundary now translates that status to `attempted` before the insert-only service-role adapter is called. This preserves the dry-run proof while preventing the known local constraint mismatch from being retried.

## 5. Tests

Added:

- `tests/e2e/execution-record-audit-writer-live-smoke-insert-diagnostics.spec.ts`

Updated:

- `tests/e2e/execution-record-audit-writer-skeleton.spec.ts`
- `tests/e2e/execution-record-audit-writer-integration-boundary-regression.spec.ts`

Focused validation run:

- `npx playwright test tests/e2e/execution-record-audit-writer-live-smoke-insert-diagnostics.spec.ts tests/e2e/execution-record-audit-writer-skeleton.spec.ts tests/e2e/execution-record-audit-writer-integration-boundary-regression.spec.ts tests/e2e/execution-record-audit-writer-production-write-path.spec.ts tests/e2e/execution-record-audit-writer-service-role-adapter.spec.ts`

Result: 31 passed.

## 6. Safety Boundaries

Action 844 is diagnostic and mapping work only. It is not live smoke retry approval, production rollout approval, UI/browser invocation approval, broker/Avanza approval, automatic-mode approval, trade/stats/PnL mutation approval, migration approval, type-generation approval, or generated-type edit approval.

The next live smoke attempt remains blocked until separately approved.

## 7. Result Status

Status: `audit_writer_live_smoke_insert_diagnostics_added_retry_blocked`.

## 8. Recommended Next Action

Action 845 - Request Live Smoke Insert Retry Approval.

## 9. Action 845 Retry Approval Request Follow-Up

Action 845 created `docs/execution-record-audit-writer-live-smoke-insert-retry-approval-request.md`.

The request is documentation-only and asks for explicit approval before any retry is run. Approval is absent, so the retry remains blocked.

Status: `audit_writer_live_smoke_insert_retry_approval_requested_blocked`.

No live smoke retry, insert/update/delete/upsert, Supabase query, remote SQL, data mutation, UI/browser/client invocation, market-loop/scanner/automation invocation, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, migration, type generation, generated type edit, `.env.local` change, or service-role value printing was performed.

Recommended next action: Action 846 - Provide Live Smoke Insert Retry Approval.
## Action 847 - Success Regression Proof Follow-Up

- The diagnostic logging added in Action 844 remains covered after the successful Action 846 retry.
- Added success regression coverage in `tests/e2e/execution-record-audit-writer-live-smoke-success-regression.spec.ts`.
- The regression proves successful inserts map to `diagnostics: null`, while non-success paths still retain sanitized diagnostics.
- The live insert status remains migration-compatible as `attempted`; dry-run metadata may continue to preserve `dry_run_ready`.
- Status: `audit_writer_live_smoke_insert_success_regression_proof_added`.
- No live insert, select/query/remote SQL, migration, type generation, generated type edit, `.env.local` change, service-role value printing, or downstream runtime mutation was performed.

## Action 848 - Persistence Readiness Summary Follow-Up

- Created `docs/execution-record-audit-writer-persistence-readiness-summary.md`.
- The readiness summary records that live smoke diagnostics are in place and remain available for future non-success writer/adapter results.
- Status: `audit_writer_persistence_readiness_summary_created`.
- No live insert, select/query/remote SQL, migration, type generation, generated type edit, `.env.local` change, service-role value printing, UI/browser invocation, market-loop/scanner invocation, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, or production rollout was performed.
