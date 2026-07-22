# Action 584 - Final Live Canary Readiness and Explicit Go/No-Go

## Decision

`blocked_before_explicit_one_time_live_canary_execution`

This is a read-only runbook and contract review. No production configuration, authorization, claim, attempt, provider request, audit, credit-ledger row, schedule, deployment, or repository state was changed.

The production baseline is ready for a future single attempt, but the deployed flag-ordering contract prevents a safe one from being started:

- `POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization` issues only while the canary is disabled and the kill switch is active.
- `POST /api/automation/continuous-intelligence/shadow-collector/canary/manual-execution` admits execution only when the canonical preflight is eligible, which requires the canary enabled and the kill switch released.
- Production environment propagation is not an atomic, server-owned continuation and cannot safely be assumed to complete within the authorization TTL of 60 seconds.

Consequently, enabling first prevents issuance; issuing first leaves no safe, atomic way to reach the required enabled state before the token expires. No provider call is authorized until this contradiction is resolved in a separately reviewed deployment.

## Verified Baseline

- Atomic manual admission foundation is deployed and migration `20260722002000` is applied.
- Readiness is `ready_for_one_manual_canary_attempt`.
- Non-mutating preflight is blocked only by `canary_disabled` and `canary_kill_switch_active`.
- Manual authorizations, claims, audits, and credit-ledger rows are all `0`; daily usage is `0 / 0`.
- No schedule is active.
- The canonical bounded request remains `AAPL`, `5min`, and one completed 30-minute range, with policy totals `377 / 57 / 320`.
- `deno.lock` is intentionally untracked and outside this Action's scope.

## Intended Live Path

The following remains the only acceptable future lifecycle. It is **not executable under the current flag-ordering contract**.

1. Verify the baseline and collect the current canonical preflight. Read-only.
2. Establish the temporary canary-enabled, kill-switch-released configuration in a server-controlled, atomic workflow. Reversible configuration mutation.
3. Issue exactly one bounded authorization for the immutable canonical binding. Irreversible durable write.
4. Immediately submit its ID and raw token once to the canonical manual-execution route. The route consumes the authorization and atomically admits its daily claim in the same server-controlled request. Irreversible durable writes.
5. Recheck immediate runtime gates, atomically begin the attempt, and make at most one provider request. External provider call.
6. Atomically finalize the exact claim, then persist the sanitized audit receipt and credit-ledger record. Irreversible durable writes.
7. Restore canary disabled and kill switch active immediately, regardless of result. Reversible configuration mutation.
8. Read back the bounded durable evidence. Read-only.

The Action 583 admission RPC protects consume-and-claim continuity. It does not make externally propagated Netlify environment changes atomic with issuance and execution. That remaining gap is the no-go condition.

## Production Interfaces

| Interface | Method | Purpose | Classification |
| --- | --- | --- | --- |
| `/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness` | `GET` | Sanitized activation and schema readiness | Read-only |
| `/api/automation/continuous-intelligence/shadow-collector/canary/preflight` | `POST` | Non-mutating canonical preflight | Read-only |
| `/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization` | `POST` | One short-lived immutable authorization | Durable write, currently disabled-state-only |
| `/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution` | `POST` | Canonical consume, admit, execute, finalize path | Durable writes and at most one provider request |
| `/api/automation/continuous-intelligence/shadow-collector/canary` | `POST` | Scheduled canary path | Not a manual continuation; must reject authorization-shaped input |

Server-only RPCs, never operator-callable directly:

- `admit_continuous_intelligence_shadow_canary_manual_execution`
- `finalize_continuous_intelligence_shadow_canary_attempt`
- manual authorization issue/read/consume RPCs
- daily claim and begin-attempt RPCs

Durable tables:

- `continuous_intelligence_shadow_canary_manual_authorizations`
- `continuous_intelligence_shadow_canary_daily_claims`
- `bounded_shadow_collector_proof_audits`
- `continuous_intelligence_credit_ledger`

Required server inputs include `AUTOMATION_SECRET`, the server-only provider credential, accepted provider-budget metadata, audit and ledger enablement, the two canary controls, and the no-schedule state signals. Secrets belong only in the operator's secret store or process environment and must never appear in command history, shell output, documentation, receipts, or durable records.

## Operator Commands and Requests

Only the two read-only commands below are authorized at the current decision. They read the secret from an operator-managed file without printing it. Substitute placeholders only in an approved operator session.

```bash
export PROD_BASE_URL='<production-base-url>'
export AUTOMATION_SECRET_FILE='<path-to-operator-managed-secret-file>'

curl --fail-with-body --silent --show-error \
  -H "x-automation-secret: $(<"$AUTOMATION_SECRET_FILE")" \
  "$PROD_BASE_URL/api/automation/continuous-intelligence/shadow-collector/canary/activation-readiness"

curl --fail-with-body --silent --show-error \
  -X POST \
  -H "x-automation-secret: $(<"$AUTOMATION_SECRET_FILE")" \
  -H 'content-type: application/json' \
  --data '{}' \
  "$PROD_BASE_URL/api/automation/continuous-intelligence/shadow-collector/canary/preflight"
```

The following are **containment commands for a future separately approved live workflow only**. They are not authorized while this Action is blocked and must not be run as a workaround for the current contract mismatch.

```bash
# Future-only temporary configuration; requires a proven atomic workflow.
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED '<enabled-value>' \
  --context production --site '<production-site-id>'
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH '<released-value>' \
  --context production --site '<production-site-id>'

# Mandatory containment, first response to every uncertainty or terminal result.
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED '<disabled-value>' \
  --context production --site '<production-site-id>'
netlify env:set TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH '<active-value>' \
  --context production --site '<production-site-id>'
```

A future canonical request must use an in-memory authorization token exactly once:

```bash
# Future-only. Do not place the token in a file, shell history, or logs.
curl --fail-with-body --silent --show-error \
  -X POST \
  -H "x-automation-secret: $(<"$AUTOMATION_SECRET_FILE")" \
  -H 'content-type: application/json' \
  --data '{"authorization_id":"<issued-id>","authorization_token":"<in-memory-token>"}' \
  "$PROD_BASE_URL/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution"
```

No direct RPC invocation is allowed. No command should invoke the scheduled canary route with manual authorization fields.

## Checkpoints and Containment

### A - Final Baseline Before Any Flag Mutation

Pass only when readiness is `ready_for_one_manual_canary_attempt`; preflight has exactly the two disabled-state blockers; daily usage and all four durable table counts are zero; calendar is verified/current; provider metadata is accepted; schedule signals are absent; and the deployment identity matches the reviewed release.

Fail: abort without changing flags. Capture sanitized readiness/preflight output and counts. Do not issue an authorization.

### B - After Temporary Flag Changes, Before Authorization Issuance

Under the current release this checkpoint cannot pass: releasing the flags makes the issuance route return `authorization_preflight_blocked`. Containment is immediate restoration to canary disabled and kill switch active, followed by read-only confirmation of the restored state.

A future remediation may pass B only when the server itself owns the narrow enabled window and can prove both issuance eligibility and execution eligibility without an external propagation gap.

### C - After Authorization Issuance, Before Manual Execution

Under the current release this checkpoint cannot pass safely either: issuance requires the disabled state, whereas execution requires the enabled state. The token is not a transferable execution right and expires within 60 seconds. Do not change flags after issuance, do not call manual execution, and do not attempt a replay.

A future pass requires one server-controlled request/workflow that performs fresh gating, atomic authorization consumption, capacity admission, begin-attempt, and provider entry without client-controlled or propagation-controlled separation.

### D - After Execution and Flag Restoration

This checkpoint is unavailable because no provider attempt is authorized. If a future approved attempt occurs, accept it only after canary disabled and kill switch active are observed again; the authorization is consumed or expired; the exact claim is terminal; provider call count is at most one; and the audit/ledger evidence is internally consistent.

Fail: restore the two controls first, then read durable evidence. Never attempt to compensate with a second authorization, claim, or provider request.

## Expected Durable Deltas in a Future Authorized Attempt

| Outcome | Authorization | Claim | Audit and ledger | Provider |
| --- | --- | --- | --- | --- |
| Valid completion | issued then consumed once | `attempted -> completed` | one sanitized `bounded_manual_proof` audit and one ledger entry | exactly one request |
| Provider rejection or invalid response | issued then consumed once | `attempted -> failed`, retained | one failed sanitized audit and one ledger entry | exactly one attempted request |
| Timeout | issued then consumed once | `attempted -> failed`, retained | one timeout-safe audit and one ledger entry | one attempted request, bounded to five seconds |
| Internal failure before provider entry | issued then consumed only within the atomic workflow | `attempted -> failed`, `provider_attempted: false` | one failed sanitized audit and one ledger entry | zero requests |
| Authorization expiry | expired/rejected, never consumed | no claim | no audit or ledger | zero requests |
| Replay | consumed/expired/rejected record unchanged | no new claim | no additional audit or ledger | zero requests |

At the current no-go decision, every one of these durable deltas remains zero.

## Boundedness and Stop Conditions

The future attempt is bounded only when all of these remain true:

- exactly one active manual authorization, SHA-256 lookup only, with TTL no greater than 60 seconds;
- strict `AAPL`, `5min`, exactly 30-minute completed-window binding;
- a matching allocated non-reserve Action 565 workload with one executable normal-capacity credit;
- policy stays `377` total credits, `57` hard reserve, and `320` normal planned maximum;
- one provider request maximum, five-second timeout, and no retry;
- no active schedule or duplicate schedule signal;
- no execution-ready workload or reserve credit authorizes the request;
- consumption is followed only by the atomic server continuation, never a detached response or bearer token handoff;
- every begun attempt reaches a proven terminal claim state, never a dangling active claim.

Abort before provider entry when any static or immediate runtime recheck fails, including deployment or calendar mismatch, provider metadata not explicitly accepted, daily usage unavailable or exhausted, schedule signal present, binding mismatch, missing audit/ledger capability, canary control mismatch, failed/unknown claim admission, failed begin-attempt, or inability to prove deterministic finalization. Restore controls before collecting any other evidence.

## Evidence to Capture After a Future Attempt

Capture only sanitized facts:

- deployment commit/build marker and calendar verification status;
- readiness and preflight decisions, blockers, and daily usage before and after;
- authorization ID/status only, never raw token or token hash;
- claim ID/status, exact request fingerprint identifier, terminal timestamp, and `provider_attempted`;
- provider request count, safe outcome category, retry count, and bounded range/interval facts;
- audit receipt ID/entry kind and ledger source receipt ID/counts;
- final disabled/kill-active control observations and schedule-absence signals.

Never capture raw candles, provider URLs or payloads, API keys, authorization token material, stack traces, or database credentials.

## Required Next Action

Implement and deploy a narrowly scoped server-owned activation/issuance/execution workflow, or revise the issuance and execution gate contract so both states can be proven atomically without turning an authorization into a transferable permit. Then rerun this Action from Checkpoint A with a fresh baseline.
