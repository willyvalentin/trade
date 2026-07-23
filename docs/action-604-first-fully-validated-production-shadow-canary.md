# Action 604 - First Fully Validated Production Shadow Canary

## Scope

Action 604 was explicitly authorized for one production manual-canary attempt.
It used the fixed server-bound AAPL, `5min`, 30-minute, `377 / 57 / 320`
contract. No flags, schedules, deployments, retries, or second attempt were
authorized.

## Phase A: Pre-Mutation Checkpoint

The immediate sanitized baseline passed all required checks:

- issuance readiness: `diagnostic_ready`;
- activation readiness: `ready_for_one_manual_canary_attempt`;
- preflight blockers: only `canary_disabled` and
  `canary_kill_switch_active`;
- active authorization and lease guard: clear;
- claims, audit rows, and ledger rows: `0`;
- daily usage: `0 / 0`;
- provider, calendar, planner, and exact policy readiness: true;
- completed request range: AAPL, `5min`, 30 minutes;
- canary disabled, kill switch active, and schedule inactive.

## One Authorized Sequence

Exactly one canonical manual-authorization POST returned HTTP `200`. Its
authorization and lease pair passed the strict canonical response contract in
ephemeral memory:

- authorization version:
  `continuous_intelligence_shadow_canary_manual_authorization_v1`;
- lease version: the expected manual-execution-lease version;
- identity, request binding, timestamp normalization, bounded TTL, deployment
  identity, and `377 / 57 / 320` policy: valid;
- both credentials initially issued, unconsumed, and unexpired.

Exactly one canonical manual-execution POST followed immediately. It made one
provider request and the provider result was successful with candles. Both
ephemeral credentials were cleared in the request harness's `finally` path
immediately after the response. No execution, issuance, provider, or
finalization retry occurred.

## Terminal Evidence

The execution route returned HTTP `502` with terminal execution status
`failed`. It proved finalization, but its durable audit persistence did not
succeed while its ledger persistence did:

- authorizations: one newly consumed; no active reusable pair remains;
- leases: one newly consumed; no active reusable pair remains;
- claims: exactly one, terminal `completed`, provider attempted, no active or
  attempted claim remaining;
- provider calls: exactly one;
- audit rows: `0`;
- ledger rows: `1`;
- ledger provider-request and estimated-credit totals: `1` and `1`;
- ledger policy values: exactly `377 / 57 / 320`;
- ledger result category: `provider_success_with_candles`;
- ledger records `durable_audit_persisted: false`.

This is a contained internal durability failure: the provider and claim path
completed, but the audit/ledger durable evidence is not internally symmetric.
The non-mutating preflight still reports `0 / 0` daily usage even though the
durable claim and ledger each record one admitted attempt; this readback
discrepancy requires separate diagnosis and was not corrected here.

## Safety State Afterward

- issuance readiness returned `diagnostic_ready` with the active-pair guard
  clear;
- activation readiness remained `ready_for_one_manual_canary_attempt`;
- canary remains disabled;
- kill switch remains active;
- schedule remains inactive;
- preflight is again blocked only by the two global safe defaults.

No raw token, lease ID, service credential, header, sensitive URL, raw RPC
payload, or credential hash was retained in this record.

## Decision

`first_live_canary_completed_with_terminal_internal_failure`
