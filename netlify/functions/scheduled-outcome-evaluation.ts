import { createRequire } from "node:module";

import type { Config, Context } from "@netlify/functions";
import {
  SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES,
  buildScheduledOutcomeEvaluationAttemptFingerprintForSlot,
  scheduledOutcomeEvaluationSlotStartedAt,
} from "../../lib/scheduled-outcome-evaluation-receipt";
import {
  parseScheduledScanBuildDeploymentIdentity,
  scheduledScanPreflightEventEvidence,
  scheduledScanTimeBoundAdmission,
  type ScheduledScanBuildDeploymentIdentity,
} from "./scheduled-scan";

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
const outcomeOneShotEnabledFlag = "TURE_OUTCOME_EVALUATION_ONE_SHOT_ENABLED";
const outcomeOneShotDateFlag = "TURE_OUTCOME_EVALUATION_ONE_SHOT_DATE";
const outcomeOneShotSlotFlag = "TURE_OUTCOME_EVALUATION_ONE_SHOT_SLOT_UTC";
const normalScanOneShotEnabledFlag = "TURE_NORMAL_SCAN_ONE_SHOT_ENABLED";
const catalogProbeEnabledFlag = "TURE_BASIC_FREE_CATALOG_CAPABILITY_PROBE_ENABLED";

type OutcomeOneShotControl = Readonly<{
  enabled: boolean;
  conflicting_scan_override_enabled: boolean;
  target_date: string | null;
  target_slot_utc: string | null;
}>;

export function outcomeOneShotControlFromEnvironment(environment: {
  get(name: string): string | undefined;
}): OutcomeOneShotControl {
  const rawDate = environment.get(outcomeOneShotDateFlag);
  const targetDate = typeof rawDate === "string" ? rawDate.trim() : "";
  const [year, month, day] = targetDate.split("-").map(Number);
  const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(targetDate) &&
    new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === targetDate;
  const rawSlot = environment.get(outcomeOneShotSlotFlag);
  const targetSlot = typeof rawSlot === "string" ? rawSlot.trim() : "";
  const slotTimestamp = new Date(targetSlot).getTime();
  const slotIsValid = targetSlot.length > 0 &&
    Number.isFinite(slotTimestamp) &&
    new Date(slotTimestamp).toISOString() === targetSlot &&
    slotTimestamp % (SCHEDULED_OUTCOME_EVALUATION_SLOT_MINUTES * 60_000) === 0;

  return Object.freeze({
    enabled: environment.get(outcomeOneShotEnabledFlag) === "true",
    conflicting_scan_override_enabled:
      environment.get(normalScanOneShotEnabledFlag) === "true" ||
      environment.get(catalogProbeEnabledFlag) === "true",
    target_date: dateIsValid ? targetDate : null,
    target_slot_utc: slotIsValid ? targetSlot : null,
  });
}

function loadPackagedDeploymentIdentity() {
  try {
    return parseScheduledScanBuildDeploymentIdentity(
      runtimeRequire("../.generated/scheduled-scan-deployment-identity.json") as unknown,
    );
  } catch {
    return null;
  }
}

export function outcomeOneShotAdmission({
  control,
  scheduledFunctionsDisabled,
  nextRun,
  deliveryTime,
  context,
  buildIdentity,
  runtimeSiteId,
}: {
  control: OutcomeOneShotControl;
  scheduledFunctionsDisabled: boolean;
  nextRun: unknown;
  deliveryTime: Date;
  context: Context;
  buildIdentity: ScheduledScanBuildDeploymentIdentity | null;
  runtimeSiteId: unknown;
}) {
  if (
    !control.enabled ||
    !scheduledFunctionsDisabled ||
    control.conflicting_scan_override_enabled
  ) {
    return { admitted: false, status: "runtime_gate_conflict" } as const;
  }

  // A packaged production identity and matching runtime site are mandatory
  // even when Netlify reports a published production context. This prevents
  // a branch deploy or stale build from arming the bounded provider job.
  if (!buildIdentity || runtimeSiteId !== buildIdentity.site_id) {
    return { admitted: false, status: "build_identity_unavailable" } as const;
  }

  return scheduledScanTimeBoundAdmission({
    contextIdentity: {
      deploy_id: context.deploy?.id ?? null,
      deploy_context: context.deploy?.context ?? null,
      deploy_published: context.deploy?.published ?? null,
    },
    buildIdentity,
    runtimeSiteId,
    eventEvidence: scheduledScanPreflightEventEvidence({
      nextRun,
      deliveryTime,
    }),
    configuredProbeSlotUtc: control.target_slot_utc,
    configuredProbeDate: control.target_date,
  });
}

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

function scheduledOutcomeEvaluationSlotFromEvent({
  nextRun,
  deliveryTime,
}: {
  nextRun: unknown;
  deliveryTime: Date;
}) {
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

export default async function handler(request: Request, context: Context) {
  const oneShotControl = outcomeOneShotControlFromEnvironment(Netlify.env);
  const oneShotRequested = oneShotControl.enabled;
  const scheduledFunctionsDisabled = scheduledExecutionIsDisabled();

  if (oneShotRequested && !scheduledFunctionsDisabled) {
    console.error("[scheduled-outcome-evaluation] One-shot conflicts with global scheduler state.");
    return new Response("Outcome one-shot gates unavailable", { status: 503 });
  }

  // Keep a published staging candidate completely inert when explicitly
  // disabled, except one exact deploy/date/slot-bound outcome delivery.
  if (scheduledFunctionsDisabled && !oneShotRequested) {
    console.log("[scheduled-outcome-evaluation] Execution disabled by environment.");
    return new Response(null, { status: 204 });
  }

  const firedAt = new Date();
  const firedAtUtc = firedAt.toISOString();
  const payload = await request.clone().json().catch(() => null);
  const nextRun = payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as { next_run?: unknown }).next_run
    : null;
  const oneShotAdmission = oneShotRequested
    ? outcomeOneShotAdmission({
        control: oneShotControl,
        scheduledFunctionsDisabled,
        nextRun,
        deliveryTime: firedAt,
        context,
        buildIdentity: loadPackagedDeploymentIdentity(),
        runtimeSiteId: process.env.SITE_ID,
      })
    : null;

  if (oneShotRequested && !oneShotAdmission?.admitted) {
    console.error("[scheduled-outcome-evaluation] One-shot admission failed.", {
      status: oneShotAdmission?.status ?? "admission_unavailable",
    });
    if (
      oneShotAdmission?.status === "probe_slot_unavailable" ||
      oneShotAdmission?.status === "probe_slot_mismatch" ||
      oneShotAdmission?.status === "probe_date_unavailable" ||
      oneShotAdmission?.status === "probe_date_mismatch"
    ) {
      return new Response(null, { status: 204 });
    }
    return new Response("Outcome one-shot admission unavailable", { status: 503 });
  }

  const scheduledSlot = scheduledOutcomeEvaluationSlotFromEvent({
    nextRun,
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
    one_shot_admission: oneShotAdmission?.status ?? null,
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
