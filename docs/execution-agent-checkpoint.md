# Execution Agent Checkpoint

Last updated: Action 283

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
- A documentation-only Avanza UI research mapping now exists in `docs/avanza-ui-research-mapping.md`. It converts the sanitized screenshot package into an observed flow, semi-automatic stop point, buy/sell order-form mapping, validation/error mapping, confirmation modal mapping, and mock-contract gap list. It does not add selectors, URLs, credentials, automation, broker results, Supabase writes, or trade mutation.
- A documentation-only Avanza vs mock order contract gap analysis now exists in `docs/avanza-vs-mock-order-contract-gap-analysis.md`. It compares observed Avanza Advanced order fields, confirmation readback, validation states, and progress states against the current mock order/confirmation contracts and recommends mock-first Actions 235-239. No code behavior, Avanza automation, URLs, selectors, credentials, browser automation, broker result, Supabase write, or trade mutation was added.
- Action 235 extended the mock order page contract and dev-only mock order UI with Avanza Advanced-style P0 readback fields: account, SEK amount, price/instrument currency, instrument market/type, Advanced order mode, validity date, estimated fees/courtage/FX/total, preliminary FX rate, and review/confirm/cancel labels. The Playwright-only fill runner, manual local mock-agent runner, URL prefill, validation, review panel, and e2e coverage now include those fields. This remains mock/dev only and adds no Avanza automation, broker result, Supabase write, order submit, or trade mutation.
- Action 236 extended the dev-only mock confirmation contract/page/parser with Avanza-like readback fields for account, amount excluding fees, courtage, FX fee, preliminary FX rate, valid until, total amount, price/instrument currency, instrument market/type, Advanced order mode, and review/confirm/cancel labels. The mock order review link passes these fields manually, final confirm/cancel controls are disabled/readback only, and no broker result, execution record, Supabase write, order submit, Avanza automation, or trade mutation was added.
- Action 237 added mock-only Advanced-order validation for required fields, invalid numbers/prices, minimum amount, and unsupported order modes. The mock order page now blocks review while validation errors are present, renders stable validation selectors for future agent tests, keeps the review panel hidden, and keeps final submit disabled. No Avanza automation, broker result, Supabase write, order submit, or trade mutation was added.
- Action 238 hardened the Playwright-only fill runner and manual local mock-agent runner so they verify `orderMode=advanced`, stop on mock validation errors, require the review panel and confirmation link after a valid review, and confirm final submit remains disabled. Localhost bridge mock-agent metadata can now surface validation errors, review visibility, confirmation-link availability, disabled-submit status, and order-mode verification without creating broker results or opening confirmation links.
- Action 239 added `docs/avanza-manual-selector-notes.md`, a documentation-only manual visible-label/anchor note set for future Avanza research. It maps observed labels to mock fields, records risk notes and open questions, and explicitly avoids real Avanza selectors, URLs, credentials, browser automation, scraping, order submission, broker results, Supabase writes, or trade mutation.
- Action 240 added `docs/avanza-manual-mapping-qa-checklist.md`, a documentation-only manual QA checklist for the next Avanza research session. It covers pre-session safety, setup, search, stock page, Advanced order form, validation, confirmation modal, Stop Loss/Glidande observation-only notes, mock contract mapping, open questions, and a sanitized output template. No Avanza automation, runtime selectors, URLs, credentials, scraping, order submission, broker results, Supabase writes, or trade mutation was added.
- Action 241 added `docs/avanza-manual-mapping-session-notes.md`, a documentation-only session-notes intake template for future manual Avanza observations. It captures session metadata, safety confirmation, screenshot index, step observations, form-field inventory, validation and confirmation notes, risk findings, resolved/open questions, and recommended doc updates without adding automation or runtime selectors.
- Action 242 added `docs/semi-auto-avanza-prototype-safety-plan.md`, a documentation-only safety plan for a possible future semi-automatic Avanza prototype. It defines allowed and forbidden actions, hard stop states, verification gates, progress events, manual test protocol, prerequisites, risk register, and go/no-go criteria. It does not approve or implement live automation.
- Action 243 added `docs/semi-auto-avanza-prototype-requirements.md`, a documentation-only requirements specification for the first future semi-automatic Avanza prototype. It defines scope, functional requirements, verification requirements, safety requirements, failure states, progress-event payload expectations, data minimization, phased test plan, acceptance criteria, and pre-implementation checklist without adding automation.
- Action 244 added `docs/avanza-final-confirm-block-design.md`, a documentation-only technical safety design for preventing accidental final confirmation clicks in any future semi-automatic Avanza runner. It defines threat model, mode authority guard, action allowlist, final-confirm denylist, state-machine guard, safe browser action wrapper expectations, test guard, runtime emergency stop, and automatic-mode separation.
- Action 245 added `lib/safe-browser-action-contract.ts` and `docs/safe-browser-action-contract.md`, a pure contract/helper layer for future safe browser actions. It defines action kinds, modes, target risk metadata, final-confirm denylist terms, action creation, display/risk helpers, and validation that blocks semi-auto final-confirm click/select actions without importing browser automation.
- Action 246 added `lib/safe-browser-action-runner.ts`, a pure no-op runner interface for future safe browser actions. It validates action batches through the safe action contract, reports validated/blocked/skipped results, keeps `supportsRealBrowserExecution=false`, and executes no browser actions.
- Action 247 added `lib/mock-order-safe-action-plan.ts`, a pure adapter from `MockOrderPageFillPlan` to `SafeBrowserAction` plans for the local mock order page. Valid mock fill plans now produce safe fill/select/read/review actions that validate through the safe action contract and no-op runner without executing browser actions or generating final-confirm clicks.
- Action 248 added `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`, a Playwright-only adapter for executing validated safe action plans against the dev-only mock order page in tests. It validates every action, supports only known mock selectors, clicks only the local review button, blocks final-confirm-like clicks, verifies readbacks, and never submits.
- Action 249 added `lib/safe-browser-action-diagnostics.ts`, a pure shared diagnostics contract for safe action execution. The Playwright mock adapter now returns standardized per-action steps, aggregate execution/block/failure counts, and `finalConfirmBlocked` telemetry without creating broker results or runtime automation.
- Action 250 added `lib/safe-browser-action-diagnostics-store.ts` and a dev-gated Settings viewer for local safe-action diagnostics. It stores only local telemetry under `ture_safe_browser_action_diagnostics_v1`, shows final-confirm-blocked counts and step details, and remains separate from broker results, execution records, Supabase, and trade state.
- Action 251 integrated safe-action diagnostics into the dev-only localhost mock-agent path. The mock-agent runner emits diagnostics, the bridge returns them as response-level metadata, the modal displays/saves them locally after explicit user action, and Settings can inspect them without broker results or execution records.
- Action 252 added `lib/browser-runner-capability-gate.ts`, a pure capability gate that classifies mock browser execution separately from future Avanza/broker execution. Mock-only runners validate as `safe_mock_only`, while Avanza, broker submission, final-confirm click, automatic-capable, and unknown browser capabilities are blocked by default.
- Action 253 added `docs/avanza-dry-run-capability-spec.md`, a documentation-only specification for a possible future Avanza dry-run capability. It defines dry-run as semi-automatic navigation/fill/review/readback only and keeps broker submission, final confirmation, broker results, Supabase writes, and trade mutation out of scope.
- Action 254 extended `lib/browser-runner-capability-gate.ts` with `createAvanzaDryRunBrowserRunnerCapability(...)` and explicit `dry_run_only` validation when `allowAvanzaDryRun=true`. Avanza dry-run remains blocked by default, broker submission/final-confirm/automatic/unknown capabilities remain blocked by default, and no Avanza automation or browser runner was added.
- Action 255 added `lib/avanza-dry-run-request-contract.ts`, a pure future Avanza dry-run request/input contract. It defaults to Advanced mode, manual account review, and stop at confirmation modal, validates buy/sell ticker/quantity/price/account policy, rejects unsafe final-submit/broker-submission metadata, and adds summary/safety-label helpers without adding automation.
- Action 256 added `lib/execution-intent-to-avanza-dry-run.ts`, a pure adapter from Ture execution intent/handoff data to validated `AvanzaDryRunOrderInput`. It extracts action, ticker, quantity, price reference, recommendation/intent ids, and safe metadata while blocking missing fields, automatic/final-submit authority, and unsafe metadata. No Avanza automation or browser runner was added.
- Action 257 added a dev-gated, read-only Avanza dry-run request preview to the Execution Handoff Preview Modal. It shows Action 256 adapter output and safety labels such as Advanced mode, stop at confirmation, no broker submission, final confirm disabled, and manual account review. It adds no run button, Avanza URL, selector, browser runner, broker result, Supabase write, or trade mutation.
- Action 258 added a dev-gated, read-only Avanza dry-run readiness checklist to the Execution Handoff Preview Modal. It shows request validity, capability-gate status, disabled broker submission/final confirm/automatic mode, missing runner implementation, intentionally missing selectors/URLs, and manual final confirmation. Overall status remains `Not ready to run`.
- Action 259 added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only implementation plan for the first future Avanza dry-run runner. It defines the safest proposed architecture, required gates, review-only flow, stop/failure states, diagnostics, staged tests, UI behavior, security/privacy boundaries, and recommends a pure runner self-check contract next. No Avanza automation, selectors, URLs, browser runner, broker result, Supabase write, or trade mutation was added.
- Action 260 added `lib/avanza-dry-run-runner-self-check.ts`, a pure self-check contract for future Avanza dry-run runner readiness. It represents the current missing runner as `unavailable`, distinguishes mock-only diagnostics from `available_dry_run_only`, and blocks broker-submission or final-confirm-capable runners without adding browser control.
- Action 261 added a localhost bridge `GET /self-check` contract, client helper, server stub, and dev-only read-only modal button for runner readiness metadata. The default bridge self-check reports `unavailable`; optional mock-only metadata remains distinct from Avanza dry-run capability. No Avanza automation, URLs, selectors, browser runner, run/start button, broker result, Supabase write, or trade mutation was added.
- Action 262 integrated the latest localhost self-check result into the read-only Avanza dry-run readiness panel. The panel now distinguishes unavailable, mock-only, blocked/failed, and future dry-run-only self-check states while keeping broker submission/final confirm disabled and adding no Avanza run/start button.
- Action 263 added a localhost bridge `POST /dry-run` contract and server stub for future Avanza dry-run requests. The endpoint validates `AvanzaDryRunOrderInput`, capability options, and unavailable runner state, then returns `not_implemented` or `blocked` with no browser actions, no Avanza automation, no run button, no broker submission, no broker result, no Supabase write, and no trade mutation.
- Action 264 added a frontend-safe `runLocalhostBridgeAvanzaDryRunStub(...)` client helper for `POST /dry-run`. It builds, posts, times out, validates, normalizes, and summarizes non-executing stub responses and failure modes without wiring a UI run button, browser runner, broker result, Supabase write, or trade mutation.
- Action 265 added a dev-gated, read-only `Dry-run bridge response preview` to the handoff modal. The user can manually test the localhost `/dry-run` stub response for the current validated dry-run request and inspect `not_implemented` or `blocked` metadata, while the modal still has no Avanza run/start button and no browser action, broker submission, broker result, Supabase write, or trade mutation.
- Action 266 added `scripts/avanza-dry-run-runner-skeleton.mjs` and localhost bridge mode `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton`. The bridge can report skeleton `available_dry_run_only` self-check metadata and return a safe `/dry-run` `accepted_stub` response, but the skeleton controls no browser, opens no Avanza URL, uses no selectors, submits no order, creates no broker result, writes no Supabase data, and mutates no trade state.
- Action 267 expanded `npm run bridge:localhost:smoke` into an explicit localhost bridge smoke matrix. It now covers default unavailable mode, `mock_only`, `dry_run_skeleton`, valid dry-run, unsafe dry-run, missing input, invalid JSON, skeleton unsafe blocking, and existing `/run`/`/cancel` regressions while asserting no `brokerResult` and no executed browser diagnostics.
- Action 268 added `docs/avanza-manual-mapping-refresh-pack.md`, a documentation-only manual refresh pack for the next Avanza UI validation pass. It defines safety rules, session setup, required manual flows, screenshot/notes templates, field/validation/confirmation readback tables, decision checklist, and green/yellow/red outcomes before any session-detection/search-only runner design.
- Action 269 added `docs/avanza-session-detection-only-design.md`, a documentation-only design for the first future Avanza-adjacent phase. It limits that phase to sanitized browser/session readiness detection and explicitly forbids click, type, search, navigation, order-page access, account-data reads, broker results, Supabase writes, and trade mutation.
- Action 270 added `lib/avanza-session-detection-contract.ts`, a pure TypeScript session detection result contract. It models unavailable, browser-not-connected, Avanza-not-visible, login-required, ready-for-search-only, blocked, and failed states, blocks sensitive/order/confirmation contexts, and provides summary/safety-label helpers without browser control.
- Action 271 added a localhost bridge `GET /session-detection` contract, client helper, server stub, and smoke coverage for synthetic session-detection modes. The endpoint can report unavailable, browser-not-connected, Avanza-not-visible, login-required, ready-for-search-only, sensitive-data-blocked, or order-page-blocked metadata without browser control, Avanza URLs/selectors, broker results, Supabase writes, or trade mutation.
- Action 272 added a dev-gated, read-only Session-detection preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/session-detection` stub, inspect status/summary/labels/sanitized context, and see informational readiness rows without enabling search-only, Avanza dry-run, browser control, broker results, Supabase writes, or trade mutation.
- Action 273 added `docs/avanza-search-only-phase-design.md`, a documentation-only design for the future search-only phase after session detection. It defines search-only as sanitized instrument candidate lookup, exact/ambiguous/no-match classification, exact-match policy, hard stops, privacy rules, and graduation criteria while forbidding order pages, buy/sell clicks, order forms, submissions, broker results, Supabase writes, and trade mutation.
- Action 274 added `lib/avanza-search-only-result-contract.ts`, a pure TypeScript search-only result contract. It scores sanitized instrument candidates against expected ticker/name/market/currency/type, classifies exact/ambiguous/no-match/blocked/failed outcomes, and exposes summary/safety-label helpers without browser control, Avanza URLs/selectors, search buttons, order pages, broker results, Supabase writes, or trade mutation.
- Action 275 added a localhost bridge `POST /search-only` contract, client helper, server stub, smoke matrix coverage, and e2e/client normalization coverage for synthetic search-only results. The endpoint can return exact, ambiguous, no-match, search-not-available, session-not-ready, sensitive-data-blocked, or order-flow-blocked metadata without browser control, Avanza URLs/selectors, search/run/start buttons, order pages, buy/sell clicks, broker results, Supabase writes, or trade mutation.
- Action 276 added a dev-gated, read-only Search-only preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/search-only` stub for the current dry-run request instrument, inspect exact/ambiguous/no-match/blocked candidate results, and see informational readiness rows without enabling real search, browser control, Avanza URLs/selectors, order pages, buy/sell clicks, broker results, Supabase writes, or trade mutation.
- Action 277 added `docs/avanza-instrument-verification-phase-design.md`, a documentation-only design for the future phase after a search-only exact match. It scopes verification to sanitized instrument identity comparison and explicitly forbids order pages, buy/sell clicks, order-form behavior, submissions, broker results, Supabase writes, and trade mutation.
- Action 278 added `lib/avanza-instrument-verification-contract.ts`, a pure TypeScript result contract for future Avanza instrument verification. It compares expected instrument identity with the selected search-only candidate, verifies/rejects/marks ambiguous/blocks safely, and covers sensitive/order-flow risk without browser control, Avanza URLs/selectors, verify/search/run/start buttons, order pages, buy/sell clicks, form filling, broker results, Supabase writes, or trade mutation.
- Action 279 added localhost bridge `POST /instrument-verification` request/response contracts, `checkLocalhostBridgeInstrumentVerification(...)`, server stub modes for unavailable/verified/rejected/ambiguous/blocked/search-not-ready/missing-candidate states, smoke matrix assertions, and e2e client normalization tests. No browser control, Avanza selectors/URLs, verify/search/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 280 added a dev-gated, read-only Instrument verification preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/instrument-verification` stub for the current dry-run request instrument, include the latest exact search-only candidate when available, inspect verified/rejected/ambiguous/blocked field-check results, and see informational readiness rows without enabling real verification, browser control, Avanza URLs/selectors, order pages, buy/sell clicks, form fills, broker results, Supabase writes, or trade mutation.
- Action 281 added `docs/avanza-instrument-page-phase-design.md`, a documentation-only design for the future phase after verified instrument identity. It scopes the phase to non-order instrument-page identity observation, defines planned statuses and prohibited-control policy, and explicitly forbids order pages, buy/sell clicks, order-form behavior, submissions, broker results, Supabase writes, and trade mutation.
- Action 282 added `lib/avanza-instrument-page-contract.ts`, a pure TypeScript result contract for future Avanza instrument-page identity checks. It compares expected/verified instrument identity with sanitized page identity, identifies matching pages, detects page mismatches, blocks order-page/form/final-confirm/sensitive states, treats buy/sell button visibility as guarded warnings, and adds e2e contract coverage without browser control, Avanza URLs/selectors, instrument-page/run/start buttons, order pages, buy/sell clicks, form fills, broker results, Supabase writes, or trade mutation.
- Action 283 added localhost bridge `POST /instrument-page` request/response contracts, `checkLocalhostBridgeInstrumentPage(...)`, response summaries, server stub modes for unavailable/page-identified/buy-sell-visible/mismatch/prohibited-controls/blocked/page-not-open/verification-not-ready states, bridge smoke matrix rows, and e2e/client normalization coverage. No browser control, Avanza selectors/URLs, instrument-page/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 284 added a dev-gated, read-only Instrument page preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/instrument-page` stub for the current dry-run request instrument, include the latest verified instrument result when available, inspect page-identified/mismatch/buy-sell-visible/blocked field-check results, and see informational readiness rows without enabling real instrument-page behavior, browser control, Avanza URLs/selectors, order-page opening, buy/sell clicks, form fills, broker results, Supabase writes, or trade mutation.
- Action 285 added `docs/avanza-order-page-open-phase-design.md`, a documentation-only design for the future phase after identified instrument-page identity. It scopes the phase to a guarded matching entry `Kop`/`Salj` click and order-page-open verification only, and explicitly forbids form fills, `Granska`, `Bekrafta`, final confirmation, broker results, Supabase writes, and trade mutation.
- Action 286 added `lib/avanza-order-page-open-contract.ts`, a pure TypeScript result contract for future order-page-open checks. It compares expected buy/sell action and instrument identity with sanitized order-page identity, returns opened/mismatch/wrong-action/prohibited-form-interaction/blocked states, blocks final-confirm/review-click/keyboard-submit/prefilled-form/sensitive states, and adds e2e contract coverage without browser control, Avanza selectors/URLs, form fills, review clicks, final-confirm clicks, broker results, Supabase writes, or trade mutation.
- Action 287 added localhost bridge `POST /order-page-open` request/response contracts, `checkLocalhostBridgeOrderPageOpen(...)`, response summaries, server stub modes, smoke matrix rows, and e2e/client normalization coverage for synthetic opened/wrong-action/mismatch/prefill/final-confirm/review-click/keyboard-submit/sensitive/not-ready states. No browser control, Avanza selectors/URLs, form fill, review click, final-confirm click, broker result, Supabase write, or trade mutation was added.
- Action 288 added a dev-gated, read-only Order page open preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/order-page-open` stub for the current dry-run request and latest identified instrument-page result when available, inspect opened/wrong-action/mismatch/blocked field-check results, and see informational readiness rows without enabling real order-page behavior, browser control, Avanza URLs/selectors, form fills, `Granska`, `Bekrafta`, broker results, Supabase writes, or trade mutation.
- Action 289 added `docs/avanza-advanced-form-fill-phase-design.md`, a documentation-only design for the future phase after `order_page_opened`. It scopes the phase to Advanced quantity/price field population and verification only, and explicitly forbids `Granska`, `Bekrafta`, keyboard submit, unsupported order modes, broker results, Supabase writes, History/Statistics updates, and trade mutation.
- Action 290 added `lib/avanza-advanced-form-fill-contract.ts`, a pure TypeScript result contract for future Advanced form-fill diagnostics. It evaluates sanitized form state against a dry-run request and `order_page_opened` result, covers filled/mismatch/validation/review/final-confirm/blocked states, and adds e2e contract coverage without browser control, Avanza selectors/URLs, runtime form fill, `Granska`, `Bekrafta`, broker results, Supabase writes, or trade mutation.
- Action 292 added a dev-gated, read-only Advanced form-fill preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/advanced-form-fill` stub for the current dry-run request and latest order-page-open result when available, inspect filled/mismatch/validation/prohibited/blocked field-check results, and see informational readiness rows without enabling real form fill, browser control, Avanza URLs/selectors, `Granska`, `Bekrafta`, broker results, Supabase writes, or trade mutation.
- Action 293 added `docs/avanza-review-click-phase-design.md`, a documentation-only design for the future phase after verified Advanced form fill. It defines a future `Granska`-only review click, confirmation-modal readback, and stop at `waiting_for_manual_confirmation`, while explicitly forbidding `Bekrafta`, keyboard submit, broker results, Supabase writes, and trade mutation.
- Action 294 added `lib/avanza-review-click-contract.ts`, a pure TypeScript contract for future review-click and confirmation-modal readback diagnostics. It evaluates sanitized confirmation modal readback against a dry-run request and `form_filled` Advanced result, covers confirmation-ready/mismatch/validation/final-confirm/blocked states, sets `waitingForManualConfirmation` metadata on success, and adds e2e contract coverage without browser control, Avanza URLs/selectors, runtime `Granska`, `Bekrafta`, broker results, Supabase writes, or trade mutation.
- Action 295 added localhost bridge `POST /review-click` request/response contracts, `checkLocalhostBridgeReviewClick(...)`, response summaries, server stub modes, smoke matrix rows, and e2e/client normalization coverage for synthetic confirmation-ready, mismatch, validation, final-confirm-visible, final-confirm-click, keyboard-submit, sensitive-data, missing-modal, review-label-mismatch, and form-not-ready states. No browser control, Avanza URLs/selectors, real `Granska`, `Bekrafta`, broker results, Supabase writes, or trade mutation was added.
- Action 296 added a dev-gated, read-only Review click preview to the Execution Handoff Preview Modal. The user can manually check the localhost `/review-click` stub for the current dry-run request and latest `form_filled` Advanced result when available, inspect confirmation-ready/mismatch/validation/final-confirm/keyboard/sensitive states, and see informational readiness rows without enabling real `Granska`, `Bekrafta`, browser control, Avanza URLs/selectors, broker results, Supabase writes, or trade mutation.
- Action 297 added `docs/avanza-manual-confirmation-wait-phase-design.md`, a documentation-only design for the future phase after `confirmation_ready`. It defines `waiting_for_manual_confirmation` as a human-authority boundary and explicitly forbids agent `Bekrafta`, keyboard submit, broker-result creation, Supabase writes, and trade mutation.
- Action 298 added `lib/avanza-manual-confirmation-wait-contract.ts`, a pure TypeScript result contract for future manual confirmation wait states. It evaluates `confirmation_ready` review-click results plus sanitized observations, covers waiting/cancelled/timed-out/user-confirmed-unverified/blocked states, and blocks agent final-confirm attempts, keyboard submit, unexpected broker results, unexpected trade mutations, and sensitive signals without browser control or Avanza selectors/URLs.
- Action 299 added localhost bridge `POST /manual-confirmation-wait` request/response contracts, `checkLocalhostBridgeManualConfirmationWait(...)`, response summaries, server stub modes, smoke matrix rows, and e2e/client normalization coverage for waiting, cancelled, unverified-confirmed, timed-out, final-confirm-visible-read-only, final-confirm-attempt, keyboard-submit, unexpected broker-result, unexpected trade-mutation, sensitive-data, and confirmation-not-ready states. No browser control, Avanza URLs/selectors, `Bekrafta`, broker results, Supabase writes, or trade mutation was added.
- Action 300 added `docs/avanza-broker-confirmation-capture-phase-design.md`, a documentation-only design for the future phase after a human manual final confirmation. It defines sanitized broker confirmation/receipt evidence capture, planned statuses, validation policy, privacy rules, hard stops, and the boundary between capture result, `BrokerExecutionResult`, execution record creation, Supabase persistence, History/Statistics integration, and live trade mutation. No Avanza automation, URLs/selectors, browser control, `Bekrafta`, broker result creation, Supabase write, or trade mutation was added.
- Action 301 added `lib/avanza-broker-confirmation-capture-contract.ts`, a pure TypeScript result contract for future sanitized broker confirmation capture. It compares dry-run input, `user_confirmed_unverified` manual wait state, and sanitized receipt readback; models captured, partial, mismatch, rejected/cancelled, blocked, and failed states; separates placed/accepted from filled execution; and blocks sensitive/raw evidence, broker-result creation attempts, and trade-mutation attempts without creating `BrokerExecutionResult`, execution records, Supabase writes, or trade mutation.
- Action 302 added localhost bridge `POST /broker-confirmation-capture` request/response contracts, `checkLocalhostBridgeBrokerConfirmationCapture(...)`, response summaries, server stub modes, smoke matrix rows, and e2e/client normalization coverage for synthetic captured, partial, mismatch, rejected/cancelled/expired, sensitive/raw evidence, broker-result-attempt, trade-mutation-attempt, manual-confirmation-not-observed, and confirmation-page-not-found states. No browser control, Avanza URLs/selectors, `Bekrafta`, order submission, `BrokerExecutionResult`, execution record, Supabase write, or trade mutation was added.
- Action 303 added a dev-gated, read-only Broker Confirmation Capture preview to the Execution Handoff Preview Modal. The UI calls only the localhost `/broker-confirmation-capture` stub, displays captured/partial/mismatch/rejected/blocked synthetic metadata plus field checks and safety labels, and adds informational readiness rows for future conversion design. No browser control, Avanza URLs/selectors, `Bekrafta`, order submission, `BrokerExecutionResult`, execution record, Supabase write, or trade mutation was added.
- Action 304 added `docs/avanza-broker-execution-result-conversion-boundary-design.md`, a documentation-only boundary design for future conversion from broker confirmation capture evidence to `BrokerExecutionResult`. It defines allowed/blocked criteria, placed-vs-filled policy, evidence requirements, idempotency, safety gates, UI expectations, diagnostics, and the recommended pure eligibility-contract next step. No conversion code, `BrokerExecutionResult`, execution record, Supabase write, Avanza automation, selectors/URLs, or trade mutation was added.
- Action 305 added `lib/avanza-broker-execution-result-eligibility.ts`, a pure TypeScript eligibility contract for future conversion. It evaluates capture results, builds sanitized evidence fingerprints, detects duplicate risk, separates placed/accepted/partial evidence from filled execution, and blocks mismatch, rejected/cancelled, missing evidence, sensitive/raw data, broker-result-attempt, and trade-mutation-attempt cases without creating `BrokerExecutionResult`, execution records, Supabase writes, or trade mutation.
- Action 306 added localhost bridge `POST /broker-execution-result-eligibility` request/response contracts, `checkLocalhostBridgeBrokerExecutionResultEligibility(...)`, response summaries, server stub modes, smoke matrix rows, and e2e/client normalization coverage for synthetic eligible, partial, blocked, duplicate, malformed, sensitive, broker-result-attempt, and trade-mutation-attempt states. No `BrokerExecutionResult`, execution record, Supabase write, trade mutation, Avanza automation, selector/URL, browser control, or order submission was added.
- Action 307 added a dev-gated, read-only BrokerExecutionResult eligibility preview to the Execution Handoff Preview Modal. It calls only the localhost eligibility stub, displays eligible/partial/blocked/duplicate synthetic metadata plus sanitized evidence fingerprints and readiness rows, and still creates no `BrokerExecutionResult`, execution record, Supabase write, trade mutation, Avanza automation, selector/URL, browser control, or order submission.
- Action 308 added `docs/avanza-broker-execution-result-conversion-mapping-design.md`, a documentation-only mapping design for future eligible filled broker-confirmation evidence to `BrokerExecutionResult`-shaped preview fields. It defines source requirements, target shape, field mapping, validation rules, status policy, idempotency, UI expectations, and future tests without implementing conversion, records, Supabase writes, trade mutation, Avanza automation, selectors/URLs, browser control, or order submission.
- Action 309 added `lib/avanza-broker-execution-result-preview.ts`, a pure TypeScript preview contract that maps eligible filled broker-confirmation capture evidence into a `BrokerExecutionResult`-shaped preview object marked `previewOnly` and `notBrokerExecutionResult`. Ineligible, partial-only, duplicate-risk, blocked, and failed evidence returns no preview. No real `BrokerExecutionResult`, execution record, Supabase write, trade mutation, Avanza automation, selector/URL, browser control, or order submission was added.
- Action 310 added localhost bridge `POST /broker-execution-result-preview` request/response contracts, `checkLocalhostBridgeBrokerExecutionResultPreview(...)`, response summaries, server stub modes, smoke matrix rows, and e2e/client normalization coverage for preview-available, missing-optional, partial-only, blocked, duplicate-risk, malformed, and invalid-response states. Preview objects remain marked `previewOnly` and `notBrokerExecutionResult`; no real `BrokerExecutionResult`, execution record, Supabase write, trade mutation, Avanza automation, selector/URL, browser control, or order submission was added.
- Action 311 added a dev-gated, read-only BrokerExecutionResult conversion preview panel to the Execution Handoff Preview Modal. It calls only the localhost preview stub, displays preview-shaped data and preview-only metadata when available, shows partial/blocked/duplicate/not-eligible states, and adds informational readiness rows. No real `BrokerExecutionResult`, execution record, Supabase write, trade mutation, Avanza automation, selector/URL, browser control, or order submission was added.
- Action 312 added `docs/execution-record-creation-boundary-design.md`, a documentation-only design for the future boundary from a real `BrokerExecutionResult` to local execution record creation. It separates broker-result conversion, local records, Supabase persistence, and live trade mutation; defines allowed/blocked criteria, idempotency, diagnostics, UI expectations, and recommends Action 313 as a pure execution-record eligibility contract. No code behavior changed.
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
- Action 233: Added `docs/avanza-ui-research-mapping.md`, a documentation-only mapping intake from the sanitized Avanza screenshot package. It documents search, instrument selection, stock detail, buy/sell order forms, validation states, review buttons, confirmation modal fields, the semi-automatic stop point, and mock-contract gaps. No Avanza automation, selector contract, URL, credential, broker result, Supabase write, or trade mutation was added.
- Action 234: Added `docs/avanza-vs-mock-order-contract-gap-analysis.md`, a documentation-only comparison of the Avanza UI mapping against current mock order and confirmation contracts. It identifies P0/P1/P2 mock gaps, future mock selectors, confirmation readback gaps, validation gaps, agent progress gaps, and recommends Actions 235-239. No code behavior or Avanza automation was added.
- Action 235: Extended `MockOrderPageFillPlan`, mock order page selectors, safe URL query prefill, validation, review UI, Playwright fill runner, manual mock-agent runner, and e2e coverage with mock-only Avanza Advanced fields. The final submit remains disabled and no broker result, Avanza automation, Supabase write, or trade mutation was added.
- Action 236: Extended the mock confirmation payload, URL builder, selectors, page query parsing, readback UI, disabled final-action labels, Playwright parser, and e2e coverage with mock-only Avanza confirmation readback fields. No broker result, `TureExecutionRecord`, Avanza automation, Supabase write, order submit, or trade mutation was added.
- Action 237: Added `MOCK_ORDER_MIN_AMOUNT_SEK`, pure mock order form validation categories, stable validation error selectors, UI error rendering, review blocking, and e2e coverage for missing required fields, minimum amount, unsupported order mode, and corrected valid review. No real broker behavior, Avanza automation, Supabase write, broker result, order submit, or trade mutation was added.
- Action 238: Hardened the mock fill runner and local mock-agent runner to enforce Advanced-only mode, fail safely on validation errors, verify review panel/confirmation link/disabled submit, expose response-level mock-agent verification metadata, and cover valid/failure paths in e2e. No Avanza automation, broker result, Supabase write, order submit, or trade mutation was added.
- Action 239: Added `docs/avanza-manual-selector-notes.md`, documenting manual Avanza visible labels, visual anchors, mock-field mappings, selector strategy notes, risks, and open questions. This is documentation only and does not add real selectors, URLs, automation, credentials, scraping, order submission, broker results, Supabase writes, or trade mutation.
- Action 240: Added `docs/avanza-manual-mapping-qa-checklist.md`, a safety-first manual session checklist and output template for resolving Avanza mapping open questions without automation or order submission.
- Action 241: Added `docs/avanza-manual-mapping-session-notes.md`, a structured manual session-notes intake template for sanitized Avanza observations, safety confirmation, screenshots, field inventory, validation notes, confirmation readback, risks, open questions, and follow-up doc updates.
- Action 242: Added `docs/semi-auto-avanza-prototype-safety-plan.md`, a documentation-only safety plan for the first future semi-automatic Avanza prototype. It defines review-only scope, forbidden final confirmation, hard stops, verification gates, progress events, manual test protocol, prerequisites, risk register, and go/no-go criteria.
- Action 243: Added `docs/semi-auto-avanza-prototype-requirements.md`, a documentation-only requirements spec for the first future semi-automatic Avanza prototype. It covers functional, verification, safety, failure, progress-event, logging, test, acceptance, and pre-implementation requirements.
- Action 244: Added `docs/avanza-final-confirm-block-design.md`, a documentation-only final-confirm block design. It requires future semi-auto Avanza runner clicks to go through safe action wrappers, treats confirmation modal detection as a terminal success state, deny-lists final confirmation labels, and keeps automatic mode as a separate future capability.
- Action 245: Added `lib/safe-browser-action-contract.ts` and `docs/safe-browser-action-contract.md`, a pure safe browser action contract. It validates planned future actions, blocks semi-auto final-confirm-like click/select actions, allows read/wait/stop on final-confirm-like targets, and keeps automatic final confirmation as an out-of-scope warning.
- Action 246: Added `lib/safe-browser-action-runner.ts`, a pure no-op safe browser action runner interface. It accepts validated safe action batches, returns per-action execution results, blocks final-confirm clicks, skips later actions when configured, and never executes browser actions.
- Action 247: Added `lib/mock-order-safe-action-plan.ts`, a pure mock order safe action plan builder. It converts `MockOrderPageFillPlan` into validated `SafeBrowserAction` objects for local mock order fill/review/readback planning and proves the plan through the no-op runner.
- Action 248: Added `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`, a test-only Playwright adapter for safe action plans on `/mock-broker/order`. It executes only validated mock targets, clicks only review, blocks unsafe final-confirm actions, and remains outside app runtime.
- Action 249: Added `lib/safe-browser-action-diagnostics.ts`, a pure diagnostics contract for safe action execution results. The mock Playwright adapter emits that shape for successful and blocked paths, including `finalConfirmBlocked`, without adding app-runtime browser automation.
- Action 250: Added `lib/safe-browser-action-diagnostics-store.ts` and the Settings `Safe Browser Action Diagnostics` viewer. It stores/displays local safe-action telemetry only, supports scoped clear, and does not create broker results, execution records, Supabase writes, or trade mutations.
- Action 251: Integrated safe-action diagnostics into the dev-only localhost mock-agent flow. The mock runner and bridge return diagnostics metadata, the modal displays/saves it locally, and e2e verifies Settings can inspect the saved run with no broker result or Avanza automation.
- Action 252: Added `lib/browser-runner-capability-gate.ts`, capability metadata labels, and UI diagnostics classification. Mock-only diagnostics show `Mock-only browser diagnostics` / `No broker submission`; unknown or real-broker-like capabilities are blocked by default.
- Action 253: Added `docs/avanza-dry-run-capability-spec.md`, documenting the future `avanza_broker` dry-run capability, required gates, allowed/forbidden actions, hard stops, diagnostics requirements, and next pure gate work. No code behavior changed.
- Action 254: Extended the pure capability gate with an Avanza dry-run capability factory, stricter validation, dry-run UI labels, and e2e coverage for allowed dry-run plus blocked broker-submission/final-confirm/automatic variants. No Avanza automation, URLs, selectors, browser runner, broker result, Supabase write, or trade mutation was added.
- Action 255: Added a pure Avanza dry-run request contract with defaults, validation, summary helpers, safety labels, and e2e coverage for valid buy/sell plus invalid ticker, quantity, price, order mode, account policy, and unsafe metadata. No Avanza automation, URLs, selectors, browser runner, broker result, Supabase write, or trade mutation was added.
- Action 256: Added a pure execution-intent-to-Avanza-dry-run adapter and e2e coverage for valid buy/sell intent conversion plus missing ticker, missing quantity, missing price, unsupported action, automatic authority, and unsafe metadata blocking. No Avanza automation, URLs, selectors, browser runner, broker result, Supabase write, or trade mutation was added.
- Action 257: Added a dev-only read-only dry-run request preview to the handoff modal and e2e coverage that verifies preview labels and absence of Avanza run/start/open controls. No Avanza automation, URLs, selectors, browser runner, broker result, Supabase write, or trade mutation was added.
- Action 258: Added a dev-only read-only Avanza dry-run readiness checklist panel and e2e coverage for `Not ready to run`, missing runner, default blocked gate, explicit `dry_run_only` classification, disabled broker submission/final confirm/automatic mode, missing selectors/URLs, and manual final confirmation. No Avanza automation, URLs, selectors, browser runner, broker result, Supabase write, or trade mutation was added.
- Action 259: Added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only implementation plan for the first future Avanza dry-run runner. It covers architecture, flags/gates, execution flow, stop/failure states, diagnostics requirements, staged tests, future UI behavior, security/privacy notes, explicit out-of-scope items, and recommends Action 260 - Avanza Dry-Run Runner Self-Check Contract. No code behavior changed.
- Action 260: Added `lib/avanza-dry-run-runner-self-check.ts`, a pure self-check contract and e2e coverage for unavailable, mock-only, blocked-by-default Avanza dry-run, explicitly allowed dry-run-only, broker-submission blocked, and final-confirm blocked runner capability states. The readiness panel now uses the unavailable self-check blocker for the current no-runner state. No Avanza automation, URLs, selectors, browser runner, run button, broker result, Supabase write, or trade mutation was added.
- Action 261: Added `GET /self-check` to the localhost bridge contract, client, and server stub. The Execution Handoff Preview Modal can manually check localhost runner self-check metadata and display status, labels, blockers, and capability flags without enabling Avanza dry-run or browser control. E2E covers unavailable and mock-only self-check responses. No Avanza automation or broker effect was added.
- Action 262: Integrated the latest localhost self-check result into the Avanza dry-run readiness panel. Unavailable remains `Not ready to run`, mock-only becomes `Not ready for Avanza dry-run`, and future dry-run-only can show `Dry-run runner available` while still showing no broker submission, final confirm disabled, manual final confirmation, and no Avanza run/start control.
- Action 266: Added a local Avanza dry-run runner skeleton and bridge env mode `dry_run_skeleton`. Skeleton self-check can report `available_dry_run_only`, and skeleton `/dry-run` can return `accepted_stub` with explicit no-browser-control/no-actions/no-broker-submission metadata. No Avanza automation, selectors, URLs, browser control, run button, broker result, Supabase write, or trade mutation was added.
- Action 267: Formalized the localhost bridge smoke coverage as a printed mode/endpoint matrix. Default, mock-only, skeleton, unsafe, missing-input, and invalid-JSON cases are covered without adding Avanza automation, selectors, URLs, browser control, run buttons, broker results, Supabase writes, or trade mutation.
- Action 268: Added the Avanza manual mapping refresh pack and linked it from the manual session notes, QA checklist, research mapping, selector notes, and dry-run runner plan. The next Avanza-adjacent step should use this pack to refresh manual UI evidence before any session-detection/search-only design.
- Action 269: Added the Avanza session detection only design. It defines allowed readiness detection, forbidden browser/order/account actions, planned result statuses, privacy rules, UI labels, failure handling, test plan, and graduation criteria for a future search-only phase.
- Action 270: Added the pure Avanza session detection result contract and e2e contract coverage for browser disconnected, Avanza not visible, login required, sensitive data blocked, order/confirmation contexts blocked, ready-for-search-only, summaries, labels, and metadata safety flags.
- Action 271: Added localhost bridge `GET /session-detection` contract/client/server stub support and smoke coverage for unavailable/default plus ready-for-search-only, login-required, and sensitive-data-blocked synthetic modes. The stub returns only sanitized metadata and asserts no browser actions, no Avanza page touch, no broker result, no Supabase write, and no trade mutation.
- Action 272: Added a dev-only read-only session-detection preview in the handoff modal and e2e coverage for ready-for-search-only, login-required, and blocked-sensitive stub responses. The readiness panel now includes informational session-detection rows while still adding no search/run/start button and no browser or broker behavior.
- Action 273: Added the documentation-only Avanza search-only phase design. It scopes the next possible phase to sanitized instrument candidate lookup and recommends Action 274 - Avanza Search-Only Result Contract as pure TypeScript only, with no browser control, Avanza selectors/URLs, search button, order page, buy/sell click, broker result, Supabase write, or trade mutation.
- Action 274: Added the pure Avanza search-only result contract and e2e contract coverage for exact match, duplicate/ambiguous candidates, ticker mismatch/no-match, missing currency risk, sensitive-data blocking, order-flow blocking, summaries, safety labels, and no-order/no-broker metadata. No browser control, Avanza selectors/URLs, search button, order page, buy/sell click, broker result, Supabase write, or trade mutation was added.
- Action 275: Added localhost bridge `POST /search-only` request/response contracts, `checkLocalhostBridgeSearchOnly(...)`, server stub modes for unavailable/search-not-available/exact/ambiguous/no-match/session-not-ready/sensitive-data block/order-flow block, smoke matrix assertions, and e2e client normalization tests. No browser control, Avanza selectors/URLs, search/run/start button, order page, buy/sell click, broker result, Supabase write, or trade mutation was added.
- Action 276: Added a dev-only read-only Search-only preview in the handoff modal and e2e coverage for exact-match, ambiguous, no-match, and order-flow-blocked stub responses. The readiness panel now includes informational search-only rows while still adding no search/run/start/order button, browser control, Avanza selectors/URLs, order page, buy/sell click, broker result, Supabase write, or trade mutation.
- Action 277: Added the documentation-only Avanza instrument-verification phase design. It defines allowed identity comparison, forbidden order-flow behavior, planned statuses, verification policy, hard stops, privacy rules, UI boundaries, test plan, and graduation criteria toward a later instrument-page or order-page design. No code behavior, browser control, Avanza selectors/URLs, verify/search/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 278: Added the pure Avanza instrument-verification result contract and e2e contract coverage for verified exact candidates, ambiguous search state, missing selected candidate, ticker/market/currency rejection, missing currency ambiguity, low-confidence ambiguity, sensitive-data blocking, order-flow blocking, summaries, safety labels, and no-order/no-broker metadata. No browser control, Avanza selectors/URLs, verify/search/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 279: Added localhost bridge `POST /instrument-verification` request/response contracts, `checkLocalhostBridgeInstrumentVerification(...)`, response summaries, server stub modes for verified, rejected ticker/market/currency, ambiguous missing-currency/low-confidence, blocked sensitive/order-flow, search-not-ready, and missing-candidate states, bridge smoke matrix rows, and e2e/client normalization coverage. No browser control, Avanza selectors/URLs, verify/search/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 280: Added a dev-only read-only Instrument verification preview in the handoff modal and e2e coverage for verified, rejected, ambiguous, and order-flow-blocked stub responses. The readiness panel now includes informational instrument-verification rows while still adding no verify/search/run/start/order button, browser control, Avanza selectors/URLs, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation.
- Action 281: Added the documentation-only Avanza instrument-page phase design. It defines allowed non-order page identity observation, forbidden order-flow behavior, planned statuses, page identity policy, prohibited control policy, hard stops, privacy rules, UI boundaries, test plan, and graduation criteria toward a later order-page-open design. No code behavior, browser control, Avanza selectors/URLs, instrument-page/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 282: Added the pure Avanza instrument-page result contract and e2e contract coverage for matching page identity, verification-not-ready, page-not-open, ticker/currency/missing-field mismatches, order-page context blocking, order-form blocking, final-confirm blocking, account/balance/holdings/sensitive blocking, buy/sell visibility warnings, summaries, safety labels, and no-order/no-broker metadata. No browser control, Avanza selectors/URLs, instrument-page/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation was added.
- Action 283: Added localhost bridge `POST /instrument-page` request/response contracts, `checkLocalhostBridgeInstrumentPage(...)`, response summaries, server stub modes for page identified, buy/sell-visible warnings, ticker/currency/missing-field mismatches, prohibited controls, blocked order-page/order-form/final-confirm/sensitive states, verification-not-ready, page-not-open, unavailable, and malformed request failures. Bridge smoke and e2e/client tests cover the major states without browser control, Avanza selectors/URLs, instrument-page/run/start button, order page, buy/sell click, form fill, broker result, Supabase write, or trade mutation.

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

- `lib/safe-browser-action-contract.ts`
- `lib/safe-browser-action-runner.ts`
- `lib/mock-order-safe-action-plan.ts`
- `docs/safe-browser-action-contract.md`
- `tests/e2e/helpers/safe-browser-action-playwright-adapter.ts`
- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`

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
- Localhost `/self-check` can report a dry-run skeleton only when `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton` is set.
- Localhost `/session-detection` can report synthetic session-detection metadata only when explicitly configured through `AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE`; it never controls a browser or touches Avanza.
- Localhost `/dry-run` can return skeleton `accepted_stub` only in that explicit mode, and still executes no browser actions.
- Localhost bridge smoke now prints a mode matrix for default, mock-only, skeleton, session-detection, unsafe, missing-input, and invalid-JSON dry-run cases.
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

- Action 287 - Order Page Open Bridge Stub Contract.

Alternative:

- Action 287 - Avanza Mapping Refresh Update.

The preferred next step is still non-executing contract/stub work, not
automation. Avanza automation, URLs, selectors, browser runners,
order-page/run/start controls, form fills, review clicks, final-confirm clicks,
broker results, Supabase writes, and trade mutation remain out of scope.
Supabase audit persistence can resume separately after local/staging tooling
exists; production remains no-go until RLS and `user_id` ownership are
resolved.

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

Purpose:

- Add a non-executing localhost bridge `POST /order-page-open` contract and
  stub for future order-page-open diagnostics.
- Return synthetic `AvanzaOrderPageOpenResult`-compatible responses from
  explicit local stub modes.
- Keep order-page-open diagnostics separate from browser control, Avanza
  runtime selectors, form fill, review clicks, final-confirm clicks, broker
  results, Supabase writes, and trade mutation.

Contract/client coverage:

- `LocalhostBridgeOrderPageOpenRequest`
- `LocalhostBridgeOrderPageOpenResponse`
- `buildLocalhostBridgeOrderPageOpenRequest(...)`
- `validateLocalhostBridgeOrderPageOpenRequest(...)`
- `validateLocalhostBridgeOrderPageOpenResponse(...)`
- `checkLocalhostBridgeOrderPageOpen(...)`
- `summarizeLocalhostOrderPageOpenBridgeResponse(...)`

Server stub modes:

- `unavailable`
- `order_page_opened_buy`
- `order_page_opened_sell`
- `wrong_action_opened`
- `order_page_mismatch_ticker`
- `order_page_mismatch_currency`
- `prohibited_form_prefilled`
- `blocked_final_confirm`
- `blocked_review_click_attempt`
- `blocked_keyboard_submit`
- `blocked_sensitive`
- `instrument_page_not_ready`
- `missing_order_page_identity`

Smoke/e2e coverage:

- default `/order-page-open` returns unavailable safely.
- missing dry-run input returns failed/400 safely.
- malformed JSON returns failed/400 safely.
- opened buy/sell modes return `order_page_opened`.
- wrong action returns `wrong_action_opened`.
- ticker/currency mismatch returns `order_page_mismatch`.
- prefilled form returns `prohibited_form_interaction_detected`.
- final-confirm, review-click attempt, keyboard-submit, and sensitive-data
  modes return `blocked`.
- instrument-page-not-ready returns `instrument_page_not_ready`.
- client normalization handles opened, mismatch, wrong action, prefill,
  blocked, not-ready, missing identity, invalid JSON, and invalid request
  inputs.

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

## Action 298 - Manual Confirmation Wait Result Contract

Files changed:

- `lib/avanza-manual-confirmation-wait-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-manual-confirmation-wait-phase-design.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future manual confirmation wait
  states after a `confirmation_ready` review-click result.
- Represent `waiting_for_manual_confirmation`, `user_cancelled`,
  `user_confirmed_unverified`, `timed_out`, `confirmation_not_ready`,
  `blocked`, and failed-style states.
- Keep `user_confirmed_unverified` separate from broker result capture.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 297 - Manual Confirmation Wait Phase Design

Files changed:

- `docs/avanza-manual-confirmation-wait-phase-design.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the future Manual Confirmation Wait phase after a
  `confirmation_ready` review-click result.
- Clarify that the human remains final authority and Ture may only display
  sanitized wait state such as `waiting_for_manual_confirmation`.
- Define planned statuses including `confirmation_not_ready`,
  `waiting_for_manual_confirmation`, `user_cancelled`,
  `user_confirmed_unverified`, `timed_out`, `blocked`, and `failed`.

Safety result:

- Documentation only.
- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 296 - Review Click UI Preview

Files changed:

- `app/trade-app.tsx`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-localhost-bridge-contract.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a dev-gated, read-only `Review click preview` panel to the Execution
  Handoff Preview Modal.
- Let the modal manually call the localhost `/review-click` stub for the
  current dry-run request and latest `form_filled` Advanced result when
  available.
- Display confirmation-ready, mismatch, validation-error,
  final-confirm-blocked, keyboard-submit-blocked, sensitive-data-blocked,
  field-check, risk-flag, blocker, warning, and no-action metadata.

Readiness/UI coverage:

- The Avanza dry-run readiness checklist now includes informational
  review-click rows.
- `confirmation_ready` shows `Ready for future manual-confirmation wait design`
  but does not enable final confirmation or broker-result capture.
- mismatch, validation, final-confirm, keyboard-submit, and sensitive-data
  states surface manual-review or blocker copy.
- The button text is `Check review-click stub`; no Avanza run/start/review,
  `Granska`, or `Bekrafta` button was added.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No real `Granska` click was added.
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

- Add a non-executing localhost bridge `POST /advanced-form-fill` contract and
  stub for future Advanced form-fill diagnostics.
- Return synthetic `AvanzaAdvancedFormFillResult`-compatible responses from
  explicit local stub modes.
- Keep Advanced form-fill diagnostics separate from browser control, Avanza
  runtime selectors, real form fills, review/final-confirm clicks, broker
  results, Supabase writes, and trade mutation.

Coverage:

- default `/advanced-form-fill` returns unavailable safely.
- missing `dryRunOrderInput` and malformed JSON fail safely.
- buy/sell filled stubs return `form_filled`.
- quantity/price mismatch returns `field_mismatch`.
- validation errors return `validation_error`.
- Stop Loss mode returns `unsupported_order_mode`.
- prohibited `Granska`, prohibited final-confirm, and keyboard-submit cases
  stop with blocked/prohibited statuses.

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

## Action 289 - Avanza Advanced Form Fill Phase Design

Files changed:

- `docs/avanza-advanced-form-fill-phase-design.md`
- `docs/avanza-order-page-open-phase-design.md`
- `docs/avanza-instrument-page-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Define the future Advanced form-fill phase after `order_page_opened`.
- Scope the phase to allowed Advanced quantity/`antal` and price/course/`kurs`
  field population plus readback verification only.
- Document planned inputs, statuses, field policy, Advanced-mode policy,
  verification policy, safe action requirements, hard stops, privacy rules, UI
  behavior, test plan, and graduation criteria.

Recommended next action:

- Action 290 - Avanza Advanced Form Fill Result Contract

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No Avanza form-fill/run/start button was added.
- No runtime form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
- No order submission was added.
- No broker result was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 290 - Avanza Advanced Form Fill Result Contract

Files changed:

- `lib/avanza-advanced-form-fill-contract.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/avanza-advanced-form-fill-phase-design.md`
- `docs/avanza-order-page-open-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Purpose:

- Add a pure TypeScript result contract for future Avanza Advanced form-fill
  diagnostics.
- Evaluate sanitized form state against a valid dry-run request and
  `order_page_opened` result.
- Model `unavailable`, `order_page_not_ready`, `unsupported_order_mode`,
  `form_filled`, `field_mismatch`, `validation_error`,
  `prohibited_review_detected`, `prohibited_final_confirm_detected`, `blocked`,
  and `failed` states.

Contract coverage:

- matching Advanced action/ticker/quantity/price -> `form_filled`
- order page not ready -> `order_page_not_ready`
- missing form state -> `unavailable`
- Stop Loss / Glidande / unknown order mode -> `unsupported_order_mode`
- action/ticker/quantity/price mismatch -> `field_mismatch`
- validation error visible -> `validation_error`
- review/`Granska` click attempt -> `prohibited_review_detected`
- final-confirm visible or attempted -> `prohibited_final_confirm_detected`
- keyboard submit, account change, unsupported field touch, account/balance/
  holdings/sensitive signals -> `blocked`
- review button visible only is a warning by default

Recommended next action:

- Action 291 - Advanced Form Fill Bridge Stub Contract

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No Playwright import was added to runtime.
- No browser control was added.
- No runtime form fill was added.
- No `Granska` click was added.
- No `Bekrafta` click was added.
- No keyboard submit was added.
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

Purpose:

- Add a dev-gated, read-only `Order page open preview` panel to the Execution
  Handoff Preview Modal.
- Let the modal manually call the localhost `/order-page-open` stub for the
  current dry-run request and latest identified instrument-page result when
  available.
- Display opened, wrong-action, mismatch, blocked, field-check, risk-flag,
  blocker, warning, and safety metadata without activating any order-page or
  form-fill behavior.

Readiness/UI coverage:

- The Avanza dry-run readiness checklist now includes informational
  order-page-open rows.
- `order_page_opened` shows `Ready for future form-fill design` but does not
  enable form fill.
- wrong-action, mismatch, and blocked states surface manual-review or blocker
  copy.
- The button text is `Check order-page-open stub`; no Avanza open/run/start
  button was added.

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

## Action 313 - Execution Record Eligibility Contract

Files changed:

- `lib/execution-record-eligibility.ts`
- `tests/e2e/execution-sandbox.spec.ts`
- `docs/execution-record-creation-boundary-design.md`
- `docs/avanza-broker-execution-result-conversion-mapping-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a pure TypeScript eligibility contract for sanitized
  broker-result-like candidates before any future local execution record
  creation.
- Added deterministic candidate fingerprinting from sanitized broker, action,
  ticker, quantity, price, timestamp, broker reference, and source
  fingerprints.
- Added blockers for preview-only candidates, missing required fields,
  not-filled status, missing source fingerprint, sensitive/raw data,
  Supabase-write attempts, trade-mutation attempts, and execution-record
  creation attempts.
- Added duplicate-risk detection for source fingerprints and broker
  references.
- Added e2e contract coverage for eligible, missing, blocked, warning, and
  duplicate-risk states.

Safety result:

- Eligibility check only.
- No `BrokerExecutionResult` was created.
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

- Added localhost bridge `POST /execution-record-eligibility`.
- Added request/response contract types, builder, validators, client helper,
  and summary helper.
- Added server stub modes for eligible filled candidates, preview-only
  blockers, missing evidence, not-filled status, sensitive/raw evidence,
  Supabase/trade/record-creation attempts, duplicate source fingerprints, and
  duplicate broker references.
- Extended the bridge smoke matrix and e2e client normalization coverage.

Safety result:

- Eligibility bridge stub only.
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
- `docs/execution-record-creation-boundary-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a dev-gated, read-only Execution Handoff Preview Modal panel for
  `POST /execution-record-eligibility`.
- Added modal state, readiness rows, and a manual
  `Check execution-record eligibility stub` control.
- The panel uses the latest BrokerExecutionResult-shaped preview candidate
  when available, while preserving `previewOnly` metadata so default eligibility
  remains blocked unless the stub explicitly returns synthetic eligible data.
- The panel displays eligible, blocked, not-eligible, duplicate-risk, and
  failed states, plus record fingerprint, reasons, blockers, warnings, labels,
  and no-record/no-Supabase/no-trade-mutation metadata.
- Extended e2e coverage for eligible, preview-only blocked, missing-price,
  not-filled, and duplicate-source-fingerprint states.

Safety result:

- UI preview/stub check only.
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

Implemented:

- Added a documentation-only decomposition plan for the large Execution Handoff
  Preview Modal in `app/trade-app.tsx`.
- Inventoried the current core preview, readiness, localhost bridge, dry-run,
  session/search/instrument, order/form/review/manual confirmation, broker
  confirmation, BrokerExecutionResult, and execution-record eligibility panels.
- Proposed future component and hook boundaries under `components/execution/**`
  and `hooks/execution/**`.
- Documented state ownership, behavior preservation rules, test preservation,
  staged extraction actions, risk register, and acceptance criteria.
- Recommended Action 317 as a no-behavior-change extraction of shared
  presentational components.

Safety result:

- Documentation only.
- No code behavior changed.
- No modal code was moved.
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

Implemented:

- Extracted pure shared presentational helpers from `app/trade-app.tsx`:
  `Detail`, `TextBlock`, and `EmptyState`.
- Added `components/execution/handoff-modal-shared.tsx`.
- Updated `app/trade-app.tsx` to import those helpers.
- Left modal state, hooks, bridge/client calls, endpoint handlers, readiness
  derivation, and preview panels in place.
- Left the `app/trade-app.tsx` ESLint override in place for now.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 331 - Extract Avanza Readiness Derived-State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/execution/useAvanzaReadinessState.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Extracted Avanza dry-run readiness row and section-summary assembly into
  `useAvanzaReadinessState(...)`.
- Moved the dry-run capability gate derivation, localhost self-check fallback,
  phase-specific readiness summaries, readiness row composition, and complete
  `AvanzaDryRunReadinessPanel` props object into the hook.
- Kept selected intent/handoff ownership, dry-run request creation, bridge
  calls, click handlers, preview state hooks, lifecycle stubs, and UI rendering
  in `app/trade-app.tsx`.
- Preserved readiness row ordering, labels, statuses, copy, safety labels,
  overall status text, visible UI, and dev gating.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, real `BrokerExecutionResult`, execution record, Supabase write,
  or trade mutation was added.

## Action 332 - Reassess trade-app.tsx Size and Remaining Responsibilities

Files changed:

- `docs/trade-app-responsibility-reassessment.md`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Added a documentation-only reassessment of `app/trade-app.tsx` after Actions
  317-331.
- Recorded the current approximate file size, remaining handoff modal
  responsibilities, remaining app-wide responsibilities, extraction risks, and
  ranked next extraction candidates.
- Recommended Action 333: extract core handoff summary and request preview
  components.

Safety result:

- No runtime code changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, real `BrokerExecutionResult`, execution record, Supabase write,
  or trade mutation was added.

## Action 330 - Extract Late Phase Preview State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/execution/useLatePhasePreviewState.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Extracted broker confirmation capture, BrokerExecutionResult eligibility,
  BrokerExecutionResult conversion preview, and execution-record eligibility
  preview state/handlers into `useLatePhasePreviewState(...)`.
- Moved the late phase result chaining needed by BrokerExecutionResult
  eligibility/conversion and execution-record eligibility into the hook while
  returning derived results and flags to the parent.
- Kept selected intent/handoff ownership, dry-run request creation, readiness
  row building, early/middle phase preview state, localhost bridge controls
  state, lifecycle stubs, and unrelated modal handlers in `app/trade-app.tsx`.
- Did not introduce a manual-confirmation wait UI.
- Preserved request payloads, metadata, response messages, loading flags,
  disabled behavior, button text, visible copy, dev gating, and readiness
  consumption.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, real `BrokerExecutionResult`, execution record, Supabase write,
  or trade mutation was added.

## Action 323 - Handoff Modal ESLint Override Feasibility Check

Files changed:

- `eslint.config.mjs`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Evaluated the narrow `app/trade-app.tsx` React Hooks ESLint override after
  Actions 317-322 decomposed much of the modal rendering.
- Temporarily removed the override and ran `npm run lint`.
- Lint completed successfully without a React Hooks rule stack overflow or
  rule failure.
- Removed the override permanently from `eslint.config.mjs`.
- Documented that the next recommended action is
  `Action 324 - Handoff Modal State/Handler Grouping Plan`.

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

Implemented:

- Added a documentation-only plan for grouping the remaining Execution Handoff
  Preview Modal state, handlers, derived readiness values, diagnostics side
  effects, and result chaining before hook extraction.
- Documented current ownership in `app/trade-app.tsx`.
- Defined proposed state clusters for core modal state, localhost bridge state,
  early/middle/late phase preview state, readiness derived state, and
  diagnostics/local storage side effects.
- Documented the dependency chain from dry-run request through execution-record
  eligibility.
- Recommended future hook candidates and staged Actions 325-331.
- Recommended `Action 325 - Extract Handoff Modal Pure Data Mappers` as the
  next step before moving any state or handlers.

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

Implemented:

- Extracted the rendered dev-only late phase stub preview UI from
  `app/trade-app.tsx`.
- Added presentational components for broker-confirmation-capture,
  BrokerExecutionResult eligibility, BrokerExecutionResult conversion preview,
  and execution-record eligibility previews.
- Kept all loading state, response state, messages, derived booleans, result
  chaining, bridge client calls, and click handlers in the parent modal.
- Extended shared presentation helpers with the existing late-panel color tones.
- Left manual-confirmation wait as readiness/contract-only in the current modal
  because no separate preview control was rendered to extract.
- Left the `app/trade-app.tsx` ESLint override in place for now.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
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

Implemented:

- Extracted the dev-only middle phase stub preview rendering from
  `app/trade-app.tsx`.
- Added presentational components for instrument-page, order-page-open,
  Advanced form-fill, and review-click previews.
- Kept all loading state, response state, messages, derived booleans, result
  chaining, bridge client calls, and click handlers in the parent modal.
- Added small shared presentation helpers for repeated safety labels and field
  check rows.
- Left late-phase stub preview panels inline for later decomposition actions.
- Left the `app/trade-app.tsx` ESLint override in place for now.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
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

Implemented:

- Extracted the dev-only Avanza dry-run readiness panel rendering from
  `app/trade-app.tsx` into
  `components/execution/AvanzaDryRunReadinessPanel.tsx`.
- Kept all readiness derivation, state, hooks, bridge/client calls, and response
  handlers in the parent modal.
- Passed already-computed readiness data into the panel through typed props.
- Left the `app/trade-app.tsx` ESLint override in place for now.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
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

Implemented:

- Extracted the localhost bridge control/rendering surface from
  `app/trade-app.tsx` into
  `components/execution/LocalhostBridgeControls.tsx`.
- Moved only rendering for the dry-run bridge response preview, localhost echo,
  runner self-check, mock-agent, and cancel controls/result displays.
- Kept all loading state, response state, messages, derived booleans, bridge
  client calls, and click handlers in the parent modal.
- Left broader early-phase preview panels and the bridge request envelope
  preview inline for later decomposition actions.
- Left the `app/trade-app.tsx` ESLint override in place for now.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
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

Implemented:

- Extracted the dev-only early phase stub preview rendering from
  `app/trade-app.tsx`.
- Added presentational components for session-detection, search-only, and
  instrument-verification previews.
- Kept all loading state, response state, messages, derived booleans, result
  chaining, bridge client calls, and click handlers in the parent modal.
- Left middle/later stub preview panels inline for later decomposition actions.
- Left the `app/trade-app.tsx` ESLint override in place for now.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
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

Implemented:

- Extracted pure readiness row mappers for BrokerExecutionResult conversion
  preview readiness and execution-record eligibility readiness.
- Moved shared `ExecutionSandboxQaItem` / `ExecutionSandboxQaStatus` display row
  types into the mapper module.
- Kept modal state, hooks, handlers, bridge/client calls, API calls, loading
  flags, response state, and result chaining in `app/trade-app.tsx`.
- At the time, recommended the localhost bridge state hook as the next
  decomposition step; Action 326 later continued pure mapper extraction first.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 326 - Extract More Handoff Modal Pure Data Mappers

Files changed:

- `app/trade-app.tsx`
- `lib/handoff-modal-data-mappers.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Extracted additional pure readiness row mappers for session-detection,
  search-only, instrument-verification, instrument-page, order-page-open,
  Advanced form-fill, review-click, broker-confirmation-capture, and
  BrokerExecutionResult eligibility.
- Kept modal state, hooks, handlers, bridge/client calls, API calls, loading
  flags, response state, and result chaining in `app/trade-app.tsx`.
- Preserved readiness row ordering by replacing each inline row group with a
  spread call in the same position.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 327 - Extract Localhost Bridge State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/execution/useLocalhostBridgeControlsState.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Extracted the localhost bridge controls state and handlers into
  `useLocalhostBridgeControlsState(...)`.
- Moved bridge echo, runner self-check, dry-run bridge stub, mock-agent run, and
  cancel state/handlers from the modal into the hook.
- Kept selected intent/handoff ownership, phase preview state, broker/capture
  state, readiness rows, and unrelated modal lifecycle/preparation/capture
  handlers in `app/trade-app.tsx`.
- Preserved local audit events, local agent-run diagnostics, safe-action
  diagnostics saving, request payloads, messages, loading flags, disabled
  behavior, button text, and dev gating.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 328 - Extract Early Phase Preview State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/execution/useEarlyPhasePreviewState.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Extracted session-detection, search-only, and instrument-verification preview
  state/handlers into `useEarlyPhasePreviewState(...)`.
- Moved the early phase result chaining needed by search-only and
  instrument-verification into the hook while returning the derived results and
  flags to the parent.
- Kept selected intent/handoff ownership, dry-run request creation, readiness
  row building, middle/late phase preview state, localhost bridge controls
  state, and unrelated modal handlers in `app/trade-app.tsx`.
- Preserved request payloads, metadata, response messages, loading flags,
  disabled behavior, button text, visible copy, dev gating, and downstream
  chaining into later phases.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 329 - Extract Middle Phase Preview State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/execution/useMiddlePhasePreviewState.ts`
- `docs/handoff-modal-state-handler-grouping-plan.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Implemented:

- Extracted instrument-page, order-page-open, Advanced form-fill, and
  review-click preview state/handlers into
  `useMiddlePhasePreviewState(...)`.
- Moved the middle phase result chaining needed by order-page-open, Advanced
  form-fill, and review-click into the hook while returning the derived results
  and flags to the parent.
- Kept selected intent/handoff ownership, dry-run request creation, readiness
  row building, early phase preview state, late phase preview state, localhost
  bridge controls state, and unrelated modal handlers in `app/trade-app.tsx`.
- Preserved request payloads, metadata, response messages, loading flags,
  disabled behavior, button text, visible copy, dev gating, and downstream
  chaining into late phases.

Safety result:

- No behavior changed.
- No button text changed.
- No dev gating changed.
- No tests were removed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

## Action 333 - Extract Core Handoff Summary and Request Preview Components

Action 333 moved core read-only request preview rendering out of
`app/trade-app.tsx` into presentational components:

- `components/execution/HandoffCoreSummary.tsx`
- `components/execution/FutureAgentRequestPreview.tsx`
- `components/execution/AvanzaDryRunRequestPreview.tsx`
- `components/execution/BridgeRequestEnvelopePreview.tsx`

What moved:

- core handoff summary/header/status display
- future agent request preview display
- Avanza dry-run request preview display
- bridge request envelope preview display

What stayed in `app/trade-app.tsx`:

- modal shell/open-close behavior
- selected intent/handoff ownership
- dry-run request creation
- future-agent request and bridge envelope creation
- validation derivation
- state hooks, handlers, bridge/client calls, lifecycle/progress stubs, and QA
  item assembly

Safety result:

- Behavior, visible text, labels, JSON/details display, button
  presence/absence, and dev gating are preserved.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 334 — Extract Execution Sandbox QA / Audit Sections**

## Action 334 - Extract Execution Sandbox QA / Audit Sections

Action 334 moved QA/audit rendering out of `app/trade-app.tsx` into
presentational components:

- `components/execution/ExecutionSandboxQaPanel.tsx`
- `components/execution/AgentProgressStubPanel.tsx`

What moved:

- Execution Sandbox QA checklist rendering
- agent-progress audit stub rendering, including the select/button markup,
  messages, and local timeline rows

What stayed in `app/trade-app.tsx`:

- sandbox QA item assembly and overall status/message derivation
- selected progress event type state
- progress event creation
- lifecycle transition mapping
- audit event append calls
- progress timeline state, messages, and errors
- all handlers, hooks, bridge/client calls, and lifecycle/capture behavior

Safety result:

- Behavior, visible text, labels, select options, button text, timeline rows,
  and dev gating are preserved.
- No state ownership, hook, handler implementation, API call, bridge/client
  logic, lifecycle transition, audit append, persistence, or trade mutation
  behavior moved.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 335 — Reassess Remaining Handoff Modal Shell Extraction**

## Action 335 - Reassess Remaining Handoff Modal Shell Extraction

Action 335 added
`docs/handoff-modal-shell-extraction-reassessment.md`.

Assessment result:

- The remaining modal shell can be extracted safely only as a small
  presentational shell component.
- Parent ownership should remain for selected intent/handoff, dry-run request
  creation, all hooks, all handlers, lifecycle/progress transitions, audit
  append calls, preparation stubs, capture stubs, and app-wide state.
- A composed modal/component extraction would require too many props and is not
  recommended yet.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 336 — Extract Presentational Handoff Modal Shell**

## Action 336 - Extract Presentational Handoff Modal Shell

Action 336 added
`components/execution/ExecutionHandoffModalShell.tsx`.

Result:

- The Execution Handoff Preview Modal shell/layout moved into a presentational
  component.
- The extracted shell owns only backdrop/dialog/titlebar/close button/scroll
  wrapper rendering.
- `app/trade-app.tsx` still owns modal open/close state, selected
  intent/handoff, dry-run request creation, all hooks, all handlers, bridge
  calls, readiness assembly, preview state hooks, lifecycle/progress
  transitions, audit append logic, preparation stubs, capture stubs, and
  app-wide state.
- Existing close behavior, title text, close button aria label, dialog ARIA
  attributes, class names, and e2e-visible modal copy were preserved.

Safety result:

- No behavior changes.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 337 — Reassess trade-app.tsx After Modal Shell Extraction**

## Action 337 - Reassess trade-app.tsx After Modal Shell Extraction

Action 337 added
`docs/trade-app-post-shell-extraction-reassessment.md`.

Result:

- Reassessed `app/trade-app.tsx` after the Action 336 shell extraction.
- Recorded the current approximate file size as 42,518 lines.
- Documented that the modal is now mostly composed from extracted panels and
  hooks, while the parent still owns selected intent/handoff wiring, dry-run
  request creation, bridge envelope creation, lifecycle/preparation/capture
  state, handlers, hook composition, and result chaining.
- Identified the remaining inline modal sections: lifecycle/preparation
  diagnostics, bridge-backed diagnostics runner display, broker capture stub
  panel, local capture result details, intent/detail readbacks, safety checks,
  and footer.
- Recommended against a full composed modal extraction as the next step because
  it would introduce heavy prop drilling.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 338 — Extract Execution Lifecycle Status Sections**

## Action 338 - Extract Execution Lifecycle Status Sections

Action 338 added:

- `components/execution/ExecutionLifecycleStatusPanel.tsx`
- `components/execution/ExecutionBrokerCaptureStubPanel.tsx`
- `components/execution/ExecutionHandoffStatusReadbacks.tsx`

Result:

- Extracted presentational rendering for the Avanza preparation/lifecycle
  status panel.
- Extracted the bridge-backed diagnostics runner result display into the
  lifecycle status panel.
- Extracted presentational rendering for the broker result capture stub panel
  and local capture result details.
- Extracted the final read-only handoff details, blocked reason, intent reason,
  safety checks, and footer close control.
- `app/trade-app.tsx` still owns lifecycle state, preparation/capture state,
  state setters, handler implementations, lifecycle transitions, audit append
  logic, broker capture result creation, selected intent/handoff wiring,
  request creation, hook composition, and result chaining.
- `app/trade-app.tsx` is now approximately 42,197 lines.

Safety result:

- No state ownership changed.
- No hook, handler, lifecycle transition, audit append, bridge/client,
  persistence, or trade mutation logic moved.
- Existing button text, visible copy, status labels, class names, and disabled
  states were preserved.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 339 — Reassess Remaining trade-app.tsx Modal/App Boundaries**

## Action 339 - Reassess Remaining trade-app.tsx Modal/App Boundaries

Action 339 added
`docs/trade-app-modal-app-boundary-reassessment.md`.

Result:

- Reassessed `app/trade-app.tsx` after the Action 338 lifecycle/status
  extraction.
- Recorded the current approximate file size as 42,197 lines.
- Documented that the handoff modal is now mostly composition and wiring:
  selected intent/handoff, dry-run request creation, bridge envelope creation,
  hook result composition, local lifecycle/capture state, and panel ordering.
- Documented remaining app-wide responsibilities across Recommendations, Live
  Day Trades, History/statistics, market diagnostics, settings/navigation,
  localStorage effects, Supabase data flows, and refresh orchestration.
- Recommended a Handoff Modal composition container as the safest next runtime
  refactor.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 340 — Extract Handoff Modal Composition Container**

## Action 340 - Extract Handoff Modal Composition Container

Action 340 added:

- `components/execution/ExecutionHandoffModalComposition.tsx`

Result:

- Extracted the Execution Handoff Preview Modal body composition into a
  presentational/container component.
- Preserved the existing panel order and dev-gated grouping across core
  handoff summary, request previews, readiness, localhost bridge controls,
  early/middle/late stub previews, sandbox QA, agent progress, lifecycle
  status, broker capture stub, and final readbacks.
- `app/trade-app.tsx` still owns modal shell/open-close, selected
  intent/handoff, dry-run request construction, hook calls, state, handlers,
  bridge/client calls, readiness derivation, lifecycle transitions, audit
  appends, capture result creation, and app-wide state.
- `app/trade-app.tsx` is now approximately 42,074 lines.

Safety result:

- No state ownership changed.
- No hook, handler, bridge/client, lifecycle, audit, persistence, or trade
  mutation logic moved.
- Existing visible copy, button text, disabled states, panel ordering, and
  dev-gated visibility were preserved.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 341 — Reassess trade-app.tsx After Composition Extraction**

## Action 341 - Reassess trade-app.tsx After Composition Extraction

Action 341 added:

- `docs/trade-app-post-composition-extraction-reassessment.md`

Result:

- Reassessed `app/trade-app.tsx` after the Action 340 composition extraction.
- Recorded the current approximate file size as 42,074 lines.
- Documented that the handoff modal decomposition is complete enough to pause:
  shell, body composition, request previews, readiness, bridge controls, phase
  previews, QA/progress, lifecycle/status display, pure mappers, and
  modal-specific state hooks are extracted.
- Documented that remaining parent-owned modal logic is intentional:
  selected intent/handoff, request construction, hook composition,
  lifecycle/capture/progress state, handlers, audit appends, capture result
  creation, and grouped prop assembly.
- Recommended a Recommendations tab extraction plan as the safest next
  high-payoff refactor target.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 342 — Create Recommendations Tab Extraction Plan**

## Action 342 - Create Recommendations Tab Extraction Plan

Action 342 added:

- `docs/recommendations-tab-extraction-plan.md`

Result:

- Documented the current Recommendations tab inventory after the handoff modal
  decomposition pause.
- Identified the primary tab render, `RecommendationCard`, recommendation
  details modal, ADD TRADE validation/open handler, discard handler, selected
  recommendation `TradeModal` mount, and local/demo dependencies.
- Confirmed the primary Recommendations tab does not have dedicated
  filter/sort/search controls today; the parent-owned `dailyRecommendations`
  remains the visible source of truth.
- Defined safe component boundaries: `RecommendationsTab`,
  `RecommendationCard`, card header/metrics/actions, details modal, and empty
  state.
- Recommended keeping app-wide data loading, selected recommendation state, ADD
  TRADE validation, discard persistence, `TradeModal`, Supabase writes,
  localStorage/demo behavior, and cross-tab diagnostics in `app/trade-app.tsx`
  initially.
- Recommended the first runtime extraction as a presentational
  Recommendations tab shell.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No Avanza automation, selector, URL, browser control, `Bekrafta`, order
  submission, `BrokerExecutionResult`, execution record, Supabase write, or
  trade mutation was added.

Next recommended action:

**Action 343 — Extract Recommendations Tab Shell**

## Action 343 - Extract Recommendations Tab Shell

Action 343 added:

- `components/recommendations/RecommendationsTab.tsx`

Result:

- Extracted the primary Recommendations tab shell/layout into a presentational
  component.
- The shell owns statusbar placement, learning-mode banner placement, the
  recommendation grid wrapper, loading empty state, and dominant empty-state
  rendering.
- `app/trade-app.tsx` still owns recommendation data/state,
  `dailyRecommendations`, statusbar construction, card construction, ADD TRADE
  validation, selected recommendation state, `TradeModal`, discard persistence,
  Supabase/localStorage behavior, and cross-tab diagnostics.
- `RecommendationCard`, recommendation details modal behavior, ADD TRADE
  handlers, discard handlers, filtering/sorting, and execution handoff behavior
  did not move.

Safety result:

- No behavior changed.
- No button text changed.
- No tests were removed.
- No Avanza automation, browser control, execution behavior, persistence
  behavior, Supabase write behavior, or trade mutation behavior was added.

Next recommended action:

**Action 344 — Extract Recommendation Card Presentational Component**

## Action 344 - Reassess Recommendations Tab After Shell Extraction

Action 344 added:

- `docs/recommendations-tab-post-shell-reassessment.md`

Updated:

- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Recommendations tab after the Action 343 shell extraction.
- Confirmed the shell is extracted while `RecommendationCard`,
  `RecommendationDetailsModal`, `DiscardRecommendationModal`, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, and execution handoff behavior remain in `app/trade-app.tsx`.
- Inventoried current card rendering: source badge, company header, confidence
  pill, metric grid, guidance summary, ADD TRADE/Discard actions, discard
  confirmation, and details modal.
- Recommended a move-only Recommendation Card component extraction next, with
  parent callbacks and parent-owned app behavior preserved.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, details modal, Avanza, browser, execution,
  persistence, Supabase write, or trade mutation behavior was added or moved.

Next recommended action:

**Action 345 — Extract Recommendation Card Presentational Component**

## Action 345 - Extract Recommendation Card Presentational Component

Action 345 added:

- `components/recommendations/RecommendationCard.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/recommendations-tab-post-shell-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the visual recommendation card shell into a presentational
  component.
- The new component renders the card wrapper, source badge slot, identity slot,
  confidence pill, metrics grid, guidance copy, ADD TRADE button, Discard
  button, and modal slots.
- `app/trade-app.tsx` keeps `RecommendationCardContainer` for existing UI-only
  details/discard state and computed display props.
- `app/trade-app.tsx` still owns ADD TRADE validation, selected `TradeModal`,
  discard persistence, Supabase/localStorage behavior, data derivation, details
  modal behavior, and execution handoff behavior.

Safety result:

- No behavior changed.
- No state ownership moved out of the parent flow.
- No ADD TRADE validation, discard persistence, details modal behavior,
  selected `TradeModal` wiring, Avanza/browser/execution behavior, Supabase
  write behavior, or trade mutation behavior was added or moved.

Next recommended action:

**Action 346 — Reassess Recommendation Card After Extraction**

## Action 346 - Reassess Recommendation Card After Extraction

Action 346 added:

- `docs/recommendation-card-post-extraction-reassessment.md`

Updated:

- `docs/recommendations-tab-post-shell-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Recommendations card boundary after Action 345.
- Confirmed `RecommendationCard.tsx` is compact at 136 lines and is not the
  highest-payoff next split.
- Documented that `RecommendationCardContainer`, details/discard UI state,
  `RecommendationDetailsModal`, and `DiscardRecommendationModal` remain in
  `app/trade-app.tsx`.
- Confirmed ADD TRADE validation, selected `TradeModal`, discard persistence,
  Supabase/localStorage behavior, data derivation, and execution handoff
  behavior remain parent-owned.
- Recommended extracting recommendation details/discard modal components next,
  starting with the small discard modal and moving the details modal only if its
  helper dependency surface can be preserved safely.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, details modal, Avanza, browser, execution,
  persistence, Supabase write, or trade mutation behavior was added or moved.

Next recommended action:

**Action 347 — Extract Recommendation Details/Discard Modal Components**

## Action 347 - Extract Recommendation Details/Discard Modal Components

Action 347 added:

- `components/recommendations/DiscardRecommendationModal.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-post-shell-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the discard recommendation confirmation modal as a presentational
  component.
- Preserved visible copy, dialog attributes, class names, button labels/order,
  disabled state, Escape close behavior, backdrop close behavior, and event
  stop-propagation behavior.
- Kept discard open state, confirming state, discard persistence, ADD TRADE
  validation, selected `TradeModal`, Supabase/localStorage behavior, data
  construction, and execution handoff behavior in `app/trade-app.tsx`.
- Left `RecommendationDetailsModal` inline because its helper dependency surface
  is much larger and should be handled in a dedicated follow-up.

Safety result:

- No behavior changed.
- No state ownership moved.
- No discard persistence, details modal state, ADD TRADE validation, selected
  `TradeModal` wiring, Avanza/browser/execution behavior, Supabase write
  behavior, or trade mutation behavior was added or moved.

Next recommended action:

**Action 348 — Reassess Recommendations Area After Modal Extraction**

## Action 348 - Reassess Recommendations Area After Modal Extraction

Action 348 added:

- `docs/recommendations-area-post-modal-extraction-reassessment.md`

Updated:

- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-post-shell-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Recommendations area after `DiscardRecommendationModal`
  extraction.
- Confirmed the largest remaining recommendation-specific inline island is
  `RecommendationDetailsModal` and its helper cluster.
- Classified the helper cluster as pure display formatting, pure data mapping,
  UI-only render helpers, and UI-only behavior.
- Confirmed the details helper cluster does not own Supabase/localStorage,
  discard persistence, ADD TRADE validation, selected `TradeModal`, Avanza, or
  execution behavior.
- Recommended extracting details modal display helpers/mappers before moving the
  full details modal component.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, details modal, Avanza, browser, execution,
  persistence, Supabase write, or trade mutation behavior was added or moved.

Next recommended action:

**Action 349 — Extract Recommendation Details Modal Display Helpers**

## Action 349 - Extract Recommendation Details Modal Display Helpers

Action 349 added:

- `components/recommendations/recommendation-details-display-helpers.ts`

Updated:

- `app/trade-app.tsx`
- `docs/recommendations-area-post-modal-extraction-reassessment.md`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted pure recommendation details display helpers into a dedicated module:
  value formatting, currency/share formatting, details tone mapping, and tone
  class-name derivation.
- Kept `RecommendationDetailsModal` inline.
- Kept JSX render helpers inline because they are UI components, not plain
  display mappers.
- Kept `RecommendationCardContainer`, details/discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, data construction, and execution handoff behavior parent-owned.

Safety result:

- No behavior changed.
- No state, hook, handler, persistence, Supabase/localStorage, execution, or
  trade mutation behavior moved.
- No Avanza automation, browser control, order submission, or broker behavior
  was added.

Next recommended action:

**Action 350 — Reassess Recommendation Details Modal After Helper Extraction**

## Action 350 - Reassess Recommendation Details Modal After Helper Extraction

Action 350 added:

- `docs/recommendation-details-modal-post-helper-extraction-reassessment.md`

Updated:

- `docs/recommendations-area-post-modal-extraction-reassessment.md`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the inline `RecommendationDetailsModal` after pure display helper
  extraction.
- Confirmed the modal is read-only and only needs parent-provided `onClose`.
- Confirmed ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, data construction, and execution handoff
  behavior remain outside the modal.
- Identified shared JSX details helper reuse as the main remaining extraction
  risk.
- Recommended extracting `RecommendationDetailsModal` as a presentational
  component next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, details modal, Avanza, browser, execution,
  persistence, Supabase write, or trade mutation behavior was added or moved.

Next recommended action:

**Action 351 — Extract RecommendationDetailsModal Presentational Component**

## Action 351 - Extract RecommendationDetailsModal Presentational Component

Action 351 added:

- `components/recommendations/RecommendationDetailsModal.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/recommendation-details-modal-post-helper-extraction-reassessment.md`
- `docs/recommendations-area-post-modal-extraction-reassessment.md`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the recommendation details modal into a dedicated presentational
  component.
- Moved the modal wrapper/content, close button, Escape/backdrop close behavior,
  read-only details sections, and direct render-only JSX helper components.
- Exported shared JSX details helpers back to `app/trade-app.tsx` for existing
  live trade/detail section reuse.
- Kept `RecommendationCardContainer`, details/discard state, ADD TRADE
  validation, selected `TradeModal`, discard persistence, Supabase/localStorage
  behavior, data construction, and execution handoff behavior in
  `app/trade-app.tsx`.

Safety result:

- No behavior changed.
- No state ownership moved.
- No ADD TRADE validation, discard persistence, selected `TradeModal` wiring,
  Supabase/localStorage behavior, execution behavior, Avanza/browser behavior,
  or trade mutation behavior was added or moved.

Next recommended action:

**Action 352 — Reassess Recommendations Area After Details Modal Extraction**

## Action 352 - Reassess Recommendations Area After Details Modal Extraction

Action 352 added:

- `docs/recommendations-area-post-details-modal-extraction-reassessment.md`

Updated:

- `docs/recommendation-details-modal-post-helper-extraction-reassessment.md`
- `docs/recommendations-area-post-modal-extraction-reassessment.md`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Recommendations area after `RecommendationDetailsModal`
  extraction.
- Confirmed the remaining local recommendation component is
  `RecommendationCardContainer`.
- Documented that it still owns local details/discard UI state and display prop
  assembly, while ADD TRADE validation, discard persistence, selected
  `TradeModal`, Supabase/localStorage behavior, and execution handoff behavior
  remain parent-owned.
- Recommended extracting pure recommendation card display/prop mapping next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, details state, Avanza/browser, execution,
  persistence, Supabase write, or trade mutation behavior was added or moved.

Next recommended action:

**Action 353 — Extract Recommendation Card Display Mapper**

## Action 353 - Extract Recommendation Card Display Mapper

Action 353 added:

- `components/recommendations/recommendation-card-display-mapper.ts`

Updated:

- `app/trade-app.tsx`
- `docs/recommendations-area-post-details-modal-extraction-reassessment.md`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted pure Recommendation card display mapping from
  `RecommendationCardContainer`.
- The new mapper builds confidence tone/label, card metrics, confidence
  breakdown rows, card summary fallback, source badge descriptors, ADD TRADE
  display label, disabled display flags, and details-modal display props.
- `RecommendationCardContainer` remains in `app/trade-app.tsx` and still owns
  local details/discard modal state and callback bridge wiring.
- ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, recommendation data construction, and
  execution handoff behavior remain parent-owned.

Safety result:

- No behavior changed.
- No state ownership moved.
- No callback implementation, ADD TRADE validation, discard persistence,
  selected `TradeModal`, Supabase/localStorage behavior, execution behavior,
  Avanza/browser behavior, or trade mutation behavior moved into the mapper.

Next recommended action:

**Action 354 — Reassess RecommendationCardContainer After Display Mapper Extraction**

## Action 354 - Reassess RecommendationCardContainer After Display Mapper Extraction

Action 354 added:

- `docs/recommendation-card-container-post-mapper-reassessment.md`

Updated:

- `docs/recommendations-area-post-details-modal-extraction-reassessment.md`
- `docs/recommendation-card-post-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `RecommendationCardContainer` after pure display mapping moved to
  `recommendation-card-display-mapper.ts`.
- Confirmed the remaining container is now mostly local details/discard UI
  state, modal slot composition, callback bridge wiring, and mapper invocation.
- Confirmed it does not directly own selected `TradeModal`, Supabase,
  localStorage, execution handoff construction, ADD TRADE validation, or discard
  persistence.
- Recommended extracting the `RecommendationCardContainer` boundary next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, details state, selected `TradeModal`, Avanza/browser,
  execution, persistence, Supabase write, localStorage, or trade mutation
  behavior was added or moved.

Next recommended action:

**Action 355 — Extract RecommendationCardContainer Boundary**

## Action 355 - Extract RecommendationCardContainer Boundary

Action 355 added:

- `components/recommendations/RecommendationCardContainer.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/recommendation-card-container-post-mapper-reassessment.md`
- `docs/recommendations-area-post-details-modal-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the remaining local `RecommendationCardContainer` from
  `app/trade-app.tsx`.
- The new component composes `RecommendationCard`, `RecommendationDetailsModal`,
  `DiscardRecommendationModal`, and the recommendation card display mapper.
- Moved only card-local UI state for details/discard modal visibility and
  discard confirmation loading.
- Kept freshness, ADD TRADE gate, key-reason derivation, shared identity/badge
  rendering, recommendation data construction, ADD TRADE validation, discard
  persistence, selected `TradeModal`, Supabase/localStorage behavior, and
  execution handoff behavior in `app/trade-app.tsx`.

Safety result:

- No behavior changed.
- No ADD TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, execution behavior, Avanza/browser behavior,
  or trade mutation behavior moved.

Next recommended action:

**Action 356 — Reassess Recommendations Area After Container Extraction**

## Action 356 - Reassess Recommendations Area After Container Extraction

Action 356 added:

- `docs/recommendations-area-post-container-extraction-reassessment.md`

Updated:

- `docs/recommendation-card-container-post-mapper-reassessment.md`
- `docs/recommendations-area-post-details-modal-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Recommendations area after `RecommendationCardContainer`
  extraction.
- Confirmed Recommendations presentation extraction is complete enough to pause.
- Confirmed remaining `app/trade-app.tsx` Recommendations responsibilities are
  intentionally app-owned: recommendation data construction/filtering, ADD
  TRADE validation, discard persistence, selected `TradeModal`,
  Supabase/localStorage behavior, execution handoff behavior, and shared
  identity/source-badge render slots.
- Recommended moving the next refactor phase to Live Day Trades planning.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No ADD TRADE, discard, persistence, selected `TradeModal`, Avanza/browser,
  execution, Supabase/localStorage, or trade mutation behavior was added or
  moved.

Next recommended action:

**Action 357 — Create Live Day Trades Tab Extraction Plan**

## Action 357 - Create Live Day Trades Tab Extraction Plan

Action 357 added:

- `docs/live-day-trades-tab-extraction-plan.md`

Updated:

- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only extraction plan for the Live Day Trades tab.
- Inventoried the tab shell, active position cards, live metrics, sell guidance,
  EOD safety display, live details modal, execution preview, and close/sell
  modal dependencies.
- Identified `ClosePositionModal` as too behavior-heavy for the first runtime
  extraction.
- Recommended extracting only the Live Day Trades tab shell first while keeping
  live data construction, sorting/grouping, risk evaluation, close handlers,
  EOD acknowledgement, execution orchestrator calls, Supabase/localStorage
  behavior, and close persistence parent-owned.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No Avanza automation, browser control, execution behavior, persistence,
  Supabase/localStorage, close/sell, or trade mutation behavior was added or
  moved.

Next recommended action:

**Action 358 — Extract Live Day Trades Tab Shell**

## Action 358 - Extract Live Day Trades Tab Shell

Action 358 added:

- `components/live-day-trades/LiveDayTradesTab.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted a presentational Live Day Trades tab shell.
- The shell owns only section layout, statusbar and fixture panel slots,
  loading/empty states, live-trade grid placement, continued-grid placement,
  and the divider.
- `app/trade-app.tsx` still constructs all rendered `ActivePositionCard` nodes
  and owns live trade data, calculations, monitoring, EOD safety, target/stop,
  sell/close/exit handlers, persistence, Supabase/localStorage, and execution
  handoff behavior.

Safety result:

- No behavior changed.
- No data/state ownership, hook, handler, sell/close/exit, monitoring, EOD,
  target/stop, persistence, Supabase/localStorage, Avanza/browser, execution,
  or trade mutation logic moved.

Next recommended action:

**Action 359 — Reassess Live Day Trades Tab After Shell Extraction**

## Action 359 - Reassess Live Day Trades Tab After Shell Extraction

Action 359 added:

- `docs/live-day-trades-tab-post-shell-reassessment.md`

Updated:

- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Live Day Trades area after the tab shell extraction.
- Confirmed `ActivePositionCard` remains in `app/trade-app.tsx` and still owns
  card-local details state, execution preview state, EOD acknowledgement
  state/persistence, live sell guidance derivation, and execution orchestrator
  preview derivation.
- Confirmed close/sell persistence and broker exit confirmation remain in the
  parent/`ClosePositionModal` flow.
- Recommended extracting pure display/derived-data mapping before moving the
  live card boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No sell/close/exit, monitoring, EOD, target/stop, PnL/risk, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 360 — Extract Live Day Trade Display Mapper**

## Action 360 - Extract Live Day Trade Display Mapper

Action 360 added:

- `components/live-day-trades/live-day-trade-display-mapper.ts`

Updated:

- `app/trade-app.tsx`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted pure display mapping used by `ActivePositionCard`.
- Moved card metric rows, action pill classes, guidance card classes, close
  button label/tone, aria label, guidance fallback strings,
  partial-close/profit-fade copy, updated-at text, and live trade reality badge
  construction.
- `ActivePositionCard` remains in `app/trade-app.tsx`.
- EOD acknowledgement state/persistence, details modal state, execution preview
  state, sell/close callback wiring, `buildLiveSellGuidance(...)`,
  `runExecutionOrchestrator(...)`, `LiveTradeDetailsModal`,
  `ExecutionHandoffPreviewModal`, and `ClosePositionModal` behavior stayed in
  place.

Safety result:

- No state, hook, handler, close/sell/exit, monitoring, EOD acknowledgement,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved.

Next recommended action:

**Action 361 — Reassess ActivePositionCard After Display Mapper Extraction**

## Action 361 - Reassess ActivePositionCard After Display Mapper Extraction

Action 361 added:

- `docs/active-position-card-post-display-mapper-reassessment.md`

Updated:

- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed local `ActivePositionCard` after display mapper extraction.
- Confirmed the card still owns local details modal state, execution preview
  state, EOD acknowledgement state/persistence, sell/close callback wiring, and
  execution preview orchestration.
- Confirmed `LiveTradeDetailsModal` remains large but contains a smaller EOD
  manual review block that can be extracted safely first.
- Confirmed `ClosePositionModal` remains behavior-heavy and should stay
  parent-owned.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 362 — Extract Live Day Trade EOD Safety Panel**

## Action 362 - Extract Live Day Trade EOD Safety Panel

Action 362 added:

- `components/live-day-trades/LiveDayTradeEodSafetyPanel.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/active-position-card-post-display-mapper-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the Live Day Trade EOD manual review display block from
  `LiveTradeDetailsModal`.
- The extracted component is presentational and renders the existing status
  pill, EOD message, and "Acknowledge EOD Risk" button.
- `ActivePositionCard` still owns acknowledgement state and
  `readEndOfDayAcknowledgement(...)` / `writeEndOfDayAcknowledgement(...)`.
- Close/sell handlers, execution preview wiring, EOD calculation, persistence,
  Supabase/localStorage behavior, and execution/exit handoff behavior stayed in
  place.

Safety result:

- No behavior changed.
- No EOD acknowledgement persistence, close/sell/exit, execution preview,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved.

Next recommended action:

**Action 363 — Reassess ActivePositionCard After EOD Panel Extraction**

## Action 363 - Reassess ActivePositionCard After EOD Panel Extraction

Action 363 added:

- `docs/active-position-card-post-eod-panel-reassessment.md`

Updated:

- `docs/active-position-card-post-display-mapper-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ActivePositionCard` after Action 362.
- Confirmed the card still owns local details state, execution preview state,
  EOD acknowledgement state/persistence, close/sell callback wiring, and
  execution preview orchestration.
- Confirmed `LiveExecutionStatusSurface` is the smallest safe next
  presentational extraction target.
- Confirmed `LiveTradeDetailsModal`, `ClosePositionModal`, and the full
  `ActivePositionCard` boundary should wait.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 364 — Extract LiveExecutionStatusSurface Presentational Component**

## Action 364 - Extract LiveExecutionStatusSurface Presentational Component

Action 364 added:

- `components/live-day-trades/LiveExecutionStatusSurface.tsx`

Updated:

- `app/trade-app.tsx`
- `docs/active-position-card-post-eod-panel-reassessment.md`
- `docs/active-position-card-post-display-mapper-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the live execution status surface rendering from
  `app/trade-app.tsx`.
- Preserved status labels, mode badge, next-action copy, final-submit suffix,
  and "View handoff" button behavior.
- `ActivePositionCard` and the dev-only execution fixture still own
  orchestrator calls, local preview state, and `ExecutionHandoffPreviewModal`
  wiring.

Safety result:

- No behavior changed.
- No state ownership, hook, handler, orchestrator, execution preview,
  close/sell/exit, persistence, Supabase/localStorage, Avanza/browser,
  execution, or trade mutation behavior moved.

Next recommended action:

**Action 365 — Reassess ActivePositionCard After Execution Status Surface Extraction**

## Action 365 - Reassess ActivePositionCard After Execution Status Surface Extraction

Files changed:

- `docs/active-position-card-post-execution-status-surface-reassessment.md`
- `docs/active-position-card-post-eod-panel-reassessment.md`
- `docs/active-position-card-post-display-mapper-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ActivePositionCard` after Action 364.
- Confirmed `LiveExecutionStatusSurface` is extracted and presentational.
- Confirmed `ActivePositionCard` still owns EOD acknowledgement persistence,
  details state, execution preview state, orchestrator calls, close callback
  wiring, and `ExecutionHandoffPreviewModal` wiring.
- Confirmed `LiveTradeDetailsModal` and `ClosePositionModal` remain too broad
  for the next safest extraction.
- Recommended extracting the visible live-card body/header/actions rendering as
  the next presentational component.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 366 — Extract Live Day Trade Card Body Presentational Component**

## Action 366 - Extract Live Day Trade Card Body Presentational Component

Files changed:

- `app/trade-app.tsx`
- `components/live-day-trades/LiveDayTradeCardBody.tsx`
- `docs/active-position-card-post-execution-status-surface-reassessment.md`
- `docs/active-position-card-post-eod-panel-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the visible live day trade card body/header/actions rendering into
  a presentational component.
- `ActivePositionCard` still owns local state, EOD acknowledgement persistence,
  close callback wiring, orchestrator calls, execution preview state,
  `LiveTradeDetailsModal`, and `ExecutionHandoffPreviewModal` wiring.
- Identity, badge, metric, status, details modal, and execution preview content
  are passed as rendered slots so shared helper surfaces and behavior stayed in
  `app/trade-app.tsx`.

Safety result:

- No close/sell/exit, EOD acknowledgement, orchestrator, preview, modal,
  persistence, Supabase/localStorage, Avanza/browser, execution, or trade
  mutation behavior moved or changed.

Next recommended action:

**Action 367 — Reassess ActivePositionCard After Card Body Extraction**

## Action 367 - Reassess ActivePositionCard After Card Body Extraction

Files changed:

- `docs/active-position-card-post-card-body-reassessment.md`
- `docs/active-position-card-post-execution-status-surface-reassessment.md`
- `docs/active-position-card-post-eod-panel-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ActivePositionCard` after Action 366.
- Confirmed `LiveDayTradeCardBody` is extracted and `ActivePositionCard` is now
  mostly a state/orchestration wrapper around slots.
- Confirmed the card still owns EOD acknowledgement persistence, local details
  state, execution preview state, close callback wiring, orchestrator calls, and
  `ExecutionHandoffPreviewModal` wiring.
- Confirmed `ClosePositionModal` remains too behavior-heavy for the next
  extraction.
- Recommended extracting `LiveTradeDetailsModal` next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 368 — Extract LiveTradeDetailsModal Presentational Component**

## Action 368 - Extract LiveTradeDetailsModal Presentational Component

Files changed:

- `app/trade-app.tsx`
- `components/live-day-trades/LiveTradeDetailsModal.tsx`
- `docs/active-position-card-post-card-body-reassessment.md`
- `docs/active-position-card-post-execution-status-surface-reassessment.md`
- `docs/active-position-card-post-eod-panel-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the live trade details modal rendering into
  `components/live-day-trades/LiveTradeDetailsModal.tsx`.
- Moved details-modal-only render helpers with the component.
- Kept `ActivePositionCard` responsible for modal open state, EOD
  acknowledgement persistence, audit event reading/derivation, close callback
  wiring, orchestrator calls, execution preview state, and handoff modal wiring.
- Kept `ClosePositionModal`, close/sell/exit behavior, Supabase/localStorage
  persistence flows, and trade mutation behavior in `app/trade-app.tsx`.

Safety result:

- No close/sell/exit, EOD acknowledgement persistence, orchestrator, execution
  preview, handoff modal, close modal, Supabase/localStorage, Avanza/browser,
  execution, or trade mutation behavior moved or changed.

Next recommended action:

**Action 369 — Reassess ActivePositionCard After Details Modal Extraction**

## Action 369 - Reassess ActivePositionCard After Details Modal Extraction

Files changed:

- `docs/active-position-card-post-details-modal-reassessment.md`
- `docs/active-position-card-post-card-body-reassessment.md`
- `docs/active-position-card-post-execution-status-surface-reassessment.md`
- `docs/active-position-card-post-eod-panel-reassessment.md`
- `docs/live-day-trades-tab-post-shell-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ActivePositionCard` after Action 368.
- Confirmed `ActivePositionCard` now mostly owns local state, EOD
  acknowledgement persistence, execution preview wiring, close callback wiring,
  audit display derivation, and rendered slots.
- Confirmed `ClosePositionModal` remains behavior-heavy and should get a
  dedicated plan before runtime extraction.
- Recommended pausing Live Day Trades extraction and planning the History tab
  next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No close/sell/exit, EOD acknowledgement, execution preview, persistence,
  Supabase/localStorage, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 370 — Create History Tab Extraction Plan**

## Action 370 - Create History Tab Extraction Plan

Files changed:

- `docs/history-tab-extraction-plan.md`
- `docs/active-position-card-post-details-modal-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created the History tab extraction plan after pausing the Live Day Trades
  refactor phase.
- Inventoried the current History tab shell, closed positions journal,
  recommendation history, discarded setup analytics, recommendation decisions,
  hidden diagnostics JSON, and statistics-adjacent panels.
- Identified existing local History components/helpers in `app/trade-app.tsx`,
  including `HistoryJournalControls`, `ClosedPositionCard`,
  `RecommendationHistoryPanel`, `HistorySection`, and closed-trade detail panel
  helpers.
- Recommended the first runtime step as extracting only a `HistoryTab` shell.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No History filtering/sorting, refresh, persistence, localStorage/Supabase,
  timeline/audit, statistics, Avanza/browser, execution, or trade mutation
  behavior moved.

Next recommended action:

**Action 371 — Extract History Tab Shell**

## Action 371 - Extract History Tab Shell

Files changed:

- `components/history/HistoryTab.tsx`
- `app/trade-app.tsx`
- `docs/history-tab-extraction-plan.md`
- `docs/active-position-card-post-details-modal-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted a presentational `HistoryTab` shell.
- `HistoryTab` renders the History heading/copy, statusbar slot,
  data-mode banner slot, optional outcome evaluation runner slot, hidden
  diagnostics slot, and existing History content children.
- `app/trade-app.tsx` still owns the History filter/sort state, refresh
  handlers, closed trade card rendering, PnL/result derivation,
  plan-adherence/statistics calculations, recommendation outcome diagnostics,
  audit/timeline derivation, persistence, and app-wide state.

Safety result:

- No runtime behavior intentionally changed.
- No History data/state/handler ownership moved.
- No filtering/sorting/grouping, PnL/result, plan-adherence/statistics,
  audit/timeline, localStorage/Supabase, Avanza/browser, execution,
  persistence, or trade mutation behavior was added or moved.

Next recommended action:

**Action 372 — Reassess History Tab After Shell Extraction**

## Action 372 - Reassess History Tab After Shell Extraction

Files changed:

- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/active-position-card-post-details-modal-reassessment.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the History closed trade card boundary after Action 371.
- Confirmed `ClosedPositionCard` lives in `app/trade-app.tsx` and still owns
  local details-open state plus card display derivation.
- Confirmed the card derives timeline/replay data, execution quality, handoff
  quality, improvement suggestions, outcome explanations, and details modal
  content from `ClosedPosition` and `HistoryTradeSummary`.
- Confirmed the safest next runtime refactor is a pure display mapper before a
  full card extraction.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No History filtering/sorting, PnL/result, plan-adherence/statistics,
  audit/timeline, selected/details state, persistence, localStorage/Supabase,
  Avanza/browser, execution, or trade mutation behavior moved.

Next recommended action:

**Action 373 — Extract Closed Trade Display Mapper**

## Action 373 - Extract Closed Trade Display Mapper

Files changed:

- `components/history/closed-trade-display-mapper.ts`
- `app/trade-app.tsx`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted pure closed trade display mapping into
  `components/history/closed-trade-display-mapper.ts`.
- `ClosedPositionCard` now calls `buildClosedTradeDisplayProps(...)` for card
  display-only values:
  - outcome label and pill tone.
  - PnL display and tone.
  - R display.
  - metric rows.
  - journal-note fallback.
  - data-mode/reality badges.
  - History / Statistics surface notice metadata.

Safety result:

- No `ClosedPositionCard` boundary moved.
- No local details state, History filtering/sorting, PnL/result derivation
  beyond display formatting, plan-adherence/statistics calculation,
  audit/timeline derivation, `readTradeManagementEvents()`, details modal
  rendering, localStorage/Supabase, Avanza/browser, execution, persistence, or
  trade mutation behavior moved.

Next recommended action:

**Action 374 — Reassess ClosedPositionCard After Display Mapper Extraction**

## Action 374 - Reassess ClosedPositionCard After Display Mapper Extraction

Files changed:

- `docs/closed-position-card-post-display-mapper-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ClosedPositionCard` after Action 373.
- Confirmed the new mapper owns display-only card props, while the card still
  owns local details state, modal rendering, audit/timeline derivation,
  execution quality, handoff quality, improvement suggestions, outcome
  explanation, and plan-vs-actual review display.
- Confirmed a full `ClosedPositionCard` extraction is possible but still
  broader than the safest next step.
- Recommended extracting the closed trade details modal as a presentational
  component.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No History filtering/sorting, PnL/result, plan-adherence/statistics,
  audit/timeline, details modal state, persistence, localStorage/Supabase,
  Avanza/browser, execution, or trade mutation behavior moved.

Next recommended action:

**Action 375 — Extract Closed Trade Details Modal Presentational Component**

## Action 375 - Extract Closed Trade Details Modal Presentational Component

Files changed:

- `components/history/ClosedTradeDetailsModal.tsx`
- `app/trade-app.tsx`
- `docs/closed-position-card-post-display-mapper-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the closed trade details modal shell/rendering into
  `components/history/ClosedTradeDetailsModal.tsx`.
- Preserved the modal wrapper, header/body layout, close button, backdrop close,
  Escape close, status slot, classNames, and visible copy.
- `ClosedPositionCard` now passes the existing identity node, status node, close
  callback, and details body as children.

Safety result:

- No details-open state moved.
- No History filtering/sorting, PnL/result calculation, plan-adherence/statistics
  calculation, audit/timeline derivation, details panel derivation,
  localStorage/Supabase, Avanza/browser, execution, persistence, or trade
  mutation behavior moved.

Next recommended action:

**Action 376 — Reassess ClosedPositionCard After Details Modal Extraction**

## Action 376 - Reassess ClosedPositionCard After Details Modal Extraction

Files changed:

- `docs/closed-position-card-post-details-modal-reassessment.md`
- `docs/closed-position-card-post-display-mapper-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ClosedPositionCard` after Action 375.
- Confirmed the closed trade details modal shell is extracted while
  `ClosedPositionCard` still owns details-open state, click/keyboard open
  behavior, PnL/result derivation, plan-vs-actual review construction and hidden
  JSON, audit/timeline derivation, detail panel nodes, persistence boundaries,
  and History state.
- Confirmed full card extraction remains possible but is not the safest next
  step.
- Recommended extracting the closed trade plan-adherence panel next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No History filtering/sorting, PnL/result calculation,
  plan-adherence/statistics calculation, audit/timeline derivation, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 377 — Extract Closed Trade Plan-Adherence Panel**

## Action 377 - Extract Closed Trade Plan-Adherence Panel

Files changed:

- `app/trade-app.tsx`
- `components/history/ClosedTradePlanAdherencePanel.tsx`
- `docs/closed-position-card-post-details-modal-reassessment.md`
- `docs/closed-position-card-post-display-mapper-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the closed trade plan-adherence / plan-vs-actual display panel into
  `components/history/ClosedTradePlanAdherencePanel.tsx`.
- Preserved the status/grade pill, metric rows, metric comparison table,
  deviations, review warnings, checks details block, classNames, visible copy,
  and hidden `trade-plan-vs-actual-review-json` node.
- `ClosedPositionCard` still owns `buildPlanVsActualReview(...)`,
  `planVsActualReviewJson(...)`, PnL/result derivation, audit/timeline
  derivation, local details state, persistence boundaries, and History state.

Safety result:

- No History filtering/sorting, PnL/result calculation,
  plan-adherence/statistics calculation, audit/timeline derivation, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 378 — Reassess ClosedPositionCard After Plan-Adherence Panel Extraction**

## Action 378 - Reassess ClosedPositionCard After Plan-Adherence Panel Extraction

Files changed:

- `docs/closed-position-card-post-plan-adherence-panel-reassessment.md`
- `docs/closed-position-card-post-details-modal-reassessment.md`
- `docs/closed-position-card-post-display-mapper-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ClosedPositionCard` after Action 377.
- Confirmed `HistoryTab`, `closed-trade-display-mapper.ts`,
  `ClosedTradeDetailsModal`, and `ClosedTradePlanAdherencePanel` are extracted.
- Confirmed `ClosedPositionCard` still owns local details state, click/keyboard
  open behavior, PnL/result derivation, plan-vs-actual derivation and review
  JSON, audit/timeline derivation, details panel nodes, display mapper usage,
  and card body/header/action rendering.
- Recommended extracting the closed trade audit/timeline disclosure panel next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No History filtering/sorting, PnL/result calculation,
  plan-adherence/statistics calculation, audit/timeline derivation, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 379 — Extract Closed Trade Audit Timeline Panel**

## Action 379 - Extract Closed Trade Audit Timeline Panel

Files changed:

- `app/trade-app.tsx`
- `components/history/ClosedTradeAuditTimelinePanel.tsx`
- `docs/closed-position-card-post-plan-adherence-panel-reassessment.md`
- `docs/closed-position-card-post-details-modal-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the closed trade audit/timeline disclosure wrapper into
  `components/history/ClosedTradeAuditTimelinePanel.tsx`.
- Preserved the `Audit details` label, `details`/`summary` behavior, classNames,
  child panel order, and incomplete-data note.
- `ClosedPositionCard` still owns audit/timeline derivation, child audit panel
  creation, plan-vs-actual derivation, PnL/result logic, persistence boundaries,
  and History state.

Safety result:

- No History filtering/sorting, PnL/result calculation,
  plan-adherence/statistics calculation, audit/timeline derivation, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 380 — Reassess ClosedPositionCard After Audit Timeline Panel Extraction**

## Action 380 - Reassess ClosedPositionCard After Audit Timeline Panel Extraction

Files changed:

- `docs/closed-position-card-post-audit-timeline-panel-reassessment.md`
- `docs/closed-position-card-post-plan-adherence-panel-reassessment.md`
- `docs/closed-position-card-post-details-modal-reassessment.md`
- `docs/history-tab-post-shell-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `ClosedPositionCard` after Action 379.
- Confirmed History extraction is complete enough to pause after extracting the
  tab shell, display mapper, details modal, plan-adherence panel, and
  audit/timeline wrapper.
- Confirmed remaining card responsibilities are local details state,
  click/keyboard open behavior, PnL/result derivation, plan-vs-actual
  derivation and review JSON, audit/timeline child-node composition and
  derivation, persistence boundaries, and History state.
- Recommended Statistics/Dashboard extraction planning next.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No History filtering/sorting, PnL/result calculation,
  plan-adherence/statistics calculation, audit/timeline derivation, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 381 — Create Statistics/Dashboard Extraction Plan**

## Action 381 - Create Statistics/Dashboard Extraction Plan

Files changed:

- `docs/statistics-dashboard-extraction-plan.md`
- `docs/closed-position-card-post-audit-timeline-panel-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/trade-app-post-composition-extraction-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only Statistics/Dashboard extraction plan.
- Inventoried the current Statistics tab render, `StatisticsDashboardPanel`,
  recommendation analytics panels, plan-adherence statistics, chart panels,
  legacy performance summary helpers, calculation dependencies, and app-wide
  data dependencies.
- Confirmed Statistics should start with shell extraction while calculations,
  selected range state, dashboard construction, JSON generation, persistence,
  localStorage/Supabase behavior, and cross-tab state remain in
  `app/trade-app.tsx`.
- Recommended Action 382: extract the Statistics dashboard shell.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No statistics calculation, PnL/result logic, plan-adherence logic,
  persistence, localStorage/Supabase, Avanza/browser, execution, or trade
  mutation behavior moved.

Next recommended action:

**Action 382 — Extract Statistics Dashboard Shell**

## Action 382 - Extract Statistics Dashboard Shell

Files changed:

- `app/trade-app.tsx`
- `components/statistics/StatisticsDashboard.tsx`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/closed-position-card-post-audit-timeline-panel-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the Statistics dashboard shell into
  `components/statistics/StatisticsDashboard.tsx`.
- The new component renders the dashboard heading/copy, time-range controls,
  range summary, demo/real trade counts, progress status pill, and loading
  empty state.
- `app/trade-app.tsx` still owns all calculations, selected range state,
  dashboard construction, recommendation analytics construction, JSON
  generation, persistence, cross-tab state, and Statistics body panel
  composition.

Safety result:

- No statistics calculation, PnL/result logic, plan-adherence/statistics logic,
  filtering/time-range logic, persistence, localStorage/Supabase,
  Avanza/browser, execution, or trade mutation behavior moved.

Next recommended action:

**Action 383 — Reassess Statistics Dashboard After Shell Extraction**

## Action 383 - Reassess Statistics Dashboard After Shell Extraction

Files changed:

- `docs/statistics-dashboard-post-shell-reassessment.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/closed-position-card-post-audit-timeline-panel-reassessment.md`
- `docs/history-tab-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Statistics dashboard after Action 382 shell extraction.
- Confirmed the Statistics body remains in `app/trade-app.tsx`, including
  primary metric cards, recommendation analytics, plan-adherence statistics,
  charts, recent/open context, partial-close accounting, and period-risk
  context.
- Confirmed calculations, range state, PnL/result logic, profit-factor/win-rate
  logic, plan-adherence logic, filtering, persistence, and cross-tab integration
  remain parent-owned.
- Recommended Action 384: extract a Statistics metric card presentational
  component.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No statistics calculation, PnL/result logic, profit-factor/win-rate logic,
  plan-adherence logic, filtering/time-range logic, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 384 — Extract Statistics Metric Card Presentational Component**

## Action 384 - Extract Statistics Metric Card Presentational Component

Files changed:

- `app/trade-app.tsx`
- `components/statistics/StatisticsMetricCard.tsx`
- `docs/statistics-dashboard-post-shell-reassessment.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the reusable metric card rendering into
  `components/statistics/StatisticsMetricCard.tsx`.
- Kept the existing local `SummaryCard` API in `app/trade-app.tsx` as a wrapper
  around the extracted component.
- Preserved value/label markup, card classNames, and positive/negative/neutral
  tone behavior.
- Left all calculations, formatted values, selected range state, PnL/result
  logic, profit-factor/win-rate logic, plan-adherence logic, filtering,
  persistence, and dashboard body panels parent-owned.

Safety result:

- No statistics calculation, PnL/result logic, profit-factor/win-rate logic,
  plan-adherence logic, filtering/time-range logic, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 385 — Reassess Statistics Dashboard After Metric Card Extraction**

## Action 385 - Reassess Statistics Dashboard After Metric Card Extraction

Files changed:

- `docs/statistics-dashboard-post-metric-card-reassessment.md`
- `docs/statistics-dashboard-post-shell-reassessment.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Statistics dashboard after extracting
  `StatisticsMetricCard`.
- Confirmed `StatisticsDashboard` and `StatisticsMetricCard` are extracted while
  `SummaryCard` remains in `app/trade-app.tsx` as a compatibility wrapper.
- Confirmed remaining metric grids, recommendation analytics, plan-adherence
  summary, chart panels, recent/open context, partial-close summary, and
  period-risk summary remain in `app/trade-app.tsx`.
- Recommended Action 386: extract a Statistics summary grid.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No metric calculation, PnL/result logic, profit-factor/win-rate logic,
  plan-adherence logic, filtering/time-range logic, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 386 — Extract Statistics Summary Grid**

## Action 386 - Extract Statistics Summary Grid

Files changed:

- `app/trade-app.tsx`
- `components/statistics/StatisticsSummaryGrid.tsx`
- `docs/statistics-dashboard-post-metric-card-reassessment.md`
- `docs/statistics-dashboard-post-shell-reassessment.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted `components/statistics/StatisticsSummaryGrid.tsx`.
- Replaced the primary Statistics metric grid, recommendation analytics headline
  metric grid, and plan-adherence headline metric grid with the presentational
  wrapper.
- Preserved all `SummaryCard` children, formatted display values, card labels,
  card order, and responsive grid variants.
- Left calculations, range state, PnL/result logic, profit-factor/win-rate
  logic, plan-adherence logic, filtering, persistence, charts, hidden JSON
  readbacks, and dashboard data derivation in `app/trade-app.tsx`.

Safety result:

- No metric calculation, PnL/result logic, profit-factor/win-rate logic,
  plan-adherence logic, filtering/time-range logic, persistence,
  localStorage/Supabase, Avanza/browser, execution, or trade mutation behavior
  moved.

Next recommended action:

**Action 387 — Reassess Statistics Dashboard After Summary Grid Extraction**

## Action 387 - Reassess Statistics Dashboard After Summary Grid Extraction

Files changed:

- `docs/statistics-dashboard-post-summary-grid-reassessment.md`
- `docs/statistics-dashboard-post-metric-card-reassessment.md`
- `docs/statistics-dashboard-post-shell-reassessment.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Statistics dashboard after summary-grid extraction.
- Confirmed `StatisticsDashboard`, `StatisticsMetricCard`, and
  `StatisticsSummaryGrid` are extracted.
- Confirmed remaining Statistics body panels are more calculation-adjacent:
  plan-adherence derivation, recommendation analytics hidden readbacks, chart
  coordinate generation, recent/open context, partial-close accounting, and
  period-risk copy remain parent-owned.
- Concluded Statistics extraction is complete enough to pause.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No metric calculation, PnL/result logic, profit-factor/win-rate logic,
  recommendation analytics logic, plan-adherence logic, filtering/time-range
  logic, persistence, localStorage/Supabase, Avanza/browser, execution, or trade
  mutation behavior moved.

Next recommended action:

**Action 388 — Reassess trade-app.tsx After Major UI Extraction Work**

## Action 388 - Reassess trade-app.tsx After Major UI Extraction Work

Files changed:

- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/statistics-dashboard-post-summary-grid-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/handoff-modal-decomposition-plan.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/history-tab-extraction-plan.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed `app/trade-app.tsx` after major UI extraction work across
  Execution Handoff, Recommendations, Live Day Trades, History, and Statistics.
- Confirmed the file is approximately 39,692 lines.
- Confirmed each major UI area is complete enough to pause.
- Ranked remaining risk-heavy domains: state/effects/localStorage,
  Supabase/persistence, execution/handoff/orchestrator, trade mutation flows,
  statistics/PnL/plan-adherence calculations, and data construction/filtering.
- Recommended Action 389: create an app state/effects extraction plan.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No state/hook movement, persistence movement, Supabase/localStorage behavior,
  Avanza/browser behavior, execution behavior, or trade mutation behavior
  changed.

Next recommended action:

**Action 389 — Create App State/Effects Extraction Plan**

## Action 389 - Create App State/Effects Extraction Plan

Files changed:

- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/history-tab-extraction-plan.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created the app-wide state/effects extraction plan after the major UI
  extraction phase.
- Inventoried `TradeApp` state, refs, effects, derived data, handler groups,
  persistence effects, and execution/handoff state.
- Ranked safe and unsafe hook boundaries, with navigation/tab state as the
  safest next reassessment target.
- Confirmed Supabase writes/sync, localStorage trade-data persistence,
  execution handoff/orchestrator state, trade mutation flows, PnL/statistics
  calculations, plan-adherence ownership, and active position monitoring should
  not move yet.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No state/hook movement, localStorage/Supabase movement,
  execution/orchestrator movement, calculation movement, Avanza/browser
  behavior, execution behavior, or trade mutation behavior changed.

Next recommended action:

**Action 390 — Reassess Navigation/Tab State Hook Boundary**

## Action 390 - Reassess Navigation/Tab State Hook Boundary

Files changed:

- `docs/navigation-tab-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed navigation/tab state as the first possible state hook boundary.
- Confirmed `activeTab` is the only primary navigation state and defaults to
  `"Recommendations"`.
- Confirmed no URL/hash/localStorage persistence currently owns active tab.
- Confirmed tab state feeds refresh effects and refresh-island selection, so
  refresh helpers/effects should remain parent-owned.
- Recommended Action 391: extract only the navigation/tab state hook.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No hook movement, state movement, localStorage/Supabase movement,
  execution/orchestrator movement, calculation movement, Avanza/browser
  behavior, execution behavior, or trade mutation behavior changed.

Next recommended action:

**Action 391 — Extract Navigation/Tab State Hook**

## Action 391 - Extract Navigation/Tab State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/trade-app/useTradeAppNavigationState.ts`
- `docs/navigation-tab-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the tiny navigation state hook.
- Moved only `activeTab` state ownership and the setter return value.
- Preserved the `"Recommendations"` default tab.
- Kept nav rendering, labels, refresh helpers/effects, data fetching,
  persistence, modals, execution/handoff state, calculations, and domain state
  in `app/trade-app.tsx`.

Safety result:

- No navigation UI text or layout changed.
- No localStorage/URL behavior moved or added.
- No refresh helper/effect, Supabase behavior, execution/orchestrator behavior,
  Avanza/browser behavior, calculation, persistence, or trade mutation behavior
  moved.

Next recommended action:

**Action 392 — Reassess Navigation/Tab State Hook Extraction**

## Action 392 - Reassess Navigation/Tab State Hook Extraction

Files changed:

- `docs/navigation-tab-state-hook-post-extraction-reassessment.md`
- `docs/navigation-tab-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Action 391 navigation hook extraction.
- Confirmed the hook exports only `TradeAppTab` and
  `useTradeAppNavigationState`.
- Confirmed the hook preserves `"Recommendations"` as the default tab and
  returns the existing `activeTab`/`setActiveTab` shape.
- Confirmed nav rendering, labels, active class names, refresh effects,
  persistence, modals, calculations, and execution/handoff behavior remain
  parent-owned.
- Recommended Action 393: reassess Statistics range state hook boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No additional hook/state movement, localStorage/Supabase movement,
  execution/orchestrator movement, calculation movement, Avanza/browser
  behavior, execution behavior, or trade mutation behavior changed.

Next recommended action:

**Action 393 — Reassess Statistics Range State Hook Boundary**

## Action 393 - Reassess Statistics Range State Hook Boundary

Files changed:

- `docs/statistics-range-state-hook-boundary-reassessment.md`
- `docs/navigation-tab-state-hook-post-extraction-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/statistics-dashboard-post-summary-grid-reassessment.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Statistics range state boundary.
- Confirmed `selectedStatisticsRange` and `setSelectedStatisticsRange` are the
  only range state pair.
- Confirmed the default range is `"today"` and no localStorage/URL coupling was
  found.
- Confirmed the range value feeds multiple calculation builders, so all
  calculations and data construction must remain parent-owned.
- Recommended Action 394: extract only the Statistics range state hook.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No hook/state movement, statistics calculation movement, time-range/filtering
  movement, localStorage/Supabase movement, execution/orchestrator movement,
  Avanza/browser behavior, execution behavior, or trade mutation behavior
  changed.

Next recommended action:

**Action 394 — Extract Statistics Range State Hook**

## Action 394 - Extract Statistics Range State Hook

Files changed:

- `app/trade-app.tsx`
- `hooks/trade-app/useStatisticsRangeState.ts`
- `docs/statistics-range-state-hook-boundary-reassessment.md`
- `docs/navigation-tab-state-hook-post-extraction-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted the tiny Statistics range state hook.
- Moved only `selectedStatisticsRange` state ownership and the setter return
  value.
- Preserved the `"today"` default range.
- Kept range options, calculations, range-driven filtering/data construction,
  formatted display values, Statistics rendering, persistence/localStorage/
  Supabase behavior, history/live/recommendation integration, and
  execution/handoff state parent-owned.

Safety result:

- No range UI text or layout changed.
- No calculation, filtering/time-range logic, localStorage/URL behavior,
  persistence behavior, execution/handoff behavior, Avanza/browser behavior, or
  trade mutation behavior moved.

Next recommended action:

**Action 395 — Reassess Statistics Range State Hook Extraction**

## Action 395 - Reassess Statistics Range State Hook Extraction

Files changed:

- `docs/statistics-range-state-hook-post-extraction-reassessment.md`
- `docs/statistics-range-state-hook-boundary-reassessment.md`
- `docs/navigation-tab-state-hook-post-extraction-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/statistics-dashboard-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed the Action 394 Statistics range hook extraction.
- Confirmed the hook exports only `useStatisticsRangeState` and owns only
  `selectedStatisticsRange` plus its setter.
- Confirmed the `"today"` default range and existing setter call path are
  preserved.
- Confirmed range options, labels, calculations, dashboard rendering,
  persistence, cross-tab data construction, and execution/handoff behavior
  remain parent-owned.
- Recommended Action 396: reassess modal UI state hook boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No additional hook/state movement, calculation movement, filtering/data
  construction movement, localStorage/Supabase movement, execution/orchestrator
  movement, Avanza/browser behavior, execution behavior, or trade mutation
  behavior changed.

Next recommended action:

**Action 396 — Reassess Modal UI State Hook Boundary**

## Action 396 - Reassess Modal UI State Hook Boundary

Files changed:

- `docs/modal-ui-state-hook-boundary-reassessment.md`
- `docs/statistics-range-state-hook-post-extraction-reassessment.md`
- `docs/navigation-tab-state-hook-post-extraction-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed current modal UI state clusters.
- Confirmed Recommendation details/discard state is already local to
  `RecommendationCardContainer`.
- Confirmed app-owned `selectedRecommendation`, `selectedPosition`, add-trade
  form state, close-position form state, and validation state are coupled to
  behavior and should remain parent-owned.
- Confirmed execution preview, handoff, close/sell, broker/result, and Avanza
  preview states are safety- or persistence-adjacent and should not move.
- Recommended Action 397: reassess Recommendation UI state hook boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No hook/state movement, selected trade/recommendation movement,
  ADD TRADE/discard/close/sell logic movement, execution/orchestrator movement,
  localStorage/Supabase movement, Avanza/browser behavior, execution behavior,
  or trade mutation behavior changed.

Next recommended action:

**Action 397 — Reassess Recommendation UI State Hook Boundary**

## Action 397 - Reassess Recommendation UI State Hook Boundary

Files changed:

- `docs/recommendation-ui-state-hook-boundary-reassessment.md`
- `docs/modal-ui-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/recommendations-area-post-container-extraction-reassessment.md`
- `docs/recommendations-tab-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed current Recommendation UI state boundaries after modal state was
  found too coupled for a generic hook.
- Confirmed `RecommendationCardContainer` already owns card-local details,
  discard confirmation, and confirm-in-progress UI state.
- Confirmed parent-owned Recommendation state remains coupled to data
  construction, Recommendation history filters, ADD TRADE validation, selected
  TradeModal state, discard persistence, Supabase/localStorage behavior,
  diagnostics, and execution handoff entry points.
- Recommended Action 398: reassess History UI state hook boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No hook/state movement, Recommendation data construction/filtering movement,
  ADD TRADE validation/openTradeModal movement, discard persistence movement,
  selected TradeModal movement, localStorage/Supabase movement,
  execution/handoff movement, Avanza/browser behavior, execution behavior, or
  trade mutation behavior changed.

Next recommended action:

**Action 398 — Reassess History UI State Hook Boundary**

## Action 398 - Reassess History UI State Hook Boundary

Files changed:

- `docs/history-ui-state-hook-boundary-reassessment.md`
- `docs/recommendation-ui-state-hook-boundary-reassessment.md`
- `docs/modal-ui-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/history-tab-extraction-plan.md`
- `docs/closed-position-card-post-audit-timeline-panel-reassessment.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed current History UI state boundaries.
- Confirmed `ClosedPositionCard` already owns card-local details-open state.
- Confirmed History filter/sort state is UI-like but remains coupled to
  `buildHistoryDashboard`, visible counts, filtered card ordering, empty
  states, and e2e-visible labels.
- Confirmed PnL/result derivation, plan-vs-actual derivation, audit/timeline
  derivation, persistence, Statistics integration, and execution/audit
  integration remain parent/card-owned.
- Recommended Action 399: reassess Live Day Trade UI state hook boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No hook/state movement, History data construction/filtering movement,
  PnL/result calculation movement, plan-adherence/audit derivation movement,
  localStorage/Supabase movement, execution/audit integration movement,
  Avanza/browser behavior, execution behavior, or trade mutation behavior
  changed.

Next recommended action:

**Action 399 — Reassess Live Day Trade UI State Hook Boundary**

## Action 399 - Reassess Live Day Trade UI State Hook Boundary

Files changed:

- `docs/live-day-trade-ui-state-hook-boundary-reassessment.md`
- `docs/history-ui-state-hook-boundary-reassessment.md`
- `docs/recommendation-ui-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/live-day-trades-tab-extraction-plan.md`
- `docs/active-position-card-post-details-modal-reassessment.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Reassessed Live Day Trade UI state boundaries.
- Confirmed `ActivePositionCard` owns card-local details-open,
  execution-preview-open, and EOD acknowledgement state.
- Confirmed details/preview booleans are low-payoff extraction targets, EOD
  acknowledgement is localStorage-coupled, execution preview is
  orchestrator/handoff-coupled, and close/sell state is mutation- and
  persistence-coupled.
- Confirmed close/sell handlers, selected close-position state, active position
  monitoring, Supabase/localStorage behavior, and trade mutation flows remain
  parent/card-owned.
- Recommended Action 400: create a persistence boundary plan.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No hook/state movement, close/sell/exit logic movement, EOD acknowledgement
  persistence movement, execution/orchestrator movement, localStorage/Supabase
  movement, trade mutation movement, Avanza/browser behavior, or execution
  behavior changed.

Next recommended action:

**Action 400 — Create Persistence Boundary Plan**

## Action 400 - Create Persistence Boundary Plan

Files changed:

- `docs/persistence-boundary-plan.md`
- `docs/live-day-trade-ui-state-hook-boundary-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only persistence boundary plan.
- Inventoried localStorage keys, demo/local fallback flows, Supabase reads and
  writes, recommendation learning persistence helpers, trade mutation flows,
  EOD acknowledgement persistence, audit/event logs, execution metadata, and
  execution audit persistence modules.
- Classified persistence risk from low-risk key constants/preferences through
  high-risk trade mutations, Supabase writes, execution metadata, audit records,
  and idempotency-sensitive flows.
- Recommended Action 401: reassess localStorage key constants boundary.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No persistence movement, localStorage/Supabase movement, trade mutation
  movement, execution/orchestrator movement, Avanza/browser behavior, execution
  behavior, or data writes changed.

Next recommended action:

**Action 401 — Reassess localStorage Key Constants Boundary**

## Action 401 - Reassess localStorage Key Constants Boundary

Files changed:

- `docs/local-storage-key-constants-boundary-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment of localStorage key constants.
- Inventoried app-inline static keys, dynamic EOD acknowledgement keys,
  repeated audit/event literals, helper-module keys, recommendation-learning
  keys, execution/audit stores, diagnostics keys, and demo storage keys.
- Confirmed constants-only centralization is safe if exact strings are
  preserved.
- Confirmed read/write helpers, migrations, dynamic key generation, Supabase
  persistence, trade mutations, recommendation-learning writes, and execution
  persistence should not move in the next action.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No localStorage key names, reads, writes, deletes, migrations, Supabase
  behavior, trade mutations, execution/orchestrator behavior, Avanza/browser
  behavior, or persistence behavior changed.

Next recommended action:

**Action 402 — Extract localStorage Key Constants**

## Action 402 - Extract localStorage Key Constants

Files changed:

- `lib/persistence/local-storage-keys.ts`
- `app/trade-app.tsx`
- `lib/execution-timeline.ts`
- `docs/local-storage-key-constants-boundary-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a constants-only localStorage key module.
- Centralized exact static key strings for demo storage, mock broker latest
  fill, warning dismissals, live market trial runbook, provider plan mode, dev
  preview visibility, and trade management events.
- Replaced eligible static literals in `app/trade-app.tsx` and
  `lib/execution-timeline.ts`.
- Left dynamic EOD key generation, localStorage read/write helpers, migrations,
  Supabase behavior, trade mutations, recommendation-learning persistence, and
  execution/orchestrator persistence untouched.

Safety result:

- No localStorage key strings changed.
- No persistence behavior changed.
- No Avanza/browser behavior, execution behavior, Supabase behavior, trade
  mutation behavior, migration behavior, or dynamic key behavior changed.

Next recommended action:

**Action 403 — Reassess localStorage Key Constants Extraction**

## Action 403 - Reassess localStorage Key Constants Extraction

Files changed:

- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/local-storage-key-constants-boundary-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment after the constants extraction.
- Verified `lib/persistence/local-storage-keys.ts` exports exact static
  constants only.
- Confirmed no read/write helpers, dynamic EOD key builder, migrations,
  defaults, Supabase behavior, trade mutations, recommendation-learning
  persistence, or execution/orchestrator persistence moved.
- Recorded the Action 402 test status, including the sandbox-limited e2e run.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No additional key movement, localStorage read/write movement, dynamic key
  builder movement, Supabase movement, trade mutation movement,
  execution/orchestrator movement, Avanza/browser behavior, or execution
  behavior changed.

Next recommended action:

**Action 404 — Reassess EOD Acknowledgement Persistence Wrapper**

## Action 404 - Reassess EOD Acknowledgement Persistence Wrapper

Files changed:

- `docs/eod-acknowledgement-persistence-wrapper-reassessment.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/local-storage-key-constants-boundary-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment of EOD acknowledgement
  persistence.
- Inventoried dynamic key generation, read/write helpers, defaults,
  localStorage guards, error handling, and `ActivePositionCard` call sites.
- Concluded the wrapper can be extracted safely next if the exact key format
  and behavior are preserved.
- Confirmed EOD safety calculation, UI state, close/sell behavior, Supabase
  behavior, and execution/orchestrator behavior should not move.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No localStorage read/write movement, dynamic key builder movement,
  persistence helper extraction, Supabase movement, close/sell/EOD UX movement,
  execution/orchestrator movement, Avanza/browser behavior, or execution
  behavior changed.

Next recommended action:

**Action 405 — Extract EOD Acknowledgement Persistence Wrapper**

## Action 405 - Extract EOD Acknowledgement Persistence Wrapper

Files changed:

- `lib/persistence/eod-acknowledgement-persistence.ts`
- `app/trade-app.tsx`
- `docs/eod-acknowledgement-persistence-wrapper-reassessment.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted EOD acknowledgement localStorage persistence into a tiny wrapper.
- Preserved exact key format, stored value, read fallback, server no-op
  behavior, remove-on-false behavior, and swallowed localStorage errors.
- Updated `app/trade-app.tsx` to use the wrapper for EOD acknowledgement
  read/write.
- Left EOD safety calculation, UI state, close/sell behavior, Supabase
  behavior, trade mutations, and execution/orchestrator behavior untouched.

Safety result:

- No key format changed.
- No default behavior changed.
- No migration, Supabase behavior, EOD safety calculation movement, UI state
  movement, close/sell behavior movement, execution/orchestrator movement,
  trade mutation movement, Avanza/browser behavior, or execution behavior
  changed.

Next recommended action:

**Action 406 — Reassess EOD Acknowledgement Persistence Wrapper Extraction**

## Action 406 - Reassess EOD Acknowledgement Persistence Wrapper Extraction

Files changed:

- `docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`
- `docs/eod-acknowledgement-persistence-wrapper-reassessment.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment after EOD acknowledgement wrapper
  extraction.
- Verified the wrapper preserves exact key format, read/write semantics,
  fallbacks, server behavior, remove-on-false behavior, and swallowed errors.
- Confirmed no EOD UI state, EOD safety calculation, close/sell behavior,
  Supabase/trade behavior, or execution/orchestrator behavior moved.
- Recorded the Action 405 test status and e2e sandbox limitation.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No additional persistence movement, localStorage key changes, Supabase
  movement, trade mutation movement, EOD UI/state movement,
  execution/orchestrator movement, Avanza/browser behavior, or execution
  behavior changed.

Next recommended action:

**Action 407 — Reassess Recommendation Discard Persistence Wrapper**

## Action 407 - Reassess Recommendation Discard Persistence Wrapper

Files changed:

- `docs/recommendation-discard-persistence-wrapper-reassessment.md`
- `docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment of recommendation discard
  persistence.
- Confirmed the discard confirm UI state is already local to
  `RecommendationCardContainer`.
- Confirmed the persistence path remains Supabase/status/metadata coupled in
  `app/trade-app.tsx`, not a localStorage read/write wrapper.
- Confirmed recommendation-learning localStorage persistence is adjacent but
  not the confirm-discard persistence path.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No localStorage read/write movement, key movement, Supabase movement, trade
  mutation movement, ADD TRADE movement, discard persistence movement, or
  execution/orchestrator movement.

Next recommended action:

**Action 408 — Reassess Dev/Diagnostics localStorage Wrapper**

## Action 408 - Reassess Dev/Diagnostics localStorage Wrapper

Files changed:

- `docs/dev-diagnostics-local-storage-wrapper-reassessment.md`
- `docs/recommendation-discard-persistence-wrapper-reassessment.md`
- `docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment of dev/diagnostics localStorage
  wrappers.
- Confirmed several diagnostics stores already have dedicated modules and
  should stay module-owned.
- Identified app-local dev/preference localStorage helpers as the safest next
  wrapper target.
- Confirmed execution audit/event stores and execution record/result stores
  should wait for separate reassessment.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No localStorage read/write movement, diagnostics persistence movement,
  Supabase movement, trade mutation movement, execution/orchestrator movement,
  Avanza/browser behavior, or execution behavior changed.

Next recommended action:

**Action 409 — Extract Dev/Diagnostics localStorage Wrapper**

## Action 409 - Extract Dev/Diagnostics localStorage Wrapper

Files changed:

- `lib/persistence/dev-diagnostics-local-storage.ts`
- `app/trade-app.tsx`
- `docs/dev-diagnostics-local-storage-wrapper-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Extracted app-local dev/preference localStorage helpers into
  `lib/persistence/dev-diagnostics-local-storage.ts`.
- Moved provider plan mode, dev-preview hidden flag, dismissed warnings, and
  latest mock broker fill raw read/remove helpers.
- Left live market trial runbook persistence inline.
- Left diagnostics stores and execution audit/record stores module-owned.

Safety result:

- No key strings changed.
- No data shape, default, migration, Supabase behavior, trade mutation
  behavior, execution/orchestrator behavior, Avanza/browser behavior, or
  execution behavior changed.

Checks:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.
- default sandbox `npm run test:e2e` was blocked before app test logic by
  `listen EPERM: operation not permitted 0.0.0.0:3010`.
- escalated `npm run test:e2e` passed: 64 tests.

Next recommended action:

**Action 410 — Reassess Dev/Diagnostics localStorage Wrapper Extraction**

## Action 410 - Reassess Dev/Diagnostics localStorage Wrapper Extraction

Files changed:

- `docs/dev-diagnostics-local-storage-post-extraction-reassessment.md`
- `docs/dev-diagnostics-local-storage-wrapper-reassessment.md`
- `docs/eod-acknowledgement-persistence-post-extraction-reassessment.md`
- `docs/local-storage-key-constants-post-extraction-reassessment.md`
- `docs/persistence-boundary-plan.md`
- `docs/app-state-effects-extraction-plan.md`
- `docs/trade-app-post-major-ui-extraction-reassessment.md`
- `docs/trade-app-responsibility-reassessment.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

Result:

- Created a documentation-only reassessment after the dev/diagnostics
  localStorage wrapper extraction.
- Verified the wrapper remains limited to app-local dev/preference helpers.
- Confirmed key strings, data shapes, defaults/fallbacks, no-window behavior,
  and error handling were preserved.
- Confirmed diagnostics stores, execution audit/event stores, execution record
  stores, live market trial runbook persistence, Supabase behavior, trade
  mutations, and execution/orchestrator behavior remain untouched.

Action 409 checks recorded:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.
- default sandbox `npm run test:e2e` was blocked by
  `listen EPERM: operation not permitted 0.0.0.0:3010`.
- escalated `npm run test:e2e` passed: 64 tests.

Safety result:

- Documentation only.
- No runtime behavior changed.
- No additional persistence movement, localStorage key changes,
  diagnostics/audit/record store movement, Supabase movement, trade mutation
  movement, execution/orchestrator movement, Avanza/browser behavior, or
  execution behavior changed.

Next recommended action:

**Action 411 — Reassess Live Market Trial Runbook Persistence Wrapper**
