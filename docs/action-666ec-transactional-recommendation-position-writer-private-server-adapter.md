# Action 666EC — Transactional recommendation-to-position writer private server adapter

## Bounded objective

Implement `transactional_recommendation_to_position_writer_private_server_adapter_implementation`
after Action 666EB's protected-main authority decision. The immediate predecessor is
protected-main commit `9ba3ad61d191488fc411554e2f974513692a8f26`; its exact-main
verification run `32664222438` completed successfully.

## Delivered seam

The adapter is server-only and receives an authenticated server-owner context plus
an injected owner-bound command port. It validates the owner and command before
calling that port, exposes only `created`, `replayed`, `invalid`, or `failed`, and
normalizes a durable-port `reused` result to `replayed`.

The injected port remains responsible for the separately verified durable
requirements: one owner-bound transaction, a paired position/history effect,
durable idempotency, commit-visible result semantics, and failure atomicity. The
adapter intentionally does not certify the existing application position routine
as satisfying those requirements.

## Boundary retained

This commit has no database client, migration, SQL command, route, queue, UI
binding, runtime activation, provider call, broker operation, or deployment.
It produces no external effect and is an inert private seam until a separately verified,
owner-bound command port is bound through protected review.

## Next bounded objective

`transactional_recommendation_to_position_writer_owner_bound_command_port_integration`:
bind a concrete port only after its paired history effect and transaction atomicity
are proved against the current durable schema.
