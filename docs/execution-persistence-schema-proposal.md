# Execution Persistence Schema Proposal

Date: 2026-06-10

Status: Proposal only. No Supabase migration has been applied, and no database write path is implemented by this document. Later actions added dev-gated validation stubs and UI testers, but they do not persist data.

Review: see `docs/execution-persistence-schema-review.md` for Action 214 risk notes, trust boundaries, recommended clarifications, and the migration go/no-go checklist.

Server capture contract: see `docs/execution-server-capture-api-contract.md` and `lib/execution-server-capture-contract.ts` for the Action 215 typed request/response/idempotency contract. No route or persistence is implemented.

Migration draft: Action 219 added `supabase/migrations/20260610000000_execution_audit_foundation.sql` as a draft for append-only execution audit/run/progress tables only. It is not applied by this action, and app code does not write to it.

Apply/rollback plan: Action 222 added `docs/execution-audit-migration-apply-plan.md` as a documentation-only plan for applying and rolling back the audit foundation migration later. No Supabase command was run.

Audit persistence stubs: Action 220 added `lib/execution-audit-persistence-contract.ts` and dev-gated route stubs for lifecycle events, agent runs, and agent progress events. They validate payloads only and do not write Supabase.

Audit persistence client testers: Action 221 added `lib/execution-audit-persistence-client.ts` and a dev-only Settings `Execution Audit API Stubs` panel. The buttons manually POST local_dev mock lifecycle/run/progress requests to the stubs and display accepted/rejected responses without writing Supabase, localStorage, audit events, execution records, trades, History, or Statistics.

Writer mapping draft: Action 223 added `lib/execution-audit-persistence-writer.ts` with pure mapping helpers that convert validated audit persistence requests into insert-shaped payloads for the draft tables. It includes a no-op writer interface only; routes are not wired and no Supabase calls are made.

## Scope And Non-Goals

Actions 149-212 built a local/dev execution-agent sandbox and mock execution pipeline. The current system can create local execution intents, handoffs, lifecycle diagnostics, local agent run diagnostics, dev mock broker results, and local `TureExecutionRecord` captures. All persistence for this area is still localStorage-backed diagnostics.

This proposal describes a possible Supabase schema for future execution-agent persistence. It is not a migration plan ready to run. It intentionally does not add real broker execution, Avanza automation, Supabase writes, or live trade mutation.

## Current Local-Only Stores

| Storage key | Current purpose | Production candidate | Notes |
| --- | --- | --- | --- |
| `ture_execution_event_log_v1` | Local execution lifecycle and audit events | Yes | Candidate source for `execution_lifecycle_events`, after server-side validation and user scoping are designed. |
| `ture_execution_records_v1` | Local execution record diagnostics, including dev mock captures | Yes, with filtering | Candidate source for `execution_records`, but dev/mock captures must stay excluded or explicitly marked. |
| `ture_avanza_agent_runs_v1` | Local agent run diagnostics and bridge/mock-agent run metadata | Yes | Candidate source for `agent_runs` and `agent_progress_events`. |
| `ture_dev_mock_broker_results_v1` | Local dev mock broker result diagnostics | No for production | Keep local by default. If persisted, use a dev-only table or environment-gated schema. |
| `ture_avanza_agent_bridge_config_v1` | Local bridge selection/config diagnostics | No for execution history | User/device preference, not execution evidence. Keep local unless a future settings sync design exists. |
| `ture_execution_sandbox_smoke_checklist_v1` | Local manual QA checklist state | No | Dev QA state only. Do not persist to production execution tables. |

Production candidates are execution evidence, lifecycle events, agent run metadata, broker results, and normalized execution records. Dev-only diagnostics, mock broker results, bridge config, and smoke checklist state should remain local unless a separate dev/test persistence design is approved.

## Persistence Goals

- Preserve an auditable timeline of execution intents, handoffs, agent runs, broker results, records, failures, rejections, cancellations, and safety decisions.
- Support replay and debugging without relying on localStorage.
- Link execution data to recommendations, live positions, History, and Statistics.
- Support both `semi_automatic` and future `automatic` modes.
- Capture broker execution results without storing broker credentials.
- Represent filled, partially filled, submitted, rejected, cancelled, failed, and unknown states.
- Enable future learning/statistics while minimizing sensitive raw payloads.
- Keep mock/dev data strictly separated from real broker evidence.

## Proposed Tables

### A. `execution_intents`

Purpose: durable record of a Ture execution decision before any broker handoff or agent run.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `intent_id text not null`
- `recommendation_id text null`
- `position_id text null`
- `ticker text not null`
- `action text not null`
- `mode text not null`
- `trigger_type text null`
- `trigger_priority integer null`
- `broker text null`
- `status text not null`
- `source text not null`
- `idempotency_key text null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `payload jsonb not null default '{}'::jsonb`
- `authority jsonb not null default '{}'::jsonb`
- `trading_package jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Important JSONB fields: original execution intent payload, authority details, candidate selection context, risk limits, price context, and safety warnings.

Indexes:

- Unique `intent_id` per user or environment.
- `user_id, created_at desc`.
- `recommendation_id`.
- `position_id`.
- `ticker, created_at desc`.
- Partial unique `idempotency_key` where non-null and `is_mock = false` and `is_dev = false`.

Relationships:

- Parent for `broker_handoffs`, `agent_runs`, `execution_lifecycle_events`, `broker_execution_results`, and `execution_records`.
- Links to recommendation and live position identifiers.

Retention notes: retain durable real execution intent history. Exclude dev/mock records from production unless explicitly environment-gated.

### B. `execution_lifecycle_events`

Purpose: append-only audit timeline for state transitions, user decisions, bridge calls, safety blocks, diagnostics, and capture outcomes.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `intent_id text null`
- `record_id uuid null`
- `agent_run_id text null`
- `handoff_id text null`
- `event_type text not null`
- `status text null`
- `source text not null`
- `message text null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `payload jsonb not null default '{}'::jsonb`
- `metadata jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Important JSONB fields: lifecycle snapshot, UI context, bridge result metadata, validation diagnostics, and non-sensitive request summaries.

Indexes:

- `user_id, created_at desc`.
- `intent_id, created_at`.
- `agent_run_id, created_at`.
- `event_type, created_at desc`.
- `status, created_at desc`.

Relationships:

- References `execution_intents.intent_id`, `agent_runs.agent_run_id`, and `execution_records.id` where available.

Retention notes: high-volume audit data may need time-based retention or archival after a fixed period. Production safety-critical events should be retained longer than verbose diagnostics.

### C. `broker_execution_results`

Purpose: canonical broker result evidence captured from a trusted broker-result path before or alongside normalized Ture execution records.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `intent_id text null`
- `agent_run_id text null`
- `request_id text null`
- `broker text not null`
- `broker_order_id text null`
- `broker_timestamp timestamptz null`
- `status text not null`
- `ticker text not null`
- `action text not null`
- `quantity numeric null`
- `filled_quantity numeric null`
- `requested_price numeric null`
- `executed_price numeric null`
- `average_fill_price numeric null`
- `raw_status text null`
- `raw_broker_summary text null`
- `idempotency_key text null`
- `source text not null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `payload jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Important JSONB fields: minimized raw broker confirmation data, parser metadata, normalized price/quantity evidence, and validation details.

Indexes:

- Unique `broker, broker_order_id` where `broker_order_id is not null` and `is_mock = false` and `is_dev = false`.
- Unique `idempotency_key` where non-null and `is_mock = false` and `is_dev = false`.
- `user_id, created_at desc`.
- `intent_id`.
- `agent_run_id`.
- `broker, status, created_at desc`.
- `ticker, created_at desc`.

Relationships:

- May reference `execution_intents.intent_id`.
- May reference `agent_runs.agent_run_id`.
- Feeds `execution_records`.

Retention notes: retain real broker execution evidence. Raw payload should be minimized and may need stricter retention than normalized fields.

### D. `execution_records`

Purpose: normalized Ture execution record produced from an execution intent plus broker result evidence.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `intent_id text null`
- `broker_result_id uuid null`
- `recommendation_id text null`
- `position_id text null`
- `ticker text not null`
- `action text not null`
- `mode text not null`
- `broker text not null`
- `broker_order_id text null`
- `broker_timestamp timestamptz null`
- `broker_status text not null`
- `capture_status text not null`
- `quantity numeric null`
- `requested_price numeric null`
- `executed_price numeric null`
- `source text not null`
- `idempotency_key text null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `intent_payload jsonb not null default '{}'::jsonb`
- `broker_result_payload jsonb not null default '{}'::jsonb`
- `payload jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Important JSONB fields: source intent snapshot, normalized broker result snapshot, capture validation details, and lifecycle summary.

Indexes:

- Unique `broker_result_id` where non-null and `is_mock = false` and `is_dev = false`.
- Unique `broker, broker_order_id` where `broker_order_id is not null` and `is_mock = false` and `is_dev = false`.
- Unique `idempotency_key` where non-null and `is_mock = false` and `is_dev = false`.
- `user_id, created_at desc`.
- `recommendation_id`.
- `position_id`.
- `intent_id`.
- `ticker, created_at desc`.

Relationships:

- References `broker_execution_results.id`.
- References `execution_intents.intent_id`.
- Later may connect to History, Statistics, and live position open/close records.

Retention notes: durable production execution history. Dev/mock rows should not be mixed into production reporting.

### E. `agent_runs`

Purpose: durable record of each local or future external agent run attempt.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `agent_run_id text not null`
- `request_id text null`
- `intent_id text null`
- `handoff_id text null`
- `runner_id text null`
- `runner_name text null`
- `runner_version text null`
- `transport text not null`
- `broker text null`
- `mode text null`
- `ticker text null`
- `action text null`
- `quantity numeric null`
- `result_status text null`
- `broker_result_present boolean not null default false`
- `started_at timestamptz null`
- `completed_at timestamptz null`
- `source text not null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `request_payload jsonb not null default '{}'::jsonb`
- `result_payload jsonb not null default '{}'::jsonb`
- `metadata jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Important JSONB fields: request envelope, sanitized result metadata, bridge capabilities, mock-agent diagnostics, and error details.

Indexes:

- Unique `agent_run_id` per user or environment.
- `user_id, created_at desc`.
- `intent_id, created_at`.
- `request_id`.
- `result_status, created_at desc`.
- `transport, created_at desc`.

Relationships:

- Parent for `agent_progress_events`.
- May link to `execution_intents`, `broker_handoffs`, and `broker_execution_results`.

Retention notes: allow repeated failed attempts with distinct run IDs. Consider pruning verbose request/result payloads after operational retention windows.

### F. `agent_progress_events`

Purpose: append-only progress event stream for each agent run.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `user_id uuid null`
- `agent_run_id text not null`
- `request_id text null`
- `intent_id text null`
- `sequence integer null`
- `event_type text not null`
- `status text null`
- `source text not null`
- `message text null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `payload jsonb not null default '{}'::jsonb`
- `metadata jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Important JSONB fields: step-specific diagnostics, selector contract results for mock pages, bridge status, timing data, and validation warnings.

Indexes:

- `agent_run_id, sequence`.
- `agent_run_id, created_at`.
- `user_id, created_at desc`.
- `event_type, created_at desc`.

Relationships:

- References `agent_runs.agent_run_id`.
- May reference `execution_intents.intent_id`.

Retention notes: potentially high volume. Keep enough for debugging recent runs, then archive or prune verbose event payloads.

### G. `broker_handoffs` Optional

Purpose: persist the execution handoff/envelope given to a bridge or agent.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `handoff_id text not null`
- `request_id text null`
- `intent_id text null`
- `broker text not null`
- `mode text not null`
- `status text not null`
- `source text not null`
- `expires_at timestamptz null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `payload jsonb not null default '{}'::jsonb`
- `safety_checks jsonb not null default '[]'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Indexes: unique `handoff_id`; `intent_id`; `request_id`; `user_id, created_at desc`; `status, created_at desc`.

Relationships: links `execution_intents` to `agent_runs` and broker result capture.

Retention notes: retain sanitized handoff package for audit, but do not store credentials or broker session data.

### H. `execution_safety_checks` Optional

Purpose: normalized safety decisions that are queryable outside large JSON payloads.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `user_id uuid null`
- `intent_id text null`
- `handoff_id text null`
- `agent_run_id text null`
- `check_key text not null`
- `status text not null`
- `severity text not null`
- `message text null`
- `source text not null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `payload jsonb not null default '{}'::jsonb`

Indexes: `intent_id, created_at`; `handoff_id`; `agent_run_id`; `check_key, status`; `severity, created_at desc`.

Relationships: references intent, handoff, or agent run depending on where the check occurred.

Retention notes: retain blocking and warning checks longer than informational checks.

### I. `dev_mock_broker_results` Optional Dev-Only

Purpose: optional persistence for mock broker result diagnostics in non-production environments only.

Suggested columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `user_id uuid null`
- `mock_result_id text null`
- `request_id text null`
- `intent_id text null`
- `position_id text null`
- `recommendation_id text null`
- `broker_order_id text null`
- `status text not null`
- `ticker text not null`
- `action text not null`
- `quantity numeric null`
- `requested_price numeric null`
- `executed_price numeric null`
- `duplicate_key text null`
- `source text not null default 'mock_broker'`
- `is_mock boolean not null default true`
- `is_dev boolean not null default true`
- `raw_payload jsonb not null default '{}'::jsonb`
- `errors text[] not null default '{}'`
- `warnings text[] not null default '{}'`

Indexes: unique `duplicate_key` per dev environment where non-null; `intent_id`; `request_id`; `broker_order_id`; `created_at desc`.

Relationships: optional link to local/dev `execution_records` only in dev environments.

Retention notes: keep local by default. If ever persisted, isolate from production analytics and purge aggressively.

## Common Fields And Semantics

- `id`: database primary key.
- `created_at` and `updated_at`: database timestamps.
- `user_id`: optional until the app auth model is finalized.
- `recommendation_id` and `position_id`: links to Ture decision and live position context.
- `ticker`, `action`, `mode`, `trigger_type`, `broker`, `status`: normalized query fields.
- `is_mock`, `is_dev`, and `source`: explicit data-origin markers.
- `idempotency_key`: trusted real-capture dedupe key.
- `request_id`, `intent_id`, `handoff_id`, `agent_run_id`, `broker_order_id`: cross-system correlation keys.
- `payload jsonb`: sanitized source payload or normalized snapshot.
- `raw_broker_summary`: short human-readable broker evidence summary, not credentials or full page dumps.
- `errors text[]` and `warnings text[]`: validation and capture diagnostics.

## Idempotency And Dedupe

- Real broker result capture should require an `idempotency_key` derived from trusted capture context where possible.
- Real broker rows should have a partial unique constraint on `broker, broker_order_id` when `broker_order_id` is present and the row is not mock/dev.
- `execution_records` should avoid duplicate records for the same real broker confirmation by unique `broker_result_id`, `idempotency_key`, or `broker, broker_order_id`.
- Failed attempts should remain repeatable. Repeated failures should use distinct `agent_run_id` values and should not collide with broker confirmation dedupe.
- Dev/mock duplicate keys should be separate from real broker dedupe. The Action 212 local duplicate guard is diagnostics-only and should not become a broker order dedupe mechanism.
- Partial fills may need multiple broker events tied to one intent and one broker order. The schema should support several broker result events or updates before final normalized execution record semantics are decided.

## Dev And Mock Separation

- Mock/dev records should never be mixed with real broker records unless explicitly marked with `is_mock` or `is_dev`.
- Production write paths should reject mock/dev rows unless the environment is explicitly configured for dev/test writes.
- Production read paths and analytics should hide mock/dev rows by default.
- Dev mock broker results should remain local-only initially.
- If a dev/mock table is ever added, it should be isolated from real `broker_execution_results` and `execution_records`.
- Converted mock broker-result previews must remain marked as dev/mock and should not be treated as real Avanza confirmations.

## Security And Safety

- Do not store broker credentials or Avanza credentials.
- Do not store browser session cookies, 2FA data, passwords, or raw page dumps.
- Minimize raw payloads before persistence. Prefer normalized fields plus short summaries.
- Real execution writes should be server-only and validated against trusted capture paths.
- A client should not be allowed to mark a real broker execution as filled without a trusted broker-result source.
- If Supabase auth is used, every user-scoped table should have RLS policies by `user_id`.
- Service-role writes should be limited to API routes or trusted background workers, not browser code.
- Audit events should capture safety blocks and validation failures without leaking secrets.

## Suggested Migration Order

Phase 1 - Diagnostic foundations:

- Draft `execution_lifecycle_events`.
- Draft `execution_agent_runs`.
- Draft `execution_agent_progress_events`.
- Keep writes behind explicit server routes and feature flags.

Phase 2 - Intent and handoff history:

- Add `execution_intents`.
- Add optional `broker_handoffs`.
- Define intent and handoff retention before any broker persistence.

Phase 3 - Broker result and normalized records:

- Add `broker_execution_results`.
- Add `execution_records`.
- Add idempotency and unique constraints before enabling writes.

Phase 4 - Product integration:

- Link approved execution records to History and Statistics.
- Define live position open/close mutation rules separately.
- Keep automatic mode approvals explicitly gated.

Phase 5 - Dev/mock persistence, only if needed:

- Keep dev mock results local by default.
- If needed, add isolated dev/mock tables after production filtering and RLS rules are proven.

## API Route Implications

Potential future routes and current stubs:

- `POST /api/execution/audit/lifecycle-events`: dev-only validation stub exists; future route may append validated lifecycle/audit events.
- `POST /api/execution/audit/agent-runs`: dev-only validation stub exists; future route may create agent run summaries.
- `POST /api/execution/audit/agent-progress-events`: dev-only validation stub exists; future route may append progress events.
- `POST /api/execution/broker-results`: receive trusted broker result evidence with idempotency.
- `POST /api/execution/records`: create normalized execution records after validation.
- `GET /api/execution/records`: read user-scoped execution records for diagnostics or product views.

The audit routes currently validate and return accepted/rejected responses only. All future real write routes should be server-validated, user-scoped, and guarded from client-side spoofing of filled broker executions.

## Open Questions

- What exact auth and `user_id` model should execution tables use?
- Should any localStorage diagnostics ever sync to Supabase, or should Supabase only accept future server-generated events?
- What retention limits should apply to lifecycle events, agent progress events, and raw payload JSONB?
- How should execution records link to Live Day Trade positions when positions are opened, partially filled, cancelled, or closed?
- Should `broker_execution_results` be persisted before `execution_records`, or should one API route atomically create both?
- How should partial fills be represented: multiple broker result rows, one mutable broker order row, or both?
- What additional approval records are required before automatic mode can submit anything in the future?
- Which fields should be encrypted, redacted, or omitted entirely?

## Action 214 Review

Action 214 added `docs/execution-persistence-schema-review.md`, a documentation-only critical review of this proposal.

The review identifies:

- Major persistence risks.
- Trust boundaries between client, local bridge, agent output, and trusted server capture.
- Schema clarifications for `source_environment`, `capture_source`, authority snapshots, raw payload minimization, and append-only events.
- Idempotency and partial-fill risks.
- RLS/security requirements.
- A migration go/no-go checklist.

## Action 215 Server Capture Contract

Action 215 added a typed/documented server capture API contract:

- `lib/execution-server-capture-contract.ts`
- `docs/execution-server-capture-api-contract.md`

The contract defines future request/response shapes, source/environment types, idempotency key construction, validation expectations, trust boundary warnings, and response helpers. It does not create an API route, migration, Supabase write, or runtime wiring.

## Action 219 Minimal Audit Migration Draft

Action 219 added a draft Supabase migration:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`

The draft includes only:

- `execution_lifecycle_events`
- `execution_agent_runs`
- `execution_agent_progress_events`

It intentionally excludes `broker_execution_results`, `execution_records`, `execution_intents`, and `broker_handoffs`. No app writes, API route persistence, Supabase write, broker capture, or trade mutation was added.

## Action 220 Audit Persistence Contract And Stubs

Action 220 added validation-only contracts and route stubs for the Action 219 draft tables:

- `lib/execution-audit-persistence-contract.ts`
- `POST /api/execution/audit/lifecycle-events`
- `POST /api/execution/audit/agent-runs`
- `POST /api/execution/audit/agent-progress-events`

The stubs are dev-gated by `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`, return 202 for valid payloads, 400 for invalid/malformed payloads, and 403 when disabled. They do not write Supabase, localStorage, execution records, broker results, History, Statistics, or trades.

## Action 221 Audit Persistence Client Testers

Action 221 added frontend-safe client helpers and manual Settings testers for the three Action 220 stubs:

- `lib/execution-audit-persistence-client.ts`
- Settings `Execution Audit API Stubs`
- `Test lifecycle event audit stub`
- `Test agent run audit stub`
- `Test agent progress audit stub`

The client helpers are non-throwing, use JSON POSTs with timeouts, parse responses safely, and return normalized HTTP/status/errors/warnings results. The Settings buttons are dev-gated and explicit manual actions only. They do not write Supabase, localStorage, audit events, execution records, broker results, History, Statistics, or trades.

## Action 222 Audit Migration Apply And Rollback Plan

Action 222 added:

- `docs/execution-audit-migration-apply-plan.md`

The plan covers the Action 219 audit foundation migration only: lifecycle events, agent runs, and agent progress events. It documents preflight checks, staging-first apply steps, verification SQL, rollback SQL, post-apply app checks, risk notes, and go/no-go criteria. The migration remains unapplied, no Supabase write path was added, and no app behavior changed.

## Action 223 Audit Persistence Server Writer Draft

Action 223 added:

- `lib/execution-audit-persistence-writer.ts`

The writer draft maps:

- `PersistExecutionLifecycleEventRequest` to `execution_lifecycle_events` insert payloads
- `PersistExecutionAgentRunRequest` to `execution_agent_runs` insert payloads
- `PersistExecutionAgentProgressEventRequest` to `execution_agent_progress_events` insert payloads

The helpers validate requests first, preserve sanitized JSON payload/metadata, keep `user_id` nullable unless a safe UUID user context is supplied, and avoid Supabase imports. A no-op writer interface exists for future wiring shape only and always reports `persisted: false`. API routes still return stub responses only and do not write Supabase.

## Recommended Action 224

Preferred next action:

- Action 224 - Apply Audit Migration in Local/Staging Dev

Apply only after manual approval and target-environment confirmation. Do not wire Supabase writes in the same action.
