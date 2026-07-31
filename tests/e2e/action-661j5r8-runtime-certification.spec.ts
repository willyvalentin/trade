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
import { parseColumnAclPolicyFileRebuildV1 } from "../../lib/action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";
import {
  APPEND_ONLY_BASELINE,
  RPC_CATALOG_BODY_DRIFT_PRECONDITION,
  APPEND_ONLY_PRECONDITION,
} from "../../lib/action-661j5r8-rpc-append-only-contracts-rebuild-v1.mjs";
import {
  parseRpcAppendOnlyFileRebuildV1,
  persistRpcAppendOnlyResultFileRebuildV1,
  verifyRpcAppendOnlyFileRebuildV1,
} from "../../lib/action-661j5r8-rpc-append-only-result-protocol-rebuild-v1.mjs";
import {
  buildTwentyFourShardAggregateRebuildV1,
  verifyTwentyFourShardAggregateRebuildV1,
} from "../../lib/action-661j5r8-twenty-four-shard-aggregate-rebuild-v1.mjs";

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
const r8Root = join(root, "docs/recovery/action-661j5r8/runtime-evidence");

const r8Paths = [
  "rpc_catalog_body_drift-run-a/run-a.rpc-catalog-body-drift-a.rpc_catalog_body_drift.rpc-append-only-rebuild-v1.json",
  "rpc_catalog_body_drift-run-b/run-b.rpc-catalog-body-drift-b.rpc_catalog_body_drift.rpc-append-only-rebuild-v1.json",
  "incompatible_append_only_function-run-a/run-a.incompatible-append-only-function-a.incompatible_append_only_function.rpc-append-only-rebuild-v1.json",
  "incompatible_append_only_function-run-b/run-b.incompatible-append-only-function-b.incompatible_append_only_function.rpc-append-only-rebuild-v1.json",
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

function columnAclPolicyFiles() {
  return [
    "column_acl_state-run-a/run-a.column-acl-state-a.column_acl_state.column-acl-policy-rebuild-v1.json",
    "column_acl_state-run-b/run-b.column-acl-state-b.column_acl_state.column-acl-policy-rebuild-v1.json",
    "policy_state-run-a/run-a.policy-state-a.policy_state.column-acl-policy-rebuild-v1.json",
    "policy_state-run-b/run-b.policy-state-b.policy_state.column-acl-policy-rebuild-v1.json",
  ].map((path) =>
    parseColumnAclPolicyFileRebuildV1(
      readFileSync(join(r7Root, path), "utf8"),
    ),
  );
}

function r8Files() {
  return r8Paths.map((path) =>
    parseRpcAppendOnlyFileRebuildV1(
      readFileSync(join(r8Root, path), "utf8"),
    ),
  );
}

function aggregateInputs() {
  return {
    column_acl_policy_files: columnAclPolicyFiles(),
    rpc_append_only_files: r8Files(),
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
    terminal_files: terminalFiles(),
  };
}

function domain(
  file: ReturnType<typeof parseRpcAppendOnlyFileRebuildV1>,
  domainId: string,
) {
  return file.record.evidence.prestate.domains.find(
    (entry: SnapshotDomain) => entry.domain_id === domainId,
  )?.value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rpcEntries(
  file: ReturnType<typeof parseRpcAppendOnlyFileRebuildV1>,
  identities: readonly string[],
) {
  return (domain(file, "rpc_catalog") ?? []).filter(
    (entry: unknown) =>
      isRecord(entry) &&
      typeof entry.identity === "string" &&
      identities.includes(entry.identity),
  );
}

function appendOnlyEntry(
  file: ReturnType<typeof parseRpcAppendOnlyFileRebuildV1>,
) {
  return rpcEntries(file, [
    "action_650_reject_execution_audit_mutation()",
  ]);
}

function withoutDriftField(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([field]) => field !== "drift_field"),
  );
}

test("fresh R8 files independently read back with exact terminal policies", () => {
  const files = r8Files();
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "685ee8ac3f8d8d5c3af0b85dd53120221d8770924eb9ea149ac91cb64260e1e5",
    "be2c6f0aefde27d1b40cb58834e9f8317bc026dbc49e6ae63cc0327ffca5127d",
    "aee0417bf189d746cff5866771dd1982b7471edbaa6790842194899dfe501b4a",
    "b1f15f4e883dd3b90491612247123a5c4686000e947e27408369e253e7fd093c",
  ]);
  for (const file of files) {
    verifyRpcAppendOnlyFileRebuildV1(file);
    const evidence = file.record.evidence;
    expect(evidence.diagnostic.sqlstate).toBe("P0001");
    expect(evidence.diagnostic.reason).toBe(
      file.record.scenario_id === "rpc_catalog_body_drift"
        ? "Action 661J refuses RPC catalog/body drift: public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)"
        : "Action 661J refuses incompatible canonical append-only function",
    );
    expect(evidence.prestate.combined_digest).toBe(
      evidence.poststate.combined_digest,
    );
    expect(evidence.atomicity_decision).toBe("no_transition_verified");
    expect(evidence.runtime_identity.identity_digest).toBe(
      "b093f108b8b3de65e5f887731922eaaa15bb5bbe9a10500aa7dc047557df138a",
    );
  }
  expect(
    rpcEntries(
      files[0],
      RPC_CATALOG_BODY_DRIFT_PRECONDITION.map(
        (entry: { identity: string }) => entry.identity,
      ),
    ),
  ).toEqual(RPC_CATALOG_BODY_DRIFT_PRECONDITION);
  expect(appendOnlyEntry(files[0])).toEqual([APPEND_ONLY_BASELINE]);
  expect(appendOnlyEntry(files[2])).toEqual([
    withoutDriftField(APPEND_ONLY_PRECONDITION),
  ]);
});

test("A/B semantics and persisted writes are deterministic and collision-safe", () => {
  const files = r8Files();
  expect(files[0].record.evidence_digest).toBe(
    files[1].record.evidence_digest,
  );
  expect(files[2].record.evidence_digest).toBe(
    files[3].record.evidence_digest,
  );
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r8-"));
  const outputPath = join(directory, files[0].file_identity);
  try {
    expect(
      persistRpcAppendOnlyResultFileRebuildV1({
        file: files[0],
        output_path: outputPath,
      }).disposition,
    ).toBe("written");
    expect(
      persistRpcAppendOnlyResultFileRebuildV1({
        file: files[0],
        output_path: outputPath,
      }).disposition,
    ).toBe("existing_identical");
    writeFileSync(outputPath, "{}\n");
    expect(() =>
      persistRpcAppendOnlyResultFileRebuildV1({
        file: files[0],
        output_path: outputPath,
      }),
    ).toThrow("rebuild_v1.persistence_collision");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("exact twenty-four-shard aggregate verifies twelve deterministic pairs", () => {
  const inputs = aggregateInputs();
  const aggregate = JSON.parse(
    readFileSync(
      join(
        r8Root,
        "action-661j5r8-twenty-four-shard-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifyTwentyFourShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.aggregate_digest).toBe(
    "aa7690d24a8031f8235a12d6beaeb75e2ea38f745209b41fb0d780735b458719",
  );
  expect(aggregate.shard_count).toBe(24);
  expect(aggregate.scenario_comparisons).toHaveLength(12);
  expect(
    aggregate.scenario_comparisons.every(
      (entry: { deterministic: boolean }) => entry.deterministic,
    ),
  ).toBe(true);
  expect(
    buildTwentyFourShardAggregateRebuildV1({
      ...inputs,
      rpc_append_only_files:
        [...inputs.rpc_append_only_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  expect(() =>
    buildTwentyFourShardAggregateRebuildV1({
      ...inputs,
      rpc_append_only_files: [
        inputs.rpc_append_only_files[0],
        inputs.rpc_append_only_files[0],
        inputs.rpc_append_only_files[2],
        inputs.rpc_append_only_files[3],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runtime report binds four one-attempt runs and progress 26/28", () => {
  const report = JSON.parse(
    readFileSync(join(r8Root, "runtime-certification-report.json"), "utf8"),
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
    "rpc_catalog_body_drift",
    "rpc_catalog_body_drift",
    "incompatible_append_only_function",
    "incompatible_append_only_function",
  ]);
  for (const run of report.runs) {
    expect(run.attempt_count).toBe(1);
    expect(run.readiness_attempt_count).toBeGreaterThanOrEqual(3);
    expect(run.readiness_terminal_reason).toBe(
      "action_661j5r3a.readiness_stable",
    );
  }
  expect(report.aggregate_digest).toBe(
    "aa7690d24a8031f8235a12d6beaeb75e2ea38f745209b41fb0d780735b458719",
  );
  expect(report.fixture_progress).toBe("26/28");
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
    sha256File(
      join(
        r7Root,
        "action-661j5r7-twenty-shard-aggregate.rebuild-v1.json",
      ),
    ),
  ]).toEqual([
    "3b1713b42936193860f54f097226c73cd254f003c9b1e307f92b8a22f286a556",
    "0a354893760f4cedb42d99080dcbf2e831937494291f04068e406be12e1a4838",
    "87da33bdb0fe2c3c683895efa4cfc492ddff53f6ecbfd34569f98bf82e450655",
    "852c690b8162414b68bf5e51deb98b7e542bb548e59af935de8b009e95d6895a",
    "d78fffa6eed1899c0d50e3b7e1a0fecfbbb197d4d2d3eea97a41f35cb10ec176",
  ]);
  expect(r8Paths.map((path) => sha256File(join(r8Root, path)))).toEqual([
    "44cd4095a923ba832665e630ed3f39e5852c4bd62073b665f6ae0dc29ea3d55c",
    "54a71f7688e2d378d4403f77e222ae9d5c722ff380806c2032644259ee509932",
    "759be5f489db92f71c2508d25bae0224433ea5dc3a8f8cff658bd925d6e772ca",
    "e86634353524b76aaa1b66737fb0e0c074c0f67248ed6dadb33e3ad05837685d",
  ]);
  expect(() =>
    parseRpcAppendOnlyFileRebuildV1(
      `${readFileSync(join(r8Root, r8Paths[0]), "utf8").trim()} `,
    ),
  ).toThrow("rebuild_v1.persistence_readback_mismatch");
  expect(() => parseRpcAppendOnlyFileRebuildV1("{")).toThrow(
    "rebuild_v1.persistence_readback_mismatch:json",
  );
});
