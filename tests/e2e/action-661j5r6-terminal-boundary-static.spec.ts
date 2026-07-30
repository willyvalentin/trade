import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildRuntimeIdentity,
  buildSnapshotV2Rebuild,
  canonicalJson,
  sha256,
} from "../../lib/action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import { parsePersistedFileRebuildV1 } from "../../lib/action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import { parseRelationStateFileRebuildV1 } from "../../lib/action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";
import { parseHistoryFileRebuildV1 } from "../../lib/action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";
import {
  ACL_STATE_VARIANTS,
  DUPLICATE_CONTAINMENT_HISTORY,
  TERMINAL_POLICY_REGISTRY,
  TERMINAL_POLICY_REGISTRY_DIGEST,
  TERMINAL_RUNTIME_REGISTRY_DIGEST,
  UNKNOWN_TABLE_ACL,
  buildTerminalPreconditionReference,
  expectedTerminalHistoryInventory,
  verifyTerminalPreconditionReference,
} from "../../lib/action-661j5r6-terminal-boundary-contracts-rebuild-v1.mjs";
import {
  buildTerminalResultChainRebuildV1,
  verifyTerminalAtomicEvidenceRebuildV1,
  verifyTerminalFileRebuildV1,
} from "../../lib/action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";
import {
  TERMINAL_RUNNER_MODULE_SHA256,
  buildTerminalRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r6-terminal-boundary-runner-authority-rebuild-v1.mjs";
import { runTerminalScenarioRebuildV1 } from "../../lib/action-661j5r6-terminal-boundary-runtime-runner-rebuild-v1.mjs";
import {
  buildSixteenShardAggregateRebuildV1,
  verifySixteenShardAggregateRebuildV1,
} from "../../lib/action-661j5r6-sixteen-shard-aggregate-rebuild-v1.mjs";
import { ACTION_661J5R2_LITERAL_FIXTURE } from "./action-661j5r2-runtime-literal-fixture.mjs";
import { ACTION_661J5R6_TERMINAL_LITERAL_FIXTURES } from "./action-661j5r6-terminal-boundary-literal-fixtures.mjs";

type ScenarioId = "duplicate_containment_history" | "unknown_acl_state";

interface HistoryEntry {
  name: string;
  statement_count: number;
  version: string;
}

const root = process.cwd();
const r3aRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");
const r5Root = join(root, "docs/recovery/action-661j5r5/runtime-evidence");

function runtimeIdentity() {
  return buildRuntimeIdentity({
    architecture: "arm64",
    collector_sha256:
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    collector_version:
      "action_661j5r3_postgres_runtime_collector_rebuild_v1",
    engine: "postgresql",
    image_digest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    image_repository: "postgres",
    image_tag: "16-alpine",
    platform: "linux",
    server_major: 16,
    server_version: "16.9",
  });
}

function snapshotInputFor(
  scenarioId: ScenarioId,
  overrides: {
    columnAcl?: readonly unknown[];
    history?: readonly HistoryEntry[];
    tableAcl?: readonly unknown[];
  } = {},
) {
  const input = structuredClone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  input.domains.migration_history = structuredClone(
    overrides.history ?? expectedTerminalHistoryInventory(scenarioId),
  );
  input.domains.table_acl = structuredClone(
    overrides.tableAcl ??
      (scenarioId === "unknown_acl_state" ? [UNKNOWN_TABLE_ACL] : []),
  );
  input.domains.column_acl = structuredClone(overrides.columnAcl ?? []);
  return input;
}

function captureFor(
  scenarioId: ScenarioId,
  overrides?: Parameters<typeof snapshotInputFor>[1],
) {
  const input = snapshotInputFor(scenarioId, overrides);
  const prestate = buildSnapshotV2Rebuild(input);
  const poststate = buildSnapshotV2Rebuild(structuredClone(input));
  const policy = TERMINAL_POLICY_REGISTRY.scenarios[scenarioId];
  const diagnosticProjection = {
    classification: policy.classification,
    diagnostic_sanitized: true,
    migration_applied: false,
    reason: policy.terminal_reason,
    safety: {
      connection_string_present: false,
      credential_material_present: false,
      query_text_present: false,
      raw_error_object_present: false,
      stack_trace_present: false,
    },
    scenario_id: scenarioId,
    sidecar_version:
      "action_661j5r6_terminal_boundary_diagnostic_sidecar_rebuild_v1",
    sqlstate: policy.terminal_sqlstate,
    terminal_state: "controlled_error",
  };
  const diagnostic = Object.freeze({
    ...diagnosticProjection,
    diagnostic_digest: sha256(diagnosticProjection),
  });
  const identity = runtimeIdentity();
  const guardedReads = input.guarded_data_reads;
  return Object.freeze({
    diagnostic,
    guarded_reads: guardedReads,
    poststate,
    prestate,
    runtime_capture_digest: sha256({
      diagnostic_digest: diagnostic.diagnostic_digest,
      guarded_reads: [...guardedReads].sort((left, right) =>
        left.relation.localeCompare(right.relation),
      ),
      poststate_combined_digest: poststate.combined_digest,
      prestate_combined_digest: prestate.combined_digest,
      runtime_identity_digest: identity.identity_digest,
    }),
    runtime_identity: identity,
  });
}

function chains() {
  return (
    ["duplicate_containment_history", "unknown_acl_state"] as const
  ).flatMap((scenarioId) =>
    (["run-a", "run-b"] as const).map((runId) =>
      buildTerminalResultChainRebuildV1({
        capture: captureFor(scenarioId),
        run_id: runId,
        scenario_id: scenarioId,
        shard_id: `${scenarioId.replaceAll("_", "-")}-${runId.slice(-1)}`,
      }),
    ),
  );
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

function expectCaptureRejected(
  scenarioId: ScenarioId,
  overrides: Parameters<typeof snapshotInputFor>[1],
) {
  expect(() =>
    buildTerminalResultChainRebuildV1({
      capture: captureFor(scenarioId, overrides),
      run_id: "run-a",
      scenario_id: scenarioId,
      shard_id: `${scenarioId.replaceAll("_", "-")}-a`,
    }),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
}

test("zero-import literals bind duplicate history and exact unknown table ACL", () => {
  const fixturePath = join(
    root,
    "tests/e2e/action-661j5r6-terminal-boundary-literal-fixtures.mjs",
  );
  expect(readFileSync(fixturePath, "utf8")).not.toMatch(
    /\b(?:import|require\s*\()/,
  );
  expect(Object.isFrozen(ACTION_661J5R6_TERMINAL_LITERAL_FIXTURES)).toBe(true);
  expect(ACL_STATE_VARIANTS).toEqual(["unknown_table_acl", "column_acl"]);
  expect(
    ACTION_661J5R6_TERMINAL_LITERAL_FIXTURES.scenarios
      .duplicate_containment_history.selected_history,
  ).toEqual(DUPLICATE_CONTAINMENT_HISTORY);
  expect(
    ACTION_661J5R6_TERMINAL_LITERAL_FIXTURES.scenarios.unknown_acl_state
      .expected_target_acl,
  ).toEqual(UNKNOWN_TABLE_ACL);
  for (const scenarioId of [
    "duplicate_containment_history",
    "unknown_acl_state",
  ] as const) {
    const literal =
      ACTION_661J5R6_TERMINAL_LITERAL_FIXTURES.scenarios[scenarioId];
    const policy = TERMINAL_POLICY_REGISTRY.scenarios[scenarioId];
    expect(literal.expected_history_inventory).toEqual(
      expectedTerminalHistoryInventory(scenarioId),
    );
    expect(literal.expected_history_inventory_digest).toBe(
      policy.expected_history_inventory_digest,
    );
    expect(literal.precondition_reference_digest).toBe(
      buildTerminalPreconditionReference(scenarioId)
        .precondition_reference_digest,
    );
  }
});

test("terminal evidence, record, shard, and file verify deterministically", () => {
  const first = chains();
  expect(canonicalJson(first)).toBe(canonicalJson(chains()));
  for (const chain of first) {
    verifyTerminalAtomicEvidenceRebuildV1(chain.evidence);
    verifyTerminalFileRebuildV1(chain.file);
    expect(chain.evidence.prestate.combined_digest).toBe(
      chain.evidence.poststate.combined_digest,
    );
  }
  expect(TERMINAL_POLICY_REGISTRY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
  expect(TERMINAL_RUNTIME_REGISTRY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
});

test("exact policy matrix rejects history, ACL, relation, and carrier substitution", () => {
  const duplicate = expectedTerminalHistoryInventory(
    "duplicate_containment_history",
  );
  expectCaptureRejected("duplicate_containment_history", {
    history: duplicate.map((entry: HistoryEntry) =>
      entry.version === "20260726000000"
        ? { ...entry, version: "20260724003000" }
        : entry,
    ),
  });
  expectCaptureRejected("duplicate_containment_history", {
    history: duplicate.map((entry: HistoryEntry) =>
      entry.version === "20260726000000"
        ? { ...entry, name: "wrong_name" }
        : entry,
    ),
  });
  for (const changed of [
    { ...UNKNOWN_TABLE_ACL, grantee: "authenticated" },
    { ...UNKNOWN_TABLE_ACL, privilege: "UPDATE" },
    { ...UNKNOWN_TABLE_ACL, grantor: "fixture_owner" },
    { ...UNKNOWN_TABLE_ACL, grantable: true },
    { ...UNKNOWN_TABLE_ACL, relation: "public.historical_candle_symbols" },
  ]) {
    expectCaptureRejected("unknown_acl_state", { tableAcl: [changed] });
  }
  expectCaptureRejected("unknown_acl_state", {
    columnAcl: [
      {
        column: "id",
        grantable: false,
        grantee: "action_661j5_unknown_acl",
        privilege: "SELECT",
        relation: "public.historical_candles",
      },
    ],
    tableAcl: [],
  });
  expect(() =>
    verifyTerminalPreconditionReference(
      buildTerminalPreconditionReference("unknown_acl_state"),
      "duplicate_containment_history",
    ),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
  expect(() =>
    buildTerminalResultChainRebuildV1({
      capture: captureFor("unknown_acl_state"),
      run_id: "run-a",
      scenario_id: "duplicate_containment_history",
      shard_id: "duplicate-containment-history-a",
    }),
  ).toThrow("rebuild_v1.diagnostic_mismatch");
});

test("runner authority binds exact bytes and closed capability matrix", () => {
  const runnerPath = join(
    root,
    "lib/action-661j5r6-terminal-boundary-runtime-runner-rebuild-v1.mjs",
  );
  expect(
    createHash("sha256").update(readFileSync(runnerPath)).digest("hex"),
  ).toBe(TERMINAL_RUNNER_MODULE_SHA256);
  expect(buildTerminalRunnerIdentityReceiptRebuildV1().capability_matrix)
    .toEqual({
      duplicate_containment_history:
        "action_661j5r6_terminal_boundary_result_protocol_rebuild_v1",
      unknown_acl_state:
        "action_661j5r6_terminal_boundary_result_protocol_rebuild_v1",
    });
});

test("runner persists diagnostic before policy rejection and emits no result", async () => {
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r6-boundary-"));
  const outputPath = join(
    directory,
    "run-a.unknown-acl-state-a.unknown_acl_state.terminal-boundary-rebuild-v1.json",
  );
  const capture = captureFor("unknown_acl_state");
  const changedProjection = {
    ...capture.diagnostic,
    reason: "wrong terminal reason",
  };
  const changedDiagnostic = {
    ...changedProjection,
    diagnostic_digest: sha256(
      Object.fromEntries(
        Object.entries(changedProjection).filter(
          ([field]) => field !== "diagnostic_digest",
        ),
      ),
    ),
  };
  let persisted = false;
  try {
    await expect(
      runTerminalScenarioRebuildV1({
        output_path: outputPath,
        persist_diagnostic: async () => {
          persisted = true;
        },
        run_id: "run-a",
        runtime_attempt: async () => ({
          ...capture,
          diagnostic: changedDiagnostic,
          runtime_capture_digest: sha256({
            diagnostic_digest: changedDiagnostic.diagnostic_digest,
            guarded_reads: capture.guarded_reads,
            poststate_combined_digest: capture.poststate.combined_digest,
            prestate_combined_digest: capture.prestate.combined_digest,
            runtime_identity_digest: capture.runtime_identity.identity_digest,
          }),
        }),
        scenario_id: "unknown_acl_state",
        shard_id: "unknown-acl-state-a",
      }),
    ).rejects.toThrow("rebuild_v1.diagnostic_mismatch");
    expect(persisted).toBe(true);
    expect(existsSync(outputPath)).toBe(false);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("sixteen-shard aggregate is exact and order deterministic", () => {
  const inputs = {
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
    terminal_files: chains().map((chain) => chain.file),
  };
  const aggregate = buildSixteenShardAggregateRebuildV1(inputs);
  expect(aggregate.shard_count).toBe(16);
  expect(aggregate.scenario_comparisons).toHaveLength(8);
  expect(
    buildSixteenShardAggregateRebuildV1({
      historical_files: [...inputs.historical_files].reverse(),
      history_files: [...inputs.history_files].reverse(),
      relation_state_files: [...inputs.relation_state_files].reverse(),
      terminal_files: [...inputs.terminal_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  verifySixteenShardAggregateRebuildV1(aggregate, inputs);
  expect(() =>
    buildSixteenShardAggregateRebuildV1({
      ...inputs,
      terminal_files: [
        inputs.terminal_files[0],
        inputs.terminal_files[0],
        inputs.terminal_files[2],
        inputs.terminal_files[3],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runtime script fixes four no-retry runs and diagnostic-first policy", () => {
  const source = readFileSync(
    join(
      root,
      "scripts/action-661j5r6-terminal-boundary-runtime-certify-rebuild-v1.mjs",
    ),
    "utf8",
  );
  expect(source.match(/scenario_id: "duplicate_containment_history"/g))
    .toHaveLength(2);
  expect(source.match(/scenario_id: "unknown_acl_state"/g)).toHaveLength(2);
  expect(source).toContain("waitForStablePostgresReadiness");
  expect(source).toContain("runtime_attempt_retried");
  expect(source).toContain("persist_diagnostic");
  expect(source).toContain("buildSixteenShardAggregateRebuildV1");
  const runOne = source.slice(source.indexOf("async function runOne"));
  expect(runOne.indexOf("persist_diagnostic")).toBeLessThan(
    runOne.indexOf("buildSixteenShardAggregateRebuildV1"),
  );
  expect(runOne.indexOf("waitReady(container, runDirectory)")).toBeLessThan(
    runOne.indexOf("captureRuntimeIdentity(container, inspectedImage)"),
  );
});

test("authority projections are stable across process timezones", () => {
  const source = `
    const contracts = await import("./lib/action-661j5r6-terminal-boundary-contracts-rebuild-v1.mjs");
    const authority = await import("./lib/action-661j5r6-terminal-boundary-runner-authority-rebuild-v1.mjs");
    process.stdout.write(JSON.stringify({
      policy: contracts.TERMINAL_POLICY_REGISTRY_DIGEST,
      registry: contracts.TERMINAL_RUNTIME_REGISTRY_DIGEST,
      duplicate: contracts.buildTerminalPreconditionReference("duplicate_containment_history").precondition_reference_digest,
      acl: contracts.buildTerminalPreconditionReference("unknown_acl_state").precondition_reference_digest,
      runner: authority.buildTerminalRunnerIdentityReceiptRebuildV1().runner_identity_digest
    }));
  `;
  const outputs = ["UTC", "UTC", "Europe/Stockholm", "America/New_York"].map(
    (timezone) => {
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", source],
        {
          cwd: root,
          encoding: "utf8",
          env: {
            NODE_ENV: "test",
            PATH: process.env.PATH ?? "",
            TZ: timezone,
          },
        },
      );
      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");
      return result.stdout;
    },
  );
  expect(new Set(outputs).size).toBe(1);
});
