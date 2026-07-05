# Avanza Real SelectedRecommendation Read-Only Connection Plan

Status: `avanza_real_selected_recommendation_read_only_connection_planned`

## Purpose

This document plans a future real selectedRecommendation read-only connection.

The future connection may use only an already-existing Trade UI
selectedRecommendation-like state/object in `app/trade-app.tsx`. It must use
explicit mapping only, with no discovery, fetch, search, polling, bridge call,
or runtime lookup.

The planned connection is read-only. It must not enable preview by default, must
not enable handoff, and must not enable execution.

## Strict Phase Boundary

This task is planning only.

This phase does not change app code, does not change `app/trade-app.tsx`, does
not connect real selectedRecommendation input, does not wire source extraction
into Trade UI, does not derive previewState, and does not enable preview in
normal/default UI.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

## Allowed Future Connection Shape

A future implementation may:

1. Identify an already-existing selectedRecommendation-like object in
   `app/trade-app.tsx`.
2. Pass that object explicitly into a pure source extraction/helper path.
3. Sanitize and minimize the object before preview model input.
4. Allow read-only preview model input only inside the existing hard-disabled
   branch.
5. Preserve `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW = false`.
6. Preserve normal/default UI unchanged.
7. Preserve `static_fixture` behavior unless explicitly inside the disabled
   branch.
8. Keep `canProceedToHandoff` false.
9. Keep controls disabled.
10. Keep the gate locked.

The future path should compose only existing pure boundaries such as
`lib/avanza-selected-recommendation-source-extraction.ts`,
`lib/avanza-hard-disabled-source-to-preview-integration.ts`,
`lib/avanza-trade-ui-read-only-selected-recommendation-preview-model.ts`, and
the passive
`components/execution/AvanzaTradeUiReadOnlySelectedRecommendationPreview.tsx`
surface.

## Disallowed Connection Shape

The future connection must not add:

- network fetch
- Supabase query
- scanner polling
- bridge or localhost calls
- Avanza account or session data
- browser storage/session/cookie reads
- runtime environment enablement
- localStorage/sessionStorage toggle
- visible toggle
- default Trade UI preview activation
- handoff button
- prepare button
- buy/sell CTA
- runner/fill/click/review/final/submit/order behavior

It must not handle credentials, sessions, BankID metadata, cookies, browser
storage, Supabase auth/session data, Supabase execution records, order
submission metadata, or production execution state.

## Required Future Connection Statuses

A future pure connection model should expose these statuses:

- `connection_disabled`
- `selected_recommendation_unavailable`
- `selected_recommendation_invalid`
- `selected_recommendation_ready_read_only`
- `preview_ready_read_only_blocked`
- `preview_ready_read_only`

## Required Future Output Guarantees

A future model must return:

- `status`
- `label`
- `reason`
- `selectedRecommendationSourceStatus`
- `integrationStatus`
- `modelResult` only for `preview_ready_read_only`
- `canRenderPreview` false by default
- `canProceedToHandoff` false
- `canCallBridge` false
- `canFetchLocalhost` false
- `canPoll` false
- `canExecute` false
- `controlsEnabled` false
- `gateLocked` true

`preview_ready_read_only` must remain read-only and blocked from handoff.

## Required Data Safety Rules

Allowed recommendation fields are limited to safe recommendation data already
present in the Trade UI state/object:

- `id`
- `ticker` or `symbol`
- `action` or `direction`
- `entry` or entry range
- `stopLoss`
- `target`
- `quantity` or `shares`
- `confidence`
- `rationale` if already present and non-sensitive

The future mapping must exclude:

- account ids
- broker session data
- credentials
- cookies
- BankID/session metadata
- browser storage
- Supabase auth/session
- execution records
- order submission metadata

## Future Test Requirements

Future implementation tests must prove:

- no selectedRecommendation returns `selected_recommendation_unavailable`
- invalid selectedRecommendation returns `selected_recommendation_invalid`
- valid selectedRecommendation-like object can produce
  `selected_recommendation_ready_read_only`
- `preview_ready_read_only` can only happen inside the hard-disabled/test-only
  branch
- `modelResult` exists only for `preview_ready_read_only`
- default Trade UI remains visually unchanged
- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- no selectedRecommendation preview renders by default
- no active handoff button exists
- no prepare button exists
- no buy/sell CTA exists
- no bridge/local fetch/polling/execution exists
- no live endpoint strings or exact trigger phrase appear

## Recommended Implementation Sequence

1. Add this connection plan.
2. Add a real selectedRecommendation read-only connection pre-implementation
   checkpoint.
3. Add a pure connection model/helper.
4. Add fixtures and an isolated harness for the connection model.
5. Render the harness on the dev QA route as fixture/model-only.
6. Add a route checkpoint and safety audit.
7. Only later consider hard-disabled Trade UI real-source branch wiring.

Every step must keep default preview disabled, keep normal/default Trade UI
unchanged, keep source extraction unwired from Trade UI until explicitly
planned, and keep all execution paths forbidden.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-pre-implementation-checkpoint.md`
now explicitly permits only a future pure connection model/helper. It keeps app
code unchanged, keeps `app/trade-app.tsx` untouched, keeps real
selectedRecommendation input disconnected, keeps source extraction unwired from
Trade UI, keeps preview disabled by default, and forbids app/route previewState
derivation, storage/env/toggle enablement, handoff, bridge/fetch/polling,
execution, credential/session handling, and Supabase writes.

## Hard-Disabled Real-Source Branch Plan Follow-Up

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-plan.md` now
plans how this pure read-only connection may later be invoked from
`app/trade-app.tsx` only inside the existing hard-disabled branch. The plan
requires explicit selectedRecommendation-like input, keeps
`connectionEnabled` and `allowPreviewModel` false by default, keeps
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, and preserves no
default preview rendering, no app/route previewState derivation, no handoff,
no bridge/local fetch/polling, and no execution.

## Hard-Disabled Real-Source Branch Pre-Implementation Follow-Up

`docs/avanza-hard-disabled-trade-ui-real-source-branch-wiring-pre-implementation-checkpoint.md`
now defines the precise go/no-go boundary before this connection helper may be
referenced from `app/trade-app.tsx`. The allowed future shape remains explicit,
branch-only, hard-disabled by default, and non-executing.

## Current Non-Implementation Guarantee

This planning phase does not connect real selectedRecommendation input, does
not read real selectedRecommendation state from app or route state, does not
derive previewState from app or route state, does not wire source extraction
into Trade UI, and does not change `app/trade-app.tsx`.

No active controls, handoff, prepare, buy/sell CTA, bridge/fetch/polling, order
behavior, credential/session handling, or Supabase write is added.

## Pure Helper Implementation Follow-Up

`lib/avanza-real-selected-recommendation-read-only-connection.ts` now implements
the pure read-only connection helper planned by this document.

The helper remains explicit-input only. It can return
`connection_disabled`, `selected_recommendation_unavailable`,
`selected_recommendation_invalid`, `selected_recommendation_ready_read_only`,
`preview_ready_read_only_blocked`, or `preview_ready_read_only`. `modelResult`
is present only for `preview_ready_read_only`, and all statuses keep handoff,
bridge, localhost fetch, polling, execution, controls, and gate safety limits
enforced.

The helper is not wired into Trade UI or the dev route. Source extraction
remains not wired into Trade UI, real selectedRecommendation input is not
connected/read/rendered in Trade UI,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, and default
Trade UI remains visually unchanged.

## Fixtures And Harness Follow-Up

`lib/avanza-real-selected-recommendation-read-only-connection-fixtures.ts`
covers `connection_disabled`, `selected_recommendation_unavailable`,
`selected_recommendation_invalid`, `selected_recommendation_ready_read_only`,
`preview_ready_read_only_blocked`, and `preview_ready_read_only`.

`components/execution/AvanzaRealSelectedRecommendationReadOnlyConnectionHarness.tsx`
renders those fixture results for isolated test/dev visibility only. The
harness is not rendered in Trade UI. It is now rendered on the dev-only visual
QA route as fixture/model-only content, and the fixtures do not connect real
Trade UI selectedRecommendation state.

## Route Section Planning Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-plan.md`
now plans a future dev-only visual QA route section for the isolated connection
harness.

The plan is fixture/model-only and does not render the harness yet. It keeps
`app/dev/avanza-visual-qa/page.tsx` unchanged, keeps `app/trade-app.tsx`
unchanged, keeps the helper/harness unwired from Trade UI and the dev route,
keeps real selectedRecommendation input disconnected from runtime surfaces, and
continues to forbid app/route previewState derivation, handoff, bridge/fetch,
polling, execution, credential/session handling, and Supabase writes.

## Route Section Pre-Implementation Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-pre-implementation-checkpoint.md`
now permits only a future fixture/model-only dev-route section for the isolated
connection harness.

The checkpoint does not render the harness yet. It keeps `app/trade-app.tsx`
unchanged, keeps `app/dev/avanza-visual-qa/page.tsx` unchanged for this task,
keeps the helper/harness unwired from Trade UI and the dev route, keeps real
selectedRecommendation input disconnected, keeps source extraction unwired from
Trade UI, keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, and
forbids previewState derivation from app or route state, active controls,
handoff, bridge/fetch/polling, execution, credential/session handling, and
Supabase writes.

## Route Section Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders the isolated real
selectedRecommendation read-only connection harness with static connection
fixtures only.

This route-only render does not change Trade UI. `app/trade-app.tsx` remains
unchanged, real selectedRecommendation input remains disconnected from Trade UI,
source extraction remains unwired from Trade UI,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, default Trade
UI remains visually unchanged, and no previewState is derived from app or route
state.

## Route Section Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md`
now records the completed fixture/model-only dev-route section for the isolated
connection harness.

The checkpoint confirms all six connection statuses are visible, the ready
preview state remains read-only/model-only, `modelResult` appears only for
`preview_ready_read_only`, safe summaries exclude credential/session/account/
cookie/storage/broker-secret data, Trade UI remains unwired, default preview
remains disabled, and no previewState is derived from app or route state.

## References

- [Avanza real selectedRecommendation read-only connection route section checkpoint](avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md)
- [Avanza real selectedRecommendation read-only connection safety audit](avanza-real-selected-recommendation-read-only-connection-safety-audit.md)
- [Avanza real selectedRecommendation read-only connection phase completion checkpoint](avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md)
- [Avanza real selectedRecommendation read-only connection pre-implementation checkpoint](avanza-real-selected-recommendation-read-only-connection-pre-implementation-checkpoint.md)
- [Avanza test-only enabled branch phase completion checkpoint](avanza-test-only-enabled-branch-phase-completion-checkpoint.md)
- [Avanza test-only enabled branch safety audit](avanza-test-only-enabled-branch-safety-audit.md)
- [Avanza test-only enabled preview route section checkpoint](avanza-test-only-enabled-preview-route-section-checkpoint.md)
- [Avanza hard-disabled Trade UI branch wiring phase completion checkpoint](avanza-hard-disabled-trade-ui-branch-wiring-phase-completion-checkpoint.md)
- [Avanza hard-disabled source-to-preview integration phase completion checkpoint](avanza-hard-disabled-source-to-preview-integration-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation source mapping phase completion checkpoint](avanza-selected-recommendation-source-mapping-phase-completion-checkpoint.md)
- [Avanza read-only real selectedRecommendation dev preview plan](avanza-read-only-real-selected-recommendation-dev-preview-plan.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)

## Safety Audit Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-safety-audit.md`
now confirms the explicit-input connection path remains static-fixture-only on
the dev route, unwired from Trade UI, disconnected from real
selectedRecommendation runtime state, and non-executable. It records that
`preview_ready_read_only` is read-only/model-only, `modelResult` is limited to
that status, and all handoff, bridge, localhost fetch, polling, execution,
control, and gate safety limits remain enforced.

## Phase Completion Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md`
now closes the real selectedRecommendation read-only connection phase. It
confirms the helper, fixtures, isolated harness, dev-route fixture/model-only
section, and safety audit are complete, and recommends hard-disabled Trade UI
real-source branch wiring planning as the next phase.
