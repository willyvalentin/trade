# Execution Agent Checkpoint

Last updated: Action 202

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
- The mock order page has a stable agent-fill contract, Playwright-only fill runner, localhost dry-run fill-plan metadata, and a manual local mock-page agent runner script. The localhost bridge can run that mock-page runner only when explicitly requested with a localhost mock base URL; no production runtime agent fills it.

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
- `app/mock-broker/order/ticket.tsx`
- `tests/e2e/helpers/mock-order-fill-runner.ts`

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
- Dev-gated by `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- Local fake order ticket and review panel only
- Not Avanza and not connected to the bridge, broker automation, Supabase, History, Statistics, or trade-state mutation
- Stable selector contract in `lib/mock-order-page-agent-contract.ts`
- The contract maps an `AvanzaAgentRequest` to a structured `MockOrderPageFillPlan` and relative mock-page URL. It does not perform browser automation.
- A Playwright-only fill runner under `tests/e2e/helpers` can fill the dev-only mock page and click local review for test proof only. It is not available to app runtime code.
- The localhost bridge dry-run response can include `mockOrderFillPlan`, fill-plan validation status/errors, and `mockOrderPageUrl` as response-level metadata only.
- A manual local script can open localhost `/mock-broker/order`, apply a safe fill plan, click `Review mock order`, and verify final submit stays disabled.
- The localhost bridge can explicitly opt into that same local mock-page review flow with `enableMockAgentRun=true` and a localhost `mockPageBaseUrl`. This remains response-level metadata only and does not create broker results.

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
- Localhost `/run` can return mock order fill-plan metadata and a manual relative mock-page URL.
- Localhost `/run` can optionally run the local mock-page runner only when `enableMockAgentRun=true`.
- Ture handoff modal can explicitly POST a dev-only localhost cancel test to `/cancel`.
- A dev-only `/mock-broker/order` page exists for local fake order-ticket QA.
- The mock order page exposes stable `data-testid` and `data-agent-field` attributes for future local mock-page tooling.
- The mock order page is wired to the bridge only through the explicit local mock-agent run mode and cannot create broker results.
- No app runtime code opens, fills, reviews, or submits the mock page automatically.
- The only fill runner is Playwright/dev-test support under `tests/e2e`.
- The localhost bridge mock fill-plan metadata is not a broker result and does not create execution records.
- The manual mock-agent runner is not wired into the app runtime, Supabase, execution records, History, or Statistics.
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

- Run the Action 202 explicit localhost bridge mock-agent mode against a local dev server when evaluating the next mock-page automation step.

Alternative after browser-backed QA:

- External Bridge Echo Transport Prototype

Browser-backed Local Visual QA should happen before external bridge work. It validates the current sandbox and UI gating before any external bridge work begins.
