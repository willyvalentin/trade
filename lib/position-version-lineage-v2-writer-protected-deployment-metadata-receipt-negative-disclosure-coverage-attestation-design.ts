// Static coverage-attestation criteria only. This module has no provider,
// credential, network, environment, database, transport, route,
// receipt-issuance, attestation-issuance, or writer capability.

import {
  POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION,
} from "./position-version-lineage-v2-writer-protected-deployment-metadata-receipt-negative-disclosure-coverage-reconciliation";

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN_VERSION =
  "position_version_lineage_v2_writer_protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_design_v1" as const;

const reconciliation =
  POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_RECONCILIATION;

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_CRITERIA =
  Object.freeze([
    Object.freeze({
      criterionId: "all_schema_prohibited_disclosures_covered",
      expected: true,
      observed: reconciliation.uncoveredSchemaProhibitedDisclosures.length === 0,
    } as const),
    Object.freeze({
      criterionId: "all_vector_disclosures_explained",
      expected: true,
      observed: reconciliation.unexplainedVectorDisclosures.length === 0,
    } as const),
    Object.freeze({
      criterionId: "value_free_rejection_only",
      expected: true,
      observed:
        reconciliation.providerFreeOnly &&
        !reconciliation.sensitiveFixtureValuesPermitted &&
        !reconciliation.receiptIssuanceImplemented,
    } as const),
  ]);

export const POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_DESIGN =
  Object.freeze({
    coverageAttestationCriteriaDefined: true,
    attestationIssuanceImplemented: false,
    receiptIssuanceImplemented: false,
    criteria:
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_CRITERIA,
    criteriaSatisfied: Object.freeze(
      POSITION_VERSION_LINEAGE_V2_WRITER_PROTECTED_DEPLOYMENT_METADATA_RECEIPT_NEGATIVE_DISCLOSURE_COVERAGE_ATTESTATION_CRITERIA.every(
        (criterion) => criterion.observed === criterion.expected,
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
      "protected_deployment_metadata_receipt_negative_disclosure_coverage_attestation_witness_catalog_design" as const,
  } as const);
