import type { AvanzaDryRunOrderInput } from "./avanza-dry-run-request-contract";
import type { AvanzaOrderPageOpenResult } from "./avanza-order-page-open-contract";
import { normalizeAvanzaSearchOnlyText } from "./avanza-search-only-result-contract";

export const AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION =
  "avanza_advanced_form_fill_v1" as const;

export type AvanzaAdvancedFormFillStatus =
  | "unavailable"
  | "order_page_not_ready"
  | "unsupported_order_mode"
  | "form_filled"
  | "field_mismatch"
  | "validation_error"
  | "prohibited_review_detected"
  | "prohibited_final_confirm_detected"
  | "blocked"
  | "failed";

export type AvanzaAdvancedFormFillRiskFlag =
  | "order_page_not_opened"
  | "missing_form_state"
  | "unsupported_order_mode"
  | "stop_loss_mode_detected"
  | "glidande_mode_detected"
  | "action_mismatch"
  | "ticker_mismatch"
  | "instrument_mismatch"
  | "missing_quantity"
  | "invalid_quantity"
  | "quantity_mismatch"
  | "missing_price"
  | "invalid_price"
  | "price_mismatch"
  | "validation_error_visible"
  | "review_button_visible"
  | "review_button_clicked_or_attempted"
  | "final_confirm_detected"
  | "final_confirm_clicked_or_attempted"
  | "keyboard_submit_detected"
  | "account_changed"
  | "account_data_detected"
  | "balance_data_detected"
  | "holdings_data_detected"
  | "sensitive_data_detected"
  | "unsupported_field_touched";

export type AvanzaAdvancedFormFillFieldStatus =
  | "match"
  | "mismatch"
  | "missing_expected"
  | "missing_actual"
  | "invalid_actual"
  | "warning";

export type AvanzaAdvancedFormOrderMode =
  | "advanced"
  | "stop_loss"
  | "glidande"
  | "unknown";

export type AvanzaAdvancedFormFillControls = {
  reviewButtonVisible?: boolean;
  reviewButtonClickedOrAttempted?: boolean;
  finalConfirmVisible?: boolean;
  finalConfirmClickedOrAttempted?: boolean;
};

export type AvanzaAdvancedFormFillInteractionSignals = {
  keyboardSubmitDetected?: boolean;
  accountChanged?: boolean;
  unsupportedFieldTouched?: boolean;
  stopLossTabActive?: boolean;
  glidandeTabActive?: boolean;
};

export type AvanzaAdvancedFormFillSensitiveSignals = {
  accountDataDetected?: boolean;
  balanceDataDetected?: boolean;
  holdingsDataDetected?: boolean;
  sensitiveDataDetected?: boolean;
};

export type AvanzaAdvancedFormFillValidationState = {
  validationErrorsVisible?: boolean;
  validationMessages?: string[];
};

export type AvanzaAdvancedFormState = {
  action?: "buy" | "sell" | "unknown";
  ticker?: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  orderMode?: AvanzaAdvancedFormOrderMode;
  quantity?: number | string;
  price?: number | string;
  amount?: number | string;
  estimatedTotal?: number | string;
  controls?: AvanzaAdvancedFormFillControls;
  interactions?: AvanzaAdvancedFormFillInteractionSignals;
  sensitiveSignals?: AvanzaAdvancedFormFillSensitiveSignals;
  validation?: AvanzaAdvancedFormFillValidationState;
  metadata?: Record<string, unknown>;
};

export type AvanzaAdvancedFormFillFieldCheck = {
  field: string;
  expected?: string;
  actual?: string;
  status: AvanzaAdvancedFormFillFieldStatus;
  required: boolean;
  message?: string;
};

export type AvanzaAdvancedFormFillInput = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  orderPageOpenResult: AvanzaOrderPageOpenResult;
  formState?: AvanzaAdvancedFormState;
  metadata?: Record<string, unknown>;
};

export type AvanzaAdvancedFormFillResult = {
  ok: boolean;
  status: AvanzaAdvancedFormFillStatus;
  checkedAt: string;
  expectedAction: AvanzaDryRunOrderInput["action"];
  expectedInstrument: AvanzaDryRunOrderInput["instrument"];
  expectedQuantity: number;
  expectedPrice: number;
  formState?: AvanzaAdvancedFormState;
  fieldChecks: AvanzaAdvancedFormFillFieldCheck[];
  riskFlags: AvanzaAdvancedFormFillRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaAdvancedFormFillResultInput = {
  status: AvanzaAdvancedFormFillStatus;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  formState?: AvanzaAdvancedFormState;
  fieldChecks?: AvanzaAdvancedFormFillFieldCheck[];
  riskFlags?: AvanzaAdvancedFormFillRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EvaluateAvanzaAdvancedFormFillOptions = {
  requireMarketMatch?: boolean;
  requireCurrencyMatch?: boolean;
  requireInstrumentTypeMatch?: boolean;
  blockOnReviewButtonVisible?: boolean;
  priceTolerance?: number;
  quantityTolerance?: number;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const ADVANCED_FORM_FILL_SAFETY_LABELS = [
  "Advanced form fill only",
  "No Granska click",
  "No Bekräfta click",
  "No keyboard submit",
  "No broker submission",
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

function uniqueRiskFlags(values: readonly AvanzaAdvancedFormFillRiskFlag[]) {
  return [...new Set(values)];
}

function normalizeOrderMode(value: unknown): AvanzaAdvancedFormOrderMode {
  if (value === "advanced" || value === "stop_loss" || value === "glidande") {
    return value;
  }

  return "unknown";
}

function normalizeFormState(
  formState: AvanzaAdvancedFormState,
): AvanzaAdvancedFormState {
  return {
    action:
      formState.action === "buy" || formState.action === "sell"
        ? formState.action
        : formState.action === "unknown"
          ? "unknown"
          : undefined,
    ticker: optionalText(formState.ticker),
    name: optionalText(formState.name),
    market: optionalText(formState.market),
    currency: optionalText(formState.currency),
    instrumentType: optionalText(formState.instrumentType),
    orderMode: normalizeOrderMode(formState.orderMode),
    quantity: formState.quantity,
    price: formState.price,
    amount: formState.amount,
    estimatedTotal: formState.estimatedTotal,
    controls: formState.controls ? { ...formState.controls } : undefined,
    interactions: formState.interactions
      ? { ...formState.interactions }
      : undefined,
    sensitiveSignals: formState.sensitiveSignals
      ? { ...formState.sensitiveSignals }
      : undefined,
    validation: formState.validation
      ? {
          validationErrorsVisible:
            formState.validation.validationErrorsVisible === true,
          validationMessages: normalizeStringArray(
            formState.validation.validationMessages,
          ),
        }
      : undefined,
    metadata:
      typeof formState.metadata === "object" &&
      formState.metadata !== null &&
      !Array.isArray(formState.metadata)
        ? formState.metadata
        : undefined,
  };
}

function createStatusLabels(status: AvanzaAdvancedFormFillStatus) {
  const labels: Record<AvanzaAdvancedFormFillStatus, string[]> = {
    unavailable: ["Advanced form fill unavailable"],
    order_page_not_ready: ["Order page not ready"],
    unsupported_order_mode: ["Unsupported order mode"],
    form_filled: ["Advanced form filled"],
    field_mismatch: ["Advanced form field mismatch"],
    validation_error: ["Advanced form validation error"],
    prohibited_review_detected: ["Prohibited Granska detected"],
    prohibited_final_confirm_detected: ["Prohibited Bekräfta detected"],
    blocked: ["Advanced form fill blocked"],
    failed: ["Advanced form fill failed"],
  };

  return labels[status];
}

function normalizedMatches(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
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
): AvanzaAdvancedFormFillFieldCheck {
  if (actualInput === undefined || actualInput === null || actualInput === "") {
    return {
      field,
      expected: String(expected),
      required: true,
      status: "missing_actual",
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
      status: "invalid_actual",
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

function textFieldCheck(
  field: string,
  expected: string | undefined,
  actual: string | undefined,
  required: boolean,
  options: {
    missingExpectedMessage?: string;
    missingActualMessage: string;
    mismatchMessage: string;
  },
): AvanzaAdvancedFormFillFieldCheck {
  if (!expected) {
    return {
      field,
      actual,
      required: false,
      status: "missing_expected",
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; form-fill confidence is lower.`,
    };
  }

  if (!actual) {
    return {
      field,
      expected,
      required,
      status: "missing_actual",
      message: options.missingActualMessage,
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

function riskFlagForFieldCheck(
  check: AvanzaAdvancedFormFillFieldCheck,
): AvanzaAdvancedFormFillRiskFlag {
  switch (check.field) {
    case "action":
      return "action_mismatch";
    case "ticker":
      return "ticker_mismatch";
    case "quantity":
      if (check.status === "missing_actual") {
        return "missing_quantity";
      }

      if (check.status === "invalid_actual") {
        return "invalid_quantity";
      }

      return "quantity_mismatch";
    case "price":
      if (check.status === "missing_actual") {
        return "missing_price";
      }

      if (check.status === "invalid_actual") {
        return "invalid_price";
      }

      return "price_mismatch";
    default:
      return "instrument_mismatch";
  }
}

export function createAvanzaAdvancedFormFillResult(
  input: CreateAvanzaAdvancedFormFillResultInput,
): AvanzaAdvancedFormFillResult {
  return {
    ok: input.status === "form_filled",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedAction: input.dryRunOrderInput.action,
    expectedInstrument: {
      ...input.dryRunOrderInput.instrument,
      ticker: input.dryRunOrderInput.instrument.ticker.trim(),
    },
    expectedQuantity: input.dryRunOrderInput.quantity,
    expectedPrice: input.dryRunOrderInput.price,
    formState: input.formState
      ? normalizeFormState(input.formState)
      : undefined,
    fieldChecks: input.fieldChecks ?? [],
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(normalizeStringArray(input.blockers)),
    warnings: uniqueStrings(normalizeStringArray(input.warnings)),
    errors: uniqueStrings(normalizeStringArray(input.errors)),
    labels: uniqueStrings([
      ...ADVANCED_FORM_FILL_SAFETY_LABELS,
      ...createStatusLabels(input.status),
      ...normalizeStringArray(input.labels),
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_ADVANCED_FORM_FILL_CONTRACT_VERSION,
      advancedFormFillOnly: true,
      noReviewClick: true,
      noFinalConfirmClick: true,
      noKeyboardSubmit: true,
      noBrokerSubmission: true,
      noBrokerResult: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
  };
}

function metadataSignals(metadata: Record<string, unknown>) {
  return {
    reviewClicked:
      metadata.reviewButtonClickedOrAttempted === true ||
      metadata.granskaClickedOrAttempted === true,
    finalConfirmClicked:
      metadata.finalConfirmClickedOrAttempted === true ||
      metadata.bekraftaClickedOrAttempted === true,
    keyboardSubmit: metadata.keyboardSubmitDetected === true,
    accountChanged: metadata.accountChanged === true,
    unsupportedFieldTouched: metadata.unsupportedFieldTouched === true,
  };
}

export function evaluateAvanzaAdvancedFormFill(
  input: AvanzaAdvancedFormFillInput,
  options: EvaluateAvanzaAdvancedFormFillOptions = {},
): AvanzaAdvancedFormFillResult {
  const metadata = { ...input.metadata, ...options.metadata };

  if (
    !input.orderPageOpenResult.ok ||
    input.orderPageOpenResult.status !== "order_page_opened"
  ) {
    const blocker =
      input.orderPageOpenResult.blockers[0] ??
      input.orderPageOpenResult.errors[0] ??
      `Order page must be order_page_opened before form fill; received ${input.orderPageOpenResult.status}.`;

    return createAvanzaAdvancedFormFillResult({
      status: "order_page_not_ready",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["order_page_not_opened"],
      metadata,
    });
  }

  const unsafeMetadata = metadataSignals(metadata);

  if (unsafeMetadata.reviewClicked) {
    const blocker = "Review/Granska click was attempted during form fill.";

    return createAvanzaAdvancedFormFillResult({
      status: "prohibited_review_detected",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["review_button_clicked_or_attempted"],
      metadata,
    });
  }

  if (unsafeMetadata.finalConfirmClicked) {
    const blocker =
      "Final-confirm/Bekrafta click was attempted during form fill.";

    return createAvanzaAdvancedFormFillResult({
      status: "prohibited_final_confirm_detected",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["final_confirm_clicked_or_attempted"],
      metadata,
    });
  }

  if (!input.formState) {
    const blocker = "Sanitized Advanced form state is required.";

    return createAvanzaAdvancedFormFillResult({
      status: "unavailable",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["missing_form_state"],
      metadata,
      warnings: ["No browser form was inspected or filled by this contract."],
    });
  }

  const formState = normalizeFormState(input.formState);
  const riskFlags: AvanzaAdvancedFormFillRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const orderMode = formState.orderMode ?? "unknown";

  if (orderMode !== "advanced") {
    const blocker =
      orderMode === "stop_loss"
        ? "Stop Loss order mode is not supported in Advanced form-fill phase."
        : orderMode === "glidande"
          ? "Glidande order mode is not supported in Advanced form-fill phase."
          : "Advanced order mode must be verified before form fill.";

    riskFlags.push(
      orderMode === "stop_loss"
        ? "stop_loss_mode_detected"
        : orderMode === "glidande"
          ? "glidande_mode_detected"
          : "unsupported_order_mode",
    );

    return createAvanzaAdvancedFormFillResult({
      status: "unsupported_order_mode",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      formState,
      blockers: [blocker],
      errors: [blocker],
      riskFlags,
      metadata,
    });
  }

  if (formState.interactions?.stopLossTabActive) {
    riskFlags.push("stop_loss_mode_detected");
    blockers.push("Stop Loss tab is active during Advanced form fill.");
  }

  if (formState.interactions?.glidandeTabActive) {
    riskFlags.push("glidande_mode_detected");
    blockers.push("Glidande tab is active during Advanced form fill.");
  }

  if (
    formState.controls?.reviewButtonClickedOrAttempted ||
    unsafeMetadata.reviewClicked
  ) {
    riskFlags.push("review_button_clicked_or_attempted");
    return createAvanzaAdvancedFormFillResult({
      status: "prohibited_review_detected",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      formState,
      blockers: ["Review/Granska click was attempted during form fill."],
      errors: ["Review/Granska click was attempted during form fill."],
      riskFlags,
      metadata,
    });
  }

  if (
    formState.controls?.finalConfirmVisible ||
    formState.controls?.finalConfirmClickedOrAttempted ||
    unsafeMetadata.finalConfirmClicked
  ) {
    riskFlags.push(
      formState.controls?.finalConfirmClickedOrAttempted ||
        unsafeMetadata.finalConfirmClicked
        ? "final_confirm_clicked_or_attempted"
        : "final_confirm_detected",
    );

    return createAvanzaAdvancedFormFillResult({
      status: "prohibited_final_confirm_detected",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      formState,
      blockers: ["Final-confirm/Bekrafta control detected during form fill."],
      errors: ["Final-confirm/Bekrafta control detected during form fill."],
      riskFlags,
      metadata,
    });
  }

  if (formState.interactions?.keyboardSubmitDetected || unsafeMetadata.keyboardSubmit) {
    riskFlags.push("keyboard_submit_detected");
    blockers.push("Keyboard submit was detected during form fill.");
  }

  if (formState.interactions?.accountChanged || unsafeMetadata.accountChanged) {
    riskFlags.push("account_changed");
    blockers.push("Account changed during Advanced form fill.");
  }

  if (
    formState.interactions?.unsupportedFieldTouched ||
    unsafeMetadata.unsupportedFieldTouched
  ) {
    riskFlags.push("unsupported_field_touched");
    blockers.push("Unsupported field was touched during Advanced form fill.");
  }

  if (formState.sensitiveSignals?.accountDataDetected) {
    riskFlags.push("account_data_detected");
    blockers.push("Account data detected during Advanced form fill.");
  }

  if (formState.sensitiveSignals?.balanceDataDetected) {
    riskFlags.push("balance_data_detected");
    blockers.push("Balance data detected during Advanced form fill.");
  }

  if (formState.sensitiveSignals?.holdingsDataDetected) {
    riskFlags.push("holdings_data_detected");
    blockers.push("Holdings data detected during Advanced form fill.");
  }

  if (formState.sensitiveSignals?.sensitiveDataDetected) {
    riskFlags.push("sensitive_data_detected");
    blockers.push("Sensitive data detected during Advanced form fill.");
  }

  if (blockers.length > 0) {
    return createAvanzaAdvancedFormFillResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      formState,
      blockers,
      errors: blockers,
      riskFlags,
      metadata,
    });
  }

  if (formState.validation?.validationErrorsVisible) {
    const validationMessages =
      formState.validation.validationMessages &&
      formState.validation.validationMessages.length > 0
        ? formState.validation.validationMessages
        : ["Validation error is visible on the Advanced form."];

    return createAvanzaAdvancedFormFillResult({
      status: "validation_error",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      formState,
      blockers: validationMessages,
      errors: validationMessages,
      riskFlags: ["validation_error_visible"],
      metadata,
    });
  }

  const expectedInstrument = input.dryRunOrderInput.instrument;
  const requireMarketMatch =
    options.requireMarketMatch ?? Boolean(expectedInstrument.market);
  const requireCurrencyMatch =
    options.requireCurrencyMatch ?? Boolean(expectedInstrument.currency);
  const requireInstrumentTypeMatch =
    options.requireInstrumentTypeMatch ?? Boolean(expectedInstrument.instrumentType);
  const fieldChecks: AvanzaAdvancedFormFillFieldCheck[] = [
    textFieldCheck("action", input.dryRunOrderInput.action, formState.action, true, {
      missingActualMessage: "Advanced form action is missing.",
      mismatchMessage: "Advanced form action does not match the dry-run request.",
    }),
    textFieldCheck("ticker", expectedInstrument.ticker, formState.ticker, true, {
      missingActualMessage: "Advanced form ticker is missing.",
      mismatchMessage: "Advanced form ticker does not match the dry-run request.",
    }),
    textFieldCheck(
      "market",
      expectedInstrument.market,
      formState.market,
      requireMarketMatch,
      {
        missingActualMessage: "Advanced form market is missing.",
        mismatchMessage:
          "Advanced form market does not match the dry-run request.",
      },
    ),
    textFieldCheck(
      "currency",
      expectedInstrument.currency,
      formState.currency,
      requireCurrencyMatch,
      {
        missingActualMessage: "Advanced form currency is missing.",
        mismatchMessage:
          "Advanced form currency does not match the dry-run request.",
      },
    ),
    textFieldCheck(
      "instrumentType",
      expectedInstrument.instrumentType,
      formState.instrumentType,
      requireInstrumentTypeMatch,
      {
        missingActualMessage: "Advanced form instrument type is missing.",
        mismatchMessage:
          "Advanced form instrument type does not match the dry-run request.",
      },
    ),
    numericFieldCheck(
      "quantity",
      input.dryRunOrderInput.quantity,
      formState.quantity,
      options.quantityTolerance ?? 0,
      {
        missing: "Advanced form quantity is missing.",
        invalid: "Advanced form quantity must be a positive finite number.",
        mismatch:
          "Advanced form quantity does not match the dry-run request.",
      },
    ),
    numericFieldCheck(
      "price",
      input.dryRunOrderInput.price,
      formState.price,
      options.priceTolerance ?? 0.000001,
      {
        missing: "Advanced form price/course is missing.",
        invalid: "Advanced form price/course must be a positive finite number.",
        mismatch:
          "Advanced form price/course does not match the dry-run request.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (
      check.status === "mismatch" ||
      check.status === "missing_actual" ||
      check.status === "invalid_actual"
    ) {
      const flag = riskFlagForFieldCheck(check);
      riskFlags.push(flag);

      if (check.required) {
        blockers.push(check.message ?? `${check.field} mismatch.`);
        errors.push(check.message ?? `${check.field} mismatch.`);
      } else {
        warnings.push(check.message ?? `${check.field} requires review.`);
      }
    }

    if (check.status === "missing_expected" || check.status === "warning") {
      warnings.push(check.message ?? `${check.field} requires manual review.`);
    }
  }

  if (formState.controls?.reviewButtonVisible) {
    riskFlags.push("review_button_visible");
    warnings.push("Review/Granska button visible; no click allowed.");

    if (options.blockOnReviewButtonVisible === true) {
      blockers.push("Review/Granska button visibility blocks form-fill check.");
      errors.push("Review/Granska button visibility blocks form-fill check.");
    }
  }

  if (blockers.length > 0) {
    return createAvanzaAdvancedFormFillResult({
      status: "field_mismatch",
      checkedAt: options.checkedAt,
      dryRunOrderInput: input.dryRunOrderInput,
      formState,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
      metadata,
    });
  }

  return createAvanzaAdvancedFormFillResult({
    status: "form_filled",
    checkedAt: options.checkedAt,
    dryRunOrderInput: input.dryRunOrderInput,
    formState,
    fieldChecks,
    riskFlags,
    warnings,
    metadata,
  });
}

export function summarizeAvanzaAdvancedFormFillResult(
  result: AvanzaAdvancedFormFillResult,
) {
  switch (result.status) {
    case "form_filled":
      return `Advanced form filled for ${result.expectedAction} ${result.expectedInstrument.ticker}: ${result.expectedQuantity} @ ${result.expectedPrice}.`;
    case "order_page_not_ready":
      return "Order page is not ready for Advanced form fill.";
    case "unsupported_order_mode":
      return result.errors.length > 0
        ? `Unsupported order mode: ${result.errors[0]}`
        : "Unsupported order mode.";
    case "field_mismatch":
      return result.errors.length > 0
        ? `Advanced form field mismatch: ${result.errors[0]}`
        : "Advanced form field mismatch.";
    case "validation_error":
      return result.errors.length > 0
        ? `Advanced form validation error: ${result.errors[0]}`
        : "Advanced form validation error.";
    case "prohibited_review_detected":
      return result.errors.length > 0
        ? `Blocked: ${result.errors[0]}`
        : "Blocked: prohibited Granska detected.";
    case "prohibited_final_confirm_detected":
      return result.errors.length > 0
        ? `Blocked: ${result.errors[0]}`
        : "Blocked: prohibited Bekrafta detected.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: Advanced form fill cannot continue safely.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Advanced form fill check failed.";
    case "unavailable":
    default:
      return result.errors.length > 0
        ? `Unavailable: ${result.errors[0]}`
        : "Advanced form fill check unavailable.";
  }
}

export function getAvanzaAdvancedFormFillSafetyLabels(
  result: AvanzaAdvancedFormFillResult,
) {
  return uniqueStrings([...ADVANCED_FORM_FILL_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaAdvancedFormFilled(
  result: AvanzaAdvancedFormFillResult,
) {
  return result.ok && result.status === "form_filled";
}
