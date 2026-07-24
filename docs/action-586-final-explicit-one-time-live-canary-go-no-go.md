# Action 586 - Final Explicit One-Time Live Canary Go/No-Go

## Decision

`ready_for_operator_explicit_live_canary_execution`

This decision authorizes no live activity by itself. It records the exact preconditions and containment rules for a separately explicit operator decision to submit one bounded manual production shadow-canary attempt. Action 586 performed only read-only production checks.

## Verified Production Baseline

- Activation readiness: `ready_for_one_manual_canary_attempt` with no readiness blockers.
- Global defaults: canary `disabled`; kill switch `enabled` (active).
- Schedule: repository, deployment, remote, duplicate, and future-frequency schedule signals are all `absent`.
- Durable baseline: manual authorizations `0`, manual execution leases `0`, daily claims `0`, audit rows `0`, and credit-ledger rows `0`.
- Daily usage: `0` runs and `0` estimated credits.
- Calendar: `us_equity_market_calendar_v1`, verified, current, covered, and able to derive the latest completed 30-minute range.
- Provider and planner: provider configured with `within_budget`; one normal-capacity credit is authorized, hard reserve remains `57`, and execution-ready reserve use is `0`.
- Canonical preflight: blocked only by `canary_disabled` and `canary_kill_switch_active`; it selected `AAPL`, `5min`, and one completed 30-minute window.
- Deployed manual-authorization and canonical manual-execution routes reject `HEAD` with `405`, confirming their POST-only non-executing boundary.

No global flag change or deployment is required. The paired one-time lease overrides only the two safe global defaults inside the canonical server-controlled execution request. The defaults must remain canary disabled and kill switch active throughout.

## Canonical One-Time Sequence

1. Re-run baseline readback and non-mutating preflight. Read-only.
2. Issue exactly one bounded authorization and its matching opaque lease through the canonical manual-authorization route. Durable write; no provider work.
3. Immediately submit the authorization ID, in-memory authorization token, and matching lease ID to canonical manual-execution. Do not send either credential to any other route.
4. The server atomically validates the immutable binding, consumes both authorization and lease, and admits exactly one daily claim in `attempted` state. Durable writes.
5. The server rechecks non-provider runtime gates and makes at most one `AAPL` / `5min` provider request for the exact 30-minute window. External provider call; five-second timeout and no retry.
6. The server finalizes the exact claim to `completed` or `failed`, then persists the sanitized audit receipt and credit-ledger record. Durable writes.
7. Read back only sanitized durable facts. No replay, retry, second authorization, or second provider request is allowed.

## Checkpoints

### A - Before Issuance

Pass only when all of the following are exact:

- readiness decision is `ready_for_one_manual_canary_attempt`;
- daily usage is `0 / 0`;
- authorization, lease, claim, audit, and ledger table counts are each `0`;
- schedule signals are all absent;
- canary is disabled and kill switch is active;
- calendar is verified/current with a completed 30-minute range;
- provider metadata is accepted, planner authorization is normal capacity with one executable credit, and policy is `377 / 57 / 320`;
- the manual-authorization and manual-execution routes remain deployed POST-only handlers.

Fail: stop. Do not issue an authorization. Capture sanitized readiness, preflight, and count evidence only.

### B - After Issuance, Before Execution

Pass only when readback proves:

- exactly one authorization and one matching lease exist;
- both are `issued`, unconsumed, and unexpired;
- the lease is bound to the same authorization, request fingerprint, execution ID, claim ID, `AAPL`, `5min`, 30-minute range, one estimated credit, and `377 / 57 / 320` policy;
- TTL remaining is sufficient for an immediate single canonical submission (never more than 60 seconds from issuance);
- claims, provider-attempt evidence, audit, and ledger are still unchanged from the baseline.

Fail: do not execute. Let the paired credentials expire or use the route's safe rejection result; never retry issuance within the same operator attempt.

### C - Canonical Execution Admission

Submit only one request to:

`POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-execution`

The payload contains exactly `authorization_id`, `authorization_token`, and `execution_lease_id`. It is automation-secret authenticated. The server must atomically consume the matching pair and create the exact attempted claim before provider entry.

Abort before provider entry on any binding, expiry, replay, schedule, calendar, provider, planner, policy, budget, audit, ledger, claim-admission, or immediate runtime failure. No direct RPC calls and no scheduled-canary route calls are permitted.

### D - After Execution

Accept the result only when:

- authorization and lease were each consumed exactly once, or were safely expired/rejected without admission;
- exactly one claim was admitted for a successful execution admission;
- every admitted claim is terminal (`completed` or `failed`), with no dangling `claimed` or `attempted` record;
- provider request count is no more than one;
- audit and ledger records agree with the final claim, request fingerprint, receipt identity, provider-attempt fact, and bounded credit facts;
- daily usage remains within the immutable policy: one proof credit from normal planned capacity, `377` total, `57` reserve preserved, and `320` normal planned maximum;
- replay cannot create another claim, receipt, ledger row, or provider call.

Fail: preserve the existing durable terminal fact, do not retry, and capture sanitized evidence for review.

## Containment Matrix

| Condition | Required containment | Expected durable state |
| --- | --- | --- |
| Authorization or lease issuance failure | Stop before execution; do not retry in the same attempt. | No admitted claim, provider call, audit, or ledger row. |
| Expiry before execution | Stop; do not replay credentials. | Authorization and lease are expired or safely rejected; no claim. |
| Admission failure or replay | Stop; do not call the provider. | No new claim or provider call; existing terminal/replayed state remains unchanged. |
| Provider rejection, timeout, malformed result, or internal error | Let the canonical route finalize; do not retry. | One retained failed terminal claim; provider-attempt fact reflects entry; sanitized receipt/ledger are attempted as applicable. |
| Audit failure | Do not repeat execution. Capture receipt/claim evidence and ledger persistence status. | Claim is already terminal; response is failed unless both audit and ledger persistence are proven. |
| Ledger failure | Do not repeat execution. Capture audit/claim evidence and ledger failure category. | Claim is already terminal; response is failed unless both audit and ledger persistence are proven. |
| Unexpected non-terminal claim | Treat as containment failure. Do not execute again or alter flags. | Escalate for a dedicated repair; preserve the claimed record for investigation. |

## Evidence to Capture

Capture only sanitized facts:

- deployment identity, readiness/preflight decisions, calendar verification, schedule absence, and flag states;
- counts before issuance, after issuance, and after terminal handling;
- authorization ID and lease ID/statuses, never raw authorization token, token hash, or any credential;
- claim ID/status, request fingerprint identifier, terminal timestamp, and provider-attempt boolean;
- bounded request facts, provider request count, safe outcome category, and retry count;
- audit receipt ID/entry kind and credit-ledger source receipt ID/status;
- explicit proof that no schedule, scanner, ranking, recommendation, broker, or other execution behavior changed.

Never capture provider URLs, raw payloads, raw candles, API keys, database credentials, stack traces, or token material.

## Boundedness Proof

The only live request accepted by canonical execution is bound to `AAPL`, `5min`, and exactly 30 minutes. It has one authorization, one matching single-use lease, at most a 60-second TTL, one atomic claim admission, one provider request maximum, one estimated normal-capacity credit, and no retry. The Action 565 policy remains `377` total credits / `57` hard reserve / `320` normal planned maximum. The lease does not override schedule, calendar, provider, planner, policy, budget, audit, ledger, duplicate, or daily-cap gates; it overrides only the disabled canary and active kill-switch defaults for this exact server-controlled continuation.

## Operator Boundary

An explicit operator authorization is still required before any issuance or execution request. No secret-bearing command belongs in this document. Credentials must remain in the approved operator session, never shell history, files, logs, responses retained for later use, audit records, or ledger rows.
