import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ir-position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-selection.md";
const evidencePath =
  "docs/evidence/action-666ir-position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-selection.json";
const comparatorPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt-equivalence-comparator.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/action-666ir-position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666IR selects only the immutable receipt undefined disposition own-data rejection review", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.contract_version).toBe(
    "trade.action666ir.position-version-lineage-v2-committed-result-receipt-undefined-disposition-own-data-rejection-selection.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "9146d11fdf5de9399f91afffaf5f8efff206f905",
    protected_main_tree: "f2ddb211645f21cde0e6a5e50ae73aad274f5f05",
    exact_main_ci_run: 33455477879,
    exact_main_ci_conclusion: "success",
    undefined_canonical_command_digest_own_data_rejection_review_action:
      "ACTION_666IQ",
    undefined_canonical_command_digest_own_data_rejection_review_pr_number: 282,
    postmerge_poc_job: 99700356628,
    postmerge_poc_status: "matched",
  });
  expect(evidence.candidates).toEqual({
    v2_receipt_comparator_source_or_undefined_disposition_adaptation:
      "rejected_no_implementation_or_runtime_authority",
    v2_receipt_consumer_storage_or_transport_binding:
      "rejected_no_runtime_or_durable_authority",
    v2_receipt_owner_resolution_or_writer_invocation:
      "rejected_no_caller_or_execution_authority",
    required_ci_branch_protection_or_netlify_change:
      "rejected_unchanged_six_shard_full_ci",
    v2_immutable_receipt_equivalence_undefined_disposition_own_data_rejection_review:
      "selected",
  });
  expect(evidence.selected_outcome).toMatchObject({
    identifier:
      "v2_immutable_receipt_equivalence_undefined_disposition_own_data_rejection_review",
    review_action: "ACTION_666IS",
    comparator_source_changed: false,
    server_only: true,
    runtime_unwired: true,
    execution_authority: false,
    review_fixture:
      "one_frozen_local_ordinary_receipt_with_exactly_five_enumerable_normal_own_data_fields_canonicalCommandDigest_disposition_initialHistoryIdentity_positionId_and_positionVersion_while_disposition_is_an_own_data_field_with_undefined_value_without_a_replacement_missing_extra_or_hidden_key",
  });
  expect(evidence.selected_outcome.required_observations).toEqual([
    "object_keys_and_reflect_own_keys_expose_exactly_the_five_canonical_data_keys_while_disposition_is_an_own_data_field_with_undefined_value",
    "the_frozen_local_ordinary_undefined_disposition_own_data_receipt_is_rejected_in_either_argument_slot",
    "every_undefined_disposition_own_data_rejection_is_a_fresh_dedicated_comparator_error_with_the_stable_public_name_and_message",
    "no_rejection_error_aliases_an_input_or_a_cross_invocation_error",
    "an_ordinary_local_realm_valid_five_key_receipt_control_remains_admissible_with_a_fresh_frozen_scalar_only_verdict",
  ]);
  expect(evidence.decision).toMatchObject({
    type: "select_one_source_only_milestone_b_receipt_equivalence_undefined_disposition_own_data_rejection_review",
    workflow_change_authorized: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
});

test("666IR retains the undefined disposition own-data boundary without authorizing adaptation or runtime", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");

  expect(source(comparatorPath)).toMatch(/^import "server-only";/);
  expect(source(comparatorPath)).toContain("const keys = Reflect.ownKeys(value);");
  expect(source(comparatorPath)).toContain(
    "keys.length !== RECEIPT_FIELDS.length",
  );
  expect(source(comparatorPath)).toContain(
    "const disposition = descriptors.disposition.value;",
  );
  expect(source(comparatorPath)).toContain(
    '(disposition === "created" || disposition === "replayed")',
  );
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain(
    "exactPrivateRoutineResultDecoderImplemented: false",
  );
  expect(documentation).toMatch(/source-only selection/i);
  expect(documentation).toMatch(/disposition/);
  expect(documentation).toMatch(/undefined/i);
  expect(documentation).toMatch(/Object\.keys/i);
  expect(documentation).toMatch(/Reflect\.ownKeys/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666IR/);
  expect(source(ledgerPath)).toMatch(/ACTION 666IR/);
});

test("666IR is registered once without changing the six-shard verification plan", () => {
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
