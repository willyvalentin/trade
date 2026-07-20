import type { Config } from "@netlify/functions";

export const config: Config = {
  // Netlify cron is UTC. This runs every 15 minutes on weekdays from
  // 10:00-17:45 New York during US daylight-saving time.
  schedule: "*/15 14-21 * * 1-5",
};

const outcomeEvaluationRoute = "/api/recommendations/evaluate-outcomes";
const officialIntradayHorizons = ["15m", "30m", "60m"] as const;

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function siteUrl() {
  return (
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "https://trade.valentinlabs.com"
  );
}

export default async function handler() {
  const firedAtUtc = new Date().toISOString();
  const automationSecret = process.env.AUTOMATION_SECRET;
  const attemptFingerprint = `scheduled_outcome_evaluation_${stableHash(
    `netlify_scheduled_function|${firedAtUtc}`,
  )}`;

  if (!automationSecret) {
    console.error("[scheduled-outcome-evaluation] Missing AUTOMATION_SECRET");
    return new Response("Missing AUTOMATION_SECRET", { status: 500 });
  }

  const endpoint = `${siteUrl()}${outcomeEvaluationRoute}`;

  console.log("[scheduled-outcome-evaluation] Calling:", endpoint, {
    scheduled_function_fired_at_utc: firedAtUtc,
    scheduled_outcome_evaluation_attempt_fingerprint: attemptFingerprint,
    horizons: officialIntradayHorizons,
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-automation-secret": automationSecret,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        mode: "official_live_today",
        horizons: officialIntradayHorizons,
        max_snapshots: 10,
        scheduled_function_fired_at_utc: firedAtUtc,
        scheduled_outcome_evaluation_attempt_fingerprint: attemptFingerprint,
      }),
    });
    const body = await response.text();

    console.log("[scheduled-outcome-evaluation] Response status:", response.status);
    console.log("[scheduled-outcome-evaluation] Response body:", body);

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("[scheduled-outcome-evaluation] Failed:", error);

    return new Response("Scheduled outcome evaluation failed", {
      status: 500,
    });
  }
}
