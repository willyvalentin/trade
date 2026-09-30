import { createHash } from "node:crypto";

import {
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT,
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION,
  resolveScannerProviderCreditAllocationLiveExperiment,
} from "@/lib/scanner-provider-credit-allocation-live-experiment";
import {
  SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION,
  type ScannerProviderCreditAllocationPolicyVersion,
} from "@/lib/scanner-provider-credit-allocation-plan";
import type { ScheduledScanInvocationReceipt } from "@/lib/scheduled-scan-invocation-receipt";

export const SCANNER_PROVIDER_CREDIT_ALLOCATION_RUNTIME_ADMISSION_VERSION =
  "scanner_provider_credit_allocation_runtime_admission_v1" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV =
  "TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV =
  "TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID" as const;
export const SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV =
  "TURE_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION" as const;

type EnvironmentReader = Readonly<{
  get(name: string): string | undefined;
}>;

export type ScannerProviderCreditAllocationRuntimeAdmission = Readonly<{
  admission_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_RUNTIME_ADMISSION_VERSION;
  status: "disabled" | "blocked" | "admitted";
  reason_codes: readonly string[];
  experiment_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION;
  contract_version: typeof SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.contract_version;
  experiment_id: string | null;
  scheduled_invocation_bound: boolean;
  scheduled_slot_utc: string | null;
  arm: "baseline" | "challenger" | null;
  pair: number | null;
  selected_policy_version: ScannerProviderCreditAllocationPolicyVersion;
  expected_revision: string | null;
  deployed_revision: string | null;
  evaluated_at: string;
  admission_fingerprint: string;
  authority: Readonly<{
    can_select_allocation_policy: boolean;
    can_call_provider: false;
    can_reserve_provider_credit: false;
    can_change_ranking_or_publication: false;
    can_lower_threshold: false;
    can_publish_candidate: false;
    can_execute_broker_action: false;
  }>;
}>;

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([first], [second]) =>
          first < second ? -1 : first > second ? 1 : 0,
        )
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}

function canonicalJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

function uniqueReasons(values: readonly string[]) {
  return Object.freeze(Array.from(new Set(values)));
}

function runtimeAuthority(admitted: boolean) {
  return Object.freeze({
    can_select_allocation_policy: admitted,
    can_call_provider: false as const,
    can_reserve_provider_credit: false as const,
    can_change_ranking_or_publication: false as const,
    can_lower_threshold: false as const,
    can_publish_candidate: false as const,
    can_execute_broker_action: false as const,
  });
}

function normalizedRevision(value: unknown) {
  const revision = textOrNull(value)?.toLowerCase() ?? null;
  return revision && /^[0-9a-f]{40}$/.test(revision) ? revision : null;
}

export function buildScannerProviderCreditAllocationRuntimeAdmission(input: {
  enabled: boolean;
  experimentId: string | null | undefined;
  scheduledInvocationBound: boolean;
  scheduledSlotUtc: string | null | undefined;
  now: Date;
  expectedRevision: string | null | undefined;
  deployedRevision: string | null | undefined;
}): ScannerProviderCreditAllocationRuntimeAdmission {
  const evaluatedAt = input.now.toISOString();
  const experimentId = textOrNull(input.experimentId);
  const expectedRevision = normalizedRevision(input.expectedRevision);
  const deployedRevision = normalizedRevision(input.deployedRevision);
  const liveAdmission = resolveScannerProviderCreditAllocationLiveExperiment({
    enabled: input.enabled,
    experimentId,
    scheduledSlotUtc: input.scheduledSlotUtc,
    now: input.now,
    expectedRevision,
    deployedRevision,
  });
  const scheduledInvocationBlocked =
    input.enabled && !input.scheduledInvocationBound;
  const admitted =
    liveAdmission.status === "admitted" && !scheduledInvocationBlocked;
  const status = !input.enabled
    ? ("disabled" as const)
    : admitted
      ? ("admitted" as const)
      : ("blocked" as const);
  const reasonCodes = uniqueReasons([
    ...(scheduledInvocationBlocked
      ? ["runtime_allocation_scheduled_invocation_required"]
      : []),
    ...liveAdmission.reason_codes,
  ]);
  const slot = liveAdmission.slot;
  const selectedPolicyVersion = admitted
    ? liveAdmission.selected_policy_version
    : SCANNER_PROVIDER_CREDIT_BASELINE_POLICY_VERSION;
  const basis = Object.freeze({
    admission_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_RUNTIME_ADMISSION_VERSION,
    status,
    reason_codes: reasonCodes,
    experiment_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_VERSION,
    contract_version:
      SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT.contract_version,
    experiment_id: experimentId,
    scheduled_invocation_bound: input.scheduledInvocationBound,
    scheduled_slot_utc: textOrNull(input.scheduledSlotUtc),
    arm: slot?.arm ?? null,
    pair: slot?.pair ?? null,
    selected_policy_version: selectedPolicyVersion,
    expected_revision: expectedRevision,
    deployed_revision: deployedRevision,
    evaluated_at: evaluatedAt,
    authority: runtimeAuthority(admitted),
  });
  const admissionFingerprint = createHash("sha256")
    .update(canonicalJson(basis), "utf8")
    .digest("hex");

  return Object.freeze({
    ...basis,
    admission_fingerprint: admissionFingerprint,
  });
}

export function scannerProviderCreditAllocationRuntimeAdmissionFromEnvironment({
  environment,
  requestSource,
  scheduledInvocationReceipt,
  now,
}: {
  environment: EnvironmentReader;
  requestSource: string | null | undefined;
  scheduledInvocationReceipt: ScheduledScanInvocationReceipt | null;
  now: Date;
}) {
  const scheduledInvocationBound =
    requestSource === "netlify_scheduled_function" &&
    scheduledInvocationReceipt !== null;

  return buildScannerProviderCreditAllocationRuntimeAdmission({
    enabled:
      environment.get(
        SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ENABLED_ENV,
      ) === "true",
    experimentId: environment.get(
      SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_ID_ENV,
    ),
    scheduledInvocationBound,
    scheduledSlotUtc:
      scheduledInvocationReceipt?.scheduled_slot_started_at_utc ?? null,
    now,
    expectedRevision: environment.get(
      SCANNER_PROVIDER_CREDIT_ALLOCATION_EXPERIMENT_EXPECTED_REVISION_ENV,
    ),
    deployedRevision:
      scheduledInvocationReceipt?.build_deployment_identity.commit_ref ?? null,
  });
}

export function scannerProviderCreditAllocationRuntimeAdmissionFromUnknown(
  value: unknown,
): ScannerProviderCreditAllocationRuntimeAdmission | null {
  const candidate = recordOrNull(value);
  const evaluatedAt = textOrNull(candidate?.evaluated_at);
  const evaluatedDate = evaluatedAt ? new Date(evaluatedAt) : null;
  if (
    !candidate ||
    candidate.admission_version !==
      SCANNER_PROVIDER_CREDIT_ALLOCATION_RUNTIME_ADMISSION_VERSION ||
    (candidate.status !== "disabled" &&
      candidate.status !== "blocked" &&
      candidate.status !== "admitted") ||
    typeof candidate.scheduled_invocation_bound !== "boolean" ||
    !evaluatedDate ||
    !Number.isFinite(evaluatedDate.getTime()) ||
    evaluatedDate.toISOString() !== evaluatedAt
  ) {
    return null;
  }

  const rebuilt = buildScannerProviderCreditAllocationRuntimeAdmission({
    enabled: candidate.status !== "disabled",
    experimentId: textOrNull(candidate.experiment_id),
    scheduledInvocationBound: candidate.scheduled_invocation_bound,
    scheduledSlotUtc: textOrNull(candidate.scheduled_slot_utc),
    now: evaluatedDate,
    expectedRevision: textOrNull(candidate.expected_revision),
    deployedRevision: textOrNull(candidate.deployed_revision),
  });

  return canonicalJson(candidate) === canonicalJson(rebuilt) ? rebuilt : null;
}
