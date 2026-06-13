# Execution Agent QA Notes

## Action 185 - Local Visual QA + Smoke Test Pass

Date/time: 2026-06-09, Europe/Stockholm

Environment flags used:

- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false`

Local app:

- Started a fresh Next dev server on `http://localhost:3010` because a stale/existing dev-server lock occupied port 3000.
- Authenticated route smoke checks returned `200` for `/` and `/settings`.
- No `Element type is invalid` marker was found in the rendered HTML for either route.

Verification passed:

- `.env.local` is in the requested safe QA shape: execution dev tools enabled, automatic execution disabled.
- Settings code contains the Execution Mode section with semi-automatic default behavior and automatic-mode gating copy.
- Settings code contains dev-gated diagnostics sections for Execution Event Log, Execution Records, Agent Adapter Diagnostics, Avanza Agent Runs, Avanza Agent Bridge, Avanza Agent Bridge Configuration, and Execution Sandbox Smoke Test.
- The smoke checklist is implemented as a localStorage-backed manual checklist with pass/fail/not-tested states and a reset action.
- The bridge configuration/factory status is surfaced in the smoke checklist area and defaults through the no-op bridge path.
- Trade app code wires live-position execution status through `runExecutionOrchestrator(...)` and `buildExecutionUiStatusFromOrchestratorResult(...)`.
- The handoff modal code builds and displays the future agent request summary, bridge request envelope preview, safety checks, authority/mode state, no-op bridge runner output, and dev-only panels behind the execution dev-tools gate.
- TypeScript passed with `./node_modules/.bin/tsc --noEmit`.
- Lint passed with `npm run lint`.

Could not be visually verified in this pass:

- The in-app browser connector was unavailable; no browser targets were registered.
- A headless Playwright fallback was not available locally because Playwright packages are not installed.
- The Settings UI could not be visually inspected or clicked, so the smoke checklist persistence was verified by code inspection rather than by browser interaction.
- No safe real/non-demo Live Day Trade scenario could be visually found or created from existing app data without browser access. The Live Day Trade card status, View handoff modal, Prepare in Avanza no-op flow, broker result capture stub, and resulting local diagnostics were therefore not clicked end-to-end in this pass.

Visual/UI polish notes:

- No visual spacing or layout issues could be confirmed without a browser surface.
- The existing copy remains safety-forward: no Avanza connection, no real broker action, and local/dev-only records are clearly labeled in code.

Recommended next action:

- Re-run Action 185 with an attached in-app browser or installed headless browser support.
- In that pass, use a real/non-demo Live Day Trade that naturally reaches target or stop, then click through View handoff, Prepare in Avanza, broker capture stub, and Settings diagnostics.
- Mark the Execution Sandbox Smoke Test checklist manually in Settings during the visual pass.

## Action 186 - Local Browser QA Setup

Date/time: 2026-06-09, Europe/Stockholm

Added local browser QA infrastructure:

- Installed `@playwright/test` as a dev dependency.
- Added `playwright.config.ts`.
- Added `tests/e2e/execution-sandbox.spec.ts`.
- Added npm scripts:
  - `npm run test:e2e`
  - `npm run test:e2e:headed`

Default Playwright environment:

- Starts the app with `npm run dev -- --port 3010`.
- Uses `http://localhost:3010` as the default base URL.
- Forces local QA flags for the Playwright dev server:
  - `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
  - `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false`
- Authenticates locally by deriving the existing `trade_auth` cookie from `TRADE_APP_PASSWORD` in `.env.local`.
- Does not call Avanza, external transports, Supabase writes, broker result capture, or trade mutation flows.

Run local browser QA:

```bash
npm run test:e2e
```

Run headed browser QA:

```bash
npm run test:e2e:headed
```

Use an already-running dev server:

```bash
PLAYWRIGHT_SKIP_WEB_SERVER=true PLAYWRIGHT_BASE_URL=http://127.0.0.1:3010 npm run test:e2e
```

One-time browser binary install, if needed:

```bash
npx playwright install chromium
```

This was completed locally during Action 186.

Current smoke coverage:

- `/` renders while authenticated and shows the primary trading tabs.
- `/settings` renders while authenticated.
- Settings shows Execution Mode.
- When the dev-tools flag is active in the running server, Settings shows Execution Sandbox Smoke Test, Avanza Agent Bridge Configuration, Avanza Agent Bridge, Execution Event Log, Agent Adapter Diagnostics, Avanza Agent Runs, and Execution Records.
- When attaching to an already-running server where the dev-tools flag is not active, Settings shows the safe Execution Dev Tools disabled note instead.
- Automatic execution remains visibly locked under the safe default flag.
- Bridge configuration defaults to the no-transport/no-op path.

Action 186 test result:

- `PLAYWRIGHT_SKIP_WEB_SERVER=true PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e` passed against the existing local dev server.
- The default `npm run test:e2e` path is ready for a clean local environment. If Next reports another dev server is already running for this repo, stop/restart that server or run with `PLAYWRIGHT_SKIP_WEB_SERVER=true` against the existing URL.

Known limitations:

- The smoke test intentionally does not create a Live Day Trade, open the handoff modal, click Prepare in Avanza, create stub broker records, or modify checklist state.
- Full visual QA still needs a real/non-demo Live Day Trade scenario that naturally reaches target or stop.
- Playwright browser binaries may need local installation before the first test run.

## Action 187 - Real Visual QA Pass for Execution Sandbox

Date/time: 2026-06-09, Europe/Stockholm

Environment flags used:

- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false`

Commands run:

```bash
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
```

Playwright coverage expanded:

- Main trade page renders while authenticated.
- Main trade page reports whether any `View handoff` buttons exist.
- Settings renders Execution Mode and automatic-mode locked state.
- Settings verifies execution dev tools enabled state.
- Settings verifies Avanza Agent Bridge Configuration.
- Settings verifies Avanza Agent Bridge diagnostics.
- Settings clicks `Check bridge health` and verifies the no-op bridge reports unavailable/no external bridge connected.
- Settings verifies Execution Sandbox Smoke Test.
- Settings marks the first checklist item `Pass`, verifies the local update message, then resets the checklist and verifies `Not tested`.
- Dev-tools-off pass verifies the safe disabled gate path.

What passed:

- `npm run test:e2e` passed with execution dev tools enabled: 4 tests passed.
- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e` passed: 4 tests passed.
- The bridge health action used the no-op bridge only.
- The checklist interaction was reset during the test.
- No Avanza page opened.
- No external bridge transport was selected or contacted.
- No broker order was prepared, submitted, simulated, or executed.
- No Supabase write path was used.

What could not be verified:

- No `View handoff` buttons were present in the current local data, so the execution handoff preview modal flow was not exercised.
- Because no real/non-demo Live Day Trade was currently at target or stop, the Live Day Trade execution status and modal sections remain blocked on safe local data.
- No screenshots or traces were retained from the final passing Playwright run. Playwright keeps only `test-results/.last-run.json` after the final pass.

Small QA polish applied:

- Removed the redundant root-layout theme bootstrap script; the app already renders `data-theme="dark"`.
- Added `suppressHydrationWarning` to dynamic hidden/diagnostic JSON blocks that include runtime timestamps:
  - Settings data-mode clarity JSON
  - Trade app data-mode clarity JSON
  - Browser agent prototype plan JSON preview/agent-readable block
  - Avanza verification notes JSON preview
- These fixes do not change execution behavior, broker behavior, storage behavior, or visible trading state.

Recommended next action:

- Add a clearly dev-only, localStorage-only Live Day Trade fixture path for QA, or wait for a real/non-demo Live Day Trade to naturally reach target/stop.
- Then extend Playwright to click `View handoff`, inspect the modal sections, click the no-op `Prepare in Avanza` stub, and verify local diagnostics update.

## Action 188 - Dev-only Execution Sandbox Fixture

Date/time: 2026-06-09, Europe/Stockholm

Environment flags used:

- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false`

Added fixture:

- A dev-only `Execution Sandbox Fixture` panel now appears in the Live Day Trades tab only when execution dev tools are enabled.
- The fixture is local in-memory UI only.
- It is labeled `DEV FIXTURE`, `Not a real trade`, `Does not write Supabase`, and `For Playwright QA only`.
- It includes:
  - A stop-loss reached long-position fixture.
  - A target reached long-position fixture.
- The fixture uses the same live-position exit monitor, execution orchestrator, UI status adapter, and handoff preview modal path as real live-position exits.
- The fixture is not inserted into active positions, History, Statistics, close-trade flows, Supabase, or real trade state.

Playwright coverage added:

- Opens the Live Day Trades tab.
- Verifies the fixture appears when dev tools are enabled.
- Verifies the stop-loss fixture shows `STOP LOSS REACHED`.
- Opens `View handoff` from the fixture.
- Verifies the modal shows:
  - Execution Handoff Preview
  - Future agent request
  - Bridge request envelope
  - Execution Sandbox QA
  - Safety checks
- Clicks `Prepare in Avanza`.
- Verifies the bridge-backed no-op runner result appears.
- Verifies the runner result says no Avanza bridge is connected, Avanza was not opened, no order was prepared/submitted, and no broker result was created.
- Verifies `Broker Result` is `Absent`.
- With `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false`, verifies the fixture is hidden and the safe dev-tools disabled gate remains available in Settings.

Commands run:

```bash
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- Dev-tools-enabled E2E passed: 4 tests passed.
- Dev-tools-disabled E2E passed: 4 tests passed.
- The handoff modal flow is now visually/click-testable without fake production trades.
- No Avanza page opened.
- No external bridge transport was selected or contacted.
- No broker order was prepared, submitted, simulated, or executed.
- No Supabase write path was used.
- No real trade state was mutated.

Known limitations:

- The dev broker result capture stub was not clicked in this action because it intentionally persists local execution records. It remains available for explicit dev diagnostics.
- This fixture is not a substitute for QA with a real/non-demo Live Day Trade that naturally reaches target or stop.

## Action 189 - External Bridge Echo Prototype

Date/time: 2026-06-09, Europe/Stockholm

Environment flags used:

- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- `NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false`

Added echo bridge prototype:

- Added a dev-only `echo` Avanza agent bridge transport.
- The echo bridge is selectable from Settings only inside the execution dev-tools surface.
- Echo health reports available for local diagnostics only.
- Echo capabilities clearly report `supportsRealBrokerAutomation=false` and `supportsBrokerResultReturn=false`.
- Echo request handling emits local progress events and returns an `AvanzaAgentResult` with `status="unknown"` and no `brokerResult`.
- The bridge factory resolves `echo` only when execution dev tools are enabled; otherwise it safely falls back to `none`.

Playwright coverage updated:

- Selects `Echo bridge - Dev only` in Settings.
- Runs bridge health and verifies the local diagnostics health message.
- Opens the dev-only Live Day Trades fixture handoff modal.
- Clicks `Prepare in Avanza`.
- Verifies the modal shows the bridge-backed diagnostics runner result.
- Verifies the echo result says no Avanza session opened and no broker result was created.
- Verifies `Broker Result` remains `Absent`.
- Verifies the Settings Avanza Agent Runs viewer shows the stored echo run with selected/resolved bridge metadata.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Dev-tools-enabled E2E passed: 4 tests passed.
- Dev-tools-disabled E2E passed: 4 tests passed.
- No Avanza page opened.
- No external transport was created.
- No network or broker call was added.
- No broker order was prepared, submitted, simulated, or executed.
- No broker result was created by the echo path.
- No Supabase write path was used.
- No real trade state was mutated.

Known limitations:

- Echo is a local protocol prototype only. It is not a real local process, browser extension, WebSocket, HTTP, or native messaging bridge.
- The dev-tools-disabled E2E suite was already covered in Action 188 and remains governed by the same feature gate.

## Action 192 - Localhost Bridge Server No-op/Echo Stub

Date/time: 2026-06-09, Europe/Stockholm

Added local server stub:

- Added `scripts/avanza-localhost-bridge-server.mjs`.
- Added `npm run bridge:localhost`.
- The stub binds to `127.0.0.1` and defaults to port `47831`.
- `AVANZA_LOCALHOST_BRIDGE_PORT` can override the port.
- Implemented:
  - `GET /`
  - `GET /health`
  - `POST /run`
  - `POST /cancel`
  - `OPTIONS` for local CORS preflight
- `/run` requires `dryRun: true`, request/envelope objects, matching request IDs, and basic Avanza agent request fields.
- Valid `/run` returns echo progress events and an `AvanzaAgentResult` with no `brokerResult`.
- Invalid `/run` returns `accepted: false` and errors.

Smoke check:

```bash
npm run bridge:localhost:smoke
```

Result:

- Smoke passed after running with localhost bind permission.
- The default sandbox blocked binding to `127.0.0.1:47832` with `EPERM`, then the approved localhost smoke run passed.

Safety notes:

- The stub is not started by Next.js.
- Ture frontend is not wired to call it yet.
- No Avanza page opened.
- No browser automation was added.
- No external service was called.
- No broker order was prepared, submitted, simulated, or executed.
- No broker result was created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 193 - Localhost Bridge Client + Health Check Integration

Date/time: 2026-06-09, Europe/Stockholm

Added health-only client integration:

- Added `lib/avanza-localhost-bridge-client.ts`.
- Added `checkLocalhostBridgeHealth(...)`.
- The helper calls only `GET /health`, defaults to `http://127.0.0.1:47831`, uses a timeout, validates the response, and returns a non-throwing result.
- Settings now shows a dev-gated `Check localhost stub` button inside Avanza Agent Bridge diagnostics.
- The Settings result displays reachability, validation, status code, base URL, bridge message, and validation errors/warnings.

Playwright coverage:

- Confirms the `Check localhost stub` button is visible when execution dev tools are enabled.
- Intercepts the localhost health URL and verifies the safe unreachable message without requiring the stub server to be running.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed: 4 tests passed.
- Dev-tools-disabled E2E passed: 4 tests passed.

Safety notes:

- No frontend `/run` call was added.
- No frontend `/cancel` call was added.
- The execution handoff modal was not wired to the localhost stub.
- Health checks run only after explicit user click.
- No Avanza page opened.
- No browser automation was added.
- No broker order was prepared, submitted, simulated, or executed.
- No broker result was created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 194 - Localhost Bridge Run Client, Dev-only Manual Button

Date/time: 2026-06-10, Europe/Stockholm

Added dev-only run integration:

- Extended `lib/avanza-localhost-bridge-client.ts` with `runLocalhostBridgeDryRun(...)`.
- The helper builds a contract-shaped `LocalhostBridgeRunRequest`, forces `dryRun: true`, calls only `POST /run`, validates the response, and returns a non-throwing result.
- Added a dev-only `Run localhost bridge echo` button to the Execution Handoff Preview Modal.
- The button is manual-only and appears only when execution dev tools, a future-agent request, and a bridge envelope are available.
- The modal displays reachability, status code, accepted state, result status, progress count, base URL, errors/warnings, and `Broker Result: Absent`.
- The modal appends a local `localhost_bridge_run_stub` audit event and stores local agent-run diagnostics when the stub returns a result.
- No `TureExecutionRecord` is created from localhost echo results because `brokerResult` is absent.

Playwright coverage:

- Intercepts `POST http://127.0.0.1:47831/run`.
- Opens the dev-only Live Day Trades fixture handoff modal.
- Clicks `Run localhost bridge echo`.
- Verifies the localhost echo result panel and broker-result-absent state.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed: 4 tests passed.
- Dev-tools-disabled E2E passed: 4 tests passed.

Safety notes:

- No automatic call is made on render.
- No frontend `/cancel` call was added.
- The existing `Prepare in Avanza` bridge-backed diagnostics path remains unchanged.
- No Avanza page opened.
- No browser automation was added.
- No broker order was prepared, submitted, simulated, or executed.
- No broker result was created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 195 - Localhost Bridge Cancel Client + Manual Cancel Test

Date/time: 2026-06-10, Europe/Stockholm

Added dev-only cancel integration:

- Extended `lib/avanza-localhost-bridge-client.ts` with `cancelLocalhostBridgeRun(...)`.
- The helper calls only `POST /cancel`, validates the response, uses a timeout, and returns a non-throwing result.
- Added a dev-only `Cancel localhost bridge run` button to the Execution Handoff Preview Modal.
- The modal displays reachability, status code, cancelled state, request id, base URL, and errors.
- The modal appends a local `localhost_bridge_cancel_stub` audit event.
- The cancel path does not cancel a real runner, broker action, order, trade, or lifecycle state.

Playwright coverage:

- Intercepts `POST http://127.0.0.1:47831/cancel`.
- Opens the dev-only Live Day Trades fixture handoff modal.
- Runs localhost bridge echo first.
- Clicks `Cancel localhost bridge run`.
- Verifies the cancel result panel and local-stub-only safety copy.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed: 4 tests passed.
- Dev-tools-disabled E2E passed: 4 tests passed.

Safety notes:

- No automatic call is made on render.
- No Avanza page opened.
- No browser automation was added.
- No broker order was prepared, submitted, simulated, cancelled, or executed.
- No broker result was created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 196 - Mock Order Page Prototype

Date/time: 2026-06-10, Europe/Stockholm

Added local mock order-ticket UI:

- Added `/mock-broker/order`.
- The route is hidden behind `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`.
- The page clearly labels itself `MOCK BROKER`, `DEV ONLY`, `Not Avanza`, and says no real order can be placed.
- It renders a fake order form with ticker, action, quantity, order type, limit price, intended/current price, target, stop loss, mode, manual confirmation, automatic submit authority, request id, and intent id.
- Query params can prefill ticker, action, quantity, order type, limit price, mode, request id, and intent id as local display/form values only.
- `Review mock order` shows a local component-state review panel.
- Final submit is disabled and labeled as unavailable in this action.

Playwright coverage:

- Visits `/mock-broker/order` with safe query params.
- Verifies mock/dev/not-Avanza/no-real-order labels.
- Verifies query prefill.
- Fills local price fields.
- Clicks `Review mock order`.
- Verifies the review panel.
- Verifies final submit is disabled.
- With dev tools disabled, verifies the safe unavailable state.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed: 5 tests passed.
- Dev-tools-disabled E2E passed: 5 tests passed.

Safety notes:

- The mock order page is not wired to the bridge, localhost server, Avanza, Supabase, History, Statistics, execution records, or trade state.
- No order is prepared, submitted, simulated, cancelled, or executed.
- No broker result is created.
- No browser automation was added.

## Action 198 - Mock Order Page Agent Fill Contract

Date/time: 2026-06-10, Europe/Stockholm

Added selector/fill-plan contract:

- Added `lib/mock-order-page-agent-contract.ts`.
- Exported `MOCK_ORDER_PAGE_AGENT_SELECTORS` for all mock order page inputs, read-only safety fields, and local buttons.
- Added `buildMockOrderPageFillPlanFromAgentRequest(...)`.
- Added `validateMockOrderPageFillPlan(...)`.
- Added `buildMockOrderPageUrlFromFillPlan(...)`.
- The fill plan maps only safe scalar order-ticket values from an `AvanzaAgentRequest`; it does not include raw request payloads, credentials, broker results, or executable browser actions.

Mock page updates:

- Added stable `data-testid` and `data-agent-field` attributes to:
  - ticker, action, quantity, order type, limit price, intended/current price, target price, stop-loss price, mode, request id, intent id
  - manual-final-confirmation and automatic-final-submit read-only fields
  - review, reset, and disabled-submit buttons
- Extended safe query-param prefill to `intendedPrice`, `targetPrice`, and `stopLossPrice`.
- `Review mock order` remains local component state only.
- Final submit remains disabled.

Playwright coverage updated:

- Verifies a sample `AvanzaAgentRequest` maps to a valid `MockOrderPageFillPlan`.
- Verifies the fill-plan URL helper returns only a relative `/mock-broker/order?...` URL.
- Verifies mock order page selectors expose the expected `data-testid` and `data-agent-field` values.
- Verifies query-param prefill, local review panel, reset behavior, disabled submit, and dev-tools-disabled gate still work.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
npm run test:e2e -- --grep "mock broker order page|fill plan"
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed: 6 tests passed.
- Dev-tools-disabled E2E passed: 6 tests passed.
- Final focused mock-page/contract E2E passed: 2 tests passed.

Safety notes:

- This is not browser automation.
- This is not Avanza automation.
- At this stage, the localhost bridge did not open or fill the mock order page.
- No Avanza selectors were added.
- No order is prepared, submitted, simulated, cancelled, or executed.
- No broker confirmation or `brokerResult` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 199 - Mock Order Page Fill Runner Stub

Date/time: 2026-06-10, Europe/Stockholm

Added Playwright-only fill runner:

- Added `tests/e2e/helpers/mock-order-fill-runner.ts`.
- Exported `openMockOrderPageWithPlan(...)`, `fillMockOrderPageFromPlan(...)`, and `verifyMockOrderPageReviewFromPlan(...)`.
- The helper validates a `MockOrderPageFillPlan` before acting.
- The helper fills/selects mock page controls through the stable `data-testid` and `data-agent-field` contract selectors.
- The helper verifies read-only manual-confirmation and automatic-submit fields.
- The helper clicks only `Review mock order`.
- The helper verifies the disabled final submit button remains disabled.

Playwright coverage updated:

- Reuses the existing sample `AvanzaAgentRequest` fixture.
- Builds a `MockOrderPageFillPlan` with `buildMockOrderPageFillPlanFromAgentRequest(...)`.
- Opens `/mock-broker/order` through the safe relative fill-plan URL.
- Applies the plan with the Playwright-only fill runner.
- Verifies the local review panel reflects ticker, action, quantity, order type, mode, request id, and intent id.
- Keeps the dev-tools-disabled branch on the safe unavailable page.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed.
- Dev-tools-enabled E2E passed: 7 tests passed.
- Dev-tools-disabled E2E passed: 7 tests passed.

Safety notes:

- This helper exists only under `tests/e2e`.
- No Playwright helper is imported by app runtime code.
- This is not Avanza automation.
- No Avanza URL or Avanza selectors were added.
- No mock submit is clicked.
- No order is prepared, submitted, simulated, cancelled, or executed.
- No broker confirmation or `brokerResult` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 200 - Localhost Bridge Mock Page Fill Prototype

Date/time: 2026-06-10, Europe/Stockholm

Added localhost dry-run fill-plan metadata:

- Extended `LocalhostBridgeRunResponse` with response-level mock order metadata:
  - `mockOrderPageUrl`
  - `mockOrderPageAvailable`
  - `mockOrderPageMessage`
  - `mockOrderFillPlan`
  - `mockOrderFillPlanValid`
  - `mockOrderFillPlanErrors`
  - `mockOrderFillPlanWarnings`
- Updated `validateLocalhostBridgeRunResponse(...)` to accept and validate those optional fields.
- Updated `scripts/avanza-localhost-bridge-server.mjs` so valid dry-run `/run` responses build a mock order fill plan and relative mock page URL from the embedded `AvanzaAgentRequest`.
- Updated `scripts/avanza-localhost-bridge-server-smoke.mjs` to send a ready handoff payload and verify mock fill-plan metadata plus absent `brokerResult`.

Modal/UI updates:

- The dev-only localhost bridge echo result now displays mock page availability, fill-plan validity, the relative mock page URL, fill-plan errors, and optional fill-plan JSON.
- The mock page link is manual only.
- Ture does not auto-open or auto-fill the mock page.

Playwright coverage updated:

- The intercepted `/run` response includes mock order fill-plan metadata.
- The modal verifies fill-plan validity, mock order page URL display, manual link display, and absent broker result.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
node --check scripts/avanza-localhost-bridge-server.mjs
node --check scripts/avanza-localhost-bridge-server-smoke.mjs
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge server syntax check passed.
- Localhost bridge smoke script syntax check passed.
- Localhost bridge smoke passed and verified mock fill-plan metadata plus absent `brokerResult`.
- Dev-tools-enabled E2E passed: 7 tests passed.
- Dev-tools-disabled E2E passed: 7 tests passed.

Safety notes:

- This is dry-run payload/contract metadata only.
- No browser automation was added to the localhost bridge or app runtime.
- No mock page is opened or filled automatically.
- No Avanza URL or Avanza selectors were added.
- No mock submit is clicked.
- No order is prepared, submitted, simulated, cancelled, or executed.
- No broker confirmation or `brokerResult` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 201 - Local Mock Agent Runner Prototype

Date/time: 2026-06-10, Europe/Stockholm

Added manual local mock-page runner:

- Added `scripts/mock-order-page-agent-runner.mjs`.
- Added `npm run mock-agent:run`.
- Added `npm run mock-agent:run:headed`.
- The script opens Chromium with Playwright and targets only localhost `/mock-broker/order`.
- It accepts:
  - `--base-url <localhost-url>`
  - `--page-url <relative-or-localhost-mock-page-url>`
  - `--plan-file <path-to-MockOrderPageFillPlan-json>`
  - `--headed`
- The script includes a safe default fill plan for manual smoke testing.
- The script can also read a `mockOrderFillPlan` object from a local JSON file, such as a saved localhost bridge `/run` response.

Safe local usage:

```bash
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true npm run dev -- --port 3000
npm run mock-agent:run
```

Headed run:

```bash
npm run mock-agent:run:headed
```

Custom local app URL:

```bash
npm run mock-agent:run -- --base-url http://localhost:3010
```

Behavior:

- Derives the local app `trade_auth` cookie from `TRADE_APP_PASSWORD` when available, matching the existing local e2e auth pattern.
- Fills mock fields through stable `data-testid` and `data-agent-field` selectors.
- Clicks only `Review mock order`.
- Verifies the review panel contains expected plan values.
- Verifies the final submit button remains disabled before and after review.

Commands run:

```bash
node --check scripts/mock-order-page-agent-runner.mjs
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=false npm run dev -- --port 3012
npm run mock-agent:run -- --base-url http://localhost:3012
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- Mock-agent runner syntax check passed.
- TypeScript passed.
- Lint passed.
- Diff check passed.
- Local dev server started on `http://localhost:3012` with execution dev tools enabled.
- `npm run mock-agent:run -- --base-url http://localhost:3012` passed and reported no submit click.
- Dev-tools-enabled E2E passed: 7 tests passed.
- Dev-tools-disabled E2E passed: 7 tests passed.

Safety notes:

- This script is manually run only.
- This script is not imported by app runtime code.
- This script is not wired into the localhost bridge server.
- It accepts only relative or localhost mock page URLs.
- No Avanza URL or Avanza selectors were added.
- No mock submit is clicked.
- No order is prepared, submitted, simulated, cancelled, or executed.
- No broker confirmation or `brokerResult` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 202 - Localhost Bridge Mock Agent Run Mode

Date/time: 2026-06-10, Europe/Stockholm

Added explicit localhost bridge mock-agent run mode:

- Extended `lib/avanza-localhost-bridge-contract.ts` with optional `/run` request fields:
  - `enableMockAgentRun`
  - `mockPageBaseUrl`
  - `mockAgentHeaded`
- Extended `/run` response metadata with:
  - `mockAgentRunAttempted`
  - `mockAgentRunOk`
  - `mockAgentRunMessage`
  - `mockAgentRunErrors`
  - `mockAgentRunStartedAt`
  - `mockAgentRunCompletedAt`
- Refactored `scripts/mock-order-page-agent-runner.mjs` to export `runMockOrderPageAgent(...)` while preserving the manual CLI.
- Updated `scripts/avanza-localhost-bridge-server.mjs` so default `/run` still does not open a browser.
- When `/run` explicitly sets `enableMockAgentRun=true`, the bridge validates localhost-only `mockPageBaseUrl`, imports the local mock-page runner, drives only `/mock-broker/order`, clicks only `Review mock order`, verifies disabled submit, and reports response-level mock-agent run metadata.
- Updated the bridge smoke script to verify default runs do not attempt the mock-agent runner and explicit non-local mock base URLs fail safely with `accepted=true`, `mockAgentRunOk=false`, and no `brokerResult`.

Commands run:

```bash
node --check scripts/mock-order-page-agent-runner.mjs
node --check scripts/avanza-localhost-bridge-server.mjs
node --check scripts/avanza-localhost-bridge-server-smoke.mjs
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- Mock-agent runner syntax check passed.
- Localhost bridge server syntax check passed.
- Localhost bridge smoke script syntax check passed.
- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission; it verified default no-attempt behavior, explicit safe mock-agent failure metadata for a non-local base URL, and absent `brokerResult`.
- Dev-tools-enabled E2E passed: 7 tests passed.
- Dev-tools-disabled E2E passed: 7 tests passed.

Safety notes:

- Normal `/run` behavior remains fill-plan metadata only and does not open a browser.
- The mock-agent runner branch runs only when `enableMockAgentRun=true`.
- The branch accepts only localhost mock page origins and only targets `/mock-broker/order`.
- No Avanza URL or Avanza selectors were added.
- No mock submit is clicked.
- No broker confirmation or `brokerResult` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 203 - Dev UI Button for Localhost Mock Agent Run

Date/time: 2026-06-10, Europe/Stockholm

Added dev-only modal UI wiring for the explicit localhost mock-agent run:

- Updated `lib/avanza-localhost-bridge-client.ts` so `runLocalhostBridgeDryRun(...)` accepts and forwards:
  - `enableMockAgentRun`
  - `mockPageBaseUrl`
  - `mockAgentHeaded`
- Updated the client result calculation so an explicit mock-agent run with `mockAgentRunOk=false` reports `ok=false` while preserving the response metadata.
- Added `localhost_mock_agent_run_stub` to the local execution audit event contract.
- Added a separate `Run localhost mock agent` button in the Execution Handoff Preview Modal.
- The existing `Run localhost bridge echo` button remains unchanged.
- The new button is dev-only, manual-only, and calls localhost `/run` with `enableMockAgentRun=true` plus a safe localhost mock page base URL.
- The modal displays mock-agent run metadata:
  - reachable
  - ok
  - accepted
  - result status
  - broker result absence
  - `mockAgentRunAttempted`
  - `mockAgentRunOk`
  - `mockAgentRunMessage`
  - `mockAgentRunErrors`
  - `mockAgentRunStartedAt`
  - `mockAgentRunCompletedAt`
- The modal appends a local `localhost_mock_agent_run_stub` audit event and saves local agent-run diagnostics when a result exists.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed: 7 tests passed.
- Dev-tools-disabled E2E passed: 7 tests passed.
- The modal E2E intercepts localhost `/run`, verifies the new button sends `enableMockAgentRun=true`, displays mock-agent metadata, and shows `Broker Result` as `Absent`.

Safety notes:

- The button is hidden unless execution dev tools are enabled.
- The button is explicit and does not run on render.
- No Avanza URL or Avanza selectors were added.
- No real broker page is automated.
- No mock submit is clicked.
- No broker confirmation or `brokerResult` is created.
- No `TureExecutionRecord` is created from the mock-agent run.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 204 - Mock Agent Prototype Checkpoint + Next Phase Plan

Date/time: 2026-06-10, Europe/Stockholm

Documentation-only checkpoint:

- Added `docs/mock-agent-prototype-checkpoint.md`.
- Linked the new checkpoint from `docs/execution-agent-checkpoint.md`.
- Documented the completed Actions 196-203 local mock-agent pipeline:
  - execution handoff
  - future agent request
  - bridge envelope
  - localhost bridge `/run`
  - mock fill plan
  - mock page runner
  - review-only verification
  - local diagnostics/audit/agent-run record
- Documented proven capabilities, involved files, safety boundaries, local run commands, QA status, next-phase plan, and recommended Action 205.

Command run:

```bash
git diff --check
```

Result:

- Diff check passed.

Safety notes:

- Documentation only.
- No Avanza automation was added.
- No mock or real automation behavior was changed.
- No submit path was added.
- No broker confirmation or `brokerResult` was created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 205 - Mock Confirmation Page Contract

Date/time: 2026-06-10, Europe/Stockholm

Added dev-only mock confirmation contract and UI:

- Added `lib/mock-order-confirmation-contract.ts`.
- Added `/mock-broker/confirmation`.
- Added `app/mock-broker/confirmation/page.tsx`.
- Added `app/mock-broker/confirmation/confirmation.tsx`.
- Added stable `data-testid` and `data-agent-field` selectors for status, ticker, action, quantity, requested price, executed price, order id, request id, intent id, position id, recommendation id, message, and safety label.
- Added safe query-param parsing and `buildMockOrderConfirmationUrl(...)`.
- Added a manual `Open mock confirmation page` link from the mock order review panel.
- The confirmation page supports local mock statuses:
  - `filled`
  - `submitted`
  - `partially_filled`
  - `rejected`
  - `cancelled`
  - `unknown`
- The confirmation page is dev-gated by `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed: 9 tests passed.
- Dev-tools-disabled E2E passed: 9 tests passed.
- E2E verifies mock confirmation URL building, stable selectors, rendered values, filled/rejected statuses, disabled-dev-tools behavior, and the mock order review link to `/mock-broker/confirmation`.

Safety notes:

- This is mock confirmation contract/UI/test only.
- No Avanza automation was added.
- No Avanza URL, branding, or selector was added.
- No real broker page is automated.
- No mock or real submit path was added.
- No real broker confirmation is created.
- No `brokerResult` is created.
- No `TureExecutionRecord` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 206 - Mock Confirmation Parser Test Runner

Date/time: 2026-06-10, Europe/Stockholm

Added Playwright-only mock confirmation parser support:

- Added `tests/e2e/helpers/mock-confirmation-parser.ts`.
- Extended `MockOrderConfirmationParseResult` with top-level:
  - `ok`
  - `errors`
  - `warnings`
  - `parsedAt`
- The helper reads only stable `data-testid` plus `data-agent-field` selector pairs from `/mock-broker/confirmation`.
- The helper returns the typed mock confirmation parse result from the existing contract.
- Added parser e2e coverage for:
  - `filled`
  - `rejected`
  - `cancelled`
- Dev-tools-disabled behavior remains covered.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- This helper is Playwright/dev-test only.
- No app runtime code imports the parser helper.
- No Avanza automation was added.
- No Avanza URL, branding, or selector was added.
- No real broker page is parsed.
- No submit path was added.
- No `BrokerExecutionResult` is created.
- No `TureExecutionRecord` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 207 - Mock Confirmation to Dev Broker Result Mapper

Date/time: 2026-06-10, Europe/Stockholm

Added dev-only mock broker result mapping:

- Added `lib/mock-broker-execution-result.ts`.
- Added `DevMockBrokerExecutionStatus`.
- Added `DevMockBrokerExecutionResult`.
- Added `normalizeDevMockBrokerExecutionStatus(...)`.
- Added `buildDevMockBrokerExecutionResultFromConfirmationPayload(...)`.
- Added `buildDevMockBrokerExecutionResultFromParseResult(...)`.
- Added `validateDevMockBrokerExecutionResult(...)`.
- Added e2e coverage for filled, rejected, and cancelled mock mappings.
- The mapper is intentionally named `DevMock...` and remains separate from the real `BrokerExecutionResult`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- This is dev/mock mapping logic only.
- No Avanza automation was added.
- No Avanza URL, branding, or selector was added.
- No real broker page is parsed.
- No submit path was added.
- No real `BrokerExecutionResult` is created.
- No `TureExecutionRecord` is created.
- No Supabase write path was used.
- No real trade state was mutated.

## Action 208 - Dev Mock Broker Result Diagnostics Viewer

Date/time: 2026-06-10, Europe/Stockholm

Added dev-only local diagnostics for mock broker-like results:

- Added `lib/dev-mock-broker-result-store.ts`.
- Added isolated local storage key `ture_dev_mock_broker_results_v1`.
- Added safe read/append/filter/clear helpers for `DevMockBrokerExecutionResult`.
- Added a dev-only `Save dev mock result` control on `/mock-broker/confirmation`.
- Added a Settings `Dev Mock Broker Results` viewer with refresh, latest 50 rows, details JSON, and scoped clear.
- Added e2e coverage for saving a mock confirmation result, viewing it in Settings, clearing it, and keeping the viewer hidden when execution dev tools are disabled.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- This is dev-only local diagnostics.
- The store is separate from real execution records and agent run stores.
- Clearing dev mock results removes only `ture_dev_mock_broker_results_v1`.
- No Avanza automation was added.
- No Avanza URL, branding, or selector was added.
- No real broker page is parsed.
- No submit path was added.
- No real `BrokerExecutionResult` is created.
- No `TureExecutionRecord` is created.
- No Supabase write path was used.
- No History/Statistics integration was added.
- No real trade state was mutated.

## Action 209 - Dev-only Mock Result to BrokerExecutionResult Bridge

Date/time: 2026-06-10, Europe/Stockholm

Added a pure dev-only conversion preview from mock diagnostics to the real broker-result shape:

- Added `lib/dev-mock-to-broker-execution-result.ts`.
- Added `DevMockBrokerToBrokerExecutionResultConversion`.
- Added `DevMockBrokerConvertedBrokerExecutionResult`.
- Added `convertDevMockBrokerResultToBrokerExecutionResult(...)`.
- Added `canConvertDevMockBrokerResult(...)`.
- Conversion maps valid dev mock filled/rejected/cancelled results into Avanza-shaped `BrokerExecutionResult` previews.
- Converted previews include `DEV MOCK CONVERSION - not a real Avanza confirmation.`
- Settings `Dev Mock Broker Results` rows now include a collapsed `BrokerExecutionResult preview`.
- The preview is clearly labeled as not saved, not real, and not `TureExecutionRecord`.
- Added e2e coverage for filled, rejected, cancelled, malformed conversion errors, and preview display.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- This is dev-only conversion/diagnostics logic.
- The converter does not call `buildTureExecutionRecord`.
- The Settings preview does not save converted broker results.
- No Avanza automation was added.
- No Avanza URL, branding, or selector was added.
- No real broker page is parsed.
- No submit path was added.
- No `TureExecutionRecord` is created.
- No Supabase write path was used.
- No History/Statistics integration was added.
- No real trade state was mutated.

## Action 210 - Dev-only Mock Broker Capture Pipeline

Date/time: 2026-06-10, Europe/Stockholm

Added an explicit dev-only local capture test for stored mock broker results:

- Added audit event type `dev_mock_broker_capture_stub`.
- Added `Capture mock result locally` in the Settings `Dev Mock Broker Results` viewer.
- The button converts the stored `DevMockBrokerExecutionResult` with `convertDevMockBrokerResultToBrokerExecutionResult(...)`.
- It builds a matching local `ExecutionIntent` from mock identifiers, action, ticker, quantity, and price data.
- It calls `buildTureExecutionRecord(...)`.
- It appends the resulting `TureExecutionRecord` to the existing local execution-record store only.
- It appends a local audit event.
- The UI labels the result as `DEV MOCK CAPTURE` and warns it is not real broker execution.
- E2E covers save mock result -> capture locally -> local Execution Records diagnostics display.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- This is dev-only local capture testing.
- The capture button is explicit and manual only.
- No Avanza automation was added.
- No Avanza URL, branding, or selector was added.
- No real broker page is parsed.
- No submit path was added.
- No Supabase write path was used.
- No live trade state was mutated.
- No History/Statistics integration was added.
- No positions are opened or closed.

## Action 211 - Mock Execution End-to-End Checkpoint

Date/time: 2026-06-10, Europe/Stockholm

Added documentation-only checkpoint:

- Added `docs/mock-execution-e2e-checkpoint.md`.
- Summarized the full Actions 196-210 dev-only mock execution pipeline.
- Documented what is proven, what is explicitly not implemented, safety boundaries, key files, runbook, QA status, next phases, and recommended Action 212 options.
- Linked the new checkpoint from `docs/mock-agent-prototype-checkpoint.md`.
- Linked the new checkpoint from `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
git diff --check
```

Results:

- Diff check passed.

Safety notes:

- Documentation only.
- No Avanza automation was added.
- No broker execution was added.
- No Supabase write path was added.
- No trade mutation was added.
- No History/Statistics integration was added.

## Action 212 - Mock Capture Duplicate Guard

Date/time: 2026-06-10, Europe/Stockholm

Added local-only duplicate protection for dev mock captures:

- Added duplicate key helpers for dev mock captures.
- Duplicate identity uses dev mock source, order id, request id, intent id, status, ticker, action, and quantity.
- Settings checks existing local execution records before capture.
- The primary `Capture mock result locally` button is disabled when a matching local capture exists.
- The UI warns: `This mock result already has a local capture record.`
- The UI states that duplicate guard checks localStorage only.
- E2E verifies first capture succeeds, second capture is blocked/disabled, and only one matching local execution record exists.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run bridge:localhost:smoke
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Localhost bridge smoke passed after rerunning with localhost bind permission.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- This is local/dev duplicate protection only.
- It does not remove existing local records.
- It does not silently clear duplicates.
- It does not write Supabase.
- It does not mutate real trades.
- It does not affect History or Statistics.
- It is not broker order dedupe.
- No Avanza automation was added.

## Action 213 - Execution Persistence Schema Proposal

Date/time: 2026-06-10, Europe/Stockholm

Added a documentation-only Supabase persistence schema proposal:

- Added `docs/execution-persistence-schema-proposal.md`.
- Documented current localStorage-backed execution diagnostics stores:
  - `ture_execution_event_log_v1`
  - `ture_execution_records_v1`
  - `ture_avanza_agent_runs_v1`
  - `ture_dev_mock_broker_results_v1`
  - `ture_avanza_agent_bridge_config_v1`
  - `ture_execution_sandbox_smoke_checklist_v1`
- Proposed future tables for execution intents, lifecycle events, broker execution results, execution records, agent runs, and agent progress events.
- Proposed optional broker handoff, execution safety check, and dev mock broker result tables.
- Documented fields, JSONB usage, indexes, relationships, retention notes, idempotency/dedupe boundaries, dev/mock separation, security/RLS considerations, migration order, and future API route implications.
- Linked the proposal from `docs/execution-agent-checkpoint.md`.
- Updated `docs/mock-execution-e2e-checkpoint.md` to mark Action 213 complete and recommend Action 214 review/risk notes before migrations.

Commands run:

```bash
git diff --check
```

Results:

- Diff check passed.

Safety notes:

- Documentation only.
- No Supabase migration was added.
- No database code was modified.
- No Supabase write path was added.
- No app behavior was changed.
- No local store behavior was altered.
- No Avanza automation was added.
- No broker execution was added.
- No trade mutation was added.

## Action 214 - Execution Persistence Schema Review / Risk Notes

Date/time: 2026-06-10, Europe/Stockholm

Added a documentation-only critical review of the execution persistence schema proposal:

- Added `docs/execution-persistence-schema-review.md`.
- Identified major risks before migrations:
  - dev/mock data mixing with real execution data
  - client-side spoofing of broker results
  - duplicate broker confirmations
  - partial fills
  - mismatched intent/result data
  - execution authority drift
  - automatic mode auditability
  - raw payload over-storage
  - RLS and `user_id` assumptions
  - retention/table bloat
  - product linkage too early
- Defined trust boundaries for untrusted client/localStorage data, semi-trusted local bridge or agent output, and trusted server-side validation/capture.
- Recommended schema clarifications including `source_environment`, `capture_source`, `authority_snapshot`, minimized raw payloads, required real idempotency keys, append-only events, and keeping `execution_records` as normalized summaries.
- Added idempotency review and partial-fill nuance.
- Added RLS/security review.
- Added migration go/no-go checklist.
- Updated `docs/execution-persistence-schema-proposal.md` to link to the review and recommend Action 215.
- Updated `docs/execution-agent-checkpoint.md` to record Action 214.

Commands run:

```bash
git diff --check
```

Results:

- Diff check passed.

Safety notes:

- Documentation only.
- No Supabase migration was added.
- No database code was modified.
- No Supabase write path was added.
- No app behavior was changed.
- No local store behavior was altered.
- No Avanza automation was added.
- No broker execution was added.
- No trade mutation was added.

## Action 215 - Execution Server Capture API Contract

Date/time: 2026-06-10, Europe/Stockholm

Added a typed/documented contract for future server-side execution capture:

- Added `lib/execution-server-capture-contract.ts`.
- Added `EXECUTION_SERVER_CAPTURE_CONTRACT_VERSION`.
- Added source and environment types:
  - `ExecutionServerCaptureSource`
  - `ExecutionServerCaptureEnvironment`
- Added request/response types:
  - `ExecutionServerCaptureRequest`
  - `ExecutionServerCaptureValidationResult`
  - `ExecutionServerCaptureResponseStatus`
  - `ExecutionServerCaptureResponse`
  - `ExecutionServerCaptureIdempotencyInput`
- Added pure helpers:
  - `buildExecutionServerCaptureIdempotencyKey(...)`
  - `buildExecutionServerCaptureRequest(...)`
  - `validateExecutionServerCaptureRequest(...)`
  - `createRejectedExecutionServerCaptureResponse(...)`
  - `createAcceptedExecutionServerCaptureResponse(...)`
- Added `docs/execution-server-capture-api-contract.md` with proposed future `POST /api/execution/capture` semantics, examples, validation rules, idempotency strategy, trust boundaries, RLS/security notes, Supabase table relationships, open questions, and recommended Action 216.
- Updated persistence proposal/review/checkpoint docs to link to the new contract.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.

Safety notes:

- Contract/documentation only.
- No API route was added.
- No Supabase migration was added.
- No database code was modified.
- No Supabase write path was added.
- No app runtime behavior was changed.
- No local store behavior was altered.
- No Avanza automation was added.
- No broker execution was added.
- No trade mutation was added.

## Action 216 - Execution Server Capture API Route Stub

Date/time: 2026-06-10, Europe/Stockholm

Added a dev-only API route stub for the execution server capture contract:

- Added `app/api/execution/capture/route.ts`.
- Route: `POST /api/execution/capture`.
- The route is server-gated by `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`.
- Dev-tools-disabled builds return 403 with a contract-shaped rejection.
- Malformed JSON returns 400.
- Invalid capture requests return 400 with validation errors/warnings.
- Valid capture requests return 202 with `status: accepted`.
- Accepted response message states: `Capture request accepted by dev stub only. No Supabase write or trade mutation occurred.`
- The route uses:
  - `validateExecutionServerCaptureRequest(...)`
  - `createAcceptedExecutionServerCaptureResponse(...)`
  - `createRejectedExecutionServerCaptureResponse(...)`
- Added Playwright/API request coverage for:
  - valid accepted stub response when dev tools are enabled
  - invalid request rejection
  - malformed JSON rejection
  - dev-tools-disabled 403 behavior
- Updated `docs/execution-server-capture-api-contract.md`.
- Updated `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Dev-only validation/stub route only.
- No Supabase migration was added.
- No database code was modified.
- No Supabase write path was added.
- No app runtime capture flow was wired to the route.
- No local store behavior was altered.
- No `buildTureExecutionRecord(...)` call was added to the route.
- No execution record is created by the route.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 217 - Dev-only Capture API Client + Settings Test Button

Date/time: 2026-06-10, Europe/Stockholm

Added a frontend-safe client helper and manual Settings tester for the execution capture route stub:

- Added `lib/execution-server-capture-client.ts`.
- Added `postExecutionServerCaptureRequest(...)`.
- Client helper:
  - POSTs JSON to `/api/execution/capture`.
  - Uses `AbortController` timeout handling.
  - Parses response JSON safely.
  - Returns a normalized non-throwing result with `ok`, `statusCode`, `response`, `errors`, `warnings`, and `completedAt`.
  - Does not write localStorage or mutate anything.
- Added `Test server capture stub` in the Settings `Dev Mock Broker Results` viewer.
- The button:
  - converts the selected dev mock result to `BrokerExecutionResult`-shaped data
  - builds the matching dev mock `ExecutionIntent`
  - builds and locally validates an `ExecutionServerCaptureRequest`
  - POSTs to the dev-only route stub
  - displays accepted/rejected/disabled response status, HTTP status, idempotency key, message, errors, and warnings
  - does not create execution records
  - does not append audit events
  - does not write Supabase
  - does not mutate trades, History, or Statistics
- Updated e2e coverage to save a dev mock result, click `Test server capture stub`, verify accepted response display, and verify no execution record was created by the stub test.
- Updated `docs/execution-server-capture-api-contract.md`.
- Updated `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Dev-only route stub testing only.
- No automatic POST on render was added.
- No Supabase migration was added.
- No database code was modified.
- No Supabase write path was added.
- No local execution record is created by the new button.
- No audit event is appended by the new button.
- No local store behavior was altered.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 218 - Execution Capture Route Test Fixtures + Contract Hardening

Date/time: 2026-06-10, Europe/Stockholm

Added shared fixtures and broader validation coverage for the execution server capture contract/route:

- Added `tests/e2e/helpers/execution-server-capture-fixtures.ts`.
- Fixture exports:
  - `buildValidDevMockExecutionServerCaptureRequest()`
  - `buildInvalidExecutionServerCaptureRequestMissingIntent()`
  - `buildInvalidExecutionServerCaptureRequestMissingBrokerResult()`
  - `buildMismatchedExecutionServerCaptureRequest()`
  - `buildProductionMockExecutionServerCaptureRequest()`
- Hardened `validateExecutionServerCaptureRequest(...)`:
  - broker result `action`, when present, must be `buy` or `sell`
  - broker result `action`, when present, must match intent action
  - broker result `ticker`, when present, must match intent ticker case-insensitively
  - broker result `quantity`, when present, must match intent quantity
  - idempotency key must match `buildExecutionServerCaptureIdempotencyKey(...)`
  - production mock/dev capture remains invalid by default
- Expanded e2e coverage:
  - valid fixture validates ok
  - idempotency key is deterministic
  - missing intent validates and routes as invalid
  - missing broker result validates and routes as invalid
  - mismatched action/ticker/quantity validates and routes as invalid
  - production mock capture validates and routes as invalid
  - malformed JSON remains invalid
  - dev-tools-disabled 403 behavior remains covered
- Updated `docs/execution-server-capture-api-contract.md` with fixture list, validation matrix, idempotency determinism, and production mock behavior.
- Updated `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Test fixture/contract hardening only.
- No Supabase migration was added.
- No database code was modified.
- No Supabase write path was added.
- No local execution record write was added.
- No local store behavior was altered.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 219 - Minimal Supabase Migration Draft

Date/time: 2026-06-10, Europe/Stockholm

Added a draft-only Supabase migration for the lowest-risk execution persistence foundation:

- Added `supabase/migrations/20260610000000_execution_audit_foundation.sql`.
- Draft tables:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- Included indexes for timestamps, ids, tickers, event/status fields, and source environment/mock/dev filtering.
- Included low-risk check constraints for:
  - nullable `action` in `buy`/`sell`
  - nullable `mode` in `semi_automatic`/`automatic`
  - `broker` in `avanza`
  - `source_environment` in `local_dev`/`staging`/`production`
- Added comments documenting:
  - draft-only status
  - no app writes wired
  - no credentials/raw broker pages/session data in payloads
  - nullable `user_id` until auth ownership is finalized
  - RLS TODO because the current migration set does not show a project-wide RLS convention
- Confirmed the draft does not create:
  - `broker_execution_results`
  - `execution_records`
  - `execution_intents`
  - `broker_handoffs`
- Updated `docs/execution-persistence-schema-proposal.md`.
- Updated `docs/execution-persistence-schema-review.md`.
- Updated `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
git diff --check
```

Results:

- Diff check passed.

Safety notes:

- Migration draft/schema only.
- Migration was not applied.
- No Supabase write path was added.
- No app code writes these tables.
- No API route persistence was added.
- No broker execution result persistence was added.
- No local execution record write was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 220 - Execution Audit Persistence API Contract + Dev Stub

Date/time: 2026-06-10, Europe/Stockholm

Added validation-only contracts and route stubs for future execution audit persistence:

- Added `lib/execution-audit-persistence-contract.ts`.
- Added `EXECUTION_AUDIT_PERSISTENCE_CONTRACT_VERSION`.
- Added request types:
  - `PersistExecutionLifecycleEventRequest`
  - `PersistExecutionAgentRunRequest`
  - `PersistExecutionAgentProgressEventRequest`
- Added response type:
  - `ExecutionAuditPersistenceResponse`
- Added validation helpers:
  - `validatePersistExecutionLifecycleEventRequest(...)`
  - `validatePersistExecutionAgentRunRequest(...)`
  - `validatePersistExecutionAgentProgressEventRequest(...)`
- Added response helpers:
  - `createAcceptedExecutionAuditPersistenceResponse(...)`
  - `createRejectedExecutionAuditPersistenceResponse(...)`
- Added dev-gated route stubs:
  - `POST /api/execution/audit/lifecycle-events`
  - `POST /api/execution/audit/agent-runs`
  - `POST /api/execution/audit/agent-progress-events`
- Route behavior:
  - 403 when `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS` is not `true`
  - 400 for malformed JSON
  - 400 for invalid contract payloads
  - 202 for valid payloads
  - no Supabase writes
  - no local store writes
  - no trade mutation
  - no broker result persistence
- Added e2e coverage for:
  - valid lifecycle event accepted
  - invalid lifecycle event rejected
  - valid agent run accepted
  - valid progress event accepted
  - malformed JSON rejection
  - disabled mode 403 behavior for all three audit endpoints
- Updated `docs/execution-persistence-schema-proposal.md`.
- Updated `docs/execution-persistence-schema-review.md`.
- Updated `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- API contract/stub only.
- No migration was applied.
- No Supabase write path was added.
- No app code writes the Action 219 draft tables.
- No local store write was added.
- No broker execution result persistence was added.
- No local execution record write was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 221 - Execution Audit Persistence API Client + Dev Test Buttons

Date/time: 2026-06-10, Europe/Stockholm

Added frontend-safe client helpers and explicit dev-only Settings testers for the Action 220 audit persistence route stubs:

- Added `lib/execution-audit-persistence-client.ts`.
- Added non-throwing helpers:
  - `postPersistExecutionLifecycleEventRequest(...)`
  - `postPersistExecutionAgentRunRequest(...)`
  - `postPersistExecutionAgentProgressEventRequest(...)`
- Helpers POST JSON to the matching route stubs, use `AbortController` timeouts, parse responses safely, and return normalized HTTP/status/errors/warnings metadata.
- Added Settings `Execution Audit API Stubs` panel when execution dev tools are enabled.
- Added manual buttons:
  - `Test lifecycle event audit stub`
  - `Test agent run audit stub`
  - `Test agent progress audit stub`
- The buttons build safe local_dev/isMock/isDev sample payloads, call the route stubs, and display accepted/rejected/disabled responses.
- Expanded e2e Settings coverage to click all three buttons and verify accepted no-Supabase responses.
- Expanded dev-tools-disabled Settings coverage to verify the panel is hidden.
- Updated `docs/execution-persistence-schema-proposal.md`.
- Updated `docs/execution-agent-checkpoint.md`.

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- UI buttons are dev-gated and explicit manual actions only.
- No migration was applied.
- No Supabase write path was added.
- No localStorage write was added.
- No local audit event was appended.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 222 - Supabase Migration Apply Plan + Rollback Plan

Date/time: 2026-06-10, Europe/Stockholm

Added a documentation-only apply/rollback plan for the Action 219 execution audit foundation migration:

- Added `docs/execution-audit-migration-apply-plan.md`.
- Documented scope limited to:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- Explicitly excluded:
  - `broker_execution_results`
  - `execution_records`
  - `execution_intents`
  - `broker_handoffs`
  - History/Statistics integration
  - live trade mutation
  - broker execution
- Added preflight checklist for git state, target Supabase project, backups, auth/RLS decisions, SQL review, app write-path status, dev flags, and rollback review.
- Added staging-first apply steps with placeholder Supabase command shapes.
- Added verification SQL for table existence, columns, indexes, RLS status, and initial row counts.
- Added rollback SQL that drops tables in reverse dependency order.
- Added post-apply app checks and risk/go-no-go notes.
- Updated:
  - `docs/execution-persistence-schema-proposal.md`
  - `docs/execution-persistence-schema-review.md`
  - `docs/execution-agent-checkpoint.md`

Commands run:

```bash
git diff --check
```

Results:

- Diff check passed.

Safety notes:

- Documentation only.
- No Supabase migration command was run.
- No database state was modified.
- No Supabase write path was added.
- No API route behavior was changed.
- No local store behavior was changed.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 223 - Audit Persistence Server Writer Draft

Date/time: 2026-06-10, Europe/Stockholm

Added a pure mapping/writer draft for future execution audit persistence:

- Added `lib/execution-audit-persistence-writer.ts`.
- Added insert-shaped payload types:
  - `ExecutionLifecycleEventInsertPayload`
  - `ExecutionAgentRunInsertPayload`
  - `ExecutionAgentProgressEventInsertPayload`
- Added mapping helpers:
  - `mapLifecycleEventRequestToInsertPayload(...)`
  - `mapAgentRunRequestToInsertPayload(...)`
  - `mapAgentProgressEventRequestToInsertPayload(...)`
- Added `ExecutionAuditPersistenceWriter` interface and `createNoopExecutionAuditPersistenceWriter()`.
- The mapping helpers validate requests first and return errors without payloads for invalid requests.
- Payloads match the Action 219 draft table columns.
- JSON payload/metadata is sanitized and sensitive key names are redacted.
- `user_id` remains nullable unless a safe UUID user context is supplied.
- Text/local agent run ids are preserved in metadata when they cannot populate the UUID `agent_run_id` foreign key.
- Added e2e/contract coverage for:
  - lifecycle request mapping
  - agent run request mapping
  - agent progress request mapping
  - invalid request mapping failure
  - no-op writer result with `persisted: false`
- Updated:
  - `docs/execution-audit-migration-apply-plan.md`
  - `docs/execution-persistence-schema-proposal.md`
  - `docs/execution-persistence-schema-review.md`
  - `docs/execution-agent-checkpoint.md`

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Mapping/writer draft only.
- No migration was applied.
- No Supabase import was added to the writer draft.
- No Supabase write path was added.
- No API route was modified to persist.
- No localStorage write was added.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 224 - Audit Persistence Apply Readiness Review

Date/time: 2026-06-10, Europe/Stockholm

Added a documentation-only readiness review before applying the execution audit foundation migration:

- Added `docs/execution-audit-apply-readiness-review.md`.
- Documented current implementation state:
  - migration draft exists
  - audit route stubs exist
  - audit API client and Settings buttons exist
  - writer mapping/no-op writer exists
  - no DB writes are wired
- Added pass/pending readiness checklist for:
  - migration SQL review
  - writer/table column mapping
  - route stub validation
  - no persistence enabled
  - rollback and verification SQL
  - RLS/`user_id` local/staging caveat
  - dev/mock separation
  - excluded broker/result/history tables
- Documented risks before apply:
  - RLS TODOs
  - nullable `user_id`
  - table names becoming permanent
  - check constraint uncertainty
  - future production hardening
  - low-risk but untested DB insertion because no write route exists yet
- Documented recommendation:
  - OK for local/staging only after explicit user approval
  - not recommended for production yet
  - do not enable route persistence until after migration verification
- Updated:
  - `docs/execution-audit-migration-apply-plan.md`
  - `docs/execution-agent-checkpoint.md`

Commands run:

```bash
git diff --check
```

Results:

- Diff check passed.

Safety notes:

- Documentation only.
- No Supabase migration command was run.
- No database state was modified.
- No Supabase write path was added.
- No API route behavior was changed.
- No local store behavior was changed.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 225B - Audit Route Persistence Flag Design

Date/time: 2026-06-10, Europe/Stockholm

Added a server-only feature flag design and helper for future audit Supabase writes:

- Added `lib/execution-persistence-flags.ts`.
- Added helpers:
  - `isExecutionAuditSupabasePersistenceEnabled(...)`
  - `getExecutionPersistenceEnvironment(...)`
  - `getExecutionPersistenceEnvironmentWarnings(...)`
  - `assertExecutionAuditPersistenceAllowed(...)`
- Defaults are safe/off:
  - `EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED` must be `true`
  - `EXECUTION_PERSISTENCE_ENVIRONMENT` defaults to `local_dev`
  - unknown environments normalize to `local_dev` with a warning
  - production is blocked unless `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true`
- Added `docs/execution-audit-persistence-flag-design.md`.
- Updated:
  - `docs/execution-audit-migration-apply-plan.md`
  - `docs/execution-audit-apply-readiness-review.md`
  - `docs/execution-agent-checkpoint.md`
- Added e2e/contract coverage for:
  - default disabled
  - enabled `local_dev`
  - enabled `staging` with dev-tools warning
  - unknown environment normalization
  - production blocked without second flag
  - production allowed with second flag plus warning

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Flag/design/helper only.
- No migration was applied.
- No Supabase import was added.
- No Supabase write path was added.
- No API route was modified to persist.
- No localStorage write was added.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 226 - Audit Route Persistence Writer Wiring Behind Disabled Flag

Date/time: 2026-06-10, Europe/Stockholm

Wired the audit route success paths through the server-only persistence flag branch while keeping actual persistence disabled:

- Added `lib/execution-audit-persistence-route-handler.ts`.
- Updated route success paths:
  - `POST /api/execution/audit/lifecycle-events`
  - `POST /api/execution/audit/agent-runs`
  - `POST /api/execution/audit/agent-progress-events`
- Existing dev-tools gating remains unchanged.
- Existing JSON parsing and validation behavior remains unchanged.
- Flag-off behavior remains the accepted validation stub response.
- Flag-on `local_dev`/`staging` behavior uses the no-op writer and returns an accepted warning:
  - no database write occurred
  - no-op writer draft only
- Flag-on `production` without `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true` returns a blocked response.
- Updated `docs/execution-audit-persistence-flag-design.md`.
- Updated `docs/execution-agent-checkpoint.md`.
- Added e2e/contract coverage for:
  - flag-off route helper response
  - flag-on local no-op writer response
  - production blocked response

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Route branching only.
- No migration was applied.
- No Supabase import was added.
- No Supabase write path was added.
- No real persistence writer was implemented.
- No localStorage write was added.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 227 - Supabase Writer Implementation Draft Behind Flag

Date/time: 2026-06-10, Europe/Stockholm

Added an injected-client Supabase audit writer implementation draft:

- Added `lib/execution-audit-supabase-writer.ts`.
- Added audit table constants:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- Added `createSupabaseExecutionAuditPersistenceWriter(...)`.
- The writer:
  - checks `assertExecutionAuditPersistenceAllowed(...)`
  - maps requests with existing insert-payload helpers
  - requires an injected server DB client
  - inserts with a Supabase-like `from(table).insert(payload).select("id").single()` shape
  - returns `persisted`, `table`, `id`, `payload`, `errors`, `warnings`, and `message`
  - does not throw for normal disabled/missing-client/insert-error cases
- Routes remain on the no-op writer path by default.
- Tests use fake DB clients only and cover:
  - allowed fake insert success
  - allowed fake insert error
  - production blocked without second flag and no DB call
  - missing DB client failure without throw
- Updated:
  - `docs/execution-audit-persistence-flag-design.md`
  - `docs/execution-audit-migration-apply-plan.md`
  - `docs/execution-audit-apply-readiness-review.md`
  - `docs/execution-agent-checkpoint.md`

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Writer implementation draft only.
- No migration was applied.
- No real Supabase call was made in tests.
- No route was wired to the Supabase writer.
- No default route persistence was enabled.
- No localStorage write was added.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 228 - Audit Route Supabase Writer Wiring, Disabled by Default

Date/time: 2026-06-10, Europe/Stockholm

Prepared audit route wiring so routes can optionally use the injected-client Supabase writer, while keeping default behavior no-op/no-write:

- Added server-side flag:
  - `EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED`
- Updated `lib/execution-persistence-flags.ts`.
- Updated `lib/execution-audit-persistence-route-handler.ts`.
- Added lazy server DB client provider:
  - `app/api/execution/audit/server-db.ts`
- Updated audit routes to pass the lazy provider:
  - `POST /api/execution/audit/lifecycle-events`
  - `POST /api/execution/audit/agent-runs`
  - `POST /api/execution/audit/agent-progress-events`
- Route behavior:
  - persistence flag off: existing accepted stub response
  - persistence on + writer off: no-op writer response, no DB write
  - persistence on + writer on + missing DB client: failed response, no DB write
  - persistence on + writer on + fake/injected DB in tests: writer path can persist through injected client
  - production without `EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true`: blocked
- Added optional response metadata for writer diagnostics:
  - `persisted`
  - `writerMode`
  - `table`
- Updated `docs/execution-audit-persistence-flag-design.md`.
- Updated `docs/execution-agent-checkpoint.md`.
- Expanded e2e/contract coverage for:
  - writer flag default false
  - writer flag true while persistence disabled
  - default route stub metadata
  - no-op writer metadata
  - writer enabled missing DB client failure
  - fake DB success through route handler

Commands run:

```bash
./node_modules/.bin/tsc --noEmit
npm run lint
git diff --check
npm run test:e2e
NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=false npm run test:e2e
```

Results:

- TypeScript passed.
- Lint passed.
- Diff check passed.
- Dev-tools-enabled E2E passed.
- Dev-tools-disabled E2E passed.

Safety notes:

- Guarded route wiring only.
- Default route behavior remains no-op/no-write.
- No migration was applied.
- No real Supabase call was made in tests.
- No persistence is enabled by default.
- No localStorage write was added.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 229 - Apply Audit Migration Local/Staging and Verify Attempt

Date/time: 2026-06-10, Europe/Stockholm

Requested target environment:

- staging/dev Supabase
- explicitly not production

Preflight performed:

- Confirmed the intended migration file exists:
  - `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- Inspected migration contents and confirmed scope:
  - `execution_lifecycle_events`
  - `execution_agent_runs`
  - `execution_agent_progress_events`
- Checked git state and confirmed the worktree already contains expected in-progress Action 196-228 changes.
- Checked Supabase project command setup:
  - no `supabase/config.toml`
  - no Supabase CLI installed
  - no `psql` installed
- Checked local environment variable names without printing secrets:
  - `.env.local` only contains public/anon Supabase variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - no service-role key, database URL, or admin SQL credential is available in the shell environment

Apply result:

- Blocked before apply.
- No migration command was run.
- No Supabase migration was applied.
- No verification SQL was run against Supabase.
- No test rows were inserted.
- No test rows were deleted.
- No route persistence flags were enabled.

Commands run:

```bash
git status --short
ls supabase
sed -n '1,260p' supabase/migrations/20260610000000_execution_audit_foundation.sql
which supabase
which psql
node -e "<env-name inspection only>"
git diff --check
npm run lint
./node_modules/.bin/tsc --noEmit
npm run test:e2e
```

Results:

- Migration apply blocked due missing staging/dev SQL execution path.
- Diff check passed.
- Lint passed.
- TypeScript passed.
- E2E passed.

Required to retry:

- A confirmed staging/dev Supabase SQL execution path:
  - Supabase CLI installed and linked to the staging/dev project, or
  - staging/dev database URL usable by `psql`, or
  - an approved staging/dev SQL runner for the migration SQL

Safety notes:

- No production apply occurred.
- No database state was modified.
- No Supabase write path was enabled.
- No localStorage write was added.
- No execution record was created.
- No broker result persistence was added.
- No History or Statistics update was added.
- No trade state mutation was added.
- No Avanza automation was added.
- No broker execution was added.

## Action 230 - Supabase Apply Tooling Setup Plan

Date/time: 2026-06-10, Europe/Stockholm

Added documentation:

- `docs/supabase-migration-tooling-setup-plan.md`

Purpose:

- Document the missing migration execution path discovered during Action 229.
- Describe safe local Supabase and staging/dev Supabase setup options.
- Compare Supabase CLI, `psql`, and Supabase dashboard SQL editor choices.
- Define credential handling and non-production safety rules.
- Provide preflight checklist and placeholder commands before retrying Action 229.

Existing docs updated:

- `docs/execution-audit-migration-apply-plan.md`
- `docs/execution-audit-apply-readiness-review.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Supabase CLI was installed.
- No `psql` was installed.
- No migration command was run.
- No Supabase migration was applied.
- No database state was modified.
- No credentials were added to the repo.
- No route persistence flags were enabled.
- No app behavior changed.

Recommended next step:

- Choose `Action 231A - Configure Local Supabase Tooling` for the lowest-risk validation path, or
- choose `Action 231B - Configure Staging Supabase Link` if a specific staging/dev project ref and safe credential path are ready.

## Action 231A - Configure Local Supabase Tooling

Date/time: 2026-06-10, Europe/Stockholm

Target path:

- Local Supabase only.
- No production target.
- No staging/dev target.

Discovery performed:

- Inspected `supabase/` and confirmed the repo has:
  - `supabase/migrations/`
  - `supabase/migrations/20260610000000_execution_audit_foundation.sql`
- Confirmed `supabase/config.toml` is missing.
- Inspected `package.json` and confirmed there are no Supabase CLI scripts.
- Inspected `.gitignore` and confirmed `.env*` and `.env*.local` are ignored.
- Ran `supabase --version`; it failed because the CLI is not installed.
- Ran `which supabase`; no binary was found.
- Ran `which psql`; no binary was found.
- Searched docs/repo for existing Supabase CLI command convention; only the Action 229/230 blocker docs exist.

Outcome:

- Local Supabase tooling is not configured yet.
- No Supabase CLI was installed.
- No `psql` was installed.
- No `supabase init` was run.
- No local Supabase stack was started.
- No migration was applied.
- No remote Supabase connection was attempted.
- No credentials were added to the repo.
- No route persistence flags were enabled.
- No app behavior changed.

Docs updated:

- `docs/supabase-migration-tooling-setup-plan.md`
- `docs/execution-agent-qa-notes.md`
- `docs/execution-agent-checkpoint.md`

Next local-only step:

```bash
supabase --version
```

If missing, install/use the Supabase CLI locally with explicit approval, for example:

```bash
brew install supabase/tap/supabase
```

After the CLI exists, decide whether this repo should run:

```bash
supabase init
```

Do not apply migrations until local config exists, local services are clearly running, and a later action explicitly approves modifying the local database.

## Action 232 - Avanza UI Research Plan / Manual Mapping Checklist

Date/time: 2026-06-10, Europe/Stockholm

Added documentation:

- `docs/avanza-ui-research-plan.md`

Purpose:

- Define a manual-only research plan for future Avanza order-flow mapping.
- Document safety rules before any automation proposal.
- Provide a checklist for login/session, instrument search, action selection, quantity, order type, price, review, validation, confirmation labels, cancel/back, and timeout behavior.
- Provide a reusable mapping table template.
- Define how future Avanza observations should be compared back to the mock order fill plan and mock confirmation contracts.

Existing docs updated:

- `docs/execution-agent-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No browser automation was added.
- No scraping was added.
- No credentials were added.
- No order was submitted.
- No broker result capture from Avanza was added.
- No Supabase write was added.
- No app behavior changed.

Recommended next step:

- Action 233 - Avanza UI Research Notes Template

## Action 233 - Avanza UI Research Mapping Intake

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-ui-research-mapping.md`

Purpose:

- Convert the sanitized Avanza screenshot package description into a structured manual mapping.
- Document the observed search, search drawer/results, stock detail page, order page/forms, validation states, review step, and confirmation modal.
- Define the semi-automatic stop point at the confirmation modal.
- Document buy and sell Advanced/Stop Loss/Glidande variants.
- Define the first future support candidate as Advanced buy/sell review-only.
- Compare observed Avanza concepts to the current mock order page contract.
- List Avanza-specific fields that may later need mock/readback contract extensions.

Existing docs updated:

- `docs/avanza-ui-research-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selectors were added.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No trade state was mutated.
- No Supabase write was added.
- No app behavior changed.

Recommended next step:

- Action 234 - Avanza vs Mock Order Contract Gap Analysis

## Action 234 - Avanza vs Mock Order Contract Gap Analysis

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-vs-mock-order-contract-gap-analysis.md`

Purpose:

- Compare the sanitized Avanza UI research mapping against the current mock order and mock confirmation contracts.
- Identify P0/P1/P2 mock contract gaps before any Avanza automation discussion.
- Document future mock selectors for Avanza-like Advanced order fields.
- Document confirmation modal/readback gaps.
- Document Avanza-like validation gaps.
- Document future agent progress states needed for search, instrument selection, Advanced tab selection, form fill, review, confirmation modal detection, and waiting for manual confirmation.
- Recommend a mock-first implementation sequence for Actions 235-239.

Existing docs updated:

- `docs/avanza-ui-research-mapping.md`
- `docs/mock-agent-prototype-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No code behavior was changed.
- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selectors were added.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No trade state was mutated.
- No Supabase write was added.

Recommended next step:

- Action 235 - Mock Order Contract Avanza Advanced Fields

## Action 235 - Mock Order Contract Avanza Advanced Fields

Date/time: 2026-06-11, Europe/Stockholm

Implemented mock/dev-only updates:

- Extended `MockOrderPageFillPlan` and `MOCK_ORDER_PAGE_AGENT_SELECTORS` with Avanza Advanced-style mock order fields: account, amount SEK, price currency, instrument market, instrument currency, instrument type, Advanced order mode, review button label, confirm button label, cancel button label, valid until, estimated fees, estimated courtage, estimated FX fee, estimated total amount, and preliminary FX rate.
- Updated `/mock-broker/order` query prefill, form controls, validation, review panel readback, and stable selector coverage for those fields.
- Updated the Playwright-only mock order fill runner and manual `npm run mock-agent:run` runner to fill/review the expanded mock contract and verify final submit remains disabled.
- Expanded e2e coverage for fill-plan validation, URL metadata, stable selectors, query prefill, review readback, and disabled final submit.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL or selector was added.
- No credential was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 297 - Manual Confirmation Wait Phase Design

QA focus:

- Added
  `docs/avanza-manual-confirmation-wait-phase-design.md` as a
  documentation-only design for the future phase after `confirmation_ready`.
- The design defines allowed behavior: consume verified review-click readback,
  display `waiting_for_manual_confirmation`, keep sanitized local diagnostics,
  and stop safely on timeout/user abort.
- The design defines forbidden behavior: agent `Bekrafta kop`/`Bekrafta salj`,
  final-confirm equivalents, keyboard submit, broker-result creation, live/
  history/statistics mutation, Supabase writes, sensitive data scraping, and
  inferred execution.
- Planned statuses include `unavailable`, `confirmation_not_ready`,
  `waiting_for_manual_confirmation`, `user_cancelled`,
  `user_confirmed_unverified`, `timed_out`, `blocked`, and `failed`.
- `user_confirmed_unverified` is explicitly not a broker result; broker
  confirmation capture remains a separate future phase.

Safety checks:

- No code behavior changed.
- No Avanza automation was added.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
- No order submission or broker result was added.
- No Supabase write or trade mutation was added.

## Action 298 - Manual Confirmation Wait Result Contract

QA focus:

- Added `lib/avanza-manual-confirmation-wait-contract.ts` as a pure
  TypeScript result contract for future manual confirmation wait states.
- The evaluator requires a `confirmation_ready` review-click result before it
  can report `waiting_for_manual_confirmation`.
- Covered states include `confirmation_not_ready`,
  `waiting_for_manual_confirmation`, `user_cancelled`,
  `user_confirmed_unverified`, `timed_out`, and `blocked`.
- Final-confirm visibility is allowed only as read-only evidence by default.
- Agent final-confirm attempts, keyboard submit, unexpected broker results,
  unexpected trade mutations, and account/balance/holding/sensitive signals are
  blocked.
- `user_confirmed_unverified` warns that separate broker confirmation capture
  is required and does not create a broker result.

Test coverage:

- review not confirmation-ready -> `confirmation_not_ready`
- confirmation-ready with no observation -> `waiting_for_manual_confirmation`
- final confirm visible read-only -> wait with warning
- user cancelled -> `user_cancelled`
- timeout flag and elapsed timeout -> `timed_out`
- user confirmed -> `user_confirmed_unverified`
- agent final-confirm attempt -> `blocked`
- keyboard submit -> `blocked`
- unexpected broker result -> `blocked`
- unexpected trade mutation -> `blocked`
- account/balance/holding/sensitive signals -> `blocked`
- labels include no `Bekrafta` by agent, no broker result, and no trade
  mutation

Safety checks:

- No Avanza automation was added.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
- No order submission or broker result was added.
- No Supabase write or trade mutation was added.

## Action 296 - Review Click UI Preview

QA focus:

- The Execution Handoff Preview Modal now shows a dev-gated, read-only `Review
  click preview` section.
- The button text is `Check review-click stub`; it calls only localhost
  `/review-click` and avoids start/run/review-Avanza wording.
- Valid synthetic confirmation-ready buy/sell responses display summary,
  expected action/quantity/price, confirmation readback, field checks, safety
  labels, `waitingForManualConfirmation`, no `Bekrafta`, no broker result, and
  no trade mutation metadata.
- Synthetic mismatch, validation-error, final-confirm-click, keyboard-submit,
  and sensitive-data states surface manual-review or blocker copy.
- The dry-run readiness checklist now includes informational review-click rows
  for status, confirmation readiness, mismatch, manual-confirmation wait, no
  `Bekrafta`, and no broker result.

Safety checks:

- No Avanza automation was added.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime code.
- No browser control was added.
- No real `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission or broker result was added.
- No Supabase write or trade mutation was added.

## Action 295 - Review Click Bridge Stub Integration

Date/time: 2026-06-12, Europe/Stockholm

Updated files:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add `POST /review-click` as a localhost bridge stub for future review-click
  and confirmation-modal readback diagnostics.
- Return synthetic `AvanzaReviewClickResult`-compatible responses from explicit
  local modes.
- Keep review-click diagnostics separate from browser control, Avanza runtime
  selectors, real `Granska`, `Bekrafta`, broker results, Supabase writes, and
  trade mutation.

Contract/client coverage:

- `LocalhostBridgeReviewClickRequest`
- `LocalhostBridgeReviewClickResponse`
- `buildLocalhostBridgeReviewClickRequest(...)`
- `validateLocalhostBridgeReviewClickRequest(...)`
- `validateLocalhostBridgeReviewClickResponse(...)`
- `checkLocalhostBridgeReviewClick(...)`
- `summarizeLocalhostReviewClickBridgeResponse(...)`

Server stub modes:

- `unavailable`
- `confirmation_ready_buy`
- `confirmation_ready_sell`
- `confirmation_mismatch_action`
- `confirmation_mismatch_ticker`
- `confirmation_mismatch_quantity`
- `confirmation_mismatch_price`
- `validation_error`
- `final_confirm_visible_read_only`
- `prohibited_final_confirm_detected`
- `blocked_keyboard_submit`
- `blocked_sensitive`
- `review_label_mismatch`
- `confirmation_modal_missing`
- `form_not_ready`

Smoke/e2e coverage:

- default `/review-click` returns unavailable safely.
- missing dry-run input returns failed/400 safely.
- malformed JSON returns failed/400 safely.
- confirmation-ready buy/sell modes return `confirmation_ready`.
- mismatch modes return `confirmation_mismatch`.
- validation-error mode returns `validation_error`.
- final-confirm-visible mode remains read-only warning evidence.
- final-confirm-click attempts return `prohibited_final_confirm_detected`.
- keyboard-submit and sensitive-data modes return `blocked`.
- client normalization handles ready, mismatch, validation, final-confirm,
  keyboard, sensitive, missing-modal, form-not-ready, review-label mismatch,
  invalid JSON, and invalid dry-run input.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No review/run/start UI button was added.
- No real `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 294 - Avanza Review Click Result Contract

Date/time: 2026-06-12, Europe/Stockholm

Updated files:

- `lib/avanza-review-click-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-advanced-form-fill-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add the pure TypeScript contract for future review-click and confirmation
  modal readback diagnostics.
- Compare sanitized confirmation readback against a valid dry-run request and a
  `form_filled` Advanced form result.
- Keep this phase diagnostic-only: no browser control, no runtime `Granska`, no
  `Bekrafta`, no order submission, no broker result, no Supabase write, and no
  trade mutation.

Contract exports:

- `AVANZA_REVIEW_CLICK_CONTRACT_VERSION`
- `AVANZA_REVIEW_CLICK_PRICE_TOLERANCE`
- `AvanzaReviewClickStatus`
- `AvanzaConfirmationModalReadback`
- `AvanzaReviewClickFieldCheck`
- `AvanzaReviewClickResult`
- `evaluateAvanzaReviewClick(...)`
- `createAvanzaReviewClickResult(...)`
- `summarizeAvanzaReviewClickResult(...)`
- `getAvanzaReviewClickSafetyLabels(...)`
- `isAvanzaConfirmationReady(...)`

Coverage:

- matching sanitized confirmation readback returns `confirmation_ready`
- `confirmation_ready` sets `waitingForManualConfirmation: true`
- form not ready returns `form_not_ready`
- missing confirmation readback returns `unavailable`
- missing modal returns `failed`
- review label mismatch returns `blocked`
- action, ticker, quantity, and price mismatches return
  `confirmation_mismatch`
- visible validation errors return `validation_error`
- final-confirm visibility is allowed as read-only warning/risk evidence by
  default
- final-confirm click attempts return `prohibited_final_confirm_detected`
- keyboard submit and account/balance/holding/sensitive signals return
  `blocked`
- missing optional fees, total amount, and valid-until fields warn without
  blocking otherwise matching core confirmation readback

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No review/run/start UI button was added.
- No runtime `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- The expanded fields are local mock/dev contract fields only.

Recommended next step:

- Action 236 - Mock Confirmation Avanza Readback Fields

## Action 236 - Mock Confirmation Avanza Readback Fields

Date/time: 2026-06-11, Europe/Stockholm

Implemented mock/dev-only updates:

- Extended `MockOrderConfirmationPayload`, `buildMockOrderConfirmationUrl(...)`, `validateMockOrderConfirmationPayload(...)`, and `MOCK_ORDER_CONFIRMATION_SELECTORS` with Avanza-like readback fields: account, amount excluding fees, courtage, FX fee, preliminary FX rate, valid until, total amount, price currency, instrument market, instrument currency, instrument type, Advanced order mode, review button label, confirm button label, and cancel button label.
- Updated `/mock-broker/confirmation` query parsing and UI readback for the expanded contract.
- Added disabled readback-only final confirm/cancel controls. They cannot submit or create broker records.
- Updated the mock order review link so it manually passes the expanded fields to the mock confirmation page.
- Updated the Playwright-only mock confirmation parser and e2e coverage for rendering, link params, parsing, stable selectors, and disabled final labels.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL or selector was added.
- No credential was added.
- No order was submitted.
- No broker result was created.
- No `TureExecutionRecord` was created.
- No Supabase write was added.
- No trade state was mutated.
- The expanded fields are local mock/dev confirmation contract fields only.

Recommended next step:

- Action 237 - Mock Validation Avanza-like Errors

## Action 237 - Mock Validation Avanza-like Errors

Date/time: 2026-06-11, Europe/Stockholm

Implemented mock/dev-only updates:

- Added `MOCK_ORDER_MIN_AMOUNT_SEK` and a pure mock order form validator for required fields, invalid numbers, missing/invalid limit price, minimum amount, and unsupported order mode.
- Added stable validation selectors:
  - `mock-order-validation-errors`
  - `mock-order-validation-error`
  - `mock-order-validation-error-required`
  - `mock-order-validation-error-minimum-amount`
  - `mock-order-validation-error-unsupported-order-mode`
- Updated `/mock-broker/order` so validation failures block `Review mock order`, hide the review output/confirmation link, and keep final submit disabled.
- Expanded e2e coverage for missing account/ticker, minimum amount, unsupported order mode, and corrected valid review.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL or selector was added.
- No credential was added.
- No order was submitted.
- No broker result was created.
- No `TureExecutionRecord` was created.
- No Supabase write was added.
- No trade state was mutated.
- The validation behavior is local mock/dev only.

Recommended next step:

- Action 238 - Mock Agent Advanced-only Fill Verification

## Action 238 - Mock Agent Advanced-only Fill Verification

Date/time: 2026-06-11, Europe/Stockholm

Implemented mock/dev-only updates:

- Hardened the Playwright-only mock order fill runner to require `orderMode=advanced`, verify no validation errors are present, click only `Review mock order`, verify the review panel, verify the manual mock confirmation link, and verify final submit remains disabled.
- Added a test helper for asserting mock validation errors by category.
- Hardened `scripts/mock-order-page-agent-runner.mjs` so it returns explicit runner diagnostics:
  - `validationErrors`
  - `reviewVisible`
  - `confirmationLinkAvailable`
  - `submitDisabled`
  - `orderModeVerified`
- Updated the localhost bridge mock-agent path to surface those runner diagnostics as response-level `mockAgentRun...` metadata.
- Updated the handoff modal diagnostics display and e2e interception to show/verify those fields.
- Expanded e2e coverage for valid Advanced fill/review, unsupported order-mode failure, validation-error detection, confirmation-link verification, and disabled submit verification.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL or selector was added.
- No credential was added.
- No confirmation link is auto-opened.
- No order was submitted.
- No broker result was created.
- No `TureExecutionRecord` was created.
- No Supabase write was added.
- No trade state was mutated.
- The runner hardening is local mock/dev only.

Recommended next step:

- Action 239 - Avanza Manual Selector Notes, Still No Automation

## Action 239 - Avanza Manual Selector Notes, No Automation

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-manual-selector-notes.md`

Purpose:

- Capture manual visible-label and visual-anchor notes for future Avanza research.
- Document search drawer, stock page, Advanced order page, confirmation modal, and validation/error anchors.
- Map visible labels to existing mock order and mock confirmation fields.
- Record selector strategy principles without defining real Avanza selectors.
- Record risk notes and open questions for the next manual research session.

Existing docs updated:

- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action was documentation only.

Recommended next step:

- Action 240 - Avanza Manual Mapping QA Checklist

## Action 240 - Avanza Manual Mapping QA Checklist

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-manual-mapping-qa-checklist.md`

Purpose:

- Provide a safety-first checklist for the next manual Avanza research session.
- Cover pre-session safety, session setup, search flow, stock page, Advanced order form, validation states, confirmation modal, and Stop Loss/Glidande observation-only notes.
- Map manual observations back to the mock order and confirmation contracts.
- Provide a sanitized research output table template.
- Resolve open questions from `docs/avanza-manual-selector-notes.md`.

Existing docs updated:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action was documentation only.

Recommended next step:

- Action 241 - Avanza Manual Mapping Session Notes Intake

## Action 241 - Avanza Manual Mapping Session Notes Intake

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-manual-mapping-session-notes.md`

Purpose:

- Provide a structured intake template for future manual Avanza mapping sessions.
- Capture session metadata, safety confirmation, observed flow, screenshot index, per-step observations, form-field inventory, validation observations, confirmation modal readback, risk findings, resolved questions, new open questions, and recommended doc updates.
- Feed sanitized manual observations back into the Avanza mapping, selector-note, and mock-contract gap docs.

Existing docs updated:

- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action was documentation only.

Recommended next step:

- Action 242 - Avanza Mapping Update from Session Notes

## Action 242 - Semi-auto Avanza Prototype Safety Plan

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/semi-auto-avanza-prototype-safety-plan.md`

Purpose:

- Define safe boundaries for a possible future semi-automatic Avanza prototype before any Avanza automation code is written.
- Document the prototype objective, allowed actions, forbidden actions, hard stop states, verification gates, future progress events, manual test protocol, prerequisites, risk register, and go/no-go checklist.
- Keep the future prototype scope limited to Advanced buy/sell review-only preparation, confirmation-modal readback, and waiting for manual final confirmation.

Existing docs updated:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action was documentation only.

Recommended next step:

- Action 243 - Avanza Prototype Requirements Spec

If more sanitized Avanza research screenshots or observations are available first, use Action 243 - Avanza Manual Mapping Update From New Screenshots instead.

## Action 243 - Semi-auto Avanza Prototype Requirements Spec

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/semi-auto-avanza-prototype-requirements.md`

Purpose:

- Define documentation-only requirements for the first future semi-automatic Avanza prototype before any Avanza automation code is written.
- Capture prototype scope, functional requirements, verification requirements, safety requirements, failure states, progress-event payload expectations, data minimization/logging rules, phased test plan, acceptance criteria, and pre-implementation checklist.
- Keep the future scope limited to Advanced buy/sell order preparation, `Granska köp`/`Granska sälj`, confirmation-modal readback, and waiting for manual final confirmation.

Existing docs updated:

- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action was documentation only.

Recommended next step:

- Action 244 - Avanza Prototype Final-Confirm Block Design

This should design the technical guard that prevents any future Avanza runner from clicking final confirmation before any automation implementation is considered.

## Action 244 - Avanza Prototype Final-Confirm Block Design

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-final-confirm-block-design.md`

Purpose:

- Define a documentation-only technical safety design for preventing accidental final confirmation clicks in any future semi-automatic Avanza runner.
- Document the threat model, core principle, mode authority guard, action allowlist, selector denylist, state-machine guard, safe browser action wrapper expectations, test guard, runtime emergency stop, automatic-mode separation, progress events, test scenarios, and future implementation acceptance criteria.
- Keep confirmation modal detection as a terminal semi-auto success state and keep final confirmation as a human-only action.

Existing docs updated:

- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation was added.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action was documentation only.

Recommended next step:

- Action 245 - Safe Browser Action Contract for Future Avanza Runner

This should define pure types and helper contracts for future `safeClick`, `safeFill`, and `safeRead` actions, still without real Avanza automation, selectors, URLs, credentials, or browser automation.

## Action 245 - Safe Browser Action Contract for Future Avanza Runner

Date/time: 2026-06-11, Europe/Stockholm

Added implementation:

- `lib/safe-browser-action-contract.ts`

Added documentation:

- `docs/safe-browser-action-contract.md`

Purpose:

- Define a pure TypeScript contract/helper layer for future safe browser actions.
- Add action kinds, modes, target metadata, risk levels, final-confirm denylist terms, action creation, display/risk helpers, and validation results.
- Block semi-auto final-confirm-like `click` and `select` actions while allowing `read`, `wait_for`, and `stop` on final-confirm-like targets.
- Keep automatic final confirmation as an out-of-scope warning, not an enabled broker path.

Existing docs updated:

- `docs/avanza-final-confirm-block-design.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Test coverage:

- Semi-auto click `Bekräfta köp` is blocked.
- Semi-auto click `Bekräfta sälj` is blocked.
- Semi-auto read `Bekräfta köp` is allowed.
- Semi-auto click `Granska köp` is allowed.
- Automatic final-confirm-like click emits an out-of-scope warning.
- Critical-risk semi-auto click is blocked.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No browser automation import was added to app runtime.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action added pure contract validation only.

Recommended next step:

- Action 246 - Safe Browser Action Wrapper Design

This should design how future `safeClick`, `safeFill`, and `safeRead` wrappers would consume the pure action contract before invoking any browser tool.

## Action 246 - Safe Browser Action Runner Interface Stub

Date/time: 2026-06-11, Europe/Stockholm

Added implementation:

- `lib/safe-browser-action-runner.ts`

Purpose:

- Define a pure no-browser runner interface for future safe browser actions.
- Add execution statuses, per-action execution result shape, runner result shape, runner options, and `SafeBrowserActionRunner`.
- Add `createNoopSafeBrowserActionRunner(...)`, `runSafeBrowserActions(...)`, and `summarizeSafeBrowserActionRunnerResult(...)`.
- Validate actions through `validateSafeBrowserAction(...)` without browser calls.
- Return `validated` for allowed actions, `blocked` for blocked actions, and `skipped` for later actions when `stopOnBlocked=true`.

Existing docs updated:

- `docs/safe-browser-action-contract.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Test coverage:

- No-op runner validates `Granska köp` without execution.
- No-op runner blocks semi-auto `Bekräfta köp`.
- `stopOnBlocked=true` skips subsequent actions.
- `stopOnBlocked=false` validates subsequent allowed actions.
- `supportsRealBrowserExecution` is false.
- Missing runner fails safely without throwing.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No Playwright import was added to app/runtime code.
- No browser action was executed.
- No credentials were added.
- No scraping was added.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action added a pure no-op runner interface only.

Recommended next step:

- Action 247 - Safe Browser Action Wrapper Design

This should design how future `safeClick`, `safeFill`, and `safeRead` wrappers consume the pure action contract and no-op runner interface before any browser tool is invoked.

## Action 247 - Mock Page Safe Action Plan Builder

Date/time: 2026-06-11, Europe/Stockholm

Added implementation:

- `lib/mock-order-safe-action-plan.ts`

Purpose:

- Convert a `MockOrderPageFillPlan` into a pure `SafeBrowserAction` plan for the dev-only mock order page.
- Validate the mock fill plan first.
- Generate mock field fill/select/read actions using the mock selector contract.
- Generate a local review click action for `Review mock order` when enabled.
- Generate read actions for mock confirmation link availability and disabled final submit state.
- Keep final confirmation labels as mock form/readback data and never generate a final confirm click action.

Existing docs updated:

- `docs/safe-browser-action-contract.md`
- `docs/mock-agent-prototype-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Test coverage:

- Valid `MockOrderPageFillPlan` builds a safe action plan.
- All generated actions validate through `validateSafeBrowserAction(...)`.
- Review click validates as allowed.
- Confirm label action is not a click and is treated as mock form/readback data.
- No final confirm click action is generated.
- No-op runner validates the plan with `blockedCount=0` and `executedCount=0`.
- Injected unsafe final-confirm click makes plan validation fail.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No Playwright import was added to app/runtime code.
- No browser action was executed.
- No order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action added pure mock/dev planning and validation only.

Recommended next step:

- Action 248 - Safe Browser Action Wrapper Design

This should design how future `safeClick`, `safeFill`, and `safeRead` wrappers consume the pure action contract, mock safe-action plan, and no-op runner interface before any browser tool is invoked.

## Action 248 - Safe Browser Action Playwright Adapter for Mock Page

Date/time: 2026-06-11, Europe/Stockholm

Added test-only helper:

- `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`

Purpose:

- Execute validated `SafeBrowserAction` plans against the dev-only mock broker order page in Playwright e2e tests only.
- Validate every action before execution.
- Support only known mock `data-testid` / `data-agent-field` targets and the local mock confirmation link readback.
- Fill/select local mock fields, click only `Review mock order`, verify readbacks, and verify disabled submit state.
- Block final-confirm-like clicks, unknown click targets, disabled-submit mutation/click attempts, and external/Avanza URL-like target metadata.

Existing docs updated:

- `docs/safe-browser-action-contract.md`
- `docs/mock-agent-prototype-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Test coverage:

- Build a valid `MockOrderPageFillPlan`.
- Build a `SafeBrowserAction` plan from it.
- Execute the plan against `/mock-broker/order` through the Playwright adapter.
- Verify review panel appears.
- Verify mock confirmation link appears.
- Verify final submit remains disabled.
- Inject unsafe final-confirm click and verify the adapter blocks it before any execution.

Safety result:

- No Avanza automation was implemented.
- No Avanza page was opened from code.
- No Avanza URL was added to app runtime.
- No Avanza selector was added to runtime code.
- No Playwright import was added to app/runtime code.
- No adapter code was added outside `tests/e2e`.
- No mock order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- This action added Playwright/e2e mock-only execution of validated safe action plans.

Recommended next step:

- Completed by Action 249 - Safe Action Adapter Result Contract + Diagnostics

Action 249 standardized the adapter result shape and diagnostics before any real browser-runner work is considered.

## Action 249 - Safe Action Adapter Result Contract + Diagnostics

Date/time: 2026-06-11, Europe/Stockholm

Added pure shared helper:

- `lib/safe-browser-action-diagnostics.ts`

Purpose:

- Standardize safe browser action execution telemetry before future mock or Avanza runners report results.
- Record one step per action with action id, action kind, target description, optional mock `testId`, status, validation status, blocked flag, timestamps, errors, warnings, and metadata.
- Aggregate runner diagnostics with mode, runner name, real-browser support flag, `ok`, `blocked`, `finalConfirmBlocked`, step counts, errors, and warnings.

Updated test-only adapter:

- `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts` now returns the standardized diagnostics object alongside its existing summary fields.
- Positive mock-page runs report executed action steps, no blocked actions, no final-confirm block, and no failures.
- Injected final-confirm-like clicks report `blocked=true`, `finalConfirmBlocked=true`, and at least one blocked step.

Test coverage:

- Valid mock safe-action plan executes through the Playwright mock adapter and returns `diagnostics.ok=true`.
- Positive diagnostics assert `blocked=false`, `finalConfirmBlocked=false`, `executedCount>0`, and `failedCount=0`.
- Unsafe final-confirm click is blocked before execution and returns `finalConfirmBlocked=true`.
- Disabled mock submit remains disabled after the blocked path.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime code.
- No mock order was submitted.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
- Diagnostics are runner telemetry only, not broker confirmations or execution records.

Recommended next step:

- Action 250 - Safe Action Diagnostics Viewer or Runner Reporting Design

## Action 250 - Safe Action Diagnostics Store + Viewer

Date/time: 2026-06-11, Europe/Stockholm

Added local store:

- `lib/safe-browser-action-diagnostics-store.ts`

Storage key:

- `ture_safe_browser_action_diagnostics_v1`

Purpose:

- Store standardized `SafeBrowserActionExecutionDiagnostics` locally for dev inspection.
- Keep safe-action telemetry separate from broker results, execution records, Supabase persistence, History/Statistics, and trade state.
- Handle missing localStorage, malformed JSON, and invalid diagnostic shapes safely.
- Retain only the latest 500 diagnostics.

Updated Settings:

- Added dev-gated `Safe Browser Action Diagnostics` viewer.
- Shows total diagnostics, latest timestamp, final-confirm-blocked count, storage status, latest 50 diagnostics, per-step details, metadata, and full JSON.
- Adds Refresh and scoped Clear actions.
- Clear removes only `ture_safe_browser_action_diagnostics_v1`.

Test coverage:

- E2E seeds a sample `SafeBrowserActionExecutionDiagnostics` directly into localStorage.
- Settings viewer displays the seeded diagnostic.
- Viewer shows `Final-confirm Blocked` count and blocked step details.
- Scoped clear removes the diagnostics key.
- Dev-tools-disabled path hides the viewer.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime code.
- No browser automation was added to runtime.
- No order was submitted.
- No broker result was created.
- No execution record was created by this action.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 251 - Local Mock Agent Diagnostics Wiring

## Action 251 - Safe Action Diagnostics Integration in Mock Agent Runner

Date/time: 2026-06-11, Europe/Stockholm

Updated mock runner:

- `scripts/mock-order-page-agent-runner.mjs`

Purpose:

- Emit compatible `SafeBrowserActionExecutionDiagnostics` from the dev-only mock order page runner.
- Record mock-only fill/select/read/review steps, validation checks, confirmation-link readback, and disabled-submit verification.
- Include mock-only metadata and keep `finalConfirmBlocked=false` for the valid review path.

Updated localhost bridge:

- `scripts/avanza-localhost-bridge-server.mjs`
- `lib/avanza-localhost-bridge-contract.ts`

New optional response metadata:

- `safeActionDiagnostics`
- `safeActionDiagnosticsAvailable`
- `safeActionDiagnosticsMessage`

Updated UI:

- `app/trade-app.tsx`

Behavior:

- The dev-only `Run localhost mock agent` button still requires explicit user action.
- When the bridge returns safe-action diagnostics, the modal displays a compact summary.
- The modal appends diagnostics to the local safe-action diagnostics store.
- Settings can show the saved diagnostics through the Action 250 viewer.

Test coverage:

- Intercepted `/run` mock-agent response includes safe-action diagnostics.
- The modal displays diagnostics summary fields.
- The modal saves diagnostics locally.
- Settings viewer shows the saved diagnostics.
- The valid path reports final-confirm-blocked count `0`.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime code.
- No real broker page was automated.
- No submit was clicked.
- No broker result was created.
- No execution record was created by this action.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 252 - Safe Action Diagnostics Error/Blocked Scenario Capture

## Action 252 - Browser Runner Capability Gate

Date/time: 2026-06-11, Europe/Stockholm

Added pure helper:

- `lib/browser-runner-capability-gate.ts`

Purpose:

- Classify browser runner capabilities before any future Avanza runner exists.
- Distinguish mock-only browser execution from Avanza/broker execution.
- Block real-broker, broker-submission, final-confirm-click, automatic-capable, and unknown browser capabilities by default.

Capability types:

- `BrowserRunnerTargetEnvironment`
- `BrowserRunnerExecutionCapability`
- `BrowserRunnerCapabilityValidationResult`

Helpers:

- `createMockOnlyBrowserRunnerCapability(...)`
- `validateBrowserRunnerCapability(...)`
- `summarizeBrowserRunnerCapabilityValidation(...)`
- `classifyDiagnosticsCapability(...)`

Default validation:

- mock-only `mock_order_page` capability validates as `safe_mock_only`.
- `avanza_broker` capability is blocked unless a future dry-run gate allows it.
- broker submission capability is blocked by default.
- final-confirm click capability is blocked by default.
- unknown target environment is blocked by default.

Updated diagnostics metadata/UI:

- Mock-agent diagnostics now include `targetEnvironment: "mock_order_page"`, `supportsBrokerSubmission: false`, `supportsFinalConfirmClick: false`, `mockOnly: true`, and `devOnly: true`.
- Execution Handoff Preview Modal displays `Mock-only browser diagnostics`, `No broker submission`, and `Final confirm disabled`.
- Settings Safe Browser Action Diagnostics viewer displays capability safety level, target environment, broker-submission status, final-confirm status, and an unknown-blocked warning for missing/unknown capability metadata.

Test coverage:

- Mock-only capability validates as allowed.
- Avanza broker capability is blocked by default.
- Broker submission capability is blocked by default.
- Unknown environment is blocked.
- Settings viewer labels seeded mock diagnostics as mock-only/no broker submission.
- Settings viewer labels seeded unknown diagnostics as `unknown_blocked`.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime code.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 253 - Avanza Dry-Run Capability Spec

## Action 253 - Avanza Dry-Run Capability Spec

Date/time: 2026-06-11, Europe/Stockholm

Created documentation:

- `docs/avanza-dry-run-capability-spec.md`

Purpose:

- Define a future Avanza dry-run capability separately from mock-only browser execution.
- Clarify that dry-run means browser navigation, fill, review, confirmation readback, and safe stop behavior only.
- Keep dry-run separate from broker execution, broker results, Supabase writes, and trade mutation.

Capability classification documented:

- `targetEnvironment: "avanza_broker"`
- `mockOnly: false`
- `devOnly: true` initially
- `supportsBrowserExecution: true`
- `supportsBrokerSubmission: false`
- `supportsFinalConfirmClick: false`
- `automaticModeCapable: false`

Required future gates documented:

- execution dev tools enabled
- `allowAvanzaDryRun=true`
- `semi_automatic` mode
- `allowBrokerSubmission=false`
- `allowFinalSubmit=false`
- no final-confirm click support
- user manually starts the dry-run
- user watches the browser

Allowed future dry-run actions documented:

- detect session/login state only
- search and select a verified instrument
- open buy/sell order form
- verify Advanced mode
- fill quantity and price
- click only `Granska köp` or `Granska sälj`
- read confirmation modal
- stop at `waiting_for_manual_confirmation`

Forbidden future dry-run actions documented:

- click `Bekräfta köp` or `Bekräfta sälj`
- submit forms or keyboard-submit
- use automatic mode
- create `brokerResult`
- persist execution records
- mutate trades, History, Statistics, or live positions
- scrape balances/holdings
- store credentials or session data

Updated docs:

- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/safe-browser-action-contract.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime code.
- No browser runner was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 254 - Extend Capability Gate with Dry-Run Classification

## Action 254 - Extend Capability Gate with Dry-Run Classification

Date/time: 2026-06-11, Europe/Stockholm

Updated pure helper:

- `lib/browser-runner-capability-gate.ts`

Added helper:

- `createAvanzaDryRunBrowserRunnerCapability(...)`

Validation behavior:

- `avanza_broker` remains blocked by default.
- An Avanza dry-run capability validates as `dry_run_only` only when `allowAvanzaDryRun=true`.
- Dry-run validation requires browser execution support and no broker submission, no final-confirm click, and no automatic-mode capability.
- Broker submission support remains `real_broker_blocked`.
- Final-confirm click support remains `real_broker_blocked`.
- Automatic-capable browser runners remain blocked by default.
- Unknown capabilities remain `unknown_blocked`.

Updated diagnostics/UI:

- Settings Safe Browser Action Diagnostics can label allowed dry-run metadata as `Avanza dry-run diagnostics`.
- Settings still shows `No broker submission` and `Final confirm disabled`.
- Seeded Avanza broker-submission diagnostics are labeled blocked through the capability gate.
- Execution Handoff Preview Modal capability labels can display `Avanza dry-run diagnostics` if future response metadata includes a valid dry-run diagnostic.

Test coverage:

- Avanza dry-run capability is blocked by default.
- Avanza dry-run capability validates as `dry_run_only` when `allowAvanzaDryRun=true`.
- Avanza broker-submission capability is blocked as `real_broker_blocked`.
- Avanza final-confirm-click capability is blocked as `real_broker_blocked`.
- Avanza automatic-capable runner is blocked unless explicitly allowed, and does not count as dry-run.
- Settings viewer labels seeded Avanza dry-run diagnostics.
- Settings viewer labels seeded Avanza broker-submission diagnostics as blocked.

Docs updated:

- `docs/avanza-dry-run-capability-spec.md`
- `docs/safe-browser-action-contract.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime code.
- No browser runner was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 255 - Avanza Dry-Run Request Contract

## Action 255 - Avanza Dry-Run Request Contract

Date/time: 2026-06-11, Europe/Stockholm

Added pure helper:

- `lib/avanza-dry-run-request-contract.ts`

Purpose:

- Define the input shape for a future Avanza dry-run runner.
- Apply safe defaults for Advanced order mode, manual account review, and stop-at-confirmation behavior.
- Validate future dry-run order inputs before any browser runner exists.
- Keep dry-run request validation separate from browser execution and broker execution.

Types/constants:

- `AvanzaDryRunAction`
- `AvanzaDryRunOrderMode`
- `AvanzaDryRunAccountPolicy`
- `AvanzaDryRunStopPolicy`
- `AvanzaDryRunInstrumentIdentity`
- `AvanzaDryRunOrderInput`
- `AvanzaDryRunRequestValidationResult`
- `AVANZA_DRY_RUN_REQUEST_CONTRACT_VERSION`
- `DEFAULT_AVANZA_DRY_RUN_ORDER_MODE`
- `DEFAULT_AVANZA_DRY_RUN_STOP_POLICY`
- `DEFAULT_AVANZA_DRY_RUN_ACCOUNT_POLICY`

Helpers:

- `createAvanzaDryRunOrderInput(...)`
- `validateAvanzaDryRunOrderInput(...)`
- `summarizeAvanzaDryRunOrderInput(...)`
- `isAvanzaDryRunSubmitBlocked(...)`
- `getAvanzaDryRunSafetyLabels(...)`

Validation coverage:

- valid buy dry-run request
- valid sell dry-run request
- missing ticker blocked
- zero/negative quantity blocked
- zero/negative price blocked
- unsupported order mode blocked
- `require_exact_match` without account label blocked
- metadata `allowFinalSubmit=true` blocked
- metadata `supportsBrokerSubmission=true` blocked
- metadata `supportsFinalConfirmClick=true` blocked
- metadata `automaticModeCapable=true` blocked
- missing currency/market produce manual-verification warnings

Docs updated:

- `docs/avanza-dry-run-capability-spec.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/safe-browser-action-contract.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser runner was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 256 - Execution Intent to Avanza Dry-Run Request Adapter

## Action 256 - Execution Intent to Avanza Dry-Run Request Adapter

Date/time: 2026-06-11, Europe/Stockholm

Added pure helper:

- `lib/execution-intent-to-avanza-dry-run.ts`

Purpose:

- Convert Ture execution intent/handoff data into a validated `AvanzaDryRunOrderInput`.
- Keep future Avanza dry-run request shaping separate from browser execution.
- Preserve the no-submit, no-broker-result dry-run boundary.

Types/helpers:

- `ExecutionIntentToAvanzaDryRunInput`
- `ExecutionIntentToAvanzaDryRunResult`
- `buildAvanzaDryRunOrderInputFromExecutionIntent(...)`
- `summarizeExecutionIntentToAvanzaDryRunResult(...)`

Adapter behavior:

- extracts buy/sell action
- extracts ticker/market from the trading package
- extracts positive integer quantity
- extracts price from `limit_price`, with sell fallback to `target_price` then `stop_loss`
- carries recommendation id and execution intent id
- forces Advanced mode and stop-at-confirmation policy
- defaults account policy to `require_manual_review`
- attaches safe metadata with no final submit, no broker submission, no final-confirm click, and no automatic mode
- validates through `validateAvanzaDryRunOrderInput(...)`

Test coverage:

- valid buy execution intent converts to a valid dry-run request.
- valid sell/exit execution intent converts to a valid dry-run request.
- missing ticker blocks.
- missing quantity blocks.
- missing price blocks.
- unsupported action blocks.
- automatic/final-submit authority blocks.
- unsafe metadata blocks.
- summary includes no broker submission and stop at confirmation.

Docs updated:

- `docs/avanza-dry-run-capability-spec.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/safe-browser-action-contract.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser runner was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 257 - Avanza Dry-Run Request Preview in Handoff Modal

## Action 257 - Avanza Dry-Run Request Preview in Handoff Modal

Date/time: 2026-06-11, Europe/Stockholm

Updated UI:

- `app/trade-app.tsx`

Added dev-only read-only modal section:

- `Avanza dry-run request preview`

Preview source:

- `buildAvanzaDryRunOrderInputFromExecutionIntent(...)`
- `getAvanzaDryRunSafetyLabels(...)`
- `summarizeAvanzaDryRunOrderInput(...)`

Preview displays:

- validation status
- action
- ticker
- instrument name when available
- quantity
- price
- order mode
- account policy
- stop policy
- source recommendation id
- execution intent id
- safety labels

Safety labels:

- Avanza dry-run only
- Advanced order mode
- Stop at confirmation modal
- No broker submission
- No final confirmation
- No broker result
- Final confirm disabled
- Manual account review

Test coverage:

- handoff modal shows the dry-run request preview for the dev fixture.
- preview shows no broker submission, stop at confirmation, final confirm disabled, and manual account review.
- preview shows request values.
- modal has no Avanza run/start/open button.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser runner was added.
- No Avanza run button was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 258 - Avanza Dry-Run Readiness Checklist Panel

## Action 258 - Avanza Dry-Run Readiness Checklist Panel

Date/time: 2026-06-11, Europe/Stockholm

Updated UI:

- `app/trade-app.tsx`

Added dev-only read-only modal section:

- `Avanza dry-run readiness`

Purpose:

- Show that Avanza dry-run cannot be started yet.
- Distinguish valid request data from missing runner implementation.
- Surface dry-run capability-gate status without enabling a runner.

Checklist rows:

- Dev tools enabled
- Execution mode is `semi_automatic`
- Avanza dry-run request is valid
- Default capability gate
- Dry-run capability classification
- Broker submission disabled
- Final confirm disabled
- Automatic mode disabled
- Avanza runner implementation missing
- Avanza selectors/URLs missing intentionally
- User manual final confirmation required

Overall status:

- `Not ready to run` by default because no Avanza runner exists.
- Invalid request, automatic mode, broker submission, or final-confirm authority are displayed as blocked states.

Test coverage:

- handoff modal shows the readiness panel for the dev fixture.
- panel displays `Not ready to run`.
- panel displays missing runner copy.
- panel displays broker submission disabled, final confirm disabled, and user manual final confirmation required.
- panel displays default gate blocked and explicit `dry_run_only` classification.
- modal still has no Avanza run/start/open button.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser runner was added.
- No Avanza run button was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 259 - Avanza Dry-Run Runner Implementation Plan

## Action 259 - Avanza Dry-Run Runner Implementation Plan

Date/time: 2026-06-11, Europe/Stockholm

Added documentation:

- `docs/avanza-dry-run-runner-implementation-plan.md`

Purpose:

- Plan the first future Avanza dry-run runner before any runner code is written.
- Define dry-run as order preparation, review, confirmation-modal readback, and safe stop only.
- Keep broker execution, final confirmation, broker results, Supabase writes, and trade mutation out of scope.

Plan sections:

- purpose
- non-negotiable boundaries
- proposed architecture
- required flags and gates
- execution flow
- stop and failure states
- diagnostics requirements
- staged test strategy
- future UI behavior
- security and privacy notes
- explicit out-of-scope items
- recommended next action

Required future gates documented:

- execution dev tools enabled
- future Avanza dry-run UI flag enabled
- `allowAvanzaDryRun=true`
- execution mode `semi_automatic`
- `allowFinalSubmit=false`
- `allowBrokerSubmission=false`
- automatic mode disabled
- manual user final confirmation required
- runner implementation exists
- runner self-check passes

Future flow documented:

- validate request
- validate capability
- detect watched browser/session state
- search and verify exact instrument
- open order entry
- verify Advanced mode
- fill quantity and price
- verify form values
- click only review
- detect/read confirmation modal
- emit `waiting_for_manual_confirmation`
- stop

Stop/failure states documented:

- final confirm visible
- final confirm click attempted
- ambiguous or wrong instrument
- wrong action/account/price/quantity
- validation error
- unsupported tab/order mode
- unexpected layout
- session timeout or login challenge
- user abort
- runner self-check failed

Diagnostics requirements documented:

- `SafeBrowserActionExecutionDiagnostics` required
- `targetEnvironment: "avanza_broker"`
- `dryRunOnly: true`
- `mockOnly: false`
- `supportsBrokerSubmission: false`
- `supportsFinalConfirmClick: false`
- no sensitive account/balance/holding data
- no raw DOM dumps
- no unsanitized screenshots

Docs updated:

- `docs/avanza-dry-run-capability-spec.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/safe-browser-action-contract.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser runner was added.
- No run/start button was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 260 - Avanza Dry-Run Runner Self-Check Contract

## Action 260 - Avanza Dry-Run Runner Self-Check Contract

Date/time: 2026-06-11, Europe/Stockholm

Added pure helper:

- `lib/avanza-dry-run-runner-self-check.ts`

Purpose:

- Let a future Avanza dry-run runner report capabilities, safety boundaries, and readiness without controlling a browser.
- Represent the current missing-runner state explicitly as `unavailable`.
- Distinguish mock-only diagnostics from true Avanza `available_dry_run_only` readiness.
- Keep broker-submission and final-confirm-capable runners blocked.

Types/constants:

- `AVANZA_DRY_RUN_RUNNER_SELF_CHECK_VERSION`
- `AvanzaDryRunRunnerSelfCheckStatus`
- `AvanzaDryRunRunnerSelfCheckInput`
- `AvanzaDryRunRunnerSelfCheckOptions`
- `AvanzaDryRunRunnerSelfCheckResult`

Helpers:

- `createUnavailableAvanzaDryRunRunnerSelfCheck(...)`
- `evaluateAvanzaDryRunRunnerSelfCheck(...)`
- `summarizeAvanzaDryRunRunnerSelfCheck(...)`
- `getAvanzaDryRunRunnerSelfCheckLabels(...)`

Status behavior:

- `unavailable`: current no-runner state.
- `available_mock_only`: mock browser diagnostics can exist, but cannot run Avanza dry-run.
- `available_dry_run_only`: Avanza dry-run capability is valid only when explicitly allowed.
- `blocked`: capability validation blocks the runner.
- `failed`: self-check could not classify safely.

Updated UI:

- `app/trade-app.tsx`

The dev-only Avanza dry-run readiness panel now uses `createUnavailableAvanzaDryRunRunnerSelfCheck(...)` for the current missing-runner blocker. The panel remains read-only and still shows `Not ready to run`.

Test coverage:

- unavailable self-check returns `ok=false` and `status="unavailable"`.
- mock-only capability returns `available_mock_only` with a warning that it cannot run Avanza dry-run.
- Avanza dry-run capability is blocked by default.
- Avanza dry-run capability returns `available_dry_run_only` when `allowAvanzaDryRun=true`.
- broker-submission capability is blocked.
- final-confirm capability is blocked.
- labels/summary include no broker submission and final confirm disabled.
- handoff modal displays the unavailable self-check blocker.

Docs updated:

- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser runner was added.
- No run/start button was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 261 - Avanza Dry-Run Safe Action Plan Contract

## Action 261 - Localhost Bridge Runner Self-Check Endpoint Contract

Date/time: 2026-06-11, Europe/Stockholm

Updated contract:

- `lib/avanza-localhost-bridge-contract.ts`

Added endpoint path:

- `GET /self-check`

Added response type:

- `LocalhostBridgeRunnerSelfCheckResponse`

Added validation:

- `validateLocalhostBridgeRunnerSelfCheckResponse(...)`

Response pattern:

- HTTP/bridge `ok=true` means the localhost bridge answered the self-check contract.
- Nested `selfCheck.ok=false` can still report the current no-runner state.
- Default status is `unavailable`.
- Mock-only status is `available_mock_only` and does not mean Avanza dry-run capability.

Updated client:

- `lib/avanza-localhost-bridge-client.ts`

Added helper:

- `checkLocalhostBridgeRunnerSelfCheck(...)`

Client behavior:

- calls `GET /self-check`
- validates and normalizes safely
- handles timeout/network/malformed responses without throwing in normal usage
- performs no browser automation

Updated server stub:

- `scripts/avanza-localhost-bridge-server.mjs`

Server behavior:

- `GET /self-check` returns unavailable by default.
- `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=mock_only` can return mock-only metadata for local diagnostics.
- The endpoint does not open a browser, touch Avanza, fill forms, submit orders, create broker results, write Supabase, or mutate trades.

Updated UI:

- `app/trade-app.tsx`

Added dev-only read-only modal control:

- `Check localhost runner self-check`

Displayed fields:

- reachable
- HTTP OK
- self-check OK
- status
- safety level
- can run Avanza dry-run
- can submit broker order
- readiness labels
- blockers
- warnings/errors

Test coverage:

- pure self-check response validation and client normalization
- localhost bridge server smoke now verifies default unavailable `/self-check`
- modal displays unavailable self-check response
- modal displays no-runner blocker
- modal displays mock-only self-check response
- modal labels mock-only as not Avanza dry-run capable
- modal still has no Avanza run/start/open button

Docs updated:

- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime.
- No Avanza browser runner was added.
- No Avanza run/start button was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 262 - Avanza Dry-Run Safe Action Plan Contract

## Action 262 - Localhost Self-Check Integration into Readiness Panel

Date/time: 2026-06-11, Europe/Stockholm

Updated UI:

- `app/trade-app.tsx`

Purpose:

- Feed the latest localhost `/self-check` result into the read-only Avanza dry-run readiness panel.
- Make runner-readiness states visually distinct without enabling Avanza dry-run execution.

Readiness behavior:

- no self-check run: default unavailable/no-runner state
- `unavailable`: overall `Not ready to run`
- `available_mock_only`: overall `Not ready for Avanza dry-run`
- `available_dry_run_only`: overall `Dry-run runner available`
- `blocked`: overall `Blocked: runner self-check blocked`
- `failed`: overall `Blocked: runner self-check failed`

New/updated checklist rows:

- Localhost self-check status
- Runner capability
- Runner Avanza dry-run capable
- Runner can submit broker order
- Runner can click final confirm

Display details:

- latest self-check status and timestamp
- self-check readiness labels
- broker submission remains disabled
- final confirm remains disabled
- manual final confirmation remains required

Test coverage:

- intercepted unavailable `/self-check` updates the readiness panel as not ready/no runner
- intercepted mock-only `/self-check` updates the readiness panel as mock-only and not Avanza dry-run ready
- intercepted dry-run-only `/self-check` updates the readiness panel as dry-run runner available
- dry-run-only state still shows no broker submission and final confirm disabled
- no Avanza run/start/open button appears in any state

Docs updated:

- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/execution-agent-checkpoint.md`

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime.
- No Avanza browser runner was added.
- No Avanza run/start button was added.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 263 - Avanza Dry-Run Safe Action Plan Contract

## Action 263 - Avanza Dry-Run Bridge Request Contract

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `lib/avanza-localhost-bridge-contract.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/execution-agent-checkpoint.md`

Purpose:

- Add `POST /dry-run` as a localhost bridge contract stub for future Avanza dry-run requests.
- Validate `AvanzaDryRunOrderInput`, capability options, and safety metadata without creating a runner.
- Return safe `not_implemented` or `blocked` responses.

Contract behavior:

- Valid request with `allowAvanzaDryRun=true` validates as dry-run-only capability but returns `status="not_implemented"` because no Avanza dry-run runner exists.
- Missing/invalid dry-run request data returns `status="blocked"`.
- Unsafe `allowBrokerSubmission=true`, `allowAutomaticMode=true`, final-submit metadata, broker-submission metadata, final-confirm metadata, or automatic-mode metadata is blocked.
- Response includes warnings:
  - Avanza dry-run runner is not implemented.
  - No browser actions were executed.
  - No broker submission was performed.
- `diagnostics` remains `null` or absent because no safe-action runner executed.

Smoke coverage:

- localhost bridge smoke calls `POST /dry-run` with a valid dry-run contract payload.
- smoke verifies `status="not_implemented"`, dry-run validation ok, no executed diagnostics, and no `brokerResult`.
- smoke calls `POST /dry-run` with unsafe broker/final-submit metadata and verifies the request is blocked.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime.
- No Avanza browser runner was added.
- No Avanza run/start button was added.
- No browser actions are executed by `/dry-run`.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 264 - Avanza Dry-Run Bridge Client Contract Preview

## Action 264 - Localhost Dry-Run Bridge Client Stub

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `lib/avanza-localhost-bridge-client.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`

Purpose:

- Add a frontend-safe client helper for the Action 263 `POST /dry-run` bridge stub.
- Keep the helper unused by UI execution controls.

Client behavior:

- `runLocalhostBridgeAvanzaDryRunStub(...)` builds a
  `LocalhostBridgeDryRunRequest`.
- It posts to `/dry-run`.
- It applies a timeout with `AbortController`.
- It safely parses and validates contract-shaped JSON.
- It returns a non-throwing normalized result with `ok`, `reachable`, `status`,
  `statusCode`, `response`, `summary`, `errors`, `warnings`, and `elapsedMs`.
- `summarizeLocalhostDryRunBridgeResponse(...)` summarizes
  `not_implemented`, `unavailable`, `blocked`, `accepted_stub`, and failed
  responses.

Failure handling:

- invalid dry-run input is rejected before fetch
- network failure returns unavailable
- timeout returns a safe timeout summary
- non-JSON response returns an invalid-response result
- blocked unsafe response remains `ok=false`

Test coverage:

- valid mocked `/dry-run` `not_implemented` response normalizes safely
- helper posts to `/dry-run` with no-browser/no-broker metadata
- blocked response normalizes safely
- invalid/non-JSON response fails safely
- network failure fails safely
- unsafe input fails before the fetch function is called

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime.
- No Avanza browser runner was added.
- No Avanza run/start button was added.
- No browser actions are executed.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 265 - Avanza Dry-Run Stub Response Display Plan

## Action 265 - Dry-Run Bridge Response UI Preview

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/execution-agent-checkpoint.md`

Purpose:

- Add a dev-gated, read-only handoff-modal panel for testing the localhost
  `/dry-run` bridge stub response.
- Display normalized response metadata without adding an Avanza run/start
  control.

UI behavior:

- Panel title: `Dry-run bridge response preview`
- Button text: `Test dry-run bridge stub`
- Copy: `Read-only stub check. No browser actions. No broker submission.`
- Safety labels:
  - No browser actions were executed
  - No broker submission
  - No broker result
  - No trade mutation
  - Stub only

Result display:

- summary
- status
- client ok
- HTTP status
- elapsed time
- dry-run request validation status
- capability safety level
- capability blocked status
- diagnostics none/present
- response metadata for no browser actions/no broker submission/no broker
  result
- errors and warnings

Test coverage:

- modal shows the dry-run bridge response preview and safe labels
- intercepted `not_implemented` `/dry-run` response displays summary/status and
  safety metadata
- intercepted `blocked` `/dry-run` response displays blocked summary/errors
- no `Run Avanza`, `Start Avanza`, or `Open Avanza` button appears

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime.
- No Avanza browser runner was added.
- No Avanza run/start button was added.
- No browser actions are executed.
- No broker submit was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 266 - Avanza Dry-Run Runner Skeleton

## Action 266 - Avanza Dry-Run Runner Skeleton

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `scripts/avanza-dry-run-runner-skeleton.mjs`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/execution-agent-checkpoint.md`

Purpose:

- Add a local dry-run runner skeleton that can participate in bridge
  self-check and dry-run request contracts without controlling a browser.
- Keep default bridge behavior unavailable/not implemented unless the explicit
  skeleton env mode is enabled.

Skeleton mode:

- Env flag: `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton`
- `/self-check` reports `available_dry_run_only` with:
  - `skeletonOnly: true`
  - `noBrowserControl: true`
  - `supportsBrokerSubmission: false`
  - `supportsFinalConfirmClick: false`
  - `automaticModeCapable: false`
- `/dry-run` accepts a valid safe request as `status="accepted_stub"` and
  reports that no browser actions, broker submission, broker result, Supabase
  write, or trade mutation occurred.

Smoke coverage:

- default bridge `/self-check` still reports unavailable.
- default bridge `/dry-run` still reports `not_implemented`.
- skeleton-mode bridge `/self-check` reports dry-run skeleton metadata.
- skeleton-mode bridge `/dry-run` returns safe `accepted_stub` metadata.
- smoke verifies no `brokerResult` is returned.

E2E coverage:

- readiness self-check intercept can surface dry-run skeleton labels such as
  `Skeleton only` and `No browser control`.
- dry-run bridge response preview can display skeleton `accepted_stub`
  warnings and safe labels.
- the modal still has no `Run Avanza`, `Start Avanza`, or `Open Avanza`
  control.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to app/runtime.
- No browser control was added.
- No Avanza run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 292 - Advanced Form Fill UI Preview

Scope:

- Updated `app/trade-app.tsx`.
- Updated `tests/e2e/execution-sandbox.spec.ts`.
- Updated `docs/avanza-advanced-form-fill-phase-design.md`.
- Updated `docs/avanza-localhost-bridge-contract.md`.
- Updated `docs/avanza-dry-run-runner-implementation-plan.md`.
- Updated `docs/execution-agent-checkpoint.md`.
- Updated `docs/execution-agent-qa-notes.md`.

QA coverage:

- Handoff modal shows the dev-gated `Advanced form-fill preview` panel.
- The panel button is `Check Advanced form-fill stub`, not a real Avanza
  fill/review/run/start/order button.
- E2E intercepts `/advanced-form-fill` for synthetic `form_filled`,
  quantity mismatch, price mismatch, validation error, unsupported Stop Loss
  mode, prohibited review/`Granska`, prohibited final-confirm/`Bekrafta`,
  keyboard submit block, and order-page-not-ready states.
- E2E verifies summary/status, expected action/quantity/price, sanitized form
  state, field checks, readiness copy, risk flags, and safety labels.
- Dev-tools-off fixture path hides the preview.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No real form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 293 - Avanza Review Click Phase Design

Scope:

- Added `docs/avanza-review-click-phase-design.md`.
- Updated `docs/avanza-advanced-form-fill-phase-design.md`.
- Updated `docs/avanza-order-page-open-phase-design.md`.
- Updated `docs/avanza-dry-run-runner-implementation-plan.md`.
- Updated `docs/avanza-manual-mapping-refresh-pack.md`.
- Updated `docs/semi-auto-avanza-prototype-safety-plan.md`.
- Updated `docs/semi-auto-avanza-prototype-requirements.md`.
- Updated `docs/avanza-final-confirm-block-design.md`.
- Updated `docs/execution-agent-checkpoint.md`.
- Updated `docs/execution-agent-qa-notes.md`.

Design coverage:

- Defines the future phase after verified Advanced form-fill.
- Allows only a future separately approved matching `Granska kop` or
  `Granska salj` click plus sanitized confirmation-modal readback.
- Requires stopping at `waiting_for_manual_confirmation`.
- Defines planned inputs, statuses, review-click policy, confirmation modal
  verification, final-confirm hard block, safe action requirements, hard stops,
  privacy/data-minimization rules, UI behavior, test plan, and graduation
  criteria.
- Recommends `Action 294 - Avanza Review Click Result Contract` as pure
  TypeScript only.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No Avanza review/run/start button was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 291 - Advanced Form Fill Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-advanced-form-fill-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add `POST /advanced-form-fill` as a localhost bridge stub for future Advanced
  form-fill result diagnostics.
- Add request/response contract validation and frontend-safe client
  normalization through `checkLocalhostBridgeAdvancedFormFill(...)`.
- Keep the endpoint synthetic and non-executing.

Stub modes covered:

- `unavailable`
- `form_filled_buy`
- `form_filled_sell`
- `field_mismatch_quantity`
- `field_mismatch_price`
- `field_mismatch_ticker`
- `validation_error`
- `unsupported_order_mode_stop_loss`
- `unsupported_order_mode_glidande`
- `prohibited_review_detected`
- `prohibited_final_confirm_detected`
- `blocked_keyboard_submit`
- `blocked_account_change`
- `blocked_sensitive`
- `order_page_not_ready`
- `missing_form_state`

QA coverage:

- contract validates valid and missing-input Advanced form-fill requests
- client normalization covers filled buy/sell, quantity/price mismatch,
  validation error, unsupported mode, prohibited review/final-confirm,
  keyboard submit, order-page-not-ready, missing form state, invalid JSON, and
  invalid dry-run input
- bridge smoke covers default unavailable, malformed input, filled buy/sell,
  mismatch, validation error, unsupported mode, prohibited review/final-confirm,
  and keyboard-submit block

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No real form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 288 - Order Page Open UI Preview

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-order-page-open-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA coverage:

- Handoff modal shows the dev-gated `Order page open preview` panel.
- The panel button is `Check order-page-open stub`, not a run/start/open
  Avanza button.
- E2E intercepts `/order-page-open` for synthetic buy opened, sell opened,
  wrong-action, ticker mismatch, currency mismatch, final-confirm block, and
  review/`Granska` attempt block states.
- E2E verifies status, expected action, order-page identity, field checks,
  readiness copy, risk flags, and safety labels.
- Dev-tools-off fixture path hides the preview.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No real order page was opened.
- No form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 289 - Avanza Advanced Form Fill Phase Design

Scope:

- Added `docs/avanza-advanced-form-fill-phase-design.md`.
- Updated phase, safety, mapping, checkpoint, and QA docs to reference the new
  Advanced form-fill design.
- Documentation only.

Design coverage:

- Purpose and scope for the future phase after `order_page_opened`.
- Allowed behavior: consume `order_page_opened`, verify action/instrument,
  verify Advanced mode, fill quantity/`antal`, fill price/course/`kurs`,
  optionally read amount/fees/totals/currency, verify readbacks, and emit
  sanitized diagnostics.
- Forbidden behavior: `Granska`, `Bekrafta`, submit, keyboard submit, account
  changes without future explicit policy, Stop Loss/Glidande, unsupported order
  modes, account/balance/holdings reads, broker results, Supabase writes, and
  trade mutation.
- Planned statuses: `unavailable`, `order_page_not_ready`,
  `unsupported_order_mode`, `form_filled`, `field_mismatch`,
  `validation_error`, `prohibited_review_detected`,
  `prohibited_final_confirm_detected`, `blocked`, and `failed`.
- Field policy, Advanced-mode policy, verification policy, safe action
  requirements, hard stops, privacy/data-minimization rules, UI behavior, test
  plan, and graduation criteria.

Recommended next action:

- Action 290 - Avanza Advanced Form Fill Result Contract

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No form-fill runtime was added.
- No Avanza form-fill/run/start button was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 290 - Avanza Advanced Form Fill Result Contract

Scope:

- Added `lib/avanza-advanced-form-fill-contract.ts`.
- Added e2e/contract coverage in `tests/e2e/execution-sandbox.spec.ts`.
- Updated phase/checkpoint/QA docs.
- Pure TypeScript only.

Contract exports:

- `AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION`
- `AvanzaAdvancedFormFillStatus`
- `AvanzaAdvancedFormState`
- `AvanzaAdvancedFormFillFieldCheck`
- `AvanzaAdvancedFormFillRiskFlag`
- `AvanzaAdvancedFormFillResult`
- `evaluateAvanzaAdvancedFormFill(...)`
- `createAvanzaAdvancedFormFillResult(...)`
- `summarizeAvanzaAdvancedFormFillResult(...)`
- `getAvanzaAdvancedFormFillSafetyLabels(...)`
- `isAvanzaAdvancedFormFilled(...)`

Coverage:

- matching Advanced form returns `form_filled`
- order page not `order_page_opened` returns `order_page_not_ready`
- missing sanitized form state returns `unavailable`
- Stop Loss, Glidande, and unknown mode return `unsupported_order_mode`
- action/ticker mismatch returns `field_mismatch`
- missing/invalid/mismatched quantity returns `field_mismatch`
- missing/invalid/mismatched price/course returns `field_mismatch`
- validation messages return `validation_error`
- review/`Granska` attempts return `prohibited_review_detected`
- final-confirm visible/attempted returns `prohibited_final_confirm_detected`
- keyboard submit, account change, unsupported field touch, account/balance/
  holdings/sensitive signals return `blocked`
- review button visible only is allowed with warning by default and can be
  strict-blocked with options

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No runtime form fill was added.
- No Avanza form-fill/run/start button was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next action:

- Action 291 - Advanced Form Fill Bridge Stub Contract

Recommended next step:

- Action 267 - Avanza Dry-Run Skeleton Diagnostics Shape

## Action 267 - Dry-Run Skeleton Smoke Test Matrix

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`

Purpose:

- Formalize localhost bridge smoke coverage as a mode/endpoint matrix.
- Verify default, mock-only, dry-run skeleton, unsafe request, missing input,
  and invalid JSON behavior without adding any browser automation.

Smoke matrix now covers:

- default `/health` -> available, no real broker automation.
- default `/self-check` -> `unavailable`, no Avanza dry-run capability.
- default valid `/dry-run` -> `not_implemented`, no `brokerResult`, no
  executed diagnostics.
- default unsafe `/dry-run` -> `blocked`, broker-submission/final-confirm
  metadata blocked.
- default missing-input `/dry-run` -> `blocked`.
- default invalid-JSON `/dry-run` -> `blocked` with server surviving parse
  failure.
- `mock_only` `/self-check` -> `available_mock_only`, not Avanza dry-run
  capable.
- `mock_only` valid `/dry-run` -> `not_implemented`.
- `dry_run_skeleton` `/self-check` -> `available_dry_run_only` with skeleton
  and no-browser-control metadata.
- `dry_run_skeleton` valid `/dry-run` -> `accepted_stub`, no browser actions,
  no broker submission, no `brokerResult`.
- `dry_run_skeleton` unsafe `/dry-run` -> `blocked` before skeleton acceptance.

Smoke output:

- The script prints a compact table with:
  - mode
  - endpoint
  - expected status
  - actual status
  - pass/fail
  - key safety guarantees

Verification:

- `node --check scripts/avanza-localhost-bridge-server-smoke.mjs` passed.
- `npm run bridge:localhost:smoke` passed after localhost bind approval for
  ports `47832`, `47833`, and `47834`.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No Avanza run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 268 - Avanza Manual Mapping Refresh Pack

## Action 268 - Avanza Manual Mapping Refresh Pack

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Prepare the next manual Avanza UI validation pass before any
  session-detection/search-only runner design.
- Confirm whether current mapping docs, mock contracts, and dry-run request
  assumptions still match the live UI.
- Keep this phase manual-only and documentation-only.

Refresh pack contents:

- safety rules for manual-only observation.
- session setup table for browser, viewport, language, market state,
  instrument, buy/sell path, order-mode tab state, account selector behavior,
  and remembered tab/account/order type.
- required manual flows:
  - search entry point
  - instrument page
  - Advanced order page
  - review step
  - confirmation modal
  - cancel/exit path
- screenshot/notes index template.
- field mapping table template.
- validation mapping table template.
- confirmation readback mapping table template.
- post-session decision checklist.
- green/yellow/red outcome categories.

Doc links:

- Session notes now point to the refresh pack before a new session.
- QA checklist now identifies the refresh pack as the session wrapper.
- Research mapping now requires a refresh before session-detection/search-only
  runner planning.
- Manual selector notes now say refreshed labels remain manual anchors, not
  runtime selectors.
- Dry-run runner plan now lists the refresh pack in the manual mapping phase.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No Avanza run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- If mapping is unchanged: Action 269 - Avanza Session Detection Only Design
- If mapping changed: Action 269 - Avanza Mapping Refresh Update
- If screenshots are provided: Action 269 - Avanza Screenshot Mapping Review

## Action 269 - Avanza Session Detection Only Design

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the first future Avanza-adjacent runner phase as session detection
  only.
- Allow only sanitized browser/session readiness classification before any
  search-only design.
- Keep all order-flow interaction forbidden.

Allowed future detection scope:

- browser connection exists
- generic page context class
- login wall vs app shell vs unknown
- Avanza UI appears visible/reachable
- readiness/blocked state
- local diagnostics with sanitized context

Forbidden:

- click
- type
- search
- navigate to Avanza
- open an order page
- fill fields
- read balances
- read holdings
- read account or personal identifiers
- store raw HTML
- submit anything
- create broker result
- write Supabase
- mutate trade state

Planned result statuses:

- `unavailable`
- `browser_not_connected`
- `avanza_not_visible`
- `login_required`
- `ready_for_search_only`
- `blocked`
- `failed`

Privacy rules:

- no account numbers
- no balances
- no holdings
- no credentials
- no cookies/session tokens/browser storage
- no raw page HTML
- redact sensitive labels
- keep diagnostics local only

Graduation criteria:

- manual mapping refreshed or explicitly deferred
- pure session detection contract implemented and tested
- no sensitive data stored
- user can clearly see status
- no click/type/navigation behavior exists
- dry-run remains unavailable beyond detection

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No Avanza run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 270 - Avanza Session Detection Result Contract

## Action 270 - Avanza Session Detection Result Contract

Date/time: 2026-06-11, Europe/Stockholm

Updated files:

- `lib/avanza-session-detection-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future Avanza session detection.
- Represent readiness/blocked/unavailable states without controlling a browser
  or touching Avanza.

Contract file:

- `lib/avanza-session-detection-contract.ts`

Types:

- `AvanzaSessionDetectionStatus`
- `AvanzaSessionDetectionContext`
- `AvanzaSessionDetectionResult`

Statuses:

- `unavailable`
- `browser_not_connected`
- `avanza_not_visible`
- `login_required`
- `ready_for_search_only`
- `blocked`
- `failed`

Helpers:

- `createAvanzaSessionDetectionResult(...)`
- `evaluateAvanzaSessionDetectionContext(...)`
- `summarizeAvanzaSessionDetectionResult(...)`
- `getAvanzaSessionDetectionSafetyLabels(...)`
- `isAvanzaSessionReadyForSearchOnly(...)`

Safety behavior:

- `browserConnected=false` -> `browser_not_connected`
- `avanzaVisible=false` or host class `other` -> `avanza_not_visible`
- logged out/login challenge/login page -> `login_required`
- sensitive data detected -> `blocked`
- confirmation modal context -> `blocked`
- order page context -> `blocked`
- logged-in app shell/instrument/unknown non-sensitive Avanza context ->
  `ready_for_search_only`
- malformed context -> `failed`

Test coverage:

- browser not connected
- Avanza not visible
- logged out/login challenge
- sensitive data blocked
- confirmation modal blocked
- order page blocked
- logged-in app shell ready for search-only
- factory-created result
- malformed context failure
- summaries and safety labels
- no-browser/no-broker/no-final-confirm metadata

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No Avanza run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

Recommended next step:

- Action 271 - Avanza Session Detection Bridge Stub Contract

## Action 271 - Session Detection Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a localhost bridge `GET /session-detection` contract and stub.
- Return `AvanzaSessionDetectionResult`-compatible metadata from explicit
  local stub modes only.
- Keep session detection separate from browser control and Avanza interaction.

Endpoint:

- `GET /session-detection`

Stub mode flag:

- `AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE`

Supported modes:

- `unavailable` default
- `browser_not_connected`
- `avanza_not_visible`
- `login_required`
- `ready_for_search_only`
- `blocked_sensitive`
- `blocked_order_page`

Client helper:

- `checkLocalhostBridgeSessionDetection(...)`
- `summarizeLocalhostSessionDetectionBridgeResponse(...)`

Smoke coverage:

- default `/session-detection` returns unavailable/no-runner metadata.
- `ready_for_search_only` mode returns synthetic ready-for-search-only
  metadata.
- `login_required` mode returns synthetic login-required metadata.
- `blocked_sensitive` mode returns synthetic blocked metadata.
- all session-detection smoke rows assert:
  - no `brokerResult`
  - no executed diagnostics
  - no browser actions executed
  - no Avanza page touched
  - no broker submission

Test coverage:

- contract validation for localhost session-detection responses.
- client normalization for ready-for-search-only, login-required, and blocked
  sensitive-data responses.
- invalid JSON failure path.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No Avanza run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 287 - Order Page Open Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-order-page-open-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA coverage:

- Bridge smoke now covers default `/order-page-open`, missing dry-run input,
  invalid JSON, opened buy/sell, wrong action, ticker/currency mismatch,
  prohibited prefill, final-confirm block, review/`Granska` attempt block,
  keyboard-submit block, sensitive-data block, and instrument-page-not-ready.
- E2E/client normalization covers valid request building, response validation,
  opened, mismatch, wrong action, prefill, blocked states, not-ready,
  missing identity, invalid JSON, and invalid dry-run input.
- Smoke assertions require no `brokerResult`, no executed diagnostics, no
  browser actions, no Avanza page touched, no form fill, no review click, no
  final-confirm click, no broker submission, and no trade mutation.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No order-page/run/start button was added.
- No form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 284 - Instrument Page UI Preview

Purpose:

- Add a dev-gated, read-only `Instrument page preview` panel to the Execution
  Handoff Preview Modal.
- Let the user manually check the localhost `/instrument-page` stub for the
  current Avanza dry-run request instrument.
- Include the latest verified instrument result when available, while warning
  that the real phase would require verified instrument identity.
- Keep the preview informational only.

UI coverage:

- The panel button is `Check instrument-page stub`; no start/run/open/search or
  order button was added.
- The panel displays normalized summary, status, `ok`, elapsed time, sanitized
  page identity fields, field checks, warnings, blockers, risk flags, safety
  labels, and response metadata.
- The readiness checklist now includes instrument-page status, page identified,
  page mismatch, prohibited controls visible, and no order page opened rows.
- `page_identified` shows `Ready for future order-page-open design` for
  information only.
- page mismatch shows manual-review copy.
- buy/sell-visible warning states show `Buy/sell controls visible - no click
  allowed`.
- blocked states show blockers and risk flags.

E2E coverage:

- page-identified stub response renders page identity, field checks, safety
  labels, and readiness rows.
- buy/sell-visible response renders guarded warning metadata only.
- page-mismatch response renders manual-review status.
- blocked order-page response renders blockers and risk flags.
- dev-tools-off hides the preview.
- no Avanza run/start/search/open/order button is present.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No browser control was added.
- No order page was opened.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 285 - Avanza Order Page Open Phase Design

Purpose:

- Create `docs/avanza-order-page-open-phase-design.md`.
- Define the future phase after an identified instrument page.
- Scope the phase to opening and verifying an order page only.
- Keep the work documentation-only.

Design coverage:

- allowed future behavior:
  - consume `page_identified` instrument-page results
  - verify requested `buy`/`sell` action
  - click only a matching entry `Kop` or `Salj` control in a separately
    approved future runner
  - verify order page opened for the expected action/instrument
  - stop immediately after order-page-open verification
- forbidden behavior:
  - quantity fill
  - price fill
  - account change
  - order-type change
  - `Granska kop` / `Granska salj`
  - `Bekrafta kop` / `Bekrafta salj`
  - keyboard submit
  - account/balance/holdings reads
  - broker result creation
  - Supabase writes
  - trade mutation
- planned statuses:
  - `unavailable`
  - `instrument_page_not_ready`
  - `action_not_supported`
  - `order_page_opened`
  - `order_page_mismatch`
  - `wrong_action_opened`
  - `prohibited_form_interaction_detected`
  - `blocked`
  - `failed`
- safe-action requirements:
  - all clicks must go through safe action validation
  - entry buy/sell click is high risk and phase-scoped
  - final-confirm denylist remains active
  - `Granska` and form-fill actions remain forbidden

Docs updated:

- `docs/avanza-instrument-page-phase-design.md`
- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/execution-agent-checkpoint.md`

Recommended next action:

- Action 286 - Avanza Order Page Open Result Contract

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No order-page/run/start button was added.
- No form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 286 - Avanza Order Page Open Result Contract

Files changed:

- `lib/avanza-order-page-open-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-order-page-open-phase-design.md`
- `docs/avanza-instrument-page-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future Avanza order-page-open
  checks.
- Compare expected dry-run action/instrument with sanitized order-page identity.
- Return safe `order_page_opened`, `order_page_mismatch`,
  `wrong_action_opened`, `prohibited_form_interaction_detected`,
  `instrument_page_not_ready`, `action_not_supported`, `blocked`,
  `unavailable`, or `failed` states.
- Keep order-page-open diagnostics separate from browser control, Avanza
  runtime selectors, form fills, review clicks, final-confirm clicks, broker
  results, Supabase writes, and trade mutation.

Contract coverage:

- `AvanzaOrderPageOpenAction`
- `AvanzaOrderPageOpenStatus`
- `AvanzaOrderPageOpenRiskFlag`
- `AvanzaOrderPageIdentity`
- `AvanzaOrderPageOpenFieldCheck`
- `AvanzaOrderPageOpenInput`
- `AvanzaOrderPageOpenResult`
- `evaluateAvanzaOrderPageOpen(...)`
- `createAvanzaOrderPageOpenResult(...)`
- `summarizeAvanzaOrderPageOpenResult(...)`
- `getAvanzaOrderPageOpenSafetyLabels(...)`
- `isAvanzaOrderPageOpened(...)`

E2E contract coverage:

- page identified plus matching buy order page -> `order_page_opened`
- page identified plus matching sell order page -> `order_page_opened`
- instrument page not identified -> `instrument_page_not_ready`
- unsupported action -> `action_not_supported`
- wrong attempted action -> `wrong_action_opened`
- wrong opened order-page action -> `wrong_action_opened`
- ticker mismatch -> `order_page_mismatch`
- currency mismatch -> `order_page_mismatch`
- missing order page identity -> `unavailable`
- confirmation modal context -> `blocked`
- final confirm visible -> `blocked`
- review/final-confirm click attempt metadata -> `blocked`
- keyboard submit metadata -> `blocked`
- prefilled form -> `prohibited_form_interaction_detected`
- account/balance/holdings/sensitive signals -> `blocked`
- review button visible only -> allowed with warning by default
- strict review-visible mode -> `prohibited_form_interaction_detected`
- summaries and safety labels include no form fill, no `Granska`, no
  `Bekrafta`, no broker submission, and no trade mutation

Recommended next action:

- Action 287 - Order Page Open Bridge Stub Contract

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No order-page/run/start/open button was added.
- No form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 272 - Session Detection Readiness UI Preview

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a dev-gated, read-only Session-detection preview to the Execution Handoff
  Preview Modal.
- Let the user manually call the localhost `GET /session-detection` stub.
- Display normalized status, summary, labels, blockers, warnings, sanitized
  context, and no-browser/no-broker metadata.
- Feed the latest result into informational readiness rows without activating
  search-only or dry-run behavior.

UI behavior:

- Section title: `Session-detection preview`
- Button text: `Check session-detection stub`
- Safety copy:
  - No browser control
  - No Avanza page touched
  - No broker submission
  - No broker result
  - Stub only

Readiness rows added:

- Session detection status
- Ready for search-only
- Session detection no browser actions
- Session detection no Avanza page touched

Test coverage:

- Intercepted `ready_for_search_only` response displays the ready summary,
  `Ready for future search-only phase`, and safety labels.
- Intercepted `login_required` response displays login-required status and
  readiness warning.
- Intercepted `blocked_sensitive` response displays blocked status and
  sensitive-data blocker.
- The modal still has no Avanza run/start/search button.
- Dev-tools-off path hides the section with the rest of the dev-only modal.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No search/run/start button was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 273 - Avanza Search-Only Phase Design

Files changed:

- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the future Avanza search-only phase after session detection.
- Scope search-only to sanitized instrument candidate lookup only.
- Document allowed/forbidden behavior before any browser-control code exists.

Design coverage:

- Purpose and scope.
- Required prerequisites.
- Planned search-only input fields.
- Planned candidate result statuses:
  - `unavailable`
  - `session_not_ready`
  - `search_not_available`
  - `no_match`
  - `ambiguous`
  - `exact_match`
  - `blocked`
  - `failed`
- Candidate field shape.
- Exact-match policy.
- Hard stops.
- Privacy/data minimization.
- Future UI behavior.
- Test plan.
- Graduation criteria to instrument-verification phase.

Explicitly forbidden:

- Open order page.
- Click `Köp` or `Sälj`.
- Click trade/order actions.
- Fill quantity, price, amount, account, validity, or order-mode fields.
- Read balances, holdings, account identifiers, personal identifiers, or raw
  DOM/HTML.
- Submit anything.
- Create broker results or execution records.
- Write Supabase.
- Mutate trade state.

Recommended next step:

- Completed by Action 274 - Avanza Search-Only Result Contract.
- Next recommended step: Action 275 - Avanza Search-Only Bridge Stub Contract.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No search/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 274 - Avanza Search-Only Result Contract

Files changed:

- `lib/avanza-search-only-result-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future Avanza search-only candidate
  classification.
- Keep the phase limited to sanitized candidate results only.
- Add no browser control, Avanza selectors, Avanza URLs, search button, order
  page behavior, broker result, Supabase write, or trade mutation.

Contract coverage:

- Statuses:
  - `unavailable`
  - `session_not_ready`
  - `search_not_available`
  - `no_match`
  - `ambiguous`
  - `exact_match`
  - `blocked`
  - `failed`
- Candidate fields:
  - `candidateId`
  - `displayName`
  - `ticker`
  - `market`
  - `currency`
  - `instrumentType`
  - `matchConfidence`
  - `sanitizedSource`
  - `riskFlags`
  - `warnings`
- Risk flags for mismatch, duplicate ticker, missing market/currency/type,
  low confidence, sensitive data, and order-flow detection.
- Summary, safety-label, exact-match, normalization, scoring, and
  classification helpers.

Validation and classification behavior:

- Exact match requires a sufficiently strong score and no required-field risk.
- Duplicate ticker candidates become `ambiguous` by default.
- Empty candidate lists become `no_match`.
- Ticker mismatches become `no_match` when no safe exact match exists.
- Missing currency/market/type can warn or prevent exact match when required by
  options.
- Sensitive-data and order-flow risk flags hard-block the result.

Test coverage:

- Exact candidate score and exact-match classification.
- Safety labels and metadata flags for no order page, no buy/sell click, no
  broker submission, no broker result, and no trade mutation.
- No-match classification.
- Duplicate/ambiguous candidate classification.
- Ticker-mismatch no-match classification.
- Missing currency risk with required currency matching.
- Sensitive-data blocked classification.
- Order-flow blocked classification.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No search/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 275 - Search-Only Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a non-executing localhost bridge `POST /search-only` contract and stub.
- Return synthetic `AvanzaSearchOnlyResult`-compatible responses from explicit
  local stub modes.
- Keep search-only separate from browser control, Avanza UI interaction, order
  pages, broker results, Supabase writes, and trade mutation.

Contract/client coverage:

- Added `LocalhostBridgeSearchOnlyRequest`.
- Added `LocalhostBridgeSearchOnlyResponse`.
- Added `buildLocalhostBridgeSearchOnlyRequest(...)`.
- Added `validateLocalhostBridgeSearchOnlyRequest(...)`.
- Added `validateLocalhostBridgeSearchOnlyResponse(...)`.
- Added `checkLocalhostBridgeSearchOnly(...)`.
- Added `summarizeLocalhostSearchOnlyBridgeResponse(...)`.

Server stub modes:

- unset / `unavailable` -> `search_not_available`
- `search_not_available` -> `search_not_available`
- `exact_match` -> synthetic exact candidate
- `ambiguous` -> synthetic duplicate-ticker ambiguity
- `no_match` -> synthetic ticker mismatch/no match
- `blocked_sensitive` -> synthetic sensitive-data block
- `blocked_order_flow` -> synthetic order-flow block
- `session_not_ready` -> synthetic readiness blocker

Smoke coverage:

- default `/search-only` returns `search_not_available`
- missing expected instrument fails safely
- invalid JSON fails safely
- exact-match mode returns synthetic `exact_match`
- ambiguous mode returns synthetic `ambiguous`
- no-match mode returns synthetic `no_match`
- blocked-sensitive mode returns `blocked`
- blocked-order-flow mode returns `blocked`
- all search-only rows assert no `brokerResult`, no executed diagnostics, no
  browser actions, no Avanza page touch, and no order page opened

E2E/client coverage:

- exact-match response validates and normalizes.
- ambiguous response normalizes.
- no-match response normalizes.
- blocked order-flow response surfaces errors.
- invalid/non-JSON response fails safely.
- missing ticker is rejected before fetch.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No search/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 276 - Search-Only UI Preview In Handoff Modal

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a dev-gated, read-only `Search-only preview` panel to the Execution
  Handoff Preview Modal.
- Let the user manually check the localhost `/search-only` stub for the current
  Avanza dry-run request instrument.
- Display exact, ambiguous, no-match, and blocked synthetic candidate results.
- Add informational readiness rows for search-only status, exact match,
  ambiguity, and no order page opened.

UI behavior:

- Button label is `Check search-only stub`.
- The button is disabled when the current dry-run request has no valid expected
  instrument.
- Exact match can show `Ready for future instrument-verification phase`, but
  this is informational only.
- Ambiguous results show `Manual review required`.
- No-match and blocked results stop at read-only diagnostics.

E2E coverage:

- exact-match stub response displays selected candidate and future
  instrument-verification readiness text.
- ambiguous stub response displays candidate list and manual-review copy.
- no-match stub response displays no-match stop text.
- blocked order-flow stub response displays blocker/risk details.
- dev-tools-off path hides the preview.
- repeated assertions verify no Avanza run/start/search/order button appears.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No real search behavior was added.
- No search/run/start/order button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 277 - Avanza Instrument Verification Phase Design

Files changed:

- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the future instrument-verification phase after search-only exact
  match.
- Scope verification to sanitized instrument identity comparison only.
- Keep the phase separate from order pages, buy/sell clicks, order forms,
  broker results, Supabase writes, and trade mutation.

Design coverage:

- Purpose and scope.
- Allowed and forbidden behavior.
- Required prerequisites.
- Planned verification inputs.
- Planned statuses:
  - `unavailable`
  - `search_not_ready`
  - `missing_candidate`
  - `verified`
  - `rejected`
  - `ambiguous`
  - `blocked`
  - `failed`
- Verification policy for ticker, name, market, currency, instrument type,
  duplicate candidates, critical risk flags, and partial matches.
- Hard stops for missing candidate, non-exact search result, identity mismatch,
  sensitive data, order page, buy/sell/trade action, order-field target,
  unexpected UI, stale mapping, user abort, and self-check failure.
- Privacy/data minimization rules.
- Future UI boundaries.
- Test plan and graduation criteria.

Recommended next action:

- Action 278 - Avanza Instrument Verification Result Contract

Safety result:

- No code behavior was changed.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No verify/search/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 278 - Avanza Instrument Verification Result Contract

Files changed:

- `lib/avanza-instrument-verification-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future Avanza instrument
  verification.
- Compare expected instrument identity with a selected search-only candidate.
- Return safe verified, rejected, ambiguous, blocked, missing-candidate,
  search-not-ready, failed, or unavailable results.
- Keep verification separate from browser control, Avanza runtime selectors,
  order pages, forms, broker results, Supabase writes, and trade mutation.

Contract coverage:

- `AvanzaInstrumentVerificationStatus`
- `AvanzaInstrumentVerificationFieldStatus`
- `AvanzaInstrumentVerificationFieldCheck`
- `AvanzaInstrumentVerificationRiskFlag`
- `AvanzaInstrumentVerificationInput`
- `AvanzaInstrumentVerificationResult`
- `verifyAvanzaInstrument(...)`
- `createAvanzaInstrumentVerificationResult(...)`
- `summarizeAvanzaInstrumentVerificationResult(...)`
- `getAvanzaInstrumentVerificationSafetyLabels(...)`
- `isAvanzaInstrumentVerified(...)`

E2E contract coverage:

- exact search-only result plus matching selected candidate -> `verified`
- ambiguous search-only status -> `ambiguous`
- missing selected candidate -> `missing_candidate`
- ticker mismatch -> `rejected`
- market mismatch -> `rejected`
- currency mismatch -> `rejected`
- missing candidate currency while expected currency exists -> `ambiguous`
- low confidence -> `ambiguous`
- sensitive-data candidate risk -> `blocked`
- order-flow candidate risk -> `blocked`
- summaries and safety labels include no order page, no form fill, no broker
  submission, and no trade mutation

Recommended next action:

- Action 279 - Instrument Verification Bridge Stub Contract

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No verify/search/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 279 - Instrument Verification Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a localhost bridge `POST /instrument-verification` contract and
  non-executing server stub for future instrument identity verification.
- Add a frontend-safe client helper,
  `checkLocalhostBridgeInstrumentVerification(...)`, plus a response summary
  helper.
- Return synthetic verified, rejected, ambiguous, blocked, search-not-ready,
  missing-candidate, unavailable, and failed states only.

Bridge/stub coverage:

- default valid request returns synthetic `unavailable`
- missing expected instrument returns `failed`
- malformed JSON returns `failed`
- verified mode returns `verified`
- rejected-ticker mode returns `rejected`
- ambiguous-missing-currency mode returns `ambiguous`
- blocked-order-flow mode returns `blocked`
- every response asserts no `brokerResult`, no browser actions, no Avanza page
  touch, no order page, and no trade mutation

E2E/client coverage:

- request builder validates a valid expected instrument
- response validator accepts a verified synthetic response
- client helper normalizes verified, rejected, ambiguous, blocked,
  missing-candidate, and search-not-ready responses
- invalid/non-JSON response fails safely
- missing ticker is rejected before fetch

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No verify/search/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 280 - Instrument Verification UI Preview In Handoff Modal

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a dev-gated, read-only `Instrument verification preview` panel to the
  Execution Handoff Preview Modal.
- Let the user manually check the localhost `/instrument-verification` stub for
  the current Avanza dry-run request instrument.
- Include the latest exact search-only selected candidate when available.
- Display verified, rejected, ambiguous, and blocked synthetic instrument
  verification results.
- Add informational readiness rows for instrument-verification status,
  verified/rejected/ambiguous state, and no order page opened.

UI behavior:

- Button label is `Check instrument-verification stub`.
- The button is disabled when the current dry-run request has no valid expected
  instrument.
- If no exact search-only candidate exists, the panel warns that real
  verification would require one while still allowing synthetic stub checks.
- Verified results can show `Ready for future instrument-page phase`, but this
  is informational only.
- Rejected and ambiguous results show manual-review copy.
- Blocked results show the blocker/risk details.

E2E coverage:

- verified stub response displays field checks and future instrument-page
  readiness text.
- rejected ticker response displays rejected/manual-review copy.
- ambiguous missing-currency response displays ambiguous/manual-review copy.
- blocked order-flow response displays blocker/risk details.
- dev-tools-off path hides the preview.
- repeated assertions verify no Avanza verify/run/start/search/order button
  appears.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No real instrument verification behavior was added.
- No verify/search/run/start/order button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 281 - Avanza Instrument Page Phase Design

Files changed:

- `docs/avanza-instrument-page-phase-design.md`
- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the future Avanza instrument-page phase after verified instrument
  identity.
- Scope the phase to non-order instrument-page identity observation only.
- Keep order pages, buy/sell clicks, form filling, submissions, broker results,
  Supabase writes, and trade mutation out of scope.

Design coverage:

- Purpose and scope.
- Allowed and forbidden behavior.
- Required prerequisites.
- Planned inputs.
- Planned statuses:
  - `unavailable`
  - `verification_not_ready`
  - `page_not_open`
  - `page_identified`
  - `page_mismatch`
  - `prohibited_order_controls_detected`
  - `blocked`
  - `failed`
- Page identity policy for ticker, name, market, currency, instrument type, and
  order-page blocking.
- Prohibited control policy for buy/sell controls, order-page navigation,
  order-entry fields, keyboard submit, and final-confirm-like controls.
- Hard stops for wrong page, order page, buy/sell click attempt, order-field
  targets, account/balance/holding data, sensitive data, unexpected UI, and
  user abort.
- Privacy/data minimization rules.
- Future UI boundaries.
- Test plan and graduation criteria.

Recommended next action:

- Action 282 - Avanza Instrument Page Result Contract

Safety result:

- No code behavior was changed.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No instrument-page/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 282 - Avanza Instrument Page Result Contract

Files changed:

- `lib/avanza-instrument-page-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-instrument-page-phase-design.md`
- `docs/avanza-instrument-verification-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future Avanza instrument-page
  identity checks.
- Compare expected/verified instrument identity with sanitized page identity.
- Return safe page-identified, page-mismatch, prohibited-control, blocked,
  page-not-open, verification-not-ready, unavailable, or failed states.
- Keep page identity separate from browser control, Avanza runtime selectors,
  order pages, forms, broker results, Supabase writes, and trade mutation.

Contract coverage:

- `AvanzaInstrumentPageStatus`
- `AvanzaInstrumentPageRiskFlag`
- `AvanzaInstrumentPageIdentity`
- `AvanzaInstrumentPageFieldCheck`
- `AvanzaInstrumentPageInput`
- `AvanzaInstrumentPageResult`
- `evaluateAvanzaInstrumentPage(...)`
- `createAvanzaInstrumentPageResult(...)`
- `summarizeAvanzaInstrumentPageResult(...)`
- `getAvanzaInstrumentPageSafetyLabels(...)`
- `isAvanzaInstrumentPageIdentified(...)`

E2E contract coverage:

- verified instrument plus matching page identity -> `page_identified`
- verification not verified -> `verification_not_ready`
- missing page identity -> `page_not_open`
- ticker mismatch -> `page_mismatch`
- currency mismatch -> `page_mismatch`
- missing page currency -> `page_mismatch`
- order-page context -> `blocked`
- order form visible -> `blocked`
- final confirm visible -> `blocked`
- account/balance/holdings/sensitive signals -> `blocked`
- buy/sell buttons visible while identity matches -> `page_identified` with
  warnings/risk flags
- buy/sell buttons visible with strict prohibited-control policy ->
  `prohibited_order_controls_detected`
- summaries and safety labels include no order page, no buy/sell click, no form
  fill, no broker submission, and no trade mutation

Recommended next action:

- Action 285 - Order Page Open Phase Design

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No instrument-page/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 283 - Instrument Page Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-instrument-page-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a non-executing localhost bridge `POST /instrument-page` contract and
  stub for future instrument-page identity diagnostics.
- Return synthetic `AvanzaInstrumentPageResult`-compatible responses from
  explicit local stub modes.
- Keep instrument-page identity checks separate from browser control, Avanza
  runtime selectors, order pages, forms, broker results, Supabase writes, and
  trade mutation.

Contract/client coverage:

- `LocalhostBridgeInstrumentPageRequest`
- `LocalhostBridgeInstrumentPageResponse`
- `buildLocalhostBridgeInstrumentPageRequest(...)`
- `validateLocalhostBridgeInstrumentPageRequest(...)`
- `validateLocalhostBridgeInstrumentPageResponse(...)`
- `checkLocalhostBridgeInstrumentPage(...)`
- `summarizeLocalhostInstrumentPageBridgeResponse(...)`

Server stub modes:

- `unavailable`
- `page_identified`
- `page_identified_with_buy_sell_visible`
- `page_mismatch_ticker`
- `page_mismatch_currency`
- `page_mismatch_missing_field`
- `prohibited_controls`
- `blocked_order_page`
- `blocked_order_form`
- `blocked_final_confirm`
- `blocked_sensitive`
- `verification_not_ready`
- `page_not_open`

Smoke/e2e coverage:

- default `/instrument-page` returns unavailable safely.
- missing expected instrument returns failed/400 safely.
- malformed JSON returns failed/400 safely.
- page identified returns `page_identified`.
- buy/sell-visible mode returns `page_identified` with guarded warnings/risk
  flags only.
- mismatch mode returns `page_mismatch`.
- blocked order-page/final-confirm/sensitive modes return `blocked`.
- client normalization handles page identified, warning, mismatch, blocked,
  page-not-open, verification-not-ready, invalid JSON, and missing ticker.
- all bridge responses assert no `brokerResult`, no executed diagnostics, no
  browser actions, no Avanza page touched, no order page opened, no buy/sell
  click, no form fill, no broker submission, and no trade mutation.

Recommended next action:

- Action 285 - Order Page Open Phase Design

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No instrument-page/run/start button was added.
- No order page behavior was added.
- No buy/sell click was added.
- No form fill was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
## Action 299 - Manual Confirmation Wait Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-manual-confirmation-wait-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add non-executing localhost bridge `POST /manual-confirmation-wait`.
- Return synthetic `AvanzaManualConfirmationWaitResult`-compatible metadata
  for future wait-phase diagnostics.
- Keep this separate from browser control, Avanza URLs/selectors, `Bekrafta`,
  broker results, Supabase writes, and trade mutation.

Contract/client coverage:

- `LocalhostBridgeManualConfirmationWaitRequest`
- `LocalhostBridgeManualConfirmationWaitResponse`
- `buildLocalhostBridgeManualConfirmationWaitRequest(...)`
- `validateLocalhostBridgeManualConfirmationWaitRequest(...)`
- `validateLocalhostBridgeManualConfirmationWaitResponse(...)`
- `checkLocalhostBridgeManualConfirmationWait(...)`
- `summarizeLocalhostManualConfirmationWaitBridgeResponse(...)`

Server stub modes:

- `unavailable`
- `waiting`
- `user_cancelled`
- `user_confirmed_unverified`
- `timed_out`
- `final_confirm_visible_read_only`
- `blocked_final_confirm_attempt`
- `blocked_keyboard_submit`
- `blocked_unexpected_broker_result`
- `blocked_trade_mutation`
- `blocked_sensitive`
- `confirmation_not_ready`

Smoke/e2e coverage:

- default `/manual-confirmation-wait` returns unavailable safely.
- missing `requestId` returns failed/400 safely.
- malformed JSON returns failed/400 safely.
- waiting returns `waiting_for_manual_confirmation` with final-confirm visible
  as read-only risk metadata only.
- user cancelled, user-confirmed-unverified, and timed-out states normalize
  without broker results.
- final-confirm attempt, keyboard submit, unexpected broker result, unexpected
  trade mutation, sensitive data, and confirmation-not-ready states block.
- all responses assert no `brokerResult`, no executed diagnostics, no browser
  actions, no Avanza page touched, no `Bekrafta`, no Supabase write, and no
  trade mutation.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No run/start/confirm UI was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.
## Action 301 - Broker Confirmation Capture Result Contract

Files changed:

- `lib/avanza-broker-confirmation-capture-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/avanza-manual-confirmation-wait-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript contract for future sanitized broker confirmation
  capture results after `user_confirmed_unverified`.
- Compare original dry-run request, manual wait state, and sanitized broker
  confirmation readback without creating a real broker execution result.

Contract coverage:

- `AvanzaBrokerConfirmationCaptureStatus`
- `AvanzaBrokerConfirmationOrderStatus`
- `AvanzaBrokerConfirmationCaptureRiskFlag`
- `AvanzaBrokerConfirmationReadback`
- `AvanzaBrokerConfirmationFieldCheck`
- `AvanzaBrokerConfirmationCaptureResult`
- `evaluateAvanzaBrokerConfirmationCapture(...)`
- `createAvanzaBrokerConfirmationCaptureResult(...)`
- `summarizeAvanzaBrokerConfirmationCaptureResult(...)`
- `getAvanzaBrokerConfirmationCaptureSafetyLabels(...)`
- `isAvanzaBrokerConfirmationCaptured(...)`
- `isAvanzaBrokerConfirmationPartial(...)`

Test coverage:

- manual confirmation not observed
- missing or hidden confirmation page
- filled matching readback captured
- placed/accepted but unfilled partial
- partially filled partial
- rejected/cancelled/expired
- action, ticker, quantity, and price mismatch
- missing order id, timestamp, fees, and total
- ambiguous status wording
- account/balance/holding/sensitive/raw DOM/unsanitized screenshot signals
- broker-result creation attempt
- trade-mutation attempt
- summary and labels showing no `BrokerExecutionResult`, no execution record,
  no Supabase write, and no trade mutation

Safety result:

- Pure TypeScript only.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 300 - Broker Confirmation Capture Phase Design

Files changed:

- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/avanza-manual-confirmation-wait-phase-design.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the future broker confirmation capture phase after a human manual
  final confirmation.
- Keep capture separate from final-click behavior, manual confirmation wait,
  `BrokerExecutionResult` conversion, execution record creation, Supabase
  persistence, History/Statistics integration, and live trade mutation.

Design coverage:

- allowed and forbidden behavior
- required prerequisites
- planned statuses
- planned sanitized confirmation readback fields
- placed-versus-filled validation policy
- mismatch/partial/rejected/cancelled handling
- broker result boundary
- privacy/data minimization
- future UI behavior
- diagnostics requirements
- hard stops
- test plan
- graduation criteria

Safety result:

- Documentation only.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No broker capture/run/start button was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 302 - Broker Confirmation Capture Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added `POST /broker-confirmation-capture` request/response contract and
  validators.
- Added `buildLocalhostBridgeBrokerConfirmationCaptureRequest(...)`.
- Added `checkLocalhostBridgeBrokerConfirmationCapture(...)`.
- Added
  `summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(...)`.
- Added localhost server stub modes for captured, partial, mismatch,
  rejected/cancelled/expired, sensitive/raw evidence block,
  broker-result-attempt block, trade-mutation-attempt block,
  manual-confirmation-not-observed, and confirmation-page-not-found states.
- Expanded `npm run bridge:localhost:smoke` matrix for the new endpoint.
- Added e2e/client normalization coverage for filled, partial, mismatch,
  rejected/cancelled/expired, blocked, invalid JSON, invalid shape, and invalid
  dry-run-input paths.

Safety result:

- Stub only.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 303 - Broker Confirmation Capture UI Preview

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a dev-gated, read-only `Broker confirmation capture preview` section to
  the Execution Handoff Preview Modal.
- Added the explicit button `Check broker-confirmation-capture stub`.
- The button calls only `checkLocalhostBridgeBrokerConfirmationCapture(...)`
  for the current dry-run request.
- The preview displays normalized captured, partial, mismatch,
  rejected/cancelled, and blocked stub states.
- The preview displays sanitized readback fields, field checks, risk
  flags/warnings, and safety metadata.
- The Avanza dry-run readiness panel now includes informational broker
  confirmation capture rows.
- E2E coverage intercepts `/broker-confirmation-capture` and verifies captured,
  partial, mismatch, rejected/cancelled, and blocked UI states.

Safety result:

- Stub check only.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 304 - BrokerExecutionResult Conversion Boundary Design

Files changed:

- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/avanza-manual-confirmation-wait-phase-design.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a documentation-only boundary design for future conversion from
  sanitized Avanza broker confirmation capture evidence to
  `BrokerExecutionResult`.
- Defined that `confirmation_captured` is evidence, not automatically an
  execution record.
- Defined that `confirmation_partial`, placed, accepted, mismatch,
  rejected/cancelled, blocked, and failed states must not become realized
  execution records without separate future designs.
- Documented allowed conversion criteria, blocked criteria, placed-vs-filled
  policy, required output mapping, idempotency, safety gates, UI expectations,
  diagnostics, and test plan.
- Recommended `Action 305 - BrokerExecutionResult Conversion Eligibility
  Contract` as pure TypeScript eligibility work only.

Safety result:

- Documentation only.
- No conversion helper was implemented.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 305 - BrokerExecutionResult Conversion Eligibility Contract

Files changed:

- `lib/avanza-broker-execution-result-eligibility.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added `AvanzaBrokerExecutionResultEligibilityStatus`.
- Added `AvanzaBrokerExecutionResultEligibilityReason`.
- Added `AvanzaBrokerExecutionResultEligibilityInput`.
- Added `AvanzaBrokerExecutionResultEligibilityOptions`.
- Added `AvanzaBrokerExecutionResultEligibilityResult`.
- Added
  `buildAvanzaBrokerConfirmationEvidenceFingerprint(...)`.
- Added
  `evaluateAvanzaBrokerExecutionResultEligibility(...)`.
- Added
  `summarizeAvanzaBrokerExecutionResultEligibility(...)`.
- Added
  `getAvanzaBrokerExecutionResultEligibilityLabels(...)`.
- Added
  `isAvanzaBrokerExecutionResultEligible(...)`.
- Added e2e/contract coverage for filled eligible evidence, placed/accepted
  partial evidence, partial fill, mismatch, rejected/cancelled, missing core
  evidence, allowed missing order id/timestamp warnings, sensitive/raw flags,
  broker-result-attempt flags, trade-mutation-attempt flags, duplicate
  fingerprint risk, and safety labels.

Safety result:

- Pure TypeScript eligibility only.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 306 - BrokerExecutionResult Conversion Eligibility Bridge Stub Integration

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/execution-record-creation-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added localhost bridge `POST /broker-execution-result-eligibility`.
- Added request/response validation for eligibility-only bridge payloads.
- Added `checkLocalhostBridgeBrokerExecutionResultEligibility(...)`.
- Added
  `summarizeLocalhostBrokerExecutionResultEligibilityBridgeResponse(...)`.
- Added server stub modes for eligible filled, partial, blocked, missing
  evidence, sensitive evidence, broker-result-attempt, trade-mutation-attempt,
  duplicate-risk, and missing-capture states.
- Expanded bridge smoke matrix and e2e/client normalization coverage.

Safety result:

- Eligibility check only.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 307 - BrokerExecutionResult Eligibility UI Preview

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a dev-gated, read-only `BrokerExecutionResult eligibility preview` to
  the Execution Handoff Preview Modal.
- Added a manual `Check BrokerExecutionResult eligibility stub` button that
  calls only the localhost `/broker-execution-result-eligibility` stub.
- Displayed eligibility summary, status, elapsed time, sanitized evidence
  fingerprint, reasons, blockers, warnings, labels, and safety metadata.
- Added readiness rows for eligible, partial-only, duplicate-risk, and
  no-creation/no-persistence safety states.
- Extended e2e coverage for eligible, partial-only, blocked mismatch, and
  duplicate-risk UI states.

Safety result:

- Eligibility check only.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 308 - BrokerExecutionResult Conversion Mapping Design

Files changed:

- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/avanza-broker-confirmation-capture-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a documentation-only mapping design for future eligible Avanza broker
  confirmation capture evidence to `BrokerExecutionResult`-shaped preview
  fields.
- Documented source requirements, target shape, field mapping, validation
  rules, status mapping policy, currency/fees policy, idempotency, safety
  boundaries, UI behavior, and future contract tests.
- Linked the mapping design from the conversion boundary, broker confirmation
  capture phase, dry-run runner implementation plan, checkpoint, and QA notes.

Safety result:

- Documentation only.
- No conversion code was implemented.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 309 - BrokerExecutionResult Conversion Preview Contract

Files changed:

- `lib/avanza-broker-execution-result-preview.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a pure TypeScript preview contract for eligible Avanza broker
  confirmation capture evidence.
- Added preview-only types and helpers:
  `buildAvanzaBrokerExecutionResultPreview(...)`,
  `summarizeAvanzaBrokerExecutionResultPreview(...)`,
  `getAvanzaBrokerExecutionResultPreviewLabels(...)`, and
  `isAvanzaBrokerExecutionResultPreviewAvailable(...)`.
- Added e2e/contract coverage for eligible filled preview, partial-only,
  blocked mismatch, duplicate-risk, optional missing fees/order id/timestamp
  warnings, labels, summaries, and safety metadata.

Safety result:

- Pure TypeScript preview only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 310 - BrokerExecutionResult Conversion Preview Bridge Stub

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added localhost bridge `POST /broker-execution-result-preview` request and
  response contracts.
- Added `checkLocalhostBridgeBrokerExecutionResultPreview(...)` and
  `summarizeLocalhostBrokerExecutionResultPreviewBridgeResponse(...)`.
- Added server stub modes for preview-available filled, missing optional
  evidence, partial-only placed/partially-filled, blocked mismatch/rejected/
  sensitive, duplicate-risk, missing capture, and unavailable states.
- Expanded the bridge smoke matrix for default, preview-available,
  missing-optional, partial-only, blocked mismatch/sensitive, duplicate-risk,
  and malformed request paths.
- Added e2e/client normalization coverage for preview-available,
  missing-optional warning, partial-only, blocked, duplicate-risk, invalid JSON,
  and invalid response shapes.

Safety result:

- Preview-only metadata only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 311 - BrokerExecutionResult Conversion Preview UI

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a dev-gated, read-only `BrokerExecutionResult conversion preview`
  panel to the Execution Handoff Preview Modal.
- Added the manual `Check BrokerExecutionResult preview stub` button. The
  button calls only the localhost `/broker-execution-result-preview` stub.
- The panel passes latest broker-confirmation capture and eligibility metadata
  when available and warns when real preview evidence is missing.
- Displayed preview summary/status/HTTP/elapsed metadata, preview-shaped fields,
  preview-only metadata, labels, warnings, blockers, and errors.
- Added informational readiness rows for preview status, preview availability,
  partial-only, duplicate-risk, no real `BrokerExecutionResult`, no execution
  record, no Supabase write, and no trade mutation.
- Extended e2e coverage for preview available, missing optional warnings,
  partial-only, blocked mismatch, duplicate-risk, and dev-tools-off hiding.

Safety result:

- UI preview only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 312 - Execution Record Creation Boundary Design

Files changed:

- `docs/execution-record-creation-boundary-design.md`
- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a documentation-only boundary design for the future step from a real
  `BrokerExecutionResult` to local execution record creation.
- Documented the boundary principle:
  `BrokerExecutionResult` is not automatically an execution record, execution
  record is not automatically persisted, and persisted record is not
  automatically trade mutation.
- Defined future allowed creation criteria, blocked cases, target local record
  shape, idempotency policy, Supabase persistence separation, trade mutation
  separation, UI behavior, diagnostics, and test plan.
- Recommended `Action 313 - Execution Record Eligibility Contract` as a pure
  TypeScript helper action with no record creation.

Safety result:

- Documentation only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 313 - Execution Record Eligibility Contract

Files changed:

- `lib/execution-record-eligibility.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/execution-record-creation-boundary-design.md`
- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a pure eligibility contract for future local execution record
  candidates.
- Added deterministic sanitized candidate fingerprinting.
- Added default blockers for preview-only candidates, missing required fields,
  missing source fingerprint, non-filled statuses, sensitive/raw data,
  Supabase-write attempts, trade-mutation attempts, and execution-record
  creation attempts.
- Added warning-only options for missing timestamp and broker reference.
- Added duplicate-risk detection for source fingerprints and broker
  references.
- Added e2e contract coverage for the major eligible, blocked,
  warning-allowed, and duplicate-risk cases.

Safety result:

- Eligibility metadata only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 314 - Execution Record Eligibility Bridge Stub

Files changed:

- `lib/avanza-localhost-bridge-contract.ts`
- `lib/avanza-localhost-bridge-client.ts`
- `scripts/avanza-localhost-bridge-server.mjs`
- `scripts/avanza-localhost-bridge-server-smoke.mjs`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/execution-record-creation-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added `POST /execution-record-eligibility` as a localhost bridge contract
  stub.
- Added frontend-safe `checkLocalhostBridgeExecutionRecordEligibility(...)`
  and `summarizeLocalhostExecutionRecordEligibilityBridgeResponse(...)`.
- Added contract validators and request builder for the endpoint.
- Added server stub modes for eligible, blocked, duplicate-risk, and malformed
  request states.
- Added smoke matrix coverage for default, eligible, preview-only, missing
  price, not-filled, sensitive, Supabase/trade attempts, duplicate source,
  duplicate broker reference, and malformed JSON.
- Added e2e/client normalization coverage for eligible, blocked, duplicate,
  invalid JSON, and invalid shape responses.

Safety result:

- Stub/diagnostics only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 315 - Execution Record Eligibility UI Preview

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-broker-execution-result-conversion-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA coverage:

- The Execution Handoff Preview Modal shows a dev-gated, read-only
  `Execution record eligibility preview` panel.
- The panel can call `Check execution-record eligibility stub` manually.
- The e2e handoff modal test covers eligible, preview-only blocked,
  missing-price, not-filled, and duplicate-source-fingerprint responses.
- Dev-tools-off coverage verifies the panel is hidden when the execution
  sandbox fixture is unavailable.
- The UI checks that no execution-record run/start/create/persist/execute
  button appears.

Safety result:

- Eligibility preview only.
- No real `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, or order
  submission was added.

## Action 316 - Handoff Modal Decomposition Plan

Files changed:

- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Added a documentation-only plan to split the large Execution Handoff Preview
  Modal into smaller components and hooks in future actions.
- The plan explicitly requires behavior preservation after each extraction and
  keeps current e2e tests as the behavioral contract.
- The plan documents the verification loop for future decomposition:
  `./node_modules/.bin/tsc --noEmit`, `npm run lint`, `git diff --check`, and
  `npm run test:e2e`.
- The plan recommends extracting shared presentational components first before
  moving endpoint state or bridge-call handlers.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 317 - Extract Handoff Modal Shared Display Components

Files changed:

- `app/trade-app.tsx`
- `components/execution/handoff-modal-shared.tsx`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only pure presentational helpers: `Detail`, `TextBlock`, and
  `EmptyState`.
- No modal state, hooks, bridge/client calls, endpoint handlers, or readiness
  logic moved.
- Existing visible labels/copy and button text are preserved.
- The `app/trade-app.tsx` React Hooks ESLint override remains for now because
  the modal is still large.
- Next recommended action is Action 318: extract the Avanza readiness panel.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 323 - Handoff Modal ESLint Override Feasibility Check

Files changed:

- `eslint.config.mjs`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Inspected the narrow `app/trade-app.tsx` ESLint override for
  `react-hooks/rules-of-hooks`.
- Removed the override temporarily and ran `npm run lint`.
- Lint passed without the previous React Hooks rule stack overflow.
- Kept the override removed permanently.
- No runtime code or modal behavior was changed for this action.
- Next recommended action is Action 324: Handoff Modal State/Handler Grouping
  Plan.

Verification:

- `npm run lint`
- `./node_modules/.bin/tsc --noEmit`
- `git diff --check`

Safety result:

- No modal behavior changed.
- No state ownership changed.
- No hook extraction or handler movement was performed.
- No bridge/client logic changed.
- No button text or dev gating changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 324 - Handoff Modal State/Handler Grouping Plan

Files changed:

- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Added a documentation-only grouping plan before any future hook extraction.
- The plan maps current modal ownership, state clusters, handler clusters,
  result dependencies, hook candidates, extraction order, preservation rules,
  risks, and future acceptance criteria.
- The plan recommends Action 325: Extract Handoff Modal Pure Data Mappers.

Verification:

- `git diff --check`

Safety result:

- Documentation only.
- No runtime behavior changed.
- No modal state moved.
- No handlers moved.
- No hooks were created.
- No bridge/client logic changed.
- No button text or dev gating changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 322 - Extract Late Phase Stub Previews

Files changed:

- `app/trade-app.tsx`
- `components/execution/handoff-modal-shared.tsx`
- `components/execution/stub-previews/BrokerConfirmationCapturePreview.tsx`
- `components/execution/stub-previews/BrokerExecutionResultEligibilityPreview.tsx`
- `components/execution/stub-previews/BrokerExecutionResultPreview.tsx`
- `components/execution/stub-previews/ExecutionRecordEligibilityPreview.tsx`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only the rendered broker-confirmation-capture,
  BrokerExecutionResult eligibility, BrokerExecutionResult conversion preview,
  and execution-record eligibility preview UI.
- The parent modal still owns all loading state, response state, messages,
  result chaining, derived booleans, bridge/client helper calls, and click
  handlers.
- Existing visible labels/copy, button text, disabled/loading behavior, result
  displays, and dev gating are preserved.
- Manual-confirmation wait remains readiness/contract-only in the current modal
  because no separate preview control was rendered to extract.
- The `app/trade-app.tsx` React Hooks ESLint override remains for now because
  the modal still owns the large hook/state surface.
- Next recommended action is Action 323: extract the handoff modal state hook
  plan or check whether the ESLint override can be safely removed later.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 321 - Extract Middle Phase Stub Previews

Files changed:

- `app/trade-app.tsx`
- `components/execution/handoff-modal-shared.tsx`
- `components/execution/stub-previews/InstrumentPagePreview.tsx`
- `components/execution/stub-previews/OrderPageOpenPreview.tsx`
- `components/execution/stub-previews/AdvancedFormFillPreview.tsx`
- `components/execution/stub-previews/ReviewClickPreview.tsx`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only the instrument-page, order-page-open, Advanced form-fill, and
  review-click preview rendering.
- The parent modal still owns all loading state, response state, messages,
  result chaining, derived booleans, bridge/client helper calls, and click
  handlers.
- Existing visible labels/copy, button text, disabled/loading behavior, result
  displays, and dev gating are preserved.
- Manual confirmation and later stub preview panels remain inline for later
  extraction slices.
- The `app/trade-app.tsx` React Hooks ESLint override remains for now because
  the modal still owns the large hook/state surface.
- Next recommended action is Action 322: extract the late phase stub previews.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 318 - Extract Avanza Readiness Panel

Files changed:

- `app/trade-app.tsx`
- `components/execution/AvanzaDryRunReadinessPanel.tsx`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only the Avanza dry-run readiness panel rendering.
- The parent modal still owns all readiness state, hooks, bridge/client calls,
  endpoint response handling, and derived values.
- Existing visible labels/copy, readiness statuses, button text, and dev gating
  are preserved.
- The `app/trade-app.tsx` React Hooks ESLint override remains for now because
  the modal still owns the large hook/state surface.
- Next recommended action is Action 319: extract the localhost bridge controls.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 319 - Extract Localhost Bridge Controls

Files changed:

- `app/trade-app.tsx`
- `components/execution/LocalhostBridgeControls.tsx`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only the localhost bridge controls and result rendering.
- The parent modal still owns all loading state, response state, messages,
  derived booleans, bridge/client helper calls, and click handlers.
- Existing visible labels/copy, button text, disabled/loading behavior, result
  displays, and dev gating are preserved.
- The bridge request envelope preview and early-phase stub preview panels remain
  inline for later extraction slices.
- The `app/trade-app.tsx` React Hooks ESLint override remains for now because
  the modal still owns the large hook/state surface.
- Next recommended action is Action 320: extract the early phase stub previews.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 320 - Extract Early Phase Stub Previews

Files changed:

- `app/trade-app.tsx`
- `components/execution/stub-previews/SessionDetectionPreview.tsx`
- `components/execution/stub-previews/SearchOnlyPreview.tsx`
- `components/execution/stub-previews/InstrumentVerificationPreview.tsx`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only the session-detection, search-only, and
  instrument-verification preview rendering.
- The parent modal still owns all loading state, response state, messages,
  result chaining, derived booleans, bridge/client helper calls, and click
  handlers.
- Existing visible labels/copy, button text, disabled/loading behavior, result
  displays, and dev gating are preserved.
- Instrument page and later stub preview panels remain inline for later
  extraction slices.
- The `app/trade-app.tsx` React Hooks ESLint override remains for now because
  the modal still owns the large hook/state surface.
- Next recommended action is Action 321: extract the middle phase stub previews.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 325 - Extract Handoff Modal Pure Data Mappers

Files changed:

- `app/trade-app.tsx`
- `lib/handoff-modal-data-mappers.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

QA notes:

- Extracted only pure, side-effect-free display/readiness mappers.
- `buildBrokerExecutionPreviewReadinessItems(...)` now lives in
  `lib/handoff-modal-data-mappers.ts`.
- `buildExecutionRecordEligibilityReadinessItems(...)` now lives in
  `lib/handoff-modal-data-mappers.ts`.
- Shared `ExecutionSandboxQaItem` / `ExecutionSandboxQaStatus` row types are
  exported from the mapper module.
- The parent modal still owns all state, hooks, handlers, bridge/client helper
  calls, API calls, loading flags, response state, and result chaining.
- Existing visible labels/copy, button text, disabled/loading behavior,
  readiness rows, and dev gating are preserved.
- Next recommended action is Action 326: extract the localhost bridge state
  hook.

Safety result:

- No runtime behavior changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.
