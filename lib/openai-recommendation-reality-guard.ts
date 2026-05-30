export type OpenAiRecommendationRealityStatus =
  | "grounded"
  | "usable_with_warnings"
  | "missing_required_fields"
  | "unsupported_output"
  | "blocked"
  | "not_run";

export type OpenAiRecommendationRealityIssueSeverity =
  | "info"
  | "warning"
  | "blocked";

export type OpenAiRecommendationRealityIssue = {
  issue_id: string;
  severity: OpenAiRecommendationRealityIssueSeverity;
  ticker: string | null;
  field: string | null;
  message: string;
};

export type OpenAiRecommendationRealityWarning =
  OpenAiRecommendationRealityIssue;

export type OpenAiRecommendationRealityCandidate = {
  ticker: string;
  company_name?: string | null;
  rank?: number | null;
  tier?: string | null;
  rank_reason?: string | null;
  market_data_source?: string | null;
  market_data_provider?: string | null;
  market_data_timestamp?: string | null;
  market_data_stale?: boolean | null;
  warnings?: string[];
  gaps?: string[];
  proposed_entry_low?: number | null;
  proposed_entry_high?: number | null;
  proposed_stop_loss?: number | null;
  proposed_target_1?: number | null;
  proposed_target_2?: number | null;
};

export type OpenAiRecommendationRealityGuardSummary = {
  summary_version: "1.0";
  summary_kind: "openai_recommendation_reality_guard";
  generated_at: string;
  status: OpenAiRecommendationRealityStatus;
  scan_window: string | null;
  batch_window: string | null;
  batch_type: string | null;
  batch_status: string | null;
  target_count: number | null;
  input_candidates_count: number;
  output_recommendations_count: number;
  validated_recommendations_count: number | null;
  candidates_excluded_by_model_count: number;
  excluded_candidate_tickers: string[];
  output_tickers: string[];
  source_consistency: "pass" | "warning" | "blocked" | "unknown";
  missing_output_fields: string[];
  missing_output_field_count: number;
  unsupported_output_fields: string[];
  hallucination_guard_warnings: OpenAiRecommendationRealityWarning[];
  old_mock_demo_wording_detected: boolean;
  provider_unavailable_count: number;
  stale_data_count: number;
  sanitizer_skipped_reasons: string[];
  ranking_alignment: {
    respected_rank_order: boolean;
    first_output_rank: number | null;
    top_input_rank: number | null;
  };
  prompt_guardrails: {
    candidate_only: boolean;
    missing_data_no_fabrication: boolean;
    preserves_warnings_and_gaps: boolean;
    no_guaranteed_profitability: boolean;
    no_active_trade_when_window_closed: boolean;
  };
  issues: OpenAiRecommendationRealityIssue[];
  warnings: OpenAiRecommendationRealityWarning[];
  summary: string;
};

const requiredRecommendationFields = [
  "ticker",
  "company_name",
  "direction",
  "setup_type",
  "entry_low",
  "entry_high",
  "stop_loss",
  "target_1",
  "target_2",
  "risk_reward",
  "confidence",
  "confidence_score",
  "confidence_label",
  "confidence_breakdown",
  "confidence_reasoning",
  "risk_flags",
  "timeframe",
  "thesis",
  "invalidation",
  "reason_to_avoid",
  "tier",
  "source_provider",
  "market_data_source",
  "market_data_timestamp",
  "data_freshness",
  "warning_summary",
  "gap_summary",
  "ranking_rank",
  "ranking_reason",
  "batch_window",
  "batch_type",
  "batch_status",
] as const;

function normalizeTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function hasUsefulValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function detectOldMockDemoWording(textToScan: string) {
  return /\b(mock|demo|static)\b/i.test(textToScan);
}

function createIssue(
  issue_id: string,
  severity: OpenAiRecommendationRealityIssueSeverity,
  message: string,
  options: {
    ticker?: string | null;
    field?: string | null;
  } = {},
): OpenAiRecommendationRealityIssue {
  return {
    issue_id,
    severity,
    ticker: options.ticker ?? null,
    field: options.field ?? null,
    message,
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}

function buildSummaryText(
  status: OpenAiRecommendationRealityStatus,
  inputCount: number,
  outputCount: number,
  warningCount: number,
) {
  if (status === "grounded") {
    return `OpenAI output is grounded in ${inputCount} provided scanner candidates with ${outputCount} recommendation(s).`;
  }

  if (status === "not_run") {
    return "OpenAI recommendation generation was not run for this scan.";
  }

  if (status === "blocked") {
    return "OpenAI output was blocked by reality-guard validation.";
  }

  return `OpenAI output is usable with ${warningCount} reality guard warning(s) across ${inputCount} input candidate(s).`;
}

function isClosedWindow(scanWindow: string | null | undefined) {
  return scanWindow === "closed" || scanWindow === "pre_market";
}

export function buildOpenAiRecommendationRealityGuardSummary(input: {
  instructionsText?: string | null;
  inputPayload?: unknown;
  scanWindow?: string | null;
  batchWindow?: string | null;
  batchType?: string | null;
  batchStatus?: string | null;
  targetCount?: number | null;
  candidates: OpenAiRecommendationRealityCandidate[];
  outputRecommendations?: unknown[] | null;
  outputResult?: string | null;
  noTradeReason?: string | null;
  validatedRecommendationTickers?: string[] | null;
  sanitizerSkippedReasons?: string[] | null;
  now?: Date;
}): OpenAiRecommendationRealityGuardSummary {
  const now = input.now ?? new Date();
  const candidates = input.candidates.map((candidate) => ({
    ...candidate,
    ticker: normalizeTicker(candidate.ticker),
  }));
  const candidatesByTicker = new Map(
    candidates.map((candidate) => [candidate.ticker, candidate]),
  );
  const outputRecommendations = input.outputRecommendations ?? [];
  const outputTickers = outputRecommendations
    .map((recommendation) =>
      normalizeTicker((recommendation as Record<string, unknown>)?.ticker),
    )
    .filter(Boolean);
  const inputTickerSet = new Set(candidates.map((candidate) => candidate.ticker));
  const outputTickerSet = new Set(outputTickers);
  const issues: OpenAiRecommendationRealityIssue[] = [];
  const missingOutputFields: string[] = [];
  const unsupportedOutputFields: string[] = [];

  if (isClosedWindow(input.scanWindow) && outputTickers.length > 0) {
    issues.push(
      createIssue(
        "active_trade_outside_window",
        "blocked",
        "Model returned active trade recommendations outside an active intraday trading window.",
        { field: "scan_window" },
      ),
    );
  }

  for (const ticker of outputTickers) {
    if (!inputTickerSet.has(ticker)) {
      unsupportedOutputFields.push(`${ticker}.ticker`);
      issues.push(
        createIssue(
          "ticker_not_in_candidates",
          "blocked",
          `Model returned ${ticker}, which was not provided as a scanner candidate.`,
          { ticker, field: "ticker" },
        ),
      );
    }
  }

  for (const [index, recommendation] of outputRecommendations.entries()) {
    const record =
      typeof recommendation === "object" && recommendation !== null
        ? (recommendation as Record<string, unknown>)
        : {};
    const ticker = normalizeTicker(record.ticker) || `recommendation_${index + 1}`;
    const candidate = candidatesByTicker.get(ticker);

    for (const field of requiredRecommendationFields) {
      if (!hasUsefulValue(record[field])) {
        missingOutputFields.push(`${ticker}.${field}`);
        issues.push(
          createIssue(
            "missing_output_field",
            "warning",
            `${ticker} output omitted ${field}.`,
            { ticker, field },
          ),
        );
      }
    }

    const sourceProvider = text(record.source_provider);
    const candidateProvider = candidate?.market_data_provider ?? null;

    if (
      sourceProvider &&
      candidateProvider &&
      sourceProvider !== "provider_unavailable" &&
      sourceProvider !== candidateProvider
    ) {
      unsupportedOutputFields.push(`${ticker}.source_provider`);
      issues.push(
        createIssue(
          "source_provider_mismatch",
          "warning",
          `${ticker} source_provider ${sourceProvider} does not match candidate provider ${candidateProvider}.`,
          { ticker, field: "source_provider" },
        ),
      );
    }

    const rankingRank = numberOrNull(record.ranking_rank);
    if (
      candidate?.rank !== null &&
      candidate?.rank !== undefined &&
      rankingRank !== null &&
      rankingRank !== candidate.rank
    ) {
      issues.push(
        createIssue(
          "ranking_rank_mismatch",
          "warning",
          `${ticker} ranking_rank ${rankingRank} does not match scanner rank ${candidate.rank}.`,
          { ticker, field: "ranking_rank" },
        ),
      );
    }
  }

  const promptText = [
    input.instructionsText ?? "",
    typeof input.inputPayload === "string"
      ? input.inputPayload
      : input.inputPayload
        ? JSON.stringify(input.inputPayload)
        : "",
  ].join("\n");
  const oldMockDemoWordingDetected = detectOldMockDemoWording(promptText);

  if (oldMockDemoWordingDetected) {
    issues.push(
      createIssue(
        "old_mock_demo_wording_detected",
        "warning",
        "Prompt or payload still contains legacy mock/demo/static wording.",
        { field: "prompt" },
      ),
    );
  }

  const providerUnavailableCount = candidates.filter(
    (candidate) =>
      candidate.market_data_provider === null ||
      candidate.market_data_provider === undefined ||
      candidate.market_data_provider === "provider_unavailable" ||
      candidate.market_data_source === "provider_unavailable" ||
      candidate.market_data_source === "unavailable",
  ).length;
  const staleDataCount = candidates.filter(
    (candidate) => candidate.market_data_stale === true,
  ).length;

  if (providerUnavailableCount > 0) {
    issues.push(
      createIssue(
        "provider_unavailable_candidates",
        "warning",
        `${providerUnavailableCount} OpenAI input candidate(s) have unavailable provider/source metadata.`,
        { field: "market_data_provider" },
      ),
    );
  }

  if (staleDataCount > 0) {
    issues.push(
      createIssue(
        "stale_candidate_data",
        "warning",
        `${staleDataCount} OpenAI input candidate(s) have stale market data.`,
        { field: "market_data_stale" },
      ),
    );
  }

  const excludedCandidateTickers = candidates
    .map((candidate) => candidate.ticker)
    .filter((ticker) => !outputTickerSet.has(ticker));
  const firstOutputRank =
    outputTickers.length > 0
      ? (candidatesByTicker.get(outputTickers[0])?.rank ?? null)
      : null;
  const inputRanks = candidates
    .map((candidate) => candidate.rank)
    .filter(
      (rank): rank is number => typeof rank === "number" && Number.isFinite(rank),
    );
  const topInputRank =
    inputRanks.length > 0 ? Math.min(...inputRanks) : null;
  const respectedRankOrder =
    firstOutputRank === null || topInputRank === null || firstOutputRank === topInputRank;
  const sanitizerSkippedReasons = input.sanitizerSkippedReasons ?? [];

  for (const reason of sanitizerSkippedReasons) {
    issues.push(
      createIssue("sanitizer_rejected_output", "blocked", reason, {
        field: "parser_validation",
      }),
    );
  }

  if (!respectedRankOrder && outputTickers.length > 0) {
    issues.push(
      createIssue(
        "ranking_order_demoted",
        "info",
        "Model did not choose the highest-ranked scanner candidate first; validation reason should be visible in recommendation text.",
        { ticker: outputTickers[0] ?? null, field: "ranking_rank" },
      ),
    );
  }

  const blockedCount = issues.filter((issue) => issue.severity === "blocked").length;
  const warningCount = issues.filter((issue) => issue.severity !== "info").length;
  const sourceConsistency =
    outputTickers.length === 0
      ? "unknown"
      : unsupportedOutputFields.some((field) => field.endsWith(".ticker"))
        ? "blocked"
        : unsupportedOutputFields.length > 0 || providerUnavailableCount > 0
          ? "warning"
          : "pass";
  const status: OpenAiRecommendationRealityStatus =
    input.outputResult === null || input.outputResult === undefined
      ? "not_run"
      : blockedCount > 0
        ? "blocked"
        : missingOutputFields.length > 0
          ? "missing_required_fields"
          : unsupportedOutputFields.length > 0
            ? "unsupported_output"
            : warningCount > 0
              ? "usable_with_warnings"
              : "grounded";
  const warnings = issues.filter(
    (issue): issue is OpenAiRecommendationRealityWarning =>
      issue.severity === "warning" || issue.severity === "blocked",
  );

  return {
    summary_version: "1.0",
    summary_kind: "openai_recommendation_reality_guard",
    generated_at: now.toISOString(),
    status,
    scan_window: input.scanWindow ?? null,
    batch_window: input.batchWindow ?? null,
    batch_type: input.batchType ?? null,
    batch_status: input.batchStatus ?? null,
    target_count:
      typeof input.targetCount === "number" && Number.isFinite(input.targetCount)
        ? input.targetCount
        : null,
    input_candidates_count: candidates.length,
    output_recommendations_count: outputRecommendations.length,
    validated_recommendations_count:
      input.validatedRecommendationTickers === null ||
      input.validatedRecommendationTickers === undefined
        ? null
        : input.validatedRecommendationTickers.length,
    candidates_excluded_by_model_count: excludedCandidateTickers.length,
    excluded_candidate_tickers: excludedCandidateTickers,
    output_tickers: unique(outputTickers),
    source_consistency: sourceConsistency,
    missing_output_fields: unique(missingOutputFields),
    missing_output_field_count: unique(missingOutputFields).length,
    unsupported_output_fields: unique(unsupportedOutputFields),
    hallucination_guard_warnings: warnings.filter(
      (warning) =>
        warning.issue_id === "ticker_not_in_candidates" ||
        warning.issue_id === "source_provider_mismatch" ||
        warning.issue_id === "ranking_rank_mismatch",
    ),
    old_mock_demo_wording_detected: oldMockDemoWordingDetected,
    provider_unavailable_count: providerUnavailableCount,
    stale_data_count: staleDataCount,
    sanitizer_skipped_reasons: sanitizerSkippedReasons,
    ranking_alignment: {
      respected_rank_order: respectedRankOrder,
      first_output_rank: firstOutputRank,
      top_input_rank: topInputRank,
    },
    prompt_guardrails: {
      candidate_only:
        /only use the provided candidate data/i.test(promptText) ||
        /use only tickers from the provided candidates/i.test(promptText),
      missing_data_no_fabrication:
        /do not invent|do not fabricate|missing/i.test(promptText),
      preserves_warnings_and_gaps: /warnings|gaps/i.test(promptText),
      no_guaranteed_profitability: /guaranteed profitability|guarantee/i.test(
        promptText,
      ),
      no_active_trade_when_window_closed: /closed|outside.*window/i.test(promptText),
    },
    issues,
    warnings,
    summary: buildSummaryText(
      status,
      candidates.length,
      outputRecommendations.length,
      warningCount,
    ),
  };
}

export function finalizeOpenAiRecommendationRealityGuardSummary(
  summary: OpenAiRecommendationRealityGuardSummary,
  input: {
    validatedRecommendationTickers: string[];
    sanitizerSkippedReasons: string[];
    now?: Date;
  },
) {
  const sanitizerIssues = input.sanitizerSkippedReasons.map((reason) =>
    createIssue("sanitizer_rejected_output", "blocked", reason, {
      field: "parser_validation",
    }),
  );
  const issues = [...summary.issues, ...sanitizerIssues];
  const warnings = issues.filter(
    (issue): issue is OpenAiRecommendationRealityWarning =>
      issue.severity === "warning" || issue.severity === "blocked",
  );
  const blockedCount = issues.filter((issue) => issue.severity === "blocked").length;
  const status: OpenAiRecommendationRealityStatus =
    blockedCount > 0 && input.validatedRecommendationTickers.length === 0
      ? "blocked"
      : summary.status === "grounded" && warnings.length > 0
        ? "usable_with_warnings"
        : summary.status;

  return {
    ...summary,
    generated_at: (input.now ?? new Date()).toISOString(),
    status,
    validated_recommendations_count: input.validatedRecommendationTickers.length,
    sanitizer_skipped_reasons: input.sanitizerSkippedReasons,
    issues,
    warnings,
    summary: buildSummaryText(
      status,
      summary.input_candidates_count,
      summary.output_recommendations_count,
      warnings.length,
    ),
  };
}

export function openAiRecommendationRealityGuardSummaryJson(
  summary: OpenAiRecommendationRealityGuardSummary,
) {
  return JSON.stringify(summary, null, 2);
}
