import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hp-position-version-lineage-v2-committed-result-receipt-object-fault-rejection-review.md";
const evidencePath =
  "docs/evidence/action-666hp-position-version-lineage-v2-committed-result-receipt-object-fault-rejection-review.json";
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
  "tests/e2e/action-666hp-position-version-lineage-v2-committed-result-receipt-object-fault-rejection-review.spec.ts";

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
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: comparatorPath });
  return sandbox.exports as Comparator;
}

function validReceipt() {
  return Object.freeze({
    canonicalCommandDigest: "a".repeat(64),
    disposition: "created" as const,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
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

  throw new Error("expected object-fault receipt comparison to reject");
}

test("666HP rejects object-introspection faults with fresh dedicated errors", () => {
  const comparator = loadComparator();
  const throwingPrototype = new Proxy(validReceipt(), {
    getPrototypeOf() {
      throw new Error("prototype introspection forbidden");
    },
  });
  const throwingKeys = new Proxy(validReceipt(), {
    ownKeys() {
      throw new Error("key introspection forbidden");
    },
  });
  const throwingDescriptor = new Proxy(validReceipt(), {
    getOwnPropertyDescriptor() {
      throw new Error("descriptor introspection forbidden");
    },
  });
  const faultInputs = [throwingPrototype, throwingKeys, throwingDescriptor];
  const control = validReceipt();
  const errors: Error[] = [];

  for (const faultInput of faultInputs) {
    for (const [left, right] of [
      [faultInput, control],
      [control, faultInput],
    ]) {
      for (let call = 0; call < 3; call += 1) {
        errors.push(captureError(comparator, left, right));
      }
    }
  }

  expect(errors).toHaveLength(18);
  expect(new Set(errors).size).toBe(errors.length);
  for (const error of errors) {
    expect([...faultInputs, control]).not.toContain(error);
  }
});

test("666HP remains source-only and is registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "01600cbd6879b2d3b51cdde61d867b11d28458b6",
    protected_main_tree: "04fe6f2ad62e00944662c0696b48527686f13396",
    exact_main_ci_run: 33299737874,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HO",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_object_fault_rejection_review",
    comparator_source_changed: false,
    object_fault_variants: [
      "throwing_get_prototype_of",
      "throwing_own_keys",
      "throwing_get_own_property_descriptor",
    ],
    calls_per_variant_and_argument_order: 3,
    argument_orders_per_variant: 2,
    rejected_calls: 18,
    rejected_errors_are_fresh_dedicated_comparator_errors: true,
    invalid_input_in_both_argument_slots: true,
    outcome_input_aliasing: false,
    cross_error_aliasing: false,
    dedicated_error_public_name: errorName,
    dedicated_error_message: errorMessage,
  });
  expect(evidence.containment).toEqual({
    decoded_result_or_command_reconstruction_present: false,
    receipt_consumer_or_storage_present: false,
    transport_credential_or_owner_resolution_present: false,
    database_writer_provider_broker_or_runtime_binding_present: false,
    route_ui_or_deployment_authority_present: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    netlify_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(comparatorPath)).toMatch(/^import "server-only";/);
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/source-only review/i);
  expect(documentation).toMatch(/no CI deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HP/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HP/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
