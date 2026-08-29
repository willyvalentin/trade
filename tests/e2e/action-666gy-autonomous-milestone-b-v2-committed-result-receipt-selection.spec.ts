import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gy-autonomous-milestone-b-v2-committed-result-receipt-selection.md";
const evidencePath =
  "docs/evidence/action-666gy-autonomous-milestone-b-v2-committed-result-receipt-selection.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const governancePath = "docs/roadmap-operating-governance.md";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const decoderPath =
  "lib/server/position-version-lineage-v2-writer-strict-committed-result-decoder.ts";
const digestBuilderPath =
  "lib/server/position-version-lineage-v2-writer-canonical-command-digest.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gy-autonomous-milestone-b-v2-committed-result-receipt-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666GY selects one immutable V2 committed-result receipt projection while rejecting runtime paths", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(evidence.contract_version).toBe(
    "trade.action666gy.autonomous-milestone-b-v2-committed-result-receipt-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "531b54d8cc572d089845cd6184f96efbd0f10490",
    protected_main_tree: "ec6ca3e2298d249983bea695929e6f734cb09157",
    exact_main_ci_run: 33244988766,
    exact_main_ci_conclusion: "success",
    focused_verification: thisTest,
  });
  expect(evidence.candidates).toEqual({
    v2_private_transport_or_durable_receipt_storage_binding:
      "rejected_blocked_runtime_prerequisites",
    v2_adapter_owner_resolution_or_private_routine_invocation:
      "rejected_no_caller_or_execution_authority",
    required_ci_or_branch_protection_change:
      "rejected_unchanged_six_shard_full_ci",
    position_version_lineage_v2_writer_immutable_committed_result_receipt_projection: "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier: "position_version_lineage_v2_writer_immutable_committed_result_receipt_projection",
    implementation_action: "ACTION_666GZ",
    server_only: true,
    runtime_unwired: true,
    execution_authority: false,
    returned_value: "new_frozen_in_memory_committed_result_receipt",
  });
  expect(evidence.selected_outcome.accepted_inputs).toEqual([
    "already_decoded_v2_committed_result",
    "canonical_lowercase_command_digest",
  ]);
  expect(evidence.selected_outcome.forbidden_input_categories).toContain(
    "durable_storage_writer_or_runtime_binding",
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

test("666GY preserves decoder, digest and protected control containment", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(source(sourceContractPath)).toContain("exactly_one_committed_private_routine_result_row");
  expect(source(sourceContractPath)).toContain("strict_created_or_replayed_result_mapping_without_legacy_snapshot_fields");
  expect(source(preflightPath)).toContain(
    "exactPrivateRoutineResultDecoderImplemented: false",
  );
  expect(source(decoderPath)).toMatch(/^import "server-only";/);
  expect(source(digestBuilderPath)).toMatch(/^import "server-only";/);
  expect(documentation).toMatch(/No credential, database client, connection, SQL, storage, writer call/i);
  expect(documentation).toMatch(/runtime_unwired/i);
  expect(source(governancePath)).toMatch(/Codex autonomous governance controller/);
  expect(source(roadmapPath)).toMatch(/Action 666GY/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GY/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
