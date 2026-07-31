import { expect, test } from "@playwright/test";

import {
  POSTGRES_READINESS_POLICY,
  POSTGRES_READINESS_POLICY_DIGEST,
  POSTGRES_READINESS_REASONS,
  PostgresReadinessError,
  verifyPostgresReadinessReceipt,
  waitForStablePostgresReadiness,
} from "../../lib/action-661j5r3a-postgres-readiness-rebuild-v1.mjs";

interface ProbeState {
  container: boolean;
  pg: boolean;
  sql: boolean;
}

function runStates(states: readonly ProbeState[]) {
  let clock = 0;
  let index = 0;
  let sqlCalls = 0;
  const receipt = waitForStablePostgresReadiness({
    inspect_container: () => states[Math.min(index, states.length - 1)].container,
    now: () => clock,
    probe_pg_isready: () => states[Math.min(index, states.length - 1)].pg,
    probe_sql_select_1: () => {
      sqlCalls += 1;
      return states[Math.min(index, states.length - 1)].sql;
    },
    sleep: (milliseconds: number) => {
      clock += milliseconds;
      index += 1;
    },
  });
  return { receipt, sqlCalls };
}

test("readiness policy is bounded, versioned, and digest-bound", () => {
  expect(POSTGRES_READINESS_POLICY).toEqual({
    policy_version: "action_661j5r3a_postgres_readiness_policy_rebuild_v1",
    timeout_ms: 30_000,
    poll_interval_ms: 250,
    maximum_attempts: 120,
    required_consecutive_stable_probes: 3,
    probe_order: ["container_running", "pg_isready", "sql_select_1"],
  });
  expect(POSTGRES_READINESS_POLICY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
  expect(Object.isFrozen(POSTGRES_READINESS_POLICY)).toBe(true);
  expect(Object.isFrozen(POSTGRES_READINESS_POLICY.probe_order)).toBe(true);
});

test("delayed startup requires three stable pg and SQL probes", () => {
  const result = runStates([
    { container: true, pg: false, sql: false },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
  ]);
  expect(result.receipt.attempt_count).toBe(4);
  expect(result.receipt.consecutive_stable_probes).toBe(3);
  expect(result.receipt.terminal_reason).toBe(
    POSTGRES_READINESS_REASONS.stable_ready,
  );
  expect(result.sqlCalls).toBe(3);
  expect(verifyPostgresReadinessReceipt(result.receipt)).toBe(result.receipt);
});

test("transient ready/not-ready resets the stability counter", () => {
  const result = runStates([
    { container: true, pg: true, sql: true },
    { container: true, pg: false, sql: false },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
  ]);
  expect(result.receipt.attempt_count).toBe(5);
  expect(result.receipt.consecutive_stable_probes).toBe(3);
});

test("SQL probe failure resets stability even when pg_isready passes", () => {
  const result = runStates([
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: false },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
  ]);
  expect(result.receipt.attempt_count).toBe(5);
  expect(result.sqlCalls).toBe(5);
});

test("container exit fails immediately with an exact reason", () => {
  let thrown: unknown;
  try {
    runStates([{ container: false, pg: false, sql: false }]);
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(PostgresReadinessError);
  expect((thrown as PostgresReadinessError).reason_code).toBe(
    POSTGRES_READINESS_REASONS.container_exited,
  );
  expect((thrown as PostgresReadinessError).receipt.attempt_count).toBe(1);
});

test("bounded timeout fails with no successful receipt", () => {
  let clock = 0;
  let thrown: unknown;
  try {
    waitForStablePostgresReadiness({
      inspect_container: () => true,
      now: () => clock,
      probe_pg_isready: () => false,
      probe_sql_select_1: () => {
        throw new Error("SQL must not run before pg_isready");
      },
      sleep: (milliseconds: number) => {
        clock += milliseconds;
      },
    });
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(PostgresReadinessError);
  const readinessError = thrown as PostgresReadinessError;
  expect(readinessError.reason_code).toBe(POSTGRES_READINESS_REASONS.timeout);
  expect(readinessError.receipt.attempt_count).toBe(120);
  expect(readinessError.receipt.elapsed_ms).toBeLessThanOrEqual(
    POSTGRES_READINESS_POLICY.timeout_ms,
  );
});

test("receipt tampering is rejected with a stable reason", () => {
  const { receipt } = runStates([
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
    { container: true, pg: true, sql: true },
  ]);
  expect(() =>
    verifyPostgresReadinessReceipt({
      ...receipt,
      attempt_count: receipt.attempt_count + 1,
    }),
  ).toThrow("action_661j5r3a.readiness_receipt_digest_mismatch");
});
