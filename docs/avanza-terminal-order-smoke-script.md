# Avanza Terminal Order Smoke Script

## Current Status

`scripts/avanza-order-chain-smoke-test.local.ts` is a terminal-only hard-gated scaffold for the Avanza order chain smoke test runner. It is local-dev only, disconnected from Trade UI/API, and default-safe.

The script does not run during normal tests, render, build, or import. It exposes guarded functions and a `main()` entrypoint that only runs when the script file is invoked directly.

## Required Gates

- `TURE_AVANZA_ORDER_SMOKE_TEST=1`
- `TURE_LOCAL_DEV_CONFIRM=I_UNDERSTAND_THIS_IS_LOCAL_ONLY`
- CI must be absent.
- Explicit real-run mode additionally requires `TURE_AVANZA_ORDER_REAL_RUN=1`.

Without the separate real-run flag, the script remains in model-only or local-dev dry-run behavior. No package.json script was added because this project does not currently include a TS runner command such as `tsx`.

## Safe Output

The script prints a safe report only:

- status
- mode
- safe side/ticker model values
- smoke-test booleans
- review-ready booleans
- final human action required
- `orderSubmitted: false`
- `finalBuySellClicked: false`
- warnings
- blocked reasons

It does not print raw fill values, account numbers, broker order references, credentials, cookies, sessions, or BankID material.

## Local Checklist

1. Confirm this is a local terminal-only run.
2. Confirm CI is not active.
3. Confirm the explicit smoke-test env gate.
4. Confirm the manual local acknowledgement.
5. Keep real-run mode off unless a separate approval gate is open.
6. Review the safe report.
7. Stop at review-ready/final human action.
8. Do not click final KOP/SALJ from the agent.

## Hard Boundaries

- No credentials in command line.
- No account numbers or broker order references in output.
- No cookies/session handling.
- No BankID automation.
- No Trade UI wiring.
- No API route wiring.
- No order submission.
- No final KOP/SALJ click.
- No confirmation capture.
- No Supabase execution write.
- Not production ready.

## Review-Ready Endpoint

Review-ready is the maximum endpoint for order-prep smoke work. The script scaffold may model search, instrument identity verification, order-ticket field preparation, and review-ready state through injected dependencies, but the final broker action remains human-only outside this system.

## What Is Not Implemented

- No Trade UI execution integration.
- No API route integration.
- No automatic app-runtime Avanza navigation.
- No cookie/session handling.
- No final KOP/SALJ click.
- No order submission.
- No Supabase write.
- No production readiness claim.

## Local Smoke Result Capture

`docs/avanza-local-smoke-test-result-capture.md` now defines the safe result capture model for recording order-prep smoke outcomes without storing sensitive data. It can record review-ready outcome evidence but does not activate smoke tests, does not activate this terminal script, persist results, store raw fill values, store account/order ids, wire Trade UI/API, submit orders, click final KOP/SALJ, write Supabase, or claim production readiness.
