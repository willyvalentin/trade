# Action 666FF — V2 writer private non-Data-API transport dependency lockfile source installation

## Bounded objective

Action 666FF closes only
`position_version_lineage_v2_writer_private_non_data_api_transport_dependency_lockfile_source_installation`
after Action 666FE's protected-main merge and green exact-main verification.
It applies the exact package selections already frozen by Action 666FE as one
manifest-and-lockfile source change.

## Installed source dependencies

The runtime manifest now pins the direct PostgreSQL protocol driver
`pg@8.23.0` exactly. The development-only manifest pins its type companion
`@types/pg@8.23.1` exactly. `package-lock.json` records both direct entries and
their resolved transitive package graph. The update was generated with npm's
package-lock-only mode, so it does not add a worktree-local runtime transport or
create a connection as part of this action.

The lockfile records `pg`'s declared Node.js compatibility of `>= 16.0.0`,
which remains compatible with the repository's Node.js 24 CI runtime. The
optional `pg-cloudflare` lock entry is merely the driver's declared optional
dependency; it is neither imported nor activated by the application. No native
`pg-native` package is installed.

## Closed authority

This action changes only `package.json`, `package-lock.json`, source evidence,
documentation and provider-free assertions. It does not add the planned
server-only transport module; import either package from application code; read
or provision a secret. No secret value is added or read. It also does not create
a pool, open a connection, execute a query;
construct or decode a V2 writer result; bind an adapter, route or UI; perform a
database operation; contact a provider or broker; or deploy production.

The planned secret name and literal private routine statement from Action 666FE
remain design facts only. The V2 writer stays fail-closed at runtime.

## Next bounded objective

`position_version_lineage_v2_writer_private_non_data_api_transport_credential_provisioning_and_connection_admission_preflight`:
separately review the non-public credential provenance and connection-admission
requirements before any secret is provisioned or read and before a transport
module can be implemented.
