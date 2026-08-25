# Action 666FA — V2 Writer Generated-Types Provenance and Runtime-Binding Decision

## Bounded objective

Action 666FA closes only
`position_version_lineage_v2_writer_generated_types_provenance_refresh_and_runtime_binding_decision`
after Action 666EZ's ordinary protected-main delivery and successful exact-main
verification. It refreshes the repository's public generated TypeScript output
from one authorized, project-scoped, read-only type-generation response and
makes a fail-closed runtime-binding decision.

## Privacy-preserving type refresh

The response was accepted only after its envelope was exactly an object with a
single string `types` value. The envelope and extracted content were compared
in memory and are not retained. The repository output is instead bound by its
SHA-256 and Git blob hashes in the evidence receipt.

The refresh adds only the production-visible recommendation and position
lineage projection fields. The generated output contains neither the private
schema, the V2 private writer routine, nor its private receipt relation.

## Runtime-binding decision

The existing writer adapter remains a server-only, injected-port seam: it has
no database client and has no route, UI, queue or application binding. Because
the public generated output deliberately excludes the private writer surface,
this action does not bind that surface to the adapter or add any runtime path.

Any such binding requires a separate server-only command-port admission
preflight that proves the exact private RPC signature, service-role boundary,
owner propagation, durable receipt semantics and failure behavior. It must
remain separately reviewed before a concrete port, route or deployment is
introduced.

## Closed authority

This source delivery does not apply a migration, mutate database rows, invoke
the writer, backfill data, change grants or RLS, configure a provider, contact
a broker, add a route or UI binding, or publish a deployment.

## Next bounded objective

`position_version_lineage_v2_writer_private_command_port_runtime_binding_admission_preflight`:
perform a static, fail-closed admission preflight for a concrete private
server-only command-port implementation without invoking the writer or wiring
it into a route.
