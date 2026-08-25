# Action 666FC — V2 writer private non-Data-API command-port source contract

## Bounded objective

Action 666FC closes only
`position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract`
after Action 666FB's protected-main merge and green exact-main verification. It
freezes the source contract that a future private server-only transport must
meet; it does not select or implement a transport.

## Frozen private call boundary

The sole routine is
`private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)`. Its
parameter order is fixed as authenticated server owner, opaque recommendation
reference, and canonical command digest. The owner and opaque reference are
the only caller-supplied authorities: recommendation lineage, eligibility,
position data and current state remain derived and locked inside the private
routine.

The canonical digest projection is limited to the contract version, routine
signature, authenticated owner and opaque recommendation reference. A future
builder must serialize those keys in lexical order as UTF-8 JSON and return a
lowercase SHA-256 hex digest. It may not fold in a client-supplied price,
ticker, mutable recommendation field, credential, route input or unreviewed
metadata.

The private routine must yield exactly one committed result row. Its only wire
columns are `disposition`, `position_id`, `position_version` and
`initial_history_identity`; disposition is `created` or `replayed`, position
version is exactly one, and the history identity is
`position_id:authenticated_server_owner:initial_position_version`. The V2
mapping intentionally has no legacy snapshot-link count.

## Closed authority

The delivered TypeScript is immutable contract metadata and type declarations.
It constructs no database client or non-Data-API transport, reads no
credential, hashes no command, decodes no live result and invokes no writer.
It adds no migration, grant, RLS policy, route, UI, queue, data mutation,
provider/broker operation or deployment. Concrete command-port binding remains
fail-closed until the transport, credential-containment, digest-builder,
decoder and V2-adapter implementations receive separate review.

## Next bounded objective

`position_version_lineage_v2_writer_private_non_data_api_transport_implementation_preflight`:
separately review the implementation inputs for the fixed private transport and
service-role credential containment. That successor may not read a credential,
open a transport, invoke the writer or bind an application route.
