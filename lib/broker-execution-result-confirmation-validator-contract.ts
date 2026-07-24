import type {
  AvanzaConfirmationEvidence,
  AvanzaConfirmationOrderSide,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import type { AvanzaConfirmationEvidenceValidationResult } from "@/lib/avanza-broker-confirmation-evidence-validator";
import type {
  BrokerResultSourceClassification,
  BrokerResultSourceClassificationRule,
} from "@/lib/broker-result-source-classification";
import type { BrokerResultSourceClassificationValidationResult } from "@/lib/broker-result-source-classification-validator";

export const BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION =
  "broker_execution_result_confirmation_validator_v1" as const;

export type BrokerExecutionResultConfirmationValidatorContractVersion =
  typeof BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION;

export const BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATION_STATUSES = [
  "confirmed_candidate",
  "rejected",
  "needs_review",
  "partial_fill_review",
  "unsupported",
] as const;

export type BrokerExecutionResultConfirmationValidationStatus =
  (typeof BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATION_STATUSES)[number];

export const BROKER_EXECUTION_RESULT_CONFIRMATION_REJECTION_REASONS = [
  "evidence_rejected",
  "evidence_needs_review",
  "source_not_confirmation_capable",
  "source_not_production_safe",
  "missing_handoff_fingerprint",
  "broker_reference_missing",
  "instrument_mismatch",
  "side_mismatch",
  "quantity_mismatch",
  "price_invalid",
  "timestamp_invalid",
  "provenance_missing",
  "partial_fill_ambiguous",
  "unsupported_broker",
  "automatic_mode_not_allowed",
] as const;

export type BrokerExecutionResultConfirmationRejectionReason =
  (typeof BROKER_EXECUTION_RESULT_CONFIRMATION_REJECTION_REASONS)[number];

export const BROKER_EXECUTION_RESULT_CONFIRMATION_WARNINGS = [
  "confidence_below_review_threshold",
  "account_context_missing",
  "optional_fee_missing",
  "optional_market_missing",
  "manual_review_required",
  "mapping_policy_missing",
  "persistence_not_attempted",
  "trade_mutation_not_attempted",
] as const;

export type BrokerExecutionResultConfirmationWarning =
  (typeof BROKER_EXECUTION_RESULT_CONFIRMATION_WARNINGS)[number];

export const BROKER_EXECUTION_RESULT_CONFIRMATION_MODES = [
  "semi_auto_manual_confirmed",
  "manual_confirmed",
] as const;

export type BrokerExecutionResultConfirmationMode =
  (typeof BROKER_EXECUTION_RESULT_CONFIRMATION_MODES)[number];

export type BrokerExecutionResultConfirmationInputMode =
  | BrokerExecutionResultConfirmationMode
  | "automatic";

export type BrokerExecutionResultConfirmationInstrumentExpectation = {
  ticker?: string | null;
  instrumentName?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  market?: string | null;
  currency?: string | null;
};

export type BrokerExecutionResultConfirmationPriceExpectation = {
  limitPrice?: number | null;
  expectedExecutionPrice?: number | null;
  currency?: string | null;
  tolerancePct?: number | null;
  source?: "handoff_payload" | "order_preview" | "manual_review" | null;
};

export type BrokerExecutionResultConfirmationBrokerAccountExpectation = {
  broker: "avanza";
  accountLabel?: string | null;
  accountType?: string | null;
  maskedAccountId?: string | null;
};

export type BrokerExecutionResultConfirmationPolicySnapshot = {
  contractVersion: BrokerExecutionResultConfirmationValidatorContractVersion;
  mode: BrokerExecutionResultConfirmationInputMode;
  sourceClassification: BrokerResultSourceClassification;
  sourcePolicyRule?: BrokerResultSourceClassificationRule | null;
  requiresValidEvidence: true;
  requiresFinalConfirmationOrAccountHistory: true;
  requiresBrokerReference: true;
  requiresHandoffFingerprint: true;
  requiresProductionSafeSource: true;
  allowsAutomaticMode: false;
  safeToPersistDefault: false;
  safeToMutateTradeDefault: false;
  mappingPolicyVersion?: string | null;
  reviewedAt?: string | null;
};

export type BrokerExecutionResultConfirmationFingerprintInputSummary = {
  handoffPayloadFingerprint?: string | null;
  evidenceFingerprint?: string | null;
  brokerOrderId?: string | null;
  orderNumber?: string | null;
  brokerConfirmationId?: string | null;
  fillId?: string | null;
  executionId?: string | null;
  brokerReference?: string | null;
  ticker?: string | null;
  instrumentName?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  side?: AvanzaConfirmationOrderSide | null;
  quantity?: number | null;
  price?: number | null;
  currency?: string | null;
  confirmationTimestamp?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  provenanceHash?: string | null;
};

export type BrokerExecutionResultConfirmationEvidenceSnapshotReference = {
  evidenceFingerprint?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  sourceType?: AvanzaConfirmationEvidence["sourceType"] | null;
  sourcePageFlowIdentifier?: string | null;
  sourceClassification?: BrokerResultSourceClassification | null;
  capturedTimestamp?: string | null;
  confirmationTimestamp?: string | null;
  validationStatus: AvanzaConfirmationEvidenceValidationResult["status"];
  validationRejectionReasons: AvanzaConfirmationEvidenceValidationResult["rejectionReasons"];
  validationWarnings: AvanzaConfirmationEvidenceValidationResult["warnings"];
};

export type BrokerExecutionResultConfirmationValidatorInput = {
  contractVersion: BrokerExecutionResultConfirmationValidatorContractVersion;
  requestedAt: string;
  broker: "avanza";
  mode: BrokerExecutionResultConfirmationInputMode;
  rawEvidence: AvanzaConfirmationEvidence;
  evidenceValidationResult: AvanzaConfirmationEvidenceValidationResult;
  sourceClassification: BrokerResultSourceClassification;
  sourceClassificationResult?: BrokerResultSourceClassificationValidationResult | null;
  intendedSide: AvanzaConfirmationOrderSide;
  intendedInstrument: BrokerExecutionResultConfirmationInstrumentExpectation;
  intendedQuantity?: number | null;
  intendedPrice?: BrokerExecutionResultConfirmationPriceExpectation | null;
  handoffPayloadFingerprint?: string | null;
  expectedAccountContext?: BrokerExecutionResultConfirmationBrokerAccountExpectation | null;
  mappingPolicyVersion?: string | null;
  policySnapshot?: BrokerExecutionResultConfirmationPolicySnapshot | null;
  metadata?: Record<string, unknown>;
};

export type BrokerExecutionResultConfirmationValidationResult = {
  contractVersion: BrokerExecutionResultConfirmationValidatorContractVersion;
  evaluatedAt: string;
  status: BrokerExecutionResultConfirmationValidationStatus;
  rejectionReasons: BrokerExecutionResultConfirmationRejectionReason[];
  warnings: BrokerExecutionResultConfirmationWarning[];
  policySnapshot: BrokerExecutionResultConfirmationPolicySnapshot;
  evidenceSnapshotReference: BrokerExecutionResultConfirmationEvidenceSnapshotReference;
  fingerprintInputSummary: BrokerExecutionResultConfirmationFingerprintInputSummary;
  sourceClassificationResult?: BrokerResultSourceClassificationValidationResult | null;
  safeToConvert: boolean;
  safeToPersist: false;
  safeToMutateTrade: false;
  brokerExecutionResultCreated: false;
  mapperRan: false;
  persistenceAttempted: false;
  tradeMutationAttempted: false;
  auditAppendAttempted: false;
  browserAutomationAttempted: false;
};

// Contract metadata only. This module does not implement validation,
// conversion, capture, persistence, audit append, trade mutation, browser
// automation, or Avanza behavior.
