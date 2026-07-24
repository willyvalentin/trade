# Avanza Fill-Only Adapter Contract Plan

Date: 2026-07-04

Plan status:
`avanza_fill_only_adapter_contract_planned`

Implementation status:
`avanza_fill_only_adapter_contract_fixtures_harness_route_section_added`

## Purpose

Define a future adapter contract for preparing or filling an Avanza order form
from a safe handoff package.

Fill-only means a future adapter may eventually fill form fields, but it must
never click review, confirm, or submit. Semi-automatic final human confirmation
remains mandatory.

This task is planning only. It adds no active adapter implementation, no bridge
call, no localhost call, no browser/Avanza call, and no credential/session
handling.

The first pure contract module now exists at
`lib/avanza-fill-only-adapter-contract.ts`. It defines the adapter modes,
statuses, request/response shapes, hard safety flags, and pure request/response
builders for explicit safe handoff packages only.

The module remains model-only. It does not wire into Trade UI, does not call
bridge/local/browser/Avanza paths,
does not poll, does not submit orders, and does not write Supabase execution
records.

Static contract fixtures now exist at
`lib/avanza-fill-only-adapter-contract-fixtures.ts`, with an isolated harness at
`components/execution/AvanzaFillOnlyAdapterContractHarness.tsx`.
`app/dev/avanza-visual-qa/page.tsx` renders the harness as a fixture/model-only
section using static responses only. This adds visual QA coverage for disabled,
unavailable, invalid, dry-run ready, fill-only ready, blocked, and display-only
lifecycle statuses without adding an active adapter, Trade UI wiring, bridge
call, localhost fetch, browser/Avanza control, order behavior, credential/session
handling, or Supabase write.

## Future Adapter Input

A future adapter request may include:

- `handoffPackage`
- `mode: "dry_run" | "fill_only"`
- `broker: "avanza"`
- `side: "BUY" | "SELL"`
- `ticker` / `symbol`
- `quantity`
- `orderType`
- `limitPrice` when applicable
- `stopLoss` as metadata only unless an Avanza form supports it safely
- `target` as metadata only
- `timeInForce` when applicable
- `accountLabel` when safe/present
- `sourceRecommendationId`
- `packageId`
- `userMustConfirm: true`

The request must not contain account ids, credentials, cookies, BankID/session
metadata, broker secrets, Supabase auth/session data, execution records, or
order submission metadata.

## Future Adapter Output Statuses

The contract should support:

- `adapter_disabled`
- `package_unavailable`
- `package_invalid`
- `dry_run_ready`
- `fill_only_ready`
- `fill_only_blocked`
- `fill_started`
- `fill_completed_waiting_manual_review`
- `fill_failed`
- `cancelled`
- `unknown`

## Hard Safety Flags

The adapter contract must include hard safety flags:

- `canFillForm: false` by default
- `canClickReview: false` always
- `canClickConfirm: false` always
- `canSubmitOrder: false` always
- `canHandleCredentials: false` always
- `canReadCookies: false` always
- `canReadBankId: false` always
- `canWriteSupabaseExecution: false` in the adapter phase
- `userMustConfirm: true` always
- `finalHumanClickRequired: true` always
- `controlsEnabled: false` by default
- `gateLocked: true` by default

## Absolute Forbidden Future Behavior

The fill-only adapter boundary must never:

- never click Granska kop
- never click Granska salj
- never submit an order
- never bypass manual confirmation
- click Granska kop
- click Granska salj
- open a review modal
- click Bekrafta kop
- click Bekrafta salj
- submit an order
- handle credentials
- handle BankID
- read cookies/session/localStorage
- store Avanza session state
- bypass manual confirmation

## Future Implementation Sequence

Recommended sequence:

1. Add pure adapter request/response types.
2. Add static fixtures and an isolated harness.
3. Add a dev-only dry-run adapter model.
4. Add an optional local bridge contract, disabled by default.
5. Add a fill-only adapter POC in an isolated environment.
6. Add a Trade UI prepare handoff button, disabled/internal first.
7. Add a manual confirmation capture flow.

Each step needs its own safety checkpoint before any broader Trade UI exposure.

Step 1 is complete as a pure TypeScript contract/model only:

- `AvanzaFillOnlyAdapterMode`
- `AvanzaFillOnlyAdapterStatus`
- `AvanzaFillOnlyAdapterRequest`
- `AvanzaFillOnlyAdapterResponse`
- `AvanzaFillOnlyAdapterSafetyFlags`
- `buildAvanzaFillOnlyAdapterRequest(...)`
- `buildAvanzaFillOnlyAdapterResponse(...)`

The helper returns `adapter_disabled`, `package_unavailable`,
`package_invalid`, `dry_run_ready`, `fill_only_ready`, or
`fill_only_blocked` from explicit inputs. Other statuses remain contract
statuses for future adapter lifecycle modeling only.

Step 2 is complete as a fixture/model-only visibility layer:

- `lib/avanza-fill-only-adapter-contract-fixtures.ts`
- `components/execution/AvanzaFillOnlyAdapterContractHarness.tsx`
- dev visual QA route section in `app/dev/avanza-visual-qa/page.tsx`

The fixtures cover BUY/SELL dry-run, BUY/SELL fill-only readiness, blocked and
invalid package states, and display-only future lifecycle states. All rendered
states keep review, confirm, submit, credential/session, browser/Avanza,
bridge/local, polling, execution, and Supabase behavior unavailable. User
confirmation and final human click remain mandatory.

The visibility phase is closed in
[Avanza fill-only adapter contract visibility phase completion checkpoint](avanza-fill-only-adapter-contract-visibility-phase-completion-checkpoint.md).

The next phase is planned in
[Avanza dry-run adapter layer plan](avanza-dry-run-adapter-layer-plan.md). That
future phase remains pure and dry-run only: it may model adapter progress from
explicit contract request/response inputs, but it must not call bridge,
localhost, browser, Avanza, order, credential/session, or Supabase paths.

Step 3 has started with a pure helper implementation:

- `lib/avanza-dry-run-adapter-layer.ts`

The helper models the dry-run adapter lifecycle from explicit
`AvanzaFillOnlyAdapterResponse` input only. It can represent disabled,
unavailable, invalid, blocked, ready, success, failed, cancelled, and unknown
dry-run outcomes. The success path remains waiting for manual review and does
not perform or imply review clicks, confirmation clicks, order submission,
bridge/local calls, browser/Avanza control, credential/session handling, or
Supabase execution writes.

Step 3 visibility is also available as fixture/model-only inspection:

- `lib/avanza-dry-run-adapter-layer-fixtures.ts`
- `components/execution/AvanzaDryRunAdapterLayerHarness.tsx`
- dev visual QA route section in `app/dev/avanza-visual-qa/page.tsx`

The route section uses static fixtures only, remains unlinked from main
navigation, and adds no Trade UI wiring, active handoff, prepare button,
buy/sell CTA, bridge/local fetch, polling, Avanza/browser control, real fill,
order behavior, click/review/confirm/submit behavior, credential/session
handling, or Supabase execution write.

Step 3 is closed in
[Avanza dry-run adapter layer phase completion checkpoint](avanza-dry-run-adapter-layer-phase-completion-checkpoint.md).

Step 4 is planned in
[Avanza disabled local bridge contract plan](avanza-disabled-local-bridge-contract-plan.md).
The local bridge contract phase remains disabled by default and planning-only:
no localhost calls, browser/Avanza control, form fill, order behavior,
credential/session handling, or Supabase execution write is added by the plan.

Step 4 has started with a pure disabled local bridge contract helper:

- `lib/avanza-disabled-local-bridge-contract.ts`

The helper defaults to `bridge_disabled` and only models request/response
payloads from explicit safe adapter responses. It can represent `dry_run_ready`,
`fill_only_ready`, and display-only lifecycle statuses without making a
localhost call, bridge call, browser/Avanza call, real fill, review/confirm
click, submit/order action, credential/session access, or Supabase execution
write. All hard safety flags remain locked.

Step 4 fixture/model-only visibility is also available:

- `lib/avanza-disabled-local-bridge-contract-fixtures.ts`
- `components/execution/AvanzaDisabledLocalBridgeContractHarness.tsx`
- dev visual QA route section in `app/dev/avanza-visual-qa/page.tsx`

The fixtures cover disabled, unavailable, invalid, bridge unavailable, ready
dry-run, ready fill-only, started display-only, completed waiting manual
review, blocked, failed, cancelled, unknown, safe BUY/SELL dry-run, safe
BUY/SELL fill-only, and unsafe/invalid adapter inputs. The visibility layer is
static, unlinked from main navigation, and non-executing.

Step 4 is closed in
[Avanza disabled local bridge contract phase completion checkpoint](avanza-disabled-local-bridge-contract-phase-completion-checkpoint.md).

Step 5 is planned in
[Avanza disabled localhost bridge stub plan](avanza-disabled-localhost-bridge-stub-plan.md).
That future stub phase remains local/dev-only, disabled by default, and
planning-only until a separate explicit implementation task.

## Non-Goals

- no adapter implementation in this planning phase
- no bridge/local/browser calls
- no active Trade UI controls
- no order submission
- no review/confirm click
- no credentials/session/BankID/cookies/storage handling
- no Supabase execution write
- no production readiness claim
