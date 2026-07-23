# Action 611 - Attempt-Scoped Manual Canary Receipt Identity

## Decision

`attempt_scoped_manual_canary_receipt_identity_ready`

## Root-Cause Correction

Manual bounded-proof receipt identity is now derived from the admitted durable
execution identity, rather than only from the AAPL `5min` request window. The
canonical manual form is:

`manual_canary_receipt_<canonical execution id>`

The execution ID is deterministically bound to the UTC attempt day and the
canonical request fingerprint. The helper accepts it only when all of these
facts agree:

- the request fingerprint derived from the request;
- the lifecycle request fingerprint;
- the execution ID derived from that fingerprint and UTC day;
- the claim ID derived from that execution ID; and
- the expected claim contract version.

Missing or malformed claim identity fails closed before authorization and lease
admission. Raw authorization tokens, lease identifiers, client nonces,
provider response content, and standalone current timestamps do not contribute
to the identity.

## Durable Invariants

- The same admitted claim and canonical payload derive the same receipt ID and
  derived ledger entry ID on every retry.
- Different admitted claims derive different IDs even when ticker, interval,
  completed window, and policy are identical.
- Manual audit, claim finalization, and ledger persistence use the same
  attempt-scoped receipt identity.
- Ledger `generated_at` is derived from the receipt rather than persistence
  wall-clock time, so an exact retry compares equal to the existing ledger
  row.
- Scheduled-canary receipt identity remains unchanged and request-scoped.

## Historical Boundary

No migration or backfill is required. The Action 604 ledger row and Action 609
claim/audit remain immutable historical evidence. Future manual attempts use
the new attempt-scoped identity, preventing an old ledger row from being
mistaken for a retry of a later admitted claim.

## Validation Scope

Focused coverage proves Action 604-equivalent and Action 609-equivalent
attempts with the same AAPL `5min` 30-minute range persist separate audit and
ledger rows, while a repeat of one claim is idempotent. It also proves that a
malformed claim identity is rejected and that a conflicting receipt cannot
overwrite another attempt.

No production credentials, execution, provider call, claim, audit, ledger
write, flag change, schedule action, migration application, deployment, or
historical data mutation occurred for this action.
