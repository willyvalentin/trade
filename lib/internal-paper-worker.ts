import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import type { InternalPaperExitCommand } from "@/lib/internal-paper-exit";

export const INTERNAL_PAPER_WORKER_JOB_VERSION =
  "internal_paper_worker_job_v1" as const;
export const INTERNAL_PAPER_WORKER_RESULT_VERSION =
  "internal_paper_worker_result_v1" as const;
export const INTERNAL_PAPER_WORKER_READBACK_VERSION =
  "internal_paper_worker_readback_v1" as const;

export type InternalPaperNoTradeEvidence = Readonly<{
  record_version: "candidate_decision_record_v3";
  disposition: "no_trade";
  owner_user_id: string;
  account_id: string;
  scan_run_id: string;
  scan_run_fingerprint: string;
  no_trade_reason: string;
}>;

export type InternalPaperWorkerJobRequest =
  | Readonly<{
      contract_version: typeof INTERNAL_PAPER_WORKER_JOB_VERSION;
      work_kind: "entry";
      owner_user_id: string;
      account_id: string;
      payload: InternalPaperEntryCommand;
    }>
  | Readonly<{
      contract_version: typeof INTERNAL_PAPER_WORKER_JOB_VERSION;
      work_kind: "exit";
      owner_user_id: string;
      account_id: string;
      payload: InternalPaperExitCommand;
    }>
  | Readonly<{
      contract_version: typeof INTERNAL_PAPER_WORKER_JOB_VERSION;
      work_kind: "no_trade";
      owner_user_id: string;
      account_id: string;
      payload: InternalPaperNoTradeEvidence;
    }>;

export type InternalPaperWorkerBuildResult =
  | Readonly<{ status: "ready"; job: InternalPaperWorkerJobRequest }>
  | Readonly<{
      status: "blocked";
      reason_codes: ReadonlyArray<
        | "worker_identity_invalid"
        | "worker_payload_identity_mismatch"
        | "no_trade_evidence_invalid"
      >;
      job: null;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type WorkerBlockReason = Extract<
  InternalPaperWorkerBuildResult,
  { status: "blocked" }
>["reason_codes"][number];

function blockedResult(reasons: WorkerBlockReason[]): InternalPaperWorkerBuildResult {
  return {
    status: "blocked",
    reason_codes: Array.from(new Set(reasons)).sort(),
    job: null,
  };
}

/**
 * Wraps an already fail-closed C1/C2 command, or one retained no-trade
 * decision identity, for the durable worker boundary. It grants no scheduling,
 * provider, publication or broker authority.
 */
export function buildInternalPaperWorkerJob(input:
  | Readonly<{
      work_kind: "entry";
      owner_user_id: string;
      account_id: string;
      payload: InternalPaperEntryCommand;
    }>
  | Readonly<{
      work_kind: "exit";
      owner_user_id: string;
      account_id: string;
      payload: InternalPaperExitCommand;
    }>
  | Readonly<{
      work_kind: "no_trade";
      owner_user_id: string;
      account_id: string;
      payload: Omit<InternalPaperNoTradeEvidence, "owner_user_id" | "account_id">;
    }>): InternalPaperWorkerBuildResult {
  const reasons: WorkerBlockReason[] = [];
  if (!UUID_PATTERN.test(input.owner_user_id) || !UUID_PATTERN.test(input.account_id)) {
    reasons.push("worker_identity_invalid");
  }

  if (input.work_kind === "entry" || input.work_kind === "exit") {
    if (
      input.payload.owner_user_id !== input.owner_user_id ||
      input.payload.account_id !== input.account_id
    ) {
      reasons.push("worker_payload_identity_mismatch");
    }
  } else if (
    input.payload.record_version !== "candidate_decision_record_v3" ||
    input.payload.disposition !== "no_trade" ||
    !input.payload.scan_run_id.trim() ||
    !input.payload.scan_run_fingerprint.trim() ||
    !input.payload.no_trade_reason.trim()
  ) {
    reasons.push("no_trade_evidence_invalid");
  }

  if (reasons.length > 0) return blockedResult(reasons);

  if (input.work_kind === "no_trade") {
    return {
      status: "ready",
      job: {
        contract_version: INTERNAL_PAPER_WORKER_JOB_VERSION,
        work_kind: "no_trade",
        owner_user_id: input.owner_user_id,
        account_id: input.account_id,
        payload: {
          ...input.payload,
          owner_user_id: input.owner_user_id,
          account_id: input.account_id,
        },
      },
    };
  }

  return {
    status: "ready",
    job: {
      contract_version: INTERNAL_PAPER_WORKER_JOB_VERSION,
      work_kind: input.work_kind,
      owner_user_id: input.owner_user_id,
      account_id: input.account_id,
      payload: input.payload,
    } as InternalPaperWorkerJobRequest,
  };
}
