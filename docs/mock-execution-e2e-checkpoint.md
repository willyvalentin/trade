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

Known caveat:

- Restricted sandboxes may require explicit permission to bind localhost ports for Playwright or the bridge smoke test. This is an environment permission issue, not a runtime dependency on external network access.

## Recommended Next Phase

Phase A - Harden mock capture pipeline:

- Improve conversion and capture error states.
- Keep duplicate local captures guarded and easy to see.
- Add trace or screenshot artifacts if useful for reviewing mock flow failures.

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
