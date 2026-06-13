import type { AvanzaDryRunOrderInput } from "./avanza-dry-run-request-contract";
import type { AvanzaInstrumentPageResult } from "./avanza-instrument-page-contract";
import { normalizeAvanzaSearchOnlyText } from "./avanza-search-only-result-contract";

export const AVANZA_ORDER_PAGE_OPEN_CONTRACT_VERSION =
  "avanza_order_page_open_v1" as const;

export type AvanzaOrderPageOpenAction = "buy" | "sell";

export type AvanzaOrderPageOpenStatus =
  | "unavailable"
  | "instrument_page_not_ready"
  | "action_not_supported"
  | "order_page_opened"
  | "order_page_mismatch"
  | "wrong_action_opened"
  | "prohibited_form_interaction_detected"
  | "blocked"
  | "failed";

export type AvanzaOrderPageOpenRiskFlag =
  | "instrument_page_not_identified"
  | "action_mismatch"
  | "unsupported_action"
  | "ambiguous_entry_control"
  | "generic_primary_button_detected"
  | "order_page_wrong_instrument"
  | "order_page_wrong_action"
  | "missing_order_page_instrument"
  | "missing_order_page_action"
  | "account_data_detected"
  | "balance_data_detected"
  | "holdings_data_detected"
  | "order_form_prefilled"
  | "review_button_visible"
  | "review_button_clicked_or_attempted"
  | "final_confirm_detected"
  | "final_confirm_clicked_or_attempted"
  | "keyboard_submit_detected"
  | "sensitive_data_detected";

export type AvanzaOrderPageContext =
  | "unknown"
  | "instrument_page"
  | "order_page"
  | "confirmation_modal";

export type AvanzaOrderPageOpenFieldStatus =
  | "match"
  | "mismatch"
  | "missing_expected"
  | "missing_page"
  | "warning";

export type AvanzaOrderPageOpenControls = {
  reviewButtonVisible?: boolean;
  finalConfirmVisible?: boolean;
  buyButtonVisible?: boolean;
  sellButtonVisible?: boolean;
};

export type AvanzaOrderPageOpenFormSignals = {
  quantityFieldVisible?: boolean;
  priceFieldVisible?: boolean;
  accountFieldVisible?: boolean;
  anyFieldPrefilled?: boolean;
};

export type AvanzaOrderPageOpenSensitiveSignals = {
  accountDataDetected?: boolean;
  balanceDataDetected?: boolean;
  holdingsDataDetected?: boolean;
  sensitiveDataDetected?: boolean;
};

export type AvanzaOrderPageIdentity = {
  action?: AvanzaOrderPageOpenAction | "unknown";
  ticker?: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  pageContext?: AvanzaOrderPageContext;
  sanitizedTitle?: string;
  sanitizedHostClass?: string;
  controls?: AvanzaOrderPageOpenControls;
  formSignals?: AvanzaOrderPageOpenFormSignals;
  sensitiveSignals?: AvanzaOrderPageOpenSensitiveSignals;
  metadata?: Record<string, unknown>;
};

export type AvanzaOrderPageOpenFieldCheck = {
  field: string;
  expected?: string;
  actual?: string;
  status: AvanzaOrderPageOpenFieldStatus;
  required: boolean;
  message?: string;
};

export type AvanzaOrderPageOpenInput = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  instrumentPageResult: AvanzaInstrumentPageResult;
  orderPageIdentity?: AvanzaOrderPageIdentity;
  attemptedAction?: AvanzaOrderPageOpenAction;
  metadata?: Record<string, unknown>;
};

export type AvanzaOrderPageOpenResult = {
  ok: boolean;
  status: AvanzaOrderPageOpenStatus;
  checkedAt: string;
  expectedAction?: AvanzaOrderPageOpenAction;
  expectedInstrument: AvanzaDryRunOrderInput["instrument"];
  orderPageIdentity?: AvanzaOrderPageIdentity;
  fieldChecks: AvanzaOrderPageOpenFieldCheck[];
  riskFlags: AvanzaOrderPageOpenRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaOrderPageOpenResultInput = {
  status: AvanzaOrderPageOpenStatus;
  expectedAction?: AvanzaOrderPageOpenAction;
  expectedInstrument: AvanzaDryRunOrderInput["instrument"];
  orderPageIdentity?: AvanzaOrderPageIdentity;
  fieldChecks?: AvanzaOrderPageOpenFieldCheck[];
  riskFlags?: AvanzaOrderPageOpenRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EvaluateAvanzaOrderPageOpenOptions = {
  requireMarketMatch?: boolean;
  requireCurrencyMatch?: boolean;
  requireInstrumentTypeMatch?: boolean;
  blockOnReviewButtonVisible?: boolean;
  blockOnAnyPrefill?: boolean;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const ORDER_PAGE_OPEN_SAFETY_LABELS = [
  "Order page open only",
  "No form fill",
  "No Granska click",
  "No Bekräfta click",
  "No broker submission",
  "No trade mutation",
] as const;

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
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

function uniqueRiskFlags(values: readonly AvanzaOrderPageOpenRiskFlag[]) {
  return [...new Set(values)];
}

function normalizeAction(
  value: unknown,
): AvanzaOrderPageOpenAction | "unknown" | undefined {
  if (value === "buy" || value === "sell" || value === "unknown") {
    return value;
  }

  return undefined;
}

function normalizeExpectedInstrument(
  instrument: AvanzaDryRunOrderInput["instrument"],
): AvanzaDryRunOrderInput["instrument"] {
  return {
    ticker: optionalText(instrument.ticker) ?? "",
    name: optionalText(instrument.name),
    market: optionalText(instrument.market),
    currency: optionalText(instrument.currency),
    instrumentType: optionalText(instrument.instrumentType),
  };
}

function normalizeOrderPageIdentity(
  identity: AvanzaOrderPageIdentity,
): AvanzaOrderPageIdentity {
  return {
    action: normalizeAction(identity.action) ?? "unknown",
    ticker: optionalText(identity.ticker),
    name: optionalText(identity.name),
    market: optionalText(identity.market),
    currency: optionalText(identity.currency),
    instrumentType: optionalText(identity.instrumentType),
    pageContext: identity.pageContext ?? "unknown",
    sanitizedTitle: optionalText(identity.sanitizedTitle),
    sanitizedHostClass: optionalText(identity.sanitizedHostClass),
    controls: identity.controls ? { ...identity.controls } : undefined,
    formSignals: identity.formSignals ? { ...identity.formSignals } : undefined,
    sensitiveSignals: identity.sensitiveSignals
      ? { ...identity.sensitiveSignals }
      : undefined,
    metadata:
      typeof identity.metadata === "object" &&
      identity.metadata !== null &&
      !Array.isArray(identity.metadata)
        ? identity.metadata
        : undefined,
  };
}

function createStatusLabels(status: AvanzaOrderPageOpenStatus) {
  const labels: Record<AvanzaOrderPageOpenStatus, string[]> = {
    unavailable: ["Order page open unavailable"],
    instrument_page_not_ready: ["Instrument page not ready"],
    action_not_supported: ["Order page action not supported"],
    order_page_opened: ["Order page opened"],
    order_page_mismatch: ["Order page mismatch"],
    wrong_action_opened: ["Wrong action opened"],
    prohibited_form_interaction_detected: [
      "Prohibited form interaction detected",
    ],
    blocked: ["Order page open blocked"],
    failed: ["Order page open failed"],
  };

  return labels[status];
}

function normalizedMatches(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

function normalizedSimilar(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return (
    normalizedLeft.length > 0 &&
    normalizedRight.length > 0 &&
    (normalizedLeft.includes(normalizedRight) ||
      normalizedRight.includes(normalizedLeft))
  );
}

function fieldCheck(
  field: string,
  expected: string | undefined,
  actual: string | undefined,
  required: boolean,
  options: {
    mismatchMessage: string;
    missingExpectedMessage?: string;
    missingPageMessage: string;
    allowSimilar?: boolean;
    similarMessage?: string;
  },
): AvanzaOrderPageOpenFieldCheck {
  if (!expected) {
    return {
      field,
      actual,
      required: false,
      status: "missing_expected",
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; order page identity confidence is lower.`,
    };
  }

  if (!actual) {
    return {
      field,
      expected,
      required,
      status: "missing_page",
      message: options.missingPageMessage,
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

  if (options.allowSimilar && normalizedSimilar(expected, actual)) {
    return {
      field,
      expected,
      actual,
      required,
      status: "warning",
      message:
        options.similarMessage ??
        `Order page ${field} is a partial match and requires manual review.`,
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

function riskFlagForMissingField(
  field: string,
): AvanzaOrderPageOpenRiskFlag {
  switch (field) {
    case "action":
      return "missing_order_page_action";
    case "ticker":
    case "name":
    case "market":
    case "currency":
    case "instrumentType":
      return "missing_order_page_instrument";
    default:
      return "missing_order_page_instrument";
  }
}

export function createAvanzaOrderPageOpenResult(
  input: CreateAvanzaOrderPageOpenResultInput,
): AvanzaOrderPageOpenResult {
  return {
    ok: input.status === "order_page_opened",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedAction: input.expectedAction,
    expectedInstrument: normalizeExpectedInstrument(input.expectedInstrument),
    orderPageIdentity: input.orderPageIdentity
      ? normalizeOrderPageIdentity(input.orderPageIdentity)
      : undefined,
    fieldChecks: input.fieldChecks ?? [],
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(normalizeStringArray(input.blockers)),
    warnings: uniqueStrings(normalizeStringArray(input.warnings)),
    errors: uniqueStrings(normalizeStringArray(input.errors)),
    labels: uniqueStrings([
      ...ORDER_PAGE_OPEN_SAFETY_LABELS,
      ...createStatusLabels(input.status),
      ...normalizeStringArray(input.labels),
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_ORDER_PAGE_OPEN_CONTRACT_VERSION,
      orderPageOpenOnly: true,
      noFormFill: true,
      noReviewClick: true,
      noFinalConfirmClick: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function hasUnsafeMetadata(metadata: Record<string, unknown> | undefined) {
  return {
    reviewClicked:
      metadata?.reviewButtonClickedOrAttempted === true ||
      metadata?.granskaClickedOrAttempted === true,
    finalConfirmClicked:
      metadata?.finalConfirmClickedOrAttempted === true ||
      metadata?.bekraftaClickedOrAttempted === true,
    keyboardSubmit: metadata?.keyboardSubmitDetected === true,
    ambiguousEntryControl: metadata?.ambiguousEntryControl === true,
    genericPrimaryButton: metadata?.genericPrimaryButtonDetected === true,
  };
}

export function evaluateAvanzaOrderPageOpen(
  input: AvanzaOrderPageOpenInput,
  options: EvaluateAvanzaOrderPageOpenOptions = {},
): AvanzaOrderPageOpenResult {
  const expectedInstrument = normalizeExpectedInstrument(
    input.dryRunOrderInput.instrument,
  );
  const expectedAction = normalizeAction(input.dryRunOrderInput.action);
  const metadata = { ...input.metadata, ...options.metadata };
  const unsafeMetadata = hasUnsafeMetadata(metadata);

  if (
    !input.instrumentPageResult.ok ||
    input.instrumentPageResult.status !== "page_identified"
  ) {
    const blocker =
      input.instrumentPageResult.blockers[0] ??
      input.instrumentPageResult.errors[0] ??
      `Instrument page must be page_identified before opening an order page; received ${input.instrumentPageResult.status}.`;

    return createAvanzaOrderPageOpenResult({
      status: "instrument_page_not_ready",
      checkedAt: options.checkedAt,
      expectedAction: expectedAction === "unknown" ? undefined : expectedAction,
      expectedInstrument,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["instrument_page_not_identified"],
      metadata,
    });
  }

  if (expectedAction !== "buy" && expectedAction !== "sell") {
    const blocker = "Order-page-open action must be buy or sell.";

    return createAvanzaOrderPageOpenResult({
      status: "action_not_supported",
      checkedAt: options.checkedAt,
      expectedInstrument,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["unsupported_action"],
      metadata,
    });
  }

  const earlyRiskFlags: AvanzaOrderPageOpenRiskFlag[] = [];
  const earlyBlockers: string[] = [];

  if (input.attemptedAction && input.attemptedAction !== expectedAction) {
    earlyRiskFlags.push("action_mismatch", "order_page_wrong_action");
    earlyBlockers.push(
      `Attempted action ${input.attemptedAction} does not match expected ${expectedAction}.`,
    );
  }

  if (unsafeMetadata.ambiguousEntryControl) {
    earlyRiskFlags.push("ambiguous_entry_control");
    earlyBlockers.push("Entry buy/sell control was ambiguous.");
  }

  if (unsafeMetadata.genericPrimaryButton) {
    earlyRiskFlags.push("generic_primary_button_detected");
    earlyBlockers.push("Generic primary button was detected as a click target.");
  }

  if (unsafeMetadata.reviewClicked) {
    earlyRiskFlags.push("review_button_clicked_or_attempted");
    earlyBlockers.push("Review/Granska click was attempted.");
  }

  if (unsafeMetadata.finalConfirmClicked) {
    earlyRiskFlags.push("final_confirm_clicked_or_attempted");
    earlyBlockers.push("Final-confirm/Bekrafta click was attempted.");
  }

  if (unsafeMetadata.keyboardSubmit) {
    earlyRiskFlags.push("keyboard_submit_detected");
    earlyBlockers.push("Keyboard submit was detected.");
  }

  if (earlyBlockers.length > 0) {
    return createAvanzaOrderPageOpenResult({
      status: earlyRiskFlags.includes("order_page_wrong_action")
        ? "wrong_action_opened"
        : "blocked",
      checkedAt: options.checkedAt,
      expectedAction,
      expectedInstrument,
      blockers: earlyBlockers,
      errors: earlyBlockers,
      riskFlags: earlyRiskFlags,
      metadata,
    });
  }

  if (!input.orderPageIdentity) {
    const blocker = "Sanitized order page identity is required.";

    return createAvanzaOrderPageOpenResult({
      status: "unavailable",
      checkedAt: options.checkedAt,
      expectedAction,
      expectedInstrument,
      blockers: [blocker],
      errors: [blocker],
      metadata,
      warnings: ["No browser page was opened or inspected by this contract."],
    });
  }

  const orderPageIdentity = normalizeOrderPageIdentity(input.orderPageIdentity);
  const riskFlags: AvanzaOrderPageOpenRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (orderPageIdentity.pageContext === "confirmation_modal") {
    riskFlags.push("final_confirm_detected");
    blockers.push("Confirmation modal detected during order-page-open check.");
  }

  if (orderPageIdentity.controls?.finalConfirmVisible) {
    riskFlags.push("final_confirm_detected");
    blockers.push("Final-confirm-like control detected on order page.");
  }

  if (orderPageIdentity.sensitiveSignals?.accountDataDetected) {
    riskFlags.push("account_data_detected");
    blockers.push("Account data detected during order-page-open check.");
  }

  if (orderPageIdentity.sensitiveSignals?.balanceDataDetected) {
    riskFlags.push("balance_data_detected");
    blockers.push("Balance data detected during order-page-open check.");
  }

  if (orderPageIdentity.sensitiveSignals?.holdingsDataDetected) {
    riskFlags.push("holdings_data_detected");
    blockers.push("Holdings data detected during order-page-open check.");
  }

  if (orderPageIdentity.sensitiveSignals?.sensitiveDataDetected) {
    riskFlags.push("sensitive_data_detected");
    blockers.push("Sensitive data detected during order-page-open check.");
  }

  if (blockers.length > 0) {
    return createAvanzaOrderPageOpenResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      expectedAction,
      expectedInstrument,
      orderPageIdentity,
      blockers,
      errors: blockers,
      riskFlags,
      metadata,
    });
  }

  if (orderPageIdentity.pageContext !== "order_page") {
    const blocker =
      orderPageIdentity.pageContext === "instrument_page"
        ? "Instrument page is still visible; order page did not open."
        : "Order page context is missing or unknown.";

    return createAvanzaOrderPageOpenResult({
      status: "order_page_mismatch",
      checkedAt: options.checkedAt,
      expectedAction,
      expectedInstrument,
      orderPageIdentity,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["missing_order_page_instrument"],
      metadata,
    });
  }

  const requireMarketMatch =
    options.requireMarketMatch ?? Boolean(expectedInstrument.market);
  const requireCurrencyMatch =
    options.requireCurrencyMatch ?? Boolean(expectedInstrument.currency);
  const requireInstrumentTypeMatch =
    options.requireInstrumentTypeMatch ?? Boolean(expectedInstrument.instrumentType);
  const fieldChecks: AvanzaOrderPageOpenFieldCheck[] = [
    fieldCheck("action", expectedAction, orderPageIdentity.action, true, {
      mismatchMessage: "Order page action does not match expected action.",
      missingPageMessage: "Order page action is missing.",
    }),
    fieldCheck("ticker", expectedInstrument.ticker, orderPageIdentity.ticker, true, {
      mismatchMessage: "Order page ticker does not match expected ticker.",
      missingPageMessage: "Order page ticker is missing.",
    }),
    fieldCheck(
      "name",
      expectedInstrument.name,
      orderPageIdentity.name,
      Boolean(expectedInstrument.name),
      {
        mismatchMessage:
          "Order page name does not match expected instrument name.",
        missingPageMessage: "Order page name is missing.",
        allowSimilar: true,
        similarMessage:
          "Order page name is a partial match and requires review.",
      },
    ),
    fieldCheck(
      "market",
      expectedInstrument.market,
      orderPageIdentity.market,
      requireMarketMatch,
      {
        mismatchMessage: "Order page market does not match expected market.",
        missingPageMessage: "Order page market is missing.",
      },
    ),
    fieldCheck(
      "currency",
      expectedInstrument.currency,
      orderPageIdentity.currency,
      requireCurrencyMatch,
      {
        mismatchMessage: "Order page currency does not match expected currency.",
        missingPageMessage: "Order page currency is missing.",
      },
    ),
    fieldCheck(
      "instrumentType",
      expectedInstrument.instrumentType,
      orderPageIdentity.instrumentType,
      requireInstrumentTypeMatch,
      {
        mismatchMessage:
          "Order page instrument type does not match expected instrument type.",
        missingPageMessage: "Order page instrument type is missing.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      const flag =
        check.field === "action"
          ? "order_page_wrong_action"
          : "order_page_wrong_instrument";
      riskFlags.push(flag);

      if (check.required) {
        blockers.push(check.message ?? `${check.field} mismatch.`);
        errors.push(check.message ?? `${check.field} mismatch.`);
      } else {
        warnings.push(check.message ?? `${check.field} mismatch.`);
      }
    }

    if (check.status === "missing_page") {
      riskFlags.push(riskFlagForMissingField(check.field));

      if (check.required) {
        blockers.push(check.message ?? `${check.field} is missing.`);
        errors.push(check.message ?? `${check.field} is missing.`);
      } else {
        warnings.push(check.message ?? `${check.field} is missing.`);
      }
    }

    if (check.status === "missing_expected" || check.status === "warning") {
      warnings.push(check.message ?? `${check.field} requires manual review.`);
    }
  }

  if (orderPageIdentity.controls?.reviewButtonVisible) {
    riskFlags.push("review_button_visible");
    warnings.push("Review/Granska button visible; no click allowed.");

    if (options.blockOnReviewButtonVisible === true) {
      blockers.push("Review/Granska button visibility blocks this check.");
      errors.push("Review/Granska button visibility blocks this check.");
    }
  }

  if (
    orderPageIdentity.formSignals?.anyFieldPrefilled &&
    (options.blockOnAnyPrefill ?? true)
  ) {
    riskFlags.push("order_form_prefilled");
    blockers.push("Order form was prefilled before approved form-fill phase.");
    errors.push("Order form was prefilled before approved form-fill phase.");
  }

  if (blockers.length > 0) {
    const status = riskFlags.includes("order_page_wrong_action")
      ? "wrong_action_opened"
      : riskFlags.includes("order_page_wrong_instrument") ||
          riskFlags.includes("missing_order_page_instrument") ||
          riskFlags.includes("missing_order_page_action")
        ? "order_page_mismatch"
      : riskFlags.includes("order_form_prefilled") ||
          riskFlags.includes("review_button_visible")
        ? "prohibited_form_interaction_detected"
        : "order_page_mismatch";

    return createAvanzaOrderPageOpenResult({
      status,
      checkedAt: options.checkedAt,
      expectedAction,
      expectedInstrument,
      orderPageIdentity,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
      metadata,
    });
  }

  return createAvanzaOrderPageOpenResult({
    status: "order_page_opened",
    checkedAt: options.checkedAt,
    expectedAction,
    expectedInstrument,
    orderPageIdentity,
    fieldChecks,
    riskFlags,
    warnings,
    metadata,
  });
}

export function summarizeAvanzaOrderPageOpenResult(
  result: AvanzaOrderPageOpenResult,
) {
  switch (result.status) {
    case "order_page_opened":
      return `Order page opened for expected ${result.expectedAction ?? "unknown"} action.`;
    case "wrong_action_opened":
      return result.orderPageIdentity?.action
        ? `Wrong action opened: expected ${result.expectedAction ?? "unknown"}, got ${result.orderPageIdentity.action}.`
        : "Wrong action opened.";
    case "order_page_mismatch":
      return result.errors.length > 0
        ? `Order page mismatch: ${result.errors[0]}`
        : "Order page mismatch.";
    case "prohibited_form_interaction_detected":
      return result.errors.length > 0
        ? `Blocked: ${result.errors[0]}`
        : "Blocked: prohibited form interaction detected.";
    case "instrument_page_not_ready":
      return "Instrument page is not ready for order-page-open checks.";
    case "action_not_supported":
      return "Order-page-open action is not supported.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: order page cannot be checked safely.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Order page open check failed.";
    case "unavailable":
    default:
      return result.errors.length > 0
        ? `Unavailable: ${result.errors[0]}`
        : "Order page open check unavailable.";
  }
}

export function getAvanzaOrderPageOpenSafetyLabels(
  result: AvanzaOrderPageOpenResult,
) {
  return uniqueStrings([...ORDER_PAGE_OPEN_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaOrderPageOpened(
  result: AvanzaOrderPageOpenResult,
) {
  return result.ok && result.status === "order_page_opened";
}
