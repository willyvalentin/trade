import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hv-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-implementation.md";
const evidencePath =
  "docs/evidence/action-666hv-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-implementation.json";
const comparatorPath =
  "lib/server/position-version-lineage-v2-writer-immutable-committed-result-receipt-equivalence-comparator.ts";
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
const planPath = "tests/e2e/action-660j-parallel-provider-free-verification.spec.ts";
const thisTest =
  "tests/e2e/action-666hv-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-implementation.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";
const errorName =
  "PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError";
const errorMessage =
  "invalid_position_version_lineage_v2_writer_immutable_committed_result_receipt_equivalence_input";
const legacyComparatorReviewTests = [
  "tests/e2e/action-666he-position-version-lineage-v2-committed-result-receipt-equivalence-comparator.spec.ts",
  "tests/e2e/action-666hf-position-version-lineage-v2-committed-result-receipt-equivalence-comparator-review.spec.ts",
  "tests/e2e/action-666hh-position-version-lineage-v2-committed-result-receipt-scalar-isolation-review.spec.ts",
  "tests/e2e/action-666hj-position-version-lineage-v2-committed-result-receipt-repeated-verdict-detachment-review.spec.ts",
  "tests/e2e/action-666hl-position-version-lineage-v2-committed-result-receipt-rejected-error-detachment-review.spec.ts",
  "tests/e2e/action-666hn-position-version-lineage-v2-committed-result-receipt-cross-invocation-detachment-review.spec.ts",
  "tests/e2e/action-666hp-position-version-lineage-v2-committed-result-receipt-object-fault-rejection-review.spec.ts",
  "tests/e2e/action-666hr-position-version-lineage-v2-committed-result-receipt-accessor-fault-rejection-review.spec.ts",
  "tests/e2e/action-666ht-position-version-lineage-v2-committed-result-receipt-scalar-coercion-fault-rejection-review.spec.ts",
] as const;

type Comparator = {
  PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError:
    new () => Error;
  comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
    left: unknown,
    right: unknown,
  ): Readonly<{ equivalent: boolean }>;
};

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadComparator(): Comparator {
  const transpiled = ts.transpileModule(source(comparatorPath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: comparatorPath,
  }).outputText;
  const sandbox = {
    Object,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: comparatorPath });
  return sandbox.exports as Comparator;
}

function receiptValues() {
  return {
    canonicalCommandDigest: "a".repeat(64),
    disposition: "created" as const,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  };
}

function validReceipt() {
  return Object.freeze(receiptValues());
}

function foreignRealmReceipt() {
  return vm.runInNewContext("Object.freeze({ ...values })", {
    values: receiptValues(),
  });
}

function captureError(comparator: Comparator, left: unknown, right: unknown) {
  try {
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      left,
      right,
    );
  } catch (error) {
    expect(error).toBeInstanceOf(
      comparator.PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError,
    );
    expect(error).toMatchObject({ name: errorName, message: errorMessage });
    return error as Error;
  }

  throw new Error("expected foreign-realm receipt comparison to reject");
}

test("666HV rejects every frozen foreign-realm receipt while retaining local admission", () => {
  const comparator = loadComparator();
  const localReceipt = validReceipt();
  const foreignReceipt = foreignRealmReceipt();
  const localVerdict =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      localReceipt,
      validReceipt(),
    );
  const errors: Error[] = [];

  expect(localVerdict).toEqual({ equivalent: true });
  expect(Object.isFrozen(localVerdict)).toBe(true);
  expect(Object.getPrototypeOf(foreignReceipt)).not.toBe(Object.prototype);
  expect(foreignReceipt).toEqual(localReceipt);

  for (const [left, right] of [
    [foreignReceipt, localReceipt],
    [localReceipt, foreignReceipt],
  ]) {
    for (let call = 0; call < 3; call += 1) {
      errors.push(captureError(comparator, left, right));
    }
  }

  expect(errors).toHaveLength(6);
  expect(new Set(errors).size).toBe(errors.length);
  for (const error of errors) {
    expect([localReceipt, foreignReceipt]).not.toContain(error);
  }
});

test("666HV remains source-only, supersedes only the unexecuted review, and is registered once", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "cfa19f1a365cb9daa2cc1f8e36fcebb81541710e",
    protected_main_tree: "54157e5c49a7cc30e4fe7fac789cd7668ae2326b",
    exact_main_ci_run: 33320462377,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HU",
  });
  expect(evidence.supersession).toEqual({
    supersedes_unexecuted_selected_review: true,
    selected_review_identifier:
      "v2_immutable_receipt_equivalence_cross_realm_rejection_review",
    selection_evidence_action: "ACTION_666HU",
    reason:
      "exact_main_observation_proved_valid_frozen_foreign_realm_receipts_were_admitted",
    replacement:
      "explicit_user_authorized_source_only_fail_closed_policy_implementation",
  });
  expect(evidence.implementation).toMatchObject({
    type: "pure_server_only_immutable_committed_result_receipt_cross_realm_fail_closed_policy",
    comparator_source_changed: true,
    local_realm_valid_receipts_remain_admitted: true,
    frozen_foreign_realm_receipts_rejected_in_either_argument_slot: true,
    calls_per_argument_order: 3,
    argument_orders: 2,
    rejected_calls: 6,
    dedicated_error_public_name: errorName,
    dedicated_error_message: errorMessage,
    rejection_errors_fresh: true,
    outcome_input_aliasing: false,
    cross_error_aliasing: false,
    runtime_unwired: true,
  });
  expect(evidence.containment).toEqual({
    foreign_material_adaptation_import_or_normalization_present: false,
    receipt_consumer_or_storage_present: false,
    caller_writer_transport_or_credential_binding_present: false,
    database_provider_broker_or_runtime_binding_present: false,
    route_ui_or_deployment_authority_present: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(comparatorPath)).toMatch(/^import "server-only";/);
  expect(source(comparatorPath)).toContain(
    "Object.getPrototypeOf(value) !== Object.prototype",
  );
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/unexecuted review/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HV/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HV/);
  for (const legacyTest of legacyComparatorReviewTests) {
    expect(source(legacyTest)).toContain("const sandbox = {\n    Object,");
  }
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
