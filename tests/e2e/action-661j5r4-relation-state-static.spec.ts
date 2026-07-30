import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
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
import {
  RELATION_STATE_POLICY_REGISTRY,
  RELATION_STATE_POLICY_REGISTRY_DIGEST,
  RELATION_STATE_RUNTIME_REGISTRY_DIGEST,
  buildRelationStatePreconditionReference,
} from "../../lib/action-661j5r4-relation-state-contracts-rebuild-v1.mjs";
import {
  buildEightShardAggregateRebuildV1,
  verifyEightShardAggregateRebuildV1,
} from "../../lib/action-661j5r4-eight-shard-aggregate-rebuild-v1.mjs";
import {
  buildRelationStateResultChainRebuildV1,
  verifyRelationStateAtomicEvidenceRebuildV1,
  verifyRelationStateFileRebuildV1,
} from "../../lib/action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";
import {
  RELATION_STATE_RUNNER_MODULE_SHA256,
  buildRelationStateRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r4-relation-state-runner-authority-rebuild-v1.mjs";
import { ACTION_661J5R4_RELATION_STATE_LITERAL_FIXTURES } from "./action-661j5r4-relation-state-literal-fixtures.mjs";

type ScenarioId = "non_table" | "wrong_owner";

interface TargetProjection {
  data_status: string;
  relation: string;
  relation_state: string;
  rows: unknown[] | null;
}

interface SnapshotDomain {
  domain_id: string;
  value: TargetProjection[];
}

const root = process.cwd();
const historicalRoot = join(
  root,
  "docs/recovery/action-661j5r3a/runtime-evidence",
);

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

function captureFor(scenarioId: ScenarioId) {
  const fixture =
    ACTION_661J5R4_RELATION_STATE_LITERAL_FIXTURES.scenarios[scenarioId];
  const prestate = buildSnapshotV2Rebuild(fixture.prestate_input);
  const poststate = buildSnapshotV2Rebuild(fixture.poststate_input);
  const policy = RELATION_STATE_POLICY_REGISTRY.scenarios[scenarioId];
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
      "action_661j5r4_relation_state_diagnostic_sidecar_rebuild_v1",
    sqlstate: policy.terminal_sqlstate,
    terminal_state: "controlled_error",
  };
  const diagnostic = Object.freeze({
    ...diagnosticProjection,
    diagnostic_digest: sha256(diagnosticProjection),
  });
  const identity = runtimeIdentity();
  const guardedReads = fixture.prestate_input.guarded_data_reads;
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
  return (["non_table", "wrong_owner"] as const).flatMap((scenarioId) =>
    (["run-a", "run-b"] as const).map((runId) =>
      buildRelationStateResultChainRebuildV1({
        capture: captureFor(scenarioId),
        run_id: runId,
        scenario_id: scenarioId,
        shard_id: `${scenarioId.replace("_", "-")}-${runId.slice(-1)}`,
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
    parsePersistedFileRebuildV1(
      readFileSync(join(historicalRoot, path), "utf8"),
    ),
  );
}

test("zero-import literals bind exact relation-state terminal policies", () => {
  const fixturePath = join(
    root,
    "tests/e2e/action-661j5r4-relation-state-literal-fixtures.mjs",
  );
  const source = readFileSync(fixturePath, "utf8");
  expect(source).not.toMatch(/\b(?:import|require\s*\()/);
  expect(Object.isFrozen(ACTION_661J5R4_RELATION_STATE_LITERAL_FIXTURES)).toBe(
    true,
  );
  for (const scenarioId of ["non_table", "wrong_owner"] as const) {
    const fixture =
      ACTION_661J5R4_RELATION_STATE_LITERAL_FIXTURES.scenarios[scenarioId];
    const policy = RELATION_STATE_POLICY_REGISTRY.scenarios[scenarioId];
    expect(fixture.terminal_sqlstate).toBe("P0001");
    expect(fixture.terminal_reason).toBe(policy.terminal_reason);
    expect(fixture.relation_state).toBe(policy.relation_state);
    expect(fixture.guarded_target_read_count).toBe(0);
    expect(canonicalJson(fixture.prestate_input)).toBe(
      canonicalJson(fixture.poststate_input),
    );
  }
});

test("snapshot and precondition references bind non-table and wrong-owner exactly", () => {
  for (const scenarioId of ["non_table", "wrong_owner"] as const) {
    const capture = captureFor(scenarioId);
    expect(capture.prestate.combined_digest).toBe(
      capture.poststate.combined_digest,
    );
    const reference = buildRelationStatePreconditionReference(scenarioId);
    expect(reference.relation_state).toBe(scenarioId);
    expect(reference.target_relation).toBe("public.historical_candles");
    expect(reference.terminal_sqlstate).toBe("P0001");
    const target = capture.prestate.domains
      .find((domain: SnapshotDomain) => domain.domain_id === "target_data")
      ?.value.find(
        (entry: TargetProjection) =>
          entry.relation === "public.historical_candles",
      );
    expect(target.rows).toBeNull();
    expect(target.data_status).toBe("not_read_due_to_relation_state");
  }
});

test("relation-state evidence, record, shard, and file verify deterministically", () => {
  const first = chains();
  const second = chains();
  expect(canonicalJson(first)).toBe(canonicalJson(second));
  for (const chain of first) {
    verifyRelationStateAtomicEvidenceRebuildV1(chain.evidence);
    verifyRelationStateFileRebuildV1(chain.file);
  }
  expect(RELATION_STATE_POLICY_REGISTRY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
  expect(RELATION_STATE_RUNTIME_REGISTRY_DIGEST).toMatch(/^[a-f0-9]{64}$/);
});

test("runner authority pins exact module bytes and closed capability matrix", () => {
  const runnerPath = join(
    root,
    "lib/action-661j5r4-relation-state-runtime-runner-rebuild-v1.mjs",
  );
  expect(
    createHash("sha256").update(readFileSync(runnerPath)).digest("hex"),
  ).toBe(RELATION_STATE_RUNNER_MODULE_SHA256);
  expect(buildRelationStateRunnerIdentityReceiptRebuildV1().capability_matrix)
    .toEqual({
      non_table:
        "action_661j5r4_relation_state_result_protocol_rebuild_v1",
      wrong_owner:
        "action_661j5r4_relation_state_result_protocol_rebuild_v1",
    });
});

test("eight-shard aggregate is deterministic under reversed input order", () => {
  const relationStateFiles = chains().map((chain) => chain.file);
  const inputs = {
    historical_files: historicalFiles(),
    relation_state_files: relationStateFiles,
  };
  const aggregate = buildEightShardAggregateRebuildV1(inputs);
  expect(aggregate.shard_count).toBe(8);
  expect(aggregate.scenario_comparisons).toHaveLength(4);
  expect(
    buildEightShardAggregateRebuildV1({
      historical_files: [...inputs.historical_files].reverse(),
      relation_state_files: [...relationStateFiles].reverse(),
    }).aggregate_digest,
  ).toBe(aggregate.aggregate_digest);
  verifyEightShardAggregateRebuildV1(aggregate, inputs);
});

test("reason-bound tampering rejects policy, state, digest, and inventory drift", () => {
  const chain = chains()[0];
  expect(() =>
    verifyRelationStateAtomicEvidenceRebuildV1({
      ...chain.evidence,
      policy_registry_digest:
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    }),
  ).toThrow("rebuild_v1.policy_mismatch");
  const targetDomain = chain.evidence.prestate.domains.find(
    (domain: SnapshotDomain) => domain.domain_id === "target_data",
  );
  const changedTarget = targetDomain.value.map((entry: TargetProjection) =>
    entry.relation === "public.historical_candles"
      ? { ...entry, relation_state: "wrong_owner" }
      : entry,
  );
  expect(() =>
    verifyRelationStateAtomicEvidenceRebuildV1({
      ...chain.evidence,
      prestate: {
        ...chain.evidence.prestate,
        domains: chain.evidence.prestate.domains.map((domain: SnapshotDomain) =>
          domain.domain_id === "target_data"
            ? { ...domain, value: changedTarget }
            : domain,
        ),
      },
    }),
  ).toThrow("rebuild_v1.snapshot_domain_digest_mismatch");
  expect(() =>
    buildEightShardAggregateRebuildV1({
      historical_files: historicalFiles(),
      relation_state_files: [chain.file, chain.file, chains()[2].file, chains()[3].file],
    }),
  ).toThrow("rebuild_v1.aggregate_inventory_mismatch");
});

test("runtime script fixes four no-retry runs behind stable readiness", () => {
  const source = readFileSync(
    join(
      root,
      "scripts/action-661j5r4-relation-state-runtime-certify-rebuild-v1.mjs",
    ),
    "utf8",
  );
  expect(source.match(/scenario_id: "non_table"/g)).toHaveLength(2);
  expect(source.match(/scenario_id: "wrong_owner"/g)).toHaveLength(2);
  expect(source).toContain("waitForStablePostgresReadiness");
  expect(source).toContain('"pg_isready"');
  expect(source).toContain('"select 1"');
  expect(source).toContain("runtime_attempt_retried");
  expect(source).toContain("persist_diagnostic");
  const runOne = source.slice(source.indexOf("async function runOne"));
  expect(runOne.indexOf("persist_diagnostic")).toBeLessThan(
    runOne.indexOf("buildEightShardAggregateRebuildV1"),
  );
  expect(runOne.indexOf("waitReady(container, runDirectory)")).toBeLessThan(
    runOne.indexOf("captureRuntimeIdentity(container, inspectedImage)"),
  );
});

test("authority projections are stable across UTC and non-UTC subprocesses", () => {
  const source = `
    const contracts = await import("./lib/action-661j5r4-relation-state-contracts-rebuild-v1.mjs");
    const authority = await import("./lib/action-661j5r4-relation-state-runner-authority-rebuild-v1.mjs");
    process.stdout.write(JSON.stringify({
      policy: contracts.RELATION_STATE_POLICY_REGISTRY_DIGEST,
      registry: contracts.RELATION_STATE_RUNTIME_REGISTRY_DIGEST,
      non_table: contracts.buildRelationStatePreconditionReference("non_table").precondition_reference_digest,
      wrong_owner: contracts.buildRelationStatePreconditionReference("wrong_owner").precondition_reference_digest,
      runner: authority.buildRelationStateRunnerIdentityReceiptRebuildV1().runner_identity_digest
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
