# First Real Avanza Quantity-Based Fill-Only Core POC Milestone Decision

Status: `first_real_avanza_quantity_based_fill_only_core_poc_success_total_read_unresolved`

Date: 2026-07-03

## Decision

The first real Avanza `quantity_based` fill-only POC is accepted as a successful
core fill-and-stop milestone.

This milestone proves the minimum approved browser-agent behavior for a
semi-auto fill-only handoff:

1. Verify the visible order form.
2. Fill the approved quantity.
3. Verify quantity readback.
4. Fill the approved price.
5. Verify price readback.
6. Capture sanitized evidence.
7. Stop before `Granska köp`.

## Proven Result

The in-process `quantity_based` fill-only trigger reached the full
stop-before-review path:

- exact trigger phrase accepted
- visible state verified
- `quantity_based` selected
- quantity filled via `input#inputVolume`
- quantity readback verified as `1`
- price filled via `input#inputPrice`
- price readback verified as `21.98`
- sanitized evidence captured
- `stopBeforeReview` reached
- stopped before `Granska köp`
- no review modal opened
- no final confirmation visible or clicked
- no order placement

## Boundary Outcome

Core fill-only POC: successful.

Stop-before-review safety: successful.

Order placement: not performed.

Review modal: not opened.

Final confirmation: not clicked.

Total-read: not fully solved.

## Total-Read Status

Total-read remains unresolved and must not be treated as a proven order-total
validation layer yet.

The run returned `63.21 SEK` from text containing
`Tillg. för köp Belopp 63,21 SEK`. That appears to be available buying power or
account availability, not the actual order total.

Total reader v4 now rejects buying-power/account-availability candidates, but
the actual Avanza order-total element is not yet proven. Total-read therefore
remains a future hardening item before broader production use.

## MVP Interpretation

For a semi-auto MVP, the minimum proven capability is fill-only handoff up to
the review boundary:

- verify visible form
- fill `Antal`
- verify `Antal`
- fill `Kurs`
- verify `Kurs`
- capture evidence
- stop before `Granska köp`

The human operator remains responsible for visual review before any manual click
on `Granska köp`. No automatic review, confirmation, or order placement is
approved.

## Recommended Next Steps

Option A: Treat total-read as advisory and proceed to UI integration planning
for the semi-auto fill-only handoff.

Option B: Continue total-reader discovery to locate and validate the true
Avanza order-total element.

Option C: Add a post-fill human checklist requiring the user to visually confirm
the order total before clicking `Granska köp`.

## Safety Boundaries

- no `Granska köp` click
- no review modal
- no `Bekräfta köp/sälj`
- no submit or order placement
- no unattended mode
- no credentials/session/BankID/cookies/localStorage/sessionStorage handling
- no Supabase write
- no trade mutation

## Final Notes

This decision does not approve broader production automation. It records a
successful first real fill-only browser-agent milestone and keeps total-read
explicitly unresolved until a later action either hardens it or intentionally
reclassifies it as advisory.
