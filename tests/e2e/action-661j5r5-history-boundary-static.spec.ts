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
import {
  ACTION_650_HISTORY_IDENTITY,
  BASELINE_HISTORY_INVENTORY,
  HISTORY_POLICY_REGISTRY,
  HISTORY_POLICY_REGISTRY_DIGEST,
  HISTORY_RUNTIME_REGISTRY_DIGEST,
  INCIDENT_HISTORY_VERSIONS,
  buildHistoryPreconditionReference,
  expectedHistoryInventoryForScenario,
  verifyHistoryPreconditionReference,
} from "../../lib/action-661j5r5-history-boundary-contracts-rebuild-v1.mjs";
import {
  buildHistoryResultChainRebuildV1,
  verifyHistoryAtomicEvidenceRebuildV1,
  verifyHistoryFileRebuildV1,
} from "../../lib/action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";
import {
  HISTORY_RUNNER_MODULE_SHA256,
  buildHistoryRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r5-history-boundary-runner-authority-rebuild-v1.mjs";
import { runHistoryScenarioRebuildV1 } from "../../lib/action-661j5r5-history-boundary-runtime-runner-rebuild-v1.mjs";
import {
  buildTwelveShardAggregateRebuildV1,
  verifyTwelveShardAggregateRebuildV1,
} from "../../lib/action-661j5r5-twelve-shard-aggregate-rebuild-v1.mjs";
import { ACTION_661J5R2_LITERAL_FIXTURE } from "./action-661j5r2-runtime-literal-fixture.mjs";
import { ACTION_661J5R5_HISTORY_LITERAL_FIXTURES } from "./action-661j5r5-history-boundary-literal-fixtures.mjs";

type ScenarioId =
  | "missing_action_650_history"
  | "incident_history_present";

interface HistoryEntry {
  name: string;
  statement_count: number;
  version: string;
}

interface SnapshotDomain {
  domain_digest: string;
  domain_id: string;
  domain_version: string;
  value: unknown;
}

const root = process.cwd();
const r3aRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");

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

function snapshotInputFor(scenarioId: ScenarioId) {
  const input = structuredClone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  input.domains.migration_history =
    expectedHistoryInventoryForScenario(scenarioId);
  return input;
}

function captureFor(
  scenarioId: ScenarioId,
  historyOverride?: readonly HistoryEntry[],
) {
  const input = snapshotInputFor(scenarioId);
  if (historyOverride) {
    input.domains.migration_history = structuredClone(historyOverride);
  }
  const prestate = buildSnapshotV2Rebuild(input);
  const poststate = buildSnapshotV2Rebuild(structuredClone(input));
  const policy = HISTORY_POLICY_REGISTRY.scenarios[scenarioId];
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
      "action_661j5r5_history_boundary_diagnostic_sidecar_rebuild_v1",
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
    [
      "missing_action_650_history",
      "incident_history_present",
    ] as const
  ).flatMap((scenarioId) =>
    (["run-a", "run-b"] as const).map((runId) =>
      buildHistoryResultChainRebuildV1({
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

test("zero-import literals bind the exact ordered migration-history policies", () => {
  const fixturePath = join(
    root,
    "tests/e2e/action-661j5r5-history-boundary-literal-fixtures.mjs",
  );
  expect(readFileSync(fixturePath, "utf8")).not.toMatch(
    /\b(?:import|require\s*\()/,
  );
  expect(Object.isFrozen(ACTION_661J5R5_HISTORY_LITERAL_FIXTURES)).toBe(true);
  expect(
    ACTION_661J5R5_HISTORY_LITERAL_FIXTURES.baseline_history_inventory,
  ).toEqual(BASELINE_HISTORY_INVENTORY);
  expect(ACTION_650_HISTORY_IDENTITY).toEqual({
    name: "contain_production_trading_data_access",
    statement_count: 6,
    version: "20260724002000",
  });
  expect(INCIDENT_HISTORY_VERSIONS).toEqual([
    "20260724003000",
    "20260726000000",
  ]);
  for (const scenarioId of [
    "missing_action_650_history",
    "incident_history_present",
  ] as const) {
    const literal =
      ACTION_661J5R5_HISTORY_LITERAL_FIXTURES.scenarios[scenarioId];
    const reference = buildHistoryPreconditionReference(scenarioId);
    expect(literal.expected_history_inventory).toEqual(
      expectedHistoryInventoryForScenario(scenarioId),
    );
    expect(literal.expected_history_inventory_digest).toBe(
      HISTORY_POLICY_REGISTRY.scenarios[scenarioId]
        .expected_history_inventory_digest,
    );
    expect(literal.precondition_reference_digest).toBe(
      reference.precondition_reference_digest,
    );
  }
});

test("history evidence, record, shard, and file are deterministic", () => {
  const first = chains();
  expect(canonicalJson(first)).toBe(canonicalJson(chains()));
  for (const chain of first) {
    verifyHistoryAtomicEvidenceRebuildV1(chain.evidence);
    verifyHistoryFileRebuildV1(chain.file);
    const history = chain.evidence.prestate.domains.find(
      (domain: SnapshotDomain) => domain.domain_id === "migration_history",
    )?.value;
    expect(history).toEqual(
      expectedHistoryInventoryForScenario(chain.record.scenario_id),
    );
    expect(chain.evidence.prestate.combined_digest).toBe(
      chain.evidence.poststate.combined_digest,
    );
  }
  expect(HISTORY_POLICY_REGISTRY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
  expect(HISTORY_RUNTIME_REGISTRY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
});

test("exact history matrix rejects name, count, row, version, and reference drift", () => {
  const missing = expectedHistoryInventoryForScenario(
    "missing_action_650_history",
  );
  const incident = expectedHistoryInventoryForScenario(
    "incident_history_present",
  );
  const wrongName = incident.map((entry: HistoryEntry) =>
    entry.version === ACTION_650_HISTORY_IDENTITY.version
      ? { ...entry, name: "wrong_name" }
      : entry,
  );
  const wrongCount = incident.map((entry: HistoryEntry) =>
    entry.version === ACTION_650_HISTORY_IDENTITY.version
      ? { ...entry, statement_count: 5 }
      : entry,
  );
  const extraRow = [
    ...missing,
    { name: "unexpected", statement_count: 1, version: "20260724001999" },
  ];
  const duplicateAlternative = incident.map((entry: HistoryEntry) =>
    entry.version === "20260724003000"
      ? { ...entry, version: "20260726000000" }
      : entry,
  );
  for (const changed of [
    wrongName,
    wrongCount,
    extraRow,
    duplicateAlternative,
  ]) {
    expect(() =>
      buildHistoryResultChainRebuildV1({
        capture: captureFor("incident_history_present", changed),
        run_id: "run-a",
        scenario_id: "incident_history_present",
        shard_id: "incident-history-present-a",
      }),
    ).toThrow("rebuild_v1.precondition_reference_mismatch:history_inventory");
  }
  expect(() =>
    verifyHistoryPreconditionReference(
      buildHistoryPreconditionReference("missing_action_650_history"),
      "incident_history_present",
    ),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
  expect(() =>
    verifyHistoryPreconditionReference(
      {
        ...buildHistoryPreconditionReference("incident_history_present"),
        selected_incident_history: {
          name: "action_661j5r5_incident_fixture",
          statement_count: 1,
          version: "20260726000000",
        },
      },
      "incident_history_present",
    ),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
});

test("runner authority pins exact history-boundary module and capability bytes", () => {
  const runnerPath = join(
    root,
    "lib/action-661j5r5-history-boundary-runtime-runner-rebuild-v1.mjs",
  );
  expect(
    createHash("sha256").update(readFileSync(runnerPath)).digest("hex"),
  ).toBe(HISTORY_RUNNER_MODULE_SHA256);
  const receipt = buildHistoryRunnerIdentityReceiptRebuildV1();
  expect(receipt.runner_version).toBe(
    "action_661j5r5_history_boundary_runtime_runner_rebuild_v1",
  );
  expect(receipt.capability_matrix).toEqual({
    incident_history_present:
      "action_661j5r5_history_boundary_result_protocol_rebuild_v1",
    missing_action_650_history:
      "action_661j5r5_history_boundary_result_protocol_rebuild_v1",
  });
});

test("runner persists diagnostic before policy rejection and emits no result", async () => {
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r5-boundary-"));
  const outputPath = join(
    directory,
    "run-a.missing-action-650-history-a.missing_action_650_history.history-boundary-rebuild-v1.json",
  );
  let diagnosticPersisted = false;
  const capture = captureFor("missing_action_650_history");
  const changedDiagnosticProjection = {
    ...capture.diagnostic,
    reason: "wrong terminal reason",
  };
  const changedDiagnostic = {
    ...changedDiagnosticProjection,
    diagnostic_digest: sha256(
      Object.fromEntries(
        Object.entries(changedDiagnosticProjection).filter(
          ([field]) => field !== "diagnostic_digest",
        ),
      ),
    ),
  };
  try {
    await expect(
      runHistoryScenarioRebuildV1({
        output_path: outputPath,
        persist_diagnostic: async () => {
          diagnosticPersisted = true;
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
        scenario_id: "missing_action_650_history",
        shard_id: "missing-action-650-history-a",
      }),
    ).rejects.toThrow("rebuild_v1.diagnostic_mismatch");
    expect(diagnosticPersisted).toBe(true);
    expect(existsSync(outputPath)).toBe(false);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("twelve-shard aggregate is exact and deterministic under input reversal", () => {
  const inputs = {
    historical_files: historicalFiles(),
    history_files: chains().map((chain) => chain.file),
    relation_state_files: relationStateFiles(),
  };
  const aggregate = buildTwelveShardAggregateRebuildV1(inputs);
  expect(aggregate.shard_count).toBe(12);
  expect(aggregate.scenario_comparisons).toHaveLength(6);
  expect(
    buildTwelveShardAggregateRebuildV1({
      historical_files: [...inputs.historical_files].reverse(),
      history_files: [...inputs.history_files].reverse(),
      relation_state_files: [...inputs.relation_state_files].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  verifyTwelveShardAggregateRebuildV1(aggregate, inputs);
  expect(() =>
    buildTwelveShardAggregateRebuildV1({
      ...inputs,
      history_files: [
        inputs.history_files[0],
        inputs.history_files[0],
        inputs.history_files[2],
        inputs.history_files[3],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runtime script fixes four no-retry runs behind stable readiness", () => {
  const source = readFileSync(
    join(
      root,
      "scripts/action-661j5r5-history-boundary-runtime-certify-rebuild-v1.mjs",
    ),
    "utf8",
  );
  expect(source.match(/scenario_id: "missing_action_650_history"/g)).toHaveLength(
    2,
  );
  expect(source.match(/scenario_id: "incident_history_present"/g)).toHaveLength(
    2,
  );
  expect(source).toContain("waitForStablePostgresReadiness");
  expect(source).toContain('"pg_isready"');
  expect(source).toContain('"select 1"');
  expect(source).toContain("runtime_attempt_retried");
  expect(source).toContain("persist_diagnostic");
  expect(source).toContain("buildTwelveShardAggregateRebuildV1");
  const runOne = source.slice(source.indexOf("async function runOne"));
  expect(runOne.indexOf("persist_diagnostic")).toBeLessThan(
    runOne.indexOf("buildTwelveShardAggregateRebuildV1"),
  );
  expect(runOne.indexOf("waitReady(container, runDirectory)")).toBeLessThan(
    runOne.indexOf("captureRuntimeIdentity(container, inspectedImage)"),
  );
});

test("authority projections are stable across UTC and non-UTC subprocesses", () => {
  const source = `
    const contracts = await import("./lib/action-661j5r5-history-boundary-contracts-rebuild-v1.mjs");
    const authority = await import("./lib/action-661j5r5-history-boundary-runner-authority-rebuild-v1.mjs");
    process.stdout.write(JSON.stringify({
      policy: contracts.HISTORY_POLICY_REGISTRY_DIGEST,
      registry: contracts.HISTORY_RUNTIME_REGISTRY_DIGEST,
      missing: contracts.buildHistoryPreconditionReference("missing_action_650_history").precondition_reference_digest,
      incident: contracts.buildHistoryPreconditionReference("incident_history_present").precondition_reference_digest,
      runner: authority.buildHistoryRunnerIdentityReceiptRebuildV1().runner_identity_digest
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
