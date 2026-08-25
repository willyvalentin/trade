# Action 666FG — V2 writer private non-Data-API transport credential-provisioning and connection-admission preflight

## Bounded objective

Action 666FG closes only
`position_version_lineage_v2_writer_private_non_data_api_transport_credential_provisioning_and_connection_admission_preflight`
after Action 666FF's protected-main merge and green exact-main verification. It
records the conditions that must be independently reviewed before a connection
secret can be provisioned or read. It does not provision or read one.

## Static preflight decision

Action 666FF's exact `pg@8.23.0` and `@types/pg@8.23.1` source entries are
present, but the V2 writer still has no transport module, application import,
configuration read, client, pool or query. Its one future input remains the
already frozen non-public name
`TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL`.

If a later, separately authorized action provisions that named input, its
provenance must be a protected server-secret manager. A public environment
prefix, source-control value or reuse of existing Supabase client material is
not permitted. The future transport must be server-only and use a dedicated
least-privileged database role restricted to the fixed private V2 routine and
the already frozen positional command contract. This action does not inspect a
secret, establish a role, create a connection or verify an external system.

## Closed authority

This is a static, fail-closed preflight. It adds no configuration, secret,
transport module or application driver import. It does not provision or read a
credential; open a connection; execute a query or mutation; invoke the writer;
implement an adapter; bind a route or UI; contact a provider or broker; or
deploy production.

Connection admission and transport implementation remain denied until a later
review has confirmed the provisioned secret's scoped provenance without
revealing its value and has separately reviewed the transport source.

## Next bounded objective

No runtime successor is admitted by this fifteen-step sequence. Any secret
provisioning, connection admission or transport implementation requires a new,
separately reviewed roadmap action.
