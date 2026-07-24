import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const builderPath = resolve(root, "scripts/action-643-scheduled-dry-run-request-builder.mjs");
let builder: typeof import("../../scripts/action-643-scheduled-dry-run-request-builder.mjs");

const commit = "c7fc1f06019f1afff58c9f146a1f0576ef6447dc";

test.beforeAll(async () => {
  builder = await import(pathToFileURL(builderPath).href);
});

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    deployment_commit: commit,
    expected_deployment_commit: commit,
    market_date: "2026-07-24",
    market_window: { start: "2026-07-24T13:30:00.000Z", end: "2026-07-24T14:00:00.000Z" },
    cadence_slot: "regular_session_30m_1400Z",
    execution_mode: "dry_run",
    now_utc: "2026-07-24T14:00:00.000Z",
    ...overrides,
  };
}

function expectRejected(input: Record<string, unknown>, code: string) {
  const result = builder.buildAction643ScheduledDryRunRequest(input);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("Expected Action 646 request construction to fail closed.");
  expect(result.code).toBe(code);
}

test("Action 646 deterministically builds the exact completed Action 643 dry-run payload", () => {
  const first = builder.buildAction643ScheduledDryRunRequest(validInput());
  const second = builder.buildAction643ScheduledDryRunRequest(validInput());
  expect(first).toEqual(second);
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  expect(first.payload).toMatchObject({
    deployment_commit: commit,
    market_date: "2026-07-24",
    market_window: { start: "2026-07-24T13:30:00.000Z", end: "2026-07-24T14:00:00.000Z" },
    cadence_slot: "regular_session_30m_1400Z",
    execution_mode: "dry_run",
    ticker: "AAPL",
    interval: "5min",
    requested_at: "2026-07-24T14:00:00.000Z",
    expected_policy: { total_credits: 377, hard_reserve_credits: 57, normal_planned_max_credits: 320 },
  });
  expect(first.occurrence_id).toMatch(/^scheduled_canary_occurrence_20260724_1400_[0-9a-f]{8}$/);
  expect(first.request_fingerprint).toMatch(/^action_643_scheduled_dry_run_[0-9a-f]{24}$/);
});

test("Action 646 requires an explicit current deployment identity and rejects malformed or stale identities", () => {
  expectRejected(validInput({ deployment_commit: null }), "deployment_commit_invalid");
  expectRejected(validInput({ deployment_commit: "A".repeat(40) }), "deployment_commit_invalid");
  expectRejected(validInput({ expected_deployment_commit: "a".repeat(40) }), "deployment_identity_stale");
});

test("Action 646 rejects pre-cutoff, live-capable, and mismatched market inputs", () => {
  expectRejected(validInput({ now_utc: "2026-07-24T13:59:59.999Z" }), "window_not_completed");
  expectRejected(validInput({ execution_mode: "live" }), "execution_mode_not_dry_run");
  expectRejected(validInput({ market_date: "2026-07-23" }), "market_date_mismatch");
  expectRejected(validInput({ market_window: { start: "2026-07-24T14:00:00.000Z", end: "2026-07-24T14:30:00.000Z" } }), "market_window_mismatch");
  expectRejected(validInput({ cadence_slot: "regular_session_30m_1430Z" }), "cadence_mismatch");
  expectRejected({ ...validInput(), authorization: "not-accepted" }, "input_shape_invalid");
});

test("Action 646 contains no credential, network, or mutation path and never emits secrets", () => {
  const source = readFileSync(builderPath, "utf8");
  for (const forbidden of ["fetch(", "http://", "https://", "supabase.from", "netlify.api", "getIntradayCandles", "claimContinuous", "persistContinuous", "writeFile", "POST(", "PUT(", "PATCH(", "DELETE("]) {
    expect(source).not.toContain(forbidden);
  }
  const result = builder.buildAction643ScheduledDryRunRequest(validInput());
  expect(JSON.stringify(result)).not.toMatch(/secret|token|cookie|authorization|password|api[_-]?key/i);
});
