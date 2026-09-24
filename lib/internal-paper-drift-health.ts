import { createHash } from "node:crypto";

/**
 * Evaluates supplied research and operational measurements only. It cannot
 * fetch, persist, promote, publish or execute: a later durable monitor must
 * bind this receipt to real decision-time metric windows before it can pause
 * an internal-paper worker.
 */
export const INTERNAL_PAPER_DRIFT_HEALTH_VERSION =
  "internal_paper_drift_health_v1" as const;
export const INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION =
  "internal_paper_drift_health_result_v1" as const;
export const INTERNAL_PAPER_DRIFT_METRIC_WINDOW_VERSION =
  "internal_paper_drift_metric_window_v1" as const;

export type InternalPaperDriftRegimeShare = Readonly<{
  regime: string;
  share: number;
}>;

export type InternalPaperDriftMetricWindow = Readonly<{
  metric_window_version: typeof INTERNAL_PAPER_DRIFT_METRIC_WINDOW_VERSION;
  source_digest: string;
  observed_at: string;
  window_start: string;
  window_end: string;
  observation_count: number;
  operating_status: "healthy" | "outage";
  feature_missing_rate: number | null;
  regime_distribution: readonly InternalPaperDriftRegimeShare[] | null;
  net_expectancy_r: number | null;
  calibration_error: number | null;
  outcome_coverage: number | null;
  execution_cost_r: number | null;
}>;

export type InternalPaperDriftHealthPolicy = Readonly<{
  policy_version: string;
  policy_frozen_at: string;
  evaluated_at: string;
  minimum_rolling_observations: number;
  narrow_feature_missing_rate_increase: number;
  pause_feature_missing_rate_increase: number;
  narrow_regime_distribution_distance: number;
  pause_regime_distribution_distance: number;
  narrow_expectancy_r_decline: number;
  pause_expectancy_r_decline: number;
  narrow_calibration_error_increase: number;
  pause_calibration_error_increase: number;
  narrow_outcome_coverage_decline: number;
  pause_outcome_coverage_decline: number;
  narrow_execution_cost_r_increase: number;
  pause_execution_cost_r_increase: number;
}>;

export type InternalPaperDriftHealthInput = Readonly<{
  drift_health_version: typeof INTERNAL_PAPER_DRIFT_HEALTH_VERSION;
  policy: InternalPaperDriftHealthPolicy;
  baseline: InternalPaperDriftMetricWindow;
  rolling: InternalPaperDriftMetricWindow;
}>;

export type InternalPaperDriftDimension =
  | "feature_missing_rate"
  | "regime_distribution"
  | "net_expectancy_r"
  | "calibration_error"
  | "outcome_coverage"
  | "execution_cost_r";

export type InternalPaperDriftMetricDeltas = Readonly<{
  feature_missing_rate: number | null;
  regime_distribution_distance: number | null;
  expectancy_r_decline: number | null;
  calibration_error_increase: number | null;
  outcome_coverage_decline: number | null;
  execution_cost_r_increase: number | null;
}>;

type Authority = Readonly<{
  can_request_provider_data: false;
  can_change_ranking_or_publication: false;
  can_persist_or_pause_runtime: false;
  can_promote_strategy: false;
  can_execute_broker_action: false;
}>;

export type InternalPaperDriftHealthResult =
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION;
      drift_health_version: typeof INTERNAL_PAPER_DRIFT_HEALTH_VERSION;
      status: "blocked";
      action: "pause";
      classification: "unsupported_evidence";
      reason_codes: string[];
      input_digest: string | null;
      metric_deltas: null;
      authority: Authority;
      result_digest: string;
    }>
  | Readonly<{
      result_version: typeof INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION;
      drift_health_version: typeof INTERNAL_PAPER_DRIFT_HEALTH_VERSION;
      status: "completed";
      action: "continue" | "narrow" | "pause";
      classification:
        | "healthy"
        | "statistical_drift"
        | "operational_outage"
        | "insufficient_evidence";
      reason_codes: string[];
      input_digest: string;
      baseline_source_digest: string;
      rolling_source_digest: string;
      drift_dimensions: readonly InternalPaperDriftDimension[];
      metric_deltas: InternalPaperDriftMetricDeltas;
      evidence_limits: readonly [
        "source_only_drift_health_gate",
        "requires_durable_versioned_metric_windows",
        "requires_forward_false_alarm_evidence",
        "no_automatic_runtime_pause_or_policy_promotion",
      ];
      authority: Authority;
      result_digest: string;
    }>;

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const AUTHORITY: Authority = Object.freeze({
  can_request_provider_data: false,
  can_change_ranking_or_publication: false,
  can_persist_or_pause_runtime: false,
  can_promote_strategy: false,
  can_execute_broker_action: false,
});
const EVIDENCE_LIMITS = Object.freeze([
  "source_only_drift_health_gate",
  "requires_durable_versioned_metric_windows",
  "requires_forward_false_alarm_evidence",
  "no_automatic_runtime_pause_or_policy_promotion",
] as const);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonical(value: unknown): unknown {
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

function terminal<T extends object>(value: T): T & { result_digest: string } {
  return deepFreeze({ ...value, result_digest: digest(value) });
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function rate(value: unknown): value is number {
  return finite(value) && value >= 0 && value <= 1;
}

function nonNegative(value: unknown): value is number {
  return finite(value) && value >= 0;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function round(value: number) {
  return Number(value.toFixed(9));
}

function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values)).sort();
}

function windowReasons(
  window: InternalPaperDriftMetricWindow,
  role: "baseline" | "rolling",
) {
  if (!isRecord(window)) return [`${role}_window_invalid`];
  const reasons: string[] = [];
  if (
    window.metric_window_version !== INTERNAL_PAPER_DRIFT_METRIC_WINDOW_VERSION ||
    !SHA256_PATTERN.test(window.source_digest) ||
    !explicitInstant(window.observed_at) ||
    !explicitInstant(window.window_start) ||
    !explicitInstant(window.window_end) ||
    Date.parse(window.window_start) >= Date.parse(window.window_end) ||
    Date.parse(window.window_end) > Date.parse(window.observed_at) ||
    !Number.isSafeInteger(window.observation_count) ||
    window.observation_count <= 0 ||
    !["healthy", "outage"].includes(window.operating_status)
  ) {
    reasons.push(`${role}_window_invalid`);
    return reasons;
  }

  if (window.operating_status === "outage") {
    if (role === "baseline") reasons.push("baseline_window_outage");
    return reasons;
  }

  if (
    !rate(window.feature_missing_rate) ||
    !Array.isArray(window.regime_distribution) ||
    !finite(window.net_expectancy_r) ||
    !rate(window.calibration_error) ||
    !rate(window.outcome_coverage) ||
    !nonNegative(window.execution_cost_r)
  ) {
    reasons.push(`${role}_window_metrics_invalid`);
    return reasons;
  }
  const regimes = new Set<string>();
  let totalShare = 0;
  for (const item of window.regime_distribution) {
    const regime = text(item?.regime);
    if (!regime || regimes.has(regime) || !rate(item?.share)) {
      reasons.push(`${role}_window_metrics_invalid`);
      break;
    }
    regimes.add(regime);
    totalShare += item.share;
  }
  if (regimes.size === 0 || Math.abs(totalShare - 1) > 0.000000001) {
    reasons.push(`${role}_window_metrics_invalid`);
  }
  return uniqueSorted(reasons);
}

function policyReasons(policy: InternalPaperDriftHealthPolicy) {
  if (!isRecord(policy)) return ["drift_health_policy_invalid"];
  const reasons: string[] = [];
  if (
    !text(policy.policy_version) ||
    !explicitInstant(policy.policy_frozen_at) ||
    !explicitInstant(policy.evaluated_at) ||
    Date.parse(policy.policy_frozen_at) > Date.parse(policy.evaluated_at)
  ) {
    reasons.push("drift_health_policy_invalid");
  }
  if (
    !Number.isSafeInteger(policy.minimum_rolling_observations) ||
    policy.minimum_rolling_observations <= 0
  ) {
    reasons.push("drift_health_policy_invalid");
  }
  const boundedRateLimits: Array<[unknown, unknown]> = [
    [
      policy.narrow_feature_missing_rate_increase,
      policy.pause_feature_missing_rate_increase,
    ],
    [
      policy.narrow_regime_distribution_distance,
      policy.pause_regime_distribution_distance,
    ],
    [
      policy.narrow_calibration_error_increase,
      policy.pause_calibration_error_increase,
    ],
    [policy.narrow_outcome_coverage_decline, policy.pause_outcome_coverage_decline],
  ];
  const nonNegativeLimits: Array<[unknown, unknown]> = [
    [policy.narrow_expectancy_r_decline, policy.pause_expectancy_r_decline],
    [
      policy.narrow_execution_cost_r_increase,
      policy.pause_execution_cost_r_increase,
    ],
  ];
  if (
    boundedRateLimits.some(
      ([narrow, pause]) => !rate(narrow) || !rate(pause) || narrow > pause,
    ) ||
    nonNegativeLimits.some(
      ([narrow, pause]) =>
        !nonNegative(narrow) || !nonNegative(pause) || narrow > pause,
    )
  ) {
    reasons.push("drift_health_policy_invalid");
  }
  return uniqueSorted(reasons);
}

function regimeDistance(
  baseline: readonly InternalPaperDriftRegimeShare[],
  rolling: readonly InternalPaperDriftRegimeShare[],
) {
  const values = new Map<string, { baseline: number; rolling: number }>();
  for (const item of baseline) {
    values.set(text(item.regime), { baseline: item.share, rolling: 0 });
  }
  for (const item of rolling) {
    const current = values.get(text(item.regime)) ?? { baseline: 0, rolling: 0 };
    current.rolling = item.share;
    values.set(text(item.regime), current);
  }
  return round(
    [...values.values()].reduce(
      (total, item) => total + Math.abs(item.baseline - item.rolling),
      0,
    ) / 2,
  );
}

function blocked(reasonCodes: string[], input: unknown): InternalPaperDriftHealthResult {
  return terminal({
    result_version: INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION,
    drift_health_version: INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
    status: "blocked" as const,
    action: "pause" as const,
    classification: "unsupported_evidence" as const,
    reason_codes: uniqueSorted(reasonCodes),
    input_digest: input ? digest(input) : null,
    metric_deltas: null,
    authority: AUTHORITY,
  });
}

export function verifyInternalPaperDriftHealthDigest(
  result: InternalPaperDriftHealthResult,
) {
  const { result_digest: resultDigest, ...payload } = result;
  return SHA256_PATTERN.test(resultDigest) && digest(payload) === resultDigest;
}

/**
 * Produces an advisory action from frozen metric windows. The action is a
 * receipt for a future durable monitor; it has no path to a runtime pause or
 * strategy promotion.
 */
export function evaluateInternalPaperDriftHealth(
  input: InternalPaperDriftHealthInput,
): InternalPaperDriftHealthResult {
  if (!isRecord(input) || input.drift_health_version !== INTERNAL_PAPER_DRIFT_HEALTH_VERSION) {
    return blocked(["drift_health_version_invalid"], input);
  }
  const reasons = [
    ...policyReasons(input.policy),
    ...windowReasons(input.baseline, "baseline"),
    ...windowReasons(input.rolling, "rolling"),
  ];
  if (reasons.length > 0) return blocked(reasons, input);
  const policy = input.policy;
  const baseline = input.baseline;
  const rolling = input.rolling;
  if (
    Date.parse(baseline.window_end) > Date.parse(rolling.window_start) ||
    Date.parse(baseline.observed_at) > Date.parse(rolling.window_start) ||
    Date.parse(policy.policy_frozen_at) > Date.parse(rolling.window_start) ||
    Date.parse(rolling.observed_at) > Date.parse(policy.evaluated_at)
  ) {
    return blocked(["metric_window_order_invalid"], input);
  }

  if (rolling.operating_status === "outage") {
    return terminal({
      result_version: INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION,
      drift_health_version: INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
      status: "completed" as const,
      action: "pause" as const,
      classification: "operational_outage" as const,
      reason_codes: ["operational_outage_detected"],
      input_digest: digest(input),
      baseline_source_digest: baseline.source_digest,
      rolling_source_digest: rolling.source_digest,
      drift_dimensions: [] as const,
      metric_deltas: {
        feature_missing_rate: null,
        regime_distribution_distance: null,
        expectancy_r_decline: null,
        calibration_error_increase: null,
        outcome_coverage_decline: null,
        execution_cost_r_increase: null,
      },
      evidence_limits: EVIDENCE_LIMITS,
      authority: AUTHORITY,
    });
  }

  const metricDeltas: InternalPaperDriftMetricDeltas = {
    feature_missing_rate: round(rolling.feature_missing_rate! - baseline.feature_missing_rate!),
    regime_distribution_distance: regimeDistance(
      baseline.regime_distribution!,
      rolling.regime_distribution!,
    ),
    expectancy_r_decline: round(baseline.net_expectancy_r! - rolling.net_expectancy_r!),
    calibration_error_increase: round(rolling.calibration_error! - baseline.calibration_error!),
    outcome_coverage_decline: round(baseline.outcome_coverage! - rolling.outcome_coverage!),
    execution_cost_r_increase: round(rolling.execution_cost_r! - baseline.execution_cost_r!),
  };
  if (rolling.observation_count < policy.minimum_rolling_observations) {
    return terminal({
      result_version: INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION,
      drift_health_version: INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
      status: "completed" as const,
      action: "narrow" as const,
      classification: "insufficient_evidence" as const,
      reason_codes: ["rolling_window_minimum_sample_unmet"],
      input_digest: digest(input),
      baseline_source_digest: baseline.source_digest,
      rolling_source_digest: rolling.source_digest,
      drift_dimensions: [] as const,
      metric_deltas: metricDeltas,
      evidence_limits: EVIDENCE_LIMITS,
      authority: AUTHORITY,
    });
  }

  const dimensions: Array<{
    dimension: InternalPaperDriftDimension;
    value: number;
    narrow: number;
    pause: number;
  }> = [
    {
      dimension: "feature_missing_rate",
      value: metricDeltas.feature_missing_rate!,
      narrow: policy.narrow_feature_missing_rate_increase,
      pause: policy.pause_feature_missing_rate_increase,
    },
    {
      dimension: "regime_distribution",
      value: metricDeltas.regime_distribution_distance!,
      narrow: policy.narrow_regime_distribution_distance,
      pause: policy.pause_regime_distribution_distance,
    },
    {
      dimension: "net_expectancy_r",
      value: metricDeltas.expectancy_r_decline!,
      narrow: policy.narrow_expectancy_r_decline,
      pause: policy.pause_expectancy_r_decline,
    },
    {
      dimension: "calibration_error",
      value: metricDeltas.calibration_error_increase!,
      narrow: policy.narrow_calibration_error_increase,
      pause: policy.pause_calibration_error_increase,
    },
    {
      dimension: "outcome_coverage",
      value: metricDeltas.outcome_coverage_decline!,
      narrow: policy.narrow_outcome_coverage_decline,
      pause: policy.pause_outcome_coverage_decline,
    },
    {
      dimension: "execution_cost_r",
      value: metricDeltas.execution_cost_r_increase!,
      narrow: policy.narrow_execution_cost_r_increase,
      pause: policy.pause_execution_cost_r_increase,
    },
  ];
  const pauseDimensions = dimensions
    .filter((item) => item.value > item.pause)
    .map((item) => item.dimension);
  const narrowDimensions = dimensions
    .filter((item) => item.value > item.narrow)
    .map((item) => item.dimension);
  const driftDimensions = uniqueSorted([...pauseDimensions, ...narrowDimensions]);
  const action = pauseDimensions.length > 0 ? "pause" : narrowDimensions.length > 0 ? "narrow" : "continue";

  return terminal({
    result_version: INTERNAL_PAPER_DRIFT_HEALTH_RESULT_VERSION,
    drift_health_version: INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
    status: "completed" as const,
    action,
    classification: action === "continue" ? "healthy" : "statistical_drift",
    reason_codes: driftDimensions.map((item) => `${item}_deteriorated`),
    input_digest: digest(input),
    baseline_source_digest: baseline.source_digest,
    rolling_source_digest: rolling.source_digest,
    drift_dimensions: driftDimensions,
    metric_deltas: metricDeltas,
    evidence_limits: EVIDENCE_LIMITS,
    authority: AUTHORITY,
  });
}
