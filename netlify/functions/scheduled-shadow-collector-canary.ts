import {
  buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
  continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath,
} from "../../lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit } from "../../lib/continuous-intelligence-shadow-canary-runtime-deployment-identity";
import { buildUsEquityMarketCalendarEvaluation } from "../../lib/us-equity-market-calendar";

export const continuousIntelligenceShadowCanaryFunctionBuildMarker =
  "continuous_intelligence_shadow_canary_function_foundation_v1" as const;

function siteUrl() {
  return process.env.URL || process.env.DEPLOY_PRIME_URL || "https://trade.valentinlabs.com";
}

// Deliberately unscheduled. This is a dry admission foundation, never provider execution.
export default async function handler() {
  const automationSecret = process.env.AUTOMATION_SECRET;
  if (!automationSecret) return new Response("Canary automation secret unavailable", { status: 500 });
  const now = new Date();
  const calendar = buildUsEquityMarketCalendarEvaluation(now);
  const range = calendar.latest_completed_range;
  const scheduledRequest =
    range.status === "available" && range.start && range.end && calendar.market_date
      ? buildContinuousIntelligenceShadowCanaryScheduledExecutionRequest({
          deployment_commit: resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit(process.env),
          market_date: calendar.market_date,
          market_window: { start: range.start, end: range.end },
          requested_at: now.toISOString(),
        })
      : null;
  if (!scheduledRequest) return new Response("Scheduled shadow collector admission unavailable", { status: 503 });
  try {
    const response = await fetch(`${siteUrl()}${continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath}`, {
      method: "POST",
      headers: { "x-automation-secret": automationSecret, "content-type": "application/json" },
      body: JSON.stringify(scheduledRequest),
    });
    return new Response(await response.text(), { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "text/plain" } });
  } catch {
    return new Response("Scheduled shadow collector canary failed safely", { status: 500 });
  }
}
