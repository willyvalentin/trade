# Avanza Broker Confirmation Capture Phase Design

Action 300 defines the future broker confirmation capture phase after a human
manual final confirmation. This is documentation only. It adds no Avanza
automation, URLs, selectors, browser control, broker capture button,
`Bekrafta` click, order submission, broker result creation, Supabase write, or
trade mutation.

## Purpose

Broker confirmation capture is a future phase after the human manually clicks
`Bekrafta kop` or `Bekrafta salj` outside agent control. Capture means reading
and verifying sanitized broker confirmation or receipt evidence only.

This phase is separate from:

- the human final click
- the manual confirmation wait phase
- conversion to `BrokerExecutionResult`
- execution record creation
- Supabase persistence
- live trade mutation

It must never infer execution from `user_confirmed_unverified` alone.

## Scope

Allowed future behavior:

- consume a `user_confirmed_unverified` manual confirmation wait result
- read sanitized broker confirmation or receipt data in a future design
- validate action, instrument, quantity, price, fees, timestamp, and order id
  when available
- compare broker confirmation evidence against the original dry-run request
- produce a broker confirmation capture result
- identify mismatch, partial, unavailable, rejected, cancelled, blocked, and
  failed states
- emit sanitized diagnostics

Forbidden behavior:

- click `Bekrafta kop`
- click `Bekrafta salj`
- click any final-confirm equivalent
- submit an order
- infer execution without confirmation or receipt evidence
- create live trade mutation directly
- write Supabase directly from this phase
- update History or Statistics directly
- store account numbers, balances, holdings, or personal identifiers
- capture raw DOM or unsanitized screenshots

## Required Prerequisites

This phase may be considered only when all of these are true:

- manual confirmation wait result is `user_confirmed_unverified`
- human final action occurred outside agent control
- original `AvanzaDryRunOrderInput` is available
- review-click confirmation readback is available
- agent broker submission remains disabled
- agent final-confirm click remains disabled
- user is still watching the broker browser
- broker confirmation capture is explicitly enabled in a future design
- capture safety gate passes

If any prerequisite is missing, capture must be unavailable or blocked.

## Planned Statuses

Future pure contract statuses:

- `unavailable`
- `manual_confirmation_not_observed`
- `confirmation_page_not_found`
- `confirmation_captured`
- `confirmation_partial`
- `confirmation_mismatch`
- `confirmation_rejected_or_cancelled`
- `blocked`
- `failed`

## Planned Broker Confirmation Readback Fields

Sanitized readback fields may include:

- action: buy or sell
- ticker
- name
- market
- currency
- instrument type
- quantity
- executed, accepted, or limit price
- order type and order mode
- fees or courtage
- total amount
- timestamp
- order id or reference if visible
- sanitized account label only
- status text: accepted, placed, rejected, cancelled, or unknown
- warnings or errors

The phase must not store balances, holdings, account numbers, personal
identifiers, raw HTML, credentials, cookies, tokens, or unsanitized screenshots.

## Validation Policy

Core fields must match the plan:

- action
- instrument identity
- quantity
- order side
- price, limit, accepted price, or executed price within an explicit policy

Important distinction:

- A placed or accepted order is not always an executed fill.
- If the broker confirms only that an order was placed, the result must reflect
  placed or unfilled status where applicable.
- The system must not call the result a realized execution unless confirmation
  evidence says fill or execution.

Mismatch handling:

- action mismatch returns `confirmation_mismatch`
- instrument mismatch returns `confirmation_mismatch`
- quantity mismatch returns `confirmation_mismatch`
- price mismatch beyond tolerance returns `confirmation_mismatch`
- missing optional fees or order id returns `confirmation_partial`
- rejected or cancelled confirmation returns
  `confirmation_rejected_or_cancelled`
- uncertain wording returns `confirmation_partial` or manual review

## Broker Result Boundary

This phase may produce a broker confirmation capture result in a future
contract, but it must not directly create the real broker execution artifact.

Separate future steps are required for:

- mapping capture result to `BrokerExecutionResult`
- validating `BrokerExecutionResult`
- creating a `TureExecutionRecord`
- writing Supabase
- updating live trades
- updating History or Statistics

No part of this phase should make persistence or trade-state decisions.

## Privacy And Data Minimization

Future capture diagnostics must:

- redact account numbers
- avoid balances
- avoid holdings
- avoid raw DOM
- avoid unsanitized screenshots
- store only minimal confirmation evidence
- keep local diagnostics first
- treat all receipt text as sensitive until sanitized

If sensitive data is detected, capture must stop or redact before storing any
diagnostic payload.

## UI Behavior

Future UI may show:

- `Broker confirmation capture`
- captured, partial, mismatch, rejected/cancelled, blocked, or failed status
- action, instrument, quantity, price, fees, and order id if sanitized
- a clear warning when an order is placed but fill is not confirmed
- local diagnostics only

The UI must not show:

- a Ture final-confirm button
- an Avanza submit/confirm button
- automatic trade mutation controls
- Supabase persistence controls in this phase
- History or Statistics update controls in this phase

## Diagnostics Requirements

Future diagnostics should include:

- `targetEnvironment: "avanza_broker"`
- `brokerConfirmationCaptureOnly: true`
- `humanFinalActionRequired: true`
- `noFinalConfirmByAgent: true`
- `noDirectTradeMutation: true`
- `noDirectSupabaseWrite: true`
- `sanitizedEvidenceOnly: true`

Diagnostics are not execution records and must not be displayed as final trade
history without a separate capture-to-record step.

## Hard Stops

Capture must stop or block on:

- final-confirm click attempted by the agent
- confirmation page not found
- sensitive account, balance, or holding data detected
- action mismatch
- instrument mismatch
- quantity mismatch
- ambiguous confirmation wording
- raw personal data detected
- unexpected UI
- user abort

## Test Plan

Action 301 implemented the pure result contract and test coverage for:

- pure capture result contract tests
- synthetic broker receipt fixtures
- mismatch, partial, rejected, and cancelled cases
- privacy redaction tests
- placed-versus-filled fixtures
- no `BrokerExecutionResult` conversion
- no Supabase write
- no real Avanza capture until explicit approval

Covered states include manual confirmation not observed, confirmation page not
found, captured, partial placed/accepted, partial fill, rejected/cancelled/
expired, action/ticker/quantity/price mismatch, missing optional evidence,
ambiguous wording, sensitive/raw evidence, broker-result creation attempts, and
trade-mutation attempts.

## Graduation Criteria

Proceed to a localhost bridge stub only when:

- this design and `lib/avanza-broker-confirmation-capture-contract.ts` are
  reviewed
- expected receipt fields are known from manual mapping
- privacy policy is clear
- placed-versus-filled distinction is clear
- broker-result boundary is clear
- user approves the next phase

## Action 301 Result Contract

Action 301 added `lib/avanza-broker-confirmation-capture-contract.ts`, a pure
TypeScript contract for future sanitized broker confirmation/receipt capture
results. It evaluates an `AvanzaDryRunOrderInput`, a
`user_confirmed_unverified` manual wait result, and optional sanitized broker
confirmation readback.

The contract models:

- `unavailable`
- `manual_confirmation_not_observed`
- `confirmation_page_not_found`
- `confirmation_captured`
- `confirmation_partial`
- `confirmation_mismatch`
- `confirmation_rejected_or_cancelled`
- `blocked`
- `failed`

It separates placed/accepted orders from filled execution, blocks sensitive or
raw evidence signals, blocks broker-result creation attempts, blocks
trade-mutation attempts, and labels every result as capture-only with no
`BrokerExecutionResult`, no execution record, no Supabase write, and no trade
mutation.

## Action 302 Bridge Stub Integration

Action 302 added a non-executing localhost bridge stub for broker confirmation
capture:

- `POST /broker-confirmation-capture`
- `checkLocalhostBridgeBrokerConfirmationCapture(...)`
- `summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(...)`
- request/response validators in `lib/avanza-localhost-bridge-contract.ts`
- smoke matrix coverage in `scripts/avanza-localhost-bridge-server-smoke.mjs`

The endpoint returns synthetic `AvanzaBrokerConfirmationCaptureResult`
metadata from explicit stub modes for captured, partial, mismatch,
rejected/cancelled/expired, sensitive/raw evidence block,
broker-result-attempt block, trade-mutation-attempt block,
manual-confirmation-not-observed, and confirmation-page-not-found states.

Safety result:

- No Avanza automation was implemented.
- No Avanza URL or selector was added.
- No browser control was added.
- No `Bekrafta` click was added.
- No order submission was added.
- No `BrokerExecutionResult` was created.
- No execution record was created.
- No Supabase write was added.
- No trade state was mutated.

## Action 303 UI Preview

Action 303 added a dev-gated, read-only Broker Confirmation Capture preview to
the Execution Handoff Preview Modal. The button is explicitly named `Check
broker-confirmation-capture stub` and calls only the localhost stub for the
current dry-run request.

The preview displays:

- captured, partial, mismatch, rejected/cancelled, blocked, and failed statuses
- sanitized broker confirmation readback fields
- field checks and risk flags
- safety labels showing no `Bekrafta` by agent, no `BrokerExecutionResult`, no
  execution record, no Supabase write, and no trade mutation
- readiness rows that are informational only

The preview does not control a browser, touch Avanza, add selectors or URLs,
click `Bekrafta`, submit orders, create `BrokerExecutionResult`, create
execution records, write Supabase, or mutate trades. Captured status only means
the modal is ready for a future `BrokerExecutionResult` conversion design.

## Action 304 Conversion Boundary Design

Action 304 added
[`docs/avanza-broker-execution-result-conversion-boundary-design.md`](avanza-broker-execution-result-conversion-boundary-design.md).
It defines the future boundary between sanitized broker confirmation capture and
`BrokerExecutionResult` conversion.

The boundary design states that `confirmation_captured` is evidence, not an
automatic execution record. Conversion may be considered only when the capture
is filled/executed, action/instrument/quantity/price evidence matches, required
core evidence is present, no sensitive/raw evidence exists, and future feature
gates plus explicit approval are enabled. Placed, accepted, partial, mismatch,
rejected/cancelled, blocked, and failed states remain blocked until separate
designs exist.

No conversion code, `BrokerExecutionResult`, execution record, Supabase write,
Avanza automation, selectors, URLs, or trade mutation was added.

## Action 308 Conversion Mapping Design

Action 308 added
[`docs/avanza-broker-execution-result-conversion-mapping-design.md`](avanza-broker-execution-result-conversion-mapping-design.md).
It documents how future eligible `confirmation_captured` and `filled` evidence
should map into `BrokerExecutionResult`-shaped preview fields while keeping
conversion, execution-record creation, Supabase persistence, History/Statistics
updates, and live trade mutation as separate future phases.

The mapping design keeps placed, accepted, partial, rejected/cancelled, unknown,
mismatch, blocked, and failed evidence out of filled execution-result mapping
until separate policy exists. It adds no conversion code,
`BrokerExecutionResult`, execution record, Supabase write, Avanza automation,
selectors, URLs, browser control, or trade mutation.

## Action 305 Eligibility Contract

Action 305 added `lib/avanza-broker-execution-result-eligibility.ts`, a pure
TypeScript eligibility contract for future conversion. It accepts an
`AvanzaBrokerConfirmationCaptureResult` and returns eligibility/blocked metadata
only.

The helper can report `eligible`, `not_eligible`, `partial_only`,
`duplicate_risk`, `blocked`, or `failed`, builds a deterministic sanitized
evidence fingerprint, and blocks non-filled, mismatch, rejected/cancelled,
blocked, missing-evidence, sensitive/raw, broker-result-attempt, and
trade-mutation-attempt cases. It does not create a `BrokerExecutionResult`,
execution record, Supabase write, or trade mutation.

## Recommended Next Action

Recommended next action:

- `Action 309 - BrokerExecutionResult Conversion Preview Contract`

Action 308 added the mapping design. The next step should remain pure
preview/shape work. It must not create or persist execution records, write
Supabase, update History/Statistics, or mutate trades without a separate
explicit approval.
