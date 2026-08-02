import { createHash } from "node:crypto";

import type {
  CanonicalCounterfactualOpportunitySet,
  CanonicalRankingOpportunitySet,
} from "@/lib/canonical-quality-metrics";
import {
  buildCanonicalRecommendationDecision,
  buildCanonicalRecommendationIdentity,
  type CanonicalEvaluationVersions,
  type CanonicalRecommendationDecision,
  type CanonicalSampleType,
} from "@/lib/canonical-recommendation-evaluation";

export const CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION =
  "canonical_counterfactual_opportunity_set_v1" as const;
export const CANONICAL_COUNTERFACTUAL_DECISION_CONTRACT_VERSION =
  "canonical_counterfactual_decision_v1" as const;
export const CANONICAL_COUNTERFACTUAL_METRICS_PROJECTION_VERSION =
  "canonical_counterfactual_metrics_projection_v1" as const;
export const CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION =
  "canonical_counterfactual_reason_taxonomy_v1" as const;
export const CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION =
  "canonical_expected_outcome_lineage_v1" as const;
export const CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION =
  "canonical_provider_coverage_v1" as const;
export const CANONICAL_DECISION_SEMANTIC_BINDING_VERSION =
  "canonical_decision_semantic_binding_v1" as const;

export const CANONICAL_COUNTERFACTUAL_REASON_CODES = [
  "below_publish_threshold",
  "candidate_provider_gap",
  "cooldown_active_position",
  "no_publishable_candidate",
  "provider_candle_gap",
  "provider_data_stale",
  "selection_capacity_exceeded",
] as const;

export type CanonicalCounterfactualReasonCode =
  (typeof CANONICAL_COUNTERFACTUAL_REASON_CODES)[number];

export type CanonicalCounterfactualReadinessStatus =
  | "evaluable"
  | "incomplete_opportunity_set"
  | "rank_gap"
  | "candidate_outcome_missing"
  | "provider_gap"
  | "conflicting"
  | "non_reproducible"
  | "not_point_in_time_safe";

export type CanonicalCounterfactualReadiness = {
  status: CanonicalCounterfactualReadinessStatus;
  counterfactual_evaluation_eligible: boolean;
  reason_codes: string[];
};

export type CanonicalOpportunitySetVersions = CanonicalEvaluationVersions & {
  scanner_version: string;
  universe_version: string;
  threshold_version: string;
  reason_taxonomy_version: typeof CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION;
};

export type CanonicalOpportunitySetProviderContext = {
  provider: string;
  source_timestamp: string;
  freshness: "fresh" | "stale" | "gap" | "unknown";
  coverage_contract_version: typeof CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION;
  coverage_denominator: "candidate_provider_observations";
  coverage_unit: "candidate";
  expected_observation_count: number;
  observed_observation_count: number;
  coverage_reason_codes: string[];
};

export type CanonicalExpectedOutcomeLineage = {
  lineage_version: typeof CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION;
  lineage_namespace: string;
  evaluator_contract_version: string;
  evaluator_version: string;
  intended_horizon_policy: "primary_60m_else_30m_else_15m_v1";
  scan_identity: string;
  decision_identity: string;
  candidate_identity: string;
  batch_identity: string | null;
  recommendation_decision_identity: string | null;
  snapshot_identity: string | null;
  expected_outcome_lineage_key: string;
};

export type CanonicalCandidateMembershipStatus =
  | "selected"
  | "rejected"
  | "overflow"
  | "under_threshold";

export type CanonicalCandidateOutcome = {
  outcome_identity: string;
  evaluated_at: string;
  evaluator_version: string;
  provider_contract_version: string;
  primary_horizon: "15m" | "30m" | "60m";
  terminal_outcome:
    | "target_before_stop"
    | "stop_before_target"
    | "no_entry"
    | "neither"
    | "ambiguous_same_candle";
  outcome_evaluable: boolean;
  reproducible: boolean;
  positive_outcome: boolean | null;
  r_result: number | null;
  coverage_status: "complete" | "provider_gap" | "stale" | "incomplete";
  reason_codes: string[];
};

export type CanonicalCandidateMembershipInput = {
  candidate_identity: string;
  ticker: string;
  original_rank: number | null;
  original_score: number;
  tie_break_key: string | null;
  setup: string | null;
  context: {
    window: string | null;
    regime: string | null;
    sector: string | null;
    strategy: string | null;
  };
  membership_status: CanonicalCandidateMembershipStatus;
  rejection_reason_codes: string[];
  threshold_version: string;
  ranking_version: string;
  eligibility_at_decision: "eligible" | "ineligible" | "unknown";
  data_gap_codes: string[];
  provider_source_timestamp: string;
  lineage: {
    scan_identity: string;
    batch_identity: string | null;
    recommendation_decision_identity: string | null;
    snapshot_identity: string | null;
  };
  expected_outcome_lineage: CanonicalExpectedOutcomeLineage;
  outcome: CanonicalCandidateOutcome | null;
};

export type CanonicalCandidateMembership =
  CanonicalCandidateMembershipInput & {
    canonical_candidate_identity: string;
    canonical_order: number;
  };

export type CanonicalDecisionDisposition =
  | "publish_recommendations"
  | "explicit_no_trade"
  | "deterministic_fallback";

export type CanonicalDecisionLineageNode = {
  node_kind: "recommendation" | "rejection" | "no_trade";
  decision_identity: string;
  candidate_identity: string | null;
  snapshot_identity: string | null;
};

export type CanonicalNoTradeSemantics = {
  explicit_decision_recorded: true;
  producer_decision_id: string;
  decision_timestamp: string;
  decision_reason_code: CanonicalCounterfactualReasonCode;
  decision_reason_detail: string | null;
  decision_source: string;
  ai_no_trade_observed: boolean;
  deterministic_fallback_used: false;
};

export type CanonicalDecisionSemanticsInput = {
  decision_disposition: CanonicalDecisionDisposition;
  decision_lineage_nodes: CanonicalDecisionLineageNode[];
  no_trade_semantics: CanonicalNoTradeSemantics | null;
};

export type CanonicalCandidateTerminalDisposition =
  | "published_recommendation"
  | "deterministic_fallback_recommendation"
  | "rejected_candidate"
  | "overflow_candidate"
  | "under_threshold_candidate"
  | "explicit_no_trade_candidate";

export type CanonicalCandidateTerminalBinding = {
  candidate_identity: string;
  terminal_disposition: CanonicalCandidateTerminalDisposition;
  decision_identity: string;
  snapshot_identity: string | null;
  expected_outcome_lineage_key: string;
  evaluator_contract_version: string;
  evaluator_version: string;
  intended_horizon_policy: "primary_60m_else_30m_else_15m_v1";
};

export type CanonicalDecisionSemanticBinding = {
  binding_version: typeof CANONICAL_DECISION_SEMANTIC_BINDING_VERSION;
  decision_disposition: CanonicalDecisionDisposition;
  terminal_dispositions: CanonicalCandidateTerminalBinding[];
  decision_lineage_nodes: CanonicalDecisionLineageNode[];
  no_trade_semantics: CanonicalNoTradeSemantics | null;
  no_trade_semantics_digest: string | null;
  lineage_graph_digest: string;
  version_bundle_digest: string;
  candidate_set_digest: string;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalCounterfactualOpportunitySetInput = {
  source_namespace: string;
  scan_identity: string;
  decision_identity: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  versions: CanonicalOpportunitySetVersions;
  expected_candidate_count: number;
  observed_candidate_count: number;
  provider_context: CanonicalOpportunitySetProviderContext;
  candidates: CanonicalCandidateMembershipInput[];
  decision_semantics: CanonicalDecisionSemanticsInput;
  pre_truncation_capture_evidence_digest: string;
  claimed_candidate_set_digest?: string | null;
};

export type CanonicalCounterfactualOpportunitySetContract = {
  contract_version: typeof CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION;
  opportunity_set_identity: string;
  source_namespace: string;
  scan_identity: string;
  decision_identity: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  versions: CanonicalOpportunitySetVersions;
  full_candidate_set_digest: string;
  decision_evidence_digest: string;
  decision_semantic_binding: CanonicalDecisionSemanticBinding;
  expected_candidate_count: number;
  observed_candidate_count: number;
  provider_context: CanonicalOpportunitySetProviderContext;
  pre_truncation_capture_evidence_digest: string;
  candidates: CanonicalCandidateMembership[];
  readiness: CanonicalCounterfactualReadiness;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalOpportunitySetBuildResult =
  | {
      status: "built";
      opportunity_set: CanonicalCounterfactualOpportunitySetContract;
      reason_codes: [];
    }
  | {
      status: "unmappable";
      opportunity_set: null;
      reason_codes: string[];
    };

export type CanonicalCounterfactualDecisionKind =
  | "no_trade"
  | "rejected_candidate";

type CanonicalCounterfactualDecisionBase = {
  contract_version: typeof CANONICAL_COUNTERFACTUAL_DECISION_CONTRACT_VERSION;
  decision_kind: CanonicalCounterfactualDecisionKind;
  source_namespace: string;
  producer_decision_id: string;
  decision_timestamp: string;
  canonical_identity: string;
  opportunity_set_identity: string;
  opportunity_set_digest: string;
  decision_reason_code: string;
  decision_reason_detail: string | null;
  decision_source: string;
  counterfactual_readiness: CanonicalCounterfactualReadiness;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type CanonicalNoTradeDecision = CanonicalCounterfactualDecisionBase & {
  decision_kind: "no_trade";
  explicit_no_trade_decision: true;
};

export type CanonicalRejectedCandidateDecision =
  CanonicalCounterfactualDecisionBase & {
    decision_kind: "rejected_candidate";
    rejected_candidate_identity: string;
  };

export type CanonicalCounterfactualDecision =
  | CanonicalNoTradeDecision
  | CanonicalRejectedCandidateDecision;

export type CanonicalCounterfactualDecisionBuildResult =
  | {
      status: "built";
      decision: CanonicalCounterfactualDecision;
      reason_codes: [];
    }
  | {
      status: "unmappable" | "conflicting";
      decision: null;
      reason_codes: string[];
    };

export type CanonicalOpportunitySetIdentityConflict = {
  status: "same_semantics" | "different_identity" | "conflicting";
  reason_codes: string[];
};

export type CanonicalCounterfactualMetricsProjection = {
  projection_version: typeof CANONICAL_COUNTERFACTUAL_METRICS_PROJECTION_VERSION;
  canonical_evaluation_decision: CanonicalRecommendationDecision;
  ranking_opportunity_set: CanonicalRankingOpportunitySet;
  counterfactual_opportunity_set: CanonicalCounterfactualOpportunitySet;
};

export type CanonicalCounterfactualProjectionResult =
  | {
      status: "mapped";
      projection: CanonicalCounterfactualMetricsProjection;
      reason_codes: [];
    }
  | {
      status: "not_evaluable" | "conflicting";
      projection: null;
      reason_codes: string[];
    };

const explicitInstantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const sourceNamespacePattern = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const reasonCodePattern = /^[a-z0-9][a-z0-9._-]{0,95}$/;
const fullShaPattern = /^[0-9a-f]{64}$/;
const fullGitCommitPattern = /^[0-9a-f]{40}$/;
const controlCharacterPattern = /[\u0000-\u001f\u007f]/;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

export function canonicalCounterfactualSemanticDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function exactText(value: unknown, maxLength = 240) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maxLength ||
    value !== value.trim() ||
    value !== value.normalize("NFC") ||
    controlCharacterPattern.test(value)
  ) {
    return null;
  }
  return value;
}

function nullableExactText(value: unknown, maxLength = 240) {
  return value === null || Boolean(exactText(value, maxLength));
}

function explicitInstant(value: unknown) {
  if (typeof value !== "string" || !explicitInstantPattern.test(value)) {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

export function validCanonicalCounterfactualReasonCodes(values: unknown) {
  return (
    Array.isArray(values) &&
    values.every((value) =>
      CANONICAL_COUNTERFACTUAL_REASON_CODES.includes(
        value as CanonicalCounterfactualReasonCode,
      ),
    )
  );
}

function validCandidateOutcome(value: CanonicalCandidateOutcome) {
  return (
    Boolean(exactText(value?.outcome_identity)) &&
    Boolean(explicitInstant(value?.evaluated_at)) &&
    Boolean(exactText(value?.evaluator_version, 160)) &&
    Boolean(exactText(value?.provider_contract_version, 160)) &&
    (value?.primary_horizon === "15m" ||
      value?.primary_horizon === "30m" ||
      value?.primary_horizon === "60m") &&
    (value?.terminal_outcome === "target_before_stop" ||
      value?.terminal_outcome === "stop_before_target" ||
      value?.terminal_outcome === "no_entry" ||
      value?.terminal_outcome === "neither" ||
      value?.terminal_outcome === "ambiguous_same_candle") &&
    typeof value?.outcome_evaluable === "boolean" &&
    typeof value?.reproducible === "boolean" &&
    (value?.positive_outcome === null ||
      typeof value?.positive_outcome === "boolean") &&
    (value?.r_result === null || finite(value?.r_result)) &&
    (value?.coverage_status === "complete" ||
      value?.coverage_status === "provider_gap" ||
      value?.coverage_status === "stale" ||
      value?.coverage_status === "incomplete") &&
    validCanonicalCounterfactualReasonCodes(value?.reason_codes)
  );
}

function validVersions(versions: CanonicalOpportunitySetVersions) {
  const textFields = [
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
    "build_identity",
  ] as const;
  return (
    textFields.every((field) => Boolean(exactText(versions?.[field], 160))) &&
    fullGitCommitPattern.test(versions?.git_commit ?? "") &&
    versions?.reason_taxonomy_version ===
      CANONICAL_COUNTERFACTUAL_REASON_TAXONOMY_VERSION
  );
}

function canonicalOpportunitySetIdentity(input: {
  source_namespace: string;
  scan_identity: string;
  decision_identity: string;
  decision_timestamp: string;
}) {
  return [
    "counterfactual_opportunity_set",
    "v1",
    encodeURIComponent(input.source_namespace),
    encodeURIComponent(input.scan_identity),
    encodeURIComponent(input.decision_identity),
    String(Date.parse(input.decision_timestamp)),
  ].join(":");
}

function canonicalCandidateIdentity(input: {
  source_namespace: string;
  scan_identity: string;
  candidate_identity: string;
}) {
  return [
    "counterfactual_candidate",
    "v1",
    encodeURIComponent(input.source_namespace),
    encodeURIComponent(input.scan_identity),
    encodeURIComponent(input.candidate_identity),
  ].join(":");
}

function decisionTimeCandidatePayload(candidate: CanonicalCandidateMembership) {
  return {
    candidate_identity: candidate.candidate_identity,
    canonical_candidate_identity: candidate.canonical_candidate_identity,
    canonical_order: candidate.canonical_order,
    ticker: candidate.ticker,
    original_rank: candidate.original_rank,
    original_score: candidate.original_score,
    tie_break_key: candidate.tie_break_key,
    setup: candidate.setup,
    context: candidate.context,
    membership_status: candidate.membership_status,
    rejection_reason_codes: candidate.rejection_reason_codes,
    threshold_version: candidate.threshold_version,
    ranking_version: candidate.ranking_version,
    eligibility_at_decision: candidate.eligibility_at_decision,
    data_gap_codes: candidate.data_gap_codes,
    provider_source_timestamp: candidate.provider_source_timestamp,
    lineage: candidate.lineage,
    expected_outcome_lineage: candidate.expected_outcome_lineage,
  };
}

function fullCandidateSetDigest(candidates: CanonicalCandidateMembership[]) {
  return canonicalCounterfactualSemanticDigest(
    [...candidates]
      .sort((first, second) =>
        first.canonical_candidate_identity.localeCompare(
          second.canonical_candidate_identity,
        ),
      )
      .map(decisionTimeCandidatePayload),
  );
}

function candidateTerminalDisposition(
  disposition: CanonicalDecisionDisposition,
  candidate: CanonicalCandidateMembership,
): CanonicalCandidateTerminalDisposition {
  if (disposition === "explicit_no_trade") {
    return "explicit_no_trade_candidate";
  }
  if (candidate.membership_status === "selected") {
    return disposition === "deterministic_fallback"
      ? "deterministic_fallback_recommendation"
      : "published_recommendation";
  }
  if (candidate.membership_status === "overflow") {
    return "overflow_candidate";
  }
  if (candidate.membership_status === "under_threshold") {
    return "under_threshold_candidate";
  }
  return "rejected_candidate";
}

function orderedDecisionLineageNodes(nodes: CanonicalDecisionLineageNode[]) {
  return [...nodes].sort((first, second) =>
    [
      first.node_kind,
      first.decision_identity,
      first.candidate_identity ?? "",
      first.snapshot_identity ?? "",
    ]
      .join(":")
      .localeCompare(
        [
          second.node_kind,
          second.decision_identity,
          second.candidate_identity ?? "",
          second.snapshot_identity ?? "",
        ].join(":"),
      ),
  );
}

function decisionSemanticValidationReasons(input: {
  source: CanonicalCounterfactualOpportunitySetInput;
  candidates: CanonicalCandidateMembership[];
}) {
  const { source, candidates } = input;
  const semantics = source.decision_semantics;
  const reasons: string[] = [];
  if (
    semantics?.decision_disposition !== "publish_recommendations" &&
    semantics?.decision_disposition !== "explicit_no_trade" &&
    semantics?.decision_disposition !== "deterministic_fallback"
  ) {
    reasons.push("decision_disposition_invalid");
    return reasons;
  }
  if (!Array.isArray(semantics.decision_lineage_nodes)) {
    reasons.push("decision_lineage_nodes_missing");
    return reasons;
  }
  const nodes = semantics.decision_lineage_nodes;
  if (
    nodes.some(
      (node) =>
        (node.node_kind !== "recommendation" &&
          node.node_kind !== "rejection" &&
          node.node_kind !== "no_trade") ||
        !exactText(node.decision_identity) ||
        !nullableExactText(node.candidate_identity) ||
        !nullableExactText(node.snapshot_identity),
    )
  ) {
    reasons.push("decision_lineage_node_invalid");
  }
  const nodeDigests = nodes.map(canonicalCounterfactualSemanticDigest);
  if (new Set(nodeDigests).size !== nodeDigests.length) {
    reasons.push("decision_lineage_node_duplicate");
  }
  if (semantics.decision_disposition === "explicit_no_trade") {
    const noTrade = semantics.no_trade_semantics;
    if (
      !noTrade ||
      noTrade.explicit_decision_recorded !== true ||
      noTrade.producer_decision_id !== source.decision_identity ||
      noTrade.decision_timestamp !== source.decision_timestamp ||
      !validCanonicalCounterfactualReasonCodes([
        noTrade.decision_reason_code,
      ]) ||
      !nullableExactText(noTrade.decision_reason_detail, 500) ||
      !exactText(noTrade.decision_source, 160) ||
      typeof noTrade.ai_no_trade_observed !== "boolean" ||
      noTrade.deterministic_fallback_used !== false
    ) {
      reasons.push("explicit_no_trade_semantics_invalid");
    }
    const noTradeNodes = nodes.filter((node) => node.node_kind === "no_trade");
    if (
      nodes.length !== 1 ||
      noTradeNodes.length !== 1 ||
      noTradeNodes[0]?.decision_identity !== source.decision_identity ||
      noTradeNodes[0]?.candidate_identity !== null ||
      noTradeNodes[0]?.snapshot_identity !== null
    ) {
      reasons.push("explicit_no_trade_lineage_identity_invalid");
    }
    if (
      candidates.some(
        (candidate) =>
          candidate.lineage.recommendation_decision_identity !==
            source.decision_identity ||
          candidate.expected_outcome_lineage
            .recommendation_decision_identity !== source.decision_identity ||
          candidate.lineage.snapshot_identity !== null ||
          candidate.expected_outcome_lineage.snapshot_identity !== null,
      )
    ) {
      reasons.push("candidate_no_trade_lineage_identity_invalid");
    }
  } else {
    if (semantics.no_trade_semantics !== null) {
      reasons.push("non_no_trade_semantics_present");
    }
    if (nodes.some((node) => node.node_kind === "no_trade")) {
      reasons.push("non_no_trade_lineage_node_present");
    }
    if (nodes.length !== candidates.length) {
      reasons.push("decision_lineage_membership_count_mismatch");
    }
    for (const candidate of candidates) {
      const expectedKind =
        candidate.membership_status === "selected"
          ? "recommendation"
          : "rejection";
      const matches = nodes.filter(
        (node) =>
          node.node_kind === expectedKind &&
          node.decision_identity ===
            candidate.lineage.recommendation_decision_identity &&
          node.candidate_identity === candidate.candidate_identity &&
          node.snapshot_identity === candidate.lineage.snapshot_identity,
      );
      if (matches.length !== 1) {
        reasons.push("candidate_decision_lineage_node_conflict");
      }
    }
  }
  return uniqueSorted(reasons);
}

function buildDecisionSemanticBinding(input: {
  source: CanonicalCounterfactualOpportunitySetInput;
  candidates: CanonicalCandidateMembership[];
  candidateSetDigest: string;
}): CanonicalDecisionSemanticBinding {
  const { source, candidates, candidateSetDigest } = input;
  const decisionLineageNodes = orderedDecisionLineageNodes(
    source.decision_semantics.decision_lineage_nodes,
  );
  const terminalDispositions = [...candidates]
    .sort((first, second) =>
      first.canonical_candidate_identity.localeCompare(
        second.canonical_candidate_identity,
      ),
    )
    .map((candidate) => ({
      candidate_identity: candidate.candidate_identity,
      terminal_disposition: candidateTerminalDisposition(
        source.decision_semantics.decision_disposition,
        candidate,
      ),
      decision_identity:
        candidate.lineage.recommendation_decision_identity as string,
      snapshot_identity: candidate.lineage.snapshot_identity,
      expected_outcome_lineage_key:
        candidate.expected_outcome_lineage.expected_outcome_lineage_key,
      evaluator_contract_version:
        candidate.expected_outcome_lineage.evaluator_contract_version,
      evaluator_version: candidate.expected_outcome_lineage.evaluator_version,
      intended_horizon_policy:
        candidate.expected_outcome_lineage.intended_horizon_policy,
    }));
  const noTradeSemantics = source.decision_semantics.no_trade_semantics
    ? structuredClone(source.decision_semantics.no_trade_semantics)
    : null;
  const noTradeSemanticsDigest = noTradeSemantics
    ? canonicalCounterfactualSemanticDigest(noTradeSemantics)
    : null;
  const lineageGraphDigest = canonicalCounterfactualSemanticDigest({
    scan_identity: source.scan_identity,
    producer_decision_identity: source.decision_identity,
    decision_disposition: source.decision_semantics.decision_disposition,
    decision_lineage_nodes: decisionLineageNodes,
    candidate_lineage: candidates.map((candidate) => ({
      candidate_identity: candidate.candidate_identity,
      membership_status: candidate.membership_status,
      lineage: candidate.lineage,
      expected_outcome_lineage: candidate.expected_outcome_lineage,
    })),
  });
  const payload: Omit<CanonicalDecisionSemanticBinding, "semantic_digest"> = {
    binding_version: CANONICAL_DECISION_SEMANTIC_BINDING_VERSION,
    decision_disposition: source.decision_semantics.decision_disposition,
    terminal_dispositions: terminalDispositions,
    decision_lineage_nodes: decisionLineageNodes,
    no_trade_semantics: noTradeSemantics,
    no_trade_semantics_digest: noTradeSemanticsDigest,
    lineage_graph_digest: lineageGraphDigest,
    version_bundle_digest: canonicalCounterfactualSemanticDigest(
      source.versions,
    ),
    candidate_set_digest: candidateSetDigest,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    ...payload,
    semantic_digest: canonicalCounterfactualSemanticDigest(payload),
  };
}

function decisionEvidenceDigest(input: {
  opportunity_set_identity: string;
  source_namespace: string;
  scan_identity: string;
  decision_identity: string;
  decision_timestamp: string;
  point_in_time_cutoff: string;
  versions: CanonicalOpportunitySetVersions;
  full_candidate_set_digest: string;
  expected_candidate_count: number;
  observed_candidate_count: number;
  provider_context: CanonicalOpportunitySetProviderContext;
  pre_truncation_capture_evidence_digest: string;
  decision_semantic_binding_digest: string;
}) {
  return canonicalCounterfactualSemanticDigest(input);
}

function candidateOrder(
  first: CanonicalCandidateMembershipInput,
  second: CanonicalCandidateMembershipInput,
) {
  const firstRank = first.original_rank ?? Number.MAX_SAFE_INTEGER;
  const secondRank = second.original_rank ?? Number.MAX_SAFE_INTEGER;
  if (firstRank !== secondRank) return firstRank - secondRank;
  const firstTieBreak = first.tie_break_key ?? first.candidate_identity;
  const secondTieBreak = second.tie_break_key ?? second.candidate_identity;
  const tieBreak = firstTieBreak.localeCompare(secondTieBreak);
  return tieBreak || first.candidate_identity.localeCompare(second.candidate_identity);
}

function inputValidationReasons(input: CanonicalCounterfactualOpportunitySetInput) {
  const reasons: string[] = [];
  if (
    !exactText(input.source_namespace, 64) ||
    !sourceNamespacePattern.test(input.source_namespace)
  ) {
    reasons.push("invalid_source_namespace");
  }
  if (!exactText(input.scan_identity)) reasons.push("scan_identity_missing");
  if (!exactText(input.decision_identity)) {
    reasons.push("decision_identity_missing");
  }
  if (!explicitInstant(input.decision_timestamp)) {
    reasons.push("decision_timestamp_invalid");
  }
  if (!explicitInstant(input.point_in_time_cutoff)) {
    reasons.push("point_in_time_cutoff_invalid");
  }
  if (!validVersions(input.versions)) {
    reasons.push("versions_incomplete");
  }
  if (!nonNegativeInteger(input.expected_candidate_count)) {
    reasons.push("expected_candidate_count_invalid");
  }
  if (!nonNegativeInteger(input.observed_candidate_count)) {
    reasons.push("observed_candidate_count_invalid");
  }
  if (
    input.claimed_candidate_set_digest !== undefined &&
    input.claimed_candidate_set_digest !== null &&
    !fullShaPattern.test(input.claimed_candidate_set_digest)
  ) {
    reasons.push("claimed_candidate_set_digest_invalid");
  }
  if (!fullShaPattern.test(input.pre_truncation_capture_evidence_digest)) {
    reasons.push("pre_truncation_capture_evidence_digest_invalid");
  }
  if (
    !input.decision_semantics ||
    (input.decision_semantics.decision_disposition !==
      "publish_recommendations" &&
      input.decision_semantics.decision_disposition !== "explicit_no_trade" &&
      input.decision_semantics.decision_disposition !==
        "deterministic_fallback") ||
    !Array.isArray(input.decision_semantics.decision_lineage_nodes)
  ) {
    reasons.push("decision_semantics_missing_or_invalid");
  }
  const provider = input.provider_context;
  if (
    !exactText(provider?.provider, 160) ||
    !explicitInstant(provider?.source_timestamp) ||
    (provider?.freshness !== "fresh" &&
      provider?.freshness !== "stale" &&
      provider?.freshness !== "gap" &&
      provider?.freshness !== "unknown") ||
    !nonNegativeInteger(provider?.expected_observation_count) ||
    !nonNegativeInteger(provider?.observed_observation_count) ||
    provider?.coverage_contract_version !==
      CANONICAL_PROVIDER_COVERAGE_CONTRACT_VERSION ||
    provider?.coverage_denominator !== "candidate_provider_observations" ||
    provider?.coverage_unit !== "candidate" ||
    !validCanonicalCounterfactualReasonCodes(provider?.coverage_reason_codes)
  ) {
    reasons.push("provider_context_incomplete");
  }
  if (!Array.isArray(input.candidates)) {
    reasons.push("candidate_membership_missing");
    return uniqueSorted(reasons);
  }
  for (const candidate of input.candidates) {
    if (!exactText(candidate?.candidate_identity)) {
      reasons.push("candidate_identity_missing");
    }
    if (!exactText(candidate?.ticker, 32)) reasons.push("candidate_ticker_missing");
    if (
      candidate?.original_rank !== null &&
      (!Number.isInteger(candidate?.original_rank) ||
        (candidate.original_rank as number) < 1)
    ) {
      reasons.push("candidate_rank_invalid");
    }
    if (!finite(candidate?.original_score)) {
      reasons.push("candidate_score_invalid");
    }
    if (
      candidate?.membership_status !== "selected" &&
      candidate?.membership_status !== "rejected" &&
      candidate?.membership_status !== "overflow" &&
      candidate?.membership_status !== "under_threshold"
    ) {
      reasons.push("candidate_membership_status_invalid");
    }
    if (
      candidate?.eligibility_at_decision !== "eligible" &&
      candidate?.eligibility_at_decision !== "ineligible" &&
      candidate?.eligibility_at_decision !== "unknown"
    ) {
      reasons.push("candidate_eligibility_invalid");
    }
    if (
      candidate?.tie_break_key !== null &&
      !exactText(candidate?.tie_break_key)
    ) {
      reasons.push("candidate_tie_break_key_invalid");
    }
    if (
      !exactText(candidate?.ranking_version, 160) ||
      !exactText(candidate?.threshold_version, 160)
    ) {
      reasons.push("candidate_versions_missing");
    }
    if (
      !validCanonicalCounterfactualReasonCodes(
        candidate?.rejection_reason_codes,
      ) ||
      !validCanonicalCounterfactualReasonCodes(candidate?.data_gap_codes)
    ) {
      reasons.push("candidate_reason_codes_invalid");
    }
    if (!explicitInstant(candidate?.provider_source_timestamp)) {
      reasons.push("candidate_provider_timestamp_invalid");
    }
    if (
      !nullableExactText(candidate?.setup, 160) ||
      !nullableExactText(candidate?.context?.window, 80) ||
      !nullableExactText(candidate?.context?.regime, 160) ||
      !nullableExactText(candidate?.context?.sector, 160) ||
      !nullableExactText(candidate?.context?.strategy, 160)
    ) {
      reasons.push("candidate_context_invalid");
    }
    if (!exactText(candidate?.lineage?.scan_identity)) {
      reasons.push("candidate_scan_lineage_missing");
    }
    if (
      !nullableExactText(candidate?.lineage?.batch_identity) ||
      !nullableExactText(
        candidate?.lineage?.recommendation_decision_identity,
      ) ||
      !nullableExactText(candidate?.lineage?.snapshot_identity)
    ) {
      reasons.push("candidate_lineage_invalid");
    }
    const expectedLineage = candidate?.expected_outcome_lineage;
    if (
      expectedLineage?.lineage_version !==
        CANONICAL_EXPECTED_OUTCOME_LINEAGE_VERSION ||
      !exactText(expectedLineage?.lineage_namespace, 160) ||
      !exactText(expectedLineage?.evaluator_contract_version, 160) ||
      expectedLineage?.evaluator_version !== input.versions.evaluator_version ||
      expectedLineage?.intended_horizon_policy !==
        "primary_60m_else_30m_else_15m_v1" ||
      expectedLineage?.scan_identity !== input.scan_identity ||
      expectedLineage?.decision_identity !== input.decision_identity ||
      expectedLineage?.candidate_identity !== candidate?.candidate_identity ||
      expectedLineage?.batch_identity !== candidate?.lineage?.batch_identity ||
      expectedLineage?.recommendation_decision_identity !==
        candidate?.lineage?.recommendation_decision_identity ||
      expectedLineage?.snapshot_identity !==
        candidate?.lineage?.snapshot_identity ||
      !exactText(expectedLineage?.expected_outcome_lineage_key)
    ) {
      reasons.push("expected_outcome_lineage_invalid");
    }
    if (candidate?.outcome !== null && !validCandidateOutcome(candidate?.outcome)) {
      reasons.push("candidate_outcome_invalid");
    }
    if (
      candidate?.membership_status !== "selected" &&
      candidate?.rejection_reason_codes.length === 0
    ) {
      reasons.push("candidate_rejection_reason_missing");
    }
    if (
      candidate?.membership_status === "selected" &&
      candidate?.rejection_reason_codes.length > 0
    ) {
      reasons.push("selected_candidate_has_rejection_reason");
    }
  }
  return uniqueSorted(reasons);
}

function conflictReasons(input: {
  source: CanonicalCounterfactualOpportunitySetInput;
  candidates: CanonicalCandidateMembership[];
  candidateSetDigest: string;
}) {
  const { source, candidates, candidateSetDigest } = input;
  const reasons: string[] = [];
  const candidateIdentities = candidates.map(
    (candidate) => candidate.candidate_identity,
  );
  const canonicalIdentities = candidates.map(
    (candidate) => candidate.canonical_candidate_identity,
  );
  if (new Set(candidateIdentities).size !== candidateIdentities.length) {
    reasons.push("candidate_identity_duplicate");
  }
  if (new Set(canonicalIdentities).size !== canonicalIdentities.length) {
    reasons.push("canonical_candidate_identity_duplicate");
  }
  if (source.observed_candidate_count !== candidates.length) {
    reasons.push("observed_candidate_count_membership_mismatch");
  }
  if (source.expected_candidate_count < source.observed_candidate_count) {
    reasons.push("observed_candidate_count_exceeds_expected");
  }
  if (
    source.provider_context.observed_observation_count >
    source.provider_context.expected_observation_count
  ) {
    reasons.push("provider_observation_count_conflict");
  }
  if (
    candidates.some(
      (candidate) => candidate.lineage.scan_identity !== source.scan_identity,
    )
  ) {
    reasons.push("candidate_scan_lineage_conflict");
  }
  if (
    candidates.some(
      (candidate) =>
        candidate.ranking_version !== source.versions.ranking_version,
    )
  ) {
    reasons.push("mixed_ranking_versions");
  }
  if (
    candidates.some(
      (candidate) =>
        candidate.threshold_version !== source.versions.threshold_version,
    )
  ) {
    reasons.push("mixed_threshold_versions");
  }
  const outcomeIdentities = candidates.flatMap((candidate) =>
    candidate.outcome ? [candidate.outcome.outcome_identity] : [],
  );
  if (new Set(outcomeIdentities).size !== outcomeIdentities.length) {
    reasons.push("candidate_outcome_identity_duplicate");
  }
  if (
    candidates.some(
      (candidate) =>
        candidate.outcome !== null &&
        (candidate.outcome.evaluator_version !==
          source.versions.evaluator_version ||
          candidate.outcome.provider_contract_version !==
            source.versions.provider_contract_version),
    )
  ) {
    reasons.push("candidate_outcome_version_conflict");
  }
  if (
    candidates.some(
      (candidate) =>
        candidate.outcome !== null &&
        Date.parse(candidate.outcome.evaluated_at) <
          Date.parse(source.decision_timestamp),
    )
  ) {
    reasons.push("candidate_outcome_precedes_decision");
  }
  if (
    source.claimed_candidate_set_digest &&
    source.claimed_candidate_set_digest !== candidateSetDigest
  ) {
    reasons.push("candidate_set_digest_mismatch");
  }
  return uniqueSorted(reasons);
}

function rankGapReasons(candidates: CanonicalCandidateMembership[]) {
  const reasons: string[] = [];
  if (candidates.some((candidate) => candidate.original_rank === null)) {
    reasons.push("candidate_rank_missing");
  }
  const ranked = candidates.filter(
    (candidate): candidate is CanonicalCandidateMembership & {
      original_rank: number;
    } => candidate.original_rank !== null,
  );
  const groups = new Map<number, CanonicalCandidateMembership[]>();
  for (const candidate of ranked) {
    const group = groups.get(candidate.original_rank) ?? [];
    group.push(candidate);
    groups.set(candidate.original_rank, group);
  }
  const distinctRanks = [...groups.keys()].sort((first, second) => first - second);
  if (
    distinctRanks.some((rank, index) => rank !== index + 1)
  ) {
    reasons.push("candidate_rank_sequence_gap");
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const tieBreakKeys = group.map((candidate) => candidate.tie_break_key);
    if (
      tieBreakKeys.some((key) => !key) ||
      new Set(tieBreakKeys).size !== tieBreakKeys.length
    ) {
      reasons.push("duplicate_rank_without_explicit_tie_break");
    }
  }
  return uniqueSorted(reasons);
}

function classifyReadiness(input: {
  source: CanonicalCounterfactualOpportunitySetInput;
  candidates: CanonicalCandidateMembership[];
  conflicts: string[];
}): CanonicalCounterfactualReadiness {
  const { source, candidates, conflicts } = input;
  const reasonCodes: string[] = [...conflicts];
  let status: CanonicalCounterfactualReadinessStatus = "evaluable";

  if (conflicts.length > 0) {
    status = "conflicting";
  } else {
    const cutoff = Date.parse(source.point_in_time_cutoff);
    const decisionTimestamp = Date.parse(source.decision_timestamp);
    const pointInTimeUnsafe =
      cutoff !== decisionTimestamp ||
      Date.parse(source.provider_context.source_timestamp) > cutoff ||
      candidates.some(
        (candidate) =>
          Date.parse(candidate.provider_source_timestamp) > cutoff,
      );
    if (pointInTimeUnsafe) {
      status = "not_point_in_time_safe";
      if (cutoff !== decisionTimestamp) {
        reasonCodes.push("cutoff_not_equal_to_decision_timestamp");
      }
      if (Date.parse(source.provider_context.source_timestamp) > cutoff) {
        reasonCodes.push("provider_source_after_cutoff");
      }
      if (
        candidates.some(
          (candidate) =>
            Date.parse(candidate.provider_source_timestamp) > cutoff,
        )
      ) {
        reasonCodes.push("candidate_source_after_cutoff");
      }
    } else if (
      candidates.length === 0 ||
      source.expected_candidate_count !== source.observed_candidate_count
    ) {
      status = "incomplete_opportunity_set";
      reasonCodes.push(
        candidates.length === 0
          ? "opportunity_set_empty"
          : "candidate_count_incomplete",
      );
    } else {
      const rankReasons = rankGapReasons(candidates);
      const providerGap =
        source.provider_context.freshness !== "fresh" ||
      source.provider_context.expected_observation_count !==
          source.provider_context.observed_observation_count ||
        (candidates.length > 0 &&
          source.provider_context.expected_observation_count <= 0) ||
        candidates.some((candidate) =>
          candidate.data_gap_codes.some((code) =>
            /provider|stale|freshness|coverage/.test(code),
          ),
        ) ||
        candidates.some(
          (candidate) =>
            candidate.outcome?.coverage_status === "provider_gap" ||
            candidate.outcome?.coverage_status === "stale",
        );
      const outcomeMissing = candidates.some(
        (candidate) =>
          candidate.outcome === null ||
          candidate.outcome.r_result === null ||
          candidate.outcome.positive_outcome === null,
      );
      const nonReproducible = candidates.some(
        (candidate) =>
          candidate.outcome !== null &&
          (!candidate.outcome.outcome_evaluable ||
            !candidate.outcome.reproducible ||
            candidate.outcome.coverage_status !== "complete"),
      );

      if (rankReasons.length > 0) {
        status = "rank_gap";
        reasonCodes.push(...rankReasons);
      } else if (providerGap) {
        status = "provider_gap";
        reasonCodes.push("provider_or_freshness_coverage_gap");
      } else if (outcomeMissing) {
        status = "candidate_outcome_missing";
        reasonCodes.push("complete_candidate_outcomes_missing");
      } else if (nonReproducible) {
        status = "non_reproducible";
        reasonCodes.push("candidate_outcome_not_reproducible");
      }
    }
  }

  return {
    status,
    counterfactual_evaluation_eligible: status === "evaluable",
    reason_codes: uniqueSorted(reasonCodes),
  };
}

function opportunitySetSemanticPayload(
  opportunitySet: Omit<
    CanonicalCounterfactualOpportunitySetContract,
    "semantic_digest"
  >,
) {
  return opportunitySet;
}

export function buildCanonicalCounterfactualOpportunitySet(
  input: CanonicalCounterfactualOpportunitySetInput,
): CanonicalOpportunitySetBuildResult {
  const source = structuredClone(input);
  const validationReasons = inputValidationReasons(source);
  if (validationReasons.length > 0) {
    return {
      status: "unmappable",
      opportunity_set: null,
      reason_codes: validationReasons,
    };
  }

  const orderedInputs = [...source.candidates].sort(candidateOrder);
  const candidates: CanonicalCandidateMembership[] = orderedInputs.map(
    (candidate, index) => ({
      ...candidate,
      ticker: candidate.ticker.toUpperCase(),
      rejection_reason_codes: uniqueSorted(candidate.rejection_reason_codes),
      data_gap_codes: uniqueSorted(candidate.data_gap_codes),
      outcome: candidate.outcome
        ? {
            ...candidate.outcome,
            reason_codes: uniqueSorted(candidate.outcome.reason_codes),
          }
        : null,
      canonical_candidate_identity: canonicalCandidateIdentity({
        source_namespace: source.source_namespace,
        scan_identity: source.scan_identity,
        candidate_identity: candidate.candidate_identity,
      }),
      canonical_order: index + 1,
    }),
  );
  const candidateSetDigest = fullCandidateSetDigest(candidates);
  const semanticValidationReasons = decisionSemanticValidationReasons({
    source,
    candidates,
  });
  if (semanticValidationReasons.length > 0) {
    return {
      status: "unmappable",
      opportunity_set: null,
      reason_codes: semanticValidationReasons,
    };
  }
  const decisionSemanticBinding = buildDecisionSemanticBinding({
    source,
    candidates,
    candidateSetDigest,
  });
  const conflicts = conflictReasons({
    source,
    candidates,
    candidateSetDigest,
  });
  const readiness = classifyReadiness({ source, candidates, conflicts });
  const opportunitySetIdentity = canonicalOpportunitySetIdentity(source);
  const normalizedProviderContext = {
    ...source.provider_context,
    source_timestamp: explicitInstant(
      source.provider_context.source_timestamp,
    ) as string,
    coverage_reason_codes: uniqueSorted(
      source.provider_context.coverage_reason_codes,
    ),
  };
  const normalizedDecisionTimestamp = explicitInstant(
    source.decision_timestamp,
  ) as string;
  const normalizedCutoff = explicitInstant(
    source.point_in_time_cutoff,
  ) as string;
  const evidenceDigest = decisionEvidenceDigest({
    opportunity_set_identity: opportunitySetIdentity,
    source_namespace: source.source_namespace,
    scan_identity: source.scan_identity,
    decision_identity: source.decision_identity,
    decision_timestamp: normalizedDecisionTimestamp,
    point_in_time_cutoff: normalizedCutoff,
    versions: source.versions,
    full_candidate_set_digest: candidateSetDigest,
    expected_candidate_count: source.expected_candidate_count,
    observed_candidate_count: source.observed_candidate_count,
    provider_context: normalizedProviderContext,
    pre_truncation_capture_evidence_digest:
      source.pre_truncation_capture_evidence_digest,
    decision_semantic_binding_digest: decisionSemanticBinding.semantic_digest,
  });
  const payload: Omit<
    CanonicalCounterfactualOpportunitySetContract,
    "semantic_digest"
  > = {
    contract_version:
      CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION,
    opportunity_set_identity: opportunitySetIdentity,
    source_namespace: source.source_namespace,
    scan_identity: source.scan_identity,
    decision_identity: source.decision_identity,
    decision_timestamp: normalizedDecisionTimestamp,
    point_in_time_cutoff: normalizedCutoff,
    versions: source.versions,
    full_candidate_set_digest: candidateSetDigest,
    decision_evidence_digest: evidenceDigest,
    decision_semantic_binding: decisionSemanticBinding,
    expected_candidate_count: source.expected_candidate_count,
    observed_candidate_count: source.observed_candidate_count,
    provider_context: normalizedProviderContext,
    pre_truncation_capture_evidence_digest:
      source.pre_truncation_capture_evidence_digest,
    candidates,
    readiness,
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    status: "built",
    opportunity_set: {
      ...payload,
      semantic_digest: canonicalCounterfactualSemanticDigest(
        opportunitySetSemanticPayload(payload),
      ),
    },
    reason_codes: [],
  };
}

function rebuildInputFromOpportunitySet(
  opportunitySet: CanonicalCounterfactualOpportunitySetContract,
): CanonicalCounterfactualOpportunitySetInput {
  return {
    source_namespace: opportunitySet.source_namespace,
    scan_identity: opportunitySet.scan_identity,
    decision_identity: opportunitySet.decision_identity,
    decision_timestamp: opportunitySet.decision_timestamp,
    point_in_time_cutoff: opportunitySet.point_in_time_cutoff,
    versions: structuredClone(opportunitySet.versions),
    expected_candidate_count: opportunitySet.expected_candidate_count,
    observed_candidate_count: opportunitySet.observed_candidate_count,
    provider_context: structuredClone(opportunitySet.provider_context),
    decision_semantics: {
      decision_disposition:
        opportunitySet.decision_semantic_binding.decision_disposition,
      decision_lineage_nodes: structuredClone(
        opportunitySet.decision_semantic_binding.decision_lineage_nodes,
      ),
      no_trade_semantics: opportunitySet.decision_semantic_binding
        .no_trade_semantics
        ? structuredClone(
            opportunitySet.decision_semantic_binding.no_trade_semantics,
          )
        : null,
    },
    pre_truncation_capture_evidence_digest:
      opportunitySet.pre_truncation_capture_evidence_digest,
    candidates: opportunitySet.candidates.map((candidate) => ({
      candidate_identity: candidate.candidate_identity,
      ticker: candidate.ticker,
      original_rank: candidate.original_rank,
      original_score: candidate.original_score,
      tie_break_key: candidate.tie_break_key,
      setup: candidate.setup,
      context: structuredClone(candidate.context),
      membership_status: candidate.membership_status,
      rejection_reason_codes: [...candidate.rejection_reason_codes],
      threshold_version: candidate.threshold_version,
      ranking_version: candidate.ranking_version,
      eligibility_at_decision: candidate.eligibility_at_decision,
      data_gap_codes: [...candidate.data_gap_codes],
      provider_source_timestamp: candidate.provider_source_timestamp,
      lineage: structuredClone(candidate.lineage),
      expected_outcome_lineage: structuredClone(
        candidate.expected_outcome_lineage,
      ),
      outcome: candidate.outcome ? structuredClone(candidate.outcome) : null,
    })),
    claimed_candidate_set_digest: opportunitySet.full_candidate_set_digest,
  };
}

export function verifyCanonicalCounterfactualOpportunitySet(
  opportunitySet: CanonicalCounterfactualOpportunitySetContract,
) {
  try {
    const { semantic_digest: semanticDigest, ...payload } = opportunitySet;
    const expectedIdentity = canonicalOpportunitySetIdentity(opportunitySet);
    const expectedCandidateDigest = fullCandidateSetDigest(
      opportunitySet.candidates,
    );
    const rebuiltInput = rebuildInputFromOpportunitySet(opportunitySet);
    const expectedDecisionSemanticBinding = buildDecisionSemanticBinding({
      source: rebuiltInput,
      candidates: opportunitySet.candidates,
      candidateSetDigest: expectedCandidateDigest,
    });
    const expectedDecisionEvidenceDigest = decisionEvidenceDigest({
      opportunity_set_identity: opportunitySet.opportunity_set_identity,
      source_namespace: opportunitySet.source_namespace,
      scan_identity: opportunitySet.scan_identity,
      decision_identity: opportunitySet.decision_identity,
      decision_timestamp: opportunitySet.decision_timestamp,
      point_in_time_cutoff: opportunitySet.point_in_time_cutoff,
      versions: opportunitySet.versions,
      full_candidate_set_digest: opportunitySet.full_candidate_set_digest,
      expected_candidate_count: opportunitySet.expected_candidate_count,
      observed_candidate_count: opportunitySet.observed_candidate_count,
      provider_context: opportunitySet.provider_context,
      pre_truncation_capture_evidence_digest:
        opportunitySet.pre_truncation_capture_evidence_digest,
      decision_semantic_binding_digest:
        expectedDecisionSemanticBinding.semantic_digest,
    });
    const rebuilt = buildCanonicalCounterfactualOpportunitySet(
      rebuiltInput,
    );
    const reasons = [
      ...(opportunitySet.contract_version !==
      CANONICAL_COUNTERFACTUAL_OPPORTUNITY_SET_CONTRACT_VERSION
        ? ["opportunity_set_contract_version_invalid"]
        : []),
      ...(opportunitySet.semantic_digest_algorithm !==
      "sha256_canonical_json_v1"
        ? ["opportunity_set_digest_algorithm_invalid"]
        : []),
      ...(opportunitySet.opportunity_set_identity !== expectedIdentity
        ? ["opportunity_set_identity_invalid"]
        : []),
      ...(opportunitySet.full_candidate_set_digest !== expectedCandidateDigest
        ? ["candidate_set_digest_invalid"]
        : []),
      ...(opportunitySet.decision_semantic_binding.binding_version !==
        CANONICAL_DECISION_SEMANTIC_BINDING_VERSION ||
      opportunitySet.decision_semantic_binding.semantic_digest_algorithm !==
        "sha256_canonical_json_v1"
        ? ["decision_semantic_binding_version_invalid"]
        : []),
      ...(canonicalCounterfactualSemanticDigest(
        Object.fromEntries(
          Object.entries(opportunitySet.decision_semantic_binding).filter(
            ([key]) => key !== "semantic_digest",
          ),
        ),
      ) !== opportunitySet.decision_semantic_binding.semantic_digest ||
      opportunitySet.decision_semantic_binding.semantic_digest !==
        expectedDecisionSemanticBinding.semantic_digest
        ? ["decision_semantic_binding_invalid"]
        : []),
      ...(!fullShaPattern.test(opportunitySet.full_candidate_set_digest) ||
      !fullShaPattern.test(opportunitySet.decision_evidence_digest) ||
      !fullShaPattern.test(
        opportunitySet.decision_semantic_binding.semantic_digest,
      ) ||
      !fullShaPattern.test(
        opportunitySet.decision_semantic_binding.lineage_graph_digest,
      ) ||
      !fullShaPattern.test(
        opportunitySet.decision_semantic_binding.version_bundle_digest,
      ) ||
      !fullShaPattern.test(semanticDigest)
        ? ["opportunity_set_digest_format_invalid"]
        : []),
      ...(opportunitySet.decision_evidence_digest !==
      expectedDecisionEvidenceDigest
        ? ["decision_evidence_digest_invalid"]
        : []),
      ...(rebuilt.status !== "built" ||
      rebuilt.opportunity_set.semantic_digest !== semanticDigest
        ? ["opportunity_set_derived_contract_mismatch"]
        : []),
      ...(canonicalCounterfactualSemanticDigest(
        opportunitySetSemanticPayload(payload),
      ) !== semanticDigest
        ? ["opportunity_set_semantic_digest_invalid"]
        : []),
    ];
    return {
      valid: reasons.length === 0,
      reason_codes: uniqueSorted(reasons),
    };
  } catch {
    return {
      valid: false,
      reason_codes: ["opportunity_set_verification_failed"],
    };
  }
}

export function compareCanonicalOpportunitySetIdentityBinding(
  first: CanonicalCounterfactualOpportunitySetContract,
  second: CanonicalCounterfactualOpportunitySetContract,
): CanonicalOpportunitySetIdentityConflict {
  if (first.opportunity_set_identity !== second.opportunity_set_identity) {
    return { status: "different_identity", reason_codes: [] };
  }
  if (
    first.full_candidate_set_digest !== second.full_candidate_set_digest ||
    first.decision_evidence_digest !== second.decision_evidence_digest
  ) {
    return {
      status: "conflicting",
      reason_codes: ["same_opportunity_set_identity_different_semantics"],
    };
  }
  return { status: "same_semantics", reason_codes: [] };
}

function decisionSemanticPayload(
  decision: Omit<CanonicalCounterfactualDecision, "semantic_digest">,
) {
  return decision;
}

function buildDecisionBase(input: {
  sourceNamespace: string;
  producerDecisionId: string;
  decisionTimestamp: string;
  opportunitySet: CanonicalCounterfactualOpportunitySetContract;
  decisionReasonCode: string;
  decisionReasonDetail: string | null;
  decisionSource: string;
}) {
  const identity = buildCanonicalRecommendationIdentity({
    source_namespace: input.sourceNamespace,
    decision_id: input.producerDecisionId,
    decided_at: input.decisionTimestamp,
  });
  const reasons: string[] = [];
  if (!identity.ok) reasons.push(...identity.errors);
  if (
    !reasonCodePattern.test(input.decisionReasonCode) ||
    !validCanonicalCounterfactualReasonCodes([input.decisionReasonCode])
  ) {
    reasons.push("decision_reason_code_invalid");
  }
  if (!exactText(input.decisionSource, 160)) {
    reasons.push("decision_source_missing");
  }
  if (
    input.decisionReasonDetail !== null &&
    !exactText(input.decisionReasonDetail, 500)
  ) {
    reasons.push("decision_reason_detail_invalid");
  }
  const setVerification = verifyCanonicalCounterfactualOpportunitySet(
    input.opportunitySet,
  );
  if (!setVerification.valid) reasons.push(...setVerification.reason_codes);
  if (
    input.sourceNamespace !== input.opportunitySet.source_namespace ||
    explicitInstant(input.decisionTimestamp) !==
      input.opportunitySet.decision_timestamp
  ) {
    reasons.push("decision_opportunity_set_lineage_conflict");
  }
  return {
    identity: identity.ok ? identity.value : null,
    reasons: uniqueSorted(reasons),
  };
}

export function buildCanonicalNoTradeDecision(input: {
  explicit_no_trade_decision: boolean;
  source_namespace: string;
  producer_decision_id: string;
  decision_timestamp: string;
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  decision_reason_code: string;
  decision_reason_detail: string | null;
  decision_source: string;
}): CanonicalCounterfactualDecisionBuildResult {
  if (input.explicit_no_trade_decision !== true) {
    return {
      status: "unmappable",
      decision: null,
      reason_codes: ["explicit_no_trade_decision_missing"],
    };
  }
  const base = buildDecisionBase({
    sourceNamespace: input.source_namespace,
    producerDecisionId: input.producer_decision_id,
    decisionTimestamp: input.decision_timestamp,
    opportunitySet: input.opportunity_set,
    decisionReasonCode: input.decision_reason_code,
    decisionReasonDetail: input.decision_reason_detail,
    decisionSource: input.decision_source,
  });
  if (
    input.producer_decision_id !==
    input.opportunity_set.decision_identity
  ) {
    base.reasons.push("no_trade_decision_identity_mismatch");
  }
  const boundNoTrade =
    input.opportunity_set.decision_semantic_binding.no_trade_semantics;
  if (
    input.opportunity_set.decision_semantic_binding.decision_disposition !==
      "explicit_no_trade" ||
    !boundNoTrade ||
    boundNoTrade.producer_decision_id !== input.producer_decision_id ||
    boundNoTrade.decision_timestamp !== input.decision_timestamp ||
    boundNoTrade.decision_reason_code !== input.decision_reason_code ||
    boundNoTrade.decision_reason_detail !== input.decision_reason_detail ||
    boundNoTrade.decision_source !== input.decision_source
  ) {
    base.reasons.push("no_trade_semantic_binding_mismatch");
  }
  if (base.reasons.length > 0 || !base.identity) {
    return {
      status: "conflicting",
      decision: null,
      reason_codes: uniqueSorted(base.reasons),
    };
  }
  const payload: Omit<CanonicalNoTradeDecision, "semantic_digest"> = {
    contract_version: CANONICAL_COUNTERFACTUAL_DECISION_CONTRACT_VERSION,
    decision_kind: "no_trade",
    explicit_no_trade_decision: true,
    source_namespace: input.source_namespace,
    producer_decision_id: input.producer_decision_id,
    decision_timestamp: base.identity.decided_at,
    canonical_identity: base.identity.value,
    opportunity_set_identity: input.opportunity_set.opportunity_set_identity,
    opportunity_set_digest: input.opportunity_set.semantic_digest,
    decision_reason_code: input.decision_reason_code,
    decision_reason_detail: input.decision_reason_detail,
    decision_source: input.decision_source,
    counterfactual_readiness: structuredClone(input.opportunity_set.readiness),
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    status: "built",
    decision: {
      ...payload,
      semantic_digest: canonicalCounterfactualSemanticDigest(
        decisionSemanticPayload(payload),
      ),
    },
    reason_codes: [],
  };
}

export function buildCanonicalRejectedCandidateDecision(input: {
  source_namespace: string;
  producer_decision_id: string;
  decision_timestamp: string;
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  rejected_candidate_identity: string;
  decision_reason_code: string;
  decision_reason_detail: string | null;
  decision_source: string;
}): CanonicalCounterfactualDecisionBuildResult {
  const candidate = input.opportunity_set.candidates.find(
    (item) =>
      item.canonical_candidate_identity ===
      input.rejected_candidate_identity,
  );
  const terminalBinding =
    input.opportunity_set.decision_semantic_binding.terminal_dispositions.find(
      (item) => item.candidate_identity === candidate?.candidate_identity,
    );
  const base = buildDecisionBase({
    sourceNamespace: input.source_namespace,
    producerDecisionId: input.producer_decision_id,
    decisionTimestamp: input.decision_timestamp,
    opportunitySet: input.opportunity_set,
    decisionReasonCode: input.decision_reason_code,
    decisionReasonDetail: input.decision_reason_detail,
    decisionSource: input.decision_source,
  });
  const reasons = [...base.reasons];
  if (!candidate) reasons.push("rejected_candidate_not_in_opportunity_set");
  if (candidate?.membership_status === "selected") {
    reasons.push("selected_candidate_cannot_be_rejected_decision");
  }
  if (
    input.opportunity_set.decision_semantic_binding.decision_disposition ===
      "explicit_no_trade" ||
    !terminalBinding ||
    terminalBinding.terminal_disposition ===
      "explicit_no_trade_candidate" ||
    terminalBinding.terminal_disposition === "published_recommendation" ||
    terminalBinding.terminal_disposition ===
      "deterministic_fallback_recommendation"
  ) {
    reasons.push("rejected_candidate_terminal_disposition_mismatch");
  }
  if (
    candidate?.lineage.recommendation_decision_identity !==
    input.producer_decision_id
  ) {
    reasons.push("rejected_candidate_decision_lineage_mismatch");
  }
  if (reasons.length > 0 || !base.identity || !candidate) {
    return {
      status: "conflicting",
      decision: null,
      reason_codes: uniqueSorted(reasons),
    };
  }
  const payload: Omit<
    CanonicalRejectedCandidateDecision,
    "semantic_digest"
  > = {
    contract_version: CANONICAL_COUNTERFACTUAL_DECISION_CONTRACT_VERSION,
    decision_kind: "rejected_candidate",
    rejected_candidate_identity: candidate.canonical_candidate_identity,
    source_namespace: input.source_namespace,
    producer_decision_id: input.producer_decision_id,
    decision_timestamp: base.identity.decided_at,
    canonical_identity: base.identity.value,
    opportunity_set_identity: input.opportunity_set.opportunity_set_identity,
    opportunity_set_digest: input.opportunity_set.semantic_digest,
    decision_reason_code: input.decision_reason_code,
    decision_reason_detail: input.decision_reason_detail,
    decision_source: input.decision_source,
    counterfactual_readiness: structuredClone(input.opportunity_set.readiness),
    semantic_digest_algorithm: "sha256_canonical_json_v1",
  };
  return {
    status: "built",
    decision: {
      ...payload,
      semantic_digest: canonicalCounterfactualSemanticDigest(
        decisionSemanticPayload(payload),
      ),
    },
    reason_codes: [],
  };
}

export function verifyCanonicalCounterfactualDecision(
  decision: CanonicalCounterfactualDecision,
  opportunitySet: CanonicalCounterfactualOpportunitySetContract,
) {
  try {
    const { semantic_digest: semanticDigest, ...payload } = decision;
    const identity = buildCanonicalRecommendationIdentity({
      source_namespace: decision.source_namespace,
      decision_id: decision.producer_decision_id,
      decided_at: decision.decision_timestamp,
    });
    const rejectedCandidate =
      decision.decision_kind === "rejected_candidate"
        ? opportunitySet.candidates.find(
            (candidate) =>
              candidate.canonical_candidate_identity ===
              decision.rejected_candidate_identity,
          )
        : null;
    const rejectedTerminalBinding =
      decision.decision_kind === "rejected_candidate"
        ? opportunitySet.decision_semantic_binding.terminal_dispositions.find(
            (item) =>
              item.candidate_identity ===
              rejectedCandidate?.candidate_identity,
          )
        : null;
    const boundNoTrade =
      opportunitySet.decision_semantic_binding.no_trade_semantics;
    const reasons = [
      ...(decision.contract_version !==
      CANONICAL_COUNTERFACTUAL_DECISION_CONTRACT_VERSION
        ? ["counterfactual_decision_contract_version_invalid"]
        : []),
      ...(decision.semantic_digest_algorithm !== "sha256_canonical_json_v1"
        ? ["counterfactual_decision_digest_algorithm_invalid"]
        : []),
      ...(!fullShaPattern.test(semanticDigest)
        ? ["counterfactual_decision_digest_format_invalid"]
        : []),
      ...(!identity.ok || identity.value.value !== decision.canonical_identity
        ? ["counterfactual_decision_identity_invalid"]
        : []),
      ...(decision.source_namespace !== opportunitySet.source_namespace ||
      decision.decision_timestamp !== opportunitySet.decision_timestamp
        ? ["counterfactual_decision_lineage_invalid"]
        : []),
      ...(decision.opportunity_set_identity !==
        opportunitySet.opportunity_set_identity ||
      decision.opportunity_set_digest !== opportunitySet.semantic_digest
        ? ["counterfactual_decision_opportunity_set_mismatch"]
        : []),
      ...(!reasonCodePattern.test(decision.decision_reason_code) ||
      !validCanonicalCounterfactualReasonCodes([
        decision.decision_reason_code,
      ]) ||
      !exactText(decision.decision_source, 160)
        ? ["counterfactual_decision_reason_invalid"]
        : []),
      ...(canonicalCounterfactualSemanticDigest(
        decision.counterfactual_readiness,
      ) !== canonicalCounterfactualSemanticDigest(opportunitySet.readiness)
        ? ["counterfactual_decision_readiness_mismatch"]
        : []),
      ...(decision.decision_kind === "no_trade" &&
      (decision.explicit_no_trade_decision !== true ||
        decision.producer_decision_id !== opportunitySet.decision_identity ||
        opportunitySet.decision_semantic_binding.decision_disposition !==
          "explicit_no_trade" ||
        !boundNoTrade ||
        boundNoTrade.producer_decision_id !==
          decision.producer_decision_id ||
        boundNoTrade.decision_timestamp !== decision.decision_timestamp ||
        boundNoTrade.decision_reason_code !==
          decision.decision_reason_code ||
        boundNoTrade.decision_reason_detail !==
          decision.decision_reason_detail ||
        boundNoTrade.decision_source !== decision.decision_source)
        ? ["explicit_no_trade_lineage_invalid"]
        : []),
      ...(decision.decision_kind === "rejected_candidate" &&
      (!rejectedCandidate ||
        rejectedCandidate.membership_status === "selected" ||
        opportunitySet.decision_semantic_binding.decision_disposition ===
          "explicit_no_trade" ||
        !rejectedTerminalBinding ||
        rejectedTerminalBinding.terminal_disposition ===
          "explicit_no_trade_candidate" ||
        rejectedTerminalBinding.terminal_disposition ===
          "published_recommendation" ||
        rejectedTerminalBinding.terminal_disposition ===
          "deterministic_fallback_recommendation" ||
        rejectedCandidate.lineage.recommendation_decision_identity !==
          decision.producer_decision_id)
        ? ["rejected_candidate_lineage_invalid"]
        : []),
      ...(canonicalCounterfactualSemanticDigest(
        decisionSemanticPayload(payload),
      ) !== semanticDigest
        ? ["counterfactual_decision_semantic_digest_invalid"]
        : []),
    ];
    return {
      valid: reasons.length === 0,
      reason_codes: uniqueSorted(reasons),
    };
  } catch {
    return {
      valid: false,
      reason_codes: ["counterfactual_decision_verification_failed"],
    };
  }
}

function projectionCohort(
  decision: CanonicalCounterfactualDecision,
): "no_trade_counterfactual" | "rejected_candidate_counterfactual" {
  return decision.decision_kind === "no_trade"
    ? "no_trade_counterfactual"
    : "rejected_candidate_counterfactual";
}

function projectionSampleType(
  decision: CanonicalCounterfactualDecision,
): CanonicalSampleType {
  return decision.decision_kind === "no_trade"
    ? "no_trade"
    : "rejected_candidate";
}

function canonicalEvaluationVersions(
  versions: CanonicalOpportunitySetVersions,
): CanonicalEvaluationVersions {
  return {
    engine_version: versions.engine_version,
    scoring_version: versions.scoring_version,
    ranking_version: versions.ranking_version,
    setup_taxonomy_version: versions.setup_taxonomy_version,
    confidence_contract_version: versions.confidence_contract_version,
    evaluator_version: versions.evaluator_version,
    provider_contract_version: versions.provider_contract_version,
    git_commit: versions.git_commit,
    build_identity: versions.build_identity,
  };
}

export function projectCanonicalCounterfactualOpportunitySet(input: {
  opportunity_set: CanonicalCounterfactualOpportunitySetContract;
  decision: CanonicalCounterfactualDecision;
}): CanonicalCounterfactualProjectionResult {
  const setVerification = verifyCanonicalCounterfactualOpportunitySet(
    input.opportunity_set,
  );
  const decisionVerification = verifyCanonicalCounterfactualDecision(
    input.decision,
    input.opportunity_set,
  );
  const conflicts = uniqueSorted([
    ...setVerification.reason_codes,
    ...decisionVerification.reason_codes,
  ]);
  if (conflicts.length > 0) {
    return { status: "conflicting", projection: null, reason_codes: conflicts };
  }
  if (!input.opportunity_set.readiness.counterfactual_evaluation_eligible) {
    return {
      status: "not_evaluable",
      projection: null,
      reason_codes: input.opportunity_set.readiness.reason_codes,
    };
  }

  const canonicalDecision = buildCanonicalRecommendationDecision({
    identity: {
      source_namespace: input.decision.source_namespace,
      decision_id: input.decision.producer_decision_id,
      decided_at: input.decision.decision_timestamp,
    },
    sample_type: projectionSampleType(input.decision),
    versions: canonicalEvaluationVersions(input.opportunity_set.versions),
    confidence: {
      numeric_confidence: null,
      numeric_confidence_scale: "probability_0_1",
      confidence_label: null,
    },
  });
  if (!canonicalDecision.ok) {
    return {
      status: "conflicting",
      projection: null,
      reason_codes: canonicalDecision.errors,
    };
  }

  const cohort = projectionCohort(input.decision);
  const rankingCandidates = input.opportunity_set.candidates.map(
    (candidate) => ({
      canonical_identity: candidate.canonical_candidate_identity,
      ticker: candidate.ticker,
      rank: candidate.canonical_order,
      selection_status:
        candidate.membership_status === "selected"
          ? ("selected" as const)
          : candidate.membership_status === "rejected"
            ? ("rejected" as const)
            : ("not_selected" as const),
      outcome_evaluable: candidate.outcome?.outcome_evaluable === true,
      positive_outcome: candidate.outcome?.positive_outcome ?? null,
    }),
  );
  const counterfactualCandidates = input.opportunity_set.candidates.map(
    (candidate) => ({
      canonical_identity: candidate.canonical_candidate_identity,
      ticker: candidate.ticker,
      outcome_evaluable: candidate.outcome?.outcome_evaluable === true,
      r_result: candidate.outcome?.r_result ?? null,
    }),
  );
  const decisionDay = input.opportunity_set.decision_timestamp.slice(0, 10);
  return {
    status: "mapped",
    projection: {
      projection_version:
        CANONICAL_COUNTERFACTUAL_METRICS_PROJECTION_VERSION,
      canonical_evaluation_decision: canonicalDecision.value,
      ranking_opportunity_set: {
        opportunity_set_id: input.opportunity_set.opportunity_set_identity,
        cohort,
        decision_day: decisionDay,
        ranking_version: input.opportunity_set.versions.ranking_version,
        complete: true,
        candidates: rankingCandidates,
      },
      counterfactual_opportunity_set: {
        opportunity_set_id: input.opportunity_set.opportunity_set_identity,
        decision_canonical_identity: canonicalDecision.value.identity.value,
        cohort,
        decision_day: decisionDay,
        complete: true,
        candidates: counterfactualCandidates,
      },
    },
    reason_codes: [],
  };
}
