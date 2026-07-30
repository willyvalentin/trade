import { createHash } from "node:crypto";

export const POSTGRES_READINESS_POLICY_VERSION =
  "action_661j5r3a_postgres_readiness_policy_rebuild_v1";

export const POSTGRES_READINESS_REASONS = Object.freeze({
  container_exited: "action_661j5r3a.readiness_container_exited",
  pg_isready_failed: "action_661j5r3a.readiness_pg_isready_failed",
  sql_probe_failed: "action_661j5r3a.readiness_sql_probe_failed",
  stable_ready: "action_661j5r3a.readiness_stable",
  timeout: "action_661j5r3a.readiness_timeout",
});

export const POSTGRES_READINESS_POLICY = deepFreeze({
  policy_version: POSTGRES_READINESS_POLICY_VERSION,
  timeout_ms: 30_000,
  poll_interval_ms: 250,
  maximum_attempts: 120,
  required_consecutive_stable_probes: 3,
  probe_order: ["container_running", "pg_isready", "sql_select_1"],
});

export const POSTGRES_READINESS_POLICY_DIGEST = sha256(
  POSTGRES_READINESS_POLICY,
);

export class PostgresReadinessError extends Error {
  constructor(reasonCode, receipt) {
    super(reasonCode);
    this.name = "PostgresReadinessError";
    this.reason_code = reasonCode;
    this.receipt = receipt;
  }
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function canonicalJson(value) {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "number") {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new Error("action_661j5r3a.readiness_value_invalid");
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }
  if (
    typeof value !== "object" ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error("action_661j5r3a.readiness_value_invalid");
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function receiptFor({
  attemptCount,
  consecutiveStableProbes,
  elapsedMs,
  lastProbe,
  terminalReason,
}) {
  const projection = {
    receipt_version: "action_661j5r3a_postgres_readiness_receipt_rebuild_v1",
    policy_version: POSTGRES_READINESS_POLICY_VERSION,
    policy_digest: POSTGRES_READINESS_POLICY_DIGEST,
    attempt_count: attemptCount,
    consecutive_stable_probes: consecutiveStableProbes,
    elapsed_ms: elapsedMs,
    last_probe: lastProbe,
    terminal_reason: terminalReason,
  };
  return deepFreeze({
    ...projection,
    readiness_receipt_digest: sha256(projection),
  });
}

export function verifyPostgresReadinessReceipt(receipt) {
  const keys = [
    "attempt_count",
    "consecutive_stable_probes",
    "elapsed_ms",
    "last_probe",
    "policy_digest",
    "policy_version",
    "readiness_receipt_digest",
    "receipt_version",
    "terminal_reason",
  ];
  if (
    !receipt ||
    typeof receipt !== "object" ||
    Array.isArray(receipt) ||
    Object.keys(receipt).sort().join("\n") !== keys.join("\n")
  ) {
    throw new Error("action_661j5r3a.readiness_receipt_shape_invalid");
  }
  const { readiness_receipt_digest: digest, ...projection } = receipt;
  if (sha256(projection) !== digest) {
    throw new Error("action_661j5r3a.readiness_receipt_digest_mismatch");
  }
  if (
    receipt.policy_version !== POSTGRES_READINESS_POLICY_VERSION ||
    receipt.policy_digest !== POSTGRES_READINESS_POLICY_DIGEST
  ) {
    throw new Error("action_661j5r3a.readiness_policy_mismatch");
  }
  return receipt;
}

export function waitForStablePostgresReadiness({
  inspect_container,
  now,
  probe_pg_isready,
  probe_sql_select_1,
  sleep,
}) {
  const startedAt = now();
  let stable = 0;
  let lastProbe = {
    container_running: false,
    pg_isready: false,
    sql_select_1: false,
  };

  for (
    let attempt = 1;
    attempt <= POSTGRES_READINESS_POLICY.maximum_attempts;
    attempt += 1
  ) {
    const containerRunning = inspect_container();
    if (!containerRunning) {
      const receipt = receiptFor({
        attemptCount: attempt,
        consecutiveStableProbes: 0,
        elapsedMs: now() - startedAt,
        lastProbe,
        terminalReason: POSTGRES_READINESS_REASONS.container_exited,
      });
      throw new PostgresReadinessError(
        POSTGRES_READINESS_REASONS.container_exited,
        receipt,
      );
    }

    const pgReady = probe_pg_isready();
    const sqlReady = pgReady ? probe_sql_select_1() : false;
    lastProbe = {
      container_running: true,
      pg_isready: pgReady,
      sql_select_1: sqlReady,
    };
    stable = pgReady && sqlReady ? stable + 1 : 0;
    const elapsed = now() - startedAt;

    if (
      stable >= POSTGRES_READINESS_POLICY.required_consecutive_stable_probes
    ) {
      return verifyPostgresReadinessReceipt(
        receiptFor({
          attemptCount: attempt,
          consecutiveStableProbes: stable,
          elapsedMs: elapsed,
          lastProbe,
          terminalReason: POSTGRES_READINESS_REASONS.stable_ready,
        }),
      );
    }

    if (
      elapsed >= POSTGRES_READINESS_POLICY.timeout_ms ||
      attempt === POSTGRES_READINESS_POLICY.maximum_attempts
    ) {
      const receipt = receiptFor({
        attemptCount: attempt,
        consecutiveStableProbes: stable,
        elapsedMs: elapsed,
        lastProbe,
        terminalReason: POSTGRES_READINESS_REASONS.timeout,
      });
      throw new PostgresReadinessError(
        POSTGRES_READINESS_REASONS.timeout,
        receipt,
      );
    }
    sleep(POSTGRES_READINESS_POLICY.poll_interval_ms);
  }

  throw new Error("action_661j5r3a.readiness_state_unreachable");
}
