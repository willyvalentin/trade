# Execution Persistence Schema Review

Date: 2026-06-10

Status: Review and risk notes only. No Supabase migrations, database code, API routes, runtime writes, app behavior changes, or local store changes are implemented by this document.

Follow-up: Action 215 added `lib/execution-server-capture-contract.ts` and `docs/execution-server-capture-api-contract.md` as a typed/documented server capture contract. No route or persistence exists yet.

Migration draft follow-up: Action 219 added `supabase/migrations/20260610000000_execution_audit_foundation.sql` as a draft only. It is not applied or wired to app writes.

Audit persistence stub follow-up: Action 220 added typed contracts and dev-gated route stubs for the draft lifecycle/run/progress tables. The stubs validate only and do not write Supabase.

Apply/rollback plan follow-up: Action 222 added `docs/execution-audit-migration-apply-plan.md` as a documentation-only plan for applying and rolling back the audit foundation migration later. No Supabase command was run and no database state changed.

Writer draft follow-up: Action 223 added `lib/execution-audit-persistence-writer.ts` with pure mapping helpers and a no-op writer interface. It does not import Supabase, call Supabase, or wire route persistence.

## Review Summary

The Action 213 schema proposal in `docs/execution-persistence-schema-proposal.md` is directionally good. It separates intents, lifecycle events, agent runs, broker results, and normalized execution records in a way that can support auditability and later product integration.

No persistence should be implemented until the open trust, idempotency, auth, dev/mock separation, and product-linking questions are resolved. The safest next implementation work should start with server-side contracts and append-only diagnostics, not broker result capture or History/Statistics mutation.

## Biggest Risks

- Dev/mock records mixed with real execution data: local mock captures already exercise `TureExecutionRecord` locally, so future Supabase writes must ensure mock data cannot leak into production reporting.
- Client-side spoofing of broker results: browser code and localStorage are untrusted. A frontend must not be able to insert a real filled broker execution.
- Duplicate broker confirmations: repeated parser/capture attempts could create duplicate records unless real idempotency keys and broker order constraints exist before writes are enabled.
- Partial fills: one broker order may produce several status changes and fills. A single final-record model may be too simple.
- Mismatched intent/result data: a broker result may disagree with the original intent ticker, action, quantity, mode, or price. The database should preserve both and require validation status.
- Execution mode authority drift: the authority that existed at intent time may differ from current settings. Persist the authority snapshot used for the decision.
- Automatic mode auditability: if automatic mode is ever enabled, approvals, safety checks, and final-submit authority need durable evidence before any broker result is accepted.
- Over-storing raw broker payloads: raw page or broker payload dumps could expose sensitive account or session data. Store minimized payloads and short summaries.
- RLS and `user_id` assumptions: tables should not be migrated before the app's auth/user ownership model is clear.
- Retention and table bloat: lifecycle and progress events can grow quickly, especially with agent retries and traces.
- Linking to live positions, History, and Statistics too early: execution evidence should be stable before it mutates product state or reporting.

## Trust Boundary Model

Untrusted:

- Browser UI state.
- `localStorage` diagnostics.
- Dev mock broker result storage.
- Mock confirmation save/capture controls.
- Any client-provided claim that an order was filled.

Semi-trusted:

- Localhost bridge responses.
- Local mock-agent output.
- External local process output before server validation.
- Agent progress events and parser output that have not passed a trusted capture route.

Trusted only after validation:

- Server-side execution capture route.
- Server-side idempotency enforcement.
- Server-side user ownership checks.
- Server-side broker result validation against the stored intent/handoff.

Real broker confirmation trust requirements:

- The confirmation source must be explicit.
- The broker, broker order id, status, ticker, action, quantity, and timestamps must be validated.
- The result must pass idempotency checks before creating or updating normalized records.
- Raw payloads must be minimized before storage.

Implications:

- The frontend should not directly insert real filled execution records.
- Local/mock capture must remain dev-only and local by default.
- Future `brokerResult` capture should go through a server route with validation and idempotency.
- Agent output may propose a result, but the server should decide whether it is accepted as broker evidence.

## Recommended Schema Changes And Clarifications

- Keep `is_mock` and `is_dev` explicit on every execution-related table.
- Add `source_environment text not null` with values such as `local_dev`, `staging`, and `production`.
- Add `capture_source text not null` where applicable, with values such as `manual`, `agent`, `bridge`, `mock`, and `import`.
- Add `authority_snapshot jsonb not null default '{}'::jsonb` to `execution_intents`, `broker_handoffs`, and possibly `execution_records`.
- Keep safety evidence as `safety_checks jsonb` on early tables, and consider `execution_safety_checks` once querying individual checks becomes important.
- Prefer `raw_payload_minimized jsonb` over a generic full raw dump. If full raw payloads are ever needed, put them behind a separate retention and access policy.
- Make `idempotency_key` required for accepted real `broker_execution_results`.
- Consider never syncing `dev_mock_broker_results` to Supabase. If persisted, use a separate dev-only table and environment-gated policies.
- Treat lifecycle and progress events as immutable append-only logs.
- Keep `execution_records` as a normalized summary, not the source of truth. The source of truth should be intent, handoff, broker result evidence, and append-only events.
- Add validation status fields where mismatches can occur, such as `validation_status`, `validation_errors`, and `validation_warnings`.
- Keep `broker_execution_results` separate from `execution_records` so broker evidence can be captured before product-level record semantics are finalized.

## Idempotency Review

Suggested real-data constraints:

- Unique `broker, broker_order_id` when `broker_order_id` exists and `is_mock = false` and `is_dev = false`.
- Unique `idempotency_key` for real `broker_execution_results`.
- Unique `broker_result_id` for real `execution_records`.
- Consider unique `intent_id, broker_status, broker_order_id` for status-specific captures where applicable.
- Consider `agent_run_id, result_hash` for repeated agent result submissions that lack a broker order id.

Partial fill nuance:

- A partial fill can produce multiple broker events for the same order id.
- The schema should allow multiple broker status observations while preventing duplicate observations of the same event.
- A future design may need `broker_order_events` or a status-history JSONB array before normalized final execution records are reliable.
- Do not force one `execution_record` per broker status event until partial-fill semantics are decided.

Failed attempts:

- Repeated failed agent runs should be allowed with distinct `agent_run_id` values.
- A failed or rejected attempt should not block a later successful attempt for the same intent unless safety rules explicitly say so.

## RLS And Security Review

- Rows should be user-owned once the auth model is confirmed.
- Real broker result insertion should be server-only.
- Clients may read their own execution records and events through RLS.
- Clients may append low-trust diagnostic events only if those events are clearly marked and cannot become broker evidence.
- No broker credentials, Avanza credentials, browser cookies, session data, or 2FA material should be stored.
- Service-role use should be least-privilege and limited to API routes or trusted jobs.
- Audit log tables should be append-only where possible.
- Updates to broker result and execution record rows should be restricted to trusted server paths.
- Production queries should filter out `is_mock = true`, `is_dev = true`, and non-production `source_environment` by default.

## Migration Go/No-Go Checklist

Before creating migrations, confirm:

- Auth and `user_id` ownership model.
- Live position id source and whether position ids are stable enough for database references.
- Recommendation id source and retention expectations.
- History and Statistics linkage strategy.
- Real broker result trust path.
- Which process is allowed to call real broker result capture routes.
- Required idempotency keys and unique constraints.
- Partial-fill representation.
- Retention limits for lifecycle/progress events and raw payload JSONB.
- Dev/mock exclusion policy.
- RLS policy design.
- Automatic mode authority and approval audit requirements.
- Raw payload minimization rules.
- Whether localStorage diagnostics should ever sync or should remain local forever.

No-go conditions:

- No clear server-only path for real broker result writes.
- No confirmed user ownership/RLS model.
- No decision on dev/mock exclusion.
- No idempotency rule for broker confirmations.
- No plan for partial fills.
- Any requirement to store credentials or raw broker pages.

## Recommended Migration Order Revision

Phase 1 - Append-only diagnostics:

- Start with `execution_lifecycle_events`.
- Add `execution_agent_runs`.
- Add `execution_agent_progress_events`.
- Make these append-only where practical.

Phase 2 - Intent and handoff evidence:

- Add `execution_intents`.
- Add `broker_handoffs`.
- Include `authority_snapshot`, `source_environment`, `capture_source`, and safety evidence from the start.

Phase 3 - Broker evidence:

- Add `broker_execution_results` only after server capture contracts, trust boundaries, and idempotency keys are finalized.
- Require server-side validation before accepting real filled/rejected/cancelled evidence.

Phase 4 - Normalized records:

- Add `execution_records` after broker evidence semantics are stable.
- Keep records as summaries derived from source evidence.

Phase 5 - Product integration:

- Delay History, Statistics, and live position mutation until records are stable and audited.

Phase 6 - Dev/mock persistence, only if needed:

- Prefer keeping dev mock results local-only.
- If needed, use separate dev/mock tables and explicit environment gating.

## Action 215 Server Capture Contract

Action 215 completed the preferred follow-up from this review:

- Added a typed request/response/idempotency contract for future server capture.
- Defined source and environment boundaries.
- Added pure request builder and validation helpers.
- Documented the proposed future `POST /api/execution/capture` route without implementing it.

No Supabase migration, route, runtime wiring, or database write was added.

## Action 219 Minimal Audit Migration Draft

Action 219 added the first migration draft after the contract and route-stub review:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`

The draft is limited to append-only execution lifecycle/progress diagnostics and agent run summaries. It does not add broker execution result or normalized execution record tables.

Known review points before applying:

- `user_id` remains nullable because auth ownership is not finalized.
- RLS is left as TODO comments because the existing migration set has no clear RLS policy convention.
- No app code writes these tables yet.
- Broker result persistence remains out of scope.

## Action 220 Audit Persistence Contract And Stubs

Action 220 added validation-only API contracts/stubs for the Action 219 audit foundation:

- `lib/execution-audit-persistence-contract.ts`
- `POST /api/execution/audit/lifecycle-events`
- `POST /api/execution/audit/agent-runs`
- `POST /api/execution/audit/agent-progress-events`

The stubs are still on the untrusted/dev side of the trust boundary. They should not be treated as persistence until a later action adds server-side auth/RLS decisions and Supabase writes.

## Action 221 Audit Persistence Client Testers

Action 221 added browser-safe client helpers and Settings buttons that manually POST to the Action 220 stubs. They are dev-gated and validation-only. They do not write Supabase, localStorage, execution records, audit events, broker results, trades, History, or Statistics.

## Action 222 Audit Migration Apply And Rollback Plan

Action 222 added:

- `docs/execution-audit-migration-apply-plan.md`

The plan keeps the Action 219 migration unapplied and documents preflight checks, staging-first apply steps, verification SQL, rollback SQL, risk notes, and production go/no-go criteria.

## Action 223 Audit Persistence Server Writer Draft

Action 223 added:

- `lib/execution-audit-persistence-writer.ts`

The draft maps validated lifecycle event, agent run, and agent progress requests into insert-shaped payloads for the Action 219 tables. It keeps `user_id` nullable unless a safe UUID context is supplied, redacts sensitive metadata keys, and preserves external text agent run ids in metadata when they cannot be used as the UUID foreign key. The no-op writer interface is shape-only and reports `persisted: false`.

Route stubs remain validation-only. This writer draft is still not a trusted persistence path until the migration is applied and RLS/user ownership is resolved.

## Recommended Action 224

Preferred next action:

- Action 224 - Apply Audit Migration in Local/Staging Dev

Apply only after manual approval and target-environment confirmation. Production remains no-go until `user_id` ownership and RLS policy decisions are resolved.
