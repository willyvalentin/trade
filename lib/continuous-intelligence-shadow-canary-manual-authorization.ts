import {
  continuousIntelligenceCreditLedgerContractVersion,
  continuousIntelligenceCreditLedgerPolicy,
} from "@/lib/continuous-intelligence-credit-ledger";
import {
  continuousIntelligenceShadowCanaryClaimContractVersion,
  type ContinuousIntelligenceShadowCanaryLifecycleIdentity,
} from "@/lib/continuous-intelligence-shadow-canary-claim-store";
import {
  continuousIntelligenceShadowCollectorCanaryContractVersion,
  continuousIntelligenceShadowCollectorCanaryLimits,
  type ContinuousIntelligenceShadowCanaryPreflight,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import {
  usEquityMarketCalendarContractVersion,
} from "@/lib/us-equity-market-calendar-contract";
import {
  areContinuousIntelligenceShadowCanaryTimestampsEqual,
  normalizeContinuousIntelligenceShadowCanaryTimestamp,
} from "@/lib/continuous-intelligence-shadow-canary-timestamp";

export const continuousIntelligenceShadowCanaryManualAuthorizationContractVersion =
  "continuous_intelligence_shadow_canary_manual_authorization_v1" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationTableName =
  "continuous_intelligence_shadow_canary_manual_authorizations" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationIssueRpcName =
  "ci_mca_issue" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationConsumeRpcName =
  "ci_mca_consume" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionRpcName =
  "admit_continuous_intelligence_shadow_canary_manual_execution" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/manual-authorization" as const;
export const continuousIntelligenceShadowCanaryManualExecutionGateRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution-gate" as const;
export const continuousIntelligenceShadowCanaryManualExecutionRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/canary/manual-execution" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationPurpose =
  "one_manual_shadow_canary_attempt" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds = 60 as const;
export const continuousIntelligenceShadowCanaryAction581ContinuationRequirement =
  "atomic_server_controlled_continuation_required" as const;

export type ContinuousIntelligenceShadowCanaryManualAuthorizationStatus =
  | "issued"
  | "consumed"
  | "expired"
  | "revoked";

export type ContinuousIntelligenceShadowCanaryManualAuthorizationBinding = {
  contract_version: typeof continuousIntelligenceShadowCanaryManualAuthorizationContractVersion;
  purpose: typeof continuousIntelligenceShadowCanaryManualAuthorizationPurpose;
  request_fingerprint: string;
  execution_id: string;
  claim_id: string;
  ticker: "AAPL";
  interval: "5min";
  requested_start: string;
  requested_end: string;
  calendar_contract_version: typeof usEquityMarketCalendarContractVersion;
  calendar_fingerprint: string;
  budget_policy_version: "continuous_intelligence_credit_ledger_v1";
  policy_total_credits: 377;
  policy_hard_reserve_credits: 57;
  policy_normal_planned_max_credits: 320;
  estimated_credits: 1;
  canary_contract_version: typeof continuousIntelligenceShadowCollectorCanaryContractVersion;
  claim_contract_version: typeof continuousIntelligenceShadowCanaryClaimContractVersion;
  deployment_commit: string;
  deployment_build_marker: string;
};

export type ContinuousIntelligenceShadowCanaryManualAuthorizationRecord =
  ContinuousIntelligenceShadowCanaryManualAuthorizationBinding & {
    authorization_id: string;
    issued_at: string;
    expires_at: string;
    consumed_at: string | null;
    status: ContinuousIntelligenceShadowCanaryManualAuthorizationStatus;
  };

export function parseContinuousIntelligenceShadowCanaryManualAuthorizationRpcRecord(
  value: unknown,
): ContinuousIntelligenceShadowCanaryManualAuthorizationRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const requiredText = [
    "authorization_id", "issued_at", "expires_at", "authorization_status", "request_fingerprint", "execution_id",
    "claim_id", "ticker", "market_interval", "requested_start", "requested_end", "calendar_contract_version",
    "calendar_fingerprint", "budget_policy_version", "canary_contract_version", "claim_contract_version",
    "deployment_commit", "deployment_build_marker", "purpose", "contract_version",
  ];
  const text: Record<string, string> = {};
  for (const key of requiredText) {
    const field = raw[key];
    if (typeof field !== "string") return null;
    text[key] = field;
  }
  const issuedAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(text.issued_at);
  const expiresAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(text.expires_at);
  const requestedStart = normalizeContinuousIntelligenceShadowCanaryTimestamp(text.requested_start);
  const requestedEnd = normalizeContinuousIntelligenceShadowCanaryTimestamp(text.requested_end);
  const consumedAt = raw.consumed_at === null
    ? null
    : normalizeContinuousIntelligenceShadowCanaryTimestamp(raw.consumed_at);
  if (
    text.authorization_status !== "issued" && text.authorization_status !== "consumed" && text.authorization_status !== "expired" && text.authorization_status !== "revoked" ||
    text.contract_version !== continuousIntelligenceShadowCanaryManualAuthorizationContractVersion ||
    text.purpose !== continuousIntelligenceShadowCanaryManualAuthorizationPurpose ||
    text.ticker !== "AAPL" || text.market_interval !== "5min" ||
    text.calendar_contract_version !== usEquityMarketCalendarContractVersion ||
    text.budget_policy_version !== continuousIntelligenceCreditLedgerContractVersion ||
    text.canary_contract_version !== continuousIntelligenceShadowCollectorCanaryContractVersion ||
    text.claim_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion ||
    raw.policy_total_credits !== 377 || raw.policy_hard_reserve_credits !== 57 ||
    raw.policy_normal_planned_max_credits !== 320 || raw.estimated_credits !== 1 ||
    !issuedAt || !expiresAt || !requestedStart || !requestedEnd ||
    (raw.consumed_at !== null && !consumedAt) ||
    Date.parse(expiresAt) <= Date.parse(issuedAt) ||
    Date.parse(expiresAt) - Date.parse(issuedAt) > continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds * 1000 ||
    Date.parse(requestedEnd) - Date.parse(requestedStart) !== continuousIntelligenceShadowCollectorCanaryLimits.max_range_ms ||
    !bounded(text.authorization_id, 128) || !bounded(text.request_fingerprint, 240) ||
    !bounded(text.execution_id, 128) || !bounded(text.claim_id, 128) ||
    !bounded(text.calendar_fingerprint, 128) || !bounded(text.deployment_commit, 128) ||
    !bounded(text.deployment_build_marker, 128)
  ) return null;
  return {
    contract_version: text.contract_version,
    purpose: text.purpose,
    authorization_id: text.authorization_id,
    issued_at: issuedAt,
    expires_at: expiresAt,
    consumed_at: consumedAt,
    status: text.authorization_status,
    request_fingerprint: text.request_fingerprint,
    execution_id: text.execution_id,
    claim_id: text.claim_id,
    ticker: text.ticker,
    interval: text.market_interval,
    requested_start: requestedStart,
    requested_end: requestedEnd,
    calendar_contract_version: text.calendar_contract_version,
    calendar_fingerprint: text.calendar_fingerprint,
    budget_policy_version: text.budget_policy_version,
    policy_total_credits: raw.policy_total_credits,
    policy_hard_reserve_credits: raw.policy_hard_reserve_credits,
    policy_normal_planned_max_credits: raw.policy_normal_planned_max_credits,
    estimated_credits: raw.estimated_credits,
    canary_contract_version: text.canary_contract_version,
    claim_contract_version: text.claim_contract_version,
    deployment_commit: text.deployment_commit,
    deployment_build_marker: text.deployment_build_marker,
  } as ContinuousIntelligenceShadowCanaryManualAuthorizationRecord;
}

export type ContinuousIntelligenceShadowCanaryManualExecutionGateOutcome =
  | "ready_for_one_manual_execution"
  | "authorization_missing"
  | "authorization_expired"
  | "authorization_consumed"
  | "authorization_identity_mismatch"
  | "deployment_changed"
  | "calendar_changed"
  | "range_changed"
  | "daily_limit_reached"
  | "schedule_state_changed"
  | "canary_state_changed"
  | "provider_budget_changed"
  | "runtime_unavailable";

export type ContinuousIntelligenceShadowCanaryManualExecutionGateFacts = {
  readiness_decision: string;
  canary_disabled: boolean;
  kill_switch_active: boolean;
  schedule_absent: boolean;
  daily_capacity_available: boolean;
  provider_budget_resolved: boolean;
  active_claim_conflict: boolean;
};

export type ContinuousIntelligenceShadowCanaryManualExecutionHandoffStatus =
  | "gate_consumed_execution_not_started"
  | "execution_handoff_unavailable"
  | "execution_started"
  | "execution_terminal";

export type ContinuousIntelligenceShadowCanaryManualExecutionHandoff = {
  authorization_id: string;
  consumed_at: string;
  binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding;
  gate_evaluated_at: string;
  execution_handoff_status: ContinuousIntelligenceShadowCanaryManualExecutionHandoffStatus;
  provider_execution_occurred: false;
  client_continuation_allowed: false;
  required_action_581_design: typeof continuousIntelligenceShadowCanaryAction581ContinuationRequirement;
};

function bounded(value: string, maximum: number) {
  return value.length > 0 && value.length <= maximum;
}

export function buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding(input: {
  preflight: ContinuousIntelligenceShadowCanaryPreflight;
  lifecycle_identity: Readonly<ContinuousIntelligenceShadowCanaryLifecycleIdentity>;
  calendar_fingerprint: string | null;
  deployment_commit: string | null;
  deployment_build_marker: string | null;
}): ContinuousIntelligenceShadowCanaryManualAuthorizationBinding | null {
  const request = input.preflight.request;
  const fingerprint = input.preflight.canonical_execution_context?.proof_preflight.request_fingerprint;
  const calendar = input.preflight.market_calendar;
  const requestedStart = request ? normalizeContinuousIntelligenceShadowCanaryTimestamp(request.start) : null;
  const requestedEnd = request ? normalizeContinuousIntelligenceShadowCanaryTimestamp(request.end) : null;
  if (
    !request ||
    !fingerprint ||
    request.ticker !== "AAPL" ||
    request.interval !== "5min" ||
    !requestedStart ||
    !requestedEnd ||
    Date.parse(requestedEnd) - Date.parse(requestedStart) !== continuousIntelligenceShadowCollectorCanaryLimits.max_range_ms ||
    input.lifecycle_identity.request_fingerprint !== fingerprint ||
    input.lifecycle_identity.expected_contract_version !== continuousIntelligenceShadowCanaryClaimContractVersion ||
    calendar.contract_version !== usEquityMarketCalendarContractVersion ||
    calendar.verification_status !== "verified" ||
    !input.calendar_fingerprint ||
    !bounded(input.calendar_fingerprint, 128) ||
    !input.deployment_commit ||
    !bounded(input.deployment_commit, 128) ||
    !input.deployment_build_marker ||
    !bounded(input.deployment_build_marker, 128)
  ) {
    return null;
  }
  return Object.freeze({
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
    purpose: continuousIntelligenceShadowCanaryManualAuthorizationPurpose,
    request_fingerprint: fingerprint,
    execution_id: input.lifecycle_identity.execution_id,
    claim_id: input.lifecycle_identity.claim_id,
    ticker: "AAPL",
    interval: "5min",
    requested_start: requestedStart,
    requested_end: requestedEnd,
    calendar_contract_version: usEquityMarketCalendarContractVersion,
    calendar_fingerprint: input.calendar_fingerprint,
    budget_policy_version: continuousIntelligenceCreditLedgerContractVersion,
    policy_total_credits: continuousIntelligenceCreditLedgerPolicy.total_credits,
    policy_hard_reserve_credits: continuousIntelligenceCreditLedgerPolicy.hard_reserve_credits,
    policy_normal_planned_max_credits: continuousIntelligenceCreditLedgerPolicy.normal_planned_max_credits,
    estimated_credits: 1,
    canary_contract_version: continuousIntelligenceShadowCollectorCanaryContractVersion,
    claim_contract_version: continuousIntelligenceShadowCanaryClaimContractVersion,
    deployment_commit: input.deployment_commit,
    deployment_build_marker: input.deployment_build_marker,
  });
}

function sameBinding(
  authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord,
  expected: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
) {
  return (
    authorization.contract_version === expected.contract_version &&
    authorization.purpose === expected.purpose &&
    authorization.request_fingerprint === expected.request_fingerprint &&
    authorization.execution_id === expected.execution_id &&
    authorization.claim_id === expected.claim_id &&
    authorization.ticker === expected.ticker &&
    authorization.interval === expected.interval &&
    areContinuousIntelligenceShadowCanaryTimestampsEqual(authorization.requested_start, expected.requested_start) &&
    areContinuousIntelligenceShadowCanaryTimestampsEqual(authorization.requested_end, expected.requested_end) &&
    authorization.calendar_contract_version === expected.calendar_contract_version &&
    authorization.calendar_fingerprint === expected.calendar_fingerprint &&
    authorization.budget_policy_version === expected.budget_policy_version &&
    authorization.policy_total_credits === expected.policy_total_credits &&
    authorization.policy_hard_reserve_credits === expected.policy_hard_reserve_credits &&
    authorization.policy_normal_planned_max_credits === expected.policy_normal_planned_max_credits &&
    authorization.estimated_credits === expected.estimated_credits &&
    authorization.canary_contract_version === expected.canary_contract_version &&
    authorization.claim_contract_version === expected.claim_contract_version &&
    authorization.deployment_commit === expected.deployment_commit &&
    authorization.deployment_build_marker === expected.deployment_build_marker
  );
}

export function matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding(
  authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord,
  expected: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
) {
  return sameBinding(authorization, expected);
}

function bindingFromAuthorization(
  authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord,
): ContinuousIntelligenceShadowCanaryManualAuthorizationBinding {
  return {
    contract_version: authorization.contract_version,
    purpose: authorization.purpose,
    request_fingerprint: authorization.request_fingerprint,
    execution_id: authorization.execution_id,
    claim_id: authorization.claim_id,
    ticker: authorization.ticker,
    interval: authorization.interval,
    requested_start: authorization.requested_start,
    requested_end: authorization.requested_end,
    calendar_contract_version: authorization.calendar_contract_version,
    calendar_fingerprint: authorization.calendar_fingerprint,
    budget_policy_version: authorization.budget_policy_version,
    policy_total_credits: authorization.policy_total_credits,
    policy_hard_reserve_credits: authorization.policy_hard_reserve_credits,
    policy_normal_planned_max_credits: authorization.policy_normal_planned_max_credits,
    estimated_credits: authorization.estimated_credits,
    canary_contract_version: authorization.canary_contract_version,
    claim_contract_version: authorization.claim_contract_version,
    deployment_commit: authorization.deployment_commit,
    deployment_build_marker: authorization.deployment_build_marker,
  };
}

export function buildContinuousIntelligenceShadowCanaryManualExecutionHandoff(input: {
  authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord | null;
  gate_outcome: ContinuousIntelligenceShadowCanaryManualExecutionGateOutcome;
  gate_evaluated_at: Date;
  dry_run: boolean;
}): ContinuousIntelligenceShadowCanaryManualExecutionHandoff | null {
  const { authorization } = input;
  if (
    input.dry_run ||
    input.gate_outcome !== "ready_for_one_manual_execution" ||
    !authorization ||
    authorization.status !== "consumed" ||
    !authorization.consumed_at
  ) return null;
  return Object.freeze({
    authorization_id: authorization.authorization_id,
    consumed_at: authorization.consumed_at,
    binding: Object.freeze(bindingFromAuthorization(authorization)),
    gate_evaluated_at: input.gate_evaluated_at.toISOString(),
    execution_handoff_status: "gate_consumed_execution_not_started",
    provider_execution_occurred: false,
    client_continuation_allowed: false,
    required_action_581_design: continuousIntelligenceShadowCanaryAction581ContinuationRequirement,
  });
}

export function evaluateContinuousIntelligenceShadowCanaryManualExecutionGate(input: {
  authorization: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord | null;
  expected_binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding | null;
  facts: ContinuousIntelligenceShadowCanaryManualExecutionGateFacts;
  now: Date;
}): ContinuousIntelligenceShadowCanaryManualExecutionGateOutcome {
  const { authorization, expected_binding: expected, facts } = input;
  if (!authorization || !expected) return "authorization_missing";
  if (authorization.status === "consumed") return "authorization_consumed";
  const expiresAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(authorization.expires_at);
  if (!expiresAt) return "authorization_missing";
  if (authorization.status === "expired" || Date.parse(expiresAt) <= input.now.getTime()) {
    return "authorization_expired";
  }
  if (authorization.status !== "issued") return "authorization_missing";
  if (!sameBinding(authorization, expected)) {
    if (authorization.deployment_commit !== expected.deployment_commit || authorization.deployment_build_marker !== expected.deployment_build_marker) return "deployment_changed";
    if (authorization.calendar_fingerprint !== expected.calendar_fingerprint || authorization.calendar_contract_version !== expected.calendar_contract_version) return "calendar_changed";
    if (
      !areContinuousIntelligenceShadowCanaryTimestampsEqual(authorization.requested_start, expected.requested_start) ||
      !areContinuousIntelligenceShadowCanaryTimestampsEqual(authorization.requested_end, expected.requested_end) ||
      authorization.ticker !== expected.ticker ||
      authorization.interval !== expected.interval
    ) return "range_changed";
    return "authorization_identity_mismatch";
  }
  if (facts.readiness_decision !== "ready_for_one_manual_canary_attempt") return "runtime_unavailable";
  if (!facts.canary_disabled || !facts.kill_switch_active) return "canary_state_changed";
  if (!facts.schedule_absent) return "schedule_state_changed";
  if (!facts.daily_capacity_available || facts.active_claim_conflict) return "daily_limit_reached";
  if (!facts.provider_budget_resolved) return "provider_budget_changed";
  return "ready_for_one_manual_execution";
}

export function sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(
  record: ContinuousIntelligenceShadowCanaryManualAuthorizationRecord,
) {
  return {
    authorization_id: record.authorization_id,
    issued_at: record.issued_at,
    expires_at: record.expires_at,
    consumed_at: record.consumed_at,
    status: record.status,
    request_fingerprint: record.request_fingerprint,
    execution_id: record.execution_id,
    claim_id: record.claim_id,
    ticker: record.ticker,
    interval: record.interval,
    requested_start: record.requested_start,
    requested_end: record.requested_end,
    calendar_contract_version: record.calendar_contract_version,
    calendar_fingerprint: record.calendar_fingerprint,
    budget_policy_version: record.budget_policy_version,
    policy_total_credits: record.policy_total_credits,
    policy_hard_reserve_credits: record.policy_hard_reserve_credits,
    policy_normal_planned_max_credits: record.policy_normal_planned_max_credits,
    estimated_credits: record.estimated_credits,
    canary_contract_version: record.canary_contract_version,
    claim_contract_version: record.claim_contract_version,
    deployment_commit: record.deployment_commit,
    deployment_build_marker: record.deployment_build_marker,
    purpose: record.purpose,
  } as const;
}
