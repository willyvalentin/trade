import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gv-autonomous-milestone-b-v2-committed-result-decoder-selection.md";
const evidencePath =
  "docs/evidence/action-666gv-autonomous-milestone-b-v2-committed-result-decoder-selection.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const governancePath = "docs/roadmap-operating-governance.md";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gv-autonomous-milestone-b-v2-committed-result-decoder-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666GV selects one strict V2 committed-result decoder while rejecting every runtime path", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(evidence.contract_version).toBe(
    "trade.action666gv.autonomous-milestone-b-v2-committed-result-decoder-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "4371bea010bda751f91bddd0e9f82f0c85508ebf",
    protected_main_tree: "35e8d0e2a046c12acb43d953e8645fc1129845c1",
    exact_main_ci_run: 33210525123,
    exact_main_ci_conclusion: "success",
    focused_verification: thisTest,
  });
  expect(evidence.candidates).toEqual({
    v2_private_runtime_transport_or_writer_binding:
      "rejected_blocked_runtime_prerequisites",
    v2_adapter_or_private_routine_invocation:
      "rejected_no_caller_or_execution_authority",
    required_ci_or_branch_protection_change:
      "rejected_unchanged_six_shard_full_ci",
    position_version_lineage_v2_writer_strict_committed_result_decoder: "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier: "position_version_lineage_v2_writer_strict_committed_result_decoder",
    implementation_action: "ACTION_666GW",
    server_only: true,
    runtime_unwired: true,
    execution_authority: false,
    required_initial_position_version: 1,
  });
  expect(evidence.selected_outcome.accepted_wire_columns).toEqual([
    "disposition",
    "position_id",
    "position_version",
    "initial_history_identity",
  ]);
  expect(evidence.selected_outcome.forbidden_input_categories).toContain(
    "legacy_snapshot_fields",
  );
  expect(evidence.decision).toMatchObject({
    type: "select_one_source_only_milestone_b_dependency",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
  expect(sha256(raw)).toMatch(/^[a-f0-9]{64}$/);
});

test("666GV preserves the frozen V2 result mapping and all protected controls", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(source(sourceContractPath)).toContain("exactly_one_committed_private_routine_result_row");
  expect(source(sourceContractPath)).toContain("strict_created_or_replayed_result_mapping_without_legacy_snapshot_fields");
  expect(source(sourceContractPath)).toContain("initialHistoryIdentityFormat");
  expect(source(preflightPath)).toContain(
    "exactPrivateRoutineResultDecoderImplemented: false",
  );
  expect(documentation).toMatch(/No credential, database client, connection, SQL, writer call/i);
  expect(documentation).toMatch(/runtime_unwired/i);
  expect(source(governancePath)).toMatch(/Codex autonomous governance controller/);
  expect(source(roadmapPath)).toMatch(/Action 666GV/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GV/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
