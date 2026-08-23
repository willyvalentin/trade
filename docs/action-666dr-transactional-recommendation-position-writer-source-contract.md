# Action 666DR — Transactional recommendation-to-position writer source contract

## Decision

Action 666DR closes only the bounded
`transactional_recommendation_to_position_writer_source_contract` objective.
It freezes the private server-writer interface and its required transaction
ordering for a later implementation. It adds no implementation, route,
migration bytes, database operation, queue worker, provider readback, broker
operation, client command or deployment.

The protected-main predecessor is merge
`535891413eeea61ab2cad879f21c7698447f9822`, tree
`b8a95318c149c0ea9549d664c1943222c20a2c97`. It follows Action 666DQ's
source-only transaction design and binds the frozen Action 655A command
contract as a source input only.

## Private writer boundary

A later writer has one closed conceptual input:
`AuthenticatedRecommendationPositionHandoffV1`. It contains the exact
`action_655a2_recommendation_position_command_v2` command and an authenticated
server owner scope. The owner scope is established before the writer is called;
it is never accepted from a client projection or reconstructed from a supplied
recommendation identity.

The writer requires one injected transaction capability with these conceptual
operations, all scoped to that authenticated owner:

1. begin one transaction and lock the exact durable recommendation UUID;
2. read and verify the locked UUID, version, recommendation identity and
   normative digest against the canonical command;
3. resolve the complete idempotency binding before creating a position;
4. reserve or verify the position identity and append position version `1` to
   the append-only history relation;
5. transition that same locked recommendation row to `taken`, link snapshots
   and append the audit event; and
6. commit all effects or roll back all effects before returning a result.

The capability is private server infrastructure, not a client import, browser
action, public RPC, worker trigger or service-role bypass. It may not expose a
method that writes one of the listed effects outside the same transaction.

## Closed result and retry contract

The writer accepts only the Action 655A idempotency binding: durable
recommendation UUID/version, recommendation identity, normative digest,
position identity and canonical command digest. It returns only one of
`created`, `replayed`, `conflict`, `recommendation_binding_conflict`,
`stale_recommendation_version`, `refused`, or `rolled_back`.

An exact repeat reads and returns the immutable stored original result. A
changed binding, missing durable UUID or substituted owner is fail-closed and
must not infer a result or create a new position. A later implementation must
not emit `created` until the transaction has committed; an exception or failed
commit returns only the closed rollback/failure outcome and leaves no partial
position, recommendation, snapshot or audit effect.

## Authority limit and next gate

There is no persistence implementation, SQL, database connection, runtime
wiring, credentials, provider adapter, broker transport or production release
authority in this Action. The next bounded objective is
`transactional_recommendation_to_position_writer_static_implementation_boundary`:
a separately reviewed source-only module boundary may encode this contract, but
cannot invoke it, apply database changes or activate a runtime path.
