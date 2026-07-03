# First Real Avanza Fill-Only POC Quantity-Based Proof File Repeat Prep

Status: `quantity_based_live_fill_attempt_proof_file_logging_ready`

Date: 2026-07-03

## Context

A `quantity_based` live fill-only trigger was invoked once after restarting the localhost bridge so the hardened `fillQuantityField` implementation was loaded.

The post-run observation-only preflight remained safe:

- `ok: true`
- `status: ready`
- `Granska köp` visible and not clicked
- no review modal open
- no `Bekräfta köp/sälj` visible
- no order placement observed

However, the structured runner output was truncated during handoff. Because the quantity readback, price readback, total read, evidence IDs, and quantity diagnostics cannot be honestly recovered, that run is recorded as:

`quantity_based_live_fill_attempt_result_truncated_or_unverifiable`

It must not be counted as a successful POC.

The first proof-file repeat captured the aborted result locally, but the proof file still contained only the compact runner summary for `fillQuantityField`. It recorded `runner:quantity_fill_failed`, but not the bridge-side quantity candidate diagnostics. That proof was insufficient for diagnosing whether the failure came from candidate selection, hidden/disabled/readonly state, value setting, readback source, or exact readback mismatch.

Status for that proof shape: `quantity_based_live_fill_attempt_diagnostics_reduced`

## Field Discovery Selector Hardening

Observation-only field discovery later confirmed the stable Avanza order-form
input IDs:

- `Belopp i SEK`: `inputAmount`
- `Antal`: `inputVolume`
- `Kurs i USD`: `inputPrice`

The latest `quantity_based` repeat attempt failed with
`runner:quantity_fill_failed` and `quantity_candidate_count: 0` even though
field discovery found `Antal` as a visible, enabled, editable `inputVolume`
control. That means the blocker was selector targeting, not buying power and
not a review/final/order path.

The live fill-only runner now prefers stable ID selectors before label/nearby
fallbacks:

- `fillAmountField` targets `input#inputAmount`
- `fillQuantityField` targets `input#inputVolume`
- `fillPriceField` targets `input#inputPrice`

The ID-based match overrides weak nearby-label heuristics. In particular,
`inputPrice` must remain a price candidate even if nearby labels also include
`Antal`, and `quantity_based` must not use `inputPrice` as quantity.

The next `quantity_based` repeat attempt should be run only after restarting
the localhost bridge so the hardened selector code is loaded.

## Bridge Connectivity Hardening

A later repeat attempt did not reach selector testing. Manual curls to the
bridge passed, but the injected approved CDP runner aborted at
`verifyVisibleOrderFormState` because its internal child `curl` transport could
not connect to `127.0.0.1:47831` at send time.

That abort is recorded as a bridge-connectivity blocker, not a quantity selector
or Avanza field blocker:

`runner:visible_state_mismatch` / `bridge_unreachable`

The runner transport has been hardened so it no longer shells out to child
`curl`. It now uses a bounded Node HTTP transport with:

- `/health` checked before every approved runner method call.
- approved endpoint mapping for the existing runner methods only.
- three short attempts for connection failures before non-fill calls.
- exactly one send attempt for fill calls after the health gate, so a field fill
  is never blindly repeated after an unknown or partial send state.
- structured diagnostics for `bridge_base_url`, `method_attempted`,
  `endpoint_attempted`, `attempt_count`, `failure_type`,
  `failure_happened_before_request_accepted`, `request_accepted`, and
  `fill_method_attempted`.

Manual curl can pass while an internal transport call fails if the bridge
process is restarted, briefly unavailable, or the child transport sees a
different connection window. The hardened runner makes that failure explicit in
the proof file instead of collapsing it into a generic visible-state mismatch.

The next live attempt should be made only after:

1. restarting the localhost bridge,
2. confirming `/health` is available,
3. confirming `/preflight/avanza-order-form` is `ok: true` and `status: ready`,
4. receiving a separate explicit trigger request again.

## In-Process Bridge Trigger Endpoint

Because manual terminal `curl` can reach the bridge while a separate injected
runner process can receive local socket `EPERM`, the bridge now exposes a
disabled-by-default in-process endpoint:

`POST /live-fill-only-runner/run-approved-quantity-based-fill-only-trigger`

This endpoint executes the approved `quantity_based` sequence inside the
already-running bridge process. It avoids an external runner process making
localhost calls back into the bridge.

Required bridge start command:

```bash
AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly \
AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER=true \
AVANZA_LOCALHOST_BRIDGE_ENABLE_IN_PROCESS_TRIGGER=true \
npm run bridge:localhost
```

Required invocation shape, only after a separate explicit approval:

```bash
curl -sS -X POST http://127.0.0.1:47831/live-fill-only-runner/run-approved-quantity-based-fill-only-trigger \
  -H 'Content-Type: application/json' \
  --data '{
    "exact_trigger_phrase": "FINAL LIVE EXECUTE ATTEMPT EXPLICIT INVOCATION TRIGGER: I explicitly request the final live fill-only execute attempt trigger now, with the approved boundary, stopping before Granska köp and without order placement.",
    "approved_input_strategy": "quantity_based",
    "account": "Valentin Labs KF",
    "instrument": "GameStop",
    "side": "buy",
    "order_mode": "Avancerad/Limit",
    "quantity": 1,
    "price_usd": 21.98,
    "stop_before": "Granska köp"
  }'
```

The endpoint still reuses only the existing bridge-side helpers:

1. `verifyVisibleOrderFormState`
2. `fillQuantityField`
3. `fillPriceField`
4. `readTotalAmount`
5. `captureEvidence`
6. `stopBeforeReview`

It has no review, final confirmation, submit, or order-placement capability. It
writes the full sanitized proof file to:

`tmp/avanza-fill-only-proof/latest-quantity-based-result.json`

### In-Process Quantity Targeting Fix

The first in-process endpoint run resolved the localhost connectivity issue but
still aborted safely at `fillQuantityField`. The proof showed
`quantity_candidate_count: 0`, `quantity_selected_selector: null`, and
`quantity_field_discovery_matched: false` even though observation-only field
discovery had already proved that the visible, enabled, editable `Antal` control
exists as `inputVolume`.

The same proof also showed quantity-run diagnostics still carrying
`approved_input_strategy: amount_based` and `selected_primary_field: amount`.
That meant the bridge-hosted run was selecting `quantity_based`, but the
bridge-side helper/report path still defaulted some verification and diagnostic
metadata to the amount-based strategy.

The bridge-side path has now been aligned with the discovery evidence:

- the in-process trigger passes `approvedInputStrategy: "quantity_based"` into
  visible-state verification, quantity fill, price fill, total read, evidence
  capture, and stop-before-review.
- `fillQuantityField` now prefers the literal stable selector
  `input#inputVolume`.
- `input#inputVolume` is accepted from stable ID evidence when it is visible,
  enabled, editable, compatible with text/numeric entry, and has
  `inputmode="numeric"`.
- the stable ID path does not require
  `inside_buy_side_order_form_region` to be true.
- `input#inputPrice` remains classified as price and must not be selected as a
  quantity candidate.

The next proof should report quantity diagnostics with
`approved_input_strategy: quantity_based`, `selected_primary_field: quantity`,
`quantity_selected_selector: input#inputVolume`,
`quantity_selected_id: inputVolume`, and
`quantity_field_discovery_matched: true` whenever the field is present and
fillable.

### No-Fill Stable Field Probe

After the in-process path still reported `quantity_stable_id_found: false`, the
bridge gained a no-fill stable field probe:

`GET /live-fill-only-runner/debug/stable-field-probe`

This endpoint is disabled unless the same manual observation/live runner gates
are enabled:

```bash
AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly \
AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER=true \
npm run bridge:localhost
```

Probe command:

```bash
curl -sS http://127.0.0.1:47831/live-fill-only-runner/debug/stable-field-probe
```

The probe uses the same `evaluateInSingleAvanzaTarget` target/page resolver as
`fillQuantityField`, but only reads sanitized stable-field metadata. It directly
checks both `document.getElementById(...)` and `document.querySelector(...)` for:

- `inputAmount` / `input#inputAmount`
- `inputVolume` / `input#inputVolume`
- `inputPrice` / `input#inputPrice`

It returns only bounded metadata such as found status, tag name, type,
inputmode, hidden/disabled/readonly status, value length/normalized value, and
whether the exact same fill acceptance rules would accept the field. It does not
fill fields, click, open review, submit, place an order, return raw page text,
return raw DOM, or read credentials/cookies/localStorage/sessionStorage/BankID
data.

For `fillQuantityField`, stable-ID diagnostics now distinguish:

- `stable_id_not_found`
- `stable_id_found_but_not_input`
- `stable_id_found_but_hidden`
- `stable_id_found_but_disabled`
- `stable_id_found_but_readonly`
- `stable_id_found_but_wrong_inputmode`
- `stable_id_found_but_rejected_by_scope`
- `stable_id_found_and_accepted_but_set_failed`

The next manual diagnostic step should be the stable field probe. A new
in-process trigger attempt should wait until that probe confirms
`inputVolume` is found and accepted.

### Shared Stable Resolver

The stable field probe later confirmed the same CDP target resolver could see
and accept `input#inputVolume`, while the in-process `fillQuantityField` path
still reported `quantity_stable_id_found: false`. That proved the remaining
gap was not target/page resolution, but divergent stable-field lookup logic
between the no-fill probe and the actual fill helper.

The probe and fill helpers now share one page-side resolver:

`resolveStableOrderField(field)`

Stable mappings are fixed as:

- `amount` -> `inputAmount` / `input#inputAmount`
- `quantity` -> `inputVolume` / `input#inputVolume`
- `price` -> `inputPrice` / `input#inputPrice`

Both the no-fill stable field probe and the fill helpers use this same resolver
metadata. The fill path uses the resolved element directly before any
candidate/label fallback. Quantity proof diagnostics now include:

- `stable_field_resolver_version`
- `fill_used_shared_stable_resolver: true`
- `stable_id`
- `stable_selector`
- `get_element_by_id_found`
- `query_selector_found`
- `same_element_for_id_and_selector`
- `accepted_by_fill_field`
- `accepted_by_fill_quantity_field`
- `blocker_reason`

If the stable field probe reports `inputVolume` found and accepted, the same
code version's `fillQuantityField` should not report `stable_id_found: false`
unless the Avanza DOM changed between probe and fill.

### Resolver Invariant For The Actual Fill Path

A later in-process `quantity_based` trigger still aborted at
`fillQuantityField` with `quantity_stable_field_resolver_version: null` and
`quantity_fill_used_shared_stable_resolver: false`. That proved the actual
fill execution path could still bypass, or fail to report, the shared stable
resolver even though the no-fill probe saw `inputVolume`.

The actual `fillQuantityField` execution path now has a hard invariant:

- `fill_used_shared_stable_resolver` must be `true`.
- `stable_field_resolver_version` must be non-null.
- the stable resolver must run before any fallback candidate search.
- when the stable resolver accepts `input#inputVolume`, the fill path uses that
  resolved element directly.

If the invariant is missing from the quantity fill result, the run aborts with:

`shared_stable_resolver_not_used`

This prevents a future proof from collapsing back to
`quantity_candidate_count: 0` without first proving whether the shared stable
resolver was actually used.

### Exact Call-Site Trace

The latest in-process run accepted the exact trigger phrase and passed visible
state verification, but aborted before fill with
`shared_stable_resolver_not_used`. That means the hard invariant worked: the
quantity fill result did not include `fill_used_shared_stable_resolver: true`
or a non-null `stable_field_resolver_version`, so the run stopped before any
field write.

The codebase has three `fillQuantityField` surfaces:

- bridge endpoint/action handling in
  `scripts/avanza-localhost-bridge-server.mjs`
- external localhost CDP runner adapter in
  `lib/first-real-avanza-fill-only-poc-approved-live-fill-only-cdp-runner.ts`
- dependency-injected wrapper interface/tests in
  `lib/first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper.ts`

The in-process endpoint path is the bridge server path:

`POST /live-fill-only-runner/run-approved-quantity-based-fill-only-trigger`
-> `runInProcessApprovedQuantityBasedFillOnlyTrigger`
-> `fillLiveFillOnlyField("fillQuantityField", "quantity", ...)`
-> `buildLiveFillOnlySetFieldExpression("quantity", "1")`
-> `resolveStableOrderField("quantity")`

The actual endpoint quantity call now carries explicit call-site diagnostics:

- `fill_quantity_implementation_id: stable_resolver_v1`
- `fill_quantity_call_site: in_process_quantity_based_trigger`
- `shared_resolver_function_name: resolveStableOrderField`
- `shared_resolver_invoked: true`

If a stale or alternate path bypasses the resolver again, the same invariant
will continue to abort with `shared_stable_resolver_not_used` before a fill can
occur.

## Resolver Metadata Ordering Correction

A follow-up in-process run showed the call-site diagnostics, but still reported
`shared_resolver_invoked: false`,
`quantity_fill_used_shared_stable_resolver: false`, and
`quantity_stable_field_resolver_version: null`. Because the stable field probe
had already proven `resolveStableOrderField("quantity")` can find and accept
`input#inputVolume`, that result was treated as an expression/result propagation
issue rather than a selector issue.

The generated `buildLiveFillOnlySetFieldExpression("quantity", "1")` expression
now runs as an async IIFE before any field interaction, calls
`resolveStableOrderField(field)` before candidate fallback or set/readback work,
and includes resolver metadata in every returned branch. Bridge-side metadata
propagation now distinguishes explicit page-side `shared_resolver_invoked:
false` from missing/default metadata; missing metadata is reported as `null`
unless the page-side expression explicitly reports `resolver_not_invoked`.

## Local Proof File Path

Future repeat attempts must persist the full structured result before printing a short summary:

`tmp/avanza-fill-only-proof/latest-quantity-based-result.json`

The `tmp/` directory is ignored by git. The proof file is local-only.

## Proof File Contents

The local proof file must include:

- timestamp
- selected input strategy
- preflight or visible-state verification result
- quantity fill attempted
- quantity fill verified
- sanitized quantity candidate diagnostics if failed
- price fill attempted
- price fill verified
- total read
- total valid true/false
- evidence IDs
- stopped before `Granska köp`
- no review modal
- no final confirmation
- no order placement
- errors, blockers, and warnings

The proof writer sanitizes raw or sensitive observation material. It must not persist credentials, cookies, localStorage, sessionStorage, BankID/session material, tokens, secrets, raw page text, raw DOM, or HTML.

## Diagnostics Preservation Requirement

Before the next repeat attempt, the bridge-side diagnostics must survive each layer:

1. Localhost bridge response.
2. Approved CDP runner result.
3. Trigger/action/wrapper `runner_calls`.
4. Local proof file.

For `quantity_fill_failed`, the next proof file must include:

- `quantity_candidate_count`
- `selected_quantity_candidate_metadata`
- `candidate_hidden`
- `candidate_disabled`
- `candidate_readonly`
- `before_value`
- `after_attempted_value`
- `readback_source`
- `expected_normalized_value`
- `observed_normalized_value`
- `exact_internal_blocker_reason`
- full sanitized `bridge_runner_call_diagnostics.fillQuantityField`

The compact summary remains, but it must not replace the bridge-side diagnostics.

## Quantity/Price Fill Verified, Stop-Before-Review Verified

The in-process `quantity_based` fill-only POC reached the approved fill-only and
stop-before-review milestone:

- status:
  `first_real_avanza_fill_only_poc_fill_and_stop_success_total_read_still_unverified`
- `exact_trigger_phrase_accepted: true`
- `selected_input_strategy: quantity_based`
- `quantity_based_fill_only_fields_verified`
- `stopped_before_granska_kop_verified`
- `no_review_no_final_no_order_verified`

- `quantity_fill_verified: true`
- `quantity_selected_selector: input#inputVolume`
- `quantity_selected_id: inputVolume`
- `quantity_observed_normalized: 1`
- `price_fill_verified: true`
- `price_selected_selector: input#inputPrice`
- `price_selected_id: inputPrice`
- `price_observed_normalized: 21.98`
- no amount fill attempted
- evidence captured
- stopped before `Granska köp`
- no click, review modal, final confirmation, submit, or order placement

The remaining blocker is total discovery:

- `blocker: total_read_invalid`
- `total_element_found: false`
- `total_text_present: false`
- `total_observed: ""`
- `total_valid: false`

The POC is still incomplete and must not be marked successful until total read is
valid or a separate explicit decision relaxes total validation. The total reader
now performs a dedicated observation-only total discovery pass after quantity and
price readbacks are both verified. It records sanitized total candidate metadata,
nearby bounded labels, parse status, retry count, parsed SEK value when safe, and
an exact final blocker reason. Empty, missing, zero, delayed, or unparsable total
values cannot pass cap validation.

## Available Buying Power Total False Positive

The first full stop-before-review milestone returned `total_read: 63.21 SEK`
from text containing `Tillg. för köp Belopp 63,21 SEK`. That appears to be
available buying power or account availability, not the actual order total.

That `63.21 SEK` value is order-panel-adjacent but must not be treated as a
valid order-total verification. It must not be used to pass cap validation.

The total reader now rejects candidates containing account availability or buying
power language such as:

- `Tillg. för köp`
- `På kontot`
- `Handla på konto`
- `Köpkraft`
- `Köputrymme`
- `Kontosaldo`

If only buying-power/account-availability candidates are found, the reader must
block with `total_candidate_is_available_buying_power_not_order_total` or
`total_order_total_not_found` / `total_element_not_found_or_not_order_scoped`
rather than validating the cap.

Design option for a future action: total-read could become advisory for the
fill-only POC milestone while remaining required for stronger order-total
validation. This document does not change that boundary; it records the option
only.

## Global Header Total False Positive

A later repeat confirmed the total reader could find numeric text, but selected a
broad/global page container instead of an order-form total. The rejected reading
was:

- `blocker: total_amount_above_cap`
- `total_read: 8990.62`
- `total_observed` included global/header/market text such as `OMXS30`, `DJUS`,
  `Börsen idag`, and `Logga ut`

That `8990.62` value is not a valid order total. It must not be used to pass or
fail cap validation. The total reader now requires an order-scoped candidate
inside or tightly near the buy-side order form region and rejects candidates with
global/header/navigation/market text, oversized page-container text, or no
relationship to known order inputs (`input#inputVolume`, `input#inputPrice`,
`input#inputAmount`). If no valid scoped total candidate exists, the blocker is
`total_element_not_found_or_not_order_scoped`.

## Repeat Attempt Requirements

A repeat attempt is not approved by this document. It requires a separate explicit user request with the exact trigger phrase again.

Do not run another repeat attempt until diagnostic preservation has passed focused tests.

The future attempt should:

1. Confirm `/preflight/avanza-order-form` is `ok: true` and `status: ready`.
2. Invoke only the existing approved trigger/action/wrapper boundary.
3. Use the approved live fill-only runner.
4. Use `approved_input_strategy: "quantity_based"`.
5. Fill only `Antal = 1`.
6. Verify `Antal` readback equals `1`.
7. Fill only `Kurs i USD = 21,98`.
8. Verify price readback equals `21,98`.
9. Read total only after quantity and price verify.
10. Capture sanitized evidence.
11. Stop before `Granska köp`.
12. Write the full structured result to the proof file before printing a short summary.

## Safety Boundaries

- Do not click `Granska köp`.
- Do not open the review modal.
- Do not click `Bekräfta köp/sälj`.
- Do not submit or place an order.
- Do not handle credentials, session, BankID, cookies, localStorage, or sessionStorage.
- Do not add unattended or automatic behavior.
- Do not wire this to UI, routes, provider, scanner, package scripts, Supabase, or trade mutation paths.

## Implementation Note

Proof-file logging is implemented by `lib/first-real-avanza-fill-only-poc-live-proof-file.ts`.

The proof writer is inert by itself. It writes a sanitized local JSON document only when a future explicitly approved run passes a structured result to it. It does not access Avanza, launch a browser, fill fields, click, submit, or place orders.
