import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666he-position-version-lineage-v2-committed-result-receipt-equivalence-comparator.md";
const evidencePath =
  "docs/evidence/action-666he-position-version-lineage-v2-committed-result-receipt-equivalence-comparator.json";
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
  "tests/e2e/action-666he-position-version-lineage-v2-committed-result-receipt-equivalence-comparator.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const firstPositionId = "550e8400-e29b-41d4-a716-446655440000";
const secondPositionId = "550e8400-e29b-41d4-a716-446655440001";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function loadComparator() {
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
  return sandbox.exports as {
    PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError:
      new () => Error;
    comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      left: unknown,
      right: unknown,
    ): { equivalent: boolean };
  };
}

function validReceipt(
  positionId: string,
  disposition: "created" | "replayed",
  digest: string,
) {
  return Object.freeze({
    canonicalCommandDigest: digest,
    disposition,
    initialHistoryIdentity: `${positionId}:${owner}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

function expectFrozenScalarVerdict(verdict: Record<string, unknown>) {
  expect(verdict).toHaveProperty("equivalent");
  expect(Reflect.ownKeys(verdict)).toEqual(["equivalent"]);
  expect(typeof verdict.equivalent).toBe("boolean");
  expect(Object.isFrozen(verdict)).toBe(true);
  expect(Object.getOwnPropertyDescriptor(verdict, "equivalent")).toMatchObject({
    enumerable: true,
    configurable: false,
    writable: false,
  });
}

test("666HE compares exactly the five validated receipt scalars into fresh frozen verdicts", () => {
  const comparator = loadComparator();
  const first = validReceipt(firstPositionId, "created", "a".repeat(64));
  const equalButDistinct = Object.freeze({
    positionVersion: 1 as const,
    positionId: firstPositionId,
    initialHistoryIdentity: `${firstPositionId}:${owner}:1`,
    disposition: "created" as const,
    canonicalCommandDigest: "a".repeat(64),
  });
  const different = validReceipt(secondPositionId, "replayed", "b".repeat(64));

  const equalVerdict =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      first,
      equalButDistinct,
    );
  const differentVerdict =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      first,
      different,
    );

  expect(equalVerdict).toEqual({ equivalent: true });
  expect(differentVerdict).toEqual({ equivalent: false });
  expectFrozenScalarVerdict(equalVerdict);
  expectFrozenScalarVerdict(differentVerdict);
  expect(new Set([first, equalButDistinct, different, equalVerdict, differentVerdict]).size).toBe(5);
});

test("666HE fails closed for malformed, widened, mutable, inherited, accessor and symbol-bearing receipts", () => {
  const comparator = loadComparator();
  const valid = validReceipt(firstPositionId, "created", "a".repeat(64));
  const accessorReceipt = Object.freeze({
    canonicalCommandDigest: "a".repeat(64),
    get disposition() {
      return "created";
    },
    initialHistoryIdentity: `${firstPositionId}:${owner}:1`,
    positionId: firstPositionId,
    positionVersion: 1,
  });
  const inheritedReceipt = Object.freeze(Object.assign(Object.create({}), valid));
  const invalidReceipts = [
    null,
    [valid],
    { ...valid },
    Object.freeze({ ...valid, legacySnapshotId: "forbidden" }),
    Object.freeze({ ...valid, canonicalCommandDigest: "A".repeat(64) }),
    Object.freeze({ ...valid, initialHistoryIdentity: `${firstPositionId}:${owner}:2` }),
    Object.freeze({ ...valid, [Symbol("unexpected")]: "unexpected" }),
    accessorReceipt,
    inheritedReceipt,
  ];

  for (const invalid of invalidReceipts) {
    expect(() =>
      comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
        valid,
        invalid,
      ),
    ).toThrow(
      comparator.PositionVersionLineageV2WriterImmutableCommittedResultReceiptEquivalenceComparatorError,
    );
  }
});

test("666HE remains source-only, fail-closed and registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "e83a39fd8c784c51abb129717b66ee0cd380fb21",
    protected_main_tree: "d5ce0c1d20cd9d6814b718e3636dc5eb3acbdec1",
    exact_main_ci_run: 33264646518,
    exact_main_ci_conclusion: "success",
    selection_action: "ACTION_666HD",
  });
  expect(evidence.implementation).toMatchObject({
    type: "pure_server_only_immutable_committed_result_receipt_equivalence_comparator",
    returned_value: "new_frozen_scalar_only_equivalence_verdict",
    result_fields: ["equivalent"],
    retains_input_reference: false,
    reconstructs_decoded_result_or_command: false,
    runtime_unwired: true,
  });
  expect(evidence.implementation.compared_scalar_fields).toEqual([
    "canonicalCommandDigest",
    "disposition",
    "initialHistoryIdentity",
    "positionId",
    "positionVersion",
  ]);
  expect(evidence.containment).toEqual({
    receipt_consumer_or_storage_present: false,
    transport_credential_or_owner_resolution_present: false,
    database_writer_provider_broker_or_runtime_binding_present: false,
    route_ui_or_deployment_authority_present: false,
    required_check_change_authorized: false,
    branch_protection_change_authorized: false,
    full_ci_deduplication_authorized: false,
  });
  expect(source(comparatorPath)).toMatch(/^import "server-only";/);
  expect(source(comparatorPath)).not.toMatch(/fetch\(|postgres|supabase|process\.env/i);
  expect(source(receiptPath)).toMatch(/^import "server-only";/);
  expect(source(sourceContractPath)).toContain("committedResultDecoderPresent: false");
  expect(source(preflightPath)).toContain("exactPrivateRoutineResultDecoderImplemented: false");
  expect(documentation).toMatch(/no I\/O/i);
  expect(documentation).toMatch(/no CI\s+deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HE/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HE/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
