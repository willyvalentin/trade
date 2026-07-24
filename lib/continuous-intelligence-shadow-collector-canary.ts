import {
  boundedShadowCollectorExecutionProofFingerprint,
  boundedShadowCollectorExecutionProofRuntime,
  buildBoundedShadowCollectorExecutionProofBlockedResult,
  buildBoundedShadowCollectorExecutionProofPlan,
  type BoundedShadowCollectorExecutionProofProvider,
  type BoundedShadowCollectorExecutionProofPreflightResult,
  type BoundedShadowCollectorExecutionProofRequest,
} from "@/lib/bounded-shadow-collector-execution-proof";
import {
  boundedShadowCollectorLiveProofReceiptContractVersion,
  buildBoundedShadowCollectorLiveProofReceipt,
  type BoundedShadowCollectorLiveProofReceipt,
} from "@/lib/bounded-shadow-collector-live-proof-receipt";
import {
  continuousIntelligenceShadowCanaryClaimContractVersion,
  continuousIntelligenceShadowCanaryClaimTableName,
  buildContinuousIntelligenceShadowCanaryExecutionId,
  type ContinuousIntelligenceShadowCanaryLifecycleIdentity,
  type ContinuousIntelligenceShadowCanaryClaimResult,
} from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import {
  buildContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics,
  type ContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics,
} from "@/lib/continuous-intelligence-shadow-canary-activation-readiness";
import {
  usEquityMarketCalendarContractVersion,
  usEquityMarketCalendarCoverage,
  usEquityMarketCalendarSourceCategory,
  type UsEquityMarketCalendarEvaluation,
  type UsEquityMarketCalendarFreshnessStatus,
  type UsEquityMarketCalendarVerificationStatus,
} from "@/lib/us-equity-market-calendar-contract";

export const continuousIntelligenceShadowCollectorCanaryContractVersion =
  "continuous_intelligence_shadow_collector_canary_v1" as const;
export const continuousIntelligenceShadowCollectorCanaryRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary" as const;
export const continuousIntelligenceShadowCollectorCanaryPreflightRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/preflight" as const;
export const continuousIntelligenceShadowCollectorCanaryFlagName =
  "TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_ENABLED" as const;
export const continuousIntelligenceShadowCollectorCanaryKillSwitchName =
  "TURE_CONTINUOUS_INTELLIGENCE_SHADOW_CANARY_KILL_SWITCH" as const;
export const continuousIntelligenceShadowCollectorCanaryAllowlist = ["AAPL"] as const;
export const continuousIntelligenceShadowCollectorCanaryLimits = {
  max_tickers_per_run: 1,
  max_provider_requests_per_run: 1,
  max_estimated_credits_per_run: 1,
  interval: "5min",
  max_range_ms: 30 * 60 * 1000,
  provider_timeout_ms: 5_000,
  max_runs_per_utc_day: 2,
  max_estimated_credits_per_utc_day: 2,
  reserve_credits: 0,
  automatic_retries: 0,
} as const;

export type ContinuousIntelligenceShadowCanaryBlocker =
  | "canary_disabled"
  | "canary_kill_switch_active"
  | "canary_configuration_invalid"
  | "canary_range_unavailable"
  | "canary_market_calendar_unavailable"
  | "canary_planner_authorization_unavailable"
  | "canary_runtime_busy"
  | "daily_usage_unavailable"
  | "daily_run_limit_reached"
  | "daily_credit_limit_reached"
  | "provider_not_configured"
  | "provider_metadata_unresolved"
  | "provider_timeout"
  | "provider_failure"
  | "invalid_provider_response"
  | "audit_unavailable"
  | "ledger_unavailable";

export type ContinuousIntelligenceShadowCanaryCalendar =
  UsEquityMarketCalendarEvaluation;

export type ContinuousIntelligenceShadowCanaryDailyUsage = {
  status: "available" | "schema_unavailable" | "persistence_failed";
  run_count: number | null;
  estimated_credits: number | null;
};

export type ContinuousIntelligenceShadowCanaryRange = {
  ticker: (typeof continuousIntelligenceShadowCollectorCanaryAllowlist)[number];
  interval: "5min";
  start: string;
  end: string;
};

export type ContinuousIntelligenceShadowCanaryPreflight = {
  contract_version: typeof continuousIntelligenceShadowCollectorCanaryContractVersion;
  generated_at: string;
  eligible: boolean;
  status: "ready" | "blocked";
  blockers: ContinuousIntelligenceShadowCanaryBlocker[];
  request: ContinuousIntelligenceShadowCanaryRange | null;
  market_calendar: UsEquityMarketCalendarEvaluation;
  daily_usage: ContinuousIntelligenceShadowCanaryDailyUsage;
  limits: typeof continuousIntelligenceShadowCollectorCanaryLimits;
  planner_authorization: {
    workload_id: string;
    workload_class: string;
    rest_layer: string | null;
    demand_source: string;
    proof_executable_credits: 1;
  } | null;
  canonical_execution_context: {
    proof_preflight: BoundedShadowCollectorExecutionProofPreflightResult;
    budget_plan: ReturnType<typeof buildBoundedShadowCollectorExecutionProofPlan>["budget_plan"];
    ticker_input_source: ReturnType<typeof buildBoundedShadowCollectorExecutionProofPlan>["ticker_input_source"];
    evaluation_now: Date | string;
    provider_configured: boolean;
    provider_metadata_status: string | null;
  } | null;
  no_effect_boundary: {
    provider_calls_executed: false;
    durable_writes_executed: false;
    runtime_capacity_reserved: false;
    schedule_changes: false;
    recommendation_scanner_execution_effects: false;
  };
};

export type ContinuousIntelligenceShadowCanaryRuntimeRecheck = {
  eligible: boolean;
  status: "ready" | "blocked";
  proof_preflight: BoundedShadowCollectorExecutionProofPreflightResult | null;
  safe_blocker: "canary_runtime_busy" | "canary_planner_authorization_unavailable" | "provider_not_configured" | "provider_metadata_unresolved" | null;
};

function hasOnlyDisabledDefaultBlockers(preflight: ContinuousIntelligenceShadowCanaryPreflight) {
  return preflight.blockers.length === 2 &&
    preflight.blockers.includes("canary_disabled") &&
    preflight.blockers.includes("canary_kill_switch_active");
}

export function isContinuousIntelligenceShadowCanaryEnabled(value: unknown) {
  return value === "true" || value === "1";
}

export function isContinuousIntelligenceShadowCanaryKillSwitchOff(value: unknown) {
  return value === "false" || value === "0";
}

export function buildContinuousIntelligenceShadowCanaryRange(input: {
  now: Date;
  calendar: ContinuousIntelligenceShadowCanaryCalendar;
}): ContinuousIntelligenceShadowCanaryRange | null {
  const range = input.calendar.latest_completed_range;
  if (
    input.calendar.verification_status !== "verified" ||
    (input.calendar.freshness_status !== "current" &&
      input.calendar.freshness_status !== "expiring_soon") ||
    range.status !== "available" ||
    !range.start ||
    !range.end
  ) {
    return null;
  }
  const start = new Date(range.start);
  const end = new Date(range.end);
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end.getTime() > input.now.getTime() ||
    end.getTime() - start.getTime() !==
      continuousIntelligenceShadowCollectorCanaryLimits.max_range_ms
  ) {
    return null;
  }
  return {
    ticker: "AAPL",
    interval: "5min",
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function buildContinuousIntelligenceShadowCanaryLifecycleIdentity(input: {
  preflight: ContinuousIntelligenceShadowCanaryPreflight;
  now: Date;
}): Readonly<ContinuousIntelligenceShadowCanaryLifecycleIdentity> | null {
  const requestFingerprint = input.preflight.canonical_execution_context?.proof_preflight.request_fingerprint;
  if (!input.preflight.request || !requestFingerprint) return null;
  const utcDay = input.now.toISOString().slice(0, 10);
  const executionId = buildContinuousIntelligenceShadowCanaryExecutionId({
    utc_day: utcDay,
    request_fingerprint: requestFingerprint,
  });
  return Object.freeze({
    claim_id: `canary_claim_${executionId}`,
    execution_id: executionId,
    request_fingerprint: requestFingerprint,
    expected_contract_version: continuousIntelligenceShadowCanaryClaimContractVersion,
    utc_day: utcDay,
    source_receipt_id: buildContinuousIntelligenceShadowCanaryReceiptId(input.preflight.request),
  });
}

export function recheckContinuousIntelligenceShadowCanaryRuntime(
  preflight: ContinuousIntelligenceShadowCanaryPreflight,
): ContinuousIntelligenceShadowCanaryRuntimeRecheck {
  const context = preflight.canonical_execution_context;
  if (!preflight.eligible || !preflight.request || !context) {
    return { eligible: false, status: "blocked", proof_preflight: null, safe_blocker: "canary_planner_authorization_unavailable" };
  }
  return buildContinuousIntelligenceShadowCanaryRuntimeRecheck(preflight);
}

export function recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease(
  preflight: ContinuousIntelligenceShadowCanaryPreflight,
): ContinuousIntelligenceShadowCanaryRuntimeRecheck {
  const context = preflight.canonical_execution_context;
  if (!hasOnlyDisabledDefaultBlockers(preflight) || !preflight.request || !context) {
    return { eligible: false, status: "blocked", proof_preflight: null, safe_blocker: "canary_planner_authorization_unavailable" };
  }
  return buildContinuousIntelligenceShadowCanaryRuntimeRecheck(preflight);
}

function buildContinuousIntelligenceShadowCanaryRuntimeRecheck(
  preflight: ContinuousIntelligenceShadowCanaryPreflight,
): ContinuousIntelligenceShadowCanaryRuntimeRecheck {
  const context = preflight.canonical_execution_context;
  if (!context || !preflight.request) {
    return { eligible: false, status: "blocked", proof_preflight: null, safe_blocker: "canary_planner_authorization_unavailable" };
  }
  const proof = boundedShadowCollectorExecutionProofRuntime.preflight({
    request: preflight.request,
    budget_plan: context.budget_plan,
    provider_configured: context.provider_configured,
    provider_metadata_status: context.provider_metadata_status,
    execution_feature_enabled: true,
    ticker_input_source: context.ticker_input_source,
    evaluation_now: context.evaluation_now,
  });
  const safeBlocker = proof.eligible
    ? null
    : proof.primary_blocker === "provider_not_configured"
      ? "provider_not_configured" as const
      : proof.primary_blocker === "provider_metadata_unresolved"
        ? "provider_metadata_unresolved" as const
        : proof.primary_blocker === "runtime_capacity_unavailable" || proof.primary_blocker === "duplicate_request_in_flight"
          ? "canary_runtime_busy" as const
          : "canary_planner_authorization_unavailable" as const;
  return {
    eligible: proof.eligible,
    status: proof.eligible ? "ready" : "blocked",
    proof_preflight: structuredClone(proof),
    safe_blocker: safeBlocker,
  };
}

export function buildContinuousIntelligenceShadowCanaryPreflight(input: {
  now: Date;
  calendar: ContinuousIntelligenceShadowCanaryCalendar;
  enabled_flag: unknown;
  kill_switch: unknown;
  provider_configured: boolean;
  provider_metadata_status: string | null;
  daily_usage: ContinuousIntelligenceShadowCanaryDailyUsage;
}) : ContinuousIntelligenceShadowCanaryPreflight {
  const request = buildContinuousIntelligenceShadowCanaryRange({ now: input.now, calendar: input.calendar });
  const blockers: ContinuousIntelligenceShadowCanaryBlocker[] = [];
  if (!isContinuousIntelligenceShadowCanaryEnabled(input.enabled_flag)) blockers.push("canary_disabled");
  if (!isContinuousIntelligenceShadowCanaryKillSwitchOff(input.kill_switch)) blockers.push("canary_kill_switch_active");
  if (
    input.calendar.verification_status !== "verified" ||
    (input.calendar.freshness_status !== "current" &&
      input.calendar.freshness_status !== "expiring_soon")
  ) blockers.push("canary_market_calendar_unavailable");
  if (!request) blockers.push("canary_range_unavailable");
  if (!input.provider_configured) blockers.push("provider_not_configured");
  if (input.provider_metadata_status !== "within_budget" && input.provider_metadata_status !== "approaching_limit") blockers.push("provider_metadata_unresolved");
  if (input.daily_usage.status !== "available" || input.daily_usage.run_count === null || input.daily_usage.estimated_credits === null) {
    blockers.push("daily_usage_unavailable");
  } else {
    if (input.daily_usage.run_count >= continuousIntelligenceShadowCollectorCanaryLimits.max_runs_per_utc_day) blockers.push("daily_run_limit_reached");
    if (input.daily_usage.estimated_credits >= continuousIntelligenceShadowCollectorCanaryLimits.max_estimated_credits_per_utc_day) blockers.push("daily_credit_limit_reached");
  }
  let plannerAuthorization: ContinuousIntelligenceShadowCanaryPreflight["planner_authorization"] = null;
  let canonicalExecutionContext: ContinuousIntelligenceShadowCanaryPreflight["canonical_execution_context"] = null;
  if (request) {
    const planner = buildBoundedShadowCollectorExecutionProofPlan({ now: input.now, provider_metadata_status: input.provider_metadata_status, proof_ticker: request.ticker });
    const proof = boundedShadowCollectorExecutionProofRuntime.preflight({
      request,
      budget_plan: planner.budget_plan,
      provider_configured: input.provider_configured,
      provider_metadata_status: input.provider_metadata_status,
      execution_feature_enabled: true,
      ticker_input_source: planner.ticker_input_source,
      evaluation_now: planner.evaluation_now,
    });
    canonicalExecutionContext = {
      proof_preflight: proof,
      budget_plan: planner.budget_plan,
      ticker_input_source: planner.ticker_input_source,
      evaluation_now: planner.evaluation_now,
      provider_configured: input.provider_configured,
      provider_metadata_status: input.provider_metadata_status,
    };
    if (!proof.eligible || !proof.planner.authorization) {
      blockers.push(
        proof.primary_blocker === "provider_not_configured"
          ? "provider_not_configured"
          : proof.primary_blocker === "provider_metadata_unresolved"
            ? "provider_metadata_unresolved"
            : proof.primary_blocker === "runtime_capacity_unavailable" || proof.primary_blocker === "duplicate_request_in_flight"
              ? "canary_runtime_busy"
              : "canary_planner_authorization_unavailable",
      );
    }
    else {
      plannerAuthorization = {
        workload_id: proof.planner.authorization.workload_id,
        workload_class: proof.planner.authorization.workload_class,
        rest_layer: proof.planner.authorization.rest_layer,
        demand_source: proof.planner.authorization.demand_source,
        proof_executable_credits: 1,
      };
    }
  }
  return {
    contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion,
    generated_at: input.now.toISOString(),
    eligible: blockers.length === 0,
    status: blockers.length === 0 ? "ready" : "blocked",
    blockers: [...new Set(blockers)],
    request,
    market_calendar: structuredClone(input.calendar),
    daily_usage: input.daily_usage,
    limits: continuousIntelligenceShadowCollectorCanaryLimits,
    planner_authorization: plannerAuthorization,
    canonical_execution_context: canonicalExecutionContext,
    no_effect_boundary: { provider_calls_executed: false, durable_writes_executed: false, runtime_capacity_reserved: false, schedule_changes: false, recommendation_scanner_execution_effects: false },
  };
}

export async function executeContinuousIntelligenceShadowCanary(input: {
  preflight: ContinuousIntelligenceShadowCanaryPreflight;
  lifecycle_identity: Readonly<ContinuousIntelligenceShadowCanaryLifecycleIdentity>;
  runtime_recheck: ContinuousIntelligenceShadowCanaryRuntimeRecheck;
  provider: BoundedShadowCollectorExecutionProofProvider;
  allow_disabled_default_override?: boolean;
}) {
  const context = input.preflight.canonical_execution_context;
  const proofPreflight = input.runtime_recheck.proof_preflight;
  if (
    (!input.preflight.eligible && !(input.allow_disabled_default_override && hasOnlyDisabledDefaultBlockers(input.preflight))) ||
    !input.preflight.request || !context || !proofPreflight
  ) {
    return {
      result: buildBoundedShadowCollectorExecutionProofBlockedResult("feature_flag_disabled", null, "Scheduled shadow canary is not eligible."),
      receipt_context: null,
    };
  }
  const receiptContext = structuredClone({
    request: input.preflight.request,
    proof_preflight: proofPreflight,
    provider_metadata_status: proofPreflight.provider.metadata_status,
    planner_authorization: proofPreflight.planner.authorization,
    preflight_generated_at: input.preflight.generated_at,
    lifecycle_identity: input.lifecycle_identity,
  });
  if (
    !input.runtime_recheck.eligible ||
    input.lifecycle_identity.request_fingerprint !== proofPreflight.request_fingerprint ||
    input.lifecycle_identity.request_fingerprint !== context.proof_preflight.request_fingerprint ||
    input.lifecycle_identity.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion
  ) {
    return {
      result: buildBoundedShadowCollectorExecutionProofBlockedResult("internal_execution_failure", proofPreflight.request_fingerprint, "Scheduled shadow canary failed after attempt authorization without entering the provider.", 0),
      receipt_context: receiptContext,
    };
  }
  const result = await boundedShadowCollectorExecutionProofRuntime.execute({
    request: input.preflight.request,
    budget_plan: context.budget_plan,
    provider_configured: context.provider_configured,
    provider_metadata_status: context.provider_metadata_status,
    execution_feature_enabled: true,
    ticker_input_source: context.ticker_input_source,
    evaluation_now: context.evaluation_now,
    provider: input.provider,
    timeout_ms: continuousIntelligenceShadowCollectorCanaryLimits.provider_timeout_ms,
  });
  return { result, receipt_context: receiptContext };
}

export function buildContinuousIntelligenceShadowCanaryReceipt(input: {
  execution: Awaited<ReturnType<typeof executeContinuousIntelligenceShadowCanary>>;
  claim: Extract<ContinuousIntelligenceShadowCanaryClaimResult, { claimed: true }>;
  claim_status: "claimed" | "attempted" | "completed" | "failed";
  now: Date;
}): BoundedShadowCollectorLiveProofReceipt | null {
  const context = input.execution.receipt_context;
  if (!context) return null;
  if (
    context.lifecycle_identity.claim_id !== input.claim.claim_id ||
    context.lifecycle_identity.request_fingerprint !== context.proof_preflight.request_fingerprint ||
    context.lifecycle_identity.source_receipt_id !== buildContinuousIntelligenceShadowCanaryReceiptId(context.request) ||
    context.lifecycle_identity.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion
  ) return null;
  const request: BoundedShadowCollectorExecutionProofRequest = context.request;
  const receipt = buildBoundedShadowCollectorLiveProofReceipt({
    request,
    preflight: context.proof_preflight,
    result: input.execution.result,
    operator_authorization_verified: false,
    authorization_consumed: false,
    receipt_id: context.lifecycle_identity.source_receipt_id,
    now: input.now,
    entry_kind: "scheduled_shadow_collector_canary",
    daily_claim_id: input.claim.claim_id,
    daily_claim_status: input.claim_status,
  });
  const safeMessage = (() => {
    switch (receipt.primary_result_category) {
      case "provider_success_with_candles": return "Scheduled shadow canary completed with sanitized candle aggregates.";
      case "provider_success_empty": return "Scheduled shadow canary completed with a confirmed valid empty provider result.";
      case "provider_timeout": return "Scheduled shadow canary provider request timed out.";
      case "provider_response_invalid": return "Scheduled shadow canary provider response was rejected safely.";
      case "internal_execution_failure": return "Scheduled shadow canary internal execution failed safely.";
      case "provider_failure": return "Scheduled shadow canary provider request failed safely.";
      case "blocked_before_provider_attempt": return "Scheduled shadow canary blocked before provider attempt.";
    }
  })();
  return {
    ...receipt,
    contract_version: boundedShadowCollectorLiveProofReceiptContractVersion,
    build_marker: continuousIntelligenceShadowCollectorCanaryContractVersion,
    safe_operator_message: safeMessage,
  };
}

export function buildContinuousIntelligenceShadowCanaryReceiptId(
  request: BoundedShadowCollectorExecutionProofRequest,
) {
  return `canary_receipt_${boundedShadowCollectorExecutionProofFingerprint(request).replaceAll("|", "_").replaceAll(":", "-").slice(0, 96)}`;
}

export type ContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity =
  ContinuousIntelligenceShadowCanaryLifecycleIdentity & {
    authorization_id: string;
    base_execution_id: string;
  };

function isCanonicalManualAuthorizationId(value: string) {
  return /^manual_canary_authorization_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
}

function buildContinuousIntelligenceShadowCanaryManualAdmissionExecutionId(input: {
  utc_day: string;
  authorization_id: string;
}) {
  return `manual_canary_execution_${input.utc_day.replaceAll("-", "")}_${input.authorization_id}`;
}

/**
 * A manual authorization ID is server-issued and durable. It scopes one manual
 * admission without exposing the authorization token or changing scheduled IDs.
 */
export function buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity(input: {
  lifecycle_identity: Readonly<ContinuousIntelligenceShadowCanaryLifecycleIdentity>;
  authorization_id: string;
}): Readonly<ContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity> | null {
  const baseExecutionId = buildContinuousIntelligenceShadowCanaryExecutionId({
    utc_day: input.lifecycle_identity.utc_day,
    request_fingerprint: input.lifecycle_identity.request_fingerprint,
  });
  if (
    !isCanonicalManualAuthorizationId(input.authorization_id) ||
    input.lifecycle_identity.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion ||
    input.lifecycle_identity.execution_id !== baseExecutionId ||
    input.lifecycle_identity.claim_id !== `canary_claim_${baseExecutionId}`
  ) {
    return null;
  }
  const executionId = buildContinuousIntelligenceShadowCanaryManualAdmissionExecutionId({
    utc_day: input.lifecycle_identity.utc_day,
    authorization_id: input.authorization_id,
  });
  const claimId = `canary_claim_${executionId}`;
  if (executionId.length > 128 || claimId.length > 128) return null;
  return Object.freeze({
    ...input.lifecycle_identity,
    execution_id: executionId,
    claim_id: claimId,
    authorization_id: input.authorization_id,
    base_execution_id: baseExecutionId,
  });
}

/**
 * Manual receipts inherit their admission identity from the server-issued
 * authorization, so separate same-day attempts cannot collide in persistence.
 */
export function buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId(input: {
  request: BoundedShadowCollectorExecutionProofRequest;
  lifecycle_identity: Readonly<ContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity>;
}) {
  const requestFingerprint = boundedShadowCollectorExecutionProofFingerprint(input.request);
  const expectedBaseExecutionId = buildContinuousIntelligenceShadowCanaryExecutionId({
    utc_day: input.lifecycle_identity.utc_day,
    request_fingerprint: requestFingerprint,
  });
  const expectedExecutionId = buildContinuousIntelligenceShadowCanaryManualAdmissionExecutionId({
    utc_day: input.lifecycle_identity.utc_day,
    authorization_id: input.lifecycle_identity.authorization_id,
  });
  if (
    input.lifecycle_identity.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion ||
    input.lifecycle_identity.request_fingerprint !== requestFingerprint ||
    input.lifecycle_identity.base_execution_id !== expectedBaseExecutionId ||
    input.lifecycle_identity.execution_id !== expectedExecutionId ||
    input.lifecycle_identity.claim_id !== `canary_claim_${expectedExecutionId}`
  ) {
    return null;
  }
  const receiptId = `manual_canary_receipt_${expectedExecutionId}`;
  return receiptId.length <= 128 ? receiptId : null;
}

export type ContinuousIntelligenceShadowCanaryDiagnostics = ContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics & {
  contract_version: typeof continuousIntelligenceShadowCollectorCanaryContractVersion;
  canary_route_present: true;
  canary_preflight_route_present: true;
  scheduled_function_foundation_present: true;
  schedule_active: "unknown";
  enabled_flag_state_client_side: "unknown";
  kill_switch_state_client_side: "unknown";
  fixed_ticker_allowlist_size: 1;
  per_run_request_cap: 1;
  per_run_credit_cap: 1;
  daily_run_cap: 2;
  daily_credit_cap: 2;
  durable_usage_required: true;
  atomic_daily_claim_required: true;
  atomic_begin_attempt_required: true;
  atomic_finalization_required: true;
  finalization_identity_bound: true;
  direct_finalization_update_allowed: false;
  provider_entry_grant: "attempt_started_only";
  terminal_claim_retry_allowed: false;
  daily_claim_contract: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
  daily_claim_table: typeof continuousIntelligenceShadowCanaryClaimTableName;
  cross_instance_cap_enforced_by_database: true;
  process_local_lock_is_daily_cap_authority: false;
  status: "not_observed";
  latest_safe_canary_result: null;
  browser_invocation: false;
  provider_inferred: false;
  market_calendar_contract_version: typeof usEquityMarketCalendarContractVersion;
  market_calendar_source_category: typeof usEquityMarketCalendarSourceCategory;
  market_calendar_dataset_validation_status: "verified" | "invalid" | "not_observed";
  market_calendar_verification_status: UsEquityMarketCalendarVerificationStatus | "not_observed";
  market_calendar_coverage_start: string;
  market_calendar_coverage_end: string;
  market_calendar_current_coverage_status: UsEquityMarketCalendarEvaluation["coverage_status"] | "not_observed";
  market_calendar_freshness_status: UsEquityMarketCalendarFreshnessStatus | "not_observed";
  market_calendar_early_close_awareness: boolean | "not_observed";
  market_calendar_holiday_awareness: boolean | "not_observed";
  market_calendar_latest_completed_range_status: UsEquityMarketCalendarEvaluation["latest_completed_range"]["status"] | "not_observed";
  market_calendar_provider_calls_inferred: false;
  market_calendar_durable_writes_inferred: false;
  market_calendar_schedule_changed: false;
  recommendation_scanner_execution_effects: false;
};

export function buildContinuousIntelligenceShadowCanaryDiagnostics(input?: {
  dataset_validation_status: "verified" | "invalid";
  calendar_evaluation?: UsEquityMarketCalendarEvaluation | null;
}): ContinuousIntelligenceShadowCanaryDiagnostics {
  const datasetValidationStatus = input?.dataset_validation_status ?? "not_observed";
  const evaluation =
    datasetValidationStatus === "verified"
      ? input?.calendar_evaluation ?? null
      : null;
  const verificationStatus =
    datasetValidationStatus === "invalid"
      ? "invalid"
      : evaluation?.verification_status ?? "not_observed";
  return {
    ...buildContinuousIntelligenceShadowCanaryActivationReadinessDiagnostics(),
    contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion,
    canary_route_present: true,
    canary_preflight_route_present: true,
    scheduled_function_foundation_present: true,
    schedule_active: "unknown",
    enabled_flag_state_client_side: "unknown",
    kill_switch_state_client_side: "unknown",
    fixed_ticker_allowlist_size: 1,
    per_run_request_cap: 1,
    per_run_credit_cap: 1,
    daily_run_cap: 2,
    daily_credit_cap: 2,
    durable_usage_required: true,
    atomic_daily_claim_required: true,
    atomic_begin_attempt_required: true,
    atomic_finalization_required: true,
    finalization_identity_bound: true,
    direct_finalization_update_allowed: false,
    provider_entry_grant: "attempt_started_only",
    terminal_claim_retry_allowed: false,
    daily_claim_contract: continuousIntelligenceShadowCanaryClaimContractVersion,
    daily_claim_table: continuousIntelligenceShadowCanaryClaimTableName,
    cross_instance_cap_enforced_by_database: true,
    process_local_lock_is_daily_cap_authority: false,
    status: "not_observed",
    latest_safe_canary_result: null,
    browser_invocation: false,
    provider_inferred: false,
    market_calendar_contract_version: usEquityMarketCalendarContractVersion,
    market_calendar_source_category: usEquityMarketCalendarSourceCategory,
    market_calendar_dataset_validation_status: datasetValidationStatus,
    market_calendar_verification_status: verificationStatus,
    market_calendar_coverage_start: usEquityMarketCalendarCoverage.start,
    market_calendar_coverage_end: usEquityMarketCalendarCoverage.end,
    market_calendar_current_coverage_status:
      evaluation?.coverage_status ?? "not_observed",
    market_calendar_freshness_status:
      evaluation?.freshness_status ?? "not_observed",
    market_calendar_early_close_awareness:
      evaluation?.early_close_awareness_available ?? "not_observed",
    market_calendar_holiday_awareness:
      evaluation?.holiday_awareness_available ?? "not_observed",
    market_calendar_latest_completed_range_status:
      evaluation?.latest_completed_range.status ?? "not_observed",
    market_calendar_provider_calls_inferred: false,
    market_calendar_durable_writes_inferred: false,
    market_calendar_schedule_changed: false,
    recommendation_scanner_execution_effects: false,
  };
}
