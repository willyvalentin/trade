# Execution Record Audit Writer Live Smoke Insert Failure Resolution

## 1. Purpose

Action 843 documents the failure resolution analysis for the Action 842 live audit writer smoke insert.

This action is not a retry. It is not another live write. It does not insert, update, delete, upsert, mutate trades, update stats/PnL, call UI/browser/client paths, call market-loop/scanner/automation paths, add broker/Avanza behavior, enable automatic mode, run migrations, run type generation, edit generated types, modify `.env.local`, or print service-role values.

## 2. Failure Summary

Action 842 used controlled execution record id `5d682086-4195-40ec-ba80-a0a1b39a6923`.

The live smoke attempt summary:

- one live insert attempt reached `appendExecutionRecordAuditEventFromProductionWritePath(...)`;
- write path status: `completed`;
- writer status: `unknown_error`;
- inserted: `false`;
- audit event id: `null`;
- retry count: `0`;
- proof artifact: `docs/proofs/execution-record-audit-writer-live-smoke-insert-proof.txt`.

The single live smoke insert approval should be treated as spent because one insert attempt reached the live writer boundary. Any retry or second insert requires separate approval.

## 3. Evidence Reviewed

Reviewed:

- `docs/proofs/execution-record-audit-writer-live-smoke-insert-proof.txt`;
- `lib/server/execution-record-audit-writer-production-write-path.ts`;
- `lib/server/execution-record-audit-writer.ts`;
- `lib/server/execution-record-audit-writer-service-role-adapter.ts`;
- `lib/server/execution-record-audit-writer-dry-run.ts`;
- `lib/server/execution-record-audit-writer-validation.ts`;
- `lib/supabase-database.types.ts`;
- `supabase/migrations/20260615000000_create_execution_record_audit_events.sql`;
- audit writer dry-run, production write-path, service-role adapter, and boundary regression tests.

## 4. Likely Failure Categories

| Category | Assessment |
| --- | --- |
| Payload/type mismatch | Likely. The dry-run builder generates an insert payload with `event_status: "dry_run_ready"`. The live table migration allows only `attempted`, `succeeded`, `failed`, `blocked`, `duplicate`, or `unknown`. |
| Missing required column | Less likely. The dry-run builder supplies `execution_record_id`, `event_type`, `event_source`, `event_status`, JSON payloads, `source_system`, `idempotency_key`, metadata, and optional fields. |
| FK/seed mismatch | Less likely. Action 841 inserted the controlled seed row and Action 842 used the exact seed id. A FK issue is still not impossible without remote error details, but it is not the leading hypothesis. |
| Unique/idempotency conflict | Unclear but less likely. The idempotency key and duplicate-prevention key were deterministic and first-use for Action 842. A duplicate would normally map to `conflict_idempotent_duplicate` if Supabase returned `23505` or `409`. |
| RLS/service-role permission | Unclear but less likely. Permission errors `42501`, `401`, or `403` are mapped to `permission_security_failure`; Action 842 returned `unknown_error`, suggesting either another Postgres code or missing captured details. |
| Supabase adapter error mapping | Likely contributor. The adapter maps only duplicate, permission, and service-unavailable codes. Other Postgres errors, including likely check constraint code `23514`, become `unknown_error`. |
| Writer/result envelope mismatch | Contributing factor. The production write-path result had `errors: []`; the smoke runner printed `result.errors || writerResult.errors`, so writer errors were hidden when `result.errors` was an empty array. |
| Insufficient error capture | Definite. The proof did not include adapter status, adapter error code, Postgres constraint name, Supabase message/details/hint, or the normalized insert payload. |

## 5. Immediate Blocker

The exact remote failure cannot be proven from the current proof artifact because the live smoke proof lacks:

- Supabase error code, message, details, and hint;
- Postgres constraint name;
- adapter status and adapter `errorCode`;
- writer `errors` after production-envelope normalization;
- the normalized insert payload, especially `event_status`;
- confirmation whether the remote rejection was a check constraint, FK, RLS/permission, or another schema mismatch.

The strongest local hypothesis is that the live insert attempted to persist `event_status: "dry_run_ready"`, which violates the remote audit table check constraint.

## 6. Recommended Next Diagnostic Action

Recommended next action: Action 844 - Add Live Smoke Insert Failure Diagnostic Logging.

The diagnostic should be non-writing first:

- do not retry the insert;
- do not create a new audit event;
- improve error classification and proof capture around the service-role adapter;
- preserve Supabase `code`, `message`, `details`, and `hint` in sanitized output;
- surface writer `errors` even when the production write-path envelope has `errors: []`;
- include sanitized normalized insert metadata such as `event_status`, `event_type`, `source_system`, idempotency key, and FK id;
- classify `23514` check-constraint errors distinctly, likely as schema/constraint mismatch;
- add tests proving the current dry-run builder's `event_status: "dry_run_ready"` is not live-table-compatible unless translated before live insert.

Only after diagnostics confirm the failure should a separately approved fix decide whether live inserts should map the writer status to a table-allowed value such as `attempted`, or whether the schema/type contract should expand.

## 7. Safety Boundaries

Confirmed for Action 843:

- no retry;
- no second insert;
- no data mutation;
- no UI/browser/client invocation;
- no market-loop/scanner/automation invocation;
- no broker/Avanza behavior;
- no automatic mode;
- no trade/stats/PnL mutation;
- no migrations;
- no type generation;
- no generated type edits;
- no `.env.local` changes;
- no service-role value printing.

## 8. Result Status

Status: `audit_writer_live_smoke_insert_failure_resolution_documented_retry_blocked`.

## 9. Recommended Next Action

Action 844 - Add Live Smoke Insert Failure Diagnostic Logging.

## 10. Action 844 Diagnostic Logging Addendum

Action 844 created `docs/execution-record-audit-writer-live-smoke-insert-diagnostic-logging.md`.

Implemented non-mutating diagnostic improvements:

- live writer inserts now translate dry-run-only `event_status: "dry_run_ready"` to migration-allowed `event_status: "attempted"` before the service-role adapter call;
- dry-run proof metadata still preserves the original `dry_run_ready` would-insert payload;
- adapter failures now expose sanitized diagnostic category, code, status, message, details, hint, constraint name, and safe insert summary;
- Postgres schema/check/FK/not-null failures are classified as `schema_constraint` and mapped to `schema_or_constraint_mismatch`;
- writer and production write-path envelopes preserve adapter diagnostics when available;
- focused regression tests prove diagnostics redaction and event-status compatibility.

No live smoke retry, second insert, data mutation, Supabase query, remote SQL, UI/browser/client invocation, market-loop/scanner/automation invocation, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, migration, type generation, generated type edit, `.env.local` change, or service-role value printing was performed.

Status: `audit_writer_live_smoke_insert_diagnostics_added_retry_blocked`.

Recommended next action: Action 845 - Request Live Smoke Insert Retry Approval.

## 11. Action 845 Retry Approval Request Addendum

Action 845 created `docs/execution-record-audit-writer-live-smoke-insert-retry-approval-request.md`.

The approval request proposes one future controlled live smoke insert retry using execution record id `5d682086-4195-40ec-ba80-a0a1b39a6923`, the approved server-only production write path, migration-compatible `event_status: "attempted"`, and diagnostic proof capture.

Approval is absent, so no retry was run.

Status: `audit_writer_live_smoke_insert_retry_approval_requested_blocked`.

Recommended next action: Action 846 - Provide Live Smoke Insert Retry Approval.
## Action 847 - Success Regression Proof Follow-Up

- The Action 843 failure hypothesis was resolved by the Action 844 live-status translation and the Action 846 successful retry.
- Action 847 added regression proof that the success envelope remains stable after the retry succeeded.
- The success proof records writer `success`, `inserted: true`, adapter `success`, `diagnostics: null`, and audit event id `unconfirmed_without_select`.
- Failure diagnostics remain covered by regression tests for non-success adapter results.
- Status: `audit_writer_live_smoke_insert_success_regression_proof_added`.
- No live insert rerun, select/query/remote SQL, migration, type generation, generated type edit, `.env.local` change, production rollout, or service-role value printing was performed.

## Action 848 - Persistence Readiness Summary Follow-Up

- Created `docs/execution-record-audit-writer-persistence-readiness-summary.md`.
- The readiness summary records that the original failure was followed by diagnostics, a successful retry, and success regression proof.
- Status: `audit_writer_persistence_readiness_summary_created`.
- No live insert, select/query/remote SQL, migration, type generation, generated type edit, `.env.local` change, production rollout, UI/browser/client invocation, market-loop/scanner/automation invocation, broker/Avanza behavior, automatic mode, trade/stats/PnL mutation, or service-role value printing was performed.
