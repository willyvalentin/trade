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
import { parseColumnAclPolicyFileRebuildV1 } from "../../lib/action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";
import {
  APPEND_ONLY_BASELINE,
  APPEND_ONLY_PRECONDITION,
  FROZEN_EIGHT_RPC_INVENTORY,
  RPC_APPEND_ONLY_POLICY_REGISTRY,
  RPC_APPEND_ONLY_POLICY_REGISTRY_DIGEST,
  RPC_APPEND_ONLY_RUNTIME_REGISTRY_DIGEST,
  RPC_CATALOG_BODY_DRIFT_PRECONDITION,
  buildRpcAppendOnlyPreconditionReference,
  expectedRpcAppendOnlyHistoryInventory,
  verifyRpcAppendOnlyPreconditionReference,
} from "../../lib/action-661j5r8-rpc-append-only-contracts-rebuild-v1.mjs";
import {
  buildRpcAppendOnlyResultChainRebuildV1,
  verifyRpcAppendOnlyFileRebuildV1,
} from "../../lib/action-661j5r8-rpc-append-only-result-protocol-rebuild-v1.mjs";
import {
  RPC_APPEND_ONLY_RUNNER_MODULE_SHA256,
  buildRpcAppendOnlyRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r8-rpc-append-only-runner-authority-rebuild-v1.mjs";
import { runRpcAppendOnlyScenarioRebuildV1 } from "../../lib/action-661j5r8-rpc-append-only-runtime-runner-rebuild-v1.mjs";
import {
  buildTwentyFourShardAggregateRebuildV1,
  verifyTwentyFourShardAggregateRebuildV1,
} from "../../lib/action-661j5r8-twenty-four-shard-aggregate-rebuild-v1.mjs";
import { ACTION_661J5R2_LITERAL_FIXTURE } from "./action-661j5r2-runtime-literal-fixture.mjs";
import { ACTION_661J5R8_RPC_APPEND_ONLY_LITERAL_FIXTURES } from "./action-661j5r8-rpc-append-only-literal-fixtures.mjs";

type ScenarioId = "rpc_catalog_body_drift" | "incompatible_append_only_function";

interface SnapshotOverrides {
  rpcCatalog?: readonly unknown[];
}

interface RpcCatalogEntry {
  body_sha256: string;
  identity: string;
  kind: string;
  language: string;
  overload_count: number;
  owner: string;
  parallel: string;
  proconfig: string[];
  return_type: string;
  role_privileges: {
    anon_execute: boolean;
    authenticated_execute: boolean;
    public_execute: boolean;
    service_role_execute: boolean;
  };
  security_definer: boolean;
  strict: boolean;
  volatility: string;
}

const root = process.cwd();
const r3aRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);
const r4Root = join(root, "docs/recovery/action-661j5r4/runtime-evidence");
const r5Root = join(root, "docs/recovery/action-661j5r5/runtime-evidence");
const r7Root = join(root, "docs/recovery/action-661j5r7/runtime-evidence");

function runtimeIdentity() {
  return buildRuntimeIdentity({
    architecture: "arm64",
    collector_sha256:
      "370dc8dd0579996389983eb9b5b5cc3d7116db80941261e1f835570b973260fb",
    collector_version:
      "action_661j5r8_postgres_runtime_collector_rebuild_v3",
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
    expectedRpcAppendOnlyHistoryInventory(scenarioId),
  );
  const appendOnlyAuthority =
    scenarioId === "incompatible_append_only_function"
      ? APPEND_ONLY_PRECONDITION
      : APPEND_ONLY_BASELINE;
  const appendOnly = Object.fromEntries(
    Object.entries(appendOnlyAuthority).filter(
      ([field]) => field !== "drift_field",
    ),
  );
  input.domains.rpc_catalog = structuredClone(
    overrides.rpcCatalog ?? [
      ...(scenarioId === "rpc_catalog_body_drift"
        ? RPC_CATALOG_BODY_DRIFT_PRECONDITION
        : FROZEN_EIGHT_RPC_INVENTORY),
      appendOnly,
    ],
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
  const policy = RPC_APPEND_ONLY_POLICY_REGISTRY.scenarios[scenarioId];
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
      "action_661j5r8_rpc_append_only_diagnostic_sidecar_rebuild_v1",
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
  return buildRpcAppendOnlyResultChainRebuildV1({
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

function expectCaptureRejected(
  scenarioId: ScenarioId,
  overrides: SnapshotOverrides,
) {
  expect(() =>
    buildRpcAppendOnlyResultChainRebuildV1({
      capture: captureFor(scenarioId, overrides),
      run_id: "run-a",
      scenario_id: scenarioId,
      shard_id: `${scenarioId.replaceAll("_", "-")}-a`,
    }),
  ).toThrow("rebuild_v1.precondition_reference_mismatch");
}

test("zero-import literals pin exact RPC and append-only authorities", () => {
  const source = readFileSync(
    join(
      root,
      "tests/e2e/action-661j5r8-rpc-append-only-literal-fixtures.mjs",
    ),
    "utf8",
  );
  expect(source).not.toMatch(/\bimport\b|\brequire\s*\(/);
  const literals = ACTION_661J5R8_RPC_APPEND_ONLY_LITERAL_FIXTURES;
  expect(
    literals.scenarios.rpc_catalog_body_drift.expected_rpc_inventory,
  ).toEqual(
    RPC_CATALOG_BODY_DRIFT_PRECONDITION,
  );
  expect(
    literals.scenarios.incompatible_append_only_function
      .expected_append_only_function,
  ).toEqual(APPEND_ONLY_PRECONDITION);
  expect(
    literals.scenarios.incompatible_append_only_function
      .expected_rpc_inventory,
  ).toEqual(FROZEN_EIGHT_RPC_INVENTORY);
  expect(
    literals.scenarios.rpc_catalog_body_drift.terminal_reason,
  ).toBe(
    "Action 661J refuses RPC catalog/body drift: public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)",
  );
  for (const scenarioId of [
    "rpc_catalog_body_drift",
    "incompatible_append_only_function",
  ] as const) {
    const reference = buildRpcAppendOnlyPreconditionReference(scenarioId);
    verifyRpcAppendOnlyPreconditionReference(reference, scenarioId);
    expect(reference.expected_rpc_inventory_digest).toBe(
      sha256(literals.scenarios[scenarioId].expected_rpc_inventory),
    );
  }
  expect(Object.isFrozen(literals)).toBe(true);
});

test("evidence signs the full RPC and function catalog domains", () => {
  for (const scenarioId of [
    "rpc_catalog_body_drift",
    "incompatible_append_only_function",
  ] as const) {
    const result = chain(scenarioId, "run-a");
    verifyRpcAppendOnlyFileRebuildV1(result.file);
    expect(result.evidence.prestate).toEqual(result.evidence.poststate);
    expect(result.evidence.policy_registry_digest).toBe(
      RPC_APPEND_ONLY_POLICY_REGISTRY_DIGEST,
    );
    expect(result.evidence.runtime_registry_digest).toBe(
      RPC_APPEND_ONLY_RUNTIME_REGISTRY_DIGEST,
    );
    const rpcDomain = result.evidence.prestate.domains.find(
      (domain: { domain_id: string }) => domain.domain_id === "rpc_catalog",
    );
    expect(rpcDomain?.value).toHaveLength(9);
  }
});

test("closed offending subsets reject RPC and append-only drift", () => {
  const rpcBaseline = structuredClone(
    RPC_CATALOG_BODY_DRIFT_PRECONDITION,
  ) as RpcCatalogEntry[];
  for (const field of [
    ["identity", "substituted_rpc(text)"],
    ["body_sha256", "0".repeat(64)],
    ["overload_count", 2],
    ["owner", "other_owner"],
    ["language", "sql"],
    ["proconfig", ["search_path=pg_catalog"]],
  ] as const) {
    const changed = rpcBaseline.map((entry: RpcCatalogEntry, index: number) =>
      index === 0 ? { ...entry, [field[0]]: field[1] } : entry,
    );
    expectCaptureRejected("rpc_catalog_body_drift", {
      rpcCatalog: [...changed, APPEND_ONLY_BASELINE],
    });
  }
  const changedPrivileges = rpcBaseline.map(
    (entry: RpcCatalogEntry, index: number) =>
    index === 0
      ? {
          ...entry,
          role_privileges: {
            ...entry.role_privileges,
            public_execute: true,
          },
        }
      : entry,
  );
  expectCaptureRejected("rpc_catalog_body_drift", {
    rpcCatalog: [...changedPrivileges, APPEND_ONLY_BASELINE],
  });
  expectCaptureRejected("rpc_catalog_body_drift", {
    rpcCatalog: [
      ...rpcBaseline,
      rpcBaseline[0],
      APPEND_ONLY_BASELINE,
    ],
  });
  for (const changed of [
    { ...APPEND_ONLY_PRECONDITION, identity: "other()" },
    { ...APPEND_ONLY_PRECONDITION, owner: "other_owner" },
    { ...APPEND_ONLY_PRECONDITION, language: "sql" },
    { ...APPEND_ONLY_PRECONDITION, proconfig: ["search_path=pg_catalog"] },
  ]) {
    const normalized = Object.fromEntries(
      Object.entries(changed).filter(([field]) => field !== "drift_field"),
    );
    expectCaptureRejected("incompatible_append_only_function", {
      rpcCatalog: [...FROZEN_EIGHT_RPC_INVENTORY, normalized],
    });
  }
  expect(() =>
    buildRpcAppendOnlyResultChainRebuildV1({
      capture: captureFor("rpc_catalog_body_drift"),
      run_id: "run-a",
      scenario_id: "incompatible_append_only_function",
      shard_id: "incompatible-append-only-function-a",
    }),
  ).toThrow("rebuild_v1.diagnostic_mismatch");
});

test("twenty-four-shard aggregate is exact and ordering remains semantic", () => {
  const newFiles = (
    ["rpc_catalog_body_drift", "incompatible_append_only_function"] as const
  ).flatMap((scenarioId) =>
    (["run-a", "run-b"] as const).map(
      (runId) => chain(scenarioId, runId).file,
    ),
  );
  const inputs = {
    column_acl_policy_files: columnAclPolicyFiles(),
    rpc_append_only_files: newFiles,
    historical_files: historicalFiles(),
    history_files: historyFiles(),
    relation_state_files: relationStateFiles(),
    terminal_files: terminalFiles(),
  };
  const aggregate = buildTwentyFourShardAggregateRebuildV1(inputs);
  verifyTwentyFourShardAggregateRebuildV1(aggregate, inputs);
  expect(aggregate.shard_count).toBe(24);
  expect(aggregate.scenario_comparisons).toHaveLength(12);
  expect(
    buildTwentyFourShardAggregateRebuildV1({
      ...inputs,
      rpc_append_only_files: [...newFiles].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  expect(() =>
    buildTwentyFourShardAggregateRebuildV1({
      ...inputs,
      rpc_append_only_files: [
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
            "lib/action-661j5r8-rpc-append-only-runtime-runner-rebuild-v1.mjs",
          ),
        ),
      )
      .digest("hex"),
  ).toBe(RPC_APPEND_ONLY_RUNNER_MODULE_SHA256);
  expect(
    buildRpcAppendOnlyRunnerIdentityReceiptRebuildV1().capability_matrix,
  ).toEqual({
    rpc_catalog_body_drift:
      "action_661j5r8_rpc_append_only_result_protocol_rebuild_v1",
    incompatible_append_only_function: "action_661j5r8_rpc_append_only_result_protocol_rebuild_v1",
  });
  const events: string[] = [];
  await expect(
    runRpcAppendOnlyScenarioRebuildV1({
      output_path: "/tmp/not-written.json",
      persist_diagnostic: async () => {
        events.push("diagnostic");
      },
      run_id: "run-a",
      runtime_attempt: async () => ({
        ...captureFor("rpc_catalog_body_drift"),
        prestate: captureFor("incompatible_append_only_function").prestate,
      }),
      scenario_id: "rpc_catalog_body_drift",
      shard_id: "rpc-catalog-body-drift-a",
    }),
  ).rejects.toThrow("rebuild_v1.atomic_transition_detected");
  expect(events).toEqual(["diagnostic"]);
});

test("collector successor is read-only and runner fixes four no-retry runs", () => {
  const collector = readFileSync(
    join(root, "lib/action-661j5r8-postgres-runtime-collector-rebuild-v3.mjs"),
    "utf8",
  );
  expect(collector).toContain("'body_sha256'");
  expect(collector).toContain("'overload_count'");
  expect(collector).toContain("'role_privileges'");
  expect(collector).toContain("'proconfig'");
  expect(collector).not.toMatch(/\b(insert|update|delete|alter|drop|grant|revoke)\b/i);
  const source = readFileSync(
    join(
      root,
      "scripts/action-661j5r8-rpc-append-only-runtime-certify-rebuild-v1.mjs",
    ),
    "utf8",
  );
  const plans = source.slice(
    source.indexOf("const plans ="),
    source.indexOf("const terminalResultEntries"),
  );
  expect(plans.match(/scenario_id: "rpc_catalog_body_drift"/g)).toHaveLength(2);
  expect(plans.match(/scenario_id: "incompatible_append_only_function"/g)).toHaveLength(2);
  expect(plans).not.toContain("duplicate_containment_history");
  expect(source).toContain("buildTwentyFourShardAggregateRebuildV1");
  expect(source).toContain('fixture_progress: "26/28"');
});

test("canonical authorities are deterministic", () => {
  const left = buildRpcAppendOnlyPreconditionReference("rpc_catalog_body_drift");
  const right = buildRpcAppendOnlyPreconditionReference("rpc_catalog_body_drift");
  expect(canonicalJson(left)).toBe(canonicalJson(right));
  expect(sha256(left)).toBe(sha256(right));
});
