# Semi-auto Avanza Prototype Safety Plan

Date: 2026-06-11

Status: Documentation-only safety plan for a possible future semi-automatic Avanza prototype. No Avanza automation was implemented, no Avanza URL or selector was added to runtime code, no credential was added, no browser automation was added, and no order submission is in scope.

Related:

- `docs/safe-browser-action-contract.md`
- `docs/avanza-dry-run-capability-spec.md`
- `lib/avanza-dry-run-request-contract.ts`
- `lib/execution-intent-to-avanza-dry-run.ts`
- `lib/safe-browser-action-runner.ts`
- `docs/avanza-final-confirm-block-design.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Define safe boundaries for the first future semi-automatic Avanza prototype before any Avanza automation code is written.

This is not implementation. It is not approval for live automation. It is not approval for final order submission. Any future prototype must be separately approved, gated, and tested against mock flows first.

Action 243 added `docs/semi-auto-avanza-prototype-requirements.md`, which converts this safety plan into functional, safety, failure, progress-event, and test requirements. That requirements document is also documentation-only and does not approve automation.

Action 244 added `docs/avanza-final-confirm-block-design.md`, which defines layered mode, action, denylist, state-machine, wrapper, test, and runtime stop guards for preventing final confirmation clicks in any future semi-auto runner.

Action 245 added `lib/safe-browser-action-contract.ts` and `docs/safe-browser-action-contract.md`, a pure contract/helper layer that validates future safe browser action plans without importing browser automation or touching Avanza.

Action 246 added `lib/safe-browser-action-runner.ts`, a no-op runner interface that validates safe action batches and reports blocked/skipped/validated outcomes without executing browser actions.

Action 253 added `docs/avanza-dry-run-capability-spec.md`, a documentation-only specification for a future Avanza dry-run capability. It defines dry-run as browser navigation/fill/review/readback only, with broker submission, final confirmation, broker results, Supabase writes, and trade mutation still forbidden.

Action 254 extended only the pure capability gate so `allowAvanzaDryRun=true` can classify a non-submitting, non-final-confirm, non-automatic Avanza capability as `dry_run_only`. It does not add Avanza automation, URLs, selectors, browser execution, broker results, or order submission.

Action 255 added a pure dry-run request contract that validates future order-preparation inputs before any runner exists. The contract defaults to Advanced mode, manual account review, and stop at confirmation modal, and it blocks final-submit or broker-submission metadata.

Action 256 added a pure adapter from Ture execution intents to Avanza dry-run requests. It validates intent-derived action, ticker, quantity, price, authority, and safe metadata before any future runner exists.

Action 259 added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only plan for the first future dry-run runner. It defines user-triggered semi-auto architecture, required flags, fill/review/readback flow, stop/failure states, diagnostics, and staged tests without implementing automation.

Action 269 added `docs/avanza-session-detection-only-design.md`, a
documentation-only design for a session-readiness phase before any search,
navigation, fill, review, or readback work. That phase may only classify
browser/session readiness and sanitized context. It must not click, type,
search, navigate, read account data, submit orders, create broker results,
Supabase writes, or trade mutation.

Action 273 added `docs/avanza-search-only-phase-design.md`, a
documentation-only design for the next possible phase after session detection.
Search-only may later return sanitized instrument candidates, but it must not
open order pages, click buy/sell, fill forms, submit orders, create broker
results, write Supabase, or mutate trades.

Action 289 added `docs/avanza-advanced-form-fill-phase-design.md`, a
documentation-only design for a later phase after `order_page_opened`. It
limits that phase to Advanced quantity and price/course fill plus verification
only, and still forbids `Granska`, `Bekrafta`, keyboard submit, broker results,
Supabase writes, and trade mutation.

## Prototype Objective

The first future prototype may test whether Ture and a local agent can navigate, fill, and review the Avanza Advanced order flow while preserving user authority.

Target behavior:

- Ture produces a structured execution request.
- A future local agent uses a manually provided Avanza session/browser context.
- The future agent prepares an Advanced buy/sell order form.
- The future agent clicks only `Granska köp` or `Granska sälj`.
- The future agent reads and verifies the confirmation modal.
- The future agent stops before final confirmation.
- The user remains the final authority.

The prototype must not create a `brokerResult`, submit an order, or treat the confirmation modal as proof of execution.

## Allowed Actions

A future prototype may:

- detect logged-in/session state
- open or use an Avanza session/browser context manually provided by the user
- search for an instrument
- select an exact instrument after verification
- click `Köp` or `Sälj`
- select or use the `Advanced` order mode
- fill quantity and price
- click `Granska köp` or `Granska sälj`
- read the confirmation modal
- report verification results
- wait for the user at the manual final confirmation boundary

## Forbidden Actions

A future prototype must not:

- click `Bekräfta köp`
- click `Bekräfta sälj`
- use automatic mode
- switch account unless explicitly approved
- use `Stop Loss` or `Glidande` tabs
- change unrelated Avanza settings
- scrape account data
- store credentials
- store cookies, session tokens, local storage, or browser storage
- bypass validation
- retry blindly
- act when instrument identity is ambiguous
- submit any real order
- create `brokerResult` from Avanza
- mutate Ture trade state
- write Supabase execution data

## Hard Stop States

The future agent must stop when:

- confirmation modal is detected
- final confirm button is visible
- validation error is detected
- search results are ambiguous
- wrong order mode is active
- account mismatch is detected
- price mismatch is detected
- quantity mismatch is detected
- session timeout or login challenge appears
- unexpected UI layout appears
- user intervention is required
- instrument identity cannot be verified
- action side cannot be verified
- confirmation modal values do not match the request

Stopping means no further click or form action is allowed until the user reviews the state and explicitly decides what to do outside the agent.

## Verification Gates

### Before Clicking Granska

The future agent must verify:

- exact instrument identity
- requested action: buy or sell
- `Advanced` order mode
- account, or accepted default account policy
- quantity
- price/course
- no validation errors
- review button label matches action:
  - `Granska köp` for buy
  - `Granska sälj` for sell

If any gate fails, the agent must stop and report failure. It must not force review.

### After Confirmation Modal

The future agent must verify:

- instrument
- account
- quantity
- price/course
- fees and totals are visible when expected
- final button label matches action:
  - `Bekräfta köp` for buy
  - `Bekräfta sälj` for sell
- cancel button is visible
- no mismatch between request, form, and modal readback

After these checks, the agent must transition to `waiting_for_manual_confirmation` and take no final action.

## Progress Events

Recommended future progress events:

- `avanza_session_detected`
- `avanza_search_opened`
- `avanza_instrument_candidates_detected`
- `avanza_instrument_verified`
- `avanza_order_entry_opened`
- `avanza_advanced_mode_verified`
- `avanza_order_form_filled`
- `avanza_order_validation_failed`
- `avanza_review_clicked`
- `avanza_confirmation_detected`
- `avanza_confirmation_verified`
- `waiting_for_manual_confirmation`
- `avanza_agent_safe_stopped`
- `avanza_agent_failed`

These should first be exercised against mock pages and local diagnostics before any Avanza prototype exists.

## Manual Test Protocol

Use this protocol only after a separate implementation proposal is approved:

- Use dev/staging Ture only.
- Keep automatic execution off.
- Define a small, non-submitting scenario before starting.
- Do not click final confirmation.
- Use screen recording only if sensitive information can be hidden or removed.
- The user watches every step.
- Stop immediately on any mismatch, login challenge, unexpected layout, or validation error.
- Record results in `docs/avanza-manual-mapping-session-notes.md`.
- Do not store credentials, account identifiers, balances, holdings, cookies, tokens, or raw browser storage.
- Do not run the prototype for production users.

## Required Prerequisites Before Prototype Implementation

- Completed manual mapping notes exist.
- Mock contract matches the Advanced order flow.
- Mock-agent flow passes locally.
- Dev-tools gating is confirmed.
- Localhost bridge safety is confirmed.
- Final confirm click is disabled in code by design.
- No production deployment of the prototype is planned.
- No Avanza credentials are stored in Ture.
- Stop states and failure reporting are implemented against mock pages first.
- User approval exists for a specific dev/staging prototype test.

## Risk Register

| Risk | Why it matters | Required mitigation |
| --- | --- | --- |
| Wrong instrument | Similar search results could lead to the wrong order ticket. | Follow `docs/avanza-instrument-verification-phase-design.md`: verify name, ticker, market, currency, and instrument type before any order-entry design. |
| Wrong instrument page | A correct search candidate could still land on the wrong or ambiguous page context. | Follow `docs/avanza-instrument-page-phase-design.md`: verify sanitized page identity and treat buy/sell controls as prohibited guarded elements only. |
| Wrong order page/action | Buy vs sell mismatch can invert the trade before form fill begins. | Follow `docs/avanza-order-page-open-phase-design.md`: click only an explicit matching entry `Kop`/`Salj` control in a future approved phase and stop after verifying the opened page. |
| Wrong form field fill | Quantity or price mismatch can materially change the intended trade before review. | Follow `docs/avanza-advanced-form-fill-phase-design.md`: fill only allowed Advanced quantity/price fields, verify readbacks, and stop before `Granska`. |
| Wrong account | Account selection may differ by user/session. | Verify account or stop if no explicit default policy exists. |
| Wrong price/quantity | Incorrect size or price changes risk materially. | Read back filled values before review and in confirmation modal. |
| Accidental final submit | Final confirmation is a real broker action. | Never click `Bekräfta köp` or `Bekräfta sälj`; stop when visible. |
| UI changed | Labels/layout can shift. | Stop on unexpected layout or missing anchors. |
| Session timeout | Login prompts can interrupt state. | Stop on login challenge or expired session. |
| Retained order tab | Avanza may remember `Stop Loss` or `Glidande`. | Verify `Advanced` before filling. |
| Hidden validation | Form may appear filled but still blocked. | Verify no validation errors and stop on any validation message. |
| Language/currency differences | Labels and price fields may vary by market/language. | Record mapping notes and verify currency/readback explicitly. |
| False execution result | A placed/accepted or mismatched confirmation could be mistaken for a filled execution. | Follow `docs/avanza-broker-execution-result-conversion-boundary-design.md`: treat capture as evidence only and block conversion unless filled evidence and all core fields match. |

## Go/No-go Checklist

Go only when:

- [ ] User manually approves the specific prototype session.
- [ ] Automatic mode is off.
- [ ] Final confirm click is explicitly blocked by design.
- [ ] `docs/avanza-final-confirm-block-design.md` has been reviewed.
- [ ] `docs/safe-browser-action-contract.md` has been reviewed.
- [ ] `docs/avanza-dry-run-capability-spec.md` has been reviewed.
- [ ] `lib/avanza-dry-run-request-contract.ts` validation behavior has been reviewed.
- [ ] `lib/execution-intent-to-avanza-dry-run.ts` adapter behavior has been reviewed.
- [ ] `lib/safe-browser-action-runner.ts` no-op behavior has been reviewed.
- [ ] `docs/avanza-instrument-verification-phase-design.md` has been reviewed.
- [ ] `docs/avanza-instrument-page-phase-design.md` has been reviewed.
- [ ] `docs/avanza-order-page-open-phase-design.md` has been reviewed.
- [ ] `docs/avanza-advanced-form-fill-phase-design.md` has been reviewed.
- [ ] `docs/avanza-review-click-phase-design.md` has been reviewed.
- [ ] `docs/avanza-manual-confirmation-wait-phase-design.md` has been reviewed.
- [ ] `docs/avanza-broker-confirmation-capture-phase-design.md` has been reviewed.
- [ ] `docs/avanza-broker-execution-result-conversion-boundary-design.md` has been reviewed.
- [ ] Test scenario is defined.
- [ ] Rollback/stop procedure is understood.
- [ ] No production users are affected.
- [ ] The session is dev/staging only.
- [ ] Mock-agent flow has passed recently.
- [ ] Required manual mapping notes are current.

No-go when:

- [ ] UI state is unclear.
- [ ] Selector/anchor mapping is missing.
- [ ] Login challenge appears.
- [ ] Account information is exposed in notes or screenshots.
- [ ] Market/order status is uncertain.
- [ ] Instrument identity is ambiguous.
- [ ] Account cannot be verified.
- [ ] `Advanced` mode cannot be verified.
- [ ] Validation is present or unclear.
- [ ] The user cannot watch the run.

## Recommended Next Action

Recommended:

- Action 294 - Avanza Review Click Result Contract

This should remain pure contract work for review-click and confirmation-modal
readback diagnostics after verified Advanced form fill. Do not implement Avanza
automation until the dry-run capability gate, request contract, final-confirm
block, safe action contract, session/search/instrument verification/
instrument-page/order-page-open/form-fill/review-click contracts,
implementation plan, and mock-first tests are explicitly approved.
