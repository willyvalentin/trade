# Action 603 - Verify Authorization Contract Version Mapping in Production

## Scope

Action 603 authorized exactly one production issuance-only checkpoint for the
canonical manual authorization route. Manual execution, provider work, claim
admission, audit and ledger writes, flag changes, schedule changes, deployment,
and issuance retry were outside scope.

## Baseline

Immediately before issuance, sanitized read-only production checks reported:

- issuance readiness: HTTP `200`, `diagnostic_ready`, with the active-pair
  guard clear;
- activation readiness: `ready_for_one_manual_canary_attempt`;
- preflight blockers: only `canary_disabled` and
  `canary_kill_switch_active`;
- daily usage: `0` runs and `0` estimated credits;
- claims, audit rows, and ledger rows: `0`;
- canary disabled, kill switch active, and schedule inactive.

## Single Issuance Result

One and only one canonical manual-authorization POST was made. The server-built
binding used the fixed AAPL, `5min`, 30-minute, `377 / 57 / 320` contract.

Sanitized result:

```text
HTTP status: 200
top-level code: issued
diagnostic code: none
validation stage: none
authorization.contract_version canonical: true
route strict validator accepted: true
complete canonical pair validates: true
timestamp TTL bounded: true
deployment identity canonical: true
```

The authorization version was exactly
`continuous_intelligence_shadow_canary_manual_authorization_v1`. The raw token
and lease identifier stayed only in ephemeral process memory and were cleared
in the request harness's `finally` path. No manual-execution request was sent.

## Containment

After the maximum credential lifetime elapsed, read-only verification reported:

- issuance readiness: HTTP `200`, `diagnostic_ready`, and active-pair guard
  clear;
- activation readiness: `ready_for_one_manual_canary_attempt`;
- claims, audit rows, and ledger rows: `0`;
- daily usage: `0 / 0`;
- preflight still blocked only by the two global safe defaults;
- `377` total, `57` hard reserve, and `320` normal planned maximum preserved;
- no provider call was executed by the non-mutating preflight and no durable
  execution evidence exists;
- canary disabled, kill switch active, and schedule inactive.

## Decision

`issuance_only_checkpoint_passed_canonical_pair_verified`
