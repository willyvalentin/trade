// Static preflight metadata only. It does not select a driver, resolve a
// credential, open a socket, call the private routine, or bind an adapter.

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT_VERSION =
  "position_version_lineage_v2_writer_private_non_data_api_transport_implementation_preflight_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_REQUIREMENTS =
  Object.freeze([
    "server_only_transport_module_boundary",
    "locked_direct_postgresql_protocol_dependency",
    "private_schema_non_data_api_call_capability",
    "dedicated_unexported_server_credential_containment",
    "fixed_parameter_binding_without_sql_identifier_interpolation",
    "action_666fc_exact_v2_parameter_digest_and_result_contract",
    "separate_review_before_transport_or_adapter_implementation",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_IMPLEMENTATION_PREFLIGHT =
  Object.freeze({
    action666fcSourceContractPresent: true,
    privateSchemaIsNonDataApi: true,
    existingServerSupabaseClientIsPresent: true,
    existingServerSupabaseClientIsNotThePrivateTransport: true,
    directPostgresqlProtocolDependencyPresent: false,
    directPostgresqlTransportModulePresent: false,
    transportCredentialSourceSelected: false,
    parameterBindingImplementationPresent: false,
    committedResultDecoderImplementationPresent: false,
    v2AdapterImplementationPresent: false,
    transportImplementationAdmitted: false,
    databaseOperationPresent: false,
    credentialReadOrConfigured: false,
    writerInvocationPresent: false,
    runtimeWiringPresent: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  } as const);
