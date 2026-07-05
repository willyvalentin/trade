# Avanza Real SelectedRecommendation Read-Only Connection Route Section Plan

Status: `avanza_real_selected_recommendation_read_only_connection_route_section_planned`

## Purpose

This document plans how the isolated real selectedRecommendation read-only
connection harness may later be rendered on the dev-only Avanza visual QA route.

The future route section is for visual QA only. It may display static
fixture/model states for the real selectedRecommendation read-only connection
helper, but it must not read real selectedRecommendation state from app or route
state, must not wire Trade UI, must not enable runtime preview, and must not
derive previewState from app or route state.

The route section must remain dev-only, fixture/model-only, explicit candidate
input only, non-handoff, and non-executable.

## Strict Phase Boundary

This task is planning only.

It does not change route code, does not change `app/dev/avanza-visual-qa/page.tsx`,
does not change `app/trade-app.tsx`, does not change app code, does not connect
real selectedRecommendation input, does not read real selectedRecommendation
state, does not derive previewState, and does not enable preview in normal or
default UI.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false.

## Allowed Future Implementation

A future implementation may update `app/dev/avanza-visual-qa/page.tsx` to
import and render
`components/execution/AvanzaRealSelectedRecommendationReadOnlyConnectionHarness.tsx`.

That route section may show only static fixtures from
`lib/avanza-real-selected-recommendation-read-only-connection-fixtures.ts`.

The section must clearly label:

- real selectedRecommendation read-only connection
- Connection fixture only
- Explicit candidate input only
- No Trade UI state is read
- No real selectedRecommendation state is read from app/route
- No real selectedRecommendation state is rendered from app/route
- No previewState is derived
- No Trade UI wiring
- No bridge calls
- No localhost fetch
- No polling
- No execution
- Controls disabled
- Gate locked

The route must remain unlinked from main navigation. The connection helper and
harness must remain unwired from Trade UI. The real connection must remain
disconnected from real Trade UI runtime state.

## Required Visible Fixture Statuses

The future route section must make these fixture statuses visible:

- `connection_disabled`
- `selected_recommendation_unavailable`
- `selected_recommendation_invalid`
- `selected_recommendation_ready_read_only`
- `preview_ready_read_only_blocked`
- `preview_ready_read_only`

## Required Output Visibility Rules

The route section must keep these rules visible and testable:

- `modelResult` appears only for `preview_ready_read_only`
- `normalizedSelectedRecommendationSummary` appears only when safe and available
- `canRenderPreview` is true only for `preview_ready_read_only` with explicit
  `allowPreviewModel: true`
- `canProceedToHandoff` is false for all statuses
- bridge, localhost fetch, polling, and execution are false for all statuses
- controls are disabled
- gate is locked

Safe summaries must exclude account ids, sessions, credentials, cookies,
browser storage, broker secrets, BankID metadata, Supabase auth/session data,
execution records, and order submission metadata.

## Forbidden Behavior

The route section must not add:

- real selectedRecommendation state reads or rendering
- Trade UI wiring
- real runtime preview model connection
- previewState derivation from app or route state
- default Trade UI selectedRecommendation preview
- active handoff button
- prepare button
- buy/sell CTA
- bridge calls
- localhost fetch
- polling
- trigger, fill, click, review, final, submit, or order behavior
- credential, session, BankID, cookie, or storage handling
- Supabase execution writes
- production readiness claims

## Future Test Requirements

Future implementation tests must prove:

- the dev route renders the real selectedRecommendation read-only connection
  harness section
- the route section says Connection fixture only
- the route section says Explicit candidate input only
- the route section says no Trade UI state is read
- the route section says no real selectedRecommendation state is read or
  rendered from app/route
- the route section says no previewState is derived
- all six connection fixture statuses are visible
- `preview_ready_read_only` is labeled read-only/model-only
- `modelResult` appears only for `preview_ready_read_only`
- `normalizedSelectedRecommendationSummary` excludes credentials, sessions,
  accounts, cookies, storage, and broker secrets
- `canRenderPreview` is true only for `preview_ready_read_only` with explicit
  `allowPreviewModel: true`
- controls remain disabled
- the gate remains locked
- no active handoff button exists
- no buy/sell CTA exists
- no prepare button exists
- no live endpoint strings or exact trigger phrase appear
- the route remains unlinked from main navigation
- `app/trade-app.tsx` does not import the real connection helper or harness

## Recommended Implementation Sequence

1. Add this route section plan.
2. Add a route section pre-implementation checkpoint.
3. Render the real selectedRecommendation read-only connection harness on the
   dev QA route as fixture/model-only.
4. Add a route section checkpoint.
5. Add a safety audit.
6. Add a phase completion checkpoint.
7. Only later consider hard-disabled Trade UI real-source branch wiring.

Each step must keep the default Trade UI visually unchanged, keep
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, keep source
extraction unwired from Trade UI, derive no previewState from app or route
state, and keep all execution paths forbidden.

## Pre-Implementation Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-pre-implementation-checkpoint.md`
now defines the go/no-go boundary before the connection harness may be rendered
on the dev-only visual QA route.

The checkpoint permits only a future fixture/model-only route section with
static connection fixtures. It keeps `app/trade-app.tsx` unchanged, keeps the
dev route unchanged for now, keeps the connection helper/harness unwired from
Trade UI and the dev route, keeps real selectedRecommendation input
disconnected, keeps source extraction unwired from Trade UI, keeps
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, and forbids app/route
previewState derivation, active controls, handoff, bridge/fetch/polling,
execution, credential/session handling, and Supabase writes.

## Implementation Follow-Up

The dev-only Avanza visual QA route now renders
`AvanzaRealSelectedRecommendationReadOnlyConnectionHarness` with static real
selectedRecommendation read-only connection fixtures only.

The rendered section remains fixture/model-only and unlinked from main
navigation. It does not read real selectedRecommendation state from app or route
state, does not wire Trade UI, does not connect source extraction to real app
state, does not enable normal/default preview, does not derive previewState from
app or route state, and does not add active controls, handoff, bridge/fetch,
polling, order behavior, credential/session handling, or Supabase writes.

## Route Section Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md`
now documents the completed route section. It records the rendered harness,
static fixture-only data source, all six visible statuses, read-only/model-only
`preview_ready_read_only` behavior, safe summary restrictions, Trade UI
non-wiring, default preview disabled state, and no bridge/fetch/polling/order
behavior.

## Safety Audit Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-safety-audit.md`
now documents the safety audit for the completed fixture/model-only route
section. The audit confirms the route uses only static connection fixtures,
does not import the real connection helper, remains unlinked from main
navigation, leaves `app/trade-app.tsx` unwired, keeps source extraction unwired,
keeps real selectedRecommendation input disconnected from Trade UI, derives no
previewState from app or route state, and adds no active controls or execution
behavior.

## Phase Completion Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md`
now marks the full connection phase complete. The completed route section stays
fixture/model-only, unlinked from main navigation, and separate from Trade UI
runtime state.
