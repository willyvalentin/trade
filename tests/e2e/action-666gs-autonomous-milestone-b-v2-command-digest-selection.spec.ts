import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666gs-autonomous-milestone-b-v2-command-digest-selection.md";
const evidencePath =
  "docs/evidence/action-666gs-autonomous-milestone-b-v2-command-digest-selection.json";
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
  "tests/e2e/action-666gs-autonomous-milestone-b-v2-command-digest-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666GS selects one deterministic V2 source dependency while rejecting every runtime path", () => {
  const raw = source(evidencePath);
  const evidence = JSON.parse(raw);

  expect(evidence.contract_version).toBe(
    "trade.action666gs.autonomous-milestone-b-v2-command-digest-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "c1b64f8cc9017a942f61371eea6ff58178fa4be2",
    protected_main_tree: "d0ec9b78c62f1cb7ceadabb3b14908609c448340",
    exact_main_ci_run: 33187729952,
    exact_main_ci_conclusion: "success",
    focused_verification: thisTest,
  });
  expect(evidence.candidates).toEqual({
    v2_private_routine_runtime_transport_binding:
      "rejected_blocked_runtime_prerequisites",
    v2_committed_result_decoder_or_adapter:
      "deferred_transport_and_result_boundary_not_admitted",
    required_ci_or_branch_protection_change:
      "rejected_unchanged_six_shard_full_ci",
    position_version_lineage_v2_writer_canonical_command_digest_builder: "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier: "position_version_lineage_v2_writer_canonical_command_digest_builder",
    implementation_action: "ACTION_666GT",
    server_only: true,
    runtime_unwired: true,
    execution_authority: false,
  });
  expect(evidence.selected_outcome.accepted_input_fields).toEqual([
    "contract_version",
    "routine_signature",
    "authenticated_server_owner",
    "opaque_recommendation_reference",
  ]);
  expect(evidence.selected_outcome.forbidden_input_categories).toContain(
    "caller_supplied_digest",
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

test("666GS preserves the frozen V2 contract and all protected controls", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(source(sourceContractPath)).toContain(
    "utf8_json_object_with_lexically_sorted_keys",
  );
  expect(source(sourceContractPath)).toContain(
    "opaque_recommendation_reference",
  );
  expect(source(preflightPath)).toContain(
    "deterministicV2CanonicalCommandDigestImplemented: false",
  );
  expect(documentation).toMatch(/No transport, credential resolution/i);
  expect(documentation).toMatch(/runtime_unwired/i);
  expect(source(governancePath)).toMatch(/Codex autonomous governance controller/);
  expect(source(roadmapPath)).toMatch(/Action 666GS/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GS/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
