# Action 666EP — Position-version lineage projection-contract v2 writer command-port admission preflight

## Decision

Action 666EP independently closes the read-only
`position_version_lineage_projection_contract_v2_writer_command_port_admission_preflight`
after Action 666EO's exact-main delivery. It checks the isolated staging catalog
only; it does not target production, select application data, apply DDL or DML,
bind a writer, backfill, change a grant or policy, or activate runtime.

The existing physical foundation is intact: the nullable v2 source and target
lineage fields have their expected types, the four marker checks remain present
and `NOT VALID`, position-version history remains RLS-protected and append-only,
and the three affected tables deny ordinary `anon` and `authenticated` table
privileges. The current v1 owner-bound routine also retains its fixed-search-path
service-role-only boundary.

## Fail-closed admission result

A concrete v2 command port is **not admitted**. The same boolean-only catalog
query confirms that no public routine is marker-aware and no public relation is
proven to contain the complete durable v2 idempotency binding. Extending or
reusing the v1 routine would therefore violate Action 666EO: it cannot prove
the v2 source marker, the immutable retry binding, or the required paired
position/history effect.

The outcome is intentionally a refusal, not an implementation instruction. A
future package must separately specify a new private routine and a durable
idempotency relation whose exact binding includes the server owner,
recommendation lineage, position identity, and canonical command digest. It
must still preserve the v1 route as non-v2 until a later reviewed delivery has
completed all of its own tests and catalog proof.

## Read-only evidence boundary

The query in
`docs/sql/action-666ep-position-version-lineage-projection-contract-v2-writer-command-port-admission-preflight.sql`
returns exactly one JSON object of catalog booleans. It returns neither a row
value nor an application identifier. It is executed only against isolated
staging and does not exercise a writer routine.

Current Supabase security guidance was also reviewed: a future
`SECURITY DEFINER` routine requires a fixed search path and explicit execution
restrictions. This action creates no such routine and changes no privilege.

## Next bounded objective

`position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_package_design`:
a source-only design for the exact private v2 routine and idempotency storage
package. It may not create SQL bytes, apply a migration, write data, bind a
route, refresh generated types, or target production.
