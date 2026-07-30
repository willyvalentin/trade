import { expect, test } from "@playwright/test";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parsePersistedFileRebuildV1 } from "../../lib/action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import { parseRelationStateFileRebuildV1 } from "../../lib/action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";
import {
  parseHistoryFileRebuildV1,
  persistHistoryResultFileRebuildV1,
  verifyHistoryFileRebuildV1,
} from "../../lib/action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";
import {
  buildTwelveShardAggregateRebuildV1,
  verifyTwelveShardAggregateRebuildV1,
} from "../../lib/action-661j5r5-twelve-shard-aggregate-rebuild-v1.mjs";

interface HistoryEntry {
  name: string;
  statement_count: number;
  version: string;
}

interface SnapshotDomain {
  domain_id: string;
  value: HistoryEntry[];
}

const root = process.cwd();
const r3aRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");
const r5Root = join(root, "docs/recovery/action-661j5r5/runtime-evidence");

const historyPaths = [
  "missing_action_650_history-run-a/run-a.missing-action-650-history-a.missing_action_650_history.history-boundary-rebuild-v1.json",
  "missing_action_650_history-run-b/run-b.missing-action-650-history-b.missing_action_650_history.history-boundary-rebuild-v1.json",
  "incident_history_present-run-a/run-a.incident-history-present-a.incident_history_present.history-boundary-rebuild-v1.json",
  "incident_history_present-run-b/run-b.incident-history-present-b.incident_history_present.history-boundary-rebuild-v1.json",
] as const;

function historicalFiles() {
  return [
    "forbidden_history-run-a/run-a.forbidden-history-a.forbidden_history.rebuild-v1.json",
    "forbidden_history-run-b/run-b.forbidden-history-b.forbidden_history.rebuild-v1.json",
    "missing_target-run-a/run-a.missing-target-a.missing_target.rebuild-v1.json",
    "missing_target-run-b/run-b.missing-target-b.missing_target.rebuild-v1.json",
  ].map((path) =>
    parsePersistedFileRebuildV1(readFileSync(join(r3aRoot, path), "utf8")),
  );
}

function relationStateFiles() {
  return [
    "non_table-run-a/run-a.non-table-a.non_table.relation-state-rebuild-v1.json",
    "non_table-run-b/run-b.non-table-b.non_table.relation-state-rebuild-v1.json",
    "wrong_owner-run-a/run-a.wrong-owner-a.wrong_owner.relation-state-rebuild-v1.json",
    "wrong_owner-run-b/run-b.wrong-owner-b.wrong_owner.relation-state-rebuild-v1.json",
  ].map((path) =>
    parseRelationStateFileRebuildV1(readFileSync(join(r4Root, path), "utf8")),
  );
}

function historyFiles() {
  return historyPaths.map((path) =>
    parseHistoryFileRebuildV1(readFileSync(join(r5Root, path), "utf8")),
  );
}

function migrationHistory(file: ReturnType<typeof parseHistoryFileRebuildV1>) {
  return file.record.evidence.prestate.domains.find(
    (domain: SnapshotDomain) => domain.domain_id === "migration_history",
  )?.value;
}

test("fresh history-boundary files independently read back with exact terminals", () => {
  const files = historyFiles();
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "cc7bf24c8dfb64d6eca5990270fd7bae2f0f567acfe41a74c14c65f0e54705f9",
    "daad2d34d0ca51bf3f9a2966e81320990f5a28c3f82dfb498a7480e75c8c3eaf",
    "7e43d928be9caede3d75ac3c7c4a0913079e1b7c2371084f396583c31f661370",
    "1a64cf0779b2f927d8fffb8b11ab7e67b993e2ff0900e4a3363464780e370b1e",
  ]);
  for (const file of files) {
    const evidence = file.record.evidence;
    expect(evidence.diagnostic.sqlstate).toBe("P0001");
    expect(evidence.diagnostic.reason).toBe(
      file.record.scenario_id === "missing_action_650_history"
        ? "Action 661J requires exact Action 650 history"
        : "Action 661J refuses incident or duplicate containment history",
    );
    expect(evidence.prestate.combined_digest).toBe(
      evidence.poststate.combined_digest,
    );
    expect(evidence.atomicity_decision).toBe("no_transition_verified");
    expect(evidence.migration_applied).toBe(false);
    expect(evidence.terminal_state).toBe("controlled_error");
    expect(evidence.runtime_identity.identity_digest).toBe(
      "a10acad44e91e781f0afdac2fb9d5d6568890061b80274d54f4996e833e98fa8",
    );
  }
  const missingHistory = migrationHistory(files[0]) ?? [];
  expect(
    missingHistory.some(
      (entry: HistoryEntry) => entry.version === "20260724002000",
    ),
  ).toBe(false);
  const incidentHistory = migrationHistory(files[2]) ?? [];
  expect(
    incidentHistory.find(
      (entry: HistoryEntry) => entry.version === "20260724002000",
    ),
  ).toEqual({
    name: "contain_production_trading_data_access",
    statement_count: 6,
    version: "20260724002000",
  });
  expect(
    incidentHistory.find(
      (entry: HistoryEntry) => entry.version === "20260724003000",
    ),
  ).toEqual({
    name: "action_661j5r5_incident_fixture",
    statement_count: 1,
    version: "20260724003000",
  });
  expect(
    incidentHistory.some(
      (entry: HistoryEntry) => entry.version === "20260726000000",
    ),
  ).toBe(false);
});

test("fresh persisted writes are idempotent and reject collisions", () => {
  const file = historyFiles()[0];
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r5-"));
  const outputPath = join(directory, file.file_identity);
  try {
    expect(
      persistHistoryResultFileRebuildV1({
        file,
        output_path: outputPath,
      }).disposition,
    ).toBe("written");
    expect(
      persistHistoryResultFileRebuildV1({
        file,
        output_path: outputPath,
      }).disposition,
    ).toBe("existing_identical");
    writeFileSync(outputPath, "{}\n");
    expect(() =>
      persistHistoryResultFileRebuildV1({
        file,
        output_path: outputPath,
      }),
    ).toThrow("rebuild_v1.persistence_collision");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("exact twelve-shard aggregate verifies all six deterministic pairs", () => {
  const inputs = {
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
  };
  const aggregate = JSON.parse(
    readFileSync(
      join(
        r5Root,
        "action-661j5r5-twelve-shard-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifyTwelveShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.aggregate_digest).toBe(
    "98fbadda4d0dde2d559e0c636554cf084ec79ed8f47f7653091749db1bafa376",
  );
  expect(aggregate.shard_count).toBe(12);
  expect(aggregate.scenario_comparisons).toHaveLength(6);
  expect(aggregate.scenario_comparisons.every(
    (entry: { deterministic: boolean }) => entry.deterministic,
  )).toBe(true);
  expect(
    buildTwelveShardAggregateRebuildV1({
      historical_files: [...inputs.historical_files].reverse(),
      history_files: [...inputs.history_files].reverse(),
      relation_state_files: [...inputs.relation_state_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
});

test("runtime report binds one attempt, stable readiness, and progress 20/28", () => {
  const report = JSON.parse(
    readFileSync(join(r5Root, "runtime-certification-report.json"), "utf8"),
  ) as {
    aggregate_digest: string;
    fixture_progress: string;
    readiness_policy_digest: string;
    runs: Array<{
      attempt_count: number;
      readiness_attempt_count: number;
      readiness_terminal_reason: string;
      runtime_identity_digest: string;
    }>;
  };
  expect(report.readiness_policy_digest).toBe(
    "3e0f527c72f7d1707d984aee97399369bef14a20c133617fb4e75ec28d11b639",
  );
  expect(report.runs).toHaveLength(4);
  for (const run of report.runs) {
    expect(run.attempt_count).toBe(1);
    expect(run.readiness_attempt_count).toBeGreaterThanOrEqual(3);
    expect(run.readiness_terminal_reason).toBe(
      "action_661j5r3a.readiness_stable",
    );
    expect(run.runtime_identity_digest).toBe(
      "a10acad44e91e781f0afdac2fb9d5d6568890061b80274d54f4996e833e98fa8",
    );
  }
  expect(report.aggregate_digest).toBe(
    "98fbadda4d0dde2d559e0c636554cf084ec79ed8f47f7653091749db1bafa376",
  );
  expect(report.fixture_progress).toBe("20/28");
});

test("runtime evidence rejects nested, outer, inventory, and canonical tampering", () => {
  const files = historyFiles();
  expect(() =>
    verifyHistoryFileRebuildV1({
      ...files[0],
      record: {
        ...files[0].record,
        evidence: {
          ...files[0].record.evidence,
          diagnostic: {
            ...files[0].record.evidence.diagnostic,
            reason: "wrong",
          },
        },
      },
    }),
  ).toThrow("rebuild_v1.diagnostic_mismatch");
  expect(() =>
    verifyHistoryFileRebuildV1({
      ...files[0],
      canonical_file_digest:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    }),
  ).toThrow("rebuild_v1.file_digest_mismatch");
  expect(() =>
    buildTwelveShardAggregateRebuildV1({
      historical_files: historicalFiles(),
      history_files: [files[0], files[0], files[2], files[3]],
      relation_state_files: relationStateFiles(),
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
  expect(() =>
    parseHistoryFileRebuildV1(
      `${readFileSync(join(r5Root, historyPaths[0]), "utf8").trim()} `,
    ),
  ).toThrow("rebuild_v1.persistence_readback_mismatch");
  expect(() => parseHistoryFileRebuildV1("{")).toThrow(
    "rebuild_v1.persistence_readback_mismatch:json",
  );
});
