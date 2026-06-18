import type {
  AvanzaAccountContextEvidence,
  AvanzaBrokerReferenceEvidence,
  AvanzaConfirmationEvidence,
  AvanzaConfirmationEvidenceFieldConfidenceMap,
  AvanzaConfirmationOrderSide,
  AvanzaPartialFillEvidence,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import type { AvanzaConfirmationEvidenceValidationResult } from "@/lib/avanza-broker-confirmation-evidence-validator";
import type { BrokerResultSourceClassification } from "@/lib/broker-result-source-classification";
import type {
  BrokerExecutionResultConfirmationFingerprintInputSummary,
  BrokerExecutionResultConfirmationValidationResult,
  BrokerExecutionResultConfirmationWarning,
} from "@/lib/broker-execution-result-confirmation-validator-contract";
import type {
  EvidenceToBrokerExecutionResultFieldMappingSnapshot,
  EvidenceToBrokerExecutionResultMappedFieldName,
  EvidenceToBrokerExecutionResultMapperContractVersion,
  EvidenceToBrokerExecutionResultMapperWarning,
  EvidenceToBrokerExecutionResultProvenanceSnapshot,
} from "@/lib/evidence-to-broker-execution-result-mapper-contract";

export const BROKER_EXECUTION_RESULT_CANDIDATE_CONTRACT_VERSION =
  "broker_execution_result_candidate_v1" as const;

export type BrokerExecutionResultCandidateContractVersion =
  typeof BROKER_EXECUTION_RESULT_CANDIDATE_CONTRACT_VERSION;

export const BROKER_EXECUTION_RESULT_CANDIDATE_STATUSES = [
  "confirmed_candidate",
  "needs_review",
  "partial_fill_review",
  "unsupported",
] as const;

export type BrokerExecutionResultCandidateStatus =
  (typeof BROKER_EXECUTION_RESULT_CANDIDATE_STATUSES)[number];

export const BROKER_EXECUTION_RESULT_CANDIDATE_BROKERS = ["avanza"] as const;

export type BrokerExecutionResultCandidateBroker =
  (typeof BROKER_EXECUTION_RESULT_CANDIDATE_BROKERS)[number];

export const BROKER_EXECUTION_RESULT_CANDIDATE_WARNINGS = [
  "candidate_contract_only",
  "optional_account_context_missing",
  "optional_market_missing",
  "optional_fee_missing",
  "partial_fill_requires_review",
  "confirmation_mapper_not_implemented",
  "persistence_not_attempted",
  "trade_mutation_not_attempted",
] as const;

export type BrokerExecutionResultCandidateWarning =
  (typeof BROKER_EXECUTION_RESULT_CANDIDATE_WARNINGS)[number];

export const BROKER_EXECUTION_RESULT_CANDIDATE_REVIEW_FLAGS = [
  "field_confidence_partial",
  "broker_reference_ambiguous",
  "instrument_identifier_partial",
  "price_source_requires_review",
  "timestamp_requires_review",
  "partial_fill_policy_missing",
  "source_provenance_requires_review",
  "handoff_fingerprint_missing",
] as const;

export type BrokerExecutionResultCandidateReviewFlag =
  (typeof BROKER_EXECUTION_RESULT_CANDIDATE_REVIEW_FLAGS)[number];

export type BrokerExecutionResultCandidateSource = {
  classification: BrokerResultSourceClassification;
  evidenceSourceType: AvanzaConfirmationEvidence["sourceType"];
  sourcePageFlowIdentifier: string;
  evidenceFingerprint?: string | null;
  captureId?: string | null;
  requestId?: string | null;
};

export type BrokerExecutionResultCandidateInstrument = {
  instrumentName: string;
  ticker?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  market?: string | null;
  venue?: string | null;
  instrumentType?: string | null;
};

export type BrokerExecutionResultCandidateExecution = {
  side: AvanzaConfirmationOrderSide;
  quantity: number;
  orderType?: string | null;
  brokerStatus?: AvanzaConfirmationEvidence["orderStatus"] | null;
  rawStatus?: string | null;
};

export type BrokerExecutionResultCandidatePrice = {
  executionPrice: number;
  currency: string;
  priceFieldType: AvanzaConfirmationEvidence["price"]["fieldType"];
  rawLabel?: string | null;
  commission?: number | null;
  fee?: number | null;
  totalAmount?: number | null;
  settlementCashImpact?: number | null;
};

export type BrokerExecutionResultCandidateBrokerReferences =
  AvanzaBrokerReferenceEvidence & {
    brokerOrderId?: string | null;
    brokerConfirmationId?: string | null;
  };

export type BrokerExecutionResultCandidateProvenance = {
  source: BrokerExecutionResultCandidateSource;
  confirmationStatus: BrokerExecutionResultConfirmationValidationResult["status"];
  confirmationTimestamp: string;
  capturedTimestamp: string;
  captureMethod?: AvanzaConfirmationEvidence["provenance"]["captureMethod"] | null;
  captureMode?: AvanzaConfirmationEvidence["provenance"]["captureMode"] | null;
  pageIdentity?: AvanzaConfirmationEvidence["provenance"]["pageIdentity"] | null;
  evidenceValidationStatus?: AvanzaConfirmationEvidenceValidationResult["status"] | null;
  confirmationValidatorEvaluatedAt?: string | null;
  mapperContractVersion?: EvidenceToBrokerExecutionResultMapperContractVersion | null;
};

export type BrokerExecutionResultCandidateFieldMapping = {
  mappedFields: EvidenceToBrokerExecutionResultFieldMappingSnapshot[];
  fieldConfidence?: AvanzaConfirmationEvidenceFieldConfidenceMap | null;
  rawFieldMapPresent: boolean;
  rawSensitiveDataStored: false;
};

export type BrokerExecutionResultCandidateFingerprintInput = {
  confirmationFingerprintInputSummary: BrokerExecutionResultConfirmationFingerprintInputSummary;
  handoffPayloadFingerprint?: string | null;
  evidenceFingerprint?: string | null;
  brokerReferenceFingerprintInput?: string | null;
  candidateFingerprintDraft?: string | null;
  mapperContributionFields?: EvidenceToBrokerExecutionResultMappedFieldName[];
};

export type BrokerExecutionResultCandidatePartialFill = {
  status: "not_partial" | "partial_fill_review" | "multiple_fill_review";
  sourcePartialFill?: AvanzaPartialFillEvidence | null;
  filledQuantity?: number | null;
  remainingQuantity?: number | null;
  averageFillPrice?: number | null;
  fillTimestamp?: string | null;
  fillIds?: string[];
  requiresReview: boolean;
};

export type BrokerExecutionResultCandidateSafetyPolicy = {
  notExecutionRecord: true;
  notPersistenceApproval: true;
  notTradeMutationApproval: true;
  safeToPersist: false;
  safeToMutateTrade: false;
  brokerExecutionResultCreated: false;
  executionRecordCreated: false;
  persistenceAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
  browserAutomationAttempted: false;
};

export const BROKER_EXECUTION_RESULT_CANDIDATE_DEFAULT_SAFETY_POLICY = {
  notExecutionRecord: true,
  notPersistenceApproval: true,
  notTradeMutationApproval: true,
  safeToPersist: false,
  safeToMutateTrade: false,
  brokerExecutionResultCreated: false,
  executionRecordCreated: false,
  persistenceAttempted: false,
  tradeMutationAttempted: false,
  auditAppendAttempted: false,
  browserAutomationAttempted: false,
} as const satisfies BrokerExecutionResultCandidateSafetyPolicy;

export type BrokerExecutionResultCandidateAccountContext =
  AvanzaAccountContextEvidence;

export type BrokerExecutionResultCandidate = {
  contractVersion: BrokerExecutionResultCandidateContractVersion;
  status: BrokerExecutionResultCandidateStatus;
  broker: BrokerExecutionResultCandidateBroker;
  source: BrokerExecutionResultCandidateSource;
  sourceClassification: BrokerResultSourceClassification;
  brokerReferences: BrokerExecutionResultCandidateBrokerReferences;
  instrument: BrokerExecutionResultCandidateInstrument;
  execution: BrokerExecutionResultCandidateExecution;
  price: BrokerExecutionResultCandidatePrice;
  confirmationTimestamp: string;
  capturedTimestamp: string;
  provenance: BrokerExecutionResultCandidateProvenance;
  fieldMapping: BrokerExecutionResultCandidateFieldMapping;
  fingerprintInput: BrokerExecutionResultCandidateFingerprintInput;
  handoffPayloadFingerprint?: string | null;
  accountContext?: BrokerExecutionResultCandidateAccountContext | null;
  partialFill?: BrokerExecutionResultCandidatePartialFill | null;
  warnings: Array<
    | BrokerExecutionResultCandidateWarning
    | BrokerExecutionResultConfirmationWarning
    | EvidenceToBrokerExecutionResultMapperWarning
  >;
  reviewFlags: BrokerExecutionResultCandidateReviewFlag[];
  mapperProvenanceSnapshot?: EvidenceToBrokerExecutionResultProvenanceSnapshot | null;
  safetyPolicy: BrokerExecutionResultCandidateSafetyPolicy;
  metadata?: Record<string, unknown>;
};

// Contract metadata only. A BrokerExecutionResult candidate is not a runtime
// BrokerExecutionResult, not an execution record, not persistence approval, and
// not trade mutation approval. This module does not implement mapping,
// conversion, BrokerExecutionResult creation, execution-record creation,
// persistence, audit append, trade mutation, UI wiring, capture, browser
// automation, or Avanza behavior.
