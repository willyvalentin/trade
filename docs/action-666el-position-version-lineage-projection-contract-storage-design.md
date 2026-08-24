# Action 666EL — Position-version lineage projection-contract storage design

## Decision

Action 666EL closes the bounded
`position_version_lineage_projection_contract_storage_design` objective after
Action 666EK. It designs, but does not create, the additive durable marker
needed to distinguish the separate v2 normative digest from legacy v1 lineage.
No migration source bytes, database query, database write, constraint
validation, type refresh, writer activation or deployment is authorized here.

The future additive package has exactly one marker name and type on each
lineage tuple:

| Relation | New nullable column | Type |
| --- | --- | --- |
| `public.recommendations` | `recommendation_projection_contract` | `text` |
| `public.positions` | `recommendation_projection_contract` | `text` |

The sole allowed non-null value is
`legacy_recommendation_normative_projection_v2`. A NULL marker identifies no
admissible durable lineage result; it is not an implied v1 value. The legacy
v1 digest contract remains immutable and may not be retroactively labelled,
rewritten or recomputed as v2.

## Future additive constraint transition

The later package must add both nullable columns and all four named `NOT VALID`
checks in one schema transaction, after exact catalog-shape preflight and
before any future writer or backfill gate:

1. `recommendations_recommendation_projection_contract_value_check` accepts
   NULL or only the v2 marker.
2. `recommendations_lineage_projection_contract_complete_check` accepts only
   an all-NULL four-member recommendation tuple, or a complete tuple whose
   marker is the v2 value and whose version, identity and digest are all
   non-NULL.
3. `positions_recommendation_projection_contract_value_check` accepts NULL or
   only the v2 marker.
4. `positions_lineage_projection_contract_complete_check` accepts only an
   all-NULL five-member position tuple, or a complete tuple whose marker is
   the v2 value and whose position version, durable recommendation version,
   identity and digest are all non-NULL.

The current Action 666EE tuple checks remain in place. The four new checks
must be added alongside them, not weakened, dropped or validated in that
future package. Together they make every new non-null durable tuple
unambiguously v2. A NULL, v1-labelled, mixed or unknown marker fails closed
for a future write; no default may silently choose a contract.

`NOT VALID` preserves the existing all-null legacy state while enforcing the
new constraint shape for future writes. Constraint validation, physical
`NOT NULL`, an index, a foreign key, a grant or policy adjustment remain
separate decisions. The package must retain both existing RLS settings and
client-grant denials; the marker introduces no client-visible API authority.

## Writer and retry boundary

The marker is copied only by a later server-side routine after it has locked an
owner-matching recommendation row and derived the v2 identity and digest from
that row. A position can be accepted as an idempotent retry only if its marker,
identity, digest, durable recommendation version and position version all
match the locked recommendation's v2 result. Cross-relation ownership cannot
be expressed by a row-local CHECK, so a check constraint must never be treated
as authorization for the copy.

No v1-to-v2 in-place upgrade is permitted. A pre-existing v1 or unmarked
complete tuple is a stop condition for the later writer and requires a new
separately reviewed remediation decision.

## Next bounded objective

`position_version_lineage_projection_contract_additive_migration_package` is
the next objective. It may create reviewed source migration bytes for this
design, but it may not apply them to staging or production, backfill a row,
validate a constraint, refresh generated types or activate a writer.
