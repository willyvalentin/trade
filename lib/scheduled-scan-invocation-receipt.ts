export const SCHEDULED_SCAN_INVOCATION_RECEIPT_VERSION =
  "scheduled_scan_invocation_receipt_v1" as const;

const SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION =
  "scheduled_scan_deployment_identity_v1" as const;
const scheduledSlotMilliseconds = 15 * 60 * 1000;
const gitCommitPattern = /^[0-9a-f]{40}$/;
const netlifyDeployIdPattern = /^[0-9a-f]{24}$/;
const siteIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type ScheduledSlotIdentitySource =
  | "netlify_event_next_run"
  | "delivery_quarter_hour_fallback";

type ScheduledScanBuildDeploymentIdentity = Readonly<{
  schema_version: typeof SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION;
  deploy_id: string;
  deploy_context: "production";
  commit_ref: string;
  site_id: string;
}>;

export type ScheduledScanInvocationReceipt = Readonly<{
  receipt_version: typeof SCHEDULED_SCAN_INVOCATION_RECEIPT_VERSION;
  scheduled_slot_started_at_utc: string;
  scheduled_slot_identity_source: ScheduledSlotIdentitySource;
  build_deployment_identity: ScheduledScanBuildDeploymentIdentity;
  durable_invocation_payload: Readonly<Record<string, unknown>>;
}>;

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

function canonicalQuarterHourUtc(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;

  const timestamp = Date.parse(text);
  if (
    !Number.isFinite(timestamp) ||
    timestamp % scheduledSlotMilliseconds !== 0
  ) {
    return null;
  }

  const normalized = new Date(timestamp).toISOString();
  return normalized === text ? normalized : null;
}

function scheduledSlotIdentitySourceOrNull(value: unknown) {
  return value === "netlify_event_next_run" ||
    value === "delivery_quarter_hour_fallback"
    ? value
    : null;
}

function buildDeploymentIdentityFromUnknown(
  value: unknown,
): ScheduledScanBuildDeploymentIdentity | null {
  const candidate = objectOrNull(value);
  const deployId = textOrNull(candidate?.deploy_id)?.toLowerCase() ?? null;
  const commitRef = textOrNull(candidate?.commit_ref)?.toLowerCase() ?? null;
  const siteId = textOrNull(candidate?.site_id)?.toLowerCase() ?? null;

  if (
    candidate?.schema_version !==
      SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION ||
    candidate.deploy_context !== "production" ||
    !deployId ||
    !netlifyDeployIdPattern.test(deployId) ||
    !commitRef ||
    !gitCommitPattern.test(commitRef) ||
    !siteId ||
    !siteIdPattern.test(siteId)
  ) {
    return null;
  }

  return Object.freeze({
    schema_version: SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION,
    deploy_id: deployId,
    deploy_context: "production",
    commit_ref: commitRef,
    site_id: siteId,
  });
}

/**
 * The scheduled function creates the first durable claim. The private route
 * may enrich that same row, but must not replace the claim's slot or build
 * identity. This parser admits only that scheduler-owned envelope.
 */
export function scheduledScanInvocationReceiptFromAttempt({
  source,
  mode,
  payload,
}: {
  source: unknown;
  mode: unknown;
  payload: unknown;
}): ScheduledScanInvocationReceipt | null {
  if (source !== "netlify_scheduled_function" || mode !== "scheduled") {
    return null;
  }

  const durableInvocationPayload = objectOrNull(payload);
  if (!durableInvocationPayload) return null;

  const scheduledSlotStartedAtUtc = canonicalQuarterHourUtc(
    durableInvocationPayload.scheduled_slot_started_at_utc,
  );
  const scheduledSlotIdentitySource = scheduledSlotIdentitySourceOrNull(
    durableInvocationPayload.scheduled_slot_identity_source,
  );
  const buildDeploymentIdentity = buildDeploymentIdentityFromUnknown(
    durableInvocationPayload.build_deployment_identity,
  );

  if (
    !scheduledSlotStartedAtUtc ||
    !scheduledSlotIdentitySource ||
    !buildDeploymentIdentity
  ) {
    return null;
  }

  return Object.freeze({
    receipt_version: SCHEDULED_SCAN_INVOCATION_RECEIPT_VERSION,
    scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
    scheduled_slot_identity_source: scheduledSlotIdentitySource,
    build_deployment_identity: buildDeploymentIdentity,
    durable_invocation_payload: Object.freeze({ ...durableInvocationPayload }),
  });
}

/**
 * Keep scheduler-owned identity fields authoritative when the private route
 * persists outcome, trace and decision facts on the same attempt fingerprint.
 */
export function mergeScheduledScanAttemptPayload({
  invocationReceipt,
  routePayload,
}: {
  invocationReceipt: ScheduledScanInvocationReceipt | null;
  routePayload: Record<string, unknown>;
}): Record<string, unknown> {
  if (!invocationReceipt) return { ...routePayload };

  return {
    ...routePayload,
    ...invocationReceipt.durable_invocation_payload,
    scheduled_scan_invocation_receipt: {
      receipt_version: invocationReceipt.receipt_version,
      scheduled_slot_started_at_utc:
        invocationReceipt.scheduled_slot_started_at_utc,
      scheduled_slot_identity_source:
        invocationReceipt.scheduled_slot_identity_source,
      build_deployment_identity: invocationReceipt.build_deployment_identity,
    },
  };
}

export function decisionBuildCommitForScheduledInvocation({
  invocationReceipt,
  runtimeBuildCommit,
}: {
  invocationReceipt: ScheduledScanInvocationReceipt | null;
  runtimeBuildCommit: string | null;
}) {
  return invocationReceipt?.build_deployment_identity.commit_ref ?? runtimeBuildCommit;
}
