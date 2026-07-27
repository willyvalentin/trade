import "server-only";

import {
  CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION,
  CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION,
  CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
  buildCanonicalCounterfactualOpportunitySet,
  buildCanonicalNoTradeDecision,
  canonicalCounterfactualSemanticDigest,
  validCanonicalCounterfactualReasonCodes,
  type CanonicalCandidateMembershipInput,
  type CanonicalCounterfactualReasonCode,
  type CanonicalCounterfactualDecision,
  type CanonicalDecisionDisposition,
  type CanonicalDecisionLineageNode,
  type CanonicalExpectedOutcomeLineage,
  type CanonicalCounterfactualOpportunitySetContract,
  type CanonicalOpportunitySetProviderContext,
  type CanonicalOpportunitySetVersions,
} from "@/lib/canonical-counterfactual-opportunity-set";
import {
  verifyPreTruncationCandidateCaptureEvidence,
  type PreTruncationCandidateCaptureEvidence,
} from "@/lib/pre-truncation-candidate-capture-evidence";
import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type { SelectedCandidateBuildDiagnostic } from "@/lib/recommendation-build-diagnostics";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type {
  ScannerCandidateRankingResult,
  ScannerCandidateRankingSummary,
} from "@/lib/scanner-candidate-ranking";

export const COMPLETED_SCANNER_BUNDLE_ADAPTER_VERSION =
  "completed_scanner_bundle_opportunity_set_adapter_v1" as const;

export type CompletedScannerBundleAdapterStatus =
  | "mapped"
  | "conflicting"
  | "unmappable";

export type CompletedScannerBundleDiagnosticSource =
  | "bundle"
  | "scanner_candidate_ranking"
  | "recommendation_scan_run"
  | "recommendation_batch"
  | "recommendation_build_diagnostics"
  | "candidate_membership"
  | "versions"
  | "provider_context"
  | "no_trade_decision"
  | "outcome_lineage";

export type CompletedScannerBundleDiagnostic = {
  source: CompletedScannerBundleDiagnosticSource;
  reason_code: string;
  classification: "conflicting" | "unmappable";
};

export type CompletedScannerOutcomeLineage = {
  candidate_identity: string;
  outcome_identity: string;
  evaluator_input_identity: string;
  recommendation_decision_identity: string | null;
  snapshot_identity: string | null;
  evaluation_digest_algorithm: "sha256_canonical_json_v1";
  evaluation_digest: string;
};

export type CompletedScannerCandidateEvidence = {
  candidate_identity: string | null;
  ranking: ScannerCandidateRankingResult | null;
  tie_break_key: string | null;
  setup: string | null;
  context: CanonicalCandidateMembershipInput["context"];
  membership_status:
    | CanonicalCandidateMembershipInput["membership_status"]
    | null;
  rejection_reason_codes: string[] | null;
  raw_rejection_reason: string | null;
  threshold_version: string | null;
  ranking_version: string | null;
  eligibility_at_decision:
    | CanonicalCandidateMembershipInput["eligibility_at_decision"]
    | null;
  data_gap_codes: string[];
  provider_source_timestamp: string | null;
  batch_identity: string | null;
  recommendation_decision_identity: string | null;
  snapshot_identity: string | null;
  expected_outcome_lineage: CanonicalExpectedOutcomeLineage;
  outcome: CanonicalCandidateMembershipInput["outcome"];
  outcome_lineage: CompletedScannerOutcomeLineage | null;
};

export type CompletedScannerNoTradeEvidence = {
  explicit_decision_recorded: boolean;
  producer_decision_id: string | null;
  decision_timestamp: string | null;
  decision_reason_code: string | null;
  decision_reason_detail: string | null;
  decision_source: string | null;
  ai_no_trade_observed: boolean;
  deterministic_fallback_used: boolean;
};

export type CompletedScannerDecisionDisposition =
  CanonicalDecisionDisposition;

export type CompletedScannerDecisionLineageNode =
  CanonicalDecisionLineageNode;

export type CompletedScannerBundleProjectionInput = {
  source_namespace: string | null;
  completion_status: RecommendationScanRun["status"] | null;
  scan_run: RecommendationScanRun | null;
  batch: RecommendationBatch | null;
  ranking_summary: ScannerCandidateRankingSummary | null;
  build_diagnostics: SelectedCandidateBuildDiagnostic[];
  stable_scan_identity: string | null;
  producer_decision_id: string | null;
  decision_timestamp: string | null;
  point_in_time_cutoff: string | null;
  full_membership_declared: boolean;
  expected_candidate_count: number | null;
  pre_truncation_capture_evidence: PreTruncationCandidateCaptureEvidence | null;
  versions: CanonicalOpportunitySetVersions | null;
  provider_context: CanonicalOpportunitySetProviderContext | null;
  candidates: CompletedScannerCandidateEvidence[];
  decision_lineage_nodes: CompletedScannerDecisionLineageNode[];
  decision_disposition: CompletedScannerDecisionDisposition;
  no_trade_evidence: CompletedScannerNoTradeEvidence | null;
  counterfactual_evaluation_requested: boolean;
};

export type CompletedScannerBundleProjectionResult = {
  adapter_version: typeof COMPLETED_SCANNER_BUNDLE_ADAPTER_VERSION;
  status: CompletedScannerBundleAdapterStatus;
  opportunity_set: CanonicalCounterfactualOpportunitySetContract | null;
  no_trade_decision: CanonicalCounterfactualDecision | null;
  opportunity_set_complete: boolean;
  counterfactual_evaluable: boolean;
  diagnostics: CompletedScannerBundleDiagnostic[];
};

export type CompletedScannerBundleCoverageSource = {
  source: CompletedScannerBundleDiagnosticSource;
  reason_counts: Record<string, number>;
};

export type CompletedScannerBundleCoverageReport = {
  adapter_version: typeof COMPLETED_SCANNER_BUNDLE_ADAPTER_VERSION;
  total: number;
  mapped: number;
  conflicting: number;
  unmappable: number;
  complete_opportunity_sets: number;
  evaluable_counterfactual_sets: number;
  reason_codes_by_source: CompletedScannerBundleCoverageSource[];
};

const instantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const reasonCodePattern = /^[a-z0-9][a-z0-9._-]{0,95}$/;
const fullShaPattern = /^[0-9a-f]{64}$/;

function diagnostic(
  source: CompletedScannerBundleDiagnosticSource,
  reasonCode: string,
  classification: CompletedScannerBundleDiagnostic["classification"],
): CompletedScannerBundleDiagnostic {
  return { source, reason_code: reasonCode, classification };
}

function uniqueDiagnostics(
  diagnostics: CompletedScannerBundleDiagnostic[],
) {
  return Array.from(
    new Map(
      diagnostics
        .sort((first, second) =>
          `${first.source}:${first.reason_code}:${first.classification}`.localeCompare(
            `${second.source}:${second.reason_code}:${second.classification}`,
          ),
        )
        .map((item) => [
          `${item.source}:${item.reason_code}:${item.classification}`,
          item,
        ]),
    ).values(),
  );
}

function exactText(value: string | null): value is string {
  return typeof value === "string" && value.length > 0 && value === value.trim();
}

function explicitInstant(value: string | null) {
  return Boolean(value && instantPattern.test(value) && Number.isFinite(Date.parse(value)));
}

function sameStringSet(first: string[], second: string[]) {
  const left = [...first].sort();
  const right = [...second].sort();
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function completedScannerOutcomeEvaluationDigest(input: {
  expected_outcome_lineage: CanonicalExpectedOutcomeLineage;
  outcome: NonNullable<CanonicalCandidateMembershipInput["outcome"]>;
  outcome_lineage: Omit<
    CompletedScannerOutcomeLineage,
    "evaluation_digest_algorithm" | "evaluation_digest"
  >;
}) {
  return canonicalCounterfactualSemanticDigest(input);
}

function validateVersions(
  versions: CanonicalOpportunitySetVersions | null,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  if (!versions) {
    diagnostics.push(
      diagnostic("versions", "versions_metadata_missing", "unmappable"),
    );
    return diagnostics;
  }
  const required = [
    "scanner_version",
    "universe_version",
    "threshold_version",
    "reason_taxonomy_version",
    "engine_version",
    "scoring_version",
    "ranking_version",
    "setup_taxonomy_version",
    "confidence_contract_version",
    "evaluator_version",
    "provider_contract_version",
    "git_commit",
    "build_identity",
  ] as const;
  for (const key of required) {
    if (!exactText(versions[key])) {
      diagnostics.push(
        diagnostic("versions", `${key}_missing`, "unmappable"),
      );
    }
  }
  if (
    exactText(versions.git_commit) &&
    !/^[0-9a-f]{40}$/.test(versions.git_commit)
  ) {
    diagnostics.push(
      diagnostic("versions", "git_commit_not_full_sha", "unmappable"),
    );
  }
  if (
    versions.reason_taxonomy_version !==
    CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION
  ) {
    diagnostics.push(
      diagnostic("versions", "reason_taxonomy_version_conflict", "conflicting"),
    );
  }
  return diagnostics;
}

function validateProvider(
  provider: CanonicalOpportunitySetProviderContext | null,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  if (!provider) {
    return [
      diagnostic("provider_context", "provider_context_missing", "unmappable"),
    ];
  }
  if (!exactText(provider.provider)) {
    diagnostics.push(
      diagnostic("provider_context", "provider_identity_missing", "unmappable"),
    );
  }
  if (!explicitInstant(provider.source_timestamp)) {
    diagnostics.push(
      diagnostic(
        "provider_context",
        "provider_source_timestamp_missing",
        "unmappable",
      ),
    );
  }
  if (
    !Number.isInteger(provider.expected_observation_count) ||
    provider.expected_observation_count < 0 ||
    !Number.isInteger(provider.observed_observation_count) ||
    provider.observed_observation_count < 0
  ) {
    diagnostics.push(
      diagnostic("provider_context", "provider_coverage_invalid", "unmappable"),
    );
  } else if (
    provider.observed_observation_count > provider.expected_observation_count
  ) {
    diagnostics.push(
      diagnostic(
        "provider_context",
        "provider_coverage_count_conflict",
        "conflicting",
      ),
    );
  }
  if (
    provider.coverage_contract_version !==
      CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION ||
    provider.coverage_denominator !== "candidate_provider_observations" ||
    provider.coverage_unit !== "candidate"
  ) {
    diagnostics.push(
      diagnostic(
        "provider_context",
        "provider_coverage_contract_invalid",
        "unmappable",
      ),
    );
  }
  if (
    provider.expected_observation_count === 0 &&
    provider.observed_observation_count === 0
  ) {
    diagnostics.push(
      diagnostic(
        "provider_context",
        "positive_provider_coverage_required",
        "unmappable",
      ),
    );
  }
  if (
    !validCanonicalCounterfactualReasonCodes(provider.coverage_reason_codes)
  ) {
    diagnostics.push(
      diagnostic(
        "provider_context",
        "provider_coverage_reason_taxonomy_unknown",
        "unmappable",
      ),
    );
  }
  return diagnostics;
}

function validateCaptureEvidence(
  input: CompletedScannerBundleProjectionInput,
) {
  const evidence = input.pre_truncation_capture_evidence;
  if (!evidence) {
    return [
      diagnostic(
        "candidate_membership",
        "pre_truncation_capture_evidence_missing",
        "unmappable",
      ),
    ];
  }
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  const verification = verifyPreTruncationCandidateCaptureEvidence(evidence);
  for (const reasonCode of verification.reason_codes) {
    diagnostics.push(
      diagnostic("candidate_membership", reasonCode, "conflicting"),
    );
  }
  const candidateIdentities = input.candidates.flatMap((candidate) =>
    candidate.candidate_identity ? [candidate.candidate_identity] : [],
  );
  if (
    (exactText(input.stable_scan_identity) &&
      evidence.scan_identity !== input.stable_scan_identity) ||
    (exactText(input.producer_decision_id) &&
      evidence.producer_decision_id !== input.producer_decision_id) ||
    evidence.point_in_time_cutoff !== input.point_in_time_cutoff ||
    evidence.full_candidate_count !== input.expected_candidate_count ||
    !sameStringSet(evidence.sorted_candidate_identities, candidateIdentities)
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "pre_truncation_membership_evidence_conflict",
        "conflicting",
      ),
    );
  }
  if (
    input.versions &&
    (evidence.scanner_version !== input.versions.scanner_version ||
      evidence.universe_version !== input.versions.universe_version ||
      evidence.provider_contract_version !==
        input.versions.provider_contract_version)
  ) {
    diagnostics.push(
      diagnostic(
        "versions",
        "pre_truncation_capture_version_conflict",
        "conflicting",
      ),
    );
  }
  return diagnostics;
}

function validateBundleLineage(
  input: CompletedScannerBundleProjectionInput,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  if (input.completion_status !== "completed") {
    diagnostics.push(
      diagnostic("bundle", "completed_bundle_required", "unmappable"),
    );
  }
  if (!input.scan_run || input.scan_run.status !== "completed") {
    diagnostics.push(
      diagnostic(
        "recommendation_scan_run",
        "completed_scan_run_missing",
        "unmappable",
      ),
    );
  }
  if (
    input.decision_disposition !== "publish_recommendations" &&
    input.decision_disposition !== "explicit_no_trade" &&
    input.decision_disposition !== "deterministic_fallback"
  ) {
    diagnostics.push(
      diagnostic("bundle", "decision_disposition_invalid", "unmappable"),
    );
  }
  if (!exactText(input.source_namespace)) {
    diagnostics.push(
      diagnostic("bundle", "source_namespace_missing", "unmappable"),
    );
  }
  if (!exactText(input.stable_scan_identity)) {
    diagnostics.push(
      diagnostic(
        "recommendation_scan_run",
        "stable_scan_identity_missing",
        "unmappable",
      ),
    );
  }
  if (!exactText(input.producer_decision_id)) {
    diagnostics.push(
      diagnostic("bundle", "producer_decision_id_missing", "unmappable"),
    );
  }
  if (!explicitInstant(input.decision_timestamp)) {
    diagnostics.push(
      diagnostic("bundle", "decision_timestamp_missing", "unmappable"),
    );
  }
  if (!explicitInstant(input.point_in_time_cutoff)) {
    diagnostics.push(
      diagnostic("bundle", "point_in_time_cutoff_missing", "unmappable"),
    );
  }
  if (
    input.scan_run &&
    input.stable_scan_identity &&
    input.scan_run.id !== input.stable_scan_identity
  ) {
    diagnostics.push(
      diagnostic(
        "recommendation_scan_run",
        "stable_scan_identity_conflict",
        "conflicting",
      ),
    );
  }
  if (
    input.scan_run?.completed_at &&
    input.decision_timestamp &&
    input.scan_run.completed_at !== input.decision_timestamp
  ) {
    diagnostics.push(
      diagnostic(
        "recommendation_scan_run",
        "scan_completion_decision_timestamp_conflict",
        "conflicting",
      ),
    );
  }
  if (
    input.ranking_summary?.generated_at &&
    input.decision_timestamp &&
    input.ranking_summary.generated_at !== input.decision_timestamp
  ) {
    diagnostics.push(
      diagnostic(
        "scanner_candidate_ranking",
        "ranking_decision_timestamp_conflict",
        "conflicting",
      ),
    );
  }
  if (
    input.batch &&
    input.stable_scan_identity &&
    input.batch.scan_run_id !== input.stable_scan_identity
  ) {
    diagnostics.push(
      diagnostic(
        "recommendation_batch",
        "batch_scan_lineage_conflict",
        "conflicting",
      ),
    );
  }
  return diagnostics;
}

function validateRankingCompleteness(
  input: CompletedScannerBundleProjectionInput,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  const summary = input.ranking_summary;
  if (!summary) {
    return [
      diagnostic(
        "scanner_candidate_ranking",
        "ranking_summary_missing",
        "unmappable",
      ),
    ];
  }
  if (!input.full_membership_declared) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "full_candidate_membership_not_declared",
        "unmappable",
      ),
    );
  }
  const summaryTruncated =
    summary.candidates_ranked !== summary.results.length;
  if (
    input.expected_candidate_count === null ||
    !Number.isInteger(input.expected_candidate_count) ||
    input.expected_candidate_count < 0
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "expected_candidate_count_missing",
        "unmappable",
      ),
    );
  }
  if (summaryTruncated) {
    diagnostics.push(
      diagnostic(
        "scanner_candidate_ranking",
        "ranking_summary_truncated",
        "unmappable",
      ),
    );
  }
  if (
    !summaryTruncated &&
    input.expected_candidate_count !== null &&
    (input.expected_candidate_count !== summary.candidates_ranked ||
      input.expected_candidate_count !== input.candidates.length)
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "candidate_membership_count_mismatch",
        "conflicting",
      ),
    );
  }
  const resultTickers = summary.results.map((result) => result.ticker);
  if (new Set(resultTickers).size !== resultTickers.length) {
    diagnostics.push(
      diagnostic(
        "scanner_candidate_ranking",
        "ranking_candidate_duplicate",
        "conflicting",
      ),
    );
  }
  const evidenceTickers = input.candidates.flatMap((candidate) =>
    candidate.ranking ? [candidate.ranking.ticker] : [],
  );
  if (
    evidenceTickers.length === input.candidates.length &&
    !sameStringSet(resultTickers, evidenceTickers)
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "ranking_membership_join_conflict",
        "conflicting",
      ),
    );
  }
  const summaryByTicker = new Map(
    summary.results.map((ranking) => [ranking.ticker, ranking]),
  );
  if (
    input.candidates.some(
      (candidate) =>
        candidate.ranking &&
        summaryByTicker.has(candidate.ranking.ticker) &&
        canonicalCounterfactualSemanticDigest(candidate.ranking) !==
          canonicalCounterfactualSemanticDigest(
            summaryByTicker.get(candidate.ranking.ticker),
          ),
    )
  ) {
    diagnostics.push(
      diagnostic(
        "scanner_candidate_ranking",
        "ranking_candidate_evidence_conflict",
        "conflicting",
      ),
    );
  }
  const selectedTickers = summary.results
    .filter((ranking) => ranking.selected)
    .map((ranking) => ranking.ticker);
  if (
    summary.selected_count !== selectedTickers.length ||
    !sameStringSet(summary.selection.selected_tickers, selectedTickers)
  ) {
    diagnostics.push(
      diagnostic(
        "scanner_candidate_ranking",
        "ranking_selection_summary_conflict",
        "conflicting",
      ),
    );
  }
  return diagnostics;
}

function validateBuildDiagnostics(
  input: CompletedScannerBundleProjectionInput,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  const tickers = input.build_diagnostics.map((item) => item.ticker);
  if (new Set(tickers).size !== tickers.length) {
    diagnostics.push(
      diagnostic(
        "recommendation_build_diagnostics",
        "build_diagnostic_ticker_duplicate",
        "conflicting",
      ),
    );
  }
  const candidateTickers = new Set(
    input.candidates.flatMap((candidate) =>
      candidate.ranking ? [candidate.ranking.ticker] : [],
    ),
  );
  if (tickers.some((ticker) => !candidateTickers.has(ticker))) {
    diagnostics.push(
      diagnostic(
        "recommendation_build_diagnostics",
        "build_diagnostic_candidate_not_joinable",
        "conflicting",
      ),
    );
  }
  return diagnostics;
}

function validateCandidates(
  input: CompletedScannerBundleProjectionInput,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  const identities: string[] = [];
  const outcomeIdentities: string[] = [];
  const evaluatorInputIdentities: string[] = [];
  const expectedOutcomeLineageKeys: string[] = [];
  const ranks = new Map<number, CompletedScannerCandidateEvidence[]>();
  for (const candidate of input.candidates) {
    if (!exactText(candidate.candidate_identity)) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_identity_missing",
          "unmappable",
        ),
      );
    } else {
      identities.push(candidate.candidate_identity);
    }
    if (!candidate.ranking) {
      diagnostics.push(
        diagnostic(
          "scanner_candidate_ranking",
          "candidate_ranking_missing",
          "unmappable",
        ),
      );
      continue;
    }
    const rankGroup = ranks.get(candidate.ranking.rank) ?? [];
    rankGroup.push(candidate);
    ranks.set(candidate.ranking.rank, rankGroup);
    if (!candidate.membership_status) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_membership_status_missing",
          "unmappable",
        ),
      );
    }
    if (candidate.rejection_reason_codes === null) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          candidate.raw_rejection_reason
            ? "free_text_rejection_reason_not_canonical"
            : "candidate_rejection_reason_codes_missing",
          "unmappable",
        ),
      );
    } else if (
      candidate.rejection_reason_codes.some(
        (reason) => !reasonCodePattern.test(reason),
      ) ||
      !validCanonicalCounterfactualReasonCodes(
        candidate.rejection_reason_codes,
      )
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_rejection_reason_code_invalid",
          "unmappable",
        ),
      );
    }
    if (
      candidate.membership_status &&
      candidate.membership_status !== "selected" &&
      candidate.rejection_reason_codes !== null &&
      candidate.rejection_reason_codes.length === 0
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_rejection_reason_codes_missing",
          "unmappable",
        ),
      );
    }
    if (
      !candidate.threshold_version ||
      !candidate.ranking_version ||
      !candidate.eligibility_at_decision ||
      !candidate.provider_source_timestamp
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_required_metadata_missing",
          "unmappable",
        ),
      );
    }
    if (
      input.versions &&
      candidate.ranking_version &&
      candidate.ranking_version !== input.versions.ranking_version
    ) {
      diagnostics.push(
        diagnostic("versions", "mixed_ranking_versions", "conflicting"),
      );
    }
    if (
      input.versions &&
      candidate.threshold_version &&
      candidate.threshold_version !== input.versions.threshold_version
    ) {
      diagnostics.push(
        diagnostic("versions", "mixed_threshold_versions", "conflicting"),
      );
    }
    if (
      candidate.recommendation_decision_identity === null &&
      candidate.membership_status !== "selected"
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "rejection_decision_lineage_missing",
          "unmappable",
        ),
      );
    }
    const expectedLineage = candidate.expected_outcome_lineage;
    if (exactText(expectedLineage?.expected_outcome_lineage_key ?? null)) {
      expectedOutcomeLineageKeys.push(
        expectedLineage.expected_outcome_lineage_key,
      );
    }
    if (
      exactText(input.stable_scan_identity) &&
      exactText(input.producer_decision_id) &&
      (expectedLineage?.lineage_version !==
        CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION ||
        expectedLineage?.scan_identity !== input.stable_scan_identity ||
        expectedLineage?.decision_identity !== input.producer_decision_id ||
        expectedLineage?.candidate_identity !== candidate.candidate_identity ||
        expectedLineage?.batch_identity !== candidate.batch_identity ||
        expectedLineage?.recommendation_decision_identity !==
          candidate.recommendation_decision_identity ||
        expectedLineage?.snapshot_identity !== candidate.snapshot_identity ||
        expectedLineage?.evaluator_version !==
          input.versions?.evaluator_version ||
        expectedLineage?.intended_horizon_policy !==
          "primary_60m_else_30m_else_15m_v1")
    ) {
      diagnostics.push(
        diagnostic(
          "outcome_lineage",
          "expected_outcome_lineage_conflict",
          "conflicting",
        ),
      );
    }
    if (
      input.counterfactual_evaluation_requested &&
      (!candidate.outcome || !candidate.outcome_lineage)
    ) {
      diagnostics.push(
        diagnostic(
          "outcome_lineage",
          "counterfactual_outcome_lineage_missing",
          "unmappable",
        ),
      );
    }
    if (candidate.outcome && candidate.outcome_lineage) {
      if (
        candidate.outcome.evaluator_version !==
          candidate.expected_outcome_lineage.evaluator_version ||
        candidate.outcome.provider_contract_version !==
          input.versions?.provider_contract_version
      ) {
        diagnostics.push(
          diagnostic(
            "outcome_lineage",
            "outcome_evaluator_provider_contract_conflict",
            "conflicting",
          ),
        );
      }
      if (
        !exactText(candidate.outcome_lineage.candidate_identity) ||
        !exactText(candidate.outcome_lineage.outcome_identity) ||
        !exactText(candidate.outcome_lineage.evaluator_input_identity)
      ) {
        diagnostics.push(
          diagnostic(
            "outcome_lineage",
            "counterfactual_outcome_lineage_incomplete",
            "unmappable",
          ),
        );
      } else {
        outcomeIdentities.push(candidate.outcome_lineage.outcome_identity);
        evaluatorInputIdentities.push(
          candidate.outcome_lineage.evaluator_input_identity,
        );
      }
      if (
        candidate.outcome.outcome_identity !==
          candidate.outcome_lineage.outcome_identity ||
        candidate.candidate_identity !==
          candidate.outcome_lineage.candidate_identity ||
        candidate.recommendation_decision_identity !==
          candidate.outcome_lineage.recommendation_decision_identity ||
        candidate.snapshot_identity !==
          candidate.outcome_lineage.snapshot_identity
      ) {
        diagnostics.push(
          diagnostic(
            "outcome_lineage",
            "candidate_outcome_lineage_conflict",
            "conflicting",
          ),
        );
      }
      const {
        evaluation_digest: suppliedEvaluationDigest,
        evaluation_digest_algorithm: suppliedEvaluationAlgorithm,
        ...outcomeLineagePayload
      } = candidate.outcome_lineage;
      if (
        suppliedEvaluationAlgorithm !== "sha256_canonical_json_v1" ||
        !fullShaPattern.test(suppliedEvaluationDigest) ||
        suppliedEvaluationDigest !==
          completedScannerOutcomeEvaluationDigest({
            expected_outcome_lineage: candidate.expected_outcome_lineage,
            outcome: candidate.outcome,
            outcome_lineage: outcomeLineagePayload,
          })
      ) {
        diagnostics.push(
          diagnostic(
            "outcome_lineage",
            "outcome_evaluation_digest_conflict",
            "conflicting",
          ),
        );
      }
    }
  }
  if (new Set(identities).size !== identities.length) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "candidate_identity_duplicate",
        "conflicting",
      ),
    );
  }
  if (
    new Set(outcomeIdentities).size !== outcomeIdentities.length ||
    new Set(evaluatorInputIdentities).size !== evaluatorInputIdentities.length
  ) {
    diagnostics.push(
      diagnostic(
        "outcome_lineage",
        "counterfactual_outcome_lineage_duplicate",
        "conflicting",
      ),
    );
  }
  if (
    new Set(expectedOutcomeLineageKeys).size !==
    expectedOutcomeLineageKeys.length
  ) {
    diagnostics.push(
      diagnostic(
        "outcome_lineage",
        "expected_outcome_lineage_key_duplicate",
        "conflicting",
      ),
    );
  }
  const distinctRanks = [...ranks.keys()].sort((first, second) => first - second);
  if (
    distinctRanks.some((rank, index) => rank !== index + 1)
  ) {
    diagnostics.push(
      diagnostic(
        "scanner_candidate_ranking",
        "candidate_rank_sequence_gap",
        "conflicting",
      ),
    );
  }
  for (const group of ranks.values()) {
    if (group.length < 2) continue;
    const tieBreakKeys = group.map((candidate) => candidate.tie_break_key);
    if (
      tieBreakKeys.some((key) => !key) ||
      new Set(tieBreakKeys).size !== tieBreakKeys.length
    ) {
      diagnostics.push(
        diagnostic(
          "scanner_candidate_ranking",
          "rank_tie_without_unique_tie_break",
          "conflicting",
        ),
      );
    }
  }
  return diagnostics;
}

function validateFullLineageGraph(
  input: CompletedScannerBundleProjectionInput,
) {
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  const batch = input.batch;
  if (!batch) {
    return [
      diagnostic(
        "recommendation_batch",
        "lineage_batch_missing",
        "unmappable",
      ),
    ];
  }
  const selectedSnapshots: string[] = [];
  const recommendationDecisionIds: string[] = [];
  const publishesRecommendations =
    input.decision_disposition !== "explicit_no_trade";
  const nodeDigests = input.decision_lineage_nodes.map((node) =>
    canonicalCounterfactualSemanticDigest(node),
  );
  if (new Set(nodeDigests).size !== nodeDigests.length) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "decision_lineage_node_duplicate",
        "conflicting",
      ),
    );
  }
  const joinedNodeDigests = new Set<string>();
  for (const candidate of input.candidates) {
    if (candidate.batch_identity !== batch.id) {
      diagnostics.push(
        diagnostic(
          "recommendation_batch",
          "candidate_batch_lineage_conflict",
          "conflicting",
        ),
      );
    }
    if (
      !candidate.recommendation_decision_identity ||
      candidate.expected_outcome_lineage.recommendation_decision_identity !==
        candidate.recommendation_decision_identity
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_decision_lineage_orphaned",
          "conflicting",
        ),
      );
    } else {
      recommendationDecisionIds.push(
        candidate.recommendation_decision_identity,
      );
    }
    const matchingNodes = input.decision_lineage_nodes.filter(
      (node) =>
        node.decision_identity ===
          candidate.recommendation_decision_identity &&
        (node.node_kind === "no_trade"
          ? node.candidate_identity === null
          : node.candidate_identity === candidate.candidate_identity) &&
        node.snapshot_identity === candidate.snapshot_identity,
    );
    const expectedNodeKind =
      input.decision_disposition === "explicit_no_trade"
        ? "no_trade"
        : candidate.membership_status === "selected"
          ? "recommendation"
          : "rejection";
    if (
      matchingNodes.length !== 1 ||
      matchingNodes[0]?.node_kind !== expectedNodeKind
    ) {
      diagnostics.push(
        diagnostic(
          "candidate_membership",
          "candidate_decision_lineage_node_conflict",
          "conflicting",
        ),
      );
    } else {
      joinedNodeDigests.add(
        canonicalCounterfactualSemanticDigest(matchingNodes[0]),
      );
    }
    if (publishesRecommendations) {
      if (candidate.membership_status === "selected") {
        if (
          !candidate.snapshot_identity ||
          !batch.recommendation_snapshot_ids.includes(
            candidate.snapshot_identity,
          )
        ) {
          diagnostics.push(
            diagnostic(
              "recommendation_batch",
              "selected_candidate_snapshot_lineage_conflict",
              "conflicting",
            ),
          );
        } else {
          selectedSnapshots.push(candidate.snapshot_identity);
        }
      } else if (candidate.snapshot_identity !== null) {
        diagnostics.push(
          diagnostic(
            "recommendation_batch",
            "non_selected_candidate_snapshot_orphaned",
            "conflicting",
          ),
        );
      }
    } else if (candidate.snapshot_identity !== null) {
      diagnostics.push(
        diagnostic(
          "recommendation_batch",
          "non_publish_disposition_snapshot_conflict",
          "conflicting",
        ),
      );
    }
  }
  if (joinedNodeDigests.size !== new Set(nodeDigests).size) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "decision_lineage_node_orphaned",
        "conflicting",
      ),
    );
  }
  if (
    publishesRecommendations &&
    !sameStringSet(selectedSnapshots, batch.recommendation_snapshot_ids)
  ) {
    diagnostics.push(
      diagnostic(
        "recommendation_batch",
        "batch_snapshot_membership_conflict",
        "conflicting",
      ),
    );
  }
  const selectedTickers = input.candidates.flatMap((candidate) =>
    publishesRecommendations &&
    candidate.membership_status === "selected" &&
    candidate.ranking
      ? [candidate.ranking.ticker]
      : [],
  );
  if (
    publishesRecommendations &&
    (!sameStringSet(selectedTickers, batch.recommendation_tickers) ||
      batch.recommendation_count !== selectedSnapshots.length ||
      new Set(batch.recommendation_snapshot_ids).size !==
        batch.recommendation_snapshot_ids.length)
  ) {
    diagnostics.push(
      diagnostic(
        "recommendation_batch",
        "batch_recommendation_membership_conflict",
        "conflicting",
      ),
    );
  }
  if (
    !publishesRecommendations &&
    (batch.recommendation_snapshot_ids.length > 0 ||
      batch.recommendation_tickers.length > 0 ||
      batch.recommendation_count !== 0)
  ) {
    diagnostics.push(
      diagnostic(
        "recommendation_batch",
        "non_publish_batch_snapshot_conflict",
        "conflicting",
      ),
    );
  }
  if (
    publishesRecommendations &&
    new Set(recommendationDecisionIds).size !==
    recommendationDecisionIds.length
  ) {
    diagnostics.push(
      diagnostic(
        "candidate_membership",
        "candidate_decision_lineage_duplicate",
        "conflicting",
      ),
    );
  }
  if (input.decision_disposition === "explicit_no_trade") {
    const noTradeNodes = input.decision_lineage_nodes.filter(
      (node) => node.node_kind === "no_trade",
    );
    const producerDecisionIdentity =
      input.no_trade_evidence?.producer_decision_id;
    if (
      !producerDecisionIdentity ||
      producerDecisionIdentity !== input.producer_decision_id ||
      input.decision_lineage_nodes.length !== 1 ||
      noTradeNodes.length !== 1 ||
      noTradeNodes[0]?.decision_identity !== producerDecisionIdentity ||
      noTradeNodes[0]?.candidate_identity !== null ||
      noTradeNodes[0]?.snapshot_identity !== null ||
      input.candidates.some(
        (candidate) =>
          candidate.recommendation_decision_identity !==
            producerDecisionIdentity ||
          candidate.expected_outcome_lineage
            .recommendation_decision_identity !== producerDecisionIdentity,
      )
    ) {
      diagnostics.push(
        diagnostic(
          "no_trade_decision",
          "explicit_no_trade_lineage_identity_conflict",
          "conflicting",
        ),
      );
    }
  }
  return diagnostics;
}

function validateNoTrade(
  input: CompletedScannerBundleProjectionInput,
) {
  if (input.decision_disposition !== "explicit_no_trade") {
    return input.no_trade_evidence === null
      ? []
      : [
          diagnostic(
            "no_trade_decision",
            "decision_disposition_evidence_conflict",
            "conflicting",
          ),
        ];
  }
  const evidence = input.no_trade_evidence;
  if (!evidence || !evidence.explicit_decision_recorded) {
    return [
      diagnostic(
        "no_trade_decision",
        evidence?.ai_no_trade_observed && evidence.deterministic_fallback_used
          ? "ai_no_trade_fallback_not_explicit_decision"
          : "explicit_no_trade_decision_missing",
        "unmappable",
      ),
    ];
  }
  const diagnostics: CompletedScannerBundleDiagnostic[] = [];
  if (evidence.deterministic_fallback_used) {
    diagnostics.push(
      diagnostic(
        "no_trade_decision",
        "no_trade_and_fallback_are_mutually_exclusive",
        "conflicting",
      ),
    );
  }
  if (
    !evidence.producer_decision_id ||
    !evidence.decision_timestamp ||
    !evidence.decision_reason_code ||
    !evidence.decision_source ||
    !validCanonicalCounterfactualReasonCodes([
      evidence.decision_reason_code,
    ])
  ) {
    diagnostics.push(
      diagnostic(
        "no_trade_decision",
        "explicit_no_trade_evidence_incomplete",
        "unmappable",
      ),
    );
  }
  if (
    evidence.producer_decision_id &&
    input.producer_decision_id &&
    evidence.producer_decision_id !== input.producer_decision_id
  ) {
    diagnostics.push(
      diagnostic(
        "no_trade_decision",
        "no_trade_decision_identity_conflict",
        "conflicting",
      ),
    );
  }
  if (
    evidence.decision_timestamp &&
    input.decision_timestamp &&
    evidence.decision_timestamp !== input.decision_timestamp
  ) {
    diagnostics.push(
      diagnostic(
        "no_trade_decision",
        "no_trade_decision_timestamp_conflict",
        "conflicting",
      ),
    );
  }
  return diagnostics;
}

function result(
  status: CompletedScannerBundleAdapterStatus,
  diagnostics: CompletedScannerBundleDiagnostic[],
  opportunitySet: CanonicalCounterfactualOpportunitySetContract | null = null,
  noTradeDecision: CanonicalCounterfactualDecision | null = null,
): CompletedScannerBundleProjectionResult {
  return {
    adapter_version: COMPLETED_SCANNER_BUNDLE_ADAPTER_VERSION,
    status,
    opportunity_set: opportunitySet,
    no_trade_decision: noTradeDecision,
    opportunity_set_complete:
      status === "mapped" &&
      opportunitySet !== null &&
      opportunitySet.expected_candidate_count ===
        opportunitySet.observed_candidate_count,
    counterfactual_evaluable:
      status === "mapped" &&
      opportunitySet?.readiness.counterfactual_evaluation_eligible === true,
    diagnostics: uniqueDiagnostics(diagnostics),
  };
}

export function projectCompletedScannerBundleToOpportunitySet(
  source: CompletedScannerBundleProjectionInput,
): CompletedScannerBundleProjectionResult {
  const input = structuredClone(source);
  const diagnostics = uniqueDiagnostics([
    ...validateBundleLineage(input),
    ...validateRankingCompleteness(input),
    ...validateCaptureEvidence(input),
    ...validateBuildDiagnostics(input),
    ...validateCandidates(input),
    ...validateFullLineageGraph(input),
    ...validateVersions(input.versions),
    ...validateProvider(input.provider_context),
    ...validateNoTrade(input),
  ]);
  if (diagnostics.some((item) => item.classification === "conflicting")) {
    return result("conflicting", diagnostics);
  }
  if (diagnostics.length > 0) return result("unmappable", diagnostics);

  const opportunitySet = buildCanonicalCounterfactualOpportunitySet({
    source_namespace: input.source_namespace as string,
    scan_identity: input.stable_scan_identity as string,
    decision_identity: input.producer_decision_id as string,
    decision_timestamp: input.decision_timestamp as string,
    point_in_time_cutoff: input.point_in_time_cutoff as string,
    versions: input.versions as CanonicalOpportunitySetVersions,
    expected_candidate_count: input.expected_candidate_count as number,
    observed_candidate_count: input.candidates.length,
    provider_context:
      input.provider_context as CanonicalOpportunitySetProviderContext,
    decision_semantics: {
      decision_disposition: input.decision_disposition,
      decision_lineage_nodes: structuredClone(input.decision_lineage_nodes),
      no_trade_semantics:
        input.decision_disposition === "explicit_no_trade"
          ? {
              explicit_decision_recorded: true,
              producer_decision_id: input.no_trade_evidence
                ?.producer_decision_id as string,
              decision_timestamp: input.no_trade_evidence
                ?.decision_timestamp as string,
              decision_reason_code: input.no_trade_evidence
                ?.decision_reason_code as CanonicalCounterfactualReasonCode,
              decision_reason_detail:
                input.no_trade_evidence?.decision_reason_detail ?? null,
              decision_source: input.no_trade_evidence
                ?.decision_source as string,
              ai_no_trade_observed:
                input.no_trade_evidence?.ai_no_trade_observed ?? false,
              deterministic_fallback_used: false,
            }
          : null,
    },
    pre_truncation_capture_evidence_digest: (
      input.pre_truncation_capture_evidence as PreTruncationCandidateCaptureEvidence
    ).evidence_digest,
    candidates: input.candidates.map((candidate) => ({
      candidate_identity: candidate.candidate_identity as string,
      ticker: (candidate.ranking as ScannerCandidateRankingResult).ticker,
      original_rank: (candidate.ranking as ScannerCandidateRankingResult).rank,
      original_score: (candidate.ranking as ScannerCandidateRankingResult).score
        .normalized_score,
      tie_break_key: candidate.tie_break_key,
      setup: candidate.setup,
      context: candidate.context,
      membership_status:
        candidate.membership_status as CanonicalCandidateMembershipInput["membership_status"],
      rejection_reason_codes: candidate.rejection_reason_codes as string[],
      threshold_version: candidate.threshold_version as string,
      ranking_version: candidate.ranking_version as string,
      eligibility_at_decision:
        candidate.eligibility_at_decision as CanonicalCandidateMembershipInput["eligibility_at_decision"],
      data_gap_codes: candidate.data_gap_codes,
      provider_source_timestamp: candidate.provider_source_timestamp as string,
      lineage: {
        scan_identity: input.stable_scan_identity as string,
        batch_identity: candidate.batch_identity,
        recommendation_decision_identity:
          candidate.recommendation_decision_identity,
        snapshot_identity: candidate.snapshot_identity,
      },
      expected_outcome_lineage: candidate.expected_outcome_lineage,
      outcome: candidate.outcome,
    })),
  });
  if (opportunitySet.status !== "built") {
    return result(
      "unmappable",
      opportunitySet.reason_codes.map((reasonCode) =>
        diagnostic("candidate_membership", reasonCode, "unmappable"),
      ),
    );
  }
  if (opportunitySet.opportunity_set.readiness.status === "conflicting") {
    return result(
      "conflicting",
      opportunitySet.opportunity_set.readiness.reason_codes.map((reasonCode) =>
        diagnostic("candidate_membership", reasonCode, "conflicting"),
      ),
    );
  }
  if (input.counterfactual_evaluation_requested) {
    if (
      !opportunitySet.opportunity_set.readiness
        .counterfactual_evaluation_eligible
    ) {
      return result(
        "unmappable",
        opportunitySet.opportunity_set.readiness.reason_codes.map((reasonCode) =>
          diagnostic("outcome_lineage", reasonCode, "unmappable"),
        ),
      );
    }
  }
  if (input.decision_disposition === "explicit_no_trade") {
    const evidence = input.no_trade_evidence as CompletedScannerNoTradeEvidence;
    const noTrade = buildCanonicalNoTradeDecision({
      explicit_no_trade_decision: true,
      source_namespace: input.source_namespace as string,
      producer_decision_id: evidence.producer_decision_id as string,
      decision_timestamp: evidence.decision_timestamp as string,
      opportunity_set: opportunitySet.opportunity_set,
      decision_reason_code: evidence.decision_reason_code as string,
      decision_reason_detail: evidence.decision_reason_detail,
      decision_source: evidence.decision_source as string,
    });
    if (noTrade.status !== "built") {
      return result(
        noTrade.status,
        noTrade.reason_codes.map((reasonCode) =>
          diagnostic(
            "no_trade_decision",
            reasonCode,
            noTrade.status === "conflicting" ? "conflicting" : "unmappable",
          ),
        ),
      );
    }
    return result(
      "mapped",
      [],
      opportunitySet.opportunity_set,
      noTrade.decision,
    );
  }
  return result("mapped", [], opportunitySet.opportunity_set);
}

export function aggregateCompletedScannerBundleCoverage(
  results: CompletedScannerBundleProjectionResult[],
): CompletedScannerBundleCoverageReport {
  const sourceReasonCounts = new Map<
    CompletedScannerBundleDiagnosticSource,
    Map<string, number>
  >();
  for (const resultItem of results) {
    for (const item of resultItem.diagnostics) {
      const reasons = sourceReasonCounts.get(item.source) ?? new Map();
      reasons.set(item.reason_code, (reasons.get(item.reason_code) ?? 0) + 1);
      sourceReasonCounts.set(item.source, reasons);
    }
    for (const reasonCode of
      resultItem.opportunity_set?.provider_context.coverage_reason_codes ?? []) {
      const reasons =
        sourceReasonCounts.get("provider_context") ?? new Map<string, number>();
      reasons.set(reasonCode, (reasons.get(reasonCode) ?? 0) + 1);
      sourceReasonCounts.set("provider_context", reasons);
    }
  }
  return {
    adapter_version: COMPLETED_SCANNER_BUNDLE_ADAPTER_VERSION,
    total: results.length,
    mapped: results.filter((item) => item.status === "mapped").length,
    conflicting: results.filter((item) => item.status === "conflicting").length,
    unmappable: results.filter((item) => item.status === "unmappable").length,
    complete_opportunity_sets: results.filter(
      (item) => item.opportunity_set_complete,
    ).length,
    evaluable_counterfactual_sets: results.filter(
      (item) => item.counterfactual_evaluable,
    ).length,
    reason_codes_by_source: [...sourceReasonCounts.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([source, reasons]) => ({
        source,
        reason_counts: Object.fromEntries(
          [...reasons.entries()].sort(([first], [second]) =>
            first.localeCompare(second),
          ),
        ),
      })),
  };
}
