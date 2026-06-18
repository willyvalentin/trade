# Execution Audit/Event Log Persistence Boundary Reassessment

## 1. Purpose

Reassess execution audit/event log persistence before moving any wrappers.

This is a documentation-only boundary review. No runtime code, persistence
behavior, localStorage access, Supabase access, audit/event log behavior,
execution metadata behavior, trade mutation behavior, execution/orchestrator
behavior, Avanza/browser behavior, or execution behavior changed in this
action.

## 2. Current Audit/Event Persistence Inventory

Local trade management timeline events:

- key: `TRADE_MANAGEMENT_EVENTS_STORAGE_KEY`
- exact key string: `trade-management-events`
- key constant location: `lib/persistence/local-storage-keys.ts`
- read helper: `readTradeManagementEvents()` in
  `lib/execution-timeline.ts`
- read behavior: server/no-window returns `[]`; localStorage reads parse JSON
  with `[]` fallback; non-array storage returns `[]`; storage/parse errors
  return `[]`.
- write/append behavior: many `log...Event(...)` helpers remain inline in
  `app/trade-app.tsx`.
- append shape: each helper builds a domain-specific event object, reads the
  existing array, prepends the event, truncates to 200 events, writes JSON, and
  swallows errors.
- remove/clear behavior: no dedicated clear/remove path identified for
  `trade-management-events`.

Representative inline append helpers in `app/trade-app.tsx`:

- `logAddTradeValidationEvent(...)`
- `logExecutionPayloadEvent(...)`
- `logTradePlanningSnapshotCapturedEvent(...)`
- `logAgentDryRunCompletedEvent(...)`
- `logMockBrokerFillImportEvent(...)`
- `logAgentHandoffCommandEvent(...)`
- `logAgentHardStopContractEvent(...)`
- `logAgentFormMappingPreviewEvent(...)`
- `logBuyOrderHandoffProgressEvent(...)`
- `logSellExecutionPayloadEvent(...)`
- `logSellAgentHandoffCommandEvent(...)`
- `logSellHardStopContractEvent(...)`
- `logSellFormMappingPreviewEvent(...)`
- `logBrokerFillCaptureAgentSpecEvent(...)`
- `logTureFillAutofillContractEvent(...)`
- `logAvanzaFieldVerificationEvent(...)`
- `logFillCaptureReviewEvent(...)`
- `logTureAgentCompletionPolicyEvent(...)`
- `logHandoffIntegrityEvent(...)`
- `logLiveDayTradeCreatedAfterBrokerConfirmation(...)`
- `logBrokerOrderPreviewCaptured(...)`
- `logTradeClosedEvent(...)`
- `logBrokerExitConfirmationEvent(...)`

Data shape:

- intentionally loose `unknown[]` local event array.
- event fields vary by event type.
- common fields include `type`, `timestamp`, ids, ticker, payload ids,
  payload fingerprints, handoff session ids, status fields, counts, warning
  ids, broker preview fields, and trade close fields.

Timeline/history/diagnostics dependencies:

- `buildExecutionTimeline(...)` consumes local events together with execution
  metadata and position data.
- local events are matched by handoff session id, sell handoff session id,
  payload id, sell payload id, payload fingerprint, recommendation id,
  position id, or ticker.
- timeline output feeds live trade details, closed trade details, full audit
  trail display, handoff replay, handoff quality, improvement suggestions,
  History details, and diagnostics surfaces.

Dedicated execution audit event log:

- module: `lib/execution-event-log.ts`
- key: `EXECUTION_EVENT_LOG_STORAGE_KEY`
- exact key string: `ture_execution_event_log_v1`
- max retained events: `MAX_EXECUTION_AUDIT_EVENTS = 1000`
- exported behavior includes `createExecutionAuditEvent(...)`,
  `readExecutionAuditEvents()`, `readExecutionEventLog()`,
  `appendExecutionAuditEvent(...)`, `appendExecutionAuditEvents(...)`,
  `clearExecutionAuditEvents()`, and lookup helpers by intent, position, and
  recommendation.
- this module owns guarded localStorage access, event normalization, discarded
  count reporting, append normalization, truncation, and clear behavior.

Execution audit persistence contracts and routes:

- `lib/execution-audit-persistence-contract.ts` owns
  `execution_audit_persistence_v1`, request/response types, and validation.
- `lib/execution-audit-persistence-client.ts` owns client endpoint calls for
  lifecycle events, agent runs, and agent progress events.
- `lib/execution-audit-persistence-route-handler.ts` owns route-level
  disabled/stub/no-op/Supabase branching and response shaping.
- `lib/execution-audit-persistence-writer.ts` owns request-to-insert payload
  mapping and no-op writer behavior.
- `lib/execution-audit-supabase-writer.ts` owns Supabase table names and
  guarded insert behavior.
- `lib/execution-persistence-flags.ts` owns safety flags and production guard
  decisions.

Supabase tables:

- `execution_lifecycle_events`
- `execution_agent_runs`
- `execution_agent_progress_events`

Tests:

- `tests/e2e/execution-sandbox.spec.ts` covers audit persistence contract
  fixtures, writer mapping, flag guards, route branching, route stubs, and UI
  diagnostics.

## 3. Existing Module Ownership

Already module-owned and should not be disrupted:

- `lib/execution-timeline.ts` owns timeline event types, labels,
  descriptions, local event readback, matching, and timeline construction.
- `lib/execution-event-log.ts` owns the newer typed local execution audit
  event log.
- `lib/execution-audit-persistence-contract.ts` owns audit persistence
  request/response contracts and validation.
- `lib/execution-audit-persistence-writer.ts` owns insert-payload mapping and
  no-op writer behavior.
- `lib/execution-audit-supabase-writer.ts` owns Supabase table names and
  guarded insert behavior.
- `lib/execution-audit-persistence-route-handler.ts` owns route-level
  persistence branching.
- `lib/execution-persistence-flags.ts` owns persistence safety flags.

The remaining inline `trade-management-events` writers in `app/trade-app.tsx`
are not a clean generic persistence boundary yet because each event builder is
domain-specific and tied to nearby execution, broker, risk, planning, and trade
mutation context.

## 4. Coupling Analysis

Execution handoff lifecycle:

- local event appends are coupled to payload generation, copied payloads,
  future agent readiness, handoff commands, hard-stop contracts, mapping
  previews, dry runs, and broker confirmation checkpoints.
- moving append behavior before the execution record/result boundary is clear
  risks splitting lifecycle semantics across too many modules.

Local event append behavior:

- all inline append helpers intentionally swallow errors and must never block
  trading UI.
- many helpers capture rich nearby context from payloads, recommendations,
  broker fill confirmations, exit confirmations, review reports, and
  risk-control evaluations.
- a generic append helper might reduce duplication later, but extracting it now
  would still leave many domain-specific builders inline and could obscure the
  id/timestamp/order contract.

Timeline construction:

- `buildExecutionTimeline(...)` depends on local events, execution metadata,
  and position/recommendation identity.
- persisted event shape, ordering, truncation, and matching fields affect
  timeline completeness and replay quality.

History/details audit display:

- closed trade details and live trade details consume timeline/replay/audit
  nodes built from local events.
- visible audit counts, first timeline descriptions, replay summaries, and
  warnings depend on stable event readback.

Diagnostics display:

- Settings/dev diagnostics include audit route stubs and messages that assert
  no localStorage write, execution record, audit event, trade update, History
  update, Statistics update, broker execution, or Avanza automation occurs in
  those UI tests.

Execution metadata/result/record boundaries:

- event persistence overlaps with execution payload ids, handoff session ids,
  broker preview metadata, broker fill capture, execution records, and future
  Supabase audit persistence.
- execution record/result creation should be reassessed before centralizing
  more audit writes.

Idempotency/audit trail risks:

- local trade management events currently prepend newest-first and truncate to
  200.
- the typed execution event log truncates to 1000 and has a different schema.
- merging or abstracting these stores now would create unnecessary
  compatibility and idempotency risk.

localStorage/Supabase boundaries:

- local trade management events are best-effort localStorage only.
- typed execution event log is module-owned localStorage.
- execution audit persistence routes can be stub/no-op/Supabase depending on
  flags.
- Supabase-backed audit persistence should stay behind its existing contract
  and flags.

## 5. Proposed Boundary Options

A. Leave execution audit/event stores module-owned.

- Recommended now.
- dedicated modules already own the typed event log and Supabase audit
  persistence contracts.
- inline `trade-management-events` builders remain behavior-rich and
  domain-coupled.
- extraction payoff is lower than the risk of changing audit ordering, shape,
  or matching.

B. Extract only constants/types if needed.

- mostly already done for `TRADE_MANAGEMENT_EVENTS_STORAGE_KEY`.
- `EXECUTION_EVENT_LOG_STORAGE_KEY` remains module-local to
  `lib/execution-event-log.ts`, which is appropriate because that whole store
  is already module-owned.
- no additional constants/types extraction is needed now.

C. Extract wrapper later after execution record boundary.

- possible later.
- a tiny `appendTradeManagementEvent(...)` helper could be considered after
  execution record/result boundaries are clearer.
- this should wait because it affects event ordering, truncation, error
  handling, timeline readback, and History audit displays.

D. Build Supabase-backed audit persistence later.

- possible later, but not now.
- the current Supabase audit writer is already flag-gated and should remain
  behind existing contracts until RLS/user ownership, execution record
  creation, idempotency, and production write policy are clearer.

## 6. What Should Not Move Yet

- append event behavior for `trade-management-events`.
- event object construction near execution, broker, planning, risk, and trade
  mutation flows.
- execution metadata writes.
- broker result persistence.
- execution record persistence.
- execution result creation.
- timeline derivation and matching.
- handoff replay, quality, and suggestion derivation.
- trade mutations.
- Supabase writes.
- route persistence branching.
- flag guard behavior.
- anything idempotency-critical.

## 7. Risk Assessment

Audit trail loss risk:

- high if append/read behavior changes, because local timeline events can be
  the only record of prepare/copy/checkpoint actions.

Duplicate event risk:

- medium/high. Current helpers do not perform cross-event dedupe. Moving them
  without a dedicated idempotency model could duplicate or drop events.

Ordering/timestamp risk:

- high. Legacy trade management events are prepended newest-first; changing
  ordering affects timeline display and replay summaries.

Idempotency risk:

- high. Future execution record/result boundaries need clear ids and
  idempotency before persistence gets broader.

Timeline regression risk:

- high. `buildExecutionTimeline(...)` matches on several ids and fingerprints;
  event shape drift can make audit trails appear partial or missing.

History display regression risk:

- medium/high. History/details audit panels depend on stable timeline and
  replay derivation.

Execution safety risk:

- high if audit movement is bundled with execution metadata, broker result,
  record, or trade mutation behavior.

## 8. Recommended Next Action

Recommended next action:

**Action 415 - Reassess Execution Record Creation Boundary**

Reason:

- execution audit/event log persistence should wait.
- the safest way to reduce future audit persistence risk is to clarify the
  execution record/result creation boundary first.
- once execution record ids, broker result capture, idempotency, and trade
  mutation ownership are clear, a later audit/event persistence wrapper can be
  judged with less ambiguity.

## 9. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes were made.

## Action 415 Follow-Up

Action 415 created
`docs/execution-record-creation-boundary-reassessment.md`.

Boundary outcome:

- Inventoried existing broker-result eligibility, broker-result preview,
  execution-record eligibility, local/dev `TureExecutionRecord` creation,
  local execution-record store, audit/event modules, and server capture stubs.
- Confirmed execution audit/event persistence should still wait.
- Confirmed a production-safe execution record creation boundary does not
  exist yet.
- Recommended a contract design before any new creation/write/mutation
  behavior.

Next recommended action:

**Action 416 - Create Execution Record Creation Contract Design**

## Action 416 Follow-Up

Action 416 created
`docs/execution-record-creation-contract-design.md`.

Audit boundary relationship:

- record creation contract design requires audit metadata and visible rejection
  readback.
- audit append and audit persistence remain separate boundaries.
- no execution audit/event log persistence movement was added.

Next recommended action:

**Action 417 - Create Execution Record Creation Contract Types**
