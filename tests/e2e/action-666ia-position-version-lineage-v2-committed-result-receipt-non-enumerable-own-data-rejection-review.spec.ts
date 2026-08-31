import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ia-position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-review.md";
const evidencePath =
  "docs/evidence/action-666ia-position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-review.json";
const selectionEvidencePath =
  "docs/evidence/action-666hz-position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-selection.json";
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
  "tests/e2e/action-666ia-position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";
const receiptFields = [
  "canonicalCommandDigest",
  "disposition",
  "initialHistoryIdentity",
  "positionId",
  "positionVersion",
] as const;
const errorName =
  "PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError";
const errorMessage =
  "invalid_position_version_lineage_v2_writer_immutable_committed_result_receipt_equivalence_input";

type ReceiptField = (typeof receiptFields)[number];
type ReceiptValues = Record<ReceiptField, string | number>;
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
  const exports: Record<string, unknown> = {};
  // Evaluate only the static comparator source in this host realm: this review
  // intentionally creates and compares no foreign-realm receipt fixture.
  const evaluate = new Function("exports", "require", `"use strict";\n${transpiled}`);

  evaluate(exports, (specifier: string) => {
    if (specifier === "server-only") return {};
    throw new Error(`unexpected import: ${specifier}`);
  });

  return exports as Comparator;
}

function receiptValues(): ReceiptValues {
  return {
    canonicalCommandDigest: "a".repeat(64),
    disposition: "created",
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1,
  };
}

function localReceipt() {
  return Object.freeze(receiptValues());
}

function nonEnumerableOwnDataReceipt(hiddenField: ReceiptField) {
  const values = receiptValues();
  const receipt = {} as Record<ReceiptField, unknown>;

  for (const field of receiptFields) {
    Object.defineProperty(receipt, field, {
      value: values[field],
      enumerable: field !== hiddenField,
      configurable: false,
      writable: false,
    });
  }

  return Object.freeze(receipt);
}

function captureNonEnumerableOwnDataRejection(
  comparator: Comparator,
  left: unknown,
  right: unknown,
) {
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

  throw new Error("expected non-enumerable own-data receipt comparison to reject");
}

function expectOrdinaryLocalReceiptShape(receipt: object, values: ReceiptValues) {
  expect(Object.isFrozen(receipt)).toBe(true);
  expect(Object.getPrototypeOf(receipt)).toBe(Object.prototype);
  expect(Reflect.ownKeys(receipt)).toEqual(receiptFields);

  for (const field of receiptFields) {
    expect(Object.getOwnPropertyDescriptor(receipt, field)).toEqual({
      value: values[field],
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }
}

function expectNonEnumerableOwnDataReceiptShape(
  receipt: object,
  hiddenField: ReceiptField,
  values: ReceiptValues,
) {
  expect(Object.isFrozen(receipt)).toBe(true);
  expect(Object.getPrototypeOf(receipt)).toBe(Object.prototype);
  expect(Reflect.ownKeys(receipt)).toEqual(receiptFields);

  for (const field of receiptFields) {
    expect(Object.getOwnPropertyDescriptor(receipt, field)).toEqual({
      value: values[field],
      enumerable: field !== hiddenField,
      configurable: false,
      writable: false,
    });
  }
}

test("666IA independently reviews every non-enumerable canonical own-data field rejection", () => {
  const comparator = loadComparator();
  const values = receiptValues();
  const control = localReceipt();
  const matchingControl = localReceipt();
  const faultInputs = receiptFields.map((field) => ({
    field,
    receipt: nonEnumerableOwnDataReceipt(field),
  }));
  const errors: Error[] = [];
  const validVerdict =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      control,
      matchingControl,
    );

  expectOrdinaryLocalReceiptShape(control, values);
  expectOrdinaryLocalReceiptShape(matchingControl, values);
  expect(validVerdict).toEqual({ equivalent: true });
  expect(Object.isFrozen(validVerdict)).toBe(true);
  expect(Reflect.ownKeys(validVerdict)).toEqual(["equivalent"]);
  expect(Object.getOwnPropertyDescriptor(validVerdict, "equivalent")).toEqual({
    value: true,
    enumerable: true,
    configurable: false,
    writable: false,
  });
  expect(validVerdict).not.toBe(control);
  expect(validVerdict).not.toBe(matchingControl);

  for (const { field, receipt } of faultInputs) {
    expectNonEnumerableOwnDataReceiptShape(receipt, field, values);

    for (const [left, right] of [
      [receipt, control],
      [control, receipt],
    ]) {
      for (let call = 0; call < 3; call += 1) {
        errors.push(captureNonEnumerableOwnDataRejection(comparator, left, right));
      }
    }
  }

  expect(errors).toHaveLength(30);
  expect(new Set(errors).size).toBe(30);
  for (const error of errors) {
    expect([
      control,
      matchingControl,
      validVerdict,
      ...faultInputs.map(({ receipt }) => receipt),
    ]).not.toContain(error);
  }
});

test("666IA retains the selected non-enumerable own-data boundary without widening authority", () => {
  const evidence = JSON.parse(source(evidencePath));
  const selectionEvidence = JSON.parse(source(selectionEvidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.contract_version).toBe(
    "trade.action666ia.position-version-lineage-v2-committed-result-receipt-non-enumerable-own-data-rejection-review.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "db2a80356cea48724d39996ad9471c4666c2abc7",
    protected_main_tree: "51471b96210e2f812a6cd8e376ea4d5fafcb95e4",
    exact_main_ci_run: 33340873493,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HZ",
    selection_pr_number: 265,
  });
  expect(selectionEvidence.action_id).toBe("ACTION_666HZ");
  expect(selectionEvidence.selected_outcome).toMatchObject({
    review_action: "ACTION_666IA",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_non_enumerable_own_data_rejection_review",
    comparator_source_changed: false,
    ordinary_local_realm_valid_receipts_remain_admitted: true,
    local_admission_verdict_is_fresh_frozen_and_scalar_only: true,
    reviewed_non_enumerable_own_data_fields: receiptFields,
    review_fixtures_are_local_frozen_ordinary_receipts: true,
    review_fixtures_direct_prototype_is_local_object_prototype: true,
    review_fixtures_exact_canonical_own_data_fields: true,
    review_fixtures_canonical_scalar_shape_matches_local_control: true,
    exactly_one_non_enumerable_own_data_field_per_fixture: true,
    normal_own_data_descriptors_only: true,
    non_enumerable_own_data_receipts_rejected_in_either_argument_slot: true,
    calls_per_field_and_argument_order: 3,
    argument_orders_per_field: 2,
    rejected_calls: 30,
    rejection_errors_fresh: true,
    outcome_input_aliasing: false,
    cross_error_aliasing: false,
    proxy_accessor_symbol_foreign_realm_or_prototype_variation_present: false,
    enumerability_adaptation_import_or_normalization_present: false,
    runtime_unwired: true,
    dedicated_error_public_name: errorName,
    dedicated_error_message: errorMessage,
  });
  expect(evidence.containment).toEqual({
    enumerability_adaptation_import_or_normalization_present: false,
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
  expect(source(comparatorPath)).toContain("!descriptor.enumerable");
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain(
    "exactPrivateRoutineResultDecoderImplemented: false",
  );
  expect(source(thisTest)).not.toMatch(/^import .*node:vm/m);
  expect(source(thisTest)).not.toMatch(/\bvm\.runInNewContext\(/);
  expect(source(thisTest)).not.toMatch(/Proxy\(|Symbol\(|Object\.create\(|Object\.setPrototypeOf/);
  expect(documentation).toMatch(/independently reviews/i);
  expect(documentation).toMatch(/non-enumerable/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666IA/);
  expect(source(ledgerPath)).toMatch(/ACTION 666IA/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
