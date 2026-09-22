import { expect, test } from "@playwright/test";

import {
  runInternalPaperWorkerCycle,
  type InternalPaperWorkerClaim,
} from "@/lib/internal-paper-worker-runtime";

const CLAIM: InternalPaperWorkerClaim = {
  job_id: "11111111-1111-4111-8111-111111111111",
  owner_user_id: "22222222-2222-4222-8222-222222222222",
  account_id: "33333333-3333-4333-8333-333333333333",
  work_kind: "entry",
  lease_token: "44444444-4444-4444-8444-444444444444",
  lease_expires_at: "2026-09-22T14:32:00.000Z",
  attempt_count: 1,
  max_attempts: 5,
};

function dependencies(input: {
  execution: "completed" | "failed";
  release?: "retry_scheduled" | "blocked";
  calls: string[];
}) {
  return {
    claim: async () => {
      input.calls.push("claim");
      return { status: "claimed", data: CLAIM } as const;
    },
    execute: async () => {
      input.calls.push("execute");
      return input.execution === "completed"
        ? ({ status: "completed", data: { job_id: CLAIM.job_id } } as const)
        : ({ status: "failed" } as const);
    },
    release: async (release: {
      failure_code: "worker_execution_failed";
      retry_at: string;
    }) => {
      input.calls.push(`release:${release.failure_code}:${release.retry_at}`);
      return { status: input.release ?? "retry_scheduled" } as const;
    },
  };
}

test.describe("SV-C3 provider-free worker runtime", () => {
  test("fails closed before persistence for an invalid clock or lease", async () => {
    const calls: string[] = [];
    const result = await runInternalPaperWorkerCycle({
      worker_id: "worker-1",
      now: "not-an-instant",
      lease_seconds: 301,
      dependencies: dependencies({ execution: "completed", calls }),
    });
    expect(result).toEqual({ status: "failed" });
    expect(calls).toEqual([]);
  });

  test("does nothing when the durable queue has no work", async () => {
    const result = await runInternalPaperWorkerCycle({
      worker_id: "worker-1",
      now: "2026-09-22T14:31:00.000Z",
      dependencies: {
        claim: async () => ({ status: "no_work" as const }),
        execute: async () => {
          throw new Error("execute must not run");
        },
        release: async () => {
          throw new Error("release must not run");
        },
      },
    });
    expect(result).toEqual({ status: "no_work" });
  });

  test("claims and atomically executes one job without a browser", async () => {
    const calls: string[] = [];
    const result = await runInternalPaperWorkerCycle({
      worker_id: "worker-1",
      now: "2026-09-22T14:31:00.000Z",
      dependencies: dependencies({ execution: "completed", calls }),
    });
    expect(result.status).toBe("completed");
    expect(calls).toEqual(["claim", "execute"]);
  });

  test("releases a failed attempt with bounded retry instead of duplicating work", async () => {
    const calls: string[] = [];
    const result = await runInternalPaperWorkerCycle({
      worker_id: "worker-1",
      now: "2026-09-22T14:31:00.000Z",
      retry_delay_seconds: 45,
      dependencies: dependencies({ execution: "failed", calls }),
    });
    expect(result).toEqual({ status: "retry_scheduled" });
    expect(calls).toEqual([
      "claim",
      "execute",
      "release:worker_execution_failed:2026-09-22T14:31:45.000Z",
    ]);
  });

  test("surfaces the durable blocked state after the retry budget is exhausted", async () => {
    const calls: string[] = [];
    const result = await runInternalPaperWorkerCycle({
      worker_id: "worker-1",
      now: "2026-09-22T14:31:00.000Z",
      dependencies: dependencies({ execution: "failed", release: "blocked", calls }),
    });
    expect(result).toEqual({ status: "blocked" });
    expect(calls).toHaveLength(3);
  });
});
