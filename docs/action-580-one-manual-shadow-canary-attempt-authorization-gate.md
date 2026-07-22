# Action 580: One Manual Shadow Canary Attempt Authorization Gate

## Scope

Action 580 adds a durable, server-side authorization boundary for exactly one future manual shadow-canary attempt. It does not invoke Twelve Data, create a daily claim, begin or finalize an attempt, write an audit or ledger record, enable a flag, or activate a schedule.

## Contract

`continuous_intelligence_shadow_canary_manual_authorization_v1` creates one authorization with the purpose `one_manual_shadow_canary_attempt`. Its immutable binding contains the canonical Action 574 request fingerprint and exact `AAPL` / `5min` completed 30-minute range, execution ID, claim ID, calendar contract and validated dataset fingerprint, Action 573 policy facts (`377` total, `57` hard reserve, `320` normal planned maximum), one estimated credit, canary and claim contract versions, and the deployed commit plus build marker.

The authorization token is a 256-bit server-generated bearer value. It is returned once by the authenticated issuance route and never stored. Supabase retains only its SHA-256 hash. It expires in at most 60 seconds. `issued` means the final gate has not approved the exact request. `consumed` means the final gate passed once, but is not an execution permit: no route may execute solely because a row is consumed, and a sanitized gate response is never a bearer execution ticket. Expired and revoked records never authorize execution.

## Durable RPCs

The unapplied Action 580 migration adds `continuous_intelligence_shadow_canary_manual_authorizations` and two service-role-only RPCs:

- `issue_continuous_intelligence_shadow_canary_manual_authorization` atomically permits one active unconsumed authorization, returns existing matching metadata without a token, and blocks a conflicting active authorization.
- `consume_continuous_intelligence_shadow_canary_manual_authorization` atomically verifies the raw bearer token, authorization ID, request fingerprint, execution ID, and claim ID before consuming exactly once.

RLS is enabled. The table cannot store raw tokens, candles, provider payloads, secrets, URLs, or stack traces.

## Routes

- `POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization`
- `POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-execution-gate`

Both require `x-automation-secret`, are dynamic and `no-store`, and have a five-second route ceiling. Issuance accepts only an empty body or the fixed Action 580 contract marker. The final gate accepts only an authorization ID, raw token, and optional `dry_run: true`.

Issuance rebuilds readiness and the canonical preflight server-side. It requires `ready_for_one_manual_canary_attempt`, a verified current calendar and exact completed range, disabled canary, active kill switch, all schedule signals absent, available daily capacity, resolved provider budget metadata, and no preflight blocker beyond the intentionally disabled canary state.

The final gate rebuilds the same facts and compares the stored immutable binding. It reports one canonical outcome: `ready_for_one_manual_execution`, `authorization_missing`, `authorization_expired`, `authorization_consumed`, `authorization_identity_mismatch`, `deployment_changed`, `calendar_changed`, `range_changed`, `daily_limit_reached`, `schedule_state_changed`, `canary_state_changed`, `provider_budget_changed`, or `runtime_unavailable`.

`dry_run: true` is non-consuming. A normal gate invocation consumes only after all static checks pass. Every gate response says: `Provider execution has not occurred.` A successful non-dry-run response may include a sanitized handoff context with status `gate_consumed_execution_not_started`; it records historical gate truth only. It has no token, cannot be replayed, and explicitly sets `client_continuation_allowed: false`.

## Future Execution Order

1. Rebuild readiness and preflight.
2. Issue a fresh manual authorization.
3. Operator reviews the exact sanitized request.
4. In one server-controlled Action 581 workflow, perform the final checks and consume the authorization.
5. Atomically claim daily capacity without a client-controlled gap.
6. Recheck immediate runtime state.
7. Atomically begin the attempt.
8. Make at most one provider request.
9. Atomically finalize the claim.
10. Persist the sanitized audit.
11. Persist the credit ledger entry.

Action 581 must use either one atomic server-controlled request/workflow for steps 4-8, or a new durable atomic transition from consumed authorization to a bound execution-start record. A plain second request that trusts a previous gate response is forbidden. The dormant canary route rejects authorization ID-only, token-only, consumed-authorization, and sanitized gate-response shapes with `manual_execution_continuation_not_implemented`; it never ignores or consumes a supplied token. The existing disabled-canary and active-kill-switch protections remain intact.

## Operator Review Checklist

- Confirm the route reports `ready_for_one_manual_execution` in a non-consuming dry run.
- Confirm authorization expiry, AAPL/5min range, request fingerprint, deployment marker, calendar fingerprint, policy facts, and one-credit ceiling.
- Confirm daily usage remains below `2` runs and `2` estimated credits.
- Confirm no schedule is active, the canary remains disabled, and the kill switch remains active.
- Do not reuse a token, consumed row, or sanitized gate response as execution authority. Action 581 must run a fresh immediate recheck and atomic server continuation.

## Rollback

Do not enable the canary or disable its kill switch. With the routes undeployed or the migration unapplied, the boundary fails closed. A future rollback can remove the deployment before any authorization is issued; no provider, claim, audit, or ledger state exists from Action 580 itself.

## Next Action

Action 581: Execute One Authorized Manual Shadow Canary Attempt. It must require a fresh explicit operator authorization and must not reuse any Action 580 review token.
