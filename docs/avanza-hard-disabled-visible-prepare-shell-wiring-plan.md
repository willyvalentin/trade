# Avanza Hard-Disabled Visible Prepare Shell Wiring Plan

Status: `avanza_hard_disabled_visible_prepare_shell_wiring_planned`

Implementation status:
`avanza_hard_disabled_visible_prepare_shell_wiring_added_minimal_disabled`

## Purpose

Plan and record the minimal hard-disabled Trade UI wiring step for explicit
visible disabled shell metadata.

The implemented wiring remains behind the existing disabled/default-off branch.
The visible shell guard must remain false by default. Normal/default Trade UI
must remain visually unchanged, and no visible shell may render by default.
Normal/default Trade UI must remain visually unchanged.

Final human confirmation remains mandatory.

## Implemented Shape

`app/trade-app.tsx` now imports and uses:

- `lib/avanza-explicit-internal-visible-disabled-prepare-shell.ts`

Implemented constraints:

- usage must be inside the existing disabled/default-off guard only
- base guard must remain false by default
- `visibleShellEnabled` must remain false by default
- mode must remain hidden/disabled by default
- no visible shell by default
- no active button by default
- no route call by default
- no active controls by default
- output may be inspected only inside the disabled/internal branch
- `buildAvanzaExplicitInternalVisibleDisabledPrepareShell(...)` receives
  `mode: "hidden"` and `visibleShellEnabled: false`
- the resulting metadata is explicitly discarded with no UI render

## Allowed Metadata

The hard-disabled branch may model:

- visible shell status
- label/reason
- copy lines
- warnings
- blockedReasons
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

The implemented branch keeps:

- visible shell hidden/disabled by default
- `visibleShellEnabled: false` by default
- `canRenderVisibleShell: false` by default
- `canClickPrepare: false`
- `canCallApiRoute: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canControlBrowser: false`
- `canFillForm: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Absolute Forbidden Behavior

The hard-disabled visible shell wiring must not:

- add an active prepare button
- enable visible shell by default
- wire the API route into normal Trade UI
- call the API route from Trade UI
- call localhost
- call bridge
- call Avanza/browser
- add real fill
- submit order
- click Granska kop
- click Granska salj
- open review modal
- click Bekrafta kop
- click Bekrafta salj
- handle credentials
- handle BankID
- read cookies/session/localStorage
- store Avanza session state
- bypass manual confirmation
- write Supabase execution records from the visible shell wiring phase

No production readiness is claimed.

## Follow-Up Sequence

Completed and recommended sequence:

1. Minimal hard-disabled visible shell model invocation. Completed.
2. Safety audit. Completed in
   `docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`.
3. Phase completion checkpoint. Completed in
   `docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`.
4. Only after that, plan guarded API route call intent. Started in
   `docs/avanza-guarded-api-route-call-intent-plan.md`.
5. Only after that, plan local-only manual test path.

Each step must keep API route calls, localhost calls, bridge calls,
Avanza/browser control, fill, review, confirmation, submit, order,
credential/session handling, and Supabase writes forbidden unless a later
checkpoint explicitly scopes and audits the next boundary.

## Safety Audit

The minimal hard-disabled visible shell Trade UI wiring safety audit is recorded
in `docs/avanza-hard-disabled-visible-prepare-shell-wiring-safety-audit.md`.
It confirms the helper invocation remains inside the default-off branch with
`visibleShellEnabled: false` and `mode: "hidden"`, renders no visible shell in
normal/default UI, does not reference or call the disabled API route from Trade
UI, and adds no active controls, localhost/bridge/fetch/polling,
Avanza/browser, fill, order, credential/session, or Supabase behavior.

## Phase Completion And Guarded Intent Plan

The hard-disabled visible prepare shell wiring phase completion checkpoint is
recorded in
`docs/avanza-hard-disabled-visible-prepare-shell-wiring-phase-completion-checkpoint.md`.

The follow-up guarded API route call intent plan is recorded in
`docs/avanza-guarded-api-route-call-intent-plan.md`. That plan remains
planning-only and forbids API route calls, localhost calls, bridge calls, fetch,
polling, Avanza/browser control, real fill, review, confirmation, submit,
order, credential/session handling, and Supabase execution writes.
