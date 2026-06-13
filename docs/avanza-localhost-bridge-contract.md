# Avanza Localhost Bridge Contract

Date: 2026-06-09

## Purpose

This document defines the first localhost bridge server contract for a future external Avanza execution agent.

The contract describes how Ture will communicate with a local process bridge. It does not implement browser automation, Avanza page interaction, broker execution, broker confirmation, Supabase write, or trade-state mutation.

The matching TypeScript contract lives in `lib/avanza-localhost-bridge-contract.ts`.

## Current Status

Status: contract plus local no-op/echo server stub.

Current bridge/runtime behavior remains diagnostics-only:

- `none`: no-op bridge, unavailable, no broker effects.
- `echo`: dev-only bridge, local protocol test only, no broker effects.

A manually started localhost bridge server stub exists at `scripts/avanza-localhost-bridge-server.mjs`. It is not started by the Next.js app. Ture can call it only through explicit dev-only health, dry-run, and cancel diagnostics.

Settings can perform an explicit dev-only health check against `GET /health`.
The Execution Handoff Preview Modal can perform an explicit dev-only dry-run
echo request against `POST /run` and an explicit dev-only cancel contract test
against `POST /cancel`. It also has a separate explicit dev-only `Run localhost
mock agent` button that calls `POST /run` with `enableMockAgentRun: true`.
The modal can also manually call `GET /self-check` to read runner-readiness
metadata. The self-check endpoint does not open a browser, touch Avanza, fill
forms, submit orders, create broker results, write Supabase, or mutate trades.
Action 263 added `POST /dry-run` as a bridge contract stub for a future Avanza
dry-run runner. It validates an `AvanzaDryRunOrderInput`-like payload and
capability gates, then returns `not_implemented` or `blocked`; it does not
control a browser and is not wired to any UI run button.

Action 264 added a frontend-safe client helper for `POST /dry-run`. The helper
can build, call, timeout, normalize, and summarize stub responses, but it is not
wired to any modal run/start control.

Action 265 added a dev-gated, read-only `Dry-run bridge response preview` panel
to the Execution Handoff Preview Modal. It can manually call the localhost
`/dry-run` stub for the current validated dry-run request and display the
normalized response. This is not an Avanza run/start control.

Action 271 added `GET /session-detection` as a localhost bridge stub for future
Avanza-adjacent session detection. The endpoint returns
`AvanzaSessionDetectionResult`-compatible metadata from explicit stub modes
only. It does not connect to a browser, navigate, click, read Avanza DOM,
collect account data, submit orders, create broker results, write Supabase, or
mutate trades.

Action 272 added a dev-gated, read-only `Session-detection preview` panel to
the Execution Handoff Preview Modal. It can manually call `GET
/session-detection`, display the normalized status/summary/sanitized context,
and add informational readiness rows. It does not control a browser and does
not enable a search, dry-run, or Avanza run/start button.

Action 275 added `POST /search-only` as a localhost bridge stub for future
search-only candidate classification. The endpoint accepts an expected
instrument, returns synthetic `AvanzaSearchOnlyResult`-compatible metadata from
explicit stub modes, and never controls a browser, touches Avanza, opens an
order page, clicks buy/sell, submits orders, creates broker results, writes
Supabase, or mutates trades.

Action 276 added a dev-gated, read-only `Search-only preview` panel to the
Execution Handoff Preview Modal. It can manually call `POST /search-only` for
the current dry-run request instrument and display exact, ambiguous, no-match,
or blocked stub responses. This is not a search/run/start control and it still
does not control a browser, touch Avanza, open an order page, click buy/sell,
submit orders, create broker results, write Supabase, or mutate trades.

Action 279 added `POST /instrument-verification` as a localhost bridge stub for
future instrument identity verification after search-only. The endpoint accepts
an expected instrument plus optional search-only result/candidate input, returns
synthetic `AvanzaInstrumentVerificationResult`-compatible metadata from
explicit stub modes, and never controls a browser, touches Avanza, opens an
order page, clicks buy/sell, fills forms, submits orders, creates broker
results, writes Supabase, or mutates trades.

Action 283 added `POST /instrument-page` as a localhost bridge stub for future
non-order instrument-page identity checks. The endpoint accepts an expected
instrument plus optional verified instrument result and sanitized page identity,
returns synthetic `AvanzaInstrumentPageResult`-compatible metadata from
explicit stub modes, and never controls a browser, touches Avanza, opens an
order page, clicks buy/sell, fills forms, submits orders, creates broker
results, writes Supabase, or mutates trades.

Action 284 added a dev-gated, read-only `Instrument page preview` panel in the
Execution Handoff Preview Modal. It can manually call the localhost
`/instrument-page` stub and display normalized response diagnostics, but it is
not a runner and does not add browser control, Avanza URLs/selectors,
order-page opening, buy/sell clicks, form fills, broker results, Supabase
writes, or trade mutation.

Action 287 added `POST /order-page-open` as a localhost bridge stub for future
order-page-open diagnostics. The endpoint accepts a validated dry-run order
input plus optional instrument-page result, sanitized order-page identity, and
attempted action. It returns synthetic `AvanzaOrderPageOpenResult`-compatible
metadata from explicit stub modes. It does not control a browser, touch Avanza,
add URLs/selectors, fill forms, click `Granska`, click `Bekrafta`, submit
orders, create broker results, write Supabase, or mutate trades.

Action 291 added `POST /advanced-form-fill` as a localhost bridge stub for
future Advanced form-fill diagnostics. The endpoint accepts a validated
dry-run order input plus optional order-page-open result and sanitized form
state. It returns synthetic `AvanzaAdvancedFormFillResult`-compatible metadata
from explicit stub modes. It does not control a browser, touch Avanza, add
URLs/selectors, fill real form fields, click `Granska`, click `Bekrafta`,
submit orders, create broker results, write Supabase, or mutate trades.

Action 292 added a dev-gated, read-only `Advanced form-fill preview` panel in
the Execution Handoff Preview Modal. The button is labeled `Check Advanced
form-fill stub`; it is not a fill/run/review/order button. The panel displays
the normalized `/advanced-form-fill` stub response and readiness rows for
filled/mismatch/validation/prohibited states while preserving the same no
browser action, no Avanza touch, no real form fill, no `Granska`, no
`Bekrafta`, no broker result, no Supabase write, and no trade mutation
boundary.

Action 295 added `POST /review-click` as a localhost bridge stub for future
review-click and confirmation-modal readback diagnostics. The endpoint accepts
a validated dry-run order input plus optional Advanced form-fill result,
sanitized confirmation readback, review-label metadata, and review-click
attempt diagnostics. It returns synthetic `AvanzaReviewClickResult`-compatible
metadata from explicit stub modes. It does not control a browser, touch Avanza,
add URLs/selectors, perform real `Granska`, click `Bekrafta`, submit orders,
create broker results, write Supabase, or mutate trades.

Action 299 added `POST /manual-confirmation-wait` as a localhost bridge stub
for the future human-authority wait phase after a `confirmation_ready`
review-click result. The endpoint accepts an optional review-click result,
sanitized wait observation, timeout, and metadata, then returns synthetic
`AvanzaManualConfirmationWaitResult`-compatible metadata from explicit stub
modes. It does not control a browser, touch Avanza, add URLs/selectors, click
`Bekrafta`, keyboard-submit, submit orders, create broker results, write
Supabase, or mutate trades.

Action 302 added `POST /broker-confirmation-capture` as a localhost bridge
stub for future sanitized broker confirmation/receipt capture after a human
manual final confirmation. The endpoint accepts a validated dry-run order
input plus optional manual-confirmation-wait result and sanitized broker
confirmation readback. It returns synthetic
`AvanzaBrokerConfirmationCaptureResult`-compatible metadata from explicit stub
modes. It does not control a browser, touch Avanza, add URLs/selectors, click
`Bekrafta`, submit orders, create `BrokerExecutionResult`, create execution
records, write Supabase, or mutate trades.

Action 306 added `POST /broker-execution-result-eligibility` as a localhost
bridge stub for future conversion eligibility diagnostics. The endpoint accepts
optional broker-confirmation capture evidence, existing sanitized fingerprints,
and eligibility options, then returns synthetic
`AvanzaBrokerExecutionResultEligibilityResult`-compatible metadata from
explicit stub modes. It performs eligibility checks only. It does not create
`BrokerExecutionResult`, create execution records, write Supabase, mutate
trades, control a browser, or touch Avanza.

Action 307 added a dev-gated, read-only Handoff Modal preview for this endpoint.
The button is labeled `Check BrokerExecutionResult eligibility stub` and only
calls the localhost stub for normalized eligibility metadata. It displays
eligible, partial-only, blocked/not-eligible, duplicate-risk, and failed states
plus the sanitized evidence fingerprint and safety labels. It does not convert
anything, create a `BrokerExecutionResult`, create an execution record, write
Supabase, mutate trades, control a browser, or touch Avanza.

Action 310 added `POST /broker-execution-result-preview` as a localhost bridge
stub for future preview-only conversion diagnostics. The endpoint accepts
optional broker-confirmation capture evidence, eligibility metadata, sanitized
existing fingerprints, and preview options, then returns synthetic
`AvanzaBrokerExecutionResultPreviewResult`-compatible metadata from explicit
stub modes. It may return a `BrokerExecutionResult`-shaped preview object only
when the synthetic evidence is eligible and filled, and that object is marked
`previewOnly` and `notBrokerExecutionResult`. It does not create a real
`BrokerExecutionResult`, create execution records, write Supabase, mutate
trades, control a browser, touch Avanza, add selectors/URLs, or submit orders.

Action 311 added a dev-gated, read-only `BrokerExecutionResult conversion
preview` panel to the Execution Handoff Preview Modal. The button is labeled
`Check BrokerExecutionResult preview stub`; it calls only the localhost
preview stub, displays preview-available, missing-optional warning,
partial-only, blocked, duplicate-risk, not-eligible, and failed states, and
renders the `BrokerExecutionResult`-shaped preview data only when the response
is explicitly preview-available. The panel does not create a real
`BrokerExecutionResult`, create an execution record, write Supabase, mutate
trades, control a browser, touch Avanza, add selectors/URLs, or submit orders.

A separate dev-only mock order ticket exists at `/mock-broker/order`. It is not
Avanza and cannot submit or capture orders. Its selector/fill-plan contract
lives in `lib/mock-order-page-agent-contract.ts`. The localhost bridge dry-run
`/run` response can now include a mock order fill plan and relative mock page
URL for local testing only.

By default, the bridge still does not open a browser, fill the page, submit an
order, or create a broker result. For local QA only, `/run` can optionally carry
`enableMockAgentRun: true` and a localhost `mockPageBaseUrl`. That explicit
mode imports the manual mock-page runner, opens only localhost
`/mock-broker/order`, fills the mock ticket from the generated fill plan, clicks
only `Review mock order`, and verifies the disabled final submit remains
disabled. It never opens Avanza and never creates `brokerResult`.

## Constants

Contract version:

```text
avanza_localhost_bridge_v1
```

Default port:

```text
47831
```

Default base URL:

```text
http://127.0.0.1:47831
```

Endpoint paths:

```text
GET  /health
GET  /self-check
GET  /session-detection
POST /search-only
POST /instrument-verification
POST /instrument-page
POST /order-page-open
POST /advanced-form-fill
POST /review-click
POST /manual-confirmation-wait
POST /broker-confirmation-capture
POST /broker-execution-result-eligibility
POST /broker-execution-result-preview
POST /dry-run
POST /run
POST /cancel
GET  /events/:requestId
WS   /events
```

`GET /events/:requestId` is reserved for future polling or server-sent-event style progress. `WS /events` is reserved for future websocket progress. Neither transport is implemented yet.

## Local Stub Server

Run the stub manually:

```bash
npm run bridge:localhost
```

By default it binds to `127.0.0.1:47831`. Override the port for local testing:

```bash
AVANZA_LOCALHOST_BRIDGE_PORT=47832 npm run bridge:localhost
```

Run the local smoke check:

```bash
npm run bridge:localhost:smoke
```

The smoke check starts local bridge instances on test ports and prints a compact
matrix. Restricted sandboxes may require permission to bind localhost ports.

Smoke matrix:

| Mode | Endpoint | Expected result | Safety checks |
| --- | --- | --- | --- |
| default | `/health` | `available` | no real broker automation |
| default | `/self-check` | `unavailable` | no Avanza dry-run capability, no broker submission |
| default | `/session-detection` | `unavailable` | stub only, no browser actions, no Avanza page touched |
| default | `/search-only` valid request | `search_not_available` | stub only, no browser actions, no Avanza page touched, no order page |
| default | `/search-only` missing expected instrument | `failed` | malformed contract blocked without server crash |
| default | `/search-only` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/instrument-verification` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no order page |
| default | `/instrument-verification` missing expected instrument | `failed` | malformed contract blocked without server crash |
| default | `/instrument-verification` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/instrument-page` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no order page |
| default | `/instrument-page` missing expected instrument | `failed` | malformed contract blocked without server crash |
| default | `/instrument-page` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/order-page-open` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no form fill |
| default | `/order-page-open` missing `dryRunOrderInput` | `failed` | malformed contract blocked without server crash |
| default | `/order-page-open` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/advanced-form-fill` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no real form fill |
| default | `/advanced-form-fill` missing `dryRunOrderInput` | `failed` | malformed contract blocked without server crash |
| default | `/advanced-form-fill` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/review-click` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no real `Granska` |
| default | `/review-click` missing `dryRunOrderInput` | `failed` | malformed contract blocked without server crash |
| default | `/review-click` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/manual-confirmation-wait` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no `Bekrafta` |
| default | `/manual-confirmation-wait` missing `requestId` | `failed` | malformed contract blocked without server crash |
| default | `/manual-confirmation-wait` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/broker-confirmation-capture` valid request | `unavailable` | stub only, no browser actions, no Avanza page touched, no `BrokerExecutionResult` |
| default | `/broker-confirmation-capture` missing `dryRunOrderInput` | `failed` | malformed contract blocked without server crash |
| default | `/broker-confirmation-capture` invalid JSON | `failed` | parse failure stays 4xx-safe |
| default | `/broker-execution-result-eligibility` valid request | `not_eligible` | eligibility check only, no `BrokerExecutionResult`, no execution record |
| default | `/broker-execution-result-eligibility` invalid JSON | `failed` | parse failure stays 4xx-safe, no `BrokerExecutionResult` |
| default | `/broker-execution-result-preview` valid request | `not_eligible` | preview-only conversion stub, no real `BrokerExecutionResult`, no execution record |
| default | `/broker-execution-result-preview` invalid JSON | `failed` | parse failure stays 4xx-safe, no real `BrokerExecutionResult` |
| default | `/dry-run` valid request | `not_implemented` | no `brokerResult`, no executed diagnostics, no browser actions |
| default | `/dry-run` unsafe request | `blocked` | broker-submission/final-confirm metadata blocked |
| default | `/dry-run` missing `dryRunOrderInput` | `blocked` | malformed contract blocked without server crash |
| default | `/dry-run` invalid JSON | `blocked` | parse failure stays 4xx-safe |
| `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=mock_only` | `/self-check` | `available_mock_only` | mock diagnostics only, not Avanza dry-run capable |
| `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=mock_only` | `/dry-run` valid request | `not_implemented` | mock-only mode does not run Avanza dry-run |
| `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton` | `/self-check` | `available_dry_run_only` | skeleton-only, no browser control, no broker submission |
| `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton` | `/dry-run` valid request | `accepted_stub` | no browser actions, no `brokerResult`, no broker submission |
| `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton` | `/dry-run` unsafe request | `blocked` | unsafe request blocked before skeleton acceptance |
| `AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE=ready_for_search_only` | `/session-detection` | `ready_for_search_only` | synthetic ready state only, no browser actions, no Avanza page touched |
| `AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE=login_required` | `/session-detection` | `login_required` | synthetic login-required state only, no browser actions, no Avanza page touched |
| `AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE=blocked_sensitive` | `/session-detection` | `blocked` | sensitive-data block, no browser actions, no Avanza page touched |
| `AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE=exact_match` | `/search-only` | `exact_match` | synthetic candidate only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE=ambiguous` | `/search-only` | `ambiguous` | synthetic duplicate-ticker ambiguity only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE=no_match` | `/search-only` | `no_match` | synthetic no-match only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE=blocked_sensitive` | `/search-only` | `blocked` | sensitive-data block, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE=blocked_order_flow` | `/search-only` | `blocked` | order-flow block, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE=verified` | `/instrument-verification` | `verified` | synthetic identity verification only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE=rejected_ticker` | `/instrument-verification` | `rejected` | synthetic ticker mismatch only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE=ambiguous_missing_currency` | `/instrument-verification` | `ambiguous` | synthetic missing currency only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE=blocked_order_flow` | `/instrument-verification` | `blocked` | order-flow block, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=page_identified` | `/instrument-page` | `page_identified` | synthetic page identity only, no browser actions, no order page |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=page_identified_with_buy_sell_visible` | `/instrument-page` | `page_identified` with warnings | buy/sell controls are warning metadata only, no clicks |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=page_mismatch_ticker` | `/instrument-page` | `page_mismatch` | synthetic page mismatch only, no browser actions |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=blocked_order_page` | `/instrument-page` | `blocked` | order-page block, no browser actions, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=blocked_final_confirm` | `/instrument-page` | `blocked` | final-confirm block, no browser actions, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=blocked_sensitive` | `/instrument-page` | `blocked` | sensitive-data block, no browser actions, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=order_page_opened_buy` | `/order-page-open` | `order_page_opened` | synthetic buy order-page identity only, no form fill, no review/final click |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=order_page_opened_sell` | `/order-page-open` | `order_page_opened` | synthetic sell order-page identity only, no form fill, no review/final click |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=wrong_action_opened` | `/order-page-open` | `wrong_action_opened` | synthetic wrong-action block, no browser actions |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=order_page_mismatch_ticker` | `/order-page-open` | `order_page_mismatch` | synthetic ticker mismatch only, no form fill |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=order_page_mismatch_currency` | `/order-page-open` | `order_page_mismatch` | synthetic currency mismatch only, no form fill |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=prohibited_form_prefilled` | `/order-page-open` | `prohibited_form_interaction_detected` | prefilled form hard-stop, no review/final click |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=blocked_final_confirm` | `/order-page-open` | `blocked` | final-confirm guard block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=blocked_review_click_attempt` | `/order-page-open` | `blocked` | review/Granska attempt block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=blocked_keyboard_submit` | `/order-page-open` | `blocked` | keyboard submit block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=blocked_sensitive` | `/order-page-open` | `blocked` | sensitive-data block, no browser actions |
| `AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=instrument_page_not_ready` | `/order-page-open` | `instrument_page_not_ready` | instrument-page precondition block |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=form_filled_buy` | `/advanced-form-fill` | `form_filled` | synthetic buy form-fill result only, no real form fill, no review/final click |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=form_filled_sell` | `/advanced-form-fill` | `form_filled` | synthetic sell form-fill result only, no real form fill, no review/final click |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=field_mismatch_quantity` | `/advanced-form-fill` | `field_mismatch` | synthetic quantity mismatch only, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=field_mismatch_price` | `/advanced-form-fill` | `field_mismatch` | synthetic price mismatch only, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=validation_error` | `/advanced-form-fill` | `validation_error` | synthetic validation error only, no review/final click |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=unsupported_order_mode_stop_loss` | `/advanced-form-fill` | `unsupported_order_mode` | Advanced-only guard blocks Stop Loss |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=prohibited_review_detected` | `/advanced-form-fill` | `prohibited_review_detected` | review/Granska guard block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=prohibited_final_confirm_detected` | `/advanced-form-fill` | `prohibited_final_confirm_detected` | final-confirm/Bekrafta guard block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_ADVANCED_FORM_FILL_MODE=blocked_keyboard_submit` | `/advanced-form-fill` | `blocked` | keyboard submit block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=confirmation_ready_buy` | `/review-click` | `confirmation_ready` | synthetic buy confirmation readback only, no real `Granska`/`Bekrafta` |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=confirmation_ready_sell` | `/review-click` | `confirmation_ready` | synthetic sell confirmation readback only, no real `Granska`/`Bekrafta` |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=confirmation_mismatch_quantity` | `/review-click` | `confirmation_mismatch` | synthetic quantity mismatch only, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=confirmation_mismatch_price` | `/review-click` | `confirmation_mismatch` | synthetic price mismatch only, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=validation_error` | `/review-click` | `validation_error` | synthetic validation error only, no final-confirm click |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=final_confirm_visible_read_only` | `/review-click` | `confirmation_ready` | `Bekrafta` visibility is read-only warning metadata only |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=prohibited_final_confirm_detected` | `/review-click` | `prohibited_final_confirm_detected` | final-confirm/Bekrafta click attempt blocked |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=blocked_keyboard_submit` | `/review-click` | `blocked` | keyboard submit block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_REVIEW_CLICK_MODE=blocked_sensitive` | `/review-click` | `blocked` | sensitive-data block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=waiting` | `/manual-confirmation-wait` | `waiting_for_manual_confirmation` | synthetic human wait only, final-confirm visibility is read-only |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=user_cancelled` | `/manual-confirmation-wait` | `user_cancelled` | manual cancellation only, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=user_confirmed_unverified` | `/manual-confirmation-wait` | `user_confirmed_unverified` | human confirmation is not captured as broker result |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=timed_out` | `/manual-confirmation-wait` | `timed_out` | timeout reported, no mutation |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=final_confirm_visible_read_only` | `/manual-confirmation-wait` | `waiting_for_manual_confirmation` | `Bekrafta` visibility is read-only warning metadata only |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=blocked_final_confirm_attempt` | `/manual-confirmation-wait` | `blocked` | agent final-confirm attempt blocked |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=blocked_keyboard_submit` | `/manual-confirmation-wait` | `blocked` | keyboard submit block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=blocked_unexpected_broker_result` | `/manual-confirmation-wait` | `blocked` | unexpected broker result is blocked |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=blocked_trade_mutation` | `/manual-confirmation-wait` | `blocked` | unexpected trade mutation is blocked |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=blocked_sensitive` | `/manual-confirmation-wait` | `blocked` | sensitive-data block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_MANUAL_CONFIRMATION_WAIT_MODE=confirmation_not_ready` | `/manual-confirmation-wait` | `confirmation_not_ready` | review-click prerequisite blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_captured_filled` | `/broker-confirmation-capture` | `confirmation_captured` | synthetic filled capture only, no `BrokerExecutionResult` or execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_partial_placed` | `/broker-confirmation-capture` | `confirmation_partial` | placed/unfilled status reported, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_partial_accepted` | `/broker-confirmation-capture` | `confirmation_partial` | accepted/unfilled status reported, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_partial_partially_filled` | `/broker-confirmation-capture` | `confirmation_partial` | partial fill reported, no trade mutation |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_mismatch_action` | `/broker-confirmation-capture` | `confirmation_mismatch` | action mismatch blocked, no execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_mismatch_ticker` | `/broker-confirmation-capture` | `confirmation_mismatch` | ticker mismatch blocked, no execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_mismatch_quantity` | `/broker-confirmation-capture` | `confirmation_mismatch` | quantity mismatch blocked, no execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_mismatch_price` | `/broker-confirmation-capture` | `confirmation_mismatch` | price mismatch blocked, no execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_rejected` | `/broker-confirmation-capture` | `confirmation_rejected_or_cancelled` | rejected status reported, no `BrokerExecutionResult` |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_cancelled` | `/broker-confirmation-capture` | `confirmation_rejected_or_cancelled` | cancelled status reported, no `BrokerExecutionResult` |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_expired` | `/broker-confirmation-capture` | `confirmation_rejected_or_cancelled` | expired status reported, no `BrokerExecutionResult` |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=blocked_sensitive` | `/broker-confirmation-capture` | `blocked` | sensitive-data block, no broker result |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=blocked_raw_dom` | `/broker-confirmation-capture` | `blocked` | raw/unsanitized evidence blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=blocked_broker_result_attempt` | `/broker-confirmation-capture` | `blocked` | `BrokerExecutionResult` creation attempt blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=blocked_trade_mutation_attempt` | `/broker-confirmation-capture` | `blocked` | trade mutation attempt blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=manual_confirmation_not_observed` | `/broker-confirmation-capture` | `manual_confirmation_not_observed` | human-confirmed prerequisite blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_CONFIRMATION_CAPTURE_MODE=confirmation_page_not_found` | `/broker-confirmation-capture` | `confirmation_page_not_found` | missing confirmation page blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=eligible_filled` | `/broker-execution-result-eligibility` | `eligible` | synthetic filled eligibility only, no `BrokerExecutionResult` |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=partial_placed` | `/broker-execution-result-eligibility` | `partial_only` | placed/unfilled evidence separated from filled execution |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=partial_partially_filled` | `/broker-execution-result-eligibility` | `partial_only` | partial fill requires future design, no execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=blocked_mismatch` | `/broker-execution-result-eligibility` | `blocked` | mismatched capture blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=blocked_missing_price` | `/broker-execution-result-eligibility` | `blocked` | missing price evidence blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=blocked_sensitive` | `/broker-execution-result-eligibility` | `blocked` | sensitive evidence blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=blocked_broker_result_attempt` | `/broker-execution-result-eligibility` | `blocked` | premature `BrokerExecutionResult` creation attempt blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=blocked_trade_mutation_attempt` | `/broker-execution-result-eligibility` | `blocked` | premature trade mutation attempt blocked |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_ELIGIBILITY_MODE=duplicate_risk` | `/broker-execution-result-eligibility` | `duplicate_risk` | duplicate sanitized fingerprint risk reported |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE=preview_available_filled` | `/broker-execution-result-preview` | `preview_available` | synthetic preview-only filled mapping, no real `BrokerExecutionResult` |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE=preview_available_missing_optional` | `/broker-execution-result-preview` | `preview_available` with warnings | optional broker fields warn only, no execution record |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE=partial_only_placed` | `/broker-execution-result-preview` | `partial_only` | placed/unfilled evidence returns no preview object |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE=blocked_mismatch` | `/broker-execution-result-preview` | `blocked` | mismatched evidence blocked, no preview object |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE=blocked_sensitive` | `/broker-execution-result-preview` | `blocked` | sensitive evidence blocked, no preview object |
| `AVANZA_LOCALHOST_BRIDGE_BROKER_EXECUTION_RESULT_PREVIEW_MODE=duplicate_risk` | `/broker-execution-result-preview` | `duplicate_risk` | duplicate sanitized fingerprint risk blocks preview |

The same smoke also sends one valid bridge echo `/run`, confirms the default
path does not attempt the mock-agent runner, sends one explicit mock-agent
`/run` with a non-local mock page base URL to verify safe failure metadata,
sends one invalid `/run`, checks `/cancel`, and verifies no result includes
`brokerResult`.

From Settings, use `Check localhost stub` to verify whether the manually
started stub is reachable. This button performs a health check only and never
sends a run or cancel request.

From the Execution Handoff Preview Modal, use `Check localhost runner
self-check` to call `GET /self-check`. This displays the local runner
self-check status, readiness labels, blockers, and capability classification.
The default stub response reports `selfCheck.status="unavailable"` with the
blocker `No Avanza dry-run runner is installed/available.` The HTTP response
itself uses `ok=true` when the bridge answered the contract successfully; the
nested `selfCheck.ok` remains `false` while no runner exists.

The latest self-check result also feeds the read-only Avanza dry-run readiness
panel. This is display-only: unavailable stays not ready, mock-only is shown as
not Avanza dry-run capable, and future dry-run-only readiness still does not add
any Avanza run/start button.

From the Execution Handoff Preview Modal, use `Test dry-run bridge stub` to call
`POST /dry-run` with the current validated Avanza dry-run request preview. This
button displays `not_implemented` or `blocked` response metadata, request
validation, capability validation, warnings, and no-browser/no-broker safety
metadata. It does not open a browser, navigate to Avanza, submit orders, create
broker results, write Supabase, mutate trades, or change readiness state.

From the Execution Handoff Preview Modal, use `Check session-detection stub` to
call `GET /session-detection`. This displays synthetic session-detection
metadata, labels, blockers, warnings, and sanitized context. It is read-only and
does not enable search-only, dry-run, browser control, Avanza navigation, order
submission, broker results, Supabase writes, or trade mutation.

From the Execution Handoff Preview Modal, use `Check search-only stub` to call
`POST /search-only` with the current Avanza dry-run request instrument. This
displays the normalized search-only summary, exact/ambiguous/no-match/blocked
status, selected candidate or candidate list, risk flags, blockers, warnings,
and safety metadata. It is read-only and does not add any search/run/start
button, browser control, Avanza navigation, order-page behavior, buy/sell click,
broker result, Supabase write, or trade mutation. Exact matches are labeled
`Ready for future instrument-verification phase` for information only; no
instrument-verification behavior is enabled.

From the Execution Handoff Preview Modal, use `Check instrument-verification
stub` to call `POST /instrument-verification` with the current dry-run request
instrument and, when available, the latest exact search-only selected
candidate. This displays the normalized instrument-verification summary,
verified/rejected/ambiguous/blocked status, field checks, selected candidate,
risk flags, blockers, warnings, and safety metadata. It is read-only and does
not add any verify/search/run/start button, browser control, Avanza navigation,
order-page behavior, buy/sell click, form fill, broker result, Supabase write,
or trade mutation. Verified results are labeled `Ready for future
instrument-page phase` for information only; no instrument-page or order
behavior is enabled.

From the Execution Handoff Preview Modal, use `Run localhost bridge echo` to
send the current future-agent request and bridge envelope to the local stub.
This is dev-only and manual. It calls `POST /run` with `dryRun: true`, displays
the echo response, and may save local diagnostics. It does not create a
`TureExecutionRecord`, broker confirmation, Supabase row, or trade-state change.

Use `Run localhost mock agent` to manually exercise the explicit local mock-page
runner path. This is dev-only and manual. It calls `POST /run` with
`enableMockAgentRun: true` and a localhost `mockPageBaseUrl`, displays
`mockAgentRun...` metadata, and may save local agent-run diagnostics. It does
not open Avanza, submit the mock order, create `brokerResult`, create a
`TureExecutionRecord`, write Supabase, or mutate trade state.

Use `Cancel localhost bridge run` to test the local `/cancel` contract. This is
also dev-only and manual. It acknowledges a local stub request id only and does
not cancel a real Avanza session, browser action, broker order, or trade.

The stub is local development tooling only:

- It binds to `127.0.0.1`, not `0.0.0.0`.
- It uses Node's built-in `http` module.
- It has no Avanza URL, credential field, browser automation, external call, Supabase write, or broker-result creation.
- It returns echo/protocol progress only.

## Health

`GET /health` should return a `LocalhostBridgeHealthResponse`.

Abbreviated example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "bridgeName": "Ture Localhost Bridge Stub",
  "bridgeStatus": "available",
  "transport": "http",
  "serverTime": "2026-06-09T10:00:00.000Z",
  "message": "Localhost bridge stub is available for dry-run diagnostics only.",
  "health": {
    "status": "available",
    "transport": "local_process",
    "checkedAt": "2026-06-09T10:00:00.000Z",
    "message": "Localhost bridge stub is running. No Avanza connection exists."
  },
  "capabilities": {
    "transport": "local_process",
    "supportsProgressEvents": true,
    "supportsCancellation": true,
    "supportsAutomaticSubmit": false,
    "supportsManualConfirmationWait": true,
    "supportsBrokerResultReturn": false,
    "supportsRealBrokerAutomation": false,
    "maxConcurrentRuns": 1,
    "version": "avanza_localhost_bridge_v1"
  }
}
```

Safety expectations:

- `supportsRealBrokerAutomation` must stay `false` for the first stub.
- `supportsBrokerResultReturn` must stay `false` until the mock broker-result phase.
- The health response must not imply an Avanza session is connected.

Curl example:

```bash
curl http://127.0.0.1:47831/health
```

## Runner Self-Check

`GET /self-check` should return a `LocalhostBridgeRunnerSelfCheckResponse`.

The self-check endpoint is read-only readiness metadata. It must not:

- open a browser
- navigate to Avanza
- use Avanza selectors or URLs
- fill an order page
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Default unavailable example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "ok": true,
  "bridgeVersion": "avanza_localhost_bridge_v1",
  "checkedAt": "2026-06-11T10:00:00.000Z",
  "selfCheck": {
    "ok": false,
    "status": "unavailable",
    "checkedAt": "2026-06-11T10:00:00.000Z",
    "runnerId": "avanza_dry_run_runner_unavailable",
    "runnerName": "Avanza Dry-Run Runner",
    "version": "avanza_dry_run_runner_self_check_v1",
    "capabilityValidation": {
      "ok": false,
      "blocked": true,
      "errors": ["No Avanza dry-run runner is installed/available."],
      "warnings": [],
      "safetyLevel": "unknown_blocked",
      "canRunMockBrowserActions": false,
      "canRunAvanzaDryRun": false,
      "canSubmitBrokerOrder": false
    },
    "readinessLabels": [
      "Runner unavailable",
      "No Avanza automation",
      "No broker submission",
      "Final confirm disabled"
    ],
    "blockers": ["No Avanza dry-run runner is installed/available."],
    "warnings": [],
    "errors": ["No Avanza dry-run runner is installed/available."]
  },
  "message": "Localhost bridge self-check completed. No Avanza dry-run runner is installed or available.",
  "errors": [],
  "warnings": [
    "Self-check is diagnostics only. It does not open a browser, touch Avanza, submit orders, create broker results, write Supabase, or mutate trades."
  ]
}
```

Optional mock-only behavior:

- A local stub may report `selfCheck.status="available_mock_only"` when a local
  mock-page runner capability is available.
- Mock-only means local mock diagnostics only.
- Mock-only does not mean Avanza dry-run capability.
- `capabilityValidation.canRunAvanzaDryRun` must stay `false`.

The stub must not return `available_dry_run_only` by default. A future dry-run
runner must pass a separate self-check and capability gate before the UI can
display it as available.

Dry-run skeleton mode:

- Set `AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton` only for local
  contract testing.
- In this mode, `/self-check` may report
  `selfCheck.status="available_dry_run_only"` with explicit skeleton metadata.
- The self-check must include `skeletonOnly: true` and `noBrowserControl: true`.
- The capability remains dry-run-only:
  - `supportsBrokerSubmission: false`
  - `supportsFinalConfirmClick: false`
  - `automaticModeCapable: false`
- Skeleton mode is not Avanza automation and does not add selectors, URLs,
  browser control, order submission, broker results, Supabase writes, or trade
  mutation.

## Session Detection Stub

`GET /session-detection` should return a
`LocalhostBridgeSessionDetectionResponse`.

This endpoint is a non-executing stub for the future session-detection-only
phase. It returns sanitized `AvanzaSessionDetectionResult`-compatible metadata
from an explicit local stub mode. It must not:

- connect to or control a browser
- navigate to Avanza
- use Avanza selectors or URLs
- click, type, search, or fill
- read account numbers, balances, holdings, credentials, or page HTML
- open an order page
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Environment mode:

```text
AVANZA_LOCALHOST_BRIDGE_SESSION_DETECTION_MODE=unavailable
```

Supported stub modes:

| Mode | Result status | Meaning |
| --- | --- | --- |
| unset / `unavailable` | `unavailable` | no session detection runner exists |
| `browser_not_connected` | `browser_not_connected` | synthetic browser-disconnected state |
| `avanza_not_visible` | `avanza_not_visible` | synthetic watched context is not Avanza |
| `login_required` | `login_required` | synthetic login wall/challenge state |
| `ready_for_search_only` | `ready_for_search_only` | synthetic sanitized ready-for-search-only state |
| `blocked_sensitive` | `blocked` | synthetic sensitive-data detection block |
| `blocked_order_page` | `blocked` | synthetic order-page context block |

Default unavailable example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "ok": false,
  "bridgeVersion": "avanza_localhost_bridge_v1",
  "checkedAt": "2026-06-11T10:00:00.000Z",
  "sessionDetection": {
    "ok": false,
    "status": "unavailable",
    "checkedAt": "2026-06-11T10:00:00.000Z",
    "context": {
      "loginState": "unknown",
      "language": "unknown",
      "pageContext": "unknown",
      "marketContext": "unknown",
      "sanitizedHostClass": "unknown",
      "sensitiveDataDetected": false
    },
    "blockers": ["Session detection runner is not implemented."],
    "warnings": [],
    "errors": ["Session detection runner is not implemented."],
    "labels": [
      "Session detection only",
      "No browser actions",
      "No broker submission",
      "No order preparation",
      "Local diagnostics only",
      "Session detection unavailable"
    ],
    "metadata": {
      "contractVersion": "avanza_session_detection_v1",
      "targetEnvironment": "avanza_broker",
      "sessionDetectionOnly": true,
      "noBrowserActions": true,
      "noBrokerSubmission": true,
      "noFinalConfirm": true,
      "noOrderPreparation": true
    }
  },
  "message": "Localhost bridge session-detection stub completed safely. No browser was controlled.",
  "errors": ["Session detection runner is not implemented."],
  "warnings": [
    "Session detection runner is not implemented.",
    "No browser actions were executed.",
    "No Avanza page was touched."
  ],
  "metadata": {
    "session_detection_stub": true,
    "no_browser_actions_executed": true,
    "no_avanza_page_touched": true,
    "no_broker_submission": true,
    "no_broker_result_created": true
  }
}
```

Client helper:

- `checkLocalhostBridgeSessionDetection(...)` calls `GET /session-detection`.
- It times out safely, parses JSON defensively, validates the response contract,
  and returns a non-throwing normalized result.
- `summarizeLocalhostSessionDetectionBridgeResponse(...)` produces a short
  no-browser/no-broker summary.

## Search-Only Stub

`POST /search-only` should accept a `LocalhostBridgeSearchOnlyRequest`.

This endpoint is a non-executing stub for the future search-only phase. It
returns synthetic `AvanzaSearchOnlyResult`-compatible metadata from explicit
local stub modes. It must not:

- connect to or control a browser
- navigate to Avanza
- use Avanza selectors or URLs
- click, type, search, or fill
- open an order page
- click buy/sell, trade, review, or final confirmation
- read account numbers, balances, holdings, credentials, raw DOM, or page HTML
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Request shape:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "search_only_request_001",
  "createdAt": "2026-06-11T10:00:00.000Z",
  "expectedInstrument": {
    "ticker": "VOLV B",
    "name": "Volvo B",
    "market": "Stockholm",
    "currency": "SEK",
    "instrumentType": "stock"
  },
  "metadata": {
    "local_diagnostics_only": true,
    "no_browser_actions_requested": true
  }
}
```

Environment mode:

```text
AVANZA_LOCALHOST_BRIDGE_SEARCH_ONLY_MODE=unavailable
```

Supported stub modes:

| Mode | Result status | Meaning |
| --- | --- | --- |
| unset / `unavailable` | `search_not_available` | no search-only runner exists |
| `search_not_available` | `search_not_available` | explicit unavailable search state |
| `exact_match` | `exact_match` | one synthetic candidate matches the expected instrument |
| `ambiguous` | `ambiguous` | two synthetic candidates share the expected ticker |
| `no_match` | `no_match` | synthetic mismatch/no safe exact match |
| `blocked_sensitive` | `blocked` | synthetic sensitive-data risk block |
| `blocked_order_flow` | `blocked` | synthetic order-flow risk block |
| `session_not_ready` | `session_not_ready` | synthetic readiness blocker |

Response safety metadata must include:

- `no_browser_actions_executed: true`
- `no_avanza_page_touched: true`
- `no_order_page_opened: true`
- `no_broker_result_created: true`
- `no_trade_mutation: true`

The nested `searchOnly.metadata` must also include:

- `searchOnly: true`
- `noOrderPage: true`
- `noBuySellClick: true`
- `noBrokerSubmission: true`
- `noBrokerResult: true`

Client helper:

- `checkLocalhostBridgeSearchOnly(...)` calls `POST /search-only`.
- It builds the contract request, times out safely, parses JSON defensively,
  validates the response contract, rejects unexpected `brokerResult`, and
  returns a non-throwing normalized result.
- `summarizeLocalhostSearchOnlyBridgeResponse(...)` produces a no-browser,
  no-Avanza, no-order-page summary.

## Instrument Verification Stub

`POST /instrument-verification` should accept a
`LocalhostBridgeInstrumentVerificationRequest`.

This endpoint is a non-executing stub for the future instrument-verification
phase. It returns synthetic `AvanzaInstrumentVerificationResult`-compatible
metadata from explicit local stub modes. It must not:

- connect to or control a browser
- navigate to Avanza
- use Avanza selectors or URLs
- click, type, search, verify in-browser, or fill
- open an order page
- click buy/sell, trade, review, or final confirmation
- read account numbers, balances, holdings, credentials, raw DOM, or page HTML
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Request shape:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "instrument_verification_request_001",
  "createdAt": "2026-06-11T10:00:00.000Z",
  "expectedInstrument": {
    "ticker": "VOLV B",
    "name": "Volvo B",
    "market": "Stockholm",
    "currency": "SEK",
    "instrumentType": "stock"
  },
  "metadata": {
    "local_diagnostics_only": true,
    "no_browser_actions_requested": true
  }
}
```

Optional request fields:

- `searchOnlyResult`
- `selectedCandidate`

Environment mode:

```text
AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_VERIFICATION_MODE=unavailable
```

Supported stub modes:

| Mode | Result status | Meaning |
| --- | --- | --- |
| unset / `unavailable` | `unavailable` | no instrument verification runner exists |
| `verified` | `verified` | synthetic selected candidate matches expected identity |
| `rejected_ticker` | `rejected` | synthetic ticker mismatch |
| `rejected_market` | `rejected` | synthetic market mismatch |
| `rejected_currency` | `rejected` | synthetic currency mismatch |
| `ambiguous_missing_currency` | `ambiguous` | expected currency exists but candidate currency is missing |
| `ambiguous_low_confidence` | `ambiguous` | candidate confidence is below the verification threshold |
| `blocked_sensitive` | `blocked` | synthetic sensitive-data risk block |
| `blocked_order_flow` | `blocked` | synthetic order-flow risk block |
| `search_not_ready` | `ambiguous` or `search_not_ready` | synthetic non-exact search-only readiness blocker |
| `missing_candidate` | `missing_candidate` | synthetic exact search-only result without selected candidate |

Response safety metadata must include:

- `no_browser_actions_executed: true`
- `no_avanza_page_touched: true`
- `no_order_page_opened: true`
- `no_broker_result_created: true`
- `no_trade_mutation: true`

The nested `instrumentVerification.metadata` must also include:

- `instrumentVerificationOnly: true`
- `noOrderPage: true`
- `noBuySellClick: true`
- `noFormFill: true`
- `noBrokerSubmission: true`
- `noBrokerResult: true`

Client helper:

- `checkLocalhostBridgeInstrumentVerification(...)` calls
  `POST /instrument-verification`.
- It builds the contract request, times out safely, parses JSON defensively,
  validates the response contract, rejects unexpected `brokerResult`, and
  returns a non-throwing normalized result.
- `summarizeLocalhostInstrumentVerificationBridgeResponse(...)` produces a
  no-browser, no-Avanza, no-order-page summary.

UI preview:

- The handoff modal has a dev-gated, read-only `Instrument verification
  preview`.
- Button text is `Check instrument-verification stub`.
- It can include the latest search-only exact `selectedCandidate` when present.
- If no exact search-only candidate exists, it warns that real verification
  would require one while still allowing synthetic stub checks.
- Verified, rejected, ambiguous, and blocked states are displayed as
  diagnostics only.
- The readiness panel adds informational rows for instrument-verification
  status, verified/rejected/ambiguous state, and no order page opened.
- No verify/search/run/start/order button is added.

## Instrument Page Stub

`POST /instrument-page` should accept a
`LocalhostBridgeInstrumentPageRequest`.

This endpoint is a non-executing stub for the future instrument-page phase. It
returns synthetic `AvanzaInstrumentPageResult`-compatible metadata from
explicit local stub modes. It must not:

- connect to or control a browser
- navigate to Avanza
- use Avanza selectors or URLs
- click, type, search, verify in-browser, or fill
- open an order page
- click buy/sell, trade, review, or final confirmation
- read account numbers, balances, holdings, credentials, raw DOM, or page HTML
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Request shape:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "instrument_page_request_001",
  "createdAt": "2026-06-11T10:00:00.000Z",
  "expectedInstrument": {
    "ticker": "VOLV B",
    "name": "Volvo B",
    "market": "Stockholm",
    "currency": "SEK",
    "instrumentType": "stock"
  },
  "metadata": {
    "local_diagnostics_only": true,
    "no_browser_actions_requested": true
  }
}
```

Optional request fields:

- `instrumentVerificationResult`
- `pageIdentity`

Environment mode:

```text
AVANZA_LOCALHOST_BRIDGE_INSTRUMENT_PAGE_MODE=unavailable
```

Supported stub modes:

| Mode | Result status | Meaning |
| --- | --- | --- |
| unset / `unavailable` | `unavailable` | no instrument-page runner exists |
| `page_identified` | `page_identified` | synthetic verified instrument plus matching page identity |
| `page_identified_with_buy_sell_visible` | `page_identified` | matching page identity with buy/sell controls surfaced as guarded warnings only |
| `page_mismatch_ticker` | `page_mismatch` | synthetic page ticker mismatch |
| `page_mismatch_currency` | `page_mismatch` | synthetic page currency mismatch |
| `page_mismatch_missing_field` | `page_mismatch` | synthetic missing required page field |
| `prohibited_controls` | `prohibited_order_controls_detected` | buy/sell controls are visible under strict prohibited-control policy |
| `blocked_order_page` | `blocked` | synthetic order-page context block |
| `blocked_order_form` | `blocked` | synthetic order-form visibility block |
| `blocked_final_confirm` | `blocked` | synthetic final-confirm visibility block |
| `blocked_sensitive` | `blocked` | synthetic account/balance/holdings/sensitive-data block |
| `verification_not_ready` | `verification_not_ready` | synthetic non-verified instrument verification result |
| `page_not_open` | `page_not_open` | no sanitized page identity is available |

Response safety metadata must include:

- `no_browser_actions_executed: true`
- `no_avanza_page_touched: true`
- `no_order_page_opened: true`
- `no_buy_sell_click: true`
- `no_form_fill: true`
- `no_broker_result_created: true`
- `no_trade_mutation: true`

The nested `instrumentPage.metadata` must also include:

- `instrumentPageIdentityOnly: true`
- `noOrderPage: true`
- `noBuySellClick: true`
- `noFormFill: true`
- `noBrokerSubmission: true`
- `noBrokerResult: true`

Client helper:

- `checkLocalhostBridgeInstrumentPage(...)` calls `POST /instrument-page`.
- It builds the contract request, times out safely, parses JSON defensively,
  validates the response contract, rejects unexpected `brokerResult`, and
  returns a non-throwing normalized result.
- `summarizeLocalhostInstrumentPageBridgeResponse(...)` produces a no-browser,
  no-Avanza, no-order-page summary.

The Execution Handoff Preview Modal now has a dev-gated, read-only
`Instrument page preview` panel. It can call this stub manually and display
status, sanitized page identity, field checks, blockers, warnings, risk flags,
and safety metadata. The panel does not activate browser control, does not open
an order page, and does not add an instrument-page/start/run/order button.

## Order Page Open Stub

`POST /order-page-open` should accept a
`LocalhostBridgeOrderPageOpenRequest`.

This endpoint is a non-executing stub for the future order-page-open phase. It
returns synthetic `AvanzaOrderPageOpenResult`-compatible metadata from explicit
local stub modes. It must not:

- connect to or control a browser
- navigate to Avanza
- use Avanza selectors or URLs
- fill account, quantity, price, or any form field
- click `Granska`, review, final confirmation, or keyboard submit
- read account numbers, balances, holdings, credentials, raw DOM, or page HTML
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Request shape:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "order_page_open_request_001",
  "createdAt": "2026-06-11T10:00:00.000Z",
  "dryRunOrderInput": {
    "action": "buy",
    "instrument": {
      "ticker": "VOLV B",
      "name": "Volvo B",
      "market": "Stockholm",
      "currency": "SEK",
      "instrumentType": "stock"
    },
    "quantity": 1,
    "price": 100,
    "orderMode": "advanced",
    "accountPolicy": "require_manual_review",
    "stopPolicy": "stop_at_confirmation_modal",
    "createdAt": "2026-06-11T10:00:00.000Z"
  },
  "metadata": {
    "local_diagnostics_only": true,
    "no_browser_actions_requested": true
  }
}
```

Optional request fields:

- `instrumentPageResult`
- `orderPageIdentity`
- `attemptedAction`

Environment mode:

```text
AVANZA_LOCALHOST_BRIDGE_ORDER_PAGE_OPEN_MODE=unavailable
```

Supported stub modes:

| Mode | Result status | Meaning |
| --- | --- | --- |
| unset / `unavailable` | `unavailable` | no order-page-open runner exists |
| `order_page_opened_buy` | `order_page_opened` | synthetic matching buy order-page identity |
| `order_page_opened_sell` | `order_page_opened` | synthetic matching sell order-page identity |
| `wrong_action_opened` | `wrong_action_opened` | synthetic opened action does not match expected action |
| `order_page_mismatch_ticker` | `order_page_mismatch` | synthetic ticker mismatch |
| `order_page_mismatch_currency` | `order_page_mismatch` | synthetic currency mismatch |
| `prohibited_form_prefilled` | `prohibited_form_interaction_detected` | synthetic order form prefill hard-stop |
| `blocked_final_confirm` | `blocked` | synthetic final-confirm visibility block |
| `blocked_review_click_attempt` | `blocked` | synthetic review/`Granska` attempt block |
| `blocked_keyboard_submit` | `blocked` | synthetic keyboard submit block |
| `blocked_sensitive` | `blocked` | synthetic account/balance/holdings/sensitive-data block |
| `instrument_page_not_ready` | `instrument_page_not_ready` | synthetic instrument-page precondition failure |
| `missing_order_page_identity` | `unavailable` | no sanitized order-page identity is available |

Response safety metadata must include:

- `no_browser_actions_executed: true`
- `no_avanza_page_touched: true`
- `no_real_order_page_opened: true`
- `no_form_fill: true`
- `no_review_click: true`
- `no_final_confirm_click: true`
- `no_broker_submission: true`
- `no_broker_result_created: true`
- `no_trade_mutation: true`

The nested `orderPageOpen.metadata` must also include:

- `orderPageOpenOnly: true`
- `noFormFill: true`
- `noReviewClick: true`
- `noFinalConfirmClick: true`
- `noBrokerSubmission: true`
- `noBrokerResult: true`
- `noTradeMutation: true`

Client helper:

- `checkLocalhostBridgeOrderPageOpen(...)` calls `POST /order-page-open`.
- It builds the contract request, times out safely, parses JSON defensively,
  validates the response contract, rejects unexpected `brokerResult`, and
  returns a non-throwing normalized result.
- `summarizeLocalhostOrderPageOpenBridgeResponse(...)` produces a no-browser,
  no-Avanza, no-form-fill summary.

Action 288 added a dev-gated, read-only `Order page open preview` panel in the
Execution Handoff Preview Modal. It can manually call this stub and display
opened, wrong-action, mismatch, blocked, field-check, risk-flag, and safety
metadata. The button is labeled `Check order-page-open stub`; it is not an
Avanza open/run/start button. The panel does not activate browser control, does
not open Avanza, does not open a real order page, does not fill forms, does not
click `Granska`, does not click `Bekrafta`, and does not create broker results.

## Avanza Dry-Run Request Stub

`POST /dry-run` should accept a `LocalhostBridgeDryRunRequest`.

This endpoint is a contract stub only. It exists so Ture and the bridge can
agree on the future Avanza dry-run payload before any runner exists. It must
not:

- open a browser
- navigate to Avanza
- use Avanza selectors or URLs
- click or fill anything
- submit an order
- create `brokerResult`
- write Supabase
- mutate Ture trade state

Request example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_dry_run_bridge_request_local_example",
  "createdAt": "2026-06-11T10:00:00.000Z",
  "dryRunOrderInput": {
    "action": "buy",
    "instrument": {
      "ticker": "QA.DRYRUN",
      "name": "QA Dry Run",
      "market": "Stockholm",
      "currency": "SEK",
      "instrumentType": "stock"
    },
    "quantity": 3,
    "price": 101.25,
    "orderMode": "advanced",
    "accountPolicy": "require_manual_review",
    "stopPolicy": "stop_at_confirmation_modal",
    "sourceRecommendationId": "recommendation_dry_run_local_example",
    "executionIntentId": "execution_intent_dry_run_local_example",
    "createdAt": "2026-06-11T10:00:00.000Z",
    "metadata": {
      "allowFinalSubmit": false,
      "supportsBrokerSubmission": false,
      "supportsFinalConfirmClick": false,
      "automaticModeCapable": false
    }
  },
  "capabilityValidationOptions": {
    "allowAvanzaDryRun": true,
    "allowBrokerSubmission": false,
    "allowAutomaticMode": false
  },
  "metadata": {
    "local_diagnostics_only": true,
    "no_browser_actions_requested": true
  }
}
```

Response example while no runner exists:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "ok": false,
  "status": "not_implemented",
  "bridgeVersion": "avanza_localhost_bridge_v1",
  "requestId": "avanza_dry_run_bridge_request_local_example",
  "receivedAt": "2026-06-11T10:00:01.000Z",
  "completedAt": "2026-06-11T10:00:01.001Z",
  "dryRunRequestValidation": {
    "ok": true,
    "errors": [],
    "warnings": []
  },
  "capabilityValidation": {
    "ok": true,
    "blocked": false,
    "errors": [],
    "warnings": [
      "Avanza dry-run capability is dry-run only: no broker submission, no final confirmation, and no broker result."
    ],
    "safetyLevel": "dry_run_only",
    "canRunMockBrowserActions": false,
    "canRunAvanzaDryRun": true,
    "canSubmitBrokerOrder": false
  },
  "diagnostics": null,
  "message": "Localhost bridge dry-run request validated, but the Avanza dry-run runner is not implemented. No browser action occurred.",
  "errors": [],
  "warnings": [
    "Avanza dry-run runner is not implemented.",
    "No browser actions were executed.",
    "No broker submission was performed."
  ]
}
```

Contract rules:

- `dryRunOrderInput` must pass `validateAvanzaDryRunOrderInput(...)`.
- `orderMode` must be `advanced`.
- `stopPolicy` must be `stop_at_confirmation_modal` or `stop_before_review`.
- `allowBrokerSubmission=true` is blocked.
- `allowAutomaticMode=true` is blocked.
- metadata attempting `allowFinalSubmit`, `supportsBrokerSubmission`,
  `supportsFinalConfirmClick`, or `automaticModeCapable` is blocked.
- A valid request still returns `not_implemented` until a future runner exists.
- `diagnostics` must be absent or `null` while no runner executes safe actions.

Skeleton response mode:

When the bridge is started with
`AVANZA_LOCALHOST_BRIDGE_SELF_CHECK_MODE=dry_run_skeleton`, a valid and safe
`POST /dry-run` request may be delegated to
`scripts/avanza-dry-run-runner-skeleton.mjs`. The skeleton returns
`status="accepted_stub"` to prove the request can reach a dry-run-only runner
contract, but it still performs no browser action.

Skeleton response rules:

- `diagnostics` is absent or `null`.
- `metadata.skeletonOnly` is `true`.
- `metadata.no_browser_actions_executed` is `true`.
- `metadata.no_browser_control` is `true`.
- `metadata.no_broker_submission` is `true`.
- `metadata.no_broker_result_created` is `true`.
- `brokerResult` must be absent.
- Warnings must make clear that this is an Avanza dry-run runner skeleton only.

Relation to `GET /self-check`:

- `/self-check` reports latest runner availability metadata.
- `/dry-run` validates one future dry-run request payload.
- Neither endpoint starts a browser or enables an Avanza run button.

Client helper:

- `runLocalhostBridgeAvanzaDryRunStub(...)`
- `summarizeLocalhostDryRunBridgeResponse(...)`

The client helper is non-throwing for normal failure cases. It returns a
normalized result with:

- `ok`
- `reachable`
- `status`
- `statusCode`
- `response`
- `summary`
- `errors`
- `warnings`
- `elapsedMs`

`ok=true` means the client safely normalized a non-executing stub response such
as `not_implemented`; it does not mean a runner executed or that Avanza was
opened. Blocked unsafe responses, invalid JSON, timeouts, network failures, and
invalid request inputs return `ok=false`.

UI behavior:

- The panel title is `Dry-run bridge response preview`.
- The button text is `Test dry-run bridge stub`.
- The button is disabled when the current dry-run request preview is invalid.
- The panel always labels the check as no browser actions, no broker
  submission, no broker result, no trade mutation, and stub only.
- The panel must not add or reveal an Avanza run/start button.

## Run Request

`POST /run` should accept a `LocalhostBridgeRunRequest`.

Example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "dryRun": true,
  "envelope": {
    "envelopeId": "avanza_agent_bridge_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:00.000Z",
    "version": "avanza_agent_bridge_v1",
    "type": "request",
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "transport": "local_process",
    "payload": {
      "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
      "version": "avanza_agent_request_v1",
      "broker": "avanza"
    },
    "metadata": {
      "local_diagnostics_only": true
    }
  },
  "request": {
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:00.000Z",
    "version": "avanza_agent_request_v1",
    "broker": "avanza",
    "handoff": null,
    "mode": "semi_automatic",
    "action": "sell",
    "authority": null,
    "safetyChecks": [],
    "requireManualFinalConfirmation": true,
    "allowAutomaticFinalSubmit": false
  },
  "enableMockAgentRun": false,
  "mockPageBaseUrl": "http://localhost:3000",
  "mockAgentHeaded": false,
  "metadata": {
    "source": "ture_execution_sandbox",
    "mock_order_page_only": true
  }
}
```

Contract rules:

- `dryRun` must be `true`.
- `envelope.type` must be `request`.
- `envelope.requestId`, `envelope.payload.requestId`, and `request.requestId` must match when present.
- The bridge must validate the embedded `AvanzaAgentRequest`; real contract payloads must include a ready handoff and pass `validateAvanzaAgentRequest(...)`.
- `enableMockAgentRun` is optional and defaults to `false`. When false or omitted, `/run` must not open a browser.
- `mockPageBaseUrl` is optional and must be a localhost HTTP(S) URL when provided.
- `mockAgentHeaded` is optional and local QA only.
- The bridge must not prepare, submit, simulate, or execute a real broker order.
- The default localhost server path should return echo/progress only and must not launch the mock-page runner.

Curl example:

```bash
curl -X POST http://127.0.0.1:47831/run \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "avanza_localhost_bridge_v1",
    "dryRun": true,
    "envelope": {
      "envelopeId": "avanza_agent_bridge_request_local_example",
      "createdAt": "2026-06-09T10:00:00.000Z",
      "version": "avanza_agent_bridge_v1",
      "type": "request",
      "requestId": "avanza_agent_request_local_example",
      "transport": "local_process",
      "payload": {
        "requestId": "avanza_agent_request_local_example",
        "version": "avanza_agent_request_v1",
        "broker": "avanza"
      }
    },
    "request": {
      "requestId": "avanza_agent_request_local_example",
      "createdAt": "2026-06-09T10:00:00.000Z",
      "version": "avanza_agent_request_v1",
      "broker": "avanza",
      "handoff": null,
      "mode": "semi_automatic",
      "action": "sell",
      "authority": null,
      "safetyChecks": [],
      "requireManualFinalConfirmation": true,
      "allowAutomaticFinalSubmit": false
    }
  }'
```

## Run Response

`POST /run` should return a `LocalhostBridgeRunResponse`.

Example:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "accepted": true,
  "message": "Dry-run request accepted by localhost bridge stub. No browser was opened.",
  "mockOrderPageAvailable": true,
  "mockOrderPageUrl": "/mock-broker/order?ticker=QA.TEST&action=sell&quantity=12&orderType=limit&limitPrice=42.25&targetPrice=48.75&stopLossPrice=39.5&mode=semi_automatic&requireManualFinalConfirmation=true&allowAutomaticFinalSubmit=false&requestId=avanza_agent_request_2026-06-09T10_00_00_000Z_000001&intentId=execution_intent_2026-06-09T10_00_00_000Z_000001",
  "mockOrderPageMessage": "Mock order fill plan generated for local testing only. No browser was opened.",
  "mockOrderFillPlanValid": true,
  "mockOrderFillPlanErrors": [],
  "mockOrderFillPlan": {
    "version": "mock_order_page_fill_plan_v1",
    "targetPath": "/mock-broker/order",
    "source": "avanza_agent_request",
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "intentId": "execution_intent_2026-06-09T10_00_00_000Z_000001",
    "intentIdExpected": true,
    "values": [
      {
        "fieldKey": "ticker",
        "selector": {
          "fieldKey": "ticker",
          "testId": "mock-order-ticker",
          "dataAgentField": "mock-order-ticker"
        },
        "value": "QA.TEST"
      }
    ]
  },
  "mockAgentRunAttempted": false,
  "warnings": [
    "No Avanza connection exists.",
    "No broker result will be created by this stub.",
    "Mock order fill plan metadata is dry-run payload only; no browser was opened."
  ],
  "result": {
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:00.000Z",
    "status": "unknown",
    "progressEvents": [],
    "rawSummary": "Localhost bridge stub completed dry-run protocol test. No broker result was created."
  }
}
```

Contract rules:

- `accepted` means the local bridge accepted the dry-run protocol request. It does not mean a broker order exists.
- `mockOrderFillPlan` and `mockOrderPageUrl` are response-level dry-run metadata only. They are not `brokerResult`.
- `mockOrderPageUrl` is relative and manual-only. Ture and the bridge must not auto-open it.
- `mockOrderFillPlanValid=false` can be returned while `accepted=true` if the bridge request is valid but the embedded agent request lacks enough mock-page field data.
- `mockAgentRunAttempted`, `mockAgentRunOk`, `mockAgentRunMessage`, `mockAgentRunErrors`, `mockAgentRunStartedAt`, and `mockAgentRunCompletedAt` are response-level metadata for the explicit local mock-agent run mode only.
- If `enableMockAgentRun=true` and the local app is unavailable, the URL is invalid, or the mock page cannot be reviewed, `accepted` may still be `true` for a valid bridge request while `mockAgentRunOk=false` reports the local mock-agent failure.
- `result.brokerResult` must remain undefined until the mock broker-result phase.
- Any real broker result in a future phase must be captured, normalized, and audited.

## Cancel

`POST /cancel` should accept a `LocalhostBridgeCancelRequest`.

Example request:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "reason": "User closed the handoff preview modal."
}
```

Example response:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "cancelled": true,
  "message": "Dry-run request cancelled. No broker action occurred."
}
```

Curl example:

```bash
curl -X POST http://127.0.0.1:47831/cancel \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "avanza_localhost_bridge_v1",
    "requestId": "avanza_agent_request_local_example",
    "reason": "Local test finished."
  }'
```

## Event Stream

Future polling, SSE, or websocket progress should use `LocalhostBridgeEventStreamMessage`.

Progress message:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "type": "progress",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "createdAt": "2026-06-09T10:00:01.000Z",
  "progressEvent": {
    "eventId": "avanza_agent_progress_2026-06-09T10_00_01_000Z_000001",
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:01.000Z",
    "type": "agent_started",
    "message": "Localhost bridge dry-run started. No broker page opened."
  }
}
```

Result message:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "type": "result",
  "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
  "createdAt": "2026-06-09T10:00:02.000Z",
  "result": {
    "requestId": "avanza_agent_request_2026-06-09T10_00_00_000Z_000001",
    "createdAt": "2026-06-09T10:00:02.000Z",
    "status": "unknown",
    "progressEvents": [],
    "rawSummary": "Dry-run complete. No broker result was created."
  }
}
```

Heartbeat message:

```json
{
  "version": "avanza_localhost_bridge_v1",
  "type": "heartbeat",
  "createdAt": "2026-06-09T10:00:03.000Z"
}
```

## Validation Helpers

The TypeScript contract exports:

- `validateLocalhostBridgeHealthResponse(...)`
- `validateLocalhostBridgeRunnerSelfCheckResponse(...)`
- `validateLocalhostBridgeDryRunRequest(...)`
- `validateLocalhostBridgeDryRunResponse(...)`
- `validateLocalhostBridgeOrderPageOpenRequest(...)`
- `validateLocalhostBridgeOrderPageOpenResponse(...)`
- `validateLocalhostBridgeReviewClickRequest(...)`
- `validateLocalhostBridgeReviewClickResponse(...)`
- `validateLocalhostBridgeManualConfirmationWaitRequest(...)`
- `validateLocalhostBridgeManualConfirmationWaitResponse(...)`
- `validateLocalhostBridgeBrokerConfirmationCaptureRequest(...)`
- `validateLocalhostBridgeBrokerConfirmationCaptureResponse(...)`
- `validateLocalhostBridgeExecutionRecordEligibilityRequest(...)`
- `validateLocalhostBridgeExecutionRecordEligibilityResponse(...)`
- `validateLocalhostBridgeRunRequest(...)`
- `validateLocalhostBridgeRunResponse(...)`
- `validateLocalhostBridgeCancelRequest(...)`
- `validateLocalhostBridgeCancelResponse(...)`
- `validateLocalhostBridgeEventStreamMessage(...)`
- `buildLocalhostBridgeDryRunRequest(...)`
- `buildLocalhostBridgeOrderPageOpenRequest(...)`
- `buildLocalhostBridgeReviewClickRequest(...)`
- `buildLocalhostBridgeManualConfirmationWaitRequest(...)`
- `buildLocalhostBridgeBrokerConfirmationCaptureRequest(...)`
- `buildLocalhostBridgeExecutionRecordEligibilityRequest(...)`
- `createLocalhostBridgeDryRunStubResponse(...)`
- `buildLocalhostBridgeRunRequest(...)`

The client module exports:

- `checkLocalhostBridgeHealth(...)`
- `checkLocalhostBridgeRunnerSelfCheck(...)`
- `checkLocalhostBridgeOrderPageOpen(...)`
- `checkLocalhostBridgeReviewClick(...)`
- `checkLocalhostBridgeManualConfirmationWait(...)`
- `checkLocalhostBridgeBrokerConfirmationCapture(...)`
- `checkLocalhostBridgeExecutionRecordEligibility(...)`
- `runLocalhostBridgeAvanzaDryRunStub(...)`
- `runLocalhostBridgeDryRun(...)`
- `cancelLocalhostBridgeRun(...)`
- `summarizeLocalhostDryRunBridgeResponse(...)`
- `summarizeLocalhostOrderPageOpenBridgeResponse(...)`
- `summarizeLocalhostReviewClickBridgeResponse(...)`
- `summarizeLocalhostManualConfirmationWaitBridgeResponse(...)`
- `summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(...)`
- `summarizeLocalhostExecutionRecordEligibilityBridgeResponse(...)`

`buildLocalhostBridgeRunRequest(...)` is a pure builder. It does not send anything. It always produces `dryRun: true` and rejects mismatched envelope/request IDs.
`buildLocalhostBridgeDryRunRequest(...)` is also pure. It validates the
`AvanzaDryRunOrderInput` and builds a request for `POST /dry-run`; it does not
start a bridge or browser.
`buildLocalhostBridgeReviewClickRequest(...)` is pure as well. It validates the
`AvanzaDryRunOrderInput` and builds a request for `POST /review-click` with
stub-only/no-browser/no-real-`Granska` metadata.
`buildLocalhostBridgeBrokerConfirmationCaptureRequest(...)` validates the
`AvanzaDryRunOrderInput` and builds a request for `POST
/broker-confirmation-capture` with stub-only, sanitized-evidence-only,
no-`Bekrafta`, no-`BrokerExecutionResult`, no-execution-record, no-Supabase,
and no-trade-mutation metadata.
`buildLocalhostBridgeExecutionRecordEligibilityRequest(...)` builds a request
for `POST /execution-record-eligibility` with eligibility-only/no-record,
no-Supabase, no-trade-mutation, no-browser-control metadata.

## Execution Record Eligibility Stub

`POST /execution-record-eligibility` is a localhost-only contract stub for the
future local execution-record eligibility boundary. It accepts:

- `requestId`
- `createdAt`
- optional sanitized `candidate`
- optional `existingSourceFingerprints`
- optional `existingBrokerReferences`
- optional eligibility `options`
- optional local metadata

It returns `executionRecordEligibility`, an
`ExecutionRecordEligibilityResult`-compatible object. The endpoint is controlled
by `AVANZA_LOCALHOST_BRIDGE_EXECUTION_RECORD_ELIGIBILITY_MODE`.

Supported stub modes:

- `unavailable`
- `eligible_filled`
- `blocked_preview_only`
- `blocked_missing_price`
- `blocked_missing_quantity`
- `blocked_missing_timestamp`
- `blocked_missing_broker_reference`
- `blocked_not_filled`
- `blocked_sensitive`
- `blocked_supabase_write_attempt`
- `blocked_trade_mutation_attempt`
- `blocked_record_creation_attempt`
- `duplicate_source_fingerprint`
- `duplicate_broker_reference`
- `not_eligible_missing_candidate`

The default response is safe `not_eligible`/unavailable metadata. Malformed
requests return a failed eligibility result and do not crash the bridge.

The response must always remain eligibility-only:

- no real `BrokerExecutionResult`
- no execution record
- no Supabase write
- no trade mutation
- no Avanza browser control
- no selector/URL use

## Safety Rules

- `dryRun` is true by default and required in v1.
- No Avanza page is in scope for the first localhost server prototype.
- `POST /dry-run` is request/capability validation only. It must return
  `not_implemented`, `unavailable`, or `blocked` until a separately approved
  runner exists.
- `POST /review-click` is synthetic confirmation-readback diagnostics only. It
  must not perform a real `Granska`, click `Bekrafta`, submit orders, create
  broker results, write Supabase, or mutate trades.
- `POST /broker-confirmation-capture` is synthetic sanitized receipt/confirmation
  capture diagnostics only. It must not control a browser, touch Avanza, click
  `Bekrafta`, submit orders, create `BrokerExecutionResult`, create execution
  records, write Supabase, or mutate trades.
- `POST /execution-record-eligibility` is synthetic local eligibility
  diagnostics only. It must not create `BrokerExecutionResult`, create
  execution records, write Supabase, mutate trades, control a browser, touch
  Avanza, or submit orders.
- The Execution Handoff Preview Modal can call `/review-click` only through the
  dev-gated, read-only `Check review-click stub` button. That preview displays
  normalized stub status and confirmation readback metadata; it does not create
  a run/start/review button for Avanza and does not control a browser.
- The Execution Handoff Preview Modal can call `/broker-confirmation-capture`
  only through the dev-gated, read-only `Check broker-confirmation-capture stub`
  button. That preview displays normalized synthetic receipt/capture metadata;
  it does not create a capture/run/start/create-result button for Avanza, does
  not control a browser, and does not create `BrokerExecutionResult`, execution
  records, Supabase writes, or trade mutations.
- The Execution Handoff Preview Modal can call `/execution-record-eligibility`
  only through the dev-gated, read-only
  `Check execution-record eligibility stub` button. It may pass the latest
  BrokerExecutionResult-shaped preview candidate, preserving `previewOnly`
  metadata so default eligibility remains blocked unless a stub mode returns
  synthetic eligible data. The UI displays eligibility status, reasons,
  blockers, duplicate-risk state, record fingerprint, and no-record/no-Supabase/
  no-trade-mutation metadata. It does not create records or enable persistence.
- `runLocalhostBridgeAvanzaDryRunStub(...)` is wired only to the read-only
  `Test dry-run bridge stub` preview button. It must not be wired to an Avanza
  run/start button without a separate explicit action.
- The Execution Handoff Preview Modal can trigger the explicit mock-agent run mode only through the separate dev-only `Run localhost mock agent` button.
- The mock order page exists for dev QA only. The localhost bridge may return a mock fill plan and relative mock page URL by default, but it must not auto-open, auto-fill, submit, or capture anything.
- `scripts/mock-order-page-agent-runner.mjs` can manually consume a local fill plan for mock-page QA.
- The bridge may import that runner only when `/run` explicitly sets `enableMockAgentRun=true`; that mode is localhost-only, mock-page-only, and review-only.
- No credentials are accepted by this contract.
- No automatic final submit is allowed in the first localhost bridge stub.
- No real broker order may be prepared, submitted, simulated, or executed.
- `brokerResult` must remain undefined until the mock broker-result phase.
- All future real broker results must be captured and logged.
- All future runs must be auditable from request to progress to result.
- The local bridge must expose cancellation or a documented safe-stop behavior.

## Versioning Rules

- `avanza_localhost_bridge_v1` is additive-only while the contract is in sandbox development.
- Breaking changes require a new version string.
- Endpoint paths should remain stable for v1.
- Event stream messages must include `version`, `type`, and `createdAt`.
- Request-scoped messages must include `requestId`.

## Recommended Next Action

Recommended next action: draft an order-page-open phase design only. Do not add
Avanza browser execution until a separate approval exists.

Any future proof of concept should still avoid Avanza access, real broker
execution, broker-result creation, Supabase writes, and trade mutation.
