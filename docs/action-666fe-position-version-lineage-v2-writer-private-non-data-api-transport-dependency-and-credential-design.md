# Action 666FE — V2 writer private non-Data-API transport dependency and credential design

## Bounded objective

Action 666FE closes only
`position_version_lineage_v2_writer_private_non_data_api_transport_dependency_and_credential_design`
after Action 666FD's protected-main merge and green exact-main verification.
It freezes the future direct PostgreSQL driver and contained server secret shape;
it does not install, configure or use either one.

## Frozen source design

The selected future runtime driver is the direct PostgreSQL protocol package
`pg@8.23.0`, locked exactly when a later source-installation action is admitted.
Its TypeScript-only companion will be `@types/pg@8.23.1`, also locked exactly
in that later action. This selection follows a read-only package-metadata check:
the chosen runtime release declares Node.js `>=16.0.0`, which is compatible
with the repository's Node.js 24 CI runtime. Neither package is present in the
current manifest or lockfile.

The future implementation location is
`lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts`.
It must begin with the server-only boundary and must never be imported by a
route, UI surface or client module. Its one future connection input is the
non-public server secret named
`TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL`. That name is a design
identifier only: this action neither provisions nor reads a value, and it does
not repurpose the existing Supabase client or its service-role material.

The future driver call is fixed now as the literal private V2 routine statement
with three positional bindings: authenticated server owner, opaque
recommendation reference and canonical command digest. SQL identifiers cannot
be interpolated. The digest construction, single-row cardinality and strict
created-or-replayed result decoding remain the exact Action 666FC contract;
they are not implemented here.

## Closed authority

This action is static design metadata. It adds no package or lockfile entry,
configuration, secret, client, pool, socket, connection, query, decoder,
adapter, route, UI, migration, data operation, deployment, provider call or
broker operation. The current V2 writer remains fail-closed and no production
authority is granted.

## Next bounded objective

`position_version_lineage_v2_writer_private_non_data_api_transport_dependency_lockfile_source_installation`:
apply the already frozen `pg` and type-companion package entries in an isolated
source change, with no secret provisioning, credential read, connection,
query, writer invocation or runtime binding.
