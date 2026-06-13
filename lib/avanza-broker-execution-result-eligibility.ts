import {
  type AvanzaBrokerConfirmationCaptureResult,
  type AvanzaBrokerConfirmationCaptureRiskFlag,
  type AvanzaBrokerConfirmationCaptureStatus,
  type AvanzaBrokerConfirmationOrderStatus,
} from "./avanza-broker-confirmation-capture-contract";
import { normalizeAvanzaSearchOnlyText } from "./avanza-search-only-result-contract";

export const AVANZA_BROKER_EXECUTION_RESULT_ELIGIBILITY_VERSION =
  "avanza_broker_execution_result_eligibility_v1" as const;

export type AvanzaBrokerExecutionResultEligibilityStatus =
  | "eligible"
  | "not_eligible"
  | "partial_only"
  | "duplicate_risk"
  | "blocked"
  | "failed";

export type AvanzaBrokerExecutionResultEligibilityReason =
  | "capture_not_captured"
  | "capture_partial"
  | "capture_mismatch"
  | "capture_rejected_or_cancelled"
  | "capture_blocked"
  | "order_not_filled"
  | "order_partially_filled"
  | "missing_action"
  | "missing_instrument"
  | "missing_quantity"
  | "missing_price"
  | "missing_timestamp"
  | "missing_order_id"
  | "risk_flags_present"
  | "sensitive_data_detected"
  | "raw_data_detected"
  | "broker_result_attempt_detected"
  | "trade_mutation_attempt_detected"
  | "duplicate_fingerprint_detected"
  | "unsupported_order_status"
  | "manual_review_required";

export type AvanzaBrokerExecutionResultEligibilityOptions = {
  allowMissingOrderId?: boolean;
  allowMissingTimestamp?: boolean;
  allowPlacedAsExecution?: boolean;
  allowPartialFillConversion?: boolean;
  blockOnAnyRiskFlag?: boolean;
  requireFilledStatus?: boolean;
};

export type AvanzaBrokerExecutionResultEligibilityInput = {
  captureResult: AvanzaBrokerConfirmationCaptureResult;
  existingFingerprints?: string[];
  options?: AvanzaBrokerExecutionResultEligibilityOptions;
};

export type AvanzaBrokerExecutionResultEligibilityResult = {
  ok: boolean;
  status: AvanzaBrokerExecutionResultEligibilityStatus;
  checkedAt: string;
  eligible: boolean;
  reasons: AvanzaBrokerExecutionResultEligibilityReason[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  evidenceFingerprint: string;
  labels: string[];
  metadata: {
    version: typeof AVANZA_BROKER_EXECUTION_RESULT_ELIGIBILITY_VERSION;
    eligibilityCheckOnly: true;
    noBrokerExecutionResultCreated: true;
    noExecutionRecordCreated: true;
    noSupabaseWrite: true;
    noTradeMutation: true;
    captureStatus: AvanzaBrokerConfirmationCaptureStatus;
    orderStatus: AvanzaBrokerConfirmationOrderStatus;
    options: Required<AvanzaBrokerExecutionResultEligibilityOptions>;
  };
};

const ELIGIBILITY_LABELS = [
  "Eligibility check only",
  "No BrokerExecutionResult created",
  "No execution record",
  "No Supabase write",
  "No trade mutation",
] as const;

const DEFAULT_OPTIONS: Required<AvanzaBrokerExecutionResultEligibilityOptions> =
  {
    allowMissingOrderId: false,
    allowMissingTimestamp: false,
    allowPlacedAsExecution: false,
    allowPartialFillConversion: false,
    blockOnAnyRiskFlag: true,
    requireFilledStatus: true,
  };

const SENSITIVE_RISK_FLAGS: readonly AvanzaBrokerConfirmationCaptureRiskFlag[] =
  [
    "account_data_detected",
    "balance_data_detected",
    "holdings_data_detected",
    "sensitive_data_detected",
    "unsanitized_screenshot_detected",
  ];

const RAW_RISK_FLAGS: readonly AvanzaBrokerConfirmationCaptureRiskFlag[] = [
  "raw_dom_detected",
];

function uniqueValues<T extends string>(values: readonly T[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function normalizeOptions(
  options: AvanzaBrokerExecutionResultEligibilityOptions | null | undefined,
): Required<AvanzaBrokerExecutionResultEligibilityOptions> {
  return {
    ...DEFAULT_OPTIONS,
    ...(options ?? {}),
  };
}

function normalizeFingerprintPart(value: unknown) {
  const normalized = normalizeAvanzaSearchOnlyText(value);

  return normalized.length > 0 ? normalized : "missing";
}

function numberFingerprintPart(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "missing";
}

function hasRiskFlag(
  captureResult: AvanzaBrokerConfirmationCaptureResult,
  riskFlags: readonly AvanzaBrokerConfirmationCaptureRiskFlag[],
) {
  return riskFlags.some((riskFlag) =>
    captureResult.riskFlags.includes(riskFlag),
  );
}

function buildResult(input: {
  captureResult: AvanzaBrokerConfirmationCaptureResult;
  checkedAt?: string;
  status: AvanzaBrokerExecutionResultEligibilityStatus;
  reasons: AvanzaBrokerExecutionResultEligibilityReason[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  evidenceFingerprint: string;
  options: Required<AvanzaBrokerExecutionResultEligibilityOptions>;
}): AvanzaBrokerExecutionResultEligibilityResult {
  const reasons = uniqueValues(input.reasons);
  const blockers = uniqueValues(input.blockers ?? []);
  const errors = uniqueValues(input.errors ?? blockers);
  const warnings = uniqueValues(input.warnings ?? []);

  return {
    ok: input.status === "eligible",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    eligible: input.status === "eligible",
    reasons,
    blockers,
    warnings,
    errors,
    evidenceFingerprint: input.evidenceFingerprint,
    labels: [...ELIGIBILITY_LABELS],
    metadata: {
      version: AVANZA_BROKER_EXECUTION_RESULT_ELIGIBILITY_VERSION,
      eligibilityCheckOnly: true,
      noBrokerExecutionResultCreated: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      captureStatus: input.captureResult.status,
      orderStatus: input.captureResult.orderStatus,
      options: input.options,
    },
  };
}

export function buildAvanzaBrokerConfirmationEvidenceFingerprint(
  captureResult: AvanzaBrokerConfirmationCaptureResult,
) {
  const readback = captureResult.brokerConfirmationReadback;
  const parts = [
    "avanza",
    normalizeFingerprintPart(captureResult.expectedAction),
    normalizeFingerprintPart(captureResult.expectedInstrument.ticker),
    numberFingerprintPart(captureResult.expectedQuantity),
    numberFingerprintPart(captureResult.expectedPrice),
    normalizeFingerprintPart(captureResult.orderStatus),
    normalizeFingerprintPart(readback?.timestamp ?? captureResult.checkedAt),
    normalizeFingerprintPart(readback?.orderIdSanitized),
  ];

  return parts.join("|");
}

export function evaluateAvanzaBrokerExecutionResultEligibility(
  input: AvanzaBrokerExecutionResultEligibilityInput,
): AvanzaBrokerExecutionResultEligibilityResult {
  const options = normalizeOptions(input.options);
  const captureResult = input.captureResult;
  const evidenceFingerprint =
    buildAvanzaBrokerConfirmationEvidenceFingerprint(captureResult);
  const existingFingerprints = new Set(input.existingFingerprints ?? []);
  const warnings: string[] = [];

  if (existingFingerprints.has(evidenceFingerprint)) {
    return buildResult({
      captureResult,
      status: "duplicate_risk",
      reasons: ["duplicate_fingerprint_detected"],
      blockers: [
        "Evidence fingerprint has already been seen; conversion would risk a duplicate execution result.",
      ],
      evidenceFingerprint,
      options,
    });
  }

  if (captureResult.status !== "confirmation_captured") {
    if (captureResult.status === "confirmation_partial") {
      return buildResult({
        captureResult,
        status: "partial_only",
        reasons: ["capture_partial", "manual_review_required"],
        blockers: [
          "Broker confirmation capture is partial and cannot become a completed BrokerExecutionResult.",
        ],
        evidenceFingerprint,
        options,
      });
    }

    const blockedStatuses: readonly AvanzaBrokerConfirmationCaptureStatus[] = [
      "confirmation_mismatch",
      "confirmation_rejected_or_cancelled",
      "blocked",
      "failed",
      "manual_confirmation_not_observed",
      "confirmation_page_not_found",
    ];
    const reasons: AvanzaBrokerExecutionResultEligibilityReason[] = [
      "capture_not_captured",
    ];

    if (captureResult.status === "confirmation_mismatch") {
      reasons.push("capture_mismatch");
    }

    if (captureResult.status === "confirmation_rejected_or_cancelled") {
      reasons.push("capture_rejected_or_cancelled");
    }

    if (
      captureResult.status === "blocked" ||
      captureResult.status === "failed"
    ) {
      reasons.push("capture_blocked");
    }

    if (captureResult.riskFlags.includes("order_placed_not_filled")) {
      reasons.push("order_not_filled");
    }

    if (captureResult.riskFlags.includes("partial_fill")) {
      reasons.push("order_partially_filled");
    }

    if (hasRiskFlag(captureResult, SENSITIVE_RISK_FLAGS)) {
      reasons.push("sensitive_data_detected");
    }

    if (hasRiskFlag(captureResult, RAW_RISK_FLAGS)) {
      reasons.push("raw_data_detected");
    }

    if (captureResult.riskFlags.includes("broker_result_creation_attempted")) {
      reasons.push("broker_result_attempt_detected");
    }

    if (captureResult.riskFlags.includes("trade_mutation_attempted")) {
      reasons.push("trade_mutation_attempt_detected");
    }

    return buildResult({
      captureResult,
      status: blockedStatuses.includes(captureResult.status)
        ? "blocked"
        : "not_eligible",
      reasons,
      blockers: [
        `Capture status ${captureResult.status} is not eligible for BrokerExecutionResult conversion.`,
      ],
      evidenceFingerprint,
      options,
    });
  }

  const reasons: AvanzaBrokerExecutionResultEligibilityReason[] = [];
  const blockers: string[] = [];

  if (
    options.requireFilledStatus &&
    captureResult.orderStatus !== "filled"
  ) {
    if (
      captureResult.orderStatus === "placed" ||
      captureResult.orderStatus === "accepted"
    ) {
      reasons.push("order_not_filled");

      if (!options.allowPlacedAsExecution) {
        return buildResult({
          captureResult,
          status: "partial_only",
          reasons,
          blockers: [
            "Order is placed or accepted, but fill is not confirmed.",
          ],
          evidenceFingerprint,
          options,
        });
      }

      warnings.push(
        "Placed/accepted order is allowed by option, but this is not recommended for realized execution.",
      );
    } else if (captureResult.orderStatus === "partially_filled") {
      reasons.push("order_partially_filled");

      if (!options.allowPartialFillConversion) {
        return buildResult({
          captureResult,
          status: "partial_only",
          reasons,
          blockers: [
            "Order is partially filled; partial-fill conversion requires a separate design.",
          ],
          evidenceFingerprint,
          options,
        });
      }

      warnings.push(
        "Partial fill conversion is allowed by option and must use a partial-fill accounting policy.",
      );
    } else {
      reasons.push("unsupported_order_status");
      blockers.push(
        `Order status ${captureResult.orderStatus} is not supported for BrokerExecutionResult conversion.`,
      );
    }
  }

  if (captureResult.expectedAction !== "buy" && captureResult.expectedAction !== "sell") {
    reasons.push("missing_action");
    blockers.push("Capture result action is missing or unsupported.");
  }

  if (!captureResult.expectedInstrument.ticker?.trim()) {
    reasons.push("missing_instrument");
    blockers.push("Capture result instrument ticker is missing.");
  }

  if (
    typeof captureResult.expectedQuantity !== "number" ||
    !Number.isFinite(captureResult.expectedQuantity) ||
    captureResult.expectedQuantity <= 0
  ) {
    reasons.push("missing_quantity");
    blockers.push("Capture result quantity is missing or invalid.");
  }

  if (
    typeof captureResult.expectedPrice !== "number" ||
    !Number.isFinite(captureResult.expectedPrice) ||
    captureResult.expectedPrice <= 0
  ) {
    reasons.push("missing_price");
    blockers.push("Capture result price is missing or invalid.");
  }

  if (!captureResult.brokerConfirmationReadback?.timestamp?.trim()) {
    reasons.push("missing_timestamp");

    if (options.allowMissingTimestamp) {
      warnings.push("Broker confirmation timestamp is missing.");
    } else {
      blockers.push("Broker confirmation timestamp is missing.");
    }
  }

  if (!captureResult.brokerConfirmationReadback?.orderIdSanitized?.trim()) {
    reasons.push("missing_order_id");

    if (options.allowMissingOrderId) {
      warnings.push("Broker confirmation order id is missing.");
    } else {
      blockers.push("Broker confirmation order id is missing.");
    }
  }

  if (hasRiskFlag(captureResult, SENSITIVE_RISK_FLAGS)) {
    reasons.push("sensitive_data_detected");
    blockers.push("Sensitive data was detected in broker confirmation capture.");
  }

  if (hasRiskFlag(captureResult, RAW_RISK_FLAGS)) {
    reasons.push("raw_data_detected");
    blockers.push("Raw or unsanitized evidence was detected in broker confirmation capture.");
  }

  if (captureResult.riskFlags.includes("broker_result_creation_attempted")) {
    reasons.push("broker_result_attempt_detected");
    blockers.push(
      "BrokerExecutionResult creation was attempted before eligibility was approved.",
    );
  }

  if (captureResult.riskFlags.includes("trade_mutation_attempted")) {
    reasons.push("trade_mutation_attempt_detected");
    blockers.push(
      "Trade mutation was attempted before eligibility was approved.",
    );
  }

  if (captureResult.riskFlags.length > 0 && options.blockOnAnyRiskFlag) {
    reasons.push("risk_flags_present");
    blockers.push(
      "Broker confirmation capture has risk flags and blockOnAnyRiskFlag is enabled.",
    );
  }

  if (blockers.length > 0) {
    return buildResult({
      captureResult,
      status: "blocked",
      reasons,
      blockers,
      warnings,
      evidenceFingerprint,
      options,
    });
  }

  return buildResult({
    captureResult,
    status: "eligible",
    reasons,
    warnings,
    evidenceFingerprint,
    options,
  });
}

export function summarizeAvanzaBrokerExecutionResultEligibility(
  result: AvanzaBrokerExecutionResultEligibilityResult,
) {
  switch (result.status) {
    case "eligible":
      return "Eligible for future BrokerExecutionResult conversion. No BrokerExecutionResult was created.";
    case "partial_only":
      return `Not eligible: ${
        result.blockers[0] ?? "capture is partial or order is not filled"
      }. No BrokerExecutionResult was created.`;
    case "duplicate_risk":
      return "Duplicate risk: evidence fingerprint already exists. No BrokerExecutionResult was created.";
    case "blocked":
      return `Blocked: ${
        result.blockers[0] ?? "eligibility checks failed"
      }. No BrokerExecutionResult was created.`;
    case "failed":
      return "Eligibility check failed. No BrokerExecutionResult was created.";
    case "not_eligible":
    default:
      return `Not eligible: ${
        result.blockers[0] ?? "capture is not eligible"
      }. No BrokerExecutionResult was created.`;
  }
}

export function getAvanzaBrokerExecutionResultEligibilityLabels(
  result: AvanzaBrokerExecutionResultEligibilityResult,
) {
  return [...result.labels];
}

export function isAvanzaBrokerExecutionResultEligible(
  result: AvanzaBrokerExecutionResultEligibilityResult,
) {
  return result.ok && result.eligible && result.status === "eligible";
}
