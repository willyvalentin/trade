import type { ScanLogEntry } from "@/lib/scan-log-core";

export const SCANNER_SCORE_GATE_ALIGNMENT_DIAGNOSTIC_VERSION =
  "scanner_score_gate_alignment_diagnostic_v1" as const;
export const SCANNER_SCORE_GATE_ALIGNMENT_COHORT_DIAGNOSTIC_VERSION =
  "scanner_score_gate_alignment_cohort_diagnostic_v1" as const;

const rankingQualifiedTiers = new Set(["strong", "valid", "experimental"]);

export type ScannerScoreGateAlignmentCandidate = Readonly<{
  ticker: string;
  rank: number;
  ranking_score: number;
  ranking_tier: string;
  local_score: number;
  publishable_threshold: number;
  score_gap: number;
  ranking_gate_passed: boolean;
  local_publish_gate_passed: boolean;
  built: boolean;
  rejection_reason: string;
  alignment:
    | "aligned_qualified"
    | "ranking_qualified_local_block"
    | "ranking_not_qualified";
}>;

export type ScannerScoreGateAlignmentDiagnostic = Readonly<{
  diagnostic_version: typeof SCANNER_SCORE_GATE_ALIGNMENT_DIAGNOSTIC_VERSION;
  status: "observed" | "not_observed" | "invalid";
  reason_codes: readonly string[];
  publishable_threshold: number | null;
  candidates: readonly ScannerScoreGateAlignmentCandidate[];
  counts: Readonly<{
    selected: number;
    aligned_qualified: number;
    ranking_qualified_local_block: number;
    ranking_not_qualified: number;
    built: number;
  }>;
  authority: Readonly<{
    can_change_score_semantics: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_publish_candidate: false;
    can_execute_broker_action: false;
  }>;
}>;

export type ScannerScoreGateAlignmentCohortDiagnostic = Readonly<{
  diagnostic_version:
    typeof SCANNER_SCORE_GATE_ALIGNMENT_COHORT_DIAGNOSTIC_VERSION;
  status: "available" | "insufficient_evidence" | "invalid";
  reason_codes: readonly string[];
  cycle_counts: Readonly<{
    total: number;
    observed: number;
    not_observed: number;
    invalid: number;
    with_divergence: number;
  }>;
  candidate_counts: Readonly<{
    selected: number;
    aligned_qualified: number;
    ranking_qualified_local_block: number;
    ranking_not_qualified: number;
    built: number;
  }>;
  score_gap: Readonly<{
    average: number | null;
    maximum: number | null;
  }>;
  signal:
    | "repeated_score_contract_divergence"
    | "isolated_score_contract_divergence"
    | "aligned"
    | "insufficient_evidence"
    | "invalid";
  investigation_priority:
    | "unify_score_gate_semantics"
    | "observe_more"
    | "none"
    | "invalid";
  authority: ScannerScoreGateAlignmentDiagnostic["authority"];
}>;

function inertAuthority(): ScannerScoreGateAlignmentDiagnostic["authority"] {
  return Object.freeze({
    can_change_score_semantics: false,
    can_change_ranking_or_publication: false,
    can_lower_threshold: false,
    can_publish_candidate: false,
    can_execute_broker_action: false,
  });
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function positiveInteger(value: unknown) {
  const parsed = nonNegativeInteger(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value.map((item) => item.trim()).filter(Boolean)
    : null;
}

function uniqueReasonCodes(values: readonly string[]) {
  return Object.freeze([...new Set(values)]);
}

function emptyCounts() {
  return Object.freeze({
    selected: 0,
    aligned_qualified: 0,
    ranking_qualified_local_block: 0,
    ranking_not_qualified: 0,
    built: 0,
  });
}

function diagnostic(
  status: ScannerScoreGateAlignmentDiagnostic["status"],
  reasonCodes: readonly string[],
  publishableThreshold: number | null = null,
  candidates: readonly ScannerScoreGateAlignmentCandidate[] = [],
): ScannerScoreGateAlignmentDiagnostic {
  const counts = candidates.reduce(
    (result, candidate) => {
      result.selected += 1;
      result[candidate.alignment] += 1;
      if (candidate.built) result.built += 1;
      return result;
    },
    {
      selected: 0,
      aligned_qualified: 0,
      ranking_qualified_local_block: 0,
      ranking_not_qualified: 0,
      built: 0,
    },
  );
  return Object.freeze({
    diagnostic_version: SCANNER_SCORE_GATE_ALIGNMENT_DIAGNOSTIC_VERSION,
    status,
    reason_codes: uniqueReasonCodes(reasonCodes),
    publishable_threshold: publishableThreshold,
    candidates: Object.freeze([...candidates]),
    counts: Object.freeze(counts),
    authority: inertAuthority(),
  });
}

function buildCandidate({
  ranking,
  build,
  threshold,
}: {
  ranking: Record<string, unknown>;
  build: Record<string, unknown>;
  threshold: number;
}): ScannerScoreGateAlignmentCandidate | null {
  const ticker = textOrNull(ranking.ticker)?.toUpperCase();
  const buildTicker = textOrNull(build.ticker)?.toUpperCase();
  const score = objectOrNull(ranking.score);
  const rank = positiveInteger(ranking.rank);
  const rankingScore = finiteScore(score?.normalized_score);
  const rankingTier = textOrNull(score?.tier);
  const localScore = finiteScore(build.score);
  const built = typeof build.built === "boolean" ? build.built : null;
  const rejectionReason = textOrNull(build.rejection_reason);
  if (
    !ticker ||
    !/^[A-Z][A-Z0-9.-]{0,15}$/.test(ticker) ||
    ticker !== buildTicker ||
    rank === null ||
    rankingScore === null ||
    !rankingTier ||
    localScore === null ||
    built === null ||
    !rejectionReason ||
    ranking.selected !== true
  ) {
    return null;
  }
  const rankingGatePassed = rankingQualifiedTiers.has(rankingTier);
  const localGatePassed = localScore >= threshold;
  const alignment = !rankingGatePassed
    ? ("ranking_not_qualified" as const)
    : localGatePassed
      ? ("aligned_qualified" as const)
      : ("ranking_qualified_local_block" as const);
  if (
    (built && (!rankingGatePassed || !localGatePassed || rejectionReason !== "built")) ||
    (!built && rejectionReason === "built")
  ) {
    return null;
  }
  return Object.freeze({
    ticker,
    rank,
    ranking_score: rankingScore,
    ranking_tier: rankingTier,
    local_score: localScore,
    publishable_threshold: threshold,
    score_gap: Math.round((rankingScore - localScore) * 100) / 100,
    ranking_gate_passed: rankingGatePassed,
    local_publish_gate_passed: localGatePassed,
    built,
    rejection_reason: rejectionReason,
    alignment,
  });
}

export function scannerScoreGateAlignmentDiagnosticFromScanLog(
  scanLog: ScanLogEntry | null,
  terminal: boolean,
): ScannerScoreGateAlignmentDiagnostic {
  if (!scanLog) return diagnostic("not_observed", ["scan_log_missing"]);
  const ranking = scanLog.scanner_candidate_ranking;
  if (!ranking || ranking.selected_count === 0) {
    return diagnostic("not_observed", ["selected_ranking_candidates_missing"]);
  }
  const threshold = finiteScore(scanLog.publishable_threshold);
  const diagnostics = scanLog.selected_candidate_build_diagnostics;
  if (threshold === null || !Array.isArray(diagnostics)) {
    return diagnostic(
      terminal ? "invalid" : "not_observed",
      ["score_gate_alignment_inputs_missing"],
    );
  }
  const selected = ranking.results
    .filter((result) => result.selected)
    .map((result) => objectOrNull(result));
  const builds = new Map(
    diagnostics.map((item) => [item.ticker.trim().toUpperCase(), objectOrNull(item)]),
  );
  const candidates = selected.map((result) => {
    const ticker = textOrNull(result?.ticker)?.toUpperCase();
    const build = ticker ? builds.get(ticker) : null;
    return result && build
      ? buildCandidate({ ranking: result, build, threshold })
      : null;
  });
  const parsed = candidates.filter(
    (candidate): candidate is ScannerScoreGateAlignmentCandidate => candidate !== null,
  );
  const uniqueTickers = new Set(parsed.map((candidate) => candidate.ticker));
  const consistent =
    candidates.every((candidate) => candidate !== null) &&
    selected.length === ranking.selected_count &&
    parsed.length === diagnostics.length &&
    uniqueTickers.size === parsed.length &&
    ranking.selection.selected_tickers.length === parsed.length &&
    ranking.selection.selected_tickers.every((ticker) =>
      uniqueTickers.has(ticker.trim().toUpperCase()),
    );
  if (!consistent) {
    return diagnostic("invalid", ["score_gate_alignment_inconsistent"]);
  }
  const divergence = parsed.some(
    (candidate) => candidate.alignment === "ranking_qualified_local_block",
  );
  return diagnostic(
    "observed",
    [
      divergence
        ? "ranking_and_local_score_gate_diverge"
        : "ranking_and_local_score_gate_aligned",
    ],
    threshold,
    parsed.sort((first, second) => first.rank - second.rank),
  );
}

function authorityIsInert(value: unknown) {
  const authority = objectOrNull(value);
  return Boolean(
    authority &&
      authority.can_change_score_semantics === false &&
      authority.can_change_ranking_or_publication === false &&
      authority.can_lower_threshold === false &&
      authority.can_publish_candidate === false &&
      authority.can_execute_broker_action === false,
  );
}

function parseCandidate(value: unknown): ScannerScoreGateAlignmentCandidate | null {
  const candidate = objectOrNull(value);
  const ticker = textOrNull(candidate?.ticker)?.toUpperCase();
  const rank = positiveInteger(candidate?.rank);
  const rankingScore = finiteScore(candidate?.ranking_score);
  const localScore = finiteScore(candidate?.local_score);
  const threshold = finiteScore(candidate?.publishable_threshold);
  const rankingTier = textOrNull(candidate?.ranking_tier);
  const rejectionReason = textOrNull(candidate?.rejection_reason);
  const alignment = textOrNull(candidate?.alignment);
  if (
    !ticker ||
    !/^[A-Z][A-Z0-9.-]{0,15}$/.test(ticker) ||
    rank === null ||
    rankingScore === null ||
    localScore === null ||
    threshold === null ||
    !rankingTier ||
    !rejectionReason ||
    typeof candidate?.ranking_gate_passed !== "boolean" ||
    typeof candidate.local_publish_gate_passed !== "boolean" ||
    typeof candidate.built !== "boolean" ||
    ![
      "aligned_qualified",
      "ranking_qualified_local_block",
      "ranking_not_qualified",
    ].includes(alignment ?? "")
  ) {
    return null;
  }
  const rebuilt = buildCandidate({
    ranking: {
      ticker,
      rank,
      selected: true,
      score: { normalized_score: rankingScore, tier: rankingTier },
    },
    build: {
      ticker,
      score: localScore,
      built: candidate.built,
      rejection_reason: rejectionReason,
    },
    threshold,
  });
  return rebuilt &&
    rebuilt.alignment === alignment &&
    rebuilt.score_gap === candidate.score_gap &&
    rebuilt.ranking_gate_passed === candidate.ranking_gate_passed &&
    rebuilt.local_publish_gate_passed === candidate.local_publish_gate_passed
    ? rebuilt
    : null;
}

export function scannerScoreGateAlignmentDiagnosticFromUnknown(
  value: unknown,
): ScannerScoreGateAlignmentDiagnostic {
  const candidate = objectOrNull(value);
  const status = textOrNull(candidate?.status);
  const reasons = stringArray(candidate?.reason_codes);
  if (
    candidate?.diagnostic_version !== SCANNER_SCORE_GATE_ALIGNMENT_DIAGNOSTIC_VERSION ||
    !status ||
    !["observed", "not_observed", "invalid"].includes(status) ||
    !reasons ||
    !authorityIsInert(candidate.authority)
  ) {
    return diagnostic("invalid", ["score_gate_alignment_readback_invalid"]);
  }
  if (status !== "observed") {
    return diagnostic(status as "not_observed" | "invalid", reasons);
  }
  const threshold = finiteScore(candidate.publishable_threshold);
  const rawCandidates = Array.isArray(candidate.candidates) ? candidate.candidates : [];
  const parsed = rawCandidates.map(parseCandidate);
  const counts = objectOrNull(candidate.counts);
  if (
    threshold === null ||
    parsed.some((item) => item === null) ||
    !counts
  ) {
    return diagnostic("invalid", ["score_gate_alignment_readback_invalid"]);
  }
  const rebuilt = diagnostic(
    "observed",
    reasons,
    threshold,
    parsed as ScannerScoreGateAlignmentCandidate[],
  );
  const countKeys = [
    "selected",
    "aligned_qualified",
    "ranking_qualified_local_block",
    "ranking_not_qualified",
    "built",
  ] as const;
  return countKeys.every(
    (key) => counts[key] === rebuilt.counts[key],
  )
    ? rebuilt
    : diagnostic("invalid", ["score_gate_alignment_readback_inconsistent"]);
}

function roundedAverage(values: readonly number[]) {
  return values.length > 0
    ? Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 100) /
        100
    : null;
}

export function buildScannerScoreGateAlignmentCohortDiagnostic(
  diagnostics: readonly ScannerScoreGateAlignmentDiagnostic[],
): ScannerScoreGateAlignmentCohortDiagnostic {
  const invalid = diagnostics.filter((item) => item.status === "invalid").length;
  const notObserved = diagnostics.filter((item) => item.status === "not_observed").length;
  const observed = diagnostics.filter((item) => item.status === "observed");
  const candidates = observed.flatMap((item) => item.candidates);
  const withDivergence = observed.filter(
    (item) => item.counts.ranking_qualified_local_block > 0,
  ).length;
  const counts = observed.reduce(
    (result, item) => {
      result.selected += item.counts.selected;
      result.aligned_qualified += item.counts.aligned_qualified;
      result.ranking_qualified_local_block +=
        item.counts.ranking_qualified_local_block;
      result.ranking_not_qualified += item.counts.ranking_not_qualified;
      result.built += item.counts.built;
      return result;
    },
    { ...emptyCounts() },
  );
  const status =
    invalid > 0
      ? ("invalid" as const)
      : observed.length < 2
        ? ("insufficient_evidence" as const)
        : ("available" as const);
  const signal =
    status === "invalid"
      ? ("invalid" as const)
      : status === "insufficient_evidence"
        ? ("insufficient_evidence" as const)
        : withDivergence >= 2
          ? ("repeated_score_contract_divergence" as const)
          : withDivergence === 1
            ? ("isolated_score_contract_divergence" as const)
            : ("aligned" as const);
  const priority =
    signal === "repeated_score_contract_divergence"
      ? ("unify_score_gate_semantics" as const)
      : signal === "isolated_score_contract_divergence" ||
          signal === "insufficient_evidence"
        ? ("observe_more" as const)
        : signal === "aligned"
          ? ("none" as const)
          : ("invalid" as const);
  const gaps = candidates.map((candidate) => candidate.score_gap);
  return Object.freeze({
    diagnostic_version: SCANNER_SCORE_GATE_ALIGNMENT_COHORT_DIAGNOSTIC_VERSION,
    status,
    reason_codes: Object.freeze([
      status === "invalid"
        ? "score_gate_alignment_cycle_invalid"
        : status === "insufficient_evidence"
          ? "score_gate_alignment_requires_two_cycles"
          : "score_gate_alignment_cohort_available",
    ]),
    cycle_counts: Object.freeze({
      total: diagnostics.length,
      observed: observed.length,
      not_observed: notObserved,
      invalid,
      with_divergence: withDivergence,
    }),
    candidate_counts: Object.freeze(counts),
    score_gap: Object.freeze({
      average: roundedAverage(gaps),
      maximum: gaps.length > 0 ? Math.max(...gaps) : null,
    }),
    signal,
    investigation_priority: priority,
    authority: inertAuthority(),
  });
}

export function scannerScoreGateAlignmentCohortDiagnosticFromUnknown(
  value: unknown,
): ScannerScoreGateAlignmentCohortDiagnostic | null {
  const candidate = objectOrNull(value);
  if (
    candidate?.diagnostic_version !==
      SCANNER_SCORE_GATE_ALIGNMENT_COHORT_DIAGNOSTIC_VERSION ||
    !authorityIsInert(candidate.authority)
  ) {
    return null;
  }
  const status = textOrNull(candidate.status);
  const reasons = stringArray(candidate.reason_codes);
  const cycles = objectOrNull(candidate.cycle_counts);
  const counts = objectOrNull(candidate.candidate_counts);
  const gap = objectOrNull(candidate.score_gap);
  const signal = textOrNull(candidate.signal);
  const priority = textOrNull(candidate.investigation_priority);
  const cycleKeys = ["total", "observed", "not_observed", "invalid", "with_divergence"];
  const countKeys = [
    "selected",
    "aligned_qualified",
    "ranking_qualified_local_block",
    "ranking_not_qualified",
    "built",
  ];
  if (
    !status ||
    !["available", "insufficient_evidence", "invalid"].includes(status) ||
    !reasons ||
    !cycles ||
    !counts ||
    !gap ||
    !cycleKeys.every((key) => nonNegativeInteger(cycles[key]) !== null) ||
    !countKeys.every((key) => nonNegativeInteger(counts[key]) !== null) ||
    ![
      "repeated_score_contract_divergence",
      "isolated_score_contract_divergence",
      "aligned",
      "insufficient_evidence",
      "invalid",
    ].includes(signal ?? "") ||
    !["unify_score_gate_semantics", "observe_more", "none", "invalid"].includes(
      priority ?? "",
    ) ||
    ![gap.average, gap.maximum].every(
      (item) => item === null || (typeof item === "number" && Number.isFinite(item)),
    )
  ) {
    return null;
  }
  const expectedStatus =
    (cycles.invalid as number) > 0
      ? "invalid"
      : (cycles.observed as number) < 2
        ? "insufficient_evidence"
        : "available";
  const expectedSignal =
    expectedStatus === "invalid"
      ? "invalid"
      : expectedStatus === "insufficient_evidence"
        ? "insufficient_evidence"
        : (cycles.with_divergence as number) >= 2
          ? "repeated_score_contract_divergence"
          : (cycles.with_divergence as number) === 1
            ? "isolated_score_contract_divergence"
            : "aligned";
  const expectedPriority =
    expectedSignal === "repeated_score_contract_divergence"
      ? "unify_score_gate_semantics"
      : expectedSignal === "isolated_score_contract_divergence" ||
          expectedSignal === "insufficient_evidence"
        ? "observe_more"
        : expectedSignal === "aligned"
          ? "none"
          : "invalid";
  const selectedCount = counts.selected as number;
  const observedCount = cycles.observed as number;
  const divergenceCycleCount = cycles.with_divergence as number;
  const divergenceCandidateCount = counts.ranking_qualified_local_block as number;
  const averageGap = gap.average as number | null;
  const maximumGap = gap.maximum as number | null;
  if (
    cycles.total !==
      (cycles.observed as number) +
        (cycles.not_observed as number) +
        (cycles.invalid as number) ||
    divergenceCycleCount > observedCount ||
    counts.selected !==
      (counts.aligned_qualified as number) +
        (counts.ranking_qualified_local_block as number) +
        (counts.ranking_not_qualified as number) ||
    selectedCount < observedCount ||
    (counts.built as number) > (counts.aligned_qualified as number) ||
    divergenceCycleCount > divergenceCandidateCount ||
    (divergenceCycleCount === 0) !== (divergenceCandidateCount === 0) ||
    (averageGap === null) !== (maximumGap === null) ||
    (selectedCount === 0) !== (averageGap === null) ||
    (averageGap !== null && maximumGap !== null && maximumGap < averageGap) ||
    status !== expectedStatus ||
    signal !== expectedSignal ||
    priority !== expectedPriority
  ) {
    return null;
  }
  return value as ScannerScoreGateAlignmentCohortDiagnostic;
}
