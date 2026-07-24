# Avanza Read-Only SelectedRecommendation Dev Preview Guard Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_dev_preview_guard_checkpoint_added`

Route section checkpoint status:
`avanza_read_only_selected_recommendation_dev_preview_route_section_checkpoint_added`

## Current Status

The read-only selectedRecommendation dev preview guard, fixtures, and harness
phase is complete as a model-only and fixture-only checkpoint. The harness is
now rendered on the isolated dev-only visual QA route as a fixture/model-only
section.

Current state:

- default guard is hidden
- guard and harness are not wired into Trade UI
- guard harness is rendered in the dev route as fixture/model-only content
- existing dev route remains fixture-only
- selectedRecommendation preview disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Implemented Pure Guard/Model

`lib/avanza-read-only-selected-recommendation-dev-preview-guard.ts` defines the
pure guard decision.

Default guard behavior:

- `status: hidden`
- cannot read real selectedRecommendation
- cannot derive preview state
- cannot render read-only preview
- fixture fallback remains available by default
- no bridge calls
- no localhost fetch
- no polling
- no execution
- controls disabled
- pre-activation gate locked

## Implemented Fixtures

`lib/avanza-read-only-selected-recommendation-dev-preview-fixtures.ts` provides
static fixture states:

- default hidden
- blocked production-forbidden
- `read_only_dev_preview_allowed`

`read_only_dev_preview_allowed` exists only as fixture/model state. The allowed
fixture models future read-only capability only. It does not wire real
selectedRecommendation state, render real selectedRecommendation state, call
the bridge, fetch localhost, poll, execute, enable controls, or unlock the
gate.

## Implemented Isolated Harness

`components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx`
renders the guard fixtures for isolated test/dev visibility.

The harness remains isolated:

- harness is not rendered in `app/trade-app.tsx`
- harness is rendered in `app/dev/avanza-visual-qa/page.tsx` as a
  fixture/model-only section
- harness does not read app state
- harness does not read real selectedRecommendation state
- harness does not import `app/trade-app.tsx`
- harness does not import the dev route
- harness does not expose active controls

## Default Behavior

Default behavior remains hidden and non-wired:

- default guard is hidden
- default cannot read real selectedRecommendation
- default cannot derive preview state
- default cannot render read-only preview
- fixture fallback remains available by default
- selectedRecommendation preview disabled by default in Trade UI
- existing dev route remains fixture-only
- controls disabled
- pre-activation gate locked

## Allowed Fixture/Model-Only Behavior

The `read_only_dev_preview_allowed` fixture may show:

- model-only read permission for real selectedRecommendation
- model-only preview-state derivation permission
- model-only read-only preview rendering permission

This is not route wiring and not Trade UI wiring. It is a future planning state
only. It still forbids execution, fill, trigger, bridge calls, localhost
fetches, polling, enabled controls, and unlocked gates.

## Safety Guarantees

This checkpoint preserves these guarantees:

- dev route harness section is fixture/model-only
- no real selectedRecommendation state is read
- no real selectedRecommendation state is rendered
- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## What Remains Not Implemented

Not implemented:

- no harness wiring into Trade UI
- no real selectedRecommendation wiring into the dev route
- no real selectedRecommendation derivation
- no real selectedRecommendation rendering
- no route link from main navigation
- no default selectedRecommendation preview enablement
- no runtime environment config
- no visible toggle
- no active handoff button
- no execution path
- no production readiness claim

## Recommended Next Decision

Option A: stop here and keep the guard harness on the dev route as
fixture/model-only content.

Option B: add more fixture/model-only visual QA coverage around the harness.

Option C: plan actual read-only selectedRecommendation derivation separately.

All options must still forbid execution, fill, trigger, bridge calls, localhost
fetches, polling, active controls, and production readiness claims.

## Route Section Checkpoint

`docs/avanza-read-only-selected-recommendation-dev-preview-route-section-checkpoint.md`
records the route section that renders the guard harness on
`app/dev/avanza-visual-qa/page.tsx` as fixture/model-only content. It confirms
that the route remains unlinked from main navigation, `app/trade-app.tsx` was
not changed, no real selectedRecommendation state is read or rendered, no real
preview state is derived, controls remain disabled, and the pre-activation gate
remains locked.
