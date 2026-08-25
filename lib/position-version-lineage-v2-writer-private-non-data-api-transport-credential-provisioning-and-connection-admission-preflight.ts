// Static preflight only. This module neither provisions nor reads a secret,
// imports the PostgreSQL driver, opens a connection, or invokes the writer.

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT_VERSION =
  "position_version_lineage_v2_writer_private_non_data_api_transport_credential_provisioning_and_connection_admission_preflight_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT_REQUIREMENTS =
  Object.freeze([
    "protected_server_secret_manager_provenance_only",
    "dedicated_non_public_connection_secret_name",
    "no_source_control_or_public_environment_secret_value",
    "no_existing_supabase_client_credential_reuse",
    "dedicated_least_privileged_private_routine_database_role",
    "server_only_transport_module_boundary_before_connection",
    "fixed_action_666fe_sql_and_action_666fc_command_contract",
    "separate_review_after_secret_provisioning_before_connection_or_writer_invocation",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PRIVATE_NON_DATA_API_TRANSPORT_CREDENTIAL_PROVISIONING_AND_CONNECTION_ADMISSION_PREFLIGHT =
  Object.freeze({
    action666ffExactDependencyLockfilePresent: true,
    selectedRuntimeDriver: "pg@8.23.0" as const,
    selectedTypeCompanion: "@types/pg@8.23.1" as const,
    containedConnectionSecret: Object.freeze({
      environmentVariableName:
        "TURE_POSITION_VERSION_LINEAGE_V2_WRITER_POSTGRES_URL" as const,
      expectedProvenance: "protected_server_secret_manager" as const,
      publicEnvironmentPrefixPermitted: false,
      sourceControlValuePermitted: false,
      existingSupabaseClientCredentialReusable: false,
      credentialProvisioned: false,
      credentialReadImplemented: false,
    }),
    futureConnectionAdmissionRequirements: Object.freeze({
      serverOnlyTransportModuleRequired: true,
      dedicatedLeastPrivilegedPrivateRoutineRoleRequired: true,
      fixedPrivateV2RoutineOnly: true,
      literalPositionalParameterOrderRequired: true,
      connectionOpened: false,
      databaseQueryOrMutationPresent: false,
    }),
    transportModuleImplemented: false,
    transportImplementationAdmitted: false,
    connectionAdmissionGranted: false,
    writerInvocationPresent: false,
    v2AdapterImplemented: false,
    runtimeWiringPresent: false,
    routeOrUiBindingPresent: false,
    providerOrBrokerContact: false,
    productionAuthorityGranted: false,
  } as const);
