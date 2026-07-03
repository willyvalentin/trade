# Avanza Bridge Read-Only Status Data Layer Plan

Status: `avanza_bridge_read_only_status_data_layer_plan_added`

Follow-up status: `avanza_bridge_read_only_status_fetcher_added`

Follow-up status: `avanza_bridge_read_only_manual_refresh_added`

Follow-up status: `avanza_bridge_ui_static_safety_guard_added`

Follow-up status: `avanza_bridge_read_only_last_refresh_metadata_added`

Follow-up status: `avanza_bridge_read_only_readiness_checklist_added`

Follow-up status: `avanza_bridge_read_only_readiness_summary_added`

Date: 2026-07-03

Related UI plan:
`docs/semi-auto-avanza-fill-only-poc-ui-integration-plan.md`

Related milestone:
`first_real_avanza_quantity_based_fill_only_core_poc_success_total_read_unresolved`

## Purpose

This document specifies a future read-only data path for showing local Avanza
bridge readiness in the Ture UI.

This is planning only. It does not implement polling, fetch localhost, call
bridge endpoints from the UI, add a trigger button, fill fields, click
`Granska köp`, open review, click final confirmation, submit/place orders, read
credentials/session/BankID/cookies/storage, or write Supabase execution
records.

## Allowed Read-Only Endpoints

A future local-only data layer may read only these GET endpoints:

- `GET /health`
- `GET /self-check`
- `GET /preflight/avanza-order-form`

Responses from those endpoints should be mapped through
`lib/avanza-local-bridge-status.ts` before reaching UI components.

## Forbidden Endpoints And Actions

The read-only status data layer must not call:

- `/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger`
- `fillAmountField`
- `fillQuantityField`
- `fillPriceField`
- `readTotalAmount` as a live action unless a later action explicitly scopes it
  as observation-only

The data layer must not add:

- bridge POST calls
- exact trigger phrase usage
- live fill/click/review/final/submit/order behavior
- autonomous or unattended mode
- credential/session/BankID/cookie/localStorage/sessionStorage handling
- Supabase execution-record writes
- trade mutation

## Feature Flag And Local-Only Assumption

The future implementation should be disabled by default and gated behind a
local/development-only flag, for example:

`NEXT_PUBLIC_ENABLE_AVANZA_LOCAL_BRIDGE_STATUS=true`

The status layer should assume the bridge is a local operator tool, reachable
only from the operator machine. It should not be treated as a production broker
backend, remote service, or automation authority.

## Polling And Refresh Model

Initial implementation should prefer manual refresh.

If polling is added later, use conservative read-only polling:

- disabled unless the local/development feature flag is enabled
- interval no faster than 10 seconds
- request timeout around 2 seconds
- stop or back off after repeated failures
- no retries for forbidden or non-GET endpoints
- no background action if the Settings page/status surface is not mounted

Manual refresh should remain available so the operator can explicitly re-check
readiness after opening or changing the Avanza page.

## Error Handling

Network and response errors should map to UI-safe statuses:

- connection refused, timeout, DNS, or blocked network:
  `bridge not reachable`
- `/health` available but `/self-check` unavailable:
  `bridge available`
- preflight `ok: true` and `status: ready`:
  `preflight ready`
- preflight mismatch, blocked, or failed:
  `preflight blocked`
- malformed or unexpected JSON:
  `unknown_error`

Errors shown in the UI must be sanitized. Do not show raw page text, raw DOM,
cookies, localStorage, sessionStorage, credentials, BankID/session data, or
unbounded response bodies.

## UI States

`bridge not reachable`

The local bridge cannot be reached. The UI should show that no Avanza order
form can be prepared from Ture.

`bridge available`

`/health` reports the local bridge is available. This does not mean Avanza is
open or verified.

`preflight ready`

The manual observation preflight confirms the expected Avanza page/form state.
This is still read-only status and must not imply an order was filled or placed.

`preflight blocked`

The bridge is reachable, but the visible Avanza page/form does not match the
expected account, instrument, side, order mode, or safety boundary.

`POC proven / total-read advisory`

The quantity-based fill-only POC is proven as a core fill-and-stop milestone.
Total-read remains advisory/unresolved until a later action proves the true
Avanza order-total element or intentionally relaxes that validation.

## Data Shape

The future fetcher should return only the safe summary needed by
`AvanzaBridgeStatusPanel`:

- mapped status
- bridge available
- preflight ready
- manual observation ready
- endpoint statuses
- safe message
- sanitized blockers
- sanitized warnings
- optional safe evidence:
  - account verified
  - instrument verified
  - order form visible
  - total-read unresolved/advisory

## Next Implementation Step

Next recommended implementation:

`read_only_localhost_bridge_status_fetcher_behind_dev_local_flag`

That action may add a local-only fetcher for `GET /health`, `GET /self-check`,
and `GET /preflight/avanza-order-form`, but it must remain read-only, feature
flagged, and mapped through the pure status adapter before rendering.

## Fetcher Contract

Implemented helper:

`lib/avanza-local-bridge-readonly-fetcher.ts`

The helper provides a future-safe read-only fetch contract with:

- explicit feature flag:
  `NEXT_PUBLIC_AVANZA_BRIDGE_READONLY_STATUS_ENABLED=true`
- default base URL: `http://127.0.0.1:47831`
- default timeout: 2 seconds
- allowed endpoint keys only:
  - `health` -> `GET /health`
  - `selfCheck` -> `GET /self-check`
  - `preflightOrderForm` -> `GET /preflight/avanza-order-form`
- `method: "GET"`
- `credentials: "omit"`
- `cache: "no-store"`
- no request body
- safe timeout/network error mapping
- combined result shape that can be passed into
  `lib/avanza-local-bridge-status.ts`

The fetcher rejects arbitrary endpoint keys and does not expose a method
parameter, request-body option, bridge POST option, or live runner option.

Still forbidden:

- `/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger`
- fill endpoints
- review/final/submit/order endpoints
- exact trigger phrase usage
- credential/session/BankID/cookie/storage handling
- Supabase execution-record writes

Next recommended implementation after the fetcher:

`read_only_settings_bridge_status_manual_refresh_behind_dev_local_flag`

## Manual Refresh Integration

Implemented Settings integration:

`app/settings/page.tsx`

The Settings page now exposes a manual `Refresh bridge status` action only when
`NEXT_PUBLIC_AVANZA_BRIDGE_READONLY_STATUS_ENABLED=true`.

The action calls only `fetchAvanzaLocalBridgeReadonlyStatus`, which is limited
to:

- `GET /health`
- `GET /self-check`
- `GET /preflight/avanza-order-form`

When the flag is disabled or not configured, the Settings UI keeps the static
fixture/default status visible and does not fetch.

This integration does not add polling, bridge POST calls, trigger endpoints,
fill endpoints, review/final/submit/order behavior, credentials/session/BankID
handling, cookie/storage handling, or Supabase execution-record writes.

The Settings panel now shows safe last-refresh metadata:

- last refreshed at
- source: fixture/default or manual read-only refresh
- fetch duration when available
- endpoint result summary for health, self-check, and preflight
- safe bounded timeout/network error text

When the read-only status feature flag is disabled, the panel shows
fixture/default as the source and does not fetch. When manual refresh is used,
the source changes to manual read-only refresh. Error text is normalized,
line-stripped, and bounded before display.

Next recommended implementation after manual refresh metadata:

`read_only_bridge_status_result_hardening_and_operator_copy_review`

## Read-Only Readiness Checklist

Implemented reusable helper and Settings display:

`lib/avanza-bridge-readiness-checklist.ts`

`components/execution/AvanzaBridgeStatusPanel.tsx`

The pure helper derives read-only checklist rows from the existing status
summary, safe evidence, milestone context, and last refresh metadata. The
Settings panel renders the helper output. Neither the helper nor the panel
fetches, polls, calls bridge endpoints, or controls a browser.

Checklist items include:

- read-only feature flag enabled
- local bridge reachable
- health endpoint available
- self-check endpoint available
- Avanza page observed
- order form visible
- account verified
- instrument verified
- buy side verified
- advanced/limit mode verified
- stop-before-review boundary documented
- total-read unresolved/advisory

Each item is display-only and uses one of these safe states:

- `ready`
- `blocked`
- `advisory`
- `unknown`

When the read-only status feature flag is disabled, Settings keeps the
fixture/default source and the checklist shows a blocked feature flag plus
unknown bridge/preflight items without fetching. When preflight is ready,
verified state items render as ready. When preflight is blocked, the observed
page/form verification items render as blocked. Total-read remains advisory,
not ready.

This does not add polling, trigger buttons, bridge POST calls, live runner/fill
endpoint calls, review/final/submit/order behavior, credential/session/BankID
handling, cookie/storage handling, or Supabase execution-record writes.

## Read-Only Readiness Summary

Implemented reusable summary helper:

`summarizeAvanzaBridgeReadinessChecklist(...)`

The helper derives one compact UI-safe summary from checklist rows:

- `ready_for_read_only_observation`
- `blocked`
- `advisory_only`
- `unknown`

The summary includes label, severity, short copy, and counts for ready,
blocked, advisory, and unknown rows. If bridge, preflight, order-form, account,
instrument, buy-side, advanced/limit, and stop-before-review rows are ready
while total-read is advisory, the summary reports ready for read-only
observation with warning copy. This is not execution readiness.

If any required row is blocked, the summary reports blocked. If only advisory
rows remain, it reports advisory-only. If data is insufficient, it reports
unknown. Total-read unresolved/advisory is always counted as advisory and never
as ready.

`AvanzaBridgeStatusPanel` renders this as a compact top-level summary card
above the checklist. The card is display-only and does not add polling,
trigger/fill endpoint calls, review/final/submit/order behavior, credential or
storage handling, or Supabase execution-record writes.

## Static UI Safety Guard

Static guard:

`tests/e2e/avanza-bridge-ui-safety-guard.spec.ts`

The guard scans the UI-facing bridge files:

- `app/settings/page.tsx`
- `components/execution/AvanzaBridgeStatusPanel.tsx`
- `components/execution/AvanzaReadOnlyReadinessBadge.tsx`
- `lib/avanza-bridge-readiness-checklist.ts`
- `lib/avanza-local-bridge-readonly-fetcher.ts`
- `lib/avanza-local-bridge-status.ts`

It fails if forbidden live runner endpoints, fill endpoint strings, the exact
trigger phrase, or executable review/final/submit/order action patterns appear
in UI/client/read-only fetcher code.

Permitted read-only endpoint paths remain limited to:

- `/health`
- `/self-check`
- `/preflight/avanza-order-form`

Safety copy may still mention that Ture will not click `Granska köp` and will
not submit an order, but those phrases must not be paired with executable click,
review, final confirmation, submit, or order-placement handlers.
