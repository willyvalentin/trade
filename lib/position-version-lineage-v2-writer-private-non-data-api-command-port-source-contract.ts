// This is a source-only V2 boundary contract, not a database transport or adapter.
// It intentionally leaves credential resolution, digest construction, decoding, and
// writer invocation for separately reviewed successor work.

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION =
  "position_version_lineage_v2_writer_private_non_data_api_command_port_source_contract_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE =
  "private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_REQUIREMENTS =
  Object.freeze([
    "server_only_private_non_data_api_parameterized_routine_transport",
    "service_role_credential_containment_outside_client_and_route_surfaces",
    "exact_authenticated_owner_opaque_recommendation_digest_parameter_order",
    "deterministic_v2_canonical_digest_over_only_the_frozen_command_projection",
    "exactly_one_committed_private_routine_result_row",
    "strict_created_or_replayed_result_mapping_without_legacy_snapshot_fields",
    "separate_v2_adapter_and_runtime_binding_review_after_transport_delivery",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_DIGEST_PROJECTION =
  Object.freeze({
    algorithm: "sha256" as const,
    encoding: "lowercase_hex" as const,
    serialization: "utf8_json_object_with_lexically_sorted_keys" as const,
    fields: Object.freeze([
      "contract_version",
      "routine_signature",
      "authenticated_server_owner",
      "opaque_recommendation_reference",
    ] as const),
  } as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING =
  Object.freeze({
    rowCardinality: "exactly_one" as const,
    wireColumns: Object.freeze([
      "disposition",
      "position_id",
      "position_version",
      "initial_history_identity",
    ] as const),
    permittedDispositions: Object.freeze(["created", "replayed"] as const),
    initialPositionVersion: 1 as const,
    initialHistoryIdentityFormat:
      "position_id:authenticated_server_owner:initial_position_version" as const,
    legacySnapshotLinkCountPermitted: false,
  } as const);

export type PositionVersionLineageV2WriterPrivateNonDataApiCommand = Readonly<{
  authenticatedServerOwner: string;
  opaqueRecommendationReference: string;
  canonicalCommandDigest: string;
}>;

export type PositionVersionLineageV2WriterPrivateNonDataApiCommittedResult = Readonly<{
  disposition: "created" | "replayed";
  positionId: string;
  positionVersion: 1;
  initialHistoryIdentity: string;
}>;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT =
  Object.freeze({
    contractVersion:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_SOURCE_CONTRACT_VERSION,
    routineSignature:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_ROUTINE_SIGNATURE,
    requirements:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_REQUIREMENTS,
    parameterOrder: Object.freeze([
      "authenticated_server_owner",
      "opaque_recommendation_reference",
      "canonical_command_digest",
    ] as const),
    digestProjection:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_DIGEST_PROJECTION,
    committedResultMapping:
      POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_COMMAND_PORT_RESULT_MAPPING,
    transportImplementationPresent: false,
    credentialContainmentImplementationPresent: false,
    canonicalDigestBuilderPresent: false,
    committedResultDecoderPresent: false,
    v2AdapterImplementationPresent: false,
    concreteCommandPortBindingPresent: false,
    databaseOperationPresent: false,
    writerInvocationPresent: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  } as const);
