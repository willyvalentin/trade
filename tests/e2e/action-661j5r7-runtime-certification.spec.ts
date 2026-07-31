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
import { parseTerminalFileRebuildV1 } from "../../lib/action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";
import {
  COLUMN_ACL_PRECONDITION,
  POLICY_PRECONDITION,
} from "../../lib/action-661j5r7-column-acl-policy-contracts-rebuild-v1.mjs";
import {
  parseColumnAclPolicyFileRebuildV1,
  persistColumnAclPolicyResultFileRebuildV1,
  verifyColumnAclPolicyFileRebuildV1,
} from "../../lib/action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";
import {
  buildTwentyShardAggregateRebuildV1,
  verifyTwentyShardAggregateRebuildV1,
} from "../../lib/action-661j5r7-twenty-shard-aggregate-rebuild-v1.mjs";

interface SnapshotDomain {
  domain_id: string;
  value: unknown[];
}

const root = process.cwd();
const r3aRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");
const r5Root = join(root, "docs/recovery/action-661j5r5/runtime-evidence");
const r7Root = join(root, "docs/recovery/action-661j5r7/runtime-evidence");

const r7Paths = [
  "column_acl_state-run-a/run-a.column-acl-state-a.column_acl_state.column-acl-policy-rebuild-v1.json",
  "column_acl_state-run-b/run-b.column-acl-state-b.column_acl_state.column-acl-policy-rebuild-v1.json",
  "policy_state-run-a/run-a.policy-state-a.policy_state.column-acl-policy-rebuild-v1.json",
  "policy_state-run-b/run-b.policy-state-b.policy_state.column-acl-policy-rebuild-v1.json",
] as const;

function sha256File(path: string) {
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

function terminalFiles() {
  const entries = [
    [
      "docs/recovery/action-661j5r6/runtime-evidence",
      "duplicate_containment_history-run-a/run-a.duplicate-containment-history-a.duplicate_containment_history.terminal-boundary-rebuild-v1.json",
    ],
    [
      "docs/recovery/action-661j5r6/runtime-evidence",
      "duplicate_containment_history-run-b/run-b.duplicate-containment-history-b.duplicate_containment_history.terminal-boundary-rebuild-v1.json",
    ],
    [
      "docs/recovery/action-661j5r6a/runtime-evidence",
      "unknown_acl_state-run-a/run-a.unknown-acl-state-a.unknown_acl_state.terminal-boundary-rebuild-v1.json",
    ],
    [
      "docs/recovery/action-661j5r6a/runtime-evidence",
      "unknown_acl_state-run-b/run-b.unknown-acl-state-b.unknown_acl_state.terminal-boundary-rebuild-v1.json",
    ],
  ] as const;
  return entries.map(([directory, path]) =>
    parseTerminalFileRebuildV1(
      readFileSync(join(root, directory, path), "utf8"),
    ),
  );
}

function r7Files() {
  return r7Paths.map((path) =>
    parseColumnAclPolicyFileRebuildV1(
      readFileSync(join(r7Root, path), "utf8"),
    ),
  );
}

function aggregateInputs() {
  return {
    column_acl_policy_files: r7Files(),
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
    terminal_files: terminalFiles(),
  };
}

function domain(
  file: ReturnType<typeof parseColumnAclPolicyFileRebuildV1>,
  domainId: string,
) {
  return file.record.evidence.prestate.domains.find(
    (entry: SnapshotDomain) => entry.domain_id === domainId,
  )?.value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function targetRelationEntries(
  file: ReturnType<typeof parseColumnAclPolicyFileRebuildV1>,
  domainId: string,
) {
  return (domain(file, domainId) ?? []).filter(
    (entry: unknown) =>
      isRecord(entry) && entry.relation === "public.historical_candles",
  );
}

function targetPolicies(
  file: ReturnType<typeof parseColumnAclPolicyFileRebuildV1>,
) {
  return (domain(file, "rls_policies") ?? []).filter(
    (entry: unknown) =>
      isRecord(entry) &&
      entry.schema === "public" &&
      entry.table === "historical_candles",
  );
}

test("fresh R7 files independently read back with exact terminal policies", () => {
  const files = r7Files();
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "adc41d5e133bc83f4313210dbe1590953d947b3b31504da59df89b0cf71f85e3",
    "185505de889cac5fa35e00b65a8b7730fd423337553ac65e44fd396ee2c2db2c",
    "7dbde3448b2dc7a7b5d97d021beece818645311286676569f2c80e545bf43cef",
    "675c0fe4238efc6c4f60b79f9cf3356eddeec411f5b4d6a25cabcbd590d9edca",
  ]);
  for (const file of files) {
    verifyColumnAclPolicyFileRebuildV1(file);
    const evidence = file.record.evidence;
    expect(evidence.diagnostic.sqlstate).toBe("P0001");
    expect(evidence.diagnostic.reason).toBe(
      file.record.scenario_id === "column_acl_state"
        ? "Action 661J refuses unknown or column ACL state for historical_candles"
        : "Action 661J refuses policy state for historical_candles",
    );
    expect(evidence.prestate.combined_digest).toBe(
      evidence.poststate.combined_digest,
    );
    expect(evidence.atomicity_decision).toBe("no_transition_verified");
    expect(evidence.runtime_identity.identity_digest).toBe(
      "781985ba95d3fa1e7b5631f386dccc45322abed12e8d4908ff4cfd0c6bf62293",
    );
  }
  expect(targetRelationEntries(files[0], "column_acl")).toEqual([
    COLUMN_ACL_PRECONDITION,
  ]);
  expect(targetRelationEntries(files[0], "table_acl")).toEqual([]);
  expect(targetPolicies(files[2])).toEqual([POLICY_PRECONDITION]);
  expect(targetRelationEntries(files[2], "column_acl")).toEqual([]);
});

test("A/B semantics and persisted writes are deterministic and collision-safe", () => {
  const files = r7Files();
  expect(files[0].record.evidence_digest).toBe(
    files[1].record.evidence_digest,
  );
  expect(files[2].record.evidence_digest).toBe(
    files[3].record.evidence_digest,
  );
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r7-"));
  const outputPath = join(directory, files[0].file_identity);
  try {
    expect(
      persistColumnAclPolicyResultFileRebuildV1({
        file: files[0],
        output_path: outputPath,
      }).disposition,
    ).toBe("written");
    expect(
      persistColumnAclPolicyResultFileRebuildV1({
        file: files[0],
        output_path: outputPath,
      }).disposition,
    ).toBe("existing_identical");
    writeFileSync(outputPath, "{}\n");
    expect(() =>
      persistColumnAclPolicyResultFileRebuildV1({
        file: files[0],
        output_path: outputPath,
      }),
    ).toThrow("rebuild_v1.persistence_collision");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("exact twenty-shard aggregate verifies ten deterministic pairs", () => {
  const inputs = aggregateInputs();
  const aggregate = JSON.parse(
    readFileSync(
      join(
        r7Root,
        "action-661j5r7-twenty-shard-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifyTwentyShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.aggregate_digest).toBe(
    "0d9ad086529e24c25881677dcfcb513461d23837f3b7e2d1e8506b41223a25e1",
  );
  expect(aggregate.shard_count).toBe(20);
  expect(aggregate.scenario_comparisons).toHaveLength(10);
  expect(
    aggregate.scenario_comparisons.every(
      (entry: { deterministic: boolean }) => entry.deterministic,
    ),
  ).toBe(true);
  expect(
    buildTwentyShardAggregateRebuildV1({
      ...inputs,
      column_acl_policy_files:
        [...inputs.column_acl_policy_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  expect(() =>
    buildTwentyShardAggregateRebuildV1({
      ...inputs,
      column_acl_policy_files: [
        inputs.column_acl_policy_files[0],
        inputs.column_acl_policy_files[0],
        inputs.column_acl_policy_files[2],
        inputs.column_acl_policy_files[3],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runtime report binds four one-attempt runs and progress 24/28", () => {
  const report = JSON.parse(
    readFileSync(join(r7Root, "runtime-certification-report.json"), "utf8"),
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
  expect(report.runs.map((run) => run.scenario_id)).toEqual([
    "column_acl_state",
    "column_acl_state",
    "policy_state",
    "policy_state",
  ]);
  for (const run of report.runs) {
    expect(run.attempt_count).toBe(1);
    expect(run.readiness_attempt_count).toBeGreaterThanOrEqual(3);
    expect(run.readiness_terminal_reason).toBe(
      "action_661j5r3a.readiness_stable",
    );
  }
  expect(report.aggregate_digest).toBe(
    "0d9ad086529e24c25881677dcfcb513461d23837f3b7e2d1e8506b41223a25e1",
  );
  expect(report.fixture_progress).toBe("24/28");
});

test("prior aggregates and all new persisted bytes remain pinned", () => {
  expect([
    sha256File(
      join(
        r3aRoot,
        "action-661j5r2-mixed-ab-aggregate.rebuild-v1.json",
      ),
    ),
    sha256File(
      join(
        r4Root,
        "action-661j5r4-eight-shard-aggregate.rebuild-v1.json",
      ),
    ),
    sha256File(
      join(
        r5Root,
        "action-661j5r5-twelve-shard-aggregate.rebuild-v1.json",
      ),
    ),
    sha256File(
      join(
        root,
        "docs/recovery/action-661j5r6a/runtime-evidence/action-661j5r6-sixteen-shard-aggregate.rebuild-v1.json",
      ),
    ),
  ]).toEqual([
    "3b1713b42936193860f54f097226c73cd254f003c9b1e307f92b8a22f286a556",
    "0a354893760f4cedb42d99080dcbf2e831937494291f04068e406be12e1a4838",
    "87da33bdb0fe2c3c683895efa4cfc492ddff53f6ecbfd34569f98bf82e450655",
    "852c690b8162414b68bf5e51deb98b7e542bb548e59af935de8b009e95d6895a",
  ]);
  expect(r7Paths.map((path) => sha256File(join(r7Root, path)))).toEqual([
    "d64407050d9485ae6c5703a6ee073ab9c4cf90ef7fdcf4bde26bd63a267e267c",
    "8e0c117538ddbf20824ebd2772cba0fe8df1af42dea92a3b8b366886bffef330",
    "b28c112b2ebf920f336466cfa2de1b81b38234247f7cff4704e8561eabb2a666",
    "6a144748cc66eeec9ae15cadfaddb4398bf14b7bf789e6a451f7755d22acf25c",
  ]);
  expect(() =>
    parseColumnAclPolicyFileRebuildV1(
      `${readFileSync(join(r7Root, r7Paths[0]), "utf8").trim()} `,
    ),
  ).toThrow("rebuild_v1.persistence_readback_mismatch");
  expect(() => parseColumnAclPolicyFileRebuildV1("{")).toThrow(
    "rebuild_v1.persistence_readback_mismatch:json",
  );
});
