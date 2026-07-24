# Avanza Trade UI Prepare Intent Hard-Disabled Wiring Phase Completion Checkpoint

Date: 2026-07-05

Phase status:
`avanza_trade_ui_prepare_intent_hard_disabled_wiring_phase_complete`

## Completed Artifacts

The Trade UI prepare intent and hard-disabled wiring phase is complete.

Implemented artifacts:

- pure prepare intent model: `lib/avanza-trade-ui-prepare-intent.ts`
- prepare intent fixtures: `lib/avanza-trade-ui-prepare-intent-fixtures.ts`
- isolated harness: `components/execution/AvanzaTradeUiPrepareIntentHarness.tsx`
- fixture/model-only dev QA route section: `app/dev/avanza-visual-qa/page.tsx`
- minimal hard-disabled Trade UI wiring: `app/trade-app.tsx`
- safety audit: `docs/avanza-hard-disabled-trade-ui-prepare-intent-wiring-safety-audit.md`

## Trade UI State

`app/trade-app.tsx` contains minimal hard-disabled prepare intent wiring.

The current Trade UI state remains:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- prepare intent invocation exists only inside the hard-disabled/default-off branch
- `prepareEnabled: false` by default
- `mode: "disabled"` by default
- output is `prepare_disabled` metadata only
- default Trade UI remains visually unchanged
- no prepare UI renders by default
- no active handoff
- no active prepare button
- no buy/sell CTA
- no API route call

The disabled local-only API route remains separate and uncalled:

- `app/api/dev/avanza/fill-only/stub/route.ts`

It returns `api_stub_disabled` by default.

## Safety Guarantees

The phase confirms:

- no localhost calls
- no bridge calls
- no fetch/polling
- no Avanza/browser control
- no real fill behavior
- no order/click/review/final/submit behavior
- no credential/session/BankID/cookies/storage handling
- no Supabase write

The safety flags remain locked:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `canRenderPrepare: false`
- `canClickPrepare: false`
- `canCallApiRoute: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canControlBrowser: false`
- `canFillForm: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `controlsEnabled: false`
- `gateLocked: true`

No production readiness is claimed.

## Next Phase

The next phase is planning for a disabled internal prepare button shell:

- `docs/avanza-disabled-internal-prepare-button-shell-plan.md`

The first pure model/helper for that phase now exists:

- `lib/avanza-disabled-internal-prepare-button-shell.ts`
- `buildAvanzaDisabledInternalPrepareButtonShell(...)`

It is explicit-input only, defaults to `prepare_shell_hidden`, keeps
`shellEnabled: false`, keeps `canRenderShell: false`, and remains unwired from
Trade UI, the dev QA route, and the disabled API route.

The fixture/model-only visibility layer for that phase now also exists:

- `lib/avanza-disabled-internal-prepare-button-shell-fixtures.ts`
- `components/execution/AvanzaDisabledInternalPrepareButtonShellHarness.tsx`
- fixture/model-only section in `app/dev/avanza-visual-qa/page.tsx`

That section remains unlinked from main navigation and does not wire the shell
into Trade UI or the disabled API route. It displays static shell fixtures only,
including hidden, disabled, blocked, ready-internal-disabled, error, unknown,
safe BUY, and safe SELL examples.

The shell visibility layer is closed in:

- `docs/avanza-disabled-internal-prepare-button-shell-visibility-phase-completion-checkpoint.md`

The next passive component phase is planned in:

- `docs/avanza-passive-disabled-prepare-shell-component-plan.md`

That phase must remain disabled by default and must not call the API route,
localhost, bridge, Avanza/browser, fill, review, confirmation, submit, order,
credential/session handling, or Supabase writes.
