# Avanza Read-Only SelectedRecommendation Adapter/Derived-Preview Wrapper Pre-Implementation Checkpoint

Date: 2026-07-03

Checkpoint status:
`avanza_read_only_selected_recommendation_adapter_derived_preview_wrapper_pre_implementation_checkpoint_added`

## Current Status

The adapter/derived-preview integration phase is complete as a
planning/decision/static-audit/wrapper-plan phase. This checkpoint is the final
pre-implementation checkpoint before any future pure adapter/derived-preview
wrapper is created.

This checkpoint does not implement the wrapper, call the adapter, call the
derived-preview builder, read real selectedRecommendation state, derive real
preview state, change the dev route, or change Trade UI.

## Preconditions Met

Preconditions now met:

- adapter/derived-preview integration plan exists
- integration decision model, fixtures, and harness exist
- integration decision harness is rendered on the isolated dev route as
  fixture/model-only content
- adapter safety static audit checkpoint exists
- adapter safety review result checkpoint exists
- wrapper plan exists
- integration phase completion checkpoint exists
- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` remains unchanged for this phase
- selectedRecommendation preview remains disabled by default in Trade UI
- controls disabled
- pre-activation gate locked

## Wrapper Purpose

The future wrapper should safely combine:

1. explicit selectedRecommendation-like input validation
2. explicit integration decision input validation
3. adapter normalization
4. derived-preview creation
5. read-only preview-safe output

The wrapper exists only to create read-only preview output from static or
explicit test/dev inputs. It must not create an execution path, handoff action,
bridge action, localhost call, polling loop, credential/session flow, Supabase
execution write, or production readiness claim.

## Allowed First Implementation Scope

Allowed first implementation scope:

- pure wrapper module only
- static fixtures only
- explicit selectedRecommendation-like input only
- explicit integration decision input only
- may call adapter/derived-preview helper only inside pure wrapper tests and
  fixtures if static audit confirms safe
- no route wiring
- no Trade UI wiring
- no real selectedRecommendation state read
- no real selectedRecommendation rendering
- no real preview rendering
- no live Avanza
- no runtime env configuration
- no `.env.local` dependency

`app/trade-app.tsx` must remain unchanged. `app/dev/avanza-visual-qa/page.tsx`
must remain unchanged for the first wrapper implementation.

## Forbidden Behavior

Forbidden behavior:

- production/default enablement
- selectedRecommendation preview enablement by default
- route behavior changes
- Trade UI behavior changes
- main navigation link
- active handoff button
- enabled controls
- bridge calls
- localhost fetch
- polling
- runner/fill invocation
- trigger phrase
- fill/click/review/final/submit/order
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claim
- execution readiness claim

All future wrapper work must still forbid execution, fill, and trigger.

## Required Input Contract

The wrapper must require:

- explicit selectedRecommendation-like input, or `null`
- explicit integration decision input
- explicit source label/source mode input if needed
- no app state reads
- no route state reads
- no React state reads
- no `process.env` reads
- no browser storage reads
- no credential/session input
- no implicit Trade UI selectedRecommendation access

## Required Output Contract

The wrapper output must include:

- `status`
- `label`
- `reason`
- `sourceMode`
- `normalizedInputSummary`, only if preview-safe
- `previewState`, only when ready
- `canRenderReadOnlyPreview`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canPoll: false`
- `canExecute: false`
- `controlsEnabled: false`
- `gateLocked: true`

No output may imply production readiness, execution readiness, order readiness,
or active handoff readiness.

## Required Failure States

Required wrapper statuses:

- `no_input`
- `blocked`
- `invalid_input`
- `adapter_rejected`
- `derived_preview_failed`
- `read_only_preview_ready`

Failure states must be read-only and preview-safe. They must not retry, poll,
fetch, call bridge endpoints, call localhost, call live Avanza, write Supabase
execution records, or unlock controls.

## Required Tests

Required future wrapper tests:

- no input returns `no_input`
- blocked integration decision returns `blocked`
- invalid input returns `invalid_input`
- adapter rejection returns `adapter_rejected`
- derived-preview failure returns `derived_preview_failed`
- valid static fixture can return `read_only_preview_ready`
- safety output always keeps `canCallBridge: false`
- safety output always keeps `canFetchLocalhost: false`
- safety output always keeps `canPoll: false`
- safety output always keeps `canExecute: false`
- controls remain disabled
- gate remains locked
- wrapper has no app imports
- wrapper has no route imports
- wrapper has no React state imports
- wrapper has no runtime env reads
- wrapper has no fetch, localhost, polling, live runner/fill, trigger, order,
  credential/session, storage, or Supabase execution write strings
- route remains fixture/model-only and unchanged
- Trade UI remains unchanged and default-safe

## Go/No-Go Checklist

Go only if:

- first implementation is pure wrapper module only
- first implementation uses static fixtures only
- inputs are explicit and typed
- integration decision input is explicit
- static audit targets remain clean
- wrapper tests prove failure states are safe
- controls remain disabled
- gate remains locked
- route remains fixture/model-only
- route remains unlinked from main navigation
- `app/trade-app.tsx` remains unchanged
- `app/dev/avanza-visual-qa/page.tsx` remains unchanged
- no real selectedRecommendation state is read or rendered
- no real preview state is derived or rendered
- no live Avanza behavior is added

No-go if the change needs:

- route wiring
- Trade UI wiring
- real selectedRecommendation reads
- real preview rendering
- active controls
- bridge calls
- localhost fetch
- polling
- runner/fill invocation
- trigger phrase
- fill/click/review/final/submit/order
- credential/session/BankID/cookies/storage handling
- Supabase execution writes
- production readiness claim

## Current Safety Boundary

Current boundary remains:

- existing dev route remains fixture/model-only
- route remains unlinked from main navigation
- no integration harness is rendered in Trade UI
- `app/trade-app.tsx` was not changed
- `app/dev/avanza-visual-qa/page.tsx` was not changed
- no real selectedRecommendation state is read from app/route
- no real selectedRecommendation state is rendered
- no real preview state is derived
- no real preview state is rendered
- adapter is not called
- derived-preview builder is not called
- selectedRecommendation preview remains disabled by default in Trade UI
- controls disabled
- pre-activation gate locked
- total-read remains advisory

## Skeleton Implementation Status

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`
now implements the pure wrapper skeleton only. It handles `no_input`,
`blocked`, `invalid_input`, and model-pending `adapter_rejected` outcomes while
keeping `previewState` null.

The skeleton is not wired into `app/trade-app.tsx`. It does not call the
adapter, does not call the derived-preview builder, does not read real
selectedRecommendation state, does not derive real preview state, and keeps all
safety outputs locked:
`canCallBridge: false`, `canFetchLocalhost: false`, `canPoll: false`,
`canExecute: false`, `controlsEnabled: false`, and `gateLocked: true`.

`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts`
now adds static fixtures for the skeleton. The fixtures include no-input,
blocked, invalid, adapter-pending, derived-preview-failed model-only, and
read-only-ready model-only scenarios. Every fixture keeps `previewState` null,
does not call the adapter, does not call the derived-preview builder, and is
not wired into Trade UI.

`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`
now adds an isolated harness for those wrapper fixtures. It is prop-driven,
fixture-only, rendered only as a fixture/model-only section on the isolated
dev-only visual QA route, not imported by Trade UI, and it keeps the same
non-invocation boundary: no adapter call, no derived-preview builder call, no
real selectedRecommendation read, no real preview derivation, disabled controls,
and locked gate.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md`
records the completed wrapper skeleton/fixtures/harness route-section phase
before any Trade UI wiring or real adapter/derived-preview invocation.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md`
records the route section that renders the wrapper harness as fixture/model-only
content on `app/dev/avanza-visual-qa/page.tsx`. It keeps
`app/trade-app.tsx` unchanged, confirms the route remains unlinked from main
navigation, keeps `previewState` null/undefined, and confirms no adapter call,
derived-preview builder call, real selectedRecommendation read/render, or real
preview derivation/render.

`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md`
closes the wrapper skeleton/fixtures/harness/route-section phase before any
future real adapter invocation or derived-preview invocation.

## References

- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview wrapper plan](avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md)
- [Avanza read-only selectedRecommendation adapter/derived-preview integration phase completion checkpoint](avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md)
- [Avanza selectedRecommendation adapter safety review result checkpoint](avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md)
- [Avanza selectedRecommendation adapter safety static audit checkpoint](avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md)
- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
