import "server-only";

import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { isFreshLiveReferenceMarketTime } from "@/lib/live-reference-freshness-policy";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  scannerClockPriorShadowComparisonFromUnknown,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  type ScannerClockPriorShadowForwardDecisionPlan,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";

export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_ADMISSION_VERSION =
  "scanner_clock_prior_shadow_forward_collection_admission_v3" as const;
export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_POLICY_VERSION =
  "scanner_clock_prior_shadow_forward_collection_policy_v3" as const;

const MAXIMUM_ATTEMPTS_PER_TRADING_DAY = 4;
const PROVIDER_CREDITS_PER_ATTEMPT = 8;
const SLOT_INTERVAL_MINUTES = 15;

type PartitionName = "held_out" | "walk_forward";

type PartitionProgress = {
  opportunity_set_count: number;
  ranked_candidate_count: number;
  trading_day_count: number;
  no_trade_opportunity_set_count: number;
  remaining_opportunity_sets: number;
  remaining_ranked_candidates: number;
  remaining_trading_days: number;
  minimums_met: boolean;
};

export type ScannerClockPriorShadowForwardCollectionAdmission = {
  contract_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_ADMISSION_VERSION;
  collection_policy_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_POLICY_VERSION;
  status: "admitted" | "no_collection_needed" | "blocked";
  reason_codes: string[];
  evaluated_at: string;
  plan_fingerprint: string | null;
  target_trading_date: string;
  target_partition: PartitionName | null;
  next_eligible_trading_date: string | null;
  progress: Record<PartitionName, PartitionProgress>;
  target_day: {
    attributable_attempt_count: number;
    accepted_attempt_count: number;
    remaining_attempt_capacity: number;
    admitted_slots: string[];
    maximum_provider_credits: number;
  };
  authority: {
    schedule_effect: false;
    provider_effect: false;
    ranking_effect: false;
    publication_effect: false;
    paper_effect: false;
    broker_effect: false;
  };
};

export type ScannerClockPriorShadowForwardCollectionAdmissionInput = {
  evaluatedAt: string;
  targetTradingDate: string;
  plan: ScannerClockPriorShadowForwardDecisionPlan | null;
  scanRuns: LearningBaselineScanRun[];
};

const emptyProgress = (): PartitionProgress => ({
  opportunity_set_count: 0,
  ranked_candidate_count: 0,
  trading_day_count: 0,
  no_trade_opportunity_set_count: 0,
  remaining_opportunity_sets: 0,
  remaining_ranked_candidates: 0,
  remaining_trading_days: 0,
  minimums_met: false,
});

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function isoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
    ? value
    : null;
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function partitionForTimestamp(
  timestamp: string,
  windows: ScannerClockPriorShadowForwardDecisionPlan["windows"],
): PartitionName | null {
  const instant = Date.parse(timestamp);
  if (!Number.isFinite(instant)) return null;
  for (const partition of ["held_out", "walk_forward"] as const) {
    if (
      instant >= Date.parse(windows[partition].start_at) &&
      instant < Date.parse(windows[partition].end_at)
    ) return partition;
  }
  return null;
}

export function verifiedScannerClockPriorShadowForwardPlan(
  plan: ScannerClockPriorShadowForwardDecisionPlan | null,
) {
  if (!plan) return null;
  const rebuilt = buildScannerClockPriorShadowForwardDecisionPlan(plan);
  if (!rebuilt || rebuilt.plan_fingerprint !== plan.plan_fingerprint) return null;
  if (
    plan.baseline_ranking_version !==
      SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION ||
    plan.candidate_ranking_version !== SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION ||
    plan.primary_k !== scannerClockPriorShadowForwardPlanProfile.primary_k ||
    (["held_out", "walk_forward"] as const).some((partition) => {
      const actual = plan.windows[partition];
      const expected = scannerClockPriorShadowForwardPlanProfile.windows[partition];
      return actual.start_at !== expected.start_at ||
        actual.end_at !== expected.end_at ||
        actual.minimum_opportunity_sets !== expected.minimum_opportunity_sets ||
        actual.minimum_ranked_candidates !== expected.minimum_ranked_candidates ||
        actual.minimum_trading_days !== expected.minimum_trading_days;
    }) ||
    plan.thresholds.continue_minimum_precision_delta !==
      scannerClockPriorShadowForwardPlanProfile.thresholds
        .continue_minimum_precision_delta ||
    plan.thresholds.reject_maximum_precision_delta !==
      scannerClockPriorShadowForwardPlanProfile.thresholds
        .reject_maximum_precision_delta
  ) return null;
  return rebuilt;
}

function nextEligibleTradingDate(
  afterDate: string,
  partition: PartitionName,
  plan: ScannerClockPriorShadowForwardDecisionPlan,
) {
  let date = afterDate;
  for (let attempts = 0; attempts < 32; attempts += 1) {
    date = shiftDate(date, 1);
    const session = getUsEquityMarketSession(date);
    if (
      session.verification_status === "verified" &&
      session.session_open &&
      session.session_close &&
      partitionForTimestamp(session.session_open, plan.windows) === partition
    ) return date;
    if (Date.parse(`${date}T00:00:00.000Z`) >= Date.parse(plan.windows[partition].end_at)) {
      return null;
    }
  }
  return null;
}

function response(
  input: ScannerClockPriorShadowForwardCollectionAdmissionInput,
  partial: Omit<
    ScannerClockPriorShadowForwardCollectionAdmission,
    "contract_version" | "collection_policy_version" | "evaluated_at" |
      "target_trading_date" | "authority"
  >,
): ScannerClockPriorShadowForwardCollectionAdmission {
  return {
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_ADMISSION_VERSION,
    collection_policy_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_POLICY_VERSION,
    evaluated_at: input.evaluatedAt,
    target_trading_date: input.targetTradingDate,
    ...partial,
    authority: {
      schedule_effect: false,
      provider_effect: false,
      ranking_effect: false,
      publication_effect: false,
      paper_effect: false,
      broker_effect: false,
    },
  };
}

/**
 * Creates a read-only, predeclared collection manifest for the frozen
 * clock-prior forward hypothesis. It never schedules or executes the slots.
 */
export function assessScannerClockPriorShadowForwardCollectionAdmission(
  input: ScannerClockPriorShadowForwardCollectionAdmissionInput,
): ScannerClockPriorShadowForwardCollectionAdmission {
  const empty = { held_out: emptyProgress(), walk_forward: emptyProgress() };
  const blocked = (reasonCodes: string[], planFingerprint: string | null = null) =>
    response(input, {
      status: "blocked",
      reason_codes: uniqueSorted(reasonCodes),
      plan_fingerprint: planFingerprint,
      target_partition: null,
      next_eligible_trading_date: null,
      progress: empty,
      target_day: {
        attributable_attempt_count: 0,
        accepted_attempt_count: 0,
        remaining_attempt_capacity: 0,
        admitted_slots: [],
        maximum_provider_credits: 0,
      },
    });

  if (!Number.isFinite(Date.parse(input.evaluatedAt))) {
    return blocked(["evaluated_at_invalid"]);
  }
  if (!isoDate(input.targetTradingDate)) {
    return blocked(["target_trading_date_invalid"]);
  }
  const plan = verifiedScannerClockPriorShadowForwardPlan(input.plan);
  if (!plan) return blocked(["frozen_plan_invalid_or_drifted"]);

  const accepted: Record<
    PartitionName,
    Array<{ tradingDate: string; observedAt: string; candidateCount: number }>
  > = { held_out: [], walk_forward: [] };
  const attributableAttempts: Record<
    PartitionName,
    Array<{ tradingDate: string; observedAt: string }>
  > = { held_out: [], walk_forward: [] };
  const evidenceReasons: string[] = [];
  const excludedEvidenceReasons: string[] = [];
  const fingerprints = new Set<string>();
  const ids = new Set<string>();
  const observedInstants = new Set<string>();

  for (const scanRun of input.scanRuns) {
    if (fingerprints.has(scanRun.run_fingerprint)) {
      evidenceReasons.push("duplicate_scan_run_fingerprint");
      continue;
    }
    fingerprints.add(scanRun.run_fingerprint);
    if (ids.has(scanRun.id)) {
      evidenceReasons.push("duplicate_scan_run_id");
      continue;
    }
    ids.add(scanRun.id);
    if (observedInstants.has(scanRun.observed_at)) {
      evidenceReasons.push("duplicate_scan_observed_at");
      continue;
    }
    observedInstants.add(scanRun.observed_at);
    if (!scanRun.trading_date || !isoDate(scanRun.trading_date)) {
      evidenceReasons.push("scan_trading_date_invalid");
      continue;
    }
    const session = getUsEquityMarketSession(scanRun.trading_date);
    const partition = partitionForTimestamp(scanRun.observed_at, plan.windows);
    const comparison = scannerClockPriorShadowComparisonFromUnknown(
      scanRun.payload_json.scanner_clock_prior_shadow_comparison,
    );
    if (
      session.verification_status !== "verified" ||
      !session.session_open ||
      !session.session_close
    ) {
      evidenceReasons.push("scan_trading_date_not_verified_open_session");
      continue;
    }
    if (
      scanRun.observed_at.slice(0, 10) !== scanRun.trading_date ||
      Date.parse(scanRun.observed_at) < Date.parse(session.session_open) ||
      Date.parse(scanRun.observed_at) >= Date.parse(session.session_close)
    ) {
      evidenceReasons.push("scan_trading_date_or_session_mismatch");
      continue;
    }
    if (!partition || partitionForTimestamp(session.session_open, plan.windows) !== partition) {
      evidenceReasons.push("scan_outside_declared_partition");
      continue;
    }
    if (
      !comparison ||
      comparison.status !== "comparable" ||
      !Number.isFinite(Date.parse(comparison.generated_at)) ||
      Date.parse(comparison.generated_at) < Date.parse(scanRun.observed_at) ||
      comparison.baseline_policy_version !== plan.baseline_ranking_version ||
      comparison.shadow_policy_version !== plan.candidate_ranking_version
    ) {
      evidenceReasons.push("scan_comparison_invalid_or_policy_mismatched");
      continue;
    }
    attributableAttempts[partition].push({
      tradingDate: scanRun.trading_date,
      observedAt: scanRun.observed_at,
    });

    const decisionRecord = candidateDecisionRecordFromScanRun(scanRun);
    if (!decisionRecord) {
      excludedEvidenceReasons.push("scan_candidate_decision_missing_or_invalid");
      continue;
    }
    const decisionAt = Date.parse(decisionRecord.decision_timestamp);
    if (
      !Number.isFinite(decisionAt) ||
      Date.parse(comparison.generated_at) > decisionAt
    ) {
      evidenceReasons.push("scan_comparison_decision_time_lineage_invalid");
      continue;
    }
    const rankedCandidates = decisionRecord.candidates.filter(
      (candidate) => candidate.ranking !== null,
    );
    const coverageIncomplete =
      !decisionRecord.coverage.full_membership_captured ||
      decisionRecord.coverage.observed_candidate_count !==
        decisionRecord.coverage.expected_candidate_count ||
      decisionRecord.coverage.membership_reason_codes.length > 0 ||
      decisionRecord.candidates.some(
        (candidate) => candidate.disposition === "not_evaluated",
      );
    if (coverageIncomplete) {
      excludedEvidenceReasons.push("scan_candidate_decision_coverage_incomplete");
      continue;
    }

    const comparisonTickers = uniqueSorted(
      comparison.candidate_tickers.map((ticker) => ticker.trim().toUpperCase()),
    );
    const rankedTickers = uniqueSorted(
      rankedCandidates.map((candidate) => candidate.ticker.trim().toUpperCase()),
    );
    const denominatorMismatch =
      decisionRecord.coverage.ranked_candidate_count !== rankedCandidates.length ||
      comparison.candidate_count !== rankedCandidates.length ||
      comparisonTickers.length !== comparison.candidate_tickers.length ||
      rankedTickers.length !== rankedCandidates.length ||
      comparisonTickers.length !== rankedTickers.length ||
      comparisonTickers.some((ticker, index) => ticker !== rankedTickers[index]);
    if (denominatorMismatch) {
      excludedEvidenceReasons.push(
        "scan_candidate_decision_comparison_denominator_mismatch",
      );
      continue;
    }

    const freshnessIncomplete = decisionRecord.candidates.some(
      (candidate) =>
        candidate.data.freshness !== "fresh" ||
        candidate.data.gap_codes.length > 0 ||
        !isFreshLiveReferenceMarketTime(
          candidate.data.source_timestamp,
          decisionAt,
        ),
    );
    if (freshnessIncomplete) {
      excludedEvidenceReasons.push("scan_candidate_decision_freshness_incomplete");
      continue;
    }
    accepted[partition].push({
      tradingDate: scanRun.trading_date,
      observedAt: scanRun.observed_at,
      candidateCount: rankedCandidates.length,
    });
  }

  const attemptsByTradingDate = new Map<string, number>();
  for (const partition of ["held_out", "walk_forward"] as const) {
    for (const row of attributableAttempts[partition]) {
      attemptsByTradingDate.set(
        row.tradingDate,
        (attemptsByTradingDate.get(row.tradingDate) ?? 0) + 1,
      );
    }
  }
  if (
    Array.from(attemptsByTradingDate.values()).some(
      (count) => count > MAXIMUM_ATTEMPTS_PER_TRADING_DAY,
    )
  ) evidenceReasons.push("daily_collection_limit_exceeded");

  const progress = Object.fromEntries(
    (["held_out", "walk_forward"] as const).map((partition) => {
      const rows = accepted[partition];
      const requirements = plan.windows[partition];
      const opportunitySets = rows.length;
      const rankedCandidates = rows.reduce(
        (total, row) => total + row.candidateCount,
        0,
      );
      const tradingDays = new Set(rows.map((row) => row.tradingDate)).size;
      const remainingOpportunitySets = Math.max(
        0,
        requirements.minimum_opportunity_sets - opportunitySets,
      );
      const remainingRankedCandidates = Math.max(
        0,
        requirements.minimum_ranked_candidates - rankedCandidates,
      );
      const remainingTradingDays = Math.max(
        0,
        requirements.minimum_trading_days - tradingDays,
      );
      return [partition, {
        opportunity_set_count: opportunitySets,
        ranked_candidate_count: rankedCandidates,
        trading_day_count: tradingDays,
        no_trade_opportunity_set_count: rows.filter(
          (row) => row.candidateCount === 0,
        ).length,
        remaining_opportunity_sets: remainingOpportunitySets,
        remaining_ranked_candidates: remainingRankedCandidates,
        remaining_trading_days: remainingTradingDays,
        minimums_met:
          remainingOpportunitySets === 0 &&
          remainingRankedCandidates === 0 &&
          remainingTradingDays === 0,
      } satisfies PartitionProgress];
    }),
  ) as Record<PartitionName, PartitionProgress>;

  if (evidenceReasons.length > 0) {
    return response(input, {
      status: "blocked",
      reason_codes: uniqueSorted(evidenceReasons),
      plan_fingerprint: plan.plan_fingerprint,
      target_partition: null,
      next_eligible_trading_date: null,
      progress,
      target_day: {
        attributable_attempt_count: 0,
        accepted_attempt_count: 0,
        remaining_attempt_capacity: 0,
        admitted_slots: [],
        maximum_provider_credits: 0,
      },
    });
  }

  const targetSession = getUsEquityMarketSession(input.targetTradingDate);
  if (
    targetSession.verification_status !== "verified" ||
    !targetSession.session_open ||
    !targetSession.session_close
  ) {
    return response(input, {
      status: "blocked",
      reason_codes: ["target_date_not_verified_open_session"],
      plan_fingerprint: plan.plan_fingerprint,
      target_partition: null,
      next_eligible_trading_date: null,
      progress,
      target_day: {
        attributable_attempt_count: 0,
        accepted_attempt_count: 0,
        remaining_attempt_capacity: 0,
        admitted_slots: [],
        maximum_provider_credits: 0,
      },
    });
  }
  const targetPartition = partitionForTimestamp(targetSession.session_open, plan.windows);
  if (!targetPartition) {
    return response(input, {
      status: "blocked",
      reason_codes: ["target_date_outside_declared_partitions"],
      plan_fingerprint: plan.plan_fingerprint,
      target_partition: null,
      next_eligible_trading_date: null,
      progress,
      target_day: {
        attributable_attempt_count: 0,
        accepted_attempt_count: 0,
        remaining_attempt_capacity: 0,
        admitted_slots: [],
        maximum_provider_credits: 0,
      },
    });
  }

  const targetRows = accepted[targetPartition].filter(
    (row) => row.tradingDate === input.targetTradingDate,
  );
  const targetAttempts = attributableAttempts[targetPartition].filter(
    (row) => row.tradingDate === input.targetTradingDate,
  );
  const capacity = Math.max(
    0,
    MAXIMUM_ATTEMPTS_PER_TRADING_DAY - targetAttempts.length,
  );
  const targetProgress = progress[targetPartition];
  const nextDate = targetProgress.minimums_met
    ? null
    : nextEligibleTradingDate(input.targetTradingDate, targetPartition, plan);
  if (targetProgress.minimums_met || capacity === 0) {
    return response(input, {
      status: "no_collection_needed",
      reason_codes: uniqueSorted([
        targetProgress.minimums_met
          ? "partition_minimums_already_met"
          : "target_day_collection_limit_reached",
        ...excludedEvidenceReasons,
      ]),
      plan_fingerprint: plan.plan_fingerprint,
      target_partition: targetPartition,
      next_eligible_trading_date: nextDate,
      progress,
      target_day: {
        attributable_attempt_count: targetAttempts.length,
        accepted_attempt_count: targetRows.length,
        remaining_attempt_capacity: capacity,
        admitted_slots: [],
        maximum_provider_credits: 0,
      },
    });
  }

  const existingInstants = new Set(targetAttempts.map((row) => row.observedAt));
  const evaluatedAt = Date.parse(input.evaluatedAt);
  const sessionClose = Date.parse(targetSession.session_close);
  const slots = Array.from({ length: MAXIMUM_ATTEMPTS_PER_TRADING_DAY }, (_, index) =>
    new Date(
      Date.parse(targetSession.session_open as string) +
        index * SLOT_INTERVAL_MINUTES * 60_000,
    ).toISOString(),
  ).filter(
    (slot) =>
      Date.parse(slot) < sessionClose &&
      Date.parse(slot) > evaluatedAt &&
      partitionForTimestamp(slot, plan.windows) === targetPartition &&
      !existingInstants.has(slot),
  ).slice(0, capacity);

  if (slots.length === 0) {
    return response(input, {
      status: "blocked",
      reason_codes: uniqueSorted([
        "no_future_predeclared_slot_available_for_target_date",
        ...excludedEvidenceReasons,
      ]),
      plan_fingerprint: plan.plan_fingerprint,
      target_partition: targetPartition,
      next_eligible_trading_date: nextDate,
      progress,
      target_day: {
        attributable_attempt_count: targetAttempts.length,
        accepted_attempt_count: targetRows.length,
        remaining_attempt_capacity: capacity,
        admitted_slots: [],
        maximum_provider_credits: 0,
      },
    });
  }

  return response(input, {
    status: "admitted",
    reason_codes: uniqueSorted([
      "frozen_partition_evidence_deficit",
      ...excludedEvidenceReasons,
    ]),
    plan_fingerprint: plan.plan_fingerprint,
    target_partition: targetPartition,
    next_eligible_trading_date: nextDate,
    progress,
    target_day: {
      attributable_attempt_count: targetAttempts.length,
      accepted_attempt_count: targetRows.length,
      remaining_attempt_capacity: capacity,
      admitted_slots: slots,
      maximum_provider_credits: slots.length * PROVIDER_CREDITS_PER_ATTEMPT,
    },
  });
}
