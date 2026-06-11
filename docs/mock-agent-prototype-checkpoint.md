# Mock Agent Prototype Checkpoint

Date: 2026-06-10

## Current Milestone Summary

Actions 196-210 completed the first local mock-agent prototype path plus the
first mock confirmation contract, Playwright-only parser, and dev-only mock
broker result mapper/viewer/preview bridge/local capture test:

```text
Ture execution handoff
  -> future AvanzaAgentRequest
  -> bridge request envelope
  -> localhost bridge /run
  -> mock order fill plan
  -> local mock page runner
  -> Review mock order only
  -> disabled-submit verification
  -> optional mock confirmation page preview
  -> Playwright-only mock confirmation parser
  -> DevMockBrokerExecutionResult mapper
  -> local dev mock broker result store
  -> Settings diagnostics viewer
  -> dev-only BrokerExecutionResult preview conversion
  -> dev-only local TureExecutionRecord capture test
  -> local diagnostics, audit event, and agent-run record
```

This is a local/dev milestone only. It proves the shape of the future agent handoff and selector/fill contract without touching Avanza, a real broker page, Supabase, or real trade state.

For the full Actions 196-210 end-to-end mock execution checkpoint, see
`docs/mock-execution-e2e-checkpoint.md`.

## What Is Now Proven

- Ture can generate a structured `AvanzaAgentRequest` from an execution handoff.
- Ture can wrap that request in a bridge envelope for a future external/local agent.
- The localhost bridge can receive and validate dry-run `/run` requests.
- The bridge can generate a `MockOrderPageFillPlan` and relative mock page URL from the request.
- The dev-only mock order page exposes stable `data-testid` and `data-agent-field` selectors.
- The Playwright/test helper can fill the mock page, click only `Review mock order`, and verify final submit remains disabled.
- The manual local mock-agent runner can open localhost `/mock-broker/order`, fill the mock page, click only review, and verify disabled submit.
- The localhost bridge can optionally run that local mock-page runner only when `enableMockAgentRun=true`.
- The Execution Handoff Preview Modal can manually trigger the localhost mock-agent path through the dev-only `Run localhost mock agent` button.
- The dev-only mock confirmation page can render filled, submitted, partially filled, rejected, cancelled, and unknown mock states from safe query params.
- The mock confirmation page has a pure selector/URL/validation contract for future local parsing tests.
- The Playwright-only mock confirmation parser can read the mock confirmation page through stable selectors and return a typed parse result.
- The dev-only mock broker result mapper can convert mock confirmation payloads or parse results into a clearly named `DevMockBrokerExecutionResult`.
- The mock confirmation page can explicitly save a validated dev mock result to a separate local diagnostics key.
- Settings can display and clear local `DevMockBrokerExecutionResult` diagnostics without touching execution records.
- A pure dev-only conversion helper can preview a `DevMockBrokerExecutionResult` as an Avanza-shaped `BrokerExecutionResult` with explicit mock metadata.
- Settings can display that conversion preview without saving it or creating a capture record.
- Settings can explicitly create a local `TureExecutionRecord` from dev mock data to test the existing capture pipeline.
- The capture test appends only to the existing local execution-record store and writes only a local audit event.
- Settings blocks repeated local capture for the same dev mock result by checking local execution records.
- Local diagnostics, audit events, and agent-run storage work for the mock-agent path.
- Real broker persistence, Supabase writes, trade mutation, History updates, and Statistics updates remain absent throughout this milestone.

## Files And Components

Mock broker page:

- `app/mock-broker/order/page.tsx`
- `app/mock-broker/order/ticket.tsx`
- `app/mock-broker/confirmation/page.tsx`
- `app/mock-broker/confirmation/confirmation.tsx`
- `app/mock-broker/confirmation/save-dev-mock-result-button.tsx`

Mock order and confirmation contracts:

- `lib/mock-order-page-agent-contract.ts`
- `lib/mock-order-confirmation-contract.ts`
- `lib/mock-broker-execution-result.ts`
- `lib/dev-mock-broker-result-store.ts`
- `lib/dev-mock-to-broker-execution-result.ts`

Localhost bridge server:

- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `docs/avanza-localhost-bridge-contract.md`

Localhost bridge client:

- `lib/avanza-localhost-bridge-client.ts`
- `lib/avanza-localhost-bridge-contract.ts`

Mock agent runner:

- `scripts/mock-order-page-agent-runner.mjs`
- `tests/e2e/helpers/mock-order-fill-runner.ts`
- `tests/e2e/helpers/mock-confirmation-parser.ts`

Modal UI:

- `app/trade-app.tsx`
- `app/settings/page.tsx`
- `lib/execution-event-log.ts`
- `lib/avanza-agent-run-store.ts`

Tests/e2e:

- `tests/e2e/execution-sandbox.spec.ts`
- `playwright.config.ts`

Docs:

- `docs/mock-execution-e2e-checkpoint.md`
- `docs/mock-agent-prototype-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`
- `docs/avanza-localhost-bridge-contract.md`

## Safety Boundaries

- Not Avanza.
- No Avanza URLs, branding, selectors, or credentials.
- No broker credentials accepted or stored.
- No real browser broker page is opened or automated.
- No submit click on the mock page or any broker page.
- No broker confirmation is created.
- Mock confirmation UI is a local preview page only and is not a real broker confirmation.
- Mock confirmation parsing is Playwright/test-only.
- `DevMockBrokerExecutionResult` is dev/mock-only and is not the real `BrokerExecutionResult`.
- `DevMockBrokerExecutionResult` can be preview-converted to a `BrokerExecutionResult` shape only through `lib/dev-mock-to-broker-execution-result.ts`.
- Converted previews are marked with `DEV MOCK CONVERSION - not a real Avanza confirmation.`
- Stored dev mock results live under `ture_dev_mock_broker_results_v1`, separate from real execution records and agent run stores.
- Local `TureExecutionRecord` creation is allowed only through the explicit dev-only Settings capture test.
- Captured mock records are local diagnostics only and not real broker confirmations.
- Duplicate protection is localStorage-only and is not broker order dedupe or Supabase dedupe.
- No `brokerResult` is persisted to Supabase or used to mutate trades.
- No real trade state is mutated.
- No Supabase writes are performed.
- Execution dev tools gate the UI path.
- Mock-agent browser execution is localhost-only.
- The bridge default `/run` path remains metadata-only and does not open a browser.
- The bridge mock-agent path runs only when `enableMockAgentRun=true`.

## How To Run Locally

Start the app with execution dev tools enabled:

```bash
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false npm run dev
```

Start the localhost bridge stub in another terminal:

```bash
npm run bridge:localhost
```

Run the manual mock-agent runner against the local app:

```bash
npm run mock-agent:run
```

Run the bridge smoke test:

```bash
npm run bridge:localhost:smoke
```

Run the Playwright e2e suite:

```bash
npm run test:e2e
```

Run the dev-tools-disabled e2e safety pass:

```bash
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

## QA Status

Latest recorded Action 212 status:

- TypeScript passed.
- Lint passed.
- `git diff --check` passed.
- Localhost bridge smoke passed.
- Dev-tools-enabled e2e passed.
- Dev-tools-disabled e2e passed.
- E2E covers the mock confirmation page, stable confirmation selectors, disabled-dev-tools behavior, manual order review link to the mock confirmation page, Playwright-only parsing of filled/rejected/cancelled mock states, dev-only mock result mapping for filled/rejected/cancelled outcomes, dev-only conversion previews for filled/rejected/cancelled outcomes, local save of a dev mock result, Settings viewer display, BrokerExecutionResult preview copy, explicit local mock capture, duplicate capture blocking, Execution Records diagnostics display, and scoped clear of the dev mock result key.

Known caveat:

- In restricted/sandboxed environments, localhost server binding for Playwright or the bridge smoke may require explicit permission. This is an environment restriction, not a product runtime requirement.

## Recommended Next Phase

Phase 1 - Polish and harden the mock-agent loop:

- Add more mock-agent run viewer details if local diagnostics need richer inspection.
- Add Playwright screenshots or traces if useful for reviewing mock-page runner behavior.
- Improve displayed errors for unavailable mock page, missing dev-tools flag, invalid fill plan, or localhost bridge unreachability.

Phase 2 - Mock confirmation dev result diagnostics, still no Avanza:

- Extend the local runner to navigate to a mock confirmation page only after review.
- Surface parsed mock confirmation diagnostics if needed.
- Continue hardening `DevMockBrokerExecutionResult` diagnostics now that Settings can view and clear them.
- Keep the dev mock conversion preview separate from the real capture pipeline unless a later action explicitly adds a dev-gated capture test.

Phase 3 - External local process bridge:

- Decide actual local transport details for a standalone agent process.
- Move from in-process script usage to a standalone local agent process only if needed.
- Continue targeting the mock page only.
- Keep the bridge result broker-result-free until the mock confirmation phase is explicit and documented.

Phase 4 - Avanza UI research:

- Manual mapping only.
- Document selectors and flows before any automation discussion.
- No credentials in Ture.
- No Avanza automation until safety gates, selector contracts, and manual review flows are documented and approved.

## Recommended Action 213

Recommended:

- Action 213 - Mock Capture Error Hardening

This is the best continuation if the feature path continues because the current prototype can explicitly create local mock capture records and block duplicates, and the next useful work is making conversion/capture failures easier to inspect before adding more runner automation.

Alternative:

- Action 213 - Mock Confirmation Runner Integration

Choose the runner integration action first if the next priority is proving the local mock runner can reach a mock confirmation page before any capture-pipeline test exists.
