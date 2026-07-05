# Avanza Trade UI Prepare Intent Visibility Phase Completion Checkpoint

Date: 2026-07-05

Phase status:
`avanza_trade_ui_prepare_intent_visibility_phase_complete`

## Current Status

The Trade UI prepare intent visibility layer is complete at the
fixture/model-only level.

The pure prepare intent model exists at:

- `lib/avanza-trade-ui-prepare-intent.ts`

Static fixtures exist at:

- `lib/avanza-trade-ui-prepare-intent-fixtures.ts`

The isolated harness exists at:

- `components/execution/AvanzaTradeUiPrepareIntentHarness.tsx`

The dev-only Avanza visual QA route renders the prepare intent section as
fixture/model-only content:

- `app/dev/avanza-visual-qa/page.tsx`

The route remains unlinked from main navigation.

## Non-Wiring Guarantees

The prepare intent visibility layer did not edit `app/trade-app.tsx`.

A later hard-disabled wiring step added a minimal
`buildAvanzaTradeUiPrepareIntent({ mode: "disabled", prepareEnabled: false })`
invocation inside the existing disabled/default-off Trade UI branch. That later
step does not change this visibility layer: no prepare UI renders by default and
the disabled API route remains uncalled.

The prepare intent visibility layer did not edit the disabled API route:

- `app/api/dev/avanza/fill-only/stub/route.ts`

Prepare intent is not wired into Trade UI. The visibility layer keeps:

- no active handoff
- no active prepare button
- no buy/sell CTA
- no API route call
- no localhost calls
- no bridge calls
- no fetch/polling
- no Avanza/browser control
- no real fill behavior
- no order/click/review/final/submit behavior

The visibility layer does not handle credentials, sessions, BankID, cookies,
browser storage, or Supabase writes.

## Default Safety Flags

The default prepare intent state remains disabled:

- `prepareEnabled: false` by default
- `canRenderPrepare: false` by default
- `canClickPrepare: false` by default
- `canCallApiRoute: false` by default
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canControlBrowser: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

Controls remain disabled and the gate remains locked.

## Completion Result

The prepare intent model, fixtures, harness, and dev QA route visibility section
are ready for inspection as passive metadata only. No production readiness is
claimed.

The next phase is planning for hard-disabled Trade UI prepare intent wiring:

- `docs/avanza-hard-disabled-trade-ui-prepare-intent-wiring-plan.md`

The later hard-disabled wiring safety audit is recorded in:

- `docs/avanza-hard-disabled-trade-ui-prepare-intent-wiring-safety-audit.md`

The combined prepare intent and hard-disabled wiring phase is closed in:

- `docs/avanza-trade-ui-prepare-intent-hard-disabled-wiring-phase-completion-checkpoint.md`

The next phase is the disabled internal prepare button shell plan:

- `docs/avanza-disabled-internal-prepare-button-shell-plan.md`
