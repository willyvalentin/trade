import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { verifyMixedAbAggregateRebuildV1 } from "../../lib/action-661j5r2-mixed-ab-aggregate-rebuild-v1.mjs";
import { parsePersistedFileRebuildV1 } from "../../lib/action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import {
  POSTGRES_READINESS_POLICY_DIGEST,
  POSTGRES_READINESS_REASONS,
} from "../../lib/action-661j5r3a-postgres-readiness-rebuild-v1.mjs";

interface RunReport {
  attempt_count: number;
  evidence_digest: string;
  file_digest: string;
  readiness_attempt_count: number;
  readiness_receipt_digest: string;
  readiness_terminal_reason: string;
  record_digest: string;
  run_id: string;
  runtime_capture_digest: string;
  runtime_identity_digest: string;
  scenario_id: string;
  shard_digest: string;
  shard_id: string;
  snapshot_combined_digest: string;
}

const outputRoot = join(
  process.cwd(),
  "docs/recovery/action-661j5r3a/runtime-evidence",
);

const resultPaths = [
  "forbidden_history-run-a/run-a.forbidden-history-a.forbidden_history.rebuild-v1.json",
  "forbidden_history-run-b/run-b.forbidden-history-b.forbidden_history.rebuild-v1.json",
  "missing_target-run-a/run-a.missing-target-a.missing_target.rebuild-v1.json",
  "missing_target-run-b/run-b.missing-target-b.missing_target.rebuild-v1.json",
] as const;

test("fresh R.3A files read back as one exact four-shard aggregate", () => {
  const files = resultPaths.map((path) =>
    parsePersistedFileRebuildV1(readFileSync(join(outputRoot, path), "utf8")),
  );
  const aggregate = JSON.parse(
    readFileSync(
      join(
        outputRoot,
        "action-661j5r2-mixed-ab-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifyMixedAbAggregateRebuildV1(aggregate, files);
  expect(aggregate.aggregate_digest).toBe(
    "2c8744e945f629953b2e457032920909c4c4646157bb1ae08dcacc28343db7f9",
  );
  expect(
    aggregate.scenario_comparisons.map(
      (entry: {
        atomicity_decision: string;
        deterministic: boolean;
        scenario_id: string;
        semantic_digest: string;
      }) => entry,
    ),
  ).toEqual([
    {
      atomicity_decision: "no_transition_verified",
      deterministic: true,
      scenario_id: "forbidden_history",
      semantic_digest:
        "73ca9e88d3bb2c9c712cfe0f17f38cad6175585c8147574b1aff81f70634451a",
    },
    {
      atomicity_decision: "no_transition_verified",
      deterministic: true,
      scenario_id: "missing_target",
      semantic_digest:
        "a367b1f580aa2f790b8bb336e422a0dd14f357c3d95965a047c25ef85f7f608e",
    },
  ]);
});

test("fresh report binds four stable readiness receipts and one attempt each", () => {
  const report = JSON.parse(
    readFileSync(join(outputRoot, "runtime-certification-report.json"), "utf8"),
  ) as {
    aggregate_digest: string;
    fixture_progress: string;
    readiness_policy_digest: string;
    runs: RunReport[];
  };
  expect(report.readiness_policy_digest).toBe(
    POSTGRES_READINESS_POLICY_DIGEST,
  );
  expect(report.runs).toHaveLength(4);
  expect(report.runs.map((run) => `${run.scenario_id}/${run.run_id}`)).toEqual([
    "forbidden_history/run-a",
    "forbidden_history/run-b",
    "missing_target/run-a",
    "missing_target/run-b",
  ]);
  for (const run of report.runs) {
    expect(run.attempt_count).toBe(1);
    expect(run.readiness_attempt_count).toBeGreaterThanOrEqual(3);
    expect(run.readiness_receipt_digest).toMatch(/^[a-f0-9]{64}$/);
    expect(run.readiness_terminal_reason).toBe(
      POSTGRES_READINESS_REASONS.stable_ready,
    );
  }
  expect(report.aggregate_digest).toBe(
    "2c8744e945f629953b2e457032920909c4c4646157bb1ae08dcacc28343db7f9",
  );
  expect(report.fixture_progress).toBe("16/28");
});

test("historical partial evidence is not one of the fresh aggregate inputs", () => {
  expect(resultPaths.every((path) => !path.includes("action-661j5r3/"))).toBe(
    true,
  );
  const contract = readFileSync(
    join(
      process.cwd(),
      "docs/recovery/action-661j5r3a/readiness-contract.md",
    ),
    "utf8",
  );
  expect(contract).toContain("historical_partial_runtime_evidence");
  expect(contract).toContain("not an input");
});
