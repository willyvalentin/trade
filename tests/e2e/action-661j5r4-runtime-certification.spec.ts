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
import { sha256 } from "../../lib/action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  buildEightShardAggregateRebuildV1,
  verifyEightShardAggregateRebuildV1,
} from "../../lib/action-661j5r4-eight-shard-aggregate-rebuild-v1.mjs";
import {
  parseRelationStateFileRebuildV1,
  persistRelationStateResultFileRebuildV1,
} from "../../lib/action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";

const root = process.cwd();
const r3aRoot = join(root, "docs/recovery/action-661j5r3a/runtime-evidence");
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");

const historicalPaths = [
  "forbidden_history-run-a/run-a.forbidden-history-a.forbidden_history.rebuild-v1.json",
  "forbidden_history-run-b/run-b.forbidden-history-b.forbidden_history.rebuild-v1.json",
  "missing_target-run-a/run-a.missing-target-a.missing_target.rebuild-v1.json",
  "missing_target-run-b/run-b.missing-target-b.missing_target.rebuild-v1.json",
] as const;
const relationPaths = [
  "non_table-run-a/run-a.non-table-a.non_table.relation-state-rebuild-v1.json",
  "non_table-run-b/run-b.non-table-b.non_table.relation-state-rebuild-v1.json",
  "wrong_owner-run-a/run-a.wrong-owner-a.wrong_owner.relation-state-rebuild-v1.json",
  "wrong_owner-run-b/run-b.wrong-owner-b.wrong_owner.relation-state-rebuild-v1.json",
] as const;

function historicalFiles() {
  return historicalPaths.map((path) =>
    parsePersistedFileRebuildV1(readFileSync(join(r3aRoot, path), "utf8")),
  );
}

function relationFiles() {
  return relationPaths.map((path) =>
    parseRelationStateFileRebuildV1(readFileSync(join(r4Root, path), "utf8")),
  );
}

test("fresh relation-state files independently read back with exact policies", () => {
  const files = relationFiles();
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "b322877ce75169727311c37edf5af48c490ff87b434419efc8585c631aaf8902",
    "2d4198afbcea5d72a8f7bb6dcf8ef14fbee95aea925aa3a32e659e57e6dfbc9d",
    "6d0513484124c0ecdb94930ac82b89141fbffa412822bcec759e6f8e24fa67bd",
    "8fb32bfece5aa85ea0126d33560634e7c2e1e7fbb9ebb42f2462b0ce95b2b44d",
  ]);
  for (const file of files) {
    const evidence = file.record.evidence;
    expect(evidence.diagnostic.sqlstate).toBe("P0001");
    expect(evidence.diagnostic.reason).toBe(
      "Action 661J unexpected target relation state for historical_candles",
    );
    expect(evidence.prestate.combined_digest).toBe(
      evidence.poststate.combined_digest,
    );
    const target = evidence.prestate.domains
      .find(
        (domain: { domain_id: string }) =>
          domain.domain_id === "target_data",
      )
      .value.find(
        (entry: { relation: string }) =>
          entry.relation === "public.historical_candles",
      );
    expect(target.relation_state).toBe(file.record.scenario_id);
    expect(target.rows).toBeNull();
    expect(
      evidence.guarded_reads.some(
        (read: { relation: string }) =>
          read.relation === "public.historical_candles",
      ),
    ).toBe(false);
  }
});

test("persisted writes are idempotent and reject an identity collision", () => {
  const file = relationFiles()[0];
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r4-"));
  const outputPath = join(directory, file.file_identity);
  try {
    expect(
      persistRelationStateResultFileRebuildV1({
        file,
        output_path: outputPath,
      }).disposition,
    ).toBe("written");
    expect(
      persistRelationStateResultFileRebuildV1({
        file,
        output_path: outputPath,
      }).disposition,
    ).toBe("existing_identical");
    writeFileSync(outputPath, "{}\n");
    expect(() =>
      persistRelationStateResultFileRebuildV1({
        file,
        output_path: outputPath,
      }),
    ).toThrow("rebuild_v1.persistence_collision");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("fresh and historical files verify as the exact eight-shard aggregate", () => {
  const inputs = {
    historical_files: historicalFiles(),
    relation_state_files: relationFiles(),
  };
  const aggregate = JSON.parse(
    readFileSync(
      join(
        r4Root,
        "action-661j5r4-eight-shard-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifyEightShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.aggregate_digest).toBe(
    "8be0ca3b8041c07447b066a5746dde652cf1f71942c9320f70c24fe30be01eb0",
  );
  expect(
    buildEightShardAggregateRebuildV1({
      historical_files: [...inputs.historical_files].reverse(),
      relation_state_files: [...inputs.relation_state_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  expect(
    aggregate.scenario_comparisons.map(
      (entry: { scenario_id: string; semantic_digest: string }) => [
        entry.scenario_id,
        entry.semantic_digest,
      ],
    ),
  ).toEqual([
    [
      "forbidden_history",
      "73ca9e88d3bb2c9c712cfe0f17f38cad6175585c8147574b1aff81f70634451a",
    ],
    [
      "missing_target",
      "a367b1f580aa2f790b8bb336e422a0dd14f357c3d95965a047c25ef85f7f608e",
    ],
    [
      "non_table",
      "dc3e0a6f09b735e024e9f3354597c19732ac50c68ac24ddecd3f68b825c77a10",
    ],
    [
      "wrong_owner",
      "427060a65bfc1dddfe082a86c38522535133f414fc8a82c1392cea7e6d5ce50a",
    ],
  ]);
});

test("runtime report binds four fresh stable receipts and one attempt each", () => {
  const report = JSON.parse(
    readFileSync(join(r4Root, "runtime-certification-report.json"), "utf8"),
  ) as {
    fixture_progress: string;
    readiness_policy_digest: string;
    runs: Array<{
      attempt_count: number;
      readiness_attempt_count: number;
      readiness_terminal_reason: string;
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
  }
  expect(report.fixture_progress).toBe("18/28");
});

test("eight-shard matrix rejects missing, extra, substituted, and relabelled inputs", () => {
  const historical = historicalFiles();
  const relation = relationFiles();
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: relation.slice(0, 3),
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch:count");
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: [...relation, relation[0]],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch:count");
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: [
        relation[0],
        relation[0],
        relation[2],
        relation[3],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch:identities");
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: [
        { ...relation[0], protocol_version: historical[0].protocol_version },
        ...relation.slice(1),
      ],
    }),
  ).toThrow("rebuild_v1.file_digest_mismatch");
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: [
        {
          ...relation[0],
          record: { ...relation[0].record, run_id: "run-b" },
        },
        ...relation.slice(1),
      ],
    }),
  ).toThrow("rebuild_v1.record_digest_mismatch");
});

test("policy, diagnostic, precondition, and recomputed aggregate tampering fail closed", () => {
  const historical = historicalFiles();
  const relation = relationFiles();
  const changedDiagnostic = {
    ...relation[0],
    record: {
      ...relation[0].record,
      evidence: {
        ...relation[0].record.evidence,
        diagnostic: {
          ...relation[0].record.evidence.diagnostic,
          reason: "Action 661J unexpected target relation state",
        },
      },
    },
  };
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: [changedDiagnostic, ...relation.slice(1)],
    }),
  ).toThrow("rebuild_v1.diagnostic_mismatch");
  const changedReference = {
    ...relation[0],
    record: {
      ...relation[0].record,
      evidence: {
        ...relation[0].record.evidence,
        precondition_reference: {
          ...relation[0].record.evidence.precondition_reference,
          relation_state: "wrong_owner",
        },
      },
    },
  };
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historical,
      relation_state_files: [changedReference, ...relation.slice(1)],
    }),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
  const inputs = {
    historical_files: historical,
    relation_state_files: relation,
  };
  const aggregate = buildEightShardAggregateRebuildV1(inputs);
  const changedProjection = {
    ...aggregate,
    scenario_comparisons: aggregate.scenario_comparisons.map(
      (entry: {
        scenario_id: string;
        semantic_digest: string;
      }) =>
      entry.scenario_id === "non_table"
        ? {
            ...entry,
            semantic_digest:
              "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          }
        : entry,
    ),
  };
  const recomputed = {
    ...changedProjection,
    aggregate_digest: sha256(
      Object.fromEntries(
        Object.entries(changedProjection).filter(
          ([key]) => key !== "aggregate_digest",
        ),
      ),
    ),
  };
  expect(() => verifyEightShardAggregateRebuildV1(recomputed, inputs)).toThrow(
    "rebuild_v1.aggregate_digest_mismatch",
  );
});
