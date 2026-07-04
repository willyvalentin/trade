# Avanza Read-Only SelectedRecommendation Static-Fixture Adapter Invocation Checkpoint

Date: 2026-07-04

Checkpoint status:
`avanza_read_only_selected_recommendation_static_fixture_adapter_invocation_checkpoint_added`

## Current Status

The static-fixture adapter invocation step is implemented inside the pure
adapter/derived-preview wrapper only.

The implementation remains fixture/model-only. It accepts explicit wrapper input
and an explicit integration decision. It does not read app state, route state,
Trade UI state, or real selectedRecommendation state.

`app/trade-app.tsx` was not changed for this phase. The existing isolated
dev-only visual QA route remains fixture/model-only and unlinked from main
navigation. selectedRecommendation preview remains disabled by default in Trade
UI.

## Implemented Wrapper Behavior

The wrapper can now call the selectedRecommendation adapter only when all of the
following are true:

- the caller passes explicit selectedRecommendation-like input
- the caller passes an explicit integration decision
- the integration decision allows normalization
- the input is a static fixture/test input

When those conditions are met, the wrapper may return
`adapter_normalized_static_fixture`.

The wrapper still returns `previewState: null`, keeps
`canRenderReadOnlyPreview: false`, keeps `controlsEnabled: false`, and keeps
`gateLocked: true`.

## Static Fixture Adapter Invocation Scope

Adapter invocation exists only inside the pure wrapper and only for static
fixtures/tests.

This checkpoint does not authorize adapter invocation from:

- `app/trade-app.tsx`
- `app/dev/avanza-visual-qa/page.tsx`
- route state
- rendered route content
- real Trade UI selectedRecommendation state
- runtime environment state
- production/default UI behavior

## normalizedInputSummary Behavior

`normalizedInputSummary` is intentionally safe and minimal.

It may expose fixture-derived display fields such as id, ticker, company,
direction, entry, quantity, confidence, source, and risk label when available.
It must not include credentials, session values, cookies, BankID state, storage
values, bridge payloads, localhost payloads, execution payloads, or order-ready
instructions.

`normalizedInputSummary` is a static-fixture adapter summary only. It does not
mean execution readiness, production readiness, order readiness, or handoff
readiness.

## Wrapper Fixture Behavior

Wrapper fixtures cover:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `adapter_normalized_static_fixture`

All wrapper fixture outputs keep:

- `previewState: null`
- `canRenderReadOnlyPreview: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

## Wrapper Harness Behavior

The wrapper harness remains fixture/model-only.

It renders wrapper fixture states and safety copy for visual QA. It is not
rendered in Trade UI. It does not read real selectedRecommendation state. It
does not read route or Trade UI state. It does not render a real app preview
state. It does not expose active controls.

The isolated dev-only visual QA route may display the harness as static
fixture/model-only content. The route remains unlinked from main navigation and
does not read real selectedRecommendation state from app, route, or rendered UI.

## Static-Fixture Derived-Preview Invocation Result

The later static-fixture derived-preview invocation step has now been
implemented inside the pure wrapper only.

The wrapper still must not call:

- `buildAvanzaPreviewStateFromSelectedRecommendation(...)`

The wrapper may call:

- `buildAvanzaSelectedRecommendationPreviewState(...)`

only after explicit static fixture adapter normalization succeeds. `previewState`
appears only for `read_only_preview_ready`; all other wrapper fixture outputs
keep `previewState` null/undefined.

## No Real SelectedRecommendation State Guarantee

No real selectedRecommendation state is read or rendered.

This includes no reads from:

- `app/trade-app.tsx`
- Trade UI React state
- existing trade modal state
- the isolated dev route
- rendered route content
- runtime environment state

Static fixture input is the only allowed input for this phase.

## No Real Preview Derivation Guarantee

No real preview state is derived or rendered.

The adapter invocation only uses static fixture input. The later derived-preview
invocation may produce a read-only Avanza preview state only for the static
`read_only_preview_ready` fixture. It does not render selectedRecommendation
preview in Trade UI and does not enable handoff.

No real app/route preview state is derived.

## Trade UI Default Behavior

Trade UI default behavior remains unchanged:

- active/default source remains `static_fixture`
- selectedRecommendation preview remains disabled by default
- explicit preview-only enablement remains non-default
- controls remain disabled
- pre-activation gate remains locked
- total-read remains advisory

## Safety Guarantees

This phase preserves these safety boundaries:

- no bridge calls
- no localhost fetch
- no polling
- no runner/fill invocation
- no trigger phrase
- no fill/click/review/final/submit/order
- no credential/session/BankID/cookies/storage handling
- no Supabase execution write
- no active handoff button
- no production readiness claim
- no execution readiness claim

## What Remains Not Implemented

Not implemented:

- real selectedRecommendation reads
- real selectedRecommendation rendering
- real preview derivation
- derived-preview builder invocation
- Trade UI selectedRecommendation preview activation
- route-selected real selectedRecommendation preview
- enabled handoff controls
- bridge/fill/execution behavior
- production/default enablement

## Recommended Next Decision

Option A: stop here and keep adapter invocation static-fixture-only inside the
pure wrapper.

Option B: add a checkpoint before any derived-preview builder invocation.

Option C: plan derived-preview builder invocation with static fixtures only,
still keeping `previewState` isolated from real selectedRecommendation state.

Option D: postpone derived-preview invocation until a broader architecture
checkpoint.

All options must still forbid bridge calls, localhost fetch, polling,
runner/fill invocation, trigger phrase, fill/click/review/final/submit/order,
credential/session handling, Supabase execution writes, active controls, and
production readiness claims.

## Static-Fixture Derived-Preview Invocation Plan

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md`
scoped Option C and has now been implemented inside the pure wrapper only. The
derived-preview builder may be called after static fixture adapter
normalization, `previewState` appears only for `read_only_preview_ready`, no real
selectedRecommendation state is read or rendered, and no route or Trade UI
wiring is added.

## Static-Fixture Derived-Preview Pre-Implementation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md`
was the final checkpoint before the pure wrapper code change for static-fixture
derived-preview invocation. It has now been followed: wrapper changes remain
pure/static-fixture-only, `previewState` is limited to
`read_only_preview_ready`, and all execution paths remain forbidden.

## Static-Fixture Derived-Preview Invocation Checkpoint

`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
closes the derived-preview invocation phase. It confirms the later
derived-preview invocation remains inside the pure wrapper only, uses explicit
static fixture input only, produces read-only `previewState` only for
`read_only_preview_ready`, keeps no real app/route preview derivation or
rendering, keeps Trade UI unchanged, keeps controls disabled, and keeps the
gate locked.

## References

- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation plan](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md)
- [Avanza read-only selectedRecommendation static-fixture derived-preview invocation checkpoint](avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation pre-implementation checkpoint](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md)
- [Avanza read-only selectedRecommendation static-fixture adapter invocation plan](avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
