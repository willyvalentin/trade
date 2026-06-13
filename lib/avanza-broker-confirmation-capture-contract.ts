import type { AvanzaDryRunOrderInput } from "./avanza-dry-run-request-contract";
import type { AvanzaManualConfirmationWaitResult } from "./avanza-manual-confirmation-wait-contract";
import { normalizeAvanzaSearchOnlyText } from "./avanza-search-only-result-contract";

export const AVANZA_BROKER_CONFIRMATION_CAPTURE_CONTRACT_VERSION =
  "avanza_broker_confirmation_capture_v1" as const;

export const AVANZA_BROKER_CONFIRMATION_PRICE_TOLERANCE = 0.0001;

export type AvanzaBrokerConfirmationCaptureStatus =
  | "unavailable"
  | "manual_confirmation_not_observed"
  | "confirmation_page_not_found"
  | "confirmation_captured"
  | "confirmation_partial"
  | "confirmation_mismatch"
  | "confirmation_rejected_or_cancelled"
  | "blocked"
  | "failed";

export type AvanzaBrokerConfirmationOrderStatus =
  | "unknown"
  | "placed"
  | "accepted"
  | "filled"
  | "partially_filled"
  | "rejected"
  | "cancelled"
  | "expired";

export type AvanzaBrokerConfirmationCaptureRiskFlag =
  | "manual_confirmation_not_observed"
  | "confirmation_page_missing"
  | "status_unknown"
  | "order_placed_not_filled"
  | "partial_fill"
  | "order_rejected"
  | "order_cancelled"
  | "action_mismatch"
  | "ticker_mismatch"
  | "name_mismatch"
  | "market_mismatch"
  | "currency_mismatch"
  | "instrument_type_mismatch"
  | "quantity_mismatch"
  | "price_mismatch"
  | "missing_order_id"
  | "missing_timestamp"
  | "missing_fee"
  | "missing_total"
  | "ambiguous_confirmation_wording"
  | "account_data_detected"
  | "balance_data_detected"
  | "holdings_data_detected"
  | "sensitive_data_detected"
  | "raw_dom_detected"
  | "unsanitized_screenshot_detected"
  | "broker_result_creation_attempted"
  | "trade_mutation_attempted";

export type AvanzaBrokerConfirmationSensitiveSignals = {
  accountDataDetected?: boolean;
  balanceDataDetected?: boolean;
  holdingsDataDetected?: boolean;
  sensitiveDataDetected?: boolean;
  rawDomDetected?: boolean;
  unsanitizedScreenshotDetected?: boolean;
};

export type AvanzaBrokerConfirmationForbiddenSignals = {
  brokerResultCreationAttempted?: boolean;
  tradeMutationAttempted?: boolean;
};

export type AvanzaBrokerConfirmationReadback = {
  action?: "buy" | "sell" | "unknown";
  ticker?: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  quantityValue?: number | string;
  priceValue?: number | string;
  fees?: number | string;
  totalAmount?: number | string;
  timestamp?: string;
  orderIdSanitized?: string;
  accountLabelSanitized?: string;
  orderStatus?: AvanzaBrokerConfirmationOrderStatus;
  statusTextSanitized?: string;
  warnings?: string[];
  confirmationPageVisible?: boolean;
  metadata?: Record<string, unknown>;
  sensitiveSignals?: AvanzaBrokerConfirmationSensitiveSignals;
  forbiddenSignals?: AvanzaBrokerConfirmationForbiddenSignals;
};

export type AvanzaBrokerConfirmationFieldCheck = {
  field: string;
  expected?: string;
  actual?: string;
  status:
    | "match"
    | "mismatch"
    | "missing_expected"
    | "missing_confirmation"
    | "warning";
  required: boolean;
  message?: string;
};

export type AvanzaBrokerConfirmationCaptureInput = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  manualConfirmationWaitResult: AvanzaManualConfirmationWaitResult;
  brokerConfirmationReadback?: AvanzaBrokerConfirmationReadback;
  metadata?: Record<string, unknown>;
};

export type AvanzaBrokerConfirmationCaptureResult = {
  ok: boolean;
  status: AvanzaBrokerConfirmationCaptureStatus;
  checkedAt: string;
  expectedAction: AvanzaDryRunOrderInput["action"];
  expectedInstrument: AvanzaDryRunOrderInput["instrument"];
  expectedQuantity: number;
  expectedPrice: number;
  orderStatus: AvanzaBrokerConfirmationOrderStatus;
  brokerConfirmationReadback?: AvanzaBrokerConfirmationReadback;
  fieldChecks: AvanzaBrokerConfirmationFieldCheck[];
  riskFlags: AvanzaBrokerConfirmationCaptureRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaBrokerConfirmationCaptureResultInput = {
  status: AvanzaBrokerConfirmationCaptureStatus;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  manualConfirmationWaitResult: AvanzaManualConfirmationWaitResult;
  brokerConfirmationReadback?: AvanzaBrokerConfirmationReadback;
  orderStatus?: AvanzaBrokerConfirmationOrderStatus;
  fieldChecks?: AvanzaBrokerConfirmationFieldCheck[];
  riskFlags?: AvanzaBrokerConfirmationCaptureRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EvaluateAvanzaBrokerConfirmationCaptureOptions = {
  priceTolerance?: number;
  allowPlacedUnfilled?: boolean;
  requireOrderId?: boolean;
  requireTimestamp?: boolean;
  blockOnRejectedOrCancelled?: boolean;
  blockOnSensitiveSignals?: boolean;
  blockOnBrokerResultAttempt?: boolean;
  blockOnTradeMutationAttempt?: boolean;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const BROKER_CONFIRMATION_CAPTURE_SAFETY_LABELS = [
  "Broker confirmation capture only",
  "No Bekräfta by agent",
  "No BrokerExecutionResult",
  "No execution record",
  "No Supabase write",
  "No trade mutation",
] as const;

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function numberFromInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.replace(/\s/g, "").replace(",", "."));

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueRiskFlags(
  values: readonly AvanzaBrokerConfirmationCaptureRiskFlag[],
) {
  return [...new Set(values)];
}

function normalizedMatches(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

function normalizeOrderStatus(
  status: unknown,
): AvanzaBrokerConfirmationOrderStatus {
  return status === "placed" ||
    status === "accepted" ||
    status === "filled" ||
    status === "partially_filled" ||
    status === "rejected" ||
    status === "cancelled" ||
    status === "expired"
    ? status
    : "unknown";
}

function createStatusLabels(status: AvanzaBrokerConfirmationCaptureStatus) {
  const labels: Record<AvanzaBrokerConfirmationCaptureStatus, string[]> = {
    unavailable: ["Broker confirmation capture unavailable"],
    manual_confirmation_not_observed: ["Manual confirmation not observed"],
    confirmation_page_not_found: ["Confirmation page not found"],
    confirmation_captured: ["Broker confirmation captured"],
    confirmation_partial: ["Broker confirmation partial"],
    confirmation_mismatch: ["Broker confirmation mismatch"],
    confirmation_rejected_or_cancelled: [
      "Broker confirmation rejected or cancelled",
    ],
    blocked: ["Broker confirmation capture blocked"],
    failed: ["Broker confirmation capture failed"],
  };

  return labels[status];
}

function normalizeReadback(
  readback: AvanzaBrokerConfirmationReadback,
): AvanzaBrokerConfirmationReadback {
  return {
    action:
      readback.action === "buy" || readback.action === "sell"
        ? readback.action
        : readback.action === "unknown"
          ? "unknown"
          : undefined,
    ticker: optionalText(readback.ticker),
    name: optionalText(readback.name),
    market: optionalText(readback.market),
    currency: optionalText(readback.currency),
    instrumentType: optionalText(readback.instrumentType),
    quantityValue: readback.quantityValue,
    priceValue: readback.priceValue,
    fees: readback.fees,
    totalAmount: readback.totalAmount,
    timestamp: optionalText(readback.timestamp),
    orderIdSanitized: optionalText(readback.orderIdSanitized),
    accountLabelSanitized: optionalText(readback.accountLabelSanitized),
    orderStatus: normalizeOrderStatus(readback.orderStatus),
    statusTextSanitized: optionalText(readback.statusTextSanitized),
    warnings: normalizeStringArray(readback.warnings),
    confirmationPageVisible: readback.confirmationPageVisible === true,
    metadata:
      typeof readback.metadata === "object" &&
      readback.metadata !== null &&
      !Array.isArray(readback.metadata)
        ? { ...readback.metadata }
        : undefined,
    sensitiveSignals: readback.sensitiveSignals
      ? {
          accountDataDetected:
            readback.sensitiveSignals.accountDataDetected === true,
          balanceDataDetected:
            readback.sensitiveSignals.balanceDataDetected === true,
          holdingsDataDetected:
            readback.sensitiveSignals.holdingsDataDetected === true,
          sensitiveDataDetected:
            readback.sensitiveSignals.sensitiveDataDetected === true,
          rawDomDetected: readback.sensitiveSignals.rawDomDetected === true,
          unsanitizedScreenshotDetected:
            readback.sensitiveSignals.unsanitizedScreenshotDetected === true,
        }
      : undefined,
    forbiddenSignals: readback.forbiddenSignals
      ? {
          brokerResultCreationAttempted:
            readback.forbiddenSignals.brokerResultCreationAttempted === true,
          tradeMutationAttempted:
            readback.forbiddenSignals.tradeMutationAttempted === true,
        }
      : undefined,
  };
}

function createFieldCheck(
  field: string,
  expected: unknown,
  actual: unknown,
  required: boolean,
  options: {
    riskFlag: AvanzaBrokerConfirmationCaptureRiskFlag;
    message: string;
    numeric?: boolean;
    tolerance?: number;
  },
) {
  const expectedText = typeof expected === "undefined" ? "" : String(expected);
  const actualText = typeof actual === "undefined" ? "" : String(actual);

  if (expectedText.trim().length === 0) {
    return {
      check: {
        field,
        actual: actualText || undefined,
        status: "missing_expected" as const,
        required: false,
        message: `Expected ${field} is missing; confidence is lower.`,
      },
      riskFlag: undefined,
      blocker: undefined,
    };
  }

  if (actualText.trim().length === 0) {
    return {
      check: {
        field,
        expected: expectedText,
        status: "missing_confirmation" as const,
        required,
        message: `Broker confirmation ${field} is missing.`,
      },
      riskFlag: required ? options.riskFlag : undefined,
      blocker: required ? `Broker confirmation ${field} is missing.` : undefined,
    };
  }

  const expectedNumber = numberFromInput(expected);
  const actualNumber = numberFromInput(actual);
  const matches =
    options.numeric === true &&
    expectedNumber !== null &&
    actualNumber !== null
      ? Math.abs(expectedNumber - actualNumber) <= (options.tolerance ?? 0)
      : normalizedMatches(expectedText, actualText);

  if (matches) {
    return {
      check: {
        field,
        expected: expectedText,
        actual: actualText,
        status: "match" as const,
        required,
      },
      riskFlag: undefined,
      blocker: undefined,
    };
  }

  return {
    check: {
      field,
      expected: expectedText,
      actual: actualText,
      status: "mismatch" as const,
      required,
      message: options.message,
    },
    riskFlag: options.riskFlag,
    blocker: options.message,
  };
}

function buildCoreFieldChecks(
  dryRunOrderInput: AvanzaDryRunOrderInput,
  readback: AvanzaBrokerConfirmationReadback,
  priceTolerance: number,
) {
  const instrument = dryRunOrderInput.instrument;
  const checks = [
    createFieldCheck("action", dryRunOrderInput.action, readback.action, true, {
      riskFlag: "action_mismatch",
      message: "Broker confirmation action does not match the dry-run request.",
    }),
    createFieldCheck("ticker", instrument.ticker, readback.ticker, true, {
      riskFlag: "ticker_mismatch",
      message: "Broker confirmation ticker does not match the dry-run request.",
    }),
    createFieldCheck("name", instrument.name, readback.name, false, {
      riskFlag: "name_mismatch",
      message: "Broker confirmation name does not match the dry-run request.",
    }),
    createFieldCheck("market", instrument.market, readback.market, false, {
      riskFlag: "market_mismatch",
      message: "Broker confirmation market does not match the dry-run request.",
    }),
    createFieldCheck(
      "currency",
      instrument.currency,
      readback.currency,
      false,
      {
        riskFlag: "currency_mismatch",
        message:
          "Broker confirmation currency does not match the dry-run request.",
      },
    ),
    createFieldCheck(
      "instrumentType",
      instrument.instrumentType,
      readback.instrumentType,
      false,
      {
        riskFlag: "instrument_type_mismatch",
        message:
          "Broker confirmation instrument type does not match the dry-run request.",
      },
    ),
    createFieldCheck(
      "quantity",
      dryRunOrderInput.quantity,
      readback.quantityValue,
      true,
      {
        riskFlag: "quantity_mismatch",
        message:
          "Broker confirmation quantity does not match the dry-run request.",
        numeric: true,
      },
    ),
    createFieldCheck("price", dryRunOrderInput.price, readback.priceValue, true, {
      riskFlag: "price_mismatch",
      message: "Broker confirmation price does not match the dry-run request.",
      numeric: true,
      tolerance: priceTolerance,
    }),
  ];

  return {
    fieldChecks: checks.map(({ check }) => check),
    riskFlags: checks
      .map(({ riskFlag }) => riskFlag)
      .filter(
        (riskFlag): riskFlag is AvanzaBrokerConfirmationCaptureRiskFlag =>
          typeof riskFlag === "string",
      ),
    blockers: checks
      .map(({ blocker }) => blocker)
      .filter((blocker): blocker is string => typeof blocker === "string"),
  };
}

export function createAvanzaBrokerConfirmationCaptureResult(
  input: CreateAvanzaBrokerConfirmationCaptureResultInput,
): AvanzaBrokerConfirmationCaptureResult {
  const metadata = {
    ...(input.metadata ?? {}),
    contractVersion: AVANZA_BROKER_CONFIRMATION_CAPTURE_CONTRACT_VERSION,
    brokerConfirmationCaptureOnly: true,
    noBekraftaByAgent: true,
    noBrokerExecutionResult: true,
    noExecutionRecord: true,
    noSupabaseWrite: true,
    noTradeMutation: true,
    sanitizedEvidenceOnly: true,
  };
  const labels = uniqueStrings([
    ...BROKER_CONFIRMATION_CAPTURE_SAFETY_LABELS,
    ...createStatusLabels(input.status),
    ...(input.labels ?? []),
  ]);

  return {
    ok: input.status === "confirmation_captured",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedAction: input.dryRunOrderInput.action,
    expectedInstrument: input.dryRunOrderInput.instrument,
    expectedQuantity: input.dryRunOrderInput.quantity,
    expectedPrice: input.dryRunOrderInput.price,
    orderStatus:
      input.orderStatus ??
      normalizeOrderStatus(input.brokerConfirmationReadback?.orderStatus),
    brokerConfirmationReadback: input.brokerConfirmationReadback
      ? normalizeReadback(input.brokerConfirmationReadback)
      : undefined,
    fieldChecks: input.fieldChecks ?? [],
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(input.blockers ?? []),
    warnings: uniqueStrings(input.warnings ?? []),
    errors: uniqueStrings(input.errors ?? []),
    labels,
    metadata,
  };
}

export function evaluateAvanzaBrokerConfirmationCapture(
  input: AvanzaBrokerConfirmationCaptureInput,
  options: EvaluateAvanzaBrokerConfirmationCaptureOptions = {},
) {
  const checkedAt = options.checkedAt;
  const metadata = {
    ...(options.metadata ?? {}),
    ...(input.metadata ?? {}),
  };
  const priceTolerance =
    typeof options.priceTolerance === "number" &&
    Number.isFinite(options.priceTolerance) &&
    options.priceTolerance >= 0
      ? options.priceTolerance
      : AVANZA_BROKER_CONFIRMATION_PRICE_TOLERANCE;

  if (
    input.manualConfirmationWaitResult.status !==
      "user_confirmed_unverified" ||
    input.manualConfirmationWaitResult.metadata
      ?.separateConfirmationCaptureRequired !== true
  ) {
    const blocker =
      "Manual confirmation wait must be user_confirmed_unverified before broker confirmation capture.";

    return createAvanzaBrokerConfirmationCaptureResult({
      status: "manual_confirmation_not_observed",
      dryRunOrderInput: input.dryRunOrderInput,
      manualConfirmationWaitResult: input.manualConfirmationWaitResult,
      riskFlags: ["manual_confirmation_not_observed"],
      blockers: [blocker],
      errors: [blocker],
      checkedAt,
      metadata,
    });
  }

  if (
    !input.brokerConfirmationReadback ||
    input.brokerConfirmationReadback.confirmationPageVisible === false
  ) {
    const blocker = "Broker confirmation page was not found.";

    return createAvanzaBrokerConfirmationCaptureResult({
      status: "confirmation_page_not_found",
      dryRunOrderInput: input.dryRunOrderInput,
      manualConfirmationWaitResult: input.manualConfirmationWaitResult,
      brokerConfirmationReadback: input.brokerConfirmationReadback,
      riskFlags: ["confirmation_page_missing"],
      blockers: [blocker],
      errors: [blocker],
      checkedAt,
      metadata,
    });
  }

  const readback = normalizeReadback(input.brokerConfirmationReadback);
  const orderStatus = normalizeOrderStatus(readback.orderStatus);
  const riskFlags: AvanzaBrokerConfirmationCaptureRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings = [...normalizeStringArray(readback.warnings)];

  if (
    readback.forbiddenSignals?.brokerResultCreationAttempted &&
    (options.blockOnBrokerResultAttempt ?? true)
  ) {
    riskFlags.push("broker_result_creation_attempted");
    blockers.push(
      "BrokerExecutionResult creation was attempted during confirmation capture.",
    );
  }

  if (
    readback.forbiddenSignals?.tradeMutationAttempted &&
    (options.blockOnTradeMutationAttempt ?? true)
  ) {
    riskFlags.push("trade_mutation_attempted");
    blockers.push(
      "Trade mutation was attempted during broker confirmation capture.",
    );
  }

  const sensitiveChecks: Array<
    [keyof AvanzaBrokerConfirmationSensitiveSignals, AvanzaBrokerConfirmationCaptureRiskFlag, string]
  > = [
    [
      "accountDataDetected",
      "account_data_detected",
      "Account data detected in broker confirmation capture.",
    ],
    [
      "balanceDataDetected",
      "balance_data_detected",
      "Balance data detected in broker confirmation capture.",
    ],
    [
      "holdingsDataDetected",
      "holdings_data_detected",
      "Holdings data detected in broker confirmation capture.",
    ],
    [
      "sensitiveDataDetected",
      "sensitive_data_detected",
      "Sensitive data detected in broker confirmation capture.",
    ],
    [
      "rawDomDetected",
      "raw_dom_detected",
      "Raw DOM detected in broker confirmation capture.",
    ],
    [
      "unsanitizedScreenshotDetected",
      "unsanitized_screenshot_detected",
      "Unsanitized screenshot detected in broker confirmation capture.",
    ],
  ];

  if (options.blockOnSensitiveSignals ?? true) {
    for (const [key, riskFlag, message] of sensitiveChecks) {
      if (readback.sensitiveSignals?.[key]) {
        riskFlags.push(riskFlag);
        blockers.push(message);
      }
    }
  }

  if (blockers.length > 0) {
    return createAvanzaBrokerConfirmationCaptureResult({
      status: "blocked",
      dryRunOrderInput: input.dryRunOrderInput,
      manualConfirmationWaitResult: input.manualConfirmationWaitResult,
      brokerConfirmationReadback: readback,
      orderStatus,
      riskFlags,
      blockers,
      errors: blockers,
      warnings,
      checkedAt,
      metadata,
    });
  }

  if (
    orderStatus === "rejected" ||
    orderStatus === "cancelled" ||
    orderStatus === "expired"
  ) {
    const message =
      orderStatus === "rejected"
        ? "Broker confirmation says the order was rejected."
        : orderStatus === "expired"
          ? "Broker confirmation says the order expired."
          : "Broker confirmation says the order was cancelled.";

    return createAvanzaBrokerConfirmationCaptureResult({
      status: (options.blockOnRejectedOrCancelled ?? false)
        ? "blocked"
        : "confirmation_rejected_or_cancelled",
      dryRunOrderInput: input.dryRunOrderInput,
      manualConfirmationWaitResult: input.manualConfirmationWaitResult,
      brokerConfirmationReadback: readback,
      orderStatus,
      riskFlags: [
        orderStatus === "rejected" ? "order_rejected" : "order_cancelled",
      ],
      blockers:
        options.blockOnRejectedOrCancelled === true ? [message] : [],
      warnings: [message, ...warnings],
      errors:
        options.blockOnRejectedOrCancelled === true ? [message] : [],
      checkedAt,
      metadata,
    });
  }

  const core = buildCoreFieldChecks(
    input.dryRunOrderInput,
    readback,
    priceTolerance,
  );

  if (core.blockers.length > 0) {
    return createAvanzaBrokerConfirmationCaptureResult({
      status: "confirmation_mismatch",
      dryRunOrderInput: input.dryRunOrderInput,
      manualConfirmationWaitResult: input.manualConfirmationWaitResult,
      brokerConfirmationReadback: readback,
      orderStatus,
      fieldChecks: core.fieldChecks,
      riskFlags: core.riskFlags,
      blockers: core.blockers,
      errors: core.blockers,
      warnings,
      checkedAt,
      metadata,
    });
  }

  const partialRiskFlags: AvanzaBrokerConfirmationCaptureRiskFlag[] = [];
  const partialWarnings: string[] = [];

  if (orderStatus === "unknown") {
    partialRiskFlags.push("status_unknown");
    partialWarnings.push("Broker confirmation order status is unknown.");
  }

  const statusText = normalizeAvanzaSearchOnlyText(readback.statusTextSanitized);

  if (
    statusText.includes("manual review") ||
    statusText.includes("uncertain") ||
    statusText.includes("unknown") ||
    statusText.includes("oklar")
  ) {
    partialRiskFlags.push("ambiguous_confirmation_wording");
    partialWarnings.push("Broker confirmation wording is ambiguous.");
  }

  if (orderStatus === "placed" || orderStatus === "accepted") {
    partialRiskFlags.push("order_placed_not_filled");
    partialWarnings.push(
      "Order appears placed or accepted, but fill is not confirmed.",
    );
  }

  if (orderStatus === "partially_filled") {
    partialRiskFlags.push("partial_fill");
    partialWarnings.push("Broker confirmation indicates a partial fill.");
  }

  if (!optionalText(readback.orderIdSanitized)) {
    partialRiskFlags.push("missing_order_id");
    partialWarnings.push("Broker confirmation order id is missing.");
  }

  if (!optionalText(readback.timestamp)) {
    partialRiskFlags.push("missing_timestamp");
    partialWarnings.push("Broker confirmation timestamp is missing.");
  }

  if (typeof readback.fees === "undefined") {
    partialRiskFlags.push("missing_fee");
    partialWarnings.push("Broker confirmation fee/courtage is missing.");
  }

  if (typeof readback.totalAmount === "undefined") {
    partialRiskFlags.push("missing_total");
    partialWarnings.push("Broker confirmation total amount is missing.");
  }

  const requiredPartial =
    (options.requireOrderId === true && !optionalText(readback.orderIdSanitized)) ||
    (options.requireTimestamp === true && !optionalText(readback.timestamp));

  if (
    orderStatus !== "filled" ||
    requiredPartial ||
    partialRiskFlags.includes("status_unknown") ||
    partialRiskFlags.includes("ambiguous_confirmation_wording")
  ) {
    return createAvanzaBrokerConfirmationCaptureResult({
      status: "confirmation_partial",
      dryRunOrderInput: input.dryRunOrderInput,
      manualConfirmationWaitResult: input.manualConfirmationWaitResult,
      brokerConfirmationReadback: readback,
      orderStatus,
      fieldChecks: core.fieldChecks,
      riskFlags: partialRiskFlags,
      warnings: [...partialWarnings, ...warnings],
      checkedAt,
      metadata: {
        ...metadata,
        allowPlacedUnfilled: options.allowPlacedUnfilled ?? true,
      },
    });
  }

  return createAvanzaBrokerConfirmationCaptureResult({
    status: "confirmation_captured",
    dryRunOrderInput: input.dryRunOrderInput,
    manualConfirmationWaitResult: input.manualConfirmationWaitResult,
    brokerConfirmationReadback: readback,
    orderStatus,
    fieldChecks: core.fieldChecks,
    riskFlags: partialRiskFlags,
    warnings: [...partialWarnings, ...warnings],
    checkedAt,
    metadata,
  });
}

export function summarizeAvanzaBrokerConfirmationCaptureResult(
  result: AvanzaBrokerConfirmationCaptureResult,
) {
  const suffix =
    "No BrokerExecutionResult, execution record, Supabase write, or trade mutation was created.";

  switch (result.status) {
    case "confirmation_captured":
      return `Broker confirmation captured. ${suffix}`;
    case "confirmation_partial":
      if (result.riskFlags.includes("order_placed_not_filled")) {
        return `Order appears placed but fill is not confirmed. ${suffix}`;
      }
      return `Broker confirmation is partial. ${suffix}`;
    case "confirmation_mismatch":
      return `Confirmation mismatch: ${
        result.blockers[0] ?? result.errors[0] ?? "confirmation fields do not match"
      }. ${suffix}`;
    case "confirmation_rejected_or_cancelled":
      return `Rejected/cancelled confirmation. ${suffix}`;
    case "manual_confirmation_not_observed":
      return `Manual confirmation was not observed. ${suffix}`;
    case "confirmation_page_not_found":
      return `Broker confirmation page not found. ${suffix}`;
    case "blocked":
      return `Blocked: ${
        result.blockers[0] ?? result.errors[0] ?? "capture cannot proceed safely"
      }. ${suffix}`;
    case "failed":
      return `Broker confirmation capture failed. ${suffix}`;
    case "unavailable":
    default:
      return `Broker confirmation capture unavailable. ${suffix}`;
  }
}

export function getAvanzaBrokerConfirmationCaptureSafetyLabels(
  result: AvanzaBrokerConfirmationCaptureResult,
) {
  return uniqueStrings([
    ...BROKER_CONFIRMATION_CAPTURE_SAFETY_LABELS,
    ...result.labels,
  ]);
}

export function isAvanzaBrokerConfirmationCaptured(
  result: AvanzaBrokerConfirmationCaptureResult,
) {
  return result.ok && result.status === "confirmation_captured";
}

export function isAvanzaBrokerConfirmationPartial(
  result: AvanzaBrokerConfirmationCaptureResult,
) {
  return result.status === "confirmation_partial";
}
