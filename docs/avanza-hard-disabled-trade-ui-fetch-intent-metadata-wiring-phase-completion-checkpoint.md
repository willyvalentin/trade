# Avanza Hard-Disabled Trade UI Fetch Intent Metadata Wiring Phase Completion Checkpoint

Status: `avanza_hard_disabled_trade_ui_fetch_intent_metadata_wiring_phase_complete`

## Current Status

The minimal hard-disabled Trade UI fetch intent metadata wiring phase is
complete.

`app/trade-app.tsx` contains the metadata-only invocation of
`buildAvanzaGuardedFetchIntent(...)`. The invocation remains inside the existing
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` hard-disabled/default-off
branch.

## Completed Artifacts

- guarded fetch intent model/helper: `lib/avanza-guarded-fetch-intent.ts`
- guarded fetch intent visibility completion:
  `docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`
- hard-disabled Trade UI metadata wiring plan:
  `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`
- focused safety audit:
  `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`
- minimal hard-disabled Trade UI metadata invocation in `app/trade-app.tsx`

## Default Behavior

Default Trade UI behavior remains unchanged:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains `false`
- fetch intent model invocation exists only inside the hard-disabled/default-off
  branch
- `fetchIntentEnabled` is false by default
- mode is hidden by default
- output is hidden/disabled metadata only
- output is discarded with `void hardDisabledFetchIntent`
- default Trade UI remains visually unchanged
- no fetch intent UI renders by default
- no action shell UI renders by default
- no API call intent UI renders by default
- no visible shell renders in normal/default UI
- no shell UI renders by default
- no prepare UI renders by default

The passive component is not imported by `app/trade-app.tsx`; passive component is not rendered in Trade UI.

## Safety Guarantees

The completed phase added no:

- active handoff
- active prepare button
- buy/sell CTA
- `onClick` handler for fetch intent
- API route call
- fetch
- localhost calls
- bridge calls
- polling
- Avanza/browser control
- real fill behavior
- order/click/review/final/submit behavior
- credential/session/BankID/cookies/storage handling
- Supabase write

The disabled local-only API route remains separate and disabled by default. No
route path is referenced from `app/trade-app.tsx`.

## Confirmation Boundary

Semi-auto human confirmation remains mandatory:

- `userMustConfirm: true`
- `finalHumanClickRequired: true`

No production readiness is claimed.

## Next Phase

The next phase is planning a disabled local-only manual test path:

- `docs/avanza-disabled-local-only-manual-test-path-plan.md`

That future phase must remain planning-only until explicitly implemented. It
must not add fetch, call the API route, reference the route path from normal
Trade UI, add active UI, call localhost or bridge, control Avanza/browser state,
fill forms, submit orders, handle credentials/sessions, or write Supabase
execution records.

## Manual Test Path Helper Follow-Up

The next phase has started with a pure model/helper:

- `lib/avanza-disabled-local-only-manual-test-path.ts`

The helper remains model-only, explicit-input only, and unwired. It adds no
Trade UI wiring, no dev route section, no API route call, no fetch, no route
path exposure, no active UI, no localhost/bridge calls, no Avanza/browser
control, no real fill, no order behavior, no credential/session handling, and
no Supabase execution write.

The fixture/model-only visibility layer now adds
`lib/avanza-disabled-local-only-manual-test-path-fixtures.ts`,
`components/execution/AvanzaDisabledLocalOnlyManualTestPathHarness.tsx`, and a
static dev QA route section in `app/dev/avanza-visual-qa/page.tsx`. That route
section remains unlinked, fixture-only, non-fetching, non-executing, and
separate from normal/default Trade UI.

The manual test path visibility phase is closed in
`docs/avanza-disabled-local-only-manual-test-path-visibility-phase-completion-checkpoint.md`.
The next phase is planned in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-plan.md`.
That future metadata wiring must remain hard-disabled/default-off, hidden by
default, route-path-free in `app/trade-app.tsx`, non-fetching, non-executing,
and human-confirmation preserving.

The first minimal hard-disabled manual test path metadata invocation now exists
in `app/trade-app.tsx`. It consumes the already-built hard-disabled fetch
intent metadata only inside the same disabled/default-off branch, keeps
`manualTestPathEnabled: false`, uses `mode: "hidden"`, discards output with
`void hardDisabledManualTestPath`, renders no manual test path UI, references no
route path, calls no API route, performs no fetch, and adds no execution
behavior.

The focused safety audit for that follow-up manual test path metadata wiring is
recorded in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-safety-audit.md`.

The hard-disabled Trade UI manual test path metadata wiring phase completion is
recorded in
`docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-phase-completion-checkpoint.md`.

The disabled local-only chain readiness closeout is planned in
`docs/avanza-disabled-local-only-chain-readiness-closeout-plan.md`.
