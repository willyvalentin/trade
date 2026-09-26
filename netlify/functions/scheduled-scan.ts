import { createRequire } from "node:module";

import type { Config, Context } from "@netlify/functions";
import {
  buildObservationSeriesSlotAdmission,
  observationSeriesControlFromEnvironment,
  type ObservationSeriesControl,
  type ObservationSeriesSlotAdmission,
} from "../../lib/observation-series-control";

export const config: Config = {
  // Netlify discovers scheduled functions from this entrypoint. Keep the
  // expression literal so its deployment manifest registers the cron rather
  // than retaining an older scheduled-function artifact.
  schedule: "*/15 13-20 * * 1-5",
};

type ScheduledScanRouteModule = {
  POST?: (request: Request) => Promise<Response>;
};

const runtimeRequire = createRequire(__filename);
const scheduledFunctionsDisableFlag = "TURE_DISABLE_SCHEDULED_FUNCTIONS";
const basicFreeCatalogCapabilityProbeFlag =
  "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED";
const basicFreeCatalogOneShotFlag =
  "TURE_BASIC_FREE_CATALOG_OBSERVATION_ONE_SHOT_ENABLED";
const basicFreeCatalogCapabilityProbeDateFlag =
  "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_DATE";
const basicFreeCatalogCapabilityProbeSlotFlag =
  "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_SLOT_UTC";
const normalScanOneShotFlag = "TURE_NORMAL_SCAN_ONE_SHOT_ENABLED";
const normalScanOneShotDateFlag = "TURE_NORMAL_SCAN_ONE_SHOT_DATE";
const normalScanOneShotSlotFlag = "TURE_NORMAL_SCAN_ONE_SHOT_SLOT_UTC";
const outcomeOneShotEnabledFlag = "TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED";
const internalPaperWorkerEnabledFlag = "TURE_INTERNAL_PAPER_WORKER_ENABLED";
export const SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION =
  "scheduled_scan_deployment_identity_v1" as const;
export const SCHEDULED_SCAN_PREFLIGHT_DELIVERY_GRACE_MILLISECONDS =
  3 * 60 * 1000;

export type ScheduledScanRuntimeConfiguration = {
  scheduled_functions_disabled: boolean;
  basic_free_catalog_capability_probe_enabled: boolean;
  basic_free_catalog_observation_one_shot_enabled: boolean;
  basic_free_catalog_capability_probe_date: string | null;
  basic_free_catalog_capability_probe_slot_utc: string | null;
};

export type ScheduledScanNormalOneShotControl = Readonly<{
  enabled: boolean;
  target_date: string | null;
  target_slot_utc: string | null;
}>;

type ScheduledScanEnvironment = {
  get(name: string): string | undefined;
};

// Keep the identity calculation in the scheduled-function entrypoint. Netlify
// packages this file as the cron runtime, so a change here cannot leave the
// duplicate-delivery guard behind an unrefreshed shared-module bundle.
export const SCHEDULED_SCAN_SLOT_MINUTES = 15;

export function scheduledScanSlotStartedAt(now: Date) {
  const timestamp = now.getTime();

  if (!Number.isFinite(timestamp)) {
    throw new Error("Scheduled scan slot requires a valid timestamp.");
  }

  const slotMilliseconds = SCHEDULED_SCAN_SLOT_MINUTES * 60 * 1000;
  return new Date(Math.floor(timestamp / slotMilliseconds) * slotMilliseconds);
}

export function buildScheduledScanInvocationFingerprintForSlot(
  scheduledSlot: Date,
) {
  const timestamp = scheduledSlot.getTime();

  if (!Number.isFinite(timestamp)) {
    throw new Error("Scheduled scan fingerprint requires a valid slot.");
  }

  const slotStartedAt = scheduledSlot.toISOString();

  return `scheduled_scan_attempt_${stableHash(
    `netlify_scheduled_function|${slotStartedAt}`,
  )}`;
}

export function buildScheduledScanInvocationFingerprint(now: Date) {
  return buildScheduledScanInvocationFingerprintForSlot(
    scheduledScanSlotStartedAt(now),
  );
}

type ScheduledScanSlotIdentitySource =
  | "netlify_event_next_run"
  | "delivery_quarter_hour_fallback";

type ScheduledScanPreflightEventEvidence = Readonly<{
  status:
    | "time_bound_scheduled_event"
    | "next_run_missing"
    | "next_run_invalid"
    | "next_run_not_slot_aligned"
    | "delivery_outside_slot_grace";
  next_run_utc: string | null;
  scheduled_slot_started_at_utc: string | null;
  delivery_delay_milliseconds: number | null;
}>;

export function scheduledScanSlotIdentity({
  nextRun,
  deliveryTime,
}: {
  nextRun: unknown;
  deliveryTime: Date;
}): {
  scheduledSlot: Date;
  source: ScheduledScanSlotIdentitySource;
} {
  const scheduledNextRun =
    typeof nextRun === "string" ? new Date(nextRun) : new Date(Number.NaN);

  if (Number.isFinite(scheduledNextRun.getTime())) {
    // Netlify's scheduled-function event reports the *following* cron slot
    // in `next_run`. The durable claim must identify the delivery that is
    // executing now, not the future slot, otherwise every invocation claims
    // the next quarter-hour and can suppress its successor.
    const currentSlot = new Date(
      scheduledNextRun.getTime() - SCHEDULED_SCAN_SLOT_MINUTES * 60 * 1000,
    );

    return {
      scheduledSlot: currentSlot,
      source: "netlify_event_next_run",
    };
  }

  return {
    scheduledSlot: scheduledScanSlotStartedAt(deliveryTime),
    source: "delivery_quarter_hour_fallback",
  };
}

export function scheduledScanPreflightEventEvidence({
  nextRun,
  deliveryTime,
}: {
  nextRun: unknown;
  deliveryTime: Date;
}): ScheduledScanPreflightEventEvidence {
  if (typeof nextRun !== "string" || !nextRun.trim()) {
    return {
      status: "next_run_missing",
      next_run_utc: null,
      scheduled_slot_started_at_utc: null,
      delivery_delay_milliseconds: null,
    };
  }

  const scheduledNextRun = new Date(nextRun);
  const nextRunTimestamp = scheduledNextRun.getTime();

  if (!Number.isFinite(nextRunTimestamp)) {
    return {
      status: "next_run_invalid",
      next_run_utc: null,
      scheduled_slot_started_at_utc: null,
      delivery_delay_milliseconds: null,
    };
  }

  const slotMilliseconds = SCHEDULED_SCAN_SLOT_MINUTES * 60 * 1000;
  if (nextRunTimestamp % slotMilliseconds !== 0) {
    return {
      status: "next_run_not_slot_aligned",
      next_run_utc: scheduledNextRun.toISOString(),
      scheduled_slot_started_at_utc: null,
      delivery_delay_milliseconds: null,
    };
  }

  const scheduledSlot = new Date(nextRunTimestamp - slotMilliseconds);
  const deliveryDelayMilliseconds =
    deliveryTime.getTime() - scheduledSlot.getTime();

  if (
    !Number.isFinite(deliveryDelayMilliseconds) ||
    deliveryDelayMilliseconds < 0 ||
    deliveryDelayMilliseconds >
      SCHEDULED_SCAN_PREFLIGHT_DELIVERY_GRACE_MILLISECONDS
  ) {
    return {
      status: "delivery_outside_slot_grace",
      next_run_utc: scheduledNextRun.toISOString(),
      scheduled_slot_started_at_utc: scheduledSlot.toISOString(),
      delivery_delay_milliseconds: Number.isFinite(deliveryDelayMilliseconds)
        ? deliveryDelayMilliseconds
        : null,
    };
  }

  return {
    status: "time_bound_scheduled_event",
    next_run_utc: scheduledNextRun.toISOString(),
    scheduled_slot_started_at_utc: scheduledSlot.toISOString(),
    delivery_delay_milliseconds: deliveryDelayMilliseconds,
  };
}

async function scheduledScanEventNextRun(request: Request) {
  const payload = await request.clone().json().catch(() => null);
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as { next_run?: unknown }).next_run
    : null;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function booleanTrue(value: unknown) {
  return value === "true";
}

function catalogProbeDateOrNull(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return null;

  const [year, month, day] = candidate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.toISOString().slice(0, 10) === candidate ? candidate : null;
}

function catalogProbeSlotOrNull(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const timestamp = new Date(candidate).getTime();
  const slotMilliseconds = SCHEDULED_SCAN_SLOT_MINUTES * 60 * 1000;

  return candidate &&
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString() === candidate &&
    timestamp % slotMilliseconds === 0
    ? candidate
    : null;
}

export function scheduledScanNormalOneShotControlFromEnvironment(
  environment: ScheduledScanEnvironment,
): ScheduledScanNormalOneShotControl {
  return {
    enabled: booleanTrue(environment.get(normalScanOneShotFlag)),
    target_date: catalogProbeDateOrNull(
      environment.get(normalScanOneShotDateFlag),
    ),
    target_slot_utc: catalogProbeSlotOrNull(
      environment.get(normalScanOneShotSlotFlag),
    ),
  };
}

export function scheduledScanRuntimeConfigurationFromEnvironment(
  environment: ScheduledScanEnvironment,
): ScheduledScanRuntimeConfiguration {
  return {
    scheduled_functions_disabled: booleanTrue(
      environment.get(scheduledFunctionsDisableFlag),
    ),
    basic_free_catalog_capability_probe_enabled: booleanTrue(
      environment.get(basicFreeCatalogCapabilityProbeFlag),
    ),
    basic_free_catalog_observation_one_shot_enabled: booleanTrue(
      environment.get(basicFreeCatalogOneShotFlag),
    ),
    basic_free_catalog_capability_probe_date: catalogProbeDateOrNull(
      environment.get(basicFreeCatalogCapabilityProbeDateFlag),
    ),
    basic_free_catalog_capability_probe_slot_utc: catalogProbeSlotOrNull(
      environment.get(basicFreeCatalogCapabilityProbeSlotFlag),
    ),
  };
}

function scheduledScanRuntimeConfiguration() {
  return scheduledScanRuntimeConfigurationFromEnvironment(Netlify.env);
}

type ScheduledScanDeployIdentity = {
  deploy_id: string | null;
  deploy_context: string | null;
  deploy_published: boolean | null;
};

export type ScheduledScanBuildDeploymentIdentity = Readonly<{
  schema_version: typeof SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION;
  deploy_id: string;
  deploy_context: "production";
  commit_ref: string;
  site_id: string;
}>;

type ScheduledScanResolvedDeploymentIdentity = Readonly<{
  schema_version: typeof SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION;
  deploy_id: string;
  deploy_context: "production";
  deploy_published: boolean | null;
  publication_evidence:
    | "runtime_context"
    | "scheduled_event_requires_external_deploy_readback"
    | "matching_runtime_context_requires_external_deploy_readback";
  commit_ref: string | null;
  site_id: string | null;
}>;

type ScheduledScanProbePreflightAdmission = Readonly<{
  status:
    | "admitted_runtime_context"
    | "admitted_build_identity_fallback"
    | "admitted_matching_runtime_context"
    | "scheduled_event_unavailable"
    | "deployment_identity_unavailable"
    | "deployment_identity_conflict"
    | "build_identity_site_mismatch"
    | "probe_slot_unavailable"
    | "probe_slot_mismatch"
    | "probe_date_unavailable"
    | "probe_date_mismatch";
  admitted: boolean;
  identity_source:
    | "runtime_context"
    | "build_identity_fallback"
    | "matching_runtime_context"
    | null;
  deployment_identity: ScheduledScanResolvedDeploymentIdentity | null;
  event_evidence: ScheduledScanPreflightEventEvidence;
}>;

const netlifyDeployIdPattern = /^[0-9a-f]{24}$/;
const gitCommitPattern = /^[0-9a-f]{40}$/;
const siteIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function normalizedString(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim().toLowerCase()
    : null;
}

function newYorkDateForUtc(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: "year" | "month" | "day") =>
    parts.find((candidate) => candidate.type === type)?.value ?? null;
  const year = part("year");
  const month = part("month");
  const day = part("day");

  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function parseScheduledScanBuildDeploymentIdentity(
  value: unknown,
): ScheduledScanBuildDeploymentIdentity | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as Record<string, unknown>;
  const deployId = normalizedString(candidate.deploy_id);
  const deployContext = normalizedString(candidate.deploy_context);
  const commitRef = normalizedString(candidate.commit_ref);
  const siteId = normalizedString(candidate.site_id);

  if (
    candidate.schema_version !==
      SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION ||
    !deployId ||
    !netlifyDeployIdPattern.test(deployId) ||
    deployContext !== "production" ||
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

function scheduledScanDeployIdentity(
  context: Context,
): ScheduledScanDeployIdentity {
  return {
    deploy_id:
      typeof context.deploy?.id === "string" && context.deploy.id.trim()
        ? context.deploy.id
        : null,
    deploy_context:
      typeof context.deploy?.context === "string" && context.deploy.context.trim()
        ? context.deploy.context
        : null,
    deploy_published:
      typeof context.deploy?.published === "boolean"
        ? context.deploy.published
        : null,
  };
}

function scheduledScanProbePreflightHasPublishedProductionRuntimeContext(
  identity: ScheduledScanDeployIdentity,
) {
  return (
    identity.deploy_id !== null &&
    netlifyDeployIdPattern.test(identity.deploy_id.toLowerCase()) &&
    identity.deploy_context === "production" &&
    identity.deploy_published === true
  );
}

function loadScheduledScanBuildDeploymentIdentity() {
  try {
    return parseScheduledScanBuildDeploymentIdentity(
      runtimeRequire(
        "../.generated/scheduled-scan-deployment-identity.json",
      ) as unknown,
    );
  } catch {
    return null;
  }
}

export function scheduledScanTimeBoundAdmission({
  contextIdentity,
  buildIdentity,
  runtimeSiteId,
  eventEvidence,
  configuredProbeSlotUtc,
  configuredProbeDate,
}: {
  contextIdentity: ScheduledScanDeployIdentity;
  buildIdentity: ScheduledScanBuildDeploymentIdentity | null;
  runtimeSiteId: unknown;
  eventEvidence: ScheduledScanPreflightEventEvidence;
  configuredProbeSlotUtc: string | null;
  configuredProbeDate: string | null;
}): ScheduledScanProbePreflightAdmission {
  if (eventEvidence.status !== "time_bound_scheduled_event") {
    return Object.freeze({
      status: "scheduled_event_unavailable",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  if (!configuredProbeSlotUtc) {
    return Object.freeze({
      status: "probe_slot_unavailable",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  if (
    eventEvidence.scheduled_slot_started_at_utc !== configuredProbeSlotUtc
  ) {
    return Object.freeze({
      status: "probe_slot_mismatch",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  if (!configuredProbeDate) {
    return Object.freeze({
      status: "probe_date_unavailable",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  if (newYorkDateForUtc(configuredProbeSlotUtc) !== configuredProbeDate) {
    return Object.freeze({
      status: "probe_date_mismatch",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  if (
    scheduledScanProbePreflightHasPublishedProductionRuntimeContext(
      contextIdentity,
    )
  ) {
    const runtimeDeployId = contextIdentity.deploy_id!.toLowerCase();
    if (
      buildIdentity &&
      (buildIdentity.deploy_id !== runtimeDeployId ||
        buildIdentity.deploy_context !== contextIdentity.deploy_context)
    ) {
      return Object.freeze({
        status: "deployment_identity_conflict",
        admitted: false,
        identity_source: null,
        deployment_identity: null,
        event_evidence: eventEvidence,
      });
    }

    return Object.freeze({
      status: "admitted_runtime_context",
      admitted: true,
      identity_source: "runtime_context",
      deployment_identity: Object.freeze({
        schema_version: SCHEDULED_SCAN_DEPLOYMENT_IDENTITY_SCHEMA_VERSION,
        deploy_id: runtimeDeployId,
        deploy_context: "production",
        deploy_published: true,
        publication_evidence: "runtime_context",
        commit_ref: buildIdentity?.commit_ref ?? null,
        site_id: buildIdentity?.site_id ?? null,
      }),
      event_evidence: eventEvidence,
    });
  }

  if (!buildIdentity) {
    return Object.freeze({
      status: "deployment_identity_unavailable",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  const contextDeployId = normalizedString(contextIdentity.deploy_id);
  const contextDeployContext = normalizedString(contextIdentity.deploy_context);
  if (
    (contextDeployId && contextDeployId !== buildIdentity.deploy_id) ||
    (contextDeployContext && contextDeployContext !== "production") ||
    (contextIdentity.deploy_published === false &&
      (!contextDeployId || !contextDeployContext))
  ) {
    return Object.freeze({
      status: "deployment_identity_conflict",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  const normalizedRuntimeSiteId = normalizedString(runtimeSiteId);
  if (normalizedRuntimeSiteId !== buildIdentity.site_id) {
    return Object.freeze({
      status: "build_identity_site_mismatch",
      admitted: false,
      identity_source: null,
      deployment_identity: null,
      event_evidence: eventEvidence,
    });
  }

  if (contextIdentity.deploy_published === false) {
    // Netlify documents that scheduled functions run only from published
    // deploys, but its scheduled runtime can report `published: false` for the
    // exact production deploy that contains this build identity. Treat that
    // boolean as non-authoritative only when deploy id, production context and
    // runtime site all match the immutable build artifact. The receipt keeps
    // the observed false value and still requires an external deploy readback.
    return Object.freeze({
      status: "admitted_matching_runtime_context",
      admitted: true,
      identity_source: "matching_runtime_context",
      deployment_identity: Object.freeze({
        ...buildIdentity,
        deploy_published: false,
        publication_evidence:
          "matching_runtime_context_requires_external_deploy_readback",
      }),
      event_evidence: eventEvidence,
    });
  }

  return Object.freeze({
    status: "admitted_build_identity_fallback",
    admitted: true,
    identity_source: "build_identity_fallback",
    deployment_identity: Object.freeze({
      ...buildIdentity,
      deploy_published: null,
      publication_evidence:
        "scheduled_event_requires_external_deploy_readback",
    }),
    event_evidence: eventEvidence,
  });
}

export const scheduledScanProbePreflightAdmission =
  scheduledScanTimeBoundAdmission;

function scheduledScanAttemptPayload({
  executionBoundary,
  scheduledSlotStartedAtUtc,
  scheduledSlotIdentitySource,
  runtimeConfiguration,
  context,
  buildDeploymentIdentity,
  probePreflightAdmission,
  normalScanOneShotControl,
  normalScanOneShotAdmission,
  observationSeriesControl,
  observationSeriesSlotAdmission,
}: {
  executionBoundary: string;
  scheduledSlotStartedAtUtc: string;
  scheduledSlotIdentitySource: ScheduledScanSlotIdentitySource;
  runtimeConfiguration: ScheduledScanRuntimeConfiguration;
  context: Context;
  buildDeploymentIdentity: ScheduledScanBuildDeploymentIdentity | null;
  probePreflightAdmission: ScheduledScanProbePreflightAdmission | null;
  normalScanOneShotControl?: ScheduledScanNormalOneShotControl | null;
  normalScanOneShotAdmission?: ScheduledScanProbePreflightAdmission | null;
  observationSeriesControl?: ObservationSeriesControl | null;
  observationSeriesSlotAdmission?: ObservationSeriesSlotAdmission | null;
}) {
  return {
    execution_boundary: executionBoundary,
    scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
    scheduled_slot_identity_source: scheduledSlotIdentitySource,
    runtime_configuration: runtimeConfiguration,
    netlify_deploy: scheduledScanDeployIdentity(context),
    // The private route may add terminal facts to this exact durable attempt,
    // but it must retain this generated build identity rather than recover a
    // possibly absent runtime environment variable.
    build_deployment_identity: buildDeploymentIdentity,
    probe_preflight_admission: probePreflightAdmission,
    normal_scan_one_shot_control: normalScanOneShotControl ?? null,
    normal_scan_one_shot_admission: normalScanOneShotAdmission ?? null,
    observation_series_control: observationSeriesControl ?? null,
    observation_series_slot_admission:
      observationSeriesSlotAdmission ?? null,
  };
}

async function invokeScheduledScanRoute({
  automationSecret,
  firedAtUtc,
  attemptFingerprint,
}: {
  automationSecret: string;
  firedAtUtc: string;
  attemptFingerprint: string;
}) {
  const routeModule = runtimeRequire(
    "../.generated/scheduled-scan-runtime.cjs",
  ) as ScheduledScanRouteModule;

  if (typeof routeModule.POST !== "function") {
    throw new Error("Scheduled scan runtime does not export POST.");
  }

  return routeModule.POST(
    new Request("http://internal/api/automation/run-scan", {
      method: "POST",
      headers: {
        "x-automation-secret": automationSecret,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        source: "netlify_scheduled_function",
        scheduled_function_fired_at_utc: firedAtUtc,
        scheduled_scan_attempt_fingerprint: attemptFingerprint,
      }),
    }),
  );
}

async function claimScheduledScanInvocation(record: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[scheduled-scan] Durable invocation claim unavailable: missing env");
    return "unavailable" as const;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/scheduled_scan_attempts?on_conflict=attempt_fingerprint`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          authorization: `Bearer ${supabaseKey}`,
          "content-type": "application/json",
          // The unique attempt fingerprint is the claim. A duplicate cron
          // delivery receives an empty representation and must not reach the
          // internal route, provider, or any recommendation side effect.
          prefer: "resolution=ignore-duplicates,return=representation",
        },
        body: JSON.stringify(record),
      },
    );

    if (!response.ok) {
      console.error("[scheduled-scan] Durable invocation claim failed", {
        status: response.status,
        body: await response.text(),
      });
      return "unavailable" as const;
    }

    const rows = await response.json().catch(() => null);

    if (Array.isArray(rows) && rows.length === 1) {
      return "claimed" as const;
    }

    if (Array.isArray(rows) && rows.length === 0) {
      return "duplicate" as const;
    }

    console.error("[scheduled-scan] Durable invocation claim response was ambiguous");
    return "unavailable" as const;
  } catch (error) {
    console.error("[scheduled-scan] Durable invocation claim error", error);
    return "unavailable" as const;
  }
}

async function updateScheduledScanAttempt(record: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[scheduled-scan] Attempt update skipped: missing env");
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/scheduled_scan_attempts?on_conflict=attempt_fingerprint`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          authorization: `Bearer ${supabaseKey}`,
          "content-type": "application/json",
          prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(record),
      },
    );

    if (!response.ok) {
      console.error("[scheduled-scan] Attempt update failed", {
        status: response.status,
        body: await response.text(),
      });
    }
  } catch (error) {
    console.error("[scheduled-scan] Attempt update error", error);
  }
}

export default async function handler(request: Request, context: Context) {
  const runtimeConfiguration = scheduledScanRuntimeConfiguration();
  const normalScanOneShotControl =
    scheduledScanNormalOneShotControlFromEnvironment(Netlify.env);
  const normalScanOneShotRequested = normalScanOneShotControl.enabled;
  const observationSeriesControl =
    observationSeriesControlFromEnvironment(Netlify.env);
  const observationSeriesRequested = observationSeriesControl.requested;

  if (
    observationSeriesRequested &&
    observationSeriesControl.status !== "ready"
  ) {
    console.error("[scheduled-scan] Observation series configuration invalid.", {
      reason_codes: observationSeriesControl.reason_codes,
    });
    return new Response("Observation series configuration invalid", {
      status: 503,
    });
  }

  if (normalScanOneShotRequested && observationSeriesRequested) {
    console.error("[scheduled-scan] Normal one-shot conflicts with observation series.");
    return new Response("Scheduled scan control conflict", { status: 503 });
  }

  // These bounded overrides apply only to scheduled-scan. The global disable
  // must remain on so outcome evaluation and the paper worker stay inert.
  // Catalog-only modes cannot fall through to a normal provider scan.
  if (
    (normalScanOneShotRequested || observationSeriesRequested) &&
    (!runtimeConfiguration.scheduled_functions_disabled ||
      runtimeConfiguration.basic_free_catalog_capability_probe_enabled ||
      runtimeConfiguration.basic_free_catalog_observation_one_shot_enabled ||
      Netlify.env.get(outcomeOneShotEnabledFlag) === "true" ||
      Netlify.env.get(internalPaperWorkerEnabledFlag) === "true")
  ) {
    console.error("[scheduled-scan] Normal scan control conflicts with runtime gates.");
    return new Response(
      normalScanOneShotRequested
        ? "Normal one-shot scan gates unavailable"
        : "Observation series scan gates unavailable",
      { status: 503 },
    );
  }

  // An explicit environment switch can make a published non-production site
  // inert before it reads credentials, writes an attempt record, or reaches a
  // market-data provider. The one exception is an explicitly armed Basic Free
  // catalog probe: its disabled delivery records a deploy-bound preflight
  // receipt, but never loads the scan route or reaches a provider.
  const disabledProbePreflight =
    runtimeConfiguration.scheduled_functions_disabled &&
    runtimeConfiguration.basic_free_catalog_capability_probe_enabled;

  if (disabledProbePreflight && Netlify.env.get(outcomeOneShotEnabledFlag) === "true") {
    console.error("[scheduled-scan] Catalog probe conflicts with outcome one-shot mode.");
    return new Response("Catalog probe gates unavailable", { status: 503 });
  }

  if (
    runtimeConfiguration.scheduled_functions_disabled &&
    !disabledProbePreflight &&
    !normalScanOneShotRequested &&
    !observationSeriesRequested
  ) {
    console.log("[scheduled-scan] Execution disabled by environment.");
    return new Response(null, { status: 204 });
  }

  const firedAt = new Date();
  const firedAtUtc = firedAt.toISOString();
  const eventNextRun = await scheduledScanEventNextRun(request);
  const eventEvidence = scheduledScanPreflightEventEvidence({
    nextRun: eventNextRun,
    deliveryTime: firedAt,
  });
  const scheduledScanBuildIdentity = loadScheduledScanBuildDeploymentIdentity();
  const probePreflightAdmission = disabledProbePreflight
    ? scheduledScanTimeBoundAdmission({
        contextIdentity: scheduledScanDeployIdentity(context),
        buildIdentity: scheduledScanBuildIdentity,
        runtimeSiteId: process.env.SITE_ID,
        eventEvidence,
        configuredProbeSlotUtc:
          runtimeConfiguration.basic_free_catalog_capability_probe_slot_utc,
        configuredProbeDate:
          runtimeConfiguration.basic_free_catalog_capability_probe_date,
      })
    : null;
  const normalScanOneShotBuildIdentity = normalScanOneShotRequested
    ? scheduledScanBuildIdentity
    : null;
  const normalScanOneShotAdmission = normalScanOneShotRequested
    ? scheduledScanTimeBoundAdmission({
        contextIdentity: scheduledScanDeployIdentity(context),
        buildIdentity: normalScanOneShotBuildIdentity,
        runtimeSiteId: process.env.SITE_ID,
        eventEvidence,
        configuredProbeSlotUtc: normalScanOneShotControl.target_slot_utc,
        configuredProbeDate: normalScanOneShotControl.target_date,
      })
    : null;
  const observationSeriesSlotAdmission = observationSeriesRequested
    ? buildObservationSeriesSlotAdmission({
        control: observationSeriesControl,
        scheduledSlotStartedAtUtc:
          eventEvidence.scheduled_slot_started_at_utc,
      })
    : null;
  const observationSeriesTimeBoundAdmission = observationSeriesRequested
    ? scheduledScanTimeBoundAdmission({
        contextIdentity: scheduledScanDeployIdentity(context),
        buildIdentity: scheduledScanBuildIdentity,
        runtimeSiteId: process.env.SITE_ID,
        eventEvidence,
        configuredProbeSlotUtc:
          observationSeriesSlotAdmission?.scheduled_slot_started_at_utc ?? null,
        configuredProbeDate: observationSeriesControl.trading_date,
      })
    : null;

  if (
    observationSeriesRequested &&
    observationSeriesSlotAdmission?.decision !== "eligible"
  ) {
    if (observationSeriesSlotAdmission?.decision === "no_request") {
      console.log("[scheduled-scan] Observation series slot is not eligible.", {
        status: observationSeriesSlotAdmission.status,
      });
      return new Response(null, { status: 204 });
    }
    console.error("[scheduled-scan] Observation series slot admission failed.", {
      status:
        observationSeriesSlotAdmission?.status ??
        "series_slot_admission_unavailable",
    });
    return new Response("Observation series slot admission unavailable", {
      status: 503,
    });
  }

  if (
    observationSeriesRequested &&
    !observationSeriesTimeBoundAdmission?.admitted
  ) {
    console.error("[scheduled-scan] Observation series time-bound admission failed.", {
      status:
        observationSeriesTimeBoundAdmission?.status ??
        "series_time_bound_admission_unavailable",
    });
    return new Response("Observation series time-bound admission unavailable", {
      status: 503,
    });
  }

  if (
    observationSeriesRequested &&
    (!scheduledScanBuildIdentity ||
      normalizedString(process.env.SITE_ID) !==
        scheduledScanBuildIdentity.site_id)
  ) {
    console.error("[scheduled-scan] Observation series build identity unavailable.");
    return new Response("Observation series build identity unavailable", {
      status: 503,
    });
  }

  if (normalScanOneShotRequested && !normalScanOneShotAdmission?.admitted) {
    console.error("[scheduled-scan] Normal one-shot admission failed.", {
      status: normalScanOneShotAdmission?.status ?? "admission_unavailable",
      event_evidence: normalScanOneShotAdmission?.event_evidence ?? null,
    });
    if (
      normalScanOneShotAdmission?.status === "probe_slot_unavailable" ||
      normalScanOneShotAdmission?.status === "probe_slot_mismatch" ||
      normalScanOneShotAdmission?.status === "probe_date_unavailable" ||
      normalScanOneShotAdmission?.status === "probe_date_mismatch"
    ) {
      return new Response(null, { status: 204 });
    }
    return new Response("Normal one-shot scan admission unavailable", {
      status: 503,
    });
  }

  if (
    normalScanOneShotRequested &&
    (!normalScanOneShotBuildIdentity ||
      normalizedString(process.env.SITE_ID) !==
        normalScanOneShotBuildIdentity.site_id)
  ) {
    console.error("[scheduled-scan] Normal one-shot build identity unavailable.");
    return new Response("Normal one-shot build identity unavailable", {
      status: 503,
    });
  }

  if (disabledProbePreflight && !probePreflightAdmission?.admitted) {
    console.error(
      "[scheduled-scan] Disabled Basic Free probe preflight admission failed.",
      {
        status: probePreflightAdmission?.status ?? "admission_unavailable",
        runtime_deploy: scheduledScanDeployIdentity(context),
        event_evidence: probePreflightAdmission?.event_evidence ?? null,
      },
    );
    if (
      probePreflightAdmission?.status === "probe_slot_unavailable" ||
      probePreflightAdmission?.status === "probe_slot_mismatch" ||
      probePreflightAdmission?.status === "probe_date_unavailable" ||
      probePreflightAdmission?.status === "probe_date_mismatch"
    ) {
      return new Response(null, { status: 204 });
    }

    return new Response("Scheduled scan preflight admission unavailable", {
      status: 503,
    });
  }

  const scheduledSlotIdentity = scheduledScanSlotIdentity({
    nextRun: eventNextRun,
    deliveryTime: firedAt,
  });
  const scheduledSlotStartedAtUtc =
    scheduledSlotIdentity.scheduledSlot.toISOString();
  const attemptFingerprint = buildScheduledScanInvocationFingerprintForSlot(
    scheduledSlotIdentity.scheduledSlot,
  );

  const nyTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(firedAtUtc));

  console.log("[scheduled-scan] Processing scheduled slot", {
    scheduled_function_fired_at_utc: firedAtUtc,
    interpreted_ny_time: nyTime,
    scheduled_scan_attempt_fingerprint: attemptFingerprint,
  });

  const executionBoundary = disabledProbePreflight
    ? "scheduler_disabled_basic_free_catalog_probe_preflight"
    : normalScanOneShotRequested
      ? "scheduler_disabled_normal_scan_one_shot"
      : observationSeriesRequested
        ? "scheduler_disabled_observation_series"
    : "bundled_next_route";

  const invocationClaim = await claimScheduledScanInvocation({
    attempt_fingerprint: attemptFingerprint,
    source: "netlify_scheduled_function",
    mode: "scheduled",
    outcome: disabledProbePreflight ? "skipped" : "scheduled_function_fired",
    allowed: disabledProbePreflight ? false : null,
    skip_reason: disabledProbePreflight
      ? "scheduled_execution_disabled_probe_preflight"
      : null,
    message: disabledProbePreflight
      ? "Basic Free catalog probe is armed, but scheduled execution remains disabled; durable deploy-bound preflight only."
      : null,
    scheduled_function_fired_at: firedAtUtc,
    utc_timestamp: firedAtUtc,
    ny_timestamp: `${nyTime} America/New_York`,
    payload_json: scheduledScanAttemptPayload({
      executionBoundary,
      scheduledSlotStartedAtUtc,
      scheduledSlotIdentitySource: scheduledSlotIdentity.source,
      runtimeConfiguration,
      context,
      buildDeploymentIdentity: scheduledScanBuildIdentity,
      probePreflightAdmission,
      normalScanOneShotControl: normalScanOneShotRequested
        ? normalScanOneShotControl
        : null,
      normalScanOneShotAdmission,
      observationSeriesControl: observationSeriesRequested
        ? observationSeriesControl
        : null,
      observationSeriesSlotAdmission,
    }),
  });

  if (invocationClaim === "duplicate") {
    console.log("[scheduled-scan] Duplicate scheduled slot skipped", {
      scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
      scheduled_scan_attempt_fingerprint: attemptFingerprint,
    });
    return new Response(null, { status: 204 });
  }

  if (invocationClaim === "unavailable") {
    return new Response("Scheduled scan claim unavailable", { status: 503 });
  }

  if (disabledProbePreflight) {
    console.log("[scheduled-scan] Recorded disabled Basic Free probe preflight.", {
      scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
      scheduled_scan_attempt_fingerprint: attemptFingerprint,
    });
    return new Response(null, { status: 204 });
  }

  const automationSecret = process.env.AUTOMATION_SECRET;

  if (!automationSecret) {
    console.error("[scheduled-scan] Missing AUTOMATION_SECRET");
    await updateScheduledScanAttempt({
      attempt_fingerprint: attemptFingerprint,
      source: "netlify_scheduled_function",
      mode: "scheduled",
      outcome: "request_failed",
      scheduled_function_fired_at: firedAtUtc,
      utc_timestamp: firedAtUtc,
      ny_timestamp: `${nyTime} America/New_York`,
      message: "Missing AUTOMATION_SECRET",
      payload_json: scheduledScanAttemptPayload({
        executionBoundary,
        scheduledSlotStartedAtUtc,
        scheduledSlotIdentitySource: scheduledSlotIdentity.source,
        runtimeConfiguration,
        context,
        buildDeploymentIdentity: scheduledScanBuildIdentity,
        probePreflightAdmission,
        normalScanOneShotControl: normalScanOneShotRequested
          ? normalScanOneShotControl
          : null,
        normalScanOneShotAdmission,
        observationSeriesControl: observationSeriesRequested
          ? observationSeriesControl
          : null,
        observationSeriesSlotAdmission,
      }),
    });
    return new Response("Missing AUTOMATION_SECRET", { status: 500 });
  }

  try {
    const response = await invokeScheduledScanRoute({
      automationSecret,
      firedAtUtc,
      attemptFingerprint,
    });

    const body = await response.text();

    console.log("[scheduled-scan] Response status:", response.status);
    console.log("[scheduled-scan] Response body:", body);

    if (!response.ok) {
      await updateScheduledScanAttempt({
        attempt_fingerprint: attemptFingerprint,
        source: "netlify_scheduled_function",
        mode: "scheduled",
        outcome: "request_failed",
        scheduled_function_fired_at: firedAtUtc,
        utc_timestamp: firedAtUtc,
        ny_timestamp: `${nyTime} America/New_York`,
        http_status: response.status,
        message: body.slice(0, 1000),
        payload_json: scheduledScanAttemptPayload({
          executionBoundary,
          scheduledSlotStartedAtUtc,
          scheduledSlotIdentitySource: scheduledSlotIdentity.source,
          runtimeConfiguration,
          context,
          buildDeploymentIdentity: scheduledScanBuildIdentity,
          probePreflightAdmission,
          normalScanOneShotControl: normalScanOneShotRequested
            ? normalScanOneShotControl
            : null,
          normalScanOneShotAdmission,
          observationSeriesControl: observationSeriesRequested
            ? observationSeriesControl
            : null,
          observationSeriesSlotAdmission,
        }),
      });
    }

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("[scheduled-scan] Failed:", error);
    await updateScheduledScanAttempt({
      attempt_fingerprint: attemptFingerprint,
      source: "netlify_scheduled_function",
      mode: "scheduled",
      outcome: "request_failed",
      scheduled_function_fired_at: firedAtUtc,
      utc_timestamp: firedAtUtc,
      ny_timestamp: `${nyTime} America/New_York`,
      message: error instanceof Error ? error.message : String(error),
      payload_json: scheduledScanAttemptPayload({
        executionBoundary,
        scheduledSlotStartedAtUtc,
        scheduledSlotIdentitySource: scheduledSlotIdentity.source,
        runtimeConfiguration,
        context,
        buildDeploymentIdentity: scheduledScanBuildIdentity,
        probePreflightAdmission,
        normalScanOneShotControl: normalScanOneShotRequested
          ? normalScanOneShotControl
          : null,
        normalScanOneShotAdmission,
        observationSeriesControl: observationSeriesRequested
          ? observationSeriesControl
          : null,
        observationSeriesSlotAdmission,
      }),
    });

    return new Response("Scheduled scan failed", {
      status: 500,
    });
  }
}
