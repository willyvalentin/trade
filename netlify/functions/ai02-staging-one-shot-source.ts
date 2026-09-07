import type { Config, Context } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";

import { getUsEquityMarketSession } from "../../lib/us-equity-market-calendar";

const tokenHeader = "x-ai02-staging-proof-token";
const stagingSupabaseUrlSha256 =
  "e47565f4baf37880dd3b5ebf272980c521411e2b7b1533a955c5befb1bd721d1";
const oneShotAttemptFingerprint = "ai02_staging_one_shot_source_v1";
const oneShotSource = "ai02_staging_one_shot_source";
const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const config: Config = {
  path: "/.netlify/functions/ai02-staging-one-shot-source",
  method: "POST",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function unavailable() {
  return response({ error: "not_found" }, 404);
}

function tokensMatch(candidate: string | null, expected: string | undefined) {
  if (!candidate || !expected) return false;

  const candidateBytes = Buffer.from(candidate, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return (
    candidateBytes.byteLength === expectedBytes.byteLength &&
    timingSafeEqual(candidateBytes, expectedBytes)
  );
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function safeDeployPreviewUrl(value: string | undefined) {
  const url = safeUrl(value);
  return url?.hostname.endsWith(".netlify.app") ? url : null;
}

/**
 * This narrow, verified-calendar gate avoids consuming the durable one-shot
 * marker when an official scan cannot generate source evidence. The
 * authenticated scan route remains authoritative, but this preflight must
 * fail closed for a holiday, weekend, stale calendar, or after an early close.
 */
export function isSourceWindowAdmitted(now: Date) {
  const session = getUsEquityMarketSession(now);
  if (
    session.verification_status !== "verified" ||
    (session.session_type !== "regular_session" &&
      session.session_type !== "early_close_session") ||
    !session.session_open ||
    !session.session_close
  ) {
    return false;
  }

  const sessionOpen = new Date(session.session_open).getTime();
  const sessionClose = new Date(session.session_close).getTime();
  if (
    !Number.isFinite(sessionOpen) ||
    !Number.isFinite(sessionClose) ||
    now.getTime() < sessionOpen + 15 * 60_000 ||
    now.getTime() >= sessionClose
  ) {
    return false;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const minutesAfterMidnight =
    Number(values.get("hour") ?? "0") * 60 +
    Number(values.get("minute") ?? "0");

  return minutesAfterMidnight < 15 * 60;
}

function boundedCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function scanReceipt(responseStatus: number, body: unknown) {
  const payload = objectOrNull(body);
  const activeTrace = objectOrNull(payload?.active_scan_trace);
  const persistence = objectOrNull(activeTrace?.persistence);
  const marketDataFetch = objectOrNull(activeTrace?.market_data_fetch);
  const recommendationsCreated = boundedCount(payload?.recommendations_created);
  const snapshotsPersisted = boundedCount(
    persistence?.snapshots_persisted_count,
  );
  const candleSuccesses = boundedCount(marketDataFetch?.candle_success_count);
  const candleErrors = boundedCount(marketDataFetch?.candle_error_count);
  const decision = payload?.decision;

  if (
    !payload ||
    ![
      "scanned",
      "skipped_market_closed",
      "skipped_outside_window",
      "skipped_provider_unavailable",
      "failed",
    ].includes(typeof decision === "string" ? decision : "") ||
    recommendationsCreated === null ||
    snapshotsPersisted === null ||
    candleSuccesses === null ||
    candleErrors === null ||
    recommendationsCreated > 1 ||
    snapshotsPersisted > 1 ||
    candleSuccesses + candleErrors !== 1
  ) {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_source_creation",
        one_shot_consumption: "consumed",
        result: "bounded_receipt_rejected",
        route_status_class: `${Math.floor(responseStatus / 100)}xx`,
        source_rows: "not_returned",
        credential_values: "not_returned",
        provider_payload: "not_returned",
      },
      502,
    );
  }

  return response({
    environment: "staging",
    operation: "ai02_one_shot_source_creation",
    one_shot_consumption: "consumed",
    result:
      decision === "scanned" && snapshotsPersisted === 1
        ? "one_server_owned_snapshot_recorded"
        : "no_server_owned_snapshot_recorded",
    scan_decision: decision,
    recommendations_created: recommendationsCreated,
    snapshots_persisted_count: snapshotsPersisted,
    fresh_provider_candle_success_count: candleSuccesses,
    fresh_provider_candle_error_count: candleErrors,
    provider_data_access:
      candleSuccesses === 1
        ? "one_fresh_provider_dataset_confirmed"
        : "one_fresh_provider_request_attempted_without_usable_dataset",
    source_rows: "not_returned",
    credential_values: "not_returned",
    provider_payload: "not_returned",
  });
}

async function reserveOneShot(input: {
  supabaseUrl: URL;
  serviceRoleKey: string;
  now: Date;
}) {
  const result = await fetch(
    new URL("/rest/v1/scheduled_scan_attempts", input.supabaseUrl),
    {
      method: "POST",
      headers: {
        apikey: input.serviceRoleKey,
        authorization: `Bearer ${input.serviceRoleKey}`,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify({
        attempt_fingerprint: oneShotAttemptFingerprint,
        source: oneShotSource,
        mode: "diagnostic",
        outcome: "scheduled_function_fired",
        allowed: true,
        scheduled_function_fired_at: input.now.toISOString(),
        utc_timestamp: input.now.toISOString(),
        payload_json: { operation: "ai02_one_shot_source_creation" },
      }),
    },
  );

  if (result.status === 201 || result.status === 200) return "reserved";
  if (result.status === 409) return "consumed";
  return "unavailable";
}

/**
 * The canonical scan route refuses to run without a real, server-owned Auth
 * principal. AI-02.17 may verify the preconfigured staging owner, but it must
 * never provision an Auth identity as a side effect of its one-shot evidence
 * operation. A missing owner fails closed before the durable marker.
 */
async function verifyStagingApplicationOwner(input: {
  supabaseUrl: URL;
  serviceRoleKey: string;
  userId: string;
}) {
  const headers = {
    apikey: input.serviceRoleKey,
    authorization: `Bearer ${input.serviceRoleKey}`,
  };
  const existing = await fetch(
    new URL(
      `/auth/v1/admin/users/${encodeURIComponent(input.userId)}`,
      input.supabaseUrl,
    ),
    { headers },
  );

  return existing.status === 200 ? "ready" : "unavailable";
}

/**
 * Temporary, preview-only AI-02 source creator. It atomically reserves a
 * staging-backed unique marker before its one bounded scan. This function is
 * never merged and must be removed after the single attempt.
 */
export default async function ai02StagingOneShotSource(
  request: Request,
  context: Context,
) {
  if (request.method !== "POST" || context.deploy.context !== "deploy-preview") {
    return unavailable();
  }

  const token = Netlify.env.get("AI02_STAGING_PROOF_TOKEN");
  if (!tokensMatch(request.headers.get(tokenHeader), token)) {
    return unavailable();
  }

  const supabaseUrl = safeUrl(Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL"));
  const previewUrl = safeDeployPreviewUrl(Netlify.env.get("DEPLOY_PRIME_URL"));
  const serviceRoleCandidates = [
    Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    Netlify.env.get("SUPABASE_SERVICE_ROLE"),
    Netlify.env.get("SUPABASE_SERVICE_ROLE_SECRET"),
  ].filter((value): value is string => Boolean(value && value.trim()));
  // Match the canonical server client's no-alias-ambiguity invariant before
  // the durable reservation. Choosing the first value here would let the
  // adapter proceed while the downstream route correctly refuses to run.
  const serviceRoleKey =
    serviceRoleCandidates.length === 1 ? serviceRoleCandidates[0] : null;
  const automationSecret = Netlify.env.get("AUTOMATION_SECRET");
  const applicationOwnerUserId = Netlify.env.get(
    "TURE_APPLICATION_OWNER_USER_ID",
  );
  // The canonical route checks both values before it honors skip_openai. Check
  // their non-secret presence before reserving so a missing preview binding
  // cannot consume the single staging attempt.
  const canonicalProviderEnvironmentReady = Boolean(
    Netlify.env.get("OPENAI_API_KEY"),
  ) && Boolean(Netlify.env.get("TWELVE_DATA_API_KEY"));

  if (
    !supabaseUrl ||
    !previewUrl ||
    !serviceRoleKey ||
    !automationSecret ||
    !applicationOwnerUserId ||
    !canonicalProviderEnvironmentReady ||
    !uuidV4Pattern.test(applicationOwnerUserId) ||
    sha256(supabaseUrl.toString().replace(/\/$/, "")) !==
      stagingSupabaseUrlSha256
  ) {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_source_creation",
        result: "runtime_prerequisite_unavailable",
        credential_values: "not_returned",
      },
      503,
    );
  }

  const now = new Date();
  if (!isSourceWindowAdmitted(now)) {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_source_creation",
        one_shot_consumption: "not_consumed",
        result: "source_window_not_admitted",
      },
      409,
    );
  }

  let applicationOwner = "unavailable";
  try {
    applicationOwner = await verifyStagingApplicationOwner({
      supabaseUrl,
      serviceRoleKey,
      userId: applicationOwnerUserId,
    });
  } catch {
    applicationOwner = "unavailable";
  }
  if (applicationOwner === "unavailable") {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_source_creation",
        one_shot_consumption: "not_consumed",
        result: "runtime_prerequisite_unavailable",
        credential_values: "not_returned",
      },
      503,
    );
  }

  const reservation = await reserveOneShot({
    supabaseUrl,
    serviceRoleKey,
    now,
  });
  if (reservation === "consumed") {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_source_creation",
        one_shot_consumption: "already_consumed",
        result: "not_executed",
      },
      409,
    );
  }
  if (reservation !== "reserved") {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_source_creation",
        one_shot_consumption: "not_consumed",
        result: "runtime_prerequisite_unavailable",
      },
      503,
    );
  }

  let upstreamBody: unknown = null;
  let upstreamStatus = 502;
  try {
    const upstream = await fetch(new URL("/api/automation/run-scan", previewUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-automation-secret": automationSecret,
      },
      body: JSON.stringify({
        force: true,
        ignore_existing_run: false,
        source: oneShotSource,
        scheduled_scan_attempt_fingerprint: oneShotAttemptFingerprint,
        scheduled_function_fired_at_utc: now.toISOString(),
        max_tickers: 1,
        max_recommendations: 1,
        skip_openai: true,
        ai02_staging_one_shot_provider_budget: true,
        timeout_ms: 25_000,
      }),
    });
    upstreamStatus = upstream.status;
    upstreamBody = JSON.parse(await upstream.text());
  } catch {
    // A consumed attempt can report only its fixed redaction result.
  }

  return scanReceipt(upstreamStatus, upstreamBody);
}
