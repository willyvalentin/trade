# ACTION 666JD — C-01 canonical execution-intent audit foundation

## Bounded objective

Deliver the smallest reproducible source foundation for C-01: one immutable,
owner-bound identity for a valid **semi-automatic, pre-broker** execution
intent, plus the matching append-only storage contract. The foundation closes
neither the durable-writer nor the broker-integration gate.

```text
action_id: ACTION_666JD / C01_CANONICAL_EXECUTION_INTENT_AUDIT_FOUNDATION
milestone_or_product_outcome: C-01 canonical execution identity and durable audit foundation
delivery_risk_reduced: an intent cannot be silently relabelled, overwritten, or confused with a broker result
unblocks: later separately reviewed server-owned audit writer design
authority_boundary: source-only; no database application, row write, route, runtime, provider, deploy, broker or production action
```

## Delivered source boundary

`lib/server/canonical-execution-intent-audit-contract.ts` accepts only an exact
`SEMI_AUTOMATIC_EXECUTION_AUTHORITY` intent with valid owner UUID, trigger /
action pairing, positive quantity, order-price consistency, required entry or
exit lineage, and a `null` broker result. It then normalizes a fixed semantic
payload, derives a SHA-256 digest, and uses that digest for both the canonical
intent identity and idempotency key. The returned candidate is deeply frozen
and always marked `prepared_not_persisted`.

The contract explicitly denies persistence, database reads and clients, routes,
broker preparation/calls/submission, and automatic execution. It has no
environment lookup, network call, Supabase client, or UI import.

The proposed schema independently rejects blank market codes, a trigger
priority that does not match its admitted trigger, and non-finite numeric
quantity or price values. This keeps the future durable boundary fail-closed
even if a later writer is malformed; it does not add that writer or apply the
migration.

`20260909100801_action_666jd_canonical_execution_intent_audit.sql` is a
**source-only, unapplied** forward migration. Its proposed relation is distinct
from `execution_records`: it represents immutable issuance before any broker
result exists. It requires owner binding, canonical identity/digest/idempotency
uniqueness, semi-automatic mode, trigger/action/lineage/price consistency and
a minimal envelope tied to the scalar columns. The table has RLS, zero
policies and revoked broad/application-role privileges; a trigger rejects every
update or delete. No writer, function caller, credential, route or deployment
is introduced.

## Verification and limits

The focused contract test proves deterministic normalization, identity and
idempotency derivation, deep immutability, and fail-closed rejection of
automatic, post-broker and lineage-incomplete inputs. It also statically
asserts the server-only, exact trigger/priority, finite numeric, market-code,
and zero-grant/zero-policy migration posture.

This action does **not** apply the migration, generate database types, create
an authenticated owner context, write or read an audit row, establish private
transport, prepare a broker form, invoke a broker, or change runtime behaviour.
Those are deliberately later gates. A future writer must be separately
reviewed, recompute the digest, use an authenticated server-owned owner context
over the approved private transport, prove rollback and independently read back
only the required identity/digest fields before any prepare-only integration is
considered.
