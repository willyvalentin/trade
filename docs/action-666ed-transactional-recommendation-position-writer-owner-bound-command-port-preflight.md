# Action 666ED — Transactional recommendation-to-position writer owner-bound command-port preflight

## Bounded objective

Close `transactional_recommendation_to_position_writer_owner_bound_command_port_preflight`
after Action 666EC's protected-main private adapter. The exact predecessor is
protected-main commit `487ec4d71d5f8e5584be3007279cf3231aa5eea4`; exact-main
verification run `32668699813` completed successfully.

This action makes the integration decision explicit and fail-closed. A concrete
command port may not be connected to the private adapter merely because the
existing v1 routine is owner-scoped and service-role-only.

## Read-only parity result

The authorized production catalog and aggregate-only inventory confirm that the
existing `public.app_open_owned_position_transaction` v1 routine retains a
`security definer` boundary, a fixed `pg_catalog, public` search path, and
execution only for `service_role`. The empty append-only
`public.position_version_history` relation also exists.

The same readback proves the required durable command-port conditions are not
present:

- `recommendations` has no durable recommendation version, canonical identity,
  or normative digest columns;
- `positions` has no position version or copied durable recommendation lineage;
- the v1 routine writes no `position_version_history` row; and
- it consequently cannot prove one atomic current-position, history and
  recommendation-state effect.

The aggregate-only inventory recorded 1,068 recommendations, 8 positions, no
unlinked positions, no history rows, 8 taken recommendations and no open
positions. It returned no application-row contents or identifiers.

## Delivered admission boundary

`lib/transactional-recommendation-position-writer-owner-bound-command-port-preflight.ts`
turns that parity result into immutable source metadata. It retains the proven
security properties while setting the four missing durable conditions,
`existingV1CommandAdmissible`, and `concreteCommandPortBindingAdmitted` to
`false`.

It has no database client, RPC invocation, transaction, route, queue, provider
call, broker operation, deployment or runtime wiring. It is a guard against an
unsafe integration claim, not the integration itself.

## Next bounded objective

`position_version_lineage_additive_migration_package`: prepare the reviewed
source migration package that adds and backfills the missing owner-bound
recommendation and position lineage before a new v2 command port is considered.
The existing v1 routine remains the current application path until that later,
separately verified replacement is complete.
