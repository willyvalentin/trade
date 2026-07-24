# Avanza Settings Passive Execution Readiness Panel

## Current Status

The app Settings surface now renders a passive Avanza execution readiness panel through `components/execution/AvanzaSettingsPassiveExecutionReadinessPanel.tsx`.

The panel is adjacent to the Ture Settings Avanza execution profile and exposes readiness visibility only. It is read-only/passive Settings UI and does not connect to the Trade UI order flow.

The Settings panel exposes passive readiness only.

## What It Shows

- Avanza Execution Readiness.
- Passive preview only.
- Not connected to Avanza.
- Local-dev smoke tests are separate.
- Profile readiness.
- Login readiness: modeled/local-dev only.
- Instrument search readiness: modeled/local-dev only.
- Order ticket readiness: modeled/local-dev only.
- Settlement reconciliation readiness: modeled/mock only.
- Final KÖP/SÄLJ: human-only.
- Order submission: unavailable.
- BankID automation: forbidden.
- Cookies/session: not used.
- API route: disabled/not wired.
- Browser automation from app: not wired.
- Production readiness: not ready.

## Safety Boundary

The Settings panel does not start handoff, prepare orders, add a buy/sell CTA, run smoke tests, call APIs, fetch, poll, start browser automation, access credentials, read cookies/session, submit orders, click final KÖP/SÄLJ, capture confirmations, write Supabase execution records, or claim production readiness.

It cannot run smoke tests from the Settings UI and is not production-ready.

## Fixture Visibility

`lib/avanza-settings-passive-execution-readiness-fixtures.ts` and `components/execution/AvanzaSettingsPassiveExecutionReadinessPanelHarness.tsx` provide fixture/model-only coverage for:

- settings passive readiness ready;
- incomplete profile;
- local-dev only warning;
- no Trade UI wiring;
- no API route wiring;
- browser automation not wired;
- smoke tests separate;
- final KÖP/SÄLJ human-only;
- production not ready.

The isolated dev-only Avanza visual QA route renders the harness with static fixtures only. That route remains unlinked from main navigation.

## Recommendation/Live-Position Metadata

`lib/avanza-passive-trade-execution-readiness.ts` now models passive recommendation/live-position execution readiness for future read-only card visibility. It adds entry BUY readiness, exit SELL readiness, settlement readiness, blockers, warnings, and hard stops without activating execution.

`lib/avanza-trade-card-execution-readiness-adapter.ts` converts that metadata into card-level read-only badges for future passive card visibility and does not activate execution.

## Non-Goals

- No active handoff.
- No prepare action.
- No Trade UI card integration.
- No API route integration.
- No automatic Avanza navigation from app runtime.
- No smoke tests from UI.
- No cookie/session handling.
- No BUY/SELL order submission.
- No final KÖP/SÄLJ click.
- No Supabase execution write.
- No production readiness claim.
