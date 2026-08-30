import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666hf-position-version-lineage-v2-committed-result-receipt-equivalence-comparator-review.md";
const evidencePath =
  "docs/evidence/action-666hf-position-version-lineage-v2-committed-result-receipt-equivalence-comparator-review.json";
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
  "tests/e2e/action-666hf-position-version-lineage-v2-committed-result-receipt-equivalence-comparator-review.spec.ts";

const owner = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const otherOwner = "3f2504e0-4f89-41d3-9a0c-0305e82c3302";
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
    Object,
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
  ownerId: string,
  disposition: "created" | "replayed",
  digest: string,
) {
  return Object.freeze({
    canonicalCommandDigest: digest,
    disposition,
    initialHistoryIdentity: `${positionId}:${ownerId}:1`,
    positionId,
    positionVersion: 1 as const,
  });
}

function expectFreshFrozenVerdict(
  verdict: Record<string, unknown>,
  expected: boolean,
) {
  expect(verdict).toEqual({ equivalent: expected });
  expect(Reflect.ownKeys(verdict)).toEqual(["equivalent"]);
  expect(Object.isFrozen(verdict)).toBe(true);
  expect(Object.getOwnPropertyDescriptor(verdict, "equivalent")).toMatchObject({
    enumerable: true,
    configurable: false,
    writable: false,
  });
  expect(Reflect.set(verdict, "equivalent", !expected)).toBe(false);
  expect(verdict.equivalent).toBe(expected);
}

test("666HF independently verifies exact receipt equivalence over the valid scalar boundary", () => {
  const comparator = loadComparator();
  const baseline = validReceipt(firstPositionId, owner, "created", "a".repeat(64));
  const identicalButDistinct = Object.freeze({
    positionVersion: 1 as const,
    positionId: firstPositionId,
    initialHistoryIdentity: `${firstPositionId}:${owner}:1`,
    disposition: "created" as const,
    canonicalCommandDigest: "a".repeat(64),
  });
  const validMismatches = [
    validReceipt(firstPositionId, owner, "created", "b".repeat(64)),
    validReceipt(firstPositionId, owner, "replayed", "a".repeat(64)),
    validReceipt(firstPositionId, otherOwner, "created", "a".repeat(64)),
    validReceipt(secondPositionId, owner, "created", "a".repeat(64)),
  ];

  const equivalent =
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      baseline,
      identicalButDistinct,
    );
  const nonEquivalent = validMismatches.map((receipt) =>
    comparator.comparePositionVersionLineageV2WriterImmutableCommittedResultReceipts(
      baseline,
      receipt,
    ),
  );

  expectFreshFrozenVerdict(equivalent, true);
  for (const verdict of nonEquivalent) expectFreshFrozenVerdict(verdict, false);
  expect(
    new Set([baseline, identicalButDistinct, ...validMismatches, equivalent, ...nonEquivalent]).size,
  ).toBe(11);
});

test("666HF independently retains malformed and widened receipt rejection", () => {
  const comparator = loadComparator();
  const valid = validReceipt(firstPositionId, owner, "created", "a".repeat(64));
  const accessorReceipt = Object.freeze({
    canonicalCommandDigest: "a".repeat(64),
    get disposition() {
      return "created";
    },
    initialHistoryIdentity: `${firstPositionId}:${owner}:1`,
    positionId: firstPositionId,
    positionVersion: 1,
  });
  const invalidReceipts = [
    { ...valid },
    Object.freeze({ ...valid, unexpected: "forbidden" }),
    Object.freeze({ ...valid, positionVersion: 2 }),
    Object.freeze({ ...valid, [Symbol("unexpected")]: "forbidden" }),
    accessorReceipt,
    Object.freeze(Object.assign(Object.create({}), valid)),
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

test("666HF remains source-only and is registered once without reopening runtime", () => {
  const evidence = JSON.parse(source(evidencePath));
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.reviewed_revision).toEqual({
    protected_main_commit: "ab3142a8a2b9bda8295127823932282f82146098",
    protected_main_tree: "20d272153489c723cddc81f30d9fa2df171e668d",
    exact_main_ci_run: 33268284810,
    exact_main_ci_conclusion: "success",
    reviewed_implementation_action: "ACTION_666HE",
  });
  expect(evidence.review).toMatchObject({
    type: "independent_source_only_immutable_committed_result_receipt_equivalence_comparator_review",
    implementation_source_changed: false,
    equivalent_distinct_receipts_return_true: true,
    valid_receipt_mismatches_return_false: true,
    position_version_outside_v1_fails_closed: true,
    verdict_is_fresh_frozen_and_scalar_only: true,
    verdict_receipt_aliasing: false,
  });
  expect(evidence.review.verified_comparison_dimensions).toEqual([
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
  expect(documentation).toMatch(/independent verification only/i);
  expect(documentation).toMatch(/no CI\s+deduplication is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666HF/);
  expect(source(ledgerPath)).toMatch(/ACTION 666HF/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
  expect(source(planPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
