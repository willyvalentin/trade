# Semi-Auto Avanza Fill-Only POC UI Integration Plan

Status: `semi_auto_avanza_fill_only_poc_ui_integration_planning_added`

Follow-up status: `avanza_local_bridge_status_adapter_added`

Follow-up status: `avanza_bridge_read_only_status_panel_added`

Related milestone:
`first_real_avanza_quantity_based_fill_only_core_poc_success_total_read_unresolved`

Date: 2026-07-03

## Purpose

This document plans how the proven first real Avanza `quantity_based`
fill-only capability should be represented in the Ture UI.

This is planning only. It does not wire the live localhost bridge into the app,
does not add a live trigger button, does not add automatic execution, and does
not add broker submit, review, final confirmation, Supabase execution-record
write, credential, session, BankID, cookie, localStorage, or sessionStorage
handling.

## Product Direction

The semi-auto direction remains:

1. Ture prepares the order intent.
2. Ture can fill the Avanza order form only after explicit operator action in a
   future gated flow.
3. The user manually reviews in Avanza.
4. The user manually decides whether to continue.
5. Ture does not autonomously submit or place orders.

The first real POC proves the browser-agent fill-and-stop mechanics:

- visible order-form verification
- quantity fill through `input#inputVolume`
- quantity readback verification
- price fill through `input#inputPrice`
- price readback verification
- sanitized evidence capture
- stop before `Granska köp`
- no review modal
- no final confirmation
- no order placement

Total-read remains unresolved as a true order-total validation layer. The
previous `63.21 SEK` read was classified as available buying power, not a proven
order total.

## Proposed UI States

`poc_proven`

The first real Avanza `quantity_based` fill-only POC has proven the core
fill-and-stop path. This state is informational and should not imply that live
automation is wired into Ture.

`bridge_not_connected`

The local bridge is not reachable or no bridge status adapter has reported a
healthy development bridge. The UI must not offer live fill actions.

`avanza_page_not_verified`

The bridge may be reachable, but the current manually opened Avanza page has
not been verified as the expected account, instrument, buy-side order form, and
advanced limit mode.

`ready_to_prepare_order`

The visible page is verified and the selected execution intent can be prepared
for a fill-only handoff. In the first UI pass this should be read-only status,
not an active live trigger.

`order_fields_filled`

Future proof/evidence indicates the approved quantity and approved price were
filled and read back successfully. This state must still be labeled fill-only
and must not imply that an order was reviewed or placed.

`waiting_for_user_to_review_manually`

Ture has stopped at the approved boundary. The user must review the visible
Avanza form manually and decide what to do next in Avanza.

`blocked_by_total_read_unresolved`

The core fill-only path can be proven while the actual order-total read remains
unverified. This state should explain that total-read is a stronger validation
layer still being hardened, not a buying-power blocker.

`stopped_before_granska_kop`

The fill-only runner reached the safety boundary and did not click
`Granska köp`.

## UI Copy

Primary action label for a future gated flow:

`Prepare Avanza order`

Required supporting copy:

- `Ture will fill the order form only.`
- `You must manually review and continue in Avanza.`
- `Ture will not click Granska köp.`
- `Ture will not place an order.`

When total-read is unresolved:

`Order-total read is not fully verified yet. Review the visible Avanza order
form manually before continuing.`

When the bridge is not connected:

`Local Avanza bridge is not connected. No order form can be prepared from Ture.`

When the Avanza page is not verified:

`Avanza page is not verified for this account, instrument, side, and order mode.`

## Evidence Shown Back In Ture

A future read-only status panel should show sanitized evidence only:

- account verified
- instrument verified
- side verified as buy-only
- order mode verified as `Avancerad/Limit`
- input strategy: `quantity_based`
- quantity filled
- quantity readback verified
- price filled
- price readback verified
- stopped before `Granska köp`
- no review modal opened
- no final confirmation visible or clicked
- no order placement
- total read unresolved/advisory

The UI must not display raw DOM dumps, raw page text, cookies, storage,
credentials, BankID/session data, or hidden browser/session details.

## Recommended Implementation Sequence

1. UI planning doc.
2. Local bridge status adapter.
3. Read-only UI status panel.
4. Manual dev-only trigger button behind an explicit flag.
5. Later production-safe handoff flow.

The first implementation after this document should be the local bridge status
adapter. It should expose only safe status to the app and must not execute,
fill, click, submit, or persist execution records.

Follow-up implementation: the local bridge status adapter is defined in
`lib/avanza-local-bridge-status.ts`. It is a pure mapper from already-fetched
`/health`, `/self-check`, and `/preflight/avanza-order-form` JSON responses or
network errors into UI-safe statuses:

- `not_configured`
- `unavailable`
- `available`
- `self_check_unavailable`
- `preflight_ready`
- `preflight_blocked`
- `unknown_error`

The adapter does not fetch, call the bridge, control a browser, invoke a live
trigger, fill fields, click, submit, write Supabase records, or read
credentials/session/BankID/cookies/storage. A future UI status panel may use
this adapter only after a separate read-only data source supplies bridge status
responses.

Current implementation: the read-only status panel is defined in
`components/execution/AvanzaBridgeStatusPanel.tsx`. It renders safe bridge and
manual-observation readiness states from the pure adapter summary:

- `not_configured`
- `unavailable`
- `available`
- `self_check_unavailable`
- `preflight_ready`
- `preflight_blocked`
- `unknown_error`

The panel can display safe evidence fields such as bridge availability,
preflight readiness, account verified, instrument verified, order form visible,
and total-read unresolved/advisory. It is prop-driven and fixture-friendly for
now.

No live trigger button was added. No bridge POST calls were added. The panel
does not call localhost, does not call any `/live-fill-only-runner/*` endpoint,
does not call fill endpoints, and cannot review, confirm, submit, place orders,
write Supabase execution records, or handle credentials/session/BankID/cookies
or storage.

## Safety Boundaries

- no live bridge wiring in this planning action
- no live trigger button in this planning action
- no automatic execution
- no `Granska köp` click
- no review modal
- no `Bekräfta köp/sälj`
- no submit or order placement
- no unattended mode
- no credential, session, BankID, cookie, localStorage, or sessionStorage
  handling
- no Supabase execution-record writes
- no trade mutation
- no recommendation-ranking change
- no execution-provider behavior change

## Decision

The Ture UI may present the Avanza fill-only POC as a proven core
fill-and-stop milestone, but any first UI integration should be read-only and
status-oriented.

Live preparation controls should wait until a separate gated implementation
adds a bridge status adapter, read-only status surface, explicit feature flag,
and operator-only development guardrails.
