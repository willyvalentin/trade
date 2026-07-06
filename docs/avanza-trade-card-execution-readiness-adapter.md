# Avanza Trade Card Execution Readiness Adapter

## Current Status

`lib/avanza-trade-card-execution-readiness-adapter.ts` converts passive recommendation/live-position execution readiness metadata into read-only card labels, badges, severity, tooltip text, warnings, and blocked reasons.

The adapter prepares future passive card visibility for recommendation cards and live-position cards. It is passive model/component/dev-QA only.

The current Trade UI strategy is intentionally minimal: recommendation cards
stay clean, and deeper Execution Agent data should live under the surface in
headless contracts. `docs/avanza-headless-execution-data-contract.md` now
captures that hidden/agent-readable direction. Visual readiness badges remain
optional, default-off, and dev-QA only.

`docs/avanza-headless-execution-contract-selector.md` extends that direction by
selecting the next agent-readable contract headlessly. Exits outrank entries,
stop-loss exits outrank target exits, and the UI remains visually unchanged.

Trade UI now has a feature-flagged integration path for the read-only badge:
`ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE` defaults to `false`.
When the flag is false, no badge renders in the default Trade UI. When the
flag is enabled in code/dev, the badge can render read-only metadata on
recommendation and live-position cards without activating handoff, order
preparation, API calls, browser automation, or order submission.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false` and is not
changed by this badge integration.

## What It Shows

- Execution readiness: modeled.
- Local-dev only.
- Profile incomplete.
- Missing ticker.
- Missing quantity.
- Missing limit price.
- Final click human-only.
- No order submission.
- Recommendation BUY badge modeled.
- Live-position SELL/exit badge modeled.
- Blocked reasons and warnings.

## Component Boundary

`components/execution/AvanzaTradeCardExecutionReadinessBadge.tsx` renders the adapter result as read-only badge metadata. It has no buttons, no execution links, no CTA, no `onClick`, no fetch, no side effects, and no active controls.

`components/execution/AvanzaTradeCardExecutionReadinessAdapterHarness.tsx` renders static fixtures on the isolated dev-only Avanza visual QA route.

`components/execution/AvanzaTradeCardExecutionReadinessVisualPreview.tsx` and
`components/execution/AvanzaTradeCardExecutionReadinessVisualPreviewHarness.tsx`
render a dev QA visual preview of the badge enabled state using fixture/model
data only. The preview lets the badge UI be reviewed before enabling the
default-off feature flag and does not change default Trade UI behavior.

## Safety Boundary

The adapter does not start handoff, does not prepare orders, cannot run smoke tests, cannot call APIs, cannot fetch or poll, cannot start browser automation, cannot submit orders, cannot click final KÖP/SÄLJ, does not expose credentials, does not use cookies/session, does not automate BankID, cannot write Supabase, and is not production-ready.

All output remains read-only. Final KÖP/SÄLJ remains human-only.

The adapter does not activate execution; it only maps passive readiness into read-only card metadata for inspection.

The Trade card badge integration is also read-only only. It does not add an
active handoff button, prepare action, buy/sell CTA, browser/API/fetch/polling
path, UI smoke-test invocation, credential access, cookies/session handling,
BankID automation, Supabase write, order submission, or final KÖP/SÄLJ click.

The visual preview follows the same boundary: dev QA only, fixture/model only,
no active controls, no API route call, no browser automation, no smoke test from
UI, no credential access, no cookies/session handling, no BankID automation, no
order submission, and no final KÖP/SÄLJ click.

## Non-Goals

- No active handoff button.
- No prepare action.
- No buy/sell CTA.
- No Trade UI card integration with controls.
- No API route integration.
- No local bridge call.
- No smoke test invocation.
- No credential or secure credential-store access.
- No order submission.
- No confirmation capture.
- No production readiness claim.
