// Static vector design only. These descriptors contain field classifications,
// never metadata values, and have no provider, credential, network, database,
// transport, route, receipt-issuance, or writer capability.

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS_VERSION =
  "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_test_vectors_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS =
  Object.freeze([
    "secret_value",
    "raw_secret_metadata",
    "raw_secret_name",
    "provider_project_identifier",
    "authentication_token",
    "environment_variable_set",
    "connection_string",
    "database_result",
    "actor_identity",
    "exact_named_secret_reference",
  ] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_VECTOR_CATALOG =
  Object.freeze(
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS.map(
      (prohibitedDisclosure) =>
        Object.freeze({
          vectorId: `reject_${prohibitedDisclosure}`,
          prohibitedDisclosure,
          expectedDisposition: "reject_without_receipt_issuance",
          providerFree: true,
          sensitiveFixtureValuePermitted: false,
          receiptIssued: false,
          providerAuthenticationInitiated: false,
          providerMetadataRead: false,
          secretManagerMetadataRead: false,
          environmentRead: false,
          databaseConnectionOpened: false,
          writerInvoked: false,
        } as const),
    ),
  );

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTOR_DESIGN =
  Object.freeze({
    vectorDesignDefined: true,
    executableReceiptValidationImplemented: false,
    receiptIssuanceImplemented: false,
    providerFreeOnly: true,
    sensitiveFixtureValuesPermitted: false,
    vectorCatalog:
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_VECTOR_CATALOG,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_reconciliation" as const,
  } as const);
