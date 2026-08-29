import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hb-autonomous-milestone-b-v2-committed-result-receipt-detachment-selection.md";
const evidencePath =
  "docs/evidence/action-666hb-autonomous-milestone-b-v2-committed-result-receipt-detachment-selection.json";
const receiptPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt.ts";
const sourceContractPath =
  "lib/position-version-lineage-v2-writer-private-non-data-api-command-port-source-contract.ts";
const preflightPath =
  "lib/position-version-lineage-v2-writer-private-command-port-runtime-binding-admission-preflight.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666hb-autonomous-milestone-b-v2-committed-result-receipt-detachment-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666HB selects exactly one independent immutable receipt detachment review", () => {
  const evidence = JSON.parse(source(evidencePath));

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "cb13a87a55f40e37e356f3636aeddbad74eeae98",
    protected_main_tree: "d1f59fb49e8783fa13dc1cb55be18919bf3854e7",
    exact_main_ci_run: 33254105420,
    exact_main_ci_conclusion: "success",
    receipt_containment_review_action: "ACTION_666HA",
  });
  expect(evidence.selection).toEqual({
    type: "independent_source_only_immutable_committed_result_receipt_cross_result_detachment_review",
    selected_successor_action: "ACTION_666HC",
    implementation_source_changed: false,
    permitted_review_inputs: [
      "two_separately_decoded_frozen_v2_committed_results",
      "two_distinct_canonical_lowercase_command_digests",
    ],
    required_findings: [
      "each_receipt_is_fresh",
      "each_receipt_is_frozen_and_scalar_only",
      "no_receipt_aliases_its_input_result",
      "no_cross_receipt_aliasing",
    ],
    retained_fail_closed_boundary: [
      "mutable_or_widened_decoded_result",
      "inherited_accessor_or_symbol_result_material",
      "legacy_or_malformed_result_material",
      "malformed_or_noncanonical_command_digest",
    ],
  });
});

test("666HB keeps the selected review source-only and the existing receipt unbound", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");

  expect(evidence.containment).toEqual({
    storage_operation_present: false,
    transport_operation_present: false,
    credential_identity_or_owner_resolution_present: false,
    database_writer_or_durable_receipt_operation_present: false,
    provider_broker_route_ui_deployment_or_runtime_binding_present: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(receiptPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/source-only selection/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
});

test("666HB is recorded once without changing the six-shard verification plan", () => {
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(source(roadmapPath)).toMatch(/Action 666HB/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HB/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
