import {
  normalizeAvanzaSearchOnlyText,
  type AvanzaSearchOnlyCandidate,
  type AvanzaSearchOnlyExpectedInstrument,
  type AvanzaSearchOnlyResult,
} from "./avanza-search-only-result-contract";

export const AVANZA_INSTRUMENT_VERIFICATION_CONTRACT_VERSION =
  "avanza_instrument_verification_v1" as const;

export const AVANZA_INSTRUMENT_VERIFICATION_MIN_CONFIDENCE = 0.85;

export type AvanzaInstrumentVerificationStatus =
  | "unavailable"
  | "search_not_ready"
  | "missing_candidate"
  | "verified"
  | "rejected"
  | "ambiguous"
  | "blocked"
  | "failed";

export type AvanzaInstrumentVerificationFieldStatus =
  | "match"
  | "mismatch"
  | "missing_expected"
  | "missing_candidate"
  | "warning";

export type AvanzaInstrumentVerificationFieldCheck = {
  field: string;
  expected?: string;
  actual?: string;
  status: AvanzaInstrumentVerificationFieldStatus;
  required: boolean;
  message?: string;
};

export type AvanzaInstrumentVerificationRiskFlag =
  | "ticker_mismatch"
  | "name_mismatch"
  | "market_mismatch"
  | "currency_mismatch"
  | "instrument_type_mismatch"
  | "missing_market"
  | "missing_currency"
  | "missing_instrument_type"
  | "low_confidence"
  | "duplicate_or_ambiguous_candidate"
  | "candidate_has_critical_risk"
  | "sensitive_data_detected"
  | "order_flow_detected";

export type AvanzaInstrumentVerificationInput = {
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  searchOnlyResult: AvanzaSearchOnlyResult;
  selectedCandidate?: AvanzaSearchOnlyCandidate;
  metadata?: Record<string, unknown>;
};

export type AvanzaInstrumentVerificationResult = {
  ok: boolean;
  status: AvanzaInstrumentVerificationStatus;
  checkedAt: string;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  selectedCandidate?: AvanzaSearchOnlyCandidate;
  fieldChecks: AvanzaInstrumentVerificationFieldCheck[];
  riskFlags: AvanzaInstrumentVerificationRiskFlag[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaInstrumentVerificationResultInput = {
  status: AvanzaInstrumentVerificationStatus;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  selectedCandidate?: AvanzaSearchOnlyCandidate;
  fieldChecks?: AvanzaInstrumentVerificationFieldCheck[];
  riskFlags?: AvanzaInstrumentVerificationRiskFlag[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type VerifyAvanzaInstrumentOptions = {
  requireMarketMatch?: boolean;
  requireCurrencyMatch?: boolean;
  requireInstrumentTypeMatch?: boolean;
  minConfidence?: number;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const INSTRUMENT_VERIFICATION_SAFETY_LABELS = [
  "Instrument verification only",
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

function normalizeInstrument(
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

function normalizeCandidate(
  candidate: AvanzaSearchOnlyCandidate,
): AvanzaSearchOnlyCandidate {
  return {
    candidateId: optionalText(candidate.candidateId) ?? "unknown_candidate",
    displayName: optionalText(candidate.displayName) ?? "",
    ticker: optionalText(candidate.ticker) ?? "",
    market: optionalText(candidate.market),
    currency: optionalText(candidate.currency),
    instrumentType: optionalText(candidate.instrumentType),
    matchConfidence:
      typeof candidate.matchConfidence === "number" &&
      Number.isFinite(candidate.matchConfidence)
        ? Math.min(1, Math.max(0, candidate.matchConfidence))
        : 0,
    sanitizedSource: optionalText(candidate.sanitizedSource),
    riskFlags: [...new Set(candidate.riskFlags ?? [])],
    warnings: [...new Set((candidate.warnings ?? []).filter(Boolean))],
    metadata:
      typeof candidate.metadata === "object" &&
      candidate.metadata !== null &&
      !Array.isArray(candidate.metadata)
        ? candidate.metadata
        : undefined,
  };
}

function uniqueStrings(values: readonly string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function uniqueRiskFlags(
  values: readonly AvanzaInstrumentVerificationRiskFlag[],
) {
  return [...new Set(values)];
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function createStatusLabels(status: AvanzaInstrumentVerificationStatus) {
  const labels: Record<AvanzaInstrumentVerificationStatus, string[]> = {
    unavailable: ["Instrument verification unavailable"],
    search_not_ready: ["Search-only result not ready"],
    missing_candidate: ["Selected candidate missing"],
    verified: ["Instrument verified"],
    rejected: ["Instrument rejected"],
    ambiguous: ["Instrument ambiguous"],
    blocked: ["Instrument verification blocked"],
    failed: ["Instrument verification failed"],
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

function clampMinConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : AVANZA_INSTRUMENT_VERIFICATION_MIN_CONFIDENCE;
}

function fieldCheck(
  field: string,
  expected: string | undefined,
  actual: string | undefined,
  required: boolean,
  options: {
    mismatchMessage: string;
    missingExpectedMessage?: string;
    missingCandidateMessage: string;
    allowSimilar?: boolean;
    similarMessage?: string;
  },
): AvanzaInstrumentVerificationFieldCheck {
  if (!expected) {
    return {
      field,
      actual,
      required: false,
      status: "missing_expected",
      message:
        options.missingExpectedMessage ??
        `Expected ${field} is missing; verification confidence is lower.`,
    };
  }

  if (!actual) {
    return {
      field,
      expected,
      required,
      status: "missing_candidate",
      message: options.missingCandidateMessage,
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
        `Candidate ${field} is a partial match and requires manual review.`,
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

export function createAvanzaInstrumentVerificationResult(
  input: CreateAvanzaInstrumentVerificationResultInput,
): AvanzaInstrumentVerificationResult {
  return {
    ok: input.status === "verified",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedInstrument: normalizeInstrument(input.expectedInstrument),
    selectedCandidate: input.selectedCandidate
      ? normalizeCandidate(input.selectedCandidate)
      : undefined,
    fieldChecks: input.fieldChecks ?? [],
    riskFlags: uniqueRiskFlags(input.riskFlags ?? []),
    blockers: uniqueStrings(normalizeStringArray(input.blockers)),
    warnings: uniqueStrings(normalizeStringArray(input.warnings)),
    errors: uniqueStrings(normalizeStringArray(input.errors)),
    labels: uniqueStrings([
      ...INSTRUMENT_VERIFICATION_SAFETY_LABELS,
      ...createStatusLabels(input.status),
      ...normalizeStringArray(input.labels),
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_INSTRUMENT_VERIFICATION_CONTRACT_VERSION,
      instrumentVerificationOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noFormFill: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function createSearchNotReadyResult(
  input: AvanzaInstrumentVerificationInput,
  options: VerifyAvanzaInstrumentOptions,
): AvanzaInstrumentVerificationResult {
  const status = input.searchOnlyResult.status;

  if (status === "blocked") {
    const blocker =
      input.searchOnlyResult.blockers[0] ??
      "Search-only result is blocked and cannot be verified.";

    return createAvanzaInstrumentVerificationResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      expectedInstrument: input.expectedInstrument,
      selectedCandidate: input.selectedCandidate,
      blockers: [blocker],
      errors: [blocker],
      riskFlags: ["candidate_has_critical_risk"],
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  if (status === "ambiguous") {
    return createAvanzaInstrumentVerificationResult({
      status: "ambiguous",
      checkedAt: options.checkedAt,
      expectedInstrument: input.expectedInstrument,
      selectedCandidate: input.selectedCandidate,
      blockers: ["Search-only result is ambiguous and requires manual review."],
      warnings: input.searchOnlyResult.warnings,
      riskFlags: ["duplicate_or_ambiguous_candidate"],
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  if (status === "failed") {
    const error =
      input.searchOnlyResult.errors[0] ??
      "Search-only result failed and cannot be verified.";

    return createAvanzaInstrumentVerificationResult({
      status: "failed",
      checkedAt: options.checkedAt,
      expectedInstrument: input.expectedInstrument,
      selectedCandidate: input.selectedCandidate,
      blockers: [error],
      errors: [error],
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  return createAvanzaInstrumentVerificationResult({
    status: "search_not_ready",
    checkedAt: options.checkedAt,
    expectedInstrument: input.expectedInstrument,
    selectedCandidate: input.selectedCandidate,
    blockers: [
      `Search-only result must be exact_match before instrument verification; received ${status}.`,
    ],
    warnings: input.searchOnlyResult.warnings,
    metadata: { ...input.metadata, ...options.metadata },
  });
}

export function verifyAvanzaInstrument(
  input: AvanzaInstrumentVerificationInput,
  options: VerifyAvanzaInstrumentOptions = {},
): AvanzaInstrumentVerificationResult {
  if (input.searchOnlyResult.status !== "exact_match") {
    return createSearchNotReadyResult(input, options);
  }

  const expected = normalizeInstrument(input.expectedInstrument);
  const candidateSource =
    input.selectedCandidate ?? input.searchOnlyResult.selectedCandidate;

  if (!candidateSource) {
    return createAvanzaInstrumentVerificationResult({
      status: "missing_candidate",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      blockers: ["Selected search-only candidate is required for verification."],
      errors: ["Selected search-only candidate is required for verification."],
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  const candidate = normalizeCandidate(candidateSource);
  const riskFlags: AvanzaInstrumentVerificationRiskFlag[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [...candidate.warnings];
  const errors: string[] = [];

  if (candidate.riskFlags.includes("sensitive_data_detected")) {
    riskFlags.push("sensitive_data_detected", "candidate_has_critical_risk");
    blockers.push("Sensitive data risk detected on selected candidate.");
  }

  if (candidate.riskFlags.includes("order_flow_detected")) {
    riskFlags.push("order_flow_detected", "candidate_has_critical_risk");
    blockers.push("Order-flow risk detected on selected candidate.");
  }

  if (blockers.length > 0) {
    return createAvanzaInstrumentVerificationResult({
      status: "blocked",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      selectedCandidate: candidate,
      blockers,
      errors: blockers,
      riskFlags,
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  const requireMarketMatch =
    options.requireMarketMatch ?? Boolean(expected.market);
  const requireCurrencyMatch =
    options.requireCurrencyMatch ?? Boolean(expected.currency);
  const requireInstrumentTypeMatch =
    options.requireInstrumentTypeMatch ?? Boolean(expected.instrumentType);
  const minConfidence = clampMinConfidence(options.minConfidence);

  const fieldChecks: AvanzaInstrumentVerificationFieldCheck[] = [
    fieldCheck("ticker", expected.ticker, candidate.ticker, true, {
      mismatchMessage: "Candidate ticker does not match expected ticker.",
      missingCandidateMessage: "Candidate ticker is missing.",
    }),
    fieldCheck("name", expected.name, candidate.displayName, Boolean(expected.name), {
      mismatchMessage: "Candidate name does not match expected instrument name.",
      missingCandidateMessage: "Candidate name is missing.",
      allowSimilar: true,
      similarMessage: "Candidate name is a partial match and requires review.",
    }),
    fieldCheck("market", expected.market, candidate.market, requireMarketMatch, {
      mismatchMessage: "Candidate market does not match expected market.",
      missingCandidateMessage: "Candidate market is missing.",
    }),
    fieldCheck(
      "currency",
      expected.currency,
      candidate.currency,
      requireCurrencyMatch,
      {
        mismatchMessage: "Candidate currency does not match expected currency.",
        missingCandidateMessage: "Candidate currency is missing.",
      },
    ),
    fieldCheck(
      "instrumentType",
      expected.instrumentType,
      candidate.instrumentType,
      requireInstrumentTypeMatch,
      {
        mismatchMessage:
          "Candidate instrument type does not match expected instrument type.",
        missingCandidateMessage: "Candidate instrument type is missing.",
      },
    ),
  ];

  for (const check of fieldChecks) {
    if (check.status === "mismatch") {
      switch (check.field) {
        case "ticker":
          riskFlags.push("ticker_mismatch");
          break;
        case "name":
          riskFlags.push("name_mismatch");
          break;
        case "market":
          riskFlags.push("market_mismatch");
          break;
        case "currency":
          riskFlags.push("currency_mismatch");
          break;
        case "instrumentType":
          riskFlags.push("instrument_type_mismatch");
          break;
      }
      if (check.required) {
        blockers.push(check.message ?? `${check.field} mismatch.`);
        errors.push(check.message ?? `${check.field} mismatch.`);
      } else {
        warnings.push(check.message ?? `${check.field} mismatch.`);
      }
    }

    if (check.status === "missing_candidate") {
      switch (check.field) {
        case "market":
          riskFlags.push("missing_market");
          break;
        case "currency":
          riskFlags.push("missing_currency");
          break;
        case "instrumentType":
          riskFlags.push("missing_instrument_type");
          break;
      }
      warnings.push(check.message ?? `${check.field} is missing.`);
    }

    if (check.status === "missing_expected" || check.status === "warning") {
      warnings.push(check.message ?? `${check.field} requires manual review.`);
    }
  }

  if (candidate.riskFlags.includes("duplicate_ticker")) {
    riskFlags.push("duplicate_or_ambiguous_candidate");
    blockers.push("Selected candidate came from an ambiguous duplicate-ticker set.");
  }

  if (candidate.matchConfidence < minConfidence) {
    riskFlags.push("low_confidence");
    warnings.push(
      `Candidate match confidence ${candidate.matchConfidence.toFixed(
        2,
      )} is below ${minConfidence.toFixed(2)}.`,
    );
  }

  const requiredMismatch = fieldChecks.some(
    (check) => check.required && check.status === "mismatch",
  );
  const requiredMissingCandidate = fieldChecks.some(
    (check) => check.required && check.status === "missing_candidate",
  );
  const lowConfidence = riskFlags.includes("low_confidence");
  const ambiguousRisk =
    requiredMissingCandidate ||
    lowConfidence ||
    riskFlags.includes("duplicate_or_ambiguous_candidate") ||
    fieldChecks.some((check) => check.status === "warning");

  if (requiredMismatch) {
    return createAvanzaInstrumentVerificationResult({
      status: "rejected",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      selectedCandidate: candidate,
      fieldChecks,
      riskFlags,
      blockers,
      warnings,
      errors,
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  if (ambiguousRisk) {
    return createAvanzaInstrumentVerificationResult({
      status: "ambiguous",
      checkedAt: options.checkedAt,
      expectedInstrument: expected,
      selectedCandidate: candidate,
      fieldChecks,
      riskFlags,
      blockers:
        blockers.length > 0
          ? blockers
          : ["Instrument identity requires manual review before any future phase."],
      warnings,
      metadata: { ...input.metadata, ...options.metadata },
    });
  }

  return createAvanzaInstrumentVerificationResult({
    status: "verified",
    checkedAt: options.checkedAt,
    expectedInstrument: expected,
    selectedCandidate: candidate,
    fieldChecks,
    riskFlags,
    warnings,
    metadata: { ...input.metadata, ...options.metadata },
  });
}

export function summarizeAvanzaInstrumentVerificationResult(
  result: AvanzaInstrumentVerificationResult,
) {
  switch (result.status) {
    case "verified":
      return "Instrument verified.";
    case "rejected":
      return result.errors.length > 0
        ? `Instrument rejected: ${result.errors[0]}`
        : "Instrument rejected.";
    case "ambiguous":
      return result.blockers.length > 0
        ? `Instrument ambiguous: ${result.blockers[0]}`
        : result.warnings.length > 0
          ? `Instrument ambiguous: ${result.warnings[0]}`
          : "Instrument ambiguous; manual review required.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: instrument verification cannot proceed safely.";
    case "missing_candidate":
      return "Instrument verification missing selected candidate.";
    case "search_not_ready":
      return "Search-only result is not ready for instrument verification.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Instrument verification failed.";
    case "unavailable":
    default:
      return "Instrument verification unavailable.";
  }
}

export function getAvanzaInstrumentVerificationSafetyLabels(
  result: AvanzaInstrumentVerificationResult,
) {
  return uniqueStrings([...INSTRUMENT_VERIFICATION_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaInstrumentVerified(
  result: AvanzaInstrumentVerificationResult,
) {
  return result.ok && result.status === "verified";
}
