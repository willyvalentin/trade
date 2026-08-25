# Action 666FB — V2 Writer Private Command-Port Runtime-Binding Admission Preflight

## Bounded objective

Action 666FB closes only
`position_version_lineage_v2_writer_private_command_port_runtime_binding_admission_preflight`
after Action 666FA's protected-main merge and successful exact-main
verification. It performs a static, fail-closed admission preflight for a
future concrete private server-only command port. It neither invokes the writer
nor connects a caller to it.

## Proven boundary and unresolved implementation conditions

Action 666EZ's recorded production catalog proof establishes that the private
V2 routine exists with its fixed empty search path and service-role execution
boundary. Action 666FA independently establishes that the public generated
types intentionally exclude that private surface, while the present injected
adapter remains an inert server-only V1 seam.

Those facts do not make a concrete port safe. The private schema is explicitly
non-Data-API, so a public-schema generated client cannot be repurposed for this
call. No reviewed, server-only, parameterized non-Data-API transport exists in
the repository. There is also no isolated credential-containment contract, no
deterministic V2 canonical command-digest builder, no strict decoder for the
private committed result, and no V2 adapter contract that can replace the
legacy V1 command shape without inventing fields such as a snapshot-link count.

The preflight therefore preserves the verified database boundary but marks the
concrete binding as not admitted. Owner propagation, opaque recommendation
authority, the exact three-argument call shape, immutable retry digest and
committed-result decoding must all be reviewed together before a runtime port
can be introduced.

## Closed authority

This is source-only metadata. It creates no database client, direct database
transport, credential configuration, RPC call, row read or write, migration,
grant or RLS change. It does not invoke the writer, backfill data, bind a route,
UI or queue, contact a provider or broker, or publish a deployment.

## Next bounded objective

`position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract`:
freeze a separately reviewed, source-only contract for the parameterized
server-only private transport, digest input and exact committed-result mapping.
That later contract must not create a client, read credentials, invoke the
writer or bind an application route.
