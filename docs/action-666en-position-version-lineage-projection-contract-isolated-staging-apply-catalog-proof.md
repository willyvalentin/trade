# Action 666EN — Position-version lineage projection-contract isolated staging apply and catalog proof

## Decision

Action 666EN closes the bounded
`position_version_lineage_projection_contract_isolated_staging_apply_and_catalog_proof`
objective after Action 666EM's green protected-main delivery. It applies only
the reviewed Action 666EM source migration, identified by its immutable
SHA-256, to the isolated staging target after a read-only compatibility
preflight.

The staging catalog now has the two nullable
`recommendation_projection_contract text` marker columns with no defaults and
the four named checks in their designed `NOT VALID` state. The catalog proof
also confirms that every new check references the marker and pins its only
non-null value to `legacy_recommendation_normative_projection_v2`.

## Bounded execution record

The target was independently identified as the active isolated staging
environment before mutation. The preflight established that both tables
existed, their Action 666EE predecessor tuples had the required nullable
physical shapes, and neither marker existed. The remote migration registry
then recorded the successful apply. The receipt deliberately publishes no
project identifier, connection detail, row, count, owner, payload or secret.

Only the reviewed additive DDL was applied. No table values were read or
written, no durable backfill, constraint validation, `NOT NULL` activation,
default, grant, RLS change, index, foreign key, generated-type refresh, runtime
wiring, deployment or provider/broker operation was performed. The production
database was not targeted.

## Closed authority and next bounded objective

This staging proof does not authorize a production apply or v2 writer. The next
bounded objective is
`position_version_lineage_projection_contract_v2_writer_command_port_design`:
define a separately reviewed, owner-bound server command-port design that can
write the complete v2 tuple atomically. It may not backfill existing rows,
activate a writer, apply further DDL, or change production until later gates
are separately satisfied.
