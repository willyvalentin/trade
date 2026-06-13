# Avanza Search-Only Phase Design

Date: 2026-06-11

Status: Documentation-only design for a possible future Avanza-adjacent search-only phase. No Avanza automation was added, no Avanza URL or selector was added, no Playwright import was added, no browser control was added, no search/run/start button was added, no order page behavior is in scope, no buy/sell click is allowed, no order submission is in scope, no broker result is created, no Supabase write occurs, and no trade state is mutated.

Related:

- `lib/avanza-search-only-result-contract.ts`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Define the future search-only phase after session detection.

Search-only means locating candidate instruments and returning sanitized candidate summaries. It does not mean entering the order flow, opening an order page, pressing buy/sell, filling order fields, or submitting anything.

This design exists so a later implementation can be reviewed against explicit boundaries before any browser-control code is proposed.

Action 274 added `lib/avanza-search-only-result-contract.ts`, a pure TypeScript
result contract for this phase. It can classify sanitized instrument candidates
as `exact_match`, `ambiguous`, `no_match`, `blocked`, `failed`, or unavailable
states, score candidates against expected ticker/name/market/currency/type, and
emit safety labels. It does not control a browser, add Avanza selectors or URLs,
open an order page, click buy/sell, submit, create broker results, write
Supabase, or mutate trade state.

Action 275 added a localhost bridge `POST /search-only` contract, client helper,
server stub, and smoke coverage for synthetic exact/ambiguous/no-match/blocked
states. The endpoint returns only synthetic `AvanzaSearchOnlyResult`-compatible
metadata and still performs no browser control, Avanza navigation, selector
usage, order-page opening, buy/sell click, broker result creation, Supabase
write, or trade mutation.

## Scope

Allowed:

- use a validated dry-run request or instrument identity as input
- search for ticker or instrument name in a watched, user-prepared session
- read a candidate list
- return sanitized candidate summaries
- classify the result as exact, ambiguous, no match, blocked, or failed
- emit local diagnostics

Forbidden:

- open an order page
- click `Köp`, `Sälj`, buy, sell, trade, or order actions
- click any final-confirmation or review-order action
- fill quantity, price, amount, account, validity, or order-mode fields
- read balances, holdings, account identifiers, personal identifiers, or credentials
- read raw DOM dumps or page HTML
- submit anything
- create `brokerResult`
- create execution records
- write Supabase
- mutate trade state
- persist sensitive data

## Required Prerequisites

- Manual mapping refresh is completed, explicitly green, or explicitly deferred with a written reason.
- Latest session-detection result is `ready_for_search_only`.
- Dry-run request is valid.
- Capability gate classifies the future runner as `dry_run_only` when explicitly allowed.
- Broker submission is disabled.
- Final confirm is disabled.
- User is watching the browser.
- Execution dev tools are enabled.
- No Avanza order-page, form-fill, buy/sell, or submit behavior exists.

## Search-Only Input

Planned input fields:

| Field | Purpose | Notes |
| --- | --- | --- |
| `ticker` | Primary instrument search key | Required. Not sufficient by itself for exact-match trust. |
| `name` | Optional instrument display name | Used to reduce ambiguity. |
| `market` | Optional market/venue | Missing market should warn or block depending risk. |
| `currency` | Optional instrument/order currency | Missing currency should warn or block depending risk. |
| `instrumentType` | Optional type such as stock/fund/certificate | Used to avoid wrong-product matches. |
| `action` | Buy/sell context only | Must not cause trade action or UI button click. |
| `requestId` | Local traceability | Diagnostics only. |
| `sourceRecommendationId` | Source traceability | Diagnostics only. |
| `metadata` | Sanitized local metadata | Must not include credentials, account labels, balances, holdings, or raw page data. |

## Candidate Result Shape

Action 274 implements these statuses:

- `unavailable`
- `session_not_ready`
- `search_not_available`
- `no_match`
- `ambiguous`
- `exact_match`
- `blocked`
- `failed`

Implemented candidate fields:

| Field | Purpose |
| --- | --- |
| `displayName` | Sanitized candidate display name. |
| `ticker` | Candidate ticker or symbol, if visible. |
| `market` | Sanitized market/venue, if visible. |
| `currency` | Candidate currency, if visible. |
| `instrumentType` | Candidate type, if visible. |
| `matchConfidence` | Numeric confidence from `0` to `1`. |
| `sanitizedSource` | Search result, instrument summary, or other non-sensitive source label. |
| `warnings` | Candidate-specific uncertainty. |
| `riskFlags` | Ambiguous ticker, missing market, wrong currency, wrong type, or similar risks. |

The result must remain local diagnostics. It is not a broker confirmation, not an order preparation result, and not a broker execution result.

Implemented helpers:

- `scoreAvanzaSearchOnlyCandidate(...)`
- `classifyAvanzaSearchOnlyCandidates(...)`
- `summarizeAvanzaSearchOnlyResult(...)`
- `getAvanzaSearchOnlySafetyLabels(...)`
- `isAvanzaSearchOnlyExactMatch(...)`

## Exact-Match Policy

Ticker alone is not always enough.

Exact match should require, where available:

- ticker/symbol match
- name or display-name match
- market/venue match
- currency match
- instrument type match

If multiple candidates share ticker/name similarity, the result is `ambiguous`.

If market or currency is missing, the future contract should warn or block depending on risk. For high-risk contexts, missing market or currency should block exact-match classification.

If no exact match is available, stop. Do not proceed to instrument verification, order preparation, buy/sell buttons, or order pages.

## Hard Stops

The search-only phase must stop safely when any of these occur:

- login required
- session detection is not `ready_for_search_only`
- current page is unknown
- sensitive data is visible or detected
- order page appears
- trade button is clicked accidentally
- buy/sell/trade/order CTA is visible too close to the planned action target
- candidate ambiguity
- candidate mismatch
- missing market/currency/type where required
- Avanza UI has changed from the latest manual mapping
- user aborts
- browser/bridge/runner self-check fails

Hard stops should produce local diagnostics only and must not create broker results, execution records, Supabase writes, or trade mutations.

## Privacy And Data Minimization

- Do not store account numbers.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store credentials.
- Do not store raw DOM dumps or page HTML.
- Do not store unsanitized screenshots.
- Store only sanitized instrument candidates and local diagnostic metadata.
- Keep diagnostics local until a separate persistence design explicitly approves otherwise.

## UI Behavior

The dev-gated handoff modal now includes a read-only `Search-only preview`
panel for the localhost `/search-only` stub. It can display:

- `Search-only candidate preview`
- exact, ambiguous, no-match, blocked, or failed status
- sanitized candidate list
- candidate warnings and risk flags
- no browser-action transcript beyond safe diagnostics

The preview also adds informational readiness rows such as search-only status,
exact match found, ambiguous candidates, and no order page opened. An exact
match may say `Ready for future instrument-verification phase`, but this is
only informational and does not enable instrument verification.

The UI must not show:

- Avanza run/start button
- search/start button until a separate implementation is approved
- buy/sell/order button
- order-page open button
- broker submission button
- broker result capture button

## Test Plan

Before implementation:

- pure candidate contract tests
- mock candidate fixtures
- bridge stub tests
- manual Avanza mapping refresh review
- exact-match and ambiguous-match fixture coverage
- privacy/data minimization checks
- no real browser search until explicit approval

Any future browser-adjacent test must remain separate from this design and require explicit approval.

## Graduation Criteria To Instrument-Verification Phase

Can proceed only when:

- session detection works and is tested
- search-only result contract is implemented and tested
- exact-match policy is clear
- ambiguity handling is tested
- privacy/data minimization behavior is documented
- no order-flow behavior exists
- no buy/sell/form-fill/final-submit action exists
- user explicitly approves the next phase

The instrument-verification phase design is now documented in
`docs/avanza-instrument-verification-phase-design.md`. It remains
documentation-only and still prohibits order pages, buy/sell clicks, order-form
behavior, submissions, broker results, Supabase writes, and trade mutation.

The pure instrument-verification result contract now exists in
`lib/avanza-instrument-verification-contract.ts`. It can verify sanitized
search-only exact candidates, reject mismatches, mark incomplete identity as
ambiguous, and block sensitive/order-flow risk without browser control.

The future phase after verified instrument identity is now documented in
`docs/avanza-instrument-page-phase-design.md`. It remains instrument-page
identity only and still prohibits order pages, buy/sell clicks, order-form
behavior, submissions, broker results, Supabase writes, and trade mutation.

## Recommended Next Action

Recommended next action:

- Action 282 - Avanza Instrument Page Result Contract

Action 282 should add only pure TypeScript result types/helpers for
instrument-page identity outcomes. It should not add browser control, Avanza
selectors, Avanza URLs, Playwright imports, instrument-page/run/start buttons,
order-page behavior, buy/sell clicks, form fills, broker results, Supabase
writes, or trade mutation.
