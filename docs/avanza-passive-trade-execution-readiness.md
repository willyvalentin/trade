# Avanza Passive Trade Execution Readiness

## Current Status

`lib/avanza-passive-trade-execution-readiness.ts` adds passive execution readiness metadata for recommendation-like and live-position-like inputs.

The layer is model/dev-QA only. It prepares future read-only card visibility for entry BUY readiness, exit SELL readiness, and settlement readiness without activating execution.

## What It Computes

- recommendation BUY readiness;
- live-position SELL/exit readiness;
- incomplete profile;
- missing trade package;
- missing ticker;
- missing side;
- missing quantity;
- missing limit price;
- blocked market order;
- local-dev only readiness;
- hard stops and passive next steps.

## Fixture Visibility

`lib/avanza-passive-trade-execution-readiness-fixtures.ts` and `components/execution/AvanzaPassiveTradeExecutionReadinessHarness.tsx` expose static fixture/model-only visibility on the isolated dev-only Avanza visual QA route.

The route section says fixture/model only, recommendation readiness modeled, live-position exit readiness modeled, entry BUY readiness modeled, exit SELL readiness modeled, settlement readiness modeled, and local-dev only.

## Card-Level Read-Only Adapter

`lib/avanza-trade-card-execution-readiness-adapter.ts` now converts this passive readiness metadata into read-only card labels, badges, severity, tooltip text, warnings, and blocked reasons. It prepares future passive card visibility and does not activate execution.

`app/trade-app.tsx` now includes a default-off, feature-flagged display path for
this card-level read-only adapter. `ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE`
defaults to `false`, so no badge renders in the default Trade UI. If explicitly
enabled in code/dev, the badge can display passive recommendation BUY and
live-position SELL/exit readiness metadata only; it does not activate handoff,
order preparation, browser automation, API calls, fetch, polling, smoke tests,
order submission, Supabase writes, or final KÖP/SÄLJ clicks.

## Safety Boundary

This metadata shows theoretical readiness only. It does not start handoff, does not prepare orders, cannot run smoke tests, cannot call APIs, cannot fetch or poll, cannot start browser automation, cannot access credentials, cannot read cookies/session, cannot automate BankID, cannot submit orders, cannot click final KÖP/SÄLJ, cannot write Supabase, and is not production-ready.

Hard stops remain:

- final KÖP/SÄLJ human-only;
- no order submission;
- no BankID automation;
- no cookies/session;
- no Trade UI execution wiring;
- no API route wiring;
- local-dev only.

## Non-Goals

- No default-on Trade UI recommendation card display.
- No default-on live-position card display.
- No active handoff button.
- No prepare button.
- No buy/sell CTA.
- No API route integration.
- No smoke test invocation from UI.
- No browser action.
- No production readiness claim.
