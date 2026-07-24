# First Real Avanza Fill-Only POC Approved Live Fill-Only CDP Runner

## Purpose

This document records the approved live fill-only runner added for the first real Avanza fill-only POC.

The runner exists only so a future separately requested exact trigger invocation can dependency-inject a concrete runner into the existing trigger/action/wrapper boundary.

This implementation action did not run the exact trigger phrase, did not access live Avanza, did not fill fields, did not click anything, did not open review, did not click final confirmation, and did not place an order.

## Result

Approved live fill-only runner added: `createFirstRealAvanzaFillOnlyPocApprovedLiveFillOnlyCdpRunner(...)`.

Bridge runner endpoints added behind explicit env gates:

- `POST /live-fill-only-runner/verify-visible-order-form-state`
- `POST /live-fill-only-runner/fill-amount`
- `POST /live-fill-only-runner/fill-price`
- `POST /live-fill-only-runner/read-total`
- `POST /live-fill-only-runner/capture-evidence`
- `POST /live-fill-only-runner/stop-before-review`

Result status: `first_real_avanza_fill_only_poc_approved_live_fill_only_cdp_runner_added`.

## Safety Boundary

The runner is disabled by default.

It requires both:

- `AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly`
- `AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER=true`

The runner does not launch a browser. The operator must manually open Chrome, manually open/log into Avanza, manually complete BankID/2FA, and manually prepare the visible order form before any future invocation.

The runner exposes only the approved methods:

- `verifyVisibleOrderFormState`
- `fillAmountField`
- `fillPriceField`
- `readTotalAmount`
- `captureEvidence`
- `stopBeforeReview`

The runner has no method or endpoint for:

- `Granska köp` click
- review modal open
- `Bekräfta köp/sälj` click
- final confirmation
- submit
- order placement
- credentials
- BankID
- cookies
- localStorage
- sessionStorage
- trade mutation
- Supabase write

## Approved Values

- Account: `Valentin Labs KF`
- Instrument: `GameStop`
- Side: buy-only
- Order mode: `Avancerad/Limit`
- Amount: `427,26` SEK
- Price: `21,98` USD
- Cap: `<= 1,000` SEK
- Stop before: `Granska köp`

The bridge rejects mismatched amount or price payloads. The runner re-verifies visible order-form state before each fill action.

## Start Chrome

Start a dedicated manually controlled Chrome session:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/ture-avanza-preflight-profile \
  --no-first-run \
  --no-default-browser-check
```

Then manually:

1. Open Avanza.
2. Log in.
3. Complete BankID/2FA.
4. Navigate to GameStop buy-side Avancerad/Limit order form.
5. Verify account `Valentin Labs KF`.
6. Do not click `Granska köp`.

## Start Bridge With Live Fill-Only Runner Enabled

```bash
AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly \
AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_CDP_URL=http://127.0.0.1:9222 \
AVANZA_LOCALHOST_BRIDGE_ENABLE_LIVE_FILL_ONLY_RUNNER=true \
npm run bridge:localhost
```

## Run Preflight

```bash
curl -sS http://127.0.0.1:47831/preflight/avanza-order-form
```

Proceed only if it returns `ok: true` and `status: "ready"`.

## Future Trigger Invocation Request

Use a separate future Codex request containing this exact trigger phrase:

```text
FINAL LIVE EXECUTE ATTEMPT EXPLICIT INVOCATION TRIGGER: I explicitly request the final live fill-only execute attempt trigger now, with the approved boundary, stopping before Granska köp and without order placement.
```

The future request must also confirm that the latest `/preflight/avanza-order-form` result is `ok: true` and `status: "ready"`.

## Stop

Stop the bridge with `Ctrl-C`.

Close the dedicated Chrome window after the run or aborted attempt.

## Implementation Notes

The synchronous runner delegates only to localhost bridge endpoints and can be dependency-injected into the existing wrapper. The bridge endpoints perform CDP operations only after explicit env enablement. No package script was added for live fill-only execution.

The implementation remains manual, local, fill-only, and stop-before-review.
