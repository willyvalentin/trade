import { createHash } from "node:crypto";

/**
 * The source-only allocation core for the later multi-position internal-paper
 * scope. It deliberately accepts a calibrated net-EV input instead of a
 * recommendation score or confidence label: neither is an allocation signal.
 *
 * This module has no database, provider, scheduler, publication, or broker
 * dependency. A later durable C/I integration must freeze and persist the
 * policy and evidence identities before it can submit a paper command.
 */
export const INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION =
  "internal_paper_portfolio_allocation_v1" as const;
export const INTERNAL_PAPER_PORTFOLIO_ALLOCATION_RESULT_VERSION =
  "internal_paper_portfolio_allocation_result_v1" as const;
export const INTERNAL_PAPER_PORTFOLIO_RISK_ESTIMATE_VERSION =
  "internal_paper_portfolio_risk_estimate_v1" as const;

export type InternalPaperPortfolioRiskEstimate = Readonly<{
  estimate_version: typeof INTERNAL_PAPER_PORTFOLIO_RISK_ESTIMATE_VERSION;
  sector: string;
  correlation_group: string;
  beta: number;
  observed_at: string;
  model_version: string;
  source_fingerprint: string;
}>;

export type InternalPaperPortfolioAllocationPolicy = Readonly<{
  policy_version: string;
  allocation_at: string;
  max_open_positions: number;
  cash_balance: number;
  cash_reserve: number;
  max_total_open_risk: number;
  max_position_risk: number;
  max_sector_open_risk: number;
  max_sector_positions: number;
  max_correlation_group_open_risk: number;
  max_correlation_group_positions: number;
  max_absolute_beta_notional: number;
  spread_bps: number;
  slippage_bps: number;
  commission_per_order: number;
  max_risk_estimate_age_seconds: number;
}>;

export type InternalPaperPortfolioOpenPosition = Readonly<{
  position_id: string;
  ticker: string;
  quantity: number;
  entry_price: number;
  stop_price: number;
  risk_estimate: InternalPaperPortfolioRiskEstimate;
}>;

export type InternalPaperPortfolioCandidate = Readonly<{
  candidate_id: string;
  decision_fingerprint: string;
  decision_timestamp: string;
  ticker: string;
  entry_price: number;
  stop_price: number;
  calibrated_net_expected_value_r: number;
  calibration_version: string;
  calibration_evaluation_fingerprint: string;
  risk_estimate: InternalPaperPortfolioRiskEstimate;
}>;

export type InternalPaperPortfolioAllocationInput = Readonly<{
  allocation_version: typeof INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION;
  policy: InternalPaperPortfolioAllocationPolicy;
  open_positions: readonly InternalPaperPortfolioOpenPosition[];
  candidates: readonly InternalPaperPortfolioCandidate[];
}>;

export type InternalPaperPortfolioCandidateDecision = Readonly<{
  candidate_id: string;
  ticker: string;
  calibrated_net_expected_value_r: number | null;
  status: "selected" | "rejected";
  reason_codes: string[];
  quantity: number | null;
  estimated_entry_price: number | null;
  estimated_cash_required: number | null;
  estimated_open_risk: number | null;
}>;

export type InternalPaperPortfolioAllocationResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_PORTFOLIO_ALLOCATION_RESULT_VERSION;
      allocation_version: typeof INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION;
      status: "blocked";
      reason_codes: string[];
      input_digest: string | null;
      candidate_decisions: readonly [];
      authority: Authority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_PORTFOLIO_ALLOCATION_RESULT_VERSION;
      allocation_version: typeof INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION;
      status: "completed";
      scientific_disposition:
        "portfolio_allocation_simulation_not_strategy_accepted";
      reason_codes: [];
      input_digest: string;
      candidate_decisions: readonly InternalPaperPortfolioCandidateDecision[];
      selected_count: number;
      total_estimated_open_risk: number;
      remaining_cash: number;
      absolute_beta_notional: number;
      evidence_limits: readonly [
        "source_only_allocation_core",
        "requires_frozen_durable_policy_before_runtime_use",
        "requires_time_bound_calibrated_net_ev",
        "requires_current_portfolio_risk_evidence",
        "no_provider_or_broker_authority",
        "no_forward_portfolio_acceptance",
      ];
      authority: Authority;
      result_digest: string;
    }>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_persist_or_submit_internal_paper_command: false;
  can_execute_broker_action: false;
}>;

type Exposure = {
  open_position_count: number;
  total_open_risk: number;
  remaining_cash: number;
  absolute_beta_notional: number;
  tickers: Set<string>;
  sector_risk: Map<string, number>;
  sector_positions: Map<string, number>;
  correlation_risk: Map<string, number>;
  correlation_positions: Map<string, number>;
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const AUTHORITY: Authority = {
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_persist_or_submit_internal_paper_command: false,
  can_execute_broker_action: false,
};
const EVIDENCE_LIMITS = [
  "source_only_allocation_core",
  "requires_frozen_durable_policy_before_runtime_use",
  "requires_time_bound_calibrated_net_ev",
  "requires_current_portfolio_risk_evidence",
  "no_provider_or_broker_authority",
  "no_forward_portfolio_acceptance",
] as const;

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

function round(value: number) {
  return Number(value.toFixed(6));
}

function positiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function nonNegativeFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function nonemptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function normalizedTicker(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizedText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ageSeconds(later: string, earlier: string) {
  return Math.floor((Date.parse(later) - Date.parse(earlier)) / 1_000);
}

function terminal<T extends object>(value: T): T & { result_digest: string } {
  return { ...value, result_digest: digest(value) };
}

function blocked(
  reasonCodes: string[],
  input: InternalPaperPortfolioAllocationInput | null,
): InternalPaperPortfolioAllocationResult {
  return terminal({
    result_version: INTERNAL_PAPER_PORTFOLIO_ALLOCATION_RESULT_VERSION,
    allocation_version: INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION,
    status: "blocked" as const,
    reason_codes: Array.from(new Set(reasonCodes)).sort(),
    input_digest: input ? digest(allocationInputForDigest(input)) : null,
    candidate_decisions: [] as const,
    authority: AUTHORITY,
  });
}

export function verifyInternalPaperPortfolioAllocationDigest(
  result: InternalPaperPortfolioAllocationResult,
) {
  const { result_digest: resultDigest, ...payload } = result;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

function policyReasons(policy: InternalPaperPortfolioAllocationPolicy) {
  const reasons: string[] = [];
  if (!nonemptyText(policy.policy_version) || !explicitInstant(policy.allocation_at)) {
    reasons.push("allocation_policy_identity_invalid");
  }
  if (
    !Number.isSafeInteger(policy.max_open_positions) ||
    policy.max_open_positions <= 0 ||
    !Number.isSafeInteger(policy.max_sector_positions) ||
    policy.max_sector_positions <= 0 ||
    !Number.isSafeInteger(policy.max_correlation_group_positions) ||
    policy.max_correlation_group_positions <= 0
  ) {
    reasons.push("allocation_policy_position_limits_invalid");
  }

  for (const [key, value] of Object.entries({
    cash_balance: policy.cash_balance,
    cash_reserve: policy.cash_reserve,
    max_total_open_risk: policy.max_total_open_risk,
    max_position_risk: policy.max_position_risk,
    max_sector_open_risk: policy.max_sector_open_risk,
    max_correlation_group_open_risk: policy.max_correlation_group_open_risk,
    max_absolute_beta_notional: policy.max_absolute_beta_notional,
    spread_bps: policy.spread_bps,
    slippage_bps: policy.slippage_bps,
    commission_per_order: policy.commission_per_order,
  })) {
    if (!nonNegativeFinite(value)) reasons.push(`allocation_policy_${key}_invalid`);
  }
  if (
    !Number.isSafeInteger(policy.max_risk_estimate_age_seconds) ||
    policy.max_risk_estimate_age_seconds <= 0 ||
    policy.cash_reserve > policy.cash_balance
  ) {
    reasons.push("allocation_policy_freshness_or_cash_invalid");
  }
  return reasons;
}

function riskEstimateReasons(input: {
  estimate: InternalPaperPortfolioRiskEstimate;
  allocationAt: string;
  decisionAt?: string;
  maxAgeSeconds: number;
}) {
  const estimate = input.estimate;
  const reasons: string[] = [];
  if (
    estimate.estimate_version !== INTERNAL_PAPER_PORTFOLIO_RISK_ESTIMATE_VERSION ||
    !nonemptyText(estimate.sector) ||
    !nonemptyText(estimate.correlation_group) ||
    !nonemptyText(estimate.model_version) ||
    !SHA256_PATTERN.test(estimate.source_fingerprint) ||
    !Number.isFinite(estimate.beta) ||
    !explicitInstant(estimate.observed_at)
  ) {
    reasons.push("risk_estimate_identity_invalid");
    return reasons;
  }
  const age = ageSeconds(input.allocationAt, estimate.observed_at);
  if (age < 0 || age > input.maxAgeSeconds) {
    reasons.push("risk_estimate_stale_or_future");
  }
  if (
    input.decisionAt &&
    (!explicitInstant(input.decisionAt) ||
      Date.parse(estimate.observed_at) > Date.parse(input.decisionAt))
  ) {
    reasons.push("risk_estimate_after_decision");
  }
  return reasons;
}

function estimateEntryPrice(
  entryPrice: number,
  policy: InternalPaperPortfolioAllocationPolicy,
) {
  return round(
    entryPrice * (1 + (policy.spread_bps / 2 + policy.slippage_bps) / 10_000),
  );
}

function positionExposure(input: {
  quantity: number;
  entryPrice: number;
  stopPrice: number;
  beta: number;
  policy: InternalPaperPortfolioAllocationPolicy;
}) {
  const estimatedEntryPrice = estimateEntryPrice(input.entryPrice, input.policy);
  const riskPerShare = estimatedEntryPrice - input.stopPrice;
  const estimatedOpenRisk = round(
    input.quantity * riskPerShare + input.policy.commission_per_order * 2,
  );
  const estimatedCashRequired = round(
    input.quantity * estimatedEntryPrice + input.policy.commission_per_order,
  );
  const betaNotional = round(
    input.quantity * estimatedEntryPrice * Math.abs(input.beta),
  );
  return {
    estimatedEntryPrice,
    riskPerShare,
    estimatedOpenRisk,
    estimatedCashRequired,
    betaNotional,
  };
}

function increase(map: Map<string, number>, key: string, value: number) {
  map.set(key, round((map.get(key) ?? 0) + value));
}

function increaseCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function exposureForOpenPositions(input: {
  positions: readonly InternalPaperPortfolioOpenPosition[];
  policy: InternalPaperPortfolioAllocationPolicy;
}): { exposure: Exposure; reasons: string[] } {
  const exposure: Exposure = {
    open_position_count: 0,
    total_open_risk: 0,
    remaining_cash: round(input.policy.cash_balance - input.policy.cash_reserve),
    absolute_beta_notional: 0,
    tickers: new Set<string>(),
    sector_risk: new Map<string, number>(),
    sector_positions: new Map<string, number>(),
    correlation_risk: new Map<string, number>(),
    correlation_positions: new Map<string, number>(),
  };
  const reasons: string[] = [];
  const positionIds = new Set<string>();

  for (const position of input.positions) {
    const ticker = normalizedTicker(position.ticker);
    const sector = normalizedText(position.risk_estimate.sector);
    const correlationGroup = normalizedText(position.risk_estimate.correlation_group);
    if (
      !nonemptyText(position.position_id) ||
      positionIds.has(position.position_id) ||
      !ticker ||
      exposure.tickers.has(ticker) ||
      !Number.isSafeInteger(position.quantity) ||
      position.quantity <= 0 ||
      !positiveFinite(position.entry_price) ||
      !positiveFinite(position.stop_price) ||
      position.stop_price >= position.entry_price
    ) {
      reasons.push("open_position_identity_or_plan_invalid");
      continue;
    }
    const riskReasons = riskEstimateReasons({
      estimate: position.risk_estimate,
      allocationAt: input.policy.allocation_at,
      maxAgeSeconds: input.policy.max_risk_estimate_age_seconds,
    });
    if (riskReasons.length > 0) {
      reasons.push(...riskReasons.map((reason) => `open_position_${reason}`));
      continue;
    }
    const terms = positionExposure({
      quantity: position.quantity,
      entryPrice: position.entry_price,
      stopPrice: position.stop_price,
      beta: position.risk_estimate.beta,
      policy: input.policy,
    });
    if (terms.riskPerShare <= 0 || terms.estimatedOpenRisk <= 0) {
      reasons.push("open_position_risk_invalid");
      continue;
    }
    positionIds.add(position.position_id);
    exposure.tickers.add(ticker);
    exposure.open_position_count += 1;
    exposure.total_open_risk = round(exposure.total_open_risk + terms.estimatedOpenRisk);
    exposure.absolute_beta_notional = round(
      exposure.absolute_beta_notional + terms.betaNotional,
    );
    increase(exposure.sector_risk, sector, terms.estimatedOpenRisk);
    increaseCount(exposure.sector_positions, sector);
    increase(exposure.correlation_risk, correlationGroup, terms.estimatedOpenRisk);
    increaseCount(exposure.correlation_positions, correlationGroup);
  }
  return { exposure, reasons };
}

function exposureWithinPolicy(
  exposure: Exposure,
  policy: InternalPaperPortfolioAllocationPolicy,
) {
  return (
    exposure.open_position_count <= policy.max_open_positions &&
    exposure.total_open_risk <= policy.max_total_open_risk &&
    exposure.absolute_beta_notional <= policy.max_absolute_beta_notional &&
    [...exposure.sector_risk.values()].every(
      (risk) => risk <= policy.max_sector_open_risk,
    ) &&
    [...exposure.sector_positions.values()].every(
      (count) => count <= policy.max_sector_positions,
    ) &&
    [...exposure.correlation_risk.values()].every(
      (risk) => risk <= policy.max_correlation_group_open_risk,
    ) &&
    [...exposure.correlation_positions.values()].every(
      (count) => count <= policy.max_correlation_group_positions,
    )
  );
}

function candidateIdentityReasons(candidate: InternalPaperPortfolioCandidate) {
  const reasons: string[] = [];
  if (!nonemptyText(candidate.candidate_id) || !normalizedTicker(candidate.ticker)) {
    reasons.push("candidate_identity_invalid");
  }
  if (
    !SHA256_PATTERN.test(candidate.decision_fingerprint) ||
    !explicitInstant(candidate.decision_timestamp)
  ) {
    reasons.push("candidate_decision_lineage_invalid");
  }
  if (
    !positiveFinite(candidate.entry_price) ||
    !positiveFinite(candidate.stop_price) ||
    candidate.stop_price >= candidate.entry_price
  ) {
    reasons.push("candidate_trade_plan_invalid");
  }
  if (
    !Number.isFinite(candidate.calibrated_net_expected_value_r) ||
    !nonemptyText(candidate.calibration_version) ||
    !SHA256_PATTERN.test(candidate.calibration_evaluation_fingerprint)
  ) {
    reasons.push("candidate_calibrated_net_ev_unavailable");
  }
  return reasons;
}

function candidateDecision(
  candidate: InternalPaperPortfolioCandidate,
  status: "selected" | "rejected",
  reasonCodes: string[],
  terms: {
    quantity: number;
    estimatedEntryPrice: number;
    estimatedCashRequired: number;
    estimatedOpenRisk: number;
  } | null = null,
): InternalPaperPortfolioCandidateDecision {
  return {
    candidate_id: candidate.candidate_id,
    ticker: normalizedTicker(candidate.ticker) || candidate.ticker,
    calibrated_net_expected_value_r: Number.isFinite(
      candidate.calibrated_net_expected_value_r,
    )
      ? candidate.calibrated_net_expected_value_r
      : null,
    status,
    reason_codes: Array.from(new Set(reasonCodes)).sort(),
    quantity: terms?.quantity ?? null,
    estimated_entry_price: terms?.estimatedEntryPrice ?? null,
    estimated_cash_required: terms?.estimatedCashRequired ?? null,
    estimated_open_risk: terms?.estimatedOpenRisk ?? null,
  };
}

function candidateSort(
  left: InternalPaperPortfolioCandidate,
  right: InternalPaperPortfolioCandidate,
) {
  const leftValue = Number.isFinite(left.calibrated_net_expected_value_r)
    ? left.calibrated_net_expected_value_r
    : Number.NEGATIVE_INFINITY;
  const rightValue = Number.isFinite(right.calibrated_net_expected_value_r)
    ? right.calibrated_net_expected_value_r
    : Number.NEGATIVE_INFINITY;
  const valueDelta = rightValue - leftValue;
  if (valueDelta !== 0) return valueDelta;
  return left.candidate_id.localeCompare(right.candidate_id);
}

function allocationInputForDigest(input: InternalPaperPortfolioAllocationInput) {
  return {
    ...input,
    open_positions: [...input.open_positions].sort((left, right) =>
      left.position_id.localeCompare(right.position_id),
    ),
    candidates: [...input.candidates].sort((left, right) => {
      const identity = left.candidate_id.localeCompare(right.candidate_id);
      return identity !== 0
        ? identity
        : normalizedTicker(left.ticker).localeCompare(normalizedTicker(right.ticker));
    }),
  };
}

/**
 * Ranks only supplied calibrated net-EV signals and sizes them under explicit
 * cash, open-risk, sector, correlation-group and absolute-beta limits. It does
 * not create paper commands or alter a recommendation's ranking/publication.
 */
export function allocateInternalPaperPortfolio(
  input: InternalPaperPortfolioAllocationInput,
): InternalPaperPortfolioAllocationResult {
  if (!input || input.allocation_version !== INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION) {
    return blocked(["allocation_version_invalid"], input ?? null);
  }

  const invalidPolicy = policyReasons(input.policy);
  if (invalidPolicy.length > 0) return blocked(invalidPolicy, input);

  const { exposure, reasons: openPositionReasons } = exposureForOpenPositions({
    positions: input.open_positions,
    policy: input.policy,
  });
  if (openPositionReasons.length > 0) {
    return blocked(openPositionReasons, input);
  }
  if (!exposureWithinPolicy(exposure, input.policy)) {
    return blocked(["open_portfolio_exceeds_policy"], input);
  }

  const candidateIds = new Set<string>();
  if (
    input.candidates.some((candidate) => {
      if (candidateIds.has(candidate.candidate_id)) return true;
      candidateIds.add(candidate.candidate_id);
      return false;
    })
  ) {
    return blocked(["candidate_identity_duplicate"], input);
  }
  candidateIds.clear();
  const candidates = [...input.candidates].sort(candidateSort);
  const decisions: InternalPaperPortfolioCandidateDecision[] = [];

  for (const candidate of candidates) {
    const ticker = normalizedTicker(candidate.ticker);
    const reasons = candidateIdentityReasons(candidate);
    candidateIds.add(candidate.candidate_id);

    const riskReasons = riskEstimateReasons({
      estimate: candidate.risk_estimate,
      allocationAt: input.policy.allocation_at,
      decisionAt: candidate.decision_timestamp,
      maxAgeSeconds: input.policy.max_risk_estimate_age_seconds,
    });
    reasons.push(...riskReasons);
    if (exposure.tickers.has(ticker)) reasons.push("ticker_already_open");
    if (exposure.open_position_count >= input.policy.max_open_positions) {
      reasons.push("portfolio_position_capacity_reached");
    }

    if (reasons.length > 0) {
      decisions.push(candidateDecision(candidate, "rejected", reasons));
      continue;
    }

    const sector = normalizedText(candidate.risk_estimate.sector);
    const correlationGroup = normalizedText(candidate.risk_estimate.correlation_group);
    if ((exposure.sector_positions.get(sector) ?? 0) >= input.policy.max_sector_positions) {
      decisions.push(candidateDecision(candidate, "rejected", ["sector_position_limit_reached"]));
      continue;
    }
    if (
      (exposure.correlation_positions.get(correlationGroup) ?? 0) >=
      input.policy.max_correlation_group_positions
    ) {
      decisions.push(
        candidateDecision(candidate, "rejected", ["correlation_group_position_limit_reached"]),
      );
      continue;
    }

    const estimatedEntryPrice = estimateEntryPrice(candidate.entry_price, input.policy);
    const riskPerShare = estimatedEntryPrice - candidate.stop_price;
    const remainingRisk = Math.min(
      input.policy.max_position_risk,
      input.policy.max_total_open_risk - exposure.total_open_risk,
      input.policy.max_sector_open_risk - (exposure.sector_risk.get(sector) ?? 0),
      input.policy.max_correlation_group_open_risk -
        (exposure.correlation_risk.get(correlationGroup) ?? 0),
    );
    const riskBudgetAfterFees = remainingRisk - input.policy.commission_per_order * 2;
    const cashBudgetAfterFee = exposure.remaining_cash - input.policy.commission_per_order;
    const betaBudget =
      input.policy.max_absolute_beta_notional - exposure.absolute_beta_notional;
    const betaShares =
      Math.abs(candidate.risk_estimate.beta) === 0
        ? Number.MAX_SAFE_INTEGER
        : Math.floor(betaBudget / (estimatedEntryPrice * Math.abs(candidate.risk_estimate.beta)));
    const riskShares = Math.floor(riskBudgetAfterFees / riskPerShare);
    const cashShares = Math.floor(cashBudgetAfterFee / estimatedEntryPrice);
    const quantity = Math.min(
      riskShares,
      cashShares,
      betaShares,
    );
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || riskPerShare <= 0) {
      const limitReason =
        betaBudget <= 0 || betaShares <= 0
          ? "absolute_beta_limit_reached"
          : cashBudgetAfterFee <= 0 || cashShares <= 0
            ? "cash_reserve_limit_reached"
            : "open_risk_limit_reached";
      decisions.push(candidateDecision(candidate, "rejected", [limitReason]));
      continue;
    }

    const terms = positionExposure({
      quantity,
      entryPrice: candidate.entry_price,
      stopPrice: candidate.stop_price,
      beta: candidate.risk_estimate.beta,
      policy: input.policy,
    });
    if (
      terms.estimatedOpenRisk > remainingRisk ||
      terms.estimatedCashRequired > exposure.remaining_cash ||
      terms.betaNotional + exposure.absolute_beta_notional >
        input.policy.max_absolute_beta_notional
    ) {
      decisions.push(candidateDecision(candidate, "rejected", ["allocation_terms_exceed_limit"]));
      continue;
    }

    exposure.open_position_count += 1;
    exposure.total_open_risk = round(exposure.total_open_risk + terms.estimatedOpenRisk);
    exposure.remaining_cash = round(exposure.remaining_cash - terms.estimatedCashRequired);
    exposure.absolute_beta_notional = round(
      exposure.absolute_beta_notional + terms.betaNotional,
    );
    exposure.tickers.add(ticker);
    increase(exposure.sector_risk, sector, terms.estimatedOpenRisk);
    increaseCount(exposure.sector_positions, sector);
    increase(exposure.correlation_risk, correlationGroup, terms.estimatedOpenRisk);
    increaseCount(exposure.correlation_positions, correlationGroup);
    decisions.push(
      candidateDecision(candidate, "selected", [], {
        quantity,
        estimatedEntryPrice: terms.estimatedEntryPrice,
        estimatedCashRequired: terms.estimatedCashRequired,
        estimatedOpenRisk: terms.estimatedOpenRisk,
      }),
    );
  }

  const inputDigest = digest(allocationInputForDigest(input));
  return terminal({
    result_version: INTERNAL_PAPER_PORTFOLIO_ALLOCATION_RESULT_VERSION,
    allocation_version: INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION,
    status: "completed" as const,
    scientific_disposition:
      "portfolio_allocation_simulation_not_strategy_accepted" as const,
    reason_codes: [] as const,
    input_digest: inputDigest,
    candidate_decisions: decisions,
    selected_count: decisions.filter((item) => item.status === "selected").length,
    total_estimated_open_risk: exposure.total_open_risk,
    remaining_cash: exposure.remaining_cash,
    absolute_beta_notional: exposure.absolute_beta_notional,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
