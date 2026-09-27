import "server-only";

import type {
  ScannerClockPriorShadowForwardDecisionPlanReadResult,
  ScannerClockPriorShadowForwardDecisionPlanReceipt,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import {
  assessScannerClockPriorShadowForwardCollectionAdmission,
  type ScannerClockPriorShadowForwardCollectionAdmission,
} from "@/lib/server/scanner-clock-prior-shadow-forward-collection-admission";
import {
  readScannerClockPriorShadowForwardDecisionPlans,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision-persistence";
import {
  readScannerClockPriorShadowForwardCollectionEvidence,
  type ScannerClockPriorShadowForwardCollectionEvidenceReadResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-evidence";

export const scannerClockPriorShadowForwardCollectionAdmissionAuthority = {
  can_schedule_observation: false,
  can_request_provider_data: false,
  can_reserve_provider_credits: false,
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_publish_candidate: false,
  can_create_paper_position: false,
  can_execute_broker_action: false,
} as const;

export type ScannerClockPriorShadowForwardCollectionAdmissionDependencies = {
  readPlans: (
    ownerUserId: string,
  ) => Promise<ScannerClockPriorShadowForwardDecisionPlanReadResult>;
  readEvidence: (
    ownerUserId: string,
    plan: ScannerClockPriorShadowForwardDecisionPlanReceipt["plan"],
  ) => Promise<ScannerClockPriorShadowForwardCollectionEvidenceReadResult>;
  assess: typeof assessScannerClockPriorShadowForwardCollectionAdmission;
};

export type ScannerClockPriorShadowForwardCollectionAdmissionReadResult =
  | {
      status: "available";
      plan_receipt: ScannerClockPriorShadowForwardDecisionPlanReceipt;
      admission: ScannerClockPriorShadowForwardCollectionAdmission;
      source_counts: {
        window_scan_rows: number;
        clock_prior_scan_rows: number;
      };
      safe_blocker: null;
      authority:
        typeof scannerClockPriorShadowForwardCollectionAdmissionAuthority;
    }
  | {
      status: "not_ready" | "conflicting" | "unavailable";
      plan_receipt: null;
      admission: null;
      source_counts: null;
      safe_blocker: string;
      authority:
        typeof scannerClockPriorShadowForwardCollectionAdmissionAuthority;
    };

const productionDependencies:
  ScannerClockPriorShadowForwardCollectionAdmissionDependencies = {
    readPlans: readScannerClockPriorShadowForwardDecisionPlans,
    readEvidence: readScannerClockPriorShadowForwardCollectionEvidence,
    assess: assessScannerClockPriorShadowForwardCollectionAdmission,
  };

function unavailable(
  status: "not_ready" | "conflicting" | "unavailable",
  safeBlocker: string,
): ScannerClockPriorShadowForwardCollectionAdmissionReadResult {
  return {
    status,
    plan_receipt: null,
    admission: null,
    source_counts: null,
    safe_blocker: safeBlocker,
    authority: scannerClockPriorShadowForwardCollectionAdmissionAuthority,
  };
}

function newYorkDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function createScannerClockPriorShadowForwardCollectionAdmissionService(
  dependencies: ScannerClockPriorShadowForwardCollectionAdmissionDependencies =
    productionDependencies,
) {
  return {
    async read({
      ownerUserId,
      now = new Date(),
    }: {
      ownerUserId: string;
      now?: Date;
    }): Promise<ScannerClockPriorShadowForwardCollectionAdmissionReadResult> {
      if (!Number.isFinite(now.getTime())) {
        return unavailable(
          "unavailable",
          "clock_prior_forward_collection_admission_clock_unavailable",
        );
      }
      const evaluatedAt = now.toISOString();
      const targetTradingDate = newYorkDate(now);
      if (!targetTradingDate) {
        return unavailable(
          "unavailable",
          "clock_prior_forward_collection_admission_clock_unavailable",
        );
      }

      const plans = await dependencies.readPlans(ownerUserId);
      if (plans.status === "unavailable") {
        return unavailable(
          "unavailable",
          "clock_prior_forward_collection_admission_plan_store_unavailable",
        );
      }
      if (plans.status !== "available") {
        return unavailable(
          "not_ready",
          "clock_prior_forward_collection_admission_plan_not_found",
        );
      }
      if (plans.receipts.length !== 1) {
        return unavailable(
          "conflicting",
          "clock_prior_forward_collection_admission_plan_missing_or_ambiguous",
        );
      }

      const planReceipt = plans.receipts[0]!;
      if (
        planReceipt.owner_user_id !== ownerUserId ||
        planReceipt.plan.owner_user_id !== ownerUserId
      ) {
        return unavailable(
          "conflicting",
          "clock_prior_forward_collection_admission_plan_owner_mismatched",
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
          evaluatedAt,
          targetTradingDate,
          plan: planReceipt.plan,
          scanRuns: evidence.scanRuns,
        }),
        source_counts: evidence.source_counts,
        safe_blocker: null,
        authority: scannerClockPriorShadowForwardCollectionAdmissionAuthority,
      };
    },
  };
}

const scannerClockPriorShadowForwardCollectionAdmissionService =
  createScannerClockPriorShadowForwardCollectionAdmissionService();

export async function readCurrentScannerClockPriorShadowForwardCollectionAdmission({
  ownerUserId,
  now,
}: {
  ownerUserId: string;
  now?: Date;
}) {
  return scannerClockPriorShadowForwardCollectionAdmissionService.read({
    ownerUserId,
    now,
  });
}
