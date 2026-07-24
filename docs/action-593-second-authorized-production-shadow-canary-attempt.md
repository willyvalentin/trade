# Action 593 - Second Authorized Production Shadow Canary Attempt

## Checkpoint A - Pre-Issuance Baseline

**Decision:** `checkpoint_a_passed_ready_for_single_atomic_issuance_and_execution`

This checkpoint was read-only. No authorization or lease was issued or consumed, no provider was called, and no claim, audit, ledger, flag, schedule, or deployment mutation occurred.

## Deployment and Identity

- Netlify production deployment state: `ready`.
- Deployed revision matches `7eb1f42440d7555041f68697a2d05157f3a640f5`.
- `TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` is present, canonical lower-case 40-character Git SHA, and matches that revision.
- The stable manual-authorization RPC contract remains deployed: `ci_mca_issue`, `ci_mca_consume`, and the read-only `ci_mca_readiness` probe. The canonical issuance route reached the stable probe successfully.

## Read-Only Gate Results

| Gate | Result |
| --- | --- |
| Canonical issuance readiness | HTTP `200`, `diagnostic_ready` |
| Activation readiness | HTTP `200`, `ready_for_one_manual_canary_attempt` |
| Preflight | HTTP `403` only because the safe defaults intentionally block execution |
| Preflight blockers | `canary_disabled`, `canary_kill_switch_active` only |
| Provider | Configured, `within_budget` |
| Calendar | Verified/current and a completed 30-minute range is derivable |
| Planner | One normal AAPL allocation authorized; reserve protected |
| Policy | `377` total, `57` hard reserve, `320` normal maximum |
| Schedule | All schedule signals absent; no schedule active |
| Schema/RPCs | Tables and lifecycle RPCs available with safe permissions |

The preflight request is exactly `AAPL`, `5min`, and a 30-minute window. Its daily usage was available at `0 / 0` and its planner authorization was present.

## Durable Baseline

Before and after the read-only Checkpoint A observations:

| Store | Count |
| --- | ---: |
| Manual authorizations | 0 |
| Manual execution leases | 0 |
| Daily claims | 0 |
| Durable audit rows | 0 |
| Credit-ledger rows | 0 |

Daily usage remains `0 / 0`. The canary remains disabled and the kill switch remains active. No duplicate or concurrent attempt is present.

## Atomic Issuance-and-Execution Result

**Decision:** `atomic_execution_admission_failed_before_provider`

Exactly one canonical manual-authorization request was made. It issued one authorization and one matching lease for the exact AAPL, `5min`, 30-minute, `377 / 57 / 320` contract and the expected deployment identity.

The immediately following single canonical manual-execution request returned HTTP `409` with sanitized failure category `authorization_preflight_blocked`. It did not admit a claim and did not enter the provider:

- provider call count: `0`;
- claims: `0`;
- audit rows: `0`;
- ledger rows: `0`;
- daily usage: `0 / 0`.

The raw authorization token and matching lease identifier were retained only in the one-shot process and cleared in its `finally` path immediately after the execution request returned. No retry was made.

After the maximum 60-second credential lifetime elapsed, read-only containment confirmed one authorization and one lease record remain unconsumed but expired. Their raw credential is no longer retained, so neither record provides a reusable execution path. No active or attempted claim exists, and the global canary/schedule defaults remain unchanged.

The execution route rejected the credential pair before the atomic admission RPC. A future diagnostic action must trace the specific authorization-binding preflight mismatch; it must not reuse this expired pair or issue another credential without separate authorization.
