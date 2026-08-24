# Action 666EQ — Position-version lineage projection-contract v2 writer storage and routine package design

## Decision

Action 666EQ closes the source-only
`position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_package_design`
objective after Action 666EP's green protected-main delivery. It freezes the
smallest future database package that can satisfy the refused v2-writer
admission without relaxing the existing v1 boundary. It creates no database
bytes, relation, routine, policy, grant, migration, generated type, route or
runtime binding.

The package reserves two identifiers only: the private routine
`write_owner_bound_recommendation_position_v2` and the durable receipt relation
`owner_bound_position_command_idempotency_v2`. These are design identifiers,
not names that exist in a database today. A later source-migration package must
use them consistently or deliberately supersede this design under a separate
review.

## Routine boundary and input ownership

The future routine accepts exactly three operational inputs from the existing
private server adapter: the authenticated server owner, an opaque
recommendation reference, and a server-canonical command digest. The routine
does not accept a recommendation version, identity, normative digest,
projection-contract marker or position identity as caller-selected authority.
It derives those members only from the locked owner-scoped recommendation.

The routine must be `SECURITY DEFINER`, execute only for the service-role
boundary, use an empty fixed search path with every relation explicitly
qualified, and permit no dynamic relation resolution. Ordinary `anon`,
`authenticated` and public execution remain denied. The server adapter retains
the v1 route as a non-v2 injected boundary; no current caller can reach the
reserved routine.

## Durable receipt design

Each future receipt is immutable after commit and is addressed by the pair
`authenticated_server_owner` and `canonical_command_digest`. That pair must be
unique so simultaneous attempts cannot create two effects for one command.
The receipt retains the complete immutable binding:

- authenticated server owner and opaque recommendation reference;
- locked recommendation version, identity, normative digest and exact v2
  projection-contract marker;
- server-generated position identity and initial position version; and
- canonical command digest, committed outcome and the initial history identity.

The first lookup or reservation is made inside the same private transaction as
the position and history effect. If a committed receipt has every required
binding member equal to the locked v2 source and canonical command digest, the
routine returns only that committed result as a replay. A missing member,
different member, malformed digest, owner mismatch or uniqueness collision
that resolves to a non-equal receipt is a conflict or refusal. No retry may
infer lineage, overwrite a receipt, select a position identity or create a
second position.

## Required atomic sequence

The later implementation must preserve this order in one database invocation:

1. Obtain the owner solely from the authenticated server context and lock that
   owner's requested recommendation.
2. Refuse all-NULL, partial or non-v2 lineage tuples before reserving an effect.
3. Derive the complete immutable receipt binding from the locked source and
   obtain the owner-and-digest receipt key.
4. Replay only an exact committed receipt; otherwise reserve the new receipt,
   create the version-one position and append its initial owner-scoped history
   row.
5. Finalize the receipt with the server-generated effect identity and return a
   created result only after the transaction commits.

Any exception, including an effect failure or receipt mismatch, rolls back the
reservation, position and history together. A receipt is never observable as a
durable pending success, and no partial position or orphaned history row is
admitted.

## Closed authority and next bounded objective

This is a package design receipt, not a database admission. It performs no
database query, DDL, DML, migration, backfill, grant or RLS change, type
refresh, deployment, provider call, broker call or production targeting.

The next bounded objective is
`position_version_lineage_projection_contract_v2_writer_command_port_storage_and_routine_source_migration_package`:
immutable source migration bytes for this exact private package. It may create
only reviewed source bytes; applying them, binding a writer, writing rows,
backfilling, changing runtime behavior and targeting production remain separate
gates.
