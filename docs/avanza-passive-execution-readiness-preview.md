# Avanza Passive Execution Readiness Preview

## Current Status

`components/execution/AvanzaPassiveExecutionReadinessPreview.tsx` and `lib/avanza-passive-execution-readiness-preview.ts` provide a passive read-only preview of Avanza execution readiness for the Sharp Semi Auto Execution Agent.

This is passive UI/model/dev-QA only. It provides visibility before any active integration and does not activate execution.

## What It Shows

- Ture Settings profile readiness.
- Login readiness as modeled/local-dev only.
- Instrument search readiness as modeled/local-dev only.
- Order ticket readiness as modeled/local-dev only.
- Settlement reconciliation readiness as modeled/mock only.
- Local-dev smoke tests are separate.
- Not connected to Avanza.
- Production readiness is not ready.

## What It Is Not

- It is not a handoff.
- It is not a prepare action.
- It is not a buy/sell CTA.
- It cannot run smoke tests.
- It cannot call APIs.
- It cannot fetch or poll.
- It cannot start browser automation.
- It cannot access credentials.
- It cannot read cookies/session.
- It cannot automate or bypass BankID.
- It cannot submit orders.
- It cannot click final KOP/SALJ.
- It cannot write Supabase.
- It is not production-ready.

## Hard Stops

- Final KOP/SALJ remains human-only.
- Order submission is unavailable.
- BankID automation is forbidden.
- Cookies/session are not used.
- Trade UI execution is not wired.
- API route execution is disabled/not wired.
- Browser automation from app runtime is not wired.

## Safety Flags

The preview always keeps:

- `previewOnly: true`
- `canShowReadiness: true`
- `canStartHandoff: false`
- `canPrepareOrder: false`
- `canRunSmokeTestFromUi: false`
- `canCallApiRoute: false`
- `canFetch: false`
- `canPoll: false`
- `canUseBrowserAutomation: false`
- `canAccessCredentials: false`
- `canReadCookies: false`
- `canExportSession: false`
- `canAutomateBankId: false`
- `canSubmitOrder: false`
- `canClickFinalBuy: false`
- `canClickFinalSell: false`
- `canWriteSupabase: false`
- `canClaimProductionReady: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## Dev QA Visibility

The isolated dev-only Avanza visual QA route renders fixture/model-only preview scenarios through `components/execution/AvanzaPassiveExecutionReadinessPreviewHarness.tsx`.

The route remains unlinked from main navigation and does not read Trade UI state, call APIs, fetch, poll, run smoke tests, access credentials, control a browser, submit orders, click final KOP/SALJ, or write Supabase.

## Settings Visibility

`docs/avanza-settings-passive-execution-readiness-panel.md` documents the app Settings passive readiness panel. The Settings panel exposes this readiness preview beside the Avanza execution profile without starting handoff, preparing orders, adding a buy/sell CTA, calling APIs, fetching, polling, running smoke tests, accessing credentials, handling cookies/session, automating BankID, submitting orders, clicking final KOP/SALJ, writing Supabase, or claiming production readiness.
## Passive Trade Execution Readiness Metadata

`lib/avanza-passive-trade-execution-readiness.ts` now adds recommendation/live-position passive readiness metadata for future read-only card visibility. It models entry BUY readiness, exit SELL readiness, and settlement readiness as fixture/model-only state and does not activate execution.

`lib/avanza-trade-card-execution-readiness-adapter.ts` adds a card-level read-only adapter for future passive card visibility. It converts passive readiness into labels and badges only and does not activate execution.

The Trade UI read-only card badge integration is feature-flagged with
`ENABLE_PASSIVE_TRADE_CARD_EXECUTION_READINESS_BADGE`, which defaults to
`false`. Default Trade UI renders no passive execution readiness badge. When
enabled only in code/dev, the badge remains read-only metadata on
recommendation and live-position cards: no handoff, no prepare action, no
buy/sell CTA, no browser automation, no API call, no fetch/polling, no UI smoke
test, no credential/cookie/session handling, no BankID automation, no order
submission, no final KOP/SALJ click, and no Supabase write.
