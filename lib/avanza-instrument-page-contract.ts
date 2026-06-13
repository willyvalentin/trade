import {
  type AvanzaSearchOnlyExpectedInstrument,
  normalizeAvanzaSearchOnlyText,
} from "./avanza-search-only-result-contract";
import type { AvanzaInstrumentVerificationResult } from "./avanza-instrument-verification-contract";

export const AVANZA_INSTRUMENT_PAGE_CONTRACT_VERSION =
  "avanza_instrument_page_v1" as const;

export const AVANZA_INSTRUMENT_PAGE_MIN_CONFIDENCE = 0.85;

export type AvanzaInstrumentPageStatus =
  | "unavailable"
  | "verification_not_ready"
  | "page_not_open"
  | "page_identified"
  | "page_mismatch"
  | "prohibited_order_controls_detected"
  | "blocked"
  | "failed";

export type AvanzaInstrumentPageRiskFlag =
  | "verification_not_verified"
  | "ticker_mismatch"
  | "name_mismatch"
  | "market_mismatch"
  | "currency_mismatch"
  | "instrument_type_mismatch"
  | "missing_page_ticker"
  | "missing_page_name"
  | "missing_page_market"
  | "missing_page_currency"
  | "missing_page_instrument_type"
  | "prohibited_buy_button_visible"
  | "prohibited_sell_button_visible"
  | "order_page_detected"
  | "order_form_detected"
  | "final_confirm_detected"
  | "account_data_detected"
  | "balance_data_detected"
  | "holdings_data_detected"
  | "sensitive_data_detected"
  | "low_confidence";

export type AvanzaInstrumentPageContext =
  | "unknown"
  | "instrument_page"
  | "order_page"
  | "confirmation_modal";

export type AvanzaInstrumentPageFieldStatus =
  | "match"
  | "mismatch"
  | "missing_expected"
  | "missing_page"
  | "warning";

export type AvanzaInstrumentPageProhibitedControls = {
  buyButtonVisible?: boolean;
  sellButtonVisible?: boolean;
  orderFormVisible?: boolean;
  finalConfirmVisible?: boolean;
};

export type AvanzaInstrumentPageSensitiveSignals = {
  accountDataDetected?: boolean;
  balanceDataDetected?: boolean;
  holdingsDataDetected?: boolean;
  sensitiveDataDetected?: boolean;
};

export type AvanzaInstrumentPageIdentity = {
  ticker?: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  sanitizedTitle?: string;
  sanitizedHostClass?: string;
  pageContext?: AvanzaInstrumentPageContext;
  matchConfidence?: number;
  prohibitedControls?: AvanzaInstrumentPageProhibitedControls;
  sensitiveSignals?: AvanzaInstrumentPageSensitiveSignals;
  metadata?: Record<string, unknown>;
};

export type AvanzaInstrumentPageFieldCheck = {
  field: string;
  expected?: string;
  actual?: string;
  status: AvanzaInstrumentPageFieldStatus;
  required: boolean;
  message?: string;
};

export type AvanzaInstrumentPageInput = {
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  instrumentVerificationResult: AvanzaInstrumentVerificationResult;
  pageIdentity?: AvanzaInstrumentPageIdentity;
  metadata?: Record<string, unknown>;
};

export type AvanzaInstrumentPageResult = {
  ok: boolean;
  status: AvanzaInstrumentPageStatus;
  checkedAt: string;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  pageIdentity?: AvanzaInstrumentPageIdentity;
  fieldChecks: AvanzaInstrumentPageFieldCheck[];
  riskFlags: AvanzaInstrumentPageRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaInstrumentPageResultInput = {
  status: AvanzaInstrumentPageStatus;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  pageIdentity?: AvanzaInstrumentPageIdentity;
  fieldChecks?: AvanzaInstrumentPageFieldCheck[];
  riskFlags?: AvanzaInstrumentPageRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EvaluateAvanzaInstrumentPageOptions = {
  requireMarketMatch?: boolean;
  requireCurrencyMatch?: boolean;
  requireInstrumentTypeMatch?: boolean;
  allowProhibitedControlVisibility?: boolean;
  blockOnOrderPageContext?: boolean;
  minConfidence?: number;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const INSTRUMENT_PAGE_SAFETY_LABELS = [
  "Instrument page identity only",
  "No order page",
  "No buy/sell click",
  "No form fill",
  "No broker submission",
  "No trade mutation",
] as const;

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeExpectedInstrument(
  instrument: AvanzaSearchOnlyExpectedInstrument,
): AvanzaSearchOnlyExpectedInstrument {
  return {
    ticker: optionalText(instrument.ticker) ?? "",
    name: optionalText(instrument.name),
    market: optionalText(instrument.market),
    currency: optionalText(instrument.currency),
    instrumentType: optionalText(instrument.instrumentType),
  };
}

function normalizePageIdentity(
  pageIdentity: AvanzaInstrumentPageIdentity,
): AvanzaInstrumentPageIdentity {
  return {
    ticker: optionalText(pageIdentity.ticker),
    name: optionalText(pageIdentity.name),
    market: optionalText(pageIdentity.market),
    currency: optionalText(pageIdentity.currency),
    instrumentType: optionalText(pageIdentity.instrumentType),
    sanitizedTitle: optionalText(pageIdentity.sanitizedTitle),
    sanitizedHostClass: optionalText(pageIdentity.sanitizedHostClass),
    pageContext: pageIdentity.pageContext ?? "unknown",
    matchConfidence:
      typeof pageIdentity.matchConfidence === "number" &&
      Number.isFinite(pageIdentity.matchConfidence)
        ? Math.min(1, Math.max(0, pageIdentity.matchConfidence))
        : undefined,
    prohibitedControls: pageIdentity.prohibitedControls
      ? { ...pageIdentity.prohibitedControls }
      : undefined,
    sensitiveSignals: pageIdentity.sensitiveSignals
      ? { ...pageIdentity.sensitiveSignals }
      : undefined,
    metadata:
      typeof pageIdentity.metadata === "object" &&
      pageIdentity.metadata !== null &&
      !Array.isArray(pageIdentity.metadata)
        ? pageIdentity.metadata
        : undefined,
  };
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

function uniqueRiskFlags(values: readonly AvanzaInstrumentPageRiskFlag[]) {
  return [...new Set(values)];
}

function createStatusLabels(status: AvanzaInstrumentPageStatus) {
  const labels: Record<AvanzaInstrumentPageStatus, string[]> = {
    unavailable: ["Instrument page unavailable"],
    verification_not_ready: ["Instrument verification not ready"],
    page_not_open: ["Instrument page not open"],
    page_identified: ["Instrument page identified"],
    page_mismatch: ["Instrument page mismatch"],
    prohibited_order_controls_detected: ["Prohibited order controls visible"],
    blocked: ["Instrument page blocked"],
    failed: ["Instrument page failed"],
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
): AvanzaInstrumentPageFieldCheck {
  if (!expected) {
    return {
      field,
      actual,
      required: false,
      status: "missing_expected",
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; page identity confidence is lower.`,
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
        `Page ${field} is a partial match and requires manual review.`,
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

function riskFlagForMissingField(field: string): AvanzaInstrumentPageRiskFlag {
  switch (field) {
    case "ticker":
      return "missing_page_ticker";
    case "name":
      return "missing_page_name";
    case "market":
      return "missing_page_market";
    case "currency":
      return "missing_page_currency";
    case "instrumentType":
      return "missing_page_instrument_type";
    default:
      return "low_confidence";
  }
}

function riskFlagForMismatchField(field: string): AvanzaInstrumentPageRiskFlag {
  switch (field) {
    case "ticker":
      return "ticker_mismatch";
    case "name":
      return "name_mismatch";
    case "market":
      return "market_mismatch";
    case "currency":
      return "currency_mismatch";
    case "instrumentType":
      return "instrument_type_mismatch";
    default:
      return "low_confidence";
  }
}

function clampMinConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : AVANZA_INSTRUMENT_PAGE_MIN_CONFIDENCE;
}

export function createAvanzaInstrumentPageResult(
  input: CreateAvanzaInstrumentPageResultInput,
): AvanzaInstrumentPageResult {
  return {
    ok: input.status === "page_identified",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedInstrument: normalizeExpectedInstrument(input.expectedInstrument),
    pageIdentity: input.pageIdentity
      ? normalizePageIdentity(input.pageIdentity)
      : undefined,
    fieldChecks: input.fieldChecks ?? [],
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(normalizeStringArray(input.blockers)),
    warnings: uniqueStrings(normalizeStringArray(input.warnings)),
    errors: uniqueStrings(normalizeStringArray(input.errors)),
    labels: uniqueStrings([
      ...INSTRUMENT_PAGE_SAFETY_LABELS,
      ...createStatusLabels(input.status),
      ...normalizeStringArray(input.labels),
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_INSTRUMENT_PAGE_CONTRACT_VERSION,
      instrumentPageIdentityOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noFormFill: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

export function evaluateAvanzaInstrumentPage(
  input: AvanzaInstrumentPageInput,
  options: EvaluateAvanzaInstrumentPageOptions = {},
): AvanzaInstrumentPageResult {
  const expected = normalizeExpectedInstrument(input.expectedInstrument);
  const metadata = { ...input.metadata, ...options.metadata };

  if (
    !input.instrumentVerificationResult.ok ||
    input.instrumentVerificationResult.status !== "verified"
  ) {
    const blocker =
      input.instrumentVerificationResult.blockers[0] ??
      input.instrumentVerificationResult.errors[0] ??
      `Instrument verification must be verified before page identity checks; received ${input.instrumentVerificationResult.status}.`;

    return createAvanzaInstrumentPageResult({
      status: "verification_not_ready",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["verification_not_verified"],
      metadata,
    });
  }

  if (!input.pageIdentity) {
    return createAvanzaInstrumentPageResult({
      status: "page_not_open",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      blockers: [
        "Sanitized instrument page identity is required before page checks.",
      ],
      warnings: ["No browser page was opened or inspected by this contract."],
      metadata,
    });
  }

  const pageIdentity = normalizePageIdentity(input.pageIdentity);
  const riskFlags: AvanzaInstrumentPageRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const blockOnOrderPageContext = options.blockOnOrderPageContext ?? true;
  const allowProhibitedControlVisibility =
    options.allowProhibitedControlVisibility ?? true;

  if (
    blockOnOrderPageContext &&
    (pageIdentity.pageContext === "order_page" ||
      pageIdentity.pageContext === "confirmation_modal")
  ) {
    riskFlags.push("order_page_detected");
    blockers.push(
      pageIdentity.pageContext === "confirmation_modal"
        ? "Confirmation modal context detected during instrument-page identity check."
        : "Order page context detected during instrument-page identity check.",
    );
  }

  if (pageIdentity.prohibitedControls?.orderFormVisible) {
    riskFlags.push("order_form_detected");
    blockers.push("Order form detected during instrument-page identity check.");
  }

  if (pageIdentity.prohibitedControls?.finalConfirmVisible) {
    riskFlags.push("final_confirm_detected");
    blockers.push(
      "Final-confirm-like control detected during instrument-page identity check.",
    );
  }

  if (pageIdentity.sensitiveSignals?.accountDataDetected) {
    riskFlags.push("account_data_detected");
    blockers.push("Account data detected during instrument-page identity check.");
  }

  if (pageIdentity.sensitiveSignals?.balanceDataDetected) {
    riskFlags.push("balance_data_detected");
    blockers.push("Balance data detected during instrument-page identity check.");
  }

  if (pageIdentity.sensitiveSignals?.holdingsDataDetected) {
    riskFlags.push("holdings_data_detected");
    blockers.push("Holdings data detected during instrument-page identity check.");
  }

  if (pageIdentity.sensitiveSignals?.sensitiveDataDetected) {
    riskFlags.push("sensitive_data_detected");
    blockers.push(
      "Sensitive data detected during instrument-page identity check.",
    );
  }

  if (blockers.length > 0) {
    return createAvanzaInstrumentPageResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      pageIdentity,
      blockers,
      errors: blockers,
      riskFlags,
      metadata,
    });
  }

  const requireMarketMatch =
    options.requireMarketMatch ?? Boolean(expected.market);
  const requireCurrencyMatch =
    options.requireCurrencyMatch ?? Boolean(expected.currency);
  const requireInstrumentTypeMatch =
    options.requireInstrumentTypeMatch ?? Boolean(expected.instrumentType);
  const minConfidence = clampMinConfidence(options.minConfidence);
  const fieldChecks: AvanzaInstrumentPageFieldCheck[] = [
    fieldCheck("ticker", expected.ticker, pageIdentity.ticker, true, {
      mismatchMessage: "Page ticker does not match expected ticker.",
      missingPageMessage: "Page ticker is missing.",
    }),
    fieldCheck("name", expected.name, pageIdentity.name, Boolean(expected.name), {
      mismatchMessage: "Page name does not match expected instrument name.",
      missingPageMessage: "Page name is missing.",
      allowSimilar: true,
      similarMessage: "Page name is a partial match and requires review.",
    }),
    fieldCheck("market", expected.market, pageIdentity.market, requireMarketMatch, {
      mismatchMessage: "Page market does not match expected market.",
      missingPageMessage: "Page market is missing.",
    }),
    fieldCheck(
      "currency",
      expected.currency,
      pageIdentity.currency,
      requireCurrencyMatch,
      {
        mismatchMessage: "Page currency does not match expected currency.",
        missingPageMessage: "Page currency is missing.",
      },
    ),
    fieldCheck(
      "instrumentType",
      expected.instrumentType,
      pageIdentity.instrumentType,
      requireInstrumentTypeMatch,
      {
        mismatchMessage:
          "Page instrument type does not match expected instrument type.",
        missingPageMessage: "Page instrument type is missing.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      riskFlags.push(riskFlagForMismatchField(check.field));

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

  if (
    typeof pageIdentity.matchConfidence === "number" &&
    pageIdentity.matchConfidence < minConfidence
  ) {
    riskFlags.push("low_confidence");
    warnings.push(
      `Page identity confidence ${pageIdentity.matchConfidence.toFixed(
        2,
      )} is below ${minConfidence.toFixed(2)}.`,
    );
  }

  if (pageIdentity.prohibitedControls?.buyButtonVisible) {
    riskFlags.push("prohibited_buy_button_visible");
    warnings.push("Buy button visible as a prohibited guarded control.");
  }

  if (pageIdentity.prohibitedControls?.sellButtonVisible) {
    riskFlags.push("prohibited_sell_button_visible");
    warnings.push("Sell button visible as a prohibited guarded control.");
  }

  if (!allowProhibitedControlVisibility) {
    if (pageIdentity.prohibitedControls?.buyButtonVisible) {
      blockers.push("Buy button visibility is not allowed in this check.");
      errors.push("Buy button visibility is not allowed in this check.");
    }
    if (pageIdentity.prohibitedControls?.sellButtonVisible) {
      blockers.push("Sell button visibility is not allowed in this check.");
      errors.push("Sell button visibility is not allowed in this check.");
    }
  }

  if (blockers.length > 0) {
    return createAvanzaInstrumentPageResult({
      status:
        riskFlags.includes("ticker_mismatch") ||
        riskFlags.includes("market_mismatch") ||
        riskFlags.includes("currency_mismatch") ||
        riskFlags.includes("instrument_type_mismatch") ||
        riskFlags.some((flag) => flag.startsWith("missing_page_"))
          ? "page_mismatch"
          : "prohibited_order_controls_detected",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      pageIdentity,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
      metadata,
    });
  }

  return createAvanzaInstrumentPageResult({
    status: "page_identified",
    checkedAt: options.checkedAt,
    expectedInstrument: expected,
    pageIdentity,
    fieldChecks,
    riskFlags,
    warnings,
    metadata,
  });
}

export function summarizeAvanzaInstrumentPageResult(
  result: AvanzaInstrumentPageResult,
) {
  switch (result.status) {
    case "page_identified":
      return result.riskFlags.some((flag) =>
        flag.startsWith("prohibited_"),
      )
        ? "Instrument page identified. Prohibited controls visible; no click allowed."
        : "Instrument page identified.";
    case "page_mismatch":
      return result.errors.length > 0
        ? `Page mismatch: ${result.errors[0]}`
        : "Page mismatch.";
    case "prohibited_order_controls_detected":
      return result.errors.length > 0
        ? `Prohibited controls detected: ${result.errors[0]}`
        : "Prohibited order controls detected.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: instrument page cannot be checked safely.";
    case "verification_not_ready":
      return "Instrument verification is not ready for page identity checks.";
    case "page_not_open":
      return "Instrument page is not open.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Instrument page check failed.";
    case "unavailable":
    default:
      return "Instrument page check unavailable.";
  }
}

export function getAvanzaInstrumentPageSafetyLabels(
  result: AvanzaInstrumentPageResult,
) {
  return uniqueStrings([...INSTRUMENT_PAGE_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaInstrumentPageIdentified(
  result: AvanzaInstrumentPageResult,
) {
  return result.ok && result.status === "page_identified";
}
