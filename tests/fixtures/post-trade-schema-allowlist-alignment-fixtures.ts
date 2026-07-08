import {
  postTradePersistenceAllowedFields,
  postTradePersistenceNeverPersistFields,
} from "./post-trade-persistence-payload-allowlist-fixtures";

export type PostTradeSchemaTableName =
  | "execution_confirmation_evidence"
  | "execution_settlement_reviews"
  | "execution_cost_breakdowns"
  | "execution_deviation_reviews"
  | "execution_learning_candidates"
  | "execution_redacted_artifacts";

export type PostTradeSchemaColumn = {
  columnName: string;
  payloadField: string;
  required: boolean;
  schemaOnlySafe?: boolean;
  nullable?: boolean;
};

export type PostTradeSchemaTableFixture = {
  tableName: PostTradeSchemaTableName;
  optional?: boolean;
  allowedColumns: readonly PostTradeSchemaColumn[];
  requiredColumns: readonly string[];
  forbiddenColumns: readonly string[];
  rlsRequired: true;
  writeGateRequired: true;
  productionWriteAllowed: false;
  rawArtifactStorageAllowed: false;
  learningAutoPromotionAllowed: false;
  serviceRoleClientAllowed: false;
  clientDirectWriteAllowed: false;
  rollbackRequired: true;
  redactionGateRequired: true;
  payloadAllowlistRequired: true;
  learningCandidateRules?: {
    stagedOnly: true;
    requiresSeparateLearningGate: true;
    automaticPromotionAllowed: false;
    blockedDeviationEligible: false;
    sensitiveDataEligible: false;
    partialFillRequiresManualReview: true;
    outcomeEligibleDefault: false;
  };
  artifactMetadataRules?: {
    metadataOnly: true;
    rawArtifactStorageAllowed: false;
    redactionStatusRequired: true;
    sensitiveDataPresent: false;
  };
};

const sharedSafeColumns = [
  { columnName: "id", payloadField: "id", required: true, schemaOnlySafe: true },
  { columnName: "created_at", payloadField: "createdAt", required: true, schemaOnlySafe: true },
  { columnName: "updated_at", payloadField: "updatedAt", required: false, schemaOnlySafe: true, nullable: true },
  { columnName: "internal_trade_id", payloadField: "internalTradeId", required: true },
  { columnName: "redaction_status", payloadField: "redactionStatus", required: true },
  { columnName: "sensitive_data_present", payloadField: "sensitiveDataPresent", required: true },
  { columnName: "manual_review_status", payloadField: "manualReviewStatus", required: true },
  { columnName: "source_type", payloadField: "sourceType", required: false, schemaOnlySafe: true },
  { columnName: "environment_label", payloadField: "environmentLabel", required: false, schemaOnlySafe: true },
  { columnName: "schema_version", payloadField: "schemaVersion", required: true, schemaOnlySafe: true },
  { columnName: "gate_version", payloadField: "gateVersion", required: true, schemaOnlySafe: true },
] as const satisfies readonly PostTradeSchemaColumn[];

const commonForbiddenSchemaColumns = [
  ...postTradePersistenceNeverPersistFields,
  "serviceRoleKey",
  "accessToken",
  "refreshToken",
  "orderSubmissionAuthority",
  "finalBuyAuthority",
  "finalSellAuthority",
  "brokerAuthority",
  "accountBinding",
  "liveOrderIntent",
  "liveTradeMutationAuthority",
  "livePositionMutationAuthority",
  "supabaseWriteAuthority",
  "productionPersistenceAllowed",
  "rawArtifactStored",
  "learningAutoUpdateAllowed",
  "learningAutoPromotionAllowed",
  "apiRouteActivation",
  "tradeUiExecution",
  "browserAutomation",
  "avanzaBridgeSession",
  "cookieSessionExport",
  "bankIdAutomation",
] as const;

export const postTradeSchemaExplicitSafeMetadataFields = [
  "id",
  "createdAt",
  "updatedAt",
  "sourceType",
  "environmentLabel",
  "schemaVersion",
  "gateVersion",
  "evidenceKind",
  "evidenceTimestamp",
  "brokerLabel",
  "deviationReviewId",
  "settlementReviewId",
  "fxImpact",
  "feeImpactPercent",
  "reasonCodes",
  "requiresManualReview",
  "blockedReason",
  "reviewedAt",
  "partialFillStatus",
  "duplicateConfirmationStatus",
  "artifactKind",
  "storageReferenceSafe",
] as const;

export const postTradeSchemaAllowedPayloadFieldSet = new Set<string>([
  ...postTradePersistenceAllowedFields,
  ...postTradeSchemaExplicitSafeMetadataFields,
]);

export const postTradeSchemaTableFixtures = [
  {
    tableName: "execution_confirmation_evidence",
    allowedColumns: [
      ...sharedSafeColumns,
      { columnName: "plan_id", payloadField: "planId", required: false, nullable: true },
      { columnName: "side", payloadField: "side", required: true },
      { columnName: "ticker", payloadField: "ticker", required: true },
      { columnName: "evidence_kind", payloadField: "evidenceKind", required: true, schemaOnlySafe: true },
      { columnName: "evidence_timestamp", payloadField: "evidenceTimestamp", required: true, schemaOnlySafe: true },
      { columnName: "redacted_artifact_id", payloadField: "redactedEvidenceArtifactId", required: false, nullable: true },
      { columnName: "broker_label", payloadField: "brokerLabel", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "deviation_review_id", payloadField: "deviationReviewId", required: false, schemaOnlySafe: true, nullable: true },
    ],
    requiredColumns: [
      "id",
      "created_at",
      "internal_trade_id",
      "side",
      "ticker",
      "evidence_kind",
      "evidence_timestamp",
      "redaction_status",
      "sensitive_data_present",
      "manual_review_status",
      "schema_version",
      "gate_version",
    ],
  },
  {
    tableName: "execution_settlement_reviews",
    allowedColumns: [
      ...sharedSafeColumns,
      { columnName: "plan_id", payloadField: "planId", required: true },
      { columnName: "contract_id", payloadField: "contractId", required: true },
      { columnName: "side", payloadField: "side", required: true },
      { columnName: "ticker", payloadField: "ticker", required: true },
      { columnName: "quantity", payloadField: "quantity", required: true },
      { columnName: "planned_price", payloadField: "plannedPrice", required: true },
      { columnName: "execution_price", payloadField: "executionPrice", required: true },
      { columnName: "slippage", payloadField: "slippage", required: true },
      { columnName: "currency", payloadField: "currency", required: true },
      { columnName: "gross_amount", payloadField: "grossAmount", required: true },
      { columnName: "settlement_amount", payloadField: "settlementAmount", required: true },
      { columnName: "commission", payloadField: "commission", required: true },
      { columnName: "fx_rate", payloadField: "fxRate", required: false, nullable: true },
      { columnName: "deviation_classification", payloadField: "deviationClassification", required: true },
      { columnName: "partial_fill_status", payloadField: "partialFillStatus", required: false, schemaOnlySafe: true },
      { columnName: "duplicate_confirmation_status", payloadField: "duplicateConfirmationStatus", required: false, schemaOnlySafe: true },
    ],
    requiredColumns: [
      "id",
      "created_at",
      "internal_trade_id",
      "plan_id",
      "contract_id",
      "side",
      "ticker",
      "quantity",
      "planned_price",
      "execution_price",
      "deviation_classification",
      "manual_review_status",
      "redaction_status",
      "sensitive_data_present",
      "schema_version",
      "gate_version",
    ],
  },
  {
    tableName: "execution_cost_breakdowns",
    allowedColumns: [
      { columnName: "id", payloadField: "id", required: true, schemaOnlySafe: true },
      { columnName: "created_at", payloadField: "createdAt", required: true, schemaOnlySafe: true },
      { columnName: "updated_at", payloadField: "updatedAt", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "settlement_review_id", payloadField: "settlementReviewId", required: true, schemaOnlySafe: true },
      { columnName: "commission", payloadField: "commission", required: true },
      { columnName: "fx_rate", payloadField: "fxRate", required: false, nullable: true },
      { columnName: "fx_impact", payloadField: "fxImpact", required: false, schemaOnlySafe: true },
      { columnName: "fee_impact_percent", payloadField: "feeImpactPercent", required: false, schemaOnlySafe: true },
      { columnName: "gross_amount", payloadField: "grossAmount", required: true },
      { columnName: "settlement_amount", payloadField: "settlementAmount", required: true },
      { columnName: "currency", payloadField: "currency", required: true },
      { columnName: "redaction_status", payloadField: "redactionStatus", required: true },
      { columnName: "sensitive_data_present", payloadField: "sensitiveDataPresent", required: true },
      { columnName: "schema_version", payloadField: "schemaVersion", required: true, schemaOnlySafe: true },
      { columnName: "gate_version", payloadField: "gateVersion", required: true, schemaOnlySafe: true },
    ],
    requiredColumns: [
      "id",
      "created_at",
      "settlement_review_id",
      "commission",
      "gross_amount",
      "settlement_amount",
      "currency",
      "redaction_status",
      "sensitive_data_present",
      "schema_version",
      "gate_version",
    ],
  },
  {
    tableName: "execution_deviation_reviews",
    allowedColumns: [
      { columnName: "id", payloadField: "id", required: true, schemaOnlySafe: true },
      { columnName: "created_at", payloadField: "createdAt", required: true, schemaOnlySafe: true },
      { columnName: "updated_at", payloadField: "updatedAt", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "settlement_review_id", payloadField: "settlementReviewId", required: true, schemaOnlySafe: true },
      { columnName: "deviation_classification", payloadField: "deviationClassification", required: true },
      { columnName: "reason_codes", payloadField: "reasonCodes", required: true, schemaOnlySafe: true },
      { columnName: "requires_manual_review", payloadField: "requiresManualReview", required: true, schemaOnlySafe: true },
      { columnName: "blocked_reason", payloadField: "blockedReason", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "reviewed_by_label", payloadField: "reviewedBySafeActorLabel", required: false, nullable: true },
      { columnName: "reviewed_at", payloadField: "reviewedAt", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "manual_review_status", payloadField: "manualReviewStatus", required: true },
      { columnName: "redaction_status", payloadField: "redactionStatus", required: true },
      { columnName: "sensitive_data_present", payloadField: "sensitiveDataPresent", required: true },
      { columnName: "schema_version", payloadField: "schemaVersion", required: true, schemaOnlySafe: true },
      { columnName: "gate_version", payloadField: "gateVersion", required: true, schemaOnlySafe: true },
    ],
    requiredColumns: [
      "id",
      "created_at",
      "settlement_review_id",
      "deviation_classification",
      "reason_codes",
      "requires_manual_review",
      "manual_review_status",
      "redaction_status",
      "sensitive_data_present",
      "schema_version",
      "gate_version",
    ],
  },
  {
    tableName: "execution_learning_candidates",
    allowedColumns: [
      { columnName: "id", payloadField: "id", required: true, schemaOnlySafe: true },
      { columnName: "created_at", payloadField: "createdAt", required: true, schemaOnlySafe: true },
      { columnName: "updated_at", payloadField: "updatedAt", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "settlement_review_id", payloadField: "settlementReviewId", required: true, schemaOnlySafe: true },
      { columnName: "learning_candidate_status", payloadField: "learningCandidateStatus", required: true },
      { columnName: "outcome_eligible", payloadField: "outcomeEligible", required: true },
      { columnName: "requires_separate_learning_gate", payloadField: "requiresSeparateLearningGate", required: true },
      { columnName: "blocked_reason", payloadField: "blockedReason", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "manual_review_status", payloadField: "manualReviewStatus", required: true },
      { columnName: "redaction_status", payloadField: "redactionStatus", required: true },
      { columnName: "sensitive_data_present", payloadField: "sensitiveDataPresent", required: true },
      { columnName: "schema_version", payloadField: "schemaVersion", required: true, schemaOnlySafe: true },
      { columnName: "gate_version", payloadField: "gateVersion", required: true, schemaOnlySafe: true },
    ],
    requiredColumns: [
      "id",
      "created_at",
      "settlement_review_id",
      "learning_candidate_status",
      "outcome_eligible",
      "requires_separate_learning_gate",
      "manual_review_status",
      "redaction_status",
      "sensitive_data_present",
      "schema_version",
      "gate_version",
    ],
    learningCandidateRules: {
      stagedOnly: true,
      requiresSeparateLearningGate: true,
      automaticPromotionAllowed: false,
      blockedDeviationEligible: false,
      sensitiveDataEligible: false,
      partialFillRequiresManualReview: true,
      outcomeEligibleDefault: false,
    },
  },
  {
    tableName: "execution_redacted_artifacts",
    optional: true,
    allowedColumns: [
      { columnName: "id", payloadField: "id", required: true, schemaOnlySafe: true },
      { columnName: "created_at", payloadField: "createdAt", required: true, schemaOnlySafe: true },
      { columnName: "updated_at", payloadField: "updatedAt", required: false, schemaOnlySafe: true, nullable: true },
      { columnName: "artifact_kind", payloadField: "artifactKind", required: true, schemaOnlySafe: true },
      { columnName: "redaction_status", payloadField: "redactionStatus", required: true },
      { columnName: "storage_reference_safe", payloadField: "storageReferenceSafe", required: true, schemaOnlySafe: true },
      { columnName: "sensitive_data_present", payloadField: "sensitiveDataPresent", required: true },
      { columnName: "schema_version", payloadField: "schemaVersion", required: true, schemaOnlySafe: true },
      { columnName: "gate_version", payloadField: "gateVersion", required: true, schemaOnlySafe: true },
    ],
    requiredColumns: [
      "id",
      "created_at",
      "artifact_kind",
      "redaction_status",
      "storage_reference_safe",
      "sensitive_data_present",
      "schema_version",
      "gate_version",
    ],
    artifactMetadataRules: {
      metadataOnly: true,
      rawArtifactStorageAllowed: false,
      redactionStatusRequired: true,
      sensitiveDataPresent: false,
    },
  },
] as const satisfies readonly Omit<PostTradeSchemaTableFixture, "forbiddenColumns" | "rlsRequired" | "writeGateRequired" | "productionWriteAllowed" | "rawArtifactStorageAllowed" | "learningAutoPromotionAllowed" | "serviceRoleClientAllowed" | "clientDirectWriteAllowed" | "rollbackRequired" | "redactionGateRequired" | "payloadAllowlistRequired">[];

export const postTradeSchemaAllowlistAlignmentFixtures: readonly PostTradeSchemaTableFixture[] =
  postTradeSchemaTableFixtures.map((table) => ({
    ...table,
    forbiddenColumns: commonForbiddenSchemaColumns,
    rlsRequired: true,
    writeGateRequired: true,
    productionWriteAllowed: false,
    rawArtifactStorageAllowed: false,
    learningAutoPromotionAllowed: false,
    serviceRoleClientAllowed: false,
    clientDirectWriteAllowed: false,
    rollbackRequired: true,
    redactionGateRequired: true,
    payloadAllowlistRequired: true,
  }));

export function getPostTradeSchemaColumnAlignmentViolations(
  table: PostTradeSchemaTableFixture,
) {
  const violations: string[] = [];
  const allowedColumnNames = new Set(table.allowedColumns.map((column) => column.columnName));

  for (const column of table.allowedColumns) {
    if (!postTradeSchemaAllowedPayloadFieldSet.has(column.payloadField)) {
      violations.push(`${table.tableName}.${column.columnName} maps to non-allowlisted field ${column.payloadField}`);
    }
    if (postTradePersistenceNeverPersistFields.includes(column.payloadField as never)) {
      violations.push(`${table.tableName}.${column.columnName} maps to never-persist field ${column.payloadField}`);
    }
    if (table.forbiddenColumns.includes(column.columnName)) {
      violations.push(`${table.tableName}.${column.columnName} is forbidden`);
    }
  }

  for (const requiredColumn of table.requiredColumns) {
    if (!allowedColumnNames.has(requiredColumn)) {
      violations.push(`${table.tableName}.${requiredColumn} is required but not allowed`);
    }
  }

  if (table.rlsRequired !== true) {
    violations.push(`${table.tableName} must require RLS`);
  }
  if (table.writeGateRequired !== true) {
    violations.push(`${table.tableName} must require write gate`);
  }
  if (table.productionWriteAllowed !== false) {
    violations.push(`${table.tableName} must block production writes`);
  }
  if (table.rawArtifactStorageAllowed !== false) {
    violations.push(`${table.tableName} must block raw artifact storage`);
  }
  if (table.learningAutoPromotionAllowed !== false) {
    violations.push(`${table.tableName} must block learning auto-promotion`);
  }
  if (table.serviceRoleClientAllowed !== false) {
    violations.push(`${table.tableName} must block service role client usage`);
  }
  if (table.clientDirectWriteAllowed !== false) {
    violations.push(`${table.tableName} must block client direct writes`);
  }
  if (table.rollbackRequired !== true) {
    violations.push(`${table.tableName} must require rollback`);
  }
  if (table.redactionGateRequired !== true) {
    violations.push(`${table.tableName} must require redaction gate`);
  }
  if (table.payloadAllowlistRequired !== true) {
    violations.push(`${table.tableName} must require payload allowlist`);
  }

  return violations;
}

export function assertPostTradeSchemaAllowlistAligned(
  table: PostTradeSchemaTableFixture,
) {
  const violations = getPostTradeSchemaColumnAlignmentViolations(table);

  if (violations.length > 0) {
    throw new Error(`Unsafe post-trade schema fixture: ${violations.join("; ")}`);
  }
}
