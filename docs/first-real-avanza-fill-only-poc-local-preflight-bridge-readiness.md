# First Real Avanza Fill-Only POC Local Preflight Bridge Readiness

## Purpose

This document records the local preflight-only bridge readiness path for the first real Avanza fill-only POC.

This is not a live run. It does not invoke the exact trigger phrase, does not invoke the fill wrapper, does not fill fields, does not click anything, does not click Granska köp, does not open a review modal, does not click Bekräfta köp/sälj, does not submit or place an order, and does not handle credentials/session/BankID/cookies/localStorage/sessionStorage.

The goal is only to make the local bridge readiness endpoints available so a future preflight can verify whether a local bridge process exists. Browser-state verification still requires a separately approved preflight path and must abort on mismatch or uncertainty.

## Existing Bridge Found

An existing local development bridge script already exists:

- Package script: `npm run bridge:localhost`
- Server file: `scripts/avanza-localhost-bridge-server.mjs`
- Default host: `127.0.0.1`
- Default port: `47831`
- Health endpoint: `GET /health`
- Self-check endpoint: `GET /self-check`

No new bridge scaffold was required.

## Safety Boundary

The existing bridge is a local development stub by default.

The inspected health and self-check path is safe for readiness checks because:

- It binds to localhost only.
- It requires explicit manual start.
- `GET /health` is read-only.
- `GET /self-check` is read-only.
- Default self-check reports no Avanza dry-run runner readiness.
- It does not launch a browser by default.
- It does not access Avanza by default.
- It does not fill amount or price fields.
- It does not click Granska köp.
- It does not open a review modal.
- It does not click Bekräfta köp/sälj.
- It does not submit or place an order.
- It does not handle credentials/session/BankID/cookies/localStorage/sessionStorage.
- It is not wired to automatic UI/routes/provider/scanner/package-script execution.

The bridge also exposes other historical stub endpoints for local development. Those endpoints remain outside this preflight readiness scope. For this readiness path, use only `GET /health` and `GET /self-check`.

## Start Command

Start the bridge manually in a dedicated terminal:

```bash
npm run bridge:localhost
```

Expected startup message:

```text
Ture localhost bridge stub listening on http://127.0.0.1:47831
```

Do not start this from an automatic app path, route, provider, scanner, or unattended process.

## Verify Commands

In a separate terminal, verify the readiness endpoints:

```bash
curl -sS http://127.0.0.1:47831/health
```

```bash
curl -sS http://127.0.0.1:47831/self-check
```

Expected readiness meaning:

- `/health` should return the localhost bridge stub status as available.
- `/self-check` should return safe runner self-check metadata.
- In default mode, self-check should not report real Avanza browser control or broker submission capability.

These checks prove only that the local bridge process is available. They do not prove the current Avanza browser tab state, account, instrument, order side, order mode, amount field, price field, Granska köp visibility, or modal state.

## Stop Command

Stop the bridge from the terminal where it is running:

```bash
Ctrl-C
```

Expected shutdown behavior:

```text
Received SIGINT; stopping localhost bridge stub.
```

## Future Preflight Boundary

A future preflight-only verification may only proceed if a separately approved path can use a safe local runner limited to:

- `verifyVisibleOrderFormState`
- `captureEvidence`

It must not call:

- `fillAmountField`
- `fillPriceField`
- `readTotalAmount`
- `stopBeforeReview`
- any review/final/submit method
- any unsupported browser method

If no such safe runner is available, browser-state verification must remain blocked as not verifiable enough.

## Current Result

Existing bridge command found: `npm run bridge:localhost`.

New bridge scaffold added: no.

Preflight-only readiness status: `local_preflight_bridge_readiness_documented_existing_stub`.

Browser-state verification status: `not_verified_by_this_action`.

No Avanza, fill, click, review, final confirm, submit, or order-placement activity occurred.

## Local Verification Performed

The existing bridge was started manually for verification with:

```bash
npm run bridge:localhost
```

The sandboxed attempt could not bind to `127.0.0.1:47831` and failed with `listen EPERM`. The same existing local-only bridge command was then run with permission to bind the localhost port.

The bridge started successfully and printed:

```text
Ture localhost bridge stub listening on http://127.0.0.1:47831
Local dev stub only: no Avanza, no real broker execution, no brokerResult. Mock-page review requires explicit enableMockAgentRun.
```

`GET /health` returned `bridgeStatus: "available"` with:

- `supportsAutomaticSubmit: false`
- `supportsBrokerResultReturn: false`
- `supportsRealBrokerAutomation: false`
- message confirming no Avanza or real broker integration is implemented

`GET /self-check` returned diagnostics-only metadata with:

- `selfCheck.status: "unavailable"`
- `capabilityValidation.canRunMockBrowserActions: false`
- `capabilityValidation.canRunAvanzaDryRun: false`
- `capabilityValidation.canSubmitBrokerOrder: false`
- `metadata.no_browser_control: true`
- `metadata.no_avanza_session: true`
- warnings stating self-check does not open a browser, touch Avanza, submit orders, create broker results, write Supabase, or mutate trades

The bridge was stopped with `Ctrl-C` and printed:

```text
Received SIGINT; stopping localhost bridge stub.
```

Verification conclusion:

- Local bridge readiness endpoint availability: verified.
- Local bridge self-check endpoint availability: verified.
- Real Avanza browser-state verification: not available through this default stub.
- Future fill-only trigger readiness: still requires a separate safe runner that can verify visible state without filling or clicking.
