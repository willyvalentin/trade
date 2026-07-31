import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
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
import { parseHistoryFileRebuildV1 } from "../../lib/action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";
import {
  parseTerminalFileRebuildV1,
  persistTerminalResultFileRebuildV1,
  verifyTerminalFileRebuildV1,
} from "../../lib/action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";
import {
  buildSixteenShardAggregateRebuildV1,
  verifySixteenShardAggregateRebuildV1,
} from "../../lib/action-661j5r6-sixteen-shard-aggregate-rebuild-v1.mjs";

interface AclProjection {
  grantable: boolean;
  grantee: string;
  grantor: string;
  privilege: string;
  relation: string;
}

interface SnapshotDomain {
  domain_id: string;
  value: AclProjection[];
}

const root = process.cwd();
const r3aRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");
const r5Root = join(root, "docs/recovery/action-661j5r5/runtime-evidence");
const r6Root = join(root, "docs/recovery/action-661j5r6/runtime-evidence");
const r6aRoot = join(root, "docs/recovery/action-661j5r6a/runtime-evidence");

const duplicatePaths = [
  "duplicate_containment_history-run-a/run-a.duplicate-containment-history-a.duplicate_containment_history.terminal-boundary-rebuild-v1.json",
  "duplicate_containment_history-run-b/run-b.duplicate-containment-history-b.duplicate_containment_history.terminal-boundary-rebuild-v1.json",
] as const;

const aclPaths = [
  "unknown_acl_state-run-a/run-a.unknown-acl-state-a.unknown_acl_state.terminal-boundary-rebuild-v1.json",
  "unknown_acl_state-run-b/run-b.unknown-acl-state-b.unknown_acl_state.terminal-boundary-rebuild-v1.json",
] as const;

function fileSha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

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
  return [
    "missing_action_650_history-run-a/run-a.missing-action-650-history-a.missing_action_650_history.history-boundary-rebuild-v1.json",
    "missing_action_650_history-run-b/run-b.missing-action-650-history-b.missing_action_650_history.history-boundary-rebuild-v1.json",
    "incident_history_present-run-a/run-a.incident-history-present-a.incident_history_present.history-boundary-rebuild-v1.json",
    "incident_history_present-run-b/run-b.incident-history-present-b.incident_history_present.history-boundary-rebuild-v1.json",
  ].map((path) =>
    parseHistoryFileRebuildV1(readFileSync(join(r5Root, path), "utf8")),
  );
}

function duplicateFiles() {
  return duplicatePaths.map((path) =>
    parseTerminalFileRebuildV1(readFileSync(join(r6Root, path), "utf8")),
  );
}

function aclFiles() {
  return aclPaths.map((path) =>
    parseTerminalFileRebuildV1(readFileSync(join(r6aRoot, path), "utf8")),
  );
}

function aggregateInputs() {
  return {
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
    terminal_files: [...duplicateFiles(), ...aclFiles()],
  };
}

function domain(
  file: ReturnType<typeof parseTerminalFileRebuildV1>,
  domainId: string,
) {
  return file.record.evidence.prestate.domains.find(
    (entry: SnapshotDomain) => entry.domain_id === domainId,
  )?.value;
}

test("fresh ACL A/B read back with the full signed ACL domain", () => {
  const files = aclFiles();
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "140f96751834ab89e4a96e9488d82f0182584305d0d9e59c71e33cd32a788824",
    "25efdc355f72c6696d7ef7ec1872f3d44e7b919f3e56759a10c0bcccf4e10164",
  ]);
  for (const file of files) {
    verifyTerminalFileRebuildV1(file);
    const evidence = file.record.evidence;
    expect(evidence.diagnostic.sqlstate).toBe("P0001");
    expect(evidence.diagnostic.reason).toBe(
      "Action 661J refuses unknown or column ACL state for historical_candles",
    );
    expect(evidence.prestate.combined_digest).toBe(
      evidence.poststate.combined_digest,
    );
    expect(evidence.atomicity_decision).toBe("no_transition_verified");
    expect(evidence.runtime_identity.identity_digest).toBe(
      "a10acad44e91e781f0afdac2fb9d5d6568890061b80274d54f4996e833e98fa8",
    );
    expect(domain(file, "table_acl")).toContainEqual({
      grantable: false,
      grantee: "postgres",
      grantor: "postgres",
      privilege: "SELECT",
      relation: "public.historical_candles",
    });
    expect(domain(file, "table_acl")).toContainEqual({
      grantable: false,
      grantee: "action_661j5_unknown_acl",
      grantor: "postgres",
      privilege: "SELECT",
      relation: "public.historical_candles",
    });
    expect(domain(file, "column_acl")).toEqual([]);
  }
  expect(files[0].record.evidence_digest).toBe(
    files[1].record.evidence_digest,
  );
  expect(files[0].record.evidence.runtime_capture_digest).toBe(
    files[1].record.evidence.runtime_capture_digest,
  );
});

test("duplicate A/B is reused byte-identically and never regenerated", () => {
  expect(duplicatePaths.map((path) => fileSha256(join(r6Root, path)))).toEqual([
    "accd4c9c089d41a0945d72c4c06d326b8948c7ef4557cc8e31d4b6ef14c1e55a",
    "37f074286777209739be188237ec09b5a036eab10576b63335550a0c1e7e0964",
  ]);
  expect(duplicateFiles().map((file) => file.record.evidence_digest)).toEqual([
    "83e287da559f5a24a10a5ab7194e29411fae08aeb355a25cd932501bc8e139ee",
    "83e287da559f5a24a10a5ab7194e29411fae08aeb355a25cd932501bc8e139ee",
  ]);
});

test("fresh ACL persistence is idempotent and collision-safe", () => {
  const file = aclFiles()[0];
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r6a-"));
  const outputPath = join(directory, file.file_identity);
  try {
    expect(
      persistTerminalResultFileRebuildV1({
        file,
        output_path: outputPath,
      }).disposition,
    ).toBe("written");
    expect(
      persistTerminalResultFileRebuildV1({
        file,
        output_path: outputPath,
      }).disposition,
    ).toBe("existing_identical");
    writeFileSync(outputPath, "{}\n");
    expect(() =>
      persistTerminalResultFileRebuildV1({
        file,
        output_path: outputPath,
      }),
    ).toThrow("rebuild_v1.persistence_collision");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("persisted aggregate verifies exactly sixteen deterministic shards", () => {
  const inputs = aggregateInputs();
  const aggregate = JSON.parse(
    readFileSync(
      join(
        r6aRoot,
        "action-661j5r6-sixteen-shard-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifySixteenShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.aggregate_digest).toBe(
    "b0967615389cc110cce442ac5a01f5e99d3056998d0e10f0709bdf4464672371",
  );
  expect(aggregate.shard_count).toBe(16);
  expect(aggregate.scenario_comparisons).toHaveLength(8);
  expect(
    aggregate.scenario_comparisons.every(
      (entry: { deterministic: boolean }) => entry.deterministic,
    ),
  ).toBe(true);
  expect(
    buildSixteenShardAggregateRebuildV1({
      historical_files: [...inputs.historical_files].reverse(),
      history_files: [...inputs.history_files].reverse(),
      relation_state_files: [...inputs.relation_state_files].reverse(),
      terminal_files: [...inputs.terminal_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  expect(() =>
    buildSixteenShardAggregateRebuildV1({
      ...inputs,
      terminal_files: [
        inputs.terminal_files[0],
        inputs.terminal_files[1],
        inputs.terminal_files[2],
        inputs.terminal_files[2],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runtime report proves two fresh no-retry ACL runs and progress 22/28", () => {
  const report = JSON.parse(
    readFileSync(join(r6aRoot, "runtime-certification-report.json"), "utf8"),
  ) as {
    aggregate_digest: string;
    fixture_progress: string;
    readiness_policy_digest: string;
    runs: Array<{
      attempt_count: number;
      readiness_attempt_count: number;
      readiness_terminal_reason: string;
      scenario_id: string;
    }>;
  };
  expect(report.readiness_policy_digest).toBe(
    "3e0f527c72f7d1707d984aee97399369bef14a20c133617fb4e75ec28d11b639",
  );
  expect(report.runs).toHaveLength(2);
  for (const run of report.runs) {
    expect(run.scenario_id).toBe("unknown_acl_state");
    expect(run.attempt_count).toBe(1);
    expect(run.readiness_attempt_count).toBeGreaterThanOrEqual(3);
    expect(run.readiness_terminal_reason).toBe(
      "action_661j5r3a.readiness_stable",
    );
  }
  expect(report.aggregate_digest).toBe(
    "b0967615389cc110cce442ac5a01f5e99d3056998d0e10f0709bdf4464672371",
  );
  expect(report.fixture_progress).toBe("22/28");
});
