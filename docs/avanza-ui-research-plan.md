# Avanza UI Research Plan

Date: 2026-06-10

Status: Documentation-only manual research plan. No Avanza automation was added, no Avanza page was opened from code, no Avanza URL was added to app runtime, no credentials were added, and no order submission is in scope.

Related:

- `docs/execution-agent-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-qa-notes.md`
- `lib/avanza-agent-adapter.ts`
- `lib/avanza-execution-handoff.ts`
- `lib/mock-order-page-agent-contract.ts`
- `lib/mock-order-confirmation-contract.ts`

## Purpose

This plan prepares for future semi-automatic Avanza order preparation by defining a safe, manual research process for understanding the Avanza order flow.

The research is manual only:

- no browser automation
- no scraping
- no credentials in code or docs
- no final submit
- no real order

The goal is to document screen flow, visible labels, validation behavior, and safety boundaries before any future automation proposal is considered.

## Current Safe Foundation

Ture already has a local/dev execution foundation:

- Structured execution intent, handoff, and future agent request objects exist.
- The execution handoff preview can show the request Ture would send to a future agent.
- The localhost bridge can validate dry-run requests.
- The dev-only mock order page has stable fill selectors and a `MockOrderPageFillPlan`.
- The local mock-agent runner can fill the mock page and click review only.
- The dev-only mock confirmation page and parser can exercise confirmation parsing safely.
- Dev mock result mapping, conversion preview, and local diagnostic capture exist.

What does not exist:

- Avanza integration
- Avanza automation
- Avanza selectors
- Avanza runtime URLs
- Avanza credential handling
- real broker result capture from Avanza
- real order submission

## Research Safety Rules

- Use `semi_automatic` only.
- Keep automatic execution off.
- Do not press final `KOP`, `SALJ`, `KÖP`, `SÄLJ`, or equivalent final confirmation buttons.
- Prefer research outside active trading pressure.
- Prefer non-executing states if available.
- Stop before final confirmation.
- Do not store Avanza credentials in the repo, docs, screenshots, terminal history, or test fixtures.
- Do not store screenshots with account numbers, balances, holdings, personal identifiers, or session details.
- Blur or remove account numbers, balances, holdings, personal names, and any other private data before saving a screenshot.
- Do not document personal identifiers.
- Do not use real order submission as part of research.
- Do not scrape account data.
- Do not create or save browser automation scripts.
- Do not add Avanza URLs to app runtime.
- Record unknowns instead of guessing.

## Manual Mapping Checklist

Use this checklist while manually inspecting the order flow:

- Login/session state:
  - How does the logged-in state appear?
  - What happens when the session is expired?
  - Is there a clear re-authentication prompt?
- Search instrument flow:
  - Where is instrument search started?
  - What visible label or placeholder identifies search?
  - How are results displayed?
- Instrument selection:
  - How is the intended instrument selected?
  - What confirms the chosen instrument?
  - Are there duplicate or similarly named instruments?
- Buy/sell toggle:
  - What labels represent buy and sell?
  - Does the page default to one action?
  - Does switching action reset any fields?
- Quantity field:
  - What label identifies quantity?
  - What input constraints exist?
  - What validation appears for zero, blank, decimal, or too-large values?
- Order type field:
  - What order types are available?
  - Is the control a select, tabs, buttons, or another UI pattern?
  - Does changing order type affect price fields?
- Limit/market handling:
  - Is market order available?
  - Is limit order default?
  - Are there warnings for market orders?
- Price field:
  - What label identifies the price field?
  - What decimal format is accepted?
  - How are invalid tick sizes handled?
- Review/confirmation step:
  - Is there an intermediate review step?
  - What data is summarized before final confirmation?
  - What warnings appear?
- Error states:
  - What happens for missing fields?
  - What happens for invalid quantity or price?
  - What happens if the instrument is not tradable?
- Validation messages:
  - Capture visible text exactly when safe.
  - Note whether validation appears inline, in a banner, or in a modal.
- Final confirmation button labels:
  - Document labels only.
  - Do not click final confirmation.
- Confirmation/receipt page:
  - If reachable without a real submit, document structure only.
  - Do not create a real receipt by submitting an order.
- Cancel/back flow:
  - How can a user return from review to edit?
  - What happens to filled fields?
- Session timeout behavior:
  - What message appears?
  - Are fields preserved?
  - Is re-authentication required?

## Data To Capture

For each step, capture sanitized notes:

- visible label text
- field purpose
- element type: input, select, button, tab, link, checkbox, modal, banner
- required or optional status
- validation messages
- stable visual anchors
- visible accessibility labels, if any
- sanitized screenshots only when private information is removed
- dynamic behavior notes
- unknowns and follow-up questions

Do not capture:

- credentials
- account numbers
- balances
- holdings
- personal identifiers
- raw browser storage
- cookies
- session tokens
- unsanitized screenshots

## Mapping Template

Use this table for each manually observed flow:

| Step | UI element | Label text | User action | Expected state | Risk level | Notes | Future mock equivalent field | Future selector strategy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Instrument search | Search input | TBD | Type ticker/name | Results appear | Medium | Watch for duplicate instruments | `ticker` | Prefer accessible label or stable visible relation if later approved |
| Instrument selection | Result row/button | TBD | Select intended instrument | Order ticket shows instrument | Medium | Confirm exchange/list identity | `ticker` | Do not define selectors until manual research is reviewed |
| Action | Buy/sell control | TBD | Choose buy or sell | Ticket action changes | High | Final action must match Ture request | `action` | Prefer semantic control if available |
| Quantity | Quantity input | TBD | Enter quantity | Quantity accepted or validation shown | High | Must match handoff exactly | `quantity` | Prefer label-associated input if later approved |
| Order type | Order type control | TBD | Choose limit/market | Relevant fields appear | High | Market orders may have extra warnings | `orderType` | Prefer labeled select/radio/tab if later approved |
| Price | Price input | TBD | Enter price | Price accepted or validation shown | High | Tick-size behavior matters | `limitPrice` / `intendedPrice` | Prefer label-associated input if later approved |
| Review | Review button | TBD | Click review only if safe | Review summary appears | High | Stop before final submit | review-only action | Prefer visible text + state guard if later approved |
| Final confirmation | Final button | TBD | Do not click | Not clicked | Critical | Document label only | none | Automation prohibited until separate approval |

## Comparison To Mock Page

After manual notes exist, compare Avanza observations to local mock contracts:

- `MockOrderPageFillPlan`
- `MOCK_ORDER_PAGE_AGENT_SELECTORS`
- mock order page review behavior
- `MockOrderConfirmationPayload`
- mock confirmation selector contract
- `DevMockBrokerExecutionResult`

Questions to answer before any automation design:

- Does every required Avanza field map to an existing mock fill-plan field?
- Are additional fields needed for account, market, validity, currency, or instrument exchange?
- Does Avanza have validation states not represented by the mock page?
- Does Avanza have a review step that matches the mock review-only model?
- What confirmation states exist, and do they map to the mock confirmation statuses?
- Are there manual safety checks missing from Ture's handoff?

If there is a gap, update the mock contract first. Do not jump directly to Avanza automation.

## Out Of Scope

- Avanza automation.
- Browser automation against Avanza.
- Avanza runtime URLs.
- Avanza selectors in app code.
- Final submit.
- Real order creation.
- Account scraping.
- Credential storage.
- Production automatic mode.
- Broker result capture from Avanza.
- Supabase persistence of Avanza research data.
- Any code path that opens Avanza.

## Recommended Manual Research Session Protocol

Before the session:

- Confirm automatic execution is off.
- Prepare a sanitized notes file outside any credential store.
- Decide whether screenshots are necessary.
- If screen recording is used, hide or crop private data first.
- Define the stop point: before final confirmation.

During the session:

- Manually navigate the order flow.
- Record visible labels and state transitions.
- Capture validation messages only when safe.
- Stop before final confirmation.
- Do not submit any order.
- Do not copy credentials, cookies, account identifiers, or balances.

After the session:

- Sanitize notes and screenshots.
- Remove private data before adding anything to the repo.
- List unknowns and questions.
- Compare observations with the mock page contracts.
- Decide whether the mock contract needs another iteration before any future Avanza work.

## Recommended Next Action

Preferred:

- Action 233 - Avanza UI Research Notes Template

Alternative:

- Action 233 - Manual Avanza Mapping Session

Create the notes template first so the first manual mapping session has a consistent, sanitized structure.
