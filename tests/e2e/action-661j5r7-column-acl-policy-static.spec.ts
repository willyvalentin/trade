import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
import { parseTerminalFileRebuildV1 } from "../../lib/action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";
import {
  COLUMN_ACL_POLICY_POLICY_REGISTRY,
  COLUMN_ACL_POLICY_POLICY_REGISTRY_DIGEST,
  COLUMN_ACL_POLICY_RUNTIME_REGISTRY_DIGEST,
  COLUMN_ACL_PRECONDITION,
  POLICY_PRECONDITION,
  buildColumnAclPolicyPreconditionReference,
  expectedColumnAclPolicyHistoryInventory,
  verifyColumnAclPolicyPreconditionReference,
} from "../../lib/action-661j5r7-column-acl-policy-contracts-rebuild-v1.mjs";
import {
  buildColumnAclPolicyResultChainRebuildV1,
  verifyColumnAclPolicyFileRebuildV1,
} from "../../lib/action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";
import {
  COLUMN_ACL_POLICY_RUNNER_MODULE_SHA256,
  buildColumnAclPolicyRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r7-column-acl-policy-runner-authority-rebuild-v1.mjs";
import { runColumnAclPolicyScenarioRebuildV1 } from "../../lib/action-661j5r7-column-acl-policy-runtime-runner-rebuild-v1.mjs";
import {
  buildTwentyShardAggregateRebuildV1,
  verifyTwentyShardAggregateRebuildV1,
} from "../../lib/action-661j5r7-twenty-shard-aggregate-rebuild-v1.mjs";
import { ACTION_661J5R2_LITERAL_FIXTURE } from "./action-661j5r2-runtime-literal-fixture.mjs";
import { ACTION_661J5R7_COLUMN_ACL_POLICY_LITERAL_FIXTURES } from "./action-661j5r7-column-acl-policy-literal-fixtures.mjs";

type ScenarioId = "column_acl_state" | "policy_state";

interface SnapshotOverrides {
  columnAcl?: readonly unknown[];
  policies?: readonly unknown[];
  tableAcl?: readonly unknown[];
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
      "b53e7eb4765d88852de187b6558c0b4cf5a94f6959a2273004ebb1cba9a5c34e",
    collector_version:
      "action_661j5r7_postgres_runtime_collector_rebuild_v2",
    engine: "postgresql",
    image_digest:
      "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    image_repository: "postgres",
    image_tag: "16-alpine",
    platform: "linux",
    server_major: 16,
    server_version: "16.14",
  });
}

function snapshotInputFor(
  scenarioId: ScenarioId,
  overrides: SnapshotOverrides = {},
) {
  const input = structuredClone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  input.domains.migration_history = structuredClone(
    expectedColumnAclPolicyHistoryInventory(scenarioId),
  );
  input.domains.table_acl = structuredClone(overrides.tableAcl ?? []);
  input.domains.column_acl = structuredClone(
    overrides.columnAcl ??
      (scenarioId === "column_acl_state" ? [COLUMN_ACL_PRECONDITION] : []),
  );
  input.domains.rls_policies = structuredClone(
    overrides.policies ??
      (scenarioId === "policy_state" ? [POLICY_PRECONDITION] : []),
  );
  return input;
}

function captureFor(
  scenarioId: ScenarioId,
  overrides: SnapshotOverrides = {},
) {
  const input = snapshotInputFor(scenarioId, overrides);
  const prestate = buildSnapshotV2Rebuild(input);
  const poststate = buildSnapshotV2Rebuild(structuredClone(input));
  const policy = COLUMN_ACL_POLICY_POLICY_REGISTRY.scenarios[scenarioId];
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
      "action_661j5r7_column_acl_policy_diagnostic_sidecar_rebuild_v1",
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

function chain(scenarioId: ScenarioId, runId: "run-a" | "run-b") {
  return buildColumnAclPolicyResultChainRebuildV1({
    capture: captureFor(scenarioId),
    run_id: runId,
    scenario_id: scenarioId,
    shard_id: `${scenarioId.replaceAll("_", "-")}-${runId.slice(-1)}`,
  });
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

function expectCaptureRejected(
  scenarioId: ScenarioId,
  overrides: SnapshotOverrides,
) {
  expect(() =>
    buildColumnAclPolicyResultChainRebuildV1({
      capture: captureFor(scenarioId, overrides),
      run_id: "run-a",
      scenario_id: scenarioId,
      shard_id: `${scenarioId.replaceAll("_", "-")}-a`,
    }),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
}

test("zero-import literals pin exact column ACL and policy authorities", () => {
  const source = readFileSync(
    join(
      root,
      "tests/e2e/action-661j5r7-column-acl-policy-literal-fixtures.mjs",
    ),
    "utf8",
  );
  expect(source).not.toMatch(/\bimport\b|\brequire\s*\(/);
  const literals = ACTION_661J5R7_COLUMN_ACL_POLICY_LITERAL_FIXTURES;
  expect(literals.scenarios.column_acl_state.expected_column_acl).toEqual(
    COLUMN_ACL_PRECONDITION,
  );
  expect(literals.scenarios.policy_state.expected_policy).toEqual(
    POLICY_PRECONDITION,
  );
  for (const scenarioId of ["column_acl_state", "policy_state"] as const) {
    const reference = buildColumnAclPolicyPreconditionReference(scenarioId);
    verifyColumnAclPolicyPreconditionReference(reference, scenarioId);
    expect(
      literals.scenarios[scenarioId].precondition_reference_digest,
    ).toBe(reference.precondition_reference_digest);
  }
  expect(Object.isFrozen(literals)).toBe(true);
});

test("evidence signs full ACL and policy domains", () => {
  for (const scenarioId of ["column_acl_state", "policy_state"] as const) {
    const result = chain(scenarioId, "run-a");
    verifyColumnAclPolicyFileRebuildV1(result.file);
    expect(result.evidence.prestate).toEqual(result.evidence.poststate);
    expect(result.evidence.policy_registry_digest).toBe(
      COLUMN_ACL_POLICY_POLICY_REGISTRY_DIGEST,
    );
    expect(result.evidence.runtime_registry_digest).toBe(
      COLUMN_ACL_POLICY_RUNTIME_REGISTRY_DIGEST,
    );
  }
  const ownerAclRows = [
    {
      ...COLUMN_ACL_PRECONDITION,
      grantee: "postgres",
      privilege: "SELECT",
    },
    {
      ...COLUMN_ACL_PRECONDITION,
      grantee: "postgres",
      privilege: "UPDATE",
    },
  ];
  const capture = captureFor("column_acl_state", {
    columnAcl: [...ownerAclRows, COLUMN_ACL_PRECONDITION],
  });
  const reversed = captureFor("column_acl_state", {
    columnAcl: [...ownerAclRows].reverse().concat(COLUMN_ACL_PRECONDITION),
  });
  const left = buildColumnAclPolicyResultChainRebuildV1({
    capture,
    run_id: "run-a",
    scenario_id: "column_acl_state",
    shard_id: "column-acl-state-a",
  });
  const right = buildColumnAclPolicyResultChainRebuildV1({
    capture: reversed,
    run_id: "run-b",
    scenario_id: "column_acl_state",
    shard_id: "column-acl-state-b",
  });
  expect(left.evidence.evidence_digest).not.toBe(right.evidence.evidence_digest);
});

test("closed offending subsets reject ACL and policy drift", () => {
  for (const field of [
    ["attnum", 4],
    ["column", "provider"],
    ["grantable", true],
    ["grantee", "other_role"],
    ["grantor", "other_grantor"],
    ["privilege", "UPDATE"],
    ["relation", "public.historical_candle_fetch_runs"],
  ] as const) {
    expectCaptureRejected("column_acl_state", {
      columnAcl: [{ ...COLUMN_ACL_PRECONDITION, [field[0]]: field[1] }],
    });
  }
  expectCaptureRejected("column_acl_state", {
    columnAcl: [COLUMN_ACL_PRECONDITION, COLUMN_ACL_PRECONDITION],
  });
  expectCaptureRejected("column_acl_state", {
    columnAcl: [{ ...COLUMN_ACL_PRECONDITION, dropped: true }],
  });
  expectCaptureRejected("column_acl_state", {
    tableAcl: [{
      grantable: false,
      grantee: "action_661j5_column_acl",
      grantor: "postgres",
      privilege: "SELECT",
      relation: "public.historical_candles",
    }],
  });
  for (const changed of [
    { ...POLICY_PRECONDITION, command: "UPDATE" },
    { ...POLICY_PRECONDITION, roles: ["other_role"] },
    { ...POLICY_PRECONDITION, permissive: "RESTRICTIVE" },
    { ...POLICY_PRECONDITION, using: "false" },
    { ...POLICY_PRECONDITION, with_check: "true" },
    { ...POLICY_PRECONDITION, name: "other_policy" },
    { ...POLICY_PRECONDITION, table: "historical_candle_fetch_runs" },
  ]) {
    expectCaptureRejected("policy_state", { policies: [changed] });
  }
  expectCaptureRejected("policy_state", {
    policies: [POLICY_PRECONDITION, POLICY_PRECONDITION],
  });
  expect(() =>
    buildColumnAclPolicyResultChainRebuildV1({
      capture: captureFor("column_acl_state"),
      run_id: "run-a",
      scenario_id: "policy_state",
      shard_id: "policy-state-a",
    }),
  ).toThrow("rebuild_v1.diagnostic_mismatch");
});

test("twenty-shard aggregate is exact and ordering remains semantic", () => {
  const newFiles = (
    ["column_acl_state", "policy_state"] as const
  ).flatMap((scenarioId) =>
    (["run-a", "run-b"] as const).map(
      (runId) => chain(scenarioId, runId).file,
    ),
  );
  const inputs = {
    column_acl_policy_files: newFiles,
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
    terminal_files: terminalFiles(),
  };
  const aggregate = buildTwentyShardAggregateRebuildV1(inputs);
  verifyTwentyShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.shard_count).toBe(20);
  expect(aggregate.scenario_comparisons).toHaveLength(10);
  expect(
    buildTwentyShardAggregateRebuildV1({
      ...inputs,
      column_acl_policy_files: [...newFiles].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  expect(() =>
    buildTwentyShardAggregateRebuildV1({
      ...inputs,
      column_acl_policy_files: [
        newFiles[0],
        newFiles[0],
        newFiles[2],
        newFiles[3],
      ],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runner authority pins bytes and diagnostic precedes policy comparison", async () => {
  expect(
    createHash("sha256")
      .update(
        readFileSync(
          join(
            root,
            "lib/action-661j5r7-column-acl-policy-runtime-runner-rebuild-v1.mjs",
          ),
        ),
      )
      .digest("hex"),
  ).toBe(COLUMN_ACL_POLICY_RUNNER_MODULE_SHA256);
  expect(
    buildColumnAclPolicyRunnerIdentityReceiptRebuildV1().capability_matrix,
  ).toEqual({
    column_acl_state:
      "action_661j5r7_column_acl_policy_result_protocol_rebuild_v1",
    policy_state: "action_661j5r7_column_acl_policy_result_protocol_rebuild_v1",
  });
  const events: string[] = [];
  await expect(
    runColumnAclPolicyScenarioRebuildV1({
      output_path: "/tmp/not-written.json",
      persist_diagnostic: async () => {
        events.push("diagnostic");
      },
      run_id: "run-a",
      runtime_attempt: async () => ({
        ...captureFor("column_acl_state"),
        prestate: captureFor("policy_state").prestate,
      }),
      scenario_id: "column_acl_state",
      shard_id: "column-acl-state-a",
    }),
  ).rejects.toThrow("rebuild_v1.atomic_transition_detected");
  expect(events).toEqual(["diagnostic"]);
});

test("collector successor is read-only and runner fixes four no-retry runs", () => {
  const collector = readFileSync(
    join(root, "lib/action-661j5r7-postgres-runtime-collector-rebuild-v2.mjs"),
    "utf8",
  );
  expect(collector).toContain("'attnum', attributes.attnum");
  expect(collector).toContain("'grantor', grantors.rolname");
  expect(collector).toContain("'with_check', with_check");
  expect(collector).not.toMatch(/\b(insert|update|delete|alter|drop|grant|revoke)\b/i);
  const source = readFileSync(
    join(
      root,
      "scripts/action-661j5r7-column-acl-policy-runtime-certify-rebuild-v1.mjs",
    ),
    "utf8",
  );
  const plans = source.slice(
    source.indexOf("const plans ="),
    source.indexOf("const terminalResultEntries"),
  );
  expect(plans.match(/scenario_id: "column_acl_state"/g)).toHaveLength(2);
  expect(plans.match(/scenario_id: "policy_state"/g)).toHaveLength(2);
  expect(plans).not.toContain("duplicate_containment_history");
  expect(source).toContain("buildTwentyShardAggregateRebuildV1");
  expect(source).toContain('fixture_progress: "24/28"');
});

test("canonical authorities are deterministic", () => {
  const left = buildColumnAclPolicyPreconditionReference("column_acl_state");
  const right = buildColumnAclPolicyPreconditionReference("column_acl_state");
  expect(canonicalJson(left)).toBe(canonicalJson(right));
  expect(sha256(left)).toBe(sha256(right));
});
