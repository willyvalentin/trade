# Avanza Explicit Internal/Dev-Only Disabled Action Shell Plan

Status: `avanza_explicit_internal_disabled_action_shell_planned`

## Purpose

Plan a future internal/dev-only disabled action shell around the existing
prepare/API-call intent metadata.

The shell may visually communicate that a future internal prepare action exists,
but it must remain disabled by default and must not call the API route, fetch,
call localhost, call bridge, control a browser, fill a form, submit an order, or
bypass the final human confirmation requirement.

Final human confirmation remains mandatory.

## Future Allowed Shape

A future implementation may proceed only in this order:

1. Pure explicit internal disabled action shell model/helper.
2. Fixtures, harness, and dev QA route section.
3. Passive disabled action shell component.
4. Hard-disabled Trade UI metadata wiring.
5. Safety audit.
6. Only after that, guarded fetch planning.

Allowed future boundaries:

- pure model/helper first
- fixture/harness/dev QA section second
- optional passive component later
- Trade UI wiring only behind the existing hard-disabled/default-off branch
- normal/default UI remains unchanged
- explicit internal/dev-only visibility guard false by default
- button disabled and non-clickable
- no `onClick` handler
- no API route path in normal/default path
- no fetch

## Future Statuses

The future model may expose:

- `action_shell_hidden`
- `action_shell_disabled`
- `action_shell_blocked`
- `action_shell_ready_internal_disabled`
- `action_shell_error`
- `unknown`

## Required Copy

Any future passive shell or harness must clearly show:

- Internal preview
- Disabled
- No broker action
- No API call
- No order submission
- Final human confirmation required
- Not production ready
- Manual confirmation required in Avanza

## Required Safety Flags

The future default output must keep:

- `actionShellEnabled: false`
- `canRenderActionShell: false`
- `canClickAction: false`
- `canCallApiRoute: false`
- `canFetch: false`
- `canFetchLocalhost: false`
- `canCallBridge: false`
- `canControlBrowser: false`
- `canFillForm: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

This planning phase and any later disabled shell phase must not:

- add active prepare button in planning phase
- call API route
- add fetch
- add active handoff
- add buy/sell CTA
- call localhost
- call bridge
- call Avanza/browser
- add real fill
- submit order
- never click Granska köp
- never click Granska sälj
- never open review modal
- never click Bekräfta köp
- never click Bekräfta sälj
- never handle credentials
- never handle BankID
- never read cookies/session/localStorage
- never store Avanza session state
- never bypass manual confirmation
- never write Supabase execution records from disabled action shell phase

## Starting Point

The preceding phase is complete:

- `docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-phase-completion-checkpoint.md`
- `docs/avanza-hard-disabled-trade-ui-api-call-intent-wiring-safety-audit.md`

The existing Trade UI API call intent metadata remains hard-disabled:

- `apiCallIntentEnabled: false`
- `mode: "disabled"`
- default output: `api_call_intent_disabled`
- no API call intent UI renders by default
- no API route path is referenced from Trade UI
- no API route call, fetch, localhost, bridge, Avanza/browser, real fill, order,
  review, confirmation, submit, credential/session, or Supabase behavior exists

## Production Boundary

No production readiness is claimed.

## Pure Model/Helper Status

The pure explicit internal/dev-only disabled action shell model/helper now
exists:

- `lib/avanza-explicit-internal-disabled-action-shell.ts`

It exports:

- `AvanzaExplicitInternalDisabledActionShellStatus`
- `AvanzaExplicitInternalDisabledActionShellMode`
- `AvanzaExplicitInternalDisabledActionShellModel`
- `AvanzaExplicitInternalDisabledActionShellSafetyFlags`
- `buildAvanzaExplicitInternalDisabledActionShell(...)`

The helper is explicit-input only and defaults to `action_shell_hidden` with
`actionShellEnabled: false`, `canRenderActionShell: false`, `canClickAction:
false`, `canCallApiRoute: false`, `canFetch: false`, `canFetchLocalhost:
false`, `canCallBridge: false`, `canControlBrowser: false`, `canFillForm:
false`, `canClickReview: false`, `canClickConfirm: false`, `canSubmitOrder:
false`, `canHandleCredentials: false`, `canReadCookies: false`,
`canReadBankId: false`, `canWriteSupabaseExecution: false`,
`userMustConfirm: true`, `finalHumanClickRequired: true`, `controlsEnabled:
false`, and `gateLocked: true`.

## Fixture/Harness Visibility Status

The fixture and harness visibility layer now exists:

- `lib/avanza-explicit-internal-disabled-action-shell-fixtures.ts`
- `components/execution/AvanzaExplicitInternalDisabledActionShellHarness.tsx`

The dev-only Avanza visual QA route renders the harness as a fixture/model-only
section:

- `app/dev/avanza-visual-qa/page.tsx`

The fixtures cover `action_shell_hidden`, `action_shell_disabled`,
`action_shell_blocked`, `action_shell_ready_internal_disabled`,
`action_shell_error`, `unknown`, disabled API-call-intent input, blocked
API-call-intent input, safe BUY and SELL internal-disabled inputs, failed
input, hidden default input, disabled mode, internal-disabled mode, missing
`apiCallIntent`, and unsafe input.

This visibility layer is not wired into Trade UI, does not change
`app/trade-app.tsx`, does not change the disabled API route, contains no route
call behavior, performs no fetch, and adds no localhost, bridge, Avanza/browser,
real fill, order, review/confirm/submit, credential/session, or Supabase
behavior. The route remains unlinked from main navigation and the shell remains
disabled/internal-only.

## Visibility Phase Completion

The fixture/model-only visibility layer is closed in:

- `docs/avanza-explicit-internal-disabled-action-shell-visibility-phase-completion-checkpoint.md`

The next phase is planning a passive disabled action shell component:

- `docs/avanza-passive-disabled-action-shell-component-plan.md`

That future component must remain passive, receive a prebuilt model as props,
avoid `onClick`, avoid API route paths, avoid fetch, and continue to forbid
localhost, bridge, Avanza/browser, real fill, order/review/confirm/submit,
credential/session, and Supabase behavior.

## Passive Component Status

The passive disabled action shell component now exists:

- `components/execution/AvanzaPassiveDisabledActionShell.tsx`

It renders a prebuilt action shell model as read-only metadata only, including
status, label, reason, optional action shell/API intent/visible shell/package
fields, safe BUY/SELL package metadata, copy, warnings, blocked reasons,
confirmation flags, and safety flags.

It remains unwired from Trade UI and separate from the disabled API route. It
is rendered only through the isolated action shell harness/dev QA fixture route.
It has no active controls, no button, no `onClick`, no `useEffect`, no fetch,
no API route path, no localhost endpoint, no bridge call, no Avanza/browser
control, no real fill, no order/review/confirm/submit behavior, no
credential/session handling, and no Supabase write.

The passive component safety audit is documented in
`docs/avanza-passive-disabled-action-shell-component-safety-audit.md`. It
confirms the isolated component/harness/dev QA fixture rendering remains
display-only, fixture/model-only, unwired from Trade UI, and non-executing.

The passive component phase is complete in
`docs/avanza-passive-disabled-action-shell-component-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-plan.md`.

## Minimal Trade UI Metadata Wiring Status

`app/trade-app.tsx` now performs a metadata-only invocation of
`buildAvanzaExplicitInternalDisabledActionShell(...)` inside the existing
disabled/default-off branch. The invocation keeps `actionShellEnabled: false`,
uses `mode: "hidden"`, and discards the result after construction so the branch
remains non-rendering in normal/default Trade UI.

This does not import `AvanzaPassiveDisabledActionShell` into Trade UI and does
not add active controls, API route calls, fetch, localhost/bridge calls,
polling, Avanza/browser control, fill, click, review, final, submit, order
behavior, credential/session handling, or Supabase writes.

The metadata wiring safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-safety-audit.md`.
It confirms the minimal Trade UI invocation remains hidden/default-off,
metadata-only, non-rendering in normal/default UI, and unable to call routes,
fetch, bridge, localhost, Avanza/browser, fill, order, credential/session, or
Supabase behavior.

The hard-disabled Trade UI action shell metadata wiring phase is closed in
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-phase-completion-checkpoint.md`.
The next planning-only phase is `docs/avanza-guarded-fetch-intent-plan.md`.
