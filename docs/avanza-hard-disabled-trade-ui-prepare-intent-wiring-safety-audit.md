# Avanza Hard-Disabled Trade UI Prepare Intent Wiring Safety Audit

Date: 2026-07-05

Audit status:
`avanza_hard_disabled_trade_ui_prepare_intent_wiring_safety_audit_passed`

## Scope

This audit covers the minimal hard-disabled Trade UI prepare intent wiring in
`app/trade-app.tsx`.

The wiring imports `lib/avanza-trade-ui-prepare-intent.ts` and invokes
`buildAvanzaTradeUiPrepareIntent({ mode: "disabled", prepareEnabled: false })`
only inside the existing hard-disabled/default-off branch.

The disabled local-only API route remains separate:

- `app/api/dev/avanza/fill-only/stub/route.ts`

That route still returns `api_stub_disabled` by default and is not wired into
Trade UI.

## Isolation Result

The audit confirms:

- `app/trade-app.tsx` contains minimal hard-disabled prepare intent wiring
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- prepare intent invocation exists only inside the hard-disabled/default-off branch
- `prepareEnabled` is `false` by default
- `mode` is `disabled` by default
- output is `prepare_disabled` metadata only
- default Trade UI remains visually unchanged
- no prepare UI renders by default
- no prepare button exists
- no active handoff button exists
- no buy/sell CTA exists
- no API route call exists from Trade UI
- `app/trade-app.tsx` does not reference the API route path
- API route was not changed by this wiring task
- API route still returns `api_stub_disabled` by default

## Safety Flags

The disabled prepare intent output keeps:

- `prepareEnabled: false`
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
- `userMustConfirm: true`
- `finalHumanClickRequired: true`

## Forbidden Behavior Confirmed Absent

The hard-disabled wiring adds no:

- localhost calls
- bridge calls
- fetch behavior from Trade UI
- polling behavior
- execution behavior
- Avanza/browser control
- real fill behavior
- order behavior
- review/confirm/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase execution write

No production readiness is claimed.

## Validation Coverage

Focused tests assert that the helper import and single invocation remain inside
the disabled/default-off branch, that the branch uses `prepareEnabled: false`
and `mode: "disabled"`, and that Trade UI does not reference the disabled API
route path or introduce fetch, localhost, bridge, polling, browser, fill,
order, credential/session, or Supabase behavior.

The UI safety guard also continues to pass.

## Result

The hard-disabled Trade UI prepare intent wiring is isolated, unreachable by
default, metadata-only, and incapable of API-route, bridge, browser, fill,
order, review, confirm, submit, credential, or Supabase behavior.

The phase is closed in:

- `docs/avanza-trade-ui-prepare-intent-hard-disabled-wiring-phase-completion-checkpoint.md`

The next phase is planning for a disabled internal prepare button shell:

- `docs/avanza-disabled-internal-prepare-button-shell-plan.md`

That follow-on phase now has a pure explicit-input helper:

- `lib/avanza-disabled-internal-prepare-button-shell.ts`

The helper maps prepare intent metadata into hidden, disabled, blocked,
ready-internal-disabled, error, or unknown shell states. It defaults to hidden,
does not render UI, is not imported by `app/trade-app.tsx`, is not imported by
the dev QA route, is not imported by the disabled API route, and cannot call
the API route, bridge, localhost, Avanza/browser, fill, review, confirmation,
submit, order, credential/session handling, or Supabase execution writes.

The fixture/model-only visibility layer for the disabled internal prepare
button shell now exists:

- `lib/avanza-disabled-internal-prepare-button-shell-fixtures.ts`
- `components/execution/AvanzaDisabledInternalPrepareButtonShellHarness.tsx`
- static dev QA route section in `app/dev/avanza-visual-qa/page.tsx`

The visibility layer remains static and non-executing. It is not linked from
main navigation, is not imported by `app/trade-app.tsx`, does not change the
disabled API route, and adds no active prepare button, active handoff,
buy/sell CTA, API route call, bridge call, localhost fetch, polling,
Avanza/browser control, real fill, review, confirmation, submit, order,
credential/session handling, or Supabase execution write.
