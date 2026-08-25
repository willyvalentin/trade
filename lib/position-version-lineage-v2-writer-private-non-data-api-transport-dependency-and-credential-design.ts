// Static source design only. This module does not import a driver, read
// configuration, create a pool, open a connection, or invoke the writer.

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN_VERSION =
  "position_version_lineage_v2_writer_private_non_data_api_transport_dependency_and_credential_design_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN_REQUIREMENTS =
  Object.freeze([
    "one_locked_server_only_direct_postgresql_protocol_driver",
    "dedicated_non_public_postgresql_connection_secret_boundary",
    "fixed_private_v2_routine_sql_and_positional_parameter_order",
    "action_666fc_digest_and_committed_result_contract_remains_unchanged",
    "separate_review_before_dependency_installation_or_secret_provisioning",
    "separate_review_before_connection_or_v2_adapter_implementation",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_DEPENDENCY_AND_CREDENTIAL_DESIGN =
  Object.freeze({
    selectedRuntimeDriver: Object.freeze({
      packageName: "pg" as const,
      exactVersionToLock: "8.23.0" as const,
      protocol: "postgresql" as const,
      serverOnly: true,
      dependencyInstalled: false,
    }),
    selectedTypeCompanion: Object.freeze({
      packageName: "@types/pg" as const,
      exactVersionToLock: "8.23.1" as const,
      dependencyInstalled: false,
    }),
    plannedServerOnlyModulePath:
      "lib/server/position-version-lineage-v2-writer-private-postgresql-transport.ts" as const,
    containedConnectionSecret: Object.freeze({
      environmentVariableName:
        "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL" as const,
      publicEnvironmentPrefixPermitted: false,
      sourceControlValuePermitted: false,
      existingSupabaseClientCredentialReusable: false,
      provisioned: false,
      runtimeReadImplemented: false,
    }),
    plannedInvocation: Object.freeze({
      sqlText:
        "SELECT * FROM private.write_owner_bound_recommendation_position_v2($1::uuid, $2::uuid, $3::text)" as const,
      positionalParameters: Object.freeze([
        "authenticated_server_owner",
        "opaque_recommendation_reference",
        "canonical_command_digest",
      ] as const),
      identifierInterpolationPermitted: false,
      queryImplemented: false,
    }),
    action666fcContractPreserved: true,
    directPostgresqlDependencyPresentInManifest: false,
    transportModuleImplemented: false,
    databaseConnectionOpened: false,
    writerInvocationPresent: false,
    v2AdapterImplemented: false,
    routeOrUiBindingPresent: false,
    productionAuthorityGranted: false,
  } as const);
