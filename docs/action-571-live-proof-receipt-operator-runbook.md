# Action 571: Live Proof Receipt and Operator Runbook

## Receipt Contract

Action 571 returns `bounded_shadow_collector_live_proof_receipt_v1` only after a
valid Action 570 authorization has entered execution submission. The receipt is
sanitized and process-local: it includes request, credit, candle aggregate,
planner-authorization, authorization-consumption, and safe result-category facts.
It never includes candles, raw provider payloads, URLs, API keys, automation
secrets, authorization tokens or hashes, raw environment values, or stack traces.

Once an authorization has entered `consuming`, every execution submission records
one canonical receipt. An unexpected internal runtime failure is recorded as a
sanitized `internal_execution_failure`; the receipt reports zero provider requests
only when the provider wrapper was not entered, otherwise one. The authorization is
consumed in either case and cannot be reused.

The latest-receipt route is authenticated GET-only:

`/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/latest-receipt`

It returns `not_observed` and `null` before an execution submission. It performs
no provider request, token action, execution, capacity reservation, persistence,
or cache mutation. The one-record receipt store is overwritten only by a completed
submission and is cleared by cold starts or deploys.

## First Live Proof Sequence

1. Confirm the deployed Action 571 build marker and production health.
2. Confirm the Action 568 execution feature flag is disabled.
3. Confirm provider-budget metadata is resolved.
4. Choose one safe ticker and a completed historical range no longer than 30 minutes.
5. Run authenticated Action 569 preflight.
6. Confirm every gate is ready.
7. Explicitly enable the Action 568 execution feature flag.
8. Re-run preflight after flag activation.
9. Request exactly one Action 570 authorization token.
10. Immediately submit one Action 568 request with the automation-secret header,
    `x-ture-bounded-proof-authorization`, and the exact same body.
11. Never retry automatically.
12. Read the Action 571 receipt.
13. Confirm one provider request, at most one credit, no fallback, zero retries,
    no cache mutation, no persistence, reserve untouched, and authorization consumed.
14. Disable the Action 568 execution feature flag immediately after the proof.
15. Re-run preflight and confirm execution is blocked.
16. Review only safe markers in logs and diagnostics.
17. Record any operator decision manually outside runtime.

## Abort Conditions

Abort without retry on preflight block, runtime busy, unresolved provider metadata,
missing planner authorization, invalid reserve, authorization expiry or mismatch,
provider timeout, fallback, nonzero retry count, structural invalidity, rate limit,
more than one request, unknown credits, any cache/persistence signal, or any
recommendation, scanner, ranking, confidence, execution, or broker effect.

Never use browser/client invocation, repeated clicks, automatic retry, broad ticker
lists, current or future ranges, schedule activation, or a feature flag left enabled.
Never copy an authorization token into logs or documents, and never treat the
process-local receipt as durable audit storage.

## Rollback

Disable the Action 568 execution flag. Do not reuse the authorization and do not
retry. Read the sanitized receipt state, verify no schedule and no cache/persistence
occurred, and revert the deployment only if separately necessary. Preserve only
sanitized logs.
