# Action 666ES — V2 writer isolated staging apply and catalog proof

## Decision

Action 666ES closes the bounded
`position_version_lineage_projection_contract_v2_writer_command_port_source_migration_isolated_staging_apply_and_catalog_proof`
objective after Action 666ER's green protected-main delivery. It applies the
reviewed Action 666ER source migration, identified by its immutable SHA-256,
once to the isolated staging target after a read-only compatibility preflight.

The staging catalog now contains the private owner-and-digest receipt relation
and the service-role-only v2 writer routine. The proof confirms the receipt's
RLS, keys, owner-bound foreign keys, direct-access revocations, routine
security-definer setting, empty fixed search path, and service-role-only
execution boundary. The routine was created but not invoked.

## Bounded execution record

The target was independently identified as the active isolated staging
environment before mutation. The preflight established that the required
predecessor relations and v2 lineage shapes existed, the cryptographic
dependency was present, and neither reserved v2 object existed. The remote
migration registry then recorded the successful apply. This receipt publishes
no target identifier, connection detail, row, count, owner, payload or secret.

Only the reviewed migration was applied to staging. Its stored routine contains
transactional DML for a future service caller, but this action did not invoke
the routine: no row value was read or written, no receipt, position, history or
recommendation state changed, and no generated types, runtime wiring,
deployment or provider/broker operation occurred. Production was not targeted.

## Review outcome and next bounded objective

The catalog's information-level RLS-without-policy advisory is intentional for
the private deny-by-default receipt: direct table access is revoked for all
application roles and the only executable routine is service-role-only. The
catalog also reports a foreign-key-index advisory for the new private receipt
relationship. That performance finding keeps production promotion closed.

The next bounded objective is
`position_version_lineage_v2_writer_receipt_foreign_key_index_source_migration_package`:
prepare a separately reviewed additive source-only index migration. It may not
apply to either environment, bind the runtime command port, invoke the writer,
backfill, or deploy.
