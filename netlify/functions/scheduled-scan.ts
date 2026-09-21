import { createRequire } from "node:module";

import type { Config, Context } from "@netlify/functions";

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

export type ScheduledScanRuntimeConfiguration = {
  scheduled_functions_disabled: boolean;
  basic_free_catalog_capability_probe_enabled: boolean;
  basic_free_catalog_observation_one_shot_enabled: boolean;
  basic_free_catalog_capability_probe_date: string | null;
};

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

async function scheduledScanSlotIdentityFromEvent({
  request,
  deliveryTime,
}: {
  request: Request;
  deliveryTime: Date;
}) {
  const payload = await request.clone().json().catch(() => null);
  const nextRun =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { next_run?: unknown }).next_run
      : null;

  return scheduledScanSlotIdentity({ nextRun, deliveryTime });
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
  return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : null;
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

function scheduledScanProbePreflightHasPublishedProductionDeploy(
  identity: ScheduledScanDeployIdentity,
) {
  return (
    identity.deploy_id !== null &&
    identity.deploy_context === "production" &&
    identity.deploy_published === true
  );
}

function scheduledScanAttemptPayload({
  executionBoundary,
  scheduledSlotStartedAtUtc,
  scheduledSlotIdentitySource,
  runtimeConfiguration,
  context,
}: {
  executionBoundary: string;
  scheduledSlotStartedAtUtc: string;
  scheduledSlotIdentitySource: ScheduledScanSlotIdentitySource;
  runtimeConfiguration: ScheduledScanRuntimeConfiguration;
  context: Context;
}) {
  return {
    execution_boundary: executionBoundary,
    scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
    scheduled_slot_identity_source: scheduledSlotIdentitySource,
    runtime_configuration: runtimeConfiguration,
    netlify_deploy: scheduledScanDeployIdentity(context),
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

  // An explicit environment switch can make a published non-production site
  // inert before it reads credentials, writes an attempt record, or reaches a
  // market-data provider. The one exception is an explicitly armed Basic Free
  // catalog probe: its disabled delivery records a deploy-bound preflight
  // receipt, but never loads the scan route or reaches a provider.
  const disabledProbePreflight =
    runtimeConfiguration.scheduled_functions_disabled &&
    runtimeConfiguration.basic_free_catalog_capability_probe_enabled;

  if (runtimeConfiguration.scheduled_functions_disabled && !disabledProbePreflight) {
    console.log("[scheduled-scan] Execution disabled by environment.");
    return new Response(null, { status: 204 });
  }

  if (
    disabledProbePreflight &&
    !scheduledScanProbePreflightHasPublishedProductionDeploy(
      scheduledScanDeployIdentity(context),
    )
  ) {
    console.error(
      "[scheduled-scan] Disabled Basic Free probe preflight requires a published production deploy identity.",
    );
    return new Response(
      "Scheduled scan preflight deployment identity unavailable",
      { status: 503 },
    );
  }

  const firedAt = new Date();
  const firedAtUtc = firedAt.toISOString();
  const scheduledSlotIdentity = await scheduledScanSlotIdentityFromEvent({
    request,
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
      }),
    });

    return new Response("Scheduled scan failed", {
      status: 500,
    });
  }
}
