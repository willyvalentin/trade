import type { Config } from "@netlify/functions";

export const config: Config = {
  // Netlify cron is UTC. This covers 13:00-19:45 UTC weekdays,
  // including all US daylight-saving regular-session scan windows.
  schedule: "*/15 13-19 * * 1-5",
};

export default async function handler() {
  const firedAtUtc = new Date().toISOString();
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
      }),
    });

    const body = await response.text();

    console.log("[scheduled-scan] Response status:", response.status);
    console.log("[scheduled-scan] Response body:", body);

    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("[scheduled-scan] Failed:", error);

    return new Response("Scheduled scan failed", {
      status: 500,
    });
  }
}
