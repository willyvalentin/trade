import type {
  AvanzaConfirmationEvidence,
  AvanzaConfirmationOrderSide,
  AvanzaPartialFillEvidence,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import type { AvanzaConfirmationEvidenceValidationResult } from "@/lib/avanza-broker-confirmation-evidence-validator";
import type { BrokerResultSourceClassification } from "@/lib/broker-result-source-classification";
import type {
  BrokerExecutionResultConfirmationFingerprintInputSummary,
  BrokerExecutionResultConfirmationValidationResult,
} from "@/lib/broker-execution-result-confirmation-validator-contract";
import type { BrokerExecutionResultCandidate } from "@/lib/broker-execution-result-candidate-contract";

export const EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_CONTRACT_VERSION =
  "evidence_to_broker_execution_result_mapper_v1" as const;

export type EvidenceToBrokerExecutionResultMapperContractVersion =
  typeof EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_CONTRACT_VERSION;

export const EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_STATUSES = [
  "mapped_candidate",
  "rejected",
  "needs_review",
  "partial_fill_review",
  "unsupported",
] as const;

export type EvidenceToBrokerExecutionResultMapperStatus =
  (typeof EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_STATUSES)[number];

export const EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_REJECTION_REASONS = [
  "confirmation_not_confirmed_candidate",
  "evidence_rejected",
  "evidence_needs_review",
  "source_not_mappable",
  "missing_handoff_fingerprint",
  "missing_broker_reference",
  "missing_required_field",
  "partial_fill_ambiguous",
  "unsupported_broker",
  "mapper_not_implemented",
] as const;

export type EvidenceToBrokerExecutionResultMapperRejectionReason =
  (typeof EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_REJECTION_REASONS)[number];

export const EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_WARNINGS = [
  "candidate_shape_draft_only",
  "optional_fee_missing",
  "optional_market_missing",
  "optional_account_context_missing",
  "partial_fill_mapping_policy_missing",
  "persistence_not_attempted",
  "trade_mutation_not_attempted",
] as const;

export type EvidenceToBrokerExecutionResultMapperWarning =
  (typeof EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_WARNINGS)[number];

export const EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_MODES = [
  "contract_preview",
  "manual_review_preview",
] as const;

export type EvidenceToBrokerExecutionResultMapperMode =
  (typeof EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_MODES)[number];

export type EvidenceToBrokerExecutionResultIntendedContext = {
  side?: AvanzaConfirmationOrderSide | null;
  ticker?: string | null;
  instrumentName?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  quantity?: number | null;
  expectedExecutionPrice?: number | null;
  currency?: string | null;
  handoffPayloadFingerprint?: string | null;
};

export type EvidenceToBrokerExecutionResultMapperInput = {
  contractVersion: EvidenceToBrokerExecutionResultMapperContractVersion;
  requestedAt: string;
  broker: "avanza";
  mode: EvidenceToBrokerExecutionResultMapperMode;
  rawEvidence: AvanzaConfirmationEvidence;
  evidenceValidationResult: AvanzaConfirmationEvidenceValidationResult;
  confirmationValidationResult: BrokerExecutionResultConfirmationValidationResult;
  sourceClassification: BrokerResultSourceClassification;
  handoffPayloadFingerprint?: string | null;
  intendedContext?: EvidenceToBrokerExecutionResultIntendedContext | null;
  metadata?: Record<string, unknown>;
};

export type EvidenceToBrokerExecutionResultMappedFieldName =
  | "broker_hint"
  | "status"
  | "captured_at"
  | "broker_order_id"
  | "submitted_at"
  | "filled_at"
  | "filled_quantity"
  | "average_fill_price"
  | "rejection_reason"
  | "cancellation_reason"
  | "raw_status"
  | "notes";

export type EvidenceToBrokerExecutionResultFieldMappingSnapshot = {
  field: EvidenceToBrokerExecutionResultMappedFieldName;
  evidencePath: string;
  required: boolean;
  mappedValuePreview?: string | number | boolean | null;
  confidence?: number | null;
  warning?: EvidenceToBrokerExecutionResultMapperWarning | null;
};

export type EvidenceToBrokerExecutionResultProvenanceSnapshot = {
  evidenceFingerprint?: string | null;
  sourceClassification: BrokerResultSourceClassification;
  sourceType: AvanzaConfirmationEvidence["sourceType"];
  sourcePageFlowIdentifier: string;
  captureMethod?: string | null;
  captureMode?: string | null;
  pageIdentity?: string | null;
  capturedAt?: string | null;
  confirmationTimestamp?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  handoffPayloadFingerprint?: string | null;
  confirmationStatus: BrokerExecutionResultConfirmationValidationResult["status"];
};

export type EvidenceToBrokerExecutionResultFingerprintContribution = {
  confirmationFingerprintInputSummary: BrokerExecutionResultConfirmationFingerprintInputSummary;
  mapperContributionFields: EvidenceToBrokerExecutionResultMappedFieldName[];
  sourceEvidenceFingerprint?: string | null;
  brokerReferenceFingerprintInput?: string | null;
  handoffPayloadFingerprint?: string | null;
  conversionFingerprintDraft?: string | null;
};

export type EvidenceToBrokerExecutionResultPartialFillMapping = {
  status: "not_partial" | "partial_fill_review" | "multiple_fill_review";
  sourcePartialFill?: AvanzaPartialFillEvidence | null;
  filledQuantity?: number | null;
  remainingQuantity?: number | null;
  averageFillPrice?: number | null;
  fillIds?: string[];
  mappingPolicyAvailable: false;
  requiresReview: boolean;
};

export type EvidenceToBrokerExecutionResultCandidateDraft = {
  broker_hint: "AVANZA";
  status?: "filled" | "partially_filled" | "rejected" | "cancelled" | "unknown";
  captured_at?: string | null;
  broker_order_id?: string | null;
  submitted_at?: string | null;
  filled_at?: string | null;
  filled_quantity?: number | null;
  average_fill_price?: number | null;
  rejection_reason?: string | null;
  cancellation_reason?: string | null;
  raw_status?: string | null;
  notes?: string[];
  metadata: {
    contractVersion: EvidenceToBrokerExecutionResultMapperContractVersion;
    draftOnly: true;
    notRuntimeBrokerExecutionResult: true;
    noPersistence: true;
    noTradeMutation: true;
  };
};

export type EvidenceToBrokerExecutionResultMapperResult = {
  contractVersion: EvidenceToBrokerExecutionResultMapperContractVersion;
  evaluatedAt: string;
  status: EvidenceToBrokerExecutionResultMapperStatus;
  rejectionReasons: EvidenceToBrokerExecutionResultMapperRejectionReason[];
  warnings: EvidenceToBrokerExecutionResultMapperWarning[];
  fieldMappingSnapshot: EvidenceToBrokerExecutionResultFieldMappingSnapshot[];
  provenanceSnapshot: EvidenceToBrokerExecutionResultProvenanceSnapshot;
  fingerprintContribution: EvidenceToBrokerExecutionResultFingerprintContribution;
  partialFillMapping: EvidenceToBrokerExecutionResultPartialFillMapping;
  mappedCandidateDraft?: EvidenceToBrokerExecutionResultCandidateDraft;
  mappedCandidate?: BrokerExecutionResultCandidate;
  safeToPersist: false;
  safeToMutateTrade: false;
  brokerExecutionResultCreated: false;
  mapperImplemented: boolean;
  persistenceAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
  browserAutomationAttempted: false;
};

// Mapper contract metadata only. This module does not implement mapping,
// conversion, BrokerExecutionResult creation, capture, persistence, audit
// append, trade mutation, UI wiring, browser automation, or Avanza behavior.
