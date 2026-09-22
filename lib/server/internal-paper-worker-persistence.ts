import "server-only";

import {
  INTERNAL_PAPER_WORKER_JOB_VERSION,
  type InternalPaperWorkerJobRequest,
} from "@/lib/internal-paper-worker";
import {
  runInternalPaperWorkerCycle,
  type InternalPaperWorkerClaim,
} from "@/lib/internal-paper-worker-runtime";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RpcClient = NonNullable<ReturnType<typeof getServerSupabaseClient>["client"]>;
const INTERNAL_PAPER_WORKER_CLAIM_VERSION =
  "internal_paper_worker_claim_v2" as const;
const INTERNAL_PAPER_WORKER_HEARTBEAT_VERSION =
  "internal_paper_worker_heartbeat_v1" as const;
const INTERNAL_PAPER_PILOT_POLICY_VERSION =
  "internal_paper_pilot_operating_policy_2026_09_22_v1" as const;
const INTERNAL_PAPER_WORKER_HOST_VERSION =
  "internal_paper_worker_host_v1" as const;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function integer(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function sameInstant(left: string, right: unknown) {
  return explicitInstant(right) && Date.parse(left) === Date.parse(right);
}

export async function enqueueInternalPaperWorkerJob(
  job: InternalPaperWorkerJobRequest,
  clientOverride?: RpcClient,
) {
  const client = clientOverride ?? getServerSupabaseClient().client;
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_enqueue_internal_paper_worker_job_v1",
    {
      p_owner_user_id: job.owner_user_id,
      p_account_id: job.account_id,
      p_work_kind: job.work_kind,
      p_payload: job.payload,
      p_contract_version: job.contract_version,
    },
  );
  const result = objectOrNull(data);
  if (
    error ||
    !result ||
    typeof result.job_id !== "string" ||
    !UUID_PATTERN.test(result.job_id) ||
    (result.disposition !== "created" && result.disposition !== "reused") ||
    result.work_kind !== job.work_kind
  ) {
    return { status: "failed" } as const;
  }
  return { status: "available", data: result } as const;
}

export async function claimInternalPaperWorkerJob(input: {
  account_id: string;
  worker_id: string;
  now: string;
  lease_seconds: number;
  client?: RpcClient;
}) {
  const client = input.client ?? getServerSupabaseClient().client;
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_claim_internal_paper_worker_job_v2",
    {
      p_account_id: input.account_id,
      p_worker_id: input.worker_id,
      p_now: input.now,
      p_lease_seconds: input.lease_seconds,
      p_claim_version: INTERNAL_PAPER_WORKER_CLAIM_VERSION,
    },
  );
  const result = objectOrNull(data);
  if (
    error ||
    !result ||
    result.claim_version !== INTERNAL_PAPER_WORKER_CLAIM_VERSION
  ) {
    return { status: "failed" } as const;
  }
  if (result.status === "no_work") return { status: "no_work" } as const;
  if (result.status === "blocked") return { status: "blocked" } as const;
  const attemptCount = integer(result.attempt_count);
  const maxAttempts = integer(result.max_attempts);
  if (
    result.status !== "claimed" ||
    result.contract_version !== INTERNAL_PAPER_WORKER_JOB_VERSION ||
    typeof result.job_id !== "string" || !UUID_PATTERN.test(result.job_id) ||
    typeof result.owner_user_id !== "string" || !UUID_PATTERN.test(result.owner_user_id) ||
    result.account_id !== input.account_id || !UUID_PATTERN.test(result.account_id) ||
    !["entry", "exit", "no_trade"].includes(String(result.work_kind)) ||
    typeof result.lease_token !== "string" || !UUID_PATTERN.test(result.lease_token) ||
    !explicitInstant(result.lease_expires_at) ||
    attemptCount === null || attemptCount <= 0 ||
    maxAttempts === null || maxAttempts < attemptCount
  ) {
    return { status: "failed" } as const;
  }
  return {
    status: "claimed",
    data: {
      job_id: result.job_id,
      owner_user_id: result.owner_user_id,
      account_id: result.account_id,
      work_kind: result.work_kind as InternalPaperWorkerClaim["work_kind"],
      lease_token: result.lease_token,
      lease_expires_at: result.lease_expires_at,
      attempt_count: attemptCount,
      max_attempts: maxAttempts,
    } satisfies InternalPaperWorkerClaim,
  } as const;
}

export async function recordInternalPaperWorkerHeartbeat(input: {
  account_id: string;
  slot_started_at: string;
  observed_at: string;
  client?: RpcClient;
}) {
  const client = input.client ?? getServerSupabaseClient().client;
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_record_internal_paper_worker_heartbeat_v1",
    {
      p_account_id: input.account_id,
      p_slot_started_at: input.slot_started_at,
      p_observed_at: input.observed_at,
      p_host_version: INTERNAL_PAPER_WORKER_HOST_VERSION,
      p_policy_version: INTERNAL_PAPER_PILOT_POLICY_VERSION,
    },
  );
  const result = objectOrNull(data);
  if (
    error ||
    !result ||
    result.heartbeat_version !== INTERNAL_PAPER_WORKER_HEARTBEAT_VERSION ||
    result.account_id !== input.account_id ||
    result.policy_version !== INTERNAL_PAPER_PILOT_POLICY_VERSION ||
    result.host_version !== INTERNAL_PAPER_WORKER_HOST_VERSION ||
    !sameInstant(input.slot_started_at, result.slot_started_at) ||
    !explicitInstant(result.observed_at) ||
    (result.disposition !== "created" && result.disposition !== "reused")
  ) {
    return { status: "failed" } as const;
  }
  return { status: "available", data: result } as const;
}

export async function executeInternalPaperWorkerJob(input: {
  claim: InternalPaperWorkerClaim;
  now: string;
  client?: RpcClient;
}) {
  const client = input.client ?? getServerSupabaseClient().client;
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_execute_internal_paper_worker_job_v1",
    {
      p_job_id: input.claim.job_id,
      p_lease_token: input.claim.lease_token,
      p_now: input.now,
      p_contract_version: INTERNAL_PAPER_WORKER_JOB_VERSION,
    },
  );
  const result = objectOrNull(data);
  if (
    error ||
    !result ||
    result.result_version !== "internal_paper_worker_result_v1" ||
    result.job_id !== input.claim.job_id ||
    result.work_kind !== input.claim.work_kind ||
    !["completed", "no_trade"].includes(String(result.terminal_status)) ||
    typeof result.result_digest !== "string" ||
    !/^[0-9a-f]{64}$/.test(result.result_digest)
  ) {
    return { status: "failed" } as const;
  }
  return { status: "completed", data: result } as const;
}

export async function releaseInternalPaperWorkerJob(input: {
  claim: InternalPaperWorkerClaim;
  now: string;
  retry_at: string;
  failure_code: "worker_execution_failed";
  client?: RpcClient;
}) {
  const client = input.client ?? getServerSupabaseClient().client;
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_release_internal_paper_worker_job_v1",
    {
      p_job_id: input.claim.job_id,
      p_lease_token: input.claim.lease_token,
      p_now: input.now,
      p_retry_at: input.retry_at,
      p_failure_code: input.failure_code,
      p_contract_version: INTERNAL_PAPER_WORKER_JOB_VERSION,
    },
  );
  const result = objectOrNull(data);
  if (
    error ||
    !result ||
    result.contract_version !== INTERNAL_PAPER_WORKER_JOB_VERSION ||
    result.job_id !== input.claim.job_id ||
    (result.status !== "queued" && result.status !== "blocked")
  ) {
    return { status: "failed" } as const;
  }
  return {
    status: result.status === "queued" ? "retry_scheduled" : "blocked",
  } as const;
}

export async function runInternalPaperWorkerOnce(input: {
  account_id: string;
  slot_started_at: string;
  worker_id: string;
  now: string;
  lease_seconds?: number;
  retry_delay_seconds?: number;
}) {
  const heartbeat = await recordInternalPaperWorkerHeartbeat({
    account_id: input.account_id,
    slot_started_at: input.slot_started_at,
    observed_at: input.now,
  });
  if (heartbeat.status !== "available") return { status: "blocked" } as const;
  return runInternalPaperWorkerCycle({
    ...input,
    dependencies: {
      claim: claimInternalPaperWorkerJob,
      execute: executeInternalPaperWorkerJob,
      release: releaseInternalPaperWorkerJob,
    },
  });
}
