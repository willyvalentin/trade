# Semi-Auto Avanza Fill-Only POC UI Integration Plan

Status: `semi_auto_avanza_fill_only_poc_ui_integration_planning_added`

Follow-up status: `avanza_local_bridge_status_adapter_added`

Follow-up status: `avanza_bridge_read_only_status_panel_added`

Follow-up status: `avanza_bridge_read_only_status_panel_settings_fixture_placed`

Follow-up status: `avanza_bridge_read_only_status_data_layer_plan_added`

Follow-up status: `avanza_bridge_read_only_manual_refresh_added`

Follow-up status: `avanza_bridge_read_only_poc_milestone_summary_added`

Follow-up status: `avanza_bridge_read_only_last_refresh_metadata_added`

Follow-up status: `avanza_bridge_read_only_readiness_checklist_added`

Follow-up status: `avanza_bridge_read_only_readiness_summary_added`

Follow-up status: `avanza_read_only_readiness_badge_added`

Follow-up status: `avanza_read_only_readiness_badge_trade_ui_display_added`

Follow-up status: `avanza_prepare_handoff_preview_shell_added`

Follow-up status: `avanza_prepare_handoff_preview_model_added`

Follow-up status: `avanza_handoff_package_preview_builder_added`

Follow-up status: `avanza_handoff_package_preview_card_added`

Follow-up status: `avanza_recommendation_to_avanza_handoff_preview_fixture_added`

Follow-up status: `avanza_ture_recommendation_handoff_mapper_added`

Follow-up status: `avanza_selected_recommendation_handoff_contract_added`

Follow-up status: `avanza_static_selected_recommendation_contract_rendered`

Follow-up status: `avanza_selected_recommendation_preview_only_milestone_checkpoint_added`

Follow-up status: `avanza_dev_only_selected_recommendation_preview_enablement_candidate_plan_added`

Follow-up status: `avanza_dev_only_selected_recommendation_preview_enablement_checklist_added`

Follow-up status: `avanza_dev_only_selected_recommendation_preview_enablement_checklist_panel_added`

Follow-up status: `avanza_dev_only_preview_enablement_checkpoint_added`

Follow-up status: `avanza_dev_preview_flag_config_model_added`

Follow-up status: `avanza_dev_preview_flag_status_panel_added`

Follow-up status: `avanza_dev_only_preview_enablement_state_builder_added`

Follow-up status: `avanza_dev_only_preview_enablement_final_checkpoint_added`

Follow-up status: `avanza_dev_test_explicit_preview_flag_wiring_plan_added`

Follow-up status: `avanza_trade_ui_named_dev_preview_config_default_false`

Follow-up status: `avanza_selected_recommendation_test_only_preview_config_override_added`

Follow-up status: `avanza_test_only_selected_recommendation_preview_activation_checkpoint_added`

Follow-up status: `avanza_test_only_selected_recommendation_preview_final_checkpoint_added`

Follow-up status: `avanza_dev_only_visible_selected_recommendation_preview_surface_plan_added`

Follow-up status: `avanza_dev_visible_selected_recommendation_preview_surface_guard_added`

Follow-up status: `avanza_dev_visible_selected_recommendation_preview_surface_component_added`

Follow-up status: `avanza_dev_visible_selected_recommendation_preview_surface_fixtures_added`

Follow-up status: `avanza_dev_visible_selected_recommendation_preview_surface_gallery_added`

Follow-up status: `avanza_dev_only_visible_preview_surface_checkpoint_added`

Follow-up status: `avanza_dev_only_visible_preview_surface_route_plan_added`

Follow-up status: `avanza_dev_visual_qa_route_access_guard_added`

Follow-up status: `avanza_dev_visual_qa_route_access_fixtures_harness_added`

Follow-up status: `avanza_dev_visual_qa_route_access_checkpoint_added`

Follow-up status: `avanza_dev_visual_qa_pre_route_final_checkpoint_added`

Follow-up status: `avanza_isolated_dev_visual_qa_route_shell_added_fixture_only`

Follow-up status: `avanza_isolated_dev_visual_qa_route_hardening_checkpoint_added`

Follow-up status: `avanza_dev_visual_qa_route_status_panel_added`

Follow-up status: `avanza_isolated_dev_visual_qa_route_content_checkpoint_added`

Follow-up status: `avanza_isolated_dev_visual_qa_route_final_checkpoint_added`

Follow-up status: `avanza_isolated_dev_visual_qa_route_phase_completion_checkpoint_added`

Follow-up status: `avanza_read_only_real_selected_recommendation_dev_preview_planned_no_wiring`

Follow-up status: `avanza_read_only_selected_recommendation_dev_preview_guard_added`

Follow-up status: `avanza_read_only_selected_recommendation_dev_preview_fixtures_added`

Follow-up status: `avanza_read_only_selected_recommendation_dev_preview_guard_harness_added`

Follow-up status: `avanza_read_only_selected_recommendation_dev_preview_guard_checkpoint_added`

Follow-up status: `avanza_read_only_selected_recommendation_dev_preview_guard_harness_added_to_dev_route_fixture_model_only`

Follow-up status: `avanza_read_only_selected_recommendation_dev_preview_route_section_checkpoint_added`

Follow-up status: `avanza_read_only_selected_recommendation_derivation_planned_no_wiring`

Follow-up status: `avanza_read_only_selected_recommendation_derivation_decision_model_added`

Follow-up status: `avanza_read_only_selected_recommendation_derivation_decision_fixtures_added`

Follow-up status: `avanza_read_only_selected_recommendation_derivation_decision_harness_added`

Follow-up status: `avanza_read_only_selected_recommendation_derivation_decision_checkpoint_added`

Follow-up status: `avanza_read_only_selected_recommendation_derivation_decision_harness_added_to_dev_route_fixture_model_only`

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

Current placement: the read-only panel is rendered in `app/settings/page.tsx`
near the execution settings surface using safe static fixture props only:

- `preflight_ready`
- account verified: `Valentin Labs KF`
- instrument verified: `GameStop`
- order form visible
- total-read unresolved/advisory
- no order-placement capability

This placement does not fetch localhost, does not poll the bridge, does not call
bridge endpoints, does not add a trigger button, does not add bridge POST calls,
and does not add fill, click, review, final confirmation, submit, order
placement, credential/session/storage, or Supabase execution-record behavior.

Current planning follow-up:
`docs/avanza-bridge-read-only-status-data-layer-plan.md` defines the future
read-only data path before implementation. It limits the future status layer to
`GET /health`, `GET /self-check`, and
`GET /preflight/avanza-order-form`, keeps live runner/fill endpoints forbidden,
and recommends the next implementation step:
`read_only_localhost_bridge_status_fetcher_behind_dev_local_flag`.

Current Settings follow-up: the Settings placement now supports a manual
read-only `Refresh bridge status` action behind
`NEXT_PUBLIC_AVANZA_BRIDGE_READONLY_STATUS_ENABLED=true`. The action uses the
read-only fetcher only and remains limited to `GET /health`, `GET /self-check`,
and `GET /preflight/avanza-order-form`.

The Settings integration does not add polling, does not add a live trigger
button, does not call live runner/fill endpoints, and does not add review,
final confirmation, submit, order placement, credential/session/storage, or
Supabase execution-record behavior.

Current display follow-up: the read-only Settings panel now shows the proven
POC milestone summary:

- core fill-and-stop POC proven
- quantity-based flow
- quantity verified via `input#inputVolume`
- price verified via `input#inputPrice`
- evidence captured
- stopped before `Granska köp`
- no review modal
- no final confirmation
- no order placement
- total-read unresolved/advisory

This is display-only fixture/milestone context and does not add live automation,
trigger/fill endpoint calls, polling, bridge POST calls, order actions, or
Supabase execution-record writes.

Current metadata follow-up: the read-only Settings panel now shows safe
last-refresh metadata:

- source: fixture/default or manual read-only refresh
- last refreshed at
- fetch duration when available
- health endpoint summary
- self-check endpoint summary
- preflight endpoint summary
- bounded safe timeout/network error text

When the feature flag is disabled, the panel keeps source as fixture/default
and does not fetch. This remains manual-only and does not add polling or any
live automation.

Current readiness follow-up: the read-only Settings panel now shows a derived
readiness checklist for future semi-auto handoff preparation. The derivation is
centralized in `lib/avanza-bridge-readiness-checklist.ts` and uses existing
fixture/manual refresh status, safe evidence, milestone context, and last
refresh metadata only.

Checklist items cover:

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

Each row is labeled `ready`, `blocked`, `advisory`, or `unknown`. Disabled or
not configured mode shows a blocked feature-flag row and unknown bridge/page
items without fetching. Preflight-ready state shows verified rows as ready.
Preflight-blocked state shows the Avanza page/form verification rows as
blocked. Total-read remains advisory, not ready.

This is display-only readiness copy. It does not add polling, trigger/fill
endpoint calls, bridge POST calls, review, final confirmation, submit, order
placement, credential/session/storage handling, or Supabase execution-record
writes.

Current summary follow-up: `lib/avanza-bridge-readiness-checklist.ts` now also
derives a compact read-only readiness summary from the checklist rows. The
Settings panel renders this summary above the checklist with:

- status
- label
- severity
- short copy
- ready count
- blocked count
- advisory count
- unknown count

When required bridge/preflight/order-form/account/instrument rows are ready and
only total-read remains advisory, the summary says the bridge is ready for
read-only observation and warns that this is not execution readiness. Total-read
unresolved/advisory is counted as advisory and never as ready.

Current reusable badge follow-up:
`components/execution/AvanzaReadOnlyReadinessBadge.tsx` renders only the compact
read-only readiness summary. `AvanzaBridgeStatusPanel` uses this badge instead
of duplicating summary markup. The badge is prop-driven and can later be reused
in the Trade UI, execution modal, or development dashboard.

The badge does not fetch, poll, know about bridge endpoints, call live
runner/fill paths, add trigger controls, or perform review/final/submit/order
behavior. It explicitly labels the state as read-only observation, not
execution readiness.

Current Trade UI display follow-up: the reusable
`AvanzaReadOnlyReadinessBadge` is now rendered in the Trade dashboard execution
context using fixture/default summary data only. The fixture summary is exported
from `lib/avanza-read-only-readiness-fixtures.ts` as
`avanzaTradeReadOnlyReadinessSummaryFixture`:

- ready for read-only observation
- total-read advisory
- no bridge refresh
- no localhost fetch
- no bridge endpoint calls
- no trigger/fill controls
- no review/final/submit/order behavior

This gives Trade and Execution surfaces compact POC context without turning the
Trade UI into a bridge controller. Settings remains the only UI surface with the
manual read-only refresh action.

Current preview-only handoff shell follow-up:
`components/execution/AvanzaPrepareHandoffPreviewShell.tsx` is rendered beside
the Trade dashboard readiness badge. It is a disabled UX shell only. The static
preview content is exported as a typed pure model from
`lib/avanza-prepare-handoff-preview.ts`, and the shell only renders the model
passed from `app/trade-app.tsx`.

The shell communicates:

- `Prepare Avanza handoff`
- `Preview only`
- `Not enabled`
- Ture will not click `Granska köp`
- Ture will not submit an order
- manual review is required in Avanza
- total-read remains unresolved/advisory

It previews the future flow:

1. Ture validates the trade package.
2. Ture checks read-only Avanza readiness.
3. Ture prepares the order form.
4. Ture stops before `Granska köp`.
5. User manually reviews in Avanza.

The control is disabled and has no handler. The Trade UI still does not fetch
localhost, call bridge endpoints, add refresh outside Settings, use the exact
trigger phrase, call live runner/fill endpoints, review, confirm, submit, place
orders, handle credentials/session/storage, or write Supabase execution
records.

Current package preview builder follow-up:
`lib/avanza-handoff-package-preview.ts` adds a pure, side-effect-free preview
builder for future recommendation/trade handoff packages. It accepts a minimal
recommendation-like input and returns UI-safe preview data:

- preview id
- `Prepare Avanza handoff` action label
- ticker and instrument display labels
- buy-only side
- quantity-based strategy and quantity if known
- limit price if known
- account display label
- `Avancerad/Limit` order mode
- stop boundary before `Granska köp`
- manual review required
- total-read unresolved/advisory
- readiness summary status

The builder blocks missing ticker and non-buy sides for the current buy-only
POC. Missing quantity or limit price are advisory preview gaps, not live
automation. The helper does not fetch localhost, call bridge endpoints, include
the exact trigger phrase, reference live runner/fill endpoints, perform
review/final/submit/order behavior, handle credentials/session/storage, or
write Supabase records.

Current package preview card follow-up:
`components/execution/AvanzaHandoffPackagePreviewCard.tsx` renders a disabled
preview-only package card from the pure preview model. The Trade dashboard uses
`lib/avanza-handoff-package-preview-fixtures.ts` to show a static GameStop
quantity-based sample beside the disabled handoff shell.

The card shows the package action label, ticker/instrument, buy side,
quantity-based strategy, quantity, limit price, account display label,
`Avancerad/Limit` mode, stop-before-`Granska köp` boundary, manual review
requirement, total-read unresolved/advisory state, readiness status, and
blocked/advisory gaps. Its control is disabled and has no handler. It does not
fetch localhost, refresh bridge status, poll, call bridge endpoints, call live
runner/fill paths, use the exact trigger phrase, review, confirm, submit, place
orders, handle credentials/session/storage, or write Supabase records.

Current recommendation-shaped fixture follow-up:
`lib/avanza-handoff-package-preview-fixtures.ts` now defines
`avanzaSelectedTureRecommendationFixture` as a static selected Ture
recommendation-like input with recommendation id, `GME`, `GameStop`, long/buy
direction, position size `1`, and entry price `21.98`. The exported
`avanzaGameStopHandoffPackagePreviewFixture` is built through the same pure path
future real recommendations would use:

1. static Ture recommendation-like fixture
2. `mapTureRecommendationToAvanzaHandoffInput`
3. `buildAvanzaHandoffPackagePreview`
4. `AvanzaHandoffPackagePreviewCard`

This keeps the Trade card realistic while still static and preview-only. It
does not connect real recommendations, fetch localhost, refresh bridge status,
poll, call bridge endpoints, call live runner/fill paths, use the exact trigger
phrase, review, confirm, submit, place orders, handle credentials/session/storage,
or write Supabase records.

Current Ture recommendation mapper follow-up:
`lib/avanza-ture-recommendation-handoff-mapper.ts` adds a pure structural mapper
from existing Ture recommendation/trade-like objects into
`buildAvanzaHandoffPackagePreview` input. It maps recommendation id, ticker,
company/instrument display name, buy/short/sell side, quantity or position size
when available, quantity-based strategy, entry/limit price when available,
`Valentin Labs KF`, `Avancerad/Limit`, the stop-before-`Granska köp` boundary,
and the read-only readiness summary.

The mapper is not wired into the Trade UI yet. Missing ticker, non-buy side,
missing quantity, missing price, and total-read unresolved/advisory remain
handled downstream by the preview builder as blocked or advisory states. It does
not connect real recommendations, fetch localhost, refresh bridge status, poll,
call bridge endpoints, call live runner/fill paths, use the exact trigger
phrase, review, confirm, submit, place orders, handle credentials/session/storage,
or write Supabase records.

Current selected-recommendation contract follow-up:
`lib/avanza-selected-recommendation-handoff-contract.ts` defines a pure typed
contract/checklist for the future selected-recommendation integration. It
requires selected recommendation id, ticker, buy side, readiness summary,
configured account label, `Avancerad/Limit`, preview-only/not-enabled state, and
total-read unresolved/advisory. Quantity or position size and entry/limit price
are represented as advisory gaps when missing.

The future path is:

1. selected recommendation
2. `mapTureRecommendationToAvanzaHandoffInput`
3. `buildAvanzaHandoffPackagePreview`
4. disabled `AvanzaHandoffPackagePreviewCard`
5. later, a separately gated prepare-handoff flow

The contract is not wired into the Trade UI yet. It does not read React state,
connect real recommendations, fetch localhost, refresh bridge status, poll, call
bridge endpoints, call live runner/fill paths, use the exact trigger phrase,
review, confirm, submit, place orders, handle credentials/session/storage, or
write Supabase records.

Current static contract rendering follow-up:
`lib/avanza-handoff-package-preview-fixtures.ts` now also exports
`avanzaGameStopSelectedRecommendationHandoffContractFixture`, built from the
same static selected Ture recommendation fixture. The Trade dashboard passes
that static contract into `AvanzaHandoffPackagePreviewCard`, which renders the
selected-recommendation checklist/status beside the static package preview.

The rendered checklist shows selected recommendation present, ticker present,
buy-only side allowed, quantity/position size status, entry/limit price status,
account label configured, `Avancerad/Limit`, total-read unresolved/advisory, and
preview-only/not-enabled. It still does not read real selected recommendation
state, connect real recommendations, fetch localhost, refresh bridge status,
poll, call bridge endpoints, call live runner/fill paths, use the exact trigger
phrase, review, confirm, submit, place orders, handle credentials/session/storage,
or write Supabase records.

Current selected-recommendation eligibility summary follow-up:
`lib/avanza-selected-recommendation-handoff-contract.ts` now also derives a
compact eligibility summary from the selected-recommendation contract rows. The
summary can be `preview_ready`, `blocked`, `advisory_gaps`, `not_enabled`, or
`unknown`, with counts for ready, blocked, advisory, and unknown items.

The static GameStop fixture exports the derived eligibility summary, and the
Trade preview card renders it above the contract checklist. The copy explicitly
keeps the state preview-only, not enabled, not execution-ready, and no order
placement. Missing selected recommendation, missing ticker, and non-buy side are
blocked. Missing quantity or price are advisory gaps. Total-read remains
unresolved/advisory and never becomes ready.

This summary is still derived from static fixture contract data only. It does
not read real selected recommendation state, connect real recommendations, fetch
localhost, refresh bridge status, poll, call bridge endpoints, call live
runner/fill paths, use the exact trigger phrase, review, confirm, submit, place
orders, handle credentials/session/storage, or write Supabase records.

Current preview source-mode follow-up:
`lib/avanza-handoff-preview-source-mode.ts` defines the display-only source
mode model for the package preview. The active/default mode is locked to
`static_fixture`. The selected-recommendation modes are represented only as
`selected_recommendation_disabled` and `selected_recommendation_future`.

The static GameStop fixture exports the active source-mode model, and
`AvanzaHandoffPackagePreviewCard` renders a compact source indicator:
`Source: static fixture`, `Selected recommendation wiring: disabled`, and
`No real recommendation state is read`. Every mode disallows real selected
recommendation state, bridge calls, and execution.

This is a planning/display guard only. It does not connect real selected
recommendation state, fetch localhost, refresh bridge status, poll, call bridge
endpoints, call live runner/fill paths, use the exact trigger phrase, review,
confirm, submit, place orders, handle credentials/session/storage, or write
Supabase records.

Current safety boundary summary follow-up:
`lib/avanza-handoff-safety-boundary-summary.ts` defines a static safety boundary
summary for the Avanza handoff package preview. It lists enforced hard limits
for preview-only rendering, disabled controls, no live recommendation wiring, no
Trade UI bridge calls, no Trade UI localhost fetch, no polling, no trigger
phrase, no runner/fill endpoint, no `Granska köp` click, no review modal, no
final confirmation, no submit, no order placement, no credential/session/BankID/
cookie/storage handling, and no Supabase execution write. Total-read remains an
advisory boundary.

The static GameStop fixture exports this summary, and
`AvanzaHandoffPackagePreviewCard` renders it in a compact collapsed section so
the main package preview remains readable while the hard limits are explicit.

This remains static fixture UI only. It does not connect real selected
recommendation state, fetch localhost, refresh bridge status, poll, call bridge
endpoints, call live runner/fill paths, use the exact trigger phrase, review,
confirm, submit, place orders, handle credentials/session/storage, or write
Supabase records.

Current pre-activation gate follow-up:
`lib/avanza-handoff-pre-activation-gate.ts` defines a pure gate for the future
question of whether the Avanza handoff could ever move from preview-only toward
a separately enabled dev-only state. The gate consumes the source mode,
selected-recommendation contract, eligibility summary, read-only readiness
summary, and safety boundary summary.

The current static GameStop fixture resolves to `locked` because the source is
`static_fixture`, selected-recommendation wiring is disabled, bridge calls and
execution are disallowed, and the contract remains preview-only. The rendered
preview card shows `Pre-activation gate: Locked`, `Static fixture source`, and
`Selected recommendation wiring disabled`.

The gate can model blocked and advisory-only future states for planning, but no
result implies production readiness. Total-read unresolved/advisory remains
advisory and cannot become execution readiness.

This remains static fixture UI only. It does not enable the handoff button,
connect real selected recommendation state, fetch localhost, refresh bridge
status, poll, call bridge endpoints, call live runner/fill paths, use the exact
trigger phrase, review, confirm, submit, place orders, handle
credentials/session/storage, or write Supabase records.

Current dev-only enablement planning follow-up:
`docs/avanza-handoff-dev-only-enablement-plan.md` defines the future staged path
from locked preview-only handoff to a possible dev-only enabled handoff. It
requires selected-recommendation preview-only mapping, read-only Avanza
readiness, explicit manual operator confirmation, fill-only invocation,
stop-before-`Granska köp`, evidence capture, and manual user review in Avanza.

The plan does not enable anything. Current UI state remains `static_fixture`,
`locked`, and disabled, with no real selected recommendation state, no Trade UI
bridge calls, no Trade UI localhost fetch, no trigger/fill/click/review/final/
submit/order path, no credential/session/storage handling, and no Supabase
execution write.

Current architecture checkpoint follow-up:
`docs/avanza-handoff-architecture-checkpoint.md` summarizes the current Avanza
handoff architecture: proven fill-only POC milestone, Settings read-only status
surface, Trade UI preview-only surface, pure helpers/models, safety guards,
locked state, total-read advisory status, explicitly unimplemented execution
paths, and the recommended next phase.

Current selected-recommendation preview-only wiring planning follow-up:
`docs/avanza-selected-recommendation-preview-only-wiring-plan.md` defines the
future path for replacing static fixture preview data with selected
recommendation preview data. The plan keeps the phase preview-only, disabled,
locked, without Trade UI bridge calls, localhost fetches, runner/fill
invocation, clicks, review/final/submit/order behavior, credential/session
handling, or Supabase execution writes.

The pure source-mode model now includes
`selected_recommendation_preview_only` as a future/inactive mode. It still
disallows real selected recommendation state, Trade UI localhost fetch, bridge
calls, and execution. The active/default source remains `static_fixture`.

Current selected-recommendation preview state follow-up:
`lib/avanza-selected-recommendation-preview-state.ts` adds a pure builder for a
future selected-recommendation preview-only state. It composes the existing
recommendation mapper, package preview builder, selected-recommendation
contract, eligibility summary, safety boundary summary, and pre-activation gate.

The builder can represent no selection, blocked, advisory, and
preview-ready-locked states, but it is not wired into Trade UI. The current
Trade surface remains sourced from static fixture data only, with no real
selected recommendation state read and no active handoff behavior.

Current selected-recommendation preview state scenario follow-up:
`lib/avanza-selected-recommendation-preview-state-fixtures.ts` adds static
scenario fixtures for the pure preview state builder. The scenarios cover no
selection, valid buy, non-buy/sell, missing ticker, missing quantity, missing
price, and missing quantity plus price.

Each scenario is built from a static recommendation-like fixture or `null`
through `buildAvanzaSelectedRecommendationPreviewState(...)` and exposes a
scenario id, label, expected display state, and generated preview state. They
are not wired into Trade UI and do not replace the current static Trade preview
fixture.

Current selected-recommendation preview state renderer follow-up:
`components/execution/AvanzaSelectedRecommendationPreviewStatePanel.tsx` adds a
preview-only renderer for the pure selected-recommendation preview state model.
It renders fixture/test states for no selection, blocked, advisory, and
preview-ready-locked scenarios, including source mode, package preview summary
when available, eligibility summary, locked pre-activation gate, blockers,
advisories, and total-read unresolved/advisory.

The renderer has no active controls and is not wired into the main Trade UI. It
does not read real selected recommendation state, fetch localhost, refresh
bridge status, poll, call bridge endpoints, call live runner/fill paths, use the
exact trigger phrase, review, confirm, submit, place orders, handle
credentials/session/storage, or write Supabase records.

Current selected-recommendation preview state gallery follow-up:
`components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGallery.tsx`
adds an isolated fixture-only gallery for development/test visibility. It
renders all selected-recommendation preview state scenarios through
`AvanzaSelectedRecommendationPreviewStatePanel`, showing scenario label,
expected display state, and the preview panel.

The gallery is not rendered in the production/main Trade UI by default. It is
not connected to real selected recommendation state, does not fetch localhost,
does not call the bridge, does not enable handoff controls, and does not add any
execution behavior.

The selected-recommendation preview-only wiring plan now also defines a
test-only/dev-only access plan for this gallery. Future visual QA access may use
a test-only render harness, a feature-flagged dev-only route, or an isolated
component-view pattern if adopted. No route is added now, and the gallery remains
outside the production/main Trade UI by default.

Current scenario gallery access-model follow-up:
`lib/avanza-scenario-gallery-access.ts` adds a pure access decision model for a
future dev-only scenario gallery surface. The default decision is disabled and
`canRenderGallery` is false. An explicit dev-only flag input can allow isolated
fixture gallery rendering, but it still forbids real selected recommendation
state, bridge calls, local fetches, and execution.

The access model does not read environment variables, does not add a route, does
not render the gallery, and does not change the active `static_fixture` source.

Current scenario gallery access-harness follow-up:
`components/execution/AvanzaSelectedRecommendationPreviewStateScenarioGalleryHarness.tsx`
adds an isolated component-level harness that consumes the pure access decision
and static scenario fixtures. Disabled or blocked access renders disabled copy
only; explicit dev-only access can render the fixture-only scenario gallery.

The harness is not routed and is not rendered in the production/main Trade UI.
It does not read environment variables, fetch localhost, call the bridge, read
real selected recommendation state, add active controls, or add execution
behavior.

Focused harness coverage now verifies every static scenario under dev-only
fixture access while default access remains disabled: no selection, valid buy,
non-buy/sell, missing ticker, missing quantity, missing price, and missing
quantity plus price. All gates remain locked and total-read remains advisory.

Current selected-recommendation wiring boundary planning follow-up:
`docs/avanza-selected-recommendation-wiring-boundary-plan.md` identifies the
future integration boundary for reading selected recommendation state without
implementing it. The plan anchors the future path around the existing
`selectedRecommendation` state in `app/trade-app.tsx`, the
`openTradeModal(recommendation)` setter path, and the derived
`selectedRecommendationForDisplay`, position sizing, and risk-control context.

The planned future data path remains preview-only:
selected recommendation state -> minimal recommendation adapter ->
`buildAvanzaSelectedRecommendationPreviewState(...)` -> disabled preview
renderer/card. The source remains `static_fixture` today, and any future
`selected_recommendation_preview_only` state must keep the pre-activation gate
locked with total-read advisory.

Current selectedRecommendation adapter follow-up:
`lib/avanza-selected-recommendation-adapter.ts` adds the pure structural adapter
for the actual Trade UI selected-recommendation shape. It normalizes the current
`Recommendation` fields, including `ticker`, `companyName`, `direction`,
entry-price fields, and optional suggested shares, into the existing Avanza
preview pipeline input.

The adapter is not wired into `app/trade-app.tsx`. The Trade UI still uses the
static fixture source only, the active source mode remains `static_fixture`, and
selected-recommendation preview wiring remains a future locked/disabled step.

Current adapter-based scenario fixture follow-up:
`lib/avanza-selected-recommendation-adapter-fixtures.ts` adds static scenarios
that start from representative actual Trade UI selectedRecommendation-like
shapes, pass through `adaptSelectedRecommendationToAvanzaHandoffSource(...)`,
and then build full preview states through
`buildAvanzaSelectedRecommendationPreviewState(...)`.

The scenarios cover valid buy, missing ticker/symbol, non-buy `Short`, missing
entry/price, missing suggested shares/quantity, and missing both price and
quantity. They remain test fixtures only and are not wired into Trade UI.

Current fixture gallery grouping follow-up:
`AvanzaSelectedRecommendationPreviewStateScenarioGallery` and its harness can
now render grouped fixture sets. The generic preview-state scenarios and the
adapter-based selectedRecommendation scenarios are displayed as separate groups
when the isolated fixture harness is allowed in tests/dev-only access.

The gallery remains fixture-only. It is not rendered in the production/main
Trade UI by default, does not read real selectedRecommendation state, and does
not add bridge calls, local fetches, active controls, or execution behavior.

Current selectedRecommendation read-only derivation planning follow-up:
`docs/avanza-selected-recommendation-wiring-boundary-plan.md` now defines the
first future read-only derivation step for real selectedRecommendation state:
`selectedRecommendation` ->
`adaptSelectedRecommendationToAvanzaHandoffSource(...)` ->
`buildAvanzaSelectedRecommendationPreviewState(...)` -> preview-only
card/panel.

That planned step may derive local UI state or pass props into an isolated child
component, but it must not call the bridge, fetch localhost, use Settings bridge
fetchers, call execution adapters, write Supabase records, add active controls,
or switch the default `static_fixture` source without a separate explicit
implementation step.

Current selectedRecommendation derived preview-state helper follow-up:
`lib/avanza-selected-recommendation-derived-preview-state.ts` adds the pure
composition helper for that planned read-only derivation. It accepts a
selectedRecommendation-like object or `null`, adapts it through
`adaptSelectedRecommendationToAvanzaHandoffSource(...)`, and builds the final
preview state through `buildAvanzaSelectedRecommendationPreviewState(...)`.

The helper defaults to the active `static_fixture` source mode unless a caller
explicitly passes another safe source mode. It is not wired into
`app/trade-app.tsx`, and the Trade UI continues to use static fixture data only.

Current selectedRecommendation preview integration guard follow-up:
`lib/avanza-selected-recommendation-preview-integration-guard.ts` adds the pure
guard that defines whether a future Trade UI step may derive Avanza preview
state from real selectedRecommendation state. The default guard is disabled and
does not allow reading selectedRecommendation, using the derived preview helper,
switching to `selected_recommendation_preview_only`, or rendering selected
recommendation preview state.

An explicit future/dev preview flag can allow preview-only derivation, but still
forbids bridge calls, localhost fetches, execution, active handoff controls, and
any unlocked pre-activation state. The guard is not wired into Trade UI.

Current selectedRecommendation pre-wiring checklist follow-up:
`lib/avanza-selected-recommendation-pre-wiring-checklist.ts` adds the pure
checklist that must pass before any future preview-only Trade UI wiring attempt
is considered. The default checklist returns `not_ready_for_wiring` because the
integration guard is disabled and the active/default source remains
`static_fixture`.

An explicit preview-only guard and future source-mode input can produce
`candidate_for_preview_only_wiring`, but the checklist still enforces no bridge
calls, no localhost fetch, no execution, disabled controls only, locked
pre-activation gate, and total-read advisory.

Current pre-wiring checklist panel follow-up:
`components/execution/AvanzaSelectedRecommendationPreWiringChecklistPanel.tsx`
adds an isolated prop-driven renderer for the pure pre-wiring checklist. It can
show `not_ready_for_wiring` and `candidate_for_preview_only_wiring` fixture
states for test/dev visibility, including safety copy for no bridge calls, no
localhost fetch, no execution, disabled controls, locked gates, and total-read
advisory.

The panel is not rendered in `app/trade-app.tsx`, has no route, does not read
real selectedRecommendation state, and does not add active controls or execution
behavior.

Current Trade UI guarded-wiring safety assertion follow-up:
`tests/e2e/avanza-trade-ui-no-selected-recommendation-wiring.spec.ts` verifies
that `app/trade-app.tsx` still uses static Avanza fixture data for the preview
card by default and that any selectedRecommendation derivation is guarded by an
explicit preview-only integration guard.

The assertion allows existing selectedRecommendation modal behavior, but guards
the Avanza preview path from unguarded selectedRecommendation props,
uncontrolled source-mode switches, local bridge fetches, trigger/fill endpoints,
and active handoff controls.

Current first guarded derivation follow-up:
`app/trade-app.tsx` now includes a local read-only selectedRecommendation
preview derivation branch guarded by
`buildAvanzaSelectedRecommendationPreviewIntegrationGuard(...)`. The local
config keeps `explicitPreviewOnlyFlag: false`, so default UI behavior remains
the static fixture Avanza preview card and `static_fixture` source mode.

Only a future explicit preview-only config can allow the branch to call
`buildAvanzaPreviewStateFromSelectedRecommendation(...)` and render
`AvanzaSelectedRecommendationPreviewStatePanel`. The branch has no bridge call,
no localhost fetch, no polling, no active controls, no runner/fill endpoint, and
no submit/order path.

Current Trade UI integration status label follow-up:
`app/trade-app.tsx` now renders a small read-only Avanza preview integration
status label near the preview shell/card. The default label shows static fixture
source, selectedRecommendation preview disabled, no bridge calls, and no
execution. If a future explicit preview-only guard enables the derived preview
branch, the label can show selectedRecommendation preview-only, preview-only,
controls disabled, and gate locked.

The label is informational only and does not add buttons, fetches, bridge calls,
active controls, or execution behavior.

Current selectedRecommendation preview-only milestone checkpoint follow-up:
`docs/avanza-selected-recommendation-preview-only-milestone-checkpoint.md`
closes the selectedRecommendation preview-only preparation phase. It records
the implemented adapter, derived preview-state helper, integration guard,
pre-wiring checklist, no-wiring safety assertion, guarded Trade UI derivation,
integration status label, scenario fixtures, gallery, and harness.

The checkpoint explicitly keeps the default state as `static_fixture` with
`explicitPreviewOnlyFlag: false`, selectedRecommendation preview disabled,
controls disabled, the pre-activation gate locked, no bridge calls, no
localhost fetch, no polling, no runner/fill invocation, no trigger phrase, no
click/review/final/submit/order behavior, no credential/session/storage
handling, no Supabase execution write, and total-read advisory.

Current dev-only selectedRecommendation preview enablement planning follow-up:
`docs/avanza-dev-only-selected-recommendation-preview-enablement-plan.md`
defines a possible future dev/test-only step for allowing selectedRecommendation
preview derivation by explicitly setting `explicitPreviewOnlyFlag` true.

The plan is preview enablement only, not handoff execution. It allows only a
future guarded preview source switch to `selected_recommendation_preview_only`,
reading selectedRecommendation for preview-state derivation, and rendering
`AvanzaSelectedRecommendationPreviewStatePanel`. It requires controls to remain
disabled, the pre-activation gate locked, total-read advisory, no bridge calls,
no localhost fetch from Trade UI, no polling, no trigger/fill runner, no trigger
phrase, no click/review/final/submit/order behavior, no credential/session/
storage handling, no Supabase execution write, and no production-readiness
claim.

Current dev-only preview enablement checklist follow-up:
`lib/avanza-dev-only-preview-enablement-checklist.ts` adds a pure checklist for
whether a future dev/test environment may allow `explicitPreviewOnlyFlag: true`
for selectedRecommendation preview-only derivation. The default output is
`not_allowed` because the current state remains `static_fixture`, the
preview-only flag is false, and the integration guard is disabled.

A candidate fixture may return `candidate_for_dev_preview`, but it still
enforces no bridge calls, no localhost fetch, no polling, no runner/fill
invocation, no click/review/final/submit/order behavior, no credential/session
handling, no Supabase write, disabled controls, locked gate, and total-read
advisory. The helper is not wired into `app/trade-app.tsx` and does not change
default UI behavior.

Current dev-only preview enablement checklist panel follow-up:
`components/execution/AvanzaDevOnlyPreviewEnablementChecklistPanel.tsx` adds an
isolated renderer for the dev-only preview enablement checklist. It can show the
default `not_allowed` state and the test/dev `candidate_for_dev_preview` state,
including blockers, advisories, checklist rows, static fixture default,
selectedRecommendation preview disabled by default, no bridge calls, no
localhost fetch, no execution, disabled controls, locked gate, and total-read
advisory.

The panel is not rendered in `app/trade-app.tsx`, has no route, does not fetch,
does not call the bridge, does not read app state, has no active controls, and
does not change default UI behavior.

Current dev-only preview enablement checkpoint follow-up:
`docs/avanza-dev-only-preview-enablement-checkpoint.md` records the current
readiness state before any future `explicitPreviewOnlyFlag` enablement. The
checkpoint states that the default output is `not_allowed`, the candidate
`candidate_for_dev_preview` state exists only as a model/test state,
`explicitPreviewOnlyFlag` remains false by default, selectedRecommendation
preview remains disabled by default, the active/default source remains
`static_fixture`, `selected_recommendation_preview_only` is not default,
controls remain disabled, the pre-activation gate remains locked, no bridge
calls, no localhost fetch, no polling, no runner/fill invocation, no
click/review/final/submit/order behavior, no credential/session handling, no
Supabase execution write, and total-read remains advisory.

The recommended next step is a dev/test-only explicit preview flag fixture or
config model, still default false and still without execution.

Current dev/test preview flag config model follow-up:
`lib/avanza-dev-preview-flag-config.ts` adds a pure config model for a future
dev/test-only `explicitPreviewOnlyFlag`. The default config keeps
`explicitPreviewOnlyFlag: false`, `environmentScope: default`,
`source: default_disabled`, and cannot enable selectedRecommendation preview.

The explicit test fixture config can set `explicitPreviewOnlyFlag: true` only
with `environmentScope: dev_test_only`, but it still forbids bridge calls,
localhost fetch, and execution. Production scope is forbidden. The model is not
wired into `app/trade-app.tsx`, does not read environment variables directly,
does not fetch, does not call the bridge, and does not change default UI
behavior.

Current preview flag config and checklist integration follow-up:
`lib/avanza-dev-only-preview-enablement-checklist.ts` now accepts the preview
flag config as explicit input and renders rows for preview flag source,
`explicitPreviewOnlyFlag` value, environment scope, production-forbidden state,
`canEnableSelectedRecommendationPreview`, and bridge/local fetch/execution
prohibitions. The default checklist still returns `not_allowed` with
`default_disabled`, `explicitPreviewOnlyFlag: false`, `static_fixture`, and the
integration guard disabled.

The dev/test fixture config can contribute to `candidate_for_dev_preview` only
with `environmentScope: dev_test_only`, `explicitPreviewOnlyFlag: true`, the
preview-only integration guard allowed, pre-wiring candidate state, and
`selected_recommendation_preview_only` source. Production-forbidden config blocks
the candidate. This remains pure model/test behavior and is not wired into
`app/trade-app.tsx`.

Current dev/test preview flag status panel follow-up:
`components/execution/AvanzaDevPreviewFlagStatusPanel.tsx` adds an isolated
prop-driven renderer for the preview flag config together with the dev-only
preview enablement checklist. It shows the `explicitPreviewOnlyFlag` value,
environment scope, config source, `canEnableSelectedRecommendationPreview`,
checklist status/reason, blockers, advisories, selectedRecommendation preview
disabled by default, dev/test-only scope, no bridge calls, no localhost fetch,
no execution, disabled controls, and locked gate.

The panel is not rendered in `app/trade-app.tsx`, has no route, does not fetch,
does not call the bridge, does not read app state, has no active controls, and
does not change default UI behavior.

Current dev-only preview enablement state builder follow-up:
`lib/avanza-dev-only-preview-enablement-state.ts` composes the dev/test preview
flag config, selectedRecommendation preview integration guard, pre-wiring
checklist, and dev-only preview enablement checklist into one UI-safe state.
The default state is `disabled` with `explicitPreviewOnlyFlag: false`,
selectedRecommendation preview disabled by default, no bridge calls, no
localhost fetch, and no execution.

The dev/test fixture state may become `candidate_for_dev_preview` and allow
rendering selectedRecommendation preview, but it still forbids bridge calls,
localhost fetch, execution, enabled controls, and unlocked gates. The
production-forbidden input returns `blocked`. The helper is pure model/test
behavior and is not wired into `app/trade-app.tsx`.

Current dev/test preview flag status panel composed-state follow-up:
`components/execution/AvanzaDevPreviewFlagStatusPanel.tsx` now accepts the
composed dev-only preview enablement state as a single prop. It renders
`overallStatus`, label/reason, `explicitPreviewOnlyFlag`, preview flag config
source, integration guard status, pre-wiring checklist status, enablement
checklist status, `canRenderSelectedRecommendationPreview`, bridge/local
fetch/execution false states, disabled controls, and locked gate. The panel is
still isolated, route-free, and not rendered in `app/trade-app.tsx`.

Final dev-only preview enablement checkpoint follow-up:
`docs/avanza-dev-only-preview-enablement-final-checkpoint.md` closes the
dev-only selectedRecommendation preview enablement modeling phase before any
future `explicitPreviewOnlyFlag` wiring. It records the dev/test preview flag
config model, dev-only preview enablement checklist, isolated checklist panel,
composed enablement state builder, and status panel rendering of the composed
state.

The final checkpoint confirms that `explicitPreviewOnlyFlag` remains false by
default, selectedRecommendation preview remains disabled by default, the
active/default source remains `static_fixture`, `candidate_for_dev_preview`
exists only as model/test state, no panel is rendered in `app/trade-app.tsx`,
no route exists, controls remain disabled, the gate remains locked, no bridge
calls, no localhost fetch, no polling, no runner/fill invocation, no trigger
phrase, no click/review/final/submit/order behavior, no credential/session
handling, no Supabase execution write, and total-read remains advisory.

Dev/test explicit preview flag wiring plan follow-up:
`docs/avanza-dev-test-explicit-preview-flag-wiring-plan.md` defines the next
possible app-code step before any future `explicitPreviewOnlyFlag` wiring. The
future target would be `app/trade-app.tsx`, but the current plan does not
change app code and does not enable the flag.

The plan requires the default path to remain `static_fixture` with
`explicitPreviewOnlyFlag: false`, selectedRecommendation preview disabled by
default, disabled controls, and locked gate. It defines a future dev/test-only
path where selectedRecommendation may be read only for preview-state derivation
and `selected_recommendation_preview_only` may be used only under explicit
dev/test config. It keeps bridge calls, localhost fetch, polling,
trigger/fill runner, click/review/final/submit/order behavior,
credential/session handling, Supabase writes, and production-readiness claims
forbidden.

Trade UI named dev/test preview config follow-up:
`app/trade-app.tsx` now names the default-disabled selectedRecommendation
preview config as `avanzaSelectedRecommendationPreviewDevConfig` and builds it
through `buildAvanzaDevPreviewFlagConfig(...)` with
`explicitPreviewOnlyFlag: false`, `environmentScope: default`, and
`source: default_disabled`.

This config is fed into the existing integration guard, but the default render
remains the static fixture path. selectedRecommendation preview remains disabled
by default, controls remain disabled, the gate remains locked, and no bridge
calls, localhost fetch, polling, trigger/fill runner, click/review/final/submit
or order behavior, credential/session handling, or Supabase write was added.

Test-only explicit preview config override follow-up:
`app/trade-app.tsx` now accepts
`testOnlyAvanzaSelectedRecommendationPreviewDevConfig`, which defaults to
`avanzaSelectedRecommendationPreviewDevConfig`. This gives tests a controlled
override path without `.env.local`, runtime environment reads, or a default
source-mode switch.

`components/execution/AvanzaSelectedRecommendationPreviewTestOnlyHarness.tsx`
adds an isolated prop-driven harness that can render the passive
selectedRecommendation preview panel only when a dev/test fixture config allows
preview rendering. The harness is not rendered in `app/trade-app.tsx`, has no
route, does not fetch, does not call the bridge, has no active controls, keeps
controls disabled and the gate locked, and does not add trigger/fill/click,
review/final/submit/order behavior, credential/session handling, or Supabase
writes.

Focused coverage now proves the test-only path end to end through explicit
dev/test fixture config, preview-only integration guard, selectedRecommendation
fixture input, derived preview state, `selected_recommendation_preview_only`
source mode, locked pre-activation gate, disabled controls, and no bridge,
localhost, polling, trigger/fill/click/review/final/submit/order, exact trigger
phrase, runtime environment, `.env.local`, or Supabase execution behavior.

Test-only selectedRecommendation preview activation checkpoint follow-up:
`docs/avanza-test-only-selected-recommendation-preview-activation-checkpoint.md`
documents the current state before any further dev/test UI exposure. It records
that `TradeApp` accepts
`testOnlyAvanzaSelectedRecommendationPreviewDevConfig`, the default fallback
remains `avanzaSelectedRecommendationPreviewDevConfig`, `explicitPreviewOnlyFlag`
remains false by default, selectedRecommendation preview remains disabled by
default, the test-only harness can render passive preview only, there is no
`.env.local` path, no runtime environment path, controls remain disabled, the
gate remains locked, no bridge calls, no localhost fetch, no polling, no
runner/fill invocation, no trigger phrase, no click/review/final/submit/order
behavior, no credential/session handling, no Supabase write, and total-read
remains advisory.

Final test-only selectedRecommendation preview checkpoint follow-up:
`docs/avanza-test-only-selected-recommendation-preview-final-checkpoint.md`
closes the test-only selectedRecommendation preview activation phase. It records
that default Trade UI remains `static_fixture`, default selectedRecommendation
preview remains disabled, default `explicitPreviewOnlyFlag` remains false, the
test-only config can reach `preview_only_allowed`, the test-only path can render
passive selectedRecommendation preview state, `selected_recommendation_preview_only`
is used only in the test-only path, controls remain disabled, the
pre-activation gate remains locked, no runtime environment path or `.env.local`
dependency exists, no bridge calls, no localhost fetch, no polling, no
runner/fill invocation, no trigger phrase, no click/review/final/submit/order
behavior, no credential/session handling, no Supabase execution write, and
total-read remains advisory.

Dev-only visible selectedRecommendation preview surface plan follow-up:
`docs/avanza-dev-only-visible-selected-recommendation-preview-surface-plan.md`
plans an optional future visible dev-only preview surface. Allowed future
surfaces include a dev-only panel inside Trade UI behind explicit test/dev
config, an isolated dev-only route behind explicit guard, or promoting the
existing test-only harness to a dev-only visual QA surface.

The plan keeps production-visible defaults, default Trade UI source switching,
enabled handoff buttons, bridge/fill/order paths, runtime execution, and
production-readiness claims forbidden. It requires `explicitPreviewOnlyFlag` to
remain false by default, selectedRecommendation preview disabled by default,
source indicator to show `selected_recommendation_preview_only` only when
explicitly enabled, controls disabled, the pre-activation gate locked,
total-read advisory, no bridge calls, no localhost fetch, no polling, no
runner/fill invocation, no trigger phrase, no click/review/final/submit/order
behavior, no credential/session handling, and no Supabase execution write.

Dev-only visible preview surface guard follow-up:
`lib/avanza-dev-visible-preview-surface-guard.ts` adds a pure guard model for a
future visible dev-only selectedRecommendation preview surface. The default
guard is `hidden`, cannot render the visible surface, cannot read
selectedRecommendation for preview, cannot call the bridge, cannot fetch
localhost, and cannot execute. A dev/test candidate model state may return
`visible_dev_only_allowed`, but it still forbids bridge calls, localhost fetch,
execution, enabled controls, and unlocked gates. Production-forbidden input is
blocked.

The guard is not wired into `app/trade-app.tsx`, no visible preview surface was
rendered, no route was added, selectedRecommendation preview remains disabled
by default, controls remain disabled, and the gate remains locked.

Dev-only visible selectedRecommendation preview surface component follow-up:
`components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurface.tsx`
adds an isolated prop-driven component that can render a future dev-only visible
preview surface only when passed an allowed guard state and a preview state.
Hidden or blocked guards render explanation copy only. An allowed guard renders
the passive `AvanzaSelectedRecommendationPreviewStatePanel`.

The component is not rendered in `app/trade-app.tsx`, no route was added, no
visible toggle was added, selectedRecommendation preview remains disabled by
default, controls remain disabled, the gate remains locked, and no bridge calls,
localhost fetch, polling, trigger/fill runner, click/review/final/submit/order
behavior, credential/session handling, or Supabase execution write was added.

Dev-only visible selectedRecommendation preview surface fixtures follow-up:
`lib/avanza-dev-visible-preview-surface-fixtures.ts` adds reusable static
fixture states for the isolated dev-only visible preview surface: hidden,
blocked, and `visible_dev_only_allowed`. The visible fixture uses an existing
valid selectedRecommendation preview state fixture and remains passive:
preview-only, no bridge calls, no localhost fetch, no execution, controls
disabled, gate locked, and total-read advisory. These fixtures are not wired
into `app/trade-app.tsx`, no route was added, and selectedRecommendation
preview remains disabled by default.

Dev-only visible selectedRecommendation preview surface gallery follow-up:
`components/execution/AvanzaDevVisibleSelectedRecommendationPreviewSurfaceGallery.tsx`
adds an isolated fixture-only gallery that renders the hidden, blocked, and
`visible_dev_only_allowed` fixtures through the visible preview surface
component. It shows fixture label, expected render state, fixture-only copy, not
rendered in production Trade UI copy, no bridge calls, no localhost fetch, and
no execution.

The gallery is not rendered in `app/trade-app.tsx`, no route was added, no
visible toggle was added, selectedRecommendation preview remains disabled by
default, controls remain disabled, the gate remains locked, and no bridge calls,
localhost fetch, polling, trigger/fill runner, click/review/final/submit/order
behavior, credential/session handling, or Supabase execution write was added.

Dev-only visible preview surface checkpoint follow-up:
`docs/avanza-dev-only-visible-preview-surface-checkpoint.md` summarizes the
guard, isolated component, fixtures, and fixture gallery phase before any future
dev route or visible Trade UI integration. It confirms the default guard is
hidden, the component and gallery are not rendered in `app/trade-app.tsx`, no
route exists, selectedRecommendation preview is disabled by default,
`explicitPreviewOnlyFlag` is false by default, there is no runtime environment
path, no `.env.local` dependency, controls are disabled, the pre-activation
gate is locked, no bridge calls, no localhost fetch, no polling, no runner/fill
invocation, no trigger phrase, no click/review/final/submit/order behavior, no
credential/session handling, no Supabase execution write, and total-read
remains advisory.

Dev-only visible preview surface route plan follow-up:
`docs/avanza-dev-only-visible-preview-surface-route-plan.md` plans an optional
future dev-only visual QA route or surface for the fixture-only visible preview
gallery. Allowed future surfaces include a dev-only route behind explicit guard,
an isolated component harness, or a Storybook-like component surface if adopted
later.

The plan forbids a production route, default Trade UI render, Settings render by
default, active handoff controls, bridge/fetch/execution behavior, polling,
runner/fill invocation, click/review/final/submit/order behavior,
credential/session handling, and Supabase writes. If a route is ever added, it
must be guarded explicitly, use fixture-only data by default, avoid real
selectedRecommendation state unless separately planned, avoid main navigation
links, and be included in UI safety scanning.

Dev-only visual QA route access guard follow-up:
`lib/avanza-dev-visual-qa-route-access.ts` adds a pure route access guard for a
future optional dev-only visual QA surface. The default decision is `hidden`,
cannot expose a route, cannot link from main navigation, cannot render the
fixture gallery, cannot use real selectedRecommendation state, cannot call the
bridge, cannot fetch localhost, and cannot execute. A dev-only fixture may
return `dev_route_allowed` for fixture-gallery route exposure only, while still
forbidding main navigation links, real selectedRecommendation state, bridge
calls, localhost fetches, and execution. No route was added and nothing was
wired into `app/trade-app.tsx`.

Dev-only visual QA route access fixtures/harness follow-up:
`lib/avanza-dev-visual-qa-route-access-fixtures.ts` adds reusable hidden,
production-forbidden blocked, and `dev_route_allowed` fixture-gallery-only route
access decisions. `components/execution/AvanzaDevVisualQaRouteAccessHarness.tsx`
renders those fixture decisions in an isolated prop-driven harness with route
status, fixture-gallery permission, main-navigation link status, real
selectedRecommendation state status, bridge/local fetch/execution status, and
explicit copy that no route is created.

The harness is not rendered in `app/trade-app.tsx`, no route was added, no
visible toggle was added, selectedRecommendation preview remains disabled by
default, controls remain disabled, the gate remains locked, and no bridge calls,
localhost fetch, polling, trigger/fill runner, click/review/final/submit/order
behavior, credential/session handling, or Supabase execution write was added.

Dev-only visual QA route access checkpoint follow-up:
`docs/avanza-dev-visual-qa-route-access-checkpoint.md` summarizes the route
access guard, hidden/blocked/`dev_route_allowed` fixtures, and isolated harness
before any future route creation. It confirms the default guard is hidden,
cannot expose a route, cannot link from main navigation, cannot render the
fixture gallery, and that `dev_route_allowed` exists only as fixture/model
state.

The checkpoint also confirms no route exists, the harness is not rendered in
`app/trade-app.tsx`, selectedRecommendation preview remains disabled by
default, no real selectedRecommendation state is used, controls remain
disabled, the gate remains locked, total-read remains advisory, and no bridge
calls, localhost fetch, polling, runner/fill invocation, trigger phrase,
click/review/final/submit/order behavior, credential/session handling, or
Supabase execution write was added.

Dev-only visual QA pre-route final checkpoint follow-up:
`docs/avanza-dev-visual-qa-pre-route-final-checkpoint.md` closes the completed
plan, guard, fixture, harness, and pre-route modeling phase before any future
dev-only route implementation. It records that no route exists, no app code is
wired into Trade UI, no component, gallery, or harness is rendered in
`app/trade-app.tsx`, selectedRecommendation preview remains disabled by
default, `explicitPreviewOnlyFlag` remains false by default, the default route
access guard is hidden, default route exposure and main-navigation linking are
not allowed, and the route plan uses fixture-only data with no real
selectedRecommendation state.

The checkpoint keeps controls disabled, the pre-activation gate locked,
total-read advisory, and forbids bridge calls, localhost fetch, polling,
runner/fill invocation, trigger phrase, fill/click/review/final/submit/order
behavior, credential/session/BankID/cookie/storage handling, and Supabase
execution writes. Next-phase options are to stop here, implement an isolated
dev-only visual QA route for fixture gallery only, or separately plan real
selectedRecommendation dev preview. All options continue to forbid execution,
fill, and trigger behavior.

Isolated dev visual QA route shell follow-up:
`docs/avanza-isolated-dev-visual-qa-route-implementation-plan.md` defines the
requirements for an isolated dev-only route and records the fixture-only route
shell at `app/dev/avanza-visual-qa/page.tsx`. The route only renders
fixture-only gallery/harness data, remains isolated from default Trade UI, stays
unlinked from main navigation, and remains passive/read-only.

The plan requires the route access guard, fixture-only data, no real Trade UI
state, no real selectedRecommendation state, no fetch, no bridge calls, no
localhost calls, no polling, no active controls, no
execution/fill/click/review/final/submit/order behavior, no credential/session
handling, no Supabase execution writes, no live endpoint strings, and no exact
trigger phrase. Route options remain: no route, isolated dev-only QA route for
fixtures only, or separate future real selectedRecommendation dev preview
planning.

Isolated dev visual QA route hardening checkpoint follow-up:
`docs/avanza-isolated-dev-visual-qa-route-hardening-checkpoint.md` confirms the
route exists only at `app/dev/avanza-visual-qa/page.tsx`, remains isolated, is
not linked from main navigation, is not imported by `app/trade-app.tsx`, uses
fixture-only data, does not read real selectedRecommendation state, does not
read Trade UI state, and keeps selectedRecommendation preview disabled by
default in Trade UI.

The hardening checkpoint also confirms controls remain disabled, the gate
remains locked, total-read remains advisory, and the route has no bridge calls,
localhost fetch, polling, runner/fill invocation, trigger phrase,
fill/click/review/final/submit/order behavior, credential/session/BankID/cookie
storage handling, Supabase execution write, or production readiness claim.

Dev-only visual QA route status panel follow-up:
`components/execution/AvanzaDevVisualQaRouteStatusPanel.tsx` adds a static
route-local fixture-only status panel and `app/dev/avanza-visual-qa/page.tsx`
renders it above the route access harness and visible preview surface gallery.
The panel shows dev-only visual QA route, fixture-only, not linked from main
navigation, no real selectedRecommendation state, no Trade UI state, no bridge
calls, no localhost fetch, no polling, no execution, controls disabled, gate
locked, and total-read advisory copy.

The panel does not fetch, does not call the bridge, does not read app state,
does not read real selectedRecommendation state, does not import
`app/trade-app.tsx`, contains no active controls, and adds no live endpoints or
trigger phrase.

Isolated dev visual QA route content checkpoint follow-up:
`docs/avanza-isolated-dev-visual-qa-route-content-checkpoint.md` documents the
exact fixture-only content rendered by `app/dev/avanza-visual-qa/page.tsx`: the
route-local status panel, route access harness, and visible preview surface
gallery. It confirms all three are fixture-only, the route is not linked from
main navigation, the route is not imported by `app/trade-app.tsx`,
`app/trade-app.tsx` was not changed, and the route reads neither real
selectedRecommendation state nor Trade UI state.

The checkpoint confirms selectedRecommendation preview remains disabled by
default in Trade UI, controls remain disabled, the gate remains locked,
total-read remains advisory, and route content has no bridge calls, localhost
fetch, polling, runner/fill invocation, trigger phrase,
fill/click/review/final/submit/order behavior, credential/session handling, or
Supabase execution write.

Isolated dev visual QA route final checkpoint follow-up:
`docs/avanza-isolated-dev-visual-qa-route-final-checkpoint.md` closes the
isolated dev-only visual QA route phase. It summarizes the route at
`app/dev/avanza-visual-qa/page.tsx`, the route-local status panel, route access
harness, visible preview surface gallery, fixture-only behavior, default Trade
UI behavior, isolation guarantees, safety guarantees, explicit non-goals, and
remaining not-implemented items.

The final checkpoint confirms the route is isolated, fixture-only, not linked
from main navigation, not imported by `app/trade-app.tsx`, and that
`app/trade-app.tsx` was not changed. It confirms the route does not read real
selectedRecommendation state or Trade UI state, selectedRecommendation preview
remains disabled by default in Trade UI, `explicitPreviewOnlyFlag` remains false
by default, controls remain disabled, the pre-activation gate remains locked,
total-read remains advisory, and there are no bridge calls, localhost fetches,
polling, runner/fill invocation, trigger phrase,
fill/click/review/final/submit/order behavior, credential/session handling, or
Supabase execution writes.

Isolated dev visual QA route phase completion checkpoint follow-up:
`docs/avanza-isolated-dev-visual-qa-route-phase-completion-checkpoint.md` marks
the isolated dev-only visual QA route phase as complete and safe to pause. It
records the completed route, status panel, route access harness, visible preview
surface gallery, fixture-only behavior, default Trade UI behavior, isolation
guarantees, safety guarantees, validation coverage, and deliberately
not-implemented items.

The phase completion checkpoint confirms the route remains fixture-only,
unlinked from main navigation, not imported by `app/trade-app.tsx`, and not
using real selectedRecommendation or Trade UI state. It confirms
selectedRecommendation preview remains disabled by default in Trade UI,
`explicitPreviewOnlyFlag` remains false by default, controls remain disabled,
the pre-activation gate remains locked, total-read remains advisory, and there
are no bridge calls, localhost fetches, polling, runner/fill invocation, trigger
phrase, fill/click/review/final/submit/order behavior,
credential/session/BankID/cookie/storage handling, Supabase execution writes,
or production readiness claims.

Read-only real selectedRecommendation dev preview plan follow-up:
`docs/avanza-read-only-real-selected-recommendation-dev-preview-plan.md` plans a
future dev-only/read-only phase for previewing Avanza handoff state derived from
a real selectedRecommendation. This is planning only: no app code changed, no
`app/trade-app.tsx` change, no existing dev route change, no real
selectedRecommendation wiring, no runtime environment config, and no `.env.local`
change.

The plan allows future selectedRecommendation reads only after explicit dev-only
guards, through the existing adapter and derived-preview helper, rendering
read-only preview state with controls disabled, gate locked, and total-read
advisory. It requires dev-only route/access, selectedRecommendation read-only
preview, preview-state derivation, and disabled-controls/gate-locked guards.
It forbids production/default enablement, main Trade UI activation by default,
active handoff buttons, bridge calls, localhost fetch, polling, trigger phrase,
fill/click/review/final/submit/order behavior, credential/session handling,
Supabase execution writes, and production readiness claims.

Read-only selectedRecommendation dev preview guard follow-up:
`lib/avanza-read-only-selected-recommendation-dev-preview-guard.ts` adds a pure
guard model for a future read-only real selectedRecommendation dev preview. The
default guard is `hidden`, cannot read real selectedRecommendation, cannot
derive preview state, cannot render read-only preview, can use fixture fallback,
cannot call the bridge, cannot fetch localhost, cannot poll, cannot execute,
keeps controls disabled, and keeps the gate locked.

A dev-only fixture/config may return `read_only_dev_preview_allowed` and allow
real selectedRecommendation reads for read-only preview derivation only, while
still forbidding bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates. The helper is not wired into the dev route or
`app/trade-app.tsx`, and no real selectedRecommendation state is read or
rendered.

Read-only selectedRecommendation dev preview guard fixture follow-up:
`lib/avanza-read-only-selected-recommendation-dev-preview-fixtures.ts` adds
static hidden, blocked production-forbidden, and
`read_only_dev_preview_allowed` fixture states for the guard model. The allowed
fixture models read-only selectedRecommendation preview capability only for
future dev planning; every fixture still forbids bridge calls, localhost
fetches, polling, execution, enabled controls, and unlocked gates. These
fixtures are not wired into Trade UI.

Read-only selectedRecommendation dev preview guard harness follow-up:
`components/execution/AvanzaReadOnlySelectedRecommendationDevPreviewGuardHarness.tsx`
adds an isolated prop-driven harness for the guard fixtures. The harness
renders fixture labels, guard status, read/derive/render permissions, fixture
fallback permission, bridge/localhost/polling/execution flags, disabled
controls, and locked gate state. It is rendered in the isolated dev-only visual
QA route as fixture/model-only content. It is not wired into Trade UI, does not
read real selectedRecommendation state, does not fetch, does not call the
bridge, and does not add active controls.

Read-only selectedRecommendation dev preview guard checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-dev-preview-guard-checkpoint.md`
summarizes the completed guard, fixture, and harness phase. The checkpoint
records that the default guard is hidden, `read_only_dev_preview_allowed`
exists only as fixture/model state, the harness is rendered in the isolated
dev-only visual QA route as fixture/model-only content, the harness is not
wired into Trade UI, the route remains fixture-only, no real
selectedRecommendation state is read or rendered, controls remain disabled, and
the pre-activation gate remains locked.

Read-only selectedRecommendation dev preview route section checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-dev-preview-route-section-checkpoint.md`
summarizes the isolated dev-only visual QA route section that renders the guard
harness as fixture/model-only content. It confirms that the route remains
unlinked from main navigation, `app/trade-app.tsx` was not changed, the harness
is not rendered in Trade UI, no real selectedRecommendation state is read or
rendered, no real preview state is derived, controls remain disabled, the
pre-activation gate remains locked, and total-read remains advisory.

Read-only selectedRecommendation derivation plan follow-up:
`docs/avanza-read-only-selected-recommendation-derivation-plan.md` plans a
future dev-only/read-only phase for actual selectedRecommendation derivation.
The plan requires an explicit selectedRecommendation source, adapter
normalization, derived preview-state building, read-only presentation, disabled
controls, and a locked gate. It is planning only: no app code, route behavior,
Trade UI behavior, real selectedRecommendation read, real preview derivation,
bridge call, localhost fetch, polling, active handoff control, or execution path
is added.

Read-only selectedRecommendation derivation decision model follow-up:
`lib/avanza-read-only-selected-recommendation-derivation-decision.ts` adds a
pure decision model for explicit selectedRecommendation-like inputs. It returns
`no_input`, `blocked`, `invalid_input`, or `derivation_allowed` while keeping
bridge calls, localhost fetches, polling, execution, enabled controls, and
unlocked gates forbidden. The model is not wired into Trade UI or the dev
route, does not read app or route state, and does not derive real preview state.

Read-only selectedRecommendation derivation decision fixture follow-up:
`lib/avanza-read-only-selected-recommendation-derivation-decision-fixtures.ts`
adds static `no_input`, `blocked_guard`, `invalid_input`, and
`derivation_allowed` fixture states for the pure derivation decision model. The
allowed fixture remains model-only and still forbids bridge calls, localhost
fetches, polling, execution, enabled controls, and unlocked gates. The fixtures
are not wired into Trade UI or the dev route and do not derive real preview
state.

Read-only selectedRecommendation derivation decision harness follow-up:
`components/execution/AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness.tsx`
adds an isolated prop-driven harness for the derivation decision fixtures. The
harness renders source mode, read/derive/render flags, fixture fallback,
bridge/localhost/polling/execution flags, disabled controls, and locked gate
state. It is not wired into Trade UI or the dev route, does not read app or
route state, and does not derive real preview state.

Read-only selectedRecommendation derivation decision checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-derivation-decision-checkpoint.md`
summarizes the completed decision model, fixture, and isolated harness phase
before route wiring or real derivation. It records that `no_input` uses fixture
fallback, blocked and invalid states cannot derive or render, the allowed state
exists only as fixture/model state, the harness is not wired into Trade UI or
the dev route, no real selectedRecommendation state is read or rendered, and no
real preview state is derived or rendered.

Read-only selectedRecommendation derivation decision route harness follow-up:
`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaReadOnlySelectedRecommendationDerivationDecisionHarness` as a
fixture/model-only section. The section says decision fixture only, no real
selectedRecommendation state is read from app or route, no real
selectedRecommendation state is rendered, no real preview state is derived or
rendered, no bridge calls, no localhost fetch, no polling, no execution,
controls disabled, and gate locked. It does not change `app/trade-app.tsx` and
does not wire real selectedRecommendation derivation.

Read-only selectedRecommendation derivation decision route section checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-derivation-decision-route-section-checkpoint.md`
summarizes the isolated dev-only visual QA route section that renders the
derivation decision harness. The checkpoint confirms the route section is
fixture/model-only, the route remains unlinked from main navigation,
`app/trade-app.tsx` was not changed, the harness is not rendered in Trade UI,
no real selectedRecommendation state is read or rendered from app or route, no
real preview state is derived or rendered, controls remain disabled, the
pre-activation gate remains locked, total-read remains advisory, and no bridge,
localhost, polling, runner/fill, trigger, order, credential/session, or
Supabase execution path is added.

Read-only selectedRecommendation dev preview phase completion checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-dev-preview-phase-completion-checkpoint.md`
closes the guard, derivation decision, and route-visible fixture/model phase
before any adapter or derived-preview integration. It confirms both the guard
harness and derivation decision harness are rendered on
`app/dev/avanza-visual-qa/page.tsx` as fixture/model-only sections, the route
remains unlinked from main navigation, `app/trade-app.tsx` was not changed, no
harness is rendered in Trade UI, no real selectedRecommendation state is read
or rendered from app or route, no real preview state is derived or rendered,
selectedRecommendation preview remains disabled by default in Trade UI,
`explicitPreviewOnlyFlag` remains false by default, controls remain disabled,
the pre-activation gate remains locked, total-read remains advisory, and no
bridge, localhost, polling, runner/fill, trigger, order, credential/session,
Supabase execution, or production-readiness path is added.

Read-only selectedRecommendation adapter/derived-preview integration plan follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-plan.md`
plans the future integration path from explicit selectedRecommendation-like
input through the existing selectedRecommendation adapter and derived-preview
helper. The plan requires read-only guards, derivation decision checks, adapter
normalization, derived preview state building, read-only presentation, disabled
controls, and a locked gate. It is planning only: no app code, route code,
Trade UI code, real selectedRecommendation read, real preview derivation, real
preview rendering, bridge call, localhost fetch, polling, runner/fill,
trigger, order, credential/session, Supabase execution, or production-readiness
path is added.

Read-only selectedRecommendation adapter/derived-preview integration decision model follow-up:
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`
adds a pure decision model for the first future adapter/derived-preview review
gate. It accepts an explicit derivation decision and selectedRecommendation-like
input, returns `no_input`, `blocked`, `invalid_input`, or
`adapter_review_required` model state, and keeps fixture fallback available
where appropriate. The model does not call the selectedRecommendation adapter,
does not call the derived-preview builder, does not derive or render real
preview state, keeps bridge calls, localhost fetches, polling, execution,
enabled controls, unlocked gates, and production-readiness claims forbidden,
and is not wired into Trade UI or the dev route.

Read-only selectedRecommendation adapter/derived-preview integration decision fixture follow-up:
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-fixtures.ts`
adds static `no_input`, `blocked_derivation_decision`, `invalid_input`,
`adapter_review_required`, and `integration_allowed` fixture states for the
pure integration decision model. The `integration_allowed` fixture is a
future/model-only capability state: it can mark normalization, derived-preview
builder access, and read-only preview rendering as future flags, but it still
does not call the adapter, does not call the derived-preview builder, does not
derive or render real preview state, keeps controls disabled and the gate
locked, and is not wired into Trade UI or the dev route.

Read-only selectedRecommendation adapter/derived-preview integration decision harness follow-up:
`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewIntegrationDecisionHarness.tsx`
adds an isolated prop-driven harness for the adapter/derived-preview integration
decision fixtures. It renders fixture labels, decision status, source mode,
adapter review, normalization, derived-preview builder, read-only preview,
fixture fallback, bridge/localhost/polling/execution, disabled-control, and
locked-gate flags. The harness is rendered in `app/dev/avanza-visual-qa/page.tsx`
as a fixture/model-only section and is not wired into Trade UI. It does not
call the adapter or derived-preview builder, does not read real
selectedRecommendation state, does not derive or render real preview state, and
does not add active controls or execution behavior.

Read-only selectedRecommendation adapter/derived-preview integration decision checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-checkpoint.md`
summarizes the completed integration decision model, fixture, and isolated
harness phase. It confirms `no_input` uses fixture fallback,
`blocked_derivation_decision` and `invalid_input` block integration,
`adapter_review_required` and `integration_allowed` exist only as
fixture/model states, the harness is rendered in the dev-only visual QA route
as a fixture/model-only section and not rendered in Trade UI, the existing dev
route remains fixture/model-only, the adapter and derived-preview builder are
not called, no real selectedRecommendation state is read or rendered from app
or route, no real preview state is derived or rendered, controls remain
disabled, the pre-activation gate remains locked, and no bridge, localhost,
polling, runner/fill, trigger, order, credential/session, Supabase execution,
or production-readiness path is added.

Read-only selectedRecommendation adapter/derived-preview integration decision route section checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-route-section-checkpoint.md`
summarizes the isolated dev-only visual QA route section that renders the
adapter/derived-preview integration decision harness. The checkpoint confirms
the section is fixture/model-only, the route remains unlinked from main
navigation, `app/trade-app.tsx` was not changed, the harness is not rendered in
Trade UI, no real selectedRecommendation state is read or rendered from app or
route, the adapter and derived-preview builder are not called, no real preview
state is derived or rendered, controls remain disabled, the pre-activation gate
remains locked, and no bridge, localhost, polling, runner/fill, trigger, order,
credential/session, Supabase execution, or production-readiness path is added.

Read-only selectedRecommendation adapter/derived-preview integration decision phase completion checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision-phase-completion-checkpoint.md`
closes the adapter/derived-preview integration decision route-visible
fixture/model phase. It records the completed integration decision model,
fixtures, harness, and dev-only QA route section before any adapter safety
review or actual adapter/derived-preview invocation. It confirms
`app/trade-app.tsx` was not changed, the route remains unlinked from main
navigation, the harness is not rendered in Trade UI, no real
selectedRecommendation state is read or rendered from app or route, the adapter
and derived-preview builder are not called, no real preview state is derived or
rendered, controls remain disabled, the pre-activation gate remains locked, and
no bridge, localhost, polling, runner/fill, trigger, order,
credential/session, Supabase execution, or production-readiness path is added.

Read-only selectedRecommendation adapter safety review plan follow-up:
`docs/avanza-selected-recommendation-adapter-safety-review-plan.md` plans the
safety review required before any actual selectedRecommendation adapter or
derived-preview builder invocation. The plan names the adapter,
derived-preview helper, preview-state builder, integration guard, and
integration decision model as review targets. It requires checks for purity,
imports, runtime/env access, fetch/bridge/localhost/polling/execution,
invalid input handling, derived-preview failure handling, disabled controls,
locked gate semantics, and safety guard coverage. It does not call the adapter,
does not call the derived-preview builder, does not read real
selectedRecommendation state, does not derive or render real preview state, and
does not add route, Trade UI, bridge, localhost, polling, execution,
credential/session, Supabase execution, or production-readiness behavior.

Read-only selectedRecommendation adapter safety static audit checkpoint follow-up:
`docs/avanza-selected-recommendation-adapter-safety-static-audit-checkpoint.md`
adds static audit coverage for the candidate adapter and derived-preview helper
files before any future invocation. The audit covers
`lib/avanza-selected-recommendation-adapter.ts`,
`lib/avanza-selected-recommendation-derived-preview-state.ts`,
`lib/avanza-selected-recommendation-preview-state.ts`,
`lib/avanza-selected-recommendation-preview-integration-guard.ts`, and
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-decision.ts`.
It scans for forbidden fetch, localhost, polling, runner/fill, trigger,
active order behavior, credential/session/storage, Supabase execution, and
production/execution readiness patterns. It also confirms the dev route remains
fixture/model-only, Trade UI does not import the integration decision harness or
dev route, no adapter or derived-preview builder call is added by this phase,
controls remain disabled, and the gate remains locked.

Read-only selectedRecommendation adapter safety review result checkpoint follow-up:
`docs/avanza-selected-recommendation-adapter-safety-review-result-checkpoint.md`
summarizes the result of the adapter safety static audit before any actual
adapter or derived-preview invocation. It confirms the audit is static-only,
the adapter is not called, the derived-preview builder is not called, no real
selectedRecommendation state is read or rendered, no real preview state is
derived or rendered, no route or Trade UI behavior changed, selectedRecommendation
preview remains disabled by default, controls remain disabled, the gate remains
locked, and no bridge, localhost, polling, runner/fill, trigger,
fill/click/review/final/submit/order, credential/session, Supabase execution,
or production-readiness path is added. It also states the audit does not prove
runtime adapter output correctness and does not enable route or Trade UI
integration.

Read-only selectedRecommendation adapter/derived-preview wrapper plan follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-plan.md`
plans a future pure wrapper for adapter normalization plus derived-preview
creation. The plan is planning-only: no wrapper implementation, no adapter
call, no derived-preview builder call, no real selectedRecommendation read, no
real preview state derivation, no route or Trade UI wiring, and no runtime env
path. It requires explicit input, explicit integration decision input, disabled
controls, locked gate, and continued bans on bridge calls, localhost fetch,
polling, runner/fill invocation, trigger, fill/click/review/final/submit/order,
credential/session handling, Supabase execution writes, and production
readiness claims.

Read-only selectedRecommendation adapter/derived-preview integration phase completion follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-integration-phase-completion-checkpoint.md`
closes the adapter/derived-preview integration phase as a completed
planning/decision/static-audit/wrapper-plan phase before any future wrapper
implementation. It confirms the integration decision harness remains
fixture/model-only on the isolated dev route, the route remains unlinked from
main navigation, `app/trade-app.tsx` was not changed, no real
selectedRecommendation state is read or rendered, no real preview state is
derived or rendered, the adapter and derived-preview builder are not called,
selectedRecommendation preview remains disabled by default, controls remain
disabled, the pre-activation gate remains locked, and no bridge, localhost,
polling, runner/fill, trigger, fill/click/review/final/submit/order,
credential/session, Supabase execution, or production-readiness path is added.

Read-only selectedRecommendation adapter/derived-preview wrapper pre-implementation follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-pre-implementation-checkpoint.md`
adds the final checkpoint before creating any pure adapter/derived-preview
wrapper. It permits only a pure wrapper module with static fixtures, explicit
selectedRecommendation-like input, and explicit integration decision input. It
keeps `app/trade-app.tsx` unchanged, keeps the existing dev route unchanged and
fixture/model-only, keeps the route unlinked from main navigation, keeps
selectedRecommendation preview disabled by default, keeps controls disabled and
the gate locked, and continues to forbid route wiring, Trade UI wiring, real
selectedRecommendation reads, real preview derivation/rendering, bridge calls,
localhost fetch, polling, runner/fill invocation, trigger,
fill/click/review/final/submit/order, credential/session handling, Supabase
execution writes, and production readiness claims.

Read-only selectedRecommendation adapter/derived-preview wrapper skeleton follow-up:
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`
adds a pure skeleton for the future wrapper contract. It accepts explicit input
only, accepts an explicit integration decision, returns safe statuses and safety
flags, keeps `previewState` null, and currently returns the ready path as
adapter-pending rather than invoking adapter normalization or derived-preview
creation. It is not wired into `app/trade-app.tsx`, does not read real
selectedRecommendation state, does not derive or render real preview state,
keeps selectedRecommendation preview disabled by default, controls disabled,
and the gate locked. The skeleton is now visible only through the isolated dev
route's fixture/model-only wrapper harness section and adds no bridge,
localhost, polling, runner/fill, trigger, order,
credential/session, Supabase execution, or production-readiness behavior.

Read-only selectedRecommendation adapter/derived-preview wrapper fixture follow-up:
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-fixtures.ts`
adds static fixtures for the pure wrapper skeleton. The fixtures cover
`no_input`, `blocked`, `invalid_input`, `adapter_rejected`,
`derived_preview_failed_model_only`, and `read_only_preview_ready_model_only`.
The model-only future states still return the skeleton's safe adapter-pending
result, keep `previewState` null, do not call the adapter, do not call the
derived-preview builder, are not wired into Trade UI, are rendered only through
the isolated dev route's fixture/model-only wrapper harness section, keep
controls disabled and the gate locked, and add no bridge, localhost, polling,
runner/fill, trigger, order, credential/session, Supabase execution, or
production-readiness behavior.

Read-only selectedRecommendation adapter/derived-preview wrapper harness follow-up:
`components/execution/AvanzaReadOnlySelectedRecommendationAdapterDerivedPreviewWrapperHarness.tsx`
adds an isolated prop-driven harness for the wrapper fixtures. It renders
fixture states and safety flags only, is not wired into Trade UI, is rendered
on the isolated dev route as a fixture/model-only section, does not read real
selectedRecommendation state, does not derive or render real preview state,
does not call the adapter or derived-preview builder, keeps controls disabled
and the gate locked, and adds no bridge, localhost, polling, runner/fill,
trigger, order, credential/session, Supabase execution, or production-readiness
behavior.

Read-only selectedRecommendation adapter/derived-preview wrapper checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-checkpoint.md`
summarizes the completed wrapper skeleton, static fixtures, and isolated
harness route-section phase. It confirms the harness is not wired into Trade
UI, the isolated dev route renders it as fixture/model-only content,
`previewState` remains null/undefined, ready/future states are
model-only/pending, no real selectedRecommendation state is read or rendered,
no real preview state is derived or rendered, the adapter and derived-preview
builder are not called, selectedRecommendation preview remains disabled by
default, controls remain disabled, and the gate remains locked.

Read-only selectedRecommendation adapter/derived-preview wrapper route section checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-route-section-checkpoint.md`
records the isolated dev-only visual QA route section that renders the wrapper
harness as fixture/model-only content. It confirms the route remains unlinked
from main navigation, `app/trade-app.tsx` was not changed, the wrapper harness
is not rendered in Trade UI, no real selectedRecommendation state is read or
rendered, no adapter or derived-preview builder is called, `previewState`
remains null/undefined, no real preview state is derived or rendered,
selectedRecommendation preview remains disabled by default in Trade UI,
controls remain disabled, the gate remains locked, and no bridge, localhost,
polling, runner/fill, trigger, fill/click/review/final/submit/order,
credential/session, Supabase execution, or production-readiness behavior is
added.

Read-only selectedRecommendation adapter/derived-preview wrapper phase completion checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper-phase-completion-checkpoint.md`
closes the pure wrapper skeleton/fixtures/harness/route-section phase. It
confirms the wrapper harness is rendered on `app/dev/avanza-visual-qa/page.tsx`
as fixture/model-only content, the route remains unlinked from main navigation,
`app/trade-app.tsx` was not changed, the wrapper harness is not rendered in
Trade UI, no real selectedRecommendation state is read or rendered, no adapter
or derived-preview builder is called, `previewState` remains null/undefined, no
real preview state is derived or rendered, selectedRecommendation preview
remains disabled by default in Trade UI, `explicitPreviewOnlyFlag` remains
false by default, controls remain disabled, the gate remains locked, total-read
remains advisory, and no bridge, localhost, polling, runner/fill, trigger,
fill/click/review/final/submit/order, credential/session, Supabase execution,
or production-readiness behavior is added.

Read-only selectedRecommendation static-fixture adapter invocation plan follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-plan.md`
plans the next possible pure wrapper step: adapter invocation with static
selectedRecommendation-like fixtures only. The plan is not an implementation.
It keeps app code, `app/trade-app.tsx`, the existing dev route, and wrapper code
unchanged for now; forbids real selectedRecommendation state reads, real
preview derivation/rendering, derived-preview builder calls, route/Trade UI
wiring, bridge calls, localhost fetch, polling, runner/fill, trigger,
fill/click/review/final/submit/order, credential/session handling, and
Supabase execution writes; and requires `previewState` to remain null,
controls disabled, and the gate locked until a separate derived-preview phase
is planned.

Read-only selectedRecommendation static-fixture adapter invocation pre-implementation checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-pre-implementation-checkpoint.md`
adds the final checkpoint before any future pure wrapper code change that would
call the adapter with static fixtures. It confirms the current state remains
checkpoint-only: `app/trade-app.tsx`, `app/dev/avanza-visual-qa/page.tsx`, and
wrapper code are unchanged; the route remains fixture/model-only and unlinked;
no real selectedRecommendation state is read or rendered; no real preview state
is derived or rendered; the adapter and derived-preview builder remain uncalled;
`previewState` remains null; controls remain disabled; and the gate remains
locked. The next allowed implementation, if approved later, is pure wrapper
code only with static fixture input only and no route or Trade UI wiring.

Read-only selectedRecommendation static-fixture adapter invocation implementation follow-up:
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`
now calls the selectedRecommendation adapter only inside the pure wrapper for
explicit static fixture normalization behind an explicit allowed integration
decision. Static wrapper fixtures can now produce
`adapter_normalized_static_fixture` with a safe `normalizedInputSummary`.
`previewState` remains null, `canRenderReadOnlyPreview` remains false, the
derived-preview builder is not called, `app/trade-app.tsx` is unchanged, the
existing dev route is unchanged, the route remains fixture/model-only and
unlinked, no real selectedRecommendation state is read or rendered from app or
route, no real preview state is derived or rendered, controls remain disabled,
the gate remains locked, and no bridge, localhost, polling, runner/fill,
trigger, fill/click/review/final/submit/order, credential/session, or Supabase
execution path is added.

Read-only selectedRecommendation static-fixture adapter invocation checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-adapter-invocation-checkpoint.md`
closes the static-fixture adapter invocation phase. It confirms adapter
invocation exists only inside the pure wrapper with explicit static fixture
input, `normalizedInputSummary` is safe/minimal, `previewState` remains
null/undefined, no derived-preview builder is called, no real
selectedRecommendation state is read or rendered from app/route/Trade UI, the
wrapper harness and route remain fixture/model-only, selectedRecommendation
preview remains disabled by default in Trade UI, controls remain disabled, the
pre-activation gate remains locked, total-read remains advisory, and no bridge,
localhost, polling, runner/fill, trigger, fill/click/review/final/submit/order,
credential/session, or Supabase execution path is added.

Read-only selectedRecommendation static-fixture derived-preview invocation plan follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-plan.md`
plans the next possible pure wrapper step: calling the derived-preview builder
only after static fixture adapter normalization. The plan is planning-only: no
app code, wrapper code, route code, or Trade UI code is changed; `previewState`
remains null/undefined today; no derived-preview builder is called yet; no real
selectedRecommendation state is read or rendered; no real preview state is
derived or rendered; selectedRecommendation preview remains disabled by default
in Trade UI; controls remain disabled; the pre-activation gate remains locked;
total-read remains advisory; and no bridge, localhost, polling, runner/fill,
trigger, fill/click/review/final/submit/order, credential/session, or Supabase
execution path is added.

Read-only selectedRecommendation static-fixture derived-preview invocation pre-implementation checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-pre-implementation-checkpoint.md`
has now been followed for a pure wrapper/static-fixture-only implementation. It
confirms the derived-preview builder may be called only inside the pure wrapper
after explicit static fixture adapter normalization; `derived_preview_failed`
keeps failure output safe; `read_only_preview_ready` is the only wrapper state
with `previewState`; `canRenderReadOnlyPreview` is true only for that ready
state; `app/trade-app.tsx` remains unchanged; the existing dev route remains
fixture/model-only and unlinked; selectedRecommendation preview remains
disabled by default in Trade UI; controls remain disabled; the pre-activation
gate remains locked; and no bridge, localhost, polling, runner/fill, trigger,
fill/click/review/final/submit/order, credential/session, or Supabase execution
path is added.

Read-only selectedRecommendation static-fixture derived-preview invocation
implementation follow-up:
`lib/avanza-read-only-selected-recommendation-adapter-derived-preview-wrapper.ts`
now invokes `buildAvanzaSelectedRecommendationPreviewState(...)` only for
explicit static fixture output after adapter normalization succeeds. Static
wrapper fixtures now include `derived_preview_failed` and
`read_only_preview_ready`. The wrapper harness and isolated dev-only visual QA
route copy show that derived-preview output is static-fixture-only, no real
selectedRecommendation state is read from app or route, no real app or route
preview state is derived, no real preview state is rendered in Trade UI,
controls remain disabled, the gate remains locked, and all execution/fill/order
paths remain forbidden.

Read-only selectedRecommendation static-fixture derived-preview invocation
checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-invocation-checkpoint.md`
closes the static-fixture derived-preview invocation phase. It confirms
derived-preview invocation exists only inside the pure wrapper, uses explicit
static fixture input only, keeps adapter normalization static-fixture-only,
produces read-only `previewState` only for `read_only_preview_ready`, keeps no
real selectedRecommendation state read/rendered from app or route, keeps no
real app/route preview state derived/rendered, keeps Trade UI default behavior
unchanged, keeps selectedRecommendation preview disabled by default in Trade UI,
keeps controls disabled, keeps the pre-activation gate locked, and adds no
bridge, localhost, polling, runner/fill, trigger, fill/click/review/final/
submit/order, credential/session, or Supabase execution path.

Read-only selectedRecommendation static previewState route visibility hardening
checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-static-previewstate-route-visibility-hardening-checkpoint.md`
hardens the route-visible previewState boundary. It confirms previewState may
be visible only through wrapper harness static fixture output, only for
`read_only_preview_ready`, while the dev route remains fixture/model-only,
unlinked from main navigation, disconnected from Trade UI, and forbidden from
reading real selectedRecommendation state or deriving/rendering real app/route
preview state.

Read-only selectedRecommendation static-fixture derived-preview phase completion
checkpoint follow-up:
`docs/avanza-read-only-selected-recommendation-static-fixture-derived-preview-phase-completion-checkpoint.md`
marks the static-fixture derived-preview invocation phase complete and safe to
pause before any real selectedRecommendation read-only input planning. It keeps
derived-preview invocation pure-wrapper-only, static-fixture-only, and
read-only; keeps route-visible previewState fixture-only; keeps Trade UI
unchanged; keeps controls disabled and the gate locked; and continues to forbid
bridge calls, localhost fetches, polling, runner/fill invocation, trigger
phrases, fill/click/review/final/submit/order, credential/session handling, and
Supabase execution writes.

Read-only real selectedRecommendation input planning follow-up:
`docs/avanza-real-selected-recommendation-read-only-input-plan.md` scopes the
next possible phase as planning-only. It defines a future explicitly guarded
dev-only/read-only selectedRecommendation input path with missing, blocked,
invalid, and valid input states before any later read-only derivation model. It
does not change app code, does not change `app/trade-app.tsx`, does not change
the existing dev route, does not read real selectedRecommendation state yet,
does not derive real preview state, keeps selectedRecommendation preview
disabled by default in Trade UI, keeps controls disabled and the gate locked,
and continues to forbid bridge calls, localhost fetches, polling, runner/fill
invocation, trigger phrases, fill/click/review/final/submit/order,
credential/session handling, and Supabase execution writes.

Read-only real selectedRecommendation input guard follow-up:
`lib/avanza-real-selected-recommendation-read-only-input-guard.ts` adds the pure
guard model for the first future real selectedRecommendation input boundary.
The default output is hidden with `sourceMode: fixture_only`, cannot read real
selectedRecommendation, cannot validate input, cannot proceed to read-only
derivation, and can use fixture fallback. An explicit dev/read-only model state
may return `read_only_input_allowed`, but still forbids bridge calls, localhost
fetches, polling, execution, enabled controls, and unlocked gates. It is not
wired into Trade UI or the dev route and does not read or render real
selectedRecommendation state.

Read-only real selectedRecommendation input guard fixture follow-up:
`lib/avanza-real-selected-recommendation-read-only-input-guard-fixtures.ts`
adds static fixture states for hidden default, blocked production-forbidden,
and read-only input allowed guard decisions. The fixtures are model-only, are
not wired into Trade UI or the dev route, do not read real selectedRecommendation
state, and keep bridge calls, localhost fetches, polling, execution, enabled
controls, and unlocked gates forbidden.

Read-only real selectedRecommendation input guard harness follow-up:
`components/execution/AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness.tsx`
adds an isolated prop-driven harness for the guard fixtures. It is not wired
into Trade UI or the dev route, does not read app state, does not read or render
real selectedRecommendation state, does not call the adapter, does not call a
derived-preview builder, and keeps all controls disabled with the gate locked.

Read-only real selectedRecommendation input guard route section plan follow-up:
`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-plan.md`
plans a future fixture/model-only section on the isolated dev QA route for the
input guard harness. This is planning only: it does not change the route, does
not wire the harness into Trade UI or the dev route yet, does not read real
selectedRecommendation state, and does not derive or render real app/route
preview state.

Read-only real selectedRecommendation input guard route section pre-implementation
checkpoint follow-up:
`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-pre-implementation-checkpoint.md`
adds the go/no-go checkpoint before route rendering. It permits only a future
fixture/model-only dev QA route section and continues to forbid Trade UI wiring,
real selectedRecommendation reads/renders, real app/route preview derivation,
bridge calls, localhost fetches, polling, active controls, and execution.

Read-only real selectedRecommendation input guard route section implementation
follow-up:
`app/dev/avanza-visual-qa/page.tsx` now renders
`AvanzaRealSelectedRecommendationReadOnlyInputGuardHarness` as fixture/model-only
dev QA route content. It uses only static guard fixtures, shows hidden,
blocked, and read-only input allowed model states, labels the allowed state
model-only/read-only, keeps the route unlinked from main navigation, leaves
`app/trade-app.tsx` unchanged, and does not read or render real
selectedRecommendation state or derive real app/route preview state.

Read-only real selectedRecommendation input guard route section checkpoint
follow-up:
`docs/avanza-real-selected-recommendation-read-only-input-guard-route-section-checkpoint.md`
records the completed fixture/model-only route section. It confirms
`hidden_default`, `blocked_production_forbidden`, and
`read_only_input_allowed` remain static guard fixtures only, the allowed state
is model-only/read-only and not active, controls stay disabled, the gate stays
locked, and bridge/localhost/poll/execution remain false.

Read-only real selectedRecommendation input validation model follow-up:
`lib/avanza-real-selected-recommendation-read-only-input-validation.ts` adds a
pure explicit-input validation model. It accepts only input passed directly to
the helper, returns `no_input`, `guard_blocked`, `invalid_input`, or
`valid_read_only_input`, exposes a safe normalized input summary only for valid
input, and remains unwired from Trade UI and the dev route. It does not read
real selectedRecommendation state from app/route and does not derive preview
state.

Read-only real selectedRecommendation derivation plan follow-up:
`docs/avanza-real-selected-recommendation-read-only-derivation-plan.md` plans a
future explicit-input derivation phase. It requires guard approval, validation
approval, adapter normalization after validation, and derived-preview generation
only after adapter normalization succeeds. The plan does not implement
derivation, does not change Trade UI, does not change the dev route, and does
not add execution capability.

Read-only real selectedRecommendation derivation pre-implementation checkpoint
follow-up:
`docs/avanza-real-selected-recommendation-read-only-derivation-pre-implementation-checkpoint.md`
permits only a future pure helper implementation. The helper must accept
explicit selectedRecommendation-like input plus explicit guard/validation
context, may call adapter normalization only after `valid_read_only_input`, may
call derived-preview generation only after adapter normalization succeeds, and
must keep Trade UI wiring, dev route wiring, app/route state reads, bridge
calls, localhost fetches, polling, active controls, Supabase writes, and
execution forbidden.

Read-only real selectedRecommendation derivation helper follow-up:
`lib/avanza-real-selected-recommendation-read-only-derivation.ts` adds the pure
explicit-input helper. It validates through
`buildAvanzaRealSelectedRecommendationReadOnlyInputValidation(...)`, calls
selectedRecommendation adapter normalization only after
`valid_read_only_input`, and calls derived-preview output only after adapter
normalization succeeds. It returns `no_input`, `guard_blocked`,
`invalid_input`, `adapter_rejected`, `derived_preview_failed`, or
`read_only_preview_ready`; only `read_only_preview_ready` includes
`previewState` and `canRenderReadOnlyPreview: true`.

The helper is not wired into Trade UI or the dev route, does not read app/route
state, does not render real selectedRecommendation preview, keeps
`canProceedToHandoff: false`, and keeps bridge/local/poll/execution false with
controls disabled and the gate locked.

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
