import type { Config } from "@netlify/functions";

export const config: Config = {
  // Netlify cron is UTC. This covers 13:00-19:45 UTC weekdays,
  // including all US daylight-saving regular-session scan windows.
  schedule: "*/15 13-19 * * 1-5",
};

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

async function upsertScheduledScanAttempt(record: Record<string, unknown>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_SECRET;

  if (!supabaseUrl || !supabaseKey) {
    console.log("[scheduled-scan] Supabase attempt log skipped: missing env");
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
      console.error("[scheduled-scan] Supabase attempt log failed", {
        status: response.status,
        body: await response.text(),
      });
    }
  } catch (error) {
    console.error("[scheduled-scan] Supabase attempt log error", error);
  }
}

export default async function handler() {
  const firedAtUtc = new Date().toISOString();
  const attemptFingerprint = `scheduled_scan_attempt_${stableHash(
    `netlify_scheduled_function|${firedAtUtc}`,
  )}`;
  const automationSecret = process.env.AUTOMATION_SECRET;

  if (!automationSecret) {
    console.error("[scheduled-scan] Missing AUTOMATION_SECRET");
    return new Response("Missing AUTOMATION_SECRET", { status: 500 });
  }

  const siteUrl =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "https://trade.valentinlabs.com";

  const endpoint = `${siteUrl}/api/automation/run-scan`;
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

  console.log("[scheduled-scan] Calling:", endpoint, {
    scheduled_function_fired_at_utc: firedAtUtc,
    interpreted_ny_time: nyTime,
    scheduled_scan_attempt_fingerprint: attemptFingerprint,
  });

  await upsertScheduledScanAttempt({
    attempt_fingerprint: attemptFingerprint,
    source: "netlify_scheduled_function",
    mode: "scheduled",
    outcome: "scheduled_function_fired",
    scheduled_function_fired_at: firedAtUtc,
    utc_timestamp: firedAtUtc,
    ny_timestamp: `${nyTime} America/New_York`,
    payload_json: {
      endpoint,
    },
  });

  try {
    const response = await fetch(endpoint, {
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
    });

    const body = await response.text();

    console.log("[scheduled-scan] Response status:", response.status);
    console.log("[scheduled-scan] Response body:", body);

    if (!response.ok) {
      await upsertScheduledScanAttempt({
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
          endpoint,
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
    await upsertScheduledScanAttempt({
      attempt_fingerprint: attemptFingerprint,
      source: "netlify_scheduled_function",
      mode: "scheduled",
      outcome: "request_failed",
      scheduled_function_fired_at: firedAtUtc,
      utc_timestamp: firedAtUtc,
      ny_timestamp: `${nyTime} America/New_York`,
      message: error instanceof Error ? error.message : String(error),
      payload_json: {
        endpoint,
      },
    });

    return new Response("Scheduled scan failed", {
      status: 500,
    });
  }
}
