import type { Config } from "@netlify/functions";

export const config: Config = {
  schedule: "*/15 * * * 1-5",
};

export default async function handler() {
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

  console.log("[scheduled-scan] Calling:", endpoint);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-automation-secret": automationSecret,
      },
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