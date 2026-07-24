# Avanza Dry-Run Adapter Layer Plan

Date: 2026-07-04

Plan status:
`avanza_dry_run_adapter_layer_planned`

## Purpose

Plan a pure dry-run adapter layer that models a future Avanza adapter execution
sequence without calling a bridge, localhost, browser, or Avanza.

The dry-run layer may consume explicit `AvanzaFillOnlyAdapterRequest` and
`AvanzaFillOnlyAdapterResponse` models from the fill-only adapter contract. It
should simulate adapter progress in dry-run only so lifecycle states can be
validated before any bridge/browser implementation is considered.

This phase is planning only. It adds no real fill behavior, no bridge, no
localhost call, no Avanza/browser control, and no order behavior.

## Future Inputs

A future pure helper may accept:

- `adapterRequest`
- `adapterResponse`
- `dryRunEnabled: boolean`
- `now`
- `scenario`

Allowed scenario values:

- `success`
- `blocked`
- `failed`
- `cancelled`
- `unknown`

All inputs must be explicit. The helper must not read app state, route state,
browser storage, process environment, credentials, sessions, cookies, BankID
state, bridge state, localhost, Avanza, or Supabase.

## Future Statuses

The dry-run adapter layer should model:

- `dry_run_disabled`
- `request_unavailable`
- `request_invalid`
- `dry_run_ready`
- `dry_run_started`
- `dry_run_completed_waiting_manual_review`
- `dry_run_blocked`
- `dry_run_failed`
- `dry_run_cancelled`
- `dry_run_unknown`

These statuses are dry-run model states only. They must not imply browser
control, form filling, review clicking, confirmation clicking, order submission,
or production readiness.

## Future Progress Events

The dry-run layer may emit display-only progress events:

- `request_received`
- `package_validated`
- `broker_context_checked_mock`
- `form_mapping_checked_mock`
- `manual_review_required`
- `dry_run_completed`
- `dry_run_failed`
- `dry_run_cancelled`

The `broker_context_checked_mock` and `form_mapping_checked_mock` events must
remain mock/model events. They must not call Avanza, a browser, localhost, or a
bridge.

## Safety Flags

The dry-run adapter layer must include hard safety flags:

- `canStartDryRun: false` by default
- `canFillForm: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canControlBrowser: false`
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false` by default
- `gateLocked: true` by default

`canStartDryRun` may become true only in a later pure-helper fixture where all
inputs are explicit and safe. It still must not permit real fill, review,
confirm, submit, bridge, browser, Avanza, credential/session, or Supabase
behavior.

## Forbidden Behavior

The dry-run adapter layer must not:

- wire into default Trade UI
- add an active handoff
- add a prepare button
- add a buy/sell CTA
- call a bridge
- fetch localhost
- poll
- control Avanza/browser
- perform real fill behavior
- submit an order
- click review, final, confirm, or submit
- handle credentials
- handle sessions
- handle BankID
- read cookies or storage
- write Supabase execution records
- claim production readiness

## Later Implementation Sequence

Recommended sequence:

1. Add a pure dry-run adapter helper.
2. Add static fixtures.
3. Add an isolated harness.
4. Add a dev QA route fixture/model-only section.
5. Add a safety checkpoint.
6. Only after that, plan a disabled local bridge contract.

Each step needs its own checkpoint and safety tests before any broader
exposure.

## Pure Helper Implementation Status

The first pure helper step is now implemented in
`lib/avanza-dry-run-adapter-layer.ts`.

The helper exports:

- `AvanzaDryRunAdapterScenario`
- `AvanzaDryRunAdapterStatus`
- `AvanzaDryRunAdapterProgressEventType`
- `AvanzaDryRunAdapterProgressEvent`
- `AvanzaDryRunAdapterSafetyFlags`
- `AvanzaDryRunAdapterResult`
- `buildAvanzaDryRunAdapterResult(...)`

The helper accepts explicit inputs only:

- `dryRunEnabled`
- `adapterResponse`
- `scenario`
- `now`
- `runId`

It can model disabled, unavailable, invalid, blocked, ready, success, failed,
cancelled, and unknown dry-run outcomes from
`AvanzaFillOnlyAdapterResponse` data. The success path includes
`manual_review_required` and ends at
`dry_run_completed_waiting_manual_review`; it does not submit an order or imply
that review/confirm/submit behavior exists.

The implementation remains model-only. It does not read app state, route state,
React context, globals, `process.env`, browser storage, credentials, sessions,
cookies, BankID state, bridge state, localhost, Avanza, or Supabase.

Safety flags remain locked:

- `canFillForm: false`
- `canClickReview: false`
- `canClickConfirm: false`
- `canSubmitOrder: false`
- `canCallBridge: false`
- `canFetchLocalhost: false`
- `canControlBrowser: false`
- `canHandleCredentials: false`
- `canReadCookies: false`
- `canReadBankId: false`
- `canWriteSupabaseExecution: false`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

No Trade UI wiring, dev route rendering, active handoff, prepare button,
buy/sell CTA, bridge call, localhost fetch, polling, Avanza/browser control,
real fill behavior, order behavior, credential/session handling, or Supabase
execution write was added by this implementation step.

## Fixture Visibility Implementation Status

Static fixtures, an isolated harness, and a dev QA route section now exist:

- `lib/avanza-dry-run-adapter-layer-fixtures.ts`
- `components/execution/AvanzaDryRunAdapterLayerHarness.tsx`
- `app/dev/avanza-visual-qa/page.tsx` fixture/model-only section

The fixtures cover disabled, missing, invalid, ready, started display-only,
completed waiting manual review, blocked, failed, cancelled, and unknown
dry-run statuses. They include safe BUY and SELL success scenarios, blocked
adapter response, failed scenario, cancelled scenario, unknown scenario,
invalid request, and missing request cases.

The harness renders status, label, reason, run id, scenario, safe request
summary fields, progress events, and safety flags. It clearly labels the layer
as fixture only, explicit input only, no Trade UI wiring, no bridge calls, no
localhost fetch, no polling, no Avanza/browser control, no execution, no real
fill, no order submission, never clicks review, never clicks confirm, user
must confirm, final human click required, controls disabled by default, and
gate locked by default.

This visibility layer does not wire the dry-run adapter into Trade UI. It does
not add active handoff, prepare, buy/sell CTA, bridge/local fetch, polling,
Avanza/browser control, real fill behavior, order behavior,
click/review/confirm/submit behavior, credential/session handling, or Supabase
execution writes.

## Phase Completion And Next Plan

The dry-run adapter layer is closed in
[Avanza dry-run adapter layer phase completion checkpoint](avanza-dry-run-adapter-layer-phase-completion-checkpoint.md).

The next phase is planned in
[Avanza disabled local bridge contract plan](avanza-disabled-local-bridge-contract-plan.md).
That plan remains contract-only and disabled by default. It does not implement
localhost calls, browser control, Avanza interaction, real fill behavior,
order behavior, credential/session handling, or Supabase execution writes.

## Disabled Local Bridge Contract Helper

The first implementation step for that next phase now exists as:

- `lib/avanza-disabled-local-bridge-contract.ts`

It is a pure request/response helper only. It accepts explicit adapter response
input, defaults to `bridge_disabled`, can model safe `dry_run_ready` and
`fill_only_ready` contract requests, and can represent display-only lifecycle
statuses such as `bridge_unavailable`, `fill_started`, and
`fill_completed_waiting_manual_review`.

The helper does not call localhost or a bridge, does not control Avanza or a
browser, does not perform real fill behavior, does not click review/confirm,
does not submit orders, does not handle credentials/session/BankID/cookies or
storage, and does not write Supabase execution records.

## Disabled Local Bridge Fixture Visibility

The disabled bridge contract also has fixture/model-only visibility:

- `lib/avanza-disabled-local-bridge-contract-fixtures.ts`
- `components/execution/AvanzaDisabledLocalBridgeContractHarness.tsx`
- `app/dev/avanza-visual-qa/page.tsx` fixture/model-only section

The route section uses static fixtures only, remains unlinked from main
navigation, and adds no Trade UI wiring, active handoff, prepare button,
buy/sell CTA, localhost call, bridge call, polling, Avanza/browser control,
real fill, order behavior, credential/session handling, or Supabase write.

The disabled bridge contract phase is closed in
[Avanza disabled local bridge contract phase completion checkpoint](avanza-disabled-local-bridge-contract-phase-completion-checkpoint.md).
The following phase is planned in
[Avanza disabled localhost bridge stub plan](avanza-disabled-localhost-bridge-stub-plan.md).
The stub plan does not implement endpoints or calls.
