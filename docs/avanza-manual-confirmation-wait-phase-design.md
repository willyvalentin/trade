# Avanza Manual Confirmation Wait Phase Design

Action 297 defines the future manual confirmation wait phase after a
`confirmation_ready` review-click result. This is documentation only. It adds
no Avanza automation, URLs, selectors, browser control, final-confirm behavior,
broker result capture, Supabase write, or trade mutation.

## Purpose

The manual confirmation wait phase begins only after confirmation modal
readback has been verified by the review-click phase. Its purpose is to make
the handoff boundary explicit:

- the human remains final authority
- the agent stops acting
- no agent click on `Bekrafta kop` or `Bekrafta salj` is allowed
- no order execution is inferred in this phase

This phase may display that Ture is waiting for manual confirmation, but it
must not convert that wait state into a broker result.

## Scope

Allowed behavior:

- consume a `confirmation_ready` `AvanzaReviewClickResult`
- display `waiting_for_manual_confirmation`
- keep local diagnostic state
- optionally detect high-level modal state as read-only in a future design
- allow the user to manually click `Bekrafta` or `Avbryt` in the watched broker
  browser
- stop safely on timeout or user abort

Forbidden behavior:

- click `Bekrafta kop`
- click `Bekrafta salj`
- click any final-confirm equivalent
- trigger keyboard Enter/Space submit
- create a broker result
- mark a trade executed
- mutate live positions, History, or Statistics
- write Supabase
- scrape account, balance, or holding data
- infer execution without an explicit future capture phase

## Required Prerequisites

The phase may be entered only when all of these are true:

- review-click result status is `confirmation_ready`
- confirmation modal readback is verified against action, instrument, quantity,
  and price
- final-confirm visibility is treated as read-only evidence only
- user is watching the broker browser
- execution mode is `semi_automatic`
- `allowFinalSubmit=false`
- runner capability has `supportsFinalConfirmClick=false`
- broker submission is disabled
- automatic mode is disabled

If any prerequisite is missing, the phase should remain unavailable or blocked.

## Planned Statuses

Future pure contract statuses:

- `unavailable`
- `confirmation_not_ready`
- `waiting_for_manual_confirmation`
- `user_cancelled`
- `user_confirmed_unverified`
- `timed_out`
- `blocked`
- `failed`

`user_confirmed_unverified` is intentionally not a broker execution result. It
only means the wait phase observed or was told that the human appears to have
confirmed. Broker confirmation parsing and broker-result capture belong to a
separate future phase.

## Wait Policy

When entered, the agent moves into a wait state and stops acting.

- No click actions are allowed.
- No keyboard-submit action is allowed.
- Future read-only polling may be designed separately, but it must remain
  high-level and sanitized.
- The user manually decides whether to confirm or cancel.
- If the user cancels, the phase ends with `user_cancelled`.
- If the user confirms, the phase can only report
  `user_confirmed_unverified` until a separate confirmation-capture phase
  exists.

No automatic retry is allowed.

## Final-Confirm Hard Block

Final confirmation remains a hard boundary.

- `Bekrafta kop` and `Bekrafta salj` stay denylisted.
- Any attempted agent click is a critical block.
- Keyboard submit is blocked.
- Final confirm visible is expected but read-only.
- The human owns the final broker action.

The safe browser action layer must continue to block final-confirm-like click
targets in semi-automatic mode.

## Timeout And Cancel Policy

Future implementation may define a configurable wait timeout.

- timeout returns `timed_out`
- user abort returns `blocked` or `user_cancelled`
- cancel detection must not create a broker result
- timeout must not mutate trade state
- there is no automatic retry or recovery click

The safest default is a short, visible wait state with a clear user-controlled
stop path.

## Privacy And Data Minimization

Diagnostics should store only sanitized wait-state data:

- request id
- review-click result id or status if available
- wait status
- checked timestamps
- sanitized action/instrument/quantity/price summary

Diagnostics must not store:

- account number
- account label if it identifies a real account
- balance
- holdings
- raw DOM or page HTML
- unsanitized screenshots
- credentials

Diagnostics remain local until a separate persistence design is approved.

## UI Behavior

Future UI may show:

- `Waiting for manual confirmation`
- `Human must click Bekrafta or Avbryt`
- action, instrument, quantity, and price summary
- confirmation readback verified indicator
- timeout/cancel state
- no broker result
- no trade mutation

The UI must not show:

- a Ture `Bekrafta` button
- an Avanza confirm/run/start button
- broker-result capture controls in this phase
- trade-state mutation controls in this phase

## Diagnostics

Diagnostics should include:

- `targetEnvironment: "avanza_broker"`
- `manualConfirmationWaitOnly: true`
- `noFinalConfirmClick: true`
- `noBrokerResult: true`
- `noTradeMutation: true`
- `noSupabaseWrite: true`
- status changes only

These diagnostics are not broker confirmations and must not be displayed as
execution records.

## Test Plan

Before implementation:

- pure wait result contract tests
- bridge stub tests
- final-confirm denylist tests
- no UI confirm button tests
- manual Avanza mapping refresh
- no real waiting automation until explicit approval

Test fixtures should cover:

- missing confirmation-ready prerequisite
- valid `waiting_for_manual_confirmation`
- user cancel
- user confirmed but unverified
- timeout
- attempted final-confirm click blocked
- keyboard-submit blocked
- sensitive data detected and redacted

## Graduation Criteria To Broker Confirmation Capture Design

Proceed to broker confirmation capture design only when:

- manual wait result contract is implemented and tested
- final confirm remains blocked in the safe action layer
- UI clearly shows human authority
- no broker result is created by the wait phase
- privacy/data minimization rules are tested
- user explicitly approves capture-phase design

## Action 298 Result Contract

Action 298 added `lib/avanza-manual-confirmation-wait-contract.ts`, a pure
TypeScript result contract for this phase. It evaluates a
`confirmation_ready` review-click result plus optional sanitized observation
state and returns `confirmation_not_ready`,
`waiting_for_manual_confirmation`, `user_cancelled`,
`user_confirmed_unverified`, `timed_out`, `blocked`, or failed-style states
without controlling a browser.

The contract treats final-confirm visibility as read-only by default, blocks
agent final-confirm attempts and keyboard submit, blocks unexpected broker
results or trade mutations, blocks account/balance/holding/sensitive signals,
and labels `user_confirmed_unverified` as requiring a separate broker
confirmation capture phase.

## Action 299 Bridge Stub

Action 299 added a non-executing localhost bridge `POST
/manual-confirmation-wait` stub plus client helper coverage. The endpoint
accepts an optional `AvanzaReviewClickResult`, sanitized wait observation,
timeout, and metadata, then returns an
`AvanzaManualConfirmationWaitResult`-compatible response.

Supported local stub modes are:

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

The bridge smoke matrix covers the default unavailable path, malformed
requests, waiting, cancelled, unverified-confirmed, timed-out,
final-confirm-visible-read-only, final-confirm-attempt, keyboard-submit,
unexpected broker-result, unexpected trade-mutation, sensitive-data, and
confirmation-not-ready states.

This remains stub-only. It executes no browser actions, touches no Avanza page,
uses no selectors or URLs, clicks no `Bekrafta`, creates no broker result,
writes no Supabase data, and mutates no trade state.

## Action 300 Broker Confirmation Capture Design

Action 300 added
[`docs/avanza-broker-confirmation-capture-phase-design.md`](avanza-broker-confirmation-capture-phase-design.md).
It defines the future phase after `user_confirmed_unverified`: read and verify
sanitized broker confirmation or receipt evidence only, then produce a capture
result in a separate future contract.

The capture phase is explicitly separate from the human `Bekrafta` click,
`BrokerExecutionResult` conversion, execution record creation, Supabase
persistence, History/Statistics integration, and live trade mutation.

## Action 301 Broker Confirmation Capture Result Contract

Action 301 added `lib/avanza-broker-confirmation-capture-contract.ts`, a pure
TypeScript capture-result contract for sanitized broker confirmation evidence
after `user_confirmed_unverified`. It can report captured, partial, mismatch,
rejected/cancelled, blocked, and failed states while preserving the boundary:
no `Bekrafta`, no `BrokerExecutionResult`, no execution record, no Supabase
write, and no trade mutation.

## Action 304 BrokerExecutionResult Conversion Boundary

Action 304 added
[`docs/avanza-broker-execution-result-conversion-boundary-design.md`](avanza-broker-execution-result-conversion-boundary-design.md).
It clarifies that `user_confirmed_unverified` is never a broker result and that
even `confirmation_captured` evidence is not automatically a
`BrokerExecutionResult`.

The future conversion boundary requires filled/executed evidence, matching
action/instrument/quantity/price fields, no sensitive/raw-data flags, no
broker-result creation attempts, no trade-mutation attempts, future feature
gates, and explicit approval. Placed/accepted/unfilled evidence must stay out of
realized execution records until a separate pending-order design exists.

## Recommended Next Action

Recommended next action:

- `Action 305 - BrokerExecutionResult Conversion Eligibility Contract`

That action should remain pure eligibility contract work. It should add no
browser control, Avanza URLs/selectors, `Bekrafta`, order submission,
`BrokerExecutionResult` creation, execution record, Supabase write, or trade
mutation.
