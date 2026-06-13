# Mock Execution E2E Checkpoint

Date: 2026-06-10

## Milestone Summary

Actions 196-210 completed a dev-only mock execution pipeline:

```text
Ture execution handoff
  -> AvanzaAgentRequest
  -> localhost bridge dry-run metadata
  -> MockOrderPageFillPlan
  -> mock broker order page fill/review
  -> mock confirmation page
  -> mock confirmation parser
  -> DevMockBrokerExecutionResult
  -> BrokerExecutionResult-shaped preview
  -> local TureExecutionRecord capture
  -> Settings diagnostics
```

This pipeline is local/dev only. It proves Ture can move structured execution data through request, mock fill, mock confirmation parsing, dev mock result mapping, conversion preview, and local capture diagnostics without touching Avanza, a real broker, Supabase, History, Statistics, or live trade state.

## What Is Proven

- Ture can produce structured execution request and handoff data.
- The localhost bridge can validate dry-run requests and return mock order fill-plan metadata.
- The mock order page exposes stable selectors and can be filled safely by Playwright/local tooling.
- The mock order page review path can be exercised while final submit remains disabled.
- The mock confirmation page can render local filled, submitted, partially filled, rejected, cancelled, and unknown states.
- The mock confirmation page can be parsed through stable selectors.
- A parsed mock confirmation can become a `DevMockBrokerExecutionResult`.
- A dev mock result can be converted to a `BrokerExecutionResult`-shaped preview with explicit dev/mock warnings.
- The existing `buildTureExecutionRecord(...)` pipeline can be exercised locally from mock data.
- Local execution records diagnostics can show the capture output.
- All of this remains dev-only, local, and manually triggered.

## What Is Not Implemented

- Avanza automation.
- Avanza selectors.
- Avanza URLs.
- Real broker page parsing.
- Real Avanza `brokerResult`.
- Supabase execution persistence.
- Live trade open/close mutation.
- History or Statistics integration from mock captures.
- Automatic final submit.
- Broker credentials.
- Any real broker transport.

## Safety Boundaries

- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true` is required for the mock pages and Settings diagnostics.
- Automatic execution is gated separately by `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION` and remains disabled by default.
- Mock pages are not broker pages.
- The mock order page final submit remains disabled.
- Local records are diagnostics only.
- Mock capture records are labeled `DEV MOCK CAPTURE`.
- Broker-result previews are labeled `DEV MOCK CONVERSION - not a real Avanza confirmation.`
- No credentials are accepted or stored.
- No external broker calls are made.
- The localhost bridge binds only to localhost.
- No Supabase writes happen in the mock execution pipeline.
- No live positions, recommendations, History, or Statistics are mutated by this pipeline.

## Key Files

Mock order page:

- `app/mock-broker/order/page.tsx`
- `app/mock-broker/order/ticket.tsx`

Mock confirmation page:

- `app/mock-broker/confirmation/page.tsx`
- `app/mock-broker/confirmation/confirmation.tsx`
- `app/mock-broker/confirmation/save-dev-mock-result-button.tsx`

Mock contracts:

- `lib/mock-order-page-agent-contract.ts`
- `lib/mock-order-confirmation-contract.ts`
- `lib/mock-broker-execution-result.ts`

Localhost bridge:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `docs/avanza-localhost-bridge-contract.md`

Mock agent runner:

- `scripts/mock-order-page-agent-runner.mjs`
- `tests/e2e/helpers/mock-order-fill-runner.ts`
- `tests/e2e/helpers/mock-confirmation-parser.ts`

Dev mock result store:

- `lib/dev-mock-broker-result-store.ts`

Conversion helper:

- `lib/dev-mock-to-broker-execution-result.ts`

Settings diagnostics:

- `app/settings/page.tsx`
- `lib/execution-event-log.ts`
- `lib/execution-record-store.ts`

E2E tests:

- `tests/e2e/execution-sandbox.spec.ts`
- `playwright.config.ts`

## Local Runbook

Start the app with execution dev tools enabled:

```bash
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false npm run dev
```

Start the localhost bridge stub:

```bash
npm run bridge:localhost
```

Run the manual mock-agent runner:

```bash
npm run mock-agent:run
```

Run the localhost bridge smoke test:

```bash
npm run bridge:localhost:smoke
```

Run the Playwright e2e suite:

```bash
npm run test:e2e
```

Run the dev-tools-off e2e safety pass:

```bash
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

## QA Status

Latest full runtime verification remains the Action 212 status:

- TypeScript passed.
- Lint passed.
- `git diff --check` passed.
- Localhost bridge smoke passed.
- Dev-tools-enabled e2e passed.
- Dev-tools-disabled e2e passed.
- Duplicate mock capture guard passed e2e coverage.

Action 213 documentation-only status:

- `git diff --check` passed.
- The execution persistence schema proposal was added as documentation only.

Action 235 mock order contract update:

- The dev-only mock order page now models the first Avanza Advanced order readback fields on the mock side: account, SEK amount, price/instrument currency, instrument market/type, Advanced order mode, valid-until date, estimated fees/courtage/FX/total, preliminary FX rate, and review/confirm/cancel labels.
- The mock fill-plan builder, stable selector contract, safe URL prefill, Playwright fill runner, local mock-agent runner, review panel, and e2e tests cover those fields.
- This does not add Avanza automation, real broker parsing, final submit, broker result creation, Supabase persistence, History/Statistics integration, or trade mutation.

Action 236 mock confirmation contract update:

- The dev-only mock confirmation page now models the matching Advanced order readback fields: account, amount excluding fees, courtage, FX fee, preliminary FX rate, valid-until date, total amount, price/instrument currency, instrument market/type, Advanced order mode, and review/confirm/cancel labels.
- The mock order review link passes those values to the confirmation page manually, and the Playwright-only parser verifies the expanded selector/readback contract.
- Confirm/cancel labels remain disabled/readback only. No broker result, `TureExecutionRecord`, Supabase persistence, History/Statistics integration, Avanza automation, or trade mutation was added.

Action 237 mock validation update:

- The dev-only mock order page now blocks review on required-field, invalid numeric, missing price, minimum-amount, and unsupported order-mode validation errors.
- Validation errors use stable mock selectors and keep the confirmation link/review output hidden until corrected.
- The final submit placeholder remains disabled in both invalid and valid paths. No broker result, `TureExecutionRecord`, Supabase persistence, History/Statistics integration, Avanza automation, or trade mutation was added.

Action 238 mock-agent runner update:

- The Playwright-only fill runner and local mock-agent runner now enforce Advanced-only mode and detect mock validation failures instead of forcing review.
- Valid runner paths verify the review panel, manual mock confirmation link availability, and disabled final submit.
- Localhost bridge mock-agent responses can include validation errors, review visibility, confirmation link availability, disabled-submit state, and order-mode verification. These remain response-level diagnostics only and are not broker results.

Action 247 mock safe action plan update:

- `lib/mock-order-safe-action-plan.ts` now converts `MockOrderPageFillPlan` into a pure safe action plan for the dev-only mock order page.
- The generated actions validate through `lib/safe-browser-action-contract.ts` and run through the no-op runner from `lib/safe-browser-action-runner.ts`.
- The plan includes mock fill/select/read actions, a local review click, mock confirmation-link readback, and disabled-submit readback.
- No final confirm click action is generated, and injected unsafe final-confirm actions are blocked by validation.
- This remains planning/validation only and does not execute browser actions, create broker results, write Supabase, update History/Statistics, or mutate trades.

Action 248 Playwright mock adapter update:

- `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts` now executes validated safe action plans against `/mock-broker/order` in e2e tests only.
- The adapter validates every action before execution, allows only known mock selectors, clicks only `Review mock order`, reads confirmation-link/disabled-submit state, and blocks final-confirm-like actions.
- Positive e2e coverage proves a mock safe-action plan fills/reviews the page and reaches the mock confirmation link with submit disabled.
- Negative e2e coverage injects an unsafe final-confirm click and verifies the adapter blocks it before execution.
- This does not add runtime browser automation, Avanza selectors/URLs, broker results, Supabase writes, History/Statistics updates, or trade mutation.

Action 249 safe-action diagnostics update:

- `lib/safe-browser-action-diagnostics.ts` now defines a pure shared diagnostics shape for safe browser action execution.
- The Playwright mock adapter returns standardized diagnostics with per-action steps, aggregate executed/blocked/failed counts, runner metadata, and `finalConfirmBlocked`.
- Positive e2e coverage verifies the mock adapter reports successful executed diagnostics.
- Negative e2e coverage verifies injected final-confirm-like clicks report `blocked=true` and `finalConfirmBlocked=true`.
- These diagnostics are runner telemetry only. They are not broker results, order confirmations, Supabase persistence, History/Statistics input, or trade mutation.

Action 250 safe-action diagnostics store/viewer update:

- `lib/safe-browser-action-diagnostics-store.ts` now stores safe-action diagnostics locally under `ture_safe_browser_action_diagnostics_v1`.
- Settings has a dev-gated `Safe Browser Action Diagnostics` viewer with total count, latest timestamp, final-confirm-blocked count, latest 50 diagnostics, per-step details, metadata/JSON, refresh, and scoped clear.
- E2E seeds diagnostics directly into localStorage to verify the viewer without importing Playwright helpers into runtime or generating browser automation from the app.
- The viewer is local diagnostics only. It is not a broker result, order confirmation, execution record, Supabase write, History/Statistics input, or trade mutation.

Action 251 mock-agent diagnostics integration update:

- The manual local mock-agent runner now emits compatible `SafeBrowserActionExecutionDiagnostics` for mock-only fill/review/readback steps.
- The localhost bridge can return safe-action diagnostics as response-level metadata when `enableMockAgentRun=true`.
- The Execution Handoff Preview Modal displays a compact diagnostics summary and stores received diagnostics locally after the user explicitly runs the localhost mock agent.
- E2E intercepts `/run`, returns mock-agent diagnostics, verifies the modal summary, and verifies Settings shows the saved diagnostics with final-confirm-blocked count `0`.
- No Avanza automation, broker result, execution record, Supabase write, History/Statistics update, order submit, or trade mutation was added.

Action 252 browser runner capability gate update:

- `lib/browser-runner-capability-gate.ts` now classifies browser runner capabilities as mock-only, Avanza dry-run, real-broker blocked, or unknown blocked.
- Mock-only browser diagnostics are explicitly labeled as `mock_order_page`, no broker submission, and final confirm disabled.
- The Execution Handoff Preview Modal and Settings diagnostics viewer display capability labels so mock browser execution cannot be mistaken for broker execution.
- E2E verifies mock-only capability is allowed, Avanza/broker/unknown capabilities are blocked by default, and Settings labels both mock-only and unknown diagnostics correctly.
- No Avanza automation, Avanza URL/selector, broker execution/result, Supabase write, order submit, or trade mutation was added.

Action 239 manual Avanza notes:

- `docs/avanza-manual-selector-notes.md` now captures manual visible-label and anchor observations for search, stock page, Advanced order page, confirmation modal, and validation states.
- The notes map Avanza labels to mock order/confirmation fields and record risk/open-question areas for the next manual research session.
- This is documentation only. It does not add real Avanza selectors, URLs, automation, credentials, scraping, broker results, Supabase writes, or trade mutation.

Known caveat:

- Restricted sandboxes may require explicit permission to bind localhost ports for Playwright or the bridge smoke test. This is an environment permission issue, not a runtime dependency on external network access.

## Recommended Next Phase

Phase A - Harden mock capture pipeline:

- Improve conversion and capture error states.
- Keep duplicate local captures guarded and easy to see.
- Add trace or screenshot artifacts if useful for reviewing mock flow failures.
- Keep mock-agent runner diagnostics separate from capture semantics.

Phase B - Local persistence design:

- Decide whether execution events, agent runs, and records should eventually persist to Supabase.
- Review `docs/execution-persistence-schema-proposal.md`.
- Do not add migrations yet.

Phase C - Real bridge planning:

- Decide local process or WebSocket implementation details.
- Continue targeting mock pages only.
- Do not add Avanza automation.

Phase D - Avanza UI research:

- Use `docs/avanza-ui-research-plan.md` as the manual-only research protocol.
- Use `docs/avanza-ui-research-mapping.md` as the first sanitized screenshot-package mapping intake.
- Use `docs/avanza-manual-selector-notes.md` as visible-label and anchor notes for future manual review.
- Use `docs/avanza-vs-mock-order-contract-gap-analysis.md` to decide mock-contract additions before any automation design.
- Document real Avanza screens manually.
- Document labels, flows, and screenshots by hand.
- Do not automate Avanza until a separate explicit approval and safety plan exists.
- Do not press final buy/sell confirmation during research.
- Compare manual observations back to the mock fill-plan and mock confirmation contracts before any automation design.

## Action 213 Persistence Proposal

Action 213 added `docs/execution-persistence-schema-proposal.md`, a documentation-only Supabase persistence schema proposal for future execution-agent data.

The proposal covers:

- Current localStorage-backed execution stores.
- Candidate tables for intents, lifecycle events, broker results, execution records, agent runs, and progress events.
- Optional handoff, safety-check, and dev mock result tables.
- Idempotency and dedupe boundaries.
- Dev/mock separation.
- Security, RLS, and server-only write considerations.
- Suggested migration order and future API route implications.

No Supabase migration, runtime persistence, broker execution, or trade mutation was added.

## Recommended Action 214

Preferred next action:

- Action 214 - Execution Persistence Schema Review / Risk Notes

This should review table boundaries, RLS policy shape, idempotency risks, raw payload minimization, and product integration risks before drafting migrations.

Alternative if implementation planning becomes the priority:

- Action 214 - Supabase Execution Events Migration Draft

This should start with diagnostic tables only and should not add broker result or trade mutation writes.

## Action 212 Duplicate Guard

Action 212 added local-only duplicate protection for dev mock captures:

- Duplicate identity is built from dev mock source, order id, request id, intent id, status, ticker, action, and quantity.
- Settings checks existing local execution records before allowing another mock capture.
- The primary capture button is disabled when a matching local capture exists.
- The warning is explicit that this checks localStorage only.
- It is not a Supabase dedupe mechanism.
- It is not a broker order dedupe mechanism.
- No existing local records are removed or silently cleared.
