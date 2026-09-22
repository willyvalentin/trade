export type InternalPaperWorkerClaim = Readonly<{
  job_id: string;
  owner_user_id: string;
  account_id: string;
  work_kind: "entry" | "exit" | "no_trade";
  lease_token: string;
  lease_expires_at: string;
  attempt_count: number;
  max_attempts: number;
}>;

export type InternalPaperWorkerDependencies = Readonly<{
  claim: (input: {
    worker_id: string;
    now: string;
    lease_seconds: number;
  }) => Promise<
    | Readonly<{ status: "claimed"; data: InternalPaperWorkerClaim }>
    | Readonly<{ status: "no_work" | "unavailable" | "failed" }>
  >;
  execute: (input: {
    claim: InternalPaperWorkerClaim;
    now: string;
  }) => Promise<
    | Readonly<{ status: "completed"; data: Record<string, unknown> }>
    | Readonly<{ status: "unavailable" | "failed" }>
  >;
  release: (input: {
    claim: InternalPaperWorkerClaim;
    now: string;
    retry_at: string;
    failure_code: "worker_execution_failed";
  }) => Promise<
    | Readonly<{ status: "retry_scheduled" | "blocked" }>
    | Readonly<{ status: "unavailable" | "failed" }>
  >;
}>;

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}
/** Runs at most one durable, provider-free paper job. */
export async function runInternalPaperWorkerCycle(input: {
  worker_id: string;
  now: string;
  lease_seconds?: number;
  retry_delay_seconds?: number;
  dependencies: InternalPaperWorkerDependencies;
}) {
  const leaseSeconds = input.lease_seconds ?? 60;
  const retryDelaySeconds = input.retry_delay_seconds ?? 30;
  if (
    !input.worker_id.trim() ||
    input.worker_id.length > 120 ||
    !explicitInstant(input.now) ||
    !Number.isSafeInteger(leaseSeconds) ||
    leaseSeconds < 15 ||
    leaseSeconds > 300 ||
    !Number.isSafeInteger(retryDelaySeconds) ||
    retryDelaySeconds < 1 ||
    retryDelaySeconds > 3600
  ) {
    return { status: "failed" as const };
  }

  const claim = await input.dependencies.claim({
    worker_id: input.worker_id,
    now: input.now,
    lease_seconds: leaseSeconds,
  });
  if (claim.status !== "claimed") return claim;

  const execution = await input.dependencies.execute({
    claim: claim.data,
    now: input.now,
  });
  if (execution.status === "completed") return execution;

  const retryAt = new Date(
    Date.parse(input.now) + retryDelaySeconds * 1000,
  ).toISOString();
  const release = await input.dependencies.release({
    claim: claim.data,
    now: input.now,
    retry_at: retryAt,
    failure_code: "worker_execution_failed",
  });
  return release.status === "retry_scheduled" || release.status === "blocked"
    ? release
    : { status: "failed" as const };
}
