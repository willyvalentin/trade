const canaryRoute = "/api/automation/continuous-intelligence/shadow-collector/canary";

function siteUrl() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || "https://trade.valentinlabs.com";
}

// Deliberately unscheduled. A later action must add explicit timing only after preflight review.
export default async function handler() {
  const automationSecret = process.env.AUTOMATION_SECRET;
  if (!automationSecret) return new Response("Canary automation secret unavailable", { status: 500 });
  try {
    const response = await fetch(`${siteUrl()}${canaryRoute}`, {
      method: "POST",
      headers: { "x-automation-secret": automationSecret, "content-type": "application/json" },
      body: "",
    });
    return new Response(await response.text(), { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "text/plain" } });
  } catch {
    return new Response("Scheduled shadow collector canary failed safely", { status: 500 });
  }
}
