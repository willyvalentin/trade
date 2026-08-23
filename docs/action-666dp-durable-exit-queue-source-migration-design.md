# Action 666DP — Durable exit-queue source-migration design

## Decision

Action 666DP closes only the bounded
`durable_exit_queue_source_migration_design` objective. It freezes the storage
shape and transaction preconditions that a later, independently reviewed
source migration must implement. It does not add migration bytes, execute a
database operation, create a queue, start a worker, read a provider, submit an
order, or activate runtime wiring.

The exact protected-main predecessor is merge
`a351b114aa8a1e96357036216db9ee1e1a21dc78`, tree
`08eabafbee40781b131297c0b584328e229d719e`. It follows the source-only
Action 666DO price-attestation boundary and preserves the Action 655A queue
state and attempt contract as a design input, not as an implementation grant.

## Frozen relation set

The later source migration has four logical relations:

1. `public.exit_queue_items` records one idempotent, decision-bound exit
   intent. Its durable identity is a server-generated queue item identifier;
   its natural uniqueness binds `position_id`, `owner_user_id`,
   `decision_position_version`, `decision_identity` and `decision_digest`.
2. `public.exit_queue_attempts` records the append-only attempt ordinal and
   lease tuple for one queue item. Its uniqueness binds the queue item and
   positive attempt ordinal.
3. `public.exit_queue_attempt_outcomes` records exactly one immutable outcome
   per attempt and may distinguish only the frozen retryable-failure and
   terminal-candidate classifications.
4. `public.exit_queue_cancellations` records at most one immutable
   cancellation for an eligible pending or retry-wait item. A conflicting
   retry is evidence, never a replacement of the first record.

Every relation is owner-bound. Every position version that carries authority
must reference the append-only
`public.position_version_history(position_id, owner_user_id, position_version)`
identity; the mutable `public.positions.position_version` remains a
compare-and-swap predicate only and is never a durable foreign-key target.

`exit_queue_items` carries both the decision position version `N` and the
reserved exit-pending version `N + 1`. A later server-owned transaction must
lock the owner-scoped current position at exactly `N`, verify the matching
history snapshot and decision binding, create the matching `N + 1` history
snapshot, update the current position to `exit_pending` at `N + 1`, and insert
the queue item atomically. This Action defines neither that writer nor a
transaction implementation.

## Invariants and containment

The source migration must preserve the Action 655A closed queue states:
`pending`, `leased`, `retry_wait`, `succeeded`, `failed_terminal` and
`cancelled`. It must preserve the closed transition graph, attempt ordinal
progression, immutable terminal behavior and cancellation applicability. A
terminal result, a lease, an attempt or a cancellation cannot be fabricated by
an idempotency retry.

All future relations must enable RLS, revoke direct table privileges from
`anon` and `authenticated`, and add no client policy or client write grant.
No source design authorizes a service-role bypass, queue worker, scheduler,
provider adapter, broker transport, order submission, route, client
projection, data backfill or deployment.

## Required later proof

Before a source migration is applied anywhere, reviewed SQL bytes and an
isolated staging proof must establish: idempotent duplicate handling;
cross-owner refusal; exact `N` to `N + 1` atomicity and rollback; history-key
foreign-key binding; invalid state and transition refusal; one-outcome-per-
attempt behavior; cancellation immutability; RLS and direct-grant denial; and
catalog verification of every key and index relation. Production application,
runtime wiring, provider readback and deployment remain separate authority
gates.

## Remaining gate

The next bounded objective is
`durable_exit_queue_source_migration_bytes`: it may introduce reviewed source
migration bytes only after exact relation names, constraints, transaction
boundaries and staging assertions are frozen. It cannot apply those bytes.
