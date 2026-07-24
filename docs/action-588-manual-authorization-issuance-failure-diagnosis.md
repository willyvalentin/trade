# Action 588 - Manual Authorization Issuance Failure Diagnosis

## Decision

`issuance_failure_not_yet_explained`

The Action 587 issuance attempt is closed and will not be retried. It did not create an authorization, lease, claim, audit, or ledger row, and it did not call the provider.

## Sanitized Evidence Available From the One Attempt

- The canonical manual-authorization route was called exactly once with the authenticated fixed Action 580 contract body.
- The same automation-secret header produced successful read-only readiness and preflight responses immediately before issuance; request authentication was therefore proven for the surrounding attempt.
- The caller received a result that did not prove `issued: true` with a valid authorization plus matching lease. The client safely classified this as `issuance_not_proven` and cleared both in-memory values.
- The caller intentionally retained neither the raw response body nor raw credential material. The route has no durable per-request failure record or sanitized error code for the combined issuance operation, so the exact HTTP status and route failure category cannot be reconstructed after the fact.
- Immediate containment readback found authorizations `0`, leases `0`, claims `0`, audit rows `0`, credit-ledger rows `0`, and daily usage `0 / 0`.

## Issuance Path Audit

1. `POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization` requires `x-automation-secret` and accepts only an empty body or the exact manual-authorization contract body.
2. The route rebuilds the server-only manual authorization context: readiness, canonical preflight, daily usage, calendar evaluation, provider-budget state, planner binding, schedule facts, and deployment identity.
3. The route issues only when readiness is `ready_for_one_manual_canary_attempt`, the global defaults remain canary disabled and kill switch active, schedule and daily-cap gates are clear, provider metadata is accepted, preflight has exactly the two disabled-state blockers, and the immutable binding exists.
4. The persistence adapter hashes the short-lived authorization token and calls `issue_ci_shadow_canary_manual_lease(...)` with the paired authorization and lease identity.
5. The Action 585 RPC atomically inserts the authorization and lease or rolls both back. It returns only `issued`, `already_issued`, `conflicting_active_authorization`, or safe `unavailable` semantics.
6. The adapter strictly validates the returned IDs, timestamps, and `issued` statuses, constructs the immutable authorization and lease records, and only then lets the route serialize the one-time raw authorization token.

## Verified Failure Classes

| Class | Finding |
| --- | --- |
| Route authentication/header | Not implicated: the same header was accepted by readiness and preflight. |
| Request body | Not implicated: the caller used the route's exact accepted contract body. |
| Readiness rejection visible to public checks | Not proven: public readiness/preflight were correct, but the private binding includes deployment identity not exposed by those responses. |
| Migration/RPC endpoint visibility | Not implicated: safe `OPTIONS` found both `issue_ci_shadow_canary_manual_lease` and `admit_ci_shadow_canary_manual_lease`. |
| Service-role runtime availability | Partially ruled out: the deployed service-role-only readiness probe returned available. Exact issuance-RPC execution permission was not invoked, to avoid creating credentials. |
| Atomic rollback | Confirmed by outcome: no authorization or lease row exists, so no partial issuance survived. |
| Response mapping | Not ruled out: the adapter fails closed when a valid RPC result cannot be strictly parsed. |
| Deployment identity / private binding | Not ruled out: binding requires `COMMIT_REF` or `NETLIFY_COMMIT_REF`, which is intentionally not disclosed by read-only production routes. |

## Why the Exact Branch Is Unrecoverable

The route maps a failed context eligibility check to `authorization_preflight_blocked` and maps persistence or strict response-parsing failures to an intentionally generic safe result. The persistence adapter catches database failures and converts them to `unavailable`; it does not retain a sanitized failure category. No production log or durable diagnostic record was created for the failed request, by design. Repeating the route call would be another issuance attempt and is prohibited.

## Required Follow-up Before a New Attempt

Do not issue another authorization under the Action 587 operator approval. A separate corrective action must add a read-only, non-issuing issuance-readiness diagnostic or a strictly sanitized issuance failure category that distinguishes:

- missing immutable deployment binding;
- context/preflight rejection;
- service-role/RPC permission or schema failure;
- atomic RPC safe-unavailable result; and
- strict response-mapping rejection.

That diagnostic must not issue tokens, leases, claims, or provider requests. Only after it is deployed and production-verified may a new operator explicitly authorize a fresh one-time attempt.

## Safety Confirmation

No production credential was printed or retained. No direct issuance/admission RPC was invoked for diagnosis. No provider call, claim, audit write, ledger write, flag change, schedule action, deployment, commit, or push occurred. `deno.lock` remains untouched and untracked.
