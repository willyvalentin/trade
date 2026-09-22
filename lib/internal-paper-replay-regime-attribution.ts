import { createHash } from "node:crypto";

import {
  buildInternalPaperReplayCharterEvidence,
  evaluateInternalPaperReplayCharterScorecard,
  INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION,
  type InternalPaperReplayCharterDecisionEvidence,
  type InternalPaperReplayCharterScorecardResult,
} from "@/lib/internal-paper-replay-charter-scorecard";
import {
  runInternalPaperReplayExperiment,
  type InternalPaperReplayExperimentInput,
} from "@/lib/internal-paper-replay-experiment";
import {
  MARKET_CONTEXT_SHADOW_REPLAY_VERSION,
  runMarketContextShadowReplayV1,
  type MarketContextShadowReplayV1Input,
} from "@/lib/market-context-intelligence-lab/shadow-replay-v1";
import type { RecommendationEvaluationCharter } from "@/lib/recommendation-evaluation-charter";
import type { RecommendationLearningBaselineFreeze } from "@/lib/recommendation-learning-baseline-freeze-store";

export const INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTION_VERSION =
  "internal_paper_replay_regime_attribution_v1" as const;
export const INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTED_SCORECARD_VERSION =
  "internal_paper_replay_regime_attributed_scorecard_v1" as const;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

type RegimeBaseDecisionEvidence = Omit<
  InternalPaperReplayCharterDecisionEvidence,
  "regime"
>;

export type InternalPaperReplayRegimeAttributionEvidence = Readonly<{
  evaluated_at: string;
  bootstrap_seed: string;
  decisions: readonly RegimeBaseDecisionEvidence[];
}>;

export type InternalPaperReplayRegimeAttributionBinding = Readonly<{
  scan_run_fingerprint: string;
  trading_date: string;
  ticker: string;
  decision_timestamp: string;
  classification: string;
  measurable: boolean;
  context_version: string;
  threshold_version: string;
  context_evidence_digest: string;
}>;

export type InternalPaperReplayRegimeAttributedScorecardResult = Readonly<{
  result_version: typeof INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTED_SCORECARD_VERSION;
  attribution_version: typeof INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTION_VERSION;
  status: "completed" | "blocked";
  scientific_disposition: "research_context_binding_not_strategy_accepted";
  reason_codes: string[];
  experiment_id: string | null;
  context_replay_id: string | null;
  context_dataset_digest: string | null;
  context_replay_evidence_digest: string | null;
  context_source_kind:
    | "synthetic_repository_fixture"
    | "offline_point_in_time"
    | null;
  bindings: InternalPaperReplayRegimeAttributionBinding[];
  measurable_regime_count: number;
  unavailable_or_conflicting_regime_count: number;
  scorecard: InternalPaperReplayCharterScorecardResult | null;
  evidence_limits: readonly [
    "context_replay_is_shadow_only",
    "historical_source_rights_not_independently_verified",
    "no_forward_shadow_acceptance",
    "no_automatic_policy_promotion",
  ];
  authority: Authority;
  result_digest: string;
}>;

const AUTHORITY = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
} as const;

const EVIDENCE_LIMITS = [
  "context_replay_is_shadow_only",
  "historical_source_rights_not_independently_verified",
  "no_forward_shadow_acceptance",
  "no_automatic_policy_promotion",
] as const;

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

function digest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function terminal(
  value: Omit<
    InternalPaperReplayRegimeAttributedScorecardResult,
    "result_digest"
  >,
): InternalPaperReplayRegimeAttributedScorecardResult {
  return { ...value, result_digest: digest(value) };
}

export function verifyInternalPaperReplayRegimeAttributedScorecardDigest(
  value: InternalPaperReplayRegimeAttributedScorecardResult,
) {
  const { result_digest: resultDigest, ...payload } = value;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

function safeExperimentId(experiment: InternalPaperReplayExperimentInput) {
  return typeof experiment.manifest.experiment_id === "string" &&
    experiment.manifest.experiment_id.trim()
    ? experiment.manifest.experiment_id
    : null;
}

function blocked({
  experiment,
  reasons,
  replayId = null,
  datasetDigest = null,
  replayEvidenceDigest = null,
  sourceKind = null,
  bindings = [],
  scorecard = null,
}: {
  experiment: InternalPaperReplayExperimentInput;
  reasons: string[];
  replayId?: string | null;
  datasetDigest?: string | null;
  replayEvidenceDigest?: string | null;
  sourceKind?:
    | "synthetic_repository_fixture"
    | "offline_point_in_time"
    | null;
  bindings?: InternalPaperReplayRegimeAttributionBinding[];
  scorecard?: InternalPaperReplayCharterScorecardResult | null;
}) {
  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTED_SCORECARD_VERSION,
    attribution_version: INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTION_VERSION,
    status: "blocked",
    scientific_disposition: "research_context_binding_not_strategy_accepted",
    reason_codes: uniqueSorted(reasons),
    experiment_id: safeExperimentId(experiment),
    context_replay_id: replayId,
    context_dataset_digest: datasetDigest,
    context_replay_evidence_digest: replayEvidenceDigest,
    context_source_kind: sourceKind,
    bindings,
    measurable_regime_count: bindings.filter((item) => item.measurable).length,
    unavailable_or_conflicting_regime_count: bindings.filter(
      (item) => !item.measurable,
    ).length,
    scorecard,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}

function exactBaseEvidence(
  evidence: InternalPaperReplayRegimeAttributionEvidence,
  expectedFingerprints: Set<string>,
) {
  if (
    !Array.isArray(evidence.decisions) ||
    evidence.decisions.length !== expectedFingerprints.size ||
    new Set(evidence.decisions.map((item) => item.scan_run_fingerprint)).size !==
      evidence.decisions.length ||
    evidence.decisions.some(
      (item) => !expectedFingerprints.has(item.scan_run_fingerprint),
    )
  ) {
    return false;
  }
  return true;
}

function measurable(classification: string) {
  return classification !== "insufficient_data" &&
    classification !== "conflicting_context";
}

/**
 * Binds the existing point-in-time market-context shadow replay to the exact
 * F.1 paired population before F.2 may consume a regime label. It reruns both
 * deterministic contracts and never accepts a caller-supplied classification.
 */
export function evaluateInternalPaperReplayRegimeAttributedScorecard({
  experiment,
  baseline,
  charter,
  evidence,
  contextReplay,
}: {
  experiment: InternalPaperReplayExperimentInput;
  baseline: RecommendationLearningBaselineFreeze;
  charter: RecommendationEvaluationCharter;
  evidence: InternalPaperReplayRegimeAttributionEvidence;
  contextReplay: MarketContextShadowReplayV1Input;
}): InternalPaperReplayRegimeAttributedScorecardResult {
  const experimentResult = runInternalPaperReplayExperiment(experiment);
  if (experimentResult.status !== "completed") {
    return blocked({
      experiment,
      reasons: ["frozen_experiment_not_completed"],
    });
  }

  let contextResult;
  try {
    contextResult = runMarketContextShadowReplayV1(contextReplay);
  } catch {
    return blocked({
      experiment,
      reasons: ["market_context_shadow_replay_invalid"],
    });
  }
  const identity = contextResult.replay_identity;
  const replayEvidenceDigest =
    contextResult.reproducibility.replay_evidence_digest;
  const identityFields = {
    replayId: identity.replay_id,
    datasetDigest: identity.dataset_digest,
    replayEvidenceDigest,
    sourceKind: identity.dataset_source_kind,
  } as const;
  if (
    contextResult.replay_contract_version !==
      MARKET_CONTEXT_SHADOW_REPLAY_VERSION ||
    contextResult.shadow_only !== true ||
    contextResult.live_ranking_effect !== false ||
    contextResult.canonical_binding_ready !== false ||
    !SHA256_PATTERN.test(identity.dataset_digest) ||
    !SHA256_PATTERN.test(replayEvidenceDigest)
  ) {
    return blocked({
      experiment,
      reasons: ["market_context_shadow_replay_boundary_invalid"],
      ...identityFields,
    });
  }

  const expected = experiment.manifest.sessions;
  if (contextResult.decisions.length !== expected.length) {
    return blocked({
      experiment,
      reasons: ["regime_decision_population_incomplete_or_extra"],
      ...identityFields,
    });
  }
  const contextByDecision = new Map(
    contextResult.decisions.map((item) => [
      item.replay_identity.decision_id,
      item,
    ]),
  );
  if (contextByDecision.size !== contextResult.decisions.length) {
    return blocked({
      experiment,
      reasons: ["duplicate_regime_decision_identity"],
      ...identityFields,
    });
  }

  const bindings: InternalPaperReplayRegimeAttributionBinding[] = [];
  for (const [index, sessionBinding] of expected.entries()) {
    const baselineSession = experiment.baseline.sessions[index];
    const candidateSession = experiment.candidate.sessions[index];
    if (
      !baselineSession ||
      !candidateSession ||
      baselineSession.decisions.length !== 1 ||
      candidateSession.decisions.length !== 1
    ) {
      return blocked({
        experiment,
        reasons: ["regime_attribution_requires_one_decision_per_session"],
        bindings,
        ...identityFields,
      });
    }
    const baselineDecision = baselineSession.decisions[0]!.decision;
    const candidateDecision = candidateSession.decisions[0]!.decision;
    const fingerprint = baselineDecision.scan_run_fingerprint;
    const context = contextByDecision.get(fingerprint);
    const baselineCandidate = baselineDecision.candidates[0];
    const candidateCandidate = candidateDecision.candidates[0];
    if (
      !context ||
      baselineDecision.scan_run_fingerprint !==
        candidateDecision.scan_run_fingerprint ||
      baselineDecision.decision_timestamp !==
        candidateDecision.decision_timestamp ||
      baselineDecision.candidates.length !== 1 ||
      candidateDecision.candidates.length !== 1 ||
      !baselineCandidate ||
      !candidateCandidate ||
      baselineCandidate.candidate_id !== candidateCandidate.candidate_id ||
      baselineCandidate.ticker.toUpperCase() !==
        candidateCandidate.ticker.toUpperCase() ||
      context.replay_identity.ticker.toUpperCase() !==
        baselineCandidate.ticker.toUpperCase() ||
      context.replay_identity.session_label !== sessionBinding.trading_date ||
      context.decision_instant !== baselineDecision.decision_timestamp ||
      context.replay_identity.dataset_digest !== identity.dataset_digest ||
      !SHA256_PATTERN.test(context.evidence_digest)
    ) {
      return blocked({
        experiment,
        reasons: ["regime_decision_binding_mismatch"],
        bindings,
        ...identityFields,
      });
    }
    bindings.push({
      scan_run_fingerprint: fingerprint,
      trading_date: sessionBinding.trading_date,
      ticker: baselineCandidate.ticker.toUpperCase(),
      decision_timestamp: baselineDecision.decision_timestamp,
      classification: context.v2_evaluation.classification,
      measurable: measurable(context.v2_evaluation.classification),
      context_version: context.v2_evaluation.context_version,
      threshold_version: context.v2_evaluation.threshold_version,
      context_evidence_digest: context.evidence_digest,
    });
  }

  const expectedFingerprints = new Set(
    bindings.map((item) => item.scan_run_fingerprint),
  );
  if (bindings.some((item) => !item.measurable)) {
    return blocked({
      experiment,
      reasons: ["regime_attribution_incomplete"],
      bindings,
      ...identityFields,
    });
  }
  if (
    expectedFingerprints.size !== bindings.length ||
    !exactBaseEvidence(evidence, expectedFingerprints)
  ) {
    return blocked({
      experiment,
      reasons: ["charter_base_evidence_population_incomplete_or_extra"],
      bindings,
      ...identityFields,
    });
  }

  const baseByFingerprint = new Map(
    evidence.decisions.map((item) => [item.scan_run_fingerprint, item]),
  );
  const bindingByFingerprint = new Map(
    bindings.map((item) => [item.scan_run_fingerprint, item]),
  );
  const charterEvidence = buildInternalPaperReplayCharterEvidence({
    evidence_version: INTERNAL_PAPER_REPLAY_CHARTER_EVIDENCE_VERSION,
    evaluated_at: evidence.evaluated_at,
    bootstrap_seed: evidence.bootstrap_seed,
    decisions: bindings.map((binding) => ({
      ...baseByFingerprint.get(binding.scan_run_fingerprint)!,
      regime: binding.classification,
    })),
  });
  if (!charterEvidence) {
    return blocked({
      experiment,
      reasons: ["regime_attributed_charter_evidence_invalid"],
      bindings,
      ...identityFields,
    });
  }
  if (
    contextResult.decisions.some(
      (item) =>
        bindingByFingerprint.get(item.replay_identity.decision_id)
          ?.context_evidence_digest !== item.evidence_digest,
    )
  ) {
    return blocked({
      experiment,
      reasons: ["regime_evidence_digest_binding_mismatch"],
      bindings,
      ...identityFields,
    });
  }

  const scorecard = evaluateInternalPaperReplayCharterScorecard({
    experiment,
    baseline,
    charter,
    evidence: charterEvidence,
  });
  if (scorecard.status !== "completed") {
    return blocked({
      experiment,
      reasons: ["regime_attributed_scorecard_blocked", ...scorecard.reason_codes],
      bindings,
      scorecard,
      ...identityFields,
    });
  }

  return terminal({
    result_version: INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTED_SCORECARD_VERSION,
    attribution_version: INTERNAL_PAPER_REPLAY_REGIME_ATTRIBUTION_VERSION,
    status: "completed",
    scientific_disposition: "research_context_binding_not_strategy_accepted",
    reason_codes: uniqueSorted([
      ...scorecard.reason_codes,
      ...(identity.dataset_source_kind === "synthetic_repository_fixture"
        ? ["synthetic_context_source_fixture_only"]
        : []),
    ]),
    experiment_id: experiment.manifest.experiment_id,
    context_replay_id: identity.replay_id,
    context_dataset_digest: identity.dataset_digest,
    context_replay_evidence_digest: replayEvidenceDigest,
    context_source_kind: identity.dataset_source_kind,
    bindings,
    measurable_regime_count: bindings.filter((item) => item.measurable).length,
    unavailable_or_conflicting_regime_count: bindings.filter(
      (item) => !item.measurable,
    ).length,
    scorecard,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
