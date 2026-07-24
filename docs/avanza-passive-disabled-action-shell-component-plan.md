# Avanza Passive Disabled Action Shell Component Plan

Status: `avanza_passive_disabled_action_shell_component_planned`

## Purpose

Plan a future passive React component for explicit internal/dev-only disabled
action shell metadata.

The component may display internal/dev-only disabled action shell state, but it
must remain passive. It must not create button interactivity, call the API
route, fetch, call localhost or bridge, control a browser, fill a form, submit
an order, or bypass manual confirmation.

The component must remain passive.
The component must not call the API route.
The component must not fetch.
The component must not call localhost or bridge.
The component must not control a browser.
The component must not fill a form.
The component must not submit an order.

Final human confirmation remains mandatory.

## Allowed Future Component Shape

A future implementation may:

- receive a prebuilt action shell model as a prop
- render labels, reason, warnings, blocked reasons, copy lines, and safety flags
- render a disabled/non-clickable visual affordance only if explicitly provided
- render first in an isolated harness or dev QA route section
- keep normal/default Trade UI unchanged
- remain unwired from Trade UI by default

The component must not include:

- no `onClick` handler
- no network or side-effect `useEffect`
- no `fetch`
- no API route path
- no bridge calls
- no localhost calls
- no browser automation
- no Supabase writes

## Required Component Copy

The component must clearly show:

- Internal preview
- Disabled
- No broker action
- No API call
- No order submission
- Final human confirmation required
- Not production ready
- Manual confirmation required in Avanza

## Required Safety Flags

The future component must preserve and display the locked model flags:

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
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The passive disabled action shell component phase must not:

- add active prepare button
- add `onClick`
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
- never write Supabase execution records from passive action shell component phase

## Implementation Sequence

1. Passive disabled action shell component.
2. Component fixtures/harness/dev QA route render.
3. Safety audit.
4. Hard-disabled Trade UI metadata wiring plan.
5. Minimal hard-disabled Trade UI metadata wiring.
6. Only after that, guarded fetch planning.

## Starting Point

The preceding visibility phase is complete:

- `docs/avanza-explicit-internal-disabled-action-shell-visibility-phase-completion-checkpoint.md`

Existing boundaries remain:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- `apiCallIntentEnabled` remains `false`
- `mode` remains `"disabled"`
- default API-call-intent output remains `api_call_intent_disabled`
- the disabled API route returns `api_stub_disabled` by default
- no action shell renders in normal/default UI
- no API route call, fetch, localhost, bridge, Avanza/browser, real fill, order,
  review, confirmation, submit, credential/session, or Supabase behavior exists

## Production Boundary

No production readiness is claimed.

## Implementation Status

The passive disabled action shell component now exists:

- `components/execution/AvanzaPassiveDisabledActionShell.tsx`

The component receives a prebuilt explicit internal/dev-only disabled action
shell model as a prop and renders read-only metadata only: status, label,
reason, optional shell and package identifiers, safe order metadata, copy,
warnings, blocked reasons, confirmation flags, and locked safety flags.

The implementation remains passive and display-only. It has no button element,
no `onClick` handler, no `useEffect`, no fetch, no API route path, no localhost
endpoint, no bridge call, no browser automation, no Avanza interaction, no real
fill, no order/review/confirm/submit behavior, no credential/session handling,
and no Supabase write.

It is not wired into Trade UI. It is rendered only through the isolated action
shell harness/dev QA fixture route with static model data only and still no
execution.

## Isolated Harness And Dev QA Route Visibility

The passive component is now rendered only inside the existing isolated action
shell fixture harness:

- `components/execution/AvanzaExplicitInternalDisabledActionShellHarness.tsx`

The dev-only visual QA route continues to render that harness as fixture/model
data only:

- `app/dev/avanza-visual-qa/page.tsx`

The route section is labelled `Passive component`, `Fixture only`, `Explicit
input only`, `Internal/dev-only`, and `Disabled by default`. This visibility
step does not wire the component into Trade UI, does not change the disabled API
route, and adds no active handoff, active prepare button, buy/sell CTA, API
route call, fetch, localhost/bridge call, polling, Avanza/browser control, real
fill, order/review/confirm/submit behavior, credential/session handling, or
Supabase write.

## Safety Audit

The passive disabled action shell component safety audit is recorded in:

- `docs/avanza-passive-disabled-action-shell-component-safety-audit.md`

The audit confirms the component remains display-only/read-only, receives
prebuilt model props only, is rendered only in the isolated harness/dev QA
fixture route, is not wired into Trade UI, and adds no active controls, API
route call, fetch, localhost/bridge call, polling, Avanza/browser control, real
fill, order/review/confirm/submit behavior, credential/session handling, or
Supabase write.

## Phase Completion And Next Plan

The passive disabled action shell component phase is closed in:

- `docs/avanza-passive-disabled-action-shell-component-phase-completion-checkpoint.md`

The next planning-only phase is:

- `docs/avanza-hard-disabled-trade-ui-action-shell-metadata-wiring-plan.md`

That plan keeps future Trade UI action shell metadata wiring hard-disabled,
inside the existing disabled/default-off branch, hidden by default, non-
rendering in normal/default UI, and separate from API route calls, fetch,
localhost/bridge calls, Avanza/browser control, real fill, order behavior,
credential/session handling, and Supabase writes.
