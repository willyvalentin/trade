# Avanza Local Smoke Test Result Capture

## Current Status

`lib/avanza-local-smoke-test-result-capture.ts` models a local smoke test checklist and safe result capture record for Avanza login, order-prep, settlement, and full operator run evidence.

This is docs/model/dev-QA only. It does not run smoke tests, persist results, wire Trade UI, wire API routes, navigate to Avanza from app runtime, submit orders, click final KOP/SALJ, read cookies/session, automate BankID, write Supabase, or claim production readiness.

## Allowed Evidence

- Safe runner status.
- Redacted screenshots.
- Redacted logs.
- Operator observations.

Allowed evidence must not include secret values, raw form values, account numbers, broker order references, cookies, session tokens, BankID material, or final-click proof.

## Forbidden Evidence

- Raw credentials.
- Cookies/session.
- Account numbers.
- Order ids or broker order references.
- Unredacted screenshots.
- Final click proof.

If forbidden evidence appears, the result capture status should be `unsafe_stop` and the operator should remove the unsafe evidence before continuing.

## Login Checklist

- Local environment confirmed.
- CI blocked.
- Env opt-in confirmed.
- Manual confirmation confirmed.
- Secure credential provider ready.
- Username/password path used.
- BankID avoided.
- Login reached expected state.
- No credentials logged.
- No cookies/session exported.

## Order-Prep Checklist

- Local environment confirmed.
- Execution package safe fixture or redacted test package.
- Search opened.
- Instrument selected.
- Instrument verified.
- BUY/SELL entry located.
- Order fields prepared.
- Review-ready reached.
- Final KOP/SALJ not clicked.
- Order not submitted.
- No account/order ids logged.

## Settlement Checklist

- Avrakningsnota path understood.
- No document read yet.
- No OCR.
- No extraction.
- No reconciliation write.

## Stop Conditions

- BankID appears.
- Unexpected final click risk.
- Order submitted.
- Credentials exposed.
- Cookies/session exposed.
- Account numbers or broker order references exposed.
- Unredacted screenshot captured.

## Result Statuses

- `not_started`: checklist is present but local smoke evidence has not started.
- `ready_to_run`: checklist is ready for safe local capture, but this model does not run it.
- `passed`: safe evidence indicates the local smoke goal passed.
- `passed_with_warnings`: safe evidence passed with warnings that require review.
- `failed`: safe evidence records a failed smoke result.
- `blocked`: a required prerequisite or checklist item blocked progress.
- `unsafe_stop`: forbidden evidence or unsafe action risk was detected.
- `manual_review_required`: operator review is required before any next step.
- `unknown`: state cannot be classified.

## Safety Flags

The model always keeps:

- `canRunSmokeTest: false`
- `canStoreRawCredentials: false`
- `canStoreCookies: false`
- `canStoreSessionTokens: false`
- `canStoreAccountNumbers: false`
- `canStoreOrderIds: false`
- `canStoreScreenshotsUnredacted: false`
- `canClickFinalBuy: false`
- `canClickFinalSell: false`
- `canSubmitOrder: false`
- `canWireTradeUi: false`
- `canWireApiRoute: false`
- `canWriteSupabase: false`
- `canClaimProductionReady: false`
- `requiresManualReview: true`
- `userMustConfirm: true`
- `finalHumanClickRequired: true`
- `controlsEnabled: false`
- `gateLocked: true`

## Production Readiness

No production readiness claim is made. Local smoke result capture is evidence bookkeeping only and cannot activate execution.

## Passive Execution Readiness Preview

`docs/avanza-passive-execution-readiness-preview.md` now documents the passive Trade UI/readiness preview. It provides visibility before active integration and does not activate smoke tests, start handoff, prepare orders, call APIs, fetch, poll, start browser automation, access credentials, read cookies/session, automate BankID, submit orders, click final KOP/SALJ, write Supabase, or claim production readiness.

## Settings Passive Execution Readiness Panel

`docs/avanza-settings-passive-execution-readiness-panel.md` now records the passive Settings readiness panel. It can display readiness state but cannot run smoke tests, start handoff, prepare orders, call APIs, fetch, poll, start browser automation, access credentials, read cookies/session, automate BankID, submit orders, click final KOP/SALJ, write Supabase, or claim production readiness.
## Passive Trade Execution Readiness Metadata

Recommendation/live-position passive readiness metadata now exists for future read-only card visibility. It is separate from smoke test result capture and does not activate execution, call APIs, run smoke tests from UI, submit orders, or click final KÖP/SÄLJ.
