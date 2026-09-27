import "server-only";

import { createHash } from "node:crypto";

import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_DECISION_VERSION,
  type ScannerClockPriorShadowForwardDecisionPlan,
  type ScannerClockPriorShadowForwardDecisionResult,
  type ScannerClockPriorShadowForwardPartitionResult,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";

export const scannerClockPriorShadowForwardDecisionReceiptContractVersion =
  "scanner_clock_prior_shadow_forward_decision_receipt_v1" as const;
export const scannerClockPriorShadowForwardDecisionPlanRecordRpcName =
  "record_scanner_clock_prior_shadow_forward_decision_plan" as const;
export const scannerClockPriorShadowForwardDecisionPlanReadRpcName =
  "read_scanner_clock_prior_shadow_forward_decision_plans" as const;
export const scannerClockPriorShadowForwardDecisionResultRecordRpcName =
  "record_scanner_clock_prior_shadow_forward_decision_result" as const;
export const scannerClockPriorShadowForwardDecisionResultReadRpcName =
  "read_scanner_clock_prior_shadow_forward_decision_results" as const;

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

type PlanWriteResult =
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

type ResultWriteResult =
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

type PlanReadResult =
  | {
      status: "available" | "not_found";
      receipts: ScannerClockPriorShadowForwardDecisionPlanReceipt[];
      safe_blocker: string | null;
    }
  | { status: "unavailable"; receipts: []; safe_blocker: string };

type ResultReadResult =
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

function partition(
  value: unknown,
): value is ScannerClockPriorShadowForwardPartitionResult {
  if (!record(value) ||
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
    !proportion(value.candidate_precision) || !record(value.precision_delta)) {
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
    !uuid(value.evidence_binding.baseline_id) ||
    !hash(value.evidence_binding.baseline_fingerprint) ||
    !Array.isArray(value.partitions) || value.partitions.length !== 2 ||
    !value.partitions.every(partition) ||
    new Set(value.partitions.map((item) => item.partition)).size !== 2 ||
    !stringArray(value.reason_codes) || value.reason_codes.length !== 0 ||
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
): PlanWriteResult {
  return { status, receipt: null, safe_blocker: blocker };
}

function unavailableResult(
  status: "unavailable" | "different_result_already_recorded" = "unavailable",
  blocker = "clock_prior_forward_decision_result_store_unavailable",
): ResultWriteResult {
  return { status, receipt: null, safe_blocker: blocker };
}

export function createScannerClockPriorShadowForwardDecisionReceiptStore(
  database: ScannerClockPriorShadowForwardDecisionReceiptDatabase | null,
) {
  return {
    async recordPlan(
      value: ScannerClockPriorShadowForwardDecisionPlan,
    ): Promise<PlanWriteResult> {
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

    async readPlans(ownerUserId: string): Promise<PlanReadResult> {
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

    async recordResult(input: ResultRecordInput): Promise<ResultWriteResult> {
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

    async readResults(ownerUserId: string): Promise<ResultReadResult> {
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
