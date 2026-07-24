import type {
  AvanzaAccountContextEvidence,
  AvanzaConfirmationOrderSide,
  AvanzaInstrumentEvidence,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import type { BrokerResultSourceClassification } from "@/lib/broker-result-source-classification";

export const TWO_STAGE_BROKER_EVIDENCE_CONTRACT_VERSION =
  "two_stage_broker_evidence_v1" as const;

export type TwoStageBrokerEvidenceContractVersion =
  typeof TWO_STAGE_BROKER_EVIDENCE_CONTRACT_VERSION;

export const BROKER_EVIDENCE_STAGES = [
  "immediate_readback",
  "final_settlement_note",
] as const;

export type BrokerEvidenceStage = (typeof BROKER_EVIDENCE_STAGES)[number];

export const BROKER_EVIDENCE_LIFECYCLE_STATUSES = [
  "pending_broker_confirmation",
  "immediate_readback_observed",
  "provisional_trade_registered",
  "final_note_pending",
  "final_note_available",
  "final_note_matched",
  "finalized",
  "needs_review",
  "final_note_missing",
  "final_note_mismatch",
] as const;

export type BrokerEvidenceLifecycleStatus =
  (typeof BROKER_EVIDENCE_LIFECYCLE_STATUSES)[number];

export const BROKER_EVIDENCE_MATCHING_STATUSES = [
  "not_attempted",
  "exact_match",
  "probable_match_requires_review",
  "duplicate_candidates_require_review",
  "mismatch_blocks_finalization",
  "missing_final_note",
] as const;

export type BrokerEvidenceMatchingStatus =
  (typeof BROKER_EVIDENCE_MATCHING_STATUSES)[number];

export const BROKER_EVIDENCE_MATCHING_REASONS = [
  "broker_match",
  "account_context_match",
  "instrument_name_match",
  "instrument_identifier_match",
  "side_match",
  "quantity_match",
  "trade_date_match",
  "execution_time_match",
  "price_within_tolerance",
  "handoff_payload_fingerprint_match",
  "note_reference_match",
  "transaction_type_match",
  "currency_match",
  "amount_or_commission_match",
  "broker_mismatch",
  "account_context_mismatch",
  "instrument_mismatch",
  "side_mismatch",
  "quantity_mismatch",
  "trade_date_mismatch",
  "execution_time_mismatch",
  "price_outside_tolerance",
  "currency_mismatch",
  "duplicate_final_note_candidate",
  "missing_required_matching_field",
] as const;

export type BrokerEvidenceMatchingReason =
  (typeof BROKER_EVIDENCE_MATCHING_REASONS)[number];

export const BROKER_EVIDENCE_FINALIZATION_STATUSES = [
  "not_allowed",
  "not_attempted",
  "blocked_pending_final_note",
  "blocked_needs_review",
  "blocked_mismatch",
  "blocked_duplicate_candidates",
  "ready_for_future_finalization_boundary",
] as const;

export type BrokerEvidenceFinalizationStatus =
  (typeof BROKER_EVIDENCE_FINALIZATION_STATUSES)[number];

export const BROKER_EVIDENCE_AGENT_CAPABILITIES = [
  "prepare_order_form",
  "wait_for_manual_confirmation",
  "collect_immediate_readback_read_only",
  "collect_final_note_read_only",
  "compare_evidence_read_only",
  "request_manual_review",
] as const;

export type BrokerEvidenceAgentCapability =
  (typeof BROKER_EVIDENCE_AGENT_CAPABILITIES)[number];

export const BROKER_EVIDENCE_MANUAL_BOUNDARIES = [
  "semi_auto_default",
  "manual_broker_confirmation_required",
  "automatic_final_confirmation_forbidden",
  "read_only_collection_only",
  "no_trade_mutation",
  "no_persistence",
] as const;

export type BrokerEvidenceManualBoundary =
  (typeof BROKER_EVIDENCE_MANUAL_BOUNDARIES)[number];

export const BROKER_EVIDENCE_MISSING_FIELDS = [
  "account_context",
  "instrument_name",
  "ticker",
  "isin",
  "instrument_id",
  "side",
  "quantity",
  "price",
  "currency",
  "transaction_timestamp",
  "source_page_identity",
  "handoff_payload_fingerprint",
  "note_reference_number",
  "business_date",
  "settlement_date",
  "print_date",
  "execution_time",
  "order_type",
  "market_or_venue",
  "commission",
  "consideration",
  "fx_rate",
  "total_amount",
] as const;

export type BrokerEvidenceMissingField =
  (typeof BROKER_EVIDENCE_MISSING_FIELDS)[number];

export const BROKER_EVIDENCE_PROVISIONAL_FIELDS = [
  "account_context_masked",
  "instrument_name",
  "ticker",
  "isin",
  "instrument_id",
  "side",
  "quantity",
  "visible_price",
  "visible_currency",
  "transaction_readback_timestamp",
  "source_page_identity",
  "handoff_payload_fingerprint",
  "final_note_pending",
] as const;

export type BrokerEvidenceProvisionalField =
  (typeof BROKER_EVIDENCE_PROVISIONAL_FIELDS)[number];

export const BROKER_EVIDENCE_FINALIZED_FIELDS = [
  "note_reference_number",
  "business_date",
  "settlement_date",
  "print_date",
  "instrument_name",
  "isin",
  "side",
  "quantity",
  "execution_price",
  "currency",
  "execution_time",
  "order_type",
  "market_or_venue",
  "commission",
  "consideration",
  "fx_rate",
  "total_amount",
  "account_context_masked",
  "provenance_source_reference",
] as const;

export type BrokerEvidenceFinalizedField =
  (typeof BROKER_EVIDENCE_FINALIZED_FIELDS)[number];

export const BROKER_EVIDENCE_REVIEW_FLAGS = [
  "immediate_readback_only",
  "final_note_pending",
  "final_note_missing",
  "final_note_mismatch",
  "duplicate_final_note_candidates",
  "partial_match_requires_review",
  "missing_official_fee_or_total",
  "missing_instrument_identifier",
  "missing_handoff_fingerprint",
  "account_context_ambiguous",
  "provenance_incomplete",
] as const;

export type BrokerEvidenceReviewFlag =
  (typeof BROKER_EVIDENCE_REVIEW_FLAGS)[number];

export const BROKER_EVIDENCE_WARNINGS = [
  "provisional_not_final_evidence",
  "final_note_not_matched",
  "final_note_does_not_imply_persistence",
  "safe_to_persist_false",
  "safe_to_mutate_trade_false",
  "safe_to_finalize_false",
  "automatic_mode_forbidden",
  "manual_broker_confirmation_required",
] as const;

export type BrokerEvidenceWarning = (typeof BROKER_EVIDENCE_WARNINGS)[number];

export type BrokerEvidenceSafetyPolicy = {
  safeToPersist: false;
  safeToMutateTrade: false;
  safeToFinalize: false;
  automaticModeAllowed: false;
  manualBrokerConfirmationRequired: true;
  captureImplementationEnabled: false;
  matchingImplementationEnabled: false;
  finalizationImplementationEnabled: false;
  executionRecordCreationEnabled: false;
  auditAppendEnabled: false;
  browserAutomationEnabled: false;
  policyReason: string;
};

export const TWO_STAGE_BROKER_EVIDENCE_DEFAULT_SAFETY_POLICY = {
  safeToPersist: false,
  safeToMutateTrade: false,
  safeToFinalize: false,
  automaticModeAllowed: false,
  manualBrokerConfirmationRequired: true,
  captureImplementationEnabled: false,
  matchingImplementationEnabled: false,
  finalizationImplementationEnabled: false,
  executionRecordCreationEnabled: false,
  auditAppendEnabled: false,
  browserAutomationEnabled: false,
  policyReason:
    "Two-stage broker evidence contracts are type-only and do not enable capture, matching, finalization, persistence, trade mutation, audit append, execution-record creation, browser automation, or Avanza behavior.",
} as const satisfies BrokerEvidenceSafetyPolicy;

export type BrokerEvidenceSourceReference = {
  sourceClassification: BrokerResultSourceClassification;
  sourcePageIdentity: string;
  sourcePageFlowIdentifier?: string | null;
  sourceReferenceLabel?: string | null;
  capturedAt?: string | null;
  evidenceFingerprint?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  handoffPayloadFingerprint?: string | null;
  sanitizedSourceTextHash?: string | null;
  sanitizedScreenshotHash?: string | null;
  rawSensitiveDataStored: false;
  metadata?: Record<string, unknown>;
};

export type BrokerEvidenceMaskedAccountContext =
  | AvanzaAccountContextEvidence
  | {
      accountLabel?: string | null;
      accountType?: string | null;
      maskedAccountId?: string | null;
      category?: string | null;
    };

export type BrokerEvidenceInstrumentIdentity =
  | AvanzaInstrumentEvidence
  | {
      instrumentName: string;
      ticker?: string | null;
      isin?: string | null;
      instrumentId?: string | null;
      market?: string | null;
      venue?: string | null;
    };

export type BrokerEvidenceMonetaryAmount = {
  value: number;
  currency: string;
  rawLabel?: string | null;
};

export type BrokerEvidenceFxRate = {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rawLabel?: string | null;
};

export type BrokerEvidenceMatchingCandidate = {
  provisionalEvidenceFingerprint?: string | null;
  finalNoteEvidenceFingerprint?: string | null;
  noteReferenceNumber?: string | null;
  broker: "avanza";
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  instrument?: BrokerEvidenceInstrumentIdentity | null;
  side?: AvanzaConfirmationOrderSide | null;
  quantity?: number | null;
  tradeDate?: string | null;
  approximateExecutionTime?: string | null;
  price?: BrokerEvidenceMonetaryAmount | null;
  handoffPayloadFingerprint?: string | null;
  matchingStatus: BrokerEvidenceMatchingStatus;
  matchingReasons: BrokerEvidenceMatchingReason[];
  reviewFlags: BrokerEvidenceReviewFlag[];
};

export type ImmediateBrokerReadbackEvidence = {
  contractVersion: TwoStageBrokerEvidenceContractVersion;
  evidenceStage: "immediate_readback";
  lifecycleStatus:
    | "immediate_readback_observed"
    | "provisional_trade_registered"
    | "final_note_pending"
    | "needs_review";
  broker: "avanza";
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  instrument: BrokerEvidenceInstrumentIdentity;
  side: AvanzaConfirmationOrderSide;
  quantity: number;
  visiblePrice?: BrokerEvidenceMonetaryAmount | null;
  visibleCurrency?: string | null;
  transactionReadbackTimestamp?: string | null;
  sourcePageIdentity: string;
  handoffPayloadFingerprint?: string | null;
  provisionalStatus: "provisional" | "needs_review";
  finalNotePending: true;
  missingFields: BrokerEvidenceMissingField[];
  provisionalFields: BrokerEvidenceProvisionalField[];
  provenance: BrokerEvidenceSourceReference;
  safetyPolicy: BrokerEvidenceSafetyPolicy;
  reviewFlags: BrokerEvidenceReviewFlag[];
  warnings: BrokerEvidenceWarning[];
  metadata?: Record<string, unknown>;
};

export type FinalBrokerSettlementNoteEvidence = {
  contractVersion: TwoStageBrokerEvidenceContractVersion;
  evidenceStage: "final_settlement_note";
  lifecycleStatus:
    | "final_note_available"
    | "final_note_matched"
    | "finalized"
    | "needs_review"
    | "final_note_mismatch";
  broker: "avanza";
  noteReferenceNumber?: string | null;
  businessDate?: string | null;
  settlementDate?: string | null;
  printDate?: string | null;
  instrument: BrokerEvidenceInstrumentIdentity;
  isin?: string | null;
  side: AvanzaConfirmationOrderSide;
  quantity: number;
  executionPrice?: BrokerEvidenceMonetaryAmount | null;
  currency?: string | null;
  executionTime?: string | null;
  orderType?: string | null;
  marketOrVenue?: string | null;
  commission?: BrokerEvidenceMonetaryAmount | null;
  consideration?: BrokerEvidenceMonetaryAmount | null;
  fxRates?: BrokerEvidenceFxRate[];
  totalAmount?: BrokerEvidenceMonetaryAmount | null;
  accountContext?: BrokerEvidenceMaskedAccountContext | null;
  provenance: BrokerEvidenceSourceReference;
  matchingCandidate?: BrokerEvidenceMatchingCandidate | null;
  finalizedFields: BrokerEvidenceFinalizedField[];
  missingFields: BrokerEvidenceMissingField[];
  safetyPolicy: BrokerEvidenceSafetyPolicy;
  reviewFlags: BrokerEvidenceReviewFlag[];
  warnings: BrokerEvidenceWarning[];
  metadata?: Record<string, unknown>;
};

export type TwoStageBrokerEvidenceRecord =
  | ImmediateBrokerReadbackEvidence
  | FinalBrokerSettlementNoteEvidence;

export type TwoStageBrokerEvidenceLifecycleSnapshot = {
  contractVersion: TwoStageBrokerEvidenceContractVersion;
  broker: "avanza";
  currentStage: BrokerEvidenceStage;
  lifecycleStatus: BrokerEvidenceLifecycleStatus;
  immediateReadbackEvidence?: ImmediateBrokerReadbackEvidence | null;
  finalSettlementNoteEvidence?: FinalBrokerSettlementNoteEvidence | null;
  matchingStatus: BrokerEvidenceMatchingStatus;
  matchingReasons: BrokerEvidenceMatchingReason[];
  finalizationStatus: BrokerEvidenceFinalizationStatus;
  finalNoteExpectedAfter?: string | null;
  finalNoteObservedAt?: string | null;
  reviewFlags: BrokerEvidenceReviewFlag[];
  warnings: BrokerEvidenceWarning[];
  safetyPolicy: BrokerEvidenceSafetyPolicy;
  agentCapabilities: BrokerEvidenceAgentCapability[];
  manualBoundaries: BrokerEvidenceManualBoundary[];
  metadata?: Record<string, unknown>;
};

export const TWO_STAGE_BROKER_EVIDENCE_STAGE_METADATA = {
  immediate_readback: {
    officialFinalEvidence: false,
    finalNotePending: true,
    defaultLifecycleStatus: "final_note_pending",
    defaultFinalizationStatus: "blocked_pending_final_note",
  },
  final_settlement_note: {
    officialFinalEvidence: true,
    finalNotePending: false,
    defaultLifecycleStatus: "final_note_available",
    defaultFinalizationStatus: "not_allowed",
  },
} as const satisfies Record<
  BrokerEvidenceStage,
  {
    officialFinalEvidence: boolean;
    finalNotePending: boolean;
    defaultLifecycleStatus: BrokerEvidenceLifecycleStatus;
    defaultFinalizationStatus: BrokerEvidenceFinalizationStatus;
  }
>;

export const TWO_STAGE_BROKER_EVIDENCE_DEFAULT_AGENT_CAPABILITIES = [
  "prepare_order_form",
  "wait_for_manual_confirmation",
  "collect_immediate_readback_read_only",
  "collect_final_note_read_only",
  "compare_evidence_read_only",
  "request_manual_review",
] as const satisfies readonly BrokerEvidenceAgentCapability[];

export const TWO_STAGE_BROKER_EVIDENCE_DEFAULT_MANUAL_BOUNDARIES = [
  "semi_auto_default",
  "manual_broker_confirmation_required",
  "automatic_final_confirmation_forbidden",
  "read_only_collection_only",
  "no_trade_mutation",
  "no_persistence",
] as const satisfies readonly BrokerEvidenceManualBoundary[];

// Contract types only. This module does not implement capture, matching,
// finalization, persistence, Supabase/localStorage writes, audit append,
// execution-record creation, trade mutation, UI wiring, browser automation, or
// Avanza behavior.
