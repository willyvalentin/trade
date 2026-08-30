import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hy-position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-review.md";
const evidencePath =
  "docs/evidence/action-666hy-position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-review.json";
const selectionEvidencePath =
  "docs/evidence/action-666hx-position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-selection.json";
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
  "tests/e2e/action-666hy-position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-review.spec.ts";

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
  // eslint-disable-next-line no-new-func
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

function nullPrototypeReceipt() {
  const receipt = Object.create(null) as Record<ReceiptField, unknown>;
  Object.assign(receipt, receiptValues());
  return Object.freeze(receipt);
}

function captureNullPrototypeRejection(
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

  throw new Error("expected null-prototype receipt comparison to reject");
}

test("666HY independently reviews local null-prototype receipt rejection", () => {
  const comparator = loadComparator();
  const local = localReceipt();
  const matchingLocal = localReceipt();
  const nullPrototype = nullPrototypeReceipt();
  const values = receiptValues();
  const errors: Error[] = [];
  const localVerdict =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      local,
      matchingLocal,
    );

  expect(localVerdict).toEqual({ equivalent: true });
  expect(Object.isFrozen(localVerdict)).toBe(true);
  expect(Reflect.ownKeys(localVerdict)).toEqual(["equivalent"]);
  expect(Object.getOwnPropertyDescriptor(localVerdict, "equivalent")).toEqual({
    value: true,
    enumerable: true,
    configurable: false,
    writable: false,
  });
  expect(localVerdict).not.toBe(local);
  expect(localVerdict).not.toBe(matchingLocal);
  expect(Object.getPrototypeOf(local)).toBe(Object.prototype);
  expect(Object.getPrototypeOf(matchingLocal)).toBe(Object.prototype);
  expect(Object.isFrozen(nullPrototype)).toBe(true);
  expect(Object.getPrototypeOf(nullPrototype)).toBe(null);
  expect(Reflect.ownKeys(nullPrototype)).toEqual(receiptFields);
  expect(nullPrototype).toEqual(local);

  for (const field of receiptFields) {
    expect(Object.getOwnPropertyDescriptor(nullPrototype, field)).toEqual({
      value: values[field],
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  for (const [left, right] of [
    [nullPrototype, local],
    [local, nullPrototype],
  ]) {
    for (let call = 0; call < 3; call += 1) {
      errors.push(captureNullPrototypeRejection(comparator, left, right));
    }
  }

  expect(errors).toHaveLength(6);
  expect(new Set(errors).size).toBe(6);
  for (const error of errors) {
    expect([local, matchingLocal, nullPrototype, localVerdict]).not.toContain(
      error,
    );
  }
});

test("666HY retains the selected null-prototype boundary without widening authority", () => {
  const evidence = JSON.parse(source(evidencePath));
  const selectionEvidence = JSON.parse(source(selectionEvidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.contract_version).toBe(
    "trade.action666hy.position-version-lineage-v2-committed-result-receipt-null-prototype-rejection-review.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "de4f3c84a3873abc8168dd4c842facc3f01af4ac",
    protected_main_tree: "13e1acd1ef25b1cf561780ea9829772cc99300bb",
    exact_main_ci_run: 33332452424,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HX",
    selection_pr_number: 263,
  });
  expect(selectionEvidence.action_id).toBe("ACTION_666HX");
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_null_prototype_rejection_review",
    comparator_source_changed: false,
    ordinary_local_realm_valid_receipts_remain_admitted: true,
    local_admission_verdict_is_fresh_frozen_and_scalar_only: true,
    null_prototype_receipt_is_local_in_memory: true,
    null_prototype_receipt_direct_prototype_is_null: true,
    null_prototype_receipt_exact_canonical_own_data_fields: true,
    null_prototype_receipt_scalar_shape_matches_local_control: true,
    frozen_null_prototype_receipts_rejected_in_either_argument_slot: true,
    calls_per_argument_order: 3,
    argument_orders: 2,
    rejected_calls: 6,
    rejection_errors_fresh: true,
    outcome_input_aliasing: false,
    cross_error_aliasing: false,
    proxy_accessor_symbol_foreign_realm_or_prototype_mutation_present: false,
    null_prototype_adaptation_import_or_normalization_present: false,
    runtime_unwired: true,
    dedicated_error_public_name: errorName,
    dedicated_error_message: errorMessage,
  });
  expect(evidence.containment).toEqual({
    null_prototype_adaptation_import_or_normalization_present: false,
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
  expect(source(preflightPath)).toContain(
    "exactPrivateRoutineResultDecoderImplemented: false",
  );
  expect(source(thisTest)).not.toMatch(/^import .*node:vm/m);
  expect(source(thisTest)).not.toMatch(/\bvm\.runInNewContext\(/);
  expect(source(thisTest)).not.toMatch(/Proxy\(|Symbol\(|Object\.setPrototypeOf/);
  expect(documentation).toMatch(/independently reviews/i);
  expect(documentation).toMatch(/null-prototype/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HY/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HY/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
