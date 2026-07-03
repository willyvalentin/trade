# First Real Avanza Fill-Only POC Live Run Result And Hardening

Status: `quantity_based_live_fill_attempt_result_truncated_or_unverifiable`

Date: 2026-07-02

## Scope

This document records the first approved live fill-only POC result after the approved live fill-only runner executed through the trigger/action/wrapper boundary and after visual UI inspection of the Avanza order form.

No additional live run was performed for this hardening action.

## Observed Live Fill-Only Result

- Trigger boundary result: `final_live_execute_attempt_explicit_invocation_trigger_plan_created`
- Verified account: `Valentin Labs KF`
- Verified instrument: `GameStop`
- Verified side: buy-only
- Verified order mode: `Avancerad/Limit`
- Amount field visible before fill: yes
- Price field visible before fill: yes
- `Granska köp` visible and not clicked: yes
- Review modal open: no
- `Bekräfta köp/sälj` visible: no
- Runner claimed amount filled: `427,26 SEK`
- Visual amount field state after run: `Belopp i SEK` appeared empty
- Visual quantity field state after run: `Antal` appeared empty
- Visual price field state after run: `Kurs i USD` appeared filled with `21,98`
- Price fill status: appears filled, still requires post-fill readback proof in future runs
- Amount fill status: not verified
- Runner total read: `0 SEK`
- Sanitized evidence IDs:
  - `visible-state-1783024207156`
  - `amount-filled-1783024207188`
  - `price-filled-1783024207218`
  - `total-read-1783024207233`
  - `final_live_execute_attempt_stop_before_review-1783024207247`
  - `stopped-before-review-1783024207263`
- Stop point: before `Granska köp`
- Post-run observation-only preflight: `ok: true`, `status: ready`
- Review modal after run: not open
- Final confirmation after run: not visible
- Order placement: no

## Observed Quantity-Based Follow-Up Result

- Preflight before the quantity-based attempt: `ok: true`, `status: ready`
- Approved input strategy: `quantity_based`
- Visible state verification: passed
- Visible-state evidence ID: `visible-state-1783028019818`
- `fillQuantityField(1)`: called
- Quantity readback: not verified
- Boundary blocker: `runner:quantity_fill_failed`
- Price fill attempted: no
- Total read attempted: no
- Evidence capture after fill attempted: no
- Stop-before-review method called: no, because the boundary aborted immediately after the unverified quantity fill
- Post-run observation-only preflight: `ok: true`, `status: ready`
- Review modal after run: not open
- Final confirmation after run: not visible
- Order placement: no

Result status: `first_real_avanza_fill_only_poc_quantity_fill_not_verified`

## Observed Quantity-Based Attempt After Bridge Restart

- Preflight before the attempt: `ok: true`, `status: ready`
- Approved input strategy: `quantity_based`
- Boundary used: approved trigger/action/wrapper plus approved live fill-only runner
- Requested primary input: `Antal = 1`
- Requested price: `21,98 USD`
- Stop point: before `Granska köp`
- Invocation count for this attempt: one
- Structured runner output: truncated during handoff and not recoverable from the conversation output
- Quantity readback: unverifiable from retained output
- Price readback: unverifiable from retained output
- Total read: unverifiable from retained output
- Evidence IDs: unverifiable from retained output
- Quantity diagnostics: unverifiable from retained output
- Post-run observation-only preflight: `ok: true`, `status: ready`
- `Granska köp`: visible and not clicked
- Review modal after run: not open
- Final confirmation after run: not visible
- Order placement: no

Result status: `quantity_based_live_fill_attempt_result_truncated_or_unverifiable`

The run must not be marked successful because the structured runner result was lost to output truncation. A repeat attempt requires explicit user approval and the exact trigger phrase again.

## Conclusion

The price field appears to have been filled, but the amount field was not verified. The full POC is not complete or successful.

The total read returned `0 SEK`, which is consistent with the visual observation that the amount field appeared empty and inconsistent with the approved positive amount `427,26 SEK`. This must be treated as invalid or uncertain total validation. The cap check must not be considered proven when total read returns a zero fallback for a positive intended amount.

Available buying power is not a blocker for this fill-only POC. Avanza permits manual entry of a higher `Belopp` or `Antal` than the account can ultimately afford. Because this POC stops before `Granska köp` and does not place an order, economic feasibility must not block field-fill testing.

The actual blocker is unverified effective order input: neither `Belopp i SEK` nor `Antal` was confirmed as populated by the runner or by visual inspection.

The quantity-based follow-up confirms the same class of blocker for `Antal`: the field-fill path attempted the selected primary input, but readback did not verify the visible/control value as `1`. The POC remains incomplete and must not be treated as successful.

## Hardening Added

The live fill-only bridge now treats total read as invalid when the approved amount is greater than zero and the total is empty, null, unparsable, or less than or equal to zero.

The live fill-only bridge now treats a field fill as successful only after post-fill readback verifies the visible/input value:

- `attempted_amount_fill`
- `amount_fill_verified`
- `attempted_price_fill`
- `price_fill_verified`

The amount fill blocks as `amount_fill_not_verified` when the approved amount is `427,26 SEK` and the post-fill readback is empty, null, or mismatched.

The price fill blocks as `price_fill_not_verified` when the approved price is `21,98 USD` and the post-fill readback is empty, null, or mismatched.

Total read and cap validation are now blocked until both amount and price readbacks are verified.

The live fill-only bridge now carries an explicit input strategy:

- `amount_based`: fill `Belopp i SEK` plus `Kurs i USD`; verify amount readback plus price readback; then read total.
- `quantity_based`: fill `Antal` plus `Kurs i USD`; verify quantity readback plus price readback; then read total.

The first follow-up `quantity_based` request aborted before any fill because the approved final execute trigger/action/wrapper boundary still hard-coded `fillAmountField`. The boundary has now been made strategy-aware:

- `amount_based` calls `fillAmountField` and never requires `fillQuantityField`.
- `quantity_based` calls `fillQuantityField` and never calls `fillAmountField`.
- `readTotalAmount` remains gated behind the selected primary input readback plus price readback.
- The approved runner interface now includes `fillQuantityField` as the only added runner method.

The runner must not require both amount and quantity. It requires only the selected primary input and price:

- `amount_based` does not require quantity.
- `quantity_based` does not require amount.

If the selected primary input does not read back, the runner blocks as `selected_input_fill_not_verified`.

If price does not read back, the runner blocks as `price_fill_not_verified`.

Total read and cap validation are blocked until selected primary input plus price are both verified. If total remains `0 SEK` after selected primary input plus price are verified, the runner blocks as `total_read_invalid` / `runner:total_read_invalid_or_uncertain`.

The runner response now reports:

- `total_read_invalid`
- amount field found status
- amount field value present status
- amount expected
- amount observed normalized
- amount verified status
- selected input strategy
- selected primary field
- primary field expected value
- primary field observed normalized value
- primary field verified status
- quantity field found status
- quantity field value present status
- quantity expected
- quantity observed normalized
- quantity verified status
- price field found status
- price field value present status
- price expected
- price observed normalized
- price verified status
- total observed
- total valid status
- total element found status
- total text present status
- total text length
- total parse status
- whether positive total was required

The wrapper now blocks failed total reads as `runner:total_read_invalid_or_uncertain`.

The `fillQuantityField` path now returns richer sanitized diagnostics when quantity fill fails:

- whether an `Antal`/volume-tied control was found
- visible quantity candidate count
- selected candidate metadata, sanitized only
- disabled, readonly, and hidden status
- before value and after value, normalized
- readback source used, such as `input.value`, aria value, or visible text
- normalized expected value
- normalized observed value
- exact blocker reason, including `quantity_antal_control_not_found`, `quantity_candidate_ambiguity`, `field_disabled`, `field_readonly`, `field_not_visible`, or `readback_mismatch`

The quantity fill selector now refuses ambiguous candidate sets unless exactly one visible candidate can be tied clearly to the `Antal` label/volume control. It focuses the selected control, clears it, sets the approved value, dispatches input/change events, blurs, waits briefly for UI state to update, and then reads back the value before reporting success.

`readTotalAmount` remains gated behind selected primary input plus price verification. When the observed order form has quantity populated and amount empty, the readback metadata treats the selected strategy as `quantity_based` so total validation is gated on quantity plus price rather than on amount plus price.

## Safety Confirmation

- No `Granska köp` click was added or performed.
- No review modal was opened.
- No `Bekräfta köp/sälj` click was added or performed.
- No submit/order placement was added or performed.
- No credentials/session/BankID/cookie/localStorage/sessionStorage handling was added.
- No automatic or unattended behavior was added.
- No UI/routes/provider/scanner wiring was added.
- No Supabase write or trade mutation was added.

## Next Step

Because the amount field did not verify visually in the first attempt, the next live fill-only POC should preferably test `quantity_based`:

- Quantity: `1`
- Price: `21,98 USD`
- Stop before: `Granska köp`

This remains fill-only and must not submit or place an order.
