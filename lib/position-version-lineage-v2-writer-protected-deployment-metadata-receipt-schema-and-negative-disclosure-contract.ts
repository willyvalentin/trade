// Static schema only. This module has no provider, credential, network,
// database, transport, route, or writer capability and cannot issue receipts.

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT_VERSION =
  "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_schema_and_negative_disclosure_contract_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PERMITTED_FIELDS =
  Object.freeze([
    "schema_version",
    "receipt_identifier",
    "event_time_utc",
    "authenticated_actor_class",
    "provider_project_binding_digest",
    "principal_authority_class",
    "named_secret_scope_class",
    "metadata_presence_class",
    "policy_revision",
    "revocation_reference",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS =
  Object.freeze([
    "secret_value",
    "raw_secret_metadata",
    "raw_secret_name",
    "provider_project_identifier",
    "authentication_token",
    "environment_variable_set",
    "connection_string",
    "database_result",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_SCHEMA_AND_NEGATIVE_DISCLOSURE_CONTRACT =
  Object.freeze({
    receiptSchemaDefined: true,
    schemaIssuanceImplemented: false,
    permittedFields:
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PERMITTED_FIELDS,
    prohibitedFields:
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS,
    exactNamedSecretReferenceAllowedInReceipt: false,
    providerProjectIdentifierAllowedInReceipt: false,
    actorIdentityAllowedInReceipt: false,
    secretValueAllowedInReceipt: false,
    negativeDisclosureVectorsRequired: true,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_test_vector_design" as const,
  } as const);
