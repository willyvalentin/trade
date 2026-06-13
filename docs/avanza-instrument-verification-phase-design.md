# Avanza Instrument Verification Phase Design

Status: documentation-only design for a future phase.

This document does not approve or implement Avanza automation. It adds no
Avanza URLs, selectors, browser control, order-page behavior, buy/sell clicks,
form filling, order submission, broker results, Supabase writes, or trade
mutation.

## Purpose

Define the future instrument-verification phase after a search-only exact
match.

Instrument verification means confirming the instrument identity only. It is a
gate between search-only candidate classification and any later design for
opening an instrument page or order-entry flow. It must not enter an order flow.

The phase answers one narrow question:

- Does the exact search-only candidate match the intended instrument strongly
  enough to proceed to the next design phase?

## Scope

Allowed:

- Consume an exact search-only candidate.
- Compare the candidate against the expected instrument identity.
- Verify ticker, name, market, currency, and instrument type.
- Optionally verify visible instrument-page identity in a later phase if a
  separate approved non-order instrument-page design exists.
- Return verified, rejected, ambiguous, blocked, unavailable, or failed status.
- Emit sanitized local diagnostics.

Forbidden:

- Open an order page.
- Click `Köp`, `Sälj`, trade, or order actions.
- Fill quantity, price, amount, account, order type, validity, or any order
  field.
- Read balances, holdings, account numbers, account labels, personal
  identifiers, credentials, cookies, or raw browser storage.
- Submit anything.
- Create broker results.
- Create execution records.
- Mutate trade state.
- Write Supabase.
- Persist sensitive data.

## Required Prerequisites

- Manual mapping refresh is green.
- Session detection status is `ready_for_search_only`.
- Search-only result status is `exact_match`.
- Search-only selected candidate exists.
- Selected candidate has no critical risk flags.
- Expected instrument has enough identity fields for comparison.
- Avanza dry-run request is valid.
- Capability gate remains `dry_run_only`.
- Broker submission is disabled.
- Final confirm is disabled.
- Automatic mode is disabled.
- User is watching the browser if a later browser-adjacent implementation is
  approved.

## Verification Inputs

Planned input fields:

- `expectedInstrument`
  - ticker
  - name optional but preferred
  - market optional but preferred
  - currency optional but preferred
  - instrumentType optional but preferred
- `selectedCandidate` from the search-only result
  - displayName
  - ticker
  - market
  - currency
  - instrumentType
  - matchConfidence
  - riskFlags
  - warnings
- source dry-run order input or request id
- source recommendation id or execution intent id if available
- optional visible instrument identity from a future approved non-order
  instrument-page phase
- sanitized metadata only

Do not include account, balance, holdings, personal identifiers, credentials,
raw DOM, raw HTML, screenshots, cookies, or tokens.

## Verification Statuses

The pure result contract now exists in
`lib/avanza-instrument-verification-contract.ts`. It models these statuses:

- `unavailable`
- `search_not_ready`
- `missing_candidate`
- `verified`
- `rejected`
- `ambiguous`
- `blocked`
- `failed`

Suggested status meaning:

| Status | Meaning | Next behavior |
| --- | --- | --- |
| `unavailable` | Verification capability is not available. | Stop. |
| `search_not_ready` | Search-only result is missing or not `exact_match`. | Stop. |
| `missing_candidate` | No selected candidate exists. | Stop. |
| `verified` | Candidate matches required identity policy. | May proceed only to the next approved design phase. |
| `rejected` | Candidate mismatches expected identity. | Stop and report mismatch. |
| `ambiguous` | Candidate identity is incomplete or not strong enough. | Stop for manual review. |
| `blocked` | Critical safety risk or forbidden context detected. | Stop. |
| `failed` | Contract or unexpected processing failure. | Stop safely. |

## Verification Policy

The helper `verifyAvanzaInstrument(...)` implements this policy for sanitized
search-only candidates. It compares the expected instrument against the selected
candidate and returns verified, rejected, ambiguous, blocked, missing-candidate,
search-not-ready, failed, or unavailable results without controlling a browser.

- Ticker match is required.
- Market match is required when expected market exists.
- Currency match is required when expected currency exists.
- Instrument type match is required when expected instrument type exists.
- Name match should be strong but may tolerate formatting differences,
  punctuation differences, casing, whitespace, and known legal suffix
  variations.
- Missing expected market, currency, or instrument type should produce a warning
  at minimum. It may block if the candidate universe is risky or similar
  instruments exist.
- Duplicate or ambiguous search candidates block verification.
- Any critical risk flag blocks verification.
- If the candidate only partially matches, require manual review and stop.
- If a visible instrument identity is used in a future phase, it must match the
  selected candidate and expected instrument. Any mismatch stops the flow.

Critical risk flags include at least:

- sensitive data detected
- order flow detected
- ticker mismatch
- market mismatch
- currency mismatch
- instrument type mismatch
- duplicate ticker or ambiguous candidate set

## Hard Stops

Stop immediately when any of these occur:

- selected candidate is missing
- search-only status is not `exact_match`
- ticker mismatch
- market mismatch when expected market exists
- currency mismatch when expected currency exists
- instrument type mismatch when expected type exists
- duplicate or ambiguous candidate set
- critical risk flag
- sensitive data detected
- order page detected
- buy/sell/trade/order action detected
- quantity, price, amount, account, or order field detected as an action target
- unexpected UI
- manual mapping is stale or red
- user abort
- bridge or runner self-check fails

Hard stops must produce diagnostics only. They must not create broker results,
execution records, Supabase writes, or trade mutations.

## Privacy And Data Minimization

- Store only sanitized instrument identity.
- Do not store account numbers.
- Do not store account labels.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store credentials.
- Do not store cookies or tokens.
- Do not store raw DOM dumps or page HTML.
- Do not store unsanitized screenshots.
- Keep diagnostics local until a separate persistence design explicitly
  approves otherwise.

## UI Behavior

The Execution Handoff Preview Modal now has a dev-gated, read-only
`Instrument verification preview` panel. It can call the localhost
`POST /instrument-verification` stub and display synthetic verified, rejected,
ambiguous, blocked, unavailable, missing-candidate, or search-not-ready
metadata.

The preview may show:

- `Instrument verification preview`
- verified, rejected, ambiguous, blocked, failed, or unavailable state
- compared fields
- selected candidate summary
- expected instrument summary
- risk flags
- warnings and blockers
- local diagnostics timestamp

The preview is stub-only. It does not control a browser, touch Avanza, open an
order page, click buy/sell, fill forms, submit orders, create broker results,
write Supabase, or mutate trades.

The UI must not show:

- Avanza verify/search/run/start button
- order button
- buy/sell button
- open order page button
- broker submission button
- broker result capture button
- trade-state mutation action

If verification succeeds, the UI may say:

- `Ready for future instrument-page phase`

That label is informational only and must not enable an instrument-page action
without a separate approved phase.

Rejected and ambiguous states must say manual review is required. Blocked
states must surface the blocker and stop at diagnostics.

## Test Plan

Current contract coverage:

- exact search result plus matching candidate -> `verified`
- ambiguous search result -> `ambiguous`
- missing selected candidate -> `missing_candidate`
- ticker mismatch -> `rejected`
- market mismatch -> `rejected`
- currency mismatch -> `rejected`
- missing candidate currency while expected currency exists -> `ambiguous`
- low confidence -> `ambiguous`
- sensitive-data candidate risk -> `blocked`
- order-flow candidate risk -> `blocked`
- summaries and safety labels include no order page, no form fill, and no broker
  submission

Current bridge-stub coverage:

- localhost bridge `POST /instrument-verification` contract and server stub
- frontend-safe client helper
  `checkLocalhostBridgeInstrumentVerification(...)`
- response summarizer
  `summarizeLocalhostInstrumentVerificationBridgeResponse(...)`
- synthetic stub modes for verified, rejected ticker/market/currency,
  ambiguous missing-currency/low-confidence, blocked sensitive/order-flow,
  search-not-ready, and missing-candidate states
- smoke coverage for default, verified, rejected, ambiguous, blocked, missing
  input, and malformed JSON paths
- client/e2e normalization coverage for verified, rejected, ambiguous, blocked,
  missing-candidate, search-not-ready, invalid response, and invalid request
  paths
- handoff-modal e2e coverage for verified, rejected, ambiguous, and blocked
  read-only preview states

The bridge stub is non-executing. It does not control a browser, touch Avanza,
open an order page, click buy/sell, fill forms, submit orders, create broker
results, write Supabase, or mutate trades.

Before any browser-adjacent implementation:

- pure verification contract tests
- mock candidate fixtures
- exact match fixture
- missing candidate fixture
- rejected ticker/market/currency/type mismatch fixtures
- ambiguous/duplicate fixture
- critical risk flag fixture
- bridge stub regression tests
- manual Avanza mapping refresh review
- no real browser verification until explicit approval

Any future browser-adjacent test must remain separate from this design and
require explicit approval.

## Graduation Criteria To Instrument-Page Or Open-Order-Page Design

Can proceed only when:

- exact match policy works
- verification contract is implemented and tested
- ambiguous cases stop safely
- rejected cases stop safely
- blocked cases stop safely
- no order-flow behavior exists
- no buy/sell behavior exists
- no form-fill behavior exists
- no final-submit behavior exists
- user explicitly approves the next phase

The next phase is now documented in
`docs/avanza-instrument-page-phase-design.md`. That phase remains
instrument-page identity only. It still prohibits order pages, buy/sell clicks,
order-form behavior, submissions, broker results, Supabase writes, and trade
mutation.

The pure instrument-page result contract now exists in
`lib/avanza-instrument-page-contract.ts`. It can identify sanitized matching
instrument pages, reject page mismatches, block order-page/form/final-confirm
and sensitive states, and report buy/sell button visibility as guarded warnings
without browser control.

Opening an order page or preparing an order requires a separate safety design
and explicit approval.

The order-page-open design now exists in
`docs/avanza-order-page-open-phase-design.md`. It remains documentation-only and
limits the future phase to a guarded entry `Kop`/`Salj` click from an identified
instrument page plus order-page-open verification. It still forbids form fills,
`Granska`, `Bekrafta`, broker submission, broker results, Supabase writes, and
trade mutation.

The pure order-page-open result contract now exists in
`lib/avanza-order-page-open-contract.ts`. It compares expected action and
instrument with sanitized order-page identity, and blocks review-click,
final-confirm, keyboard-submit, prefilled-form, and sensitive-data states
without browser control.

## Recommended Next Action

Recommended next action:

- Action 287 - Order Page Open Bridge Stub Contract

Action 287 should add only a non-executing localhost bridge contract/stub for
synthetic order-page-open responses. It should not add browser control, Avanza
selectors, Avanza URLs, order-page/run/start buttons, form fills, review
clicks, final-confirm clicks, broker results, Supabase writes, or trade
mutation.
