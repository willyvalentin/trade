// Static coverage reconciliation only. This module reads no values and has no
// provider, credential, network, environment, database, transport, route,
// receipt-issuance, or writer capability.

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS,
} from "./position-version-lineage-v2-writer-protected-deployment-metadata-receipt-schema-and-negative-disclosure-contract";
import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS,
} from "./position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-test-vectors";

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION_VERSION =
  "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_reconciliation_v1" as const;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_REQUIRED_SCHEMA_VECTOR_COVERAGE =
  Object.freeze(
    POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS.map(
      (schemaProhibitedDisclosure) =>
        Object.freeze({
          schemaProhibitedDisclosure,
          vectorId: `reject_${schemaProhibitedDisclosure}`,
          covered: POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS.includes(
            schemaProhibitedDisclosure,
          ),
        } as const),
    ),
  );

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_ADDITIONAL_REQUIRED_NEGATIVE_DISCLOSURES =
  Object.freeze([
    "actor_identity",
    "exact_named_secret_reference",
  ] as const);

const schemaProhibitedDisclosures =
  POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_PROHIBITED_FIELDS;
const vectorDisclosures =
  POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_TEST_VECTORS;
const knownRequiredDisclosures = Object.freeze([
  ...schemaProhibitedDisclosures,
  ...POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_ADDITIONAL_REQUIRED_NEGATIVE_DISCLOSURES,
] as const);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION =
  Object.freeze({
    coverageReconciliationDefined: true,
    executableReceiptValidationImplemented: false,
    receiptIssuanceImplemented: false,
    schemaProhibitedDisclosures,
    vectorDisclosures,
    requiredSchemaVectorCoverage:
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_REQUIRED_SCHEMA_VECTOR_COVERAGE,
    additionalRequiredNegativeDisclosures:
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_ADDITIONAL_REQUIRED_NEGATIVE_DISCLOSURES,
    uncoveredSchemaProhibitedDisclosures: Object.freeze(
      schemaProhibitedDisclosures.filter(
        (schemaProhibitedDisclosure) => !vectorDisclosures.includes(schemaProhibitedDisclosure),
      ),
    ),
    unexplainedVectorDisclosures: Object.freeze(
      vectorDisclosures.filter(
        (vectorDisclosure) => !knownRequiredDisclosures.includes(vectorDisclosure),
      ),
    ),
    providerFreeOnly: true,
    sensitiveFixtureValuesPermitted: false,
    providerAuthenticationAdmitted: false,
    providerMetadataReadAdmitted: false,
    secretManagerMetadataReadAdmitted: false,
    databaseConnectionAdmitted: false,
    writerInvocationAdmitted: false,
    nextBoundedObjective:
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_design" as const,
  } as const);
