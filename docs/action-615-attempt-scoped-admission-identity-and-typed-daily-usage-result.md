# Action 615 - Attempt-Scoped Admission Identity and Typed Daily Usage Result

## Root Cause

The manual lease admission function accepts caller-supplied claim and execution
identifiers. Earlier manual issuance bound those identifiers only to the UTC day
and canonical market request. Two separate server-issued authorization/lease
pairs for the same AAPL five-minute thirty-minute window therefore attempted to
insert the same daily-claim key. PostgreSQL reported a unique conflict, which
the RPC represented as `daily_usage_unavailable`.

The server persistence adapter did not recognize that valid sanitized RPC
status. It collapsed the response to generic `unavailable`, causing the manual
execution route to return HTTP 503 before provider entry.

## Change

Manual issuance now derives its binding identity from the already generated,
server-issued authorization ID. The manual execution route recomputes the same
identity from the requested authorization ID before reading or admitting the
pair. The identity has these invariants:

- Same authorization/lease attempt and canonical market request: same claim,
  execution, audit receipt, and ledger identity.
- Different authorization IDs: different manual claim and execution identity,
  even for an identical same-day request range and policy.
- Scheduled identity derivation is unchanged.
- Raw authorization tokens, lease IDs, client nonces, timestamps, and provider
  payloads are not used as identity discriminators.

`daily_usage_unavailable` is now an explicit recognized admission status. It
flows from the RPC response through the persistence adapter into the canonical
manual-execution response as `failure_category: daily_usage_unavailable` with
HTTP 503, matching the scheduled canary's established availability semantics.
It returns before runtime/provider execution, audit persistence, or
ledger persistence. Unknown statuses remain fail-closed as generic `unavailable`
with HTTP 503.

The durable audit mapper accepts the new bounded manual claim format while
retaining the legacy scheduled-style manual format for existing historical
receipts. In both cases it requires the receipt claim ID to match the canonical
execution ID; the new form additionally requires the server-issued
authorization-ID format.

## Migration Review

No migration is required. The existing admission RPC receives canonical claim
and execution IDs as arguments and the durable table constraints already accept
the bounded attempt-scoped values. Existing claims, receipts, audit rows, and
ledger rows are not modified or backfilled.

## Safety Boundaries

This change does not issue production credentials, invoke manual execution,
call a provider, write production claims/audits/ledgers, alter flags, or change
scheduling. The AAPL, 5min, thirty-minute, one-credit, and 377 / 57 / 320 policy
bounds remain enforced by the existing issuance and atomic admission path.
