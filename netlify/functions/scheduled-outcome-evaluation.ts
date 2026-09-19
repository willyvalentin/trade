import { createRequire } from "node:module";

import type { Config } from "@netlify/functions";
import {
  SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES,
  buildScheduledOutcomeEvaluationAttemptFingerprintForSlot,
  scheduledOutcomeEvaluationSlotStartedAt,
} from "../../lib/scheduled-outcome-evaluation-receipt";

export const config: Config = {
  // Netlify cron is UTC. This covers the intraday outcome windows after the
  // scanner's regular-session run, including US daylight-saving time.
  schedule: "*/15 14-21 * * 1-5",
};

type ScheduledOutcomeRouteModule = {
  POST?: (request: Request) => Promise<Response>;
};

const outcomeEvaluationRoute = "/api/recommendations/evaluate-outcomes";
const officialIntradayHorizons = ["15m", "30m", "60m"] as const;
const knownOutcomeStatuses = new Set(["completed", "partial", "blocked", "failed"]);
const runtimeRequire = createRequire(__filename);
const scheduledFunctionsDisableFlag = "TURE_DISABLE_SCHEDULED_FUNCTIONS";

function scheduledExecutionIsDisabled() {
  return Netlify.env.get(scheduledFunctionsDisableFlag) === "true";
}

function finiteCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : null;
}

function outcomeLogSummary(responseStatus: number, body: string) {
  try {
    const parsed: unknown = JSON.parse(body);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        response_status: responseStatus,
        response_body_format: "unstructured",
      };
    }

    const response = parsed as Record<string, unknown>;
    const routeStatus =
      typeof response.status === "string" && knownOutcomeStatuses.has(response.status)
        ? response.status
        : "unknown";

    return {
      response_status: responseStatus,
      response_body_format: "structured",
      route_status: routeStatus,
      eligible_snapshot_count: finiteCount(response.eligible_snapshot_count),
      evaluated_snapshot_count: finiteCount(response.evaluated_snapshot_count),
      incomplete_snapshot_count: finiteCount(response.incomplete_snapshot_count),
      missing_candle_count: finiteCount(response.missing_candle_count),
      persisted_outcome_count: finiteCount(response.persisted_outcome_count),
    };
  } catch {
    return {
      response_status: responseStatus,
      response_body_format: "unstructured",
    };
  }
}

async function invokeScheduledOutcomeRoute({
  automationSecret,
  firedAtUtc,
  scheduledSlotAtUtc,
  attemptFingerprint,
}: {
  automationSecret: string;
  firedAtUtc: string;
  scheduledSlotAtUtc: string;
  attemptFingerprint: string;
}) {
  const routeModule = runtimeRequire(
    "../.generated/scheduled-outcome-evaluation-runtime.cjs",
  ) as ScheduledOutcomeRouteModule;

  if (typeof routeModule.POST !== "function") {
    throw new Error("Scheduled outcome runtime does not export POST.");
  }

  return routeModule.POST(
    new Request(`http://internal${outcomeEvaluationRoute}`, {
      method: "POST",
      headers: {
        "x-automation-secret": automationSecret,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        mode: "official_live_today",
        horizons: officialIntradayHorizons,
        max_batches: 5,
        max_snapshots: 10,
        scheduled_function_fired_at_utc: firedAtUtc,
        scheduled_slot_at_utc: scheduledSlotAtUtc,
        scheduled_outcome_evaluation_attempt_fingerprint: attemptFingerprint,
      }),
    }),
  );
}

async function scheduledOutcomeEvaluationSlotFromEvent({
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
  const parsedNextRun =
    typeof nextRun === "string" ? new Date(nextRun) : new Date(Number.NaN);

  if (Number.isFinite(parsedNextRun.getTime())) {
    return new Date(
      parsedNextRun.getTime() -
        SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES * 60 * 1000,
    );
  }

  return scheduledOutcomeEvaluationSlotStartedAt(deliveryTime);
}

export default async function handler(request: Request) {
  // Keep a published staging candidate completely inert when explicitly
  // disabled: no credentials, database writes, or outcome-provider work.
  if (scheduledExecutionIsDisabled()) {
    console.log("[scheduled-outcome-evaluation] Execution disabled by environment.");
    return new Response(null, { status: 204 });
  }

  const firedAt = new Date();
  const firedAtUtc = firedAt.toISOString();
  const scheduledSlot = await scheduledOutcomeEvaluationSlotFromEvent({
    request,
    deliveryTime: firedAt,
  });
  const scheduledSlotAtUtc = scheduledSlot.toISOString();
  const automationSecret = process.env.AUTOMATION_SECRET;
  const attemptFingerprint =
    buildScheduledOutcomeEvaluationAttemptFingerprintForSlot(scheduledSlot);

  if (!automationSecret) {
    console.error("[scheduled-outcome-evaluation] Missing AUTOMATION_SECRET");
    return new Response("Missing AUTOMATION_SECRET", { status: 500 });
  }

  console.log("[scheduled-outcome-evaluation] Executing bundled internal route", {
    scheduled_function_fired_at_utc: firedAtUtc,
    scheduled_slot_at_utc: scheduledSlotAtUtc,
    scheduled_outcome_evaluation_attempt_fingerprint: attemptFingerprint,
    horizons: officialIntradayHorizons,
  });

  try {
    const response = await invokeScheduledOutcomeRoute({
      automationSecret,
      firedAtUtc,
      scheduledSlotAtUtc,
      attemptFingerprint,
    });
    const body = await response.text();

    console.log(
      "[scheduled-outcome-evaluation] Response summary:",
      outcomeLogSummary(response.status, body),
    );

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
