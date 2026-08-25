# Action 666EV — V2 writer storage and foreign-key index production-apply decision and preflight

## Decision

Action 666EV closes only the bounded
`position_version_lineage_v2_writer_storage_and_foreign_key_index_production_apply_decision_and_preflight`
objective. It reads the production catalog once through a read-only aggregate
query and decides that the reviewed v2 storage/routine-plus-index package is
not eligible for a production-apply gate yet.

The protected-main predecessor is `9221a15141629f7e48e89b63fb9e928648be2213`.
Its exact push CI run `32795454927` completed successfully before the preflight
began.

## Aggregate-only production preflight

The production catalog retains the required base lineage fields, complete
append-only history shape, digest dependency and existing client-deny/RLS
boundaries. It has no previously applied private receipt, writer routine or
receipt foreign-key index. The remote migration ledger has no entry for either
reviewed writer/index source package.

The two nullable projection-contract markers required by the writer source
package are absent. That is an expected, fail-closed dependency gap: their
immutable additive source migration has only been proven in isolated staging,
not separately decided and applied in production. The readback returned only
booleans; no application-row content, identifier, owner, count, connection
detail or secret was returned or recorded.

## Closed authority and successor gate

Action 666EV applies no DDL/DML, invokes no writer, binds no runtime caller and
performs no backfill, generated-type refresh, grant/RLS change, deployment or
provider/broker operation. It does not normalize, alter or relax the missing
marker dependency.

The next bounded objective is
`position_version_lineage_projection_contract_marker_production_apply_decision_and_preflight`:
make a fresh aggregate-only production decision for the separately reviewed
nullable marker package. It may not apply DDL, backfill data, validate checks,
activate a writer or deploy. The v2 writer storage/routine-plus-index package
remains prohibited until that independent prerequisite is complete and its own
production preflight is rerun.
