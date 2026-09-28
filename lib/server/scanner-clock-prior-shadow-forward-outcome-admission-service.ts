import "server-only";

import type {
  ScannerClockPriorShadowForwardDecisionPlanReadResult,
  ScannerClockPriorShadowForwardDecisionPlanReceipt,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import {
  assessScannerClockPriorShadowForwardOutcomeAdmission,
  type ScannerClockPriorShadowForwardOutcomeAdmission,
} from "@/lib/server/scanner-clock-prior-shadow-forward-outcome-admission";
import {
  readScannerClockPriorShadowForwardDecisionPlans,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-persistence";
import {
  readScannerClockPriorShadowForwardOutcomeEvidence,
  type ScannerClockPriorShadowForwardOutcomeEvidenceReadResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-evidence";

export const scannerClockPriorShadowForwardOutcomeAdmissionAuthority = {
  can_schedule_outcome_series: false,
  can_request_provider_data: false,
  can_reserve_provider_credits: false,
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_publish_candidate: false,
  can_create_paper_position: false,
  can_execute_broker_action: false,
} as const;

export type ScannerClockPriorShadowForwardOutcomeAdmissionDependencies = {
  readPlans: (
    ownerUserId: string,
  ) => Promise<ScannerClockPriorShadowForwardDecisionPlanReadResult>;
  readEvidence: (
    ownerUserId: string,
    plan: ScannerClockPriorShadowForwardDecisionPlanReceipt["plan"],
  ) => Promise<ScannerClockPriorShadowForwardOutcomeEvidenceReadResult>;
  assess: typeof assessScannerClockPriorShadowForwardOutcomeAdmission;
};

type SourceCounts = Extract<
  ScannerClockPriorShadowForwardOutcomeEvidenceReadResult,
  { status: "available" }
>["source_counts"];

export type ScannerClockPriorShadowForwardOutcomeAdmissionReadResult =
  | {
      status: "available";
      plan_receipt: ScannerClockPriorShadowForwardDecisionPlanReceipt;
      admission: ScannerClockPriorShadowForwardOutcomeAdmission;
      source_counts: SourceCounts;
      safe_blocker: null;
      authority: typeof scannerClockPriorShadowForwardOutcomeAdmissionAuthority;
    }
  | {
      status: "not_ready" | "conflicting" | "unavailable";
      plan_receipt: null;
      admission: null;
      source_counts: null;
      safe_blocker: string;
      authority: typeof scannerClockPriorShadowForwardOutcomeAdmissionAuthority;
    };

const productionDependencies:
  ScannerClockPriorShadowForwardOutcomeAdmissionDependencies = {
    readPlans: readScannerClockPriorShadowForwardDecisionPlans,
    readEvidence: readScannerClockPriorShadowForwardOutcomeEvidence,
    assess: assessScannerClockPriorShadowForwardOutcomeAdmission,
  };

function unavailable(
  status: "not_ready" | "conflicting" | "unavailable",
  safeBlocker: string,
): ScannerClockPriorShadowForwardOutcomeAdmissionReadResult {
  return {
    status,
    plan_receipt: null,
    admission: null,
    source_counts: null,
    safe_blocker: safeBlocker,
    authority: scannerClockPriorShadowForwardOutcomeAdmissionAuthority,
  };
}

export function createScannerClockPriorShadowForwardOutcomeAdmissionService(
  dependencies: ScannerClockPriorShadowForwardOutcomeAdmissionDependencies =
    productionDependencies,
) {
  return {
    async read({
      ownerUserId,
      now = new Date(),
    }: {
      ownerUserId: string;
      now?: Date;
    }): Promise<ScannerClockPriorShadowForwardOutcomeAdmissionReadResult> {
      if (!Number.isFinite(now.getTime())) {
        return unavailable(
          "unavailable",
          "clock_prior_forward_outcome_admission_clock_unavailable",
        );
      }
      const plans = await dependencies.readPlans(ownerUserId);
      if (plans.status === "unavailable") {
        return unavailable(
          "unavailable",
          "clock_prior_forward_outcome_admission_plan_store_unavailable",
        );
      }
      if (plans.status !== "available") {
        return unavailable(
          "not_ready",
          "clock_prior_forward_outcome_admission_plan_not_found",
        );
      }
      if (plans.receipts.length !== 1) {
        return unavailable(
          "conflicting",
          "clock_prior_forward_outcome_admission_plan_missing_or_ambiguous",
        );
      }

      const planReceipt = plans.receipts[0]!;
      if (
        planReceipt.owner_user_id !== ownerUserId ||
        planReceipt.plan.owner_user_id !== ownerUserId
      ) {
        return unavailable(
          "conflicting",
          "clock_prior_forward_outcome_admission_plan_owner_mismatched",
        );
      }
      const evidence = await dependencies.readEvidence(
        ownerUserId,
        planReceipt.plan,
      );
      if (evidence.status !== "available") {
        return unavailable("unavailable", evidence.safe_blocker);
      }

      return {
        status: "available",
        plan_receipt: planReceipt,
        admission: dependencies.assess({
          evaluatedAt: now.toISOString(),
          plan: planReceipt.plan,
          snapshots: evidence.snapshots,
          outcomes: evidence.outcomes,
        }),
        source_counts: evidence.source_counts,
        safe_blocker: null,
        authority: scannerClockPriorShadowForwardOutcomeAdmissionAuthority,
      };
    },
  };
}

const scannerClockPriorShadowForwardOutcomeAdmissionService =
  createScannerClockPriorShadowForwardOutcomeAdmissionService();

export async function readCurrentScannerClockPriorShadowForwardOutcomeAdmission({
  ownerUserId,
  now,
}: {
  ownerUserId: string;
  now?: Date;
}) {
  return scannerClockPriorShadowForwardOutcomeAdmissionService.read({
    ownerUserId,
    now,
  });
}
