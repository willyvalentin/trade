import { createRequire } from "node:module";

import type { Config } from "@netlify/functions";

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
    return {
      scheduledSlot: scheduledNextRun,
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

function scheduledExecutionIsDisabled() {
  return Netlify.env.get(scheduledFunctionsDisableFlag) === "true";
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

export default async function handler(request: Request) {
  // An explicit environment switch can make a published non-production site
  // inert before it reads credentials, writes an attempt record, or reaches a
  // market-data provider. Its absence preserves the established schedule.
  if (scheduledExecutionIsDisabled()) {
    console.log("[scheduled-scan] Execution disabled by environment.");
    return new Response(null, { status: 204 });
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

  console.log("[scheduled-scan] Executing bundled internal route", {
    scheduled_function_fired_at_utc: firedAtUtc,
    interpreted_ny_time: nyTime,
    scheduled_scan_attempt_fingerprint: attemptFingerprint,
  });

  const invocationClaim = await claimScheduledScanInvocation({
    attempt_fingerprint: attemptFingerprint,
    source: "netlify_scheduled_function",
    mode: "scheduled",
    outcome: "scheduled_function_fired",
    scheduled_function_fired_at: firedAtUtc,
    utc_timestamp: firedAtUtc,
    ny_timestamp: `${nyTime} America/New_York`,
    payload_json: {
      execution_boundary: "bundled_next_route",
      scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
      scheduled_slot_identity_source: scheduledSlotIdentity.source,
    },
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
      payload_json: {
        execution_boundary: "bundled_next_route",
        scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
        scheduled_slot_identity_source: scheduledSlotIdentity.source,
      },
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
        payload_json: {
          execution_boundary: "bundled_next_route",
          scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
          scheduled_slot_identity_source: scheduledSlotIdentity.source,
        },
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
      payload_json: {
        execution_boundary: "bundled_next_route",
        scheduled_slot_started_at_utc: scheduledSlotStartedAtUtc,
        scheduled_slot_identity_source: scheduledSlotIdentity.source,
      },
    });

    return new Response("Scheduled scan failed", {
      status: 500,
    });
  }
}
