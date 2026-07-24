# Avanza Trade Card Readiness Badge Visual Preview

## Current Status

The isolated dev-only Avanza visual QA route now includes a fixture/model-only
visual preview for the Trade card execution readiness badge enabled state.

The preview is implemented by:

- `components/execution/AvanzaTradeCardExecutionReadinessVisualPreview.tsx`;
- `components/execution/AvanzaTradeCardExecutionReadinessVisualPreviewHarness.tsx`;
- the isolated section in `app/dev/avanza-visual-qa/page.tsx`.

## Purpose

The preview shows how the read-only badge would look on Trade recommendation
and live-position cards if the badge feature flag were conceptually enabled for
dev QA review.

It does not enable the production/default flag and does not change default Trade
UI behavior.

The broader UI strategy remains intentionally minimal. More execution capability
should be represented in hidden/headless contracts such as
`docs/avanza-headless-execution-data-contract.md`, not by adding visual clutter
to recommendation cards. This visual badge preview remains optional,
default-off, and dev-QA only.

Headless execution selection is documented in
`docs/avanza-headless-execution-contract-selector.md`. It lets a future agent
consume a selected contract without exposing extra card UI.

Exits outrank entries, stop-loss exits outrank target exits, and target exits
outrank entries inside that headless selector.

## Fixture Coverage

The visual preview uses static adapter fixtures only:

- recommendation BUY card with readiness badge;
- live-position SELL/exit card with readiness badge;
- incomplete profile card with warning badge;
- blocked market-order card;
- missing quantity/limit-price card;
- local-dev-only info card.

## Default Behavior

`ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE` remains `false`.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`.

The default Trade UI remains unchanged. No badge renders by default.

## Safety Boundary

The preview is dev QA only, fixture/model only, and read-only. It adds no active
handoff, no prepare action, no buy/sell CTA, no onClick action, no browser
automation, no API route call, no fetch/polling, no smoke test from UI, no
credential access, no cookies/session handling, no BankID automation, no order
submission, no final KÖP/SÄLJ click, and no Supabase write.

User manual final KÖP/SÄLJ remains the only allowed final action. Agent final
KÖP/SÄLJ remains forbidden.

## Production Readiness

This preview is not production-ready and makes no production-readiness claim.
It exists only to review static badge UI states before any separate decision to
enable the default-off Trade UI badge path.
