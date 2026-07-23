import {
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  continuousIntelligenceShadowCanaryManualAuthorizationPurpose,
  continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds,
  type ContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import { normalizeContinuousIntelligenceShadowCanaryTimestamp } from "@/lib/continuous-intelligence-shadow-canary-timestamp";

export const continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion =
  "continuous_intelligence_shadow_canary_manual_execution_lease_v1" as const;
export const continuousIntelligenceShadowCanaryManualExecutionLeaseTableName =
  "continuous_intelligence_shadow_canary_manual_execution_leases" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationIssueWithLeaseRpcName =
  "issue_ci_shadow_canary_manual_lease" as const;
export const continuousIntelligenceShadowCanaryManualAuthorizationAdmitExecutionWithLeaseRpcName =
  "admit_ci_shadow_canary_manual_lease" as const;

export type ContinuousIntelligenceShadowCanaryManualExecutionLeaseStatus =
  | "issued"
  | "consumed"
  | "expired"
  | "revoked";

export type ContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus =
  | "attempt_started"
  | "already_admitted"
  | "authorization_expired"
  | "authorization_replayed"
  | "identity_mismatch"
  | "daily_limit_reached"
  | "daily_usage_unavailable";

const manualExecutionAdmissionStatuses = new Set<ContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus>([
  "attempt_started",
  "already_admitted",
  "authorization_expired",
  "authorization_replayed",
  "identity_mismatch",
  "daily_limit_reached",
  "daily_usage_unavailable",
]);

export function parseContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus(
  value: unknown,
): ContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus | null {
  return typeof value === "string" && manualExecutionAdmissionStatuses.has(
    value as ContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus,
  )
    ? value as ContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus
    : null;
}

export function statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission(
  status: ContinuousIntelligenceShadowCanaryManualExecutionAdmissionStatus | "unavailable",
) {
  return status === "unavailable" || status === "daily_usage_unavailable" ? 503 : 409;
}

export type ContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord =
  Omit<ContinuousIntelligenceShadowCanaryManualAuthorizationBinding, "contract_version"> & {
    contract_version: typeof continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion;
    authorization_contract_version: typeof continuousIntelligenceShadowCanaryManualAuthorizationContractVersion;
    execution_lease_id: string;
    authorization_id: string;
    issued_at: string;
    expires_at: string;
    consumed_at: string | null;
    status: ContinuousIntelligenceShadowCanaryManualExecutionLeaseStatus;
  };

function bounded(value: string, maximum: number) {
  return value.length > 0 && value.length <= maximum;
}

export function buildContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord(input: {
  binding: ContinuousIntelligenceShadowCanaryManualAuthorizationBinding;
  authorization_id: string;
  execution_lease_id: string;
  issued_at: string;
  expires_at: string;
  status: ContinuousIntelligenceShadowCanaryManualExecutionLeaseStatus;
  consumed_at?: string | null;
}): ContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord | null {
  const issuedAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(input.issued_at);
  const expiresAt = normalizeContinuousIntelligenceShadowCanaryTimestamp(input.expires_at);
  const requestedStart = normalizeContinuousIntelligenceShadowCanaryTimestamp(input.binding.requested_start);
  const requestedEnd = normalizeContinuousIntelligenceShadowCanaryTimestamp(input.binding.requested_end);
  const consumedAt = input.consumed_at === undefined || input.consumed_at === null
    ? null
    : normalizeContinuousIntelligenceShadowCanaryTimestamp(input.consumed_at);
  if (
    input.binding.contract_version !== continuousIntelligenceShadowCanaryManualAuthorizationContractVersion ||
    input.binding.purpose !== continuousIntelligenceShadowCanaryManualAuthorizationPurpose ||
    !bounded(input.authorization_id, 128) ||
    !bounded(input.execution_lease_id, 128) ||
    !issuedAt ||
    !expiresAt ||
    !requestedStart ||
    !requestedEnd ||
    Date.parse(requestedEnd) - Date.parse(requestedStart) !== 30 * 60 * 1000 ||
    (input.consumed_at !== undefined && input.consumed_at !== null && !consumedAt) ||
    Date.parse(expiresAt) <= Date.parse(issuedAt) ||
    Date.parse(expiresAt) - Date.parse(issuedAt) >
      continuousIntelligenceShadowCanaryManualAuthorizationTtlSeconds * 1000 ||
    (input.status === "consumed" && consumedAt === null) ||
    (input.status !== "consumed" && consumedAt !== null)
  ) {
    return null;
  }
  const normalizedBinding = {
    ...input.binding,
    requested_start: requestedStart,
    requested_end: requestedEnd,
  };
  const { contract_version: authorizationContractVersion, ...binding } = normalizedBinding;
  return Object.freeze({
    ...binding,
    requested_start: requestedStart,
    requested_end: requestedEnd,
    authorization_contract_version: authorizationContractVersion,
    contract_version: continuousIntelligenceShadowCanaryManualExecutionLeaseContractVersion,
    execution_lease_id: input.execution_lease_id,
    authorization_id: input.authorization_id,
    issued_at: issuedAt,
    expires_at: expiresAt,
    status: input.status,
    consumed_at: consumedAt,
  });
}

export function sanitizeContinuousIntelligenceShadowCanaryManualExecutionLease(
  lease: ContinuousIntelligenceShadowCanaryManualExecutionLeaseRecord,
) {
  return {
    execution_lease_id: lease.execution_lease_id,
    authorization_id: lease.authorization_id,
    issued_at: lease.issued_at,
    expires_at: lease.expires_at,
    consumed_at: lease.consumed_at,
    status: lease.status,
    request_fingerprint: lease.request_fingerprint,
    execution_id: lease.execution_id,
    claim_id: lease.claim_id,
    ticker: lease.ticker,
    interval: lease.interval,
    requested_start: lease.requested_start,
    requested_end: lease.requested_end,
    policy_total_credits: lease.policy_total_credits,
    policy_hard_reserve_credits: lease.policy_hard_reserve_credits,
    policy_normal_planned_max_credits: lease.policy_normal_planned_max_credits,
    estimated_credits: lease.estimated_credits,
    contract_version: lease.contract_version,
  } as const;
}
