import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { buildInternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  buildInternalPaperWorkerJob,
  type InternalPaperWorkerJobRequest,
} from "@/lib/internal-paper-worker";

export const INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION =
  "internal_paper_handoff_context_v2" as const;
export const INTERNAL_PAPER_PILOT_POLICY_VERSION =
  "internal_paper_pilot_operating_policy_2026_09_22_v1" as const;

export type InternalPaperHandoffAccountContext = Readonly<{
  context_version: typeof INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION;
  owner_user_id: string;
  account_id: string;
  status: "ready" | "paused" | "killed";
  config_version: string;
  strategy_id: string;
  strategy_version: string;
  strategy_rollback_identity: string;
  symbol_selection_policy_id: string;
  symbol_selection_policy_version: string;
  observed_universe_version: string;
  eligible_symbols: string[];
  cash_balance: number;
  per_trade_risk_cap: number;
  spread_bps: number;
  slippage_bps: number;
  commission_per_order: number;
  observed_at: string;
  operational_admission: Readonly<{
    status: "ready" | "blocked";
    reason_codes: string[];
    policy_version: typeof INTERNAL_PAPER_PILOT_POLICY_VERSION | null;
    provider_plan: "twelve_data_basic_free" | null;
    max_daily_provider_credits: number | null;
    max_per_minute_provider_credits: number | null;
    retry_reserve_credits: number | null;
    max_source_age_seconds: number | null;
    max_decision_to_intent_seconds: number | null;
    worker_heartbeat_interval_seconds: number | null;
    worker_detection_timeout_seconds: number | null;
    max_scan_runtime_seconds: number | null;
    restart_reconciliation_deadline_seconds: number | null;
    acknowledged_effect_recovery_point_seconds: number | null;
    max_raw_provider_payload_bytes: number | null;
    max_derived_evidence_bytes: number | null;
    derived_evidence_retention_days: number | null;
    monthly_incremental_spend_cap_usd: number | null;
    latest_worker_heartbeat_at: string | null;
  }>;
}>;

export type InternalPaperHandoffReasonCode =
  | "handoff_identity_mismatch"
  | "handoff_account_not_ready"
  | "handoff_operational_policy_unavailable"
  | "handoff_worker_heartbeat_unavailable"
  | "handoff_decision_too_old"
  | "handoff_source_too_old"
  | "handoff_persistence_incomplete"
  | "handoff_decision_not_current"
  | "handoff_lineage_incomplete"
  | "handoff_no_trade_invalid"
  | "handoff_candidate_unavailable"
  | "handoff_snapshot_unavailable"
  | "handoff_account_scope_mismatch"
  | "handoff_sizing_unavailable"
  | "handoff_worker_admission_failed";

export type InternalPaperHandoffBuildResult =
  | Readonly<{
      status: "ready";
      reason_codes: [];
      selected_ticker: string | null;
      quantity: number | null;
      job: InternalPaperWorkerJobRequest;
    }>
  | Readonly<{
      status: "blocked";
      reason_codes: InternalPaperHandoffReasonCode[];
      selected_ticker: null;
      quantity: null;
      job: null;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function blocked(
  ...reasonCodes: InternalPaperHandoffReasonCode[]
): InternalPaperHandoffBuildResult {
  return {
    status: "blocked",
    reason_codes: Array.from(new Set(reasonCodes)).sort(),
    selected_ticker: null,
    quantity: null,
    job: null,
  };
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function finitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function roundSix(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function sizedQuantity(input: {
  entry: number;
  stop: number;
  account: InternalPaperHandoffAccountContext;
}) {
  const { account } = input;
  if (
    !finitePositive(input.entry) ||
    !finitePositive(input.stop) ||
    input.stop >= input.entry ||
    !finitePositive(account.cash_balance) ||
    !finitePositive(account.per_trade_risk_cap) ||
    !finiteNonNegative(account.spread_bps) ||
    !finiteNonNegative(account.slippage_bps) ||
    !finiteNonNegative(account.commission_per_order)
  ) {
    return null;
  }

  const fillPrice = roundSix(
    input.entry *
      (1 + (account.spread_bps / 2 + account.slippage_bps) / 10_000),
  );
  const riskPerShare = fillPrice - input.stop;
  const riskBudget = account.per_trade_risk_cap - account.commission_per_order;
  const cashBudget = account.cash_balance - account.commission_per_order;
  if (riskPerShare <= 0 || riskBudget <= 0 || cashBudget <= 0) return null;

  const quantity = Math.min(
    Math.floor(riskBudget / riskPerShare),
    Math.floor(cashBudget / fillPrice),
  );
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
}

function normalizedTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function ageSeconds(later: string, earlier: string) {
  return Math.floor((Date.parse(later) - Date.parse(earlier)) / 1_000);
}

/**
 * Converts one already persisted v3 decision into one durable paper-worker job.
 * It performs no provider, ranking, publication, database or broker action.
 */
export function buildInternalPaperDecisionHandoff(input: {
  owner_user_id: string;
  scan_run_id: string;
  decision: CandidateDecisionRecord;
  decision_lineage_status: "reconstructable" | "incomplete" | "missing";
  scan_run_persisted: boolean;
  snapshots: RecommendationSnapshot[];
  persisted_snapshot_fingerprints: string[];
  account: InternalPaperHandoffAccountContext;
}): InternalPaperHandoffBuildResult {
  if (
    !UUID_PATTERN.test(input.owner_user_id) ||
    input.account.context_version !== INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION ||
    input.account.owner_user_id !== input.owner_user_id ||
    !UUID_PATTERN.test(input.account.account_id)
  ) {
    return blocked("handoff_identity_mismatch");
  }
  if (input.account.status !== "ready") {
    return blocked("handoff_account_not_ready");
  }
  const admission = input.account.operational_admission;
  if (
    admission.status !== "ready" ||
    admission.policy_version !== INTERNAL_PAPER_PILOT_POLICY_VERSION ||
    admission.provider_plan !== "twelve_data_basic_free" ||
    admission.max_daily_provider_credits !== 800 ||
    admission.max_per_minute_provider_credits !== 8 ||
    admission.retry_reserve_credits !== 8 ||
    admission.max_raw_provider_payload_bytes !== 0 ||
    admission.monthly_incremental_spend_cap_usd !== 0 ||
    admission.acknowledged_effect_recovery_point_seconds !== 0 ||
    admission.max_source_age_seconds !== 600 ||
    admission.max_decision_to_intent_seconds !== 120 ||
    admission.worker_heartbeat_interval_seconds !== 900 ||
    admission.worker_detection_timeout_seconds !== 1200 ||
    admission.max_scan_runtime_seconds !== 120 ||
    admission.restart_reconciliation_deadline_seconds !== 1200 ||
    !finitePositive(admission.max_derived_evidence_bytes) ||
    !finitePositive(admission.derived_evidence_retention_days) ||
    !explicitInstant(input.account.observed_at)
  ) {
    return blocked("handoff_operational_policy_unavailable");
  }
  if (
    !explicitInstant(admission.latest_worker_heartbeat_at) ||
    ageSeconds(input.account.observed_at, admission.latest_worker_heartbeat_at) < 0 ||
    ageSeconds(input.account.observed_at, admission.latest_worker_heartbeat_at) >
      admission.worker_detection_timeout_seconds
  ) {
    return blocked("handoff_worker_heartbeat_unavailable");
  }
  if (!input.scan_run_persisted) {
    return blocked("handoff_persistence_incomplete");
  }
  if (
    input.decision.record_version !== "candidate_decision_record_v3" ||
    input.decision.scan_run_id !== input.scan_run_id ||
    !input.decision.scan_run_fingerprint
  ) {
    return blocked("handoff_decision_not_current");
  }
  if (
    !explicitInstant(input.decision.decision_timestamp) ||
    ageSeconds(input.account.observed_at, input.decision.decision_timestamp) < 0 ||
    ageSeconds(input.account.observed_at, input.decision.decision_timestamp) >
      admission.max_decision_to_intent_seconds
  ) {
    return blocked("handoff_decision_too_old");
  }
  if (input.decision_lineage_status !== "reconstructable") {
    return blocked("handoff_lineage_incomplete");
  }

  if (input.decision.final_decision.disposition === "no_trade") {
    const reason = input.decision.final_decision.no_trade_reason?.trim() ?? "";
    if (!reason) return blocked("handoff_no_trade_invalid");
    const worker = buildInternalPaperWorkerJob({
      work_kind: "no_trade",
      owner_user_id: input.owner_user_id,
      account_id: input.account.account_id,
      payload: {
        record_version: "candidate_decision_record_v3",
        disposition: "no_trade",
        scan_run_id: input.scan_run_id,
        scan_run_fingerprint: input.decision.scan_run_fingerprint,
        no_trade_reason: reason,
      },
    });
    return worker.status === "ready"
      ? {
          status: "ready",
          reason_codes: [],
          selected_ticker: null,
          quantity: null,
          job: worker.job,
        }
      : blocked("handoff_worker_admission_failed");
  }

  const candidate = input.decision.candidates
    .filter(
      (item) =>
        item.disposition === "published" &&
        item.eligibility === "eligible" &&
        item.ranking?.selected === true &&
        item.build?.built === true,
    )
    .sort(
      (left, right) =>
        (left.ranking?.rank ?? Number.MAX_SAFE_INTEGER) -
          (right.ranking?.rank ?? Number.MAX_SAFE_INTEGER) ||
        normalizedTicker(left.ticker).localeCompare(normalizedTicker(right.ticker)),
    )[0];
  if (!candidate) return blocked("handoff_candidate_unavailable");

  if (
    !explicitInstant(candidate.data.source_timestamp) ||
    ageSeconds(input.decision.decision_timestamp, candidate.data.source_timestamp) < 0 ||
    ageSeconds(input.decision.decision_timestamp, candidate.data.source_timestamp) >
      admission.max_source_age_seconds
  ) {
    return blocked("handoff_source_too_old");
  }

  const ticker = normalizedTicker(candidate.ticker);
  const persistedFingerprints = new Set(input.persisted_snapshot_fingerprints);
  const snapshot = input.snapshots.find(
    (item) =>
      normalizedTicker(item.ticker) === ticker &&
      persistedFingerprints.has(item.snapshot_fingerprint),
  );
  if (!snapshot) return blocked("handoff_snapshot_unavailable");

  const quantity = sizedQuantity({
    entry: snapshot.entry ?? Number.NaN,
    stop: snapshot.stop ?? Number.NaN,
    account: input.account,
  });
  if (quantity === null) return blocked("handoff_sizing_unavailable");

  const entry = buildInternalPaperEntryCommand({
    owner_user_id: input.owner_user_id,
    account_id: input.account.account_id,
    scan_run_id: input.scan_run_id,
    decision: input.decision,
    snapshot,
    eligible_symbols: input.account.eligible_symbols,
    quantity,
  });
  if (entry.status !== "ready") return blocked("handoff_candidate_unavailable");
  if (
    entry.command.strategy_id !== input.account.strategy_id ||
    entry.command.strategy_version !== input.account.strategy_version ||
    entry.command.strategy_rollback_identity !==
      input.account.strategy_rollback_identity ||
    entry.command.symbol_selection_policy_id !==
      input.account.symbol_selection_policy_id ||
    entry.command.symbol_selection_policy_version !==
      input.account.symbol_selection_policy_version ||
    entry.command.observed_universe_version !==
      input.account.observed_universe_version
  ) {
    return blocked("handoff_account_scope_mismatch");
  }

  const worker = buildInternalPaperWorkerJob({
    work_kind: "entry",
    owner_user_id: input.owner_user_id,
    account_id: input.account.account_id,
    payload: entry.command,
  });
  return worker.status === "ready"
    ? {
        status: "ready",
        reason_codes: [],
        selected_ticker: ticker,
        quantity,
        job: worker.job,
      }
    : blocked("handoff_worker_admission_failed");
}
