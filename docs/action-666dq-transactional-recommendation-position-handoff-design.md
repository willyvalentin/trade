# Action 666DQ — Transactional recommendation-to-position handoff design

## Decision

Action 666DQ closes only the bounded
`transactional_recommendation_to_position_handoff_design` objective. It
freezes the transaction invariants that a later, independently reviewed
server-side writer must implement. It adds no route, migration bytes, database
operation, queue worker, provider readback, broker operation, client command or
deployment.

The protected-main predecessor is merge
`3480f52dc58ca8d17f165c49bc6adf483f95d6d1`, tree
`56ffdfa4f063a2951b15ebd1241c2bdc533d2fb1`. It follows the source-only
Action 666DP exit-queue design and uses the frozen Action 655A command contract
as a design input only.

## Frozen transaction boundary

A later server-owned transaction accepts only the exact closed
`action_655a2_recommendation_position_command_v2` command. It must:

1. authenticate and scope the request to one owner without accepting owner
   authority from a client projection;
2. lock the exact durable recommendation UUID and verify its UUID, positive
   version, canonical recommendation identity and normative digest against the
   command;
3. verify eligibility and exact canonical command bytes before reserving any
   position identity;
4. reserve or verify the exact position identity, create position version `1`,
   and atomically transition the same locked recommendation row to `taken`;
5. link the matching snapshots and append an audit event in the same
   transaction; and
6. either commit all effects or roll back every effect.

The idempotency identity binds the durable recommendation UUID/version,
recommendation identity, normative digest, position identity and canonical
command digest. An exact repeat may return only the immutable original
`replayed` result. Changed bytes or a changed bound identity return a closed
conflict, stale-version or refusal result without writes. A recommendation
identity alone never authorizes a handoff.

## Durable-version and queue boundary

Every authoritative position version must use the append-only
`public.position_version_history(position_id, owner_user_id, position_version)`
key. The mutable current position version remains only a compare-and-swap
predicate. This Action does not define its database foreign keys or apply any
schema; Action 666DP separately defines the later exit-queue migration shape.

The handoff creates an eligible position at version `1`; it neither creates an
exit-queue item nor invokes a queue worker. A later exit decision may create a
queue item only through its separate atomic `N` to `N + 1` boundary.

## Authority limit and next gate

There is no implementation, persistence writer, service-role bypass, client
mutation, scheduler, provider adapter, broker transport or production release
authority in this Action. The next bounded objective is
`transactional_recommendation_to_position_writer_source_contract`: a separately
reviewed source contract may specify an implementation boundary, but cannot run
it or apply database changes.
