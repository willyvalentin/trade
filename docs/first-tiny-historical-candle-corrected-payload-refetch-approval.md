# Corrected First Tiny Candle Payload Refetch Approval Gate

Purpose: define a safe approval signal for one future corrected AAPL payload refetch using `full_day_fetch_then_filter_locally`.

This is approval/readiness only. A valid signal does not call Twelve Data, does not persist anything, and does not make candle persistence executable.

## Expected Env Contract

All values are server-side env values. Do not expose secrets or arbitrary env dumps.

- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=true`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL=<operator label>`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE=<approval reference>`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER=AAPL`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY=full_day_fetch_then_filter_locally`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS=1`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS=1`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED=false`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED=false`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED=false`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED=false`

## Expected Values

- source plan: `first_tiny_corrected_candle_payload_refetch_plan_dry_run_only`
- expected ticker: `AAPL`
- expected strategy: `full_day_fetch_then_filter_locally`
- expected max requests: `1`
- expected estimated credits: `1`
- expected candle persistence allowed: `false`
- expected raw response persistence allowed: `false`
- expected replay allowed: `false`
- expected scanner effect allowed: `false`
- prior window review must be `corrected_refetch_required`
- previous payload accepted for write must be `false`
- provider call remains disabled in this action
- candle write remains disabled in this action

## Approval States

### No Signal

- approval status: `not_configured`
- signal active: `false`
- ready to accept future signal: `true` when the corrected plan is ready
- ready to propose corrected refetch action: `false`
- provider call allowed now: `false`
- candle persistence allowed now: `false`

### Invalid Signal

The approval status is `invalid` when any required field is missing or mismatched. Example blockers:

- `approval_not_true`
- `operator_label_missing`
- `approval_reference_missing`
- `ticker_mismatch`
- `strategy_mismatch`
- `max_requests_not_one`
- `estimated_credits_not_one`
- `candle_persist_not_allowed`
- `raw_response_persist_not_allowed`
- `replay_not_allowed`
- `scanner_effect_not_allowed`
- `source_plan_not_ready`
- `prior_window_review_not_corrected_required`
- `previous_payload_accepted_for_write`

### Valid Signal, No Execute

- approval status: `valid_for_future_corrected_payload_refetch`
- signal active: `true`
- ready to propose corrected refetch action: `true`
- provider call allowed now: `false`
- candle persistence allowed now: `false`
- raw response persistence allowed now: `false`
- replay allowed now: `false`
- scanner effect allowed now: `false`

A separate future action is required before any corrected provider call:

`Corrected First Tiny Candle Payload Refetch Execute Attempt`

## Safety Guarantees

- provider call executed: `false`
- provider fetch added: `false`
- historical fetch added: `false`
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`
- requires separate future action: `true`

Recommended next steps:

- `configure_valid_corrected_payload_refetch_approval_signal`
- `require_separate_action_before_corrected_provider_refetch`
- `keep_candle_persistence_disabled`
