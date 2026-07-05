# Avanza Disabled Local-Only Manual Test Path Plan

Status: `avanza_disabled_local_only_manual_test_path_planned`

## Purpose

Plan a future local-only manual test path for the disabled route/fetch stack.

The path may describe how a developer could manually inspect the disabled local
API route later. This planning phase does not add fetch, does not call the API route, does not call localhost or bridge, and does not wire anything into normal Trade UI.

The manual test path must remain disabled by default, internal/dev-only if it is
ever implemented, and non-broker-action. Final human confirmation remains
mandatory.

## Phase Boundary

This document is planning only:

- no fetch is added in this planning phase
- no API route call is added
- no route path usage is added in `app/trade-app.tsx`
- no active UI is added
- no browser control is added
- no Avanza interaction is added
- no form fill is added
- no order submission is added

## Future Allowed Shape

A future implementation may start with a pure model/helper. It may consume:

- guarded fetch intent model metadata
- disabled local-only API route state metadata
- explicit internal/dev-only guard metadata
- safe handoff/action shell metadata if provided

It may output:

- `manual_test_path_disabled`
- `manual_test_path_hidden`
- `manual_test_path_blocked`
- `route_unavailable`
- `route_disabled`
- `fetch_intent_unavailable`
- `internal_guard_missing`
- `local_only_guard_missing`
- `manual_test_path_ready_internal_disabled`
- `manual_test_path_failed`
- `unknown`

The model/helper must not perform an actual network call, must not include
fetch, must not create an active button, must not render visible UI by default,
must not use browser automation, and must not interact with Avanza.

Normal/default Trade UI must not reference the route path.

## Future Fields

A future model may expose:

- `manualTestPathId`
- `createdAt`
- `fetchIntentId` if present
- `actionShellId` if present
- `apiCallIntentId` if present
- `sourceRecommendationId`
- `packageId`
- `side`
- `ticker` or `symbol`
- `quantity`
- `orderType`
- `limitPrice` if applicable
- `accountLabel` if safe/present
- `routeStatus` if explicit
- `localOnlyGuardStatus` if explicit
- `internalGuardStatus` if explicit
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `warnings`
- `blockedReasons`
- safety flags

## Required Safety Flags

The default future state must remain locked:

- `manualTestPathEnabled: false` by default
- `canCreateManualTestPath: false` by default
- `canExposeLocalRoute: false` by default
- `canFetch: false`
- `canCallApiRoute: false`
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

This planning phase and any future disabled local-only manual test path must not:

- add fetch in the planning phase
- call the API route
- reference the route path from `app/trade-app.tsx`
- add active prepare button
- add active handoff
- add buy/sell CTA
- add `onClick`
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
- write Supabase execution records from the manual test path phase

## Later Implementation Sequence

1. Pure disabled local-only manual test path model/helper.
2. Fixtures, harness, and dev QA route section.
3. Hard-disabled Trade UI metadata wiring, still disabled by default.
4. Safety audit.
5. Phase completion checkpoint.
6. Only after that, any actual local-only disabled fetch test is considered
   separately and must remain internal/dev-only, explicit, disabled by default,
   local-only, non-broker-action, and human-confirmation preserving.

## Related Artifacts

- `lib/avanza-disabled-local-only-manual-test-path.ts`
- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-safety-audit.md`
- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-phase-completion-checkpoint.md`
- `docs/avanza-hard-disabled-trade-ui-fetch-intent-metadata-wiring-plan.md`
- `docs/avanza-guarded-fetch-intent-visibility-phase-completion-checkpoint.md`
- `lib/avanza-guarded-fetch-intent.ts`
- `app/api/dev/avanza/fill-only/stub/route.ts`

## Pure Helper Implementation

The pure disabled local-only manual test path model/helper now exists at:

- `lib/avanza-disabled-local-only-manual-test-path.ts`

The helper is explicit-input only and model-only. It can describe disabled,
hidden, blocked, route-unavailable, route-disabled, fetch-intent-unavailable,
internal-guard-missing, local-only-guard-missing,
manual-test-path-ready-internal-disabled, failed, and unknown states.

The helper does not fetch, call the API route, expose a route path, call
localhost, call bridge, control Avanza/browser state, fill forms, submit
orders, handle credentials/sessions, or write Supabase execution records.

It is not wired into `app/trade-app.tsx`, not wired into the dev QA route, not
imported by the disabled API route, and not imported by the passive disabled
action shell component.

## Fixture Visibility Layer

The fixture/model-only visibility layer now exists:

- fixtures: `lib/avanza-disabled-local-only-manual-test-path-fixtures.ts`
- isolated harness:
  `components/execution/AvanzaDisabledLocalOnlyManualTestPathHarness.tsx`
- dev QA route section: `app/dev/avanza-visual-qa/page.tsx`

The dev QA route section renders static fixtures only. It does not wire the
manual test path into Trade UI, does not call the API route, does not fetch,
does not expose a route path, does not call localhost or bridge, does not poll,
does not control Avanza/browser state, does not fill forms, does not submit
orders, does not handle credentials/sessions, and does not write Supabase
execution records.

The route remains unlinked from main navigation.

The visibility layer is closed in:

- `docs/avanza-disabled-local-only-manual-test-path-visibility-phase-completion-checkpoint.md`

## Hard-Disabled Trade UI Metadata Wiring Plan

The next planned phase is hard-disabled Trade UI manual test path metadata
wiring:

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-plan.md`

That future phase must remain inside the existing disabled/default-off branch,
keep `manualTestPathEnabled` false by default, render no manual test path in
normal/default UI, add no active prepare button or handoff, make no API route
call, add no fetch, expose no route path, and preserve final human confirmation.

The first minimal hard-disabled metadata invocation now exists in
`app/trade-app.tsx`. It remains inside the existing disabled/default-off branch,
uses `manualTestPathEnabled: false`, uses `mode: "hidden"`, discards output
with `void hardDisabledManualTestPath`, passes no route path strings, renders no
manual test path UI, and adds no API route call, fetch, localhost/bridge call,
Avanza/browser control, real fill, order behavior, credential/session handling,
or Supabase execution write.

The focused safety audit for the minimal hard-disabled Trade UI metadata wiring
is recorded in:

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-safety-audit.md`

The hard-disabled Trade UI manual test path metadata wiring phase completion is
recorded in:

- `docs/avanza-hard-disabled-trade-ui-manual-test-path-metadata-wiring-phase-completion-checkpoint.md`

The disabled local-only chain readiness closeout is planned in:

- `docs/avanza-disabled-local-only-chain-readiness-closeout-plan.md`

The disabled local-only chain readiness closeout checkpoint is recorded in:

- `docs/avanza-disabled-local-only-chain-readiness-closeout-checkpoint.md`

## Production Boundary

No production readiness is claimed.

No execution, fill, review, confirmation, order, credential/session handling, or
Supabase execution write is planned or approved by this document.
