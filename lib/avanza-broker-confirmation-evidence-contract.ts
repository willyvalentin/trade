import type { BrokerResultSourceClassification } from "@/lib/broker-result-source-classification";

export const AVANZA_BROKER_CONFIRMATION_EVIDENCE_CONTRACT_VERSION =
  "avanza_broker_confirmation_evidence_v1" as const;

export type AvanzaBrokerConfirmationEvidenceContractVersion =
  typeof AVANZA_BROKER_CONFIRMATION_EVIDENCE_CONTRACT_VERSION;

export const AVANZA_CONFIRMATION_EVIDENCE_SOURCE_TYPES = [
  "order_form",
  "order_preview",
  "final_confirmation",
  "account_order_history",
  "manual_user_provided",
] as const;

export type AvanzaConfirmationEvidenceSourceType =
  (typeof AVANZA_CONFIRMATION_EVIDENCE_SOURCE_TYPES)[number];

export const AVANZA_CONFIRMATION_EVIDENCE_ALLOWED_SOURCE_TYPES = [
  "final_confirmation",
  "account_order_history",
] as const satisfies readonly AvanzaConfirmationEvidenceSourceType[];

export const AVANZA_CONFIRMATION_EVIDENCE_DISALLOWED_SOURCE_TYPES = [
  "order_form",
  "order_preview",
  "manual_user_provided",
] as const satisfies readonly AvanzaConfirmationEvidenceSourceType[];

export type AvanzaConfirmationEvidenceAllowedSourceType =
  (typeof AVANZA_CONFIRMATION_EVIDENCE_ALLOWED_SOURCE_TYPES)[number];

export type AvanzaConfirmationEvidenceDisallowedSourceType =
  (typeof AVANZA_CONFIRMATION_EVIDENCE_DISALLOWED_SOURCE_TYPES)[number];

export const AVANZA_CONFIRMATION_CAPTURE_METHODS = [
  "browser_readback",
  "text_extraction",
  "ocr",
  "account_history_lookup",
  "manual_review",
] as const;

export type AvanzaConfirmationCaptureMethod =
  (typeof AVANZA_CONFIRMATION_CAPTURE_METHODS)[number];

export const AVANZA_CONFIRMATION_CAPTURE_MODES = [
  "semi_automatic_supervised",
  "manual_review",
  "future_server_capture",
] as const;

export type AvanzaConfirmationCaptureMode =
  (typeof AVANZA_CONFIRMATION_CAPTURE_MODES)[number];

export const AVANZA_CONFIRMATION_PAGE_IDENTITIES = [
  "order_form",
  "order_preview",
  "final_confirmation",
  "receipt",
  "order_status",
  "account_order_history",
  "unknown",
] as const;

export type AvanzaConfirmationPageIdentity =
  (typeof AVANZA_CONFIRMATION_PAGE_IDENTITIES)[number];

export const AVANZA_CONFIRMATION_ORDER_SIDES = ["buy", "sell"] as const;

export type AvanzaConfirmationOrderSide =
  (typeof AVANZA_CONFIRMATION_ORDER_SIDES)[number];

export const AVANZA_CONFIRMATION_PRICE_FIELD_TYPES = [
  "execution_price",
  "average_fill_price",
  "filled_price",
  "limit_price",
  "accepted_price",
] as const;

export type AvanzaConfirmationPriceFieldType =
  (typeof AVANZA_CONFIRMATION_PRICE_FIELD_TYPES)[number];

export const AVANZA_CONFIRMATION_ORDER_STATUSES = [
  "filled",
  "executed",
  "partially_filled",
  "placed",
  "accepted",
  "pending",
  "rejected",
  "cancelled",
  "unknown",
] as const;

export type AvanzaConfirmationOrderStatus =
  (typeof AVANZA_CONFIRMATION_ORDER_STATUSES)[number];

export const AVANZA_CONFIRMATION_EVIDENCE_REJECTION_REASONS = [
  "missing_final_confirmation_source",
  "source_is_order_preview",
  "missing_order_id",
  "missing_confirmation_timestamp",
  "missing_instrument_identifier",
  "side_mismatch",
  "quantity_mismatch",
  "price_invalid",
  "provenance_missing",
  "extraction_confidence_low",
  "partial_fill_ambiguous",
] as const;

export type AvanzaConfirmationEvidenceRejectionReason =
  (typeof AVANZA_CONFIRMATION_EVIDENCE_REJECTION_REASONS)[number];

export const AVANZA_CONFIRMATION_EVIDENCE_WARNINGS = [
  "status_not_filled_or_executed",
  "account_context_missing",
  "handoff_fingerprint_missing",
  "currency_missing",
  "broker_reference_ambiguous",
  "manual_confirmation_missing",
  "timestamp_out_of_range",
  "optional_fee_missing",
  "optional_total_amount_missing",
  "field_confidence_partial",
] as const;

export type AvanzaConfirmationEvidenceWarning =
  (typeof AVANZA_CONFIRMATION_EVIDENCE_WARNINGS)[number];

export type AvanzaConfirmationEvidenceFieldConfidence = {
  value: number;
  source?: AvanzaConfirmationCaptureMethod | null;
  label?: string | null;
  warning?: AvanzaConfirmationEvidenceWarning | null;
};

export type AvanzaConfirmationEvidenceFieldConfidenceMap = {
  instrument?: AvanzaConfirmationEvidenceFieldConfidence | null;
  side?: AvanzaConfirmationEvidenceFieldConfidence | null;
  quantity?: AvanzaConfirmationEvidenceFieldConfidence | null;
  price?: AvanzaConfirmationEvidenceFieldConfidence | null;
  timestamp?: AvanzaConfirmationEvidenceFieldConfidence | null;
  brokerReference?: AvanzaConfirmationEvidenceFieldConfidence | null;
  status?: AvanzaConfirmationEvidenceFieldConfidence | null;
  currency?: AvanzaConfirmationEvidenceFieldConfidence | null;
};

export type AvanzaConfirmationEvidenceFieldMap = Record<
  string,
  string | number | boolean | null
>;

export type AvanzaConfirmationEvidencePrivacyMetadata = {
  containsRawScreenshot: boolean;
  containsRawPageText: boolean;
  containsRawDom: boolean;
  containsCredentials: boolean;
  containsCookiesOrTokens: boolean;
  containsAccountNumber: boolean;
  containsBalanceOrHoldings: boolean;
  accountIdentifierMasked: boolean;
  rawUrlStored: boolean;
  rawSensitiveDataStored: boolean;
};

export type AvanzaConfirmationEvidenceProvenance = {
  captureMethod: AvanzaConfirmationCaptureMethod;
  captureMode: AvanzaConfirmationCaptureMode;
  pageIdentity: AvanzaConfirmationPageIdentity;
  capturedAt: string;
  evidenceFingerprint: string;
  sourceClassification: BrokerResultSourceClassification;
  browserSessionLabel?: string | null;
  urlPatternClassification?: string | null;
  extractionConfidence?: number | null;
  fieldConfidence?: AvanzaConfirmationEvidenceFieldConfidenceMap | null;
  userConfirmationCheckpoint?: boolean;
  sourceScreenshotHash?: string | null;
  sourceTextHash?: string | null;
  captureId?: string | null;
  requestId?: string | null;
  handoffPayloadFingerprint?: string | null;
  metadata?: Record<string, unknown>;
};

export type AvanzaInstrumentEvidence = {
  instrumentName: string;
  ticker?: string | null;
  isin?: string | null;
  instrumentId?: string | null;
  market?: string | null;
  venue?: string | null;
  instrumentType?: string | null;
};

export type AvanzaBrokerReferenceEvidence = {
  orderId?: string | null;
  orderNumber?: string | null;
  confirmationId?: string | null;
  fillId?: string | null;
  executionId?: string | null;
  brokerReference?: string | null;
  strongEquivalentReference?: string | null;
};

export type AvanzaPriceEvidence = {
  value: number;
  fieldType: AvanzaConfirmationPriceFieldType;
  currency: string;
  rawLabel?: string | null;
};

export type AvanzaAccountContextEvidence = {
  accountLabel?: string | null;
  accountType?: string | null;
  maskedAccountId?: string | null;
};

export type AvanzaPartialFillEvidence = {
  status: "partial" | "multiple_fills" | "unclear";
  filledQuantity?: number | null;
  remainingQuantity?: number | null;
  averageFillPrice?: number | null;
  fillTimestamp?: string | null;
  fillIds?: string[];
  orderId?: string | null;
  notes?: string | null;
};

// Evidence contract only. These types/constants do not implement capture,
// extraction, validation, conversion, persistence, audit, trade mutation,
// browser automation, or Avanza behavior.
export type AvanzaConfirmationEvidence = {
  contractVersion: AvanzaBrokerConfirmationEvidenceContractVersion;
  broker: "avanza";
  sourceType: AvanzaConfirmationEvidenceSourceType;
  sourcePageFlowIdentifier: string;
  side: AvanzaConfirmationOrderSide;
  quantity: number;
  price: AvanzaPriceEvidence;
  currency: string;
  confirmationTimestamp: string;
  capturedTimestamp: string;
  manualConfirmationCheckpoint: boolean;
  sourceClassification: BrokerResultSourceClassification;
  provenance: AvanzaConfirmationEvidenceProvenance;
  privacy: AvanzaConfirmationEvidencePrivacyMetadata;
  instrument: AvanzaInstrumentEvidence;
  brokerReferences: AvanzaBrokerReferenceEvidence;
  orderStatus?: AvanzaConfirmationOrderStatus | null;
  orderType?: string | null;
  accountContext?: AvanzaAccountContextEvidence | null;
  handoffPayloadFingerprint?: string | null;
  commission?: number | null;
  fee?: number | null;
  totalAmount?: number | null;
  settlementCashImpact?: number | null;
  partialFill?: AvanzaPartialFillEvidence | null;
  rawFieldMap?: AvanzaConfirmationEvidenceFieldMap | null;
  warnings?: AvanzaConfirmationEvidenceWarning[];
  rejectionReasons?: AvanzaConfirmationEvidenceRejectionReason[];
  metadata?: Record<string, unknown>;
};
