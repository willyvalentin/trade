import "server-only";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { RecommendationEvaluationCharterReadResult } from "@/lib/recommendation-evaluation-charter-store";
import type {
  ScannerClockPriorShadowForwardDecisionPlanReadResult,
  ScannerClockPriorShadowForwardDecisionPlanReceipt,
  ScannerClockPriorShadowForwardDecisionResultReadResult,
  ScannerClockPriorShadowForwardDecisionResultReceipt,
  ScannerClockPriorShadowForwardDecisionResultWriteResult,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import {
  readRecommendationEvaluationCharters,
} from "@/lib/server/recommendation-evaluation-charter-persistence";
import {
  evaluateScannerClockPriorShadowForwardDecision,
  type ScannerClockPriorShadowForwardDecisionResult,
  type ScannerClockPriorShadowForwardEvidenceBindings,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import {
  readScannerClockPriorShadowForwardEvidence,
  type ScannerClockPriorShadowForwardEvidence,
  type ScannerClockPriorShadowForwardEvidenceReadResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-evidence";
import {
  readScannerClockPriorShadowForwardDecisionPlans,
  readScannerClockPriorShadowForwardDecisionResults,
  recordScannerClockPriorShadowForwardDecisionResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-persistence";
import {
  buildScannerClockPriorShadowContextDiagnostic,
  type ScannerClockPriorShadowContextDiagnostic,
} from "@/lib/server/scanner-clock-prior-shadow-context-diagnostic";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

export const scannerClockPriorShadowForwardEvaluationAuthority = {
  can_request_provider_data: false,
  can_reserve_provider_credits: false,
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_publish_candidate: false,
  can_create_paper_position: false,
  can_execute_broker_action: false,
} as const;

export type ScannerClockPriorShadowForwardEvaluationDependencies = {
  readCharters: (
    ownerUserId: string,
  ) => Promise<RecommendationEvaluationCharterReadResult>;
  readPlans: (
    ownerUserId: string,
  ) => Promise<ScannerClockPriorShadowForwardDecisionPlanReadResult>;
  readResults: (
    ownerUserId: string,
  ) => Promise<ScannerClockPriorShadowForwardDecisionResultReadResult>;
  readEvidence: (
    ownerUserId: string,
    plan: ScannerClockPriorShadowForwardDecisionPlanReceipt["plan"],
  ) => Promise<ScannerClockPriorShadowForwardEvidenceReadResult>;
  recordResult: (input: {
    owner_user_id: string;
    plan_id: string;
    decision_result: ScannerClockPriorShadowForwardDecisionResult;
  }) => Promise<ScannerClockPriorShadowForwardDecisionResultWriteResult>;
  evaluate: typeof evaluateScannerClockPriorShadowForwardDecision;
};

type AvailableEvaluation = {
  status: "available";
  plan_receipt: ScannerClockPriorShadowForwardDecisionPlanReceipt;
  evaluation: ScannerClockPriorShadowForwardDecisionResult;
  durable_result_receipt:
    | ScannerClockPriorShadowForwardDecisionResultReceipt
    | null;
  context_diagnostic: ScannerClockPriorShadowContextDiagnostic | null;
  evidence_counts: ScannerClockPriorShadowForwardEvidence["source_counts"];
  safe_blocker: null;
  authority: typeof scannerClockPriorShadowForwardEvaluationAuthority;
};

export type ScannerClockPriorShadowForwardEvaluationReadResult =
  | AvailableEvaluation
  | {
      status: "not_ready" | "conflicting" | "unavailable";
      plan_receipt: null;
      evaluation: null;
      durable_result_receipt: null;
      context_diagnostic: null;
      evidence_counts: null;
      safe_blocker: string;
      authority: typeof scannerClockPriorShadowForwardEvaluationAuthority;
    };

export type ScannerClockPriorShadowForwardEvaluationFinalizeResult =
  | {
      status: "finalized" | "already_finalized";
      receipt: ScannerClockPriorShadowForwardDecisionResultReceipt;
      evaluation: ScannerClockPriorShadowForwardDecisionResult;
      context_diagnostic: ScannerClockPriorShadowContextDiagnostic | null;
      safe_blocker: null;
      authority: typeof scannerClockPriorShadowForwardEvaluationAuthority;
    }
  | {
      status: "not_ready" | "conflicting" | "unavailable";
      receipt: null;
      evaluation: ScannerClockPriorShadowForwardDecisionResult | null;
      context_diagnostic: null;
      safe_blocker: string;
      authority: typeof scannerClockPriorShadowForwardEvaluationAuthority;
    };

const productionDependencies: ScannerClockPriorShadowForwardEvaluationDependencies = {
  readCharters: readRecommendationEvaluationCharters,
  readPlans: readScannerClockPriorShadowForwardDecisionPlans,
  readResults: readScannerClockPriorShadowForwardDecisionResults,
  readEvidence: readScannerClockPriorShadowForwardEvidence,
  recordResult: recordScannerClockPriorShadowForwardDecisionResult,
  evaluate: evaluateScannerClockPriorShadowForwardDecision,
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonical(nested)]),
    );
  }
  return value;
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function unavailable(
  status: "not_ready" | "conflicting" | "unavailable",
  safeBlocker: string,
): ScannerClockPriorShadowForwardEvaluationReadResult {
  return {
    status,
    plan_receipt: null,
    evaluation: null,
    durable_result_receipt: null,
    context_diagnostic: null,
    evidence_counts: null,
    safe_blocker: safeBlocker,
    authority: scannerClockPriorShadowForwardEvaluationAuthority,
  };
}

function matchingCharter(
  ownerUserId: string,
  planReceipt: ScannerClockPriorShadowForwardDecisionPlanReceipt,
  charters: RecommendationEvaluationCharter[],
) {
  const plan = planReceipt.plan;
  const matches = charters.filter((charter) => {
    if (
      charter.owner_user_id !== ownerUserId ||
      charter.charter_id !== plan.evaluation_charter_id ||
      charter.charter_fingerprint !== plan.evaluation_charter_fingerprint ||
      charter.segment_key !== plan.segment_key ||
      charter.charter.hypothesis !== plan.hypothesis ||
      charter.policy_attribution.canonical_evaluation_versions.ranking_version !==
        plan.baseline_ranking_version
    ) return false;
    const rebuilt = buildRecommendationEvaluationCharterInput({
      ownerUserId,
      segmentKey: charter.segment_key,
      policy: charter.policy_attribution,
      charter: scannerClockPriorShadowEvaluationCharterDefinition,
    });
    return rebuilt?.charter_fingerprint === charter.charter_fingerprint;
  });
  return matches.length === 1 ? matches[0]! : null;
}

function evidenceBindings({
  charter,
  planReceipt,
}: {
  charter: RecommendationEvaluationCharter;
  planReceipt: ScannerClockPriorShadowForwardDecisionPlanReceipt;
}): ScannerClockPriorShadowForwardEvidenceBindings {
  const plan = planReceipt.plan;
  return {
    evaluation_charter: {
      charter_id: charter.charter_id,
      charter_fingerprint: charter.charter_fingerprint,
      owner_user_id: charter.owner_user_id,
      segment_key: charter.segment_key,
      hypothesis: charter.charter.hypothesis,
      baseline_ranking_version:
        charter.policy_attribution.canonical_evaluation_versions.ranking_version,
      created_at: charter.created_at,
    },
    policy_reference: {
      reference_fingerprint: plan.policy_reference.reference_fingerprint,
      owner_user_id: plan.policy_reference.owner_user_id,
      segment_key: plan.policy_reference.segment_key,
      evaluation_charter_fingerprint:
        plan.policy_reference.evaluation_charter_fingerprint,
      baseline_ranking_version:
        plan.policy_reference.baseline_version_tuple.ranking_version,
      candidate_ranking_version:
        plan.policy_reference.candidate_version_tuple.ranking_version,
      created_at: plan.policy_reference.created_at,
    },
  };
}

export function createScannerClockPriorShadowForwardEvaluationService(
  dependencies: ScannerClockPriorShadowForwardEvaluationDependencies =
    productionDependencies,
) {
  async function read(
    ownerUserId: string,
  ): Promise<ScannerClockPriorShadowForwardEvaluationReadResult> {
    const [plans, charters, results] = await Promise.all([
      dependencies.readPlans(ownerUserId),
      dependencies.readCharters(ownerUserId),
      dependencies.readResults(ownerUserId),
    ]);
    if (
      plans.status === "unavailable" ||
      charters.status === "unavailable" ||
      results.status === "unavailable"
    ) {
      return unavailable(
        "unavailable",
        "clock_prior_forward_evaluation_durable_evidence_unavailable",
      );
    }
    if (plans.status !== "available" || charters.status !== "available") {
      return unavailable(
        "not_ready",
        "clock_prior_forward_evaluation_plan_or_charter_not_found",
      );
    }
    if (plans.receipts.length !== 1) {
      return unavailable(
        "conflicting",
        "clock_prior_forward_evaluation_plan_missing_or_ambiguous",
      );
    }
    const planReceipt = plans.receipts[0]!;
    const charter = matchingCharter(ownerUserId, planReceipt, charters.charters);
    if (!charter) {
      return unavailable(
        "conflicting",
        "clock_prior_forward_evaluation_charter_binding_invalid",
      );
    }
    const evidence = await dependencies.readEvidence(
      ownerUserId,
      planReceipt.plan,
    );
    if (evidence.status !== "available") {
      return unavailable(
        "unavailable",
        evidence.safe_blocker,
      );
    }
    const evaluation = dependencies.evaluate({
      plan: planReceipt.plan,
      evidenceBindings: evidenceBindings({ charter, planReceipt }),
      scanRuns: evidence.evidence.scanRuns,
      snapshots: evidence.evidence.snapshots,
      outcomes: evidence.evidence.outcomes,
      calibrationScanRuns: evidence.evidence.calibrationScanRuns,
      calibrationSnapshots: evidence.evidence.calibrationSnapshots,
      calibrationOutcomes: evidence.evidence.calibrationOutcomes,
      runtimeEvidence: evidence.evidence.runtimeEvidence,
      bootstrapSeed:
        `clock-prior-forward:${planReceipt.plan.plan_fingerprint}`,
    });
    const matchingResults = results.receipts.filter((receipt) =>
      receipt.plan_id === planReceipt.plan_id &&
      receipt.plan_fingerprint === planReceipt.plan_fingerprint
    );
    if (matchingResults.length > 1) {
      return unavailable(
        "conflicting",
        "clock_prior_forward_evaluation_result_ambiguous",
      );
    }
    const durableResult = matchingResults[0] ?? null;
    if (
      durableResult &&
      !same(durableResult.decision_result, evaluation)
    ) {
      return unavailable(
        "conflicting",
        "clock_prior_forward_evaluation_durable_result_drift",
      );
    }
    return {
      status: "available",
      plan_receipt: planReceipt,
      evaluation,
      durable_result_receipt: durableResult,
      context_diagnostic: durableResult
        ? buildScannerClockPriorShadowContextDiagnostic(durableResult)
        : null,
      evidence_counts: evidence.evidence.source_counts,
      safe_blocker: null,
      authority: scannerClockPriorShadowForwardEvaluationAuthority,
    };
  }

  return {
    read,

    async finalize({
      ownerUserId,
      now = new Date(),
    }: {
      ownerUserId: string;
      now?: Date;
    }): Promise<ScannerClockPriorShadowForwardEvaluationFinalizeResult> {
      const assessment = await read(ownerUserId);
      if (assessment.status !== "available") {
        return {
          status: assessment.status,
          receipt: null,
          evaluation: null,
          context_diagnostic: null,
          safe_blocker: assessment.safe_blocker,
          authority: scannerClockPriorShadowForwardEvaluationAuthority,
        };
      }
      if (assessment.durable_result_receipt) {
        return {
          status: "already_finalized",
          receipt: assessment.durable_result_receipt,
          evaluation: assessment.evaluation,
          context_diagnostic: assessment.context_diagnostic,
          safe_blocker: null,
          authority: scannerClockPriorShadowForwardEvaluationAuthority,
        };
      }
      if (
        !Number.isFinite(now.getTime()) ||
        now.getTime() < Date.parse(
          assessment.plan_receipt.plan.windows.walk_forward.end_at,
        ) ||
        assessment.evaluation.status !== "decision_ready"
      ) {
        return {
          status: "not_ready",
          receipt: null,
          evaluation: assessment.evaluation,
          context_diagnostic: null,
          safe_blocker:
            "clock_prior_forward_evaluation_not_ready_for_finalization",
          authority: scannerClockPriorShadowForwardEvaluationAuthority,
        };
      }
      const write = await dependencies.recordResult({
        owner_user_id: ownerUserId,
        plan_id: assessment.plan_receipt.plan_id,
        decision_result: assessment.evaluation,
      });
      if (write.status === "different_result_already_recorded") {
        return {
          status: "conflicting",
          receipt: null,
          evaluation: assessment.evaluation,
          context_diagnostic: null,
          safe_blocker: write.safe_blocker,
          authority: scannerClockPriorShadowForwardEvaluationAuthority,
        };
      }
      if (write.status !== "recorded" && write.status !== "already_recorded") {
        return {
          status: "unavailable",
          receipt: null,
          evaluation: assessment.evaluation,
          context_diagnostic: null,
          safe_blocker: write.safe_blocker ??
            "clock_prior_forward_evaluation_finalization_write_unavailable",
          authority: scannerClockPriorShadowForwardEvaluationAuthority,
        };
      }
      const readback = await dependencies.readResults(ownerUserId);
      const exact = readback.status === "available"
        ? readback.receipts.filter((receipt) =>
            receipt.result_id === write.receipt.result_id &&
            receipt.result_fingerprint === write.receipt.result_fingerprint &&
            same(receipt.decision_result, assessment.evaluation)
          )
        : [];
      if (exact.length !== 1) {
        return {
          status: "unavailable",
          receipt: null,
          evaluation: assessment.evaluation,
          context_diagnostic: null,
          safe_blocker:
            "clock_prior_forward_evaluation_finalization_readback_mismatch",
          authority: scannerClockPriorShadowForwardEvaluationAuthority,
        };
      }
      return {
        status: write.status === "recorded" ? "finalized" : "already_finalized",
        receipt: exact[0]!,
        evaluation: assessment.evaluation,
        context_diagnostic: buildScannerClockPriorShadowContextDiagnostic(
          exact[0]!,
        ),
        safe_blocker: null,
        authority: scannerClockPriorShadowForwardEvaluationAuthority,
      };
    },
  };
}

const currentService = createScannerClockPriorShadowForwardEvaluationService();

export function readCurrentScannerClockPriorShadowForwardEvaluation(
  ownerUserId: string,
) {
  return currentService.read(ownerUserId);
}

export function finalizeCurrentScannerClockPriorShadowForwardEvaluation(input: {
  ownerUserId: string;
}) {
  return currentService.finalize(input);
}
