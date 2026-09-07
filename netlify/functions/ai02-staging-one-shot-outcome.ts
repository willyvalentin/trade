import type { Config, Context } from "@netlify/functions";
import { createHash, timingSafeEqual } from "node:crypto";

const tokenHeader = "x-ai02-staging-proof-token";
const stagingSupabaseUrlSha256 =
  "e47565f4baf37880dd3b5ebf272980c521411e2b7b1533a955c5befb1bd721d1";
const sourceAttemptFingerprint = "ai02_staging_one_shot_source_v1";
const outcomeAttemptFingerprint = "ai02_staging_one_shot_outcome_v1";
const outcomeSource = "ai02_staging_one_shot_outcome";
const sourceMaturityMilliseconds = 60 * 60 * 1000;
const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const officialHorizons = ["15m", "30m", "60m"] as const;

export const config: Config = {
  path: "/.netlify/functions/ai02-staging-one-shot-outcome",
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

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function boundedCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function hasExactOfficialHorizons(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === officialHorizons.length &&
    value.every((horizon, index) => horizon === officialHorizons[index])
  );
}

type SourceReadiness =
  | { status: "ready"; batchFingerprint: string }
  | { status: "not_mature" | "not_ready" | "unavailable" };

/**
 * Reads only the source attempt's internal readiness fields. Neither its
 * batch fingerprint nor timing metadata is returned to the caller. This
 * prevents an evaluator retry from ever selecting another batch or consuming
 * its own one-shot marker before the source can support a full 60-minute
 * outcome bundle.
 */
async function readSourceReadiness(input: {
  supabaseUrl: URL;
  serviceRoleKey: string;
  now: Date;
}): Promise<SourceReadiness> {
  const endpoint = new URL("/rest/v1/scheduled_scan_attempts", input.supabaseUrl);
  endpoint.searchParams.set(
    "attempt_fingerprint",
    `eq.${sourceAttemptFingerprint}`,
  );
  endpoint.searchParams.set(
    "select",
    "batch_fingerprint,scheduled_function_fired_at,recommendations_created",
  );

  try {
    const result = await fetch(endpoint, {
      headers: {
        apikey: input.serviceRoleKey,
        authorization: `Bearer ${input.serviceRoleKey}`,
      },
    });
    if (result.status !== 200) return { status: "unavailable" };

    const rows = await result.json();
    if (!Array.isArray(rows) || rows.length !== 1) return { status: "not_ready" };
    const row = objectOrNull(rows[0]);
    const batchFingerprint =
      typeof row?.batch_fingerprint === "string" && row.batch_fingerprint.length > 0
        ? row.batch_fingerprint
        : null;
    const sourceFiredAt =
      typeof row?.scheduled_function_fired_at === "string"
        ? Date.parse(row.scheduled_function_fired_at)
        : Number.NaN;
    const recommendationsCreated = boundedCount(row?.recommendations_created);

    if (!batchFingerprint || recommendationsCreated !== 1 || !Number.isFinite(sourceFiredAt)) {
      return { status: "not_ready" };
    }
    if (input.now.getTime() - sourceFiredAt < sourceMaturityMilliseconds) {
      return { status: "not_mature" };
    }

    return { status: "ready", batchFingerprint };
  } catch {
    return { status: "unavailable" };
  }
}

async function reserveOutcome(input: {
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
        attempt_fingerprint: outcomeAttemptFingerprint,
        source: outcomeSource,
        mode: "diagnostic",
        outcome: "scheduled_function_fired",
        allowed: true,
        scheduled_function_fired_at: input.now.toISOString(),
        utc_timestamp: input.now.toISOString(),
        payload_json: { operation: "ai02_one_shot_outcome_evaluation" },
      }),
    },
  );

  if (result.status === 201 || result.status === 200) return "reserved";
  if (result.status === 409) return "consumed";
  return "unavailable";
}

function outcomeReceipt(responseStatus: number, body: unknown) {
  const payload = objectOrNull(body);
  const runStatus = payload?.status;
  const evaluatedSnapshots = boundedCount(payload?.evaluated_snapshot_count);
  const persistedOutcomes = boundedCount(payload?.persisted_outcome_count);
  const candleRequestsExecuted = boundedCount(payload?.candle_requests_executed);
  const uniqueCandleRequests = boundedCount(payload?.unique_candle_requests_count);

  if (
    !payload ||
    (runStatus !== "completed" && runStatus !== "blocked") ||
    !hasExactOfficialHorizons(payload.horizons) ||
    evaluatedSnapshots === null ||
    persistedOutcomes === null ||
    candleRequestsExecuted === null ||
    uniqueCandleRequests === null ||
    evaluatedSnapshots > 1 ||
    persistedOutcomes > officialHorizons.length ||
    candleRequestsExecuted > 1 ||
    uniqueCandleRequests > 1
  ) {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_outcome_evaluation",
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
    operation: "ai02_one_shot_outcome_evaluation",
    one_shot_consumption: "consumed",
    result:
      runStatus === "completed" &&
      evaluatedSnapshots === 1 &&
      persistedOutcomes === officialHorizons.length &&
      candleRequestsExecuted === 1 &&
      uniqueCandleRequests === 1
        ? "one_complete_server_owned_outcome_bundle_recorded"
        : "one_server_owned_outcome_bundle_not_completed",
    evaluation_status: runStatus,
    evaluated_snapshots_count: evaluatedSnapshots,
    persisted_outcomes_count: persistedOutcomes,
    provider_candle_requests_executed: candleRequestsExecuted,
    unique_candle_requests_count: uniqueCandleRequests,
    horizons: officialHorizons,
    source_rows: "not_returned",
    credential_values: "not_returned",
    provider_payload: "not_returned",
  });
}

/**
 * Temporary, preview-only AI-02 outcome evaluator. It accepts only the one
 * bounded source attempt created by the companion adapter, waits for all
 * fixed horizons to mature, and then invokes the existing canonical route
 * with a one-batch, one-snapshot, one-candle budget.
 */
export default async function ai02StagingOneShotOutcome(
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
  const previewUrl = safeUrl(Netlify.env.get("DEPLOY_PRIME_URL"));
  const serviceRoleCandidates = [
    Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    Netlify.env.get("SUPABASE_SERVICE_ROLE"),
    Netlify.env.get("SUPABASE_SERVICE_ROLE_SECRET"),
  ].filter((value): value is string => Boolean(value && value.trim()));
  // Keep the direct adapter and canonical route aligned: both reject an
  // ambiguous alias configuration before a one-shot marker can be reserved.
  const serviceRoleKey =
    serviceRoleCandidates.length === 1 ? serviceRoleCandidates[0] : null;
  const automationSecret = Netlify.env.get("AUTOMATION_SECRET");
  const applicationOwnerUserId = Netlify.env.get(
    "TURE_APPLICATION_OWNER_USER_ID",
  );
  const outcomeProviderConfigured = Boolean(Netlify.env.get("TWELVE_DATA_API_KEY"));

  if (
    !supabaseUrl ||
    !previewUrl ||
    !serviceRoleKey ||
    !automationSecret ||
    !applicationOwnerUserId ||
    !uuidV4Pattern.test(applicationOwnerUserId) ||
    !outcomeProviderConfigured ||
    sha256(supabaseUrl.toString().replace(/\/$/, "")) !==
      stagingSupabaseUrlSha256
  ) {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_outcome_evaluation",
        result: "runtime_prerequisite_unavailable",
        credential_values: "not_returned",
      },
      503,
    );
  }

  const now = new Date();
  const sourceReadiness = await readSourceReadiness({
    supabaseUrl,
    serviceRoleKey,
    now,
  });
  if (sourceReadiness.status !== "ready") {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_outcome_evaluation",
        one_shot_consumption: "not_consumed",
        result:
          sourceReadiness.status === "not_mature"
            ? "source_outcomes_not_mature"
            : "source_bundle_not_ready",
      },
      sourceReadiness.status === "unavailable" ? 503 : 409,
    );
  }

  const reservation = await reserveOutcome({
    supabaseUrl,
    serviceRoleKey,
    now,
  });
  if (reservation === "consumed") {
    return response(
      {
        environment: "staging",
        operation: "ai02_one_shot_outcome_evaluation",
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
        operation: "ai02_one_shot_outcome_evaluation",
        one_shot_consumption: "not_consumed",
        result: "runtime_prerequisite_unavailable",
      },
      503,
    );
  }

  let upstreamBody: unknown = null;
  let upstreamStatus = 502;
  try {
    const upstream = await fetch(
      new URL("/api/recommendations/evaluate-outcomes", previewUrl),
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-automation-secret": automationSecret,
        },
        body: JSON.stringify({
          mode: "official_live_today",
          batch_fingerprint: sourceReadiness.batchFingerprint,
          horizons: officialHorizons,
          max_batches: 1,
          max_snapshots: 1,
          max_candle_requests: 1,
        }),
      },
    );
    upstreamStatus = upstream.status;
    upstreamBody = JSON.parse(await upstream.text());
  } catch {
    // The consumed attempt can report only its fixed redaction result.
  }

  return outcomeReceipt(upstreamStatus, upstreamBody);
}
