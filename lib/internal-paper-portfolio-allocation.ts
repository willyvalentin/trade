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
export const INTERNAL_PAPER_PORTFOLIO_STRESS_SCENARIO_VERSION =
  "internal_paper_portfolio_stress_scenario_v1" as const;

export type InternalPaperPortfolioStressScenario = Readonly<{
  scenario_version: typeof INTERNAL_PAPER_PORTFOLIO_STRESS_SCENARIO_VERSION;
  scenario_id: string;
  max_open_loss: number;
}>;

export type InternalPaperPortfolioStressLoss = Readonly<{
  scenario_id: string;
  loss_per_share: number;
}>;

export type InternalPaperPortfolioEstimatedStressLoss = Readonly<{
  scenario_id: string;
  estimated_open_loss: number;
}>;

export type InternalPaperPortfolioRiskEstimate = Readonly<{
  estimate_version: typeof INTERNAL_PAPER_PORTFOLIO_RISK_ESTIMATE_VERSION;
  sector: string;
  correlation_group: string;
  beta: number;
  stress_losses: readonly InternalPaperPortfolioStressLoss[];
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
  stress_scenarios: readonly InternalPaperPortfolioStressScenario[];
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
  estimated_stress_losses: readonly InternalPaperPortfolioEstimatedStressLoss[] | null;
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
      stress_scenario_losses: readonly InternalPaperPortfolioEstimatedStressLoss[];
      evidence_limits: readonly [
        "source_only_allocation_core",
        "requires_frozen_durable_policy_before_runtime_use",
        "requires_time_bound_calibrated_net_ev",
        "requires_current_portfolio_risk_evidence",
        "requires_versioned_stress_scenario_evidence",
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
  stress_scenario_losses: Map<string, number>;
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const AUTHORITY: Authority = Object.freeze({
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_persist_or_submit_internal_paper_command: false,
  can_execute_broker_action: false,
});
const EVIDENCE_LIMITS = Object.freeze([
  "source_only_allocation_core",
  "requires_frozen_durable_policy_before_runtime_use",
  "requires_time_bound_calibrated_net_ev",
  "requires_current_portfolio_risk_evidence",
  "requires_versioned_stress_scenario_evidence",
  "no_provider_or_broker_authority",
  "no_forward_portfolio_acceptance",
] as const);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonical(value: unknown): unknown {
  // JSON.stringify turns NaN and infinities into null. Preserve malformed
  // numeric inputs as distinct evidence rather than conflating them with an
  // explicitly unavailable value in an allocation receipt.
  if (typeof value === "number" && !Number.isFinite(value)) {
    return { __invalid_non_finite_number__: String(value) };
  }
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

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
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
  return deepFreeze({ ...value, result_digest: digest(value) });
}

function blocked(
  reasonCodes: string[],
  input: unknown,
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
  if (!Array.isArray(policy.stress_scenarios) || policy.stress_scenarios.length === 0) {
    reasons.push("allocation_policy_stress_scenarios_invalid");
  } else {
    const scenarioIds = new Set<string>();
    for (const scenario of policy.stress_scenarios) {
      const scenarioId = normalizedText(scenario?.scenario_id);
      if (
        scenario?.scenario_version !== INTERNAL_PAPER_PORTFOLIO_STRESS_SCENARIO_VERSION ||
        !scenarioId ||
        scenarioIds.has(scenarioId) ||
        !nonNegativeFinite(scenario?.max_open_loss)
      ) {
        reasons.push("allocation_policy_stress_scenarios_invalid");
        continue;
      }
      scenarioIds.add(scenarioId);
    }
  }
  return reasons;
}

function stressLossesByScenario(
  estimate: InternalPaperPortfolioRiskEstimate,
  policy: InternalPaperPortfolioAllocationPolicy,
) {
  const losses = new Map<string, number>();
  for (const stressLoss of estimate.stress_losses) {
    losses.set(normalizedText(stressLoss.scenario_id), stressLoss.loss_per_share);
  }
  return policy.stress_scenarios.map((scenario) => ({
    scenario_id: normalizedText(scenario.scenario_id),
    loss_per_share: losses.get(normalizedText(scenario.scenario_id)) as number,
  }));
}

function riskEstimateReasons(input: {
  estimate: InternalPaperPortfolioRiskEstimate;
  policy: InternalPaperPortfolioAllocationPolicy;
  allocationAt: string;
  decisionAt?: string;
  maxAgeSeconds: number;
}) {
  const estimate = input.estimate;
  const reasons: string[] = [];
  if (!isRecord(estimate)) {
    reasons.push("risk_estimate_identity_invalid");
    return reasons;
  }
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
  if (!Array.isArray(estimate.stress_losses)) {
    reasons.push("risk_estimate_stress_scenarios_unsupported");
    return reasons;
  }
  const expectedScenarioIds = new Set(
    input.policy.stress_scenarios.map((scenario) => normalizedText(scenario.scenario_id)),
  );
  const observedScenarioIds = new Set<string>();
  for (const stressLoss of estimate.stress_losses) {
    const scenarioId = normalizedText(stressLoss?.scenario_id);
    if (
      !scenarioId ||
      observedScenarioIds.has(scenarioId) ||
      !expectedScenarioIds.has(scenarioId) ||
      !nonNegativeFinite(stressLoss?.loss_per_share)
    ) {
      reasons.push("risk_estimate_stress_scenarios_unsupported");
      break;
    }
    observedScenarioIds.add(scenarioId);
  }
  if (observedScenarioIds.size !== expectedScenarioIds.size) {
    reasons.push("risk_estimate_stress_scenarios_unsupported");
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
  stressLosses: readonly InternalPaperPortfolioStressLoss[];
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
  const estimatedStressLosses = input.stressLosses.map((stressLoss) => ({
    scenario_id: normalizedText(stressLoss.scenario_id),
    estimated_open_loss: round(
      input.quantity * stressLoss.loss_per_share + input.policy.commission_per_order * 2,
    ),
  }));
  return {
    estimatedEntryPrice,
    riskPerShare,
    estimatedOpenRisk,
    estimatedCashRequired,
    betaNotional,
    estimatedStressLosses,
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
    stress_scenario_losses: new Map(
      input.policy.stress_scenarios.map((scenario) => [
        normalizedText(scenario.scenario_id),
        0,
      ]),
    ),
  };
  const reasons: string[] = [];
  const positionIds = new Set<string>();

  for (const position of input.positions) {
    const ticker = normalizedTicker(position.ticker);
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
      policy: input.policy,
      allocationAt: input.policy.allocation_at,
      maxAgeSeconds: input.policy.max_risk_estimate_age_seconds,
    });
    if (riskReasons.length > 0) {
      reasons.push(...riskReasons.map((reason) => `open_position_${reason}`));
      continue;
    }
    const sector = normalizedText(position.risk_estimate.sector);
    const correlationGroup = normalizedText(position.risk_estimate.correlation_group);
    const terms = positionExposure({
      quantity: position.quantity,
      entryPrice: position.entry_price,
      stopPrice: position.stop_price,
      beta: position.risk_estimate.beta,
      stressLosses: stressLossesByScenario(position.risk_estimate, input.policy),
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
    for (const stressLoss of terms.estimatedStressLosses) {
      increase(
        exposure.stress_scenario_losses,
        stressLoss.scenario_id,
        stressLoss.estimated_open_loss,
      );
    }
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
    ) &&
    policy.stress_scenarios.every(
      (scenario) =>
        (exposure.stress_scenario_losses.get(normalizedText(scenario.scenario_id)) ??
          Number.POSITIVE_INFINITY) <= scenario.max_open_loss,
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
  if (!Number.isFinite(candidate.calibrated_net_expected_value_r)) {
    reasons.push("candidate_calibrated_net_ev_unavailable");
  }
  if (Number.isFinite(candidate.calibrated_net_expected_value_r) && candidate.calibrated_net_expected_value_r <= 0) {
    reasons.push("candidate_calibrated_net_ev_non_positive");
  }
  if (
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
    estimatedStressLosses: readonly InternalPaperPortfolioEstimatedStressLoss[];
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
    estimated_stress_losses: terms?.estimatedStressLosses ?? null,
  };
}

function candidateSort(
  left: InternalPaperPortfolioCandidate,
  right: InternalPaperPortfolioCandidate,
) {
  const leftHasCalibratedValue = Number.isFinite(
    left.calibrated_net_expected_value_r,
  );
  const rightHasCalibratedValue = Number.isFinite(
    right.calibrated_net_expected_value_r,
  );
  if (leftHasCalibratedValue && rightHasCalibratedValue) {
    const valueDelta =
      right.calibrated_net_expected_value_r - left.calibrated_net_expected_value_r;
    if (valueDelta !== 0) return valueDelta;
  } else if (leftHasCalibratedValue !== rightHasCalibratedValue) {
    return leftHasCalibratedValue ? -1 : 1;
  }
  return normalizedText(left.candidate_id).localeCompare(
    normalizedText(right.candidate_id),
  );
}

function allocationInputForDigest(input: unknown) {
  if (!isRecord(input)) return input;
  const openPositions = Array.isArray(input.open_positions)
    ? [...input.open_positions]
    : [];
  const candidates = Array.isArray(input.candidates) ? [...input.candidates] : [];
  return {
    ...input,
    open_positions: openPositions.sort((left, right) =>
      normalizedText(isRecord(left) ? left.position_id : "").localeCompare(
        normalizedText(isRecord(right) ? right.position_id : ""),
      ),
    ),
    candidates: candidates.sort((left, right) => {
      const identity = normalizedText(
        isRecord(left) ? left.candidate_id : "",
      ).localeCompare(normalizedText(isRecord(right) ? right.candidate_id : ""));
      return identity !== 0
        ? identity
        : normalizedTicker(isRecord(left) ? left.ticker : "").localeCompare(
            normalizedTicker(isRecord(right) ? right.ticker : ""),
          );
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
  if (
    !isRecord(input) ||
    input.allocation_version !== INTERNAL_PAPER_PORTFOLIO_ALLOCATION_VERSION
  ) {
    return blocked(["allocation_version_invalid"], input);
  }
  if (
    !isRecord(input.policy) ||
    !Array.isArray(input.open_positions) ||
    !Array.isArray(input.candidates) ||
    input.open_positions.some((position) => !isRecord(position)) ||
    input.candidates.some((candidate) => !isRecord(candidate))
  ) {
    return blocked(["allocation_input_structure_invalid"], input);
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
  const decisionFingerprints = new Set<string>();
  if (
    input.candidates.some((candidate) => {
      if (candidateIds.has(candidate.candidate_id)) return true;
      candidateIds.add(candidate.candidate_id);
      return false;
    })
  ) {
    return blocked(["candidate_identity_duplicate"], input);
  }
  if (
    input.candidates.some((candidate) => {
      if (decisionFingerprints.has(candidate.decision_fingerprint)) return true;
      decisionFingerprints.add(candidate.decision_fingerprint);
      return false;
    })
  ) {
    return blocked(["candidate_decision_lineage_duplicate"], input);
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
      policy: input.policy,
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
    const candidateStressLosses = stressLossesByScenario(
      candidate.risk_estimate,
      input.policy,
    );
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
    const stressShares = input.policy.stress_scenarios.map((scenario) => {
      const scenarioId = normalizedText(scenario.scenario_id);
      const lossPerShare = candidateStressLosses.find(
        (stressLoss) => stressLoss.scenario_id === scenarioId,
      )?.loss_per_share;
      const remainingStressLoss =
        scenario.max_open_loss -
        (exposure.stress_scenario_losses.get(scenarioId) ?? Number.POSITIVE_INFINITY) -
        input.policy.commission_per_order * 2;
      return lossPerShare === 0
        ? Number.MAX_SAFE_INTEGER
        : Math.floor(remainingStressLoss / (lossPerShare as number));
    });
    const riskShares = Math.floor(riskBudgetAfterFees / riskPerShare);
    const cashShares = Math.floor(cashBudgetAfterFee / estimatedEntryPrice);
    const quantity = Math.min(
      riskShares,
      cashShares,
      betaShares,
      ...stressShares,
    );
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || riskPerShare <= 0) {
      const limitReason =
        betaBudget <= 0 || betaShares <= 0
          ? "absolute_beta_limit_reached"
          : cashBudgetAfterFee <= 0 || cashShares <= 0
            ? "cash_reserve_limit_reached"
            : stressShares.some((shares) => shares <= 0)
              ? "stress_scenario_loss_limit_reached"
            : "open_risk_limit_reached";
      decisions.push(candidateDecision(candidate, "rejected", [limitReason]));
      continue;
    }

    const terms = positionExposure({
      quantity,
      entryPrice: candidate.entry_price,
      stopPrice: candidate.stop_price,
      beta: candidate.risk_estimate.beta,
      stressLosses: candidateStressLosses,
      policy: input.policy,
    });
    if (
      terms.estimatedOpenRisk > remainingRisk ||
      terms.estimatedCashRequired > exposure.remaining_cash ||
      terms.betaNotional + exposure.absolute_beta_notional >
        input.policy.max_absolute_beta_notional ||
      terms.estimatedStressLosses.some((stressLoss) => {
        const scenario = input.policy.stress_scenarios.find(
          (item) => normalizedText(item.scenario_id) === stressLoss.scenario_id,
        );
        return (
          !scenario ||
          stressLoss.estimated_open_loss +
            (exposure.stress_scenario_losses.get(stressLoss.scenario_id) ??
              Number.POSITIVE_INFINITY) >
            scenario.max_open_loss
        );
      })
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
    for (const stressLoss of terms.estimatedStressLosses) {
      increase(
        exposure.stress_scenario_losses,
        stressLoss.scenario_id,
        stressLoss.estimated_open_loss,
      );
    }
    decisions.push(
      candidateDecision(candidate, "selected", [], {
        quantity,
        estimatedEntryPrice: terms.estimatedEntryPrice,
        estimatedCashRequired: terms.estimatedCashRequired,
        estimatedOpenRisk: terms.estimatedOpenRisk,
        estimatedStressLosses: terms.estimatedStressLosses,
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
    stress_scenario_losses: input.policy.stress_scenarios.map((scenario) => ({
      scenario_id: normalizedText(scenario.scenario_id),
      estimated_open_loss:
        exposure.stress_scenario_losses.get(normalizedText(scenario.scenario_id)) ?? 0,
    })),
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
