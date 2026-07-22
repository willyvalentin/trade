# Action 582 - First Controlled Manual Production Shadow Canary Attempt

## Phase 1 Decision

- Decision: `blocked_before_live_canary_authorization`.
- This is a plan-only record. No production flag, authorization, claim, attempt, provider request, audit, ledger, or schedule was changed or invoked.
- The current deployment has no server-controlled atomic continuation from a consumed manual authorization into a provider attempt. The dormant canary route explicitly returns `manual_execution_continuation_not_implemented` for authorization-shaped input.
- The current manual execution-gate route can only produce `gate_consumed_execution_not_started`. That sanitized handoff is not a bearer execution permit and declares `client_continuation_allowed: false`.
- The existing canary route also has pre-provider exits after a daily claim that do not finalize the claim. It cannot satisfy the required retained terminal-state guarantee for every post-claim failure.

## Production Contract Inventory

### Routes

| Route | Method | Phase 1 classification | Purpose |
| --- | --- | --- | --- |
| `/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness` | `GET` | read-only | Authenticated readiness and schema/state evidence. |
| `/api/automation/continuous-intelligence/shadow-collector/canary/preflight` | `POST` | read-only | Authenticated non-mutating canonical canary preflight. |
| `/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization` | `POST` | irreversible durable write | Issues exactly one short-lived authorization and returns its raw token once. Do not invoke in Phase 1. |
| `/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution-gate` | `POST` | read-only only with `dry_run: true`; irreversible with normal body | A non-dry run consumes an authorization but cannot start execution. Do not invoke in Phase 1. |
| `/api/automation/continuous-intelligence/shadow-collector/canary` | `POST` | external provider/durable write if eligible | Existing scheduled-canary path. It rejects manual authorization input with `manual_execution_continuation_not_implemented`; it is not a manual execution continuation. |

All routes require `x-automation-secret` except that Phase 1 must not send any mutating request. The manual routes and canary route are dynamic and use `no-store` responses.

### Service-Role RPCs

- `read_continuous_intelligence_shadow_canary_readiness()` - read-only schema readiness probe.
- `issue_continuous_intelligence_shadow_canary_manual_authorization(...)` - atomic one-active-authorization issuance; returns `market_interval`, not the reserved output name `interval`.
- `consume_continuous_intelligence_shadow_canary_manual_authorization(...)` - atomic single-use consumption bound to authorization ID, raw token, request fingerprint, execution ID, and claim ID.
- `claim_continuous_intelligence_shadow_canary(...)` - atomic UTC-day capacity claim, capped at two runs/two estimated credits.
- `begin_continuous_intelligence_shadow_canary_attempt(...)` - atomic `claimed -> attempted`; only `attempt_started` permits provider entry.
- `finalize_continuous_intelligence_shadow_canary_attempt(...)` - atomic `attempted -> completed|failed`, bound to claim ID, execution ID, fingerprint, and contract version.

These RPCs are service-role-only. The operator must never call them directly; the future continuation route must use the server persistence adapters.

### Durable Tables

- `continuous_intelligence_shadow_canary_manual_authorizations`
- `continuous_intelligence_shadow_canary_daily_claims`
- `bounded_shadow_collector_proof_audits`
- `continuous_intelligence_credit_ledger`

### Environment Inputs

| Variable | Required production state before issuance | Role |
| --- | --- | --- |
| `AUTOMATION_SECRET` | configured | Route authentication; never return or log it. |
| `TWELVE_DATA_API_KEY` | configured | Server-only provider credential. |
| `TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS` | `within_budget` or `approaching_limit` | Accepted provider metadata. |
| `TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED` | enabled | Required to retain the sanitized audit receipt. |
| `TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED` | enabled | Required for durable daily-usage evidence and ledger persistence. |
| `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED` | `false` before issuance; temporarily `true` only inside the separately approved continuation protocol | Canary feature gate. |
| `TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH` | `true` before issuance; temporarily `false` only inside the separately approved continuation protocol | Immediate stop control. |
| `TURE_SHADOW_CANARY_SCHEDULE_DECLARED`, `TURE_SHADOW_CANARY_REMOTE_SCHEDULE_ACTIVE`, `TURE_SHADOW_CANARY_DUPLICATE_SCHEDULE_PRESENT`, `TURE_SHADOW_CANARY_FUTURE_FREQUENCY_SELECTED` | absent/false signals | Must continue to prove that no schedule can race the manual attempt. |

`TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED` and the Action 567 dry-run flag do not authorize this canary.

## Required Future State Machine

The following is the only acceptable live sequence after a separate Action 582 implementation supplies a single server-controlled continuation. Parentheses classify each step.

1. Read readiness, preflight, table counts, schedule signals, and the current calendar range. (read-only)
2. Confirm the canary remains disabled and kill switch remains active while issuing the authorization. (read-only gate facts)
3. Issue one authorization using the canonical immutable binding; retain the raw token only in server-controlled request memory. (irreversible durable write)
4. In the same server-controlled workflow, rebuild all facts, verify the exact binding, consume the authorization, atomically claim one daily run/credit, recheck immediate runtime/configuration facts, and atomically begin the attempt. (irreversible durable writes)
5. Make at most one Twelve Data request for `AAPL`, `5min`, exactly one completed 30-minute range, with a five-second timeout and no retry. (external provider call)
6. Atomically finalize the exact attempt as `completed` or `failed`, using the same immutable claim identity. (irreversible durable write)
7. Persist one sanitized receipt with `entry_kind: bounded_manual_proof`, then one idempotent credit-ledger record from that receipt. (irreversible durable writes)
8. Restore canary disabled and kill switch active immediately after the submission window, whether the provider result is success, rejection, timeout, or internal failure. (reversible configuration mutations)
9. Read back the authorization, claim, audit, ledger, daily usage, flags, schedule state, and safe receipt. (read-only)

The current routes do not implement steps 3-7 as one continuation. A separate normal gate request is expressly forbidden because it can consume a token without starting execution. The future continuation must not use the existing scheduled-canary receipt shape because that path records `scheduled_shadow_collector_canary`, `operator_authorization_verified: false`, and `authorization_consumed: false`.

## Safety Proofs Required Before Any Live Attempt

- **Authorization cardinality and TTL:** the issue RPC uses an advisory transaction lock, permits only one active unconsumed row, persists only a SHA-256 token hash, and constrains expiry to `issued_at < expires_at <= issued_at + 60 seconds`.
- **Canonical request:** authorization table constraints and strict mapper require `AAPL`, `5min`, and exactly 30 minutes. The persisted binding also contains the request fingerprint, execution ID, claim ID, calendar fingerprint, build identity, and `377 / 57 / 320` policy facts with one estimated credit.
- **Single use and no transfer:** consumption checks the raw token and all immutable IDs atomically. `consumed` is not an execution right; the only currently emitted handoff is `gate_consumed_execution_not_started` with client continuation forbidden.
- **Planner and reserve safety:** the canonical preflight must locate `AAPL` in an allocated non-reserve Action 565 workload, with at least one normal planned credit. The policy remains total `377`, hard reserve `57`, normal planned maximum `320`; proof execution is exactly one credit and consumes zero reserve/execution-ready capacity.
- **No concurrency from schedules:** readiness and authorization require every schedule signal to remain absent. No Netlify scheduled function may be activated for this attempt.
- **Failure closure:** after a claim becomes `attempted`, every exit must call the identity-bound finalization RPC. Provider entry must be tracked so pre-provider failures retain `provider_attempted: false`, and unknown provider-entry state is conservatively recorded as attempted.
- **Restoration:** configuration restoration is mandatory in a `finally`-equivalent operator procedure. If restoration cannot be proven, treat the operation as incomplete and keep the kill switch active by a separate emergency configuration action.

## Go/No-Go Checkpoints

### Checkpoint A - Before Any Flag Mutation

GO only when all are true:

- activation readiness is `ready_for_one_manual_canary_attempt`;
- preflight is blocked only by `canary_disabled` and `canary_kill_switch_active`;
- daily usage is `0 / 0` and all four durable tables have zero rows;
- calendar is verified/current and supplies a completed regular-session 30-minute range;
- all schedule signals are absent;
- provider metadata is accepted and the planner authorizes one normal-capacity `AAPL` credit;
- the new atomic manual continuation route has been deployed, tested, and exposes a distinct `bounded_manual_proof` receipt path.

Current result: **NO-GO**. The final condition is absent.

### Checkpoint B - Before Authorization Issuance

GO only when Checkpoint A passes and canary is still disabled with kill switch active. Issuance must happen before any temporary execution configuration change because the existing issue route deliberately requires that safe disabled state.

Current result: **NO-GO**. Do not issue a short-lived token before the atomic continuation exists.

### Checkpoint C - Before Consumption and Provider Execution

GO only inside one server-owned continuation that, without client-controlled separation:

1. reads fresh readiness/preflight and exact binding;
2. consumes the authorization;
3. performs the atomic daily claim;
4. rechecks immediate runtime state;
5. begins the attempt atomically; and
6. verifies explicit canary enablement and kill-switch release only for the bounded submission window.

Any flag change must be observed in the same deployment/runtime context. A prior gate response, authorization ID, raw token, or consumed database row is insufficient.

Current result: **NO-GO**. No such continuation route exists.

### Checkpoint D - After Execution

Accept a result as complete only when readback proves:

- authorization is `consumed` with immutable binding unchanged;
- exactly one claim exists for the execution ID and is terminal (`completed` or `failed`), never left `claimed` or `attempted`;
- provider request count is `0` or `1`, never greater than one;
- exactly one sanitized manual-proof audit and one idempotent credit-ledger record exist for the source receipt;
- daily usage increments by exactly one run/estimated credit after any begun attempt;
- canary is disabled again, kill switch active again, and all schedule signals remain absent.

## Reversible Configuration Containment

The commands below are **future operator commands only**. They were not run in Phase 1. They use the known production site ID `2b582e03-ac97-4371-8051-558d9980fb94`; changing a Netlify production environment value must be followed by the operator's approved configuration propagation procedure before treating it as effective.

```bash
# Future temporary release, only after Checkpoint C and only for the bounded submission window.
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED true --context production --site 2b582e03-ac97-4371-8051-558d9980fb94
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH false --context production --site 2b582e03-ac97-4371-8051-558d9980fb94

# Mandatory rollback/containment. Run first on any uncertain result, then verify propagation.
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED false --context production --site 2b582e03-ac97-4371-8051-558d9980fb94
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH true --context production --site 2b582e03-ac97-4371-8051-558d9980fb94
```

No command can roll back a consumed authorization, a claim, a terminal attempt, an audit record, a ledger record, or a provider call. Those are retained evidence. The containment response for any durable or provider failure is immediate flag restoration followed by read-only evidence collection.

## Expected Durable Deltas

| Outcome | Authorization | Claim | Audit / ledger | Provider |
| --- | --- | --- | --- | --- |
| Success with candles or valid empty response | one issued then consumed | `claimed -> attempted -> completed`, `provider_attempted: true` | one sanitized `bounded_manual_proof` receipt and one ledger row | exactly one request |
| Provider rejection/rate limit/invalid response | one issued then consumed | `claimed -> attempted -> failed`, retained | one failed sanitized receipt and one ledger row | exactly one attempted request |
| Timeout | one issued then consumed | `claimed -> attempted -> failed`, retained | one timeout receipt and one ledger row | exactly one attempted request, bounded to five seconds |
| Internal failure before provider entry | one issued then consumed only if inside the continuation | `claimed -> attempted -> failed`, `provider_attempted: false` | one internal-failure receipt and one ledger row | zero requests |
| Authorization expiry before consumption | issued then expired/rejected; never consumed | no claim | no audit or ledger | zero requests |
| Authorization replay | existing consumed/expired/rejected state remains | no new claim | no new audit or ledger | zero requests |

## Required Remediation Before Phase 2

Implement and deploy one server-only manual continuation endpoint/workflow that owns the entire consume-to-finalize lifecycle. It must use the existing immutable Action 580 binding and Action 574 claim RPCs, generate a manual-proof receipt, finalize every post-claim path, and never accept a detached gate response as authority. After that release, rerun Checkpoint A before seeking a fresh explicit live-attempt authorization.
