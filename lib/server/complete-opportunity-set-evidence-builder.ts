import "server-only";

import {
  CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION,
  CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION,
  canonicalCounterfactualSemanticDigest,
  validCanonicalCounterfactualReasonCodes,
  type CanonicalExpectedOutcomeLineage,
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
import {
  projectCompletedScannerBundleToOpportunitySet,
  type CompletedScannerBundleProjectionInput,
  type CompletedScannerCandidateEvidence,
  type CompletedScannerDecisionDisposition,
  type CompletedScannerDecisionLineageNode,
  type CompletedScannerNoTradeEvidence,
} from "@/lib/server/completed-scanner-bundle-opportunity-set-adapter";

export const COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_VERSION =
  "complete_opportunity_set_evidence_builder_v1" as const;
export const COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_DEFAULT_ENABLED = false;

export type CompleteOpportunitySetEvidenceStatus =
  | "ready"
  | "incomplete_membership"
  | "rank_conflict"
  | "identity_conflict"
  | "version_conflict"
  | "reason_code_conflict"
  | "not_point_in_time_safe"
  | "provider_coverage_incomplete"
  | "no_trade_evidence_missing";

export type CompleteOpportunitySetCandidateVersions = Pick<
  CanonicalOpportunitySetVersions,
  | "scanner_version"
  | "universe_version"
  | "threshold_version"
  | "engine_version"
  | "scoring_version"
  | "ranking_version"
  | "setup_taxonomy_version"
>;

export type CompleteOpportunitySetCandidateInput = Omit<
  CompletedScannerCandidateEvidence,
  | "candidate_identity"
  | "ranking"
  | "membership_status"
  | "rejection_reason_codes"
  | "threshold_version"
  | "ranking_version"
  | "provider_source_timestamp"
> & {
  candidate_identity: string;
  ranking: ScannerCandidateRankingResult;
  membership_status: NonNullable<
    CompletedScannerCandidateEvidence["membership_status"]
  >;
  rejection_reason_codes: string[];
  threshold_version: string;
  ranking_version: string;
  provider_source_timestamp: string;
  producer_versions: CompleteOpportunitySetCandidateVersions;
  expected_outcome_lineage: CanonicalExpectedOutcomeLineage;
};

export type CompleteOpportunitySetRankingContext = Pick<
  ScannerCandidateRankingSummary,
  | "summary_version"
  | "summary_kind"
  | "generated_at"
  | "scan_window"
  | "target_min"
  | "target_max"
  | "top_ranking_reasons"
  | "top_penalty_reasons"
  | "warnings"
>;

export type CompleteOpportunitySetPriorBinding = {
  producer_decision_id: string;
  decision_disposition: CompletedScannerDecisionDisposition;
  no_trade_producer_decision_id: string | null;
  full_candidate_set_digest: string;
  decision_evidence_digest: string;
  decision_semantic_binding_digest: string;
  lineage_graph_digest: string;
  version_bundle_digest: string;
};

export type CompleteOpportunitySetEvidenceBuilderInput = {
  source_namespace: string;
  stable_scan_identity: string;
  producer_decision_id: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  full_membership_declared: boolean;
  expected_candidate_count: number;
  observed_candidate_count: number;
  pre_truncation_capture_evidence: PreTruncationCandidateCaptureEvidence;
  presentation_top_k: number | null;
  versions: CanonicalOpportunitySetVersions;
  provider_context: CanonicalOpportunitySetProviderContext;
  scan_run: RecommendationScanRun;
  batch: RecommendationBatch | null;
  ranking_context: CompleteOpportunitySetRankingContext;
  build_diagnostics: SelectedCandidateBuildDiagnostic[];
  candidates: CompleteOpportunitySetCandidateInput[];
  decision_lineage_nodes: CompletedScannerDecisionLineageNode[];
  decision_disposition: CompletedScannerDecisionDisposition;
  no_trade_evidence: CompletedScannerNoTradeEvidence | null;
  counterfactual_evaluation_requested: boolean;
};

export type CompleteOpportunitySetPreviousBindingLookup = {
  lookup: (
    producerDecisionId: string,
  ) => CompleteOpportunitySetPriorBinding | null;
};

export type CompleteOpportunitySetEvidenceBuilderResult = {
  builder_version: typeof COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_VERSION;
  status: CompleteOpportunitySetEvidenceStatus;
  completed_bundle: CompletedScannerBundleProjectionInput | null;
  full_candidate_set_digest: string | null;
  decision_evidence_digest: string | null;
  decision_semantic_binding_digest: string | null;
  decision_binding: CompleteOpportunitySetPriorBinding | null;
  presentation: {
    top_k: number | null;
    full_candidate_count: number;
    full_ranking_preserved: boolean;
  };
  round_trip: {
    first_status: "mapped" | "conflicting" | "unmappable" | null;
    replay_status: "mapped" | "conflicting" | "unmappable" | null;
    canonical_identity_stable: boolean;
    candidate_set_digest_stable: boolean;
    decision_evidence_digest_stable: boolean;
    decision_semantic_binding_digest_stable: boolean;
  };
  reason_codes: string[];
};

export type CompleteOpportunitySetEvidenceBuilderHandle =
  | {
      enabled: false;
      build: null;
    }
  | {
      enabled: true;
      build: (
        input: CompleteOpportunitySetEvidenceBuilderInput,
      ) => CompleteOpportunitySetEvidenceBuilderResult;
    };

export type CompleteOpportunitySetReadinessReport = {
  builder_version: typeof COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_VERSION;
  evidence_class: "synthetic_fixture_only";
  performance_values_included: false;
  total: number;
  status_counts: Record<CompleteOpportunitySetEvidenceStatus, number>;
  round_trip_mapped: number;
  full_ranking_preserved: number;
  reason_counts: Record<string, number>;
};

const instantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const identityPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,239}$/;
const reasonCodePattern = /^[a-z0-9][a-z0-9._-]{0,95}$/;
const fullShaPattern = /^[0-9a-f]{64}$/;

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    instantPattern.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function explicitIdentity(value: unknown): value is string {
  return typeof value === "string" && identityPattern.test(value);
}

function deepFreeze<T>(value: T): T {
  if (
    value !== null &&
    typeof value === "object" &&
    !Object.isFrozen(value)
  ) {
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

function emptyRoundTrip(): CompleteOpportunitySetEvidenceBuilderResult["round_trip"] {
  return {
    first_status: null,
    replay_status: null,
    canonical_identity_stable: false,
    candidate_set_digest_stable: false,
    decision_evidence_digest_stable: false,
    decision_semantic_binding_digest_stable: false,
  };
}

function rejected(
  input: CompleteOpportunitySetEvidenceBuilderInput,
  status: Exclude<CompleteOpportunitySetEvidenceStatus, "ready">,
  reasonCodes: string[],
): CompleteOpportunitySetEvidenceBuilderResult {
  return {
    builder_version: COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_VERSION,
    status,
    completed_bundle: null,
    full_candidate_set_digest: null,
    decision_evidence_digest: null,
    decision_semantic_binding_digest: null,
    decision_binding: null,
    presentation: {
      top_k: input.presentation_top_k,
      full_candidate_count: input.candidates.length,
      full_ranking_preserved: false,
    },
    round_trip: emptyRoundTrip(),
    reason_codes: uniqueSorted(reasonCodes),
  };
}

function identityReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const reasons: string[] = [];
  if (!explicitIdentity(input.source_namespace)) {
    reasons.push("source_namespace_invalid");
  }
  if (!explicitIdentity(input.stable_scan_identity)) {
    reasons.push("stable_scan_identity_invalid");
  }
  if (!explicitIdentity(input.producer_decision_id)) {
    reasons.push("producer_decision_identity_invalid");
  }
  const candidateIdentities = input.candidates.map(
    (candidate) => candidate.candidate_identity,
  );
  if (
    candidateIdentities.some((identity) => !explicitIdentity(identity))
  ) {
    reasons.push("candidate_identity_invalid");
  }
  if (new Set(candidateIdentities).size !== candidateIdentities.length) {
    reasons.push("candidate_identity_duplicate");
  }
  if (input.scan_run.id !== input.stable_scan_identity) {
    reasons.push("scan_identity_lineage_conflict");
  }
  if (
    input.batch !== null &&
    input.batch.scan_run_id !== input.stable_scan_identity
  ) {
    reasons.push("batch_scan_identity_lineage_conflict");
  }
  for (const candidate of input.candidates) {
    const expected = candidate.expected_outcome_lineage;
    if (
      expected.candidate_identity !== candidate.candidate_identity ||
      expected.scan_identity !== input.stable_scan_identity ||
      expected.decision_identity !== input.producer_decision_id ||
      expected.batch_identity !== candidate.batch_identity ||
      !explicitIdentity(expected.lineage_namespace) ||
      !explicitIdentity(expected.evaluator_contract_version) ||
      expected.evaluator_version !== input.versions.evaluator_version ||
      expected.intended_horizon_policy !==
        "primary_60m_else_30m_else_15m_v1" ||
      !explicitIdentity(expected.expected_outcome_lineage_key)
    ) {
      reasons.push("expected_outcome_lineage_identity_invalid");
    }
    if (
      candidate.recommendation_decision_identity !==
        expected.recommendation_decision_identity ||
      candidate.snapshot_identity !== expected.snapshot_identity
    ) {
      reasons.push("expected_outcome_lineage_reference_conflict");
    }
    if (
      candidate.batch_identity !== (input.batch?.id ?? null)
    ) {
      reasons.push("candidate_batch_lineage_conflict");
    }
  }
  const expectedLineageKeys = input.candidates.map(
    (candidate) =>
      candidate.expected_outcome_lineage.expected_outcome_lineage_key,
  );
  if (
    new Set(expectedLineageKeys).size !== expectedLineageKeys.length
  ) {
    reasons.push("expected_outcome_lineage_key_duplicate");
  }
  return uniqueSorted(reasons);
}

function membershipReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const reasons: string[] = [];
  const captureEvidence = input.pre_truncation_capture_evidence;
  const captureVerification =
    verifyPreTruncationCandidateCaptureEvidence(captureEvidence);
  reasons.push(...captureVerification.reason_codes);
  if (!input.full_membership_declared) {
    reasons.push("full_membership_not_declared");
  }
  if (
    !Number.isInteger(input.expected_candidate_count) ||
    input.expected_candidate_count < 1 ||
    !Number.isInteger(input.observed_candidate_count) ||
    input.observed_candidate_count < 1
  ) {
    reasons.push("candidate_count_invalid");
  }
  if (
    input.expected_candidate_count !== input.observed_candidate_count ||
    input.observed_candidate_count !== input.candidates.length
  ) {
    reasons.push("candidate_membership_truncated_or_partial");
  }
  const candidateIdentities = input.candidates
    .map((candidate) => candidate.candidate_identity)
    .sort();
  if (
    captureEvidence.scan_identity !== input.stable_scan_identity ||
    captureEvidence.producer_decision_id !== input.producer_decision_id ||
    captureEvidence.point_in_time_cutoff !== input.point_in_time_cutoff ||
    captureEvidence.full_candidate_count !== input.expected_candidate_count ||
    captureEvidence.full_candidate_count !== input.observed_candidate_count ||
    captureEvidence.sorted_candidate_identities.length !==
      candidateIdentities.length ||
    captureEvidence.sorted_candidate_identities.some(
      (identity, index) => identity !== candidateIdentities[index],
    )
  ) {
    reasons.push("pre_truncation_membership_evidence_conflict");
  }
  if (
    captureEvidence.scanner_version !== input.versions.scanner_version ||
    captureEvidence.universe_version !== input.versions.universe_version ||
    captureEvidence.provider_contract_version !==
      input.versions.provider_contract_version
  ) {
    reasons.push("pre_truncation_capture_version_conflict");
  }
  if (
    input.scan_run.status !== "completed" ||
    input.scan_run.completed_at === null
  ) {
    reasons.push("completed_scan_run_required");
  }
  const rankingTickers = input.candidates.map(
    (candidate) => candidate.ranking.ticker,
  );
  if (new Set(rankingTickers).size !== rankingTickers.length) {
    reasons.push("candidate_ticker_duplicate");
  }
  return uniqueSorted(reasons);
}

function rankReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const reasons: string[] = [];
  const groups = new Map<number, CompleteOpportunitySetCandidateInput[]>();
  for (const candidate of input.candidates) {
    const rank = candidate.ranking.rank;
    if (!Number.isInteger(rank) || rank < 1) {
      reasons.push("original_rank_missing_or_invalid");
      continue;
    }
    if (
      typeof candidate.tie_break_key !== "string" ||
      candidate.tie_break_key.length === 0 ||
      candidate.tie_break_key !== candidate.tie_break_key.trim()
    ) {
      reasons.push("explicit_tie_break_missing");
    }
    const group = groups.get(rank) ?? [];
    group.push(candidate);
    groups.set(rank, group);
  }
  const distinctRanks = [...groups.keys()].sort((first, second) => first - second);
  if (distinctRanks.some((rank, index) => rank !== index + 1)) {
    reasons.push("rank_sequence_gap");
  }
  const allTieBreakKeys = input.candidates.map(
    (candidate) => candidate.tie_break_key,
  );
  if (
    allTieBreakKeys.some((key) => !key) ||
    new Set(allTieBreakKeys).size !== allTieBreakKeys.length
  ) {
    reasons.push("tie_break_not_unique");
  }
  for (const group of groups.values()) {
    if (
      group.length > 1 &&
      new Set(group.map((candidate) => candidate.tie_break_key)).size !==
        group.length
    ) {
      reasons.push("rank_tie_without_unique_tie_break");
    }
  }
  return uniqueSorted(reasons);
}

const candidateVersionKeys: Array<
  keyof CompleteOpportunitySetCandidateVersions
> = [
  "scanner_version",
  "universe_version",
  "threshold_version",
  "engine_version",
  "scoring_version",
  "ranking_version",
  "setup_taxonomy_version",
];

function versionReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const reasons: string[] = [];
  const requiredVersionKeys = [
    ...candidateVersionKeys,
    "reason_taxonomy_version",
    "confidence_contract_version",
    "evaluator_version",
    "provider_contract_version",
    "git_commit",
    "build_identity",
  ] as const;
  if (
    requiredVersionKeys.some((key) => {
      const value = input.versions[key];
      return (
        typeof value !== "string" ||
        value.length === 0 ||
        value !== value.trim()
      );
    })
  ) {
    reasons.push("required_version_missing");
  }
  if (!/^[0-9a-f]{40}$/.test(input.versions.git_commit)) {
    reasons.push("git_commit_not_full_sha");
  }
  if (
    input.versions.reason_taxonomy_version !==
    CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION
  ) {
    reasons.push("reason_taxonomy_version_conflict");
  }
  for (const candidate of input.candidates) {
    if (
      candidateVersionKeys.some(
        (key) =>
          candidate.producer_versions[key] !== input.versions[key],
      ) ||
      candidate.threshold_version !== input.versions.threshold_version ||
      candidate.ranking_version !== input.versions.ranking_version
    ) {
      reasons.push("mixed_candidate_versions");
    }
  }
  return uniqueSorted(reasons);
}

function reasonCodeReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const reasons: string[] = [];
  for (const candidate of input.candidates) {
    if (
      !Array.isArray(candidate.rejection_reason_codes) ||
      candidate.rejection_reason_codes.some(
        (reasonCode) => !reasonCodePattern.test(reasonCode),
      ) ||
      !validCanonicalCounterfactualReasonCodes(
        candidate.rejection_reason_codes,
      )
    ) {
      reasons.push("canonical_reason_code_invalid");
    }
    if (
      candidate.membership_status !== "selected" &&
      candidate.rejection_reason_codes.length === 0
    ) {
      reasons.push("canonical_rejection_reason_missing");
    }
    if (
      candidate.raw_rejection_reason !== null &&
      candidate.rejection_reason_codes.length === 0
    ) {
      reasons.push("free_text_reason_without_canonical_code");
    }
    if (!validCanonicalCounterfactualReasonCodes(candidate.data_gap_codes)) {
      reasons.push("canonical_data_gap_reason_unknown");
    }
  }
  if (
    !validCanonicalCounterfactualReasonCodes(
      input.provider_context.coverage_reason_codes,
    )
  ) {
    reasons.push("canonical_provider_reason_unknown");
  }
  if (
    input.no_trade_evidence?.decision_reason_code &&
    !validCanonicalCounterfactualReasonCodes([
      input.no_trade_evidence.decision_reason_code,
    ])
  ) {
    reasons.push("canonical_no_trade_reason_unknown");
  }
  return uniqueSorted(reasons);
}

function pointInTimeReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const reasons: string[] = [];
  if (
    !explicitInstant(input.decision_timestamp) ||
    !explicitInstant(input.point_in_time_cutoff) ||
    input.decision_timestamp !== input.point_in_time_cutoff
  ) {
    reasons.push("decision_cutoff_invalid");
    return reasons;
  }
  const cutoff = Date.parse(input.point_in_time_cutoff);
  if (
    !explicitInstant(input.provider_context.source_timestamp) ||
    Date.parse(input.provider_context.source_timestamp) > cutoff
  ) {
    reasons.push("provider_source_after_cutoff");
  }
  if (
    input.candidates.some(
      (candidate) =>
        !explicitInstant(candidate.provider_source_timestamp) ||
        Date.parse(candidate.provider_source_timestamp) > cutoff,
    )
  ) {
    reasons.push("candidate_source_after_cutoff");
  }
  if (
    input.scan_run.completed_at !== input.decision_timestamp ||
    input.ranking_context.generated_at !== input.decision_timestamp
  ) {
    reasons.push("producer_timestamp_lineage_conflict");
  }
  return uniqueSorted(reasons);
}

function providerReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  const provider = input.provider_context;
  const reasons: string[] = [];
  if (
    provider.freshness !== "fresh" ||
    !Number.isInteger(provider.expected_observation_count) ||
    !Number.isInteger(provider.observed_observation_count) ||
    provider.expected_observation_count <= 0 ||
    provider.observed_observation_count < 0 ||
    provider.observed_observation_count >
      provider.expected_observation_count ||
    provider.expected_observation_count !== provider.observed_observation_count ||
    provider.coverage_contract_version !==
      CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION ||
    provider.coverage_denominator !== "candidate_provider_observations" ||
    provider.coverage_unit !== "candidate"
  ) {
    reasons.push("provider_coverage_not_complete");
  }
  if (provider.coverage_reason_codes.length > 0) {
    reasons.push("provider_coverage_reason_present");
  }
  if (
    input.candidates.some((candidate) =>
      candidate.data_gap_codes.some((reasonCode) =>
        /provider|freshness|stale|coverage/.test(reasonCode),
      ),
    )
  ) {
    reasons.push("candidate_provider_gap_present");
  }
  return uniqueSorted(reasons);
}

function presentationReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  return input.presentation_top_k === null ||
    (Number.isInteger(input.presentation_top_k) &&
      input.presentation_top_k > 0)
    ? []
    : ["presentation_top_k_invalid"];
}

function noTradeReasons(input: CompleteOpportunitySetEvidenceBuilderInput) {
  if (input.decision_disposition !== "explicit_no_trade") {
    return input.no_trade_evidence === null
      ? []
      : ["decision_disposition_evidence_conflict"];
  }
  const evidence = input.no_trade_evidence;
  if (
    evidence === null ||
    evidence.explicit_decision_recorded !== true ||
    !explicitIdentity(evidence.producer_decision_id) ||
    !explicitInstant(evidence.decision_timestamp) ||
    !evidence.decision_reason_code ||
    !reasonCodePattern.test(evidence.decision_reason_code) ||
    !validCanonicalCounterfactualReasonCodes([
      evidence.decision_reason_code,
    ]) ||
    !evidence.decision_source ||
    evidence.deterministic_fallback_used ||
    evidence.producer_decision_id !== input.producer_decision_id ||
    evidence.decision_timestamp !== input.decision_timestamp
  ) {
    return [
      evidence?.deterministic_fallback_used
        ? "no_trade_and_fallback_are_mutually_exclusive"
        : "explicit_no_trade_decision_evidence_missing",
    ];
  }
  return [];
}

function candidateOrder(
  first: CompleteOpportunitySetCandidateInput,
  second: CompleteOpportunitySetCandidateInput,
) {
  if (first.ranking.rank !== second.ranking.rank) {
    return first.ranking.rank - second.ranking.rank;
  }
  const tieBreak = (first.tie_break_key as string).localeCompare(
    second.tie_break_key as string,
  );
  if (tieBreak !== 0) return tieBreak;
  return first.candidate_identity.localeCompare(second.candidate_identity);
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function buildRankingSummary(
  input: CompleteOpportunitySetEvidenceBuilderInput,
  candidates: CompleteOpportunitySetCandidateInput[],
): ScannerCandidateRankingSummary {
  const results = candidates.map((candidate) =>
    structuredClone(candidate.ranking),
  );
  const scores = results.map((candidate) => candidate.score.normalized_score);
  const tierCount = (tier: ScannerCandidateRankingResult["score"]["tier"]) =>
    results.filter((candidate) => candidate.score.tier === tier).length;
  const sourceCount = (
    source: ScannerCandidateRankingResult["source_contribution"],
  ) =>
    results.filter((candidate) => candidate.source_contribution === source)
      .length;
  const selectedTickers = results
    .filter((candidate) => candidate.selected)
    .map((candidate) => candidate.ticker);
  const overflowCount = candidates.filter(
    (candidate) => candidate.membership_status === "overflow",
  ).length;
  const targetStatus: ScannerCandidateRankingSummary["target_status"] =
    selectedTickers.length === 0
      ? "empty"
      : selectedTickers.length < input.ranking_context.target_min
        ? "below_target"
        : selectedTickers.length > input.ranking_context.target_max
          ? "above_target"
          : "within_target";
  return {
    ...structuredClone(input.ranking_context),
    candidates_ranked: results.length,
    selected_count: selectedTickers.length,
    target_status: targetStatus,
    overflow_count: overflowCount,
    strong_count: tierCount("strong"),
    valid_count: tierCount("valid"),
    experimental_count: tierCount("experimental"),
    incomplete_count: tierCount("incomplete"),
    rejected_count: tierCount("rejected"),
    average_score:
      scores.length > 0
        ? round(scores.reduce((total, score) => total + score, 0) / scores.length)
        : null,
    score_range: {
      min: scores.length > 0 ? Math.min(...scores) : null,
      max: scores.length > 0 ? Math.max(...scores) : null,
    },
    source_contribution: {
      base_universe: sourceCount("base_universe"),
      dynamic_mover: sourceCount("dynamic_mover"),
      fallback: sourceCount("fallback"),
      unknown: sourceCount("unknown"),
    },
    results,
    selection: {
      selected_tickers: selectedTickers,
      overflow_count: overflowCount,
      target_status: targetStatus,
    },
  };
}

function toAdapterCandidate(
  candidate: CompleteOpportunitySetCandidateInput,
): CompletedScannerCandidateEvidence {
  const {
    producer_versions: _producerVersions,
    ...evidence
  } = candidate;
  void _producerVersions;
  return structuredClone(evidence);
}

function buildEnabled(
  source: CompleteOpportunitySetEvidenceBuilderInput,
  previousBindingLookup: CompleteOpportunitySetPreviousBindingLookup,
): CompleteOpportunitySetEvidenceBuilderResult {
  const input = structuredClone(source);
  const validationOrder: Array<{
    status: Exclude<CompleteOpportunitySetEvidenceStatus, "ready">;
    reasons: string[];
  }> = [
    { status: "identity_conflict", reasons: identityReasons(input) },
    { status: "incomplete_membership", reasons: membershipReasons(input) },
    {
      status: "incomplete_membership",
      reasons: presentationReasons(input),
    },
    { status: "rank_conflict", reasons: rankReasons(input) },
    { status: "version_conflict", reasons: versionReasons(input) },
    { status: "reason_code_conflict", reasons: reasonCodeReasons(input) },
    {
      status: "not_point_in_time_safe",
      reasons: pointInTimeReasons(input),
    },
    {
      status: "provider_coverage_incomplete",
      reasons: providerReasons(input),
    },
    {
      status: "no_trade_evidence_missing",
      reasons: noTradeReasons(input),
    },
  ];
  const firstFailure = validationOrder.find(
    (validation) => validation.reasons.length > 0,
  );
  if (firstFailure) {
    return rejected(input, firstFailure.status, firstFailure.reasons);
  }

  const orderedCandidates = [...input.candidates].sort(candidateOrder);
  const bundle: CompletedScannerBundleProjectionInput = {
    source_namespace: input.source_namespace,
    completion_status: "completed",
    scan_run: structuredClone(input.scan_run),
    batch: input.batch ? structuredClone(input.batch) : null,
    ranking_summary: buildRankingSummary(input, orderedCandidates),
    build_diagnostics: [...input.build_diagnostics]
      .sort((first, second) => first.ticker.localeCompare(second.ticker))
      .map((diagnostic) => structuredClone(diagnostic)),
    stable_scan_identity: input.stable_scan_identity,
    producer_decision_id: input.producer_decision_id,
    decision_timestamp: input.decision_timestamp,
    point_in_time_cutoff: input.point_in_time_cutoff,
    full_membership_declared: true,
    expected_candidate_count: input.expected_candidate_count,
    pre_truncation_capture_evidence: structuredClone(
      input.pre_truncation_capture_evidence,
    ),
    versions: structuredClone(input.versions),
    provider_context: structuredClone(input.provider_context),
    candidates: orderedCandidates.map(toAdapterCandidate),
    decision_lineage_nodes: structuredClone(input.decision_lineage_nodes),
    decision_disposition: input.decision_disposition,
    no_trade_evidence: input.no_trade_evidence
      ? structuredClone(input.no_trade_evidence)
      : null,
    counterfactual_evaluation_requested:
      input.counterfactual_evaluation_requested,
  };
  const firstProjection =
    projectCompletedScannerBundleToOpportunitySet(bundle);
  if (
    firstProjection.status !== "mapped" ||
    !firstProjection.opportunity_set
  ) {
    const mappedStatus: Exclude<
      CompleteOpportunitySetEvidenceStatus,
      "ready"
    > =
      firstProjection.status === "conflicting"
        ? "identity_conflict"
        : "incomplete_membership";
    return rejected(
      input,
      mappedStatus,
      firstProjection.diagnostics.map((item) => item.reason_code),
    );
  }
  const candidateSetDigest =
    firstProjection.opportunity_set.full_candidate_set_digest;
  const decisionEvidenceDigest =
    firstProjection.opportunity_set.decision_evidence_digest;
  const decisionSemanticBinding =
    firstProjection.opportunity_set.decision_semantic_binding;
  const decisionSemanticBindingDigest =
    decisionSemanticBinding.semantic_digest;
  const currentBinding: CompleteOpportunitySetPriorBinding = {
    producer_decision_id: input.producer_decision_id,
    decision_disposition: input.decision_disposition,
    no_trade_producer_decision_id:
      input.no_trade_evidence?.producer_decision_id ?? null,
    full_candidate_set_digest: candidateSetDigest,
    decision_evidence_digest: decisionEvidenceDigest,
    decision_semantic_binding_digest: decisionSemanticBindingDigest,
    lineage_graph_digest: decisionSemanticBinding.lineage_graph_digest,
    version_bundle_digest: decisionSemanticBinding.version_bundle_digest,
  };
  let previousBinding: CompleteOpportunitySetPriorBinding | null;
  try {
    previousBinding = previousBindingLookup.lookup(
      input.producer_decision_id,
    );
  } catch {
    return rejected(input, "identity_conflict", [
      "previous_binding_lookup_failed",
    ]);
  }
  if (
    previousBinding &&
    (previousBinding.producer_decision_id !==
      currentBinding.producer_decision_id ||
      previousBinding.decision_disposition !==
        currentBinding.decision_disposition ||
      previousBinding.no_trade_producer_decision_id !==
        currentBinding.no_trade_producer_decision_id ||
      !fullShaPattern.test(previousBinding.full_candidate_set_digest) ||
      !fullShaPattern.test(previousBinding.decision_evidence_digest) ||
      !fullShaPattern.test(
        previousBinding.decision_semantic_binding_digest,
      ) ||
      !fullShaPattern.test(previousBinding.lineage_graph_digest) ||
      !fullShaPattern.test(previousBinding.version_bundle_digest) ||
      previousBinding.full_candidate_set_digest !==
        currentBinding.full_candidate_set_digest ||
      previousBinding.decision_evidence_digest !==
        currentBinding.decision_evidence_digest ||
      previousBinding.decision_semantic_binding_digest !==
        currentBinding.decision_semantic_binding_digest ||
      previousBinding.lineage_graph_digest !==
        currentBinding.lineage_graph_digest ||
      previousBinding.version_bundle_digest !==
        currentBinding.version_bundle_digest)
  ) {
    return rejected(input, "identity_conflict", [
      "same_decision_identity_different_evidence",
    ]);
  }

  const frozenBundle = deepFreeze(bundle);
  const replayProjection =
    projectCompletedScannerBundleToOpportunitySet(frozenBundle);
  const replaySet =
    replayProjection.status === "mapped"
      ? replayProjection.opportunity_set
      : null;
  const identityStable =
    replaySet?.opportunity_set_identity ===
    firstProjection.opportunity_set.opportunity_set_identity;
  const candidateDigestStable =
    replaySet?.full_candidate_set_digest === candidateSetDigest;
  const evidenceDigestStable =
    replaySet?.decision_evidence_digest === decisionEvidenceDigest;
  const decisionSemanticBindingDigestStable =
    replaySet?.decision_semantic_binding.semantic_digest ===
      decisionSemanticBindingDigest &&
    replaySet?.decision_semantic_binding.lineage_graph_digest ===
      currentBinding.lineage_graph_digest &&
    replaySet?.decision_semantic_binding.version_bundle_digest ===
      currentBinding.version_bundle_digest;
  if (
    replayProjection.status !== "mapped" ||
    !identityStable ||
    !candidateDigestStable ||
    !evidenceDigestStable ||
    !decisionSemanticBindingDigestStable
  ) {
    return rejected(input, "identity_conflict", [
      "action_665b_round_trip_mismatch",
    ]);
  }
  return deepFreeze({
    builder_version: COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_VERSION,
    status: "ready",
    completed_bundle: frozenBundle,
    full_candidate_set_digest: candidateSetDigest,
    decision_evidence_digest: decisionEvidenceDigest,
    decision_semantic_binding_digest: decisionSemanticBindingDigest,
    decision_binding: currentBinding,
    presentation: {
      top_k: input.presentation_top_k,
      full_candidate_count: input.candidates.length,
      full_ranking_preserved:
        frozenBundle.ranking_summary?.results.length ===
          input.candidates.length &&
        frozenBundle.candidates.length === input.candidates.length,
    },
    round_trip: {
      first_status: firstProjection.status,
      replay_status: replayProjection.status,
      canonical_identity_stable: identityStable,
      candidate_set_digest_stable: candidateDigestStable,
      decision_evidence_digest_stable: evidenceDigestStable,
      decision_semantic_binding_digest_stable:
        decisionSemanticBindingDigestStable,
    },
    reason_codes: [],
  });
}

export function createCompleteOpportunitySetEvidenceBuilder(
  options: {
    enabled?: boolean;
    previous_binding_lookup?: CompleteOpportunitySetPreviousBindingLookup;
  } = {},
): CompleteOpportunitySetEvidenceBuilderHandle {
  const enabled =
    options.enabled ?? COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_DEFAULT_ENABLED;
  if (!enabled || !options.previous_binding_lookup) {
    return { enabled: false, build: null };
  }
  return {
    enabled: true,
    build: (input) =>
      buildEnabled(input, options.previous_binding_lookup as CompleteOpportunitySetPreviousBindingLookup),
  };
}

export function compareCompleteOpportunitySetDecisionEvidence(
  first: CompleteOpportunitySetEvidenceBuilderResult,
  second: CompleteOpportunitySetEvidenceBuilderResult,
) {
  if (
    first.status !== "ready" ||
    second.status !== "ready" ||
    !first.completed_bundle ||
    !second.completed_bundle
  ) {
    return {
      status: "identity_conflict" as const,
      reason_codes: ["ready_decision_evidence_required"],
    };
  }
  if (
    first.completed_bundle.producer_decision_id !==
    second.completed_bundle.producer_decision_id
  ) {
    return { status: "different_identity" as const, reason_codes: [] };
  }
  if (
    first.full_candidate_set_digest !== second.full_candidate_set_digest ||
    first.decision_evidence_digest !== second.decision_evidence_digest ||
    first.decision_semantic_binding_digest !==
      second.decision_semantic_binding_digest
  ) {
    return {
      status: "identity_conflict" as const,
      reason_codes: ["same_decision_identity_different_evidence"],
    };
  }
  return { status: "same_evidence" as const, reason_codes: [] };
}

export function aggregateCompleteOpportunitySetReadiness(
  results: CompleteOpportunitySetEvidenceBuilderResult[],
): CompleteOpportunitySetReadinessReport {
  const statuses: CompleteOpportunitySetEvidenceStatus[] = [
    "ready",
    "incomplete_membership",
    "rank_conflict",
    "identity_conflict",
    "version_conflict",
    "reason_code_conflict",
    "not_point_in_time_safe",
    "provider_coverage_incomplete",
    "no_trade_evidence_missing",
  ];
  const statusCounts = Object.fromEntries(
    statuses.map((status) => [
      status,
      results.filter((result) => result.status === status).length,
    ]),
  ) as Record<CompleteOpportunitySetEvidenceStatus, number>;
  const reasonCounts = new Map<string, number>();
  for (const result of results) {
    for (const reasonCode of result.reason_codes) {
      reasonCounts.set(reasonCode, (reasonCounts.get(reasonCode) ?? 0) + 1);
    }
  }
  return {
    builder_version: COMPLETE_OPPORTUNITY_SET_EVIDENCE_BUILDER_VERSION,
    evidence_class: "synthetic_fixture_only",
    performance_values_included: false,
    total: results.length,
    status_counts: statusCounts,
    round_trip_mapped: results.filter(
      (result) =>
        result.round_trip.first_status === "mapped" &&
        result.round_trip.replay_status === "mapped",
    ).length,
    full_ranking_preserved: results.filter(
      (result) => result.presentation.full_ranking_preserved,
    ).length,
    reason_counts: Object.fromEntries(
      [...reasonCounts.entries()].sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    ),
  };
}

export function completeOpportunitySetInputDigest(
  input: CompleteOpportunitySetEvidenceBuilderInput,
) {
  return canonicalCounterfactualSemanticDigest(input);
}
