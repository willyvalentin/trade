# Action 601 - Capture Sanitized Canonical Issuance Failure Evidence

## Scope

Action 601 authorized exactly one production issuance-only checkpoint. Manual
execution, provider work, claim admission, audit, ledger, usage, flag,
schedule, deployment, and retry actions were not authorized.

## Baseline

Immediately before the request, authenticated read-only production checks
reported:

- issuance readiness: `diagnostic_ready`;
- activation readiness: `ready_for_one_manual_canary_attempt`;
- no active authorization or lease;
- claims, audit rows, and ledger rows: `0`;
- daily usage: `0 / 0`;
- preflight blockers only `canary_disabled` and
  `canary_kill_switch_active`;
- canary disabled, kill switch active, and no remote schedule active.

## Single Issuance Result

One and only one canonical manual-authorization request was made. It returned:

```text
HTTP status: 503
terminal status: atomic_issuance_failed_before_execution
diagnostic code: issuance_response_version_unsupported
validation stage: authorization_contract
failed field: authorization.contract_version
```

The top-level response stated that semantic issuance validation failed. No raw
authorization token, lease ID, service key, header, sensitive URL, RPC result,
or credential hash was retained. No manual-execution request was constructed
or sent, and no issuance retry occurred.

## Containment

The issued pair was allowed to expire naturally. The final read-only production
readback returned `diagnostic_ready` with the active-pair guard clear. It also
confirmed:

- claims: `0`;
- audit rows: `0`;
- ledger rows: `0`;
- daily usage: `0 / 0`;
- provider calls: `0`;
- canary disabled, kill switch active, and schedule absent;
- no manual execution and no retry.

## Decision

`issuance_failure_diagnostic_captured`

The exact next investigation is the authorization object's emitted
`contract_version` at the route response boundary. The persisted table version
was previously verified, so this must be traced through the server-side
authorization record construction and sanitizer without weakening validation
or performing another production issuance.
