# Avanza Hard-Disabled Trade UI Action Shell Metadata Wiring Plan

Status: `avanza_hard_disabled_trade_ui_action_shell_metadata_wiring_implemented_minimal`

## Purpose

Plan a future minimal hard-disabled Trade UI wiring step for disabled action
shell metadata.

The wiring must remain behind the existing disabled/default-off branch. The
action shell guard must remain false by default. No action shell may render in
normal/default UI. No active UI may appear by default.

Default Trade UI must remain visually unchanged. Final human confirmation
remains mandatory.

Purpose summary:

- future minimal hard-disabled Trade UI wiring step
- existing disabled/default-off branch
- action shell guard must remain false by default
- No action shell may render in normal/default UI
- No active UI may appear by default
- Default Trade UI must remain visually unchanged
- Final human confirmation remains mandatory

## Future Allowed Shape

`app/trade-app.tsx` may later import and use:

- `lib/avanza-explicit-internal-disabled-action-shell.ts`

That first metadata-wiring step must not import the passive component unless a
separate plan explicitly allows it later.

Any usage must be inside the existing disabled/default-off guard only:

- base guard remains false by default
- `actionShellEnabled` remains false by default
- mode remains hidden/disabled by default
- no action shell renders by default
- no button renders by default
- no route call happens by default
- no fetch happens by default
- no active controls appear by default
- output may be inspected only inside the disabled/internal branch

## Future Allowed Metadata

The future metadata-only invocation may inspect:

- action shell status
- label/reason
- copy lines
- warnings
- blockedReasons
- actionShellId
- apiCallIntentId if present
- visibleShellId if present
- sourceRecommendationId
- packageId
- side
- ticker/symbol
- quantity
- orderType
- limitPrice if applicable
- accountLabel if safe/present
- userMustConfirm
- finalHumanClickRequired
- safety flags

## Required Output Guarantees

The future default output must remain:

- `action_shell_hidden` or `action_shell_disabled` by default
- `actionShellEnabled: false` by default
- `canRenderActionShell: false` by default
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
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The hard-disabled Trade UI action shell metadata wiring phase must not:

- render action shell in normal/default UI
- add active prepare button
- add active handoff
- add buy/sell CTA
- add `onClick`
- call API route
- add fetch
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
- never write Supabase execution records from action shell metadata wiring phase

## Later Implementation Sequence

1. Minimal hard-disabled Trade UI action shell model invocation.
2. Safety audit.
3. Phase completion checkpoint.
4. Optional hard-disabled passive component wiring plan.
5. Only after that, guarded fetch planning.

## Starting Point

The passive disabled action shell component phase is complete:

- `docs/avanza-passive-disabled-action-shell-component-phase-completion-checkpoint.md`

Existing defaults remain:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `apiCallIntentEnabled` remains `false`
- mode remains `"disabled"`
- default Trade UI remains visually unchanged
- no API call intent UI renders by default
- the disabled API route returns `api_stub_disabled` by default
- no Trade UI API route call exists

## Production Boundary

No production readiness is claimed.

## Minimal Implementation Status

The minimal hard-disabled metadata wiring now exists in `app/trade-app.tsx`.
It imports and invokes
`buildAvanzaExplicitInternalDisabledActionShell(...)` only inside the existing
disabled/default-off read-only selectedRecommendation preview branch.

The invocation remains metadata-only:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `actionShellEnabled` is explicitly `false`
- mode is `"hidden"`
- default output remains `action_shell_hidden`
- the model is discarded with `void hardDisabledActionShell`
- no `AvanzaPassiveDisabledActionShell` component is imported into Trade UI
- no action shell JSX renders in normal/default UI
- no API route path, fetch, localhost, bridge, polling, Avanza/browser control,
  fill, click, review, final, submit, order, credential/session handling, or
  Supabase write was added

## Safety Audit

The metadata wiring safety audit is recorded in
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-safety-audit.md`.
It confirms the action shell invocation remains inside the hard-disabled branch
only, `actionShellEnabled` remains `false`, mode remains `"hidden"`, no passive
action shell component is imported into Trade UI, no UI renders by default, the
disabled API route remains unwired, and no fetch, localhost/bridge call,
polling, Avanza/browser control, fill, review, confirm, submit, order,
credential/session handling, or Supabase write was added.

The phase is closed in
`docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-phase-completion-checkpoint.md`.
The next planning-only phase is
`docs/avanza-guarded-fetch-intent-plan.md`, which plans a pure guarded fetch
intent model without adding fetch, API route calls, route path usage in Trade
UI, active UI, localhost/bridge calls, Avanza/browser control, fill, order,
credential/session handling, or Supabase writes.
