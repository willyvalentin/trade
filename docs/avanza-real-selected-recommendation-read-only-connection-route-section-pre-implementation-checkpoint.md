# Avanza Real SelectedRecommendation Read-Only Connection Route Section Pre-Implementation Checkpoint

Status: `avanza_real_selected_recommendation_read_only_connection_route_section_pre_implementation_checkpoint_added`

## Current Status

The real selectedRecommendation read-only connection harness is not rendered on
the dev-only Avanza visual QA route yet.

The current system remains default-off and non-executing:

- `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false
- `app/trade-app.tsx` remains unchanged for this phase
- `app/dev/avanza-visual-qa/page.tsx` remains unchanged for this checkpoint
- the connection helper and harness are not wired into Trade UI
- the connection helper and harness are not wired into the dev route yet
- real selectedRecommendation input is not connected, read, or rendered in
  Trade UI
- source extraction remains not wired into Trade UI
- no previewState is derived from app or route state
- no active execution is allowed

## Preconditions Met

The following prerequisite artifacts exist:

- `docs/avanza-real-selected-recommendation-read-only-connection-route-section-plan.md`
- `lib/avanza-real-selected-recommendation-read-only-connection.ts`
- `lib/avanza-real-selected-recommendation-read-only-connection-fixtures.ts`
- `components/execution/AvanzaRealSelectedRecommendationReadOnlyConnectionHarness.tsx`
- `docs/avanza-real-selected-recommendation-read-only-connection-pre-implementation-checkpoint.md`
- `docs/avanza-real-selected-recommendation-read-only-connection-plan.md`

The following prerequisite phases are complete:

- test-only enabled branch phase
- hard-disabled Trade UI branch wiring phase
- hard-disabled source-to-preview integration phase
- selectedRecommendation source mapping phase

## Allowed Next Implementation Scope

The next implementation may update
`app/dev/avanza-visual-qa/page.tsx` to import and render
`AvanzaRealSelectedRecommendationReadOnlyConnectionHarness`.

That future route section may render only static real selectedRecommendation
read-only connection fixtures. It must be fixture/model-only, use explicit
candidate input only, remain unlinked from main navigation, and keep
`app/trade-app.tsx` unchanged.

The future route section must not connect a real runtime preview model, must not
read real selectedRecommendation state from app or route state, must not derive
previewState from app or route state, and must not enable preview in normal or
default UI.

## Required Route Section Behavior

The future route section must:

- render only static connection fixtures
- keep the route fixture/model-only
- say explicit candidate input only
- say no Trade UI state is read
- say no real selectedRecommendation state is read from app/route
- say no real selectedRecommendation state is rendered from app/route
- say no previewState is derived
- say no Trade UI wiring
- keep the route unlinked from main navigation
- keep the connection helper and harness unwired from Trade UI
- keep real selectedRecommendation input disconnected from Trade UI
- keep source extraction unwired from Trade UI
- keep `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false

## Required Fixture/Model-Only Labels

The future route section must visibly include:

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

## Required Output Visibility Rules

The future route section must show these fixture statuses:

- `connection_disabled`
- `selected_recommendation_unavailable`
- `selected_recommendation_invalid`
- `selected_recommendation_ready_read_only`
- `preview_ready_read_only_blocked`
- `preview_ready_read_only`

The future route section must preserve these output rules:

- `modelResult` is visible only for `preview_ready_read_only`
- `normalizedSelectedRecommendationSummary` is visible only when safe and
  available
- `canRenderPreview` is true only for `preview_ready_read_only` with explicit
  `allowPreviewModel: true`
- `canProceedToHandoff` is false for all statuses
- bridge, localhost fetch, polling, and execution are false for all statuses
- controls are disabled
- gate is locked

## Required Data Safety Guarantees

Any visible `normalizedSelectedRecommendationSummary` must exclude:

- credentials
- session data
- account ids
- cookies
- browser storage
- broker secrets
- BankID metadata
- Supabase auth/session data
- Supabase execution records
- order submission metadata

The route section must not read app state, route state, React state, storage,
cookies, credentials, sessions, BankID metadata, Supabase state, bridge state,
or runtime environment config.

## Required Default-Off Guarantees

Default Trade UI must remain visually unchanged.

selectedRecommendation preview must remain disabled by default in Trade UI.

`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` must remain false.

No normal/default UI preview enablement, runtime env config, storage toggle,
visible toggle, active control, handoff, prepare button, buy/sell CTA,
bridge/fetch/polling, order behavior, credential/session handling, or Supabase
write may be added.

## Explicit Non-Goals

This checkpoint does not permit:

- changing `app/trade-app.tsx`
- connecting source extraction to real app state
- connecting real selectedRecommendation input to Trade UI
- reading real selectedRecommendation state from app or route state
- rendering real selectedRecommendation preview in normal/default Trade UI
- deriving preview from app or route state
- enabling preview in normal/default UI
- changing `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` to true
- adding active controls
- adding a handoff button
- adding a prepare button
- adding a buy/sell CTA
- adding bridge, fetch, polling, or execution behavior
- handling credentials, sessions, BankID, cookies, or storage
- writing Supabase execution records
- claiming production readiness

## Go/No-Go Checklist

Proceed only if the next implementation:

- changes only the dev-only visual QA route section
- renders `AvanzaRealSelectedRecommendationReadOnlyConnectionHarness`
- uses only static connection fixtures
- keeps the section fixture/model-only
- labels the section as explicit candidate input only
- keeps `app/trade-app.tsx` unchanged
- keeps the route unlinked from main navigation
- keeps real selectedRecommendation input disconnected from runtime state
- keeps source extraction unwired from Trade UI
- keeps `ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false
- derives no previewState from app or route state
- adds no active controls
- adds no handoff, prepare, buy/sell CTA, bridge/fetch/polling, order behavior,
  credential/session handling, or Supabase write

Do not proceed if implementation requires Trade UI wiring, real app/route
selectedRecommendation reads, runtime preview model connection, normal/default
preview enablement, app/route previewState derivation, bridge calls, localhost
fetch, polling, handoff, execution, credentials, sessions, or Supabase writes.

## Recommended Next Implementation Task

Render the real selectedRecommendation read-only connection harness on
`app/dev/avanza-visual-qa/page.tsx` as a fixture/model-only route section.

That task must keep `app/trade-app.tsx` unchanged, keep default Trade UI
visually unchanged, keep real selectedRecommendation input disconnected from
Trade UI, keep source extraction unwired from Trade UI, keep
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` false, derive no previewState
from app or route state, and add no active controls or execution behavior.

## Implementation Follow-Up

`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaRealSelectedRecommendationReadOnlyConnectionHarness` as a
fixture/model-only section using only static fixtures from
`lib/avanza-real-selected-recommendation-read-only-connection-fixtures.ts`.

The route section is labeled real selectedRecommendation read-only connection,
Connection fixture only, Explicit candidate input only, No Trade UI state is
read, No real selectedRecommendation state is read from app/route, No real
selectedRecommendation state is rendered from app/route, No previewState is
derived, No Trade UI wiring, No bridge calls, No localhost fetch, No polling,
No execution, Controls disabled, and Gate locked.

The route remains unlinked from main navigation. `app/trade-app.tsx` remains
unchanged, real selectedRecommendation input is not connected/read/rendered in
Trade UI, source extraction remains not wired into Trade UI,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, and no
previewState is derived from app or route state.

## Route Section Checkpoint Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-route-section-checkpoint.md`
now records the completed fixture/model-only route section.

The checkpoint confirms the dev route renders the isolated connection harness
with static connection fixtures only, all six statuses are visible,
`preview_ready_read_only` remains read-only/model-only, `modelResult` appears
only for `preview_ready_read_only`, safe summaries exclude credentials and
session/account/cookie/storage/broker-secret data, Trade UI remains unwired,
`ENABLE_READ_ONLY_SELECTED_RECOMMENDATION_PREVIEW` remains false, no
previewState is derived from app or route state, and no active controls or
execution behavior are added.

## Safety Audit Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-safety-audit.md`
now audits the implemented route section. It confirms the section remains
fixture/model-only, route-only, unlinked from main navigation, disconnected from
Trade UI runtime state and real selectedRecommendation input, and non-executable.
It also verifies every connection fixture keeps bridge/local fetch/polling/
execution false, controls disabled, and the gate locked.

## Phase Completion Follow-Up

`docs/avanza-real-selected-recommendation-read-only-connection-phase-completion-checkpoint.md`
now records this phase as complete. It preserves the pre-implementation
boundary: no Trade UI wiring, no real selectedRecommendation input connection,
no source extraction wiring into Trade UI, no app/route previewState
derivation, no default preview enablement, and no execution behavior.
