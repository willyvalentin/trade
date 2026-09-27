export const SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_EVALUATION_READBACK_VERSION =
  "scanner_clock_prior_shadow_forward_evaluation_readback_v1" as const;

export type ScannerClockPriorShadowForwardEvaluationReadbackStatus =
  | "available"
  | "not_ready"
  | "conflicting"
  | "unavailable"
  | "invalid";

type Decision = "pending" | "continue" | "narrow" | "reject";
type EvaluationStatus =
  | "invalid_plan"
  | "conflicting"
  | "evidence_incomplete"
  | "decision_ready";
type PartitionName = "held_out" | "walk_forward";
type DiagnosticStatus =
  | "insufficient_evidence"
  | "no_conservative_regression"
  | "conservative_regression_detected";
type DiagnosticDimension = "setup" | "regime" | "sector" | "ticker";

export type ScannerClockPriorShadowForwardEvaluationReadback = Readonly<{
  readback_version:
    typeof SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_EVALUATION_READBACK_VERSION;
  status: ScannerClockPriorShadowForwardEvaluationReadbackStatus;
  blocker: string | null;
  plan: Readonly<{
    plan_id: string;
    plan_fingerprint: string;
  }> | null;
  durable_result: Readonly<{
    result_id: string;
    result_fingerprint: string;
    recorded_at: string;
  }> | null;
  evaluation: Readonly<{
    status: EvaluationStatus;
    decision: Decision;
    reason_codes: readonly string[];
    partitions: readonly Readonly<{
      partition: PartitionName;
      opportunity_set_count: number;
      no_trade_opportunity_set_count: number;
      ranked_candidate_count: number;
      trading_day_count: number;
      baseline_precision: number | null;
      candidate_precision: number | null;
      precision_delta: number | null;
      conservative_precision_delta_lower: number | null;
      conservative_precision_delta_upper: number | null;
      evidence_complete: boolean;
    }>[];
  }> | null;
  context_diagnostic: Readonly<{
    contract_version: "scanner_clock_prior_shadow_context_diagnostic_v1";
    diagnostic_fingerprint: string;
    status: DiagnosticStatus;
    pair_counts: Readonly<{
      total: number;
      eligible: number;
      conservative_regression: number;
      missing_arm: number;
      incomplete_partition_coverage: number;
      minimum_resolved_not_met: number;
    }>;
    priority_context: Readonly<{
      dimension: DiagnosticDimension;
      key: string;
      baseline_resolved_outcomes: number;
      candidate_resolved_outcomes: number;
      baseline_precision: number | null;
      candidate_precision: number | null;
      precision_delta: number | null;
      conservative_regression_gap: number | null;
      expectancy_delta_r: number | null;
    }> | null;
  }> | null;
  authority: Readonly<{
    can_request_provider_data: false;
    can_reserve_provider_credits: false;
    can_change_ranking_or_publication: false;
    can_promote_policy: false;
    can_publish_candidate: false;
    can_create_paper_position: false;
    can_execute_broker_action: false;
  }>;
}>;

const inertAuthority = Object.freeze({
  can_request_provider_data: false as const,
  can_reserve_provider_credits: false as const,
  can_change_ranking_or_publication: false as const,
  can_promote_policy: false as const,
  can_publish_candidate: false as const,
  can_create_paper_position: false as const,
  can_execute_broker_action: false as const,
});

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function stringArrayOrNull(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function finiteNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalFiniteNumber(value: unknown) {
  return value === null ? null : finiteNumberOrNull(value);
}

function canonicalIso(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === text
    ? text
    : null;
}

function sha256OrNull(value: unknown) {
  const text = textOrNull(value);
  return text && /^[0-9a-f]{64}$/.test(text) ? text : null;
}

function uuidOrNull(value: unknown) {
  const text = textOrNull(value);
  return text &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        text,
      )
    ? text
    : null;
}

function authorityIsInert(value: unknown) {
  const authority = objectOrNull(value);
  return Boolean(
    authority &&
      authority.can_request_provider_data === false &&
      authority.can_reserve_provider_credits === false &&
      authority.can_change_ranking_or_publication === false &&
      authority.can_promote_policy === false &&
      authority.can_publish_candidate === false &&
      authority.can_create_paper_position === false &&
      authority.can_execute_broker_action === false,
  );
}

export function unavailableScannerClockPriorShadowForwardEvaluationReadback(
  status: Exclude<
    ScannerClockPriorShadowForwardEvaluationReadbackStatus,
    "available"
  >,
  blocker: string,
): ScannerClockPriorShadowForwardEvaluationReadback {
  return Object.freeze({
    readback_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_EVALUATION_READBACK_VERSION,
    status,
    blocker,
    plan: null,
    durable_result: null,
    evaluation: null,
    context_diagnostic: null,
    authority: inertAuthority,
  });
}

function responseFailureStatus(responseStatus: number) {
  if (responseStatus === 409) return "not_ready" as const;
  if (responseStatus === 422) return "conflicting" as const;
  return "unavailable" as const;
}

function parsePartition(value: unknown) {
  const partition = objectOrNull(value);
  const name = partition?.partition;
  const precisionDelta = objectOrNull(partition?.precision_delta);
  const baselinePrecision = objectOrNull(partition?.baseline_precision);
  const candidatePrecision = objectOrNull(partition?.candidate_precision);
  const parsed = {
    partition: name,
    opportunity_set_count: nonNegativeInteger(partition?.opportunity_set_count),
    no_trade_opportunity_set_count: nonNegativeInteger(
      partition?.no_trade_opportunity_set_count,
    ),
    ranked_candidate_count: nonNegativeInteger(partition?.ranked_candidate_count),
    trading_day_count: nonNegativeInteger(partition?.trading_day_count),
    baseline_precision: optionalFiniteNumber(baselinePrecision?.value ?? null),
    candidate_precision: optionalFiniteNumber(candidatePrecision?.value ?? null),
    precision_delta: optionalFiniteNumber(precisionDelta?.value ?? null),
    conservative_precision_delta_lower: optionalFiniteNumber(
      precisionDelta?.conservative_lower ?? null,
    ),
    conservative_precision_delta_upper: optionalFiniteNumber(
      precisionDelta?.conservative_upper ?? null,
    ),
    evidence_complete: partition?.evidence_complete,
  };
  if (
    (name !== "held_out" && name !== "walk_forward") ||
    parsed.opportunity_set_count === null ||
    parsed.no_trade_opportunity_set_count === null ||
    parsed.ranked_candidate_count === null ||
    parsed.trading_day_count === null ||
    (baselinePrecision !== null && parsed.baseline_precision === null) ||
    (candidatePrecision !== null && parsed.candidate_precision === null) ||
    (precisionDelta !== null &&
      (parsed.precision_delta === null ||
        parsed.conservative_precision_delta_lower === null ||
        parsed.conservative_precision_delta_upper === null)) ||
    typeof parsed.evidence_complete !== "boolean"
  ) return null;
  return Object.freeze({
    ...parsed,
    partition: name,
    opportunity_set_count: parsed.opportunity_set_count,
    no_trade_opportunity_set_count: parsed.no_trade_opportunity_set_count,
    ranked_candidate_count: parsed.ranked_candidate_count,
    trading_day_count: parsed.trading_day_count,
    evidence_complete: parsed.evidence_complete,
  });
}

function parseEvaluation(value: unknown) {
  const evaluation = objectOrNull(value);
  const status = evaluation?.status;
  const decision = evaluation?.decision;
  const reasonCodes = stringArrayOrNull(evaluation?.reason_codes);
  const partitions = Array.isArray(evaluation?.partitions)
    ? evaluation.partitions.map(parsePartition)
    : [];
  if (
    ![
      "invalid_plan",
      "conflicting",
      "evidence_incomplete",
      "decision_ready",
    ].includes(String(status)) ||
    !["pending", "continue", "narrow", "reject"].includes(String(decision)) ||
    !reasonCodes ||
    partitions.some((partition) => partition === null) ||
    new Set(partitions.map((partition) => partition?.partition)).size !==
      partitions.length ||
    (status === "decision_ready") !== (decision !== "pending") ||
    evaluation?.shadow_only !== true ||
    evaluation?.live_ranking_effect !== false ||
    evaluation?.publication_effect !== false ||
    evaluation?.causal_improvement_claimed !== false
  ) return null;
  return Object.freeze({
    status: status as EvaluationStatus,
    decision: decision as Decision,
    reason_codes: Object.freeze(reasonCodes),
    partitions: Object.freeze(partitions.filter((partition) => partition !== null)),
  });
}

function parsePriorityContext(value: unknown) {
  if (value === null) return null;
  const context = objectOrNull(value);
  const baseline = objectOrNull(context?.baseline);
  const candidate = objectOrNull(context?.candidate);
  const baselinePrecision = objectOrNull(baseline?.precision);
  const candidatePrecision = objectOrNull(candidate?.precision);
  const dimension = context?.dimension;
  const key = textOrNull(context?.key);
  const parsed = {
    baseline_resolved_outcomes: nonNegativeInteger(baseline?.resolved_outcome_count),
    candidate_resolved_outcomes: nonNegativeInteger(candidate?.resolved_outcome_count),
    baseline_precision: optionalFiniteNumber(baselinePrecision?.value ?? null),
    candidate_precision: optionalFiniteNumber(candidatePrecision?.value ?? null),
    precision_delta: optionalFiniteNumber(context?.precision_delta ?? null),
    conservative_regression_gap: optionalFiniteNumber(
      context?.conservative_regression_gap ?? null,
    ),
    expectancy_delta_r: optionalFiniteNumber(context?.expectancy_delta_r ?? null),
  };
  if (
    !["setup", "regime", "sector", "ticker"].includes(String(dimension)) ||
    !key ||
    context?.eligibility !== "eligible" ||
    context?.classification !== "conservative_regression" ||
    parsed.baseline_resolved_outcomes === null ||
    parsed.candidate_resolved_outcomes === null ||
    (baselinePrecision !== null && parsed.baseline_precision === null) ||
    (candidatePrecision !== null && parsed.candidate_precision === null) ||
    parsed.conservative_regression_gap === null ||
    parsed.conservative_regression_gap <= 0
  ) return null;
  return Object.freeze({
    dimension: dimension as DiagnosticDimension,
    key,
    ...parsed,
    baseline_resolved_outcomes: parsed.baseline_resolved_outcomes,
    candidate_resolved_outcomes: parsed.candidate_resolved_outcomes,
  });
}

function parseContextDiagnostic({
  value,
  plan,
  durableResult,
  evaluation,
}: {
  value: unknown;
  plan: { plan_id: string; plan_fingerprint: string };
  durableResult: {
    result_id: string;
    result_fingerprint: string;
    recorded_at: string;
  } | null;
  evaluation: NonNullable<
    ScannerClockPriorShadowForwardEvaluationReadback["evaluation"]
  >;
}) {
  if (value === null) return null;
  const diagnostic = objectOrNull(value);
  const source = objectOrNull(diagnostic?.source);
  const pairCounts = objectOrNull(diagnostic?.pair_counts);
  const priorityContext = parsePriorityContext(diagnostic?.priority_context);
  const status = diagnostic?.status;
  const counts = {
    total: nonNegativeInteger(pairCounts?.total),
    eligible: nonNegativeInteger(pairCounts?.eligible),
    conservative_regression: nonNegativeInteger(
      pairCounts?.conservative_regression,
    ),
    missing_arm: nonNegativeInteger(pairCounts?.missing_arm),
    incomplete_partition_coverage: nonNegativeInteger(
      pairCounts?.incomplete_partition_coverage,
    ),
    minimum_resolved_not_met: nonNegativeInteger(
      pairCounts?.minimum_resolved_not_met,
    ),
  };
  const total = counts.total ?? -1;
  const eligible = counts.eligible ?? -1;
  const conservativeRegression = counts.conservative_regression ?? -1;
  const missingArm = counts.missing_arm ?? -1;
  const incompletePartitionCoverage =
    counts.incomplete_partition_coverage ?? -1;
  const minimumResolvedNotMet = counts.minimum_resolved_not_met ?? -1;
  const diagnosticFingerprint = sha256OrNull(diagnostic?.diagnostic_fingerprint);
  if (
    !durableResult ||
    diagnostic?.contract_version !==
      "scanner_clock_prior_shadow_context_diagnostic_v1" ||
    !diagnosticFingerprint ||
    ![
      "insufficient_evidence",
      "no_conservative_regression",
      "conservative_regression_detected",
    ].includes(String(status)) ||
    Object.values(counts).some((count) => count === null) ||
    total !==
      eligible + missingArm + incompletePartitionCoverage +
        minimumResolvedNotMet ||
    conservativeRegression > eligible ||
    (status === "conservative_regression_detected") !==
      (conservativeRegression > 0) ||
    (status === "insufficient_evidence") !== (eligible === 0) ||
    (status === "no_conservative_regression") !==
      (eligible > 0 && conservativeRegression === 0) ||
    (status === "conservative_regression_detected") !==
      (priorityContext !== null) ||
    source?.result_id !== durableResult.result_id ||
    source?.result_fingerprint !== durableResult.result_fingerprint ||
    source?.plan_id !== plan.plan_id ||
    source?.plan_fingerprint !== plan.plan_fingerprint ||
    source?.terminal_decision !== evaluation.decision ||
    diagnostic?.shadow_only !== true ||
    diagnostic?.live_ranking_effect !== false ||
    diagnostic?.publication_effect !== false ||
    diagnostic?.causal_improvement_claimed !== false
  ) return undefined;
  return Object.freeze({
    contract_version:
      "scanner_clock_prior_shadow_context_diagnostic_v1" as const,
    diagnostic_fingerprint: diagnosticFingerprint,
    status: status as DiagnosticStatus,
    pair_counts: Object.freeze({
      total,
      eligible,
      conservative_regression: conservativeRegression,
      missing_arm: missingArm,
      incomplete_partition_coverage: incompletePartitionCoverage,
      minimum_resolved_not_met: minimumResolvedNotMet,
    }),
    priority_context: priorityContext,
  });
}

export function scannerClockPriorShadowForwardEvaluationReadbackFromUnknown(
  value: unknown,
  responseStatus = 200,
): ScannerClockPriorShadowForwardEvaluationReadback {
  const payload = objectOrNull(value);
  if (!authorityIsInert(payload?.authority)) {
    return unavailableScannerClockPriorShadowForwardEvaluationReadback(
      "invalid",
      "clock_prior_forward_evaluation_authority_invalid",
    );
  }
  if (responseStatus < 200 || responseStatus >= 300) {
    return unavailableScannerClockPriorShadowForwardEvaluationReadback(
      responseFailureStatus(responseStatus),
      textOrNull(payload?.blocker) ??
        "clock_prior_forward_evaluation_readback_unavailable",
    );
  }
  if (payload?.status !== "available") {
    return unavailableScannerClockPriorShadowForwardEvaluationReadback(
      "invalid",
      "clock_prior_forward_evaluation_readback_invalid",
    );
  }

  const planReceipt = objectOrNull(payload.plan_receipt);
  const durableResultReceipt = payload.durable_result_receipt === null
    ? null
    : objectOrNull(payload.durable_result_receipt);
  const plan = {
    plan_id: uuidOrNull(planReceipt?.plan_id),
    plan_fingerprint: sha256OrNull(planReceipt?.plan_fingerprint),
  };
  const durableResult = durableResultReceipt
    ? {
        result_id: uuidOrNull(durableResultReceipt.result_id),
        result_fingerprint: sha256OrNull(
          durableResultReceipt.result_fingerprint,
        ),
        recorded_at: canonicalIso(durableResultReceipt.recorded_at),
      }
    : null;
  const evaluation = parseEvaluation(payload.evaluation);
  if (
    !plan.plan_id ||
    !plan.plan_fingerprint ||
    !evaluation ||
    (durableResult !== null &&
      (!durableResult.result_id ||
        !durableResult.result_fingerprint ||
        !durableResult.recorded_at))
  ) {
    return unavailableScannerClockPriorShadowForwardEvaluationReadback(
      "invalid",
      "clock_prior_forward_evaluation_readback_invalid",
    );
  }
  const normalizedPlan = Object.freeze({
    plan_id: plan.plan_id,
    plan_fingerprint: plan.plan_fingerprint,
  });
  const normalizedDurableResult = durableResult
    ? Object.freeze({
        result_id: durableResult.result_id!,
        result_fingerprint: durableResult.result_fingerprint!,
        recorded_at: durableResult.recorded_at!,
      })
    : null;
  const contextDiagnostic = parseContextDiagnostic({
    value: payload.context_diagnostic,
    plan: normalizedPlan,
    durableResult: normalizedDurableResult,
    evaluation,
  });
  if (
    contextDiagnostic === undefined ||
    (normalizedDurableResult !== null &&
      (evaluation.status !== "decision_ready" || contextDiagnostic === null))
  ) {
    return unavailableScannerClockPriorShadowForwardEvaluationReadback(
      "invalid",
      "clock_prior_forward_context_diagnostic_invalid",
    );
  }

  return Object.freeze({
    readback_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_EVALUATION_READBACK_VERSION,
    status: "available",
    blocker: null,
    plan: normalizedPlan,
    durable_result: normalizedDurableResult,
    evaluation,
    context_diagnostic: contextDiagnostic,
    authority: inertAuthority,
  });
}
