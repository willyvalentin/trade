# First Real Avanza Fill-Only POC Manual Browser Observation Mode

## Purpose

This document records the manual-browser observation mode for the first real Avanza fill-only POC local bridge.

This mode exists only to verify whether the current manually opened Avanza order form is visible and matches the expected preflight state. It is not a fill trigger, not a click trigger, not a review trigger, and not an order-placement path.

## Result

Manual browser observation endpoint added: `GET /preflight/avanza-order-form`.

Result status: `first_real_avanza_fill_only_poc_manual_browser_observation_mode_added`.

The endpoint is disabled by default. It becomes available only when the bridge is manually started with `AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly`.

## Safety Boundary

The endpoint is observation-only:

- no exact trigger phrase
- no trigger/action/wrapper/runner invocation
- no `fillAmountField`
- no `fillPriceField`
- no field fill
- no click
- no `Granska köp` click
- no review modal open
- no `Bekräfta köp/sälj` click
- no submit
- no order placement
- no credential handling
- no BankID handling
- no cookie read
- no localStorage read
- no sessionStorage read
- no unattended mode
- no automatic mode
- no app UI, route, provider, scanner, or package-script wiring

The user must manually open the browser, log in to Avanza, complete BankID/2FA, navigate to the intended order form, and keep the browser visible. The bridge only reads sanitized visible text/control labels through the local DevTools observation port and returns booleans.

## Start Observable Browser

Start a dedicated local browser session manually:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/ture-avanza-preflight-profile \
  --no-first-run \
  --no-default-browser-check
```

Then, in that browser window only:

1. Open Avanza manually.
2. Log in manually.
3. Complete BankID/2FA manually.
4. Navigate manually to the GameStop buy-side advanced/limit order form for account `Valentin Labs KF`.
5. Do not click `Granska köp`.
6. Do not open the review modal.
7. Do not click `Bekräfta köp/sälj`.

Keep exactly one Avanza tab open for the preflight. If multiple Avanza tabs are visible through the DevTools endpoint, the preflight must block as ambiguous.

## Start Bridge

Start the bridge manually in a separate terminal:

```bash
AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_MODE=cdp_readonly \
AVANZA_LOCALHOST_BRIDGE_MANUAL_OBSERVATION_CDP_URL=http://127.0.0.1:9222 \
npm run bridge:localhost
```

The bridge remains bound to `127.0.0.1:47831`.

## Verify Bridge

Health:

```bash
curl -sS http://127.0.0.1:47831/health
```

Self-check:

```bash
curl -sS http://127.0.0.1:47831/self-check
```

Manual Avanza order-form preflight:

```bash
curl -sS http://127.0.0.1:47831/preflight/avanza-order-form
```

Manual Avanza order-form field discovery:

```bash
curl -sS http://127.0.0.1:47831/preflight/avanza-order-form/field-discovery
```

The field-discovery endpoint is observation-only. It returns sanitized, bounded metadata for likely order-form controls so selectors can be hardened without guessing. It may report zero `quantity` candidates; that is diagnostic evidence and does not by itself mean the whole preflight failed.

## Preflight Checks

The endpoint verifies only:

- Avanza page visible/reachable through the explicit manual observation mode
- account visible: `Valentin Labs KF`
- instrument visible: `GameStop`
- buy-side order form visible
- order mode visible: `Avancerad/Limit`
- amount field visible
- price field visible
- `Granska köp` visible but not clicked
- no review modal open
- no `Bekräfta köp/sälj` visible

The endpoint returns sanitized status and booleans only. It does not return raw page text, cookies, localStorage, sessionStorage, credentials, or BankID data.

## Field Discovery Report

`GET /preflight/avanza-order-form/field-discovery` inspects visible order-form controls and returns sanitized candidates grouped as:

- `amount`
- `quantity`
- `price`
- `total`
- `unknown`

For each candidate it may include:

- field group guess
- nearby visible label, length-limited
- placeholder, aria-label, name, id, type, role, autocomplete
- inputmode and pattern
- disabled, readonly, and hidden status
- visibility/bounding-box presence without coordinates
- sanitized value length and bounded normalized value
- nearby button/control labels, length-limited
- whether it appears inside a buy-side order-form region

The field-discovery endpoint does not fill fields, click buttons, open review, confirm, submit, or place orders. It does not return raw page text, raw DOM, cookies, localStorage, sessionStorage, credentials, or BankID/session data.

## Stop

Stop the bridge with `Ctrl-C` in the bridge terminal.

Close the dedicated browser window after the manual preflight is complete.

## Current Authorization State

This observation mode does not authorize a live fill. A future fill-only trigger request must still provide a separate explicit trigger request and must remain within the approved fill-only boundary.
