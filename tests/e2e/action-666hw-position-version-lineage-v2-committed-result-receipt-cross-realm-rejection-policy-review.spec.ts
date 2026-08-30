import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hw-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-review.md";
const evidencePath =
  "docs/evidence/action-666hw-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-review.json";
const policyEvidencePath =
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
  "tests/e2e/action-666hw-position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const positionId = "550e8400-e29b-41d4-a716-446655440000";
const errorName =
  "PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError";
const errorMessage =
  "invalid_position_version_lineage_v2_writer_immutable_committed_result_receipt_equivalence_input";

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

function localReceipt() {
  return Object.freeze(receiptValues());
}

function foreignRealmReceipt() {
  return vm.runInNewContext("Object.freeze({ ...values })", {
    values: receiptValues(),
  });
}

function captureForeignRealmRejection(
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

  throw new Error("expected foreign-realm receipt comparison to reject");
}

test("666HW independently reviews local admission and foreign-realm fail-closed rejection", () => {
  const comparator = loadComparator();
  const local = localReceipt();
  const matchingLocal = localReceipt();
  const foreign = foreignRealmReceipt();
  const errors: Error[] = [];
  const localVerdict =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      local,
      matchingLocal,
    );

  expect(localVerdict).toEqual({ equivalent: true });
  expect(Object.isFrozen(localVerdict)).toBe(true);
  expect(localVerdict).not.toBe(local);
  expect(localVerdict).not.toBe(matchingLocal);
  expect(Object.getPrototypeOf(local)).toBe(Object.prototype);
  expect(Object.isFrozen(foreign)).toBe(true);
  expect(foreign).toEqual(local);
  expect(Object.getPrototypeOf(foreign)).not.toBe(Object.prototype);

  for (const [left, right] of [
    [foreign, local],
    [local, foreign],
  ]) {
    for (let call = 0; call < 3; call += 1) {
      errors.push(captureForeignRealmRejection(comparator, left, right));
    }
  }

  expect(errors).toHaveLength(6);
  expect(new Set(errors).size).toBe(6);
  for (const error of errors) {
    expect([local, matchingLocal, foreign, localVerdict]).not.toContain(error);
  }
});

test("666HW retains the completed fail-closed policy without widening authority", () => {
  const evidence = JSON.parse(source(evidencePath));
  const policyEvidence = JSON.parse(source(policyEvidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.contract_version).toBe(
    "trade.action666hw.position-version-lineage-v2-committed-result-receipt-cross-realm-rejection-policy-review.v1",
  );
  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "b58851a8ac4187cb1575750ccaf5d3decff1e6b4",
    protected_main_tree: "f547daa8bebb7cf3afd5e0ea79b07ff0e2596814",
    exact_main_ci_run: 33324547085,
    exact_main_ci_conclusion: "success",
    reviewed_implementation_action: "ACTION_666HV",
    implementation_pr_number: 261,
  });
  expect(policyEvidence.action_id).toBe("ACTION_666HV");
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_cross_realm_rejection_policy_review",
    comparator_source_changed: false,
    local_realm_valid_receipts_remain_admitted: true,
    local_admission_verdict_is_fresh_frozen_and_scalar_only: true,
    foreign_receipt_scalar_shape_matches_local_control: true,
    foreign_receipt_direct_prototype_differs_from_local_realm_object_prototype: true,
    local_realm_prototype_identity_is_required: true,
    frozen_foreign_realm_receipts_rejected_in_either_argument_slot: true,
    calls_per_argument_order: 3,
    argument_orders: 2,
    rejected_calls: 6,
    rejection_errors_fresh: true,
    outcome_input_aliasing: false,
    cross_error_aliasing: false,
    foreign_material_adaptation_import_or_normalization_present: false,
    runtime_unwired: true,
    dedicated_error_public_name: errorName,
    dedicated_error_message: errorMessage,
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
  expect(source(preflightPath)).toContain(
    "exactPrivateRoutineResultDecoderImplemented: false",
  );
  expect(documentation).toMatch(/independently reviews/i);
  expect(documentation).toMatch(/no CI deduplication is authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HW/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HW/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
