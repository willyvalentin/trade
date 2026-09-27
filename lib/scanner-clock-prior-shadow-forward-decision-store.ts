import "server-only";

import { createHash } from "node:crypto";

import { SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION } from "@/lib/scanner-score-probability-calibration";
import { RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION } from "@/lib/recommendation-decision-feature-vector";
import {
  SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION,
  SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION,
  SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION,
} from "@/lib/server/scanner-intraday-liquidity-shadow-canonical-evaluation";

import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION,
  type ScannerClockPriorShadowForwardDecisionPlan,
  type ScannerClockPriorShadowForwardDecisionResult,
  type ScannerClockPriorShadowForwardPartitionResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";

export const scannerClockPriorShadowForwardDecisionReceiptContractVersion =
  "scanner_clock_prior_shadow_forward_decision_receipt_v2" as const;
export const scannerClockPriorShadowForwardDecisionPlanRecordRpcName =
  "record_scanner_clock_prior_shadow_forward_decision_plan_v2" as const;
export const scannerClockPriorShadowForwardDecisionPlanReadRpcName =
  "read_scanner_clock_prior_shadow_forward_decision_plans_v2" as const;
export const scannerClockPriorShadowForwardDecisionResultRecordRpcName =
  "record_scanner_clock_prior_shadow_forward_decision_result_v2" as const;
export const scannerClockPriorShadowForwardDecisionResultReadRpcName =
  "read_scanner_clock_prior_shadow_forward_decision_results_v2" as const;

type PlanWriteRow = {
  write_status: string;
  plan_id: string | null;
  plan_fingerprint: string | null;
  owner_user_id: string | null;
  plan_json: unknown;
  recorded_at: string | null;
  idempotent: boolean;
  blocker: string | null;
};

type PlanReadRow = Omit<PlanWriteRow, "write_status" | "idempotent"> & {
  readback_status: string;
};

type ResultWriteRow = {
  write_status: string;
  result_id: string | null;
  result_fingerprint: string | null;
  owner_user_id: string | null;
  plan_id: string | null;
  plan_fingerprint: string | null;
  decision_result: unknown;
  recorded_at: string | null;
  idempotent: boolean;
  blocker: string | null;
};

type ResultReadRow = Omit<ResultWriteRow, "write_status" | "idempotent"> & {
  readback_status: string;
};

export type ScannerClockPriorShadowForwardDecisionPlanReceipt = {
  plan_id: string;
  plan_fingerprint: string;
  owner_user_id: string;
  plan: ScannerClockPriorShadowForwardDecisionPlan;
  recorded_at: string;
};

export type ScannerClockPriorShadowForwardDecisionResultReceipt = {
  result_id: string;
  result_fingerprint: string;
  owner_user_id: string;
  plan_id: string;
  plan_fingerprint: string;
  decision_result: ScannerClockPriorShadowForwardDecisionResult;
  recorded_at: string;
};

type ResultRecordInput = {
  owner_user_id: string;
  plan_id: string;
  decision_result: ScannerClockPriorShadowForwardDecisionResult;
};

type ResultDatabaseInput = ResultRecordInput & {
  plan_fingerprint: string;
  result_fingerprint: string;
};

export type ScannerClockPriorShadowForwardDecisionReceiptDatabase = {
  recordPlan: (plan: ScannerClockPriorShadowForwardDecisionPlan) => Promise<{
    data: PlanWriteRow | null;
    error: { code?: string } | null;
  }>;
  readPlans: (ownerUserId: string) => Promise<{
    data: PlanReadRow[] | null;
    error: { code?: string } | null;
  }>;
  recordResult: (input: ResultDatabaseInput) => Promise<{
    data: ResultWriteRow | null;
    error: { code?: string } | null;
  }>;
  readResults: (ownerUserId: string) => Promise<{
    data: ResultReadRow[] | null;
    error: { code?: string } | null;
  }>;
};

export type ScannerClockPriorShadowForwardDecisionPlanWriteResult =
  | {
      status: "recorded" | "already_recorded";
      receipt: ScannerClockPriorShadowForwardDecisionPlanReceipt;
      safe_blocker: null;
    }
  | {
      status: "unavailable" | "different_plan_already_recorded";
      receipt: null;
      safe_blocker: string;
    };

export type ScannerClockPriorShadowForwardDecisionResultWriteResult =
  | {
      status: "recorded" | "already_recorded";
      receipt: ScannerClockPriorShadowForwardDecisionResultReceipt;
      safe_blocker: null;
    }
  | {
      status: "unavailable" | "different_result_already_recorded";
      receipt: null;
      safe_blocker: string;
    };

export type ScannerClockPriorShadowForwardDecisionPlanReadResult =
  | {
      status: "available" | "not_found";
      receipts: ScannerClockPriorShadowForwardDecisionPlanReceipt[];
      safe_blocker: string | null;
    }
  | { status: "unavailable"; receipts: []; safe_blocker: string };

export type ScannerClockPriorShadowForwardDecisionResultReadResult =
  | {
      status: "available" | "not_found";
      receipts: ScannerClockPriorShadowForwardDecisionResultReceipt[];
      safe_blocker: string | null;
    }
  | { status: "unavailable"; receipts: []; safe_blocker: string };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function iso(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (record(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonical(nested)]),
    );
  }
  return value;
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

function resultFingerprint(input: ResultDatabaseInput) {
  return createHash("sha256").update(JSON.stringify(canonical({
    contract_version:
      scannerClockPriorShadowForwardDecisionReceiptContractVersion,
    owner_user_id: input.owner_user_id,
    plan_id: input.plan_id,
    plan_fingerprint: input.plan_fingerprint,
    decision_result: input.decision_result,
  }))).digest("hex");
}

function planFromUnknown(
  value: unknown,
): ScannerClockPriorShadowForwardDecisionPlan | null {
  if (!record(value)) return null;
  const rebuilt = buildScannerClockPriorShadowForwardDecisionPlan(
    value as ScannerClockPriorShadowForwardDecisionPlan,
  );
  return rebuilt && rebuilt.plan_fingerprint === value.plan_fingerprint &&
      same(rebuilt, value)
    ? rebuilt
    : null;
}

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 200 &&
    value.every((item) => typeof item === "string" && item.length <= 512) &&
    new Set(value).size === value.length;
}

const terminalDecisionReason = {
  continue: "both_partitions_clear_continue_boundary",
  narrow: "complete_evidence_does_not_clear_continue_or_reject_boundary",
  reject: "at_least_one_partition_clears_reject_boundary",
} as const;

function exactTerminalDecisionReason(value: Record<string, unknown>) {
  const decision = value.decision;
  return (decision === "continue" || decision === "narrow" ||
      decision === "reject") &&
    Array.isArray(value.reason_codes) && value.reason_codes.length === 1 &&
    value.reason_codes[0] === terminalDecisionReason[decision];
}

function proportion(value: unknown) {
  return record(value) &&
    typeof value.value === "number" && Number.isFinite(value.value) &&
    typeof value.numerator === "number" && Number.isInteger(value.numerator) &&
    value.numerator >= 0 &&
    typeof value.denominator === "number" && Number.isInteger(value.denominator) &&
    value.denominator >= 1 && value.numerator <= value.denominator &&
    typeof value.lower === "number" && Number.isFinite(value.lower) &&
    typeof value.upper === "number" && Number.isFinite(value.upper) &&
    value.lower >= 0 && value.lower <= value.value && value.value <= value.upper &&
    value.upper <= 1;
}

function concentrationShare(value: unknown, denominator: number) {
  return record(value) &&
    typeof value.key === "string" && value.key.trim().length > 0 &&
    value.key.length <= 256 &&
    typeof value.value === "number" && Number.isFinite(value.value) &&
    value.value > 0 && value.value <= 1 &&
    typeof value.numerator === "number" && Number.isInteger(value.numerator) &&
    value.numerator >= 1 && value.numerator <= denominator &&
    value.denominator === denominator &&
    Math.abs(value.value - value.numerator / denominator) <= 1e-12;
}

function concentration(value: unknown, expectedDenominator: number) {
  if (!record(value) || value.denominator !== expectedDenominator ||
    !Number.isInteger(value.denominator) || value.denominator < 1) return false;
  return [
    "maximum_single_ticker_share",
    "maximum_single_sector_share",
    "maximum_single_setup_share",
    "maximum_single_regime_share",
  ].every((key) => concentrationShare(value[key], expectedDenominator));
}

function calibrationArm(value: unknown) {
  return record(value) &&
    typeof value.brier_score === "number" &&
    Number.isFinite(value.brier_score) && value.brier_score >= 0 &&
    value.brier_score <= 1 &&
    typeof value.expected_calibration_error === "number" &&
    Number.isFinite(value.expected_calibration_error) &&
    value.expected_calibration_error >= 0 &&
    value.expected_calibration_error <= 1;
}

function probabilityCalibration(value: unknown) {
  if (!record(value) ||
    value.model_version !== SCANNER_SCORE_PROBABILITY_CALIBRATION_MODEL_VERSION ||
    !hash(value.model_fingerprint) ||
    value.observation_version !==
      SCANNER_RANKING_SHADOW_PROBABILITY_CALIBRATION_OBSERVATION_VERSION ||
    value.bucket_policy !== "fixed_calibration_buckets_v1" ||
    !Number.isInteger(value.binary_outcome_count) ||
    (value.binary_outcome_count as number) < 10 ||
    !proportion(value.probability_coverage) ||
    !record(value.probability_coverage) ||
    value.probability_coverage.numerator !== value.binary_outcome_count ||
    value.probability_coverage.denominator !== value.binary_outcome_count ||
    !calibrationArm(value.baseline) || !calibrationArm(value.candidate)) {
    return false;
  }
  return true;
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function runtimeReliability(value: unknown, expectedDecisionCount: number) {
  if (!record(value)) return false;
  const integerKeys = [
    "invocation_count",
    "admitted_attempt_count",
    "completed_attempt_count",
    "terminal_error_count",
    "active_attempt_count",
    "admission_rejected_count",
    "admission_unknown_count",
    "linked_decision_count",
    "timeout_error_count",
    "rate_limit_error_count",
    "provider_error_count",
    "other_error_count",
  ] as const;
  if (!integerKeys.every((key) => nonNegativeInteger(value[key]))) return false;
  const admitted = value.admitted_attempt_count as number;
  const terminalErrors = value.terminal_error_count as number;
  return admitted > 0 &&
    value.invocation_count === admitted +
      (value.admission_rejected_count as number) +
      (value.admission_unknown_count as number) &&
    admitted === (value.completed_attempt_count as number) + terminalErrors +
      (value.active_attempt_count as number) &&
    terminalErrors === (value.timeout_error_count as number) +
      (value.rate_limit_error_count as number) +
      (value.provider_error_count as number) +
      (value.other_error_count as number) &&
    value.linked_decision_count === expectedDecisionCount &&
    proportion(value.reliability) &&
    record(value.reliability) &&
    value.reliability.numerator === value.completed_attempt_count &&
    value.reliability.denominator === admitted;
}

function providerCost(value: unknown, expectedDecisionCount: number) {
  if (!record(value)) return false;
  const integerKeys = [
    "decision_denominator",
    "exact_credit_receipt_count",
    "finalized_credit_receipt_count",
    "provider_request_attempt_count",
    "provider_ticker_request_count",
    "reserved_provider_credits",
  ] as const;
  if (!integerKeys.every((key) => nonNegativeInteger(value[key]))) return false;
  const denominator = value.decision_denominator as number;
  return denominator >= expectedDecisionCount &&
    value.exact_credit_receipt_count === denominator &&
    value.finalized_credit_receipt_count === denominator &&
    (value.provider_request_attempt_count as number) <= denominator &&
    typeof value.credits_per_decision === "number" &&
    Number.isFinite(value.credits_per_decision) &&
    value.credits_per_decision >= 0 &&
    Math.abs(
      value.credits_per_decision -
        (value.reserved_provider_credits as number) / denominator,
    ) <= 1e-12;
}

function feasibility(value: unknown, expectedCandidateCount: number) {
  if (!record(value) ||
    value.observation_version !==
      SCANNER_RANKING_SHADOW_FEASIBILITY_OBSERVATION_VERSION ||
    value.denominator !== expectedCandidateCount ||
    value.decision_feature_vector_version !==
      RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION ||
    !record(value.unavailable_disclosed) ||
    value.unavailable_disclosed.spread !== true ||
    value.unavailable_disclosed.halt_risk !== true ||
    value.unavailable_disclosed.conservative_slippage !== true) return false;
  return [
    value.liquidity_coverage,
    value.volatility_coverage,
    value.trigger_attainment_coverage,
  ].every((coverage) =>
    proportion(coverage) && record(coverage) && coverage.value === 1 &&
    coverage.numerator === expectedCandidateCount &&
    coverage.denominator === expectedCandidateCount
  );
}

function qualitySlices(value: unknown, expectedCandidateCount: number) {
  if (!record(value) ||
    value.observation_version !==
      SCANNER_RANKING_SHADOW_QUALITY_SLICE_OBSERVATION_VERSION ||
    ![1, 3, 5].includes(value.primary_k as number) ||
    value.denominator !== expectedCandidateCount ||
    !Array.isArray(value.dimensions) ||
    !same(value.dimensions, ["ticker", "sector", "setup", "regime"]) ||
    !Array.isArray(value.slices) || value.slices.length < 8 ||
    value.slices.length > expectedCandidateCount * 8) return false;

  const totals = new Map<string, number>();
  const identities = new Set<string>();
  for (const item of value.slices) {
    if (!record(item) ||
      (item.arm !== "baseline" && item.arm !== "candidate") ||
      !["ticker", "sector", "setup", "regime"].includes(
        item.dimension as string,
      ) ||
      typeof item.key !== "string" || item.key.trim().length === 0 ||
      item.key.length > 512 ||
      !nonNegativeInteger(item.selected_candidate_count) ||
      (item.selected_candidate_count as number) < 1 ||
      !nonNegativeInteger(item.resolved_outcome_count) ||
      (item.resolved_outcome_count as number) >
        (item.selected_candidate_count as number) ||
      !nonNegativeInteger(item.positive_outcome_count) ||
      (item.positive_outcome_count as number) >
        (item.resolved_outcome_count as number) ||
      ((item.resolved_outcome_count as number) === 0
        ? item.precision !== null
        : !proportion(item.precision) || !record(item.precision) ||
          item.precision.numerator !== item.positive_outcome_count ||
          item.precision.denominator !== item.resolved_outcome_count) ||
      !nonNegativeInteger(item.r_result_count) ||
      (item.r_result_count as number) >
        (item.selected_candidate_count as number) ||
      ((item.r_result_count as number) === 0
        ? item.expectancy_r !== null
        : typeof item.expectancy_r !== "number" ||
          !Number.isFinite(item.expectancy_r))) return false;
    const identity = `${item.arm}:${item.dimension}:${item.key}`;
    if (identities.has(identity)) return false;
    identities.add(identity);
    const totalIdentity = `${item.arm}:${item.dimension}`;
    totals.set(
      totalIdentity,
      (totals.get(totalIdentity) ?? 0) +
        (item.selected_candidate_count as number),
    );
  }
  const expectedTotals = ["baseline", "candidate"].flatMap((arm) =>
    ["ticker", "sector", "setup", "regime"].map(
      (dimension) => totals.get(`${arm}:${dimension}`) ?? 0,
    )
  );
  return expectedTotals.length === 8 && new Set(expectedTotals).size === 1 &&
    expectedTotals.every(
      (total) => total > 0 && total <= expectedCandidateCount,
    );
}

function partition(
  value: unknown,
): value is ScannerClockPriorShadowForwardPartitionResult {
  if (!record(value) ||
    value.scorecard_metrics_version !==
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_SCORECARD_METRICS_VERSION ||
    (value.partition !== "held_out" && value.partition !== "walk_forward") ||
    value.evidence_complete !== true || !stringArray(value.reason_codes) ||
    value.reason_codes.length !== 0) return false;
  for (const key of [
    "opportunity_set_count",
    "no_trade_opportunity_set_count",
    "ranked_candidate_count",
    "trading_day_count",
  ] as const) {
    if (typeof value[key] !== "number" || !Number.isInteger(value[key]) ||
      value[key] < 0) return false;
  }
  const opportunitySetCount = value.opportunity_set_count as number;
  const noTradeOpportunitySetCount =
    value.no_trade_opportunity_set_count as number;
  if (noTradeOpportunitySetCount > opportunitySetCount ||
    !proportion(value.baseline_precision) ||
    !proportion(value.candidate_precision) ||
    !proportion(value.outcome_coverage) ||
    !proportion(value.evidence_missingness) ||
    !concentration(value.concentration, value.ranked_candidate_count as number) ||
    !probabilityCalibration(value.probability_calibration) ||
    !runtimeReliability(value.runtime_reliability, opportunitySetCount) ||
    !providerCost(value.provider_cost, opportunitySetCount) ||
    !feasibility(value.feasibility, value.ranked_candidate_count as number) ||
    !qualitySlices(
      value.quality_slices,
      value.ranked_candidate_count as number,
    ) ||
    !record(value.precision_delta)) {
    return false;
  }
  const delta = value.precision_delta;
  return typeof delta.value === "number" && Number.isFinite(delta.value) &&
    typeof delta.conservative_lower === "number" &&
    Number.isFinite(delta.conservative_lower) &&
    typeof delta.conservative_upper === "number" &&
    Number.isFinite(delta.conservative_upper) &&
    delta.conservative_lower <= delta.value &&
    delta.value <= delta.conservative_upper &&
    delta.interval_method === "seeded_trading_day_cluster_bootstrap_v1" &&
    delta.bootstrap_iterations === 1_000 &&
    typeof delta.bootstrap_seed === "string" &&
    delta.bootstrap_seed.length >= 1 && delta.bootstrap_seed.length <= 512;
}

function decisionResultFromUnknown(
  value: unknown,
  expectedPlanFingerprint?: string,
): ScannerClockPriorShadowForwardDecisionResult | null {
  if (!record(value) ||
    value.contract_version !== SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION ||
    value.status !== "decision_ready" ||
    !["continue", "narrow", "reject"].includes(String(value.decision)) ||
    !hash(value.plan_fingerprint) ||
    (expectedPlanFingerprint && value.plan_fingerprint !== expectedPlanFingerprint) ||
    !record(value.evidence_binding) ||
    value.evidence_binding.owner_user_id === undefined ||
    !uuid(value.evidence_binding.owner_user_id) ||
    typeof value.evidence_binding.segment_key !== "string" ||
    !uuid(value.evidence_binding.evaluation_charter_id) ||
    !hash(value.evidence_binding.evaluation_charter_fingerprint) ||
    !hash(value.evidence_binding.policy_reference_fingerprint) ||
    !Array.isArray(value.partitions) || value.partitions.length !== 2 ||
    !value.partitions.every(partition) ||
    new Set(value.partitions.map((item) => item.partition)).size !== 2 ||
    !stringArray(value.reason_codes) || !exactTerminalDecisionReason(value) ||
    value.shadow_only !== true || value.live_ranking_effect !== false ||
    value.publication_effect !== false ||
    value.causal_improvement_claimed !== false || !record(value.authority) ||
    value.authority.can_change_ranking_or_publication !== false ||
    value.authority.can_promote_policy !== false ||
    value.authority.can_request_provider_data !== false ||
    value.authority.can_execute_broker_action !== false) return null;
  return value as unknown as ScannerClockPriorShadowForwardDecisionResult;
}

function planReceipt(row: PlanWriteRow | PlanReadRow) {
  const plan = planFromUnknown(row.plan_json);
  return uuid(row.plan_id) && hash(row.plan_fingerprint) &&
      uuid(row.owner_user_id) && iso(row.recorded_at) && plan &&
      plan.plan_fingerprint === row.plan_fingerprint &&
      plan.owner_user_id === row.owner_user_id
    ? {
        plan_id: row.plan_id,
        plan_fingerprint: row.plan_fingerprint,
        owner_user_id: row.owner_user_id,
        plan,
        recorded_at: row.recorded_at,
      }
    : null;
}

function resultReceipt(row: ResultWriteRow | ResultReadRow) {
  const result = decisionResultFromUnknown(
    row.decision_result,
    row.plan_fingerprint ?? undefined,
  );
  if (!uuid(row.result_id) || !hash(row.result_fingerprint) ||
    !uuid(row.owner_user_id) || !uuid(row.plan_id) ||
    !hash(row.plan_fingerprint) || !iso(row.recorded_at) || !result ||
    result.evidence_binding?.owner_user_id !== row.owner_user_id) return null;
  const input = {
    owner_user_id: row.owner_user_id,
    plan_id: row.plan_id,
    plan_fingerprint: row.plan_fingerprint,
    result_fingerprint: row.result_fingerprint,
    decision_result: result,
  };
  if (resultFingerprint(input) !== row.result_fingerprint) return null;
  return {
    result_id: row.result_id,
    result_fingerprint: row.result_fingerprint,
    owner_user_id: row.owner_user_id,
    plan_id: row.plan_id,
    plan_fingerprint: row.plan_fingerprint,
    decision_result: result,
    recorded_at: row.recorded_at,
  };
}

function unavailablePlan(
  status: "unavailable" | "different_plan_already_recorded" = "unavailable",
  blocker = "clock_prior_forward_decision_plan_store_unavailable",
): ScannerClockPriorShadowForwardDecisionPlanWriteResult {
  return { status, receipt: null, safe_blocker: blocker };
}

function unavailableResult(
  status: "unavailable" | "different_result_already_recorded" = "unavailable",
  blocker = "clock_prior_forward_decision_result_store_unavailable",
): ScannerClockPriorShadowForwardDecisionResultWriteResult {
  return { status, receipt: null, safe_blocker: blocker };
}

export function createScannerClockPriorShadowForwardDecisionReceiptStore(
  database: ScannerClockPriorShadowForwardDecisionReceiptDatabase | null,
) {
  return {
    async recordPlan(
      value: ScannerClockPriorShadowForwardDecisionPlan,
    ): Promise<ScannerClockPriorShadowForwardDecisionPlanWriteResult> {
      const plan = planFromUnknown(value);
      if (!database || !plan) return unavailablePlan();
      try {
        const { data, error } = await database.recordPlan(plan);
        if (!data || error) return unavailablePlan();
        if (data.write_status === "different_plan_already_recorded") {
          return unavailablePlan(
            "different_plan_already_recorded",
            "different_clock_prior_forward_decision_plan_already_recorded",
          );
        }
        const receipt = planReceipt(data);
        if (!receipt || !same(receipt.plan, plan)) return unavailablePlan();
        if (data.write_status === "plan_recorded" && data.idempotent === false) {
          return { status: "recorded", receipt, safe_blocker: null };
        }
        if (data.write_status === "plan_already_recorded" && data.idempotent === true) {
          return { status: "already_recorded", receipt, safe_blocker: null };
        }
      } catch {
        // Ambiguous persistence is never accepted as a durable receipt.
      }
      return unavailablePlan();
    },

    async readPlans(
      ownerUserId: string,
    ): Promise<ScannerClockPriorShadowForwardDecisionPlanReadResult> {
      if (!database || !uuid(ownerUserId)) {
        return { status: "unavailable", receipts: [], safe_blocker: "clock_prior_forward_decision_plan_store_unavailable" };
      }
      try {
        const { data, error } = await database.readPlans(ownerUserId);
        if (error || !data) throw new Error("unavailable");
        if (data.length === 0 || data.every((row) => row.readback_status === "not_found")) {
          return { status: "not_found", receipts: [], safe_blocker: "clock_prior_forward_decision_plan_not_found" };
        }
        const receipts = data.map(planReceipt);
        if (receipts.some((receipt) => receipt === null) ||
          receipts.some((receipt) => receipt!.owner_user_id !== ownerUserId)) {
          throw new Error("malformed");
        }
        return { status: "available", receipts: receipts as ScannerClockPriorShadowForwardDecisionPlanReceipt[], safe_blocker: null };
      } catch {
        return { status: "unavailable", receipts: [], safe_blocker: "clock_prior_forward_decision_plan_store_unavailable" };
      }
    },

    async recordResult(
      input: ResultRecordInput,
    ): Promise<ScannerClockPriorShadowForwardDecisionResultWriteResult> {
      const result = decisionResultFromUnknown(input.decision_result);
      if (!database || !uuid(input.owner_user_id) || !uuid(input.plan_id) ||
        !result || result.evidence_binding?.owner_user_id !== input.owner_user_id) {
        return unavailableResult();
      }
      const databaseInput: ResultDatabaseInput = {
        ...input,
        plan_fingerprint: result.plan_fingerprint!,
        result_fingerprint: "",
      };
      databaseInput.result_fingerprint = resultFingerprint(databaseInput);
      try {
        const { data, error } = await database.recordResult(databaseInput);
        if (!data || error) return unavailableResult();
        if (data.write_status === "different_result_already_recorded") {
          return unavailableResult(
            "different_result_already_recorded",
            "different_clock_prior_forward_decision_result_already_recorded",
          );
        }
        const receipt = resultReceipt(data);
        if (!receipt || receipt.result_fingerprint !== databaseInput.result_fingerprint ||
          !same(receipt.decision_result, result)) return unavailableResult();
        if (data.write_status === "result_recorded" && data.idempotent === false) {
          return { status: "recorded", receipt, safe_blocker: null };
        }
        if (data.write_status === "result_already_recorded" && data.idempotent === true) {
          return { status: "already_recorded", receipt, safe_blocker: null };
        }
      } catch {
        // Ambiguous persistence is never accepted as a durable receipt.
      }
      return unavailableResult();
    },

    async readResults(
      ownerUserId: string,
    ): Promise<ScannerClockPriorShadowForwardDecisionResultReadResult> {
      if (!database || !uuid(ownerUserId)) {
        return { status: "unavailable", receipts: [], safe_blocker: "clock_prior_forward_decision_result_store_unavailable" };
      }
      try {
        const { data, error } = await database.readResults(ownerUserId);
        if (error || !data) throw new Error("unavailable");
        if (data.length === 0 || data.every((row) => row.readback_status === "not_found")) {
          return { status: "not_found", receipts: [], safe_blocker: "clock_prior_forward_decision_result_not_found" };
        }
        const receipts = data.map(resultReceipt);
        if (receipts.some((receipt) => receipt === null) ||
          receipts.some((receipt) => receipt!.owner_user_id !== ownerUserId)) {
          throw new Error("malformed");
        }
        return { status: "available", receipts: receipts as ScannerClockPriorShadowForwardDecisionResultReceipt[], safe_blocker: null };
      } catch {
        return { status: "unavailable", receipts: [], safe_blocker: "clock_prior_forward_decision_result_store_unavailable" };
      }
    },
  };
}

export function scannerClockPriorShadowForwardDecisionResultFingerprint(input: {
  owner_user_id: string;
  plan_id: string;
  decision_result: ScannerClockPriorShadowForwardDecisionResult;
}) {
  const result = decisionResultFromUnknown(input.decision_result);
  if (!result || !uuid(input.owner_user_id) || !uuid(input.plan_id) ||
    result.evidence_binding?.owner_user_id !== input.owner_user_id) return null;
  const databaseInput: ResultDatabaseInput = {
    ...input,
    plan_fingerprint: result.plan_fingerprint!,
    result_fingerprint: "",
  };
  return resultFingerprint(databaseInput);
}
