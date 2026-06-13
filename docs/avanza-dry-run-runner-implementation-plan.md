# Avanza Dry-Run Runner Implementation Plan

Date: 2026-06-11

Status: Documentation-only implementation plan for a possible future Avanza dry-run runner. No Avanza automation was implemented, no Avanza URL or selector was added, no Playwright import was added to app/runtime, no run button was added, no order submission is in scope, no broker result is created, no Supabase write occurs, and no trade state is mutated.

Related:

- `lib/avanza-dry-run-runner-self-check.ts`
- `lib/avanza-session-detection-contract.ts`
- `lib/avanza-search-only-result-contract.ts`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/safe-browser-action-contract.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-advanced-form-fill-phase-design.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Plan the safest architecture for the first future Avanza dry-run runner before any runner code is written.

Dry-run runner means:

- prepare an order form
- review values
- click only the review action
- read back the confirmation modal
- stop at the manual final-confirmation boundary

Dry-run runner does not mean broker execution. It does not create `brokerResult`, execution records, Supabase writes, trade mutations, History/Statistics changes, or automatic trading.

This plan is not implementation approval. It exists so a future implementation can be reviewed against explicit gates, flow stages, diagnostics, and stop states before any Avanza browser control is added.

Action 260 added `lib/avanza-dry-run-runner-self-check.ts`, a pure self-check contract for future dry-run runner readiness. It can represent the current no-runner state as `unavailable`, distinguish mock-only from `available_dry_run_only`, and block broker-submission or final-confirm-capable runners without controlling a browser.

Action 261 added a localhost bridge `GET /self-check` contract, client helper, and server stub response for self-check metadata. The default stub reports the current no-runner state as unavailable; optional mock-only capability remains distinct from Avanza dry-run capability. The endpoint is read-only and does not control a browser.

Action 262 integrated the latest localhost self-check result into the read-only Avanza dry-run readiness panel. The panel now distinguishes `unavailable`, `available_mock_only`, blocked/failed, and future `available_dry_run_only` states without adding a run button or browser behavior.

Action 263 added a localhost bridge `POST /dry-run` request contract and server
stub. The endpoint validates `AvanzaDryRunOrderInput`, capability options, and
the current unavailable self-check, then returns `not_implemented` or `blocked`
without controlling a browser, touching Avanza, submitting orders, creating
broker results, writing Supabase, or mutating trades.

Action 264 added `runLocalhostBridgeAvanzaDryRunStub(...)`, a frontend-safe
client helper for the `POST /dry-run` stub. It builds the request, applies a
timeout, safely normalizes responses, and summarizes `not_implemented`,
`blocked`, unavailable, invalid JSON, timeout, and network-failure outcomes. It
is not wired to a run/start UI.

Action 265 added a dev-gated, read-only `Dry-run bridge response preview` panel
to the handoff modal. It lets the user test the localhost `/dry-run` stub for
the current dry-run request and inspect the normalized response while keeping
the UI clear that no browser actions, broker submission, broker result,
Supabase write, or trade mutation occurred.

Action 266 added `scripts/avanza-dry-run-runner-skeleton.mjs` and the local
bridge mode `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton`. In that
mode, the bridge can report a dry-run-only skeleton self-check and can accept a
valid `/dry-run` request as `status="accepted_stub"`. The skeleton is contract
plumbing only: it does not control a browser, open Avanza, add Avanza selectors
or URLs, submit orders, create broker results, write Supabase, or mutate trade
state.

Action 267 expanded `npm run bridge:localhost:smoke` into a printed smoke test
matrix for default, `mock_only`, and `dry_run_skeleton` bridge modes. It also
checks unsafe dry-run metadata, missing `dryRunOrderInput`, invalid JSON,
existing `/run` behavior, and `/cancel`, while asserting no `brokerResult` and
no executed browser diagnostics.

Action 268 added `docs/avanza-manual-mapping-refresh-pack.md`, a
documentation-only manual refresh pack for validating the current Avanza UI
before any session-detection/search-only runner design. It defines required
manual flows, screenshot hygiene, mapping templates, validation/readback
templates, and green/yellow/red outcomes without adding automation.

Action 269 added `docs/avanza-session-detection-only-design.md`, a
documentation-only design for the first possible Avanza-adjacent phase. It
limits that phase to readiness/status detection only and forbids clicks, typing,
search, navigation, order pages, account-data reads, broker results, Supabase
writes, and trade mutation.

Action 270 added `lib/avanza-session-detection-contract.ts`, a pure result
contract for session detection. It can classify sanitized context as
`browser_not_connected`, `avanza_not_visible`, `login_required`,
`ready_for_search_only`, `blocked`, `failed`, or `unavailable` without browser
control, Avanza selectors, Avanza URLs, broker results, Supabase writes, or
trade mutation.

Action 271 added a localhost bridge `GET /session-detection` stub contract,
client helper, and smoke matrix rows for unavailable, ready-for-search-only,
login-required, and sensitive-data-blocked synthetic states. The bridge still
does not control a browser, touch Avanza, add selectors/URLs, submit orders,
create broker results, write Supabase, or mutate trades.

Action 272 added a read-only session-detection preview to the handoff modal.
It can call the localhost stub and display synthetic readiness metadata while
keeping search-only and dry-run execution disabled. No browser runner, Avanza
navigation, selector, URL, broker result, Supabase write, or trade mutation was
added.

Action 273 added `docs/avanza-search-only-phase-design.md`, a
documentation-only design for the next future phase after session detection.
It defines search-only as sanitized instrument candidate lookup only and
forbids order pages, buy/sell clicks, order forms, submissions, broker results,
Supabase writes, and trade mutation.

Action 274 added `lib/avanza-search-only-result-contract.ts`, a pure
TypeScript result contract for that future phase. It scores sanitized
instrument candidates, classifies exact/ambiguous/no-match/blocked outcomes,
and emits search-only safety labels without browser control, Avanza selectors
or URLs, search buttons, order pages, broker results, Supabase writes, or trade
mutation.

Action 275 added a localhost bridge `POST /search-only` contract, frontend-safe
client helper, server stub, and smoke matrix rows for synthetic exact,
ambiguous, no-match, sensitive-data-blocked, and order-flow-blocked search-only
results. It remains a non-executing stub with no browser control, Avanza
selectors or URLs, search/run/start button, order page, buy/sell click, broker
result, Supabase write, or trade mutation.

Action 276 added a dev-gated, read-only Search-only preview to the handoff
modal. It can call the localhost `/search-only` stub for the current dry-run
request instrument and display exact, ambiguous, no-match, or blocked synthetic
results plus candidate/risk metadata. It still adds no Avanza search/run/start
button, browser control, selector, URL, order page, buy/sell click, broker
result, Supabase write, or trade mutation.

Action 277 added `docs/avanza-instrument-verification-phase-design.md`, a
documentation-only design for the next future phase after a search-only exact
match. It limits that phase to sanitized instrument identity verification and
still forbids order pages, buy/sell clicks, order-form behavior, submissions,
broker results, Supabase writes, and trade mutation.

Action 278 added `lib/avanza-instrument-verification-contract.ts`, a pure
TypeScript result contract for sanitized instrument identity verification. It
can verify exact search-only candidates, reject mismatches, mark incomplete
identity as ambiguous, and block sensitive/order-flow risk without browser
control, Avanza selectors or URLs, verify/search/run/start buttons, order pages,
broker results, Supabase writes, or trade mutation.

Action 279 added a localhost bridge `POST /instrument-verification` contract,
frontend-safe client helper, server stub, and smoke/e2e normalization coverage
for synthetic verified, rejected, ambiguous, blocked, search-not-ready, and
missing-candidate states. It remains a non-executing stub with no browser
control, Avanza selectors or URLs, verify/search/run/start button, order page,
buy/sell click, form fill, broker result, Supabase write, or trade mutation.

Action 280 added a dev-gated, read-only Instrument verification preview to the
handoff modal. It can call the localhost `/instrument-verification` stub for
the current dry-run request instrument, include the latest exact search-only
candidate when available, and display verified, rejected, ambiguous, or blocked
synthetic results plus field checks/risk metadata. It still adds no Avanza
verify/search/run/start button, browser control, selector, URL, order page,
buy/sell click, form fill, broker result, Supabase write, or trade mutation.

Action 281 added `docs/avanza-instrument-page-phase-design.md`, a
documentation-only design for the next future phase after verified instrument
identity. It limits that phase to non-order instrument-page identity
observation and explicitly forbids order pages, buy/sell clicks, order-form
behavior, submissions, broker results, Supabase writes, and trade mutation.

Action 282 added `lib/avanza-instrument-page-contract.ts`, a pure TypeScript
result contract for sanitized instrument-page identity checks. It can identify
matching non-order instrument pages, detect page mismatches, block order page,
order form, final-confirm, account/balance/holdings/sensitive states, and treat
buy/sell button visibility as guarded warnings without browser control,
Avanza selectors or URLs, instrument-page/run/start buttons, broker results,
Supabase writes, or trade mutation.

Action 283 added a localhost bridge `POST /instrument-page` contract, client
helper, server stub modes, smoke matrix assertions, and e2e/client
normalization coverage for synthetic instrument-page identity results. The
endpoint can return page-identified, buy/sell-visible warning, page-mismatch,
prohibited-control, blocked, page-not-open, verification-not-ready, unavailable,
or failed metadata without browser control, Avanza selectors/URLs, order pages,
buy/sell clicks, form fills, broker results, Supabase writes, or trade
mutation.

Action 284 added a dev-gated, read-only `Instrument page preview` to the
Execution Handoff Preview Modal. It can manually call the localhost
`/instrument-page` stub for the current dry-run request instrument, include the
latest verified instrument result when available, and display sanitized page
identity diagnostics. It still adds no browser control, Avanza selectors/URLs,
order-page opening, buy/sell clicks, form fills, broker results, Supabase
writes, or trade mutation.

Action 285 added `docs/avanza-order-page-open-phase-design.md`, a
documentation-only design for the future phase after `page_identified`. It
defines a guarded entry `Kop`/`Salj` click policy for opening an order page and
then stopping after verification. It still forbids form fills, `Granska`,
`Bekrafta`, final confirmation, broker results, Supabase writes, and trade
mutation.

Action 286 added `lib/avanza-order-page-open-contract.ts`, a pure TypeScript
result contract for future order-page-open diagnostics. It compares expected
action and instrument with sanitized order-page identity, blocks final-confirm,
review-click, keyboard-submit, prefilled-form, and sensitive-data states, and
adds e2e contract coverage without browser control, Avanza selectors/URLs,
form fills, review clicks, final-confirm clicks, broker results, Supabase
writes, or trade mutation.

## Non-Negotiable Boundaries

The first future runner must remain:

- `semi_automatic` only
- user-triggered only
- Advanced order only
- stop-at-confirmation-modal only
- no final `Bekräfta köp` click
- no final `Bekräfta sälj` click
- no automatic mode
- no brokerResult
- no execution record
- no Supabase write
- no trade mutation
- no History/Statistics update

The user remains the only actor who may decide whether to click final confirmation outside the runner.

## Proposed Architecture

Recommended future architecture:

1. Ture UI builds a validated `AvanzaDryRunOrderInput`.
2. Ture UI keeps the current read-only preview and readiness checklist visible.
3. Ture UI may call a local bridge or local agent process only when a future dry-run flag is explicitly enabled.
4. The local runner controls only the user's watched browser session.
5. The runner converts the request into a `SafeBrowserAction` plan.
6. Every action goes through safe wrappers such as `safeClick`, `safeFill`, and `safeRead`.
7. The final-confirm denylist is active before every click/select/keyboard-like action.
8. The runner emits `SafeBrowserActionExecutionDiagnostics`.
9. The runner returns diagnostics to Ture as response-level metadata only.
10. Ture stores diagnostics locally only, separate from broker results and execution records.

The future runner should be isolated from app runtime UI code. The UI should not receive raw browser handles, credentials, cookies, storage, raw DOM dumps, or unsanitized screenshots.

## Required Flags And Gates

Future dry-run start must require all gates:

- `NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS=true`
- `NEXT_PUBLIC_ENABLE_AVANZA_DRY_RUN=true` or an equivalent future public UI gate
- `allowAvanzaDryRun=true` passed to capability validation
- execution mode is `semi_automatic`
- `allowFinalSubmit=false`
- `allowBrokerSubmission=false`
- automatic mode disabled
- manual user final confirmation required
- runner implementation exists
- runner self-check passes
- request validates through `validateAvanzaDryRunOrderInput(...)`
- capability validates as `dry_run_only`

These gates must be checked at the UI boundary and again in the local runner or bridge boundary. Client-side UI gating alone is not enough.

Production enablement is out of scope. If a future production gate is ever considered, it must be a separate design and approval path.

## Execution Flow

The future dry-run runner should follow this sequence:

1. Validate the `AvanzaDryRunOrderInput`.
2. Validate the browser runner capability.
3. Verify the local runner self-check passed.
4. Detect browser/session state without storing credentials.
5. Stop if login/session state is unavailable or ambiguous.
6. Search for the requested instrument.
7. Verify exact instrument identity: ticker, name, market, currency, and type where available.
8. Open the order entry flow for the requested side.
9. Verify `Advanced` order mode.
10. Verify or record manual-review account policy.
11. Fill quantity.
12. Fill price/course.
13. Verify filled form values against the request.
14. Verify no validation errors are visible.
15. Click only `Granska köp` or `Granska sälj`.
16. Detect the confirmation modal.
17. Read back instrument, account label, quantity, price/course, fees, currency, and total where visible.
18. Verify readback values against the request and account policy.
19. Emit `waiting_for_manual_confirmation`.
20. Stop.

No action after step 20 may click, submit, keyboard-submit, or continue toward broker submission.

## Stop And Failure States

The future runner must stop safely on:

- final confirm visible
- final confirm click attempted
- ambiguous instrument
- wrong instrument
- wrong action
- wrong account
- wrong price
- wrong quantity
- validation error
- unsupported tab or order mode
- unexpected layout
- session timeout
- login challenge
- user abort
- runner self-check failed
- capability validation blocked
- safe action validation blocked
- confirmation modal mismatch
- sensitive data logging risk

Suggested failure state names:

- `runner_self_check_failed`
- `dry_run_request_invalid`
- `capability_blocked`
- `session_unavailable`
- `login_challenge_detected`
- `instrument_not_found`
- `ambiguous_instrument_candidates`
- `instrument_identity_mismatch`
- `order_mode_not_advanced`
- `validation_failed`
- `account_mismatch`
- `quantity_mismatch`
- `price_mismatch`
- `confirmation_not_detected`
- `confirmation_mismatch`
- `final_confirm_visible_safe_stop`
- `unsafe_final_confirm_attempt_blocked`
- `unexpected_layout`
- `user_aborted`

Failure output must be sanitized and must not include credentials, balances, holdings, tokens, cookies, raw DOM dumps, or unsanitized screenshots.

## Diagnostics Requirements

The future runner must emit `SafeBrowserActionExecutionDiagnostics`.

Required metadata:

- `targetEnvironment: "avanza_broker"`
- `dryRunOnly: true`
- `mockOnly: false`
- `supportsBrokerSubmission: false`
- `supportsFinalConfirmClick: false`
- `automaticModeCapable: false`
- `finalConfirmBlocked: true` when an attempted final-confirm action is blocked
- `requestValidationOk`
- `capabilityValidationOk`
- `runnerSelfCheckOk`
- `stopReason`
- `terminalState`

Diagnostics must include per-step safe-action status for validation, execution, blocked, skipped, and failed actions.

Diagnostics must not include:

- account numbers
- balances
- holdings
- credentials
- cookies
- session tokens
- browser localStorage/sessionStorage
- raw DOM dumps
- raw screenshots
- unsanitized recordings
- broker confirmations represented as real broker results

Ture may store the diagnostics locally for development inspection only. Diagnostics are not broker results, execution records, or proof of execution.

## Test Strategy

The implementation should progress through these phases:

### Phase 1 - Pure Contract Tests

- Validate `AvanzaDryRunOrderInput`.
- Validate capability gates.
- Validate final-confirm denylist behavior.
- Validate self-check response shape when Action 260 exists.

### Phase 2 - Mock-Order Safe Action Tests

- Convert mock fill plans into safe action plans.
- Run no-op safe action validation.
- Execute only against local mock pages through test-only adapters.
- Prove final-confirm-like actions block.

### Phase 3 - Local Bridge Mock Diagnostics Tests

- Return safe-action diagnostics through localhost bridge mock-agent paths.
- Store diagnostics locally only.
- Confirm no broker result or execution record is created.

### Phase 4 - Manual Avanza Mapping Session

- Start from `docs/avanza-manual-mapping-refresh-pack.md`.
- Use `docs/avanza-manual-mapping-session-notes.md`.
- Confirm current UI labels and stop boundary.
- Update mapping/gap docs before runner code.

### Phase 5 - Avanza Dry-Run Self-Check Without Actions

- Verify the local runner can report environment readiness.
- Do not navigate, click, fill, or read Avanza order fields.
- Confirm self-check can fail closed.
- Skeleton mode may report `available_dry_run_only` only with
  `skeletonOnly: true` and `noBrowserControl: true`.
- Skeleton `/dry-run` may return `accepted_stub`, but must still report no
  browser actions and no broker submission.

### Phase 5A - Session Detection Only

- Follow `docs/avanza-session-detection-only-design.md`.
- Detect only whether a watched browser/session appears ready for a later
  search-only design.
- Do not click, type, search, navigate, open order pages, read account data,
  or store sensitive context.
- Return sanitized readiness metadata only.

### Phase 5B - Search And Instrument Identity Gates

- Follow `docs/avanza-search-only-phase-design.md`.
- Follow `docs/avanza-instrument-verification-phase-design.md`.
- Follow `docs/avanza-instrument-page-phase-design.md`.
- Search-only may locate sanitized candidates only.
- Instrument verification may compare sanitized candidate identity only.
- Instrument-page phase may identify a non-order instrument page only.
- Do not open order pages, click buy/sell, fill forms, read account data, or
  store sensitive context.
- Return sanitized diagnostics only.

### Phase 6 - Watched Browser Fill/Review/Readback

- Run in dev/staging only.
- User watches the browser.
- Fill/review/readback only.
- Stop at confirmation modal.
- No final confirmation.

### Phase 7 - Repeated Dry-Runs

- Repeat buy and sell.
- Repeat multiple tickers.
- Repeat market/currency differences.
- Repeat validation/failure states.
- Keep all runs dry-run only.

No phase progresses to submit. Final confirmation belongs to a separate future design.

## UI Behavior When Runner Eventually Exists

When a future runner exists, the handoff modal may show:

- `Runner available`
- `Dry-run only`
- `No broker submission`
- `Stop at confirmation modal`
- `Manual final confirmation required`

If a start button is ever added, it must be:

- dev-gated
- user-triggered only
- labeled `Start Avanza dry-run`
- never labeled `Trade`, `Execute`, or `Submit`
- placed near persistent no-submit warnings
- disabled unless all readiness gates pass

The modal must keep the no-submit warning visible before, during, and after the dry-run.

## Security And Privacy Notes

The future runner must:

- store no credentials
- store no account balances
- store no holdings
- persist no Avanza browser storage
- avoid raw DOM dumps
- avoid unsanitized screenshots
- sanitize any screenshot or recording before docs
- keep diagnostics local by default
- keep Avanza data separate from broker results and execution records
- never send Avanza observations to Supabase without a separate persistence design

The local bridge/agent process should be treated as semi-trusted. Real broker confirmation trust must require a separate server-side capture design and must not be inferred from dry-run diagnostics.

## Explicit Out Of Scope

Out of scope for the first dry-run runner:

- automatic trading
- final confirmation click
- keyboard submit
- broker result capture
- order status polling
- broker confirmation persistence
- Supabase persistence
- live trade mutation
- History/Statistics integration
- account scraping
- credential handling
- Avanza production rollout

## Recommended Next Action

Recommended:

- Action 292 - Advanced Form Fill UI Preview

The preferred path should still be non-executing preview/contract work. It
should not add Avanza automation, selectors, URLs, browser execution,
order-page/run/start controls, runtime form fills, review clicks,
final-confirm clicks, broker results, Supabase writes, or trade mutation.

## Action 287 - Order Page Open Bridge Stub Integration

Action 287 added `POST /order-page-open` to the localhost bridge as a
non-executing stub. It returns synthetic
`AvanzaOrderPageOpenResult`-compatible metadata for explicit modes covering
opened buy/sell, wrong action, ticker/currency mismatch, prohibited prefill,
final-confirm block, review/`Granska` attempt block, keyboard-submit block,
sensitive-data block, instrument-page-not-ready, and missing identity. The
smoke matrix and client normalization tests assert no browser actions, no
Avanza page touched, no Avanza URLs/selectors, no form fill, no review click,
no final-confirm click, no broker result, no Supabase write, and no trade
mutation.

## Action 288 - Order Page Open UI Preview

Action 288 added a dev-gated, read-only `Order page open preview` panel to the
Execution Handoff Preview Modal. It can call the localhost `/order-page-open`
stub for the current dry-run request and latest identified instrument-page
result when available. The panel displays opened, wrong-action, mismatch,
blocked, field-check, risk-flag, blocker, warning, and safety metadata. It also
adds informational readiness rows for order-page-open status, opened state,
wrong action, mismatch, no form fill, and no `Granska`/`Bekrafta`.

The preview remains stub-only. It does not control a browser, touch Avanza, open
a real order page, fill forms, click `Granska`, click `Bekrafta`, submit
orders, create broker results, write Supabase, or mutate trades.

## Action 289 - Advanced Form Fill Phase Design

Action 289 added `docs/avanza-advanced-form-fill-phase-design.md`, a
documentation-only design for the future phase after `order_page_opened`. It
defines a narrow Advanced order form-fill scope: allowed quantity/`antal` and
price/course/`kurs` field population plus verification only. It defines planned
inputs, statuses, field policy, Advanced-mode policy, verification policy, safe
action requirements, hard stops, privacy rules, UI behavior, a test plan, and
graduation criteria toward a later review-click design.

The design explicitly forbids `Granska`, `Bekrafta`, keyboard submit,
unsupported order modes, account changes without a future explicit policy,
broker results, Supabase writes, History/Statistics updates, and trade
mutation. No code behavior, browser control, Avanza selectors/URLs, form-fill
runtime, review click, final-confirm click, broker result, Supabase write, or
trade mutation was added.

## Action 290 - Advanced Form Fill Result Contract

Action 290 added `lib/avanza-advanced-form-fill-contract.ts`, a pure
TypeScript result contract for future Advanced form-fill diagnostics. It
evaluates a valid dry-run request, an `order_page_opened` result, and sanitized
form state. It can return unavailable, order-page-not-ready, unsupported-mode,
form-filled, field-mismatch, validation-error, prohibited-review,
prohibited-final-confirm, blocked, or failed states.

The contract covers matching Advanced quantity/price readback, Stop
Loss/Glidande blocking, action/ticker/quantity/price mismatch handling,
validation errors, review click attempts, final-confirm visibility/attempts,
keyboard submit, account changes, unsupported field touches, and
account/balance/holdings/sensitive signals. It adds no browser control, Avanza
selectors/URLs, form-fill runtime, review click, final-confirm click, broker
result, Supabase write, or trade mutation.

## Action 291 - Advanced Form Fill Bridge Stub Integration

Action 291 added `POST /advanced-form-fill` to the localhost bridge as a
non-executing stub. It accepts a validated dry-run order input plus optional
`order_page_opened` result and sanitized form state, then returns synthetic
`AvanzaAdvancedFormFillResult`-compatible metadata. Explicit local modes cover
synthetic buy/sell form-filled states, quantity/price/ticker mismatch,
validation error, unsupported Stop Loss/Glidande modes, prohibited `Granska`
and final-confirm detections, keyboard submit, account-change/sensitive-data
blocks, order-page-not-ready, and missing form state.

The client helper `checkLocalhostBridgeAdvancedFormFill(...)` can build, post,
timeout, normalize, and summarize the stub response. The smoke matrix and
client tests assert no browser actions, no Avanza page touched, no real form
fields filled, no `Granska`, no `Bekrafta`, no broker result, no Supabase
write, and no trade mutation.

## Action 292 - Advanced Form Fill UI Preview

Action 292 added a dev-gated, read-only `Advanced form-fill preview` panel to
the Execution Handoff Preview Modal. The panel button is `Check Advanced
form-fill stub`; it calls only the localhost `/advanced-form-fill` stub for the
current dry-run request and latest `order_page_opened` result when available.
It displays summary/status, expected action/quantity/price, sanitized form
state, field checks, risk flags, blockers/errors/warnings, safety labels, and
no-action metadata.

The readiness panel now includes informational Advanced form-fill rows for
status, filled state, field mismatch, validation error, no `Granska`/`Bekrafta`,
and no order submission. `form_filled` only means ready for a future
review-click design; it does not enable review clicks or broker submission. The
UI adds no Avanza run/start/fill/review/order button, browser control, Avanza
selectors/URLs, real form fill, `Granska`, `Bekrafta`, broker result, Supabase
write, or trade mutation.

## Action 293 - Review Click Phase Design

Action 293 added `docs/avanza-review-click-phase-design.md`, a
documentation-only design for the future phase after verified Advanced
form-fill. It defines review-click as a future separately approved `Granska`
click plus confirmation-modal readback only, followed by a stop at
`waiting_for_manual_confirmation`.

The design keeps final confirmation as a hard boundary: no `Bekrafta`, no
keyboard submit, no broker result, no Supabase write, and no trade mutation. It
also defines planned statuses, confirmation readback verification, safe-action
requirements, hard stops, privacy rules, UI behavior, test plan, and recommends
Action 294 - Avanza Review Click Result Contract as pure TypeScript only.

## Action 294 - Review Click Result Contract

Action 294 added `lib/avanza-review-click-contract.ts`, a pure TypeScript
contract for future review-click and confirmation-modal readback diagnostics.
It consumes a valid dry-run request, a `form_filled` Advanced form result, and
sanitized confirmation modal readback. It can report unavailable,
form-not-ready, confirmation-ready, mismatch, validation-error,
prohibited-final-confirm, blocked, and failed states.

The contract treats final-confirm visibility as read-only warning/risk evidence
by default and blocks final-confirm click attempts, keyboard submit, and
sensitive account/balance/holding signals. A successful `confirmation_ready`
result sets `waitingForManualConfirmation: true` and still means no order was
submitted, no broker result was created, no Supabase write occurred, and no
trade state changed. No browser control, Avanza URLs/selectors, `Granska`
runtime, or `Bekrafta` behavior was added.

## Action 295 - Review Click Bridge Stub Integration

Action 295 added `POST /review-click` to the localhost bridge as a
non-executing stub for future review-click and confirmation-modal readback
diagnostics. It accepts a validated dry-run order input plus optional
`form_filled` Advanced result and sanitized confirmation readback, then returns
synthetic `AvanzaReviewClickResult`-compatible metadata from explicit local
stub modes.

The stub modes cover synthetic buy/sell confirmation-ready states,
quantity/price mismatch, validation error, final-confirm-visible read-only
warning, final-confirm-click blocking, keyboard-submit blocking,
sensitive-data blocking, missing modal, review-label mismatch, and form-not
ready states. The bridge smoke matrix and client tests assert no browser
actions, no Avanza page touched, no real `Granska`, no `Bekrafta`, no broker
result, no Supabase write, and no trade mutation.

## Action 296 - Review Click UI Preview

Action 296 added a dev-gated, read-only `Review click preview` section to the
Execution Handoff Preview Modal. The section uses the current validated dry-run
request and, when available, the latest `form_filled` Advanced result to call
only the localhost `/review-click` stub via `Check review-click stub`.

The modal displays synthetic confirmation readiness, mismatch, validation,
final-confirm-blocked, keyboard-submit-blocked, and sensitive-data-blocked
states. The readiness panel now includes informational rows for review-click
status, confirmation readiness, confirmation mismatch, waiting for manual
confirmation, no `Bekrafta`, and no broker result.

This remains a UI preview of a localhost stub. It adds no Avanza runner,
browser control, URLs/selectors, real `Granska`, `Bekrafta`, broker result,
Supabase write, execution record, or trade mutation.

## Action 297 - Manual Confirmation Wait Phase Design

Action 297 added
`docs/avanza-manual-confirmation-wait-phase-design.md`, a documentation-only
design for the phase after `confirmation_ready`. It defines
`waiting_for_manual_confirmation` as a human-authority boundary: the agent may
display sanitized wait state and stop, but it must not click `Bekrafta kop`,
click `Bekrafta salj`, keyboard-submit, create broker results, write Supabase,
or mutate trades.

The design introduces planned statuses such as `confirmation_not_ready`,
`waiting_for_manual_confirmation`, `user_cancelled`,
`user_confirmed_unverified`, `timed_out`, `blocked`, and `failed`.
`user_confirmed_unverified` is not a broker result; broker confirmation capture
remains a separate future phase requiring explicit approval.

## Action 298 - Manual Confirmation Wait Result Contract

Action 298 added `lib/avanza-manual-confirmation-wait-contract.ts`, a pure
TypeScript result contract for the future wait phase after
`confirmation_ready`. It evaluates sanitized wait observations and can return
`confirmation_not_ready`, `waiting_for_manual_confirmation`,
`user_cancelled`, `user_confirmed_unverified`, `timed_out`, `blocked`, and
failed-style states.

The contract keeps final-confirm visibility read-only by default, blocks agent
final-confirm attempts, blocks keyboard submit, blocks unexpected broker
results/trade mutations, blocks sensitive account/balance/holding signals, and
marks `user_confirmed_unverified` as explicitly separate from broker-result
capture. No browser control, Avanza URLs/selectors, `Bekrafta`, order
submission, broker result, Supabase write, or trade mutation was added.

## Action 299 - Manual Confirmation Wait Bridge Stub Integration

Action 299 added `POST /manual-confirmation-wait` to the localhost bridge as a
non-executing stub for future manual confirmation wait diagnostics. It accepts
an optional review-click result, sanitized observation, timeout, and metadata,
then returns synthetic `AvanzaManualConfirmationWaitResult`-compatible
metadata from explicit local stub modes.

The client helper `checkLocalhostBridgeManualConfirmationWait(...)` safely
builds/calls/normalizes the endpoint and
`summarizeLocalhostManualConfirmationWaitBridgeResponse(...)` summarizes the
stub response while reiterating that no browser actions, Avanza touch,
`Bekrafta`, broker result, Supabase write, or trade mutation occurred.

The bridge smoke matrix now covers default unavailable, malformed request,
invalid JSON, waiting, user-cancelled, user-confirmed-unverified, timed-out,
final-confirm-visible-read-only, final-confirm-attempt, keyboard-submit,
unexpected broker-result, unexpected trade-mutation, sensitive-data, and
confirmation-not-ready states.

This action still added no Avanza automation, selectors, URLs, browser
control, run/start/confirm button, order submission, broker result, Supabase
write, or trade mutation.

## Action 300 - Broker Confirmation Capture Phase Design

Action 300 added
`docs/avanza-broker-confirmation-capture-phase-design.md`, a documentation-only
design for the future phase after a human manual final confirmation. It
separates broker confirmation capture from the final click, manual wait,
`BrokerExecutionResult` conversion, execution records, Supabase persistence,
History/Statistics integration, and live trade mutation.

The design allows only future sanitized receipt/confirmation evidence
readback, validation against the original dry-run request, and capture-result
diagnostics. It explicitly forbids `Bekrafta` clicks, order submission,
execution inference without receipt evidence, direct broker result creation,
direct Supabase writes, and trade mutation.

Recommended next action: `Action 301 - Broker Confirmation Capture Result
Contract`, still pure TypeScript only.

## Action 301 - Broker Confirmation Capture Result Contract

Action 301 added `lib/avanza-broker-confirmation-capture-contract.ts`, a pure
TypeScript contract for future sanitized broker confirmation/receipt capture
results after a `user_confirmed_unverified` manual wait state.

The contract compares the original dry-run request with sanitized broker
confirmation readback and returns capture-only statuses such as
`manual_confirmation_not_observed`, `confirmation_page_not_found`,
`confirmation_captured`, `confirmation_partial`, `confirmation_mismatch`,
`confirmation_rejected_or_cancelled`, `blocked`, and `failed`.

It explicitly separates placed/accepted orders from filled execution, blocks
sensitive/raw evidence signals, blocks broker-result creation attempts, blocks
trade-mutation attempts, and labels every result with no `BrokerExecutionResult`,
no execution record, no Supabase write, and no trade mutation.

## Action 302 - Broker Confirmation Capture Bridge Stub Integration

Action 302 added `POST /broker-confirmation-capture` to the localhost bridge
as a non-executing stub for future sanitized broker confirmation capture
diagnostics. It accepts a validated dry-run order input, optional
manual-confirmation-wait result, optional sanitized broker confirmation
readback, and metadata, then returns synthetic
`AvanzaBrokerConfirmationCaptureResult`-compatible metadata from explicit
local stub modes.

The client helper `checkLocalhostBridgeBrokerConfirmationCapture(...)` safely
builds/calls/normalizes the endpoint and
`summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(...)` summarizes
the stub response while reiterating that no browser actions, Avanza touch,
`Bekrafta`, `BrokerExecutionResult`, execution record, Supabase write, or
trade mutation occurred.

The bridge smoke matrix covers default unavailable, missing input, invalid
JSON, filled buy/sell capture, placed/accepted/partial-style statuses,
quantity/price mismatch, rejected/cancelled/expired-style status, sensitive
or raw evidence block, broker-result-attempt block, trade-mutation-attempt
block, manual-confirmation-not-observed, and confirmation-page-not-found
states.

This action still added no Avanza automation, selectors, URLs, browser
control, run/start/confirm button, order submission, `BrokerExecutionResult`,
execution record, Supabase write, or trade mutation.

## Action 303 - Broker Confirmation Capture UI Preview

Action 303 added a dev-gated, read-only Broker Confirmation Capture preview to
the Execution Handoff Preview Modal. It calls the localhost
`/broker-confirmation-capture` stub with the current dry-run request and
displays normalized captured, partial, mismatch, rejected/cancelled, and blocked
states.

The preview also adds informational readiness rows for broker confirmation
capture status, captured/partial/mismatch/rejected state, and safety guarantees.
Captured status only says the flow is ready for a future
`BrokerExecutionResult` conversion design. It does not create a
`BrokerExecutionResult`, execution record, Supabase write, History/Statistics
update, or trade mutation.

No Avanza automation, Avanza selectors, Avanza URLs, browser control,
`Bekrafta`, order submission, broker capture runner, conversion, persistence, or
trade mutation was added.

## Action 304 - BrokerExecutionResult Conversion Boundary Design

Action 304 added
`docs/avanza-broker-execution-result-conversion-boundary-design.md`, a
documentation-only design for the future boundary between sanitized broker
confirmation capture and `BrokerExecutionResult` conversion.

The design requires conversion to remain explicit, gated, idempotent, and
validated. It allows future conversion only for filled/executed
`confirmation_captured` evidence with matching action, instrument, quantity,
price, timestamp/reference evidence, no mismatch flags, no sensitive/raw-data
flags, no broker-result-creation attempt, no trade-mutation attempt, a future
conversion flag, and explicit approval.

It blocks partial, mismatch, rejected/cancelled, placed/accepted without fill,
missing core evidence, raw/sensitive evidence, `user_confirmed_unverified` only,
automatic-final-confirm suspicion, direct trade mutation, and Supabase writes
without separate persistence approval.

No conversion code, `BrokerExecutionResult`, execution record, Supabase write,
Avanza automation, selectors, URLs, browser control, or trade mutation was
added.

## Actions 305-307 - Eligibility Contract, Bridge Stub, And UI Preview

Actions 305-307 added the pure `BrokerExecutionResult` eligibility contract,
localhost `/broker-execution-result-eligibility` stub, client helper, smoke/e2e
coverage, and dev-gated read-only Handoff Modal eligibility preview.

This lets Ture inspect whether sanitized broker-confirmation capture evidence
would be eligible for future conversion, including partial-only,
duplicate-risk, blocked, and failed states. It still creates no
`BrokerExecutionResult`, execution record, Supabase write, History/Statistics
update, trade mutation, Avanza automation, selectors, URLs, browser control, or
order submission.

## Action 308 - BrokerExecutionResult Conversion Mapping Design

Action 308 added
[`docs/avanza-broker-execution-result-conversion-mapping-design.md`](avanza-broker-execution-result-conversion-mapping-design.md),
a documentation-only mapping design for future eligible filled evidence. It
defines source requirements, target `BrokerExecutionResult`-shaped fields,
field mapping rules, status mapping, currency/fees policy, idempotency, UI
expectations, and future pure-contract tests.

This is still design-only. It does not implement conversion, create a
`BrokerExecutionResult`, create execution records, write Supabase, mutate
trades, control a browser, touch Avanza, or submit orders.
