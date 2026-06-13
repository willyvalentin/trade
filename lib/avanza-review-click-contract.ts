import type { AvanzaAdvancedFormFillResult } from "./avanza-advanced-form-fill-contract";
import type { AvanzaDryRunOrderInput } from "./avanza-dry-run-request-contract";
import { normalizeAvanzaSearchOnlyText } from "./avanza-search-only-result-contract";

export const AVANZA_REVIEW_CLICK_CONTRACT_VERSION =
  "avanza_review_click_v1" as const;

export const AVANZA_REVIEW_CLICK_PRICE_TOLERANCE = 0.0001;

export type AvanzaReviewClickStatus =
  | "unavailable"
  | "form_not_ready"
  | "review_click_allowed"
  | "confirmation_detected"
  | "confirmation_ready"
  | "confirmation_mismatch"
  | "validation_error"
  | "prohibited_final_confirm_detected"
  | "blocked"
  | "failed";

export type AvanzaReviewClickRiskFlag =
  | "form_not_filled"
  | "review_label_mismatch"
  | "review_click_attempted"
  | "confirmation_modal_missing"
  | "confirmation_action_mismatch"
  | "confirmation_ticker_mismatch"
  | "confirmation_name_mismatch"
  | "confirmation_market_mismatch"
  | "confirmation_currency_mismatch"
  | "confirmation_quantity_mismatch"
  | "confirmation_price_mismatch"
  | "confirmation_missing_core_field"
  | "validation_error_visible"
  | "final_confirm_visible"
  | "final_confirm_clicked_or_attempted"
  | "keyboard_submit_detected"
  | "account_data_detected"
  | "balance_data_detected"
  | "holdings_data_detected"
  | "sensitive_data_detected";

export type AvanzaConfirmationModalSensitiveSignals = {
  accountDataDetected?: boolean;
  balanceDataDetected?: boolean;
  holdingsDataDetected?: boolean;
  sensitiveDataDetected?: boolean;
};

export type AvanzaConfirmationModalInteractionSignals = {
  finalConfirmClickedOrAttempted?: boolean;
  keyboardSubmitDetected?: boolean;
};

export type AvanzaConfirmationModalReadback = {
  action?: "buy" | "sell" | "unknown";
  ticker?: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  quantityValue?: number | string;
  priceValue?: number | string;
  accountLabelSanitized?: string;
  fees?: number | string;
  totalAmount?: number | string;
  validUntil?: string;
  confirmationModalVisible?: boolean;
  cancelButtonVisible?: boolean;
  finalConfirmVisible?: boolean;
  finalConfirmLabel?: string;
  validationErrors?: string[];
  sensitiveSignals?: AvanzaConfirmationModalSensitiveSignals;
  interactionSignals?: AvanzaConfirmationModalInteractionSignals;
  metadata?: Record<string, unknown>;
};

export type AvanzaReviewClickFieldCheck = {
  field: string;
  expected?: string;
  actual?: string;
  status:
    | "match"
    | "mismatch"
    | "missing_expected"
    | "missing_modal"
    | "warning";
  required: boolean;
  message?: string;
};

export type AvanzaReviewClickInput = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  advancedFormFillResult: AvanzaAdvancedFormFillResult;
  confirmationReadback?: AvanzaConfirmationModalReadback;
  reviewClickAttempted?: boolean;
  reviewLabel?: string;
  metadata?: Record<string, unknown>;
};

export type AvanzaReviewClickResult = {
  ok: boolean;
  status: AvanzaReviewClickStatus;
  checkedAt: string;
  expectedAction: AvanzaDryRunOrderInput["action"];
  expectedInstrument: AvanzaDryRunOrderInput["instrument"];
  expectedQuantity: number;
  expectedPrice: number;
  confirmationReadback?: AvanzaConfirmationModalReadback;
  fieldChecks: AvanzaReviewClickFieldCheck[];
  riskFlags: AvanzaReviewClickRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaReviewClickResultInput = {
  status: AvanzaReviewClickStatus;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  confirmationReadback?: AvanzaConfirmationModalReadback;
  fieldChecks?: AvanzaReviewClickFieldCheck[];
  riskFlags?: AvanzaReviewClickRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EvaluateAvanzaReviewClickOptions = {
  priceTolerance?: number;
  requireCancelButtonVisible?: boolean;
  allowFinalConfirmVisibleAsReadOnly?: boolean;
  blockOnValidationErrors?: boolean;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const REVIEW_CLICK_SAFETY_LABELS = [
  "Review click / confirmation readback only",
  "No Bekräfta click",
  "Manual final confirmation required",
  "No order submission",
  "No broker result",
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

function uniqueRiskFlags(values: readonly AvanzaReviewClickRiskFlag[]) {
  return [...new Set(values)];
}

function createStatusLabels(status: AvanzaReviewClickStatus) {
  const labels: Record<AvanzaReviewClickStatus, string[]> = {
    unavailable: ["Review click unavailable"],
    form_not_ready: ["Advanced form not ready"],
    review_click_allowed: ["Review click allowed"],
    confirmation_detected: ["Confirmation modal detected"],
    confirmation_ready: ["Confirmation ready for manual final confirmation"],
    confirmation_mismatch: ["Confirmation readback mismatch"],
    validation_error: ["Confirmation validation error"],
    prohibited_final_confirm_detected: ["Prohibited Bekräfta detected"],
    blocked: ["Review click blocked"],
    failed: ["Review click failed"],
  };

  return labels[status];
}

function normalizedMatches(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

function normalizedReviewLabelMatches(
  action: AvanzaDryRunOrderInput["action"],
  label: unknown,
) {
  const normalized = normalizeAvanzaSearchOnlyText(label);
  const expectedTerms =
    action === "buy"
      ? ["granska köp", "granska kop"]
      : ["granska sälj", "granska salj"];

  return expectedTerms.some((term) => normalized === term);
}

function normalizeConfirmationReadback(
  readback: AvanzaConfirmationModalReadback,
): AvanzaConfirmationModalReadback {
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
    accountLabelSanitized: optionalText(readback.accountLabelSanitized),
    fees: readback.fees,
    totalAmount: readback.totalAmount,
    validUntil: optionalText(readback.validUntil),
    confirmationModalVisible: readback.confirmationModalVisible === true,
    cancelButtonVisible: readback.cancelButtonVisible === true,
    finalConfirmVisible: readback.finalConfirmVisible === true,
    finalConfirmLabel: optionalText(readback.finalConfirmLabel),
    validationErrors: normalizeStringArray(readback.validationErrors),
    sensitiveSignals: readback.sensitiveSignals
      ? { ...readback.sensitiveSignals }
      : undefined,
    interactionSignals: readback.interactionSignals
      ? { ...readback.interactionSignals }
      : undefined,
    metadata:
      typeof readback.metadata === "object" &&
      readback.metadata !== null &&
      !Array.isArray(readback.metadata)
        ? readback.metadata
        : undefined,
  };
}

function textFieldCheck(
  field: string,
  expected: string | undefined,
  actual: string | undefined,
  required: boolean,
  options: {
    missingExpectedMessage?: string;
    missingModalMessage: string;
    mismatchMessage: string;
  },
): AvanzaReviewClickFieldCheck {
  if (!expected) {
    return {
      field,
      actual,
      required: false,
      status: "missing_expected",
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; confirmation confidence is lower.`,
    };
  }

  if (!actual) {
    return {
      field,
      expected,
      required,
      status: "missing_modal",
      message: options.missingModalMessage,
    };
  }

  if (normalizedMatches(expected, actual)) {
    return {
      field,
      expected,
      actual,
      required,
      status: "match",
    };
  }

  return {
    field,
    expected,
    actual,
    required,
    status: "mismatch",
    message: options.mismatchMessage,
  };
}

function numericFieldCheck(
  field: string,
  expected: number,
  actualInput: unknown,
  tolerance: number,
  messages: {
    missing: string;
    invalid: string;
    mismatch: string;
  },
): AvanzaReviewClickFieldCheck {
  if (actualInput === undefined || actualInput === null || actualInput === "") {
    return {
      field,
      expected: String(expected),
      required: true,
      status: "missing_modal",
      message: messages.missing,
    };
  }

  const actual = numberFromInput(actualInput);

  if (actual === null || actual <= 0) {
    return {
      field,
      expected: String(expected),
      actual: String(actualInput),
      required: true,
      status: "mismatch",
      message: messages.invalid,
    };
  }

  if (Math.abs(actual - expected) <= tolerance) {
    return {
      field,
      expected: String(expected),
      actual: String(actual),
      required: true,
      status: "match",
    };
  }

  return {
    field,
    expected: String(expected),
    actual: String(actual),
    required: true,
    status: "mismatch",
    message: messages.mismatch,
  };
}

function riskFlagForFieldCheck(
  check: AvanzaReviewClickFieldCheck,
): AvanzaReviewClickRiskFlag {
  switch (check.field) {
    case "action":
      return "confirmation_action_mismatch";
    case "ticker":
      return "confirmation_ticker_mismatch";
    case "name":
      return "confirmation_name_mismatch";
    case "market":
      return "confirmation_market_mismatch";
    case "currency":
      return "confirmation_currency_mismatch";
    case "quantity":
      return "confirmation_quantity_mismatch";
    case "price":
      return "confirmation_price_mismatch";
    default:
      return "confirmation_missing_core_field";
  }
}

function metadataSignals(metadata: Record<string, unknown>) {
  return {
    finalConfirmClicked:
      metadata.finalConfirmClickedOrAttempted === true ||
      metadata.bekraftaClickedOrAttempted === true,
    keyboardSubmit: metadata.keyboardSubmitDetected === true,
  };
}

export function createAvanzaReviewClickResult(
  input: CreateAvanzaReviewClickResultInput,
): AvanzaReviewClickResult {
  return {
    ok: input.status === "confirmation_ready",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedAction: input.dryRunOrderInput.action,
    expectedInstrument: {
      ...input.dryRunOrderInput.instrument,
      ticker: input.dryRunOrderInput.instrument.ticker.trim(),
    },
    expectedQuantity: input.dryRunOrderInput.quantity,
    expectedPrice: input.dryRunOrderInput.price,
    confirmationReadback: input.confirmationReadback
      ? normalizeConfirmationReadback(input.confirmationReadback)
      : undefined,
    fieldChecks: input.fieldChecks ?? [],
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(normalizeStringArray(input.blockers)),
    warnings: uniqueStrings(normalizeStringArray(input.warnings)),
    errors: uniqueStrings(normalizeStringArray(input.errors)),
    labels: uniqueStrings([
      ...REVIEW_CLICK_SAFETY_LABELS,
      ...createStatusLabels(input.status),
      ...normalizeStringArray(input.labels),
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_REVIEW_CLICK_CONTRACT_VERSION,
      reviewClickReadbackOnly: true,
      waitingForManualConfirmation: input.status === "confirmation_ready",
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
  };
}

export function evaluateAvanzaReviewClick(
  input: AvanzaReviewClickInput,
  options: EvaluateAvanzaReviewClickOptions = {},
): AvanzaReviewClickResult {
  const metadata = { ...input.metadata, ...options.metadata };
  const unsafeMetadata = metadataSignals(metadata);

  if (
    !input.advancedFormFillResult.ok ||
    input.advancedFormFillResult.status !== "form_filled"
  ) {
    const blocker =
      input.advancedFormFillResult.blockers[0] ??
      input.advancedFormFillResult.errors[0] ??
      `Advanced form must be form_filled before review; received ${input.advancedFormFillResult.status}.`;

    return createAvanzaReviewClickResult({
      status: "form_not_ready",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["form_not_filled"],
      metadata,
    });
  }

  if (
    input.reviewLabel &&
    !normalizedReviewLabelMatches(input.dryRunOrderInput.action, input.reviewLabel)
  ) {
    const blocker =
      "Review/Granska label does not match the dry-run request action.";

    return createAvanzaReviewClickResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["review_label_mismatch"],
      metadata,
    });
  }

  if (!input.confirmationReadback) {
    const blocker = "Sanitized confirmation modal readback is required.";

    return createAvanzaReviewClickResult({
      status: "unavailable",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["confirmation_modal_missing"],
      warnings: ["No browser confirmation modal was inspected by this contract."],
      metadata,
    });
  }

  const readback = normalizeConfirmationReadback(input.confirmationReadback);
  const riskFlags: AvanzaReviewClickRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (input.reviewClickAttempted) {
    riskFlags.push("review_click_attempted");
    warnings.push(
      "Review/Granska click attempt is represented as diagnostics only.",
    );
  }

  if (readback.confirmationModalVisible !== true) {
    const blocker = "Confirmation modal is not visible.";

    return createAvanzaReviewClickResult({
      status: "failed",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      confirmationReadback: readback,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["confirmation_modal_missing"],
      metadata,
    });
  }

  if (readback.validationErrors && readback.validationErrors.length > 0) {
    riskFlags.push("validation_error_visible");

    if (options.blockOnValidationErrors ?? true) {
      return createAvanzaReviewClickResult({
        status: "validation_error",
        checkedAt: options.checkedAt,
        dryRunOrderInput: input.dryRunOrderInput,
        confirmationReadback: readback,
        blockers: readback.validationErrors,
        errors: readback.validationErrors,
        riskFlags,
        metadata,
      });
    }

    warnings.push(...readback.validationErrors);
  }

  if (
    readback.interactionSignals?.finalConfirmClickedOrAttempted ||
    unsafeMetadata.finalConfirmClicked
  ) {
    const blocker =
      "Final-confirm/Bekrafta click was attempted during review-click phase.";

    return createAvanzaReviewClickResult({
      status: "prohibited_final_confirm_detected",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      confirmationReadback: readback,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["final_confirm_clicked_or_attempted"],
      metadata,
    });
  }

  if (
    readback.interactionSignals?.keyboardSubmitDetected ||
    unsafeMetadata.keyboardSubmit
  ) {
    riskFlags.push("keyboard_submit_detected");
    blockers.push("Keyboard submit was detected during review-click phase.");
  }

  if (readback.sensitiveSignals?.accountDataDetected) {
    riskFlags.push("account_data_detected");
    blockers.push("Account data detected in confirmation modal readback.");
  }

  if (readback.sensitiveSignals?.balanceDataDetected) {
    riskFlags.push("balance_data_detected");
    blockers.push("Balance data detected in confirmation modal readback.");
  }

  if (readback.sensitiveSignals?.holdingsDataDetected) {
    riskFlags.push("holdings_data_detected");
    blockers.push("Holdings data detected in confirmation modal readback.");
  }

  if (readback.sensitiveSignals?.sensitiveDataDetected) {
    riskFlags.push("sensitive_data_detected");
    blockers.push("Sensitive data detected in confirmation modal readback.");
  }

  if (blockers.length > 0) {
    return createAvanzaReviewClickResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      confirmationReadback: readback,
      blockers,
      errors: blockers,
      riskFlags,
      metadata,
    });
  }

  if (
    readback.finalConfirmVisible &&
    (options.allowFinalConfirmVisibleAsReadOnly ?? true)
  ) {
    riskFlags.push("final_confirm_visible");
    warnings.push(
      "Final-confirm/Bekrafta control is visible as read-only evidence only.",
    );
  }

  if (
    readback.finalConfirmVisible &&
    options.allowFinalConfirmVisibleAsReadOnly === false
  ) {
    const blocker =
      "Final-confirm/Bekrafta control visibility is blocked by policy.";

    return createAvanzaReviewClickResult({
      status: "prohibited_final_confirm_detected",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      confirmationReadback: readback,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["final_confirm_visible"],
      metadata,
    });
  }

  if (
    options.requireCancelButtonVisible === true &&
    !readback.cancelButtonVisible
  ) {
    warnings.push("Cancel/back control is not visible in sanitized readback.");
  }

  const expectedInstrument = input.dryRunOrderInput.instrument;
  const fieldChecks: AvanzaReviewClickFieldCheck[] = [
    textFieldCheck("action", input.dryRunOrderInput.action, readback.action, true, {
      missingModalMessage: "Confirmation modal action is missing.",
      mismatchMessage:
        "Confirmation modal action does not match the dry-run request.",
    }),
    textFieldCheck("ticker", expectedInstrument.ticker, readback.ticker, true, {
      missingModalMessage: "Confirmation modal ticker is missing.",
      mismatchMessage:
        "Confirmation modal ticker does not match the dry-run request.",
    }),
    textFieldCheck("name", expectedInstrument.name, readback.name, false, {
      missingModalMessage:
        "Confirmation modal instrument name is missing and must be reviewed manually.",
      mismatchMessage:
        "Confirmation modal instrument name does not match the dry-run request.",
    }),
    textFieldCheck("market", expectedInstrument.market, readback.market, false, {
      missingModalMessage:
        "Confirmation modal market is missing and must be reviewed manually.",
      mismatchMessage:
        "Confirmation modal market does not match the dry-run request.",
    }),
    textFieldCheck(
      "currency",
      expectedInstrument.currency,
      readback.currency,
      false,
      {
        missingModalMessage:
          "Confirmation modal currency is missing and must be reviewed manually.",
        mismatchMessage:
          "Confirmation modal currency does not match the dry-run request.",
      },
    ),
    textFieldCheck(
      "instrumentType",
      expectedInstrument.instrumentType,
      readback.instrumentType,
      false,
      {
        missingModalMessage:
          "Confirmation modal instrument type is missing and must be reviewed manually.",
        mismatchMessage:
          "Confirmation modal instrument type does not match the dry-run request.",
      },
    ),
    numericFieldCheck(
      "quantity",
      input.dryRunOrderInput.quantity,
      readback.quantityValue,
      0,
      {
        missing: "Confirmation modal quantity is missing.",
        invalid:
          "Confirmation modal quantity must be a positive finite number.",
        mismatch:
          "Confirmation modal quantity does not match the dry-run request.",
      },
    ),
    numericFieldCheck(
      "price",
      input.dryRunOrderInput.price,
      readback.priceValue,
      options.priceTolerance ?? AVANZA_REVIEW_CLICK_PRICE_TOLERANCE,
      {
        missing: "Confirmation modal price/course is missing.",
        invalid:
          "Confirmation modal price/course must be a positive finite number.",
        mismatch:
          "Confirmation modal price/course does not match the dry-run request.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch" || check.status === "missing_modal") {
      const flag = riskFlagForFieldCheck(check);
      riskFlags.push(flag);

      if (check.required) {
        const message = check.message ?? `${check.field} mismatch.`;
        blockers.push(message);
        errors.push(message);
      } else {
        warnings.push(check.message ?? `${check.field} requires manual review.`);
      }
    }

    if (check.status === "missing_expected" || check.status === "warning") {
      warnings.push(check.message ?? `${check.field} requires manual review.`);
    }
  }

  if (readback.fees === undefined || readback.fees === null) {
    warnings.push("Confirmation modal fees/courtage are missing.");
  }

  if (readback.totalAmount === undefined || readback.totalAmount === null) {
    warnings.push("Confirmation modal total amount is missing.");
  }

  if (!readback.validUntil) {
    warnings.push("Confirmation modal valid-until value is missing.");
  }

  if (blockers.length > 0) {
    return createAvanzaReviewClickResult({
      status: "confirmation_mismatch",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      confirmationReadback: readback,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
      metadata,
    });
  }

  return createAvanzaReviewClickResult({
    status: "confirmation_ready",
    checkedAt: options.checkedAt,
    dryRunOrderInput: input.dryRunOrderInput,
    confirmationReadback: readback,
    fieldChecks,
    riskFlags,
    warnings,
    metadata,
  });
}

export function summarizeAvanzaReviewClickResult(
  result: AvanzaReviewClickResult,
) {
  switch (result.status) {
    case "confirmation_ready":
      return `Confirmation modal ready for manual confirmation: ${result.expectedAction} ${result.expectedInstrument.ticker} ${result.expectedQuantity} @ ${result.expectedPrice}. No broker result or order submission occurred.`;
    case "form_not_ready":
      return "Advanced form is not ready for review-click diagnostics.";
    case "review_click_allowed":
      return "Review click is allowed by contract, but no browser action was executed.";
    case "confirmation_detected":
      return "Confirmation modal detected; readback still requires verification.";
    case "confirmation_mismatch":
      return result.errors.length > 0
        ? `Confirmation mismatch: ${result.errors[0]}`
        : "Confirmation readback mismatch.";
    case "validation_error":
      return result.errors.length > 0
        ? `Validation error: ${result.errors[0]}`
        : "Validation error visible in confirmation modal.";
    case "prohibited_final_confirm_detected":
      return result.errors.length > 0
        ? `Blocked: ${result.errors[0]}`
        : "Blocked: prohibited Bekrafta detected.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: review-click diagnostics cannot continue safely.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Review-click diagnostics failed.";
    case "unavailable":
    default:
      return result.errors.length > 0
        ? `Unavailable: ${result.errors[0]}`
        : "Review-click diagnostics unavailable.";
  }
}

export function getAvanzaReviewClickSafetyLabels(
  result: AvanzaReviewClickResult,
) {
  return uniqueStrings([...REVIEW_CLICK_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaConfirmationReady(result: AvanzaReviewClickResult) {
  return result.ok && result.status === "confirmation_ready";
}
