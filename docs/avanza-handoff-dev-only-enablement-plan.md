# Avanza Handoff Dev-Only Enablement Plan

Status: planning only. This document does not enable any Avanza handoff behavior.

Current state remains:

- source mode: `static_fixture`
- pre-activation gate: `locked`
- handoff control: disabled
- no real selected recommendation state is read
- no bridge calls from Trade UI
- no localhost fetch from Trade UI
- no trigger, fill, click, review, final confirmation, submit, or order path
- no credential, session, BankID, cookie, localStorage, or sessionStorage handling
- no Supabase execution write

## Purpose

This plan defines the future path from the locked preview-only Avanza handoff
card to a possible dev-only enabled handoff. It is a sequencing document, not an
implementation. The current UI must remain static fixture driven and locked.

## Staged Path

1. `static_fixture` locked preview
2. selected-recommendation preview-only mapping
3. read-only Avanza readiness check
4. dev-only prepare handoff candidate
5. explicit manual operator confirmation
6. fill-only runner invocation
7. stop before `Granska köp`
8. evidence capture
9. manual user review in Avanza

## Hard Prerequisites

Before any future dev-only enablement can be considered:

- selected recommendation wiring must be implemented as preview-only first
- source mode must no longer be `static_fixture`
- selected recommendation contract must have no blockers
- read-only readiness must be available
- manual refresh/readiness must be verified in Settings
- total-read remains advisory and requires human visual confirmation
- safety boundary summary must remain enforced
- pre-activation gate must explicitly return `candidate_for_dev_enablement`
- a separate feature flag must be required
- a separate explicit user/operator action must be required

## Current Locked Gate Interpretation

The current static fixture may show a valid preview package, but it is locked
because:

- source is `static_fixture`
- selected recommendation wiring is disabled
- real selected recommendation state is disallowed
- bridge calls are disallowed
- execution is disallowed
- the package card is preview-only

The locked state is the expected current state. It is not an error and it is not
a partial enablement.

## Forbidden Production Claims

Future UI and docs must not describe this flow as:

- production ready
- autonomous trading
- order placement
- final confirmation
- broker execution
- unattended execution

The intended product direction remains semi-auto: Ture may prepare a handoff
only after future guarded work, and the user manually reviews in Avanza.

## Required Safety Boundaries

The following boundaries remain non-negotiable for this plan:

- no `Granska köp` click from Ture
- no review modal opening from Ture
- no final confirmation click from Ture
- no submit or order placement from Ture
- no unattended mode
- no credential, session, BankID, cookie, localStorage, or sessionStorage handling
- no Supabase execution write until a separate execution-record design is approved

## References

- [Semi-auto Avanza fill-only POC UI integration plan](semi-auto-avanza-fill-only-poc-ui-integration-plan.md)
- [Avanza bridge read-only status data layer plan](avanza-bridge-read-only-status-data-layer-plan.md)
- [First real Avanza quantity-based fill-only core POC milestone decision](first-real-avanza-quantity-based-fill-only-core-poc-milestone-decision.md)
