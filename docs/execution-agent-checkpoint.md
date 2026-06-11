# Execution Agent Checkpoint

Last updated: Action 232

## Current Status

The execution-agent work from Actions 149-183 is a local/dev sandbox. It is a typed foundation and diagnostics layer for a future Avanza execution agent.

Current safety boundaries:

- No Avanza automation exists.
- No browser is opened by default.
- No broker page is controlled.
- No broker order is prepared, submitted, simulated, or mocked as real.
- No trade state is mutated by the execution-agent sandbox.
- No Supabase persistence is used for execution-agent data yet.
- Bridge/runtime paths currently resolve to either the no-op bridge or the dev-only echo bridge. Both are diagnostics-only and neither can create broker effects.
- The mock order page has a stable agent-fill contract, Playwright-only fill runner, localhost dry-run fill-plan metadata, and a manual local mock-page agent runner script. The localhost bridge can run that mock-page runner only when explicitly requested with a localhost mock base URL, and the dev-only modal now has a separate manual button for that path. No production runtime agent fills it.
- The mock confirmation page has a stable local selector/URL/validation contract for future result parsing tests. It does not create `brokerResult` or `TureExecutionRecord`.
- The mock confirmation parser helper is Playwright/test-only and does not parse real broker pages.
- `DevMockBrokerExecutionResult` exists as a dev-only mock mapping type and remains separate from the real `BrokerExecutionResult`.
- Local `DevMockBrokerExecutionResult` diagnostics can be saved from the dev-only mock confirmation page and viewed/cleared in Settings under a separate `ture_dev_mock_broker_results_v1` key.
- A pure dev-only helper can preview-convert `DevMockBrokerExecutionResult` into an Avanza-shaped `BrokerExecutionResult` with mock metadata. It is not captured, persisted, or used to create `TureExecutionRecord`.
- Settings can explicitly capture one stored dev mock result into the existing local execution-record store for diagnostics. This creates a local `TureExecutionRecord` only, appends a local audit event, and does not write Supabase or mutate trades.
- Settings guards repeated local captures for the same dev mock result by checking existing local execution records. This duplicate guard is localStorage-only and is not broker or Supabase dedupe.
- A documentation-only Supabase persistence schema proposal now exists in `docs/execution-persistence-schema-proposal.md`. It defines candidate future tables, indexes, relationships, dev/mock separation, safety notes, API implications, and migration order without adding migrations or runtime writes.
- A documentation-only schema review now exists in `docs/execution-persistence-schema-review.md`. It identifies persistence risks, trust boundaries, schema clarifications, idempotency concerns, RLS/security requirements, and a go/no-go checklist before migrations.
- A typed/documented server capture API contract now exists in `lib/execution-server-capture-contract.ts` and `docs/execution-server-capture-api-contract.md`. It defines future request/response/idempotency shapes and validation expectations without adding a route, Supabase write, or runtime wiring.
- A dev-only server capture API route stub now exists at `POST /api/execution/capture`. It is server-gated by `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS`, validates contract-shaped requests, and returns accepted/rejected responses without Supabase writes, localStorage writes, execution records, trade mutation, History/Statistics updates, broker execution, or Avanza automation.
- A frontend-safe capture client and manual Settings tester now exist for the route stub. The `Dev Mock Broker Results` viewer can explicitly send a dev mock capture request to the stub and display the response/idempotency key without creating execution records, audit events, Supabase writes, trade mutations, or broker effects.
- Shared execution capture route fixtures now cover valid dev mock capture, missing intent, missing broker result, mismatched action/ticker/quantity, and production mock rejection. Contract validation now checks deterministic idempotency keys and broker result action/ticker/quantity consistency when those fields are present.
- A minimal Supabase migration draft now exists for append-only execution audit foundations: `execution_lifecycle_events`, `execution_agent_runs`, and `execution_agent_progress_events`. It is not applied, app code does not write to it, RLS remains a TODO because project ownership conventions are not finalized, and broker result/execution record tables remain out of scope.
- Typed audit persistence contracts and dev-gated route stubs now exist for the Action 219 draft audit tables. The lifecycle, agent-run, and progress-event endpoints validate payloads and return accepted/rejected/disabled responses without Supabase writes, local store writes, broker result persistence, trade mutation, or Avanza automation.
- A frontend-safe audit persistence client and manual Settings testers now exist for those three audit route stubs. The Settings `Execution Audit API Stubs` panel explicitly POSTs local_dev mock lifecycle/run/progress payloads and displays the stub responses without localStorage writes, audit event creation, Supabase writes, trade mutation, History/Statistics updates, broker execution, or Avanza automation.
- A documentation-only apply/rollback plan now exists for the Action 219 audit foundation migration in `docs/execution-audit-migration-apply-plan.md`. It defines preflight checks, staging-first apply steps, verification SQL, rollback SQL, risk notes, and go/no-go criteria. No Supabase migration has been applied.
- A pure server-side audit persistence writer draft now exists in `lib/execution-audit-persistence-writer.ts`. It maps validated audit persistence requests to insert-shaped payloads for the three draft tables and includes a no-op writer interface only. It does not import Supabase, call Supabase, or wire route persistence.
- A documentation-only readiness review now exists in `docs/execution-audit-apply-readiness-review.md`. It marks local/staging apply as ready only after explicit user approval and marks production apply as not recommended until RLS and `user_id` ownership are resolved.
- A server-only audit persistence flag design now exists in `docs/execution-audit-persistence-flag-design.md` and `lib/execution-persistence-flags.ts`. Future Supabase audit writes default off, require `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true`, and production also requires `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true`.
- Audit API routes now branch through the server-only persistence flag after validation. Flag-off behavior remains the existing accepted stub response. Flag-on local/staging uses the no-op writer and warns that no database write occurred. Production without the second allow flag is blocked. No Supabase import/write or real persistence was added.
- An injected-client Supabase audit writer implementation draft now exists in `lib/execution-audit-supabase-writer.ts`. It can map and insert audit rows when a server DB client is supplied and flags allow persistence, but routes remain on the no-op writer path by default. No real Supabase writes were added.
- Audit API route handler writer selection is now guarded by `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED`. Routes use the no-op writer unless both persistence and writer flags are enabled, the environment is allowed, and a server DB client is available. Default behavior remains no-op/no-write.
- Action 229 attempted to apply the audit foundation migration to the approved staging/dev target, but the workspace lacks a Supabase CLI, `psql`, linked Supabase project config, or admin SQL credential. The migration remains unapplied and route persistence flags remain off.
- A documentation-only Supabase migration tooling setup plan now exists in `docs/supabase-migration-tooling-setup-plan.md`. It explains the missing local/staging execution path, compares local Supabase, staging/dev Supabase, Supabase CLI, `psql`, and dashboard SQL editor options, and defines credential safety rules before retrying Action 229.
- Action 231A inspected the local Supabase tooling path. The repo has migrations but no Supabase CLI, no `psql`, no `supabase/config.toml`, and no package scripts for local Supabase. No tools were installed, no config was initialized, no local stack was started, and no migration was applied.
- A documentation-only Avanza UI research plan now exists in `docs/avanza-ui-research-plan.md`. It defines a manual mapping checklist, sanitized data-capture rules, safety boundaries, and mock-contract comparison steps before any future Avanza automation proposal. No Avanza automation, URLs, credentials, browser automation, scraping, or order submission was added.
- The mock-agent prototype milestone is documented in `docs/mock-agent-prototype-checkpoint.md`.
- The mock execution end-to-end checkpoint is documented in `docs/mock-execution-e2e-checkpoint.md`.

## Product Direction

Ture supports two execution modes:

- `semi_automatic` is the default.
- `automatic` is advanced, gated, and not enabled by default.

Semi-automatic direction:

- Ture may detect entry or exit conditions.
- Ture may build an execution intent and handoff package.
- A future agent may carry the order details to Avanza and fill the order form.
- The user must manually press final KOP/SALJ.

Automatic direction:

- The same pipeline can be used.
- A future agent may submit final KOP/SALJ only when the mode is explicitly enabled and safety checks pass.
- No real automatic execution exists today.

The execution layer applies to both buy entries and sell exits. Exits have higher priority than entries, and stop-loss exits have the highest priority.

## Architecture Overview

```text
Live position / recommendation
  -> ExecutionIntent
  -> Candidate picker
  -> AvanzaExecutionHandoff
  -> AvanzaAgentRequest
  -> BridgeEnvelope
  -> BridgeFactory
  -> Bridge-backed runner
  -> Progress events
  -> AvanzaAgentResult
  -> Broker result capture
  -> TureExecutionRecord
```

Today, the bridge factory and bridge-backed runner stop at diagnostics-only behavior. The no-op bridge reports unavailable, and the echo bridge can exercise request/progress/result plumbing locally. Neither opens Avanza or creates broker-side effects.

## Actions Completed

- Action 149: Added execution foundations: modes, actions, trigger priorities, authority, intents, broker result types, validation, and defaults.
- Action 150: Added live-position exit monitor and sell intent builder for target/stop exits.
- Action 151: Added execution candidate picker with validation, invalid candidate reporting, and priority sorting.
- Action 152: Added Avanza handoff payload v2 and safety checks.
- Action 153: Added broker execution result capture and normalized `TureExecutionRecord`.
- Action 154: Added execution lifecycle state machine and transitions.
- Action 155: Added execution orchestrator tying live exits, candidate picking, handoff creation, and lifecycle snapshots together.
- Action 156: Added execution UI status adapters and display labels.
- Action 157: Surfaced read-only execution status on Live Day Trade cards.
- Action 158: Added read-only execution handoff preview modal.
- Action 159: Added execution mode settings with semi-automatic default and automatic feature gate.
- Action 160: Added safe "Prepare in Avanza" UI/lifecycle stub.
- Action 161: Added local execution audit event persistence.
- Action 162: Added Settings execution event log viewer.
- Action 163: Added dev-only broker result capture stub UI.
- Action 164: Added local execution records store and Settings viewer.
- Action 165: Added Avanza agent adapter request/result/progress contract.
- Action 166: Surfaced future agent request preview in the modal.
- Action 167: Added dev-only agent progress event stub and audit logging.
- Action 168: Added Agent Adapter Diagnostics viewer.
- Action 169: Added Avanza agent runner interface and no-op runner.
- Action 170: Wired modal prepare button to the no-op runner.
- Action 171: Added local Avanza agent run store and Settings viewer.
- Action 172: Added execution dev-tools feature gate.
- Action 173: Added external Avanza agent bridge contract and no-op bridge.
- Action 174: Added Avanza Agent Bridge health/capabilities diagnostics in Settings.
- Action 175: Added bridge-backed runner adapter.
- Action 176: Updated modal prepare flow to use bridge-backed no-op runner.
- Action 177: Added bridge request envelope preview in the modal.
- Action 178: Added Execution Sandbox QA panel in the modal.
- Action 179: Added dev-gated manual Execution Sandbox Smoke Test checklist in Settings.
- Action 180: Added dev-gated Avanza Agent Bridge Configuration. Only `none` is selectable.
- Action 181: Added Avanza Agent Bridge Factory. Every transport resolves to no-op.
- Action 182: Wired modal prepare flow and Settings health diagnostics through the bridge factory.
- Action 183: Surfaced bridge config/factory status in modal QA and Settings smoke checklist areas.
- Action 184: Added this execution-agent checkpoint document.
- Action 185: Added local QA notes and smoke-test results in `docs/execution-agent-qa-notes.md`.
- Action 186: Added Playwright-based local browser QA setup and smoke tests.
- Action 187: Ran browser-backed execution sandbox QA, expanded Playwright coverage, and documented results.
- Action 188: Added a dev-only local execution sandbox fixture and Playwright modal/no-op runner coverage.
- Action 189: Added a dev-only echo bridge prototype, Settings selection/health diagnostics, modal prepare-path coverage, and Playwright echo-flow verification.
- Action 190: Added the Avanza agent bridge transport decision document and recommended local process + localhost bridge first.
- Action 191: Added the typed localhost bridge server stub contract and contract documentation.
- Action 192: Added a manually started localhost bridge server no-op/echo stub and smoke script.
- Action 193: Added a frontend-safe localhost bridge health client and dev-gated Settings health check integration.
- Action 194: Added a frontend-safe localhost bridge dry-run client and a dev-only manual modal button for echo `/run`.
- Action 195: Added a frontend-safe localhost bridge cancel client and dev-only manual modal cancel test.
- Action 196: Added a dev-only `/mock-broker/order` page for local mock order-ticket QA.
- Action 198: Added the mock order page agent-fill contract, stable selectors, fill-plan builder, validation helper, safe URL builder, Playwright selector coverage, and docs.
- Action 199: Added a Playwright-only mock order page fill runner stub that applies a fill plan, opens local review, and verifies disabled submit without adding app runtime automation.
- Action 200: Extended the localhost bridge dry-run `/run` response with mock order fill-plan metadata and a manual relative mock page URL. The stub still does not open or fill any browser page.
- Action 201: Added a manually-run local mock order page agent runner script that opens only localhost `/mock-broker/order`, fills the mock form, clicks local review, and verifies disabled submit.
- Action 202: Added an explicit localhost bridge mock-agent run mode for `/run`. Default runs still do not open a browser; `enableMockAgentRun=true` can drive only localhost `/mock-broker/order` review and reports response-level mock-agent run metadata without `brokerResult`.
- Action 203: Added a dev-only `Run localhost mock agent` button to the Execution Handoff Preview Modal. It calls localhost `/run` with `enableMockAgentRun=true`, displays `mockAgentRun...` metadata, appends a local audit event, and stores local diagnostics without creating broker results or execution records.
- Action 204: Added the mock-agent prototype checkpoint document for Actions 196-203, including milestone summary, safety boundaries, run commands, QA status, next-phase plan, and recommended Action 205.
- Action 205: Added a dev-only mock broker confirmation page and pure mock confirmation contract with stable selectors, safe query parsing, URL building, and validation. No broker result, execution record, Supabase write, or trade mutation was added.
- Action 206: Added a Playwright-only mock confirmation parser helper that reads stable mock confirmation selectors and returns a typed parse result. E2E now covers filled, rejected, and cancelled parsing without creating `BrokerExecutionResult`.
- Action 207: Added `DevMockBrokerExecutionResult` and pure dev-only mapping/validation helpers for mock confirmation payloads and parse results. E2E covers filled, rejected, and cancelled mapping without creating real `BrokerExecutionResult` or `TureExecutionRecord`.
- Action 208: Added a dev-only local `DevMockBrokerExecutionResult` store, explicit mock confirmation save control, and Settings diagnostics viewer. E2E covers save/view/clear while keeping mock results separate from real broker results and execution records.
- Action 209: Added a pure dev-only `DevMockBrokerExecutionResult` to `BrokerExecutionResult` preview converter plus a non-persistent Settings preview. E2E covers filled, rejected, and cancelled conversion without creating `TureExecutionRecord`.
- Action 210: Added an explicit dev-only Settings action to convert a stored dev mock result, build a matching local execution intent, call `buildTureExecutionRecord`, append the resulting record to the local execution-record store, and append a local audit event. E2E covers save -> capture -> Execution Records diagnostics without Supabase or trade mutation.
- Action 211: Added `docs/mock-execution-e2e-checkpoint.md`, a documentation-only checkpoint for the completed Actions 196-210 dev mock execution pipeline and recommended next phases.
- Action 212: Added local-only duplicate protection for dev mock captures. Settings now detects matching local execution records, disables repeated capture for the same mock result, and documents that this is localStorage-only diagnostics dedupe.
- Action 213: Added `docs/execution-persistence-schema-proposal.md`, a documentation-only Supabase persistence schema proposal for future execution-agent events, intents, runs, broker results, execution records, idempotency, dev/mock separation, API implications, and migration order. No migration or runtime persistence was added.
- Action 214: Added `docs/execution-persistence-schema-review.md`, a documentation-only review/risk note for the persistence proposal. It defines trust boundaries, major risks, schema clarifications, idempotency review, RLS/security notes, a migration go/no-go checklist, and recommends Action 215 - Execution Server Capture API Contract before migrations.
- Action 215: Added `lib/execution-server-capture-contract.ts` and `docs/execution-server-capture-api-contract.md`, a typed/documented contract for future server-side execution capture. It defines request/response shapes, source/environment types, idempotency helper, request builder, validation helper, trust boundaries, and recommends a dev-only no-Supabase route stub next. No route, migration, Supabase write, or runtime behavior was added.
- Action 216: Added a dev-gated `POST /api/execution/capture` route stub that validates `ExecutionServerCaptureRequest` bodies and returns contract-shaped responses. Valid requests are accepted by the stub only; invalid or malformed requests are rejected; dev-tools-disabled builds return 403. No Supabase write, execution record, local store write, trade mutation, History/Statistics update, broker execution, or Avanza automation was added.
- Action 217: Added `lib/execution-server-capture-client.ts` and a dev-only `Test server capture stub` button in the Settings `Dev Mock Broker Results` viewer. The button converts a stored dev mock result, builds a dev mock capture request, POSTs to `/api/execution/capture`, and displays the stub response/idempotency key without creating execution records, audit events, Supabase writes, trade mutation, History/Statistics updates, broker execution, or Avanza automation.
- Action 218: Added shared execution server capture fixtures and hardened contract/route validation coverage. Validation now checks broker result action/ticker/quantity consistency when present, deterministic idempotency key matching, and production mock/dev rejection. E2E covers valid, missing intent, missing broker result, mismatched, production mock, malformed JSON, and dev-tools-disabled route behavior without persistence.
- Action 219: Added `supabase/migrations/20260610000000_execution_audit_foundation.sql`, a draft-only Supabase migration for `execution_lifecycle_events`, `execution_agent_runs`, and `execution_agent_progress_events`. It includes indexes, low-risk check constraints, comments, and RLS TODO notes matching current project migration style. No app writes, route persistence, broker result tables, execution record tables, Supabase writes, or trade mutation were added.
- Action 220: Added `lib/execution-audit-persistence-contract.ts` plus dev-gated POST stubs for `/api/execution/audit/lifecycle-events`, `/api/execution/audit/agent-runs`, and `/api/execution/audit/agent-progress-events`. The stubs validate request contracts and return 202/400/403 responses only. No migration was applied, and no Supabase write, local store write, broker result persistence, trade mutation, History/Statistics update, broker execution, or Avanza automation was added.
- Action 221: Added `lib/execution-audit-persistence-client.ts` and a dev-only Settings `Execution Audit API Stubs` panel. The panel manually tests lifecycle event, agent run, and agent progress route stubs from the UI and displays HTTP/status/message/errors without localStorage writes, audit event creation, Supabase writes, trade mutation, History/Statistics updates, broker execution, or Avanza automation.
- Action 222: Added `docs/execution-audit-migration-apply-plan.md`, a documentation-only apply/rollback plan for the Action 219 audit foundation migration. It includes scope, preflight checklist, apply steps, verification SQL, rollback SQL, post-apply checks, risk notes, and go/no-go criteria. No Supabase command was run and no app behavior changed.
- Action 223: Added `lib/execution-audit-persistence-writer.ts`, a pure mapping/writer draft for the Action 219 tables. It validates audit persistence requests, maps them into insert-shaped payloads, redacts sensitive metadata keys, keeps non-UUID external run ids in metadata, and exposes a no-op writer interface that never persists. Routes remain stub-only and no Supabase import/write was added.
- Action 224: Added `docs/execution-audit-apply-readiness-review.md`, a documentation-only local/staging readiness review. It checks migration SQL, route stubs, client testers, writer mappings, rollback coverage, dev/mock separation, excluded tables, and production blockers. It recommends local/staging apply only after explicit user approval and does not recommend production apply yet.
- Action 225B: Added `lib/execution-persistence-flags.ts` and `docs/execution-audit-persistence-flag-design.md`. The helper defaults audit Supabase persistence off, normalizes persistence environment, blocks production without a second explicit flag, and returns non-throwing errors/warnings for future route wiring. No route persistence, Supabase import/write, migration apply, or app behavior change was added.
- Action 226: Added `lib/execution-audit-persistence-route-handler.ts` and wired the three audit API route success paths through the persistence flag branch. With the flag off, routes keep accepted stub behavior. With the flag on for local/staging, routes return an accepted no-op writer warning and no database write. Production without `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true` is blocked. No Supabase import/write, migration apply, trade mutation, or History/Statistics update was added.
- Action 227: Added `lib/execution-audit-supabase-writer.ts`, an injected-client Supabase writer draft for the three audit tables. It checks persistence flags, maps requests to insert payloads, fails safely when disabled/not allowed/missing client, and returns persisted/id/table/errors metadata. Tests use fake DB clients only. Routes remain no-op by default and no migration/Supabase write was run.
- Action 228: Added `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED` to the server-side flag helper and wired audit route handler writer selection. Persistence-enabled routes still use no-op writer unless the writer flag is also true. When the writer flag is true, the handler can call the injected-client Supabase writer through a lazy server DB provider; missing client fails safely. Tests use fake DB clients only, and default route behavior remains no-op/no-write.
- Action 229 attempt: Confirmed the requested target was staging/dev, inspected the intended migration, and checked local Supabase tooling/config. Apply was blocked because no Supabase CLI, `psql`, linked project config, service-role key, database URL, or admin SQL execution credential is available. No migration was applied, no verification SQL was run, and no Supabase writes occurred.
- Action 230: Added `docs/supabase-migration-tooling-setup-plan.md`, a documentation-only plan for establishing a safe local or staging/dev Supabase migration execution path before retrying Action 229. No tools were installed, no credentials were added, no migration was applied, and no database state changed.
- Action 231A: Inspected the local Supabase tooling path and documented that local migration apply remains blocked until the Supabase CLI or another local SQL runner is installed and `supabase/config.toml` is intentionally initialized. No remote connection, tool install, config init, migration apply, or database change occurred.
- Action 232: Added `docs/avanza-ui-research-plan.md`, a documentation-only manual research and mapping checklist for future Avanza order-flow study. It requires semi-automatic/manual inspection only, prohibits final submit and automation, defines sanitized capture rules, and recommends an Avanza UI research notes template next.

## Key Files

Execution foundation:

- `lib/execution.ts`

Exit monitor:

- `lib/live-position-exit-monitor.ts`

Candidate picker:

- `lib/execution-candidate-picker.ts`

Handoff:

- `lib/avanza-execution-handoff.ts`

Broker capture:

- `lib/broker-execution-capture.ts`

Lifecycle:

- `lib/execution-state-machine.ts`

Orchestrator:

- `lib/execution-orchestrator.ts`

UI status:

- `lib/execution-ui-status.ts`

Execution server capture contract:

- `lib/execution-server-capture-contract.ts`
- `lib/execution-server-capture-client.ts`
- `app/api/execution/capture/route.ts`
- `docs/execution-server-capture-api-contract.md`
- `tests/e2e/helpers/execution-server-capture-fixtures.ts`

Execution persistence draft:

- `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- `docs/execution-audit-migration-apply-plan.md`
- `docs/execution-audit-apply-readiness-review.md`
- `docs/execution-audit-persistence-flag-design.md`
- `docs/supabase-migration-tooling-setup-plan.md`

Avanza UI research:

- `docs/avanza-ui-research-plan.md`

Execution audit persistence contract:

- `lib/execution-audit-persistence-contract.ts`
- `lib/execution-audit-persistence-client.ts`
- `lib/execution-audit-persistence-writer.ts`
- `lib/execution-audit-supabase-writer.ts`
- `lib/execution-audit-persistence-route-handler.ts`
- `lib/execution-persistence-flags.ts`
- `app/api/execution/audit/lifecycle-events/route.ts`
- `app/api/execution/audit/agent-runs/route.ts`
- `app/api/execution/audit/agent-progress-events/route.ts`

Event log:

- `lib/execution-event-log.ts`

Record store:

- `lib/execution-record-store.ts`

Agent adapter:

- `lib/avanza-agent-adapter.ts`

Runner:

- `lib/avanza-agent-runner.ts`
- `lib/avanza-agent-run-store.ts`

Bridge:

- `lib/avanza-agent-bridge.ts`
- `lib/avanza-agent-bridge-runner.ts`

Bridge config/factory:

- `lib/avanza-agent-bridge-config.ts`
- `lib/avanza-agent-bridge-factory.ts`

Localhost bridge contract:

- `lib/avanza-localhost-bridge-contract.ts`
- `docs/avanza-localhost-bridge-contract.md`

Mock-agent prototype checkpoint:

- `docs/mock-agent-prototype-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-persistence-schema-proposal.md`
- `docs/execution-persistence-schema-review.md`
- `docs/execution-server-capture-api-contract.md`
- `lib/execution-server-capture-contract.ts`

Localhost bridge stub:

- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`

Local mock page agent runner:

- `scripts/mock-order-page-agent-runner.mjs`
- `npm run mock-agent:run`
- `npm run mock-agent:run:headed`

Localhost bridge client:

- `lib/avanza-localhost-bridge-client.ts`

Mock order page contract:

- `lib/mock-order-page-agent-contract.ts`
- `lib/mock-order-confirmation-contract.ts`
- `lib/mock-broker-execution-result.ts`
- `app/mock-broker/order/ticket.tsx`
- `app/mock-broker/confirmation/page.tsx`
- `app/mock-broker/confirmation/confirmation.tsx`
- `tests/e2e/helpers/mock-order-fill-runner.ts`
- `tests/e2e/helpers/mock-confirmation-parser.ts`

Settings diagnostics:

- `app/settings/page.tsx`

Trade app modal/UI:

- `app/trade-app.tsx`

Local browser QA:

- `playwright.config.ts`
- `tests/e2e/execution-sandbox.spec.ts`

Dev-only fixture:

- `Execution Sandbox Fixture` panel in `app/trade-app.tsx`

## Feature Flags

`NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`

- Enables local execution sandbox diagnostics and dev-only modal tools.
- Should be enabled locally only.
- Should be off for production-like builds until the sandbox is intentionally exposed.

`NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=true`

- Unlocks the automatic mode option.
- Should remain off unless explicitly testing automatic-mode authority.
- Does not create real broker execution by itself.

## Local Storage Keys

Execution-agent keys:

- `ture_execution_event_log_v1`
- `ture_execution_records_v1`
- `ture_avanza_agent_runs_v1`
- `ture_dev_mock_broker_results_v1`
- `ture_execution_sandbox_smoke_checklist_v1`
- `ture_avanza_agent_bridge_config_v1`
- `ture_execution_mode`

These keys are local browser diagnostics/preferences only. They are not broker confirmations and are not Supabase execution persistence.

## Diagnostics Available

Settings:

- Execution Event Log
- Execution Records
- Agent Adapter Diagnostics
- Avanza Agent Runs
- Avanza Agent Bridge
- Avanza Agent Bridge Configuration
- Execution Sandbox Smoke Test

Execution handoff modal:

- Intent and handoff summary
- Safety checks and authority
- Future Avanza agent request preview
- Bridge request envelope preview
- Execution Sandbox QA panel
- Agent progress stub
- Bridge-backed diagnostics prepare runner result
- Dev broker result capture stub

Live Day Trades dev fixture:

- Stop-loss reached fixture
- Target reached fixture
- View handoff modal path
- Bridge-backed diagnostics prepare runner path
- Hidden unless `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`

Mock broker order page:

- `/mock-broker/order`
- `/mock-broker/confirmation`
- Dev-gated by `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- Local fake order ticket, review panel, and mock confirmation preview only
- Not Avanza and not connected to the bridge, broker automation, Supabase, History, Statistics, or trade-state mutation
- Stable selector contract in `lib/mock-order-page-agent-contract.ts`
- Stable mock confirmation selector contract in `lib/mock-order-confirmation-contract.ts`
- The contract maps an `AvanzaAgentRequest` to a structured `MockOrderPageFillPlan` and relative mock-page URL. It does not perform browser automation.
- The mock confirmation contract validates local query-param payloads and builds safe relative `/mock-broker/confirmation` URLs. It does not map to `BrokerExecutionResult`.
- The dev mock broker execution result helper maps mock confirmation payloads into `DevMockBrokerExecutionResult` only. It does not create or export real broker results.
- The dev mock broker result store keeps `DevMockBrokerExecutionResult` diagnostics under `ture_dev_mock_broker_results_v1`; Settings can view and clear only this key.
- The dev mock to broker-result converter can build an Avanza-shaped `BrokerExecutionResult` preview with explicit `DEV MOCK CONVERSION` text. It does not call `buildTureExecutionRecord`, write storage, or mutate trades.
- The dev mock capture button is the only current path that calls `buildTureExecutionRecord` from mock data. It appends only to local execution records and labels the record `DEV MOCK CAPTURE`.
- The dev mock capture duplicate guard checks local execution records only; it does not remove records, upsert Supabase, or dedupe broker orders.
- A Playwright-only fill runner under `tests/e2e/helpers` can fill the dev-only mock page and click local review for test proof only. It is not available to app runtime code.
- A Playwright-only parser helper under `tests/e2e/helpers` can read the dev-only mock confirmation page and return a typed parse result. It is not available to app runtime code and does not create `BrokerExecutionResult`.
- The localhost bridge dry-run response can include `mockOrderFillPlan`, fill-plan validation status/errors, and `mockOrderPageUrl` as response-level metadata only.
- A manual local script can open localhost `/mock-broker/order`, apply a safe fill plan, click `Review mock order`, and verify final submit stays disabled.
- The localhost bridge can explicitly opt into that same local mock-page review flow with `enableMockAgentRun=true` and a localhost `mockPageBaseUrl`. This remains response-level metadata only and does not create broker results.
- The Execution Handoff Preview Modal exposes this explicit path through a separate dev-only `Run localhost mock agent` button.

## Current Safe User-Visible Flow

1. A real, non-demo Live Day Trade reaches target or stop loss.
2. The Live Day Trade card shows execution status.
3. The user can open "View handoff".
4. The modal shows the selected intent, handoff, safety checks, authority, future agent request, bridge envelope, and QA panel.
5. With execution dev tools enabled, "Prepare in Avanza" runs a bridge-backed diagnostics runner only.
6. The selected diagnostics bridge may emit local progress diagnostics and a broker-result-free result.
7. No Avanza page opens.
8. No broker order is prepared or submitted.
9. No trade is closed or opened.
10. No Supabase execution data is written.

## Current Limitations

- No real Avanza integration.
- No default browser automation.
- No external bridge transport.
- The only selectable local bridge transports are `none` and dev-only `echo`.
- No WebSocket, native messaging, browser extension, or real local process automation bridge.
- A manually started localhost HTTP no-op/echo stub exists for development diagnostics only.
- Ture Settings can explicitly health-check the localhost stub when execution dev tools are enabled.
- Ture handoff modal can explicitly POST a dev-only localhost dry-run echo to `/run`.
- Ture handoff modal can explicitly POST a dev-only localhost mock-agent run to `/run` with `enableMockAgentRun=true`.
- Localhost `/run` can return mock order fill-plan metadata and a manual relative mock-page URL.
- Localhost `/run` can optionally run the local mock-page runner only when `enableMockAgentRun=true`.
- Ture handoff modal can explicitly POST a dev-only localhost cancel test to `/cancel`.
- A dev-only `/mock-broker/order` page exists for local fake order-ticket QA.
- A dev-only `/mock-broker/confirmation` page exists for local fake result-page QA.
- The mock order page exposes stable `data-testid` and `data-agent-field` attributes for future local mock-page tooling.
- The mock confirmation page exposes stable `data-testid` and `data-agent-field` attributes for future local parsing tooling.
- The mock confirmation parser is Playwright/test-only and uses those stable selectors.
- `DevMockBrokerExecutionResult` is mock/dev-only and must not be used as a real broker confirmation.
- The Settings `Dev Mock Broker Results` viewer is dev-gated and separate from History, Statistics, local execution records, and agent runs.
- The Settings `BrokerExecutionResult preview` is non-persistent. The adjacent `Capture mock result locally` button is manual, dev-gated, and local only.
- Local mock capture records must remain separate from Supabase, live trade state, History, and Statistics.
- Duplicate protection for mock captures is localStorage-only and must not be treated as real broker order protection.
- The mock order page is wired to the bridge only through the explicit local mock-agent run mode and cannot create broker results.
- No app runtime code opens, fills, reviews, or submits the mock page automatically.
- The only fill/parser runners are Playwright/dev-test support under `tests/e2e`.
- The localhost bridge mock fill-plan metadata is not a broker result and does not create execution records.
- The manual mock-agent runner is wired into the dev-only modal only through the localhost bridge explicit run path; it is not wired into production app runtime, Supabase, execution records, History, or Statistics.
- The bridge mock-agent run mode must use localhost only and must not run for normal `/run` calls.
- Localhost `/run` is not part of production execution flow and does not create broker records.
- Localhost `/cancel` does not cancel real broker actions, orders, trades, or runner state.
- No Supabase execution persistence.
- No real broker confirmations.
- No History/Statistics integration from local execution records.
- Browser-backed Settings QA now passes with execution dev tools enabled and disabled. See `docs/execution-agent-qa-notes.md`.
- Dev-only fixture-backed modal/diagnostics runner QA now passes.
- Real-data modal/card click-through QA still requires a real/non-demo Live Day Trade at target or stop.
- Recommendation entry-side auto-pick may still be future work if only live-position exits are wired in the UI.
- Automatic mode remains a gated authority model only; it does not execute orders.

## Recommended Next Phase

### Phase A - Local QA / Stabilization

- Run the manual Execution Sandbox Smoke Test checklist.
- Visually inspect Live Day Trade card status, handoff modal, Settings diagnostics, and dev-tools gating.
- Clean rough UI spacing or copy.
- Confirm dev tools are hidden when `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS` is off.
- Confirm automatic mode remains gated unless explicitly enabled.

### Phase B - Production-Safe Cleanup

- Keep execution dev tools disabled for production-like builds.
- Keep automatic execution disabled.
- Review all local-only diagnostics copy so no user can mistake no-op records for broker confirmations.
- Consider whether local stores need export/clear affordances before wider testing.

### Phase C - External Bridge Prototype

- Use the documented local process + localhost bridge direction.
- Add focused diagnostics for localhost bridge dry-run/cancel audit events and agent-run records.
- Keep the explicit local mock-agent run mode separate from app runtime and any real broker automation.
- Only later investigate Avanza UI automation.
- Keep a hard stop before any real final KOP/SALJ action.

### Phase D - Persistence / Integration

- Design Supabase schema for execution events, agent runs, and execution records.
- Add server-side ingestion paths for trusted execution records.
- Link verified execution records into History and Statistics.
- Define how real broker result capture is authenticated and reconciled.

## Recommended Next Action

Recommended:

- Action 231A follow-up - Install/Use Supabase CLI Locally and Initialize Config.

Alternative:

- Action 231B - Configure Staging Supabase Link.

After one tooling path exists, retry Action 229 - Apply Audit Migration Locally/Staging and Verify. Production remains no-go until RLS and `user_id` ownership are resolved.
