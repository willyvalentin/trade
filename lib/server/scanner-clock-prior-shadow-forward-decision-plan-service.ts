import "server-only";

import type {
  RecommendationEvaluationCharterReadResult,
} from "@/lib/recommendation-evaluation-charter-store";
import { buildRecommendationEvaluationCharterInput } from "@/lib/recommendation-evaluation-charter";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import type {
  ScannerClockPriorShadowForwardDecisionPlanReadResult,
  ScannerClockPriorShadowForwardDecisionPlanReceipt,
  ScannerClockPriorShadowForwardDecisionPlanWriteResult,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import {
  readRecommendationEvaluationCharters,
} from "@/lib/server/recommendation-evaluation-charter-persistence";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";
import {
  readScannerClockPriorShadowForwardDecisionPlans,
  recordScannerClockPriorShadowForwardDecisionPlan,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-persistence";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  buildScannerClockPriorShadowPolicyReference,
  type ScannerClockPriorShadowForwardDecisionPlan,
  type ScannerClockPriorShadowForwardDecisionPlanInput,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";

type ActivationRequest = Pick<
  ScannerClockPriorShadowForwardDecisionPlanInput,
  "segment_key"
>;

export const scannerClockPriorShadowForwardPlanActivationAuthority = {
  can_request_provider_data: false,
  can_reserve_provider_credits: false,
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_publish_candidate: false,
  can_create_paper_position: false,
  can_execute_broker_action: false,
} as const;

export type ScannerClockPriorShadowForwardPlanActivationDependencies = {
  readCharters: (
    ownerUserId: string,
  ) => Promise<RecommendationEvaluationCharterReadResult>;
  readPlans: (
    ownerUserId: string,
  ) => Promise<ScannerClockPriorShadowForwardDecisionPlanReadResult>;
  recordPlan: (
    plan: ScannerClockPriorShadowForwardDecisionPlan,
  ) => Promise<ScannerClockPriorShadowForwardDecisionPlanWriteResult>;
};

export type ScannerClockPriorShadowForwardPlanActivationResult =
  | {
      status: "activated" | "already_activated";
      receipt: ScannerClockPriorShadowForwardDecisionPlanReceipt;
      safe_blocker: null;
      authority: typeof scannerClockPriorShadowForwardPlanActivationAuthority;
    }
  | {
      status:
        | "invalid_request"
        | "not_ready"
        | "different_plan_already_recorded"
        | "unavailable";
      receipt: null;
      safe_blocker: string;
      authority: typeof scannerClockPriorShadowForwardPlanActivationAuthority;
    };

const productionDependencies: ScannerClockPriorShadowForwardPlanActivationDependencies = {
  readCharters: readRecommendationEvaluationCharters,
  readPlans: readScannerClockPriorShadowForwardDecisionPlans,
  recordPlan: recordScannerClockPriorShadowForwardDecisionPlan,
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function activationRequest(value: unknown): ActivationRequest | null {
  if (
    !record(value) ||
    Object.keys(value).length !== 1 ||
    typeof value.segment_key !== "string" ||
    value.segment_key.length < 1 ||
    value.segment_key.length > 16_384
  ) {
    return null;
  }
  return {
    segment_key: value.segment_key,
  };
}

function unavailable(
  status: Exclude<
    ScannerClockPriorShadowForwardPlanActivationResult["status"],
    "activated" | "already_activated"
  >,
  safeBlocker: string,
): ScannerClockPriorShadowForwardPlanActivationResult {
  return {
    status,
    receipt: null,
    safe_blocker: safeBlocker,
    authority: scannerClockPriorShadowForwardPlanActivationAuthority,
  };
}

function planDefinition(plan: ScannerClockPriorShadowForwardDecisionPlan) {
  return Object.fromEntries(
    Object.entries(plan).filter(([key]) =>
      key !== "created_at" && key !== "plan_fingerprint"
    ),
  );
}

function samePlanDefinition(
  left: ScannerClockPriorShadowForwardDecisionPlan,
  right: ScannerClockPriorShadowForwardDecisionPlan,
) {
  function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical);
    if (record(value)) {
      return Object.fromEntries(
        Object.entries(value)
          .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
          .map(([key, nested]) => [key, canonical(nested)]),
      );
    }
    return value;
  }
  return JSON.stringify(canonical(planDefinition(left))) ===
    JSON.stringify(canonical(planDefinition(right)));
}

function matchingReceipt(
  receipts: ScannerClockPriorShadowForwardDecisionPlanReceipt[],
  plan: ScannerClockPriorShadowForwardDecisionPlan,
) {
  const matches = receipts.filter((receipt) =>
    receipt.owner_user_id === plan.owner_user_id &&
    receipt.plan_fingerprint === plan.plan_fingerprint &&
    samePlanDefinition(receipt.plan, plan)
  );
  return matches.length === 1 ? matches[0]! : null;
}

export function createScannerClockPriorShadowForwardPlanActivationService(
  dependencies: ScannerClockPriorShadowForwardPlanActivationDependencies =
    productionDependencies,
) {
  return {
    async read(ownerUserId: string) {
      const result = await dependencies.readPlans(ownerUserId);
      return {
        ...result,
        authority: scannerClockPriorShadowForwardPlanActivationAuthority,
      };
    },

    async activate({
      ownerUserId,
      request,
      now = new Date(),
    }: {
      ownerUserId: string;
      request: unknown;
      now?: Date;
    }): Promise<ScannerClockPriorShadowForwardPlanActivationResult> {
      const requested = activationRequest(request);
      if (!requested || !Number.isFinite(now.getTime())) {
        return unavailable(
          "invalid_request",
          "clock_prior_forward_decision_plan_activation_request_invalid",
        );
      }

      const [charters, existingPlans] = await Promise.all([
        dependencies.readCharters(ownerUserId),
        dependencies.readPlans(ownerUserId),
      ]);
      if (
        charters.status === "unavailable" ||
        existingPlans.status === "unavailable"
      ) {
        return unavailable(
          "unavailable",
          "clock_prior_forward_decision_plan_activation_evidence_unavailable",
        );
      }
      if (charters.status !== "available") {
        return unavailable(
          "not_ready",
          "clock_prior_forward_decision_plan_activation_evidence_not_found",
        );
      }

      const matchingCharters = charters.charters.filter((charter) => {
        if (
          charter.owner_user_id !== ownerUserId ||
          charter.segment_key !== requested.segment_key ||
          charter.policy_attribution.canonical_evaluation_versions
              .ranking_version !== SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION
        ) {
          return false;
        }
        const expected = buildRecommendationEvaluationCharterInput({
          ownerUserId,
          segmentKey: requested.segment_key,
          policy: charter.policy_attribution,
          charter: scannerClockPriorShadowEvaluationCharterDefinition,
        });
        return expected?.charter_fingerprint === charter.charter_fingerprint;
      });
      if (matchingCharters.length !== 1) {
        return unavailable(
          "not_ready",
          "clock_prior_forward_decision_plan_charter_binding_missing_or_ambiguous",
        );
      }

      const charter = matchingCharters[0]!;
      if (
        now.getTime() >=
          Date.parse(
            scannerClockPriorShadowForwardPlanProfile.windows.held_out.start_at,
          )
      ) {
        return unavailable(
          "not_ready",
          "clock_prior_forward_decision_plan_profile_window_already_started",
        );
      }
      const baselineRankingVersion =
        charter.policy_attribution.canonical_evaluation_versions.ranking_version;
      const policyReference = buildScannerClockPriorShadowPolicyReference({
        charter,
        createdAt: charter.created_at,
      });
      if (
        baselineRankingVersion !==
          SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION ||
        Date.parse(charter.created_at) > now.getTime() ||
        !policyReference
      ) {
        return unavailable(
          "not_ready",
          "clock_prior_forward_decision_plan_durable_evidence_invalid",
        );
      }

      const plan = buildScannerClockPriorShadowForwardDecisionPlan({
        created_at: now.toISOString(),
        owner_user_id: ownerUserId,
        segment_key: requested.segment_key,
        hypothesis: charter.charter.hypothesis,
        evaluation_charter_id: charter.charter_id,
        evaluation_charter_fingerprint: charter.charter_fingerprint,
        policy_reference: policyReference,
        baseline_ranking_version: baselineRankingVersion,
        candidate_ranking_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
        primary_k: scannerClockPriorShadowForwardPlanProfile.primary_k,
        windows: scannerClockPriorShadowForwardPlanProfile.windows,
        thresholds: scannerClockPriorShadowForwardPlanProfile.thresholds,
      });
      if (!plan) {
        return unavailable(
          "invalid_request",
          "clock_prior_forward_decision_plan_activation_request_invalid",
        );
      }
      const evaluationWindow = charter.charter.evaluation_window;
      if (
        plan.windows.held_out.minimum_opportunity_sets <
          evaluationWindow.held_out_decision_count ||
        plan.windows.walk_forward.minimum_opportunity_sets <
          evaluationWindow.walk_forward_decision_count ||
        plan.windows.held_out.minimum_opportunity_sets +
            plan.windows.walk_forward.minimum_opportunity_sets <
          evaluationWindow.minimum_complete_decisions
      ) {
        return unavailable(
          "invalid_request",
          "clock_prior_forward_decision_plan_weakens_evaluation_charter",
        );
      }

      const sameExisting = existingPlans.receipts.filter((receipt) =>
        samePlanDefinition(receipt.plan, plan)
      );
      if (sameExisting.length === 1) {
        return {
          status: "already_activated",
          receipt: sameExisting[0]!,
          safe_blocker: null,
          authority: scannerClockPriorShadowForwardPlanActivationAuthority,
        };
      }
      if (
        sameExisting.length > 1 ||
        existingPlans.receipts.some((receipt) =>
          receipt.plan.policy_reference.reference_fingerprint ===
            policyReference.reference_fingerprint &&
          receipt.plan.candidate_ranking_version ===
            SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION
        )
      ) {
        return unavailable(
          "different_plan_already_recorded",
          "different_clock_prior_forward_decision_plan_already_recorded",
        );
      }

      const write = await dependencies.recordPlan(plan);
      if (write.status === "different_plan_already_recorded") {
        return unavailable(
          "different_plan_already_recorded",
          write.safe_blocker,
        );
      }
      if (write.status !== "recorded" && write.status !== "already_recorded") {
        return unavailable(
          "unavailable",
          write.safe_blocker ??
            "clock_prior_forward_decision_plan_activation_write_unavailable",
        );
      }

      const readback = await dependencies.readPlans(ownerUserId);
      if (readback.status !== "available") {
        return unavailable(
          "unavailable",
          "clock_prior_forward_decision_plan_activation_readback_unavailable",
        );
      }
      const receipt = matchingReceipt(readback.receipts, plan);
      if (
        !receipt ||
        receipt.plan_id !== write.receipt.plan_id ||
        receipt.recorded_at !== write.receipt.recorded_at
      ) {
        return unavailable(
          "unavailable",
          "clock_prior_forward_decision_plan_activation_readback_mismatch",
        );
      }

      return {
        status: write.status === "recorded" ? "activated" : "already_activated",
        receipt,
        safe_blocker: null,
        authority: scannerClockPriorShadowForwardPlanActivationAuthority,
      };
    },
  };
}

const currentService = createScannerClockPriorShadowForwardPlanActivationService();

export function readCurrentScannerClockPriorShadowForwardDecisionPlans(
  ownerUserId: string,
) {
  return currentService.read(ownerUserId);
}

export function activateCurrentScannerClockPriorShadowForwardDecisionPlan(input: {
  ownerUserId: string;
  request: unknown;
}) {
  return currentService.activate(input);
}
