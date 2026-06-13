export const AVANZA_SEARCH_ONLY_RESULT_CONTRACT_VERSION =
  "avanza_search_only_result_v1" as const;

export const AVANZA_SEARCH_ONLY_MIN_EXACT_MATCH_CONFIDENCE = 0.85;

export type AvanzaSearchOnlyStatus =
  | "unavailable"
  | "session_not_ready"
  | "search_not_available"
  | "no_match"
  | "ambiguous"
  | "exact_match"
  | "blocked"
  | "failed";

export type AvanzaSearchOnlyCandidateRiskFlag =
  | "ticker_mismatch"
  | "name_mismatch"
  | "market_mismatch"
  | "currency_mismatch"
  | "instrument_type_mismatch"
  | "duplicate_ticker"
  | "missing_market"
  | "missing_currency"
  | "missing_instrument_type"
  | "low_confidence"
  | "sensitive_data_detected"
  | "order_flow_detected";

export type AvanzaSearchOnlyCandidate = {
  candidateId: string;
  displayName: string;
  ticker: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  matchConfidence: number;
  sanitizedSource?: string;
  riskFlags: AvanzaSearchOnlyCandidateRiskFlag[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type AvanzaSearchOnlyExpectedInstrument = {
  ticker: string;
  name?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
};

export type AvanzaSearchOnlyResult = {
  ok: boolean;
  status: AvanzaSearchOnlyStatus;
  checkedAt: string;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  candidates: AvanzaSearchOnlyCandidate[];
  selectedCandidate?: AvanzaSearchOnlyCandidate;
  blockers: string[];
  warnings: string[];
  errors: string[];
  labels: string[];
  metadata?: Record<string, unknown>;
};

export type AvanzaSearchOnlyCandidateScore = {
  candidate: AvanzaSearchOnlyCandidate;
  score: number;
  tickerMatches: boolean;
  warnings: string[];
  riskFlags: AvanzaSearchOnlyCandidateRiskFlag[];
};

export type AvanzaSearchOnlyClassificationOptions = {
  minExactConfidence?: number;
  requireMarketMatch?: boolean;
  requireCurrencyMatch?: boolean;
  requireInstrumentTypeMatch?: boolean;
  blockOnDuplicateTicker?: boolean;
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

export type CreateAvanzaSearchOnlyResultInput = {
  status: AvanzaSearchOnlyStatus;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  candidates?: AvanzaSearchOnlyCandidate[];
  selectedCandidate?: AvanzaSearchOnlyCandidate;
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  labels?: string[];
  checkedAt?: string;
  metadata?: Record<string, unknown>;
};

const SEARCH_ONLY_SAFETY_LABELS = [
  "Search-only",
  "No order page",
  "No buy/sell click",
  "No broker submission",
  "No trade mutation",
] as const;

const CRITICAL_RISK_FLAGS: readonly AvanzaSearchOnlyCandidateRiskFlag[] = [
  "sensitive_data_detected",
  "order_flow_detected",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampConfidence(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : 0;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim() !== "",
  );
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter((value) => value.trim() !== ""))];
}

function uniqueRiskFlags(
  values: AvanzaSearchOnlyCandidateRiskFlag[],
): AvanzaSearchOnlyCandidateRiskFlag[] {
  return [...new Set(values)];
}

export function normalizeAvanzaSearchOnlyText(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase("sv-SE").replace(/\s+/g, " ")
    : "";
}

function normalizedMatches(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return normalizedLeft.length > 0 && normalizedLeft === normalizedRight;
}

function normalizedContainsEither(left: unknown, right: unknown) {
  const normalizedLeft = normalizeAvanzaSearchOnlyText(left);
  const normalizedRight = normalizeAvanzaSearchOnlyText(right);

  return (
    normalizedLeft.length > 0 &&
    normalizedRight.length > 0 &&
    (normalizedLeft.includes(normalizedRight) ||
      normalizedRight.includes(normalizedLeft))
  );
}

function normalizeExpectedInstrument(
  expected: AvanzaSearchOnlyExpectedInstrument,
): AvanzaSearchOnlyExpectedInstrument {
  return {
    ticker: optionalText(expected.ticker) ?? "",
    name: optionalText(expected.name),
    market: optionalText(expected.market),
    currency: optionalText(expected.currency),
    instrumentType: optionalText(expected.instrumentType),
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
    matchConfidence: clampConfidence(candidate.matchConfidence),
    sanitizedSource: optionalText(candidate.sanitizedSource),
    riskFlags: uniqueRiskFlags(candidate.riskFlags ?? []),
    warnings: normalizeStringArray(candidate.warnings),
    metadata: isRecord(candidate.metadata) ? candidate.metadata : undefined,
  };
}

function roundScore(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function scoreAvanzaSearchOnlyCandidate(
  candidate: AvanzaSearchOnlyCandidate,
  expected: AvanzaSearchOnlyExpectedInstrument,
): AvanzaSearchOnlyCandidateScore {
  const normalizedCandidate = normalizeCandidate(candidate);
  const normalizedExpected = normalizeExpectedInstrument(expected);
  const riskFlags: AvanzaSearchOnlyCandidateRiskFlag[] = [
    ...normalizedCandidate.riskFlags,
  ];
  const warnings = [...normalizedCandidate.warnings];
  let fieldScore = 0;
  const tickerMatches = normalizedMatches(
    normalizedCandidate.ticker,
    normalizedExpected.ticker,
  );

  if (tickerMatches) {
    fieldScore += 0.55;
  } else {
    riskFlags.push("ticker_mismatch");
    warnings.push("Candidate ticker does not match expected ticker.");
  }

  if (normalizedExpected.name) {
    if (normalizedMatches(normalizedCandidate.displayName, normalizedExpected.name)) {
      fieldScore += 0.15;
    } else if (
      normalizedContainsEither(normalizedCandidate.displayName, normalizedExpected.name)
    ) {
      fieldScore += 0.1;
      warnings.push("Candidate name is a partial match.");
    } else {
      riskFlags.push("name_mismatch");
      warnings.push("Candidate display name does not match expected name.");
    }
  } else {
    warnings.push("Expected instrument name is missing; ticker match carries more risk.");
  }

  if (normalizedExpected.market) {
    if (!normalizedCandidate.market) {
      riskFlags.push("missing_market");
      warnings.push("Candidate market is missing.");
    } else if (normalizedMatches(normalizedCandidate.market, normalizedExpected.market)) {
      fieldScore += 0.12;
    } else {
      riskFlags.push("market_mismatch");
      warnings.push("Candidate market does not match expected market.");
    }
  } else {
    warnings.push("Expected market is missing; exact-match confidence is lower.");
  }

  if (normalizedExpected.currency) {
    if (!normalizedCandidate.currency) {
      riskFlags.push("missing_currency");
      warnings.push("Candidate currency is missing.");
    } else if (
      normalizedMatches(normalizedCandidate.currency, normalizedExpected.currency)
    ) {
      fieldScore += 0.1;
    } else {
      riskFlags.push("currency_mismatch");
      warnings.push("Candidate currency does not match expected currency.");
    }
  } else {
    warnings.push("Expected currency is missing; exact-match confidence is lower.");
  }

  if (normalizedExpected.instrumentType) {
    if (!normalizedCandidate.instrumentType) {
      riskFlags.push("missing_instrument_type");
      warnings.push("Candidate instrument type is missing.");
    } else if (
      normalizedMatches(
        normalizedCandidate.instrumentType,
        normalizedExpected.instrumentType,
      )
    ) {
      fieldScore += 0.08;
    } else {
      riskFlags.push("instrument_type_mismatch");
      warnings.push("Candidate instrument type does not match expected type.");
    }
  } else {
    warnings.push("Expected instrument type is missing; exact-match confidence is lower.");
  }

  const score =
    CRITICAL_RISK_FLAGS.some((flag) => riskFlags.includes(flag)) ||
    riskFlags.includes("ticker_mismatch")
      ? Math.min(0.44, fieldScore)
      : fieldScore * 0.85 + normalizedCandidate.matchConfidence * 0.15;
  const roundedScore = roundScore(Math.min(1, Math.max(0, score)));

  if (roundedScore < AVANZA_SEARCH_ONLY_MIN_EXACT_MATCH_CONFIDENCE) {
    riskFlags.push("low_confidence");
  }

  return {
    candidate: {
      ...normalizedCandidate,
      matchConfidence: roundedScore,
      riskFlags: uniqueRiskFlags(riskFlags),
      warnings: uniqueStrings(warnings),
    },
    score: roundedScore,
    tickerMatches,
    riskFlags: uniqueRiskFlags(riskFlags),
    warnings: uniqueStrings(warnings),
  };
}

function createStatusLabels(status: AvanzaSearchOnlyStatus) {
  const statusLabels: Record<AvanzaSearchOnlyStatus, string[]> = {
    unavailable: ["Search unavailable"],
    session_not_ready: ["Session not ready"],
    search_not_available: ["Search not available"],
    no_match: ["No instrument match"],
    ambiguous: ["Ambiguous candidates"],
    exact_match: ["Exact instrument match"],
    blocked: ["Search-only blocked"],
    failed: ["Search-only failed"],
  };

  return statusLabels[status];
}

export function createAvanzaSearchOnlyResult(
  input: CreateAvanzaSearchOnlyResultInput,
): AvanzaSearchOnlyResult {
  const candidates = (input.candidates ?? []).map(normalizeCandidate);

  return {
    ok: input.status === "exact_match",
    status: input.status,
    checkedAt: input.checkedAt ?? new Date().toISOString(),
    expectedInstrument: normalizeExpectedInstrument(input.expectedInstrument),
    candidates,
    selectedCandidate: input.selectedCandidate
      ? normalizeCandidate(input.selectedCandidate)
      : undefined,
    blockers: uniqueStrings(normalizeStringArray(input.blockers)),
    warnings: uniqueStrings(normalizeStringArray(input.warnings)),
    errors: uniqueStrings(normalizeStringArray(input.errors)),
    labels: uniqueStrings([
      ...SEARCH_ONLY_SAFETY_LABELS,
      ...createStatusLabels(input.status),
      ...normalizeStringArray(input.labels),
    ]),
    metadata: {
      ...(input.metadata ?? {}),
      contractVersion: AVANZA_SEARCH_ONLY_RESULT_CONTRACT_VERSION,
      searchOnly: true,
      noOrderPage: true,
      noBuySellClick: true,
      noBrokerSubmission: true,
      noTradeMutation: true,
      noBrokerResult: true,
    },
  };
}

function hasCriticalRisk(candidate: AvanzaSearchOnlyCandidate) {
  return CRITICAL_RISK_FLAGS.some((flag) => candidate.riskFlags.includes(flag));
}

function hasRequiredFieldRisk(
  candidate: AvanzaSearchOnlyCandidate,
  options: Required<
    Pick<
      AvanzaSearchOnlyClassificationOptions,
      "requireMarketMatch" | "requireCurrencyMatch" | "requireInstrumentTypeMatch"
    >
  >,
) {
  return (
    candidate.riskFlags.includes("ticker_mismatch") ||
    candidate.riskFlags.includes("duplicate_ticker") ||
    (options.requireMarketMatch &&
      (candidate.riskFlags.includes("missing_market") ||
        candidate.riskFlags.includes("market_mismatch"))) ||
    (options.requireCurrencyMatch &&
      (candidate.riskFlags.includes("missing_currency") ||
        candidate.riskFlags.includes("currency_mismatch"))) ||
    (options.requireInstrumentTypeMatch &&
      (candidate.riskFlags.includes("missing_instrument_type") ||
        candidate.riskFlags.includes("instrument_type_mismatch")))
  );
}

export function classifyAvanzaSearchOnlyCandidates(
  expected: AvanzaSearchOnlyExpectedInstrument,
  candidates: AvanzaSearchOnlyCandidate[],
  options: AvanzaSearchOnlyClassificationOptions = {},
): AvanzaSearchOnlyResult {
  const normalizedExpected = normalizeExpectedInstrument(expected);
  const checkedAt = options.checkedAt ?? new Date().toISOString();
  const minExactConfidence =
    typeof options.minExactConfidence === "number" &&
    Number.isFinite(options.minExactConfidence)
      ? Math.min(1, Math.max(0, options.minExactConfidence))
      : AVANZA_SEARCH_ONLY_MIN_EXACT_MATCH_CONFIDENCE;
  const requiredOptions = {
    requireMarketMatch: options.requireMarketMatch ?? false,
    requireCurrencyMatch: options.requireCurrencyMatch ?? false,
    requireInstrumentTypeMatch: options.requireInstrumentTypeMatch ?? false,
  };
  const blockOnDuplicateTicker = options.blockOnDuplicateTicker ?? true;

  if (!normalizedExpected.ticker) {
    return createAvanzaSearchOnlyResult({
      status: "failed",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates,
      blockers: ["Expected instrument ticker is required for search-only classification."],
      errors: ["Expected instrument ticker is required for search-only classification."],
      metadata: options.metadata,
    });
  }

  if (candidates.length === 0) {
    return createAvanzaSearchOnlyResult({
      status: "no_match",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates: [],
      warnings: ["No search candidates were returned."],
      metadata: options.metadata,
    });
  }

  const scored = candidates.map((candidate) =>
    scoreAvanzaSearchOnlyCandidate(candidate, normalizedExpected),
  );
  const blockedCandidate = scored.find((item) => hasCriticalRisk(item.candidate));

  if (blockedCandidate) {
    const blocker = blockedCandidate.candidate.riskFlags.includes(
      "order_flow_detected",
    )
      ? "Order flow was detected during search-only candidate parsing."
      : "Sensitive data was detected during search-only candidate parsing.";

    return createAvanzaSearchOnlyResult({
      status: "blocked",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates: scored.map((item) => item.candidate),
      blockers: [blocker],
      errors: [blocker],
      metadata: options.metadata,
    });
  }

  const strongTickerMatches = scored.filter((item) => item.tickerMatches);

  if (blockOnDuplicateTicker && strongTickerMatches.length > 1) {
    const duplicateCandidates = scored.map((item) =>
      item.tickerMatches
        ? {
            ...item.candidate,
            riskFlags: uniqueRiskFlags([
              ...item.candidate.riskFlags,
              "duplicate_ticker",
            ]),
            warnings: uniqueStrings([
              ...item.candidate.warnings,
              "Multiple candidates share the expected ticker.",
            ]),
          }
        : item.candidate,
    );

    return createAvanzaSearchOnlyResult({
      status: "ambiguous",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates: duplicateCandidates,
      blockers: ["Multiple candidates share the expected ticker."],
      warnings: ["Duplicate ticker candidates require manual review."],
      metadata: options.metadata,
    });
  }

  const exactCandidates = scored.filter(
    (item) =>
      item.score >= minExactConfidence &&
      !hasRequiredFieldRisk(item.candidate, requiredOptions) &&
      !hasCriticalRisk(item.candidate),
  );

  if (exactCandidates.length === 1) {
    return createAvanzaSearchOnlyResult({
      status: "exact_match",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates: scored.map((item) => item.candidate),
      selectedCandidate: exactCandidates[0].candidate,
      warnings: exactCandidates[0].warnings,
      metadata: options.metadata,
    });
  }

  if (exactCandidates.length > 1) {
    return createAvanzaSearchOnlyResult({
      status: "ambiguous",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates: scored.map((item) => item.candidate),
      blockers: ["Multiple candidates passed exact-match confidence."],
      warnings: ["Manual review is required before any future phase."],
      metadata: options.metadata,
    });
  }

  const bestScore = Math.max(...scored.map((item) => item.score));
  const allTickerMismatch = scored.every(
    (item) => !item.tickerMatches || item.riskFlags.includes("ticker_mismatch"),
  );

  if (bestScore < 0.5 || allTickerMismatch) {
    return createAvanzaSearchOnlyResult({
      status: "no_match",
      checkedAt,
      expectedInstrument: normalizedExpected,
      candidates: scored.map((item) => item.candidate),
      warnings: ["No safe exact instrument match was found."],
      metadata: options.metadata,
    });
  }

  return createAvanzaSearchOnlyResult({
    status: "ambiguous",
    checkedAt,
    expectedInstrument: normalizedExpected,
    candidates: scored.map((item) => item.candidate),
    blockers: ["Candidates were returned, but none is safe enough for exact match."],
    warnings: ["Manual review is required before any future phase."],
    metadata: options.metadata,
  });
}

export function summarizeAvanzaSearchOnlyResult(result: AvanzaSearchOnlyResult) {
  switch (result.status) {
    case "exact_match":
      return "Exact instrument match found.";
    case "ambiguous":
      return "Ambiguous candidates; manual review required.";
    case "no_match":
      return "No matching instrument found.";
    case "blocked":
      return result.blockers.length > 0
        ? `Blocked: ${result.blockers[0]}`
        : "Blocked: search-only cannot proceed safely.";
    case "session_not_ready":
      return "Session is not ready for search-only.";
    case "search_not_available":
      return "Search is not available.";
    case "failed":
      return result.errors.length > 0
        ? `Failed: ${result.errors[0]}`
        : "Search-only classification failed.";
    case "unavailable":
    default:
      return "Search-only unavailable.";
  }
}

export function getAvanzaSearchOnlySafetyLabels(
  result: AvanzaSearchOnlyResult,
) {
  return uniqueStrings([...SEARCH_ONLY_SAFETY_LABELS, ...result.labels]);
}

export function isAvanzaSearchOnlyExactMatch(
  result: AvanzaSearchOnlyResult,
) {
  return (
    result.ok &&
    result.status === "exact_match" &&
    typeof result.selectedCandidate !== "undefined"
  );
}
