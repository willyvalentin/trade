import { createRequire } from "node:module";

import type { Config, Context } from "@netlify/functions";

export const config: Config = {
  // UTC coverage for regular US-equity hours across DST. The host remains
  // inert unless both explicit runtime gates admit it.
  schedule: "*/15 13-21 * * 1-5",
};

export const INTERNAL_PAPER_WORKER_HOST_VERSION =
  "internal_paper_worker_host_v1" as const;
export const INTERNAL_PAPER_WORKER_ENABLED_FLAG =
  "TURE_INTERNAL_PAPER_WORKER_ENABLED" as const;
export const SCHEDULED_FUNCTIONS_DISABLE_FLAG =
  "TURE_DISABLE_SCHEDULED_FUNCTIONS" as const;

type WorkerRuntimeModule = {
  runInternalPaperWorkerOnce?: (input: {
    worker_id: string;
    now: string;
    lease_seconds: number;
    retry_delay_seconds: number;
  }) => Promise<{ status: string }>;
};

type WorkerEnvironment = { get(name: string): string | undefined };
const runtimeRequire = createRequire(__filename);
const SLOT_MINUTES = 15;
const DELIVERY_GRACE_MILLISECONDS = 3 * 60 * 1000;

export function internalPaperWorkerHostEnabled(environment: WorkerEnvironment) {
  return (
    environment.get(SCHEDULED_FUNCTIONS_DISABLE_FLAG) === "false" &&
    environment.get(INTERNAL_PAPER_WORKER_ENABLED_FLAG) === "true"
  );
}

export function internalPaperWorkerScheduledEvent(input: {
  next_run: unknown;
  delivered_at: Date;
}) {
  const nextRun =
    typeof input.next_run === "string" ? new Date(input.next_run) : null;
  const nextTimestamp = nextRun?.getTime() ?? Number.NaN;
  const deliveredTimestamp = input.delivered_at.getTime();
  const slotMilliseconds = SLOT_MINUTES * 60 * 1000;
  if (
    !Number.isFinite(nextTimestamp) ||
    nextTimestamp % slotMilliseconds !== 0 ||
    !Number.isFinite(deliveredTimestamp)
  ) {
    return null;
  }
  const slotTimestamp = nextTimestamp - slotMilliseconds;
  const delay = deliveredTimestamp - slotTimestamp;
  return delay >= 0 && delay <= DELIVERY_GRACE_MILLISECONDS
    ? new Date(slotTimestamp).toISOString()
    : null;
}

export default async function handler(request: Request, context: Context) {
  // This gate deliberately precedes secrets, database modules and request-body
  // parsing. A deployed but unactivated host is a zero-effect 204.
  if (!internalPaperWorkerHostEnabled(Netlify.env)) {
    console.log("[scheduled-internal-paper-worker] Execution disabled.");
    return new Response(null, { status: 204 });
  }

  const deliveredAt = new Date();
  const body = await request.clone().json().catch(() => null);
  const slot = internalPaperWorkerScheduledEvent({
    next_run:
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as { next_run?: unknown }).next_run
        : null,
    delivered_at: deliveredAt,
  });
  if (!slot) {
    console.error("[scheduled-internal-paper-worker] Scheduled event unavailable.");
    return new Response(null, { status: 204 });
  }

  try {
    const runtime = runtimeRequire(
      "../.generated/scheduled-internal-paper-worker-runtime.cjs",
    ) as WorkerRuntimeModule;
    if (typeof runtime.runInternalPaperWorkerOnce !== "function") {
      throw new Error("Internal-paper worker runtime export unavailable.");
    }
    const result = await runtime.runInternalPaperWorkerOnce({
      worker_id: `netlify:${context.requestId}`.slice(0, 120),
      now: deliveredAt.toISOString(),
      lease_seconds: 60,
      retry_delay_seconds: 30,
    });
    const status = [
      "no_work",
      "completed",
      "retry_scheduled",
      "blocked",
    ].includes(result.status)
      ? result.status
      : "failed";
    console.log("[scheduled-internal-paper-worker] Cycle completed.", {
      host_version: INTERNAL_PAPER_WORKER_HOST_VERSION,
      slot,
      status,
    });
    return Response.json(
      { host_version: INTERNAL_PAPER_WORKER_HOST_VERSION, status },
      { status: status === "failed" ? 503 : 200 },
    );
  } catch (error) {
    console.error("[scheduled-internal-paper-worker] Cycle failed.", {
      host_version: INTERNAL_PAPER_WORKER_HOST_VERSION,
      slot,
      error: error instanceof Error ? error.name : "unknown",
    });
    return Response.json(
      { host_version: INTERNAL_PAPER_WORKER_HOST_VERSION, status: "failed" },
      { status: 503 },
    );
  }
}
