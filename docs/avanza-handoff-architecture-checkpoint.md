# Avanza Handoff Architecture Checkpoint

## 1. Current Milestone

Milestone status:
`first_real_avanza_quantity_based_fill_only_core_poc_success_total_read_unresolved`

The Avanza work has moved from a proven quantity-based fill-only POC to a locked
preview-only Trade UI representation.

Current UI state:

- source mode: `static_fixture`
- pre-activation gate: `locked`
- handoff control: disabled
- card state: preview-only
- no real selected recommendation state
- no Trade UI bridge calls
- no execution path

## 2. What Is Proven

The first real quantity-based fill-only POC proved the core browser-agent
mechanics:

- visible order-form verification
- quantity fill via `input#inputVolume`
- quantity readback verification
- price fill via `input#inputPrice`
- price readback verification
- sanitized evidence capture
- stop before `Granska köp`
- no review modal
- no final confirmation
- no order placement

## 3. What Is Implemented In Settings

Settings owns the read-only bridge visibility path:

- read-only Avanza bridge status panel
- manual read-only refresh behind the local/dev feature flag
- read-only refresh metadata
- endpoint summary for health, self-check, and preflight
- readiness checklist
- readiness summary

Settings is the only UI area with manual read-only bridge refresh. It does not
invoke fill, click, review, final confirmation, submit, or order behavior.

## 4. What Is Implemented In Trade UI

Trade UI is display-only:

- reusable read-only readiness badge
- disabled handoff preview shell
- preview-only Avanza handoff package card
- selected-recommendation contract status rendered from static fixture data
- eligibility summary rendered from static fixture data
- source-mode indicator showing `Source: static fixture`
- safety boundary summary
- pre-activation gate summary showing `Pre-activation gate: Locked`

The Trade UI does not fetch localhost, call the bridge, read real selected
recommendation state, invoke a runner, fill fields, click, or place orders.

## 5. Pure Helpers And Models Added

The current architecture is built from pure models and UI-safe adapters:

- read-only bridge status adapter
- read-only bridge fetcher
- readiness checklist helper
- readiness summary helper
- reusable readiness badge model
- disabled handoff preview model
- handoff package preview builder
- Ture recommendation mapper
- selected-recommendation contract
- selected-recommendation eligibility summary
- source-mode model
- safety boundary summary
- pre-activation gate
- dev-only enablement plan

## 6. Safety Guards

Static safety guards cover UI-facing Avanza files and prevent live runner,
fill, trigger, review, final confirmation, submit, or order strings from
entering UI/client/read-only code.

The safety boundary summary also makes the hard limits visible in the preview
card:

- preview only
- disabled control
- no live recommendation wiring
- no Trade UI bridge call
- no Trade UI localhost fetch
- no polling
- no trigger phrase
- no runner/fill endpoint
- no click on `Granska köp`
- no review modal
- no final confirmation
- no submit
- no order placement
- no credential/session/BankID/cookie/storage handling
- no Supabase execution write
- total-read unresolved/advisory

## 7. Current Locked State

The pre-activation gate resolves to `locked` because:

- source mode is `static_fixture`
- selected recommendation wiring is disabled
- real selected recommendation state is disallowed
- bridge calls are disallowed
- execution is disallowed
- the package card is preview-only

This is the intended current architecture. It is not a partial enablement.

## 8. Total-Read Unresolved/Advisory

Total-read remains unresolved as an actual order-total verification layer. The
POC proved fill-and-stop mechanics, but total-read is not treated as solved and
must remain advisory.

Any future handoff flow must require human visual confirmation of the Avanza
order form before the user continues manually.

## 9. Explicitly Not Implemented

The following are not implemented:

- real selected recommendation wiring
- active handoff button
- polling
- refresh outside Settings
- Trade UI bridge call
- localhost fetch from Trade UI
- runner/fill invocation from Trade UI
- click on `Granska köp`
- review modal opening
- final confirmation
- submit
- order placement
- credential, session, BankID, cookie, localStorage, or sessionStorage handling
- Supabase execution write
- production-ready or autonomous trading path

## 10. Recommended Next Phase

Recommended next sequence:

1. selected recommendation preview-only wiring plan
2. preview-only selected recommendation wiring behind locked source mode
3. dev-only candidate gate review
4. only later, a separately approved explicit fill-only invocation path

The next phase should keep the current locked/default state intact until a
separate dev-only enablement design explicitly changes it.

The selected-recommendation planning step is captured in
[Avanza selected-recommendation preview-only wiring plan](avanza-selected-recommendation-preview-only-wiring-plan.md).

The completed selected-recommendation preview-only preparation checkpoint is
captured in
[Avanza selected-recommendation preview-only milestone checkpoint](avanza-selected-recommendation-preview-only-milestone-checkpoint.md).

The possible next dev/test preview-only enablement candidate is planned in
[Avanza dev-only selected-recommendation preview enablement plan](avanza-dev-only-selected-recommendation-preview-enablement-plan.md).

The current dev-only preview enablement readiness state is captured in
[Avanza dev-only preview enablement checkpoint](avanza-dev-only-preview-enablement-checkpoint.md).

The final checkpoint for the dev-only preview enablement modeling phase is
captured in
[Avanza dev-only preview enablement final checkpoint](avanza-dev-only-preview-enablement-final-checkpoint.md).

The optional next visible dev-only selectedRecommendation preview surface is
planned in
[Avanza dev-only visible selectedRecommendation preview surface plan](avanza-dev-only-visible-selected-recommendation-preview-surface-plan.md).

## References

- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
- [Avanza handoff dev-only enablement plan](avanza-handoff-dev-only-enablement-plan.md)
- [Avanza selected-recommendation preview-only wiring plan](avanza-selected-recommendation-preview-only-wiring-plan.md)
- [Avanza selected-recommendation preview-only milestone checkpoint](avanza-selected-recommendation-preview-only-milestone-checkpoint.md)
- [Avanza dev-only selected-recommendation preview enablement plan](avanza-dev-only-selected-recommendation-preview-enablement-plan.md)
- [Avanza dev-only preview enablement checkpoint](avanza-dev-only-preview-enablement-checkpoint.md)
- [Avanza dev-only preview enablement final checkpoint](avanza-dev-only-preview-enablement-final-checkpoint.md)
- [Avanza dev-only visible selectedRecommendation preview surface plan](avanza-dev-only-visible-selected-recommendation-preview-surface-plan.md)
- [Avanza bridge read-only status data layer plan](avanza-bridge-read-only-status-data-layer-plan.md)
- [First real Avanza quantity-based fill-only core POC milestone decision](first-real-avanza-quantity-based-fill-only-core-poc-milestone-decision.md)
